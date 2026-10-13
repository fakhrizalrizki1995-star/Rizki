import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Flame,
  Star,
  Sparkles,
  Link,
  Tag,
  AlignLeft,
  Heading,
  Quote,
  List,
  CheckCircle2,
  Upload,
  X,
  Eye,
  Plus,
  Globe,
  ExternalLink,
  Newspaper,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { Article, ArticleCategory, ArticleStatus } from '../../types';
import { calculateSeoScore, generateSlug } from '../../utils/seo';
import { SeoAuditPanel } from './SeoAuditPanel';
import { createArticle, updateArticle } from '../../services/articleService';
import { BatikRibbon, BatikMedallion } from '../BatikOrnament';

interface ArticleEditorProps {
  initialArticle?: Article | null;
  onSaveSuccess: (article: Article) => void;
  onCancel: () => void;
}

const CATEGORIES: ArticleCategory[] = [
  'Politik',
  'Ekonomi',
  'Teknologi',
  'Sains',
  'Gaya Hidup',
  'Hiburan',
  'Olahraga',
  'Nasional',
];

const CURATED_IMAGE_PRESETS: { label: string; url: string; category: string }[] = [
  {
    label: 'Teknologi & Server AI',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    category: 'Teknologi',
  },
  {
    label: 'Ekonomi & Pelabuhan Ekspor',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    category: 'Ekonomi',
  },
  {
    label: 'Gedung Parlemen / Politik',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    category: 'Politik',
  },
  {
    label: 'Koral & Riset Laut',
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80',
    category: 'Sains',
  },
  {
    label: 'Olahraga & Lapangan Stadion',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    category: 'Olahraga',
  },
  {
    label: 'Gaya Hidup Urban Sehat',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    category: 'Gaya Hidup',
  },
  {
    label: 'Sinema & Panggung Seni',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    category: 'Hiburan',
  },
  {
    label: 'Ibu Kota & Pembangunan Nasional',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80',
    category: 'Nasional',
  },
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialArticle && initialArticle.id);

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!initialArticle);
  const [summary, setSummary] = useState(initialArticle?.summary || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [category, setCategory] = useState<ArticleCategory>(initialArticle?.category || 'Teknologi');
  const [featuredImage, setFeaturedImage] = useState(
    initialArticle?.featuredImage || CURATED_IMAGE_PRESETS[0].url
  );
  const [imageCaption, setImageCaption] = useState(initialArticle?.imageCaption || '');
  const [authorName, setAuthorName] = useState(initialArticle?.authorName || 'Redaksi Ruang Legowo');
  const [authorRole, setAuthorRole] = useState(initialArticle?.authorRole || 'Redaktur Pelaksana');
  const [status, setStatus] = useState<ArticleStatus>(initialArticle?.status || 'published');
  const [isBreaking, setIsBreaking] = useState(initialArticle?.isBreaking || false);
  const [isFeatured, setIsFeatured] = useState(initialArticle?.isFeatured || false);
  const [focusKeyword, setFocusKeyword] = useState(initialArticle?.focusKeyword || '');
  const [tagsInput, setTagsInput] = useState((initialArticle?.tags || ['Berita', 'Ruang Legowo']).join(', '));
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialArticle?.readTimeMinutes || 3);

  // New features requested by user:
  // 1. Pembuat berita semula & Link berita awal
  const [originalSource, setOriginalSource] = useState(initialArticle?.originalSource || '');
  const [originalUrl, setOriginalUrl] = useState(initialArticle?.originalUrl || '');

  // 2. Tambah tayangan (views)
  const [viewsCount, setViewsCount] = useState<number>(initialArticle?.views || 0);

  // 3. Upload gambar pembuatan berita
  const [imageInputTab, setImageInputTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-generate slug when title changes if autoSlug enabled
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  // Calculate SEO Score in Real Time
  const seoAudit = useMemo(() => {
    return calculateSeoScore(title, slug, summary, content, focusKeyword);
  }, [title, slug, summary, content, focusKeyword]);

  // Insert helper for rich text content
  const insertContentSnippet = (snippet: string) => {
    setContent((prev) => `${prev}\n\n${snippet}`);
  };

  // Image Upload Handler with client-side canvas compression to ensure light size in DB
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image if larger than 1000px wide for optimal database performance
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFeaturedImage(compressedDataUrl);
          setUploadedImageName(`${file.name} (${Math.round(compressedDataUrl.length / 1024)} KB)`);
        }
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      alert('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul berita tidak boleh kosong.');
      return;
    }
    if (!content.trim()) {
      alert('Konten berita tidak boleh kosong.');
      return;
    }

    setSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const articleData: Omit<Article, 'id'> = {
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      summary: summary.trim(),
      content: content.trim(),
      category,
      featuredImage: featuredImage.trim() || CURATED_IMAGE_PRESETS[0].url,
      imageCaption: imageCaption.trim() || '',
      authorName: authorName.trim() || 'Redaksi Ruang Legowo',
      authorRole: authorRole.trim() || 'Redaktur Pelaksana',
      status,
      isBreaking,
      isFeatured,
      focusKeyword: focusKeyword.trim() || '',
      seoTitle: title.trim(),
      seoDescription: summary.trim(),
      canonicalUrl: `https://ruanglegowo.id/berita/${slug.trim() || generateSlug(title)}`,
      tags: tags.length > 0 ? tags : ['Ruang Legowo'],
      views: Math.max(0, viewsCount),
      shares: initialArticle?.shares || 0,
      likes: initialArticle?.likes || 0,
      readTimeMinutes: Math.max(1, Math.round(content.split(/\s+/).length / 180)) || readTimeMinutes,
      originalSource: originalSource.trim() || '',
      originalUrl: originalUrl.trim() || '',
      createdAt: initialArticle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing && initialArticle?.id) {
        await updateArticle(initialArticle.id, articleData);
        setToastMessage('Berita berhasil diperbarui secara permanen di database!');
        setTimeout(() => {
          onSaveSuccess({ ...articleData, id: initialArticle.id });
        }, 600);
      } else {
        const newId = await createArticle(articleData);
        setToastMessage('Berita baru berhasil disimpan secara permanen di Firestore!');
        setTimeout(() => {
          onSaveSuccess({ ...articleData, id: newId });
        }, 600);
      }
    } catch (err: any) {
      console.error('Error saving article:', err);
      const errDetail = err?.message || String(err);
      alert(`Terjadi kesalahan saat menyimpan berita ke database:\n${errDetail}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-6 px-4 sm:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-md shadow-xl flex items-center gap-2 border border-sky-500 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top Gold Batik Accent Ribbon */}
        <BatikRibbon variant="gold" height={4} className="rounded-xs" />

        {/* Editor Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-sm border border-slate-300 transition-colors"
              title="Batal & Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-headline text-slate-900">
                  {isEditing ? 'Edit Berita Media' : 'Tulis Berita Baru'}
                </h2>
                <BatikMedallion size={18} theme="ocean" className="text-sky-600" />
              </div>
              <p className="text-xs text-slate-500">
                Tersimpan permanen di cloud database dengan analisis SEO real-time dan atribusi sumber awal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-sm"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || isProcessingImage}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-sm shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Menyimpan ke DB...' : isEditing ? 'Perbarui Berita' : 'Terbitkan Berita'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace: Content Editor (Col 8) + SEO & Settings (Col 4) */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Form (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5">
            {/* Title & Slug Box */}
            <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Judul Berita <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan judul berita yang lugas, faktual, dan menarik..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-base font-bold font-headline text-slate-900 border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Karakter: {title.length} (Rekomendasi SEO: 40-70 karakter)
                </span>
              </div>

              {/* Slug configuration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Link className="w-3 h-3 text-slate-500" />
                    URL Slug
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded-xs"
                    />
                    <span>Otomatis dari Judul</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-slate-100 border border-r-0 border-slate-300 text-slate-500 text-xs rounded-l-sm">
                    /berita/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="slug-url-berita"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-r-sm focus:border-sky-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Ringkasan Berita / Meta Description <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Lead paragraf atau deskripsi singkat yang merangkum inti 5W+1H berita..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none resize-none leading-relaxed"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Karakter: {summary.length} (Rekomendasi SEO: 120-160 karakter)
                </span>
              </div>
            </div>

            {/* Rich Content Editor */}
            <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Isi Lengkap Artikel Berita <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {seoAudit.wordCount} Kata | {seoAudit.characterCount} Karakter
                </span>
              </div>

              {/* Quick Format Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-sm border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => insertContentSnippet('### Subjudul Berita')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs text-[11px] text-slate-700 font-semibold"
                >
                  <Heading className="w-3 h-3" />
                  Subjudul H3
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertContentSnippet(
                      '> "Kutipan pernyataan narasumber penting terkait isu pemberitaan ini."'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs text-[11px] text-slate-700 font-semibold"
                >
                  <Quote className="w-3 h-3" />
                  Kutipan (Quote)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertContentSnippet(
                      '- Poin fakta pertama\n- Poin fakta kedua\n- Poin rekomendasi ketiga'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs text-[11px] text-slate-700 font-semibold"
                >
                  <List className="w-3 h-3" />
                  Daftar Poin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertContentSnippet(
                      'Poin Kunci Utama: Kebijakan ini mulai berlaku efektif pada awal kuartal mendatang.'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-xs text-[11px] text-slate-700 font-semibold"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Highlight Box
                </button>
                <button
                  type="button"
                  onClick={() => insertContentSnippet('\n\n<!--pagebreak-->\n\n')}
                  title="Sisipkan pemisah halaman artikel untuk mode multi-halaman"
                  className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xs text-[11px] text-sky-800 font-bold ml-auto"
                >
                  <BookOpen className="w-3 h-3 text-sky-700" />
                  Bagi Halaman (Page Break)
                </button>
              </div>

              <textarea
                rows={12}
                placeholder="Tulis artikel berita secara lengkap di sini. Gunakan spasi dua kali antar paragraf untuk memisahkan alinea..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-3.5 py-3 text-sm font-editorial text-slate-900 border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none resize-y leading-relaxed font-normal"
              />
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-sky-600 shrink-0" />
                <span>
                  <strong>Format Per Halaman:</strong> Artikel panjang atau artikel dengan tag <code>&lt;!--pagebreak--&gt;</code> otomatis disajikan per halaman bagi pembaca dengan navigasi halaman 1, 2, dst.
                </span>
              </p>
            </div>

            {/* FITUR ATRIBUSI: PEMBUAT BERITA SEMULA & LINK BERITA AWAL */}
            <div className="bg-white p-5 border border-sky-200 rounded-sm shadow-2xs space-y-4">
              <div className="border-b border-sky-100 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    Pembuat Berita Semula & Link Berita Awal
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cantumkan atribusi jurnalistik untuk pembuat berita semula jika artikel bersumber dari rujukan/kantor berita luar.
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded-xs border border-sky-200">
                  Etika Pers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pembuat Berita Semula / Media Asal:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kantor Berita Antara, Reuters, Kompas.id, dll."
                    value={originalSource}
                    onChange={(e) => setOriginalSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Akan ditampilkan di kotak sumber berita dan kredensial artikel.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Link / URL Berita Awal (Sumber Asli):
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://www.sumberberita.com/artikel/..."
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none font-mono"
                    />
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Pembaca dapat mengklik tombol "Lihat Berita Asli" untuk membuka tautan sumber.
                  </span>
                </div>
              </div>
            </div>

            {/* FITUR UPLOAD GAMBAR PEMBUATAN BERITA (FEATURED IMAGE MANAGEMENT) */}
            <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  Gambar Utama Berita (Featured Image) <span className="text-rose-600">*</span>
                </label>
                <div className="flex border border-slate-200 rounded-xs overflow-hidden text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageInputTab('upload')}
                    className={`px-3 py-1 transition-colors ${
                      imageInputTab === 'upload'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputTab('preset')}
                    className={`px-3 py-1 transition-colors ${
                      imageInputTab === 'preset'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Preset Koleksi
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputTab('url')}
                    className={`px-3 py-1 transition-colors ${
                      imageInputTab === 'url'
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tautan URL
                  </button>
                </div>
              </div>

              {/* TAB 1: UPLOAD GAMBAR DARI PERANGKAT */}
              {imageInputTab === 'upload' && (
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50/80 rounded-sm p-6 text-center cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs border border-sky-200 flex items-center justify-center mb-2 text-sky-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      {isProcessingImage ? 'Sedang memproses & mengoptimalkan gambar...' : 'Klik untuk Pilih File Gambar atau Tarik ke Sini'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Mendukung format JPG, PNG, WEBP dari Laptop atau Ponsel Anda.
                    </p>
                  </div>

                  {uploadedImageName && (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-800">
                      <span className="font-medium truncate max-w-sm">
                        ✓ Berhasil dimuat: {uploadedImageName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageName('');
                          fileInputRef.current?.click();
                        }}
                        className="text-[11px] font-bold text-sky-700 underline hover:text-sky-900"
                      >
                        Ganti Gambar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRESET GAMBAR EDITORIAL */}
              {imageInputTab === 'preset' && (
                <div>
                  <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                    Pilih Preset Foto Editorial Bebas Royalti (1-Klik):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CURATED_IMAGE_PRESETS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setFeaturedImage(preset.url)}
                        className={`cursor-pointer rounded-xs border overflow-hidden transition-all ${
                          featuredImage === preset.url
                            ? 'border-sky-600 ring-2 ring-sky-600/30'
                            : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="h-16 w-full object-cover" />
                        <div className="p-1 bg-white text-[10px] font-semibold text-slate-700 truncate">
                          {preset.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM URL */}
              {imageInputTab === 'url' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Masukkan URL Gambar Online:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Image Preview & Caption Input */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 items-center">
                <div className="sm:col-span-4 h-24 rounded-xs overflow-hidden border border-slate-200 bg-slate-100 relative">
                  <img
                    src={featuredImage}
                    alt="Pratinjau Gambar Berita"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CURATED_IMAGE_PRESETS[0].url;
                    }}
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded-2xs">
                    Pratinjau
                  </span>
                </div>
                <div className="sm:col-span-8">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Keterangan & Sumber Foto (Caption):
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Suasana peliputan redaksi. (Foto: Dok. Redaksi)"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings & SEO Sidebar (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* SEO Real-time Audit Panel */}
            <SeoAuditPanel
              seoAudit={seoAudit}
              title={title}
              slug={slug}
              summary={summary}
              focusKeyword={focusKeyword}
              featuredImage={featuredImage}
              category={category}
            />

            {/* Publishing Controls */}
            <div className="bg-white p-5 border border-slate-200 rounded-sm shadow-2xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Pengaturan Penerbitan & Tayangan
              </h3>

              {/* Status Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Berita:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`py-2 text-xs font-bold rounded-sm border transition-colors ${
                      status === 'published'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Diterbitkan (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`py-2 text-xs font-bold rounded-sm border transition-colors ${
                      status === 'draft'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Draf Redaksi
                  </button>
                </div>
              </div>

              {/* FITUR TAMBAH / KELOLA TAYANGAN DI EDITOR */}
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xs space-y-2">
                <label className="block text-xs font-bold text-sky-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                    Jumlah Tayangan (Views)
                  </span>
                  <span className="text-[11px] font-mono text-sky-800">
                    {viewsCount.toLocaleString('id-ID')}
                  </span>
                </label>
                
                <input
                  type="number"
                  min="0"
                  value={viewsCount}
                  onChange={(e) => setViewsCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xs bg-white text-slate-900 focus:outline-none focus:border-sky-600"
                />

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Tambah Cepat:</span>
                  {[50, 100, 500, 1000].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setViewsCount((prev) => prev + delta)}
                      className="px-2 py-0.5 bg-white hover:bg-sky-100 border border-sky-300 text-sky-800 text-[10px] font-bold rounded-xs transition-colors"
                    >
                      +{delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Berita:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-500 focus:outline-none bg-white font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Focus Keyword for SEO */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Kunci Fokus SEO (Target Keyword):
                </label>
                <input
                  type="text"
                  placeholder="Misal: infrastruktur ai, neraca dagang"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Digunakan untuk menghitung densitas dan keterikatan SEO
                </span>
              </div>

              {/* Toggles: Breaking & Featured */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="rounded-xs text-sky-600 focus:ring-0"
                  />
                  <Flame className="w-3.5 h-3.5 text-sky-600" />
                  <span>Jadikan Breaking News (Ticker Utama)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded-xs text-amber-500 focus:ring-0"
                  />
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sorotan Redaksi (Lead Banner)</span>
                </label>
              </div>

              {/* Author Info */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Nama Jurnalis / Penulis:
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Jabatan / Peran:
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-sm"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3 text-slate-500" />
                  Tag Berita (Pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ekonomi, Investasi, Pasar Modal"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-sm focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving || isProcessingImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {saving ? 'Menyimpan ke Firestore...' : isEditing ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
