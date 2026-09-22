export interface ContentPillar {
  name: string;
  weight: number;
}

export interface BrandDNA {
  business_name: string;
  category: string;
  positioning_statement: string;
  tone_of_voice: string[];
  color_palette: [string, string, string]; // [primary, secondary, accent/surface]
  language_style: string;
  forbidden_words: string[];
  content_pillars: ContentPillar[];
}

export type ContentTag = 'New arrival' | 'Offer' | 'Festival' | 'Tip' | 'Behind the scenes';

export type PlatformType = 'instagram_post' | 'instagram_story' | 'whatsapp';

export interface ContentRequest {
  tag: ContentTag;
  subject?: string;
  platform: PlatformType;
  user_image_url?: string;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
  whatsapp_text: string;
  cta_line: string;
}

export interface GeneratedAsset {
  id: string;
  image_url: string;
  image_prompt?: string;
  image_source: 'ai_imagen' | 'curated_brand_render' | 'user_upload';
  caption: string;
  hashtags: string[];
  whatsapp_text: string;
  cta_line: string;
  tag: ContentTag;
  subject: string;
  platform: PlatformType;
  video_url?: string;
  video_status?: 'available' | 'skipped' | 'failed';
  created_at: string;
}

export const INITIAL_BRAND_DNA: BrandDNA = {
  business_name: "Sri Venkateswara Puja Stores",
  category: "puja_samagri_retail",
  positioning_statement: "The shop that tells you what your ritual needs, not just what's in stock.",
  tone_of_voice: ["warm", "respectful", "instructive"],
  color_palette: ["#8B1A1A", "#E8B84B", "#FFF7E6"],
  language_style: "60% Telugu, 40% English, natural code-switching",
  forbidden_words: ["sale", "clearance", "hurry", "limited time", "guaranteed result"],
  content_pillars: [
    { name: "ritual guidance", weight: 0.4 },
    { name: "product showcase", weight: 0.3 },
    { name: "festival calendar", weight: 0.2 },
    { name: "offer", weight: 0.1 }
  ]
};

export type SocialPlatform = 'instagram' | 'whatsapp' | 'facebook' | 'twitter' | 'x';

export interface ScheduledPost {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM" or "18:00"
  asset: GeneratedAsset;
  status: 'scheduled' | 'published' | 'draft';
  target_platforms: SocialPlatform[];
  published_at?: string;
  notes?: string;
}

export interface FestivalDay {
  date: string; // YYYY-MM-DD
  name: string;
  tag: ContentTag;
  suggested_subject: string;
  suggested_hashtags: string[];
}

export const UPCOMING_FESTIVALS: FestivalDay[] = [
  {
    date: '2026-09-25',
    name: 'Shukravara Mahalakshmi Puja',
    tag: 'Festival',
    suggested_subject: 'Lakshmi puja samagri & kumkum',
    suggested_hashtags: ['#LakshmiPuja', '#Shukravaram', '#PujaSamagri', '#SriVenkateswaraStores', '#Deeparadhana']
  },
  {
    date: '2026-10-02',
    name: 'Ekadashi Vratham',
    tag: 'Tip',
    suggested_subject: 'Tulasi puja & ghee deepam',
    suggested_hashtags: ['#Ekadashi', '#TulasiPuja', '#GheeDeepam', '#TeluguTraditions', '#Bhakti']
  },
  {
    date: '2026-10-10',
    name: 'Sarannavaratri Arambham',
    tag: 'Festival',
    suggested_subject: 'Navratri Kalash stapana & akhanda deepam',
    suggested_hashtags: ['#NavratriPuja', '#DurgaMaa', '#KalashSthapana', '#AkhandaDeepam', '#FestivalVibes']
  },
  {
    date: '2026-10-18',
    name: 'Vijayadasami / Dussehra',
    tag: 'Festival',
    suggested_subject: 'Ayudha puja items & Shami puja',
    suggested_hashtags: ['#Vijayadasami', '#DussehraSpecial', '#AyudhaPuja', '#Subhakankshalu', '#Tradition']
  },
  {
    date: '2026-11-08',
    name: 'Deepavali / Diwali',
    tag: 'Festival',
    suggested_subject: 'Traditional clay & brass diyas, pure cow ghee',
    suggested_hashtags: ['#Diwali2026', '#DeepavaliPandaga', '#BrassDiyas', '#HappyDiwali', '#Shubhadinam']
  },
  {
    date: '2026-11-23',
    name: 'Karthika Pournami',
    tag: 'Festival',
    suggested_subject: '365 vatulu, amla deepam & karthika deepalu',
    suggested_hashtags: ['#KarthikaPournami', '#365Vathulu', '#AmlaDeepam', '#ShivaPuja', '#KarthikaMasam']
  }
];

export const AVAILABLE_TAGS: ContentTag[] = [
  'New arrival',
  'Offer',
  'Festival',
  'Tip',
  'Behind the scenes'
];
