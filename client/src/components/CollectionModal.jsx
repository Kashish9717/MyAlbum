import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../lib/api';
import {
  X,
  Sparkles,
  Compass,
  Milestone,
  Users,
  Palette,
  Check,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Camera,
} from './Icons';

export const PRESET_COLORS = [
  { label: 'Warm Parchment', value: '#F5EFEB', text: 'text-ink' },
  { label: 'Kraft Brown', value: '#E2D3B8', text: 'text-ink' },
  { label: 'Terracotta', value: '#C86D51', text: 'text-white' },
  { label: 'Sage Moss', value: '#8A9A86', text: 'text-white' },
  { label: 'Ochre Gold', value: '#D99B4B', text: 'text-ink' },
  { label: 'Dusty Rose', value: '#C97A7E', text: 'text-white' },
  { label: 'Midnight Ink', value: '#2C2623', text: 'text-paper' },
  { label: 'Washi Sky', value: '#CDE3E7', text: 'text-ink' },
];

export const PRESET_TEXTURES = [
  { id: 'paper', label: 'Classic Paper', className: 'bg-paper-texture' },
  { id: 'kraft', label: 'Kraft Fiber', className: 'texture-kraft' },
  { id: 'linen', label: 'Linen Book', className: 'texture-linen' },
  { id: 'leather', label: 'Vintage Leather', className: 'texture-leather' },
  { id: 'dots', label: 'Dot Grid', className: 'texture-dots' },
];

export const PRESET_COVERS = [
  {
    id: 'botanical',
    label: 'Vintage Botanical',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'travel',
    label: 'Mountain Vista',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'memories',
    label: 'Warm Memories',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'friends',
    label: 'Golden Hour',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'cozy',
    label: 'Cozy Nostalgia',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop',
  },
];

export const THEMES = [
  { id: 'default', label: 'Memories (Default)', icon: Sparkles, color: 'text-accent-ochre' },
  { id: 'travel', label: 'Travel & Trips', icon: Compass, color: 'text-accent-terracotta' },
  { id: 'milestones', label: 'Milestones & Goals', icon: Milestone, color: 'text-accent-sage' },
  { id: 'friends', label: 'Friends & Family', icon: Users, color: 'text-accent-rose' },
  { id: 'custom', label: 'Creative / Custom', icon: Palette, color: 'text-ink' },
];

export const CollectionModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('default');
  const [coverColor, setCoverColor] = useState('#F5EFEB');
  const [coverTexture, setCoverTexture] = useState('paper');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('presets'); // 'upload' | 'presets' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTheme(initialData.theme || 'default');
      setCoverColor(initialData.coverStyle?.color || '#F5EFEB');
      setCoverTexture(initialData.coverStyle?.texture || 'paper');
      const img = initialData.coverStyle?.imageUrl || '';
      setCoverImageUrl(img);
      setCustomUrlInput(img);
    } else {
      setTitle('');
      setDescription('');
      setTheme('default');
      setCoverColor('#F5EFEB');
      setCoverTexture('paper');
      setCoverImageUrl('');
      setCustomUrlInput('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Image file size cannot exceed 20MB.');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      const presignRes = await api.post('/media/presigned-url', {
        filename: file.name,
        contentType: file.type,
        collectionId: initialData?._id || 'general',
      });

      let finalUrl = '';
      if (presignRes.data?.useLocalFallback) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalUrl = uploadRes.data?.publicUrl;
      } else {
        const { uploadUrl, publicUrl } = presignRes.data;
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
        });
        finalUrl = publicUrl;
      }

      if (finalUrl) {
        setCoverImageUrl(finalUrl);
        setCustomUrlInput(finalUrl);
      }
    } catch (err) {
      console.error('Failed to upload cover image:', err);
      setError(err.response?.data?.message || 'Failed to upload cover image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setCoverImageUrl(customUrlInput.trim());
    } else {
      setCoverImageUrl('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a collection title.');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      theme,
      coverStyle: {
        color: coverColor,
        texture: coverTexture,
        imageUrl: coverImageUrl.trim(),
      },
    });
  };

  const selectedTextureObj = PRESET_TEXTURES.find((t) => t.id === coverTexture) || PRESET_TEXTURES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-paper-warm border border-kraft rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto paper-shadow-lg flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kraft/40 bg-white/50 sticky top-0 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {initialData ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            <p className="text-xs text-ink-muted">
              {initialData ? 'Update your album style and details' : 'Design a new themed memory book'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Album Title <span className="text-accent-terracotta">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer in Kyoto, Roadtrip 2026, Baby Steps"
              className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 text-sm font-medium"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about memories saved in this book..."
              rows={2}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 text-sm"
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Album Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((th) => {
                const IconComponent = th.icon;
                const isSelected = theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-paper border-ink shadow-sm'
                        : 'bg-white border-kraft/70 text-ink hover:bg-paper-dark/50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-accent-ochre' : th.color}`} />
                    <span className="truncate">{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="border border-kraft/60 rounded-2xl p-4 bg-white/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Album Cover Image (Optional)
              </label>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl('');
                    setCustomUrlInput('');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 bg-paper rounded-xl border border-kraft/50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setImageMode('presets')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  imageMode === 'presets' ? 'bg-white text-ink shadow-2xs font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  imageMode === 'upload' ? 'bg-white text-ink shadow-2xs font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  imageMode === 'url' ? 'bg-white text-ink shadow-2xs font-bold' : 'text-ink-muted hover:text-ink'
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Tab: Presets */}
            {imageMode === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {PRESET_COVERS.map((preset) => {
                  const isSelected = coverImageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setCoverImageUrl(preset.url);
                        setCustomUrlInput(preset.url);
                      }}
                      className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                        isSelected ? 'border-accent-terracotta ring-2 ring-accent-terracotta/30 scale-[1.02]' : 'border-kraft/60 hover:border-ink/50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                        <span className="text-[11px] font-semibold text-white drop-shadow-sm truncate">
                          {preset.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-accent-terracotta text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab: Upload */}
            {imageMode === 'upload' && (
              <div className="pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-kraft hover:border-accent-terracotta/60 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-white/70 hover:bg-white cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-paper-dark flex items-center justify-center text-accent-terracotta mb-2">
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-accent-terracotta border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-ink">
                    {uploadingImage ? 'Uploading image...' : 'Click to select an album cover photo'}
                  </span>
                  <span className="text-[11px] text-ink-muted mt-0.5">
                    Supports JPG, PNG, WebP up to 20MB
                  </span>
                </div>
              </div>
            )}

            {/* Tab: URL */}
            {imageMode === 'url' && (
              <div className="flex gap-2 pt-1">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-kraft bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-ink text-paper text-xs font-semibold rounded-xl hover:bg-ink/90 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Cover Color Palette */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Background Color Tint
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setCoverColor(col.value)}
                  title={col.label}
                  className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer relative flex items-center justify-center shadow-xs ${
                    coverColor === col.value ? 'scale-110 border-ink ring-2 ring-ink/20' : 'border-black/15 hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.value }}
                >
                  {coverColor === col.value && (
                    <Check className={`w-4 h-4 ${col.text}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Texture */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Paper Texture
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_TEXTURES.map((tex) => (
                <button
                  key={tex.id}
                  type="button"
                  onClick={() => setCoverTexture(tex.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    coverTexture === tex.id
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-white border-kraft/60 text-ink hover:bg-paper-dark/50'
                  }`}
                >
                  {tex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Cover Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
              Cover Preview
            </label>
            <div className="p-4 bg-paper rounded-2xl border border-dashed border-kraft flex items-center justify-center">
              <div
                className={`w-64 h-40 rounded-r-2xl rounded-l-xs p-4 flex flex-col justify-between paper-shadow-md album-spine relative overflow-hidden transition-all duration-200 ${selectedTextureObj.className}`}
                style={{ backgroundColor: coverColor }}
              >
                {/* Background image if set */}
                {coverImageUrl && (
                  <>
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  </>
                )}

                <div className="washi-tape" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    coverImageUrl ? 'bg-white/20 text-white backdrop-blur-xs border border-white/20' : 'bg-white/60 text-ink border border-black/5'
                  }`}>
                    {theme}
                  </div>
                </div>

                <div className="relative z-10">
                  <span className={`font-handwriting text-2xl font-bold drop-shadow-xs line-clamp-1 block ${
                    coverImageUrl ? 'text-white drop-shadow-md' : 'text-ink'
                  }`}>
                    {title || 'Album Title'}
                  </span>
                  <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                    coverImageUrl ? 'text-white/80' : 'text-ink-muted'
                  }`}>
                    {description || 'Scrapbook Album'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-kraft/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-paper-dark/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="px-5 py-2 text-sm font-medium bg-ink hover:bg-ink/90 text-paper rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

