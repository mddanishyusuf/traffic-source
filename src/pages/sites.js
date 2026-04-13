import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import dynamic from 'next/dynamic';
import CountryFlag from '@/components/ui/CountryFlag';
import TechIcon from '@/components/ui/TechIcon';
import { getCountryName } from '@/lib/formatters';

const VisitorMap = dynamic(() => import('@/components/ui/VisitorMap'), { ssr: false });

export default function Sites() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');
    const [view, setView] = useState('sites');
    const router = useRouter();

    const fetchSites = useCallback(async () => {
        try {
            const res = await fetch('/api/sites');
            if (res.ok) {
                const data = await res.json();
                setSites(data.sites);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/sites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, domain }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowModal(false);
            setName('');
            setDomain('');
            fetchSites();
            router.push(`/analytics/${data.site.id}/settings`);
        } catch (err) {
            setError(err.message);
        }
    };

    if (view === 'overview') {
        return (
            <>
                <Head><title>Overview - Traffic Source</title></Head>
                <ProtectedRoute>
                    <OverviewDashboard onClose={() => setView('sites')} />
                </ProtectedRoute>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Sites - Traffic Source</title>
            </Head>
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2 className="page-title" style={{ marginBottom: 0 }}>Sites</h2>
                        <button
                            className="btn-ghost"
                            onClick={() => setView('overview')}
                            title="Overview"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-light)' }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            Live
                        </button>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        Add Site
                    </button>
                </div>

                {view === 'sites' && loading ? (
                    <div className="loading-inline">
                        <div className="loading-spinner" />
                    </div>
                ) : view === 'sites' && sites.length === 0 ? (
                    <div className="empty-state">
                        <h3>No sites yet</h3>
                        <p>Add your first site to start tracking analytics.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            Add Site
                        </button>
                    </div>
                ) : view === 'sites' ? (
                    <div className="sites-list">
                        {[...sites]
                            .map((site) => {
                                // Pad hourly to always have 24 entries for consistent bar widths
                                const hourlyMap = {};
                                for (const h of site.hourly) hourlyMap[h.hour] = h;
                                const now = new Date();
                                const padded = [];
                                for (let i = 23; i >= 0; i--) {
                                    const d = new Date(now.getTime() - i * 3600000);
                                    const key = d.toISOString().slice(0, 13).replace('T', ' ') + ':00';
                                    padded.push(hourlyMap[key] || { hour: key, pageviews: 0, visitors: 0 });
                                }
                                return {
                                    ...site,
                                    hourly: padded,
                                    totalPageviews: site.hourly.reduce((sum, h) => sum + h.pageviews, 0),
                                    totalVisitors: site.hourly.reduce((sum, h) => sum + h.visitors, 0),
                                };
                            })
                            .sort((a, b) => b.totalPageviews - a.totalPageviews)
                            .map((site) => {
                                const { totalPageviews, totalVisitors } = site;
                                const formatVisitors = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : n.toString());
                                return (
                                    <div
                                        key={site.id}
                                        className="site-card"
                                        onClick={() => router.push(`/analytics/${site.id}`)}
                                    >
                                        <div className="site-card-header">
                                            <img
                                                className="site-card-favicon"
                                                src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
                                                alt=""
                                                width={24}
                                                height={24}
                                                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                                            />
                                            <div className="site-card-info">
                                                <div className="site-card-name">{site.name}</div>
                                                <div className="site-card-domain">{site.domain}</div>
                                            </div>
                                            <button
                                                className="site-card-menu"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/analytics/${site.id}/settings`);
                                                }}
                                                aria-label="Site settings"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                    <circle cx="8" cy="3" r="1.5" />
                                                    <circle cx="8" cy="8" r="1.5" />
                                                    <circle cx="8" cy="13" r="1.5" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="site-card-chart">
                                            {site.hourly.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={site.hourly} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                                        <YAxis domain={[0, 'dataMax']} hide />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="visitors"
                                                            stroke="var(--accent)"
                                                            fill="var(--accent)"
                                                            fillOpacity={0.08}
                                                            strokeWidth={1.5}
                                                            dot={false}
                                                            isAnimationActive={false}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <span className="site-card-nodata">No data</span>
                                            )}
                                        </div>
                                        <div className="site-card-footer">
                                            <div className="site-card-stat">
                                                <div className="site-card-stat-value">{formatVisitors(totalVisitors)}</div>
                                                <div className="site-card-stat-label">Visitors</div>
                                            </div>
                                            <div className="site-card-stat">
                                                <div className="site-card-stat-value">{formatVisitors(totalPageviews)}</div>
                                                <div className="site-card-stat-label">Pageviews</div>
                                            </div>
                                            <div className="site-card-period">24h</div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}

                {/* Add Site Modal */}
                {showModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add Site</h2>
                                <button onClick={() => setShowModal(false)}>x</button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="modal-body">
                                    {error && <div className="auth-error">{error}</div>}
                                    <div className="form-group">
                                        <label>Site Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="My Website"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Domain</label>
                                        <input
                                            type="text"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder="example.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Add Site
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
}

function OverviewDashboard({ onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPayments, setShowPayments] = useState(false);
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/overview');
            if (res.ok) setData(await res.json());
        } catch {}
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        intervalRef.current = setInterval(fetchData, 15000);
        return () => clearInterval(intervalRef.current);
    }, [fetchData]);

    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    if (!data) return null;

    const formatAmount = (cents) => `$${(cents / 100).toFixed(2)}`;
    const formatTime = (ts) => {
        const d = new Date(ts + (ts.includes('Z') ? '' : 'Z'));
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 100, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>

            {/* ── Left: Live Visitors ── */}
            <div style={{ borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="realtime-dot" />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{data.activeUsers.length} live</span>
                    </div>
                    <button onClick={onClose} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-light)' }}>
                        Back
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {data.activeUsers.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            No active visitors right now
                        </div>
                    ) : (
                        data.activeUsers.map((u, i) => (
                            <div
                                key={i}
                                style={{
                                    padding: '12px 20px',
                                    borderBottom: '1px solid var(--border-light)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                    animation: 'fadeIn 0.3s ease',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {u.country && <CountryFlag code={u.country} size="s" />}
                                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {u.country ? getCountryName(u.country) : 'Unknown'}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                        {u.site_name}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.current_page || '/'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <TechIcon type="browser" name={u.browser} /> {u.browser || 'Unknown'}
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <TechIcon type="device" name={u.device_type} /> {u.device_type || 'Desktop'}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10 }}>
                                        via {u.source}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Right: Full Map ── */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <VisitorMap
                    countries={data.countries}
                    activeUsers={data.activeUsers}
                />

                {/* ── Payments Widget (bottom-right, like realtime card) ── */}
                <div style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    zIndex: 10,
                    width: 320,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                }}>
                    <button
                        onClick={() => setShowPayments(!showPayments)}
                        style={{
                            width: '100%',
                            padding: '10px 16px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'var(--text)',
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        <span>Payments</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {data.recentPayments.length} recent
                            <span style={{ marginLeft: 6 }}>{showPayments ? '\u25BC' : '\u25B2'}</span>
                        </span>
                    </button>

                    {showPayments && data.recentPayments.length > 0 && (
                        <div style={{ maxHeight: 280, overflowY: 'auto', borderTop: '1px solid var(--border-light)' }}>
                            {data.recentPayments.slice(0, 8).map((p, i) => (
                                <div
                                    key={p.id || i}
                                    style={{
                                        padding: '8px 16px',
                                        borderBottom: '1px solid var(--border-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        fontSize: 12,
                                        animation: i === 0 ? 'fadeIn 0.5s ease' : undefined,
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: 'var(--success, #22c55e)', minWidth: 60 }}>
                                        {formatAmount(p.amount)}
                                    </span>
                                    <span style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {p.stripe_customer_email || p.site_name}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                        {formatTime(p.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
