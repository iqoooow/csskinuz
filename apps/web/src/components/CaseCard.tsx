import React from 'react';
import { Case } from '../types/index.js';
import { sound } from '../services/sound.js';
import { Sparkles } from 'lucide-react';
import { handleImageError } from '../constants/assets.js';

interface CaseCardProps {
  caseData: Case;
  onOpen: (slug: string) => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onOpen }) => {
  const isFree = Boolean(caseData.is_free);
  const formattedPrice = isFree ? 'BEPUL' : `${Math.floor(caseData.price / 100).toLocaleString()} UZS`;

  return (
    <div
      onClick={() => {
        sound.playClick();
        onOpen(caseData.slug);
      }}
      className="clean-card rounded-2xl p-4 flex flex-col items-center justify-between cursor-pointer group relative overflow-hidden"
    >
      {/* Top Badge */}
      <div className="w-full flex items-center justify-between z-10">
        {isFree ? (
          <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>BEPUL</span>
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {caseData.category || 'CS2'}
          </span>
        )}

        <span className="text-[10px] text-zinc-400 font-mono">
          {(caseData.open_count && caseData.open_count > 0) ? `${caseData.open_count.toLocaleString()} ochilgan` : 'Yangi'}
        </span>
      </div>

      {/* Keys 3D Tasviri */}
      <div className="w-full h-36 flex items-center justify-center relative my-2 z-10">
        <img
          src={caseData.image_url}
          alt={caseData.name}
          className="max-h-32 max-w-[88%] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => handleImageError(e, true)}
        />
      </div>

      {/* Keys Ma'lumotlari */}
      <div className="w-full text-center z-10">
        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
          {caseData.name}
        </h4>
        
        {caseData.bestItem && (
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            Top: <span className="text-zinc-300 font-medium">{caseData.bestItem.name}</span>
          </p>
        )}

        {/* Narx tugmasi */}
        <div className="mt-3 w-full bg-white/[0.04] rounded-xl py-2 px-3 flex items-center justify-center font-mono font-bold text-xs text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
          <span>{formattedPrice}</span>
        </div>
      </div>
    </div>
  );
};
