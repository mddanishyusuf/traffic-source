const svgProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

const icons = {
  // Browsers
  chrome: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" y1="8" x2="12" y2="8" /><line x1="3.95" y1="6.06" x2="8.54" y2="14" /><line x1="10.88" y1="21.94" x2="15.46" y2="14" /></svg>
  ),
  safari: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" /></svg>
  ),
  firefox: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><path d="M12 6c-1 0-3 .5-3 3 0 2 1.5 3 3 3s3-1 3-3" /><path d="M17 8c1 2 1 4 0 6" /></svg>
  ),
  edge: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><path d="M12 8c2 0 4 1.5 4 4s-2 4-4 4" /><path d="M8 12h8" /></svg>
  ),
  opera: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="7" /></svg>
  ),
  browser: (
    <svg {...svgProps}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
  ),

  // OS
  windows: (
    <svg {...svgProps}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>
  ),
  apple: (
    <svg {...svgProps}><path d="M12 2C9 2 8 4 8 4S6 2 4.5 4C3 6 4 9 8 12c2 1.5 3 3 4 5 1-2 2-3.5 4-5 4-3 5-6 3.5-8C18 2 16 4 16 4S15 2 12 2z" fill="currentColor" stroke="none" /><path d="M12 2v2" /></svg>
  ),
  android: (
    <svg {...svgProps}><rect x="5" y="10" width="14" height="10" rx="2" /><line x1="8" y1="6" x2="6" y2="3" /><line x1="16" y1="6" x2="18" y2="3" /><line x1="5" y1="10" x2="19" y2="10" /><circle cx="9" cy="8" r="0.5" fill="currentColor" /><circle cx="15" cy="8" r="0.5" fill="currentColor" /></svg>
  ),
  linux: (
    <svg {...svgProps}><circle cx="12" cy="8" r="5" /><path d="M7 13c-2 2-3 5-2 8h14c1-3 0-6-2-8" /><circle cx="10" cy="7" r="1" fill="currentColor" stroke="none" /><circle cx="14" cy="7" r="1" fill="currentColor" stroke="none" /><path d="M10 10c1 1 3 1 4 0" /></svg>
  ),
  os: (
    <svg {...svgProps}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  ),

  // Devices
  desktop: (
    <svg {...svgProps}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  ),
  mobile: (
    <svg {...svgProps}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
  ),
  tablet: (
    <svg {...svgProps}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
  ),
  device: (
    <svg {...svgProps}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
  ),
};

function resolve(type, name = '') {
  const v = (name || '').toLowerCase();
  if (type === 'browser') {
    if (v.includes('chrome')) return 'chrome';
    if (v.includes('safari')) return 'safari';
    if (v.includes('firefox')) return 'firefox';
    if (v.includes('edge')) return 'edge';
    if (v.includes('opera')) return 'opera';
    return 'browser';
  }
  if (type === 'os') {
    if (v.includes('windows')) return 'windows';
    if (v.includes('mac') || v.includes('ios')) return 'apple';
    if (v.includes('android')) return 'android';
    if (v.includes('linux')) return 'linux';
    return 'os';
  }
  // device
  if (v.includes('mobile') || v.includes('phone')) return 'mobile';
  if (v.includes('tablet') || v.includes('ipad')) return 'tablet';
  if (v.includes('desktop') || v.includes('laptop')) return 'desktop';
  return 'device';
}

export default function TechIcon({ type, name }) {
  const key = resolve(type, name);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
      {icons[key]}
    </span>
  );
}
