import React, { useState } from 'react';
import {
  Trash2,
  Edit,
  Sparkles,
  Plus,
  X,
  Check,
} from './Icons';

export const NOTE_THEMES = {
  lemon: {
    name: 'Lemon Cream',
    cardBg: 'bg-[#FEF9C3]',
    border: 'border-[#FDE047]/60',
    headerBg: 'bg-[#FEF08A]/60',
    accent: '#CA8A04',
    text: 'text-[#713F12]',
    tagBg: 'bg-[#FEF08A]',
  },
  peach: {
    name: 'Warm Peach',
    cardBg: 'bg-[#FFE4E6]',
    border: 'border-[#FDA4AF]/60',
    headerBg: 'bg-[#FECDD3]/60',
    accent: '#E11D48',
    text: 'text-[#881337]',
    tagBg: 'bg-[#FECDD3]',
  },
  mint: {
    name: 'Fresh Mint',
    cardBg: 'bg-[#DCFCE7]',
    border: 'border-[#86EFAC]/60',
    headerBg: 'bg-[#BBF7D0]/60',
    accent: '#16A34A',
    text: 'text-[#14532D]',
    tagBg: 'bg-[#BBF7D0]',
  },
  lavender: {
    name: 'Sweet Lavender',
    cardBg: 'bg-[#F3E8FF]',
    border: 'border-[#D8B4FE]/60',
    headerBg: 'bg-[#E9D5FF]/60',
    accent: '#9333EA',
    text: 'text-[#581C87]',
    tagBg: 'bg-[#E9D5FF]',
  },
  sky: {
    name: 'Sky Blue',
    cardBg: 'bg-[#E0F2FE]',
    border: 'border-[#7DD3FC]/60',
    headerBg: 'bg-[#BAE6FD]/60',
    accent: '#0284C7',
    text: 'text-[#0C4A6E]',
    tagBg: 'bg-[#BAE6FD]',
  },
  rose: {
    name: 'Dusty Rose',
    cardBg: 'bg-[#FDF2F8]',
    border: 'border-[#F472B6]/60',
    headerBg: 'bg-[#FBCFE8]/60',
    accent: '#DB2777',
    text: 'text-[#831843]',
    tagBg: 'bg-[#FBCFE8]',
  },
  kraft: {
    name: 'Vintage Kraft',
    cardBg: 'bg-[#F5EFEB]',
    border: 'border-[#D9C7A3]',
    headerBg: 'bg-[#EFE6D8]',
    accent: '#C86D51',
    text: 'text-[#2C2623]',
    tagBg: 'bg-[#EFE6D8]',
  },
};

export const MOOD_EMOJIS = ['✨', '🌸', '☕', '💡', '🍰', '🧸', '🌈', '🌙', '💌', '🍃', '🥰', '🌻'];

export const DailyThoughtsSection = ({
  notes = [],
  loading = false,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('✨');
  const [color, setColor] = useState('lemon');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Open modal for new note
  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setMoodEmoji('✨');
    setColor('lemon');
    setTags([]);
    setTagInput('');
    setIsPinned(false);
    setIsFavorite(false);
    setIsModalOpen(true);
  };

  // Open modal for editing note
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setMoodEmoji(note.moodEmoji || '✨');
    setColor(note.color || 'lemon');
    setTags(note.tags || []);
    setTagInput('');
    setIsPinned(Boolean(note.isPinned));
    setIsFavorite(Boolean(note.isFavorite));
    setIsModalOpen(true);
  };

  // Add Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Save Note Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const notePayload = {
      title,
      content,
      moodEmoji,
      color,
      tags,
      isPinned,
      isFavorite,
    };

    if (editingNote) {
      await onUpdateNote(editingNote._id, notePayload);
    } else {
      await onCreateNote(notePayload);
    }
    setIsModalOpen(false);
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = selectedTag === 'all' || (n.tags && n.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Action Row */}
      <div className="bg-white/80 border border-kraft/70 rounded-3xl p-6 sm:p-8 paper-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle cute background deco */}
        <div className="absolute top-2 right-4 text-6xl opacity-15 select-none pointer-events-none">
          📝✨
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-terracotta" />
            <span>Daily Thoughts & Notepad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            My Daily Journal & Thoughts
          </h2>
          <p className="text-sm text-ink-muted mt-1 max-w-xl">
            A cozy, private space to scribble your daily memories, cute thoughts, to-dos, and late-night feelings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-2xl shadow-sm text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write a New Thought</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search your thoughts or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/90 border border-kraft/70 rounded-xl text-xs sm:text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 shadow-2xs"
          />
          <span className="absolute left-3 top-2.5 text-ink-muted text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-ink text-paper font-semibold shadow-2xs'
                  : 'bg-white/80 text-ink-muted hover:text-ink border border-kraft/50'
              }`}
            >
              All ({notes.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-ink text-paper font-semibold shadow-2xs'
                    : 'bg-white/80 text-ink-muted hover:text-ink border border-kraft/50'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thoughts Masonry Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-white/50 border border-kraft/40 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="border-2 border-dashed border-kraft/70 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-white/40 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300/70 flex items-center justify-center text-3xl mb-4 shadow-xs select-none">
            ✨
          </div>
          <h3 className="font-bold text-xl text-ink">No Thoughts Written Yet</h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-sm mt-1.5 mb-6 leading-relaxed">
            {searchQuery || selectedTag !== 'all'
              ? 'No notes match your active search or tag filter.'
              : 'Write what made you smile today, something you learned, or a secret wish!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink hover:bg-ink/90 text-paper rounded-xl shadow-xs text-sm font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write First Note</span>
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {filteredNotes.map((note) => {
            const theme = NOTE_THEMES[note.color] || NOTE_THEMES.lemon;
            return (
              <div
                key={note._id}
                className={`group relative rounded-2xl border ${theme.border} ${theme.cardBg} p-5 mb-6 paper-shadow transition-all duration-200 hover:-translate-y-1 hover:paper-shadow-lg break-inside-avoid`}
              >
                {/* Top sticky pin / washi tape indicator */}
                {note.isPinned && (
                  <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] tracking-wide uppercase shadow-xs flex items-center gap-1 border border-amber-500/30 select-none">
                    <span>📌</span> Pinned
                  </div>
                )}

                {/* Note Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">{note.moodEmoji || '✨'}</span>
                    {note.title && (
                      <h4 className="font-bold text-base text-ink leading-snug">
                        {note.title}
                      </h4>
                    )}
                  </div>

                  {/* Actions (Always visible on mobile, hover on desktop) */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        onUpdateNote(note._id, { isPinned: !note.isPinned })
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'bg-amber-300 border-amber-400 text-amber-950'
                          : 'bg-white/80 hover:bg-white border-black/10 text-ink-muted'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                    >
                      <span className="text-xs">📌</span>
                    </button>

                    <button
                      onClick={() =>
                        onUpdateNote(note._id, { isFavorite: !note.isFavorite })
                      }
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        note.isFavorite
                          ? 'bg-rose-200 border-rose-300 text-rose-700'
                          : 'bg-white/80 hover:bg-white border-black/10 text-ink-muted'
                      }`}
                      title={note.isFavorite ? 'Remove favorite' : 'Mark favorite'}
                    >
                      <span className="text-xs">{note.isFavorite ? '❤️' : '🤍'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 bg-white/80 hover:bg-white text-ink rounded-lg border border-black/10 shadow-2xs text-xs cursor-pointer"
                      title="Edit note"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this daily thought?')) {
                          onDeleteNote(note._id);
                        }
                      }}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-2xs text-xs cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <p className="text-ink font-handwriting text-xl sm:text-2xl leading-relaxed whitespace-pre-wrap select-text">
                  {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-black/10">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${theme.tagBg} ${theme.text} border border-black/5 cursor-pointer hover:underline select-none`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Date stamp footer */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted/80 mt-3 pt-2 border-t border-black/5 font-mono">
                  <span>
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>
                    {new Date(note.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-paper-warm border border-kraft rounded-3xl max-w-lg w-full p-6 sm:p-8 paper-shadow-lg flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-kraft/60 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moodEmoji}</span>
                <h3 className="font-bold text-lg sm:text-xl text-ink">
                  {editingNote ? 'Edit Daily Thought' : 'New Daily Thought'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-kraft/30 text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
              {/* Mood picker */}
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">
                  How are you feeling? (Mood Emoji)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMoodEmoji(emoji)}
                      className={`text-xl p-1.5 rounded-xl border transition-transform cursor-pointer shrink-0 ${
                        moodEmoji === emoji
                          ? 'scale-125 bg-amber-200 border-amber-400 shadow-2xs'
                          : 'bg-white/80 border-kraft/40 hover:scale-110'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1 uppercase tracking-wider">
                  Title / Subject (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. A pleasant evening walk, Today's epiphany..."
                  className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
                  maxLength={100}
                />
              </div>

              {/* Note Content Textarea with selected theme bg */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-ink-muted mb-1 uppercase tracking-wider">
                  Your Thought / Journal Note *
                </label>
                <div
                  className={`p-4 rounded-2xl border ${NOTE_THEMES[color]?.border} ${NOTE_THEMES[color]?.cardBg} shadow-inner transition-colors`}
                >
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write anything on your mind... thoughts, gratitude, ideas, reminders..."
                    rows={6}
                    className="w-full bg-transparent resize-none focus:outline-none font-handwriting text-2xl text-ink leading-relaxed"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Color Themes */}
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5 uppercase tracking-wider">
                  Paper Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.keys(NOTE_THEMES).map((cKey) => {
                    const t = NOTE_THEMES[cKey];
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setColor(cKey)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          color === cKey
                            ? `${t.cardBg} border-ink ring-2 ring-ink text-ink scale-105 shadow-xs`
                            : `${t.cardBg} border-kraft/80 text-ink/70 hover:scale-105`
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: t.accent }}
                        />
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1 uppercase tracking-wider">
                  Tags (Press Enter to add)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white rounded-xl border border-kraft">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-paper-dark border border-kraft text-xs font-semibold text-ink select-none"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-ink-muted hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={tags.length === 0 ? "e.g. daily, gratitude, memory..." : "add more..."}
                    className="flex-1 min-w-[120px] text-xs text-ink bg-transparent focus:outline-none p-1"
                  />
                </div>
              </div>

              {/* Checkboxes for Pin & Favorite */}
              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-terracotta focus:ring-0 cursor-pointer"
                  />
                  <span>📌 Pin to top of thoughts</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-medium text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="w-4 h-4 rounded text-accent-terracotta focus:ring-0 cursor-pointer"
                  />
                  <span>❤️ Mark as Favorite</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-kraft/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-ink-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink hover:bg-ink/90 text-paper text-sm font-semibold rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingNote ? 'Update Thought' : 'Save Thought'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
