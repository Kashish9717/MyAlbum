import React, { useState, useRef } from 'react';
import axios from 'axios';
import api from '../lib/api';
import {
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  UploadCloud,
  Check,
} from './Icons';

const PAPER_COLORS = [
  { label: 'Parchment', value: '#FAF6ED' },
  { label: 'Pastel Yellow', value: '#FEF9C3' },
  { label: 'Pastel Pink', value: '#FCE7F3' },
  { label: 'Pastel Blue', value: '#E0F2FE' },
  { label: 'Pastel Green', value: '#DCFCE7' },
  { label: 'Pastel Lavender', value: '#F3E8FF' },
];

export const UploadModal = ({ isOpen, onClose, collectionId, onItemCreated }) => {
  const [activeTab, setActiveTab] = useState('media'); // 'media' | 'note'

  // Media Tab State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState('image'); // 'image' | 'video'
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Note Tab State
  const [noteText, setNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('#FAF6ED');
  const [fontStyle, setFontStyle] = useState('handwriting');

  // Common State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      setError('Please choose an image (JPEG, PNG, WebP) or video (MP4, WebM) file.');
      return;
    }

    // 50MB check
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size cannot exceed 50MB.');
      return;
    }

    setError('');
    setFile(selectedFile);
    const isVid = selectedFile.type.startsWith('video/');
    setFileType(isVid ? 'video' : 'image');

    // Create client preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitMedia = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image or video to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setUploadProgress(10);

      // 1. Request presigned URL or direct upload check
      const presignRes = await api.post('/media/presigned-url', {
        filename: file.name,
        contentType: file.type,
        collectionId,
      });

      let finalMediaUrl = '';

      if (presignRes.data?.useLocalFallback) {
        // Fallback: Upload to server /uploads endpoint via multer
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 80) / p.total);
            setUploadProgress(15 + percent);
          },
        });

        finalMediaUrl = uploadRes.data?.publicUrl;
      } else {
        // AWS S3 Direct PUT flow with Presigned URL
        const { uploadUrl, publicUrl } = presignRes.data;
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 80) / (p.total || 1));
            setUploadProgress(15 + percent);
          },
        });
        finalMediaUrl = publicUrl;
      }

      setUploadProgress(95);

      // 2. Save media item in MongoDB
      const createItemRes = await api.post(`/collections/${collectionId}/items`, {
        type: fileType,
        url: finalMediaUrl,
        caption: caption.trim(),
      });

      setUploadProgress(100);
      onItemCreated(createItemRes.data?.data);
      handleClose();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload media.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setError('Please write your note message.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await api.post(`/collections/${collectionId}/items`, {
        type: 'note',
        text: noteText.trim(),
        caption: caption.trim(),
        noteStyle: {
          paperColor: noteColor,
          fontStyle,
        },
      });

      onItemCreated(res.data?.data);
      handleClose();
    } catch (err) {
      console.error('Failed to create note:', err);
      setError(err.response?.data?.message || 'Failed to create journal note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption('');
    setNoteText('');
    setError('');
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-paper-warm border border-kraft rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto paper-shadow-lg flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-kraft/40 bg-white/60 sticky top-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="flex bg-paper-dark p-1 rounded-xl border border-kraft/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('media');
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'media'
                    ? 'bg-ink text-paper shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Media</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('note');
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'note'
                    ? 'bg-ink text-paper shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Add a Note</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Upload Media */}
        {activeTab === 'media' ? (
          <form onSubmit={handleSubmitMedia} className="p-6 space-y-5">
            {/* Drag and drop zone */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-accent-terracotta bg-accent-terracotta/5 scale-102'
                    : 'border-kraft hover:border-ink/50 bg-white/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-paper-dark flex items-center justify-center text-accent-terracotta mb-3 paper-shadow">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="font-semibold text-sm text-ink">
                  Click to browse or drag & drop photo/video
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  Supports PNG, JPG, WebP, MP4, MOV (up to 50MB)
                </p>
              </div>
            ) : (
              /* Preview Area */
              <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-kraft p-3 flex flex-col items-center">
                {fileType === 'image' ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 object-contain rounded-xl shadow-xs"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-64 rounded-xl shadow-xs"
                  />
                )}
                <div className="flex items-center justify-between w-full mt-3 px-2">
                  <span className="text-xs text-ink-muted truncate max-w-xs font-medium">
                    {file?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}

            {/* Caption */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Polaroid Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., Sunset by the lake, best matcha ever..."
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-sm placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40 font-handwriting text-lg"
              />
            </div>

            {/* Upload Progress Bar */}
            {isSubmitting && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-ink-muted">
                  <span>Uploading to scrapbook...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-paper-dark rounded-full h-2 overflow-hidden border border-kraft/50">
                  <div
                    className="bg-accent-terracotta h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-kraft/30">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || isSubmitting}
                className="px-5 py-2 text-sm font-semibold bg-ink hover:bg-ink/90 text-paper rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : 'Pin to Album'}
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Add a Note */
          <form onSubmit={handleSubmitNote} className="p-6 space-y-5">
            {/* Note text entry */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Journal Note Message <span className="text-accent-terracotta">*</span>
              </label>
              <div
                style={{ backgroundColor: noteColor }}
                className="rounded-2xl border border-kraft p-4 paper-shadow texture-lined transition-colors"
              >
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your travel memory, heartfelt reflection, or funny quote here..."
                  rows={5}
                  maxLength={2000}
                  className={`w-full bg-transparent resize-none focus:outline-none text-ink text-base leading-7 ${
                    fontStyle === 'handwriting' ? 'font-handwriting text-xl leading-7' : 'font-sans'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Note paper color selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Paper Color
              </label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {PAPER_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setNoteColor(col.value)}
                    title={col.label}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative flex items-center justify-center shadow-xs ${
                      noteColor === col.value
                        ? 'scale-110 border-ink ring-2 ring-ink/20'
                        : 'border-black/15 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.value }}
                  >
                    {noteColor === col.value && <Check className="w-3.5 h-3.5 text-ink" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font style selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Typography
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFontStyle('handwriting')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    fontStyle === 'handwriting'
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-white border-kraft text-ink'
                  }`}
                >
                  <span className="font-handwriting text-base">Handwritten</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('sans')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    fontStyle === 'sans'
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-white border-kraft text-ink'
                  }`}
                >
                  <span className="font-sans">Clean Sans</span>
                </button>
              </div>
            </div>

            {/* Note Caption / Tag */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                Title / Subtitle (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g., Note from grandma, Day 3 in Osaka"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border border-kraft bg-white text-ink text-sm placeholder-ink-light focus:outline-none focus:ring-2 focus:ring-accent-terracotta/40"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-kraft/30">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!noteText.trim() || isSubmitting}
                className="px-5 py-2 text-sm font-semibold bg-ink hover:bg-ink/90 text-paper rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? 'Pinning...' : 'Pin Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
