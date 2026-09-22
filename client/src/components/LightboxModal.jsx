import React from 'react';
import { X, Feather, Sparkles } from './Icons';

export const LightboxModal = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-paper border border-kraft rounded-3xl overflow-hidden paper-shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-ink/70 hover:bg-ink text-paper transition-colors cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center">
          {item.type === 'image' && (
            <div className="w-full flex flex-col items-center">
              <div className="bg-white p-3 md:p-4 rounded-xs polaroid-shadow max-w-2xl w-full">
                <img
                  src={item.url}
                  alt={item.caption || 'Expanded scrapbook memory'}
                  className="w-full max-h-[60vh] object-contain rounded-xs bg-black/5"
                />
                {item.caption && (
                  <div className="mt-4 text-center">
                    <p className="font-handwriting text-3xl md:text-4xl text-ink leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'video' && (
            <div className="w-full flex flex-col items-center">
              <div className="bg-white p-3 md:p-4 rounded-xs polaroid-shadow max-w-3xl w-full">
                <video
                  src={item.url}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain rounded-xs bg-black"
                />
                {item.caption && (
                  <div className="mt-4 text-center">
                    <p className="font-handwriting text-3xl md:text-4xl text-ink leading-relaxed">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {item.type === 'note' && (
            <div className="w-full max-w-2xl flex flex-col items-center">
              <div
                style={{ backgroundColor: item.noteStyle?.paperColor || '#FAF6ED' }}
                className="w-full p-8 md:p-10 rounded-2xl border border-kraft paper-shadow texture-lined torn-edge-top"
              >
                {item.caption && (
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-ink/10">
                    <Feather className="w-5 h-5 text-accent-terracotta" />
                    <h3 className="font-bold text-base text-ink uppercase tracking-wider">
                      {item.caption}
                    </h3>
                  </div>
                )}
                <p
                  className={`text-ink leading-relaxed whitespace-pre-line ${
                    item.noteStyle?.fontStyle !== 'sans'
                      ? 'font-handwriting text-3xl leading-10'
                      : 'font-sans text-base'
                  }`}
                >
                  {item.text}
                </p>
              </div>
            </div>
          )}

          {/* Meta Details footer */}
          <div className="mt-6 flex items-center gap-4 text-xs text-ink-muted">
            <span>
              Added by <strong className="text-ink">{item.addedBy?.name || 'Scrapbooker'}</strong>
            </span>
            <span>&bull;</span>
            <span>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
