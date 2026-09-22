import { BrandDNA, ContentTag } from '../types';

export type HashtagStyle = 'trending' | 'festive' | 'local_telugu' | 'product' | 'reach';

export interface HashtagGenerationOptions {
  subject?: string;
  tag: ContentTag;
  brandName?: string;
  category?: string;
  style?: HashtagStyle;
}

/**
 * Clean a string into a valid PascalCase or clean hashtag string
 */
function toHashtag(str: string): string {
  const clean = str
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  return clean ? `#${clean}` : '';
}

/**
 * Intelligent client-side rule & keyword based hashtag generator
 * Provides instantaneous, zero-latency automatic hashtag updates as the user types or toggles.
 */
export function generateAutomaticHashtags(options: HashtagGenerationOptions): string[] {
  const {
    subject = '',
    tag,
    brandName = 'Sri Venkateswara Stores',
    style = 'trending',
  } = options;

  const subLower = subject.toLowerCase().trim();
  const brandTag = toHashtag(brandName) || '#SriVenkateswaraStores';

  const tagsSet = new Set<string>();

  // 1. Primary Brand Anchor Tag
  tagsSet.add(brandTag);

  // 2. Keyword-specific automatic tags based on subject content
  if (subLower.includes('diya') || subLower.includes('deepam') || subLower.includes('lamp') || subLower.includes('brass')) {
    if (style === 'local_telugu') {
      tagsSet.add('#Deeparadhana');
      tagsSet.add('#KarthikaDeepalu');
      tagsSet.add('#MeeIntloPooja');
    } else if (style === 'festive') {
      tagsSet.add('#AuspiciousLighting');
      tagsSet.add('#DeepavaliVibes');
      tagsSet.add('#SacredFlame');
    } else {
      tagsSet.add('#BrassDiyas');
      tagsSet.add('#HandcraftedBrass');
      tagsSet.add('#PoojaMandir');
    }
  } else if (subLower.includes('camphor') || subLower.includes('karpooram')) {
    tagsSet.add('#BhimseniCamphor');
    tagsSet.add('#PureKarpooram');
    tagsSet.add('#AartiEssentials');
  } else if (subLower.includes('dhoop') || subLower.includes('sambrani') || subLower.includes('agarbatti') || subLower.includes('incense')) {
    tagsSet.add('#SambraniDhoop');
    tagsSet.add('#NaturalIncense');
    tagsSet.add('#AromaticPuja');
  } else if (subLower.includes('kumkum') || subLower.includes('turmeric') || subLower.includes('haldi') || subLower.includes('pasupu')) {
    tagsSet.add('#PureKumkum');
    tagsSet.add('#HaldiKumkum');
    tagsSet.add('#SuvasiniPuja');
  } else if (subLower.includes('bell') || subLower.includes('ghanti')) {
    tagsSet.add('#BrassTempleBell');
    tagsSet.add('#PoojaBell');
    tagsSet.add('#DivineVibrations');
  } else if (subLower.includes('thali') || subLower.includes('plate')) {
    tagsSet.add('#PujaThaliSet');
    tagsSet.add('#Panchapatra');
    tagsSet.add('#RitualEssentials');
  } else if (subLower.includes('lakshmi') || subLower.includes('laxmi')) {
    tagsSet.add('#LakshmiPuja');
    tagsSet.add('#ShukravaraPooja');
    tagsSet.add('#AshtaLakshmi');
  } else if (subLower.includes('ganesh') || subLower.includes('vinayaka')) {
    tagsSet.add('#VinayakaChavithi');
    tagsSet.add('#GaneshPuja');
    tagsSet.add('#ModakSamagri');
  } else if (subLower.includes('navratri') || subLower.includes('durga')) {
    tagsSet.add('#NavratriPuja');
    tagsSet.add('#Sarannavaratri');
    tagsSet.add('#AkhandaDeepam');
  } else if (subLower.includes('diwali') || subLower.includes('deepavali')) {
    tagsSet.add('#DiwaliCelebrations');
    tagsSet.add('#DeepavaliPuja');
    tagsSet.add('#FestiveHome');
  } else if (subLower.length > 2) {
    // Generate a contextual tag directly from user-typed words
    const customTag = toHashtag(subLower);
    if (customTag && customTag.length > 2) {
      tagsSet.add(customTag);
    }
  }

  // 3. Category / Tag specific automatic adaptations
  switch (tag) {
    case 'Festival':
      tagsSet.add('#PandagaSambhuraalu');
      tagsSet.add('#FestiveRituals');
      tagsSet.add('#TeluguTraditions');
      break;
    case 'Offer':
      tagsSet.add('#ExclusiveStoreOffer');
      tagsSet.add('#PujaSamagriDeals');
      tagsSet.add('#FestiveSavings');
      break;
    case 'Tip':
      tagsSet.add('#RitualGuidance');
      tagsSet.add('#PoojaVidhanam');
      tagsSet.add('#SacredKnowledge');
      break;
    case 'New arrival':
      tagsSet.add('#NewStockArrival');
      tagsSet.add('#FreshPujaEssentials');
      tagsSet.add('#HandpickedCollection');
      break;
    case 'Behind the scenes':
      tagsSet.add('#StoreStories');
      tagsSet.add('#CuratingPurity');
      tagsSet.add('#LocalBusinessLove');
      break;
  }

  // 4. Style based enrichments
  if (style === 'local_telugu') {
    tagsSet.add('#TeluguIntiPandagalu');
    tagsSet.add('#MeeOoriPoojaStore');
    tagsSet.add('#Shubhadinam');
  } else if (style === 'reach') {
    tagsSet.add('#DevotionalVibes');
    tagsSet.add('#IndianCulture');
    tagsSet.add('#DailyRituals');
  } else {
    tagsSet.add('#PujaSamagriRetail');
    tagsSet.add('#AuthenticPujaItems');
  }

  // Return exactly 5 unique hashtags
  return Array.from(tagsSet).slice(0, 5);
}

/**
 * Call the backend Gemini model for real-time AI hashtag auto-expansion
 */
export async function fetchAiHashtags(
  brandDna: BrandDNA,
  tag: ContentTag,
  subject: string,
  style: HashtagStyle = 'trending'
): Promise<string[]> {
  try {
    const res = await fetch('/api/generate-hashtags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandDna, tag, subject, style }),
    });

    if (!res.ok) {
      throw new Error(`Failed to generate hashtags: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
      return data.hashtags;
    }
  } catch (err) {
    console.warn('Backend hashtag generator failed, using instant local engine:', err);
  }

  // Reliable instant fallback
  return generateAutomaticHashtags({
    subject,
    tag,
    brandName: brandDna.business_name,
    category: brandDna.category,
    style,
  });
}
