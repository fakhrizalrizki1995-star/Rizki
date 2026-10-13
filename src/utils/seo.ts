import { Article, SeoAuditResult, SeoCheckItem } from '../types';

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateSeoScore(
  title: string,
  slug: string,
  summary: string,
  content: string,
  focusKeyword: string,
  seoTitle?: string,
  seoDescription?: string
): SeoAuditResult {
  const effectiveTitle = seoTitle?.trim() || title.trim();
  const effectiveDesc = seoDescription?.trim() || summary.trim();
  const keyword = focusKeyword?.trim().toLowerCase() || '';

  const cleanText = content.replace(/<[^>]*>?/gm, ' ').toLowerCase();
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = cleanText.length;

  let keywordCount = 0;
  if (keyword) {
    const regex = new RegExp(`\\b${keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    const matches = cleanText.match(regex);
    keywordCount = matches ? matches.length : 0;
  }

  const keywordDensity = wordCount > 0 && keyword ? Number(((keywordCount / wordCount) * 100).toFixed(2)) : 0;

  const checks: SeoCheckItem[] = [];

  // 1. Title Length Check (Optimal: 40-70 characters)
  const titleLen = effectiveTitle.length;
  if (titleLen >= 40 && titleLen <= 70) {
    checks.push({
      id: 'title-len',
      label: 'Panjang Judul SEO Optimal',
      passed: true,
      message: `Judul memiliki panjang ideal (${titleLen} karakter). Bagus untuk keterbacaan Google SERP.`,
      score: 15,
      type: 'good',
    });
  } else if (titleLen > 0 && titleLen < 40) {
    checks.push({
      id: 'title-len',
      label: 'Judul SEO Terlalu Singkat',
      passed: false,
      message: `Judul terlalu pendek (${titleLen} karakter). Disarankan minimal 40 karakter agar lebih informatif.`,
      score: 7,
      type: 'warning',
    });
  } else {
    checks.push({
      id: 'title-len',
      label: 'Judul SEO Terpotong',
      passed: false,
      message: `Judul (${titleLen} karakter) melebihi batas 70 karakter dan berisiko terpotong di hasil pencarian.`,
      score: 5,
      type: 'warning',
    });
  }

  // 2. Meta Description Length Check (Optimal: 120-160 characters)
  const descLen = effectiveDesc.length;
  if (descLen >= 120 && descLen <= 165) {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Sangat Baik',
      passed: true,
      message: `Panjang deskripsi meta pas (${descLen} karakter), memberikan cuplikan yang menarik di mesin pencari.`,
      score: 15,
      type: 'good',
    });
  } else if (descLen >= 70 && descLen < 120) {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Agak Singkat',
      passed: false,
      message: `Deskripsi (${descLen} karakter) masih bisa diperkaya hingga 120-160 karakter untuk CTR lebih optimal.`,
      score: 8,
      type: 'warning',
    });
  } else {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Kurang Optimal',
      passed: false,
      message: descLen === 0 ? 'Meta description belum diisi.' : `Panjang meta description (${descLen} karakter) di luar rekomendasi 120-160 karakter.`,
      score: descLen > 0 ? 5 : 0,
      type: 'critical',
    });
  }

  // 3. Focus Keyword Presence
  if (keyword) {
    // In Title
    const keywordInTitle = effectiveTitle.toLowerCase().includes(keyword);
    checks.push({
      id: 'keyword-title',
      label: 'Kata Kunci Utama di Judul',
      passed: keywordInTitle,
      message: keywordInTitle
        ? `Kata kunci "${keyword}" ditemukan di dalam judul artikel.`
        : `Kata kunci "${keyword}" belum ada di dalam judul.`,
      score: keywordInTitle ? 15 : 0,
      type: keywordInTitle ? 'good' : 'critical',
    });

    // In Slug
    const keywordSlugPart = keyword.replace(/\s+/g, '-');
    const keywordInSlug = slug.toLowerCase().includes(keywordSlugPart);
    checks.push({
      id: 'keyword-slug',
      label: 'Kata Kunci di URL Slug',
      passed: keywordInSlug,
      message: keywordInSlug
        ? `Kata kunci tercermin rapi dalam struktur URL slug (/berita/${slug}).`
        : `Disarankan memasukkan kata kunci ke dalam slug URL berita.`,
      score: keywordInSlug ? 10 : 0,
      type: keywordInSlug ? 'good' : 'warning',
    });

    // In Meta Description
    const keywordInDesc = effectiveDesc.toLowerCase().includes(keyword);
    checks.push({
      id: 'keyword-desc',
      label: 'Kata Kunci di Meta Deskripsi',
      passed: keywordInDesc,
      message: keywordInDesc
        ? `Kata kunci ada di dalam ringkasan/meta deskripsi.`
        : `Sertakan kata kunci pada meta deskripsi untuk menarik perhatian calon pembaca.`,
      score: keywordInDesc ? 10 : 0,
      type: keywordInDesc ? 'good' : 'warning',
    });

    // Keyword Density (0.8% - 2.5%)
    const densityOptimal = keywordDensity >= 0.5 && keywordDensity <= 3.0;
    checks.push({
      id: 'keyword-density',
      label: 'Kepadatan Kata Kunci (Density)',
      passed: densityOptimal,
      message: `Kepadatan saat ini: ${keywordDensity}% (${keywordCount}x kemunculan). Target ideal: 0.8% - 2.5%.`,
      score: densityOptimal ? 15 : 5,
      type: densityOptimal ? 'good' : 'warning',
    });
  } else {
    checks.push({
      id: 'no-keyword',
      label: 'Kata Kunci Fokus Belum Ditentukan',
      passed: false,
      message: 'Masukkan kata kunci fokus agar analisis SEO dapat mengevaluasi optimasi konten secara mendalam.',
      score: 0,
      type: 'warning',
    });
  }

  // 4. Content Word Count (News standard: min 300 words)
  if (wordCount >= 400) {
    checks.push({
      id: 'word-count',
      label: 'Panjang Konten Artikel Mendalam',
      passed: true,
      message: `Panjang artikel ${wordCount} kata sangat disukai mesin pencari dan memuat informasi yang komprehensif.`,
      score: 15,
      type: 'good',
    });
  } else if (wordCount >= 250) {
    checks.push({
      id: 'word-count',
      label: 'Panjang Konten Memadai',
      passed: true,
      message: `Artikel memiliki ${wordCount} kata, memenuhi standar minimal artikel berita kilat.`,
      score: 10,
      type: 'good',
    });
  } else {
    checks.push({
      id: 'word-count',
      label: 'Konten Terlalu Pendek (Thin Content)',
      passed: false,
      message: `Artikel hanya memiliki ${wordCount} kata. Tambahkan paragraf penjelas agar tidak dikategorikan 'thin content' oleh Google.`,
      score: 4,
      type: 'critical',
    });
  }

  // 5. Slug Hygiene Check
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  checks.push({
    id: 'slug-format',
    label: 'Format URL Bersih & Ramah SEO',
    passed: validSlug,
    message: validSlug
      ? 'URL slug bersih, menggunakan tanda hubung dan huruf kecil tanpa karakter aneh.'
      : 'URL slug mengandung karakter khusus atau spasi yang kurang ramah mesin pencari.',
    score: validSlug ? 5 : 0,
    type: validSlug ? 'good' : 'warning',
  });

  const totalScore = Math.min(100, checks.reduce((acc, c) => acc + c.score, 0));

  let readingGrade = 'Mudah Dipahami';
  if (wordCount > 600) readingGrade = 'Analisis Mendalam';
  else if (wordCount > 300) readingGrade = 'Standar Jurnalistik';

  return {
    score: totalScore,
    checks,
    keywordDensity,
    wordCount,
    characterCount,
    readingGrade,
  };
}

export function generateJsonLdSchema(article: Article, appUrl = 'https://ruanglegowo.id'): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${appUrl}/berita/${article.slug}`,
    },
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    image: [article.featuredImage],
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Person',
      name: article.authorName,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Ruang Legowo',
      logo: {
        '@type': 'ImageObject',
        url: `${appUrl}/logo.png`,
      },
    },
    articleSection: article.category,
    keywords: (article.tags || []).join(', '),
  };

  return JSON.stringify(schema, null, 2);
}

export function generateSitemapXml(articles: Article[], appUrl = 'https://ruanglegowo.id'): string {
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const urls = publishedArticles
    .map(
      (a) => `  <url>
    <loc>${appUrl}/berita/${a.slug}</loc>
    <lastmod>${(a.updatedAt || a.createdAt).split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
}

export function generateRobotsTxt(appUrl = 'https://ruanglegowo.id'): string {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${appUrl}/sitemap.xml`;
}
