export function countryCodeToFlag(countryCode) {
  if (!/^[A-Z]{2}$/.test(countryCode)) return '';
  const [first, second] = countryCode;
  const base = 127397;
  return String.fromCodePoint(first.charCodeAt(0) + base, second.charCodeAt(0) + base);
}

export function getCountryName(codeOrName) {
  if (!codeOrName) return 'Unknown';
  const value = String(codeOrName).trim();
  if (!/^[a-z]{2}$/i.test(value)) return value;
  const upper = value.toUpperCase();
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(upper) || upper;
  } catch {
    return upper;
  }
}

export function formatCountryLabel(codeOrName) {
  return getCountryName(codeOrName);
}

export function getBrowserIcon(name = '') {
  const value = (name || '').toLowerCase();
  if (value.includes('chrome')) return '\u{1F310}';
  if (value.includes('safari')) return '\u{1F9ED}';
  if (value.includes('firefox')) return '\u{1F98A}';
  if (value.includes('edge')) return '\u{1F7E6}';
  if (value.includes('opera')) return '\u2B55';
  return '\u{1F30D}';
}

export function getOsIcon(name = '') {
  const value = (name || '').toLowerCase();
  if (value.includes('windows')) return '\u{1FA9F}';
  if (value.includes('mac') || value.includes('ios')) return '\u{1F34E}';
  if (value.includes('android')) return '\u{1F916}';
  if (value.includes('linux')) return '\u{1F427}';
  return '\u{1F4BB}';
}

export function getDeviceIcon(name = '') {
  const value = (name || '').toLowerCase();
  if (value.includes('mobile') || value.includes('phone')) return '\u{1F4F1}';
  if (value.includes('tablet') || value.includes('ipad')) return '\u{1F4F2}';
  if (value.includes('desktop') || value.includes('laptop')) return '\u{1F5A5}\uFE0F';
  return '\u{1F4DF}';
}

export function normalizeDomain(domain) {
  if (!domain) return '';
  if (/^https?:\/\//i.test(domain)) return domain.replace(/\/$/, '');
  return `https://${domain.replace(/\/$/, '')}`;
}

export function buildPageHref(pathname, siteDomain) {
  if (!pathname) return '';
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const domain = normalizeDomain(siteDomain);
  if (!domain) return '';
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${domain}${safePath}`;
}
