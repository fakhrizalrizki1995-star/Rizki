import React from 'react';
import { Newspaper, ShieldCheck, Mail, MapPin, Phone, Lock } from 'lucide-react';
import { ArticleCategory, PortalSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectCategory: (cat: ArticleCategory | 'Semua') => void;
  onOpenLoginModal: () => void;
  settings: PortalSettings;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenLoginModal, settings }) => {
  return (
    <footer className="bg-blue-900 text-blue-100 border-t border-blue-800 mt-16 text-xs relative overflow-hidden shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandLogo
                src={settings.brandLogo}
                alt={settings.brandName || 'Ruang Legowo'}
                size="sm"
              />
              <span className="font-extrabold text-lg text-white font-headline tracking-tight">
                {settings.brandName || 'RUANG LEGOWO'}
              </span>
            </div>
            <p className="text-blue-100/90 text-xs leading-relaxed">
              {settings.footerAbout ||
                'Portal media berita independen Ruang Legowo: Mengedepankan keterbukaan, integritas jurnalisme, analisis mendalam, dan pembaruan fakta terverifikasi secara real-time.'}
            </p>
            <div className="flex items-center gap-2 text-blue-300 text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>Mematuhi Pedoman Media Siber & Dewan Pers</span>
            </div>
          </div>

          {/* Kanal Berita */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Kanal Berita
            </h4>
            <ul className="space-y-2 text-blue-200">
              {['Politik', 'Ekonomi', 'Teknologi', 'Sains', 'Gaya Hidup', 'Olahraga'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat as any)}
                    className="hover:text-white hover:underline transition-colors cursor-pointer text-left font-medium"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Redaksi & Informasi */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Redaksi & Informasi
            </h4>
            <ul className="space-y-2 text-blue-200">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Susunan Dewan Redaksi</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Pedoman Pemberitaan Media Siber</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Kode Etik Jurnalistik</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">Karier & Koresponden Daerah</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1.5 text-blue-300 hover:text-white transition-colors text-[11px] cursor-pointer"
                  title="Login Dashboard Administrator"
                >
                  <Lock className="w-3 h-3 text-blue-300" />
                  <span>Login Dashboard Administrator</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Kantor Redaksi & Kontak */}
          <div className="space-y-2 text-blue-200">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Kontak Redaksi
            </h4>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
              <span className="text-blue-100">{settings.footerAddress || 'Gedung Graha Pers Legowo Lt. 7, Jl. Merdeka Selatan, Jakarta Pusat'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="text-blue-100">{settings.footerEmail || 'redaksi@ruanglegowo.id'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-300 shrink-0" />
              <span className="text-blue-100">{settings.footerPhone || '(021) 3890-7766'}</span>
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-blue-800 mt-10 pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-blue-300">
          <p>{settings.footerCopyright || `© ${new Date().getFullYear()} Ruang Legowo Media Group. Hak cipta dilindungi undang-undang.`}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Kebijakan Privasi</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Ketentuan Layanan</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Peta Situs (Sitemap)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
