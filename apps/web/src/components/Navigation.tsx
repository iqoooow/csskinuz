import React from 'react';
import { Home, Layers, Flame, Swords, ArrowLeftRight, Shield } from 'lucide-react';
import { sound } from '../services/sound.js';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'cases', label: 'Keyslar', icon: Layers },
    { id: 'upgrade', label: 'Upgrade', icon: Flame },
    { id: 'battles', label: 'Battles', icon: Swords },
    { id: 'trade', label: 'Savdo', icon: ArrowLeftRight },
    { id: 'inventory', label: 'Inventar', icon: Shield },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b0c11]/90 border-t border-white/[0.06] backdrop-blur-xl z-50 py-2 px-3">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
                setCurrentTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive ? 'text-amber-400 font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-400 absolute -bottom-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
