import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Sparkles, AlertCircle, Check, ArrowLeft, KeyRound } from '../components/Icons';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request code, 2: Reset password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data?.success) {
        if (res.data.resetCode) {
          setResetCode(res.data.resetCode);
        }
        setSuccessMessage('Verification code generated! Please enter your new password.');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword,
      });

      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        alert('Password reset successfully! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your verification code.');
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-paper-dark/80 text-accent-terracotta mb-3 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight font-sans">
              {step === 1 ? 'Forgot Password' : 'Set New Password'}
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              {step === 1
                ? 'Enter your email to reset your memory journal password'
                : 'Enter your verification code and choose a new password'}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-sm">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step 1: Request Code */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm"
                  autoFocus
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
                    <span>Get Verification Code</span>
                    <Sparkles className="w-4 h-4 text-accent-ochre" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter code & new password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm font-mono tracking-widest text-center text-lg"
                  maxLength={6}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (at least 6 characters)"
                  className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-paper/50 border border-kraft/50 rounded-xl text-ink placeholder:text-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 focus:border-accent-terracotta transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Reset Password & Log In</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-ink-muted hover:text-ink text-center pt-2 cursor-pointer"
              >
                &larr; Request a different code
              </button>
            </form>
          )}

          {/* Footer Back to Login */}
          <div className="mt-8 text-center border-t border-kraft/30 pt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
