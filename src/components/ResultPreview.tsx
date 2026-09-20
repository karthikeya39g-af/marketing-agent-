import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Instagram,
  Share2,
  Tag,
  Sparkles,
} from 'lucide-react';
import { BrandDNA, GeneratedAsset } from '../types';
import { CompositedImagePreview } from './CompositedImagePreview';

interface ResultPreviewProps {
  asset: GeneratedAsset;
  brandDna: BrandDNA;
  onRegenerateImage: () => void;
  onRegenerateCaption: () => void;
  onDownloadImage: () => void;
  onUpdateImage?: (newImageUrl: string) => void;
  isRegeneratingImage: boolean;
  isRegeneratingCaption: boolean;
  isDownloading: boolean;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({
  asset,
  brandDna,
  onRegenerateImage,
  onRegenerateCaption,
  onDownloadImage,
  onUpdateImage,
  isRegeneratingImage,
  isRegeneratingCaption,
  isDownloading,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';
  const secondaryColor = brandDna.color_palette[1] || '#E8B84B';

  const fullInstagramText = `${asset.caption}\n\n${asset.hashtags.join(' ')}`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(fullInstagramText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  const handleCopyWhatsapp = async () => {
    try {
      await navigator.clipboard.writeText(asset.whatsapp_text);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2000);
    } catch (err) {
      console.error('Failed to copy whatsapp text:', err);
    }
  };

  const handleOpenWhatsapp = () => {
    const encoded = encodeURIComponent(asset.whatsapp_text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-6 pt-2 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
          <h2 className="text-base font-bold text-neutral-900 font-heading">
            Generated Ready-to-Post Asset
          </h2>
        </div>
        <span className="text-xs text-neutral-400 font-medium">
          {new Date(asset.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Composited Image + Download & Reg-Image Controls */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <CompositedImagePreview
            asset={asset}
            brandDna={brandDna}
            onRegenerateImage={onRegenerateImage}
            onDownload={onDownloadImage}
            onUpdateImage={onUpdateImage}
            isRegeneratingImage={isRegeneratingImage}
            isDownloading={isDownloading}
          />

          {asset.image_prompt && (
            <details className="w-full max-w-md mt-3 text-[11px] text-neutral-500 bg-neutral-100/60 p-2.5 rounded-lg border border-neutral-200/60 cursor-pointer">
              <summary className="font-semibold select-none text-neutral-600 hover:text-neutral-900">
                View Imagen Visual Prompt (Negative text constraints enforced)
              </summary>
              <p className="mt-1.5 font-mono text-[10px] text-neutral-600 leading-relaxed break-words">
                {asset.image_prompt}
              </p>
            </details>
          )}
        </div>

        {/* Right Column: Copyable Caption Block + WhatsApp Broadcast Block */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card 1: Instagram Caption & Hashtags */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-pink-50 text-pink-600">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">Instagram Caption & Hashtags</h3>
                  <span className="text-[10px] text-neutral-400">
                    {asset.caption.length} chars (Target &lt; 150)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="regenerate-caption-btn"
                  type="button"
                  disabled={isRegeneratingCaption}
                  onClick={onRegenerateCaption}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                  title="Regenerate only caption"
                >
                  <RefreshCw className={`w-3 h-3 ${isRegeneratingCaption ? 'animate-spin' : ''}`} />
                  <span>Redo</span>
                </button>

                <button
                  id="copy-instagram-caption-btn"
                  type="button"
                  onClick={handleCopyCaption}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    copiedCaption
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Caption Body */}
            <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-200/60 font-medium text-sm text-neutral-800 leading-relaxed select-all">
              {isRegeneratingCaption ? (
                <div className="space-y-2 py-3 animate-pulse">
                  <div className="h-3 bg-neutral-200 rounded w-5/6" />
                  <div className="h-3 bg-neutral-200 rounded w-4/6" />
                </div>
              ) : (
                <p>{asset.caption}</p>
              )}
            </div>

            {/* Hashtags Row */}
            <div className="mt-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 mb-1.5">
                <Tag className="w-3 h-3 text-neutral-400" />
                <span>5 Targeted Hashtags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {asset.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs font-mono px-2 py-0.5 rounded-md bg-amber-50/80 text-amber-900 border border-amber-200/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Line Highlight */}
            {asset.cta_line && (
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-600">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-neutral-700">CTA:</span>
                <span className="truncate">{asset.cta_line}</span>
              </div>
            )}
          </div>

          {/* Card 2: WhatsApp Broadcast Version */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900">WhatsApp Broadcast Version</h3>
                  <span className="text-[10px] text-neutral-400">
                    {asset.whatsapp_text.length} chars (Target &lt; 300, no hashtags)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="open-in-whatsapp-btn"
                  type="button"
                  onClick={handleOpenWhatsapp}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors border border-emerald-200/80 cursor-pointer"
                  title="Direct send via WhatsApp"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Send</span>
                </button>

                <button
                  id="copy-whatsapp-text-btn"
                  type="button"
                  onClick={handleCopyWhatsapp}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    copiedWhatsapp
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {copiedWhatsapp ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Text Content */}
            <div className="bg-emerald-50/40 rounded-xl p-3.5 border border-emerald-100 font-medium text-sm text-neutral-800 leading-relaxed select-all">
              <p className="whitespace-pre-line">{asset.whatsapp_text}</p>
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              Bilingual natural code-switching tailored for your loyal customers and community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
