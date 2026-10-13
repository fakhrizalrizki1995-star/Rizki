export type ArticleCategory = 
  | 'Nasional'
  | 'Politik'
  | 'Ekonomi'
  | 'Teknologi'
  | 'Sains'
  | 'Gaya Hidup'
  | 'Hiburan'
  | 'Olahraga';

export type ArticleStatus = 'published' | 'draft' | 'archived';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  featuredImage: string;
  imageCaption?: string;
  authorName: string;
  authorRole: string;
  status: ArticleStatus;
  isBreaking?: boolean;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  tags: string[];
  views: number;
  shares: number;
  likes: number;
  readTimeMinutes: number;
  originalSource?: string; // Pembuat berita semula / nama sumber awal
  originalUrl?: string; // Link / URL berita awal
  createdAt: string;
  updatedAt: string;
}

export interface VisitorLog {
  id: string;
  articleId: string;
  articleTitle: string;
  timestamp: string;
  referrer: string;
  device: 'Mobile' | 'Desktop' | 'Tablet';
  browser: string;
  city: string;
  country: string;
  durationSeconds: number;
}

export interface Comment {
  id: string;
  articleId: string;
  userName: string;
  userEmail?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface SeoCheckItem {
  id: string;
  label: string;
  passed: boolean;
  message: string;
  score: number;
  type: 'critical' | 'warning' | 'good';
}

export interface SeoAuditResult {
  score: number; // 0 - 100
  checks: SeoCheckItem[];
  keywordDensity: number;
  wordCount: number;
  characterCount: number;
  readingGrade: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgDurationSeconds: number;
  activeNow: number;
  bounceRatePercent: number;
  viewsToday: number;
  topArticles: { id: string; title: string; views: number; category: string }[];
  referrers: { source: string; count: number; percentage: number }[];
  devices: { device: string; count: number; percentage: number }[];
  categories: { category: string; count: number; percentage: number }[];
  recentLogs: VisitorLog[];
}

export interface PortalSettings {
  brandName: string;
  brandTagline: string;
  brandLogo: string;
  breakingAnnouncement?: string;
  footerAbout: string;
  footerAddress: string;
  footerEmail: string;
  footerPhone: string;
  footerCopyright: string;
  sliderIntervalSeconds: number;
  htmlTitle?: string; // Nama judul di tab browser
  htmlFavicon?: string; // Logo tab favicon di browser
  adminCustomUsername?: string; // Username kustom admin
  adminCustomPassword?: string; // Password kustom admin
  deletedSlideIds?: string[]; // ID slide atau artikel yang dihapus permanen dari slider
}

export interface SliderSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  category: string;
  articleId?: string;
  order: number;
  isActive: boolean;
}

