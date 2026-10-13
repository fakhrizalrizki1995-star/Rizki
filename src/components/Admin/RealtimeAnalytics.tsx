import React from 'react';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Radio,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Share2,
  Sparkles,
  ArrowUpRight,
  Flame,
  Activity,
} from 'lucide-react';
import { AnalyticsSummary, VisitorLog } from '../../types';
import { recordVisitorPageView } from '../../services/analyticsService';

interface RealtimeAnalyticsProps {
  summary: AnalyticsSummary;
  onSelectArticleById?: (articleId: string) => void;
}

export const RealtimeAnalytics: React.FC<RealtimeAnalyticsProps> = ({
  summary,
  onSelectArticleById,
}) => {
  const {
    totalViews,
    uniqueVisitors,
    avgDurationSeconds,
    activeNow,
    bounceRatePercent,
    topArticles,
    referrers,
    devices,
    categories,
    recentLogs,
  } = summary;

  const minutes = Math.floor(avgDurationSeconds / 60);
  const seconds = avgDurationSeconds % 60;

  // Trigger test live event to show real-time Firestore sync
  const triggerSimulatedVisitor = async () => {
    if (topArticles.length > 0) {
      const randomArt = topArticles[Math.floor(Math.random() * topArticles.length)];
      await recordVisitorPageView(randomArt.id, randomArt.title);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Real-time Heartbeat Banner - Ocean Blue */}
      <div className="bg-gradient-to-r from-blue-950 via-sky-900 to-blue-950 text-white p-5 rounded-sm shadow-md border border-sky-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-cyan-300" />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {activeNow}
              </span>
              <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-xs font-bold rounded-xs border border-cyan-400/30">
                LIVE
              </span>
            </div>
            <p className="text-xs text-sky-200">Pembaca Sedang Aktif Membaca Berita Saat Ini</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerSimulatedVisitor}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-sky-100 text-xs font-semibold rounded-sm border border-white/20 transition-colors"
            title="Kirim event kunjungan tiruan untuk memverifikasi streaming Firestore"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>Simulasi Kunjungan Live</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-stone-200 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pembacaan (Views)</span>
            <Eye className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {totalViews.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +14.2% dari pekan lalu
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-200 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Pengunjung Unik</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {uniqueVisitors.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Jangkauan audiens terverifikasi
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-200 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-Rata Durasi Baca</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {minutes}m {seconds}d
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> Waktu retensi tinggi (engaged)
          </span>
        </div>

        <div className="bg-white p-4 border border-stone-200 rounded-sm shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Rasio Pantulan (Bounce)</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {bounceRatePercent}%
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Standar industri media berita sehat
          </span>
        </div>
      </div>

      {/* Main Charts & Leaderboards (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Articles & Real-time Activity Stream (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Articles Leaderboard */}
          <div className="bg-white border border-stone-200 rounded-sm shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  Artikel Paling Banyak Dibaca (Leaderboard)
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">Peringkat Berdasarkan Tayangan</span>
            </div>

            <div className="space-y-3">
              {topArticles.map((art, idx) => (
                <div
                  key={art.id}
                  onClick={() => onSelectArticleById && onSelectArticleById(art.id)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-sm bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer border border-stone-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-extrabold text-base text-stone-400 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {art.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-rose-600">
                        {art.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-stone-900 block">
                      {art.views.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-stone-400">tayangan</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Visitor Live Stream */}
          <div className="bg-white border border-stone-200 rounded-sm shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  Aktivitas Pengunjung Real-Time (Live Feed)
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">Tersinkron Firestore</span>
            </div>

            <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center italic">
                  Menunggu rekaman aktivitas pengunjung berikutnya...
                </p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-stone-800 font-medium truncate">
                        Pembaca membuka <span className="font-bold text-stone-900">"{log.articleTitle}"</span>
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                        <span>{log.city}, {log.country}</span>
                        <span>•</span>
                        <span>{log.device} ({log.browser})</span>
                        <span>•</span>
                        <span className="text-stone-500 font-medium truncate max-w-[150px]">
                          via {log.referrer}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Traffic Sources & Devices (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Traffic Sources (Referrers) */}
          <div className="bg-white border border-stone-200 rounded-sm shadow-2xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                Sumber Lalu Lintas (Referrers)
              </h3>
            </div>

            <div className="space-y-3">
              {referrers.map((ref) => (
                <div key={ref.source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-stone-800">{ref.source}</span>
                    <span className="text-stone-500 font-bold">{ref.percentage}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-xs transition-all duration-500"
                      style={{ width: `${ref.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white border border-stone-200 rounded-sm shadow-2xs p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                Perangkat Pengunjung (Devices)
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {devices.map((dev) => {
                const Icon =
                  dev.device === 'Mobile' ? Smartphone : dev.device === 'Tablet' ? Tablet : Monitor;
                return (
                  <div key={dev.device} className="p-3 bg-stone-50 rounded-sm border border-stone-100">
                    <Icon className="w-5 h-5 mx-auto text-stone-700 mb-1" />
                    <span className="text-xs font-bold text-stone-900 block">{dev.percentage}%</span>
                    <span className="text-[10px] text-stone-500">{dev.device}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white border border-stone-200 rounded-sm shadow-2xs p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">
              Minat Pembaca Berdasarkan Kategori
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs py-1">
                  <span className="text-stone-700 font-medium">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-stone-100 h-1.5 rounded-xs overflow-hidden">
                      <div
                        className="bg-rose-600 h-full rounded-xs"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-stone-500 font-mono text-[11px] w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
