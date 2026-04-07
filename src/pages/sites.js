import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Sites() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');
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

    return (
        <>
            <Head>
                <title>Sites - Traffic Source</title>
            </Head>
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2
                        className="page-title"
                        style={{ marginBottom: 0 }}
                    >
                        Sites
                    </h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        Add Site
                    </button>
                </div>

                {loading ? (
                    <div className="loading-inline">
                        <div className="loading-spinner" />
                    </div>
                ) : sites.length === 0 ? (
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
                ) : (
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
                )}

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
