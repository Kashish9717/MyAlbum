import React, { useState } from 'react';
import { STICKY_COLORS } from './StickyNote';
import { X, Check } from './Icons';

export const StickyNoteCreatePopover = ({ isOpen, onClose, onCreate }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('yellow');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCreate({
      text: text.trim(),
      color,
    });
    setText('');
    onClose();
  };

  return (
    <div
      className="absolute top-10 right-2 z-50 bg-paper-warm border border-kraft rounded-2xl p-4 paper-shadow-lg w-64 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-kraft/40">
        <span className="text-xs font-bold text-ink uppercase tracking-wider">
          New Sticky Note
        </span>
        <button
          onClick={onClose}
          className="text-ink-muted hover:text-ink cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Sticky note mini preview/input */}
        <div
          style={{ backgroundColor: STICKY_COLORS[color]?.bg }}
          className="p-2.5 rounded-sm border border-black/10 sticky-fold sticky-shadow"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a sticky note..."
            rows={3}
            maxLength={300}
            className="w-full bg-transparent resize-none focus:outline-none text-sm font-handwriting leading-tight text-ink font-bold"
            autoFocus
          />
        </div>

        {/* Color swatches */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Object.keys(STICKY_COLORS).map((cKey) => (
              <button
                key={cKey}
                type="button"
                onClick={() => setColor(cKey)}
                className={`w-5 h-5 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
                  color === cKey
                    ? 'scale-125 border-ink ring-1 ring-ink'
                    : 'border-black/20 hover:scale-110'
                }`}
                style={{ backgroundColor: STICKY_COLORS[cKey].bg }}
              >
                {color === cKey && <Check className="w-3 h-3 text-ink" />}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="px-3 py-1 bg-ink hover:bg-ink/90 text-paper text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-40 cursor-pointer"
          >
            Stick It
          </button>
        </div>
      </form>
    </div>
  );
};
