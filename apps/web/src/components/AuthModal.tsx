import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { X, ShieldAlert, Send, ShieldCheck, Loader2, ExternalLink, Zap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginTelegram, loginSteam } = useAuthStore();
  const [steamId, setSteamId] = useState<string>('76561198012345678');
  const [username, setUsername] = useState<string>('CS2_Gamer_UZ');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInsideTelegram, setIsInsideTelegram] = useState<boolean>(false);
  const [tgProfile, setTgProfile] = useState<any>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && (tg.initData || tg.initDataUnsafe?.user)) {
        setIsInsideTelegram(true);
        setTgProfile(tg.initDataUnsafe?.user);
      }
    }
  }, [isAuthModalOpen]);

  // Telegram Login Widget callback
  useEffect(() => {
    if (!isAuthModalOpen || isInsideTelegram) return;

    (window as any).onTelegramAuth = async (user: any) => {
      sound.playClick();
      setIsLoading(true);
      setError(null);
      try {
        const initData = `tg_widget_${user.id}_${user.first_name}_${user.username || ''}`;
        await loginTelegram(initData);
        sound.playWin(false);
        closeAuthModal();
      } catch (err: any) {
        setError(err?.message || 'Telegram orqali tasdiqlashda xatolik');
        sound.playFail();
      } finally {
        setIsLoading(false);
      }
    };

    // Load telegram-widget.js dynamically
    if (widgetContainerRef.current) {
      widgetContainerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', 'csskinuzbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      widgetContainerRef.current.appendChild(script);
    }
  }, [isAuthModalOpen, isInsideTelegram]);

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
    } catch {
      // Ignored
      closeAuthModal();
    } finally {
      setIsLoading(false);
    }
  };

  // Telegram Botga o'tish (Tasdiqlash uchun)
  const handleOpenTelegramBot = () => {
    sound.playClick();
    window.open('https://t.me/csskinuzbot?start=auth', '_blank');
  };

  // Brauzerda tezkor sinash (Demo Rejim)
  const handleQuickBrowserLogin = async () => {
    sound.playClick();
    setIsLoading(true);
    setError(null);
    try {
      await loginTelegram('demo_session');
      sound.playWin(false);
      closeAuthModal();
    } catch {
      closeAuthModal();
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
      <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
        
        <button
          onClick={() => {
            sound.playClick();
            closeAuthModal();
          }}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-white/[0.04] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg mx-auto mb-2.5 shadow-md">
            ⚡
          </div>
          <h3 className="text-xl font-bold text-white">Platformaga Kirish</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Telegram yoki Steam orqali xavfsiz kiring</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* 1. Agar Telegram Mini App ichida bo'lsa */}
        {isInsideTelegram ? (
          <button
            onClick={handleTelegramMiniAppLogin}
            disabled={isLoading}
            className="w-full bg-[#24A1DE] hover:bg-[#208bc0] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 mb-3 shadow-lg shadow-sky-500/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Telegram orqali tasdiqlash {tgProfile?.username ? `(@${tgProfile.username})` : ''}</span>
          </button>
        ) : (
          <div className="space-y-2.5 mb-4">
            {/* Telegram Bot orqali ochish */}
            <button
              onClick={handleOpenTelegramBot}
              className="w-full bg-[#24A1DE] hover:bg-[#208bc0] active:scale-[0.98] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Botda Tasdiqlash</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
            </button>

            {/* Telegram Login Widget Container */}
            <div className="flex justify-center py-1 overflow-hidden" ref={widgetContainerRef}></div>

            {/* Brauzerda tezkor sinash */}
            <button
              onClick={handleQuickBrowserLogin}
              disabled={isLoading}
              className="w-full bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white font-medium py-2 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 border border-white/[0.06]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Brauzerda Tezkor Kirish (Demo)</span>
            </button>
          </div>
        )}

        <div className="flex items-center my-4">
          <div className="h-px bg-white/[0.06] flex-1"></div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 font-medium">Yoki Steam orqali</span>
          <div className="h-px bg-white/[0.06] flex-1"></div>
        </div>

        {/* Steam orqali kirish */}
        <form onSubmit={handleSteamLogin} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">SteamID (64-bit)</label>
            <input
              type="text"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs font-mono outline-none transition-colors"
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
              className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs outline-none transition-colors"
              placeholder="Nickname"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-surface py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isLoading ? 'Ulanmoqda...' : 'Steam Bilan Kirish'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
