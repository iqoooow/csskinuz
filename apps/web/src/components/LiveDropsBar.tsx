import React from 'react';
import { useLiveDropStore } from '../stores/liveDropStore.js';
import { RarityType } from '../types/index.js';
import { handleImageError } from '../constants/assets.js';

const rarityColors: Record<RarityType, { dot: string; text: string; bg: string }> = {
  consumer: { dot: 'bg-[#b0c3d9]', text: 'text-[#b0c3d9]', bg: 'bg-[#b0c3d9]/5' },
  milspec: { dot: 'bg-[#4b69ff]', text: 'text-[#4b69ff]', bg: 'bg-[#4b69ff]/5' },
  restricted: { dot: 'bg-[#8847ff]', text: 'text-[#8847ff]', bg: 'bg-[#8847ff]/5' },
  classified: { dot: 'bg-[#d32ce6]', text: 'text-[#d32ce6]', bg: 'bg-[#d32ce6]/10' },
  covert: { dot: 'bg-[#eb4b4b]', text: 'text-[#eb4b4b]', bg: 'bg-[#eb4b4b]/10' },
  special: { dot: 'bg-[#ffd700]', text: 'text-[#ffd700]', bg: 'bg-[#ffd700]/15' },
};

export const LiveDropsBar: React.FC = () => {
  const drops = useLiveDropStore((state) => state.drops);

  return (
    <div className="w-full bg-[#080a0f] border-b border-white/[0.04] h-14 flex items-center overflow-x-auto no-scrollbar px-3 space-x-2 z-40">
      
      {/* Live Indicator */}
      <div className="flex items-center space-x-2 pl-1 pr-3 border-r border-white/[0.06] shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
          Jonli Drop
        </span>
      </div>

      {/* Droplar Karuseli */}
      <div className="flex items-center space-x-2">
        {drops.map((drop, idx) => {
          const color = rarityColors[drop.item.rarity] || rarityColors.consumer;

          return (
            <div
              key={`${drop.item.name}-${drop.timestamp}-${idx}`}
              className={`flex items-center bg-[#11131c] hover:bg-[#161924] border border-white/[0.04] hover:border-white/[0.1] rounded-xl px-2.5 py-1 shrink-0 transition-all cursor-pointer group`}
            >
              <div className="w-8 h-8 flex items-center justify-center relative shrink-0">
                <img
                  src={drop.item.imageUrl}
                  alt={drop.item.name}
                  className="w-8 h-8 object-contain drop-shadow group-hover:scale-110 transition-transform"
                  loading="lazy"
                  onError={(e) => handleImageError(e, false)}
                />
              </div>

              <div className="ml-2 flex flex-col justify-center max-w-[120px]">
                <div className="flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`}></span>
                  <span className="text-[11px] font-semibold text-zinc-200 truncate leading-tight group-hover:text-white">
                    {drop.item.name}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5 space-x-1.5">
                  <span className="font-mono font-semibold text-amber-400/90">
                    {Math.floor(drop.item.price / 100).toLocaleString()} <span className="text-[8px]">UZS</span>
                  </span>
                  <span className="truncate max-w-[45px] text-right text-zinc-400">
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
