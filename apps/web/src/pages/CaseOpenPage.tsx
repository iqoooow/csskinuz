import React, { useEffect, useState, useRef } from 'react';
import { Case } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { SkinCard } from '../components/SkinCard.js';
import { sound } from '../services/sound.js';
import { 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  ShieldAlert, 
  RotateCcw, 
  Coins 
} from 'lucide-react';

interface CaseOpenPageProps {
  caseSlug: string;
  onBack: () => void;
  onNavigate: (tab: string) => void;
}

export const CaseOpenPage: React.FC<CaseOpenPageProps> = ({ caseSlug, onBack, onNavigate }) => {
  const { user, wallet, updateBalance, openAuthModal, openDepositModal } = useAuthStore();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [openCount, setOpenCount] = useState<number>(1);
  const [wonItems, setWonItems] = useState<any[] | null>(null);
  const [rouletteStrip, setRouletteStrip] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fairnessInfo, setFairnessInfo] = useState<{ serverHash?: string; clientSeed?: string; nonce?: number } | null>(null);

  const reelRef = useRef<HTMLDivElement>(null);
  const tickAudioIntervalRef = useRef<any>(null);

  useEffect(() => {
    loadCase();
    return () => {
      if (tickAudioIntervalRef.current) clearInterval(tickAudioIntervalRef.current);
    };
  }, [caseSlug]);

  const loadCase = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getCase(caseSlug);
      setCaseData(data);
      if (data.items && data.items.length > 0) {
        const initialStrip: any[] = [];
        for (let i = 0; i < 65; i++) {
          initialStrip.push(data.items[i % data.items.length]);
        }
        setRouletteStrip(initialStrip);
      }
    } catch (err: any) {
      setError(err.message || 'Keysni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCase = async () => {
    if (!user) {
      sound.playClick();
      openAuthModal();
      return;
    }

    if (!caseData) return;

    const totalCost = caseData.is_free ? 0 : caseData.price * openCount;
    if (wallet && wallet.balance < totalCost) {
      sound.playClick();
      openDepositModal();
      return;
    }

    sound.playClick();
    setIsOpening(true);
    setError(null);
    setWonItems(null);

    try {
      const response = await ApiClient.openCase(caseData.slug, openCount);
      updateBalance(response.newBalance);

      const firstResult = response.results[0];
      setRouletteStrip(firstResult.rouletteStrip);
      setFairnessInfo({
        serverHash: firstResult.provablyFair?.serverSeedHash,
        clientSeed: firstResult.provablyFair?.clientSeed,
        nonce: firstResult.provablyFair?.nonce,
      });

      if (isFastMode) {
        setTimeout(() => {
          setIsOpening(false);
          setWonItems(response.results.map((r: any) => r.wonItem));
          sound.playWin(response.results.some((r: any) => r.wonItem.rarity === 'covert' || r.wonItem.rarity === 'special'));
        }, 350);
      } else {
        let tickCount = 0;
        const totalTicks = 45;
        const intervalTime = 115;
        
        const tickTimer = setInterval(() => {
          tickCount++;
          sound.playTick(1 + (tickCount / totalTicks) * 0.4);
          if (tickCount >= totalTicks) {
            clearInterval(tickTimer);
          }
        }, intervalTime);
        tickAudioIntervalRef.current = tickTimer;

        if (reelRef.current) {
          reelRef.current.style.transition = 'none';
          reelRef.current.style.transform = 'translateX(0px)';

          void reelRef.current.offsetHeight;

          const cardWidth = 144;
          const containerWidth = reelRef.current.parentElement?.clientWidth || window.innerWidth;
          const centerOffset = containerWidth / 2 - cardWidth / 2;
          const targetOffset = firstResult.winningIndex * cardWidth - centerOffset + (Math.random() * 30 - 15);

          reelRef.current.style.transition = 'transform 5.2s cubic-bezier(0.12, 0.85, 0.22, 1.0)';
          reelRef.current.style.transform = `translateX(-${targetOffset}px)`;
        }

        setTimeout(() => {
          setIsOpening(false);
          setWonItems(response.results.map((r: any) => r.wonItem));
          const isEpic = response.results.some((r: any) => r.wonItem.rarity === 'covert' || r.wonItem.rarity === 'special');
          sound.playWin(isEpic);

          if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
        }, 5300);
      }
    } catch (err: any) {
      setError(err.message || 'Keys ochishda xatolik yuz berdi');
      setIsOpening(false);
      sound.playFail();
    }
  };

  const handleSellWonItem = async (inventoryItemId: string) => {
    try {
      sound.playCoin();
      const res = await ApiClient.sellItem(inventoryItemId);
      updateBalance(res.newBalance);
      setWonItems(null);
    } catch (err: any) {
      setError(err.message || 'Sotishda xatolik');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400 text-xs font-semibold">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!caseData) return null;

  const totalCost = caseData.is_free ? 0 : caseData.price * openCount;
  const formattedTotalCost = caseData.is_free ? 'BEPUL' : `${Math.floor(totalCost / 100).toLocaleString()} UZS`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-8">
      
      {/* Tepa Panel */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="btn-surface px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Katalogga qaytish</span>
        </button>

        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>100% Provably Fair SHA256</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Keys Ochish Arenasi */}
      <div className="w-full bg-[#0e1017] border border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            {caseData.name}
          </h2>
          <p className="text-xs font-mono font-bold text-amber-400 mt-1">
            Narxi: {caseData.is_free ? 'BEPUL' : `${Math.floor(caseData.price / 100).toLocaleString()} UZS`}
          </p>
        </div>

        {/* Gorizontal Ruletka Lentasi */}
        <div className="w-full h-44 bg-[#08090d] relative overflow-hidden flex items-center rounded-2xl border border-white/[0.04]">
          
          {/* Lazer Chizig'i */}
          <div className="clean-laser"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40">
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-t-[10px] border-t-amber-400"></div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-40">
            <div className="w-0 h-0 border-x-[8px] border-x-transparent border-b-[10px] border-b-amber-400"></div>
          </div>

          {/* Lenta */}
          <div
            ref={reelRef}
            className="flex items-center space-x-2.5 px-4 absolute left-0"
            style={{ willChange: 'transform' }}
          >
            {rouletteStrip.map((item, index) => (
              <div
                key={`${item.id || item.name}-${index}`}
                className="w-32 h-36 bg-[#11131c] rounded-xl p-2.5 flex flex-col items-center justify-between shrink-0 border border-white/[0.03]"
              >
                <div className="w-full h-20 flex items-center justify-center">
                  <img
                    src={item.imageUrl || item.image_url}
                    alt={item.name}
                    className="max-h-16 max-w-[85%] object-contain drop-shadow"
                    loading="lazy"
                  />
                </div>
                <div className="w-full text-center">
                  <span className="text-[10px] font-semibold text-zinc-200 block truncate">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-mono text-amber-400/90 font-bold">
                    {Math.floor((item.price || item.base_price) / 100).toLocaleString()} UZS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boshqaruv Paneli */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Multiplier (1x, 2x, 3x, 4x, 5x) */}
          {!caseData.is_free && (
            <div className="flex items-center bg-white/[0.03] rounded-xl p-1 space-x-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  disabled={isOpening}
                  onClick={() => {
                    sound.playClick();
                    setOpenCount(num);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    openCount === num
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>
          )}

          {/* Fast Mode Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setIsFastMode(!isFastMode);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isFastMode
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'btn-surface'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isFastMode ? 'text-cyan-400' : 'text-zinc-400'}`} />
            <span>Tezkor rejim</span>
          </button>

          {/* OCHISH TUGMASI */}
          <button
            onClick={handleOpenCase}
            disabled={isOpening}
            className="w-full sm:w-auto min-w-[200px] btn-gold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
          >
            {isOpening ? (
              <span className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Ochilmoqda...</span>
              </span>
            ) : (
              <span>OCHISH: {formattedTotalCost}</span>
            )}
          </button>
        </div>

        {/* Provably Fair Info Footer */}
        {fairnessInfo && (
          <div className="mt-6 pt-4 border-t border-white/[0.04] flex flex-wrap items-center justify-between text-[10px] text-zinc-500 font-mono gap-2">
            <span className="truncate max-w-xs">Hash: {fairnessInfo.serverHash}</span>
            <span>Client Seed: {fairnessInfo.clientSeed}</span>
            <span>Nonce: #{fairnessInfo.nonce}</span>
          </div>
        )}
      </div>

      {/* Yutuq Modali */}
      {wonItems && wonItems.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-md rounded-3xl p-6 text-center">
            
            <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>YUTUQ CHIQDI!</span>
            </div>

            <div className="grid grid-cols-1 gap-4 my-2">
              {wonItems.map((item, idx) => (
                <div key={idx} className="bg-[#0e1017] rounded-2xl p-5 flex flex-col items-center">
                  <div className="w-full h-32 flex items-center justify-center my-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-h-28 object-contain drop-shadow"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">{item.weaponType}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{item.name}</h3>
                  <p className="text-sm font-mono font-bold text-amber-400 mt-1">
                    {Math.floor(item.price / 100).toLocaleString()} UZS
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 w-full mt-5">
                    <button
                      onClick={() => handleSellWonItem(item.inventoryItemId)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Sotish (+{Math.floor(item.price / 100).toLocaleString()} UZS)</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setWonItems(null);
                        onNavigate('upgrade');
                      }}
                      className="btn-surface py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Upgrade qilish</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2.5 mt-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setWonItems(null);
                }}
                className="w-full btn-gold py-2.5 rounded-xl text-xs"
              >
                Yana Ochish
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setWonItems(null);
                  onNavigate('inventory');
                }}
                className="w-full btn-surface py-2.5 rounded-xl text-xs font-semibold"
              >
                Inventarga O'tish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys Ichidagi Barcha Skinlar */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <span>Ushbu Keysdagi Skinlar</span>
          <span className="text-xs text-zinc-400 font-mono">
            ({caseData.items?.length || 0})
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {caseData.items?.map((item) => (
            <SkinCard key={item.id} item={item} showChance />
          ))}
        </div>
      </div>

    </div>
  );
};
