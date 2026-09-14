import React, { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore.js';
import { useLiveDropStore } from './stores/liveDropStore.js';
import { WebSocketClient } from './services/websocket.js';
import { telegram } from './services/telegram.js';
import { Header } from './components/Header.js';
import { LiveDropsBar } from './components/LiveDropsBar.js';
import { Navigation } from './components/Navigation.js';
import { DepositModal } from './components/DepositModal.js';
import { AuthModal } from './components/AuthModal.js';

import { HomePage } from './pages/HomePage.js';
import { CaseOpenPage } from './pages/CaseOpenPage.js';
import { UpgradePage } from './pages/UpgradePage.js';
import { BattlesPage } from './pages/BattlesPage.js';
import { TradePage } from './pages/TradePage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { FairnessPage } from './pages/FairnessPage.js';
import { AdminPage } from './pages/AdminPage.js';

export const App: React.FC = () => {
  const { initAuth, loginTelegram } = useAuthStore();
  const { initLiveDrops } = useLiveDropStore();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedCaseSlug, setSelectedCaseSlug] = useState<string | null>(null);

  useEffect(() => {
    // 1. Telegram Mini App initsializatsiyasi
    telegram.init();

    // 2. Agar Telegram ichida ochilgan bo'lsa, avtomatik tizimga kirish
    if (telegram.isAvailable()) {
      const initData = telegram.getInitData();
      if (initData) {
        loginTelegram(initData).catch(() => {
          initAuth();
        });
      } else {
        initAuth();
      }
    } else {
      initAuth();
    }

    // 3. WebSockets va Jonli Droplar
    WebSocketClient.connect();
    initLiveDrops();
  }, []);

  const handleOpenCase = (slug: string) => {
    setSelectedCaseSlug(slug);
    setCurrentTab('case-detail');
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col justify-between">
      <div>
        {/* Jonli Drop Lentasi */}
        <LiveDropsBar />

        {/* Asosiy Header */}
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Sahifalar Ko'rinishi */}
        <main>
          {currentTab === 'home' && (
            <HomePage onOpenCase={handleOpenCase} onNavigate={setCurrentTab} />
          )}

          {currentTab === 'cases' && (
            <HomePage onOpenCase={handleOpenCase} onNavigate={setCurrentTab} />
          )}

          {currentTab === 'case-detail' && selectedCaseSlug && (
            <CaseOpenPage
              caseSlug={selectedCaseSlug}
              onBack={() => setCurrentTab('home')}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'upgrade' && <UpgradePage />}

          {currentTab === 'battles' && <BattlesPage />}

          {currentTab === 'trade' && <TradePage />}

          {currentTab === 'inventory' && <InventoryPage onNavigate={setCurrentTab} />}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'fairness' && <FairnessPage />}

          {currentTab === 'admin' && <AdminPage />}
        </main>
      </div>

      {/* Modallar */}
      <DepositModal />
      <AuthModal />

      {/* Mobile & TMA Pastki Navigatsiya */}
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] bg-[#090a0f] py-8 px-4 text-center text-xs text-zinc-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-400">CSSKIN.UZ</span>
            <span>•</span>
            <span>O'zbekistondagi #1 CS2 Platformasi</span>
          </div>

          <div className="flex items-center space-x-4 text-zinc-400">
            <button onClick={() => setCurrentTab('fairness')} className="hover:text-amber-400">
              Provably Fair
            </button>
            <span>•</span>
            <a href="https://t.me/csskinuz_support" target="_blank" rel="noreferrer" className="hover:text-amber-400">
              Qo'llab-quvvatlash
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
