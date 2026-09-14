import React, { useEffect, useState } from 'react';
import { Case } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { CaseCard } from '../components/CaseCard.js';
import { sound } from '../services/sound.js';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Swords, 
  Gift, 
  Flame, 
  Search, 
  TrendingUp, 
  Users, 
  Coins
} from 'lucide-react';

interface HomePageProps {
  onOpenCase: (slug: string) => void;
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenCase, onNavigate }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCases(activeCategory);
  }, [activeCategory]);

  const loadCases = async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getCases(cat === 'all' ? undefined : cat);
      setCases(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Barchasi', icon: Flame },
    { id: 'knives', label: 'Pichoqlar', icon: Swords },
    { id: 'popular', label: 'Mashhur', icon: Sparkles },
    { id: 'budget', label: 'Arzon', icon: Zap },
    { id: 'free', label: 'Bepul', icon: Gift },
  ];

  const filteredCases = cases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-10">
      
      {/* 1. Clean Luxury Hero Banner */}
      <div className="relative w-full rounded-3xl bg-[#0e1017] border border-white/[0.05] p-6 sm:p-12 overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="max-w-2xl text-center lg:text-left space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>O'zbekistondagi Eng Ishonchli CS2 Platformasi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              ORZUYINGIZDAGI <br />
              <span className="text-amber-400">
                PICHOQ VA DRAGON LORE
              </span> NI YUTING!
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
              100% Provably Fair SHA256 kafolati, lahzali Payme/Click to'lovlari va Steam orqali tezkor yechib olish.
            </p>

            {/* Asosiy Tugmalar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCase('knife-odyssey');
                }}
                className="btn-gold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2"
              >
                <Swords className="w-4 h-4" />
                <span>Pichoqlar Keysi</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('upgrade');
                }}
                className="btn-surface px-5 py-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Upgrade Arenasi</span>
              </button>
            </div>
          </div>

          {/* 3D Skin Rasm */}
          <div className="relative flex items-center justify-center">
            <img
              src="https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ"
              alt="Butterfly Fade"
              className="w-64 sm:w-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>
      </div>

      {/* 2. Toza Statistika Qatori */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami Ochilgan Keyslar', value: '142,890+', icon: TrendingUp },
          { label: 'To\'langan Yutuqlar', value: '5.2 Mlrd UZS', icon: Coins },
          { label: 'Faol O\'yinchilar', value: '1,842 Online', icon: Users },
          { label: 'Provably Fair Kafolati', value: '100% SHA256', icon: ShieldCheck },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-[#0e1017] border border-white/[0.04] rounded-2xl p-4 flex items-center space-x-3"
            >
              <div className="p-2.5 rounded-xl bg-white/[0.03] text-amber-400">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-mono font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Keyslar Katalogi */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <span>Keyslar Katalogi</span>
              <span className="text-xs text-zinc-400 font-mono">
                ({filteredCases.length})
              </span>
            </h2>
          </div>

          {/* Qidiruv Paneli */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Keys qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Kategoriya Tablari */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-white/[0.1] text-amber-400 font-bold'
                    : 'bg-[#0e1017] text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Keyslar Gridi */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#0e1017] border border-white/[0.04] rounded-2xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseData={caseItem} onOpen={onOpenCase} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
