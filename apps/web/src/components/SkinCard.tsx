import React from 'react';
import { SkinItem, RarityType } from '../types/index.js';
import { sound } from '../services/sound.js';
import { handleImageError } from '../constants/assets.js';

interface SkinCardProps {
  item: SkinItem;
  isSelected?: boolean;
  onSelect?: () => void;
  showChance?: boolean;
  actionButton?: React.ReactNode;
}

const rarityColors: Record<RarityType, { text: string; bar: string }> = {
  consumer: { text: 'text-[#b0c3d9]', bar: 'bg-[#b0c3d9]' },
  milspec: { text: 'text-[#4b69ff]', bar: 'bg-[#4b69ff]' },
  restricted: { text: 'text-[#8847ff]', bar: 'bg-[#8847ff]' },
  classified: { text: 'text-[#d32ce6]', bar: 'bg-[#d32ce6]' },
  covert: { text: 'text-[#eb4b4b]', bar: 'bg-[#eb4b4b]' },
  special: { text: 'text-[#ffd700]', bar: 'bg-[#ffd700]' },
};

export const SkinCard: React.FC<SkinCardProps> = ({
  item,
  isSelected,
  onSelect,
  showChance,
  actionButton,
}) => {
  const rarity = rarityColors[item.rarity] || rarityColors.milspec;

  return (
    <div
      onClick={() => {
        if (onSelect) {
          sound.playClick();
          onSelect();
        }
      }}
      className={`clean-card rounded-2xl p-3 flex flex-col items-center justify-between cursor-pointer relative overflow-hidden ${
        isSelected ? 'ring-1 ring-amber-400 bg-[#171a26]' : ''
      }`}
    >
      {/* Kichik tepa ma'lumot */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-[10px] font-mono text-zinc-400">
          {item.exterior || item.wear || 'FN'}
        </span>

        {showChance && item.chancePercent !== undefined && (
          <span className="text-[10px] font-mono font-bold text-amber-400">
            {item.chancePercent}%
          </span>
        )}
      </div>

      {/* Skin Rasmi */}
      <div className="w-full h-24 flex items-center justify-center relative my-1 z-10">
        <img
          src={item.image_url}
          alt={item.name}
          className="max-h-20 max-w-[85%] object-contain drop-shadow group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          onError={(e) => handleImageError(e, false)}
        />
      </div>

      {/* Skin Nomi va Narx */}
      <div className="w-full text-center z-10">
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${rarity.text} block truncate`}>
          {item.weapon_type}
        </span>
        <h5 className="text-xs font-bold text-zinc-100 truncate mt-0.5" title={item.name}>
          {item.name}
        </h5>

        {/* Narx */}
        <div className="mt-2 text-xs font-mono font-bold text-amber-400">
          {Math.floor(item.base_price / 100).toLocaleString()} <span className="text-[10px] font-sans">UZS</span>
        </div>

        {actionButton && <div className="mt-2 w-full">{actionButton}</div>}
      </div>

      {/* Nozik pastki rarity chizig'i */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${rarity.bar} opacity-75`}></div>
    </div>
  );
};
