import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  X,
  Share2,
  Copy,
  Check,
  Users,
  Shield,
  Trash2,
  Mail,
  Sparkles,
} from './Icons';

export const ShareModal = ({ isOpen, onClose, collectionId, collectionTitle }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('contributor');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [latestInviteLink, setLatestInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/collections/${collectionId}/collaborators`);
      if (res.data?.success) {
        setOwner(res.data.data.owner);
        setCollaborators(res.data.data.collaborators || []);
        setPendingInvites(res.data.data.pendingInvites || []);
      }
    } catch (err) {
      console.error('Failed to fetch collaborators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
      setError('');
      setSuccessMessage('');
      setLatestInviteLink('');
      setCopied(false);
    }
  }, [isOpen, collectionId]);

  if (!isOpen) return null;

  const handleSendInvite = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');
      const res = await api.post(`/collections/${collectionId}/invite`, {
        email: email.trim(),
        role,
      });

      if (res.data?.success) {
        setLatestInviteLink(res.data.data.inviteLink);
        setSuccessMessage(
          email.trim()
            ? `Invite created for ${email.trim()}! Link ready to copy.`
            : 'Share link generated!'
        );
        setEmail('');
        fetchCollaborators();
      }
    } catch (err) {
      console.error('Failed to create invite:', err);
      setError(err.response?.data?.message || 'Failed to send invite.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(
        `/collections/${collectionId}/collaborators/${userId}`,
        { role: newRole }
      );
      if (res.data?.success) {
        setCollaborators((prev) =>
          prev.map((c) =>
            c.userId?._id === userId || c.userId === userId
              ? { ...c, role: newRole }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      alert(err.response?.data?.message || 'Failed to change role.');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    if (!window.confirm('Remove this collaborator from the album?')) return;
    try {
      const res = await api.delete(
        `/collections/${collectionId}/collaborators/${userId}`
      );
      if (res.data?.success) {
        setCollaborators((prev) =>
          prev.filter((c) => (c.userId?._id || c.userId) !== userId)
        );
      }
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
      alert(err.response?.data?.message || 'Failed to remove collaborator.');
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link || latestInviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-paper-warm border border-kraft rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto paper-shadow-lg flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kraft/40 bg-white/60 sticky top-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-paper-dark flex items-center justify-center text-accent-terracotta border border-kraft/50">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                Share "{collectionTitle}"
              </h2>
              <p className="text-xs text-ink-muted">
                Invite friends and family to your scrapbook
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between">
              <span>{successMessage}</span>
            </div>
          )}

          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
              Invite by Email or Generate Link
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com (or leave blank for open link)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-kraft bg-white text-ink text-xs placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-xl border border-kraft bg-white text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 cursor-pointer"
              >
                <option value="contributor">Contributor (Can pin)</option>
                <option value="viewer">Viewer (Read-only)</option>
                <option value="admin">Admin (Can manage)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-ink hover:bg-ink/90 text-paper text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Invite
              </button>
            </div>
          </form>

          {/* Generated Shareable Link Box */}
          {latestInviteLink && (
            <div className="p-3.5 bg-paper rounded-2xl border border-dashed border-kraft space-y-2">
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                Shareable Link Generated:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={latestInviteLink}
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-kraft/60 text-xs text-ink select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(latestInviteLink)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Collaborator List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
              <span>People with access</span>
              <span>{collaborators.length + 1}</span>
            </h3>

            <div className="divide-y divide-kraft/30 border border-kraft/60 rounded-2xl bg-white/70 overflow-hidden">
              {/* Owner */}
              {owner && (
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        owner.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${owner.name}`
                      }
                      alt={owner.name}
                      className="w-8 h-8 rounded-full border border-kraft bg-paper-dark"
                    />
                    <div>
                      <p className="text-xs font-bold text-ink">{owner.name}</p>
                      <p className="text-[10px] text-ink-muted">{owner.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-accent-terracotta bg-accent-terracotta/10 px-2.5 py-0.5 rounded-full">
                    Owner
                  </span>
                </div>
              )}

              {/* Collaborators */}
              {collaborators.map((c) => {
                const userObj = c.userId;
                if (!userObj) return null;
                return (
                  <div
                    key={userObj._id || userObj}
                    className="p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          userObj.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${userObj.name}`
                        }
                        alt={userObj.name}
                        className="w-8 h-8 rounded-full border border-kraft bg-paper-dark"
                      />
                      <div>
                        <p className="text-xs font-bold text-ink">
                          {userObj.name}
                        </p>
                        <p className="text-[10px] text-ink-muted">
                          {userObj.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={c.role}
                        onChange={(e) =>
                          handleRoleChange(userObj._id || userObj, e.target.value)
                        }
                        className="px-2 py-1 rounded-lg border border-kraft bg-paper text-[11px] font-semibold text-ink cursor-pointer"
                      >
                        <option value="contributor">Contributor</option>
                        <option value="viewer">Viewer</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() =>
                          handleRemoveCollaborator(userObj._id || userObj)
                        }
                        className="p-1.5 text-ink-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {collaborators.length === 0 && (
                <div className="p-4 text-center text-xs text-ink-muted">
                  No other collaborators yet. Share the invite link above!
                </div>
              )}
            </div>
          </div>

          {/* Pending Invites List */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Pending Invitations ({pendingInvites.length})
              </h4>
              <div className="space-y-1.5">
                {pendingInvites.map((inv) => {
                  const clientUrl =
                    window.location.origin || 'http://localhost:5173';
                  const link = `${clientUrl}/invite/${inv.token}`;
                  return (
                    <div
                      key={inv._id}
                      className="p-2.5 rounded-xl border border-kraft/60 bg-paper/50 flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-[240px]">
                        <span className="font-semibold text-ink">
                          {inv.email || 'Open Share Link'}
                        </span>
                        <span className="text-[10px] text-ink-muted block">
                          Role: {inv.role}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(link)}
                        className="p-1.5 text-xs text-accent-terracotta hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
