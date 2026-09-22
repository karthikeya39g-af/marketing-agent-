import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Instagram,
  MessageSquare,
  Smartphone,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { BrandDNA, ContentRequest, ContentTag, PlatformType, AVAILABLE_TAGS } from '../types';
import { processUserImageFile } from '../utils/imageUtils';
import { CameraCaptureModal } from './CameraCaptureModal';
import { generateAutomaticHashtags } from '../utils/hashtagEngine';

interface BriefComposerProps {
  brandDna: BrandDNA;
  request: ContentRequest;
  onChangeRequest: (updated: ContentRequest) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const SAMPLE_SUBJECTS = [
  'brass diyas',
  'Karthika masam deepam',
  'pure camphor & dhoop',
  'Ganesh festival essentials',
  'handcrafted brass bells',
];

export const BriefComposer: React.FC<BriefComposerProps> = ({
  brandDna,
  request,
  onChangeRequest,
  onGenerate,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';
  const secondaryColor = brandDna.color_palette[1] || '#E8B84B';

  const liveHashtags = generateAutomaticHashtags({
    subject: request.subject,
    tag: request.tag,
    brandName: brandDna.business_name,
    category: brandDna.category,
  });

  const handleTagClick = (tag: ContentTag) => {
    onChangeRequest({ ...request, tag });
  };

  const handlePlatformClick = (platform: PlatformType) => {
    onChangeRequest({ ...request, platform });
  };

  const handleSubjectChange = (subject: string) => {
    onChangeRequest({ ...request, subject });
  };

  const handleProcessFile = async (file: File) => {
    setImageError(null);
    setIsProcessingImage(true);
    try {
      const dataUrl = await processUserImageFile(file);
      onChangeRequest({
        ...request,
        user_image_url: dataUrl,
      });
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setImageError(err.message || 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
    // reset input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleRemoveImage = () => {
    const updated = { ...request };
    delete updated.user_image_url;
    onChangeRequest(updated);
    setImageError(null);
  };

  const handleCameraCapture = (dataUrl: string) => {
    onChangeRequest({
      ...request,
      user_image_url: dataUrl,
    });
  };

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs transition-all">
      <div className="space-y-5">
        {/* Step 1: Tappable Tags Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              1. Select Topic Tag
            </label>
            <span className="text-[11px] text-neutral-400">Single select</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = request.tag === tag;
              return (
                <button
                  key={tag}
                  id={`tag-btn-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none border text-nowrap whitespace-nowrap ${
                    isSelected
                      ? 'text-white shadow-xs scale-102 border-transparent'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/90'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: primaryColor,
                          boxShadow: `0 2px 10px ${primaryColor}30`,
                        }
                      : {}
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject Brief (3-5 words) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              2. Describe Subject <span className="font-normal text-neutral-400">(Optional 3-5 words)</span>
            </label>
            <span className="text-[11px] text-neutral-400">e.g. brass diyas</span>
          </div>

          <div className="relative">
            <input
              id="brief-subject-input"
              type="text"
              value={request.subject || ''}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="e.g. brass diyas, Karthika masam stock, temple bells..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 bg-neutral-50/50 placeholder:text-neutral-400 transition-all font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
          </div>

          {/* Quick suggestion pills */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-neutral-400 mr-1">Quick ideas:</span>
            {SAMPLE_SUBJECTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSubjectChange(sample)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 transition-colors cursor-pointer"
              >
                + {sample}
              </button>
            ))}
          </div>

          {/* Live Automatic Hashtags Preview */}
          <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Auto-Updated Hashtags:</span>
              </div>
              <span className="text-[10px] text-amber-800/80 font-medium">Changes automatically with your topic</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {liveHashtags.map((h, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-2 py-0.5 rounded-md bg-white text-amber-900 border border-amber-300 shadow-2xs transition-all animate-in fade-in duration-150"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Product Photo or AI Visual */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              3. Visual & Product Photo
            </label>
            <span className="text-[11px] text-neutral-400">
              {request.user_image_url ? 'Your real product photo' : 'AI visual or your own photo'}
            </span>
          </div>

          {/* Hidden inputs for file upload and native camera */}
          <input
            ref={fileInputRef}
            id="file-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            id="native-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {request.user_image_url ? (
            /* Uploaded Photo Preview Card */
            <div
              id="uploaded-photo-preview-card"
              className="relative p-3 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-neutral-300 shrink-0 shadow-2xs bg-neutral-900">
                  <img
                    src={request.user_image_url}
                    alt="Uploaded Product"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      Real Store Product Photo
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    Gemini will inspect this photo to accurately write your caption, and composite your brand banner over it.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <button
                  id="change-photo-btn"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
                >
                  Change
                </button>
                <button
                  id="remove-photo-btn"
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove uploaded photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              id="image-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 sm:p-5 rounded-xl border-2 border-dashed transition-all duration-200 ${
                isDraggingOver
                  ? 'border-amber-600 bg-amber-50/60 scale-[1.01]'
                  : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-800">
                      Take or upload your product photo
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Drag and drop image here, or leave empty for AI-generated visual
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  {/* Take Photo button */}
                  <button
                    id="take-photo-btn"
                    type="button"
                    onClick={() => {
                      // On mobile devices, native camera input works best; on desktop, open camera modal
                      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                      if (isMobile && cameraInputRef.current) {
                        cameraInputRef.current.click();
                      } else {
                        setIsCameraModalOpen(true);
                      }
                    }}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-2xs hover:opacity-90 active:scale-95 cursor-pointer select-none"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                  </button>

                  {/* Upload file button */}
                  <button
                    id="upload-file-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer select-none"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Browse Image</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isProcessingImage && (
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-700">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing image for post canvas...</span>
            </div>
          )}

          {imageError && (
            <p className="mt-2 text-xs text-red-600 font-medium">
              {imageError}
            </p>
          )}
        </div>

        {/* Step 4: Platform Toggle & Generate Button */}
        <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Platform Segmented Control */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              4. Platform Format
            </span>
            <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 w-full sm:w-auto">
              <button
                id="platform-btn-post"
                type="button"
                onClick={() => handlePlatformClick('instagram_post')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  request.platform === 'instagram_post'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Post (1:1)</span>
              </button>

              <button
                id="platform-btn-story"
                type="button"
                onClick={() => handlePlatformClick('instagram_story')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  request.platform === 'instagram_story'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Story (9:16)</span>
              </button>

              <button
                id="platform-btn-whatsapp"
                type="button"
                onClick={() => handlePlatformClick('whatsapp')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  request.platform === 'whatsapp'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Generate Primary CTA Button */}
          <div className="flex sm:self-end">
            <button
              id="generate-post-cta-btn"
              type="button"
              disabled={isLoading}
              onClick={onGenerate}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 14px ${primaryColor}40`,
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Crafting Post...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" style={{ color: secondaryColor }} />
                  <span>
                    {request.user_image_url ? 'Generate With My Photo' : 'Generate Post'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        primaryColor={primaryColor}
      />
    </section>
  );
};

