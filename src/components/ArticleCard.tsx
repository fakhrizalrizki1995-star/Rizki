import { Clock, Eye, Flame, ArrowRight } from 'lucide-react';
import { Article, ArticleCategory } from '../types';
import { BatikRibbon } from './BatikOrnament';

interface ArticleCardProps {
  article: Article;
  variant?: 'lead' | 'secondary' | 'grid' | 'trending' | 'compact';
  rank?: number;
  onClick: (article: Article) => void;
  onSelectCategory?: (category: ArticleCategory) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'grid',
  rank,
  onClick,
  onSelectCategory,
}) => {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleCategoryClick = (e: React.MouseEvent) => {
    if (onSelectCategory) {
      e.stopPropagation();
      onSelectCategory(article.category);
    }
  };

  // Trending minimal variant
  if (variant === 'trending') {
    return (
      <div
        onClick={() => onClick(article)}
        className="group flex items-start gap-3 py-3 border-b border-slate-100 cursor-pointer hover:bg-sky-50/40 transition-colors"
      >
        {rank !== undefined && (
          <span className="font-extrabold text-2xl text-slate-300 group-hover:text-sky-600 transition-colors shrink-0 w-7">
            {rank < 10 ? `0${rank}` : rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleCategoryClick}
            className="text-[10px] font-bold tracking-wider uppercase text-sky-700 hover:underline block text-left"
          >
            {article.category}
          </button>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-sky-700 transition-colors mt-0.5 leading-snug">
            {article.title}
          </h4>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-sky-600" />
                {article.views?.toLocaleString('id-ID') || 0}
              </span>
              <span>•</span>
              <span>{article.readTimeMinutes || 3} mnt</span>
            </div>
            <span className="text-sky-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Lihat Berita <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Lead / Hero main banner
  if (variant === 'lead') {
    return (
      <div
        onClick={() => onClick(article)}
        className="group relative bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        <BatikRibbon variant="ocean" height={4} className="col-span-full" />
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-[420px] overflow-hidden bg-slate-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-95 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
          {article.isBreaking && (
            <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xs shadow-md border border-sky-400/40">
              <Flame className="w-3.5 h-3.5 text-cyan-200" />
              Headline Utama
            </span>
          )}
        </div>

        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <button
                onClick={handleCategoryClick}
                className="px-2.5 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs uppercase tracking-wider rounded-xs border border-sky-200 transition-colors"
              >
                {article.category}
              </button>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-slate-500 text-xs">{formattedDate}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-headline text-slate-900 group-hover:text-sky-700 transition-colors leading-tight mb-3">
              {article.title}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 font-editorial">
              {article.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[10px]">
                {article.authorName.charAt(0)}
              </div>
              <span className="font-semibold text-slate-800 text-xs">{article.authorName}</span>
            </div>

            {/* Direct Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(article);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-sm shadow-xs transition-all group-hover:bg-sky-700"
            >
              <span>Lihat Berita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Secondary Featured
  if (variant === 'secondary') {
    return (
      <div
        onClick={() => onClick(article)}
        className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {article.isBreaking && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-sky-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xs">
              Terkini
            </span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={handleCategoryClick}
                className="text-[10px] font-bold text-sky-700 hover:underline uppercase tracking-wider"
              >
                {article.category}
              </button>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-[11px] text-slate-400">{formattedDate}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug mb-2 font-headline">
              {article.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
              {article.summary}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="truncate max-w-[110px] font-medium text-slate-600">
              {article.authorName}
            </span>
            <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:text-sky-800">
              Lihat Berita <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Article - Dominan Putih
  return (
    <article
      onClick={() => onClick(article)}
      className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:shadow-sm hover:border-sky-300 transition-all cursor-pointer flex flex-col h-full justify-between"
    >
      <div>
        <div className="relative h-44 overflow-hidden bg-slate-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 flex gap-1">
            <button
              onClick={handleCategoryClick}
              className="px-2 py-0.5 bg-white/95 hover:bg-white text-sky-900 font-bold text-[10px] uppercase tracking-wider rounded-xs shadow-2xs"
            >
              {article.category}
            </button>
            {article.isBreaking && (
              <span className="px-2 py-0.5 bg-sky-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xs shadow-2xs">
                Kilat
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-1 mb-1 text-[11px] text-slate-400">
            <span>{formattedDate}</span>
            {article.originalSource && (
              <span className="text-[10px] text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded-2xs border border-sky-200 font-semibold truncate max-w-[140px]" title={`Pembuat/Sumber: ${article.originalSource}`}>
                Sumber: {article.originalSource}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug mb-2 font-headline">
            {article.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-editorial">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-slate-100">
          <span className="truncate max-w-[120px] text-slate-600 font-medium">
            {article.authorName}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(article);
            }}
            className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Lihat Berita</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
