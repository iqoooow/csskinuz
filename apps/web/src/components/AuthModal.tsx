import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { X, ShieldAlert, Send, ShieldCheck, Loader2, ExternalLink, User } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginTelegram, loginSteam } = useAuthStore();
  const [authMethod, setAuthMethod] = useState<'telegram' | 'steam'>('telegram');
  
  // Telegram Form
  const [tgUsername, setTgUsername] = useState<string>('');
  
  // Steam Form
  const [steamId, setSteamId] = useState<string>('76561198012345678');
  const [username, setUsername] = useState<string>('CS2_Gamer_UZ');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInsideTelegram, setIsInsideTelegram] = useState<boolean>(false);
  const [tgProfile, setTgProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
        setIsInsideTelegram(true);
        setTgProfile(tg.initDataUnsafe?.user);
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Telegram Mini App orqali tasdiqlash (Lahzada ishga tushadi)
  const handleTelegramMiniAppLogin = async () => {
    sound.playClick();
    setIsLoading(true);
    setError(null);
    try {
      await loginTelegram('tma_manual_confirm');
      sound.playWin(false);
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Telegram orqali kirishda xatolik');
      sound.playFail();
    } finally {
      setIsLoading(false);
    }
  };

  // Telegram Botga o'tish (Tasdiqlash uchun)
  const handleOpenTelegramBot = () => {
    sound.playClick();
    window.open('https://t.me/csskinuzbot?start=auth', '_blank');
  };

  // Telegram Username orqali tezkor kirish
  const handleTelegramUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsLoading(true);
    setError(null);

    const cleanUser = tgUsername.trim().replace('@', '');
    if (!cleanUser) {
      setError('Iltimos, Telegram username kiriting');
      setIsLoading(false);
      return;
    }

    try {
      const initData = `tg_direct_${cleanUser}_${Date.now()}`;
      await loginTelegram(initData);
      sound.playWin(false);
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Kirishda xatolik yuz berdi');
      sound.playFail();
    } finally {
      setIsLoading(false);
    }
  };

  // Steam orqali kirish
  const handleSteamLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsLoading(true);
    setError(null);
    try {
      await loginSteam(steamId, username);
      sound.playWin(false);
      closeAuthModal();
    } catch (err: any) {
      setError(err?.message || 'Kirishda xatolik yuz berdi');
      sound.playFail();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e111a] border border-white/[0.08] w-full max-w-sm rounded-3xl p-6 relative shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        
        {/* Yopish tugmasi */}
        <button
          onClick={() => {
            sound.playClick();
            closeAuthModal();
          }}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sarlavha */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-base mx-auto mb-2.5 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
            ⚡
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">Platformaga Kirish</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Xavfsiz va lahzali CS2 autentifikatsiyasi</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Usulni tanlash Tablari (Telegram / Steam) */}
        {!isInsideTelegram && (
          <div className="flex bg-[#141724] p-1 rounded-2xl border border-white/[0.04] mb-5">
            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('telegram');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'telegram'
                  ? 'bg-[#24A1DE] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAuthMethod('steam');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'steam'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Steam ID</span>
            </button>
          </div>
        )}

        {/* 1. Agar Telegram Mini App ichida bo'lsa */}
        {isInsideTelegram ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#141724] border border-sky-500/20 text-center">
              <span className="text-[11px] text-zinc-400 block mb-1">Aniqlangan Telegram Profili:</span>
              <span className="text-sm font-bold text-white block">
                {tgProfile?.username ? `@${tgProfile.username}` : (tgProfile?.first_name || 'Telegram Gamer')}
              </span>
            </div>

            <button
              onClick={handleTelegramMiniAppLogin}
              disabled={isLoading}
              className="w-full bg-[#24A1DE] hover:bg-[#208bc0] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Tasdiqlash va Kirish</span>
            </button>
          </div>
        ) : authMethod === 'telegram' ? (
          /* 2. Telegram orqali kirish (Brauzer) */
          <div className="space-y-3.5">
            {/* Telegram Bot orqali to'g'ridan-to'g'ri kirish */}
            <button
              onClick={handleOpenTelegramBot}
              className="w-full bg-[#24A1DE] hover:bg-[#208bc0] active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Botda Ochish</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
            </button>

            <div className="flex items-center my-2">
              <div className="h-px bg-white/[0.06] flex-1"></div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 font-medium">Yoki Username Bilan</span>
              <div className="h-px bg-white/[0.06] flex-1"></div>
            </div>

            {/* Username orqali tezkor kirish */}
            <form onSubmit={handleTelegramUsernameLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">Telegram Username (@)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={tgUsername}
                    onChange={(e) => setTgUsername(e.target.value)}
                    className="w-full bg-[#141724] border border-white/[0.06] focus:border-sky-400/40 rounded-xl pl-8 pr-3.5 py-2.5 text-white text-xs outline-none transition-colors"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 border border-white/[0.08]"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5 text-sky-400" />}
                <span>Tezkor Kirish</span>
              </button>
            </form>
          </div>
        ) : (
          /* 3. Steam orqali kirish */
          <form onSubmit={handleSteamLogin} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">SteamID (64-bit)</label>
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                className="w-full bg-[#141724] border border-white/[0.06] focus:border-amber-400/40 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono outline-none transition-colors"
                placeholder="76561198..."
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">O'yindagi Nickname</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#141724] border border-white/[0.06] focus:border-amber-400/40 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-colors"
                placeholder="Nickname"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-gold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>{isLoading ? 'Ulanmoqda...' : 'Steam Bilan Kirish'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
