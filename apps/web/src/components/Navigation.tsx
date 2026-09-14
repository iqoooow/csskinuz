import React from 'react';
import { Home, Package, Zap, Swords, ArrowLeftRight, Shield } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setCurrentTab }) => {
  const tabs = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'cases', label: 'Keyslar', icon: Package },
    { id: 'upgrade', label: 'Upgrade', icon: Zap },
    { id: 'battles', label: 'Battles', icon: Swords },
    { id: 'trade', label: 'Savdo', icon: ArrowLeftRight },
    { id: 'inventory', label: 'Inventar', icon: Shield },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background-secondary/95 border-t border-slate-800 backdrop-blur z-50 py-1.5 px-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                // Telegram haptic feedback
                if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                }
                setCurrentTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-brand-gold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
