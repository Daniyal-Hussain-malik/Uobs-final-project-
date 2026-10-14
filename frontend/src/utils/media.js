// Centralized media utility for Oasis Resort Skardu
// Ensures all uploaded assets, videos, and images resolve seamlessly across localhost and Hostinger

export const DEFAULT_RESORT_IMAGE = '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG';
export const DEFAULT_RESORT_VIDEO = '/uploads/rooms/fbac89b9f17e4ef5939dde3f37a7110d.mp4';
export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80';

export const isVideoMedia = (url) => {
  if (!url) return false;
  return /\.(mp4|mov|webm|m4v|ogv|mkv|avi|3gp)($|\?)/i.test(String(url));
};

export function getMediaUrl(url, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  const clean = url.trim();

  // Full external URLs or data/blob streams
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // Missing leading slash on uploads path (e.g. 'uploads/rooms/...')
  if (clean.startsWith('uploads/')) {
    return `/${clean}`;
  }

  // Bare filenames without uploads folder (e.g. 'gallery-1791753917089-221019565.jpg')
  if (!clean.startsWith('/')) {
    if (clean.startsWith('gallery-')) {
      return `/uploads/gallery/${clean}`;
    }
    if (
      clean.startsWith('room-media-') ||
      clean.startsWith('Oasis_Resort_') ||
      clean.startsWith('IMG_') ||
      clean.startsWith('dji_')
    ) {
      return `/uploads/rooms/${clean}`;
    }
    if (clean.startsWith('service-slip-') || clean.startsWith('slip-')) {
      return `/uploads/slips/${clean}`;
    }
    return `/uploads/${clean}`;
  }

  return clean;
}

export function handleMediaError(e, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (e?.target && e.target.src !== fallback) {
    e.target.src = fallback;
  }
}
