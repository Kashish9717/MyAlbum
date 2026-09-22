import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, Sparkles, AlertCircle } from '../components/Icons';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setIsSubmitting(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper bg-paper-texture flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-12 right-12 w-28 h-8 bg-washi-green/80 rotate-[6deg] shadow-sm pointer-events-none rounded-xs"></div>
      <div className="absolute bottom-10 left-14 w-24 h-8 bg-washi-yellow/80 rotate-[-10deg] shadow-sm pointer-events-none rounded-xs"></div>

      <div className="w-full max-w-md relative">
        <div className="washi-tape"></div>

        <div className="bg-white/90 backdrop-blur-sm border border-kraft/40 rounded-2xl p-8 sm:p-10 paper-shadow-lg relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-paper-dark/80 text-accent-sage mb-3 shadow-inner">
              <Feather className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">Start Your Scrapbook</h1>
            <p className="text-ink-muted text-sm mt-1">Preserve your journeys, friends, and milestones</p>
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
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mia Taylor"
                className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage transition-all text-sm"
              />
            </div>

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
                className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-sage/40 focus:border-accent-sage transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-accent-sage hover:bg-accent-sage/90 text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Memory Journal</span>
                  <Sparkles className="w-4 h-4 text-washi-yellow" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-kraft/30 pt-6">
            <p className="text-sm text-ink-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-terracotta font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
