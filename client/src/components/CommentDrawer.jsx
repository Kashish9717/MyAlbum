import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, MessageCircle, Feather } from './Icons';
import { formatRelativeTime } from './ActivityFeedDrawer';

export const CommentDrawer = ({ isOpen, onClose, item }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!item) return;
    try {
      setLoading(true);
      const res = await api.get(`/items/${item._id}/comments`);
      if (res.data?.success) {
        setComments(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && item) {
      fetchComments();
      setNewComment('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/items/${item._id}/comments`, {
        text: newComment.trim(),
      });
      if (res.data?.success) {
        setComments((prev) => [...prev, res.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to send comment.');
    } finally {
      setSubmitting(false);
    }
  };

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
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Memory Notes</h2>
              <p className="text-xs text-ink-muted">
                {item.caption ? `"${item.caption}"` : 'Comments & thoughts'}
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

        {/* Comment Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {comments.length === 0 && !loading ? (
            <div className="p-8 text-center text-xs text-ink-muted">
              No notes on this memory yet. Leave the first thought below!
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className="p-3.5 rounded-2xl bg-white border border-kraft/60 paper-shadow space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        c.userId?.avatarUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${
                          c.userId?.name || 'Friend'
                        }`
                      }
                      alt={c.userId?.name}
                      className="w-6 h-6 rounded-full border border-kraft bg-paper-dark"
                    />
                    <span className="text-xs font-bold text-ink">
                      {c.userId?.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-muted font-mono">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-sans pl-8">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* New Comment Input */}
        <form
          onSubmit={handleAddComment}
          className="p-4 border-t border-kraft/40 bg-white/70 backdrop-blur-sm flex gap-2"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a sweet note..."
            maxLength={500}
            className="flex-1 px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-xs placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-ink hover:bg-ink/90 text-paper rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};
