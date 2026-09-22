import React, { useState, useEffect } from 'react';
import { AlertCircle, Sparkles, CheckCircle2, Calendar, Upload } from 'lucide-react';
import {
  BrandDNA,
  INITIAL_BRAND_DNA,
  ContentRequest,
  GeneratedAsset,
  ScheduledPost,
  SocialPlatform,
} from './types';
import { Header } from './components/Header';
import { BrandSettingsDrawer } from './components/BrandSettingsDrawer';
import { BriefComposer } from './components/BriefComposer';
import { ResultPreview } from './components/ResultPreview';
import { RecentGenerations } from './components/RecentGenerations';
import { ContentCalendar } from './components/ContentCalendar';
import { SocialUploadModal } from './components/SocialUploadModal';
import { downloadCompositedImage } from './utils/canvasComposite';

const INITIAL_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: 'post_fest_01',
    date: '2026-09-25',
    time: '09:00 AM',
    status: 'scheduled',
    target_platforms: ['instagram', 'whatsapp', 'facebook'],
    asset: {
      id: 'asset_fest_01',
      image_url:
        'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=85',
      image_prompt:
        'Commercial product photography of brass diyas. Category: puja_samagri_retail. Auspicious lighting.',
      image_source: 'curated_brand_render',
      caption:
        'Shukravaram Mahalakshmi Devi puja kosam vishesamaina brass deepalu mariyu sugandha dhoop. Mee intlo lakshmi kataksham kalagali ani korukuntoo...',
      hashtags: [
        '#LakshmiPuja',
        '#Shukravaram',
        '#SriVenkateswaraStores',
        '#PujaSamagri',
        '#BrassDiyas',
      ],
      whatsapp_text:
        'Namaskaram! Ee Shukravaram Mahalakshmi Puja samagri mee intiki theppinchukondi. Brass diyas, pure dhoop and camphor stock ready gaa undi. Visit Sri Venkateswara Puja Stores.',
      cta_line: 'Visit our store near Temple Road or call us for samagri list',
      tag: 'Festival',
      subject: 'Lakshmi puja brass diyas',
      platform: 'instagram_post',
      video_status: 'skipped',
      created_at: '2026-09-20T08:00:00.000Z',
    },
  },
  {
    id: 'post_fest_02',
    date: '2026-10-10',
    time: '08:30 AM',
    status: 'scheduled',
    target_platforms: ['instagram', 'facebook', 'x'],
    asset: {
      id: 'asset_fest_02',
      image_url:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=85',
      image_prompt:
        'Festive puja setup with brass kalash and red kumkum. Deep spiritual warmth.',
      image_source: 'curated_brand_render',
      caption:
        'Devi Sarannavaratri utsavalu modalavthunnayi! Kalasha sthapana mariyu akhanda deeparadhana samagri anthaa okkote chota.',
      hashtags: [
        '#Navratri2026',
        '#DurgaPuja',
        '#SriVenkateswaraStores',
        '#KalashSthapana',
        '#FestivalVibes',
      ],
      whatsapp_text:
        'Sarannavaratri subhakankshalu! Kalash sthapana, kumkum, akhanda deepam oil and pure dhoop available at Sri Venkateswara Puja Stores.',
      cta_line: 'Pre-order your Navaratri puja kit today!',
      tag: 'Festival',
      subject: 'Navratri Kalash sthapana',
      platform: 'instagram_post',
      video_status: 'skipped',
      created_at: '2026-09-21T10:00:00.000Z',
    },
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'calendar'>('studio');
  const [brandDna, setBrandDna] = useState<BrandDNA>(() => {
    const saved = sessionStorage.getItem('brandpilot_dna');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_BRAND_DNA;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [request, setRequest] = useState<ContentRequest>({
    tag: 'Festival',
    subject: 'brass diyas',
    platform: 'instagram_post',
  });

  // Initial loaded asset
  const [currentAsset, setCurrentAsset] = useState<GeneratedAsset | null>(() => {
    const defaultAsset: GeneratedAsset = {
      id: 'asset_initial_demo',
      image_url:
        'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=85',
      image_prompt:
        'Commercial product photography of brass diyas. Category: puja_samagri_retail. Rich cultural atmosphere, authentic lighting, subtle warm reflections in shades of gold (#E8B84B) and deep crimson (#8B1A1A), set upon an altar or textured stone surface with fresh marigold petals. STRICT MANDATE: NO TEXT, NO WORDS, NO LOGOS.',
      image_source: 'curated_brand_render',
      caption:
        'Mee pandaga puja ki right brass diyas select cheskondi. Deepam prashanthata icchela elaa pettaalo memu chepthaamu.',
      hashtags: [
        '#SriVenkateswaraStores',
        '#BrassDiyas',
        '#TeluguTraditions',
        '#PandagaSambhuraalu',
        '#RitualGuidance',
      ],
      whatsapp_text:
        'Namaskaram! Ee pandagaki mee intlo shubhapradhamaina brass diyas velagala? Correct deeparadhana vidhanam telusukoni mari purchase cheyyandi. Memu meeku thodu untaamu. Visit Sri Venkateswara Puja Stores.',
      cta_line: 'Visit our store near Temple Road or message us for sacred ritual advice',
      tag: 'Festival',
      subject: 'brass diyas',
      platform: 'instagram_post',
      video_status: 'skipped',
      created_at: new Date().toISOString(),
    };
    return defaultAsset;
  });

  const [history, setHistory] = useState<GeneratedAsset[]>(() => {
    return currentAsset ? [currentAsset] : [];
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [isRegeneratingCaption, setIsRegeneratingCaption] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Scheduled Posts state persisted to local storage
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem('brandpilot_scheduled_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SCHEDULED_POSTS;
  });

  useEffect(() => {
    localStorage.setItem('brandpilot_scheduled_posts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  // Social upload modal control
  const [socialUploadAsset, setSocialUploadAsset] = useState<GeneratedAsset | null>(null);
  const [isSocialUploadOpen, setIsSocialUploadOpen] = useState(false);

  // Keep brand DNA in session storage
  useEffect(() => {
    sessionStorage.setItem('brandpilot_dna', JSON.stringify(brandDna));
  }, [brandDna]);

  // Main Generate Action: runs caption + image + video calls in parallel
  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setNotice(null);

    try {
      const res = await fetch('/api/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandDna, request }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const newAsset = (await res.json()) as GeneratedAsset;
      setCurrentAsset(newAsset);
      setHistory((prev) => [newAsset, ...prev.filter((h) => h.id !== newAsset.id)].slice(0, 10));
    } catch (err: any) {
      console.error('Generation error:', err);
      setNotice('Network or server connection issue. Please verify and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate only the caption
  const handleRegenerateCaption = async () => {
    if (!currentAsset || isRegeneratingCaption) return;
    setIsRegeneratingCaption(true);
    setNotice(null);

    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandDna,
          request: {
            tag: currentAsset.tag,
            subject: currentAsset.subject,
            platform: currentAsset.platform,
            user_image_url:
              currentAsset.image_source === 'user_upload'
                ? currentAsset.image_url
                : undefined,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to regenerate caption');
      }

      const data = await res.json();
      const updatedAsset: GeneratedAsset = {
        ...currentAsset,
        caption: data.caption,
        hashtags: data.hashtags,
        whatsapp_text: data.whatsapp_text,
        cta_line: data.cta_line,
      };

      setCurrentAsset(updatedAsset);
      setHistory((prev) =>
        prev.map((item) => (item.id === updatedAsset.id ? updatedAsset : item))
      );
    } catch (err: any) {
      console.error('Error regenerating caption:', err);
      setNotice('Unable to regenerate caption. Using previous version.');
    } finally {
      setIsRegeneratingCaption(false);
    }
  };

  // Update image directly (e.g. user uploads photo on existing result)
  const handleUpdateAssetImage = (newImageUrl: string) => {
    if (!currentAsset) return;
    const updatedAsset: GeneratedAsset = {
      ...currentAsset,
      image_url: newImageUrl,
      image_source: 'user_upload',
      image_prompt: 'Store photograph uploaded by user',
    };
    setCurrentAsset(updatedAsset);
    setHistory((prev) =>
      prev.map((item) => (item.id === updatedAsset.id ? updatedAsset : item))
    );
  };

  // Regenerate only the image
  const handleRegenerateImage = async () => {
    if (!currentAsset || isRegeneratingImage) return;
    setIsRegeneratingImage(true);
    setNotice(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandDna,
          request: {
            tag: currentAsset.tag,
            subject: currentAsset.subject,
            platform: currentAsset.platform,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to regenerate image');
      }

      const data = await res.json();
      const updatedAsset: GeneratedAsset = {
        ...currentAsset,
        image_url: data.imageUrl,
        image_prompt: data.prompt,
        image_source: data.source,
      };

      setCurrentAsset(updatedAsset);
      setHistory((prev) =>
        prev.map((item) => (item.id === updatedAsset.id ? updatedAsset : item))
      );
    } catch (err: any) {
      console.error('Error regenerating image:', err);
      setNotice('Unable to regenerate image. Using current visual.');
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  // Download composited image
  const handleDownloadImage = async () => {
    if (!currentAsset || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadCompositedImage(
        currentAsset.image_url,
        brandDna,
        currentAsset.platform,
        currentAsset.subject
      );
    } catch (err) {
      console.error('Download error:', err);
      setNotice('Could not export image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateAssetHashtags = (newHashtags: string[]) => {
    if (!currentAsset) return;
    const updated = { ...currentAsset, hashtags: newHashtags };
    setCurrentAsset(updated);
    setHistory((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleOpenSocialUploadModal = (asset: GeneratedAsset) => {
    setSocialUploadAsset(asset);
    setIsSocialUploadOpen(true);
  };

  const handleSchedulePost = (date: string, time: string, platforms: SocialPlatform[]) => {
    if (!socialUploadAsset) return;
    const newPost: ScheduledPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date,
      time,
      status: 'scheduled',
      target_platforms: platforms,
      asset: socialUploadAsset,
    };
    setScheduledPosts((prev) => [newPost, ...prev]);
    setNotice(`Post successfully scheduled to Calendar for ${date} at ${time}!`);
    setActiveTab('calendar');
  };

  const handleDeleteScheduledPost = (id: string) => {
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
    setNotice('Post removed from calendar.');
  };

  const handleUpdateScheduledStatus = (
    id: string,
    status: 'draft' | 'scheduled' | 'published'
  ) => {
    setScheduledPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        brandDna={brandDna}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
      />

      {/* Collapsible Brand DNA Settings Panel */}
      <BrandSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        brandDna={brandDna}
        onUpdateBrandDna={(updated) => setBrandDna(updated)}
      />

      {/* Notification Banner if notice occurs */}
      {notice && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Single-Screen Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6">
        {/* Navigation Tabs: Studio vs Calendar & Social Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-neutral-200/90 shadow-xs">
          <div className="flex items-center gap-2 flex-1">
            <button
              id="tab-studio-btn"
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'studio'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Studio Generator</span>
            </button>
            <button
              id="tab-calendar-btn"
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Content Calendar & Social Upload</span>
              {scheduledPosts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-neutral-950 font-extrabold">
                  {scheduledPosts.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'studio' && currentAsset && (
            <button
              id="quick-social-upload-btn"
              type="button"
              onClick={() => handleOpenSocialUploadModal(currentAsset)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              style={{ backgroundColor: brandDna.color_palette[0] || '#8B1A1A' }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload to Social Media</span>
            </button>
          )}
        </div>

        {activeTab === 'studio' ? (
          <>
            {/* Step 1: Brief Composer (Fast 10-second flow) */}
            <BriefComposer
              brandDna={brandDna}
              request={request}
              onChangeRequest={(updated) => setRequest(updated)}
              onGenerate={handleGenerate}
              isLoading={isGenerating}
            />

            {/* Step 2: Result Preview (Image with crisp HTML/CSS brand banner + copyable blocks) */}
            {currentAsset && (
              <ResultPreview
                asset={currentAsset}
                brandDna={brandDna}
                onRegenerateImage={handleRegenerateImage}
                onRegenerateCaption={handleRegenerateCaption}
                onDownloadImage={handleDownloadImage}
                onUpdateImage={handleUpdateAssetImage}
                onUpdateHashtags={handleUpdateAssetHashtags}
                onOpenSocialUploadModal={handleOpenSocialUploadModal}
                onScheduleToCalendar={() => handleOpenSocialUploadModal(currentAsset)}
                isRegeneratingImage={isRegeneratingImage}
                isRegeneratingCaption={isRegeneratingCaption}
                isDownloading={isDownloading}
              />
            )}

            {/* Step 3: Recent Generations in this session */}
            {history.length > 1 && currentAsset && (
              <RecentGenerations
                history={history}
                activeId={currentAsset.id}
                onSelectAsset={(selected) => setCurrentAsset(selected)}
                brandDna={brandDna}
              />
            )}
          </>
        ) : (
          <ContentCalendar
            brandDna={brandDna}
            scheduledPosts={scheduledPosts}
            onAddScheduledPost={(post) => {
              setScheduledPosts((prev) => [post, ...prev]);
              setNotice('Post successfully added to Calendar!');
            }}
            onDeleteScheduledPost={handleDeleteScheduledPost}
            onUpdatePostStatus={handleUpdateScheduledStatus}
            onOpenSocialUploadModal={(asset) => handleOpenSocialUploadModal(asset)}
          />
        )}
      </main>

      {/* Social Upload & Calendar Scheduling Modal */}
      <SocialUploadModal
        isOpen={isSocialUploadOpen}
        onClose={() => setIsSocialUploadOpen(false)}
        asset={socialUploadAsset}
        brandDna={brandDna}
        onSchedulePost={handleSchedulePost}
      />

      {/* Simple Footer */}
      <footer className="border-t border-neutral-200/80 bg-white/70 py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: brandDna.color_palette[0] || '#8B1A1A' }}
            />
            <span className="font-semibold text-neutral-700">{brandDna.business_name}</span>
            <span>•</span>
            <span>BrandPilot Studio</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            AI Content Operator with crisp HTML/CSS composite branding & bilingual tone enforcement
          </p>
        </div>
      </footer>
    </div>
  );
}
