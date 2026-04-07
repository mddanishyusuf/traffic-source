import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasUsers) {
          router.replace('/login');
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Setup - Traffic Source</title>
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
          <p className="auth-subtitle">Create your admin account</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
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
                placeholder="Min 8 characters"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
