import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, Check, X } from './Icons';

export const STICKY_COLORS = {
  yellow: {
    bg: '#FEF08A',
    border: '#FDE047',
    text: '#713F12',
    accent: '#CA8A04',
  },
  pink: {
    bg: '#FBCFE8',
    border: '#F472B6',
    text: '#831843',
    accent: '#DB2777',
  },
  blue: {
    bg: '#BAE6FD',
    border: '#7DD3FC',
    text: '#0C4A6E',
    accent: '#0284C7',
  },
  green: {
    bg: '#BBF7D0',
    border: '#86EFAC',
    text: '#14532D',
    accent: '#16A34A',
  },
  orange: {
    bg: '#FED7AA',
    border: '#FDBA74',
    text: '#7C2D12',
    accent: '#EA580C',
  },
};

export const StickyNote = ({
  note,
  onUpdateText,
  onDelete,
  isOwner = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text || '');
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef(null);

  const colorConfig = STICKY_COLORS[note.color] || STICKY_COLORS.yellow;

  // Draggable hook from @dnd-kit/core
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note._id,
    disabled: isEditing, // disable drag while editing text
    data: {
      note,
    },
  });

  useEffect(() => {
    setText(note.text || '');
  }, [note.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSaveText = (e) => {
    if (e) e.stopPropagation();
    if (text.trim() && text.trim() !== note.text) {
      onUpdateText(note._id, text.trim());
    } else {
      setText(note.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveText();
    } else if (e.key === 'Escape') {
      setText(note.text);
      setIsEditing(false);
    }
  };

  // Position calculation
  const posX = note.position?.x || 20;
  const posY = note.position?.y || 20;
  const rotation = note.rotation || 0;

  // Real-time drag transformation
  const currentX = transform ? posX + transform.x : posX;
  const currentY = transform ? posY + transform.y : posY;

  return (
    <div
      ref={setNodeRef}
      style={{
        left: `${currentX}px`,
        top: `${currentY}px`,
        transform: isDragging
          ? `rotate(${rotation}deg) scale(1.08)`
          : `rotate(${rotation}deg)`,
        backgroundColor: colorConfig.bg,
        zIndex: isDragging ? 50 : isHovered || isEditing ? 40 : 25,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute w-32 min-h-28 p-2.5 rounded-sm border border-black/10 sticky-fold transition-shadow select-none group/sticky ${
        isDragging ? 'sticky-shadow-drag cursor-grabbing' : 'sticky-shadow cursor-grab'
      }`}
      {...(!isEditing ? attributes : {})}
      {...(!isEditing ? listeners : {})}
    >
      {/* Top glue strip highlight */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-black/5 rounded-t-xs pointer-events-none" />

      {/* Delete button - always visible on mobile, hover on desktop */}
      {isOwner && !isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/sticky:opacity-100 transition-opacity shadow-md text-[11px] z-30 cursor-pointer"
          title="Delete sticky note"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      )}

      {/* Inline Editing or View Mode */}
      {isEditing ? (
        <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent resize-none focus:outline-none text-xs font-handwriting leading-tight text-ink font-bold"
            rows={3}
            maxLength={300}
          />
          <div className="flex items-center justify-end gap-1 mt-1 pt-1 border-t border-black/10">
            <button
              type="button"
              onClick={handleSaveText}
              className="p-0.5 bg-black/10 hover:bg-black/20 rounded text-ink cursor-pointer"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="h-full cursor-text"
          title="Click to edit note"
        >
          <p className="font-handwriting text-base font-bold leading-snug text-ink break-words">
            {note.text}
          </p>
        </div>
      )}
    </div>
  );
};
