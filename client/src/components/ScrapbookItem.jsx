import React, { useState } from 'react';
import { Play, Maximize2, Trash2, Edit, Feather, Plus, MessageCircle } from './Icons';
import { StickyNote } from './StickyNote';
import { StickyNoteCreatePopover } from './StickyNoteCreatePopover';
import { ReactionStickers } from './ReactionStickers';

const WashiTape = ({ corner = 'top-center', color = 'pink' }) => {
  const colorMap = {
    pink: 'bg-washi-pink border-accent-terracotta/30',
    yellow: 'bg-washi-yellow border-accent-ochre/30',
    blue: 'bg-washi-blue border-sky-400/30',
    green: 'bg-washi-green border-accent-sage/30',
    lavender: 'bg-washi-lavender border-purple-400/30',
  };

  const cornerClasses = {
    'top-center': '-top-3 left-1/2 -translate-x-1/2 -rotate-2 w-20 h-5',
    'top-left': '-top-2.5 -left-3 -rotate-45 w-16 h-5',
    'top-right': '-top-2.5 -right-3 rotate-45 w-16 h-5',
  };

  if (corner === 'none') return null;

  return (
    <div
      className={`absolute z-20 pointer-events-none opacity-90 shadow-2xs border-x-2 border-dashed ${
        colorMap[color] || colorMap.pink
      } ${cornerClasses[corner] || cornerClasses['top-center']}`}
    />
  );
};

export const ScrapbookItem = ({
  item,
  isOwner,
  stickyNotes = [],
  reactionData = { counts: {}, userReactions: [] },
  onOpenLightbox,
  onDelete,
  onEdit,
  onCreateStickyNote,
  onUpdateStickyText,
  onDeleteStickyNote,
  onToggleReaction,
  onOpenComments,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const rotation = item.rotation || 0;
  const tapeCorner = item.tapeStyle?.corner || 'top-center';
  const tapeColor = item.tapeStyle?.color || 'pink';

  const handleCreateNote = (noteData) => {
    onCreateStickyNote({
      ...noteData,
      itemId: item._id,
      position: { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 },
    });
  };

  // 1. Polaroid Image Frame
  if (item.type === 'image') {
    return (
      <div
        style={{
          transform: isHovered ? 'scale(1.02) rotate(0deg)' : `rotate(${rotation}deg)`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white p-3.5 pb-5 rounded-xs polaroid-shadow hover:polaroid-shadow-hover transition-all duration-300 break-inside-avoid mb-6 select-none"
      >
        <WashiTape corner={tapeCorner} color={tapeColor} />

        {/* Action controls - always visible on mobile, hover on desktop */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-40 bg-white/70 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-1 sm:p-0 rounded-lg shadow-xs sm:shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onOpenComments(item)}
            className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
            title="Comments & notes"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md shadow-xs text-xs font-semibold cursor-pointer border border-amber-300/60"
            title="Add sticky note"
          >
            <Plus className="w-3 h-3" />
            <span>Note</span>
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
                title="Edit caption"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-xs text-xs cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        <StickyNoteCreatePopover
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onCreate={handleCreateNote}
        />

        {/* Photo Container */}
        <div
          className="relative overflow-hidden rounded-xs bg-paper-dark aspect-4/3 flex items-center justify-center cursor-pointer"
          onClick={() => onOpenLightbox(item)}
        >
          <img
            src={item.url}
            alt={item.caption || 'Scrapbook photo'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="p-2 rounded-full bg-white/80 backdrop-blur-xs text-ink shadow-xs">
              <Maximize2 className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Attached Sticky Notes */}
        {stickyNotes.map((note) => (
          <StickyNote
            key={note._id}
            note={note}
            onUpdateText={onUpdateStickyText}
            onDelete={onDeleteStickyNote}
            isOwner={isOwner}
          />
        ))}

        {/* Handwritten Polaroid Caption */}
        <div
          className="mt-3 px-1 text-center min-h-[26px] flex items-center justify-center cursor-pointer"
          onClick={() => onOpenLightbox(item)}
        >
          {item.caption ? (
            <p className="font-handwriting text-xl text-ink leading-tight drop-shadow-xs">
              {item.caption}
            </p>
          ) : (
            <p className="text-[10px] text-ink-muted/50 uppercase tracking-widest font-mono">
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Reaction Stickers Bar */}
        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
          <ReactionStickers
            itemId={item._id}
            reactionData={reactionData}
            onToggleReaction={onToggleReaction}
          />
          <button
            onClick={() => onOpenComments(item)}
            className="text-ink-muted hover:text-ink p-1 rounded-md transition-colors"
            title="Open comments"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Polaroid Video Frame
  if (item.type === 'video') {
    return (
      <div
        style={{
          transform: isHovered ? 'scale(1.02) rotate(0deg)' : `rotate(${rotation}deg)`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white p-3.5 pb-5 rounded-xs polaroid-shadow hover:polaroid-shadow-hover transition-all duration-300 break-inside-avoid mb-6 select-none"
      >
        <WashiTape corner={tapeCorner} color={tapeColor} />

        {/* Action controls - always visible on mobile, hover on desktop */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-40 bg-white/70 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-1 sm:p-0 rounded-lg shadow-xs sm:shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onOpenComments(item)}
            className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
            title="Comments & notes"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md shadow-xs text-xs font-semibold cursor-pointer border border-amber-300/60"
            title="Add sticky note"
          >
            <Plus className="w-3 h-3" />
            <span>Note</span>
          </button>

          {isOwner && (
            <>
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
                title="Edit caption"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-xs text-xs cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        <StickyNoteCreatePopover
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onCreate={handleCreateNote}
        />

        <div className="relative rounded-xs overflow-hidden bg-black/90 aspect-4/3 flex items-center justify-center">
          <video
            src={item.url}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Attached Sticky Notes */}
        {stickyNotes.map((note) => (
          <StickyNote
            key={note._id}
            note={note}
            onUpdateText={onUpdateStickyText}
            onDelete={onDeleteStickyNote}
            isOwner={isOwner}
          />
        ))}

        <div className="mt-3 px-1 text-center min-h-[26px] flex items-center justify-center">
          {item.caption ? (
            <p className="font-handwriting text-xl text-ink leading-tight drop-shadow-xs">
              {item.caption}
            </p>
          ) : (
            <p className="text-[10px] text-ink-muted/50 uppercase tracking-widest font-mono">
              Video Clip &bull; {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
          <ReactionStickers
            itemId={item._id}
            reactionData={reactionData}
            onToggleReaction={onToggleReaction}
          />
          <button
            onClick={() => onOpenComments(item)}
            className="text-ink-muted hover:text-ink p-1 rounded-md transition-colors"
            title="Open comments"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Torn Paper / Journal Note
  const notePaperColor = item.noteStyle?.paperColor || '#FAF6ED';
  const isHandwriting = item.noteStyle?.fontStyle !== 'sans';

  return (
    <div
      style={{
        backgroundColor: notePaperColor,
        transform: isHovered ? 'scale(1.02) rotate(0deg)' : `rotate(${rotation}deg)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-6 rounded-md paper-shadow hover:paper-shadow-lg transition-all duration-300 break-inside-avoid mb-6 border border-kraft/60 texture-lined torn-edge-top select-none"
    >
      <WashiTape corner={tapeCorner} color={tapeColor} />

      {/* Action controls - always visible on mobile, hover on desktop */}
      <div
        className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-40 bg-white/70 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-1 sm:p-0 rounded-lg shadow-xs sm:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenComments(item)}
          className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
          title="Comments & notes"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md shadow-xs text-xs font-semibold cursor-pointer border border-amber-300/60"
          title="Add sticky note"
        >
          <Plus className="w-3 h-3" />
          <span>Note</span>
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 bg-white/95 hover:bg-white text-ink rounded-md shadow-xs text-xs cursor-pointer border border-black/10 sm:border-0"
              title="Edit note"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-xs text-xs cursor-pointer"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      <StickyNoteCreatePopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onCreate={handleCreateNote}
      />

      <div onClick={() => onOpenLightbox(item)} className="cursor-pointer">
        {item.caption && (
          <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-ink/10">
            <Feather className="w-3.5 h-3.5 text-accent-terracotta" />
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              {item.caption}
            </h4>
          </div>
        )}

        <p
          className={`text-ink leading-7 whitespace-pre-line ${
            isHandwriting ? 'font-handwriting text-2xl' : 'font-sans text-sm'
          }`}
        >
          {item.text}
        </p>

        <div className="mt-4 pt-2 border-t border-ink/10 flex items-center justify-between text-[11px] text-ink-muted">
          <span className="font-handwriting text-sm text-ink-muted">
            &mdash; {item.addedBy?.name || 'You'}
          </span>
          <span>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {stickyNotes.map((note) => (
        <StickyNote
          key={note._id}
          note={note}
          onUpdateText={onUpdateStickyText}
          onDelete={onDeleteStickyNote}
          isOwner={isOwner}
        />
      ))}

      <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
        <ReactionStickers
          itemId={item._id}
          reactionData={reactionData}
          onToggleReaction={onToggleReaction}
        />
        <button
          onClick={() => onOpenComments(item)}
          className="text-ink-muted hover:text-ink p-1 rounded-md transition-colors"
          title="Open comments"
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
