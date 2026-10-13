import React, { useState, useEffect, useMemo } from 'react';
import {
  seedInitialArticlesIfEmpty,
  subscribeToArticles,
} from './services/articleService';
import {
  subscribeToVisitorLogs,
  computeAnalyticsSummary,
} from './services/analyticsService';
import {
  subscribeToPortalSettings,
  subscribeToSliderSlides,
  DEFAULT_SETTINGS,
} from './services/settingsService';
import { Article, ArticleCategory, VisitorLog, PortalSettings, SliderSlide } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetail } from './components/ArticleDetail';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { NewsPhotoSlider } from './components/NewsPhotoSlider';
import { LoginModal } from './components/Admin/LoginModal';
import { BatikRibbon, BatikMedallion, BatikWatermark, BatikDivider } from './components/BatikOrnament';
import { Flame, TrendingUp, Newspaper, Compass, Sparkles, Filter, Lock, ChevronLeft, ChevronRight, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(DEFAULT_SETTINGS);
  const [customSlides, setCustomSlides] = useState<SliderSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication & View state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'portal' | 'admin'>('portal');
  const [mentalAlert, setMentalAlert] = useState<string | null>(null);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state for public portal articles
  const [portalPage, setPortalPage] = useState(1);
  const [portalItemsPerPage, setPortalItemsPerPage] = useState(6);

  // 1. Initialize Firestore Database & Real-time Subscriptions
  useEffect(() => {
    let unsubscribeArticles: (() => void) | null = null;
    let unsubscribeLogs: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeSlides: (() => void) | null = null;

    const init = async () => {
      try {
        // Auto-seed if database is empty on first boot
        await seedInitialArticlesIfEmpty();
      } catch (err) {
        console.error('Seed initial articles notice:', err);
      }

      // Real-time listener for articles
      unsubscribeArticles = subscribeToArticles((data) => {
        setArticles(data);
        setLoading(false);
      });

      // Real-time listener for visitor analytics logs
      unsubscribeLogs = subscribeToVisitorLogs((logs) => {
        setVisitorLogs(logs);
      });

      // Real-time listener for portal settings (Header & Footer)
      unsubscribeSettings = subscribeToPortalSettings((settings) => {
        setPortalSettings(settings);
      });

      // Real-time listener for custom slider slides
      unsubscribeSlides = subscribeToSliderSlides((slides) => {
        setCustomSlides(slides);
      });
    };

    init();

    return () => {
      if (unsubscribeArticles) unsubscribeArticles();
      if (unsubscribeLogs) unsubscribeLogs();
      if (unsubscribeSettings) unsubscribeSettings();
      if (unsubscribeSlides) unsubscribeSlides();
    };
  }, []);

  // 2. Hash routing for direct navigation to articles and category topics
  useEffect(() => {
    if (articles.length === 0) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      if (hash.startsWith('berita/')) {
        const slug = decodeURIComponent(hash.replace('berita/', ''));
        const found = articles.find((a) => a.slug === slug || a.id === slug);
        if (found) {
          setCurrentArticle(found);
          setViewMode('portal');
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      } else if (hash.startsWith('kategori/')) {
        const cat = decodeURIComponent(hash.replace('kategori/', '')) as ArticleCategory;
        setSelectedCategory(cat);
        setCurrentArticle(null);
        setViewMode('portal');
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [articles]);

  // Compute analytics summary from Firestore articles and logs
  const analyticsSummary = useMemo(() => {
    return computeAnalyticsSummary(articles, visitorLogs);
  }, [articles, visitorLogs]);

  // Breaking news headlines for the top ticker
  const breakingNewsList = useMemo(() => {
    const breaking = articles
      .filter((a) => a.isBreaking && a.status === 'published')
      .map((a) => a.title);
    if (breaking.length > 0) return breaking;
    return articles
      .filter((a) => a.status === 'published')
      .slice(0, 4)
      .map((a) => a.title);
  }, [articles]);

  // Published articles for the public portal
  const publishedArticles = useMemo(() => {
    return articles.filter((a) => a.status === 'published');
  }, [articles]);

  // Filtered by Category & Search
  const displayArticles = useMemo(() => {
    return publishedArticles.filter((art) => {
      const matchCat = selectedCategory === 'Semua' || art.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [publishedArticles, selectedCategory, searchQuery]);

  // Direct action: Navigate directly to article topic reader
  const handleSelectArticle = (art: Article) => {
    setCurrentArticle(art);
    setViewMode('portal');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    try {
      window.history.pushState({}, '', `#berita/${art.slug || art.id}`);
    } catch (_) {}
  };

  // Direct action: Navigate directly to category topic feed
  const handleSelectCategory = (cat: ArticleCategory | 'Semua') => {
    setSelectedCategory(cat);
    setCurrentArticle(null);
    setSearchQuery('');
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    try {
      if (cat !== 'Semua') {
        window.history.pushState({}, '', `#kategori/${encodeURIComponent(cat)}`);
      } else {
        window.history.pushState({}, '', '#');
      }
    } catch (_) {}
  };

  // Featured Lead Story (Lead banner)
  const leadArticle = useMemo(() => {
    return (
      displayArticles.find((a) => a.isFeatured) ||
      displayArticles[0] ||
      null
    );
  }, [displayArticles]);

  // Secondary Featured Stories
  const secondaryArticles = useMemo(() => {
    if (!leadArticle) return [];
    return displayArticles.filter((a) => a.id !== leadArticle.id).slice(0, 2);
  }, [displayArticles, leadArticle]);

  // Trending Leaderboard Articles (Sorted by views)
  const trendingArticles = useMemo(() => {
    return [...publishedArticles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [publishedArticles]);

  // Remaining articles for the main grid
  const gridArticles = useMemo(() => {
    if (selectedCategory !== 'Semua' || searchQuery) {
      return displayArticles;
    }
    const excludeIds = new Set([
      leadArticle?.id,
      ...secondaryArticles.map((a) => a.id),
    ]);
    return displayArticles.filter((a) => !excludeIds.has(a.id));
  }, [displayArticles, leadArticle, secondaryArticles, selectedCategory, searchQuery]);

  // Reset page when category or search changes
  useEffect(() => {
    setPortalPage(1);
  }, [selectedCategory, searchQuery]);

  // Pagination calculations for main article grid (Artikel Per Halaman)
  const totalPortalPages = Math.max(1, Math.ceil(gridArticles.length / portalItemsPerPage));

  const paginatedGridArticles = useMemo(() => {
    const startIndex = (portalPage - 1) * portalItemsPerPage;
    return gridArticles.slice(startIndex, startIndex + portalItemsPerPage);
  }, [gridArticles, portalPage, portalItemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPortalPages) return;
    setPortalPage(newPage);
    const feedElement = document.getElementById('main-news-feed');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  // Dynamic Browser Title sync for SEO and custom HTML Title & Favicon
  useEffect(() => {
    const brand = portalSettings.brandName || 'Ruang Legowo';
    const customHtmlTitle = portalSettings.htmlTitle;

    if (viewMode === 'admin') {
      document.title = customHtmlTitle ? `[Admin] ${customHtmlTitle}` : `Login Dashboard Administrator - ${brand}`;
    } else if (currentArticle) {
      document.title = `${currentArticle.title} - ${brand}`;
    } else if (selectedCategory !== 'Semua') {
      document.title = `Berita ${selectedCategory} Terkini - ${brand}`;
    } else {
      document.title = customHtmlTitle || `${brand} - ${portalSettings.brandTagline || 'Portal Media Berita & CMS Real-time'}`;
    }

    // Dynamic HTML Logo Favicon sync
    if (portalSettings.htmlFavicon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = portalSettings.htmlFavicon;
    }
  }, [viewMode, currentArticle, selectedCategory, portalSettings]);

  // Handle Login success from Modal
  const handleLoginSuccess = (typedUsername: string) => {
    setIsAdminLoggedIn(true);
    setAdminUsername(typedUsername);
    setViewMode('admin');
    setMentalAlert(null);
  };

  // Handle Login "Mental" (terpental langsung ke menu beranda saat salah password)
  const handleLoginMental = (reason: string) => {
    setMentalAlert(reason);
    setIsAdminLoggedIn(false);
    setViewMode('portal');
    setCurrentArticle(null);
    setSelectedCategory('Semua');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', '#');
    } catch (_) {}
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUsername('');
    setViewMode('portal');
  };

  // RENDER ADMIN DASHBOARD (Only if logged in)
  if (viewMode === 'admin' && isAdminLoggedIn) {
    return (
      <AdminDashboard
        articles={articles}
        analyticsSummary={analyticsSummary}
        settings={portalSettings}
        slides={customSlides}
        adminUsername={adminUsername}
        onLogout={handleLogout}
        onCloseAdmin={() => setViewMode('portal')}
        onViewArticleLive={(art) => {
          handleSelectArticle(art);
        }}
      />
    );
  }

  // RENDER PUBLIC NEWS PORTAL (Dominan Putih & Laut Biru dengan Motif Batik Nusantara)
  return (
    <div className="min-h-screen flex flex-col bg-white bg-batik-kawung-light text-slate-900 font-sans selection:bg-sky-600 selection:text-white relative">
      {/* Header with ocean theme & BrandLogo */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        breakingNewsList={breakingNewsList}
        activeReaders={analyticsSummary.activeNow}
        onOpenLoginModal={() => {
          if (isAdminLoggedIn) {
            setViewMode('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onGoHome={() => {
          handleSelectCategory('Semua');
        }}
        settings={portalSettings}
      />

      {/* Alert Terpental / Langsung Mental Banner Saat Password Admin Salah */}
      {mentalAlert && (
        <div className="bg-rose-950 border-b-4 border-rose-600 text-white px-4 py-3 sm:py-4 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-200 uppercase tracking-wider flex items-center gap-2">
                  <span>🚨 ANDA LANGSUNG KEMBALI KE BERANDA!</span>
                  <span className="text-[10px] bg-rose-700/80 px-2 py-0.5 rounded text-white font-mono">AKSES DITOLAK</span>
                </h4>
                <p className="text-xs text-rose-100 mt-0.5 font-medium">
                  {mentalAlert}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
              >
                Coba Login Lagi
              </button>
              <button
                onClick={() => setMentalAlert(null)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body Content */}
      <div className="flex-1">
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-sm font-bold text-slate-800">Menghubungkan ke Database Firestore...</h3>
            <p className="text-xs text-slate-500 mt-1">Memuat portal berita & sinkronisasi real-time.</p>
          </div>
        ) : currentArticle ? (
          // Reading View: Article Detail with direct topic navigation
          <ArticleDetail
            article={currentArticle}
            relatedArticles={publishedArticles.filter(
              (a) => a.id !== currentArticle.id && a.category === currentArticle.category
            )}
            onBack={() => {
              setCurrentArticle(null);
              window.scrollTo(0, 0);
              try {
                window.history.pushState({}, '', '#');
              } catch (_) {}
            }}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
            onEditInAdmin={(art) => {
              if (isAdminLoggedIn) {
                setViewMode('admin');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
          />
        ) : (
          // Homepage / Category List View
          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10">
            {/* Filter or Search Status Banner */}
            {(selectedCategory !== 'Semua' || searchQuery) && (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900">
                    {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : `Kanal Topik Berita: ${selectedCategory}`}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menampilkan {displayArticles.length} artikel berita terverifikasi
                  </p>
                </div>
                {(selectedCategory !== 'Semua' || searchQuery) && (
                  <button
                    onClick={() => handleSelectCategory('Semua')}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
                  >
                    Reset Filter ke Semua Berita
                  </button>
                )}
              </div>
            )}

            {/* RUNNING PHOTO SLIDER SHOWCASE (Slider Foto Berjalan) */}
            {selectedCategory === 'Semua' && !searchQuery && publishedArticles.length > 0 && (
              <NewsPhotoSlider
                articles={publishedArticles}
                customSlides={customSlides}
                deletedSlideIds={portalSettings.deletedSlideIds}
                onSelectArticle={handleSelectArticle}
                onSelectCategory={handleSelectCategory}
                autoPlayInterval={(portalSettings.sliderIntervalSeconds || 5) * 1000}
              />
            )}

            {/* HERO / FEATURED SHOWCASE (Shown on Homepage when not filtering) */}
            {selectedCategory === 'Semua' && !searchQuery && leadArticle && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Lead Headline Banner (Col 8) */}
                  <div className="lg:col-span-8 space-y-6">
                    <ArticleCard
                      article={leadArticle}
                      variant="lead"
                      onClick={handleSelectArticle}
                      onSelectCategory={handleSelectCategory}
                    />

                    {/* Secondary Featured Row (2 cards) */}
                    {secondaryArticles.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {secondaryArticles.map((art) => (
                          <ArticleCard
                            key={art.id}
                            article={art}
                            variant="secondary"
                            onClick={handleSelectArticle}
                            onSelectCategory={handleSelectCategory}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trending Sidebar Leaderboard (Col 4) */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-sm p-5 shadow-2xs self-start">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-sky-600" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          Berita Terpopuler
                        </h3>
                      </div>
                      <span className="text-[10px] text-sky-700 font-semibold uppercase">
                        24 Jam Terakhir
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {trendingArticles.map((art, idx) => (
                        <ArticleCard
                          key={art.id}
                          article={art}
                          variant="trending"
                          rank={idx + 1}
                          onClick={handleSelectArticle}
                          onSelectCategory={handleSelectCategory}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* MAIN ARTICLE FEED / GRID (Dibuat Per Halaman) */}
            <section id="main-news-feed" className="space-y-6 scroll-mt-20">
              {/* Section Header Bar - Biru Polos Senada dengan Header */}
              <div className="bg-blue-700 border border-blue-800 rounded-sm shadow-xs p-4 sm:px-5 sm:py-3.5 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xs bg-white text-blue-700 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold font-headline text-white tracking-wide leading-tight">
                      {selectedCategory === 'Semua' ? 'Kabar Terbaru & Terkini' : `Semua Berita Kanal ${selectedCategory}`}
                    </h3>
                    <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                      {selectedCategory === 'Semua' ? 'Informasi teraktual, terpercaya dan terverifikasi' : `Kumpulan berita teraktual seputar topik ${selectedCategory}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="bg-blue-800 text-blue-100 font-semibold px-3 py-1 rounded-xs border border-blue-900/60 shadow-2xs">
                    Total {gridArticles.length} Berita
                  </span>
                  {totalPortalPages > 1 && (
                    <span className="font-semibold text-white bg-white/20 px-3 py-1 rounded-xs border border-white/25 shadow-2xs">
                      Halaman {portalPage} dari {totalPortalPages}
                    </span>
                  )}
                </div>
              </div>

              {gridArticles.length === 0 ? (
                <div className="bg-white rounded-sm border border-slate-200 shadow-2xs overflow-hidden relative">
                  {/* Top Traditional Indonesian Batik Ribbon Trim */}
                  <BatikRibbon variant="ocean" height={8} />

                  <div className="p-8 sm:p-14 text-center relative overflow-hidden">
                    {/* Subtle Batik Watermark Overlay */}
                    <BatikWatermark opacity={0.07} variant="kawung" color="#0284c7" />

                    <div className="relative z-10 max-w-xl mx-auto space-y-4">
                      {/* Batik Mandala Centerpiece */}
                      <div className="flex justify-center mb-1">
                        <BatikMedallion size={54} theme="ocean" className="text-sky-600 drop-shadow-xs" />
                      </div>

                      <div>
                        <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 font-headline tracking-tight">
                          {publishedArticles.length === 0
                            ? 'Semua Isian Artikel Berita Telah Dihapus Secara Permanen'
                            : 'Tidak Ada Artikel Berita Ditemukan'}
                        </h4>
                        <p className="text-xs sm:text-sm text-sky-800 font-semibold mt-1">
                          {publishedArticles.length === 0
                            ? 'Database Cloud Firestore Bersih (0 Berita Aktif) • Ruang Legowo Siap untuk Penerbitan Baru'
                            : 'Belum ada berita yang sesuai dengan filter kategori atau kata kunci pencarian.'}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
                        {publishedArticles.length === 0
                          ? 'Seluruh data artikel berita sebelumnya telah dibersihkan secara permanen dari server database dan memori sistem. Redaksi Ruang Legowo kini hadir dengan kanvas berita bersih berpadu nuansa estetika motif batik Nusantara yang sarat nilai kebijaksanaan dan integritas.'
                          : 'Silakan reset kata kunci pencarian atau pilih kanal berita lainnya untuk melihat artikel yang tersedia.'}
                      </p>

                      {publishedArticles.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
                          <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-xs font-semibold">
                            ✓ 0 Berita di Cloud Firestore
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xs font-semibold">
                            ✓ Database Permanen Bersih
                          </span>
                          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xs font-semibold">
                            ✓ Motif Batik Nusantara Aktif
                          </span>
                        </div>
                      )}

                      {publishedArticles.length === 0 && (
                        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              if (isAdminLoggedIn) {
                                setViewMode('admin');
                              } else {
                                setIsLoginModalOpen(true);
                              }
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-sm transition-colors cursor-pointer shadow-xs"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Buka Dashboard Administrator (Tulis Berita)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Indonesian Batik Ribbon Trim */}
                  <BatikRibbon variant="ocean" height={8} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedGridArticles.map((art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        variant="grid"
                        onClick={handleSelectArticle}
                        onSelectCategory={handleSelectCategory}
                      />
                    ))}
                  </div>

                  {/* KONTROL NAVIGASI PER HALAMAN (PAGINATION) */}
                  {totalPortalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xs border border-slate-200/80">
                      {/* Ringkasan Jumlah Halaman & Berita */}
                      <div className="text-xs text-slate-600 flex items-center gap-2 order-2 md:order-1">
                        <Layers className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>
                          Menampilkan{' '}
                          <strong className="text-slate-900 font-bold">
                            {(portalPage - 1) * portalItemsPerPage + 1} -{' '}
                            {Math.min(portalPage * portalItemsPerPage, gridArticles.length)}
                          </strong>{' '}
                          dari <strong className="text-slate-900 font-bold">{gridArticles.length}</strong> berita
                        </span>
                      </div>

                      {/* Tombol Nomor & Navigasi Halaman */}
                      <div className="flex items-center gap-1.5 order-1 md:order-2">
                        {/* Tombol Halaman Sebelumnya */}
                        <button
                          onClick={() => handlePageChange(portalPage - 1)}
                          disabled={portalPage <= 1}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                            portalPage <= 1
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 hover:border-sky-400 shadow-2xs cursor-pointer'
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sebelumnya</span>
                        </button>

                        {/* Angka Nomor Halaman */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPortalPages }, (_, i) => i + 1).map((pg) => {
                            const isCurrent = pg === portalPage;
                            const isNearby =
                              Math.abs(pg - portalPage) <= 2 || pg === 1 || pg === totalPortalPages;
                            if (!isNearby) {
                              if (pg === 2 || pg === totalPortalPages - 1) {
                                return (
                                  <span key={`dots-${pg}`} className="px-1 text-slate-400 text-xs font-mono">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            }

                            return (
                              <button
                                key={pg}
                                onClick={() => handlePageChange(pg)}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'bg-sky-700 text-white shadow-xs'
                                    : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 hover:border-sky-300'
                                }`}
                              >
                                {pg}
                              </button>
                            );
                          })}
                        </div>

                        {/* Tombol Halaman Selanjutnya */}
                        <button
                          onClick={() => handlePageChange(portalPage + 1)}
                          disabled={portalPage >= totalPortalPages}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                            portalPage >= totalPortalPages
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer'
                          }`}
                        >
                          <span className="hidden sm:inline">Selanjutnya</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pilihan Jumlah Berita per Halaman */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 order-3">
                        <span className="text-[11px] text-slate-500 hidden lg:inline">Per halaman:</span>
                        {[6, 9, 12].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setPortalItemsPerPage(num);
                              setPortalPage(1);
                            }}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-xs transition-colors cursor-pointer ${
                              portalItemsPerPage === num
                                ? 'bg-sky-700 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
                            }`}
                            title={`Tampilkan ${num} berita per halaman`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        )}
      </div>

      {/* Footer with ocean theme & BrandLogo */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenLoginModal={() => {
          if (isAdminLoggedIn) {
            setViewMode('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        settings={portalSettings}
      />

      {/* Admin Login Modal (Hidden CMS Gate) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onLoginMental={handleLoginMental}
        customUsername={portalSettings.adminCustomUsername}
        customPassword={portalSettings.adminCustomPassword}
      />
    </div>
  );
}
