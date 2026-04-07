import { useState } from 'react';
import { TbWorld, TbDirection } from 'react-icons/tb';

const SIZE = 16;

// Map well-known channel names to a domain to fetch a favicon for.
const DOMAIN_MAP = {
  google: 'google.com',
  bing: 'bing.com',
  yahoo: 'yahoo.com',
  duckduckgo: 'duckduckgo.com',
  yandex: 'yandex.com',
  baidu: 'baidu.com',
  facebook: 'facebook.com',
  instagram: 'instagram.com',
  twitter: 'twitter.com',
  x: 'x.com',
  linkedin: 'linkedin.com',
  reddit: 'reddit.com',
  youtube: 'youtube.com',
  tiktok: 'tiktok.com',
  pinterest: 'pinterest.com',
  github: 'github.com',
  medium: 'medium.com',
  hackernews: 'news.ycombinator.com',
  'hacker news': 'news.ycombinator.com',
  producthunt: 'producthunt.com',
  'product hunt': 'producthunt.com',
};

function resolveDomain(name = '') {
  const v = name.trim().toLowerCase();
  if (!v) return null;
  if (DOMAIN_MAP[v]) return DOMAIN_MAP[v];
  // Already a domain like "example.com" or URL
  try {
    if (v.startsWith('http')) return new URL(v).hostname;
  } catch {}
  if (v.includes('.')) return v.replace(/^www\./, '');
  return null;
}

export default function ChannelIcon({ name }) {
  const [failed, setFailed] = useState(false);
  const v = (name || '').trim().toLowerCase();

  if (v === 'direct' || v === '(direct)' || v === '') {
    return (
      <span className="channel-icon">
        <TbDirection size={SIZE} />
      </span>
    );
  }

  const domain = resolveDomain(name);
  if (!domain || failed) {
    return (
      <span className="channel-icon">
        <TbWorld size={SIZE} />
      </span>
    );
  }

  return (
    <span className="channel-icon">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={SIZE}
        height={SIZE}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
