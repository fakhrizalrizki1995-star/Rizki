import React, { useState, useEffect } from 'react';
import {
  Search,
  Lock,
  Flame,
  Radio,
  Menu,
  X,
  Newspaper,
  ShieldCheck,
} from 'lucide-react';
import { ArticleCategory, PortalSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  selectedCategory: ArticleCategory | 'Semua';
  onSelectCategory: (cat: ArticleCategory | 'Semua') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  breakingNewsList: string[];
  activeReaders: number;
  onOpenLoginModal: () => void;
  onGoHome: () => void;
  settings: PortalSettings;
}

const CATEGORIES: (ArticleCategory | 'Semua')[] = [
  'Semua',
  'Politik',
  'Ekonomi',
  'Teknologi',
  'Sains',
  'Gaya Hidup',
  'Hiburan',
  'Olahraga',
];

export const Header: React.FC<HeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  breakingNewsList,
  activeReaders,
  onOpenLoginModal,
  onGoHome,
  settings,
}) => {
  const [currentBreakingIdx, setCurrentBreakingIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDateStr(formatted);
  }, []);

  useEffect(() => {
    if (breakingNewsList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBreakingIdx((prev) => (prev + 1) % breakingNewsList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [breakingNewsList]);

  return (
    <header className="border-b border-blue-800 bg-blue-700 sticky top-0 z-40 shadow-md">
      {/* Top Utility Ribbon - Biru Polos */}
      <div className="bg-blue-800 text-white text-xs py-1.5 px-4 sm:px-8 border-b border-blue-900/60 relative shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 relative z-10">
          {/* Breaking News Ticker */}
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-[240px]">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-white text-blue-800 font-extrabold tracking-wider text-[10px] uppercase shrink-0 shadow-2xs">
              <Flame className="w-3 h-3 text-blue-700" />
              TERKINI
            </span>
            <p className="truncate text-blue-100 hover:text-white font-medium transition-colors cursor-pointer text-[11px] sm:text-xs">
              {settings.breakingAnnouncement || breakingNewsList[currentBreakingIdx] || 'Selamat datang di portal Ruang Legowo'}
            </p>
          </div>

          {/* Right Status Meta */}
          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <div className="hidden md:flex items-center gap-1.5 text-blue-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-ping" />
              <Radio className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-white font-bold">{activeReaders}</span>
              <span>Pembaca Online</span>
            </div>

            <span className="hidden sm:inline text-blue-300/60">|</span>
            <span className="text-blue-100 hidden sm:inline font-medium">{currentDateStr}</span>

            {/* Hidden / Discreet CMS Login Gateway */}
            <button
              onClick={onOpenLoginModal}
              className="p-1 rounded-sm text-blue-200 hover:text-white hover:bg-white/15 transition-colors ml-1 cursor-pointer"
              title="Login Dashboard Administrator"
              aria-label="Admin Login"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Bar - Biru Polos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 bg-blue-700 text-white relative">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onGoHome}>
          <BrandLogo
            src={settings.brandLogo}
            alt={settings.brandName || 'Ruang Legowo'}
            size="md"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-headline text-white leading-none">
              {settings.brandName || 'RUANG LEGOWO'}
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-100 font-medium tracking-wide mt-0.5">
              {settings.brandTagline || 'Portal Media Berita, Analisis & Opini Terbuka'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center relative w-72">
          <Search className="w-4 h-4 text-blue-700 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berita atau topik..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white text-xs text-slate-900 rounded-md border border-blue-400 focus:border-white focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all placeholder:text-slate-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-blue-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Categories Navigation Bar - Biru Polos Tanpa Motif Batik */}
      <nav className="border-t border-blue-600 bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="hidden lg:flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-sm transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'text-white border-b-2 border-white bg-blue-600 shadow-2xs font-extrabold'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/80'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-700 bg-blue-800 px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-md border border-blue-300 focus:outline-none text-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 text-xs font-semibold rounded-md cursor-pointer ${
                    selectedCategory === cat ? 'bg-blue-600 text-white font-bold' : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
