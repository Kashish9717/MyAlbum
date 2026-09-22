import React, { useState } from 'react';

export const REACTION_EMOJIS = [
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'star', emoji: '⭐', label: 'Star' },
  { id: 'aww', emoji: '🥹', label: 'Aww' },
  { id: 'laugh', emoji: '😄', label: 'Haha' },
  { id: 'fire', emoji: '🔥', label: 'Lit' },
];

export const ReactionStickers = ({
  itemId,
  reactionData = { counts: {}, userReactions: [] },
  onToggleReaction,
}) => {
  const [animatingEmoji, setAnimatingEmoji] = useState(null);

  const handleTap = (e, emojiId) => {
    e.stopPropagation();
    setAnimatingEmoji(emojiId);
    setTimeout(() => setAnimatingEmoji(null), 400);
    onToggleReaction(itemId, emojiId);
  };

  const counts = reactionData.counts || {};
  const userReactions = reactionData.userReactions || [];

  return (
    <div
      className="flex items-center gap-1.5 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      {REACTION_EMOJIS.map((item) => {
        const count = counts[item.id] || 0;
        const isSelected = userReactions.includes(item.id);
        const isBouncing = animatingEmoji === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={(e) => handleTap(e, item.id)}
            title={item.label}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
              isSelected
                ? 'bg-amber-100/90 border-amber-300 text-ink shadow-2xs scale-105'
                : 'bg-white/80 hover:bg-white border-black/10 text-ink-muted hover:text-ink'
            } ${isBouncing ? 'scale-130 -translate-y-1' : ''}`}
          >
            <span
              className={`transition-transform duration-200 ${
                isBouncing ? 'rotate-12 scale-125' : ''
              }`}
            >
              {item.emoji}
            </span>
            {count > 0 && (
              <span
                className={`text-[11px] font-bold ${
                  isSelected ? 'text-amber-950' : 'text-ink-muted'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
