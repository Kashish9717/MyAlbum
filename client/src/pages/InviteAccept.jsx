import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  FolderHeart,
  Sparkles,
  Compass,
  Milestone,
  Users,
  Palette,
  ArrowLeft,
  Check,
  Shield,
} from '../components/Icons';

const THEME_ICONS = {
  default: Sparkles,
  travel: Compass,
  milestones: Milestone,
  friends: Users,
  custom: Palette,
};

const TEXTURE_CLASSES = {
  paper: 'bg-paper-texture',
  kraft: 'texture-kraft',
  linen: 'texture-linen',
  leather: 'texture-leather',
  dots: 'texture-dots',
};

export const InviteAccept = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/invites/${token}`);
        if (res.data?.success) {
          setInviteData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to validate invite:', err);
        setError(
          err.response?.data?.message ||
            'This invitation link is invalid or has expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Save invite redirect in localStorage so login redirects back
      localStorage.setItem('redirect_after_login', `/invite/${token}`);
      navigate('/login');
      return;
    }

    try {
      setAccepting(true);
      const res = await api.post(`/invites/${token}/accept`);
      if (res.data?.success) {
        navigate(`/collection/${res.data.collectionId}`);
      }
    } catch (err) {
      console.error('Failed to accept invite:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper bg-paper-texture flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-kraft border-t-accent-terracotta rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Checking invitation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-paper bg-paper-texture flex items-center justify-center p-6">
        <div className="bg-white/90 border border-kraft rounded-3xl p-8 max-w-md w-full text-center paper-shadow">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-ink mb-2">Invitation Expired</h2>
          <p className="text-xs text-ink-muted mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper rounded-xl text-xs font-semibold hover:bg-ink/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { collection, role, invitedBy } = inviteData;
  const ThemeIcon = THEME_ICONS[collection.theme] || THEME_ICONS.default;
  const textureClass =
    TEXTURE_CLASSES[collection.coverStyle?.texture] || 'bg-paper-texture';
  const bgColor = collection.coverStyle?.color || '#F5EFEB';
  const hasCoverImg = Boolean(collection.coverStyle?.imageUrl);

  return (
    <div className="min-h-screen bg-paper bg-paper-texture flex items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Album Card Preview */}
        <div
          style={{ backgroundColor: bgColor }}
          className={`w-full rounded-3xl border border-kraft p-8 paper-shadow-lg album-spine relative overflow-hidden mb-6 text-center ${textureClass}`}
        >
          {/* Background Cover Photo if set */}
          {hasCoverImg && (
            <>
              <img
                src={collection.coverStyle.imageUrl}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 backdrop-blur-[0.5px]" />
            </>
          )}

          <div className="washi-tape" />

          <div className="relative z-10 space-y-4">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                hasCoverImg
                  ? 'bg-white/20 text-white backdrop-blur-md border border-white/20'
                  : 'bg-white/80 border border-black/5 text-ink'
              }`}
            >
              <ThemeIcon
                className={`w-3.5 h-3.5 ${
                  hasCoverImg ? 'text-amber-300' : 'text-accent-terracotta'
                }`}
              />
              <span>{collection.theme} Album</span>
            </div>

            <h1
              className={`font-handwriting text-4xl md:text-5xl font-bold leading-tight drop-shadow-xs ${
                hasCoverImg ? 'text-white drop-shadow-md' : 'text-ink'
              }`}
            >
              {collection.title}
            </h1>

            {collection.description && (
              <p
                className={`text-xs max-w-xs mx-auto leading-relaxed line-clamp-3 ${
                  hasCoverImg ? 'text-white/80' : 'text-ink-muted'
                }`}
              >
                {collection.description}
              </p>
            )}

            <div
              className={`text-xs border-t pt-3 ${
                hasCoverImg
                  ? 'text-white/70 border-white/15'
                  : 'text-ink-muted border-black/5'
              }`}
            >
              Created by{' '}
              <strong className={hasCoverImg ? 'text-white font-semibold' : 'text-ink font-semibold'}>
                {collection.owner?.name || 'Scrapbooker'}
              </strong>
            </div>
          </div>
        </div>

        {/* Invitation Action Box */}
        <div className="bg-white/80 border border-kraft rounded-2xl p-6 w-full paper-shadow text-center space-y-4">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              You've Been Invited
            </p>
            <h2 className="text-base font-bold text-ink mt-1">
              Join as a <span className="capitalize text-accent-terracotta">{role}</span>
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              {role === 'contributor'
                ? 'You will be able to pin photos, videos, and sticky notes!'
                : role === 'admin'
                ? 'You will have full access to add memories and manage collaborators.'
                : 'You will have read-only access to view all memories in this album.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-ink hover:bg-ink/90 text-paper rounded-xl font-semibold text-sm shadow-xs transition-transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {accepting
                ? 'Joining Album...'
                : user
                ? `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}`
                : 'Log In or Sign Up to Accept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
