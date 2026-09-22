import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Clock,
  Instagram,
  MessageSquare,
  Share2,
  CheckCircle2,
  Sparkles,
  Trash2,
  X,
  Tag,
  ImageIcon,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  BrandDNA,
  ScheduledPost,
  SocialPlatform,
  ContentTag,
  AVAILABLE_TAGS,
  UPCOMING_FESTIVALS,
  FestivalDay,
  GeneratedAsset,
} from '../types';
import { generateAutomaticHashtags } from '../utils/hashtagEngine';
import { processUserImageFile } from '../utils/imageUtils';

interface ContentCalendarProps {
  brandDna: BrandDNA;
  scheduledPosts: ScheduledPost[];
  onAddScheduledPost: (post: ScheduledPost) => void;
  onDeleteScheduledPost: (id: string) => void;
  onUpdatePostStatus: (id: string, status: 'scheduled' | 'published') => void;
  onOpenSocialUploadModal: (asset: GeneratedAsset) => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = ({
  brandDna,
  scheduledPosts,
  onAddScheduledPost,
  onDeleteScheduledPost,
  onUpdatePostStatus,
  onOpenSocialUploadModal,
}) => {
  // Calendar date view state: base on current simulated year/month (e.g. Sept/Oct 2026 or current)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 1)); // September 2026
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState<ScheduledPost | null>(null);

  // New post draft state inside calendar upload dialog
  const [draftDate, setDraftDate] = useState<string>('2026-09-25');
  const [draftTime, setDraftTime] = useState<string>('09:30');
  const [draftTag, setDraftTag] = useState<ContentTag>('Festival');
  const [draftSubject, setDraftSubject] = useState<string>('');
  const [draftImageUrl, setDraftImageUrl] = useState<string>('');
  const [draftPlatforms, setDraftPlatforms] = useState<SocialPlatform[]>(['instagram', 'whatsapp']);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Automatic hashtags that adapt in real time as the user types subject or changes tag/festival
  const autoHashtags = generateAutomaticHashtags({
    subject: draftSubject,
    tag: draftTag,
    brandName: brandDna.business_name,
    category: brandDna.category,
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleOpenUploadForDate = (dateStr: string, festival?: FestivalDay) => {
    setDraftDate(dateStr);
    if (festival) {
      setDraftTag(festival.tag);
      setDraftSubject(festival.suggested_subject);
    } else {
      setDraftSubject('');
    }
    setDraftImageUrl('');
    setIsUploadModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingImage(true);
      try {
        const dataUrl = await processUserImageFile(files[0]);
        setDraftImageUrl(dataUrl);
      } catch (err) {
        console.error('Image processing failed:', err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Toggle target social platform for draft
  const togglePlatform = (p: SocialPlatform) => {
    setDraftPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((item) => item !== p) : prev) : [...prev, p]
    );
  };

  // Save new post to calendar
  const handleSaveDraftPost = async () => {
    setIsGeneratingCopy(true);

    const fallbackImg =
      draftImageUrl ||
      'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=85';

    // Build the post asset with automatic hashtags
    const hashtags = autoHashtags;
    const cleanSubject = draftSubject.trim() || 'Auspicious ritual essentials';

    const caption = `Mee puja ki shubhapradhamaina ${cleanSubject} ippudu available unnaayi ${brandDna.business_name} lo.`;
    const whatsappText = `Namaskaram! Ee shubhadinam sandarbhanga ${cleanSubject} kosam Sri Venkateswara Puja Stores ni sandarsinchandi. Traditional items & sacred ritual guidance available.`;

    const newAsset: GeneratedAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      image_url: fallbackImg,
      image_source: draftImageUrl ? 'user_upload' : 'curated_brand_render',
      caption,
      hashtags,
      whatsapp_text: whatsappText,
      cta_line: 'Visit our store near Temple Road or message us on WhatsApp',
      tag: draftTag,
      subject: cleanSubject,
      platform: 'instagram_post',
      created_at: new Date().toISOString(),
    };

    const newPost: ScheduledPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: draftDate,
      time: draftTime || '09:30 AM',
      asset: newAsset,
      status: 'scheduled',
      target_platforms: draftPlatforms,
    };

    onAddScheduledPost(newPost);
    setIsGeneratingCopy(false);
    setIsUploadModalOpen(false);
    setSelectedDate(draftDate);
  };

  // Calendar Day render helper
  const renderCalendarDays = () => {
    const cells = [];

    // Prev month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push(
        <div
          key={`prev-${d}`}
          className="min-h-24 sm:min-h-28 p-1.5 sm:p-2 bg-neutral-50/50 border border-neutral-100/60 text-neutral-300 opacity-60 flex flex-col justify-between"
        >
          <span className="text-xs font-semibold">{d}</span>
        </div>
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const festival = UPCOMING_FESTIVALS.find((f) => f.date === dateStr);
      const postsForDay = scheduledPosts.filter((p) => {
        const matchesDate = p.date === dateStr;
        if (!matchesDate) return false;
        if (filterPlatform === 'all') return true;
        return p.target_platforms.includes(filterPlatform as SocialPlatform);
      });

      const isToday = dateStr === '2026-09-22';
      const isSelected = selectedDate === dateStr;

      cells.push(
        <div
          key={dateStr}
          onClick={() => setSelectedDate(dateStr)}
          className={`min-h-24 sm:min-h-28 p-1.5 sm:p-2 border transition-all duration-150 flex flex-col justify-between group relative cursor-pointer ${
            isSelected
              ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30'
              : isToday
              ? 'bg-neutral-50 border-neutral-300'
              : 'bg-white hover:bg-neutral-50/70 border-neutral-200/70'
          }`}
        >
          {/* Day Header */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                isToday
                  ? 'text-white'
                  : isSelected
                  ? 'text-amber-900 font-extrabold'
                  : 'text-neutral-700'
              }`}
              style={isToday ? { backgroundColor: primaryColor } : {}}
            >
              {day}
            </span>

            {/* Quick Upload action on hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenUploadForDate(dateStr, festival);
              }}
              title="Upload / Schedule Post for this day"
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Festival badge */}
          {festival && (
            <div
              className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 truncate border border-amber-200"
              title={festival.name}
            >
              🕉️ {festival.name}
            </div>
          )}

          {/* Scheduled posts in this date cell */}
          <div className="mt-1.5 space-y-1 flex-1 overflow-hidden">
            {postsForDay.map((post) => (
              <div
                key={post.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPostDetail(post);
                }}
                className={`p-1 sm:p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer ${
                  post.status === 'published'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-white border-neutral-200/90 text-neutral-800'
                }`}
              >
                <img
                  src={post.asset.image_url}
                  alt={post.asset.subject}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate flex-1 font-medium">{post.asset.subject}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {post.target_platforms.includes('instagram') && (
                    <Instagram className="w-2.5 h-2.5 text-pink-600" />
                  )}
                  {post.target_platforms.includes('whatsapp') && (
                    <MessageSquare className="w-2.5 h-2.5 text-emerald-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Subtle Add slot prompt if empty and hovered */}
          {postsForDay.length === 0 && !festival && (
            <div className="hidden group-hover:flex items-center justify-center py-1 text-[10px] text-neutral-400 gap-1">
              <Upload className="w-2.5 h-2.5" />
              <span>Upload</span>
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const selectedFestival = UPCOMING_FESTIVALS.find((f) => f.date === selectedDate);
  const selectedPosts = scheduledPosts.filter((p) => p.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">
              Content Calendar & Social Media Scheduler
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Plan, upload store product photos, and publish directly to Instagram, WhatsApp, and Facebook.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Filter */}
          <div className="flex items-center bg-neutral-100 rounded-xl p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterPlatform('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterPlatform === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterPlatform('instagram')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterPlatform === 'instagram'
                  ? 'bg-white text-pink-700 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Instagram className="w-3 h-3" />
              <span>Insta</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterPlatform('whatsapp')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                filterPlatform === 'whatsapp'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>WA</span>
            </button>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-white text-neutral-700 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-800 px-2 min-w-28 text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white text-neutral-700 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Upload / Schedule button */}
          <button
            type="button"
            onClick={() => handleOpenUploadForDate(selectedDate, selectedFestival)}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload & Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/70 text-center text-xs font-bold text-neutral-600 py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* 7-column Date cells */}
        <div className="grid grid-cols-7">{renderCalendarDays()}</div>
      </div>

      {/* Selected Date Summary & Scheduled Posts List */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-neutral-900">
              Posts Scheduled for {selectedDate}
            </h3>
            {selectedFestival && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                🕉️ {selectedFestival.name}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenUploadForDate(selectedDate, selectedFestival)}
            className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Post for this Day</span>
          </button>
        </div>

        {selectedPosts.length === 0 ? (
          <div className="py-8 text-center text-neutral-400 text-xs">
            <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-300" />
            <p className="font-semibold text-neutral-600">No posts scheduled for this day yet.</p>
            <p className="mt-1 text-neutral-400">
              {selectedFestival
                ? `Click above to prepare and schedule a festival post for "${selectedFestival.name}"!`
                : 'Click "Upload & Schedule Post" to add photo and caption.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selectedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="flex gap-3">
                  <img
                    src={post.asset.image_url}
                    alt={post.asset.subject}
                    className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {post.asset.tag}
                      </span>
                      <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {post.asset.subject}
                    </h4>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">
                      {post.asset.caption}
                    </p>
                  </div>
                </div>

                {/* Auto hashtags display */}
                <div className="flex flex-wrap gap-1">
                  {post.asset.hashtags.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/60"
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Post Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {post.status === 'published' ? '✓ Published' : 'Scheduled'}
                    </span>
                    <div className="flex items-center gap-1 text-neutral-400">
                      {post.target_platforms.map((p) => (
                        <span key={p} className="capitalize text-[10px]">
                          {p === 'instagram' ? '📷' : p === 'whatsapp' ? '💬' : '🌐'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenSocialUploadModal(post.asset)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteScheduledPost(post.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload & Schedule Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Upload & Schedule for {draftDate}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Add store photograph and auto-generate bilingual copy & hashtags
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Photo Upload Area */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  1. Store Photo Upload (Optional)
                </label>
                {draftImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 group">
                    <img
                      src={draftImageUrl}
                      alt="Uploaded preview"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setDraftImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-neutral-300 hover:border-amber-600/70 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-neutral-50/50 hover:bg-amber-50/20 transition-all cursor-pointer">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs font-semibold text-neutral-700">
                      Click to upload photo or take shot
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      JPG, PNG, WebP up to 15MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Tag selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  2. Content Tag
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setDraftTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        draftTag === tag
                          ? 'text-white'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                      style={draftTag === tag ? { backgroundColor: primaryColor } : {}}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  3. Product / Festival Subject
                </label>
                <input
                  type="text"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                  placeholder="e.g. Brass diyas, Sambrani dhoop, Lakshmi puja items..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/20 bg-neutral-50/50"
                />
              </div>

              {/* AUTOMATIC HASHTAGS: Display dynamically updated hashtags */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Hashtags Change Automatically (Live Real-Time):</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {autoHashtags.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-300 shadow-2xs animate-in fade-in"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-amber-800/80 mt-1">
                  ⚡ Dynamically calibrated to subject: <b>"{draftSubject || 'Ritual essentials'}"</b> and tag: <b>"{draftTag}"</b>.
                </p>
              </div>

              {/* Target Platforms */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  4. Target Social Media Applications
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => togglePlatform('instagram')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                      draftPlatforms.includes('instagram')
                        ? 'border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500/30'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlatform('whatsapp')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                      draftPlatforms.includes('whatsapp')
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/30'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlatform('facebook')}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-all ${
                      draftPlatforms.includes('facebook')
                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500/30'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              {/* Date & Time selection */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 mb-1 block">
                    Publish Time
                  </label>
                  <input
                    type="time"
                    value={draftTime}
                    onChange={(e) => setDraftTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-neutral-100 flex items-center justify-end gap-2 bg-neutral-50/50">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-200/70 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingCopy}
                onClick={handleSaveDraftPost}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {isGeneratingCopy ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing Post...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Save to Calendar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer Modal for a clicked scheduled post */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  {selectedPostDetail.asset.tag}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {selectedPostDetail.date} • {selectedPostDetail.time}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostDetail(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <img
                src={selectedPostDetail.asset.image_url}
                alt={selectedPostDetail.asset.subject}
                className="w-24 h-24 rounded-xl object-cover border border-neutral-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 mb-1">
                  {selectedPostDetail.asset.subject}
                </h4>
                <p className="text-xs text-neutral-600 line-clamp-3">
                  {selectedPostDetail.asset.caption}
                </p>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <span className="text-[11px] font-bold uppercase text-neutral-500 block mb-1">
                Contextual Hashtags:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedPostDetail.asset.hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Platforms */}
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span className="font-semibold">Target Apps:</span>
              <div className="flex items-center gap-2">
                {selectedPostDetail.target_platforms.map((p) => (
                  <span key={p} className="capitalize px-2 py-0.5 rounded-full bg-neutral-100 font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  onDeleteScheduledPost(selectedPostDetail.id);
                  setSelectedPostDetail(null);
                }}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextStatus =
                      selectedPostDetail.status === 'published' ? 'scheduled' : 'published';
                    onUpdatePostStatus(selectedPostDetail.id, nextStatus);
                    setSelectedPostDetail({ ...selectedPostDetail, status: nextStatus });
                  }}
                  className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {selectedPostDetail.status === 'published'
                    ? 'Mark as Scheduled'
                    : 'Mark as Published'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const asset = selectedPostDetail.asset;
                    setSelectedPostDetail(null);
                    onOpenSocialUploadModal(asset);
                  }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload to Social Media</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
