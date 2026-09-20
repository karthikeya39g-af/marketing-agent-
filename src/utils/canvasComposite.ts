import { BrandDNA, PlatformType } from '../types';

/**
 * Composites the image with a brand banner strip and business name,
 * returning a download URL for a crisp PNG.
 */
export async function downloadCompositedImage(
  imageUrl: string,
  brandDna: BrandDNA,
  platform: PlatformType,
  subject: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        // Target canvas resolution based on platform
        let width = 1080;
        let height = 1080;
        if (platform === 'instagram_story') {
          width = 1080;
          height = 1920;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw background image scaled to cover
        const imgAspect = img.width / img.height;
        const targetAspect = width / height;

        let renderWidth = width;
        let renderHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > targetAspect) {
          renderWidth = height * imgAspect;
          offsetX = (width - renderWidth) / 2;
        } else {
          renderHeight = width / imgAspect;
          offsetY = (height - renderHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

        // Draw bottom banner strip in primary brand color
        const bannerHeight = platform === 'instagram_story' ? 220 : 160;
        const bannerY = height - bannerHeight;

        // Soft gradient shadow above banner for elegance
        const grad = ctx.createLinearGradient(0, bannerY - 40, 0, bannerY);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, bannerY - 40, width, 40);

        // Solid brand banner strip
        ctx.fillStyle = brandDna.color_palette[0] || '#8B1A1A';
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // Thin top accent line in secondary brand color
        ctx.fillStyle = brandDna.color_palette[1] || '#E8B84B';
        ctx.fillRect(0, bannerY, width, 6);

        // Render business name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 44px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textY = bannerY + (bannerHeight / 2) - 10;
        ctx.fillText(brandDna.business_name, width / 2, textY);

        // Render subtitle / category / positioning
        ctx.fillStyle = brandDna.color_palette[1] || '#E8B84B';
        ctx.font = '500 24px "Plus Jakarta Sans", system-ui, sans-serif';
        const subText = brandDna.category ? brandDna.category.replace(/_/g, ' ').toUpperCase() : 'SACRED RITUAL ESSENTIALS';
        ctx.fillText(subText, width / 2, textY + 44);

        // Export and trigger download
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Blob creation failed');
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const cleanBiz = brandDna.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const cleanSubject = (subject || 'post').toLowerCase().replace(/[^a-z0-9]/g, '-');
          link.download = `${cleanBiz}-${cleanSubject}-${Date.now()}.png`;
          link.href = url;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          resolve();
        }, 'image/png');
      } catch (err) {
        console.error('Download compositing error:', err);
        // Fallback: download direct image
        const link = document.createElement('a');
        link.download = `brandpilot-post-${Date.now()}.jpg`;
        link.href = imageUrl;
        link.click();
        resolve();
      }
    };

    img.onerror = () => {
      // Direct download fallback
      const link = document.createElement('a');
      link.download = `brandpilot-post-${Date.now()}.jpg`;
      link.href = imageUrl;
      link.click();
      resolve();
    };
  });
}
