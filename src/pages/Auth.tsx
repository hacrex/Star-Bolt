import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Auth = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const validateForm = (): string | null => {
    if (!email.includes('@')) return 'Please enter a valid email address';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!isLogin) {
      if (username.length < 3 || username.length > 30) {
        return 'Username must be 3-30 characters';
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return 'Username can only contain letters, numbers, hyphens, and underscores';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="surface-card p-6 sm:p-8">
        <div className="mb-8 text-center"><p className="eyebrow">Welcome to Star Lyrix</p><h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">{isLogin ? 'Sign in' : 'Create account'}</h1><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{isLogin ? 'Return to the songs and lines you love.' : 'Make a home for the words that stay with you.'}</p></div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none"
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="3-30 characters: letters, numbers, hyphens, underscores"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--gold-primary)] focus:outline-none"
            minLength={6}
            required
          />
          {!isLogin && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">Must be at least 6 characters</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={handleToggle}
          className="font-semibold text-[var(--gold-light)] hover:text-[var(--text-primary)]"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
      </div>
    </div>
  );
};

export default Auth;
