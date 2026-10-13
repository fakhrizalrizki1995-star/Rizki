import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Globe,
  Share2,
  Code,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SeoAuditResult, Article } from '../../types';
import { generateJsonLdSchema } from '../../utils/seo';

interface SeoAuditPanelProps {
  seoAudit: SeoAuditResult;
  title: string;
  slug: string;
  summary: string;
  focusKeyword: string;
  featuredImage: string;
  category: string;
}

export const SeoAuditPanel: React.FC<SeoAuditPanelProps> = ({
  seoAudit,
  title,
  slug,
  summary,
  focusKeyword,
  featuredImage,
  category,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'serp' | 'social' | 'schema'>('audit');

  const { score, checks, keywordDensity, wordCount, characterCount, readingGrade } = seoAudit;

  const getScoreColor = (sc: number) => {
    if (sc >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200' };
    if (sc >= 50) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200' };
    return { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 border-rose-200' };
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-white border border-stone-200 rounded-sm shadow-xs overflow-hidden">
      {/* Panel Header with Score Meter */}
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
              Audit & Skor SEO Real-Time
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Dioptimalkan untuk Google News & Search Engine Snippets
          </p>
        </div>

        {/* Score Dial Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border ${scoreColor.badge}`}>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-500 block leading-none">Skor SEO</span>
            <span className={`text-base font-extrabold ${scoreColor.text} leading-none`}>
              {score} / 100
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center p-0.5">
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-white text-[11px] font-bold ${scoreColor.bg}`}
            >
              {score >= 80 ? 'A' : score >= 50 ? 'B' : 'C'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1.5">
        <div
          className={`h-full transition-all duration-500 ${scoreColor.bg}`}
          style={{ width: `${Math.max(5, score)}%` }}
        />
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-4 border-b border-stone-200 text-center py-2 text-xs bg-white divide-x divide-stone-100">
        <div>
          <span className="text-[10px] text-stone-400 block">Jumlah Kata</span>
          <span className="font-bold text-stone-800">{wordCount}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block">Kepadatan Kata</span>
          <span className="font-bold text-stone-800">{keywordDensity}%</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block">Karakter</span>
          <span className="font-bold text-stone-800">{characterCount}</span>
        </div>
        <div>
          <span className="text-[10px] text-stone-400 block">Tingkat Baca</span>
          <span className="font-bold text-stone-800 text-[11px]">{readingGrade}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-200 text-xs bg-stone-50/50">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-rose-600 text-rose-600 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Daftar Periksa
        </button>
        <button
          onClick={() => setActiveTab('serp')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
            activeTab === 'serp'
              ? 'border-rose-600 text-rose-600 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Google SERP
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
            activeTab === 'social'
              ? 'border-rose-600 text-rose-600 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Sosial Card
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors ${
            activeTab === 'schema'
              ? 'border-rose-600 text-rose-600 bg-white'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          Schema.org
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 max-h-[380px] overflow-y-auto">
        {/* Tab: Audit Checklist */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-2.5 text-xs p-2 rounded-xs border border-stone-100 bg-stone-50/50"
              >
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : check.type === 'critical' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <span>{check.label}</span>
                    <span className="text-[10px] text-stone-400 font-normal">
                      (+{check.score} poin)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Google SERP Snippet Preview */}
        {activeTab === 'serp' && (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500">
              Pratinjau tampilan artikel berita Anda di halaman hasil pencarian Google:
            </p>
            <div className="p-3 bg-white border border-stone-200 rounded-sm font-sans shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-stone-700 mb-1">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[11px] text-stone-800">ruanglegowo.id</span>
                <span className="text-stone-400">›</span>
                <span className="text-[11px] text-stone-500 truncate max-w-[200px]">
                  berita › {slug || 'judul-berita'}
                </span>
              </div>
              <h4 className="text-sm font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
                {title || 'Judul Berita Belum Diisi'} - Ruang Legowo
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-normal">
                {summary || 'Deskripsi meta atau ringkasan berita akan ditampilkan di sini sebagai cuplikan pencarian...'}
              </p>
            </div>
          </div>
        )}

        {/* Tab: Social Card Preview (WhatsApp & Twitter) */}
        {activeTab === 'social' && (
          <div className="space-y-3">
            <p className="text-[11px] text-stone-500">
              Pratinjau Open Graph saat artikel dibagikan ke WhatsApp & Twitter/X:
            </p>
            <div className="border border-stone-200 rounded-sm overflow-hidden bg-white shadow-2xs">
              <div className="h-28 bg-stone-900 overflow-hidden relative">
                {featuredImage ? (
                  <img src={featuredImage} alt="OG Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-stone-400 text-xs">
                    Gambar Belum Ditentukan
                  </div>
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] rounded-xs font-mono">
                  ruanglegowo.id
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[9px] uppercase font-bold text-rose-600 block mb-0.5">
                  {category}
                </span>
                <h5 className="text-xs font-bold text-stone-900 line-clamp-1">
                  {title || 'Judul Berita'}
                </h5>
                <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                  {summary || 'Ringkasan berita akan tampil di kartu pratinjau sosial.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Schema.org JSON-LD */}
        {activeTab === 'schema' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold">Schema.org NewsArticle (JSON-LD)</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                Google News Ready
              </span>
            </div>
            <pre className="text-[10px] bg-stone-900 text-stone-100 p-2.5 rounded-sm overflow-x-auto font-mono max-h-48 leading-relaxed">
              {generateJsonLdSchema({
                id: 'preview',
                title: title || 'Judul Berita',
                slug: slug || 'judul-berita',
                summary: summary || 'Ringkasan Berita',
                content: '',
                category: category as any,
                featuredImage: featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167',
                authorName: 'Redaksi NusantaraPost',
                authorRole: 'Jurnalis',
                status: 'published',
                tags: [],
                views: 0,
                shares: 0,
                likes: 0,
                readTimeMinutes: 3,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
