import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MetricStrip from '@/components/ui/MetricStrip';
import AnalyticsPanel from '@/components/ui/AnalyticsPanel';
import CombinedChart from '@/components/charts/CombinedChart';
import RealtimeUsers from '@/components/ui/RealtimeUsers';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getCountryName, buildPageHref } from '@/lib/formatters';
import CountryFlag from '@/components/ui/CountryFlag';
import TechIcon from '@/components/ui/TechIcon';
import ChannelIcon from '@/components/ui/ChannelIcon';

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

  return (
    <>
      <Head>
        <title>{data.site?.name || 'Analytics'} - Traffic Source</title>
      </Head>
      <DashboardLayout siteId={siteId} siteName={data.site?.name} siteDomain={data.site?.domain}>

        {/* ── Realtime Active Users ── */}
        <RealtimeUsers />

        {/* ── Metrics Strip ── */}
        <MetricStrip metrics={[
          { label: 'Visitors', value: data.current.visitors, change: data.changes.visitors },
          { label: 'Pageviews', value: data.current.pageViews, change: data.changes.pageViews },
          { label: 'Revenue', value: conv.revenue || 0, format: 'currency' },
          { label: 'Conversion rate', value: conv.conversionRate || 0, format: 'percent' },
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
            renderLabel={(row) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ChannelIcon name={row.name} />
                {row.name}
              </span>
            )}
            showPercentage
            defaultTab="referrer"
          />

          <AnalyticsPanel
            tabs={[
              { key: 'country', label: 'Country' },
              { key: 'city', label: 'City' },
            ]}
            data={{
              country: data.countries || [],
              city: data.cities || [],
            }}
            renderLabel={(row, meta) => {
              if (meta.activeTab === 'city') return row.name;
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CountryFlag code={row.name} size="s" />
                  {getCountryName(row.name)}
                </span>
              );
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
            renderLabel={(row, meta) => (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <TechIcon type={meta.activeTab} name={row.name} />
                {row.name}
              </span>
            )}
            showPercentage
            defaultTab="browser"
          />
        </div>

        {/* ── Affiliates ── */}
        {data.affiliates?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Affiliates</button>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => router.push(`/analytics/${siteId}/affiliates`)}
              >
                View all &rarr;
              </button>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="journey-table">
                <thead>
                  <tr>
                    <th>Affiliate</th>
                    <th>Visits</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.affiliates.map((a, i) => (
                    <tr key={i}>
                      <td><span style={{ fontWeight: 600 }}>{a.name}</span></td>
                      <td>{a.visits}</td>
                      <td>{a.conversions}</td>
                      <td style={{ fontWeight: 600 }}>${((a.revenue || 0) / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Journey for Payment ── */}
        {data.conversions?.bySource?.length > 0 && (
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Journey for payment</button>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => router.push(`/analytics/${siteId}/conversions`)}
              >
                View all &rarr;
              </button>
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

function renderPageLabel(pathname, siteDomain) {
  const href = buildPageHref(pathname, siteDomain);
  if (!href) return pathname || '/';
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="page-link-out">
      <span>{pathname || '/'}</span>
      <span aria-hidden="true">&uarr;</span>
    </a>
  );
}
