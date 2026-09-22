import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Activity, Clock, Sparkles } from './Icons';

// Helper for relative timestamps (e.g., "5m ago", "2h ago", "yesterday")
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ACTION_MESSAGES = {
  added_item: (act) => `pinned ${act.metadata?.caption ? `"${act.metadata.caption}"` : 'a new memory'}`,
  added_note: (act) => `wrote a journal note`,
  added_sticky: (act) => `stuck a note`,
  reacted: (act) => `reacted ${act.metadata?.emoji === 'heart' ? '❤️' : act.metadata?.emoji === 'star' ? '⭐' : act.metadata?.emoji === 'aww' ? '🥹' : act.metadata?.emoji === 'laugh' ? '😄' : act.metadata?.emoji === 'fire' ? '🔥' : '✨'} on ${act.metadata?.caption || 'a memory'}`,
  joined_collection: () => `joined the scrapbook album`,
  commented: (act) => `commented on ${act.metadata?.caption || 'a memory'}`,
};

export const ActivityFeedDrawer = ({ isOpen, onClose, collectionId }) => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/collections/${collectionId}/activity?page=${pageToFetch}&limit=15`
      );
      if (res.data?.success) {
        if (pageToFetch === 1) {
          setActivities(res.data.data || []);
        } else {
          setActivities((prev) => [...prev, ...(res.data.data || [])]);
        }
        setPage(pageToFetch);
        setHasMore(pageToFetch < res.data.pages);
      }
    } catch (err) {
      console.error('Failed to load activity feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities(1);
    }
  }, [isOpen, collectionId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-paper-warm border-l border-kraft w-full max-w-md h-full paper-shadow-lg flex flex-col relative animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kraft/40 bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-paper-dark flex items-center justify-center text-accent-terracotta border border-kraft/50">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Album Activity</h2>
              <p className="text-xs text-ink-muted">Recent updates & reactions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activities.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-ink-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-paper-dark flex items-center justify-center text-accent-ochre mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <p className="font-semibold text-ink">No Activity Yet</p>
              <p className="mt-1">Add a photo, note, or reaction to see the memory log grow!</p>
            </div>
          ) : (
            activities.map((act) => {
              const userObj = act.userId || {};
              const actionText =
                ACTION_MESSAGES[act.action]?.(act) || 'updated the album';

              return (
                <div
                  key={act._id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 border border-kraft/50 paper-shadow hover:bg-white transition-all text-xs"
                >
                  <img
                    src={
                      userObj.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${
                        userObj.name || 'Friend'
                      }`
                    }
                    alt={userObj.name}
                    className="w-8 h-8 rounded-full border border-kraft bg-paper-dark shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-ink leading-relaxed">
                      <strong className="font-bold text-ink">
                        {userObj.name || act.metadata?.userName || 'Someone'}
                      </strong>{' '}
                      <span className="text-ink-muted">{actionText}</span>
                    </p>
                    <span className="text-[10px] text-ink-muted font-mono block mt-1">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={() => fetchActivities(page + 1)}
                disabled={loading}
                className="px-4 py-2 bg-paper-dark hover:bg-paper border border-kraft text-xs font-semibold text-ink rounded-xl transition-colors cursor-pointer"
              >
                {loading ? 'Loading...' : 'Load Earlier Activity'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
