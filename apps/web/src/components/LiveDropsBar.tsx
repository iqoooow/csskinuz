import React from 'react';
import { useLiveDropStore } from '../stores/liveDropStore.js';
import { RarityType } from '../types/index.js';
import { handleImageError } from '../constants/assets.js';

const rarityConfig: Record<RarityType, { dot: string; text: string; border: string; glow: string }> = {
  consumer: { dot: 'bg-[#b0c3d9]', text: 'text-[#b0c3d9]', border: 'border-[#b0c3d9]/20', glow: 'rgba(176,195,217,0.1)' },
  milspec: { dot: 'bg-[#4b69ff]', text: 'text-[#4b69ff]', border: 'border-[#4b69ff]/25', glow: 'rgba(75,105,255,0.15)' },
  restricted: { dot: 'bg-[#8847ff]', text: 'text-[#8847ff]', border: 'border-[#8847ff]/25', glow: 'rgba(136,71,255,0.15)' },
  classified: { dot: 'bg-[#d32ce6]', text: 'text-[#d32ce6]', border: 'border-[#d32ce6]/30', glow: 'rgba(211,44,230,0.2)' },
  covert: { dot: 'bg-[#eb4b4b]', text: 'text-[#eb4b4b]', border: 'border-[#eb4b4b]/35', glow: 'rgba(235,75,75,0.25)' },
  special: { dot: 'bg-[#ffd700]', text: 'text-[#ffd700]', border: 'border-[#ffd700]/40', glow: 'rgba(255,215,0,0.3)' },
};

export const LiveDropsBar: React.FC = () => {
  const drops = useLiveDropStore((state) => state.drops);

  return (
    <div className="w-full bg-[#07080d] border-b border-white/[0.05] h-14 flex items-center overflow-x-auto no-scrollbar px-3 space-x-2.5 z-40">
      
      {/* Live Indicator */}
      <div className="flex items-center space-x-2 pl-1 pr-3.5 border-r border-white/[0.08] shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300">
          Jonli Drop
        </span>
      </div>

      {/* Droplar Karuseli */}
      <div className="flex items-center space-x-2.5">
        {drops.map((drop, idx) => {
          const conf = rarityConfig[drop.item.rarity] || rarityConfig.consumer;

          return (
            <div
              key={`${drop.item.name}-${drop.timestamp}-${idx}`}
              className={`flex items-center bg-[#0d0f17] hover:bg-[#121520] border ${conf.border} rounded-xl px-2.5 py-1.5 shrink-0 transition-all cursor-pointer group shadow-sm`}
              style={{
                boxShadow: `0 2px 10px ${conf.glow}`,
              }}
            >
              {/* Rasm */}
              <div className="w-10 h-8 flex items-center justify-center relative shrink-0">
                <img
                  src={drop.item.imageUrl}
                  alt={drop.item.name}
                  className="max-h-8 max-w-full object-contain drop-shadow group-hover:scale-110 transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => handleImageError(e, false)}
                />
              </div>

              {/* Ma'lumot */}
              <div className="ml-2 flex flex-col justify-center min-w-[110px] max-w-[140px]">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} shrink-0`}></span>
                  <span className={`text-[11px] font-bold ${conf.text} truncate leading-tight`}>
                    {drop.item.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1.5 text-[10px] mt-0.5">
                  <span className="font-mono font-bold text-amber-400/90">
                    {Math.floor(drop.item.price / 100).toLocaleString()} <span className="text-[8px] font-sans">UZS</span>
                  </span>
                  <span className="text-zinc-500">•</span>
                  <span className="truncate text-zinc-400 max-w-[55px]">
                    {drop.user.username}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
