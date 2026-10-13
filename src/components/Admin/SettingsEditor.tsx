import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Layout,
  SlidersHorizontal,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  Camera,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Link,
  Tag,
  Globe,
  Lock,
  KeyRound,
  User,
  Upload,
  EyeOff,
  Check,
  ShieldCheck,
  HelpCircle,
  Edit,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { PortalSettings, SliderSlide, Article } from '../../types';
import {
  updatePortalSettings,
  saveSliderSlide,
  deleteSliderSlide,
  DEFAULT_LOGO_URL,
  restoreDeletedSliderSlides,
} from '../../services/settingsService';
import { updateArticle } from '../../services/articleService';
import { compressImage } from '../../utils/image';
import { removeLogoBackground } from '../../utils/backgroundRemoval';

const PRESET_SLIDER_PHOTOS = [
  { label: 'Pertanian & Pangan Modern', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910a82b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Infrastruktur Jalan & Jembatan', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Transformasi Birokrasi Digital', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Layanan Kesehatan & RSUD', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pendidikan & Beasiswa Prestasi', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Pemberdayaan UMKM & Ekraf', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80' },
];

interface SettingsEditorProps {
  settings: PortalSettings;
  slides: SliderSlide[];
  articles: Article[];
  onSettingsUpdated?: () => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({
  settings,
  slides,
  articles,
  onSettingsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'header-footer' | 'html-seo' | 'slider' | 'security'>('header-footer');

  // Header & Footer form state
  const [brandName, setBrandName] = useState(settings.brandName);
  const [brandTagline, setBrandTagline] = useState(settings.brandTagline);
  const [brandLogo, setBrandLogo] = useState(settings.brandLogo);
  const [breakingAnnouncement, setBreakingAnnouncement] = useState(settings.breakingAnnouncement || '');
  const [footerAbout, setFooterAbout] = useState(settings.footerAbout);
  const [footerAddress, setFooterAddress] = useState(settings.footerAddress);
  const [footerEmail, setFooterEmail] = useState(settings.footerEmail);
  const [footerPhone, setFooterPhone] = useState(settings.footerPhone);
  const [footerCopyright, setFooterCopyright] = useState(settings.footerCopyright);
  const [sliderIntervalSeconds, setSliderIntervalSeconds] = useState(settings.sliderIntervalSeconds || 5);

  // HTML Title & HTML Favicon state
  const [htmlTitle, setHtmlTitle] = useState(settings.htmlTitle || 'Ruang Legowo - Portal Media Berita, Analisis & CMS Real-time');
  const [htmlFavicon, setHtmlFavicon] = useState(settings.htmlFavicon || DEFAULT_LOGO_URL);
  const [syncWithBrand, setSyncWithBrand] = useState(true);

  // Security Credentials state (Edit Username & Password)
  const [adminUsername, setAdminUsername] = useState(settings.adminCustomUsername || 'admin');
  const [adminPassword, setAdminPassword] = useState(settings.adminCustomPassword || 'admin');
  const [confirmPassword, setConfirmPassword] = useState(settings.adminCustomPassword || 'admin');
  const [showPassword, setShowPassword] = useState(false);

  const [savingSettings, setSavingSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto Background Removal state for Logos
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // New Slide modal/form state
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideImage, setNewSlideImage] = useState(
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  );
  const [newSlideCategory, setNewSlideCategory] = useState('Nasional');
  const [newSlideArticleId, setNewSlideArticleId] = useState('');
  const [savingSlide, setSavingSlide] = useState(false);

  // Edit Slide state
  const [editingSlide, setEditingSlide] = useState<SliderSlide | null>(null);
  const [editSlideTitle, setEditSlideTitle] = useState('');
  const [editSlideSubtitle, setEditSlideSubtitle] = useState('');
  const [editSlideImage, setEditSlideImage] = useState('');
  const [editSlideCategory, setEditSlideCategory] = useState('Nasional');
  const [editSlideArticleId, setEditSlideArticleId] = useState('');
  const [editSlideOrder, setEditSlideOrder] = useState<number>(1);
  const [editSlideIsActive, setEditSlideIsActive] = useState<boolean>(true);

  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const slideImageInputRef = useRef<HTMLInputElement | null>(null);
  const editSlideImageInputRef = useRef<HTMLInputElement | null>(null);
  const headerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const editSlideFormRef = useRef<HTMLFormElement | null>(null);

  // Keep state synchronized with incoming settings props from Firestore real-time updates
  useEffect(() => {
    if (settings) {
      setBrandName(settings.brandName || 'RUANG LEGOWO');
      setBrandTagline(settings.brandTagline || '');
      setBrandLogo(settings.brandLogo || DEFAULT_LOGO_URL);
      setBreakingAnnouncement(settings.breakingAnnouncement || '');
      setFooterAbout(settings.footerAbout || '');
      setFooterAddress(settings.footerAddress || '');
      setFooterEmail(settings.footerEmail || '');
      setFooterPhone(settings.footerPhone || '');
      setFooterCopyright(settings.footerCopyright || '');
      setSliderIntervalSeconds(settings.sliderIntervalSeconds || 5);
      setHtmlTitle(settings.htmlTitle || 'Ruang Legowo - Portal Media Berita, Analisis & CMS Real-time');
      setHtmlFavicon(settings.htmlFavicon || DEFAULT_LOGO_URL);
      setAdminUsername(settings.adminCustomUsername || 'admin');
      setAdminPassword(settings.adminCustomPassword || 'admin');
      setConfirmPassword(settings.adminCustomPassword || 'admin');
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Start editing a slide
  const handleStartEditSlide = (slide: SliderSlide) => {
    setEditingSlide(slide);
    setEditSlideTitle(slide.title);
    setEditSlideSubtitle(slide.subtitle || '');
    setEditSlideImage(slide.imageUrl);
    setEditSlideCategory(slide.category || 'Nasional');
    setEditSlideArticleId(slide.articleId || '');
    setEditSlideOrder(slide.order || 1);
    setEditSlideIsActive(slide.isActive !== false);
    setIsAddingSlide(false);
    setTimeout(() => {
      editSlideFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Process edit slide image upload
  const handleEditSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1280, 720, 0.85);
      setEditSlideImage(dataUrl);
      showToast('Gambar slide berhasil dimuat dari file & dioptimalkan!');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setEditSlideImage(dataUrl);
        showToast('Gambar slide berhasil dimuat dari file!');
      };
      reader.readAsDataURL(file);
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Save edited slide
  const handleSaveEditedSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    if (!editSlideTitle.trim() || !editSlideImage.trim()) {
      alert('Judul dan URL Gambar slide wajib diisi.');
      return;
    }

    setSavingSlide(true);
    try {
      await saveSliderSlide({
        id: editingSlide.id,
        title: editSlideTitle.trim(),
        subtitle: editSlideSubtitle.trim(),
        imageUrl: editSlideImage.trim(),
        category: editSlideCategory,
        articleId: editSlideArticleId || undefined,
        order: Number(editSlideOrder) || 1,
        isActive: editSlideIsActive,
      });

      // Jika slide terhubung ke artikel berita, perbarui foto utama artikel agar selalu seragam
      if (editSlideArticleId) {
        try {
          await updateArticle(editSlideArticleId, {
            featuredImage: editSlideImage.trim(),
          });
        } catch (syncErr) {
          console.warn('Sync foto ke artikel berita:', syncErr);
        }
      }

      showToast('Perubahan slide foto berhasil disimpan secara permanen di database!');
      setEditingSlide(null);
    } catch (err) {
      console.error('Gagal memperbarui slide:', err);
      alert('Terjadi kesalahan saat memperbarui slide foto.');
    } finally {
      setSavingSlide(false);
    }
  };

  // Quick preset initialization for slides from top published articles
  const handleInitPresetSlides = async () => {
    const published = articles.filter((a) => Boolean(a.featuredImage));
    if (published.length === 0) {
      alert('Tidak ada artikel dengan gambar untuk dijadikan slide.');
      return;
    }
    setSavingSlide(true);
    try {
      const toSeed = published.slice(0, 4);
      for (let i = 0; i < toSeed.length; i++) {
        const art = toSeed[i];
        await saveSliderSlide({
          title: art.title,
          subtitle: art.summary,
          imageUrl: art.featuredImage,
          category: art.category,
          articleId: art.id,
          order: i + 1,
          isActive: true,
        });
      }
      showToast('Berhasil memuat 4 slide foto permanen dari berita database!');
    } catch (err) {
      console.error('Gagal memuat preset slide:', err);
    } finally {
      setSavingSlide(false);
    }
  };

  // Process favicon upload with automatic background removal
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRemovingBg(true);
    try {
      let processedDataUrl: string;
      if (autoRemoveBg) {
        try {
          processedDataUrl = await removeLogoBackground(file, { tolerance: 38, feather: true });
          showToast('✨ Background logo HTML / Favicon berhasil dihapus otomatis (Transparan)!');
        } catch (bgErr) {
          console.warn('Fallback standard compression for favicon:', bgErr);
          processedDataUrl = await compressImage(file, 128, 128, 0.9);
          showToast('Logo HTML / Favicon berhasil dimuat dari file!');
        }
      } else {
        processedDataUrl = await compressImage(file, 128, 128, 0.9);
        showToast('Logo HTML / Favicon berhasil dimuat dari file!');
      }
      setHtmlFavicon(processedDataUrl);
      if (syncWithBrand) {
        setBrandLogo(processedDataUrl);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setHtmlFavicon(dataUrl);
        if (syncWithBrand) setBrandLogo(dataUrl);
        showToast('Logo HTML / Favicon berhasil dimuat dari file!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsRemovingBg(false);
      if (e.target) e.target.value = '';
    }
  };

  // Process slide image upload
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1280, 720, 0.85);
      setNewSlideImage(dataUrl);
      showToast('Gambar slide berhasil dimuat dari file & dioptimalkan!');
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNewSlideImage(dataUrl);
        showToast('Gambar slide berhasil dimuat dari file!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Process header logo upload with automatic background removal
  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRemovingBg(true);
    try {
      let processedDataUrl: string;
      if (autoRemoveBg) {
        try {
          processedDataUrl = await removeLogoBackground(file, { tolerance: 38, feather: true });
          showToast('✨ Background logo beranda & dashboard berhasil dihapus otomatis (Transparan)!');
        } catch (bgErr) {
          console.warn('Fallback standard compression for logo:', bgErr);
          processedDataUrl = await compressImage(file, 256, 256, 0.9);
          showToast('Logo Media berhasil diperbarui dari file!');
        }
      } else {
        processedDataUrl = await compressImage(file, 256, 256, 0.9);
        showToast('Logo Media berhasil diperbarui dari file!');
      }
      setBrandLogo(processedDataUrl);
      if (syncWithBrand) {
        setHtmlFavicon(processedDataUrl);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setBrandLogo(dataUrl);
        showToast('Logo Media berhasil diperbarui dari file!');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsRemovingBg(false);
      if (e.target) e.target.value = '';
    }
  };

  // Manual Trigger: Hapus Background dari Brand Logo saat ini
  const handleRemoveBrandLogoBgNow = async () => {
    if (!brandLogo) return;
    setIsRemovingBg(true);
    try {
      const transparentDataUrl = await removeLogoBackground(brandLogo, { tolerance: 38, feather: true });
      setBrandLogo(transparentDataUrl);
      if (syncWithBrand) setHtmlFavicon(transparentDataUrl);
      showToast('✨ Background logo beranda & dashboard berhasil dihapus (Transparan)!');
    } catch (err) {
      console.error('Gagal menghapus background logo:', err);
      alert('Gagal memproses gambar logo untuk penghapusan background.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Manual Trigger: Hapus Background dari Favicon saat ini
  const handleRemoveFaviconBgNow = async () => {
    if (!htmlFavicon) return;
    setIsRemovingBg(true);
    try {
      const transparentDataUrl = await removeLogoBackground(htmlFavicon, { tolerance: 38, feather: true });
      setHtmlFavicon(transparentDataUrl);
      if (syncWithBrand) setBrandLogo(transparentDataUrl);
      showToast('✨ Background logo HTML / favicon berhasil dihapus (Transparan)!');
    } catch (err) {
      console.error('Gagal menghapus background favicon:', err);
      alert('Gagal memproses gambar favicon.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Save Header & Footer
  const handleSaveHeaderFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updatePortalSettings({
        brandName: brandName.trim(),
        brandTagline: brandTagline.trim(),
        brandLogo: brandLogo.trim(),
        breakingAnnouncement: breakingAnnouncement.trim(),
        footerAbout: footerAbout.trim(),
        footerAddress: footerAddress.trim(),
        footerEmail: footerEmail.trim(),
        footerPhone: footerPhone.trim(),
        footerCopyright: footerCopyright.trim(),
        sliderIntervalSeconds,
      });
      showToast('Pengaturan Header & Footer berhasil diperbarui!');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error('Gagal memperbarui pengaturan:', err);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Save HTML Title & HTML Logo
  const handleSaveHtmlSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlTitle.trim()) {
      alert('Nama judul HTML tidak boleh kosong.');
      return;
    }
    setSavingSettings(true);
    try {
      const updates: Partial<PortalSettings> = {
        htmlTitle: htmlTitle.trim(),
        htmlFavicon: htmlFavicon.trim(),
      };
      if (syncWithBrand) {
        updates.brandLogo = htmlFavicon.trim();
        updates.brandName = htmlTitle.includes('-') ? htmlTitle.split('-')[0].trim() : brandName;
      }
      await updatePortalSettings(updates);
      showToast('Nama HTML & Logo HTML (Favicon) berhasil diperbarui permanen di database!');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error('Gagal menyimpan pengaturan HTML:', err);
      alert('Terjadi kesalahan saat menyimpan pengaturan HTML.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Save Security Credentials (Username & Password)
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) {
      alert('Username admin tidak boleh kosong.');
      return;
    }
    if (adminPassword && adminPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }
    if (adminPassword && adminPassword.length < 4) {
      alert('Kata sandi minimal 4 karakter.');
      return;
    }

    setSavingSettings(true);
    try {
      await updatePortalSettings({
        adminCustomUsername: adminUsername.trim(),
        adminCustomPassword: adminPassword.trim(),
      });
      showToast('Kredensial Username & Password Admin berhasil diperbarui!');
      if (onSettingsUpdated) onSettingsUpdated();
    } catch (err) {
      console.error('Gagal menyimpan kredensial:', err);
      alert('Terjadi kesalahan saat menyimpan kredensial admin.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideTitle.trim() || !newSlideImage.trim()) {
      alert('Judul dan URL Gambar slide wajib diisi.');
      return;
    }

    setSavingSlide(true);
    try {
      await saveSliderSlide({
        title: newSlideTitle.trim(),
        subtitle: newSlideSubtitle.trim(),
        imageUrl: newSlideImage.trim(),
        category: newSlideCategory,
        articleId: newSlideArticleId || undefined,
        order: slides.length + 1,
        isActive: true,
      });
      showToast('Slide foto baru berhasil ditambahkan ke database!');
      setNewSlideTitle('');
      setNewSlideSubtitle('');
      setIsAddingSlide(false);
    } catch (err) {
      console.error('Gagal menambahkan slide:', err);
    } finally {
      setSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string, articleId?: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus slide foto ini secara permanen dari slider beranda?')) return;
    try {
      await deleteSliderSlide(id, articleId);
      showToast('✓ Slide foto berhasil dihapus permanen dari slider beranda!');
    } catch (err) {
      console.error('Gagal menghapus slide:', err);
      alert('Terjadi kesalahan saat menghapus slide foto.');
    }
  };

  const handleToggleSlideActive = async (slide: SliderSlide) => {
    try {
      await saveSliderSlide({
        ...slide,
        isActive: !slide.isActive,
      });
      showToast(`Slide ${slide.isActive ? 'dinonaktifkan' : 'diaktifkan'}!`);
    } catch (err) {
      console.error('Gagal mengubah status slide:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 border border-sky-500 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sub navigation buttons */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-sm px-4 pt-2 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('header-footer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'header-footer'
              ? 'border-sky-600 text-sky-800 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Header & Footer Portal</span>
        </button>

        <button
          onClick={() => setActiveTab('html-seo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'html-seo'
              ? 'border-sky-600 text-sky-800 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-600" />
          <span>Nama HTML & Logo HTML (Favicon)</span>
          <span className="px-1.5 py-0.2 bg-cyan-100 text-cyan-800 text-[9px] rounded-xs font-bold">Baru</span>
        </button>

        <button
          onClick={() => setActiveTab('slider')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'slider'
              ? 'border-sky-600 text-sky-800 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Edit Slider Foto ({slides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-sky-600 text-sky-800 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>Edit Username & Password</span>
          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded-xs font-bold">Keamanan</span>
        </button>
      </div>

      {/* TAB 1: HEADER & FOOTER SETTINGS */}
      {activeTab === 'header-footer' && (
        <form onSubmit={handleSaveHeaderFooter} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Kustomisasi Header Media
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah nama brand, slogan, logo, dan teks pengumuman bilah atas secara live.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-xs border border-sky-200">
                Live Update
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Portal Berita / Media
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  placeholder="RUANG LEGOWO"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Slogan / Tagline Media
                </label>
                <input
                  type="text"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  placeholder="Portal Media Berita, Analisis & Opini Terbuka"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Logo Media Beranda & Dashboard
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBrandLogo(DEFAULT_LOGO_URL)}
                      className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                    >
                      Gunakan Logo Default
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => headerLogoInputRef.current?.click()}
                      disabled={isRemovingBg}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 rounded-xs border border-sky-200 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Baru</span>
                    </button>
                  </div>
                </div>

                {/* Fitur Hapus Background Otomatis Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 rounded-sm">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoRemoveBg}
                      onChange={(e) => setAutoRemoveBg(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                      <Wand2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>Hapus background otomatis saat upload (Transparan PNG)</span>
                    </div>
                  </label>
                  <span className="text-[10px] bg-sky-200/80 text-sky-900 font-bold px-2 py-0.5 rounded-full shrink-0">
                    {autoRemoveBg ? '✓ Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <input
                  type="file"
                  ref={headerLogoInputRef}
                  onChange={handleHeaderLogoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  placeholder="/src/assets/images/... atau data:image/png;base64,..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none font-mono"
                />

                {/* Previews & Instant Background Remover */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Checkered Transparent Preview */}
                    <div
                      className="w-12 h-12 rounded-sm border border-slate-300 overflow-hidden p-1 shadow-2xs flex items-center justify-center shrink-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
                        backgroundColor: '#ffffff',
                      }}
                      title="Pratinjau Transparansi (Checkered Canvas)"
                    >
                      <img src={brandLogo} alt="Pratinjau Logo" className="w-full h-full object-contain filter drop-shadow-xs" />
                    </div>

                    {/* Live Header Blue Preview */}
                    <div
                      className="h-12 px-3 rounded-sm bg-blue-700 border border-blue-800 shadow-2xs flex items-center gap-2 shrink-0"
                      title="Pratinjau Live pada Header Biru Beranda & Dashboard"
                    >
                      <img src={brandLogo} alt="Pratinjau Biru" className="w-8 h-8 object-contain filter drop-shadow-xs" />
                      <div className="hidden sm:block text-left leading-tight">
                        <span className="text-[10px] font-extrabold text-white block">RUANG LEGOWO</span>
                        <span className="text-[8px] text-blue-200 block">Header Beranda & Dashboard</span>
                      </div>
                    </div>
                  </div>

                  {/* Button: Hapus Background Logo Ini Sekarang */}
                  <button
                    type="button"
                    onClick={handleRemoveBrandLogoBgNow}
                    disabled={isRemovingBg}
                    className="w-full sm:w-auto px-3 py-1.5 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Hapus background gambar logo saat ini menjadi transparan"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isRemovingBg ? 'animate-spin' : ''}`} />
                    <span>{isRemovingBg ? 'Memproses Background...' : 'Hapus Background Logo Sekarang'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teks Pengumuman Ticker Berjalan (Override)
                </label>
                <input
                  type="text"
                  value={breakingAnnouncement}
                  onChange={(e) => setBreakingAnnouncement(e.target.value)}
                  placeholder="Pengumuman penting redaksi..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kosongkan jika ingin menampilkan judul breaking news secara otomatis.
                </span>
              </div>
            </div>
          </div>

          {/* Footer Card */}
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Kustomisasi Footer & Kontak Redaksi
              </h3>
              <p className="text-xs text-slate-500">
                Atur informasi profil redaksi, alamat kantor, kontak, dan teks hak cipta.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deskripsi Singkat Profil Media (Tentang Redaksi)
              </label>
              <textarea
                rows={2}
                value={footerAbout}
                onChange={(e) => setFooterAbout(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Kantor Redaksi
                </label>
                <input
                  type="text"
                  value={footerAddress}
                  onChange={(e) => setFooterAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Redaksi
                </label>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Telepon Redaksi
                </label>
                <input
                  type="text"
                  value={footerPhone}
                  onChange={(e) => setFooterPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teks Hak Cipta (Copyright Notice)
              </label>
              <input
                type="text"
                value={footerCopyright}
                onChange={(e) => setFooterCopyright(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm shadow-md transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Menyimpan...' : 'Simpan Perubahan Header & Footer'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: FITUR EDIT NAMA HTML & LOGO HTML (FAVICON) */}
      {activeTab === 'html-seo' && (
        <form onSubmit={handleSaveHtmlSettings} className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-600" />
                  Pengaturan Nama HTML & Logo HTML (Favicon Browser)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur judul tab peramban (Document Title) dan Logo HTML (Favicon) yang berlaku universal untuk menu beranda publik maupun dashboard administrator.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-xs border border-emerald-200">
                Beranda & Administrator
              </span>
            </div>

            {/* Simulated Browser Tab Live Preview */}
            <div className="p-4 bg-slate-100 border border-slate-300 rounded-md">
              <span className="text-[11px] font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                Simulasi Tampilan Tab Browser:
              </span>
              
              <div className="bg-slate-200 p-2 rounded-t-lg border-b border-slate-300 flex items-center gap-2">
                {/* Simulated Tab */}
                <div className="bg-white px-3 py-1.5 rounded-t-md shadow-xs flex items-center gap-2 max-w-sm border-t-2 border-sky-600">
                  <img
                    src={htmlFavicon}
                    alt="Favicon"
                    className="w-4 h-4 rounded-2xs object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_LOGO_URL;
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                    {htmlTitle || 'Ruang Legowo'}
                  </span>
                  <span className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer ml-1">✕</span>
                </div>
                <span className="text-xs text-slate-400">+</span>
              </div>
              <div className="bg-white p-2 text-[11px] text-slate-400 border border-t-0 border-slate-300 rounded-b-md font-mono flex items-center gap-2">
                <span className="text-emerald-600 font-bold">🔒 https://</span>
                <span className="text-slate-600">ruanglegowo.id/</span>
              </div>
            </div>

            {/* Input Nama HTML */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Nama HTML / Judul Dokumen (Document Title) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={htmlTitle}
                onChange={(e) => setHtmlTitle(e.target.value)}
                required
                placeholder="Ruang Legowo - Portal Media Berita & CMS Real-time"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Teks ini langsung menjadi judul halaman HTML pada tab browser dan snippet pencarian Google.
              </span>
            </div>

            {/* Input & Upload Logo HTML (Favicon) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Logo HTML / Favicon Browser (Ikon Tab Browser)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHtmlFavicon(DEFAULT_LOGO_URL)}
                    className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                  >
                    Gunakan Logo Default Ruang Legowo
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isRemovingBg}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 hover:text-sky-900 px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded-xs border border-sky-200 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File Favicon</span>
                  </button>
                </div>
              </div>

              {/* Fitur Hapus Background Otomatis Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 rounded-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRemoveBg}
                    onChange={(e) => setAutoRemoveBg(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                    <Wand2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Hapus background otomatis saat upload (Transparan PNG)</span>
                  </div>
                </label>
                <span className="text-[10px] bg-sky-200/80 text-sky-900 font-bold px-2 py-0.5 rounded-full shrink-0">
                  {autoRemoveBg ? '✓ Aktif' : 'Nonaktif'}
                </span>
              </div>

              <input
                type="file"
                ref={faviconInputRef}
                onChange={handleFaviconUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-sm border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
                    backgroundSize: '10px 10px',
                    backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0',
                    backgroundColor: '#ffffff',
                  }}
                  title="Pratinjau Favicon Transparan"
                >
                  <img
                    src={htmlFavicon}
                    alt="Pratinjau Favicon"
                    className="w-8 h-8 object-contain filter drop-shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_LOGO_URL;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={htmlFavicon}
                    onChange={(e) => setHtmlFavicon(e.target.value)}
                    placeholder="URL atau data base64 ikon favicon..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none font-mono"
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">
                      Ikon ini tampil di tab peramban browser dan penanda tautan.
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFaviconBgNow}
                      disabled={isRemovingBg}
                      className="px-2.5 py-1 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-[11px] font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Wand2 className={`w-3 h-3 ${isRemovingBg ? 'animate-spin' : ''}`} />
                      <span>{isRemovingBg ? 'Memproses...' : 'Hapus Background Favicon'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync checkbox option */}
            <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncWithBrandCheck"
                  checked={syncWithBrand}
                  onChange={(e) => setSyncWithBrand(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="syncWithBrandCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Sinkronkan otomatis Logo HTML (Favicon) & Nama HTML ke Logo Brand Header/Footer Beranda
                </label>
              </div>
              <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-semibold shrink-0">
                Otomatis Seragam
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm shadow-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Menyimpan...' : 'Simpan Nama HTML & Logo HTML Permanen'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: SLIDER PHOTO MANAGEMENT */}
      {activeTab === 'slider' && (
        <div className="space-y-6">
          {/* Slider Global Options */}
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Pengaturan Kecepatan Auto-Slide
              </h3>
              <p className="text-xs text-slate-500">
                Tentukan interval detik perpindahan otomatis tiap foto slide berita.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Durasi Slide:</label>
              <select
                value={sliderIntervalSeconds}
                onChange={async (e) => {
                  const val = Number(e.target.value);
                  setSliderIntervalSeconds(val);
                  await updatePortalSettings({ sliderIntervalSeconds: val });
                  showToast(`Interval slider diubah menjadi ${val} detik!`);
                }}
                className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-sm bg-white text-slate-800"
              >
                <option value={3}>3 Detik (Cepat)</option>
                <option value={5}>5 Detik (Standar Rekomendasi)</option>
                <option value={7}>7 Detik (Santai)</option>
                <option value={10}>10 Detik (Lambat)</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInitPresetSlides}
                  disabled={savingSlide}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-sm transition-colors cursor-pointer"
                  title="Ambil foto dari berita utama untuk dijadikan slide tersimpan"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
                  <span>Muat Preset dari Berita</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingSlide(!isAddingSlide)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Slide Foto Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form to Edit Existing Slide (FITUR EDIT SLIDER FOTO) */}
          {editingSlide && (
            <form
              ref={editSlideFormRef}
              onSubmit={handleSaveEditedSlide}
              className="bg-amber-50/90 border-2 border-amber-400 rounded-sm p-6 shadow-md space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <Edit className="w-4 h-4 text-amber-700" />
                  <span>Edit Slide Foto: "{editingSlide.title}"</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">
                    ID: {editingSlide.id}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Slide Foto:</label>
                  <input
                    type="text"
                    required
                    placeholder="Judul tayangan foto..."
                    value={editSlideTitle}
                    onChange={(e) => setEditSlideTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul / Deskripsi Singkat:</label>
                  <input
                    type="text"
                    placeholder="Keterangan singkat momen foto..."
                    value={editSlideSubtitle}
                    onChange={(e) => setEditSlideSubtitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kanal Kategori:</label>
                  <select
                    value={editSlideCategory}
                    onChange={(e) => setEditSlideCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  >
                    {['Nasional', 'Politik', 'Ekonomi', 'Teknologi', 'Sains', 'Olahraga', 'Gaya Hidup', 'Hiburan'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urutan Tampil (Order):</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={editSlideOrder}
                    onChange={(e) => setEditSlideOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Penayangan:</label>
                  <select
                    value={editSlideIsActive ? 'aktif' : 'nonaktif'}
                    onChange={(e) => setEditSlideIsActive(e.target.value === 'aktif')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  >
                    <option value="aktif">Aktif (Tayang di Slider Beranda)</option>
                    <option value="nonaktif">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Foto Slide (File Upload atau URL / Path Gambar):</label>
                  <button
                    type="button"
                    onClick={() => editSlideImageInputRef.current?.click()}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 rounded-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Baru dari Perangkat</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={editSlideImageInputRef}
                  onChange={handleEditSlideImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  required
                  placeholder="https://... atau data:image/... atau path gambar"
                  value={editSlideImage}
                  onChange={(e) => setEditSlideImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white font-mono"
                />

                {/* Quick-pick Preset Inspiration Photos */}
                <div className="mt-2.5 pt-2 border-t border-amber-200/70">
                  <span className="text-[10px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                    Pilihan Cepat Foto Inspirasi Inovasi Bojonegoro:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SLIDER_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditSlideImage(p.url);
                          showToast(`Foto "${p.label}" dipilih!`);
                        }}
                        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-xs transition-colors cursor-pointer border ${
                          editSlideImage === p.url
                            ? 'bg-amber-200 border-amber-600 text-amber-950 font-bold'
                            : 'bg-white border-slate-200 hover:border-amber-400 text-slate-700'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-4 h-4 object-cover rounded-2xs" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {editSlideImage && (
                  <div className="mt-3 flex items-center gap-3 bg-white p-2.5 border border-amber-300 rounded-xs shadow-2xs">
                    <img
                      src={editSlideImage}
                      alt="Preview"
                      className="w-24 h-16 object-cover rounded-xs border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Pratinjau Foto Slide</span>
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                        ✓ Foto valid & siap disimpan ke database slider beranda
                      </span>
                      <button
                        type="button"
                        onClick={() => editSlideImageInputRef.current?.click()}
                        className="text-[10px] font-bold text-sky-700 hover:underline mt-1 block"
                      >
                        Ganti dengan foto lain dari galeri perangkat ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-300">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSlide}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-sm shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSlide ? 'Menyimpan...' : 'Simpan Perubahan Slide Permanen'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Form to Add New Slide */}
          {isAddingSlide && (
            <form
              onSubmit={handleCreateSlide}
              className="bg-sky-50/70 border border-sky-200 rounded-sm p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-sky-700" />
                  Formulir Tambah Slide Foto Kustom
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingSlide(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  ✕ Tutup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Slide Foto:</label>
                  <input
                    type="text"
                    required
                    placeholder="Judul tayangan foto..."
                    value={newSlideTitle}
                    onChange={(e) => setNewSlideTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subjudul / Deskripsi Singkat:</label>
                  <input
                    type="text"
                    placeholder="Keterangan singkat momen foto..."
                    value={newSlideSubtitle}
                    onChange={(e) => setNewSlideSubtitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Foto Slide (File Upload atau URL / Path Gambar):</label>
                  <button
                    type="button"
                    onClick={() => slideImageInputRef.current?.click()}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto dari Perangkat</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={slideImageInputRef}
                  onChange={handleSlideImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  required
                  placeholder="https://... atau data:image/... atau path gambar"
                  value={newSlideImage}
                  onChange={(e) => setNewSlideImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm bg-white font-mono"
                />

                {/* Quick-pick Preset Inspiration Photos */}
                <div className="mt-2 pt-2 border-t border-sky-200/60">
                  <span className="text-[10px] font-bold text-slate-600 block mb-1 uppercase tracking-wide">
                    Pilihan Cepat Foto Inspirasi Inovasi Bojonegoro:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SLIDER_PHOTOS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewSlideImage(p.url);
                          showToast(`Foto "${p.label}" dipilih!`);
                        }}
                        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-xs transition-colors cursor-pointer border ${
                          newSlideImage === p.url
                            ? 'bg-sky-200 border-sky-600 text-sky-950 font-bold'
                            : 'bg-white border-slate-200 hover:border-sky-400 text-slate-700'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-4 h-4 object-cover rounded-2xs" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {newSlideImage && (
                  <div className="mt-2.5 flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-xs">
                    <img src={newSlideImage} alt="Preview" className="w-20 h-14 object-cover rounded-2xs border border-slate-200" />
                    <span className="text-[11px] text-slate-600 font-medium">Pratinjau Foto Slide Siap Ditambahkan</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSlide(false)}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSlide}
                  className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-sm shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {savingSlide ? 'Menyimpan...' : 'Simpan Slide Baru'}
                </button>
              </div>
            </form>
          )}

          {/* List of custom slides */}
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs">
            {(() => {
              const deletedSet = new Set(settings.deletedSlideIds || []);
              const visibleCustomSlides = slides.filter(
                (s) => !deletedSet.has(s.id) && !(s.articleId && deletedSet.has(s.articleId))
              );
              const visiblePresetArticles = articles
                .filter((a) => Boolean(a.featuredImage) && !deletedSet.has(a.id) && !deletedSet.has(`slide-custom-${a.id}`))
                .slice(0, 6);

              const isCustomMode = visibleCustomSlides.length > 0;
              const currentCount = isCustomMode ? visibleCustomSlides.length : visiblePresetArticles.length;

              return (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span>Daftar Slide Foto Aktif ({currentCount} Slide Tayang di Beranda)</span>
                        {deletedSet.size > 0 && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                            {deletedSet.size} Dihapus Permanen
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Kelola atau hapus slide foto beranda secara permanen. Foto yang dihapus tidak akan muncul kembali di slider beranda.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {deletedSet.size > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Pulihkan kembali semua slide foto yang telah dihapus permanen?')) {
                              await restoreDeletedSliderSlides();
                              showToast('✓ Seluruh slide foto yang pernah dihapus berhasil dipulihkan!');
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xs transition-colors cursor-pointer border border-rose-200"
                          title="Kembalikan slide yang sebelumnya dihapus"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Pulihkan ({deletedSet.size}) Slide</span>
                        </button>
                      )}

                      {slides.length === 0 && (
                        <button
                          type="button"
                          onClick={handleInitPresetSlides}
                          disabled={savingSlide}
                          className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Aktifkan Semua Menjadi Slide Kustom</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {currentCount === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-sm">
                      <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <h5 className="text-sm font-bold text-slate-700">Semua Slide Foto Telah Dihapus</h5>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Slider foto beranda saat ini kosong. Anda dapat menambahkan foto slide kustom baru menggunakan tombol "Tambah Slide Foto Baru" di atas atau memulihkan slide yang dihapus.
                      </p>
                      {deletedSet.size > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            await restoreDeletedSliderSlides();
                            showToast('✓ Slide berhasil dipulihkan!');
                          }}
                          className="mt-4 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-sm cursor-pointer"
                        >
                          Pulihkan Slide Default Berita
                        </button>
                      )}
                    </div>
                  ) : !isCustomMode ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-sm flex items-center justify-between gap-3 text-xs text-sky-900">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-sky-700 shrink-0" />
                          <span>
                            Slider beranda menampilkan berita inovasi Bojonegoro. Anda dapat mengedit foto atau mengklik ikon sampah <Trash2 className="w-3 h-3 inline text-rose-600" /> untuk <strong>menghapusnya secara permanen</strong>.
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visiblePresetArticles.map((art, idx) => (
                          <div
                            key={art.id}
                            className="border border-slate-200 rounded-sm overflow-hidden flex gap-3 p-3 bg-white hover:border-sky-300 transition-colors items-center justify-between shadow-2xs"
                          >
                            <img
                              src={art.featuredImage}
                              alt={art.title}
                              className="w-20 h-16 object-cover rounded-xs shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-sky-700 uppercase">{art.category}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                                  Slide #{idx + 1}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-800 truncate">{art.title}</h5>
                              <p className="text-[11px] text-slate-500 truncate">{art.summary}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditSlide({
                                  id: `slide-custom-${art.id}`,
                                  title: art.title,
                                  subtitle: art.summary,
                                  imageUrl: art.featuredImage,
                                  category: art.category,
                                  articleId: art.id,
                                  order: idx + 1,
                                  isActive: true,
                                })}
                                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xs transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-2xs"
                                title="Ganti atau Edit Foto Slide Ini"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(`slide-custom-${art.id}`, art.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-xs cursor-pointer border border-transparent hover:border-rose-200 transition-colors"
                                title="Hapus Slide Ini Secara Permanen dari Slider Beranda"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleCustomSlides.map((slide) => (
                        <div
                          key={slide.id}
                          className="border border-slate-200 rounded-sm overflow-hidden flex gap-3 p-3 bg-slate-50 items-center justify-between shadow-2xs hover:border-sky-300 transition-colors"
                        >
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-20 h-16 object-cover rounded-xs shrink-0 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-sky-700 uppercase">{slide.category}</span>
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                                Urutan #{slide.order}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 truncate">{slide.title}</h5>
                            <p className="text-[11px] text-slate-500 truncate">{slide.subtitle}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleStartEditSlide(slide)}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xs transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shadow-2xs"
                              title="Edit Foto & Konten Slide Ini"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Foto</span>
                            </button>
                            <button
                              onClick={() => handleToggleSlideActive(slide)}
                              className={`px-2 py-1.5 text-[10px] font-bold rounded-xs cursor-pointer ${
                                slide.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-200 text-slate-600 border border-slate-300'
                              }`}
                              title="Ubah Status Aktif/Nonaktif"
                            >
                              {slide.isActive ? 'Aktif' : 'Nonaktif'}
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(slide.id, slide.articleId)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-xs cursor-pointer border border-transparent hover:border-rose-200 transition-colors"
                              title="Hapus Slide Ini Secara Permanen dari Slider Beranda"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: FITUR EDIT USERNAME & PASSWORD ADMIN */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="space-y-6">
          <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Kredensial Akses CMS (Username & Password)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah username dan kata sandi admin CMS secara mandiri. Kredensial tersimpan di database untuk login berikutnya.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-xs border border-amber-200">
                Keamanan
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username Admin / Redaktur
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ketik username baru..."
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Username yang digunakan untuk autentikasi modal login CMS.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi (Password) Baru
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-sky-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ketik kata sandi baru (minimal 4 karakter)..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ulangi Kata Sandi (Konfirmasi)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi kata sandi baru..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xs text-[11px] text-sky-900 leading-relaxed">
              💡 <strong>Tips:</strong> Setelah disimpan, pastikan Anda mengingat username dan kata sandi baru ini. Anda akan diminta memasukkan kredensial ini ketika login ke CMS.
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm shadow-md transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Menyimpan...' : 'Simpan Username & Password Baru'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
