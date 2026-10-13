import React, { useState, useEffect, useRef } from 'react';
import {
  Pause,
  Play,
  Flame,
  Clock,
  Eye,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { Article, SliderSlide, ArticleCategory } from '../types';

interface NewsPhotoSliderProps {
  articles: Article[];
  customSlides?: SliderSlide[];
  deletedSlideIds?: string[];
  onSelectArticle: (article: Article) => void;
  onSelectCategory?: (category: ArticleCategory) => void;
  autoPlayInterval?: number; // in milliseconds
}

export const NewsPhotoSlider: React.FC<NewsPhotoSliderProps> = ({
  articles,
  customSlides = [],
  deletedSlideIds = [],
  onSelectArticle,
  onSelectCategory,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set of permanently deleted slide or article IDs
  const deletedSet = React.useMemo(() => new Set(deletedSlideIds || []), [deletedSlideIds]);

  // Active custom slides if any, sorted by order and excluding deleted slides
  const activeCustomSlides = [...customSlides]
    .filter((s) => s.isActive && !deletedSet.has(s.id) && !(s.articleId && deletedSet.has(s.articleId)))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Unified slide format:
  // 1. If admin configured custom slides, display EXCLUSIVELY active custom slides (without forcing unwanted fill)
  // 2. If no custom slides exist, display published articles strictly excluding any deleted by admin
  const displaySlides = React.useMemo(() => {
    if (activeCustomSlides.length > 0) {
      return activeCustomSlides.map((s) => {
        const matchedArt =
          articles.find((a) => a.id === s.articleId) ||
          articles.find((a) => a.title.toLowerCase().trim() === s.title.toLowerCase().trim()) ||
          articles.find((a) => a.category === s.category) ||
          articles[0];

        return {
          id: s.id,
          title: s.title,
          summary: s.subtitle || matchedArt?.summary || '',
          category: s.category || matchedArt?.category || 'Nasional',
          featuredImage: s.imageUrl,
          authorName: matchedArt?.authorName || 'Redaksi Ruang Legowo',
          createdAt: matchedArt?.createdAt || new Date().toISOString(),
          readTimeMinutes: matchedArt?.readTimeMinutes || 3,
          views: matchedArt?.views || 120,
          isBreaking: false,
          originalArticle: matchedArt,
        };
      });
    }

    // Default fallback articles strictly excluding deleted items
    const fallbackArticles = articles
      .filter((a) => Boolean(a.featuredImage) && !deletedSet.has(a.id) && !deletedSet.has(`slide-custom-${a.id}`))
      .slice(0, 6)
      .map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        category: a.category,
        featuredImage: a.featuredImage,
        authorName: a.authorName,
        createdAt: a.createdAt,
        readTimeMinutes: a.readTimeMinutes,
        views: a.views,
        isBreaking: a.isBreaking,
        originalArticle: a,
      }));

    return fallbackArticles.length > 0
      ? fallbackArticles
      : articles.filter((a) => !deletedSet.has(a.id)).slice(0, 1).map((a) => ({
          id: a.id,
          title: a.title,
          summary: a.summary,
          category: a.category,
          featuredImage: a.featuredImage,
          authorName: a.authorName,
          createdAt: a.createdAt,
          readTimeMinutes: a.readTimeMinutes,
          views: a.views,
          isBreaking: a.isBreaking,
          originalArticle: a,
        }));
  }, [activeCustomSlides, articles, deletedSet]);

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (displaySlides.length <= 1) return;

    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setProgress(0);
    const stepTime = 50;
    const totalSteps = autoPlayInterval / stepTime;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / totalSteps;
      });
    }, stepTime);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
      setProgress(0);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, displaySlides.length, autoPlayInterval]);

  if (displaySlides.length === 0) return null;

  const currentSlide = displaySlides[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    setProgress(0);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    setProgress(0);
  };

  const handleSelectSlide = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(idx);
    setProgress(0);
  };

  const handleClickSlide = () => {
    if (currentSlide.originalArticle) {
      onSelectArticle(currentSlide.originalArticle);
      return;
    }

    // Direct fallback article if not matched
    const fallback: Article = {
      id: currentSlide.id,
      title: currentSlide.title,
      slug: currentSlide.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: currentSlide.summary,
      content: currentSlide.summary,
      category: (currentSlide.category as ArticleCategory) || 'Nasional',
      featuredImage: currentSlide.featuredImage,
      authorName: currentSlide.authorName || 'Redaksi Ruang Legowo',
      authorRole: 'Redaktur Pelaksana',
      status: 'published',
      tags: [currentSlide.category || 'Berita'],
      views: currentSlide.views || 100,
      shares: 12,
      likes: 25,
      readTimeMinutes: currentSlide.readTimeMinutes || 3,
      createdAt: currentSlide.createdAt,
      updatedAt: currentSlide.createdAt,
    };
    onSelectArticle(fallback);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden mb-8">
      {/* Slider Header Bar - Ocean Blue */}
      <div className="bg-gradient-to-r from-blue-900 via-sky-800 to-cyan-800 text-white px-4 py-2.5 flex items-center justify-between border-b border-sky-950">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xs bg-sky-500 flex items-center justify-center text-white shadow-2xs">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">
            Galeri Sorotan & Foto Berita Berjalan
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 bg-white/10 text-sky-100 rounded-xs text-[10px] font-mono border border-white/15">
            {currentIndex + 1} / {displaySlides.length}
          </span>
        </div>

        {/* Controls: Auto-slide toggle only (tanda < > disembunyikan sesuai permintaan) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-xs bg-white/10 hover:bg-white/20 text-sky-100 transition-colors text-xs flex items-center gap-1 px-2.5 py-1 border border-white/10 cursor-pointer"
            title={isPlaying ? 'Jeda Slider Otomatis' : 'Putar Slider Otomatis'}
          >
            {isPlaying ? <Pause className="w-3 h-3 text-cyan-300" /> : <Play className="w-3 h-3 text-emerald-300" />}
            <span className="text-[10px] font-medium hidden sm:inline">
              {isPlaying ? 'Auto-Slide Aktif' : 'Dijeda'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div
        onClick={handleClickSlide}
        className="relative group h-72 sm:h-96 lg:h-[440px] bg-slate-950 cursor-pointer overflow-hidden select-none"
      >
        {/* Background Image with smooth hover transition */}
        <img
          key={currentSlide.id}
          src={currentSlide.featuredImage}
          alt={currentSlide.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-105"
        />

        {/* Ocean Vignette Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Slide Content Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 z-10 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                if (onSelectCategory) {
                  e.stopPropagation();
                  onSelectCategory(currentSlide.category as ArticleCategory);
                }
              }}
              className="px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-xs shadow-xs border border-sky-400/40 transition-colors"
            >
              {currentSlide.category}
            </button>
            {currentSlide.isBreaking && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-xs">
                <Flame className="w-3 h-3 text-rose-600" />
                Breaking News
              </span>
            )}
            <span className="text-sky-200 text-xs hidden sm:inline">•</span>
            <span className="text-sky-200 text-xs hidden sm:inline">
              {new Date(currentSlide.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-headline leading-tight tracking-tight mb-2 text-white group-hover:text-cyan-200 transition-colors line-clamp-2 max-w-4xl">
            {currentSlide.title}
          </h2>

          <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 max-w-3xl font-editorial leading-relaxed mb-4 hidden sm:block">
            {currentSlide.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/20 text-xs text-sky-200">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-white">{currentSlide.authorName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-300" />
                {currentSlide.readTimeMinutes || 3} min baca
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
                {currentSlide.views?.toLocaleString('id-ID') || 0} tayangan
              </span>
            </div>

            {/* Prominent Action Button: Lihat Berita Langsung */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClickSlide();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-sm shadow-md transition-all group-hover:scale-105"
            >
              <span>Lihat Berita Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ocean Running Progress Bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div
              className="h-full bg-cyan-400 transition-all duration-75 shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Row - Dominan Putih & Ocean Blue */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 bg-white border-t border-slate-200 divide-x divide-slate-100">
        {displaySlides.map((art, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={art.id}
              onClick={(e) => handleSelectSlide(idx, e)}
              className={`p-2.5 text-left transition-all relative flex items-center gap-2.5 ${
                isActive
                  ? 'bg-sky-50/70 border-t-2 border-t-sky-600'
                  : 'hover:bg-slate-50 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={art.featuredImage}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-cover rounded-xs shrink-0 border border-slate-300"
              />
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-sky-700 uppercase tracking-wider block leading-none mb-1">
                  {art.category}
                </span>
                <p className="text-[11px] font-semibold text-slate-800 line-clamp-1 leading-snug">
                  {art.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
