import React, { useState } from 'react';
import { Lock, KeyRound, User, X, ShieldAlert, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  onLoginMental?: (reason: string) => void;
  customUsername?: string;
  customPassword?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLoginMental,
  customUsername,
  customPassword,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMental, setIsMental] = useState(false);

  if (!isOpen) return null;

  // Expected credentials (default to admin / admin if not yet configured)
  const expectedUser = (customUsername && customUsername.trim()) ? customUsername.trim() : 'admin';
  const expectedPass = (customPassword && customPassword.trim()) ? customPassword.trim() : 'admin';

  // Function to play audible buzzer / metal impact sound
  const playMetalSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const typedUser = username.trim();
    if (!typedUser) {
      setError('Silakan masukkan username admin.');
      return;
    }
    if (!password) {
      setError('Silakan masukkan kata sandi admin.');
      return;
    }

    // CHECK ADMIN CREDENTIALS: Apabila salah memasukkan password admin LANGSUNG METAL!
    const isUserMatch = typedUser === expectedUser;
    const isPassMatch = password === expectedPass;

    if (!isUserMatch || !isPassMatch) {
      // Bunyikan suara metal / buzzer penolakan
      playMetalSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([150, 80, 150]); } catch (_) {}
      }

      // Trigger kembali ke beranda
      setIsMental(true);
      setError('username atau Password salah!');
      
      const reasonMsg = `⛔ AKSES DITOLAK: Username dan Password administrator salah! Anda langsung kembali ke beranda.`;

      setTimeout(() => {
        setUsername('');
        setPassword('');
        setIsMental(false);
        onClose();
        if (onLoginMental) {
          onLoginMental(reasonMsg);
        }
      }, 180);
      return;
    }

    // Success login
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(typedUser);
      setUsername('');
      setPassword('');
      onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ${
      isMental ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className={`bg-white border border-slate-200 w-full max-w-md rounded-lg shadow-2xl overflow-hidden transition-all duration-200 transform ${
        isMental ? 'scale-90 -translate-y-8 rotate-1' : 'scale-100 translate-y-0'
      }`}>
        {/* Header with Biru Muda Laut Gradient */}
        <div className="bg-gradient-to-r from-sky-700 via-cyan-600 to-sky-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-cyan-200" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight font-headline">
            Login Dashboard Administrator
          </h3>
          <p className="text-xs text-sky-100 mt-1">
            Portal Redaksi Ruang Legowo — Masukkan username & password administrator.
          </p>
        </div>

        {/* Security Alert Badge: Langsung Kembali ke Beranda Warning */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2 text-[11px] text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Perhatian:</strong> Apabila salah memasukkan user dan password administrator, sistem akan <strong>langsung kembali</strong> ke menu beranda!
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2 animate-bounce">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-md focus:border-sky-600 focus:ring-1 focus:ring-sky-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-md shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
