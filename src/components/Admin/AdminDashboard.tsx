import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  BarChart2,
  FileText,
  Globe,
  Database,
  Trash2,
  Edit,
  ExternalLink,
  Flame,
  Star,
  CheckCircle,
  Copy,
  Download,
  Code,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Sliders,
  LogOut,
  User,
  Eye,
  PlusCircle,
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Article, ArticleCategory, AnalyticsSummary, PortalSettings, SliderSlide } from '../../types';
import { ArticleEditor } from './ArticleEditor';
import { RealtimeAnalytics } from './RealtimeAnalytics';
import { SettingsEditor } from './SettingsEditor';
import { deleteArticle, updateArticle, addArticleViews, setArticleViews, deleteAllArticles, seedBojonegoroArticles } from '../../services/articleService';
import { generateSitemapXml, generateRobotsTxt } from '../../utils/seo';
import { BrandLogo } from '../BrandLogo';

interface AdminDashboardProps {
  articles: Article[];
  analyticsSummary: AnalyticsSummary;
  settings: PortalSettings;
  slides: SliderSlide[];
  adminUsername?: string;
  onLogout: () => void;
  onCloseAdmin: () => void;
  onViewArticleLive: (article: Article) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  articles,
  analyticsSummary,
  settings,
  slides,
  adminUsername = 'Redaktur',
  onLogout,
  onCloseAdmin,
  onViewArticleLive,
}) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'editor' | 'analytics' | 'settings' | 'seo-tools'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sitemapCopied, setSitemapCopied] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isSeedingBojonegoro, setIsSeedingBojonegoro] = useState(false);

  // FITUR TAMBAH TAYANGAN MODAL STATE
  const [viewsModalArticle, setViewsModalArticle] = useState<Article | null>(null);
  const [viewsDeltaInput, setViewsDeltaInput] = useState<number>(100);
  const [customTotalInput, setCustomTotalInput] = useState<string>('');
  const [isUpdatingViews, setIsUpdatingViews] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteAllArticles = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllArticles();
      setShowDeleteAllModal(false);
      showToast('Seluruh artikel berita berhasil dihapus secara permanen dari database.');
    } catch (err: any) {
      console.error('Gagal menghapus seluruh berita:', err);
      alert('Terjadi kesalahan saat menghapus semua artikel.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleSeedBojonegoroArticles = async () => {
    setIsSeedingBojonegoro(true);
    try {
      await seedBojonegoroArticles();
      showToast('10 Artikel Berita Inovasi Kepemimpinan Bojonegoro berhasil dimuat!');
    } catch (err: any) {
      console.error('Gagal memuat artikel inovasi Bojonegoro:', err);
      showToast('Gagal memuat artikel inovasi.');
    } finally {
      setIsSeedingBojonegoro(false);
    }
  };

  // FITUR ARTIKEL PER HALAMAN DI ADMIN DASHBOARD
  const [adminPage, setAdminPage] = useState(1);
  const [adminItemsPerPage, setAdminItemsPerPage] = useState(10);

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || art.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || art.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const totalAdminPages = Math.max(1, Math.ceil(filteredArticles.length / adminItemsPerPage));
  const paginatedAdminArticles = filteredArticles.slice(
    (adminPage - 1) * adminItemsPerPage,
    adminPage * adminItemsPerPage
  );

  const handleStartCreate = () => {
    setEditingArticle(null);
    setActiveTab('editor');
  };

  const handleStartEdit = (art: Article) => {
    setEditingArticle(art);
    setActiveTab('editor');
  };

  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteArticle(id);
      setDeleteConfirmId(null);
      showToast('Berita berhasil dihapus dari database.');
    } catch (err: any) {
      console.error('Gagal menghapus berita:', err);
      showToast('Gagal menghapus berita.');
      alert('Terjadi kesalahan saat menghapus berita dari database.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleToggleBreaking = async (art: Article) => {
    try {
      await updateArticle(art.id, { isBreaking: !art.isBreaking });
    } catch (err) {
      console.error('Error toggling breaking:', err);
    }
  };

  const handleToggleFeatured = async (art: Article) => {
    try {
      await updateArticle(art.id, { isFeatured: !art.isFeatured });
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  // Actions for adding / setting views
  const handleOpenViewsModal = (art: Article) => {
    setViewsModalArticle(art);
    setViewsDeltaInput(100);
    setCustomTotalInput(String(art.views || 0));
  };

  const handleAddViewsDelta = async (delta: number) => {
    if (!viewsModalArticle) return;
    setIsUpdatingViews(true);
    try {
      await addArticleViews(viewsModalArticle.id, delta);
      showToast(`Berhasil menambahkan ${delta.toLocaleString('id-ID')} tayangan ke berita!`);
      setViewsModalArticle(null);
    } catch (err) {
      console.error('Gagal menambah tayangan:', err);
      alert('Terjadi kesalahan saat menambah tayangan.');
    } finally {
      setIsUpdatingViews(false);
    }
  };

  const handleSetTotalViews = async () => {
    if (!viewsModalArticle) return;
    const target = parseInt(customTotalInput, 10);
    if (isNaN(target) || target < 0) {
      alert('Silakan masukkan jumlah tayangan yang valid.');
      return;
    }
    setIsUpdatingViews(true);
    try {
      await setArticleViews(viewsModalArticle.id, target);
      showToast(`Total tayangan berita diperbarui menjadi ${target.toLocaleString('id-ID')}!`);
      setViewsModalArticle(null);
    } catch (err) {
      console.error('Gagal memperbarui tayangan:', err);
      alert('Terjadi kesalahan saat memperbarui total tayangan.');
    } finally {
      setIsUpdatingViews(false);
    }
  };

  const totalPublished = articles.filter((a) => a.status === 'published').length;
  const totalDraft = articles.filter((a) => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  // If in editor tab
  if (activeTab === 'editor') {
    return (
      <ArticleEditor
        initialArticle={editingArticle}
        onSaveSuccess={(savedArt) => {
          setActiveTab('articles');
          setEditingArticle(null);
        }}
        onCancel={() => {
          setActiveTab('articles');
          setEditingArticle(null);
        }}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 border border-sky-500 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navigation Header - Biru Polos Tanpa Motif Batik */}
      <header className="bg-blue-700 text-white border-b border-blue-800 sticky top-0 z-30 shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Brand Logo & Back to Portal */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCloseAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-sm transition-colors border border-white/20 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Portal Publik</span>
            </button>
            <div className="h-5 w-px bg-blue-500/60 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <BrandLogo
                src={settings.brandLogo}
                alt={settings.brandName || 'Ruang Legowo'}
                size="sm"
              />
              <span className="font-extrabold font-headline tracking-tight text-sm text-white">
                {settings.brandName || 'RUANG LEGOWO'} CMS
              </span>
              <span className="px-1.5 py-0.5 bg-blue-900 text-blue-100 text-[10px] font-bold rounded-xs border border-blue-400/40">
                ADMIN
              </span>
            </div>
          </div>

          {/* User Session & Logout */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('settings')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-sm text-blue-100 transition-colors border border-white/20 cursor-pointer"
              title="Klik untuk ubah username atau password"
            >
              <User className="w-3.5 h-3.5 text-blue-200" />
              <span className="font-bold text-white">{adminUsername}</span>
              <KeyRound className="w-3 h-3 text-amber-300 ml-1" />
            </button>

            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-sm shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-700" />
              <span>Tulis Berita</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-sm transition-colors cursor-pointer shadow-2xs"
              title="Keluar dari sesi CMS"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon - Biru Polos Tanpa Motif Batik */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex space-x-1 border-t border-blue-600 bg-blue-800 text-xs font-bold overflow-x-auto no-scrollbar relative z-10">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'articles'
                ? 'border-blue-300 text-white bg-blue-600 font-extrabold shadow-inner'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-700/80'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Manajemen Berita ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-blue-300 text-white bg-blue-600 font-extrabold shadow-inner'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-700/80'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-200" />
            <span>Pengaturan Header, HTML, Slider & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-blue-300 text-white bg-blue-600 font-extrabold shadow-inner'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-700/80'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-blue-200" />
            <span>Analitik Pengunjung Real-time</span>
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping ml-1" />
          </button>

          <button
            onClick={() => setActiveTab('seo-tools')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'seo-tools'
                ? 'border-blue-300 text-white bg-blue-600 font-extrabold shadow-inner'
                : 'border-transparent text-blue-100 hover:text-white hover:bg-blue-700/80'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-200" />
            <span>Sitemap & Tools SEO</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1">
        {/* TAB 1: ARTICLE MANAGEMENT TABLE */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Quick Metrics Bar - Pure White */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Berita</span>
                <span className="text-2xl font-extrabold text-slate-900">{articles.length}</span>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Diterbitkan (Live)</span>
                <span className="text-2xl font-extrabold text-emerald-600">{totalPublished}</span>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Draf Redaksi</span>
                <span className="text-2xl font-extrabold text-amber-600">{totalDraft}</span>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Total Tayangan (Views)</span>
                <span className="text-2xl font-extrabold text-sky-700">{totalViews.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Filters & Search Header */}
            <div className="bg-white p-4 border border-slate-200 rounded-sm shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari judul berita, penulis, atau kategori..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setAdminPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-sm focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setAdminPage(1);
                  }}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  <option value="all">Semua Status</option>
                  <option value="published">Hanya Live</option>
                  <option value="draft">Hanya Draf</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setAdminPage(1);
                  }}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-sm bg-white text-slate-700 font-medium"
                >
                  <option value="all">Semua Kategori</option>
                  {['Politik', 'Ekonomi', 'Teknologi', 'Sains', 'Gaya Hidup', 'Hiburan', 'Olahraga', 'Nasional'].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {articles.length === 0 && (
                  <button
                    onClick={handleSeedBojonegoroArticles}
                    disabled={isSeedingBojonegoro}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-sm transition-colors cursor-pointer"
                    title="Muat 10 artikel inovasi kepemimpinan Bupati Setyo Wahono & Wabup Nurul Azizah"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isSeedingBojonegoro ? 'Memuat Inovasi...' : 'Muat Berita Inovasi Bojonegoro'}</span>
                  </button>
                )}
                {articles.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-sm transition-colors cursor-pointer"
                    title="Hapus semua artikel berita secara permanen dari database"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Semua Berita</span>
                  </button>
                )}
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Berita Baru</span>
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Artikel Berita</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Sorotan / Ticker</th>
                      <th className="py-3 px-4 text-center">Tayangan (Views)</th>
                      <th className="py-3 px-4">Tanggal Buat</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArticles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <div className="max-w-lg mx-auto space-y-3 px-4">
                            {articles.length === 0 ? (
                              <div className="p-6 bg-slate-50 border border-slate-200 rounded-sm relative overflow-hidden shadow-2xs">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                      <Newspaper className="w-6 h-6" />
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-base font-extrabold text-slate-900 font-headline">
                                      Semua Isian Artikel Berita Telah Dihapus Secara Permanen
                                    </h4>
                                    <p className="text-xs text-blue-800 font-semibold mt-0.5">
                                      Database Cloud Firestore Bersih (0 Berita Aktif)
                                    </p>
                                  </div>
                                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                                    Seluruh konten artikel berita sebelumnya telah dihapus secara permanen dari server database dan memori cache. Ruang Legowo kini memiliki kanvas berita bersih siap untuk publikasi artikel baru.
                                  </p>

                                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
                                    <span className="px-2.5 py-1 bg-white text-slate-700 border border-slate-200 rounded-xs font-medium shadow-2xs">
                                      ✓ 0 Berita di Firestore
                                    </span>
                                    <span className="px-2.5 py-1 bg-white text-emerald-700 border border-emerald-200 rounded-xs font-medium shadow-2xs">
                                      ✓ Sinkronisasi Real-time Siap
                                    </span>
                                    <span className="px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-xs font-medium shadow-2xs">
                                      ✓ Portal Berita Siap
                                    </span>
                                  </div>

                                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                      onClick={handleSeedBojonegoroArticles}
                                      disabled={isSeedingBojonegoro}
                                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-sm transition-colors shadow-xs cursor-pointer"
                                    >
                                      <Sparkles className="w-4 h-4" />
                                      <span>{isSeedingBojonegoro ? 'Memuat Inovasi...' : 'Muat 10 Berita Inovasi Bojonegoro'}</span>
                                    </button>
                                    <button
                                      onClick={handleStartCreate}
                                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm transition-colors shadow-xs cursor-pointer"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>Mulai Tulis Berita Baru</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                                  <Newspaper className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800">
                                  Tidak ada artikel yang sesuai kriteria filter pencarian
                                </h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                  Silakan sesuaikan kata kunci pencarian atau ubah filter kategori/status.
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedAdminArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-sky-50/30 transition-colors">
                          {/* Title & Thumbnail */}
                          <td className="py-3 px-4 max-w-sm">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.featuredImage}
                                alt={art.title}
                                className="w-12 h-10 object-cover rounded-xs border border-slate-200 shrink-0 bg-slate-100"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 line-clamp-1 hover:text-sky-700 transition-colors">
                                  {art.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span>Oleh: {art.authorName}</span>
                                  {art.originalSource && (
                                    <span className="px-1.5 py-0.2 bg-sky-50 text-sky-800 rounded-2xs border border-sky-200 font-medium">
                                      Sumber: {art.originalSource}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-800 font-semibold rounded-xs border border-sky-200 text-[10px]">
                              {art.category}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {art.status === 'published' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-xs text-[10px] border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-xs text-[10px] border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Draf
                              </span>
                            )}
                          </td>

                          {/* Toggles (Breaking / Featured) */}
                          <td className="py-3 px-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleToggleBreaking(art)}
                                title="Toggle Breaking News"
                                className={`p-1 rounded-xs transition-colors ${
                                  art.isBreaking
                                    ? 'bg-sky-100 text-sky-700 font-bold'
                                    : 'text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                <Flame className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleFeatured(art)}
                                title="Toggle Sorotan Redaksi"
                                className={`p-1 rounded-xs transition-colors ${
                                  art.isFeatured
                                    ? 'bg-amber-100 text-amber-600 font-bold'
                                    : 'text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                <Star className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                          {/* FITUR TAMBAH TAYANGAN DI KOLOM TAYANGAN */}
                          <td className="py-3 px-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-extrabold text-xs text-slate-800 font-mono">
                                {art.views?.toLocaleString('id-ID') || 0}
                              </span>
                              <button
                                onClick={() => handleOpenViewsModal(art)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xs text-[10px] font-bold transition-colors shadow-2xs"
                                title="Tambah atau atur tayangan berita ini"
                              >
                                <Eye className="w-3 h-3 text-sky-600" />
                                <span>+ Tayangan</span>
                              </button>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                            {new Date(art.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onViewArticleLive(art)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs transition-colors"
                                title="Pratinjau Halaman Berita Publik"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleStartEdit(art)}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xs transition-colors"
                                title="Edit Berita, Gambar & SEO"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {deleteConfirmId === art.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(art.id)}
                                    disabled={isDeletingId === art.id}
                                    className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xs animate-pulse disabled:opacity-50"
                                  >
                                    {isDeletingId === art.id ? 'Menghapus...' : 'Ya, Hapus'}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={isDeletingId === art.id}
                                    className="px-1.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold rounded-xs"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(art.id)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-xs transition-colors"
                                  title="Hapus Berita dari Database"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* BAR KONTROL PAGINASI DAFTAR BERITA ADMIN */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Layers className="w-4 h-4 text-sky-700 shrink-0" />
                  <span>
                    Menampilkan{' '}
                    <strong className="text-slate-900 font-bold">
                      {filteredArticles.length === 0
                        ? 0
                        : (adminPage - 1) * adminItemsPerPage + 1}{' '}
                      - {Math.min(adminPage * adminItemsPerPage, filteredArticles.length)}
                    </strong>{' '}
                    dari <strong className="text-slate-900 font-bold">{filteredArticles.length}</strong> artikel
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Selector Rows per Page */}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="text-[11px] hidden sm:inline">Per halaman:</span>
                    {[5, 10, 20].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setAdminItemsPerPage(num);
                          setAdminPage(1);
                        }}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                          adminItemsPerPage === num
                            ? 'bg-sky-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Navigasi Nomor Halaman */}
                  {totalAdminPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAdminPage((prev) => Math.max(1, prev - 1))}
                        disabled={adminPage <= 1}
                        className={`px-2 py-1 font-bold rounded-xs flex items-center gap-1 text-[11px] transition-colors ${
                          adminPage <= 1
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs'
                        }`}
                      >
                        <ChevronLeft className="w-3 h-3" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalAdminPages }, (_, i) => i + 1).map((pg) => {
                          const isCurrent = pg === adminPage;
                          return (
                            <button
                              key={pg}
                              onClick={() => setAdminPage(pg)}
                              className={`w-6 h-6 flex items-center justify-center text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-sky-700 text-white shadow-2xs'
                                  : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {pg}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setAdminPage((prev) => Math.min(totalAdminPages, prev + 1))}
                        disabled={adminPage >= totalAdminPages}
                        className={`px-2 py-1 font-bold rounded-xs flex items-center gap-1 text-[11px] transition-colors ${
                          adminPage >= totalAdminPages
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-sky-700 hover:bg-sky-800 text-white cursor-pointer shadow-2xs'
                        }`}
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETTINGS (HEADER, FOOTER, HTML, SLIDER, CREDENTIALS) */}
        {activeTab === 'settings' && (
          <SettingsEditor
            settings={settings}
            slides={slides}
            articles={articles}
          />
        )}

        {/* TAB 3: REAL-TIME ANALYTICS */}
        {activeTab === 'analytics' && (
          <RealtimeAnalytics
            summary={analyticsSummary}
            onSelectArticleById={(id) => {
              const target = articles.find((a) => a.id === id);
              if (target) onViewArticleLive(target);
            }}
          />
        )}

        {/* TAB 4: SEO TOOLS & SITEMAP */}
        {activeTab === 'seo-tools' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Generator Sitemap XML Otomatis (Google News & Web)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sitemap XML dinamis yang selalu sinkron dengan seluruh artikel yang tersimpan di Firestore.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const xml = generateSitemapXml(articles);
                    navigator.clipboard.writeText(xml);
                    setSitemapCopied(true);
                    setTimeout(() => setSitemapCopied(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-sm transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sitemapCopied ? 'Tersalin ke Clipboard!' : 'Salin Sitemap XML'}</span>
                </button>
              </div>

              <pre className="text-[11px] bg-slate-950 text-cyan-400 p-4 rounded-sm font-mono overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
                {generateSitemapXml(articles)}
              </pre>
            </div>

            <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                File Robots.txt Terstandar
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Mengizinkan bot mesin pencari (Googlebot, Bingbot) untuk mengindeks halaman portal berita:
              </p>
              <pre className="text-[11px] bg-slate-950 text-slate-200 p-4 rounded-sm font-mono leading-relaxed border border-slate-800 max-w-lg">
                {generateRobotsTxt()}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* MODAL TAMBAH TAYANGAN BERITA */}
      {viewsModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-sky-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-300" />
                <h3 className="font-bold text-sm font-headline">Tambah & Atur Tayangan Berita</h3>
              </div>
              <button
                onClick={() => setViewsModalArticle(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Judul Berita:
                </span>
                <p className="text-xs font-bold text-slate-900 line-clamp-2">
                  {viewsModalArticle.title}
                </p>
                <div className="mt-2 p-2 bg-sky-50 border border-sky-100 rounded-xs flex items-center justify-between text-xs">
                  <span className="text-slate-600">Tayangan Saat Ini:</span>
                  <span className="font-extrabold text-sky-800 font-mono text-sm">
                    {viewsModalArticle.views?.toLocaleString('id-ID') || 0} tayangan
                  </span>
                </div>
              </div>

              {/* Quick Increment Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tambah Tayangan Instan (1-Klik):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 250, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      disabled={isUpdatingViews}
                      onClick={() => handleAddViewsDelta(amount)}
                      className="py-2 px-2 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 border border-sky-200 rounded-xs font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{amount.toLocaleString('id-ID')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Total Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Atau Atur Jumlah Total Tayangan:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={customTotalInput}
                    onChange={(e) => setCustomTotalInput(e.target.value)}
                    placeholder="Masukkan angka total tayangan..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xs focus:border-sky-600 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    disabled={isUpdatingViews}
                    onClick={handleSetTotalViews}
                    className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isUpdatingViews ? 'Menyimpan...' : 'Perbarui'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewsModalArticle(null)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SEMUA BERITA SECARA PERMANEN */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-md shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-rose-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-sm font-headline">Hapus Semua Artikel Berita?</h3>
              </div>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                disabled={isDeletingAll}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-900 space-y-1">
                <p className="font-bold">⚠️ Tindakan Ini Bersifat Permanen!</p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Sebanyak <strong>{articles.length} artikel berita</strong> yang saat ini ada akan dihapus secara permanen dari database cloud Firestore dan cache penyimpanan. Data yang sudah dihapus tidak dapat dipulihkan kembali.
                </p>
              </div>

              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin mengosongkan seluruh konten berita pada portal media dan dashboard admin?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeletingAll}
                  onClick={() => setShowDeleteAllModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeletingAll}
                  onClick={handleDeleteAllArticles}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingAll ? 'Menghapus Semua Berita...' : 'Ya, Hapus Semua Secara Permanen'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard Footer - Biru Polos Tanpa Motif Batik */}
      <footer className="mt-auto bg-blue-800 border-t border-blue-700 text-blue-100 text-xs py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-white">{settings.brandName || 'RUANG LEGOWO'} CMS</span>
            <span className="text-blue-300">•</span>
            <span>Dashboard Administrator</span>
          </div>
          <p className="text-blue-200 text-[11px]">
            © {new Date().getFullYear()} {settings.brandName || 'Ruang Legowo'}. Hak cipta dilindungi undang-undang.
          </p>
        </div>
      </footer>
    </div>
  );
};
