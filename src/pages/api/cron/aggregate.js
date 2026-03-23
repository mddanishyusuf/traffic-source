import { getDb } from '@/lib/db';
import { purgeOldPageViews } from '@/lib/maintenance';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = req.headers['x-cron-secret'];
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = getDb();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().slice(0, 10);

    // Get all sites
    const sites = db.prepare('SELECT id FROM sites').all();

    for (const site of sites) {
      // Ensure daily_stats row exists
      db.prepare(
        `INSERT OR IGNORE INTO daily_stats (site_id, date) VALUES (?, ?)`
      ).run(site.id, date);

      // Recompute stats from raw data
      const stats = db
        .prepare(
          `SELECT
            COUNT(DISTINCT visitor_id) as visitors,
            COUNT(*) as sessions,
            SUM(is_bounce) as bounces,
            AVG(duration) as avg_duration
           FROM sessions
           WHERE site_id = ? AND date(started_at) = ?`
        )
        .get(site.id, date);

      const pageViews = db
        .prepare(
          `SELECT COUNT(*) as count FROM page_views
           WHERE site_id = ? AND date(timestamp) = ?`
        )
        .get(site.id, date);

      db.prepare(
        `UPDATE daily_stats SET
          visitors = ?, sessions = ?, page_views = ?,
          bounces = ?, avg_duration = ?
         WHERE site_id = ? AND date = ?`
      ).run(
        stats.visitors || 0,
        stats.sessions || 0,
        pageViews.count || 0,
        stats.bounces || 0,
        stats.avg_duration || 0,
        site.id,
        date
      );
    }

    // Purge old raw page_views to prevent unbounded DB growth
    const purgeResult = purgeOldPageViews(90);

    res.status(200).json({
      aggregated: date,
      sites: sites.length,
      purged: purgeResult.deleted,
    });
  } catch (err) {
    console.error('Aggregation error:', err);
    res.status(500).json({ error: 'Aggregation failed' });
  }
}
