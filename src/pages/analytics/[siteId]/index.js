import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MetricStrip from '@/components/ui/MetricStrip';
import AnalyticsPanel from '@/components/ui/AnalyticsPanel';
import CombinedChart from '@/components/charts/CombinedChart';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Analytics() {
  const router = useRouter();
  const { siteId } = router.query;
  const { data, loading } = useAnalytics('overview');

  if (loading || !data) {
    return (
      <>
        <Head><title>Analytics - Traffic Source</title></Head>
        <DashboardLayout siteId={siteId}>
          <div className="loading-inline"><div className="loading-spinner" /></div>
        </DashboardLayout>
      </>
    );
  }

  const conv = data.conversions?.totals || {};
  const revenuePerVisitor = data.current.visitors > 0
    ? ((conv.revenue || 0) / data.current.visitors)
    : 0;

  return (
    <>
      <Head>
        <title>{data.site?.name || 'Analytics'} - Traffic Source</title>
      </Head>
      <DashboardLayout siteId={siteId} siteName={data.site?.name}>

        {/* ── Metrics Strip ── */}
        <MetricStrip metrics={[
          { label: 'Visitors', value: data.current.visitors, change: data.changes.visitors },
          { label: 'Revenue', value: conv.revenue || 0, format: 'currency' },
          { label: 'Conversion rate', value: conv.conversionRate || 0, format: 'percent' },
          { label: 'Revenue/visitor', value: Math.round(revenuePerVisitor), format: 'currency' },
          { label: 'Bounce rate', value: data.current.bounceRate, change: data.changes.bounceRate, format: 'percent' },
          { label: 'Session time', value: data.current.avgDuration, change: data.changes.avgDuration, format: 'duration' },
        ]} />

        {/* ── Combined Chart (visitors line + revenue bars) ── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="chart-container">
            <CombinedChart
              trafficData={data.timeSeries}
              revenueData={data.conversions?.timeSeries || []}
            />
          </div>
        </div>

        {/* ── Sources + Geography (side by side) ── */}
        <div className="grid-2">
          <AnalyticsPanel
            tabs={[
              { key: 'referrer', label: 'Channel' },
              { key: 'utm_source', label: 'Referrer' },
              { key: 'utm_campaign', label: 'Campaign' },
            ]}
            data={{
              referrer: data.sources || [],
              utm_source: (data.sources || []).filter(s => s.name !== 'Direct'),
              utm_campaign: (data.sources || []).filter(s => s.name !== 'Direct'),
            }}
            valueKey="sessions"
            defaultTab="referrer"
          />

          <AnalyticsPanel
            tabs={[
              { key: 'country', label: 'Country' },
              { key: 'city', label: 'City' },
            ]}
            data={{
              country: data.countries || [],
              city: data.countries || [],
            }}
            renderLabel={(row, meta) => {
              if (meta.activeTab === 'city') return row.name;
              return formatCountryLabel(row.name);
            }}
            showPercentage
            defaultTab="country"
          />
        </div>

        {/* ── Pages + Browsers (side by side) ── */}
        <div className="grid-2">
          <AnalyticsPanel
            tabs={[
              { key: 'all', label: 'Page' },
              { key: 'entry', label: 'Entry page' },
              { key: 'exit', label: 'Exit page' },
            ]}
            data={{
              all: (data.pages || []).map(p => ({ ...p, count: p.views })),
              entry: (data.entryPages || []).map(p => ({ ...p, count: p.sessions })),
              exit: (data.exitPages || []).map(p => ({ ...p, count: p.sessions })),
            }}
            renderLabel={(row) => renderPageLabel(row.name, data.site?.domain)}
            showPercentage
            barByTotal
            defaultTab="all"
          />

          <AnalyticsPanel
            tabs={[
              { key: 'browser', label: 'Browser' },
              { key: 'os', label: 'OS' },
              { key: 'device', label: 'Device' },
            ]}
            data={{
              browser: data.browsers || [],
              os: data.os || [],
              device: data.devices || [],
            }}
            renderLabel={(row, meta) => {
              if (meta.activeTab === 'browser') return `${getBrowserIcon(row.name)} ${row.name}`;
              if (meta.activeTab === 'os') return `${getOsIcon(row.name)} ${row.name}`;
              return `${getDeviceIcon(row.name)} ${row.name}`;
            }}
            showPercentage
            defaultTab="browser"
          />
        </div>

        {/* ── Journey for Payment ── */}
        {data.conversions?.bySource?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Journey for payment</button>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="journey-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.conversions.bySource.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{row.name}</span>
                      </td>
                      <td>{row.conversions}</td>
                      <td style={{ fontWeight: 600 }}>${((row.revenue || 0) / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
}

function formatCountryLabel(codeOrName) {
  if (!codeOrName) return 'Unknown';
  const value = String(codeOrName).trim();
  if (!/^[a-z]{2}$/i.test(value)) return value;
  const upper = value.toUpperCase();
  let countryName = upper;
  try {
    countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(upper) || upper;
  } catch {
    countryName = upper;
  }
  return `${countryCodeToFlag(upper)} ${countryName}`;
}

function countryCodeToFlag(countryCode) {
  if (!/^[A-Z]{2}$/.test(countryCode)) return '';
  const [first, second] = countryCode;
  const base = 127397;
  return String.fromCodePoint(first.charCodeAt(0) + base, second.charCodeAt(0) + base);
}

function renderPageLabel(pathname, siteDomain) {
  const href = buildPageHref(pathname, siteDomain);
  if (!href) return pathname || '/';
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="page-link-out">
      <span>{pathname || '/'}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function buildPageHref(pathname, siteDomain) {
  if (!pathname) return '';
  if (/^https?:\/\//i.test(pathname)) return pathname;
  const domain = normalizeDomain(siteDomain);
  if (!domain) return '';
  const safePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${domain}${safePath}`;
}

function normalizeDomain(domain) {
  if (!domain) return '';
  if (/^https?:\/\//i.test(domain)) return domain.replace(/\/$/, '');
  return `https://${domain.replace(/\/$/, '')}`;
}

function getBrowserIcon(name = '') {
  const value = name.toLowerCase();
  if (value.includes('chrome')) return '🌐';
  if (value.includes('safari')) return '🧭';
  if (value.includes('firefox')) return '🦊';
  if (value.includes('edge')) return '🟦';
  if (value.includes('opera')) return '⭕';
  return '🌍';
}

function getOsIcon(name = '') {
  const value = name.toLowerCase();
  if (value.includes('windows')) return '🪟';
  if (value.includes('mac') || value.includes('ios')) return '🍎';
  if (value.includes('android')) return '🤖';
  if (value.includes('linux')) return '🐧';
  return '💻';
}

function getDeviceIcon(name = '') {
  const value = name.toLowerCase();
  if (value.includes('mobile') || value.includes('phone')) return '📱';
  if (value.includes('tablet') || value.includes('ipad')) return '📲';
  if (value.includes('desktop') || value.includes('laptop')) return '🖥️';
  return '📟';
}
