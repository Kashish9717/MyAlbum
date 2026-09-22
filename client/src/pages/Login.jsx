import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, AlertCircle } from '../components/Icons';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper bg-paper-texture flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-10 left-12 w-24 h-8 bg-washi-yellow/80 rotate-[-8deg] shadow-sm pointer-events-none rounded-xs"></div>
      <div className="absolute bottom-12 right-16 w-28 h-8 bg-washi-pink/80 rotate-[12deg] shadow-sm pointer-events-none rounded-xs"></div>

      <div className="w-full max-w-md relative">
        <div className="washi-tape"></div>

        <div className="bg-white/90 backdrop-blur-sm border border-kraft/40 rounded-2xl p-8 sm:p-10 paper-shadow-lg relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-paper-dark/80 text-accent-terracotta mb-3 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">Welcome Back</h1>
            <p className="text-ink-muted text-sm mt-1">Open your digital memory book</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-accent-terracotta hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-ink hover:bg-ink/90 text-paper font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Unlock Memories</span>
                  <Sparkles className="w-4 h-4 text-accent-ochre" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-kraft/30 pt-6">
            <p className="text-sm text-ink-muted">
              Don't have a scrapbook yet?{' '}
              <Link to="/signup" className="text-accent-terracotta font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
