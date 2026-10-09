// Centralized Site Configuration
// All parameters can be overridden via frontend environment variables (.env / VITE_*)

export const SITE_CONFIG = {
  resortName: import.meta.env.VITE_RESORT_NAME || 'OASIS Resort',
  resortSubtitle: import.meta.env.VITE_RESORT_SUBTITLE || 'Cold Desert • Katpana Dunes • Gilgit-Baltistan',
  address: import.meta.env.VITE_RESORT_ADDRESS || 'Katpana Cold Desert, Skardu, Gilgit-Baltistan 16100, Pakistan',
  airportDistance: import.meta.env.VITE_AIRPORT_DISTANCE || '15 Minutes (11 km) from Skardu International Airport',
  altitude: import.meta.env.VITE_RESORT_ALTITUDE || '2,228m Alt',
  phonePrimary: import.meta.env.VITE_RESORT_PHONE || '0308-1472888',
  phoneSecondary: import.meta.env.VITE_RESORT_PHONE_SECONDARY || '0344-5537788',
  phoneConcierge: import.meta.env.VITE_RESORT_PHONE_CONCIERGE || '+92 344 8603636',
  phoneRaw: import.meta.env.VITE_RESORT_PHONE_RAW || '+923081472888',
  whatsappNumber: import.meta.env.VITE_RESORT_WHATSAPP || '923081472888',
  whatsappUrl: `https://wa.me/${import.meta.env.VITE_RESORT_WHATSAPP || '923081472888'}`,
  email: import.meta.env.VITE_RESORT_EMAIL || 'oasisresortskardu@gmail.com',
  emailBilling: import.meta.env.VITE_RESORT_EMAIL_BILLING || 'info@oasisresortskardu.com',
  checkInTime: import.meta.env.VITE_CHECK_IN_TIME || '14:00 PM',
  checkOutTime: import.meta.env.VITE_CHECK_OUT_TIME || '11:30 AM',
  facebookUrl: import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/OasissResorts/',
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/oasis_resort_skardu/?',
  tiktokUrl: import.meta.env.VITE_TIKTOK_URL || 'https://www.tiktok.com/@oasis_res0rt',
  currency: import.meta.env.VITE_CURRENCY || 'PKR',
};

export default SITE_CONFIG;
