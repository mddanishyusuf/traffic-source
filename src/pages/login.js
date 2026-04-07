import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Traffic Source</title>
      </Head>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="m6.28 13.22l3.6-2.4a.17.17 0 0 0 .06-.12a.15.15 0 0 0-.06-.11L6.62 8.42a1.2 1.2 0 0 0-1.24 0l-3.26 2.17a.15.15 0 0 0-.06.11a.17.17 0 0 0 .06.12l3.6 2.4a.52.52 0 0 0 .56 0" />
              <path fill="currentColor" d="M1.54 11.68a.1.1 0 0 0 0 .07v8.62a1.6 1.6 0 0 0 .62 1.17l3.26 2.29a1.2 1.2 0 0 0 1.24 0l3.26-2.29a1.6 1.6 0 0 0 .62-1.17v-8.62a.1.1 0 0 0 0-.07a.08.08 0 0 0-.08 0l-3.63 2.37a1.5 1.5 0 0 1-1.66 0l-3.55-2.36a.08.08 0 0 0-.08-.01m12-8.25a.1.1 0 0 0 0 .07v16.87a1.6 1.6 0 0 0 .62 1.17l3.26 2.29a1.2 1.2 0 0 0 1.24 0l3.26-2.29a1.6 1.6 0 0 0 .62-1.17V3.5a.1.1 0 0 0 0-.07a.08.08 0 0 0-.08 0L18.83 5.8a1.5 1.5 0 0 1-1.66 0l-3.55-2.36a.08.08 0 0 0-.08-.01" />
              <path fill="currentColor" d="m18.28 5l3.6-2.4a.17.17 0 0 0 .06-.12a.15.15 0 0 0-.06-.11L18.62.17a1.2 1.2 0 0 0-1.24 0l-3.26 2.17a.15.15 0 0 0-.06.11a.17.17 0 0 0 .06.12L17.72 5a.52.52 0 0 0 .56 0" />
            </svg>
          </div>
          <h1>Traffic Source</h1>
          <p className="auth-subtitle">Sign in to your analytics dashboard</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
