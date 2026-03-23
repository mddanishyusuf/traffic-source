import { getDb } from '@/lib/db';
const UAParser = require('ua-parser-js');

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4kb',
    },
  },
};

// ── In-memory rate limiter (per IP, sliding window) ──
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX_REQUESTS = 60;  // 60 requests per minute per IP
const ipHits = new Map();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, timestamps] of ipHits) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
      ipHits.delete(ip);
    }
  }
}, 5 * 60_000).unref?.();

function isRateLimited(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['cf-connecting-ip']
    || req.socket?.remoteAddress
    || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;

  let timestamps = ipHits.get(ip);
  if (!timestamps) {
    timestamps = [];
    ipHits.set(ip, timestamps);
  }

  // Slide window
  while (timestamps.length > 0 && timestamps[0] < windowStart) {
    timestamps.shift();
  }

  if (timestamps.length >= RATE_MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  return false;
}

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Rate limit check
  if (isRateLimited(req)) {
    return res.status(429).end();
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!data.site_id || !data.visitor_id || !data.session_id || !data.type) {
      return res.status(400).end();
    }

    const db = getDb();

    const site = db.prepare('SELECT id FROM sites WHERE id = ?').get(data.site_id);
    if (!site) {
      return res.status(404).end();
    }

    // Wrap all writes in a single transaction (atomic + ~5x faster)
    const runCollect = db.transaction(() => {

    const ua = new UAParser(req.headers['user-agent']);
    const browser = ua.getBrowser();
    const os = ua.getOS();
    const device = ua.getDevice();

    const country = req.headers['cf-ipcountry'] || null;
    const city = req.headers['cf-ipcity'] || null;
    const continent = req.headers['cf-ipcontinent'] || null;

    let referrerDomain = null;
    if (data.referrer) {
      try {
        referrerDomain = new URL(data.referrer).hostname;
      } catch {
        // invalid referrer URL
      }
    }

    const deviceType =
      device.type ||
      (data.screen_width < 768
        ? 'mobile'
        : data.screen_width < 1024
          ? 'tablet'
          : 'desktop');

    const existingSession = db
      .prepare('SELECT id, page_count FROM sessions WHERE id = ?')
      .get(data.session_id);

    if (!existingSession) {
      db.prepare(
        `INSERT INTO sessions (
          id, site_id, visitor_id, entry_page, exit_page,
          referrer, referrer_domain, utm_source, utm_medium, utm_campaign,
          utm_term, utm_content, country, city, continent,
          browser, browser_version, os, os_version, device_type,
          screen_width, screen_height
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        data.session_id,
        data.site_id,
        data.visitor_id,
        data.pathname,
        data.pathname,
        data.referrer || null,
        referrerDomain,
        data.utm_source || null,
        data.utm_medium || null,
        data.utm_campaign || null,
        data.utm_term || null,
        data.utm_content || null,
        country,
        city,
        continent,
        browser.name || null,
        browser.version || null,
        os.name || null,
        os.version || null,
        deviceType,
        data.screen_width || null,
        data.screen_height || null
      );
    } else {
      db.prepare(
        `UPDATE sessions SET
          exit_page = ?,
          last_activity = datetime('now'),
          page_count = page_count + 1,
          is_bounce = 0,
          duration = CAST((julianday('now') - julianday(started_at)) * 86400 AS INTEGER)
        WHERE id = ?`
      ).run(data.pathname, data.session_id);
    }

    // Affiliate tracking
    if (data.ref) {
      const affiliate = db
        .prepare('SELECT id FROM affiliates WHERE site_id = ? AND slug = ?')
        .get(data.site_id, data.ref);
      if (affiliate) {
        const alreadyTracked = db
          .prepare('SELECT id FROM affiliate_visits WHERE affiliate_id = ? AND visitor_id = ? AND session_id = ?')
          .get(affiliate.id, data.visitor_id, data.session_id);
        if (!alreadyTracked) {
          db.prepare(
            `INSERT INTO affiliate_visits (affiliate_id, site_id, visitor_id, session_id, landing_page)
             VALUES (?, ?, ?, ?, ?)`
          ).run(affiliate.id, data.site_id, data.visitor_id, data.session_id, data.pathname);
        }
      }
    }

    if (data.type === 'pageview') {
      let querystring = null;
      try {
        querystring = new URL(data.url).search || null;
      } catch {
        // invalid URL
      }

      db.prepare(
        `INSERT INTO page_views (site_id, session_id, visitor_id, pathname, hostname, querystring, referrer)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        data.site_id,
        data.session_id,
        data.visitor_id,
        data.pathname,
        data.hostname || null,
        querystring,
        data.referrer || null
      );

      const today = new Date().toISOString().slice(0, 10);
      db.prepare(
        `INSERT INTO daily_stats (site_id, date, page_views, sessions, visitors)
         VALUES (?, ?, 1, 0, 0)
         ON CONFLICT(site_id, date) DO UPDATE SET page_views = page_views + 1`
      ).run(data.site_id, today);

      if (!existingSession) {
        const visitorToday = db
          .prepare(
            `SELECT 1 FROM sessions
             WHERE site_id = ? AND visitor_id = ? AND date(started_at) = ? AND id != ?
             LIMIT 1`
          )
          .get(data.site_id, data.visitor_id, today, data.session_id);

        db.prepare(
          `UPDATE daily_stats SET
            sessions = sessions + 1,
            visitors = visitors + CASE WHEN ? THEN 0 ELSE 1 END
           WHERE site_id = ? AND date = ?`
        ).run(visitorToday ? 1 : 0, data.site_id, today);
      }
    }

    }); // end transaction

    runCollect();

    res.status(200).end();
  } catch (err) {
    console.error('Collection error:', err);
    res.status(500).end();
  }
}
