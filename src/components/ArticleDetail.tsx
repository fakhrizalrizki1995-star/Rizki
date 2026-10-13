import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  ThumbsUp,
  Volume2,
  VolumeX,
  Bookmark,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Edit3,
  Calendar,
  User,
  ExternalLink,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Article, Comment, ArticleCategory } from '../types';
import {
  incrementArticleViews,
  incrementArticleLikes,
  incrementArticleShares,
  subscribeToComments,
  addComment,
} from '../services/articleService';
import { recordVisitorPageView } from '../services/analyticsService';
import { BatikRibbon, BatikMedallion } from './BatikOrnament';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onEditInAdmin?: (article: Article) => void;
  onSelectCategory?: (category: ArticleCategory) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  onBack,
  onSelectArticle,
  onSelectCategory,
}) => {
  const [likes, setLikes] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fitur Baca Berita Dibuat Per Halaman (Classic Indonesian Media Pagination)
  const [readingPage, setReadingPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);

  // Pecah konten berita menjadi per halaman
  const articlePages = useMemo(() => {
    // 1. Jika ada tag pemisah eksplisit: <!--pagebreak--> atau [pagebreak] atau ---halaman---
    const pageBreakRegex = /<!--\s*pagebreak\s*-->|\[pagebreak\]|---\s*pagebreak\s*---|---\s*halaman\s*---/i;
    if (pageBreakRegex.test(article.content)) {
      const parts = article.content.split(pageBreakRegex).map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0) return parts;
    }

    // 2. Jika tidak ada tag eksplisit, pecah per alinea / paragraf
    const paragraphs = article.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    // Jika artikel memiliki 4 paragraf atau lebih, otomatis dibagi per 2 paragraf per halaman
    if (paragraphs.length >= 4) {
      const paragraphsPerPage = 2;
      const pages: string[] = [];
      for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
        pages.push(paragraphs.slice(i, i + paragraphsPerPage).join('\n\n'));
      }
      return pages;
    }

    // Default 1 halaman
    return [article.content];
  }, [article.content]);

  // Reset ke halaman 1 saat berganti artikel
  useEffect(() => {
    setReadingPage(1);
    setShowAllPages(false);
  }, [article.id]);

  const handleFlipPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > articlePages.length) return;
    setReadingPage(pageNum);
    setShowAllPages(false);
    const contentAnchor = document.getElementById('article-content-anchor');
    if (contentAnchor) {
      contentAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  // Record visitor view and subscribe to comments
  useEffect(() => {
    // 1. Record Firestore page view metrics
    incrementArticleViews(article.id);
    recordVisitorPageView(article.id, article.title);

    // 2. Subscribe to reader comments
    const unsubscribe = subscribeToComments(article.id, (loadedComments) => {
      setComments(loadedComments);
    });

    // Window scroll directly to top of news topic
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      unsubscribe();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Audio Speech Reader
  const toggleAudioReader = () => {
    if (!('speechSynthesis' in window)) {
      alert('Peramban web Anda tidak mendukung pembacaan suara sintetis.');
      return;
    }

    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
    } else {
      const textToRead = `${article.title}. ${article.summary}. ${article.content.substring(0, 1000)}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
    }
  };

  const handleLike = () => {
    if (hasLiked) return;
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    incrementArticleLikes(article.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    incrementArticleShares(article.id);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`*${article.title}*\n\nBaca selengkapnya di NusantaraPost:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    incrementArticleShares(article.id);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`${article.title} via @NusantaraPost`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    incrementArticleShares(article.id);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment({
        articleId: article.id,
        userName: commentName.trim(),
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      });
      setCommentText('');
    } catch (err) {
      console.error('Gagal mengirim komentar:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = new Date(article.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumbs & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-200">
        {/* Clickable Breadcrumbs directly to topic */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            onClick={onBack}
            className="hover:text-sky-700 font-semibold transition-colors"
          >
            Beranda
          </button>
          <span>›</span>
          <button
            onClick={() => onSelectCategory && onSelectCategory(article.category)}
            className="hover:text-sky-700 font-bold text-sky-800 transition-colors"
          >
            Kanal {article.category}
          </button>
          <span className="hidden sm:inline">›</span>
          <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]">
            {article.title}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Indeks Berita</span>
          </button>
        </div>
      </div>

      {/* Traditional Indonesian Batik Ribbon Top Accent */}
      <BatikRibbon variant="ocean" height={4} className="mb-4 rounded-xs" />

      {/* Article Header & Metadata */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onSelectCategory && onSelectCategory(article.category)}
            className="px-2.5 py-0.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xs shadow-xs border border-sky-400/30 transition-colors cursor-pointer"
            title={`Lihat semua topik berita ${article.category}`}
          >
            Kanal {article.category}
          </button>
          {article.isBreaking && (
            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider rounded-xs animate-pulse">
              Breaking News
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline text-slate-900 leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-700 font-editorial leading-relaxed mb-6 italic border-l-4 border-sky-600 pl-4 py-1 bg-sky-50/60">
          {article.summary}
        </p>

        {/* Author & Meta bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-900 text-white font-bold flex items-center justify-center text-xs">
              {article.authorName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{article.authorName}</p>
              <p className="text-[11px] text-slate-500">{article.authorRole || 'Jurnalis Ruang Legowo'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              {article.readTimeMinutes || 3} menit baca
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              {article.views?.toLocaleString('id-ID') || 0} tayangan
            </span>
            {article.originalSource && (
              <span className="flex items-center gap-1 font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-xs border border-sky-200">
                <Newspaper className="w-3.5 h-3.5 text-sky-600" />
                <span>Sumber: {article.originalSource}</span>
              </span>
            )}
          </div>
        </div>

        {/* FITUR PEMBUAT BERITA SEMULA & LINK BERITA AWAL */}
        {(article.originalSource || article.originalUrl) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border border-sky-200 border-l-4 border-l-sky-600 rounded-r-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Newspaper className="w-4 h-4 text-cyan-200" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-800 block">
                  Pembuat Berita Semula / Sumber Rujukan
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {article.originalSource || 'Lembaga / Media Sumber Asli'}
                </h4>
              </div>
            </div>
            {article.originalUrl && (
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-sky-100 text-sky-800 font-bold border border-sky-300 rounded-xs transition-colors shrink-0 shadow-2xs group"
                title="Kunjungi tautan berita asli di portal sumber"
              >
                <span>Lihat Berita Asli</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}

        {/* Action Tools (TTS Reader + Share) */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 bg-sky-50/60 border border-sky-100 rounded-xs px-3 mt-3 text-xs">
          {/* Audio TTS button */}
          <button
            onClick={toggleAudioReader}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm font-semibold transition-all ${
              isReadingAudio
                ? 'bg-sky-700 text-white animate-pulse'
                : 'bg-white text-slate-800 hover:bg-sky-50 border border-slate-300'
            }`}
          >
            {isReadingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
            <span>{isReadingAudio ? 'Hentikan Audio' : 'Dengarkan Berita Ini'}</span>
          </button>

          {/* Share buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-500 mr-1">Bagikan:</span>
            <button
              onClick={shareViaWhatsApp}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xs transition-colors text-xs"
              title="Bagikan ke WhatsApp"
            >
              WhatsApp
            </button>
            <button
              onClick={shareViaTwitter}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xs transition-colors text-xs"
              title="Bagikan ke X"
            >
              X / Twitter
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 border border-stone-300 font-medium rounded-xs transition-colors text-xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <figure className="mb-8">
        <div className="overflow-hidden rounded-xs border border-stone-200 bg-stone-900">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
        {article.imageCaption && (
          <figcaption className="text-xs text-stone-500 mt-2 italic px-1">
            {article.imageCaption}
          </figcaption>
        )}
      </figure>

      {/* Anchor for Smooth Scroll When Flipping Pages */}
      <div id="article-content-anchor" className="scroll-mt-24" />

      {/* Indikator Halaman di Bagian Atas Artikel (Jika Multi-Halaman) */}
      {articlePages.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-sky-50 border border-sky-200/90 px-4 py-2.5 rounded-xs text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-700" />
            <span className="font-bold text-sky-950">
              {showAllPages
                ? 'Menampilkan Seluruh Halaman'
                : `Halaman ${readingPage} dari ${articlePages.length}`}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">Format Baca Berita Per Halaman</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllPages(!showAllPages)}
              className="text-[11px] font-bold text-sky-800 hover:text-sky-950 bg-white hover:bg-sky-100 px-3 py-1 rounded-xs border border-sky-300 transition-colors cursor-pointer shadow-2xs"
            >
              {showAllPages ? 'Beralih ke Mode Per Halaman' : 'Lihat Seluruh Halaman'}
            </button>
          </div>
        </div>
      )}

      {/* Main Formatted Article Content (Rendered Per Halaman atau Semua Halaman) */}
      <div className="prose prose-stone max-w-none font-editorial text-base sm:text-lg leading-relaxed text-stone-800 space-y-6">
        {showAllPages ? (
          // Mode Lihat Semua Halaman
          articlePages.map((pageText, pIdx) => (
            <div key={pIdx} className="space-y-5">
              {pIdx > 0 && (
                <div className="my-8 py-2 border-y border-dashed border-sky-200 text-center text-xs font-bold text-sky-700 bg-sky-50/60 rounded-xs">
                  — Halaman {pIdx + 1} —
                </div>
              )}
              {pageText.split('\n\n').map((paragraph, idx) => {
                if (!paragraph.trim()) return null;
                if (pIdx === 0 && idx === 0) {
                  return (
                    <p key={idx} className="font-normal text-stone-900 text-lg sm:text-xl leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ))
        ) : (
          // Mode Baca Per Halaman
          (articlePages[readingPage - 1] || article.content).split('\n\n').map((paragraph, idx) => {
            if (!paragraph.trim()) return null;
            if (readingPage === 1 && idx === 0) {
              return (
                <p key={idx} className="font-normal text-stone-900 text-lg sm:text-xl leading-relaxed">
                  {paragraph}
                </p>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })
        )}
      </div>

      {/* KONTROL NAVIGASI PER HALAMAN DI BAWAH ARTIKEL BERITA */}
      {articlePages.length > 1 && (
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold order-2 sm:order-1">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>
                {showAllPages ? (
                  <strong className="text-sky-900">Seluruh Isi Halaman Ditampilkan</strong>
                ) : (
                  <>
                    Halaman Baca:{' '}
                    <strong className="text-sky-900 font-bold">
                      {readingPage} dari {articlePages.length}
                    </strong>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center order-1 sm:order-2">
              {/* Tombol Halaman Sebelumnya */}
              <button
                onClick={() => handleFlipPage(readingPage - 1)}
                disabled={readingPage <= 1 || showAllPages}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                  readingPage <= 1 || showAllPages
                    ? 'bg-slate-200/60 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 shadow-2xs cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              {/* Nomor-nomor Halaman */}
              {articlePages.map((_, idx) => {
                const pg = idx + 1;
                const isActive = !showAllPages && readingPage === pg;
                return (
                  <button
                    key={pg}
                    onClick={() => handleFlipPage(pg)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-sky-700 text-white shadow-xs'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              {/* Tombol Halaman Selanjutnya */}
              <button
                onClick={() => handleFlipPage(readingPage + 1)}
                disabled={readingPage >= articlePages.length || showAllPages}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xs transition-colors ${
                  readingPage >= articlePages.length || showAllPages
                    ? 'bg-slate-200/60 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-sky-700 hover:bg-sky-800 text-white shadow-2xs cursor-pointer'
                }`}
              >
                <span>Halaman Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowAllPages(!showAllPages)}
              className="text-xs font-bold text-sky-800 hover:text-sky-950 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xs border border-sky-300 transition-colors shadow-2xs cursor-pointer order-3"
            >
              {showAllPages ? 'Mode Per Halaman' : 'Tampilkan Semua Halaman'}
            </button>
          </div>
        </div>
      )}

      {/* Catatan Atribusi & Hak Cipta Sumber Berita Awal */}
      {(article.originalSource || article.originalUrl) && (
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-sky-700 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">Atribusi Berita Semula:</span>{' '}
              <span>
                Artikel ini dipublikasikan dengan merujuk materi dari{' '}
                <strong className="text-sky-900">{article.originalSource || 'sumber rujukan awal'}</strong>.
              </span>
            </div>
          </div>
          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-700 hover:text-sky-900 font-bold inline-flex items-center gap-1.5 underline shrink-0"
            >
              <span>Tautan Berita Awal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Tags Pills */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
            Topik Terkait:
          </h4>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-sm text-xs font-semibold cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reader Engagement (Like button) */}
      <div className="mt-8 p-5 bg-stone-100 rounded-sm flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-stone-900">Apakah artikel ini bermanfaat bagi Anda?</h4>
          <p className="text-xs text-stone-500">Berikan apresiasi untuk kerja jurnalisme redaksi kami.</p>
        </div>
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-xs transition-all ${
            hasLiked
              ? 'bg-sky-700 text-white cursor-default'
              : 'bg-white hover:bg-sky-50 text-slate-800 border border-slate-300 shadow-2xs'
          }`}
        >
          <ThumbsUp className="w-4 h-4 text-sky-400" />
          <span>{likes} Suka</span>
        </button>
      </div>

      {/* Comments Section */}
      <section className="mt-10 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-sky-700" />
          <h3 className="text-xl font-bold font-headline text-slate-900">
            Kolom Pembaca ({comments.length})
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="bg-white border border-stone-200 rounded-sm p-4 sm:p-5 mb-8 shadow-xs">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">Tulis Komentar</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <input
                type="text"
                placeholder="Nama Anda *"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-3">
            <textarea
              placeholder="Sampaikan opini atau tanggapan Anda secara santun..."
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-sm focus:border-stone-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !commentName.trim() || !commentText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingComment ? 'Mengirim...' : 'Kirim Komentar'}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-4 text-center">
              Belum ada komentar untuk artikel ini. Jadilah yang pertama berkomentar!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 bg-white border border-stone-200 rounded-sm shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-stone-900">{c.userName}</span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(c.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 pt-8 border-t border-stone-200">
          <h3 className="text-xl font-bold font-headline text-stone-900 mb-6">
            Berita Terkait Lainnya
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.slice(0, 3).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel)}
                className="group cursor-pointer bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-xs transition-all"
              >
                <div className="h-32 bg-stone-900 overflow-hidden">
                  <img
                    src={rel.featuredImage}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-rose-700 line-clamp-2 leading-snug">
                    {rel.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
