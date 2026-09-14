import React from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { 
  Wallet, 
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
  ArrowLeftRight
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { user, wallet, openDepositModal, openAuthModal, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(sound.isEnabled());

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
    <header className="w-full bg-[#0b0c11]/85 border-b border-white/[0.05] sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-sm group-hover:scale-105 transition-transform">
            ⚡
          </div>
          
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-xl text-white">
              SKIN<span className="text-amber-400">.UZ</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider -mt-1">
              CS2 PLATFORMA
            </span>
          </div>
        </div>

        {/* Asosiy Navigatsiya */}
        <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-white/[0.08] text-amber-400 font-bold'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-purple-950/60 text-purple-300'
                  : 'text-purple-400 hover:bg-purple-950/30'
              }`}
            >
              Admin Panel
            </button>
          ) : null}
        </nav>

        {/* O'ng tomon: Ovoz, Balans va Foydalanuvchi */}
        <div className="flex items-center space-x-3">
          
          {/* Ovoz sozlamasi */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            title={soundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              {/* Balans Pulti */}
              <div className="flex items-center bg-[#11131c] border border-white/[0.06] rounded-xl p-1 pl-3.5 space-x-2.5">
                <div className="flex items-center space-x-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono font-bold text-sm text-white tracking-tight">
                    {formattedBalance} <span className="text-[10px] text-amber-400 font-sans font-bold">UZS</span>
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    openDepositModal();
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all flex items-center space-x-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>To'ldirish</span>
                </button>
              </div>

              {/* Foydalanuvchi Profil Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-[#11131c] border border-white/[0.06] hover:border-white/[0.12] p-1.5 pr-2.5 rounded-xl transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-zinc-300" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 hidden sm:inline max-w-[85px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 clean-dropdown rounded-2xl py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-xs font-bold text-white truncate">{user.username}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">ID: #{user.id.slice(0, 8)}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center space-x-2.5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-amber-400" />
                      <span>Mening Profilim</span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('inventory');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.04] flex items-center space-x-2.5 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span>Mening Inventarim</span>
                    </button>

                    <div className="h-px bg-white/[0.06] my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-400 hover:bg-red-950/30 flex items-center space-x-2.5 transition-colors"
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
              className="btn-gold px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <span>Kirish</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
