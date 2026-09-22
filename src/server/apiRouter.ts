import { Router, Request, Response } from 'express';
import { generateCaption, generateImage, generateVideo, generateHashtags } from './geminiService.ts';
import { BrandDNA, ContentRequest, GeneratedAsset } from '../types.ts';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full parallel generation: caption, image, and optional video
apiRouter.post('/generate-all', async (req: Request, res: Response) => {
  try {
    const { brandDna, request } = req.body as {
      brandDna: BrandDNA;
      request: ContentRequest;
    };

    if (!brandDna || !request || !request.tag) {
      return res.status(400).json({ error: 'Missing brandDna or request parameters' });
    }

    // Run calls in parallel
    const [captionResult, imageResult, videoResult] = await Promise.allSettled([
      generateCaption(brandDna, request),
      generateImage(brandDna, request),
      generateVideo(brandDna, request),
    ]);

    const captionData =
      captionResult.status === 'fulfilled'
        ? captionResult.value
        : {
            caption: `Auspicious ${request.subject || 'puja offerings'} now available at ${brandDna.business_name}.`,
            hashtags: ['#PujaEssentials', '#SriVenkateswaraStores', '#Rituals', '#Devotion', '#Traditional'],
            whatsapp_text: `Namaskaram! Authentic ${request.subject || 'puja essentials'} are available at ${brandDna.business_name}. Visit us or reply to order.`,
            cta_line: 'Visit our store or message us for sacred ritual advice',
          };

    const imageData =
      imageResult.status === 'fulfilled'
        ? imageResult.value
        : {
            imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=85',
            prompt: 'Traditional glowing brass diya oil lamps on altar',
            source: 'curated_brand_render' as const,
          };

    const videoData =
      videoResult.status === 'fulfilled'
        ? videoResult.value
        : { status: 'skipped' as const };

    const asset: GeneratedAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      image_url: imageData.imageUrl,
      image_prompt: imageData.prompt,
      image_source: imageData.source,
      caption: captionData.caption,
      hashtags: captionData.hashtags,
      whatsapp_text: captionData.whatsapp_text,
      cta_line: captionData.cta_line,
      tag: request.tag,
      subject: request.subject || '',
      platform: request.platform,
      video_url: videoData.videoUrl,
      video_status: videoData.status,
      created_at: new Date().toISOString(),
    };

    return res.json(asset);
  } catch (error: any) {
    console.error('Error in /generate-all:', error);
    return res.status(500).json({
      error: 'Failed to generate content',
      message: error.message || 'Unknown server error',
    });
  }
});

// Regenerate only the caption
apiRouter.post('/generate-caption', async (req: Request, res: Response) => {
  try {
    const { brandDna, request } = req.body as {
      brandDna: BrandDNA;
      request: ContentRequest;
    };

    if (!brandDna || !request) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const captionData = await generateCaption(brandDna, request);
    return res.json(captionData);
  } catch (error: any) {
    console.error('Error in /generate-caption:', error);
    return res.status(500).json({ error: error.message || 'Failed to regenerate caption' });
  }
});

// Regenerate only the image
apiRouter.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { brandDna, request } = req.body as {
      brandDna: BrandDNA;
      request: ContentRequest;
    };

    if (!brandDna || !request) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const imageData = await generateImage(brandDna, request);
    return res.json(imageData);
  } catch (error: any) {
    console.error('Error in /generate-image:', error);
    return res.status(500).json({ error: error.message || 'Failed to regenerate image' });
  }
});

// Dynamic / automatic hashtags generator
apiRouter.post('/generate-hashtags', async (req: Request, res: Response) => {
  try {
    const { brandDna, tag, subject, style } = req.body as {
      brandDna: BrandDNA;
      tag: string;
      subject: string;
      style?: string;
    };

    if (!brandDna) {
      return res.status(400).json({ error: 'Missing brandDna' });
    }

    const hashtags = await generateHashtags(brandDna, tag || 'Festival', subject || '', style || 'trending');
    return res.json({ hashtags });
  } catch (error: any) {
    console.error('Error in /generate-hashtags:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate hashtags' });
  }
});
