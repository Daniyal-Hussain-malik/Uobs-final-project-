import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BookingStatusBadge, PaymentStatusBadge } from '../components/StatusBadge';
import ServiceInvoiceModal from '../components/ServiceInvoiceModal';
import {
  TrendingUp, DollarSign, Calendar, Users, Star,
  Shield, Check, Trash2, Plus, Sparkles, AlertCircle,
  ToggleLeft, ToggleRight, Search, Edit3, X, Eye, Tag,
  ExternalLink, BedDouble, CheckCircle, FileText,
  Upload, Image, Utensils, Compass, Layers, CreditCard, Building, Printer, RefreshCw,
  Film, Play, Video, Folder, Copy, CheckCircle2, Maximize2, Sliders, UserCheck, Briefcase
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  // Tab Data States
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [offersList, setOffersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [paymentAccountsList, setPaymentAccountsList] = useState([]);
  const [diningBookingsList, setDiningBookingsList] = useState([]);
  const [expBookingsList, setExpBookingsList] = useState([]);
  const [diningItemsList, setDiningItemsList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [galleryImagesList, setGalleryImagesList] = useState([]);
  const [galleryCatsList, setGalleryCatsList] = useState([]);
  const [selectedGalleryCatFilter, setSelectedGalleryCatFilter] = useState('all');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals States
  const [editBookingModal, setEditBookingModal] = useState(null);
  const [viewBookingModal, setViewBookingModal] = useState(null);
  const [roomModal, setRoomModal] = useState(null); // null | { mode: 'add' | 'edit', room: {} }
  const [offerModal, setOfferModal] = useState(null); // null | { mode: 'add' | 'edit', offer: {} }
  const [categoryModal, setCategoryModal] = useState(null); // null | { mode: 'add' | 'edit', cat: {} }
  const [paymentAccountModal, setPaymentAccountModal] = useState(null); // null | { mode: 'add' | 'edit', account: {} }
  const [diningItemModal, setDiningItemModal] = useState(null); // null | { mode: 'add' | 'edit', item: {} }
  const [experienceModal, setExperienceModal] = useState(null); // null | { mode: 'add' | 'edit', exp: {} }
  const [galleryCatModal, setGalleryCatModal] = useState(null); // null | { mode: 'add' | 'edit', cat: {} }
  const [galleryImageModal, setGalleryImageModal] = useState(null); // null | { mode: 'add' | 'edit', image: {}, file: null, preview: '' }
  const [replaceImageModal, setReplaceImageModal] = useState(null); // null | { image: {}, file: null, preview: '', url: '' }
  const [uploadingGalleryItem, setUploadingGalleryItem] = useState(false);
  const [serviceInvoiceModalData, setServiceInvoiceModalData] = useState(null);

  // Media Library States
  const [mediaLibraryList, setMediaLibraryList] = useState([]);
  const [loadingMediaLib, setLoadingMediaLib] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [mediaFolderFilter, setMediaFolderFilter] = useState('all');
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [uploadMediaModalOpen, setUploadMediaModalOpen] = useState(false);
  const [uploadMediaTargetFolder, setUploadMediaTargetFolder] = useState('rooms');
  const [uploadMediaFiles, setUploadMediaFiles] = useState([]);
  const [uploadingMediaLibFiles, setUploadingMediaLibFiles] = useState(false);
  const [mediaPreviewModal, setMediaPreviewModal] = useState(null);
  const [addToGalleryModal, setAddToGalleryModal] = useState(null);

  // Hero Section Settings States
  const [heroSettings, setHeroSettings] = useState({
    hero_media_type: 'image',
    hero_image_url: '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG',
    hero_video_url: '/uploads/rooms/fbac89b9f17e4ef5939dde3f37a7110d.MOV',
    hero_badge: 'Katpana Cold Desert, Skardu • 2,228M',
    hero_title: 'Experience Nature in Luxury',
    hero_subtitle: 'Katpana Cold Desert, Skardu — Where the serene Karakoram peaks meet unparalleled Balti warmth and modern five-star comfort.',
    hero_cta_text: 'Explore Luxury Stays',
    hero_cta_link: '/rooms',
    hero_video_button_text: 'Watch Resort Tour',
  });
  const [savingHeroSettings, setSavingHeroSettings] = useState(false);
  const [selectHeroMediaPicker, setSelectHeroMediaPicker] = useState(null);

  // Team Management States
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamModal, setTeamModal] = useState(null);
  const [savingTeamMember, setSavingTeamMember] = useState(false);
  const [mediaPickerForTeam, setMediaPickerForTeam] = useState(false);
  const [mediaPickerForGallery, setMediaPickerForGallery] = useState(false);
  const [mediaPickerForRoomFeatured, setMediaPickerForRoomFeatured] = useState(false);
  const [mediaPickerForRoomGallery, setMediaPickerForRoomGallery] = useState(false);

  // Uploading state
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [uploadingDiningImg, setUploadingDiningImg] = useState(false);
  const [uploadingExpImg, setUploadingExpImg] = useState(false);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success) setUsersList(res.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadBookings = async () => {
    try {
      const res = await api.get('/admin/bookings');
      if (res.success) setBookingsList(res.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await api.get('/admin/rooms');
      if (res.success) setRoomsList(res.rooms || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.success) setCategoriesList(res.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPaymentAccounts = async () => {
    try {
      const res = await api.get('/admin/payment-accounts');
      if (res.success) setPaymentAccountsList(res.accounts || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDiningBookings = async () => {
    try {
      const res = await api.get('/admin/service-bookings?type=dining');
      if (res.success) setDiningBookingsList(res.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadExpBookings = async () => {
    try {
      const res = await api.get('/admin/service-bookings?type=experience');
      if (res.success) setExpBookingsList(res.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOffers = async () => {
    try {
      const res = await api.get('/admin/cms');
      if (res.success) setOffersList(res.data?.offers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      if (res.success) setReviewsList(res.reviews || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDiningItems = async () => {
    try {
      const res = await api.get('/admin/dining-items');
      if (res.success) setDiningItemsList(res.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadExperiences = async () => {
    try {
      const res = await api.get('/admin/experiences');
      if (res.success) setExperiencesList(res.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGalleryImages = async () => {
    try {
      const res = await api.get('/admin/gallery');
      if (res.success) setGalleryImagesList(res.images || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadGalleryCats = async () => {
    try {
      const res = await api.get('/admin/gallery-categories');
      if (res.success) setGalleryCatsList(res.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMediaLibrary = async () => {
    setLoadingMediaLib(true);
    try {
      const res = await api.get('/admin/media-library');
      if (res.success) {
        setMediaLibraryList(res.media || []);
      }
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLoadingMediaLib(false);
    }
  };

  const loadHeroSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.success && res.settings) {
        setHeroSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Failed to load hero settings:', err);
    }
  };

  const loadTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const res = await api.get('/admin/team');
      if (res.success) {
        setTeamMembersList(res.team || []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCategories();
    loadHeroSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'bookings') loadBookings();
    if (activeTab === 'rooms') { loadRooms(); loadCategories(); }
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'gallery_mgmt') { loadGalleryImages(); loadGalleryCats(); }
    if (activeTab === 'media_library') { loadMediaLibrary(); loadGalleryCats(); }
    if (activeTab === 'hero_settings') { loadHeroSettings(); loadMediaLibrary(); }
    if (activeTab === 'team_mgmt') { loadTeamMembers(); loadMediaLibrary(); }
    if (activeTab === 'payment_accounts') loadPaymentAccounts();
    if (activeTab === 'dining_items') loadDiningItems();
    if (activeTab === 'dining_bookings') loadDiningBookings();
    if (activeTab === 'experiences_mgmt') loadExperiences();
    if (activeTab === 'exp_bookings') loadExpBookings();
    if (activeTab === 'offers') loadOffers();
    if (activeTab === 'reviews') loadReviews();
  }, [activeTab]);

  // ================= BOOKING ACTIONS =================
  const handleUpdateBookingStatus = async (bookingId, booking_status, payment_status = null) => {
    try {
      const res = await api.post(`/admin/bookings/${bookingId}/status`, {
        booking_status,
        payment_status,
      });
      if (res.success) {
        triggerToast(res.message);
        loadBookings();
        loadDashboard();
      }
    } catch (e) {
      triggerToast(e.message || 'Failed to update booking status.');
    }
  };

  const handleSaveBookingEdit = async (e) => {
    e.preventDefault();
    if (!editBookingModal) return;
    try {
      const res = await api.put(`/admin/bookings/${editBookingModal.id}`, editBookingModal);
      if (res.success) {
        triggerToast(res.message);
        setEditBookingModal(null);
        loadBookings();
        loadDashboard();
      }
    } catch (e) {
      triggerToast(e.message || 'Failed to edit reservation.');
    }
  };

  // ================= ROOM CRUD =================
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomModal) return;
    const { mode, room } = roomModal;

    const payload = {
      ...room,
      base_price: parseFloat(room.base_price || 0),
      capacity_adults: parseInt(room.capacity_adults || 2, 10),
      capacity_children: parseInt(room.capacity_children || 0, 10),
      room_size_sqm: parseInt(room.room_size_sqm || 40, 10),
      amenities: typeof room.amenities === 'string'
        ? room.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : room.amenities,
      images: typeof room.images === 'string'
        ? room.images.split(',').map(s => s.trim()).filter(Boolean)
        : room.images,
    };

    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/rooms', payload);
      } else {
        res = await api.put(`/admin/rooms/${room.id}`, payload);
      }

      if (res.success) {
        triggerToast(res.message);
        setRoomModal(null);
        loadRooms();
        loadDashboard();
      }
    } catch (e) {
      triggerToast(e.message || 'Failed to save room.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? Existing bookings may be affected.')) return;
    try {
      const res = await api.delete(`/admin/rooms/${roomId}`);
      if (res.success) {
        triggerToast(res.message);
        loadRooms();
        loadDashboard();
      }
    } catch (e) {
      triggerToast(e.message);
    }
  };

  const handleToggleRoomActive = async (roomId) => {
    try {
      const res = await api.post(`/admin/rooms/${roomId}/toggle`);
      if (res.success) {
        triggerToast('Room status toggled.');
        loadRooms();
      }
    } catch (e) {
      triggerToast(e.message);
    }
  };

  // ================= OFFERS CRUD =================
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    if (!offerModal) return;
    const { mode, offer } = offerModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/cms/offers', offer);
      } else {
        res = await api.put(`/admin/cms/offers/${offer.id}`, offer);
      }
      if (res.success) {
        triggerToast(res.message);
        setOfferModal(null);
        loadOffers();
      }
    } catch (e) {
      triggerToast(e.message || 'Failed to save offer.');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this promo offer?')) return;
    try {
      const res = await api.delete(`/admin/cms/offers/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadOffers();
      }
    } catch (e) {
      triggerToast(e.message);
    }
  };

  // ================= REVIEWS MODERATION =================
  const handleReviewApproval = async (id, approveState) => {
    try {
      const res = await api.post(`/admin/reviews/${id}/approve`, { is_approved: approveState });
      if (res.success) {
        triggerToast(res.message);
        loadReviews();
      }
    } catch (e) {
      triggerToast(e.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await api.delete(`/admin/reviews/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadReviews();
      }
    } catch (e) {
      triggerToast(e.message);
    }
  };

  // ================= ROOM MEDIA UPLOADS =================
  const handleUploadFeaturedImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !roomModal) return;
    setUploadingFeatured(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await api.post('/admin/upload-media', fd);
      if (res.success && res.url) {
        setRoomModal({
          ...roomModal,
          room: { ...roomModal.room, featured_image: res.url },
        });
        triggerToast('Featured image uploaded successfully.');
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to upload featured image.');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleUploadGalleryImages = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !roomModal) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
      const res = await api.post('/admin/upload-media', fd);
      if (res.success && res.urls) {
        const existing = Array.isArray(roomModal.room.images)
          ? roomModal.room.images
          : typeof roomModal.room.images === 'string'
          ? roomModal.room.images.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        setRoomModal({
          ...roomModal,
          room: { ...roomModal.room, images: [...existing, ...res.urls] },
        });
        triggerToast(`${res.urls.length} gallery image(s) uploaded.`);
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to upload gallery images.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim() || !roomModal) return;
    const existing = Array.isArray(roomModal.room.images)
      ? roomModal.room.images
      : typeof roomModal.room.images === 'string'
      ? roomModal.room.images.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    setRoomModal({
      ...roomModal,
      room: { ...roomModal.room, images: [...existing, galleryUrlInput.trim()] },
    });
    setGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    if (!roomModal) return;
    const existing = Array.isArray(roomModal.room.images)
      ? roomModal.room.images
      : typeof roomModal.room.images === 'string'
      ? roomModal.room.images.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    setRoomModal({
      ...roomModal,
      room: { ...roomModal.room, images: existing.filter((_, i) => i !== indexToRemove) },
    });
  };

  // ================= CATEGORIES CRUD =================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryModal) return;
    const { mode, cat } = categoryModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/categories', cat);
      } else {
        res = await api.put(`/admin/categories/${cat.id}`, cat);
      }
      if (res.success) {
        triggerToast(res.message);
        setCategoryModal(null);
        loadCategories();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this room category?')) return;
    try {
      const res = await api.delete(`/admin/categories/${catId}`);
      if (res.success) {
        triggerToast(res.message);
        loadCategories();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  // ================= PAYMENT ACCOUNTS CRUD =================
  const handleSavePaymentAccount = async (e) => {
    e.preventDefault();
    if (!paymentAccountModal) return;
    const { mode, account } = paymentAccountModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/payment-accounts', account);
      } else {
        res = await api.put(`/admin/payment-accounts/${account.id}`, account);
      }
      if (res.success) {
        triggerToast(res.message);
        setPaymentAccountModal(null);
        loadPaymentAccounts();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save payment account.');
    }
  };

  const handleDeletePaymentAccount = async (id) => {
    if (!window.confirm('Delete this payment account?')) return;
    try {
      const res = await api.delete(`/admin/payment-accounts/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadPaymentAccounts();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleTogglePaymentAccount = async (id) => {
    try {
      const res = await api.post(`/admin/payment-accounts/${id}/toggle`);
      if (res.success) {
        triggerToast(res.message);
        loadPaymentAccounts();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  // ================= SERVICE BOOKINGS HANDLERS =================
  const handleUpdateServiceBookingStatus = async (id, status, type = 'dining') => {
    try {
      const res = await api.post(`/admin/service-bookings/${id}/status`, { booking_status: status });
      if (res.success) {
        triggerToast(res.message);
        if (type === 'dining') loadDiningBookings();
        else loadExpBookings();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleUpdateServicePaymentStatus = async (id, payment_status, type = 'dining') => {
    try {
      const res = await api.post(`/admin/service-bookings/${id}/payment`, { payment_status });
      if (res.success) {
        triggerToast(res.message);
        if (type === 'dining') loadDiningBookings();
        else loadExpBookings();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleDeleteServiceBooking = async (id, type = 'dining') => {
    if (!window.confirm('Delete this reservation record?')) return;
    try {
      const res = await api.delete(`/admin/service-bookings/${id}`);
      if (res.success) {
        triggerToast(res.message);
        if (type === 'dining') loadDiningBookings();
        else loadExpBookings();
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  // ================= DINING ITEMS (DEALS & MENUS) CRUD =================
  const handleSaveDiningItem = async (e) => {
    e.preventDefault();
    if (!diningItemModal) return;
    const { mode, item } = diningItemModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/dining-items', item);
      } else {
        res = await api.put(`/admin/dining-items/${item.id}`, item);
      }
      if (res.success) {
        triggerToast(res.message);
        setDiningItemModal(null);
        loadDiningItems();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save dining item.');
    }
  };

  const handleDeleteDiningItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dining package/menu?')) return;
    try {
      const res = await api.delete(`/admin/dining-items/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadDiningItems();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete dining item.');
    }
  };

  const handleToggleDiningItem = async (item) => {
    try {
      const res = await api.put(`/admin/dining-items/${item.id}`, {
        ...item,
        is_active: item.is_active ? 0 : 1,
      });
      if (res.success) {
        triggerToast('Dining item status updated.');
        loadDiningItems();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to toggle status.');
    }
  };

  const handleUploadDiningImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDiningImg(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await api.post('/admin/upload-media', fd);
      if (res.success && res.url) {
        setDiningItemModal((prev) => ({
          ...prev,
          item: { ...prev.item, image_url: res.url },
        }));
        triggerToast('Image uploaded successfully.');
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to upload image.');
    } finally {
      setUploadingDiningImg(false);
    }
  };

  // ================= RESORT EXPERIENCES CRUD =================
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!experienceModal) return;
    const { mode, exp } = experienceModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/experiences', exp);
      } else {
        res = await api.put(`/admin/experiences/${exp.id}`, exp);
      }
      if (res.success) {
        triggerToast(res.message);
        setExperienceModal(null);
        loadExperiences();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save experience.');
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    try {
      const res = await api.delete(`/admin/experiences/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadExperiences();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete experience.');
    }
  };

  const handleToggleExperience = async (exp) => {
    try {
      const res = await api.put(`/admin/experiences/${exp.id}`, {
        ...exp,
        is_active: exp.is_active ? 0 : 1,
      });
      if (res.success) {
        triggerToast('Experience status updated.');
        loadExperiences();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to toggle status.');
    }
  };

  const handleUploadExperienceImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingExpImg(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await api.post('/admin/upload-media', fd);
      if (res.success && res.url) {
        setExperienceModal((prev) => ({
          ...prev,
          exp: { ...prev.exp, image_url: res.url },
        }));
        triggerToast('Image uploaded successfully.');
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to upload image.');
    } finally {
      setUploadingExpImg(false);
    }
  };

  // ================= GALLERY & CATEGORIES CRUD =================
  const handleSaveGalleryCategory = async (e) => {
    e.preventDefault();
    if (!galleryCatModal) return;
    const { mode, cat } = galleryCatModal;
    try {
      let res;
      if (mode === 'add') {
        res = await api.post('/admin/gallery-categories', cat);
      } else {
        res = await api.put(`/admin/gallery-categories/${cat.id}`, cat);
      }
      if (res.success) {
        triggerToast(res.message);
        setGalleryCatModal(null);
        loadGalleryCats();
        loadGalleryImages();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save gallery category.');
    }
  };

  const handleDeleteGalleryCategory = async (id) => {
    if (!window.confirm('Delete this gallery category? Images in this category will be reassigned to General.')) return;
    try {
      const res = await api.delete(`/admin/gallery-categories/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadGalleryCats();
        loadGalleryImages();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete gallery category.');
    }
  };

  const handleSaveGalleryImage = async (e) => {
    e.preventDefault();
    if (!galleryImageModal) return;
    const { mode, image, file } = galleryImageModal;
    setUploadingGalleryItem(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      if (image.image_url) fd.append('image_url', image.image_url);
      fd.append('title', image.title || 'Resort Photography');
      fd.append('category', image.category || (galleryCatsList[0]?.name || 'General'));
      fd.append('is_featured', image.is_featured ? 1 : 0);
      fd.append('sort_order', image.sort_order || 0);

      let res;
      if (mode === 'add') {
        res = await api.post('/admin/gallery', fd);
      } else {
        res = await api.put(`/admin/gallery/${image.id}`, fd);
      }
      if (res.success) {
        triggerToast(res.message);
        setGalleryImageModal(null);
        loadGalleryImages();
        loadGalleryCats();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save gallery photo.');
    } finally {
      setUploadingGalleryItem(false);
    }
  };

  const handleExecuteReplaceImage = async (e) => {
    e.preventDefault();
    if (!replaceImageModal) return;
    const { image, file, url } = replaceImageModal;
    if (!file && !url) {
      triggerToast('Please select a replacement image file or enter a valid URL.');
      return;
    }
    setUploadingGalleryItem(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      if (url) fd.append('image_url', url);

      const res = await api.post(`/admin/gallery/${image.id}/replace-image`, fd);
      if (res.success) {
        triggerToast('Image replaced successfully.');
        setReplaceImageModal(null);
        loadGalleryImages();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to replace image.');
    } finally {
      setUploadingGalleryItem(false);
    }
  };

  const handleDeleteGalleryImage = async (imgId) => {
    if (!window.confirm('Are you sure you want to remove this photo from the gallery?')) return;
    try {
      const res = await api.delete(`/admin/gallery/${imgId}`);
      if (res.success) {
        triggerToast(res.message);
        loadGalleryImages();
        loadGalleryCats();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete gallery photo.');
    }
  };

  // ================= MEDIA LIBRARY HANDLERS =================
  const handleUploadMediaLibFiles = async (e) => {
    e.preventDefault();
    if (!uploadMediaFiles || uploadMediaFiles.length === 0) {
      triggerToast('Please select at least one media file to upload.');
      return;
    }
    setUploadingMediaLibFiles(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < uploadMediaFiles.length; i++) {
        fd.append('files', uploadMediaFiles[i]);
      }
      fd.append('folder', uploadMediaTargetFolder);
      const res = await api.post('/admin/media-library/upload', fd);
      if (res.success) {
        triggerToast(res.message);
        setUploadMediaModalOpen(false);
        setUploadMediaFiles([]);
        loadMediaLibrary();
      }
    } catch (err) {
      triggerToast(err.message || 'Media upload failed.');
    } finally {
      setUploadingMediaLibFiles(false);
    }
  };

  const handleSetMediaAsHero = async (mediaItem) => {
    try {
      const media_type = mediaItem.type === 'video' ? 'video' : 'image';
      const res = await api.post('/admin/media-library/set-hero', {
        media_url: mediaItem.url,
        media_type,
      });
      if (res.success) {
        triggerToast(res.message);
        loadMediaLibrary();
        loadHeroSettings();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to set hero media.');
    }
  };

  const handleConfirmAddToGallery = async (e) => {
    e.preventDefault();
    if (!addToGalleryModal) return;
    try {
      const res = await api.post('/admin/media-library/add-to-gallery', addToGalleryModal);
      if (res.success) {
        triggerToast(res.message);
        setAddToGalleryModal(null);
        loadMediaLibrary();
        loadGalleryImages();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to add media to gallery.');
    }
  };

  const handleDeleteMediaFile = async (mediaItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${mediaItem.name}"? This file will be removed from disk.`)) return;
    try {
      const res = await api.delete('/admin/media-library/file', {
        file_path: mediaItem.url,
      });
      if (res.success) {
        triggerToast(res.message);
        loadMediaLibrary();
        loadGalleryImages();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete file.');
    }
  };

  // ================= HERO SETTINGS HANDLERS =================
  const handleSaveHeroSettings = async (e) => {
    e.preventDefault();
    setSavingHeroSettings(true);
    try {
      const res = await api.put('/admin/settings', heroSettings);
      if (res.success) {
        triggerToast(res.message);
        loadHeroSettings();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save hero settings.');
    } finally {
      setSavingHeroSettings(false);
    }
  };

  // ================= TEAM MANAGEMENT HANDLERS =================
  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!teamModal) return;
    setSavingTeamMember(true);
    try {
      const fd = new FormData();
      fd.append('name', teamModal.member.name || '');
      fd.append('role', teamModal.member.role || '');
      fd.append('bio', teamModal.member.bio || '');
      fd.append('sort_order', teamModal.member.sort_order || 0);
      if (teamModal.file) {
        fd.append('image', teamModal.file);
      } else if (teamModal.member.image_url) {
        fd.append('image_url', teamModal.member.image_url);
      }
      let res;
      if (teamModal.mode === 'add') {
        res = await api.post('/admin/team', fd);
      } else {
        res = await api.put(`/admin/team/${teamModal.member.id}`, fd);
      }
      if (res.success) {
        triggerToast(res.message);
        setTeamModal(null);
        loadTeamMembers();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save team member.');
    } finally {
      setSavingTeamMember(false);
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (!window.confirm('Delete this team member? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/team/${id}`);
      if (res.success) {
        triggerToast(res.message);
        loadTeamMembers();
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to delete team member.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C332C] flex items-center justify-center text-[#A8AD94]">
        Loading executive admin workspace...
      </div>
    );
  }

  const m = data?.metrics || {};

  return (
    <div className="min-h-screen bg-[#2C332C] text-[#EAEBE8] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#232A23] border border-[#787C68] text-[#EAEBE8] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#A8AD94] uppercase tracking-widest font-semibold">
                Resort Executive Console
              </span>
              <span className="text-[10px] bg-[#E3B94E]/20 text-[#E3B94E] px-2 py-0.5 rounded-full font-mono font-bold">
                ADMIN
              </span>
            </div>
            <h1 className="font-script text-4xl sm:text-5xl text-[#EAEBE8] mt-1">
              General Manager Dashboard
            </h1>
            <p className="text-xs text-[#A8AD94]">Central control for reservations, guest directory, rooms &amp; suites, promo offers, and verified reviews.</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#232A23] border border-white/10 p-1.5 rounded-2xl">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: 'Room Stays' },
              { id: 'rooms', label: 'Rooms & Suites' },
              { id: 'media_library', label: 'Media Files' },
              { id: 'hero_settings', label: 'Hero Section' },
              { id: 'team_mgmt', label: 'Resort Team' },
              { id: 'gallery_mgmt', label: 'Gallery & Media' },
              { id: 'categories', label: 'Categories' },
              { id: 'payment_accounts', label: 'Payment Accounts' },
              { id: 'dining_items', label: 'Dining Deals & Menus' },
              { id: 'dining_bookings', label: 'Dining Bookings' },
              { id: 'experiences_mgmt', label: 'Resort Experiences' },
              { id: 'exp_bookings', label: 'Experiences Bookings' },
              { id: 'users', label: 'Guests' },
              { id: 'offers', label: 'Offers' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab.id
                    ? 'bg-[#787C68] text-[#232A23] shadow-md font-bold'
                    : 'text-[#A8AD94] hover:text-[#EAEBE8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW METRICS ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#232A23] border border-white/10 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[11px] uppercase tracking-wider text-[#A8AD94] font-medium">Total Revenue</span>
                <p className="font-display text-3xl font-bold text-[#E3B94E]">
                  PKR {parseInt(m.total_revenue || 0).toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Verified settlements
                </span>
              </div>

              <div className="bg-[#232A23] border border-white/10 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[11px] uppercase tracking-wider text-[#A8AD94] font-medium">Total Bookings</span>
                <p className="font-display text-3xl font-bold text-[#EAEBE8]">{m.total_bookings}</p>
                <span className="text-[10px] text-[#A8AD94]">{m.pending_payments} pending payment verifications</span>
              </div>

              <div className="bg-[#232A23] border border-white/10 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[11px] uppercase tracking-wider text-[#A8AD94] font-medium">Active Rooms</span>
                <p className="font-display text-3xl font-bold text-[#787C68]">{m.active_rooms}</p>
                <span className="text-[10px] text-[#A8AD94]">Operational in Katpana Desert</span>
              </div>

              <div className="bg-[#232A23] border border-white/10 p-6 rounded-3xl space-y-2 shadow-xl">
                <span className="text-[11px] uppercase tracking-wider text-[#A8AD94] font-medium">Registered Guests</span>
                <p className="font-display text-3xl font-bold text-[#EAEBE8]">{m.total_guests}</p>
                <span className="text-[10px] text-[#A8AD94]">{m.pending_reviews} pending feedback reviews</span>
              </div>
            </div>

            {/* Recent Stays */}
            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-display text-2xl font-bold text-[#EAEBE8]">Recent Reservations</h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-[#787C68] hover:text-[#EAEBE8] uppercase font-bold tracking-wider"
                >
                  View All Stays &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                      <th className="pb-3">Booking #</th>
                      <th className="pb-3">Guest Contact</th>
                      <th className="pb-3">Room</th>
                      <th className="pb-3">Stay Dates</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(data?.recentBookings || []).map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition">
                        <td className="py-3 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                        <td className="py-3">
                          <p className="font-semibold text-[#EAEBE8]">{b.guest_name}</p>
                          <p className="text-[11px] text-[#A8AD94]">{b.guest_phone}</p>
                        </td>
                        <td className="py-3 text-[#EAEBE8]">{b.room_title}</td>
                        <td className="py-3 text-[#A8AD94]">{b.check_in} &rarr; {b.check_out}</td>
                        <td className="py-3 font-bold text-[#EAEBE8]">PKR {parseInt(b.final_total).toLocaleString()}</td>
                        <td className="py-3"><BookingStatusBadge status={b.booking_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: BOOKINGS MODERATION & EDIT ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                Reservation Directory &amp; Moderation
              </h2>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#A8AD94] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search guest, email, phone..."
                    className="w-full bg-[#232A23] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#232A23] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#EAEBE8] focus:border-[#787C68] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Booking #</th>
                    <th className="pb-3">Guest Details</th>
                    <th className="pb-3">Room Details</th>
                    <th className="pb-3">Dates &amp; Guests</th>
                    <th className="pb-3">Settlement</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookingsList
                    .filter((b) => {
                      if (statusFilter !== 'all' && b.booking_status !== statusFilter) return false;
                      if (searchTerm) {
                        const q = searchTerm.toLowerCase();
                        return (
                          b.booking_number?.toLowerCase().includes(q) ||
                          b.guest_name?.toLowerCase().includes(q) ||
                          b.guest_email?.toLowerCase().includes(q) ||
                          b.guest_phone?.includes(q)
                        );
                      }
                      return true;
                    })
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition">
                        <td className="py-3 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                        <td className="py-3">
                          <p className="font-semibold text-[#EAEBE8]">{b.guest_name}</p>
                          <p className="text-[11px] text-[#A8AD94]">{b.guest_email}</p>
                          <p className="text-[11px] text-[#787C68]">{b.guest_phone}</p>
                        </td>
                        <td className="py-3">
                          <p className="text-[#EAEBE8] font-medium">{b.room_title}</p>
                          <span className="text-[10px] text-[#A8AD94] uppercase">{b.room_category}</span>
                        </td>
                        <td className="py-3">
                          <p className="text-[#EAEBE8]">{b.check_in} &rarr; {b.check_out}</p>
                          <p className="text-[10px] text-[#A8AD94]">{b.total_nights} Nights • {b.adults} Adults{b.children > 0 ? `, ${b.children} Ch` : ''}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-[#E3B94E]">PKR {parseInt(b.final_total).toLocaleString()}</p>
                          <PaymentStatusBadge status={b.payment_status} method={b.payment_method} />
                        </td>
                        <td className="py-3">
                          <BookingStatusBadge status={b.booking_status} />
                        </td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* View details */}
                          <button
                            onClick={() => setViewBookingModal(b)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A8AD94] hover:text-white"
                            title="View Full Booking Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit reservation */}
                          <button
                            onClick={() => setEditBookingModal(b)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23]"
                            title="Edit Reservation Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Approve if pending */}
                          {b.booking_status === 'pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold uppercase"
                            >
                              Approve
                            </button>
                          )}

                          {/* Quick Cancel */}
                          {b.booking_status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Cancel this reservation?')) {
                                  handleUpdateBookingStatus(b.id, 'cancelled');
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                              title="Cancel Reservation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ROOMS & SUITES (FULL CRUD) ================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Residences &amp; Rooms
                </h2>
                <p className="text-xs text-[#A8AD94]">Full CRUD management for villas, suites, images, features, and rates.</p>
              </div>

              <button
                onClick={() =>
                  setRoomModal({
                    mode: 'add',
                    room: {
                      title: '',
                      category: 'Suites',
                      base_price: 35000,
                      capacity_adults: 2,
                      capacity_children: 2,
                      view_type: 'Panoramic Cold Desert & Snow Peaks View',
                      bed_type: '1 King Bed',
                      room_size_sqm: 55,
                      description: '',
                      amenities: 'Radiant Floor Heating, High-speed Wifi, Hot Spring Bath, Saffron Chai Service',
                      featured_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
                      images: '',
                      housekeeping_status: 'ready to serve',
                      is_active: 1,
                    },
                  })
                }
                className="px-4 py-2.5 bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomsList.map((r) => (
                <div key={r.id} className="bg-[#232A23] border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-[#232A23]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-[#E3B94E] border border-white/10">
                        {r.category}
                      </span>
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        r.housekeeping_status === 'ready to serve'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : r.housekeeping_status === 'cleaning'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {r.housekeeping_status}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{r.title}</h3>
                        <span className="font-bold text-[#E3B94E] text-sm">
                          PKR {parseInt(r.base_price).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8AD94] line-clamp-2">{r.description}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#A8AD94]">
                        <span className="bg-white/5 px-2 py-0.5 rounded">{r.capacity_adults} Adults</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded">{r.bed_type}</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded">{r.room_size_sqm} m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleRoomActive(r.id)}
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        r.is_active ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {r.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{r.is_active ? 'Active' : 'Inactive'}</span>
                    </button>

                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          setRoomModal({
                            mode: 'edit',
                            room: {
                              ...r,
                              amenities: Array.isArray(r.amenities) ? r.amenities.join(', ') : r.amenities,
                              images: Array.isArray(r.images) ? r.images.join(', ') : r.images,
                            },
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition text-[11px] font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(r.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: ROOM CATEGORIES (CRUD with No. of Rooms) ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Room Categories &amp; Capacities
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Manage room tiers and track how many rooms belong to each category.
                </p>
              </div>
              <button
                onClick={() => setCategoryModal({ mode: 'add', cat: { name: '', description: '', sort_order: categoriesList.length + 1 } })}
                className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Category Name</th>
                    <th className="pb-3">Slug</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Active Rooms</th>
                    <th className="pb-3">Inventory Limit</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {categoriesList.map((cat, idx) => (
                    <tr key={cat.id || idx} className="hover:bg-white/5 transition">
                      <td className="py-3.5 font-mono text-[#A8AD94]">{cat.sort_order || idx + 1}</td>
                      <td className="py-3.5 font-bold text-[#EAEBE8] flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-[#E3B94E]" />
                        <span>{cat.name}</span>
                      </td>
                      <td className="py-3.5 font-mono text-[11px] text-[#A8AD94]">{cat.slug}</td>
                      <td className="py-3.5 text-xs text-[#A8AD94] max-w-xs truncate">{cat.description || '—'}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                          <BedDouble className="w-3 h-3" />
                          <span>{cat.room_count || 0} Rooms</span>
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3B94E]/15 border border-[#E3B94E]/30 text-[#E3B94E] font-bold text-xs">
                          <Shield className="w-3 h-3" />
                          <span>{cat.total_rooms || 4} Rooms Max</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setCategoryModal({ mode: 'edit', cat: { ...cat } })}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categoriesList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-[#A8AD94]">
                        No room categories defined yet. Click "Add Category" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: GALLERY & MEDIA MANAGEMENT ================= */}
        {activeTab === 'gallery_mgmt' && (
          <div className="space-y-10">
            {/* Top Bar with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Oasis Visual Gallery &amp; Media
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Upload high-resolution photography, organize categories, replace images, and curate the public gallery.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() =>
                    setGalleryCatModal({
                      mode: 'add',
                      cat: { name: '', description: '', sort_order: galleryCatsList.length + 1 },
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAEBE8] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition border border-white/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
                <button
                  onClick={() =>
                    setGalleryImageModal({
                      mode: 'add',
                      image: {
                        title: '',
                        category: galleryCatsList[0]?.name || 'Landscape & Dunes',
                        image_url: '',
                        is_featured: 1,
                        sort_order: galleryImagesList.length + 1,
                      },
                      file: null,
                      preview: '',
                    })
                  }
                  className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: Gallery Categories Overview */}
            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#E3B94E]" />
                  <h3 className="font-display font-bold text-base text-[#EAEBE8]">
                    Gallery Categories ({galleryCatsList.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#A8AD94]">
                  Categories control filter tabs on the guest gallery page
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryCatsList.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-[#1E241E] border border-white/5 hover:border-white/20 rounded-2xl p-4 flex flex-col justify-between transition group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#EAEBE8] group-hover:text-[#E3B94E] transition">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cat.image_count || 0} Photos
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A8AD94] line-clamp-2">
                        {cat.description || 'No description provided.'}
                      </p>
                      <span className="text-[10px] font-mono text-[#A8AD94]/70 block">
                        slug: /{cat.slug} • sort: {cat.sort_order}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-white/5">
                      <button
                        onClick={() => setGalleryCatModal({ mode: 'edit', cat: { ...cat } })}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] text-[11px] font-bold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryCategory(cat.id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {galleryCatsList.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs text-[#A8AD94]">
                    No categories created yet. Click "+ Add Category" to create your first gallery section.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 2: Photo Library Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-[#E3B94E]" />
                  <h3 className="font-display font-bold text-base text-[#EAEBE8]">
                    Resort Photography Library ({galleryImagesList.length})
                  </h3>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedGalleryCatFilter('all')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                      selectedGalleryCatFilter === 'all'
                        ? 'bg-[#787C68] text-[#232A23]'
                        : 'bg-white/5 text-[#A8AD94] hover:text-[#EAEBE8]'
                    }`}
                  >
                    All ({galleryImagesList.length})
                  </button>
                  {galleryCatsList.map((c) => {
                    const count = galleryImagesList.filter((img) => img.category === c.name).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedGalleryCatFilter(c.name)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                          selectedGalleryCatFilter === c.name
                            ? 'bg-[#787C68] text-[#232A23]'
                            : 'bg-white/5 text-[#A8AD94] hover:text-[#EAEBE8]'
                        }`}
                      >
                        {c.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {galleryImagesList
                  .filter((img) => selectedGalleryCatFilter === 'all' || img.category === selectedGalleryCatFilter)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="bg-[#232A23] border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition"
                    >
                      {/* Image Preview Container */}
                      <div className="relative aspect-video sm:aspect-square bg-black/40 overflow-hidden">
                        <img
                          src={img.image_url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[#E3B94E] border border-white/10 truncate max-w-[150px]">
                            {img.category}
                          </span>
                          {img.is_featured ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> Featured
                            </span>
                          ) : null}
                        </div>

                        {/* Image Title on Bottom Overlay */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                          <h4 className="text-xs font-bold text-white drop-shadow truncate">
                            {img.title}
                          </h4>
                          <span className="text-[10px] text-[#A8AD94] drop-shadow font-mono block">
                            Sort: {img.sort_order}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Bar */}
                      <div className="p-3 bg-[#1E241E] border-t border-white/5 flex items-center justify-between gap-1 text-xs">
                        {/* Replace Button */}
                        <button
                          onClick={() =>
                            setReplaceImageModal({
                              image: { ...img },
                              file: null,
                              preview: '',
                              url: '',
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#E3B94E]/15 text-[#E3B94E] border border-[#E3B94E]/20 hover:border-[#E3B94E]/40 font-bold text-[11px] flex items-center gap-1 transition"
                          title="Upload new image to replace this photo"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Replace</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setGalleryImageModal({
                                mode: 'edit',
                                image: { ...img },
                                file: null,
                                preview: '',
                              })
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] font-bold text-[11px] transition"
                            title="Edit Title & Category"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {galleryImagesList.filter(
                  (img) => selectedGalleryCatFilter === 'all' || img.category === selectedGalleryCatFilter
                ).length === 0 && (
                  <div className="col-span-full text-center py-16 bg-[#232A23] border border-white/10 rounded-3xl space-y-3">
                    <Image className="w-10 h-10 text-[#A8AD94] mx-auto opacity-40" />
                    <p className="text-xs text-[#A8AD94]">
                      No photos found in this category. Click "+ Upload Photo" to add images.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: MEDIA FILES & REELS (IMAGES & VIDEOS) ================= */}
        {activeTab === 'media_library' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header & Main Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#E3B94E]" />
                  <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                    Resort Media Files &amp; Storage
                  </h2>
                </div>
                <p className="text-xs text-[#A8AD94] mt-0.5">
                  Browse and organize all images and videos from <code>backend/uploads/rooms</code> and all resort media directories.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={loadMediaLibrary}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94] hover:text-[#EAEBE8] text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
                  title="Refresh media files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMediaLib ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMediaTargetFolder('rooms');
                    setUploadMediaFiles([]);
                    setUploadMediaModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Images &amp; Videos</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#232A23] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filters */}
                <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider font-bold mr-1">Type:</span>
                {[
                  { id: 'all', label: `All (${mediaLibraryList.length})` },
                  { id: 'image', label: `Images (${mediaLibraryList.filter(f => f.type === 'image').length})` },
                  { id: 'video', label: `Videos (${mediaLibraryList.filter(f => f.type === 'video').length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMediaTypeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      mediaTypeFilter === f.id
                        ? 'bg-[#E3B94E] text-[#232A23] font-bold shadow-md'
                        : 'bg-white/5 text-[#A8AD94] hover:text-[#EAEBE8]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider font-bold ml-3 mr-1">Folder:</span>
                {['all', 'rooms', 'gallery', 'videos', 'team'].map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setMediaFolderFilter(folder)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                      mediaFolderFilter === folder
                        ? 'bg-[#787C68] text-[#232A23] font-bold'
                        : 'bg-white/5 text-[#A8AD94] hover:text-[#EAEBE8]'
                    }`}
                  >
                    {folder === 'all' ? 'All Folders' : folder}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-[#A8AD94] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search filename..."
                  value={mediaSearchTerm}
                  onChange={(e) => setMediaSearchTerm(e.target.value)}
                  className="w-full bg-[#1E241E] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                />
              </div>
            </div>

            {/* Media Grid */}
            {loadingMediaLib ? (
              <div className="text-center py-24 text-[#A8AD94] space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#E3B94E]" />
                <p className="text-xs">Scanning uploads directory for images and 4K video clips...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaLibraryList
                  .filter((item) => {
                    if (mediaTypeFilter !== 'all' && item.type !== mediaTypeFilter) return false;
                    if (mediaFolderFilter !== 'all' && item.folder !== mediaFolderFilter) return false;
                    if (mediaSearchTerm && !item.name.toLowerCase().includes(mediaSearchTerm.toLowerCase())) return false;
                    return true;
                  })
                  .map((item) => (
                    <div
                      key={item.url}
                      className="group bg-[#232A23] border border-white/10 hover:border-[#787C68] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200"
                    >
                      {/* Thumbnail or Video Preview */}
                      <div className="relative aspect-square bg-black/60 overflow-hidden flex items-center justify-center">
                        {item.type === 'video' ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-[#151915]">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                            <div className="w-10 h-10 rounded-full bg-black/60 text-[#E3B94E] flex items-center justify-center border border-white/20 shadow-lg pointer-events-none group-hover:scale-110 transition">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                            item.type === 'video'
                              ? 'bg-rose-500/80 text-white border border-rose-400/40 backdrop-blur-sm'
                              : 'bg-black/70 text-[#EAEBE8] border border-white/20 backdrop-blur-sm'
                          }`}>
                            {item.extension || item.type}
                          </span>
                          {item.is_hero_image && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#E3B94E] text-[#232A23] shadow-md">
                              HERO IMAGE
                            </span>
                          )}
                          {item.is_hero_video && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#E3B94E] text-[#232A23] shadow-md">
                              HERO VIDEO
                            </span>
                          )}
                          {item.in_gallery && (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/80 text-white shadow-md">
                              IN GALLERY
                            </span>
                          )}
                        </div>

                        {/* Size badge */}
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/70 text-[#A8AD94] border border-white/10 backdrop-blur-sm">
                          {item.size}
                        </span>

                        {/* Quick View Button on Hover */}
                        <button
                          type="button"
                          onClick={() => setMediaPreviewModal(item)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white"
                          title="Preview full size"
                        >
                          <Maximize2 className="w-6 h-6 drop-shadow-lg" />
                        </button>
                      </div>

                      {/* Card Info & Actions */}
                      <div className="p-3 space-y-2.5">
                        <div>
                          <p className="text-[11px] font-semibold text-[#EAEBE8] truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#A8AD94]">
                            folder: <code className="text-[#E3B94E]">{item.folder}</code>
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                          {/* Set as Hero button */}
                          <button
                            type="button"
                            onClick={() => handleSetMediaAsHero(item)}
                            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-[#E3B94E] hover:text-[#232A23] text-[#E3B94E] text-[10px] font-bold transition flex items-center gap-1"
                            title={`Set as active Hero ${item.type === 'video' ? 'Video' : 'Image'}`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Set Hero</span>
                          </button>

                          {/* Add to Gallery button */}
                          {item.type === 'image' && !item.in_gallery && (
                            <button
                              type="button"
                              onClick={() =>
                                setAddToGalleryModal({
                                  media_url: item.url,
                                  title: item.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
                                  category: galleryCatsList[0]?.name || 'Resort Grounds',
                                  is_featured: 1,
                                  sort_order: galleryImagesList.length + 1,
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-white text-emerald-400 text-[10px] font-bold transition flex items-center gap-1"
                              title="Add this image to Resort Gallery"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Gallery</span>
                            </button>
                          )}

                          {/* Copy URL button */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.url);
                              triggerToast(`Copied ${item.url} to clipboard!`);
                            }}
                            className="p-1 rounded-lg text-[#A8AD94] hover:text-[#EAEBE8] hover:bg-white/10 transition"
                            title="Copy file URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete File button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMediaFile(item)}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Delete file permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!loadingMediaLib && mediaLibraryList.length === 0 && (
              <div className="bg-[#232A23] border border-white/10 rounded-3xl p-12 text-center space-y-4">
                <Film className="w-12 h-12 text-[#A8AD94] mx-auto opacity-40" />
                <h3 className="font-display text-xl text-[#EAEBE8]">No Media Files Found</h3>
                <p className="text-xs text-[#A8AD94] max-w-md mx-auto">
                  Click "Upload Images &amp; Videos" to upload resort photography or video footage from your mobile or computer.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: HERO & VISUAL DISPLAY SETTINGS ================= */}
        {activeTab === 'hero_settings' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E3B94E]" />
                  <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                    Hero Section &amp; Visual Backdrop
                  </h2>
                </div>
                <p className="text-xs text-[#A8AD94] mt-0.5">
                  Configure whether your website greets guests with high-resolution photography or ambient cinematic video.
                </p>
              </div>
            </div>

            {/* LIVE PREVIEW BANNER */}
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black min-h-[320px] flex flex-col justify-center items-center text-center p-8">
              {/* Backdrop preview */}
              {heroSettings.hero_media_type === 'video' && heroSettings.hero_video_url ? (
                <video
                  src={heroSettings.hero_video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={heroSettings.hero_image_url}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              ) : (
                <img
                  src={heroSettings.hero_image_url || '/uploads/rooms/dji_fly_20250820_180134_0278_1755701835508_photo.JPG'}
                  alt="Hero Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[#2C332C]/80 via-[#2C332C]/50 to-[#2C332C]" />

              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#232A23]/90 border border-white/20 text-[#A8AD94] text-[11px] font-mono uppercase tracking-widest">
                  {heroSettings.hero_badge || 'Katpana Cold Desert, Skardu • 2,228M'}
                </span>
                <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#EAEBE8] leading-tight">
                  {heroSettings.hero_title || 'Experience Nature in Luxury'}
                </h1>
                <p className="text-xs sm:text-sm text-[#EAEBE8]/80 max-w-xl mx-auto italic font-light">
                  {heroSettings.hero_subtitle || 'A secluded resort where cold desert dunes embrace Karakoram peaks.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <span className="px-5 py-2 rounded-xl bg-[#787C68] text-[#232A23] font-bold text-xs uppercase tracking-wider shadow-lg">
                    {heroSettings.hero_cta_text || 'Explore Luxury Stays'}
                  </span>
                  {heroSettings.hero_video_url && (
                    <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-semibold text-[#EAEBE8] flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current text-[#E3B94E]" />
                      <span>{heroSettings.hero_video_button_text || 'Watch Resort Tour'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM CONFIGURATOR */}
            <form onSubmit={handleSaveHeroSettings} className="bg-[#232A23] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
              {/* Media Type Switcher */}
              <div className="space-y-3">
                <label className="text-xs text-[#A8AD94] uppercase tracking-wider font-bold block">
                  Select Active Hero Backdrop Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setHeroSettings({ ...heroSettings, hero_media_type: 'image' })}
                    className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${
                      heroSettings.hero_media_type === 'image'
                        ? 'bg-[#787C68]/20 border-[#787C68] text-[#EAEBE8] shadow-lg ring-1 ring-[#787C68]'
                        : 'bg-white/5 border-white/10 text-[#A8AD94] hover:border-white/25'
                    }`}
                  >
                    <Image className={`w-8 h-8 ${heroSettings.hero_media_type === 'image' ? 'text-[#E3B94E]' : 'text-[#A8AD94]'}`} />
                    <div>
                      <h4 className="font-display font-bold text-base text-[#EAEBE8]">High-Res Hero Photography</h4>
                      <p className="text-xs text-[#A8AD94] mt-1 leading-relaxed">
                        Features the high-altitude Katpana drone shot with smooth ambient Ken Burns motion.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroSettings({ ...heroSettings, hero_media_type: 'video' })}
                    className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${
                      heroSettings.hero_media_type === 'video'
                        ? 'bg-[#787C68]/20 border-[#787C68] text-[#EAEBE8] shadow-lg ring-1 ring-[#787C68]'
                        : 'bg-white/5 border-white/10 text-[#A8AD94] hover:border-white/25'
                    }`}
                  >
                    <Film className={`w-8 h-8 ${heroSettings.hero_media_type === 'video' ? 'text-[#E3B94E]' : 'text-[#A8AD94]'}`} />
                    <div>
                      <h4 className="font-display font-bold text-base text-[#EAEBE8]">Ambient Hero Video Reel</h4>
                      <p className="text-xs text-[#A8AD94] mt-1 leading-relaxed">
                        Loops cinematic 4K video reel continuously behind the reservation bar.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Media URLs & Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                {/* Hero Image Setting */}
                <div className="space-y-3 bg-[#1E241E] p-5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#EAEBE8] font-bold flex items-center gap-2">
                      <Image className="w-4 h-4 text-[#E3B94E]" />
                      <span>Hero Photo</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectHeroMediaPicker('hero_image_url')}
                      className="px-3 py-1 rounded-lg bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] font-bold text-[11px] transition"
                    >
                      Pick from Media Files
                    </button>
                  </div>

                  {heroSettings.hero_image_url && (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black/50 border border-white/15">
                      <img src={heroSettings.hero_image_url} alt="Current hero" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <input
                    type="text"
                    value={heroSettings.hero_image_url || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_image_url: e.target.value })}
                    placeholder="/uploads/rooms/... or image URL"
                    className="w-full bg-[#151915] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#EAEBE8] font-mono focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                {/* Hero Video Setting */}
                <div className="space-y-3 bg-[#1E241E] p-5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#EAEBE8] font-bold flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#E3B94E]" />
                      <span>Hero Video Reel (MP4 or MOV)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectHeroMediaPicker('hero_video_url')}
                      className="px-3 py-1 rounded-lg bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] font-bold text-[11px] transition"
                    >
                      Pick from Media Files
                    </button>
                  </div>

                  {heroSettings.hero_video_url ? (
                    <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black/50 border border-white/15">
                      <video src={heroSettings.hero_video_url} controls className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] rounded-xl bg-black/30 border border-dashed border-white/10 flex items-center justify-center text-xs text-[#A8AD94]">
                      No video set yet
                    </div>
                  )}

                  <input
                    type="text"
                    value={heroSettings.hero_video_url || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_video_url: e.target.value })}
                    placeholder="/uploads/rooms/fbac89b9f17e4ef5939dde3f37a7110d.MOV or video URL"
                    className="w-full bg-[#151915] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#EAEBE8] font-mono focus:border-[#787C68] focus:outline-none"
                  />
                </div>
              </div>

              {/* Text & Content Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/10 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Badge / Altitude Sub-label
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero_badge || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_badge: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Hero Main Headline (H1)
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero_title || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_title: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Hero Subtitle / Description
                  </label>
                  <textarea
                    rows="2"
                    value={heroSettings.hero_subtitle || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_subtitle: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero_cta_text || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_cta_text: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Video Tour Button Text
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero_video_button_text || ''}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hero_video_button_text: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={savingHeroSettings}
                  className="px-7 py-3 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{savingHeroSettings ? 'Saving Settings...' : 'Save & Publish Hero Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB: RESORT TEAM & LEADERSHIP ================= */}
        {activeTab === 'team_mgmt' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E3B94E]" />
                  <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                    Resort Team &amp; Leadership
                  </h2>
                </div>
                <p className="text-xs text-[#A8AD94] mt-0.5">
                  Update host photos, names, titles, and bios displayed publicly on the About Us page.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTeamModal({
                    mode: 'add',
                    member: {
                      name: '',
                      role: 'General Manager',
                      bio: '',
                      image_url: '',
                      sort_order: teamMembersList.length + 1,
                    },
                    file: null,
                    preview: '',
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            </div>

            {/* Team Members Grid */}
            {loadingTeam ? (
              <div className="text-center py-20 text-[#A8AD94]">Loading team members...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembersList.map((m) => (
                  <div
                    key={m.id}
                    className="bg-[#232A23] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-4 text-center">
                      <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-[#787C68] bg-[#1E241E] shadow-lg">
                        {m.image_url ? (
                          <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A8AD94] font-bold text-xl">
                            {m.name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{m.name}</h3>
                        <p className="text-xs text-[#E3B94E] font-medium uppercase tracking-wider mt-0.5">{m.role}</p>
                      </div>

                      <p className="text-xs text-[#A8AD94] font-light leading-relaxed line-clamp-3">
                        {m.bio || 'No biography written yet.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                      <span className="text-[10px] text-[#A8AD94] font-mono">Order: #{m.sort_order}</span>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setTeamModal({
                              mode: 'edit',
                              member: { ...m },
                              file: null,
                              preview: m.image_url || '',
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeamMember(m.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete team member"
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
        )}

        {/* ================= TAB: PAYMENT ACCOUNTS (Bank, JazzCash, EasyPaisa) ================= */}
        {activeTab === 'payment_accounts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Resort Payment Accounts &amp; Wallets
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Configure official bank accounts, JazzCash till, and EasyPaisa numbers displayed to guests during online reservations.
                </p>
              </div>
              <button
                onClick={() =>
                  setPaymentAccountModal({
                    mode: 'add',
                    account: {
                      method: 'bank_transfer',
                      bank_name: '',
                      account_title: 'Oasis Resort Katpana',
                      account_number: '',
                      iban: '',
                      instructions: '',
                      is_active: 1,
                    },
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentAccountsList.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-[#232A23] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        acc.method === 'bank_transfer'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : acc.method === 'jazzcash'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {acc.method?.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleTogglePaymentAccount(acc.id)}
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          acc.is_active ? 'text-emerald-400' : 'text-[#A8AD94]'
                        }`}
                      >
                        {acc.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        <span>{acc.is_active ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#E3B94E]" />
                      <h3 className="font-display font-bold text-base text-[#EAEBE8] truncate">{acc.bank_name}</h3>
                    </div>

                    <div className="bg-[#1E241E] p-3.5 rounded-2xl space-y-1.5 text-xs font-mono border border-white/5">
                      <p><span className="text-[#A8AD94] font-sans text-[10px] uppercase block">Title:</span> <strong className="text-[#EAEBE8] font-sans">{acc.account_title}</strong></p>
                      <p><span className="text-[#A8AD94] font-sans text-[10px] uppercase block">Account / Mobile / Till:</span> <strong className="text-[#E3B94E] text-sm">{acc.account_number}</strong></p>
                      {acc.iban && (
                        <p><span className="text-[#A8AD94] font-sans text-[10px] uppercase block">IBAN / Reference:</span> <strong className="text-[#EAEBE8] text-[11px]">{acc.iban}</strong></p>
                      )}
                      {acc.instructions && (
                        <p className="text-[10px] text-[#A8AD94] font-sans pt-1 border-t border-white/5">{acc.instructions}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-2 pt-3 border-t border-white/5 text-xs">
                    <button
                      onClick={() => setPaymentAccountModal({ mode: 'edit', account: { ...acc } })}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] font-bold text-[11px] transition"
                    >
                      Edit Account
                    </button>
                    <button
                      onClick={() => handleDeletePaymentAccount(acc.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {paymentAccountsList.length === 0 && (
                <div className="col-span-full text-center py-12 text-[#A8AD94] bg-[#232A23] border border-white/10 rounded-3xl">
                  No payment accounts configured yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: DINING ITEMS (DEALS & MENUS CRUD) ================= */}
        {activeTab === 'dining_items' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Dining Deals &amp; Restaurant Menus
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Add, edit, or delete culinary packages, candlelight dinners, riverside BBQ, and organic breakfast menus.
                </p>
              </div>
              <button
                onClick={() =>
                  setDiningItemModal({
                    mode: 'add',
                    item: {
                      title: '',
                      deal_type: 'Deal & Package',
                      category: 'Romantic Dining',
                      description: '',
                      price: 5500,
                      pricing_unit: 'per_couple',
                      menu_inclusions: '',
                      time_slots: 'Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)',
                      image_url: '',
                      is_active: 1,
                      sort_order: diningItemsList.length + 1,
                    },
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dining Menu / Deal</span>
              </button>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Menu / Deal</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price &amp; Unit</th>
                    <th className="pb-3">Time Slots</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {diningItemsList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Utensils className="w-5 h-5 text-[#A8AD94]" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#EAEBE8] text-sm">{item.title}</p>
                          <p className="text-[10px] text-[#A8AD94] max-w-xs truncate">{item.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E3B94E]/15 border border-[#E3B94E]/30 text-[#E3B94E]">
                          {item.deal_type}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#A8AD94]">{item.category}</td>
                      <td className="py-3.5">
                        <span className="font-mono font-bold text-[#E3B94E]">
                          PKR {parseInt(item.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#A8AD94] block">
                          / {item.pricing_unit?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-[11px] text-[#A8AD94] max-w-xs truncate">
                        {item.time_slots}
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleToggleDiningItem(item)}
                          className="flex items-center gap-1.5 text-xs transition"
                          title="Click to toggle availability"
                        >
                          {item.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <ToggleRight className="w-4 h-4 text-emerald-400" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#A8AD94] font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              <ToggleLeft className="w-4 h-4" /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setDiningItemModal({ mode: 'edit', item: { ...item } })}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDiningItem(item.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {diningItemsList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-[#A8AD94]">
                        No restaurant menus or dining deals created yet. Click "Add Dining Menu / Deal" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: DINING BOOKINGS (Standalone) ================= */}
        {activeTab === 'dining_bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Standalone Dining Reservations
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Guests and travelers who booked candlelight dinners, Balti feasts, BBQ &amp; bonfires without room stays.
                </p>
              </div>
              <span className="text-xs bg-[#232A23] border border-white/10 px-3.5 py-1.5 rounded-full font-mono text-[#E3B94E]">
                Total Dining Bookings: {diningBookingsList.length}
              </span>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Ref Code</th>
                    <th className="pb-3">Dining Package</th>
                    <th className="pb-3">Guest Details</th>
                    <th className="pb-3">Date &amp; Time</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {diningBookingsList.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                      <td className="py-3.5 font-bold text-[#EAEBE8]">
                        <div className="flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#787C68]" />
                          <span>{b.service_title}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-[#EAEBE8]">{b.guest_name}</p>
                        <p className="text-[10px] text-[#A8AD94]">{b.guest_phone} • {b.guest_email}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-[#EAEBE8]">{b.booking_date}</p>
                        <p className="text-[10px] text-[#E3B94E]">{b.booking_time}</p>
                      </td>
                      <td className="py-3.5 font-bold text-[#EAEBE8]">{b.guests_count} Guests</td>
                      <td className="py-3.5 font-mono font-bold text-[#E3B94E]">
                        PKR {parseInt(b.total_price).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <PaymentStatusBadge status={b.payment_status} method={b.payment_method} />
                          {b.payment_slip_path && (
                            <a
                              href={`/${b.payment_slip_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#E3B94E] underline block flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Slip
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <BookingStatusBadge status={b.booking_status} />
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setServiceInvoiceModalData({ ...b, booking_type: 'dining' })}
                          className="px-2.5 py-1 rounded-lg bg-[#E3B94E]/15 hover:bg-[#E3B94E]/30 text-[#E3B94E] text-[10px] font-bold inline-flex items-center gap-1 transition shadow-sm"
                          title="View & Print Official Invoice"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                        {b.booking_status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateServiceBookingStatus(b.id, 'confirmed', 'dining')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                        )}
                        {b.booking_status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateServiceBookingStatus(b.id, 'completed', 'dining')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold"
                          >
                            Complete
                          </button>
                        )}
                        {b.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleUpdateServicePaymentStatus(b.id, 'paid', 'dining')}
                            className="px-2.5 py-1 rounded-lg bg-[#787C68]/30 text-[#E3B94E] hover:bg-[#787C68]/50 text-[10px] font-bold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteServiceBooking(b.id, 'dining')}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {diningBookingsList.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-[#A8AD94]">
                        No standalone dining reservations received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: RESORT EXPERIENCES MANAGEMENT (CRUD) ================= */}
        {activeTab === 'experiences_mgmt' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Resort Experiences &amp; Desert Safaris
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Manage adrenaline desert 4x4 safaris, stargazing nights, glacial excursions, and paragliding activities.
                </p>
              </div>
              <button
                onClick={() =>
                  setExperienceModal({
                    mode: 'add',
                    exp: {
                      title: '',
                      category: '4x4 Desert Safari',
                      duration: '2 - 3 Hours',
                      difficulty: 'Moderate',
                      price: 8000,
                      pricing_unit: 'per_vehicle',
                      inclusions: 'Certified Dunes Guide, 4x4 Vehicle, Refreshments, Photo Session',
                      departure_times: 'Morning (09:00), Afternoon (14:30), Sunset (17:00)',
                      description: '',
                      image_url: '',
                      is_active: 1,
                      sort_order: experiencesList.length + 1,
                    },
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resort Experience</span>
              </button>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Experience</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Duration &amp; Difficulty</th>
                    <th className="pb-3">Price &amp; Unit</th>
                    <th className="pb-3">Departure Times</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {experiencesList.map((exp) => (
                    <tr key={exp.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 flex items-center gap-3">
                        {exp.image_url ? (
                          <img
                            src={exp.image_url}
                            alt={exp.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Compass className="w-5 h-5 text-[#A8AD94]" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#EAEBE8] text-sm">{exp.title}</p>
                          <p className="text-[10px] text-[#A8AD94] max-w-xs truncate">{exp.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E3B94E]/15 border border-[#E3B94E]/30 text-[#E3B94E]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-[#EAEBE8]">{exp.duration}</p>
                        <p className="text-[10px] text-[#A8AD94]">{exp.difficulty}</p>
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-bold text-[#E3B94E]">
                          PKR {parseInt(exp.price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#A8AD94] block">
                          / {exp.pricing_unit?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-[11px] text-[#A8AD94] max-w-xs truncate">
                        {exp.departure_times}
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => handleToggleExperience(exp)}
                          className="flex items-center gap-1.5 text-xs transition"
                          title="Click to toggle availability"
                        >
                          {exp.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              <ToggleRight className="w-4 h-4 text-emerald-400" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#A8AD94] font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              <ToggleLeft className="w-4 h-4" /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setExperienceModal({ mode: 'edit', exp: { ...exp } })}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] transition text-[11px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {experiencesList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-[#A8AD94]">
                        No resort experiences registered yet. Click "Add Resort Experience" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: EXPERIENCES BOOKINGS (Standalone) ================= */}
        {activeTab === 'exp_bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Standalone Safari &amp; Experience Bookings
                </h2>
                <p className="text-xs text-[#A8AD94]">
                  Adventurers who booked 4x4 dune safaris, stargazing, and excursions without room stays.
                </p>
              </div>
              <span className="text-xs bg-[#232A23] border border-white/10 px-3.5 py-1.5 rounded-full font-mono text-[#E3B94E]">
                Total Experience Bookings: {expBookingsList.length}
              </span>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Ref Code</th>
                    <th className="pb-3">Experience / Adventure</th>
                    <th className="pb-3">Guest Details</th>
                    <th className="pb-3">Date &amp; Slot</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expBookingsList.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 font-mono font-bold text-[#E3B94E]">{b.booking_number}</td>
                      <td className="py-3.5 font-bold text-[#EAEBE8]">
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#787C68]" />
                          <span>{b.service_title}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-[#EAEBE8]">{b.guest_name}</p>
                        <p className="text-[10px] text-[#A8AD94]">{b.guest_phone} • {b.guest_email}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-[#EAEBE8]">{b.booking_date}</p>
                        <p className="text-[10px] text-[#E3B94E]">{b.booking_time}</p>
                      </td>
                      <td className="py-3.5 font-bold text-[#EAEBE8]">{b.guests_count} Adventurers</td>
                      <td className="py-3.5 font-mono font-bold text-[#E3B94E]">
                        PKR {parseInt(b.total_price).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <div className="space-y-1">
                          <PaymentStatusBadge status={b.payment_status} method={b.payment_method} />
                          {b.payment_slip_path && (
                            <a
                              href={`/${b.payment_slip_path}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#E3B94E] underline block flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View Slip
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <BookingStatusBadge status={b.booking_status} />
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setServiceInvoiceModalData({ ...b, booking_type: 'experience' })}
                          className="px-2.5 py-1 rounded-lg bg-[#E3B94E]/15 hover:bg-[#E3B94E]/30 text-[#E3B94E] text-[10px] font-bold inline-flex items-center gap-1 transition shadow-sm"
                          title="View & Print Official Invoice"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                        {b.booking_status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateServiceBookingStatus(b.id, 'confirmed', 'exp')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                        )}
                        {b.booking_status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateServiceBookingStatus(b.id, 'completed', 'exp')}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold"
                          >
                            Complete
                          </button>
                        )}
                        {b.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleUpdateServicePaymentStatus(b.id, 'paid', 'exp')}
                            className="px-2.5 py-1 rounded-lg bg-[#787C68]/30 text-[#E3B94E] hover:bg-[#787C68]/50 text-[10px] font-bold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteServiceBooking(b.id, 'exp')}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expBookingsList.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-[#A8AD94]">
                        No standalone experience bookings received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REGISTERED GUESTS / USERS ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Registered User Accounts
                </h2>
                <p className="text-xs text-[#A8AD94]">List of all registered guests, reception staff, and administrators.</p>
              </div>
              <span className="text-xs bg-[#232A23] border border-white/10 px-3.5 py-1.5 rounded-full font-mono text-[#E3B94E]">
                Total Accounts: {usersList.length}
              </span>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">User ID</th>
                    <th className="pb-3">Full Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Phone Number</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Stays Count</th>
                    <th className="pb-3">Total Spend</th>
                    <th className="pb-3">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-mono text-[#A8AD94]">#{u.id}</td>
                      <td className="py-3 font-semibold text-[#EAEBE8]">{u.name}</td>
                      <td className="py-3 text-[#A8AD94]">{u.email}</td>
                      <td className="py-3 text-[#787C68] font-mono">{u.phone}</td>
                      <td className="py-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-300'
                            : u.role === 'reception'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-[#EAEBE8]">{u.total_bookings} stays</td>
                      <td className="py-3 font-bold text-[#E3B94E]">
                        PKR {parseInt(u.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="py-3 text-[#A8AD94]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: OFFERS & PROMOS (FULL CRUD) ================= */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                  Exclusive Offers &amp; Promo Codes
                </h2>
                <p className="text-xs text-[#A8AD94]">Manage voucher privileges, percentage discounts, and seasonal packages.</p>
              </div>

              <button
                onClick={() =>
                  setOfferModal({
                    mode: 'add',
                    offer: {
                      code: 'SPRING15',
                      title: 'Spring Blossom Special',
                      description: 'Enjoy 15% discount on all suites with breakfast included.',
                      discount_type: 'percentage',
                      discount_value: 15,
                      min_spend: 30000,
                      valid_from: new Date().toISOString().split('T')[0],
                      valid_until: '2027-12-31',
                      usage_limit: 500,
                      is_active: 1,
                    },
                  })
                }
                className="px-4 py-2.5 bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add Offer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offersList.map((o) => (
                <div key={o.id} className="bg-[#232A23] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm font-bold text-[#E3B94E] bg-[#1E241E] px-3 py-1 rounded-xl border border-white/10">
                        {o.code}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        o.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {o.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#EAEBE8]">{o.title}</h3>
                    <p className="text-xs text-[#A8AD94] leading-relaxed font-light">{o.description}</p>
                    
                    <div className="text-xs text-[#EAEBE8] space-y-1 pt-2 border-t border-white/5">
                      <p><span className="text-[#A8AD94]">Discount:</span> {o.discount_value}% {o.discount_type}</p>
                      <p><span className="text-[#A8AD94]">Valid Until:</span> {o.valid_until}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setOfferModal({ mode: 'edit', offer: o })}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#787C68] text-[#EAEBE8] hover:text-[#232A23] text-xs font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(o.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: REVIEWS MODERATION ================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#EAEBE8]">
                Guest Reviews &amp; Feedback Moderation
              </h2>
              <p className="text-xs text-[#A8AD94]">
                Approve guest feedback to publish live to the Homepage and About testimonials section.
              </p>
            </div>

            <div className="bg-[#232A23] border border-white/10 rounded-3xl p-6 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#A8AD94]">
                    <th className="pb-3">Guest &amp; Stay</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3">Review Feedback</th>
                    <th className="pb-3">Submitted</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviewsList.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition">
                      <td className="py-3">
                        <p className="font-semibold text-[#EAEBE8]">{r.guest_name}</p>
                        <p className="text-[10px] text-[#A8AD94] font-mono">{r.booking_number} • {r.room_title}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex text-[#E3B94E]">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 max-w-sm">
                        <p className="text-[#EAEBE8] italic font-light">"{r.comment}"</p>
                      </td>
                      <td className="py-3 text-[#A8AD94] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          r.is_approved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {r.is_approved ? 'Live On Site' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2 whitespace-nowrap">
                        {!r.is_approved ? (
                          <button
                            onClick={() => handleReviewApproval(r.id, 1)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#121813] font-bold text-[10px] uppercase transition"
                          >
                            Approve &amp; Live
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReviewApproval(r.id, 0)}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#A8AD94] text-[10px] uppercase transition"
                          >
                            Decline &amp; Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODAL: VIEW BOOKING CARD ================= */}
        {viewBookingModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="font-mono text-sm font-bold text-[#E3B94E] block">{viewBookingModal.booking_number}</span>
                  <span className="text-[10px] text-[#A8AD94] uppercase tracking-wider">Reservation Breakdown</span>
                </div>
                <button onClick={() => setViewBookingModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-[#1E241E] p-4 rounded-xl space-y-1.5">
                  <p><strong className="text-[#EAEBE8]">Guest:</strong> {viewBookingModal.guest_name}</p>
                  <p><strong className="text-[#EAEBE8]">Email:</strong> {viewBookingModal.guest_email}</p>
                  <p><strong className="text-[#EAEBE8]">Phone:</strong> {viewBookingModal.guest_phone}</p>
                  {viewBookingModal.guest_cnic_passport && (
                    <p><strong className="text-[#EAEBE8]">CNIC/Passport:</strong> {viewBookingModal.guest_cnic_passport}</p>
                  )}
                </div>

                <div className="bg-[#1E241E] p-4 rounded-xl space-y-1.5">
                  <p><strong className="text-[#EAEBE8]">Room:</strong> {viewBookingModal.room_title}</p>
                  <p><strong className="text-[#EAEBE8]">Stay:</strong> {viewBookingModal.check_in} to {viewBookingModal.check_out} ({viewBookingModal.total_nights} Nights)</p>
                  <p><strong className="text-[#EAEBE8]">Guests:</strong> {viewBookingModal.adults} Adults{viewBookingModal.children > 0 ? `, ${viewBookingModal.children} Children` : ''}</p>
                  <p><strong className="text-[#E3B94E]">Total Amount:</strong> PKR {parseInt(viewBookingModal.final_total).toLocaleString()}</p>
                  <div className="flex gap-2 pt-1">
                    <BookingStatusBadge status={viewBookingModal.booking_status} />
                    <PaymentStatusBadge status={viewBookingModal.payment_status} method={viewBookingModal.payment_method} />
                  </div>
                </div>

                {viewBookingModal.special_requests && (
                  <div className="bg-[#1E241E] p-3 rounded-xl">
                    <span className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Special Requests:</span>
                    <p className="italic text-[#EAEBE8]/80">{viewBookingModal.special_requests}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  onClick={() => setViewBookingModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold text-xs uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: EDIT RESERVATION ================= */}
        {editBookingModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                  Edit Reservation #{editBookingModal.booking_number}
                </h3>
                <button onClick={() => setEditBookingModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveBookingEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Guest Name</label>
                    <input
                      type="text"
                      required
                      value={editBookingModal.guest_name || ''}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, guest_name: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Guest Phone</label>
                    <input
                      type="text"
                      required
                      value={editBookingModal.guest_phone || ''}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, guest_phone: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Check In</label>
                    <input
                      type="date"
                      required
                      value={editBookingModal.check_in || ''}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, check_in: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Check Out</label>
                    <input
                      type="date"
                      required
                      value={editBookingModal.check_out || ''}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, check_out: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Booking Status</label>
                    <select
                      value={editBookingModal.booking_status}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, booking_status: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Payment Status</label>
                    <select
                      value={editBookingModal.payment_status}
                      onChange={(e) => setEditBookingModal({ ...editBookingModal, payment_status: e.target.value })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Total Amount (PKR)</label>
                  <input
                    type="number"
                    value={editBookingModal.final_total}
                    onChange={(e) => setEditBookingModal({ ...editBookingModal, final_total: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Admin Notes</label>
                  <textarea
                    rows={2}
                    value={editBookingModal.admin_notes || ''}
                    onChange={(e) => setEditBookingModal({ ...editBookingModal, admin_notes: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditBookingModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT ROOM ================= */}
        {roomModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                  {roomModal.mode === 'add' ? 'Add New Room' : 'Edit Room'}
                </h3>
                <button onClick={() => setRoomModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Room Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Karakoram Presidential Villa"
                    value={roomModal.room.title || ''}
                    onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, title: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Category</label>
                    <select
                      value={roomModal.room.category || (categoriesList[0]?.name || 'Suites')}
                      onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, category: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                      {categoriesList.length === 0 && (
                        <>
                          <option value="Suites">Suites</option>
                          <option value="Villas">Villas</option>
                          <option value="Deluxe Rooms">Deluxe Rooms</option>
                          <option value="Glamping">Glamping Domes</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Base Price / Night (PKR)</label>
                    <input
                      type="number"
                      required
                      value={roomModal.room.base_price || ''}
                      onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, base_price: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Adults</label>
                    <input
                      type="number"
                      value={roomModal.room.capacity_adults || 2}
                      onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, capacity_adults: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Children</label>
                    <input
                      type="number"
                      value={roomModal.room.capacity_children || 0}
                      onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, capacity_children: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Size (m²)</label>
                    <input
                      type="number"
                      value={roomModal.room.room_size_sqm || 45}
                      onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, room_size_sqm: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                {/* Featured Image with Direct File Upload & Preview */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block">
                      Featured Listing Image *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          loadMediaLibrary();
                          setMediaPickerForRoomFeatured(true);
                        }}
                        className="text-[10px] bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Film className="w-3 h-3" />
                        <span>Media Files</span>
                      </button>
                      <label className="cursor-pointer text-[10px] bg-[#787C68] hover:bg-[#868B74] text-[#232A23] px-3 py-1 rounded-lg font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-sm">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingFeatured ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingFeatured}
                          onChange={handleUploadFeaturedImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {roomModal.room.featured_image && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                      <img
                        src={roomModal.room.featured_image}
                        alt="Featured Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold">
                        Current Image
                      </span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    placeholder="Enter image URL or select from Media Files"
                    value={roomModal.room.featured_image || ''}
                    onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, featured_image: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                {/* Gallery Images with Direct File Upload & Visual Thumbnails Grid */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block">
                      Gallery of Room ({Array.isArray(roomModal.room.images) ? roomModal.room.images.length : (roomModal.room.images ? 1 : 0)} Photos)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          loadMediaLibrary();
                          setMediaPickerForRoomGallery(true);
                        }}
                        className="text-[10px] bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                      >
                        <Film className="w-3 h-3" />
                        <span>Media Files</span>
                      </button>
                      <label className="cursor-pointer text-[10px] bg-white/10 hover:bg-white/20 text-[#EAEBE8] px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition">
                        <Plus className="w-3 h-3 text-[#E3B94E]" />
                        <span>{uploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploadingGallery}
                          onChange={handleUploadGalleryImages}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Thumbnails grid */}
                  {Array.isArray(roomModal.room.images) && roomModal.room.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 bg-[#1E241E] p-2.5 rounded-xl border border-white/10">
                      {roomModal.room.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group bg-black/40">
                          <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-bold"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add URL fallback */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste external gallery image URL..."
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      className="flex-1 bg-[#1E241E] border border-white/10 rounded-xl px-3 py-1.5 text-[#EAEBE8] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAEBE8] text-xs font-semibold"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={roomModal.room.description || ''}
                    onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, description: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Radiant Floor Heating, King Bed, Panoramic View, Bathtub"
                    value={roomModal.room.amenities || ''}
                    onChange={(e) => setRoomModal({ ...roomModal, room: { ...roomModal.room, amenities: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setRoomModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    {roomModal.mode === 'add' ? 'Create Room' : 'Update Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT ROOM CATEGORY ================= */}
        {categoryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                  {categoryModal.mode === 'add' ? 'Add Room Category' : 'Edit Room Category'}
                </h3>
                <button onClick={() => setCategoryModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Presidential Villas"
                    value={categoryModal.cat.name || ''}
                    onChange={(e) => setCategoryModal({ ...categoryModal, cat: { ...categoryModal.cat, name: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this accommodation tier..."
                    value={categoryModal.cat.description || ''}
                    onChange={(e) => setCategoryModal({ ...categoryModal, cat: { ...categoryModal.cat, description: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={categoryModal.cat.sort_order || 0}
                    onChange={(e) => setCategoryModal({ ...categoryModal, cat: { ...categoryModal.cat, sort_order: parseInt(e.target.value, 10) } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Room Inventory Units Available (Deluxe: 4, etc.) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={categoryModal.cat.total_rooms ?? 4}
                    onChange={(e) => setCategoryModal({ ...categoryModal, cat: { ...categoryModal.cat, total_rooms: parseInt(e.target.value, 10) || 1 } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                  <span className="text-[10px] text-[#A8AD94] mt-0.5 block">
                    Sets maximum rooms guests can book in this category.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setCategoryModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    {categoryModal.mode === 'add' ? 'Create Category' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT PAYMENT ACCOUNT ================= */}
        {paymentAccountModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                  {paymentAccountModal.mode === 'add' ? 'Add Payment Account' : 'Edit Payment Account'}
                </h3>
                <button onClick={() => setPaymentAccountModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSavePaymentAccount} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Account Method Type *</label>
                  <select
                    value={paymentAccountModal.account.method}
                    onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, method: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  >
                    <option value="bank_transfer">Bank Transfer (Direct Deposit)</option>
                    <option value="jazzcash">JazzCash Mobile Wallet / Till</option>
                    <option value="easypaisa">EasyPaisa Mobile Wallet / Till</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Bank / Institution / Provider Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Habib Bank Limited (HBL) Skardu or JazzCash"
                    value={paymentAccountModal.account.bank_name || ''}
                    onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, bank_name: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Account Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oasis Resort Katpana"
                      value={paymentAccountModal.account.account_title || ''}
                      onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, account_title: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Account / Mobile / Till Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0308-1472888 or 000123456789"
                      value={paymentAccountModal.account.account_number || ''}
                      onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, account_number: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">IBAN / Merchant Reference Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PK36 HABB 0001 2345 6789 0101 or JC-TILL-9922881"
                    value={paymentAccountModal.account.iban || ''}
                    onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, iban: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Transfer Instructions / Note</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Send payment and enter reference ID with slip screenshot..."
                    value={paymentAccountModal.account.instructions || ''}
                    onChange={(e) => setPaymentAccountModal({ ...paymentAccountModal, account: { ...paymentAccountModal.account, instructions: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setPaymentAccountModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    {paymentAccountModal.mode === 'add' ? 'Add Account' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT PROMO OFFER ================= */}
        {offerModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                  {offerModal.mode === 'add' ? 'Create Promo Offer' : 'Edit Promo Offer'}
                </h3>
                <button onClick={() => setOfferModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OASIS10"
                    value={offerModal.offer.code || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, offer: { ...offerModal.offer, code: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Offer Title</label>
                  <input
                    type="text"
                    required
                    value={offerModal.offer.title || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, offer: { ...offerModal.offer, title: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Discount %</label>
                    <input
                      type="number"
                      required
                      value={offerModal.offer.discount_value || ''}
                      onChange={(e) => setOfferModal({ ...offerModal, offer: { ...offerModal.offer, discount_value: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Valid Until</label>
                    <input
                      type="date"
                      required
                      value={offerModal.offer.valid_until || ''}
                      onChange={(e) => setOfferModal({ ...offerModal, offer: { ...offerModal.offer, valid_until: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={offerModal.offer.description || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, offer: { ...offerModal.offer, description: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setOfferModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT DINING ITEM ================= */}
        {diningItemModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    {diningItemModal.mode === 'add' ? 'Add Dining Menu / Deal' : 'Edit Dining Menu / Deal'}
                  </h3>
                </div>
                <button onClick={() => setDiningItemModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveDiningItem} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Item / Deal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Private Candlelight Dunes Dinner"
                    value={diningItemModal.item.title || ''}
                    onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, title: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Deal Type</label>
                    <select
                      value={diningItemModal.item.deal_type || 'Deal & Package'}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, deal_type: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="Deal & Package">Deal &amp; Package</option>
                      <option value="Signature Special">Signature Special</option>
                      <option value="Restaurant Menu">Restaurant Menu</option>
                      <option value="Chef Table">Chef Table</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Category</label>
                    <select
                      value={diningItemModal.item.category || 'Romantic Dining'}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, category: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="Romantic Dining">Romantic Dining</option>
                      <option value="Traditional Balti">Traditional Balti</option>
                      <option value="Live BBQ & Bonfire">Live BBQ &amp; Bonfire</option>
                      <option value="Breakfast Buffet">Breakfast Buffet</option>
                      <option value="High Tea">High Tea</option>
                      <option value="Beverage">Beverage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={diningItemModal.item.price || ''}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, price: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Pricing Unit</label>
                    <select
                      value={diningItemModal.item.pricing_unit || 'per_couple'}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, pricing_unit: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="per_couple">Per Couple</option>
                      <option value="per_person">Per Person</option>
                      <option value="per_item">Per Item</option>
                      <option value="per_family">Per Family</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Time Slots / Sitting Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunset Sitting (18:30 - 20:30), Night Starlight (20:45 - 23:00)"
                    value={diningItemModal.item.time_slots || ''}
                    onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, time_slots: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Menu Inclusions &amp; Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 5-Course Curated Balti Menu, Wild Mint Mocktails, Apricot Wood Private Bonfire"
                    value={diningItemModal.item.menu_inclusions || ''}
                    onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, menu_inclusions: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short ambiance or culinary description..."
                    value={diningItemModal.item.description || ''}
                    onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, description: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /uploads/rooms/..."
                      value={diningItemModal.item.image_url || ''}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, image_url: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                    <label className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#E3B94E]" />
                      <span>{uploadingDiningImg ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadDiningImage} className="hidden" />
                    </label>
                  </div>
                  {diningItemModal.item.image_url && (
                    <img src={diningItemModal.item.image_url} alt="Preview" className="w-20 h-14 object-cover rounded-xl mt-2 border border-white/10" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="dining_active"
                      checked={!!diningItemModal.item.is_active}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, is_active: e.target.checked ? 1 : 0 } })}
                      className="w-4 h-4 rounded text-[#787C68]"
                    />
                    <label htmlFor="dining_active" className="text-xs text-[#EAEBE8]">Active &amp; Bookable Online</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#A8AD94]">Sort Order:</label>
                    <input
                      type="number"
                      value={diningItemModal.item.sort_order || 0}
                      onChange={(e) => setDiningItemModal({ ...diningItemModal, item: { ...diningItemModal.item, sort_order: parseInt(e.target.value, 10) || 0 } })}
                      className="w-16 bg-[#1E241E] border border-white/10 rounded-lg px-2 py-1 text-[#EAEBE8] text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setDiningItemModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    {diningItemModal.mode === 'add' ? 'Create Menu Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT RESORT EXPERIENCE ================= */}
        {experienceModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-xl w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    {experienceModal.mode === 'add' ? 'Add Resort Experience' : 'Edit Resort Experience'}
                  </h3>
                </div>
                <button onClick={() => setExperienceModal(null)} className="text-[#A8AD94] hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveExperience} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Experience Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Katpana Dunes 4x4 Desert Safari"
                    value={experienceModal.exp.title || ''}
                    onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, title: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Category</label>
                    <select
                      value={experienceModal.exp.category || '4x4 Desert Safari'}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, category: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="4x4 Desert Safari">4x4 Desert Safari</option>
                      <option value="Stargazing & Bonfire">Stargazing &amp; Bonfire</option>
                      <option value="Alpine Trekking">Alpine Trekking</option>
                      <option value="Lake Excursion">Lake Excursion</option>
                      <option value="Cultural Heritage">Cultural Heritage</option>
                      <option value="Paragliding">Paragliding</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Duration &amp; Difficulty</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 2 - 3 Hours"
                        value={experienceModal.exp.duration || ''}
                        onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, duration: e.target.value } })}
                        className="w-1/2 bg-[#1E241E] border border-white/10 rounded-xl px-2 py-2 text-[#EAEBE8]"
                      />
                      <select
                        value={experienceModal.exp.difficulty || 'Moderate'}
                        onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, difficulty: e.target.value } })}
                        className="w-1/2 bg-[#1E241E] border border-white/10 rounded-xl px-2 py-2 text-[#EAEBE8]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Adventurous">Adventurous</option>
                        <option value="Challenging">Challenging</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={experienceModal.exp.price || ''}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, price: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Pricing Unit</label>
                    <select
                      value={experienceModal.exp.pricing_unit || 'per_vehicle'}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, pricing_unit: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    >
                      <option value="per_vehicle">Per Vehicle</option>
                      <option value="per_person">Per Person</option>
                      <option value="per_couple">Per Couple</option>
                      <option value="per_group">Per Group</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Departure Times / Daily Slots</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning (09:00), Afternoon (14:30), Sunset (17:00)"
                    value={experienceModal.exp.departure_times || ''}
                    onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, departure_times: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Inclusions &amp; Safety Gear</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Certified Dunes Guide, 4x4 Vehicle, Refreshments, Helmets, Photo Session"
                    value={experienceModal.exp.inclusions || ''}
                    onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, inclusions: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Detailed adventure overview..."
                    value={experienceModal.exp.description || ''}
                    onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, description: e.target.value } })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /uploads/rooms/..."
                      value={experienceModal.exp.image_url || ''}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, image_url: e.target.value } })}
                      className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8]"
                    />
                    <label className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5 text-[#E3B94E]" />
                      <span>{uploadingExpImg ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleUploadExperienceImage} className="hidden" />
                    </label>
                  </div>
                  {experienceModal.exp.image_url && (
                    <img src={experienceModal.exp.image_url} alt="Preview" className="w-20 h-14 object-cover rounded-xl mt-2 border border-white/10" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="exp_active"
                      checked={!!experienceModal.exp.is_active}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, is_active: e.target.checked ? 1 : 0 } })}
                      className="w-4 h-4 rounded text-[#787C68]"
                    />
                    <label htmlFor="exp_active" className="text-xs text-[#EAEBE8]">Active &amp; Bookable Online</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#A8AD94]">Sort Order:</label>
                    <input
                      type="number"
                      value={experienceModal.exp.sort_order || 0}
                      onChange={(e) => setExperienceModal({ ...experienceModal, exp: { ...experienceModal.exp, sort_order: parseInt(e.target.value, 10) || 0 } })}
                      className="w-16 bg-[#1E241E] border border-white/10 rounded-lg px-2 py-1 text-[#EAEBE8] text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setExperienceModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider"
                  >
                    {experienceModal.mode === 'add' ? 'Create Experience' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADD / EDIT GALLERY CATEGORY ================= */}
        {galleryCatModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    {galleryCatModal.mode === 'add' ? 'Create Gallery Category' : 'Edit Gallery Category'}
                  </h3>
                </div>
                <button
                  onClick={() => setGalleryCatModal(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveGalleryCategory} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Golden Foliage, Night Astrophotography"
                    value={galleryCatModal.cat.name || ''}
                    onChange={(e) =>
                      setGalleryCatModal({
                        ...galleryCatModal,
                        cat: { ...galleryCatModal.cat, name: e.target.value },
                      })
                    }
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of photography in this gallery collection..."
                    value={galleryCatModal.cat.description || ''}
                    onChange={(e) =>
                      setGalleryCatModal({
                        ...galleryCatModal,
                        cat: { ...galleryCatModal.cat, description: e.target.value },
                      })
                    }
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl p-2.5 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={galleryCatModal.cat.sort_order || 0}
                    onChange={(e) =>
                      setGalleryCatModal({
                        ...galleryCatModal,
                        cat: { ...galleryCatModal.cat, sort_order: parseInt(e.target.value, 10) || 0 },
                      })
                    }
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#A8AD94] mt-1 block">
                    Lower numbers appear first in the gallery filter tabs.
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setGalleryCatModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition"
                  >
                    {galleryCatModal.mode === 'add' ? 'Create Category' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: UPLOAD / EDIT GALLERY PHOTO ================= */}
        {galleryImageModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    {galleryImageModal.mode === 'add' ? 'Upload Gallery Photo' : 'Edit Photo Details'}
                  </h3>
                </div>
                <button
                  onClick={() => setGalleryImageModal(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveGalleryImage} className="space-y-4 text-xs">
                {/* Photo Upload or Preview */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Photo File or URL *
                  </label>

                  {/* Drag/Drop & File Input */}
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-white/20 hover:border-[#787C68] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-white/5 hover:bg-white/10 group">
                      <Upload className="w-8 h-8 text-[#A8AD94] group-hover:text-[#E3B94E] mb-2 transition" />
                      <span className="text-xs font-semibold text-[#EAEBE8]">
                        Click to select image file from computer
                      </span>
                      <span className="text-[10px] text-[#A8AD94] mt-0.5">
                        JPG, PNG, WEBP, AVIF up to 15MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const preview = URL.createObjectURL(file);
                            setGalleryImageModal((prev) => ({
                              ...prev,
                              file,
                              preview,
                            }));
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Or URL input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#A8AD94] uppercase font-bold shrink-0">Or URL:</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or paste image URL"
                        value={galleryImageModal.image.image_url || ''}
                        onChange={(e) =>
                          setGalleryImageModal((prev) => ({
                            ...prev,
                            image: { ...prev.image, image_url: e.target.value },
                          }))
                        }
                        className="flex-1 bg-[#1E241E] border border-white/10 rounded-xl px-3 py-1.5 text-[#EAEBE8] text-xs focus:border-[#787C68] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#A8AD94]">Already uploaded in rooms or uploads folder?</span>
                      <button
                        type="button"
                        onClick={() => {
                          loadMediaLibrary();
                          setMediaPickerForGallery(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] font-bold text-[10px] transition"
                      >
                        Select from Media Files
                      </button>
                    </div>
                  </div>

                  {/* Active Preview */}
                  {(galleryImageModal.preview || galleryImageModal.image.image_url) && (
                    <div className="mt-3 relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/15">
                      <img
                        src={galleryImageModal.preview || galleryImageModal.image.image_url}
                        alt="Photo Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[10px] text-white">
                        {galleryImageModal.file ? `File: ${galleryImageModal.file.name}` : 'URL Preview'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Photo Title / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunset Over Katpana Dunes, Starlit Glamping Pod"
                    value={galleryImageModal.image.title || ''}
                    onChange={(e) =>
                      setGalleryImageModal({
                        ...galleryImageModal,
                        image: { ...galleryImageModal.image, title: e.target.value },
                      })
                    }
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Gallery Category *
                  </label>
                  <select
                    value={galleryImageModal.image.category || ''}
                    onChange={(e) =>
                      setGalleryImageModal({
                        ...galleryImageModal,
                        image: { ...galleryImageModal.image, category: e.target.value },
                      })
                    }
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  >
                    {galleryCatsList.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    {galleryCatsList.length === 0 && (
                      <option value="General">General</option>
                    )}
                  </select>
                </div>

                {/* Options: Featured & Sort Order */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="gallery_featured"
                      checked={!!galleryImageModal.image.is_featured}
                      onChange={(e) =>
                        setGalleryImageModal({
                          ...galleryImageModal,
                          image: {
                            ...galleryImageModal.image,
                            is_featured: e.target.checked ? 1 : 0,
                          },
                        })
                      }
                      className="w-4 h-4 rounded text-[#787C68] focus:ring-0"
                    />
                    <label htmlFor="gallery_featured" className="text-xs text-[#EAEBE8] cursor-pointer">
                      Featured in Home &amp; Highlights
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-[#A8AD94]">Sort Order:</label>
                    <input
                      type="number"
                      value={galleryImageModal.image.sort_order || 0}
                      onChange={(e) =>
                        setGalleryImageModal({
                          ...galleryImageModal,
                          image: {
                            ...galleryImageModal.image,
                            sort_order: parseInt(e.target.value, 10) || 0,
                          },
                        })
                      }
                      className="w-16 bg-[#1E241E] border border-white/10 rounded-lg px-2 py-1 text-[#EAEBE8] text-center"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setGalleryImageModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingGalleryItem}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition disabled:opacity-50"
                  >
                    {uploadingGalleryItem
                      ? 'Processing...'
                      : galleryImageModal.mode === 'add'
                      ? 'Upload to Gallery'
                      : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: INSTANT REPLACE GALLERY IMAGE ================= */}
        {replaceImageModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#E3B94E]" />
                  <div>
                    <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                      Replace Gallery Image
                    </h3>
                    <p className="text-[11px] text-[#A8AD94] truncate max-w-sm">
                      {replaceImageModal.image.title} ({replaceImageModal.image.category})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplaceImageModal(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteReplaceImage} className="space-y-4 text-xs">
                {/* Comparison Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#A8AD94] font-bold uppercase block">Current Image</span>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                      <img
                        src={replaceImageModal.image.image_url}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[#E3B94E] font-bold uppercase block">New Replacement</span>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 border border-[#E3B94E]/40 flex items-center justify-center">
                      {replaceImageModal.preview || replaceImageModal.url ? (
                        <img
                          src={replaceImageModal.preview || replaceImageModal.url}
                          alt="Replacement Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-[#A8AD94] text-center p-3">
                          Select a new file or paste URL below
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload or URL for Replacement */}
                <div className="space-y-2 pt-2">
                  <label className="border-2 border-dashed border-[#E3B94E]/30 hover:border-[#E3B94E] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-white/5 hover:bg-white/10 group">
                    <Upload className="w-6 h-6 text-[#E3B94E] mb-1" />
                    <span className="text-xs font-semibold text-[#EAEBE8]">
                      Choose Replacement Image from Computer
                    </span>
                    <span className="text-[10px] text-[#A8AD94]">
                      Will immediately replace the file
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const preview = URL.createObjectURL(file);
                          setReplaceImageModal((prev) => ({
                            ...prev,
                            file,
                            preview,
                          }));
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#A8AD94] uppercase font-bold shrink-0">Or New URL:</span>
                    <input
                      type="url"
                      placeholder="https://... new image URL"
                      value={replaceImageModal.url || ''}
                      onChange={(e) =>
                        setReplaceImageModal((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      className="flex-1 bg-[#1E241E] border border-white/10 rounded-xl px-3 py-1.5 text-[#EAEBE8] text-xs focus:border-[#787C68] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setReplaceImageModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingGalleryItem || (!replaceImageModal.file && !replaceImageModal.url)}
                    className="px-5 py-2 rounded-xl bg-[#E3B94E] hover:bg-[#c99f36] text-[#232A23] font-bold uppercase tracking-wider transition disabled:opacity-40"
                  >
                    {uploadingGalleryItem ? 'Replacing...' : 'Confirm & Replace Image'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: SERVICE RESERVATION INVOICE / VOUCHER ================= */}
        {serviceInvoiceModalData && (

          <ServiceInvoiceModal
            isOpen={!!serviceInvoiceModalData}
            onClose={() => setServiceInvoiceModalData(null)}
            booking={serviceInvoiceModalData}
          />
        )}

        {/* ================= MODAL: UPLOAD MEDIA FILES (IMAGES & VIDEOS) ================= */}
        {uploadMediaModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Upload Media Files
                  </h3>
                </div>
                <button
                  onClick={() => setUploadMediaModalOpen(false)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadMediaLibFiles} className="space-y-4 text-xs">
                {/* Target Folder Selector */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Target Folder *
                  </label>
                  <select
                    value={uploadMediaTargetFolder}
                    onChange={(e) => setUploadMediaTargetFolder(e.target.value)}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  >
                    <option value="rooms">Rooms Folder (backend/uploads/rooms)</option>
                    <option value="gallery">Gallery Folder (backend/uploads/gallery)</option>
                    <option value="videos">Videos Folder (backend/uploads/videos)</option>
                    <option value="team">Team Folder (backend/uploads/team)</option>
                    <option value="assets">Assets Folder (backend/uploads/assets)</option>
                  </select>
                </div>

                {/* Dropzone / File Selector */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Select Images or Videos from Computer/Mobile *
                  </label>
                  <label className="border-2 border-dashed border-white/20 hover:border-[#E3B94E] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-white/5 hover:bg-white/10 group">
                    <Upload className="w-8 h-8 text-[#A8AD94] group-hover:text-[#E3B94E] mb-2 transition" />
                    <span className="text-xs font-semibold text-[#EAEBE8]">
                      Click to choose files or drag &amp; drop
                    </span>
                    <span className="text-[10px] text-[#A8AD94] mt-1 text-center">
                      Supports JPG, PNG, WEBP, HEIC, DNG, MOV, MP4, WebM (up to 300MB)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.mov,.mp4,.webm,.heic,.dng,.jfif"
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadMediaFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Selected Files preview list */}
                {uploadMediaFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto bg-[#1E241E] p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                      {uploadMediaFiles.length} file(s) selected:
                    </span>
                    {uploadMediaFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-[#EAEBE8] py-1 border-b border-white/5 last:border-0">
                        <span className="truncate max-w-[280px] font-mono">{f.name}</span>
                        <span className="text-[#A8AD94] text-[10px]">
                          {(f.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setUploadMediaModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingMediaLibFiles || uploadMediaFiles.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingMediaLibFiles ? 'Uploading files...' : 'Upload Media'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: MEDIA PREVIEW LIGHTBOX ================= */}
        {mediaPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full rounded-3xl border border-white/20 overflow-hidden shadow-2xl animate-fadeIn flex flex-col max-h-[92vh]">
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/30">
                <div className="flex items-center gap-2">
                  {mediaPreviewModal.type === 'video' ? (
                    <Film className="w-5 h-5 text-[#E3B94E]" />
                  ) : (
                    <Image className="w-5 h-5 text-[#E3B94E]" />
                  )}
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#EAEBE8] truncate max-w-lg">
                      {mediaPreviewModal.name}
                    </h3>
                    <p className="text-[10px] text-[#A8AD94]">
                      {mediaPreviewModal.size} • folder: {mediaPreviewModal.folder}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMediaPreviewModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#EAEBE8] flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Viewport */}
              <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] max-h-[550px]">
                {mediaPreviewModal.type === 'video' ? (
                  <video
                    src={mediaPreviewModal.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain max-h-[550px]"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <img
                    src={mediaPreviewModal.url}
                    alt={mediaPreviewModal.name}
                    className="w-full h-full object-contain max-h-[550px]"
                  />
                )}
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-[#1E241E] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[11px] font-mono text-[#A8AD94] truncate max-w-md">
                  {mediaPreviewModal.url}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mediaPreviewModal.url);
                      triggerToast(`Copied ${mediaPreviewModal.url} to clipboard!`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAEBE8] font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSetMediaAsHero(mediaPreviewModal);
                      setMediaPreviewModal(null);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#E3B94E] hover:bg-[#c99f36] text-[#232A23] font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Set as Hero {mediaPreviewModal.type === 'video' ? 'Video' : 'Image'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: CONFIRM ADD TO GALLERY ================= */}
        {addToGalleryModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-4 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-display text-lg text-[#EAEBE8] font-bold flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#E3B94E]" />
                  <span>Add to Resort Gallery</span>
                </h3>
                <button
                  onClick={() => setAddToGalleryModal(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmAddToGallery} className="space-y-4 text-xs">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black/40 border border-white/15">
                  <img src={addToGalleryModal.media_url} alt="Preview" className="w-full h-full object-cover" />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Photo Title / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    value={addToGalleryModal.title}
                    onChange={(e) => setAddToGalleryModal({ ...addToGalleryModal, title: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Gallery Category *
                  </label>
                  <select
                    value={addToGalleryModal.category}
                    onChange={(e) => setAddToGalleryModal({ ...addToGalleryModal, category: e.target.value })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  >
                    {galleryCatsList.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {galleryCatsList.length === 0 && <option value="Resort Grounds">Resort Grounds</option>}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-[#EAEBE8]">
                    <input
                      type="checkbox"
                      checked={!!addToGalleryModal.is_featured}
                      onChange={(e) => setAddToGalleryModal({ ...addToGalleryModal, is_featured: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded text-[#787C68]"
                    />
                    <span>Featured on Home Highlights</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setAddToGalleryModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition"
                  >
                    Add to Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: SELECT HERO MEDIA PICKER ================= */}
        {selectHeroMediaPicker && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Choose Media for Hero {selectHeroMediaPicker === 'hero_video_url' ? 'Video Reel' : 'Photo'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectHeroMediaPicker(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#A8AD94]">
                Click any media item below to set it as the active hero source:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaLibraryList
                  .filter((item) => {
                    if (selectHeroMediaPicker === 'hero_video_url') return item.type === 'video';
                    return item.type === 'image';
                  })
                  .map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setHeroSettings({
                          ...heroSettings,
                          [selectHeroMediaPicker]: item.url,
                          hero_media_type: selectHeroMediaPicker === 'hero_video_url' ? 'video' : 'image',
                        });
                        setSelectHeroMediaPicker(null);
                        triggerToast(`Selected ${item.name} for hero!`);
                      }}
                      className="group bg-[#1E241E] border border-white/10 hover:border-[#E3B94E] rounded-2xl overflow-hidden text-left transition flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-black/40 overflow-hidden relative">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/60">
                            <video src={item.url} className="w-full h-full object-cover opacity-75" />
                            <Play className="w-6 h-6 text-[#E3B94E] absolute fill-current" />
                          </div>
                        ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-[#A8AD94]">
                          {item.size}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-[#EAEBE8] truncate">{item.name}</p>
                        <p className="text-[9px] text-[#A8AD94]">{item.folder}</p>
                      </div>
                    </button>
                  ))}
              </div>

              {mediaLibraryList.filter((item) => selectHeroMediaPicker === 'hero_video_url' ? item.type === 'video' : item.type === 'image').length === 0 && (
                <div className="text-center py-12 text-[#A8AD94] text-xs">
                  No matching media items found. Please upload to media files first.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL: TEAM MEMBER ADD / EDIT ================= */}
        {teamModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-white/20 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    {teamModal.mode === 'add' ? 'Add Team Member' : 'Edit Team Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setTeamModal(null)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTeamMember} className="space-y-4 text-xs">
                {/* Profile Photo */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#787C68] bg-black/40 shrink-0">
                      {teamModal.preview || teamModal.member.image_url ? (
                        <img src={teamModal.preview || teamModal.member.image_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#A8AD94]">
                          Photo
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EAEBE8] text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setTeamModal({
                                ...teamModal,
                                file,
                                preview: URL.createObjectURL(file),
                              });
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          loadMediaLibrary();
                          setMediaPickerForTeam(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#E3B94E]/20 hover:bg-[#E3B94E] text-[#E3B94E] hover:text-[#232A23] text-xs font-semibold inline-flex items-center gap-1.5 transition ml-2"
                      >
                        <span>From Media Files</span>
                      </button>

                      <input
                        type="text"
                        value={teamModal.member.image_url || ''}
                        onChange={(e) => setTeamModal({
                          ...teamModal,
                          member: { ...teamModal.member, image_url: e.target.value },
                        })}
                        placeholder="Or paste profile image URL"
                        className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-1.5 text-[#EAEBE8] text-xs focus:border-[#787C68] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ghulam Muhammad Balti"
                    value={teamModal.member.name || ''}
                    onChange={(e) => setTeamModal({
                      ...teamModal,
                      member: { ...teamModal.member, name: e.target.value },
                    })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                {/* Role / Designation */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Title / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Manager & Host, Executive Chef, Chief Guide"
                    value={teamModal.member.role || ''}
                    onChange={(e) => setTeamModal({
                      ...teamModal,
                      member: { ...teamModal.member, role: e.target.value },
                    })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                {/* Bio / Description */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Bio / Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Write a brief professional background or greeting..."
                    value={teamModal.member.bio || ''}
                    onChange={(e) => setTeamModal({
                      ...teamModal,
                      member: { ...teamModal.member, bio: e.target.value },
                    })}
                    className="w-full bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={teamModal.member.sort_order || 1}
                    onChange={(e) => setTeamModal({
                      ...teamModal,
                      member: { ...teamModal.member, sort_order: parseInt(e.target.value, 10) || 1 },
                    })}
                    className="w-24 bg-[#1E241E] border border-white/10 rounded-xl px-3 py-2 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setTeamModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8AD94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTeamMember}
                    className="px-5 py-2 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-bold uppercase tracking-wider transition disabled:opacity-40"
                  >
                    {savingTeamMember ? 'Saving...' : 'Save Team Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: PICK MEDIA FOR GALLERY ================= */}
        {mediaPickerForGallery && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Select Image from Media Files
                  </h3>
                </div>
                <button
                  onClick={() => setMediaPickerForGallery(false)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaLibraryList
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setGalleryImageModal((prev) => ({
                          ...prev,
                          image: {
                            ...prev.image,
                            image_url: item.url,
                            title: prev.image.title || item.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
                          },
                          file: null,
                          preview: item.url,
                        }));
                        setMediaPickerForGallery(false);
                      }}
                      className="group bg-[#1E241E] border border-white/10 hover:border-[#E3B94E] rounded-2xl overflow-hidden text-left transition"
                    >
                      <div className="aspect-square bg-black/40 overflow-hidden relative">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-[#A8AD94]">
                          {item.size}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-[#EAEBE8] truncate">{item.name}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: PICK MEDIA FOR TEAM ================= */}
        {mediaPickerForTeam && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Select Profile Photo for Team Member
                  </h3>
                </div>
                <button
                  onClick={() => setMediaPickerForTeam(false)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaLibraryList
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setTeamModal((prev) => ({
                          ...prev,
                          member: { ...prev.member, image_url: item.url },
                          file: null,
                          preview: item.url,
                        }));
                        setMediaPickerForTeam(false);
                      }}
                      className="group bg-[#1E241E] border border-white/10 hover:border-[#E3B94E] rounded-2xl overflow-hidden text-left transition"
                    >
                      <div className="aspect-square bg-black/40 overflow-hidden relative">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-[#A8AD94]">
                          {item.size}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-[#EAEBE8] truncate">{item.name}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: PICK MEDIA FOR ROOM FEATURED ================= */}
        {mediaPickerForRoomFeatured && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Select Featured Image for Room
                  </h3>
                </div>
                <button
                  onClick={() => setMediaPickerForRoomFeatured(false)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaLibraryList
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setRoomModal((prev) => ({
                          ...prev,
                          room: { ...prev.room, featured_image: item.url },
                        }));
                        setMediaPickerForRoomFeatured(false);
                      }}
                      className="group bg-[#1E241E] border border-white/10 hover:border-[#E3B94E] rounded-2xl overflow-hidden text-left transition"
                    >
                      <div className="aspect-square bg-black/40 overflow-hidden relative">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-[#A8AD94]">
                          {item.size}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-[#EAEBE8] truncate">{item.name}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: PICK MEDIA FOR ROOM GALLERY ================= */}
        {mediaPickerForRoomGallery && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#232A23] max-w-4xl w-full p-6 rounded-3xl border border-white/20 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#E3B94E]" />
                  <h3 className="font-display text-xl text-[#EAEBE8] font-bold">
                    Select Photo to Add to Room Gallery
                  </h3>
                </div>
                <button
                  onClick={() => setMediaPickerForRoomGallery(false)}
                  className="text-[#A8AD94] hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaLibraryList
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => {
                        setRoomModal((prev) => {
                          const existing = Array.isArray(prev.room.images)
                            ? prev.room.images
                            : typeof prev.room.images === 'string'
                            ? prev.room.images.split(',').map((s) => s.trim()).filter(Boolean)
                            : [];
                          return {
                            ...prev,
                            room: { ...prev.room, images: [...existing, item.url] },
                          };
                        });
                        setMediaPickerForRoomGallery(false);
                      }}
                      className="group bg-[#1E241E] border border-white/10 hover:border-[#E3B94E] rounded-2xl overflow-hidden text-left transition"
                    >
                      <div className="aspect-square bg-black/40 overflow-hidden relative">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] bg-black/70 text-[#A8AD94]">
                          {item.size}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-semibold text-[#EAEBE8] truncate">{item.name}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
