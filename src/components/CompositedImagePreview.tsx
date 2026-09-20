import React, { useRef } from 'react';
import { Download, RefreshCw, Sparkles, CheckCircle2, Video, Camera, Upload } from 'lucide-react';
import { BrandDNA, GeneratedAsset, PlatformType } from '../types';
import { processUserImageFile } from '../utils/imageUtils';

interface CompositedImagePreviewProps {
  asset: GeneratedAsset;
  brandDna: BrandDNA;
  onRegenerateImage: () => void;
  onDownload: () => void;
  onUpdateImage?: (newImageUrl: string) => void;
  isRegeneratingImage: boolean;
  isDownloading: boolean;
}

export const CompositedImagePreview: React.FC<CompositedImagePreviewProps> = ({
  asset,
  brandDna,
  onRegenerateImage,
  onDownload,
  onUpdateImage,
  isRegeneratingImage,
  isDownloading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';
  const secondaryColor = brandDna.color_palette[1] || '#E8B84B';

  const isStory = asset.platform === 'instagram_story';
  const isUserUpload = asset.image_source === 'user_upload';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateImage) {
      try {
        const dataUrl = await processUserImageFile(file);
        onUpdateImage(dataUrl);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hidden file input for quick photo replacement */}
      <input
        ref={fileInputRef}
        id="preview-replace-photo-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* The Visual Container with HTML/CSS Brand Banner Composite */}
      <div
        id="composited-post-container"
        className={`relative w-full overflow-hidden rounded-2xl shadow-lg border border-neutral-200/90 bg-neutral-900 group transition-all duration-300 ${
          isStory ? 'max-w-xs sm:max-w-sm aspect-[9/16]' : 'max-w-md aspect-square'
        }`}
      >
        {/* Visual Media Layer: Video or Image */}
        {asset.video_url && asset.video_status === 'available' ? (
          <video
            src={asset.video_url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover select-none"
          />
        ) : (
          <img
            src={asset.image_url}
            alt={`${brandDna.business_name} - ${asset.subject || asset.tag}`}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="eager"
          />
        )}

        {/* Subtle top badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{asset.tag}</span>
        </div>

        {/* User photo badge if uploaded */}
        {isUserUpload && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-semibold border border-amber-400/30">
            <Camera className="w-3 h-3" />
            <span>Real Store Photo</span>
          </div>
        )}

        {asset.video_url && asset.video_status === 'available' && !isUserUpload && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-semibold border border-white/10">
            <Video className="w-3 h-3" />
            <span>Looping Clip</span>
          </div>
        )}

        {/* Bottom Banner Strip Composited in HTML/CSS (Real Text, Never AI hallucinated) */}
        <div
          id="brand-composite-bottom-banner"
          className="absolute bottom-0 inset-x-0 z-20 transition-all"
        >
          {/* Accent hairline */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: secondaryColor }}
          />

          {/* Banner content */}
          <div
            className="px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 text-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm sm:text-base font-bold tracking-tight text-white truncate font-heading">
                  {brandDna.business_name}
                </p>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              </div>
              <p
                className="text-[10px] sm:text-[11px] font-medium tracking-wider uppercase truncate"
                style={{ color: secondaryColor }}
              >
                {brandDna.category.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Subtle Brand Swatch Emblem */}
            <div
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 bg-white/10"
              title="Official Store Emblem"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
            </div>
          </div>
        </div>

        {/* Loading overlay when regenerating image */}
        {isRegeneratingImage && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-xs font-semibold">Generating fresh visual...</p>
          </div>
        )}
      </div>

      {/* Action Buttons Below the Image */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-md mt-3.5 px-1 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            id="regenerate-image-btn"
            type="button"
            disabled={isRegeneratingImage}
            onClick={onRegenerateImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 select-none"
            title="Generate a new AI photography background"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
            <span>Regenerate AI</span>
          </button>

          {onUpdateImage && (
            <button
              id="upload-preview-photo-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 shadow-2xs transition-colors cursor-pointer select-none"
              title="Upload your own product photo"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-600" />
              <span>{isUserUpload ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          )}
        </div>

        <button
          id="download-composite-image-btn"
          type="button"
          disabled={isDownloading}
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-2xs transition-all hover:opacity-90 active:scale-98 cursor-pointer disabled:opacity-50 select-none"
          style={{ backgroundColor: primaryColor }}
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-white" />
          )}
          <span>Download Image</span>
        </button>
      </div>
    </div>
  );
};
