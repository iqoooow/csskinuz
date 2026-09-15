import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { DEFAULT_AVATAR } from '../constants/assets.js';
import { 
  Plus, 
  Shield, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Flame,
  Swords,
  Layers,
  ArrowLeftRight,
  History,
  Coins
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { user, wallet, openDepositModal, openAuthModal, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleNavClick = (tabId: string) => {
    sound.playClick();
    setCurrentTab(tabId);
  };

  const formattedBalance = wallet ? Math.floor(wallet.balance / 100).toLocaleString() : '0';

  return (
    <header className="w-full bg-[#08090f]/90 border-b border-white/[0.06] sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-base shadow-[0_0_15px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
            ⚡
          </div>
          
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-xl text-white leading-none">
              SKIN<span className="text-amber-400">.UZ</span>
            </span>
            <span className="text-[9px] text-zinc-400 font-bold tracking-widest mt-0.5">
              CS2 PLATFORMA
            </span>
          </div>
        </div>

        {/* Asosiy Navigatsiya (Desktop) */}
        <nav className="hidden xl:flex items-center space-x-1 bg-white/[0.02] p-1 rounded-2xl border border-white/[0.04]">
          {[
            { id: 'home', label: 'Bosh sahifa', icon: Sparkles },
            { id: 'cases', label: 'Keyslar', icon: Layers },
            { id: 'upgrade', label: 'Upgrade', icon: Flame },
            { id: 'battles', label: 'Case Battles', icon: Swords },
            { id: 'trade', label: 'Savdo (P2P)', icon: ArrowLeftRight },
            { id: 'inventory', label: 'Inventar', icon: Shield },
            { id: 'fairness', label: 'Halollik', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                  : 'text-purple-400 hover:bg-purple-950/30'
              }`}
            >
              Admin
            </button>
          ) : null}
        </nav>

        {/* O'ng tomon: Ovoz, Balans va Foydalanuvchi */}
        <div className="flex items-center space-x-2.5 shrink-0">
          
          {/* Ovoz sozlamasi */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            title={soundEnabled ? "Ovozni o'chirish" : "Ovozni yoqish"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              {/* Luxury Balans Pulti */}
              <div className="flex items-center bg-[#0e111a] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-1 pl-3 space-x-2.5 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.4)]">
                <div className="flex items-center space-x-1.5">
                  <Coins className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="font-mono font-black text-sm text-white tracking-tight">
                    {formattedBalance}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                    UZS
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    openDepositModal();
                  }}
                  className="btn-gold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">To'ldirish</span>
                </button>
              </div>

              {/* Foydalanuvchi Profil Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-[#0e111a] border border-white/[0.06] hover:border-white/[0.15] p-1 pr-2.5 rounded-2xl transition-all"
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center relative shadow-sm">
                    <img
                      src={user.avatar_url || DEFAULT_AVATAR}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0e111a]"></span>
                  </div>
                  
                  <span className="text-xs font-bold text-white hidden md:inline max-w-[90px] truncate">
                    {user.username}
                  </span>
                  
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0e111a] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-2xl p-2 z-50 animate-in fade-in backdrop-blur-xl">
                    <div className="px-3 py-2.5 border-b border-white/[0.05] flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                        <img
                          src={user.avatar_url || DEFAULT_AVATAR}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{user.username}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">ID: #{user.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-xl flex items-center space-x-2.5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-amber-400" />
                        <span>Mening Profilim</span>
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick('inventory');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-xl flex items-center space-x-2.5 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Mening Inventarim</span>
                      </button>

                      <button
                        onClick={() => {
                          handleNavClick('trade');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] rounded-xl flex items-center space-x-2.5 transition-colors"
                      >
                        <History className="w-4 h-4 text-purple-400" />
                        <span>Savdo & Trade</span>
                      </button>
                    </div>

                    <div className="h-px bg-white/[0.06] my-1"></div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-xl flex items-center space-x-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                openAuthModal();
              }}
              className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
            >
              <span>Kirish</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
