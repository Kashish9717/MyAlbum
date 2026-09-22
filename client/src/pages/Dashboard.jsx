import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  LogOut,
  Plus,
  FolderHeart,
  Sparkles,
  Compass,
  Milestone,
  Users,
  Palette,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  Share2,
  Shield,
} from '../components/Icons';
import { CollectionModal } from '../components/CollectionModal';

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

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my' | 'shared'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Card dropdown active menu
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections');
      if (res.data?.success) {
        setCollections(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError('Could not load your collections. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Close card menu on window click
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCollection) {
        const res = await api.patch(
          `/collections/${editingCollection._id}`,
          formData
        );
        if (res.data?.success) {
          setCollections((prev) =>
            prev.map((c) =>
              c._id === editingCollection._id ? res.data.data : c
            )
          );
        }
      } else {
        const res = await api.post('/collections', formData);
        if (res.data?.success) {
          setCollections((prev) => [res.data.data, ...prev]);
        }
      }
      setIsModalOpen(false);
      setEditingCollection(null);
    } catch (err) {
      console.error('Failed to save collection:', err);
      alert(err.response?.data?.message || 'Failed to save collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, collectionId) => {
    e.stopPropagation();
    if (
      !window.confirm(
        'Are you sure you want to delete this album? This action cannot be undone.'
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/collections/${collectionId}`);
      if (res.data?.success) {
        setCollections((prev) => prev.filter((c) => c._id !== collectionId));
      }
    } catch (err) {
      console.error('Failed to delete collection:', err);
      alert(err.response?.data?.message || 'Failed to delete collection.');
    }
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const openEditModal = (e, col) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingCollection(col);
    setIsModalOpen(true);
  };

  // Filter collections
  const myCollections = collections.filter(
    (c) => (c.ownerId?._id || c.ownerId) === user?._id || c.userRole === 'owner'
  );
  const sharedCollections = collections.filter(
    (c) =>
      (c.ownerId?._id || c.ownerId) !== user?._id && c.userRole !== 'owner'
  );

  const displayedCollections =
    activeTab === 'my'
      ? myCollections
      : activeTab === 'shared'
      ? sharedCollections
      : collections;

  return (
    <div className="min-h-screen bg-paper bg-paper-texture flex flex-col">
      {/* Sticky Top Header */}
      <header className="border-b border-kraft/40 bg-white/70 backdrop-blur-md sticky top-0 z-20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-paper-dark flex items-center justify-center text-accent-terracotta border border-kraft/50 shadow-xs">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <span className="font-handwriting text-2xl text-ink font-bold block leading-none">
                Digital Scrapbook
              </span>
              <span className="text-[11px] uppercase tracking-wider text-ink-muted font-medium">
                Personal Memory Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  user?.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${
                    user?.name || 'Scrapbooker'
                  }`
                }
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-kraft bg-paper-dark"
              />
              <span className="text-sm font-medium text-ink hidden sm:inline">
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-kraft/60 bg-white/80 hover:bg-red-50 text-ink-muted hover:text-red-600 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Sign Out of your account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Title Bar & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">
              Hello,{' '}
              <span className="font-handwriting text-4xl text-accent-terracotta">
                {user?.name || 'Explorer'}
              </span>
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              Your memory books & shared albums
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink hover:bg-ink/90 text-paper rounded-xl shadow-xs text-sm font-medium transition-transform hover:-translate-y-0.5 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Filter Tabs (All / My Collections / Shared with Me) */}
        <div className="flex items-center gap-2 mb-8 border-b border-kraft/40 pb-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-ink text-paper shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            All Albums ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'my'
                ? 'bg-ink text-paper shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            My Collections ({myCollections.length})
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'shared'
                ? 'bg-ink text-paper shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            Shared with Me ({sharedCollections.length})
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-white/40 border border-kraft/40 animate-pulse flex flex-col justify-between p-6"
              >
                <div className="w-24 h-4 bg-kraft/30 rounded" />
                <div className="w-3/4 h-8 bg-kraft/40 rounded" />
                <div className="w-1/2 h-4 bg-kraft/20 rounded" />
              </div>
            ))}
          </div>
        ) : displayedCollections.length === 0 ? (
          /* Empty State */
          <div className="border-2 border-dashed border-kraft rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-white/40 min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-paper-dark flex items-center justify-center text-accent-ochre mb-4 paper-shadow">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-ink">
              {activeTab === 'shared'
                ? 'No Shared Albums Yet'
                : 'No Scrapbook Albums Yet'}
            </h3>
            <p className="text-sm text-ink-muted max-w-sm mt-2 mb-6">
              {activeTab === 'shared'
                ? 'When someone invites you to their collection, it will appear right here!'
                : 'Create your very first themed album for travels, friends, personal milestones, or custom memories!'}
            </p>
            {activeTab !== 'shared' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-terracotta hover:bg-accent-terracotta/90 text-white rounded-xl shadow-xs text-sm font-medium transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Album</span>
              </button>
            )}
          </div>
        ) : (
          /* Collections Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedCollections.map((col, index) => {
              const ThemeIcon = THEME_ICONS[col.theme] || THEME_ICONS.default;
              const textureClass =
                TEXTURE_CLASSES[col.coverStyle?.texture] || 'bg-paper-texture';
              const bgColor = col.coverStyle?.color || '#F5EFEB';
              const isOwner =
                (col.ownerId?._id || col.ownerId) === user?._id ||
                col.userRole === 'owner';
              const role = col.userRole || (isOwner ? 'owner' : 'viewer');

              const rotationAngle =
                index % 3 === 0 ? -1 : index % 3 === 1 ? 1 : -0.5;

              const hasCoverImg = Boolean(col.coverStyle?.imageUrl);

              return (
                <div
                  key={col._id}
                  onClick={() => navigate(`/collection/${col._id}`)}
                  style={{
                    backgroundColor: bgColor,
                    transform: `rotate(${rotationAngle}deg)`,
                  }}
                  className={`group relative rounded-2xl rounded-l-xs p-6 border border-kraft/70 paper-shadow album-spine flex flex-col justify-between min-h-[250px] cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:paper-shadow-lg hover:rotate-0 overflow-hidden ${textureClass}`}
                >
                  {/* Background Cover Photo if set */}
                  {hasCoverImg && (
                    <>
                      <img
                        src={col.coverStyle.imageUrl}
                        alt={col.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 backdrop-blur-[0.5px]" />
                    </>
                  )}

                  <div className="washi-tape" />

                  {/* Album Header */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          hasCoverImg
                            ? 'bg-white/20 text-white backdrop-blur-md border border-white/20'
                            : 'bg-white/70 backdrop-blur-xs border border-black/5 text-ink'
                        }`}
                      >
                        <ThemeIcon
                          className={`w-3.5 h-3.5 ${
                            hasCoverImg ? 'text-amber-300' : 'text-accent-terracotta'
                          }`}
                        />
                        {col.theme}
                      </span>

                      {!isOwner && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            hasCoverImg
                              ? 'bg-white/20 text-white backdrop-blur-xs border border-white/10'
                              : 'bg-accent-sage/20 border border-accent-sage/40 text-accent-sage'
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          <span>{role}</span>
                        </span>
                      )}
                    </div>

                    {/* Owner/Admin Action Dropdown */}
                    {(isOwner || role === 'admin') && (
                      <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === col._id ? null : col._id
                            )
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            hasCoverImg
                              ? 'text-white/80 hover:text-white hover:bg-white/20'
                              : 'text-ink/70 hover:text-ink hover:bg-white/60'
                          }`}
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === col._id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-kraft rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              onClick={(e) => openEditModal(e, col)}
                              className="w-full px-3 py-2 text-left text-xs font-medium text-ink hover:bg-paper-warm flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-ink-muted" />
                              <span>Edit Album</span>
                            </button>
                            {isOwner && (
                              <button
                                onClick={(e) => handleDelete(e, col._id)}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Album Title */}
                  <div className="my-4 relative z-10">
                    <h2
                      className={`font-handwriting text-3xl font-bold leading-tight line-clamp-2 transition-colors ${
                        hasCoverImg
                          ? 'text-white drop-shadow-md group-hover:text-amber-200'
                          : 'text-ink drop-shadow-xs group-hover:text-accent-terracotta'
                      }`}
                    >
                      {col.title}
                    </h2>
                    {col.description && (
                      <p
                        className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                          hasCoverImg ? 'text-white/80' : 'text-ink-muted'
                        }`}
                      >
                        {col.description}
                      </p>
                    )}
                  </div>

                  {/* Album Footer */}
                  <div
                    className={`flex items-center justify-between text-[11px] pt-3 relative z-10 border-t ${
                      hasCoverImg
                        ? 'text-white/70 border-white/15'
                        : 'text-ink-muted border-black/5'
                    }`}
                  >
                    <span>
                      {isOwner
                        ? 'By You'
                        : `By ${col.ownerId?.name || 'Friend'}`}
                    </span>
                    <span
                      className={`font-medium group-hover:underline ${
                        hasCoverImg ? 'text-white' : 'text-ink'
                      }`}
                    >
                      Open Album &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Collection Modal */}
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCollection(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCollection}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
