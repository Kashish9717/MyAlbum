import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sparkles,
  Compass,
  Milestone,
  Users,
  Palette,
  FolderHeart,
  Plus,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Share2,
  Activity,
  Camera,
  LogOut,
} from '../components/Icons';
import { CollectionModal } from '../components/CollectionModal';
import { UploadModal } from '../components/UploadModal';
import { ScrapbookItem } from '../components/ScrapbookItem';
import { LightboxModal } from '../components/LightboxModal';
import { ShareModal } from '../components/ShareModal';
import { ActivityFeedDrawer } from '../components/ActivityFeedDrawer';
import { CommentDrawer } from '../components/CommentDrawer';

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

export const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [reactions, setReactions] = useState({}); // { [itemId]: { counts: {}, userReactions: [] } }
  const [userRole, setUserRole] = useState('viewer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Drawers state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [commentItem, setCommentItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState(null);

  // Edit item inline caption state
  const [editingItem, setEditingItem] = useState(null);
  const [editedCaption, setEditedCaption] = useState('');

  // Debounced patch timer reference
  const debounceTimerRef = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const [colRes, itemsRes, notesRes, reactionsRes] = await Promise.all([
        api.get(`/collections/${id}`),
        api.get(`/collections/${id}/items`),
        api.get(`/collections/${id}/notes`),
        api.get(`/collections/${id}/reactions`),
      ]);

      if (colRes.data?.success) {
        setCollection(colRes.data.data);
        setUserRole(colRes.data.userRole || 'viewer');
      }
      if (itemsRes.data?.success) {
        setItems(itemsRes.data.data || []);
      }
      if (notesRes.data?.success) {
        setStickyNotes(notesRes.data.data || []);
      }
      if (reactionsRes.data?.success) {
        setReactions(reactionsRes.data.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch album details:', err);
      setError(err.response?.data?.message || 'Failed to load this album.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, [id]);

  const handleUpdateCollection = async (formData) => {
    try {
      setIsSubmitting(true);
      const res = await api.patch(`/collections/${id}`, formData);
      if (res.data?.success) {
        setCollection(res.data.data);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update album:', err);
      alert(err.response?.data?.message || 'Failed to update album.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete this entire album? This cannot be undone.'
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/collections/${id}`);
      if (res.data?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to delete album:', err);
      alert(err.response?.data?.message || 'Failed to delete album.');
    }
  };

  const handleItemCreated = (newItem) => {
    if (newItem) {
      setItems((prev) => [...prev, newItem]);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this memory from your scrapbook?')) return;
    try {
      const res = await api.delete(`/items/${itemId}`);
      if (res.data?.success) {
        setItems((prev) => prev.filter((it) => it._id !== itemId));
        setStickyNotes((prev) => prev.filter((n) => n.itemId !== itemId));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleStartEditItem = (item) => {
    setEditingItem(item);
    setEditedCaption(item.caption || (item.type === 'note' ? item.text : ''));
  };

  const handleSaveItemEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const payload =
        editingItem.type === 'note'
          ? { text: editedCaption }
          : { caption: editedCaption };

      const res = await api.patch(`/items/${editingItem._id}`, payload);
      if (res.data?.success) {
        setItems((prev) =>
          prev.map((it) => (it._id === editingItem._id ? res.data.data : it))
        );
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      alert(err.response?.data?.message || 'Failed to update item.');
    }
  };

  // Sticky Notes Handlers
  const handleCreateStickyNote = async (noteData) => {
    try {
      const res = await api.post(`/collections/${id}/notes`, noteData);
      if (res.data?.success) {
        setStickyNotes((prev) => [...prev, res.data.data]);
      }
    } catch (err) {
      console.error('Failed to create sticky note:', err);
      alert(err.response?.data?.message || 'Failed to create sticky note.');
    }
  };

  const handleUpdateStickyText = async (noteId, newText) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n._id === noteId ? { ...n, text: newText } : n))
    );

    try {
      await api.patch(`/notes/${noteId}`, { text: newText });
    } catch (err) {
      console.error('Failed to update sticky note text:', err);
      fetchCollectionData();
    }
  };

  const handleDeleteStickyNote = async (noteId) => {
    setStickyNotes((prev) => prev.filter((n) => n._id !== noteId));

    try {
      await api.delete(`/notes/${noteId}`);
    } catch (err) {
      console.error('Failed to delete sticky note:', err);
      fetchCollectionData();
    }
  };

  const handleDragEnd = useCallback(
    (event) => {
      const { active, delta } = event;
      if (!delta || (delta.x === 0 && delta.y === 0)) return;

      const noteId = active.id;
      const currentNote = stickyNotes.find((n) => n._id === noteId);
      if (!currentNote) return;

      const newPosition = {
        x: Math.max(0, Math.min(260, (currentNote.position?.x || 20) + delta.x)),
        y: Math.max(0, Math.min(300, (currentNote.position?.y || 20) + delta.y)),
      };

      setStickyNotes((prev) =>
        prev.map((n) => (n._id === noteId ? { ...n, position: newPosition } : n))
      );

      if (debounceTimerRef.current[noteId]) {
        clearTimeout(debounceTimerRef.current[noteId]);
      }

      debounceTimerRef.current[noteId] = setTimeout(async () => {
        try {
          await api.patch(`/notes/${noteId}`, { position: newPosition });
        } catch (err) {
          console.error('Failed to persist sticky note position:', err);
          fetchCollectionData();
        }
      }, 400);
    },
    [stickyNotes]
  );

  // Reaction Sticker Toggle (Optimistic UI)
  const handleToggleReaction = async (itemId, emoji) => {
    const prevReaction = reactions[itemId] || { counts: {}, userReactions: [] };
    const hasReacted = prevReaction.userReactions.includes(emoji);

    const newCounts = { ...prevReaction.counts };
    let newUserReactions = [...prevReaction.userReactions];

    if (hasReacted) {
      newCounts[emoji] = Math.max(0, (newCounts[emoji] || 1) - 1);
      newUserReactions = newUserReactions.filter((e) => e !== emoji);
    } else {
      newCounts[emoji] = (newCounts[emoji] || 0) + 1;
      newUserReactions.push(emoji);
    }

    setReactions((prev) => ({
      ...prev,
      [itemId]: { counts: newCounts, userReactions: newUserReactions },
    }));

    try {
      const res = await api.post(`/items/${itemId}/reactions`, { emoji });
      if (res.data?.success) {
        setReactions((prev) => ({
          ...prev,
          [itemId]: {
            counts: res.data.counts,
            userReactions: res.data.userReactions,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      setReactions((prev) => ({
        ...prev,
        [itemId]: prevReaction,
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper bg-paper-texture flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-kraft border-t-accent-terracotta rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Opening your memory book...
          </p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-paper bg-paper-texture p-8 flex flex-col items-center justify-center">
        <div className="bg-white/90 border border-kraft rounded-2xl p-8 max-w-md w-full text-center paper-shadow">
          <p className="text-red-600 font-medium mb-4">{error || 'Collection not found'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = userRole === 'owner';
  const isAdmin = isOwner || userRole === 'admin';
  const canContribute = ['owner', 'admin', 'contributor'].includes(userRole);

  const ThemeIcon = THEME_ICONS[collection.theme] || THEME_ICONS.default;
  const textureClass = TEXTURE_CLASSES[collection.coverStyle?.texture] || 'bg-paper-texture';
  const bgColor = collection.coverStyle?.color || '#F5EFEB';

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-paper bg-paper-texture p-4 sm:p-6 md:p-10 flex flex-col">
        <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </Link>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Activity Log Button */}
              <button
                onClick={() => setIsActivityOpen(true)}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/90 hover:bg-white text-ink border border-kraft/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="View album activity feed"
              >
                <Activity className="w-3.5 h-3.5 text-accent-sage" />
                <span className="hidden sm:inline">Activity</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/90 hover:bg-white text-ink border border-kraft/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Share album & manage collaborators"
                >
                  <Share2 className="w-3.5 h-3.5 text-accent-terracotta" />
                  <span>Share</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/80 hover:bg-white text-ink border border-kraft/70 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-ink-muted" />
                  <span className="hidden xs:inline">Edit Style</span>
                  <span className="xs:hidden">Style</span>
                </button>
              )}

              {isOwner && (
                <button
                  onClick={handleDeleteCollection}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              <button
                onClick={logout}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/80 hover:bg-red-50 text-ink-muted hover:text-red-600 border border-kraft/70 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Album Header Banner */}
          {(() => {
            const hasCoverImg = Boolean(collection.coverStyle?.imageUrl);
            return (
              <div
                style={{ backgroundColor: bgColor }}
                className={`rounded-3xl border border-kraft/80 p-6 md:p-10 paper-shadow-lg album-spine relative overflow-hidden mb-8 ${textureClass}`}
              >
                {/* Background Cover Photo if set */}
                {hasCoverImg && (
                  <>
                    <img
                      src={collection.coverStyle.imageUrl}
                      alt={collection.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 backdrop-blur-[1px]" />
                  </>
                )}

                <div className="washi-tape" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          hasCoverImg
                            ? 'bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xs'
                            : 'bg-white/75 backdrop-blur-xs border border-black/5 text-ink'
                        }`}
                      >
                        <ThemeIcon
                          className={`w-4 h-4 ${
                            hasCoverImg ? 'text-amber-300' : 'text-accent-terracotta'
                          }`}
                        />
                        <span>{collection.theme} Album</span>
                      </div>

                      {!isOwner && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            hasCoverImg
                              ? 'bg-white/20 text-white backdrop-blur-sm border border-white/10'
                              : 'bg-black/10 backdrop-blur-xs text-ink'
                          }`}
                        >
                          Role: {userRole}
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                            hasCoverImg
                              ? 'bg-white/15 hover:bg-white/30 text-white/90 backdrop-blur-sm border border-white/20'
                              : 'bg-black/5 hover:bg-black/10 text-ink-muted hover:text-ink'
                          }`}
                          title="Change album cover photo and theme"
                        >
                          <Camera className="w-3 h-3" />
                          <span>{hasCoverImg ? 'Change Cover' : 'Add Cover Image'}</span>
                        </button>
                      )}
                    </div>

                    <h1
                      className={`font-handwriting text-4xl sm:text-5xl md:text-6xl font-bold leading-tight ${
                        hasCoverImg
                          ? 'text-white drop-shadow-md'
                          : 'text-ink drop-shadow-xs'
                      }`}
                    >
                      {collection.title}
                    </h1>

                    {collection.description && (
                      <p
                        className={`text-sm md:text-base max-w-2xl mt-2 leading-relaxed ${
                          hasCoverImg ? 'text-white/85 drop-shadow-xs' : 'text-ink-muted'
                        }`}
                      >
                        {collection.description}
                      </p>
                    )}

                    <div
                      className={`flex flex-wrap items-center gap-3 text-xs mt-5 pt-3 border-t ${
                        hasCoverImg
                          ? 'text-white/70 border-white/15'
                          : 'text-ink-muted border-black/5'
                      }`}
                    >
                      <span>
                        Created by{' '}
                        <strong
                          className={hasCoverImg ? 'text-white font-semibold' : 'text-ink font-semibold'}
                        >
                          {collection.ownerId?.name || 'You'}
                        </strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        {items.length} {items.length === 1 ? 'memory' : 'memories'} pinned
                      </span>
                      <span>&bull;</span>
                      <span>
                        {stickyNotes.length}{' '}
                        {stickyNotes.length === 1 ? 'sticky note' : 'sticky notes'}
                      </span>
                    </div>
                  </div>

                  {canContribute && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xs text-sm font-semibold transition-all hover:-translate-y-0.5 cursor-pointer shrink-0 ${
                          hasCoverImg
                            ? 'bg-white text-ink hover:bg-paper-warm shadow-md'
                            : 'bg-ink hover:bg-ink/90 text-paper'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Photo / Note</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}


          {/* Pinboard / Masonry Grid */}
          {items.length === 0 ? (
            <div className="flex-1 bg-white/50 border-2 border-dashed border-kraft rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-3xl bg-paper-dark border border-kraft/60 flex items-center justify-center text-accent-terracotta mb-4 paper-shadow">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-ink">This Scrapbook is Blank</h3>
              <p className="text-xs sm:text-sm text-ink-muted max-w-md mt-2 mb-6 leading-relaxed">
                {canContribute
                  ? 'Start pinning polaroids, vacation snaps, video clips, and handwritten journal notes to bring your memories alive!'
                  : 'The owner and contributors have not added any memories to this album yet.'}
              </p>
              {canContribute && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-xl shadow-xs text-sm font-semibold transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Upload Photos or Videos</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance] mb-12">
              {items.map((item) => {
                const itemNotes = stickyNotes.filter((n) => n.itemId === item._id);
                const itemReactions = reactions[item._id] || { counts: {}, userReactions: [] };

                return (
                  <ScrapbookItem
                    key={item._id}
                    item={item}
                    isOwner={isAdmin || item.addedBy?._id === user?._id || item.addedBy === user?._id}
                    stickyNotes={itemNotes}
                    reactionData={itemReactions}
                    onOpenLightbox={(it) => setSelectedLightboxItem(it)}
                    onDelete={handleDeleteItem}
                    onEdit={handleStartEditItem}
                    onCreateStickyNote={canContribute ? handleCreateStickyNote : () => alert('Read-only viewer')}
                    onUpdateStickyText={handleUpdateStickyText}
                    onDeleteStickyNote={handleDeleteStickyNote}
                    onToggleReaction={handleToggleReaction}
                    onOpenComments={(it) => setCommentItem(it)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Collection Modal */}
        <CollectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateCollection}
          initialData={collection}
          isSubmitting={isSubmitting}
        />

        {/* Share & Collaborators Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          collectionId={id}
          collectionTitle={collection.title}
        />

        {/* Activity Feed Drawer */}
        <ActivityFeedDrawer
          isOpen={isActivityOpen}
          onClose={() => setIsActivityOpen(false)}
          collectionId={id}
        />

        {/* Comment Thread Drawer */}
        <CommentDrawer
          isOpen={Boolean(commentItem)}
          onClose={() => setCommentItem(null)}
          item={commentItem}
        />

        {/* Upload Media / Note Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          collectionId={id}
          onItemCreated={handleItemCreated}
        />

        {/* Lightbox / Expanded View */}
        <LightboxModal
          isOpen={Boolean(selectedLightboxItem)}
          item={selectedLightboxItem}
          onClose={() => setSelectedLightboxItem(null)}
          onEdit={handleStartEditItem}
          onDelete={handleDeleteItem}
          isOwner={
            isAdmin ||
            selectedLightboxItem?.addedBy?._id === user?._id ||
            selectedLightboxItem?.addedBy === user?._id
          }
        />

        {/* Edit Item Caption Modal */}
        {editingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setEditingItem(null)}
          >
            <div
              className="bg-paper-warm border border-kraft rounded-2xl max-w-md w-full p-6 paper-shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg text-ink mb-2">
                Edit {editingItem.type === 'note' ? 'Journal Note' : 'Caption'}
              </h3>
              <form onSubmit={handleSaveItemEdit} className="space-y-4">
                {editingItem.type === 'note' ? (
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-sm font-handwriting text-xl focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    placeholder="Polaroid caption..."
                    className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-sm font-handwriting text-xl focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
                  />
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 text-sm text-ink-muted hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-ink text-paper rounded-xl shadow-xs hover:bg-ink/90 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};
