import React, { useState } from 'react';
import {
  X,
  Instagram,
  MessageSquare,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { BrandDNA, GeneratedAsset, SocialPlatform } from '../types';

interface SocialUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GeneratedAsset | null;
  brandDna: BrandDNA;
  onScheduleToCalendar?: (date: string, time: string, platforms: SocialPlatform[]) => void;
  onSchedulePost?: (date: string, time: string, platforms: SocialPlatform[]) => void;
  onMarkAsPublished?: (assetId: string) => void;
}

export const SocialUploadModal: React.FC<SocialUploadModalProps> = ({
  isOpen,
  onClose,
  asset,
  brandDna,
  onScheduleToCalendar,
  onSchedulePost,
  onMarkAsPublished,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState<string>('09:30');
  const [activeTab, setActiveTab] = useState<'upload_now' | 'schedule'>('upload_now');

  if (!isOpen || !asset) return null;

  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';
  const fullCaption = `${asset.caption}\n\n${asset.hashtags.join(' ')}\n\n${asset.cta_line || ''}`.trim();

  // Handle Direct Social Upload / Web Share
  const handleDirectUpload = async () => {
    setPublishStatus(null);

    if (selectedPlatform === 'whatsapp') {
      // Direct WhatsApp API
      const whatsappMsg = `${asset.whatsapp_text}\n\n${asset.hashtags.slice(0, 3).join(' ')}`.trim();
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setPublishStatus('Opened WhatsApp! Ready to send broadcast.');
      if (onMarkAsPublished) onMarkAsPublished(asset.id);
      return;
    }

    if (selectedPlatform === 'twitter') {
      const tweetText = `${asset.caption.slice(0, 180)}\n\n${asset.hashtags.slice(0, 4).join(' ')}`;
      const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twUrl, '_blank', 'noopener,noreferrer');
      setPublishStatus('Opened X (Twitter) composer!');
      if (onMarkAsPublished) onMarkAsPublished(asset.id);
      return;
    }

    if (selectedPlatform === 'facebook') {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(fullCaption)}`;
      window.open(fbUrl, '_blank', 'noopener,noreferrer');
      setPublishStatus('Opened Facebook post composer!');
      if (onMarkAsPublished) onMarkAsPublished(asset.id);
      return;
    }

    // Instagram Upload Workflow
    if (selectedPlatform === 'instagram') {
      // 1. Copy the caption with hashtags to clipboard
      try {
        await navigator.clipboard.writeText(fullCaption);
        setIsCopied(true);
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }

      // 2. Try native Web Share API with image file if supported
      if (navigator.canShare && navigator.share) {
        try {
          // Fetch image as blob
          const response = await fetch(asset.image_url);
          const blob = await response.blob();
          const file = new File([blob], `${brandDna.business_name.replace(/\s+/g, '_')}_post.jpg`, {
            type: blob.type || 'image/jpeg',
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: brandDna.business_name,
              text: fullCaption,
            });
            setPublishStatus('Shared successfully to Instagram!');
            if (onMarkAsPublished) onMarkAsPublished(asset.id);
            return;
          }
        } catch (shareErr) {
          console.warn('Native Web Share aborted or failed:', shareErr);
        }
      }

      // Fallback: Open Instagram and confirm copy
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      setPublishStatus('Caption copied! Instagram opened in new tab. Paste caption & select image to finish posting.');
      if (onMarkAsPublished) onMarkAsPublished(asset.id);
    }
  };

  const handleCopyText = async () => {
    const textToCopy = selectedPlatform === 'whatsapp' ? asset.whatsapp_text : fullCaption;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleConfirmSchedule = () => {
    const scheduler = onSchedulePost || onScheduleToCalendar;
    if (scheduler) {
      scheduler(scheduleDate, scheduleTime, [selectedPlatform]);
      setPublishStatus(`Successfully scheduled for ${scheduleDate} at ${scheduleTime}!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Upload to Social Media</h2>
              <p className="text-[11px] text-neutral-500">
                Directly publish or schedule for {brandDna.business_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Action Tabs: Upload Now vs Schedule to Calendar */}
          <div className="flex p-1 bg-neutral-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('upload_now')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload_now'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Direct Upload Now</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule to Calendar</span>
            </button>
          </div>

          {/* Social Platform Selection */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 block">
              Select Target Application
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlatform('instagram')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === 'instagram'
                    ? 'border-pink-500 bg-pink-50/50 text-pink-700 ring-2 ring-pink-500/20'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('whatsapp')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === 'whatsapp'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('facebook')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === 'facebook'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('twitter')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === 'twitter'
                    ? 'border-neutral-800 bg-neutral-100 text-neutral-900 ring-2 ring-neutral-800/20'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs">
                  𝕏
                </div>
                <span className="text-xs font-bold">X (Twitter)</span>
              </button>
            </div>
          </div>

          {/* Post Preview Block */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex gap-3.5 items-start">
            <img
              src={asset.image_url}
              alt={asset.subject}
              className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                  {asset.tag}
                </span>
                <span className="text-xs font-semibold text-neutral-700 truncate">
                  {asset.subject}
                </span>
              </div>
              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                {selectedPlatform === 'whatsapp' ? asset.whatsapp_text : asset.caption}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {asset.hashtags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Config (If schedule tab is active) */}
          {activeTab === 'schedule' && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Choose Schedule Date & Time</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                    Calendar Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                    Publish Time (Auspicious Slot)
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-700/20"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-800">
                Recommended times for ritual stores: <b>08:30 AM</b> (morning puja slot) or <b>06:00 PM</b> (evening deeparadhana).
              </p>
            </div>
          )}

          {/* Status Message */}
          {publishStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{publishStatus}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyText}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Caption & Tags'}</span>
            </button>

            {activeTab === 'upload_now' ? (
              <button
                type="button"
                onClick={handleDirectUpload}
                className="w-full sm:flex-1 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Upload className="w-4 h-4" />
                <span>
                  Upload to {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Now
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="w-full sm:flex-1 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <Calendar className="w-4 h-4" />
                <span>Save to Content Calendar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
