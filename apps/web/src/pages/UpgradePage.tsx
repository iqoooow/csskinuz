import React, { useEffect, useState, useRef } from 'react';
import { InventoryItem, SkinItem } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Search, 
  Coins 
} from 'lucide-react';

export const UpgradePage: React.FC = () => {
  const { user, wallet, updateBalance, openAuthModal, openDepositModal } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [targetItems, setTargetItems] = useState<SkinItem[]>([]);
  const [selectedInvItems, setSelectedInvItems] = useState<string[]>([]);
  const [selectedTargetItem, setSelectedTargetItem] = useState<SkinItem | null>(null);
  const [balanceBetAmount, setBalanceBetAmount] = useState<number>(0);
  const [searchTarget, setSearchTarget] = useState<string>('');
  
  const [odds, setOdds] = useState<{ winChance: number; multiplier: number; winAngle: number } | null>(null);
  const [isUpgrading, setIsUpgrading] = useState<boolean>(false);
  const [upgradeResult, setUpgradeResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const needleRef = useRef<HTMLDivElement>(null);
  const audioTimerRef = useRef<any>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [user]);

  const loadData = async () => {
    try {
      if (user) {
        const inv = await ApiClient.getInventory('AVAILABLE');
        setInventory(inv);
      }
      const stock = await ApiClient.getTradeStock();
      setTargetItems(stock);
    } catch {
      // Ignored
    }
  };

  const selectedSkinsValue = inventory
    .filter((item) => selectedInvItems.includes(item.id))
    .reduce((sum, item) => sum + (item.base_price || item.obtained_price), 0);

  const totalInputValue = selectedSkinsValue + balanceBetAmount * 100;

  useEffect(() => {
    if (totalInputValue > 0 && selectedTargetItem) {
      if (totalInputValue < selectedTargetItem.base_price) {
        ApiClient.calculateUpgrade(totalInputValue, selectedTargetItem.base_price)
          .then((res) => {
            setOdds(res);
            setError(null);
          })
          .catch((err) => {
            setError(err.message);
            setOdds(null);
          });
      } else {
        setOdds(null);
        setError('Tikilgan summa maqsadli skindan qimmat bo\'la olmaydi');
      }
    } else {
      setOdds(null);
    }
  }, [totalInputValue, selectedTargetItem]);

  const handleExecuteUpgrade = async () => {
    if (!user) {
      sound.playClick();
      openAuthModal();
      return;
    }

    if (!selectedTargetItem || totalInputValue <= 0) {
      sound.playFail();
      setError('Iltimos, tikiladigan qiymat va maqsadli skinni tanlang');
      return;
    }

    if (balanceBetAmount * 100 > (wallet?.balance || 0)) {
      sound.playClick();
      openDepositModal();
      return;
    }

    sound.playClick();
    setIsUpgrading(true);
    setError(null);
    setUpgradeResult(null);

    try {
      const res = await ApiClient.executeUpgrade(
        selectedInvItems,
        balanceBetAmount * 100,
        selectedTargetItem.id
      );

      updateBalance(res.newBalance);

      let ticks = 0;
      const totalTicks = 35;
      const audioTimer = setInterval(() => {
        ticks++;
        sound.playTick(0.8 + (ticks / totalTicks) * 0.7);
        if (ticks >= totalTicks) {
          clearInterval(audioTimer);
        }
      }, 120);
      audioTimerRef.current = audioTimer;

      if (needleRef.current) {
        needleRef.current.style.transition = 'none';
        needleRef.current.style.transform = 'rotate(0deg)';
        void needleRef.current.offsetHeight;

        const totalRotation = 1800 + res.stopAngle;
        needleRef.current.style.transition = 'transform 4.5s cubic-bezier(0.1, 0.9, 0.2, 1.0)';
        needleRef.current.style.transform = `rotate(${totalRotation}deg)`;
      }

      setTimeout(() => {
        setIsUpgrading(false);
        setUpgradeResult(res);
        loadData();
        setSelectedInvItems([]);
        setBalanceBetAmount(0);

        if (res.isWon) {
          sound.playWin(true);
        } else {
          sound.playFail();
        }

        if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred(res.isWon ? 'success' : 'error');
        }
      }, 4650);
    } catch (err: any) {
      setError(err.message || 'Apgreyd xatoligi');
      setIsUpgrading(false);
      sound.playFail();
    }
  };

  const handleSelectMultiplier = (mult: number) => {
    sound.playClick();
    if (totalInputValue <= 0) return;
    const targetPrice = totalInputValue * mult;
    const closest = targetItems
      .filter((item) => item.base_price >= targetPrice * 0.8)
      .sort((a, b) => Math.abs(a.base_price - targetPrice) - Math.abs(b.base_price - targetPrice))[0];
    if (closest) setSelectedTargetItem(closest);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-8">
      
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center space-x-2">
          <Zap className="w-6 h-6 text-cyan-400" />
          <span>CS2 Upgrade Arenasi</span>
        </h1>
        <p className="text-xs text-zinc-400">
          Skin yoki balansingizni tikib, orzu qilingan skinni yutib oling
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Asosiy 3-ustunli Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Chap Ustun: Tikiladigan Qiymat */}
        <div className="lg:col-span-4 bg-[#0e1017] border border-white/[0.04] rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              1. Tikilayotgan Qiymat
            </span>
            <span className="font-mono font-bold text-xs text-amber-400">
              {Math.floor(totalInputValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="mb-3">
            <label className="text-[11px] text-zinc-400 font-medium mb-1.5 flex items-center justify-between">
              <span>Balansdan kiritish (UZS):</span>
              <span className="text-zinc-500 font-mono text-[10px]">
                Mavjud: {wallet ? Math.floor(wallet.balance / 100).toLocaleString() : 0} UZS
              </span>
            </label>
            <input
              type="number"
              value={balanceBetAmount || ''}
              onChange={(e) => setBalanceBetAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs font-mono outline-none"
              placeholder="0"
            />
          </div>

          <span className="text-[11px] text-zinc-400 font-medium mb-2 block">
            Yoki inventardagi skinni tanlang:
          </span>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
            {inventory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-zinc-500 space-y-2">
                <Coins className="w-6 h-6 text-zinc-600" />
                <p>Inventarda mavjud skinlar yo'q.</p>
              </div>
            ) : (
              inventory.map((item) => {
                const isSelected = selectedInvItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      if (isSelected) {
                        setSelectedInvItems(selectedInvItems.filter((id) => id !== item.id));
                      } else {
                        setSelectedInvItems([...selectedInvItems, item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#171a26] border border-amber-400/40'
                        : 'bg-[#11131c] hover:bg-[#141722] border border-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={item.image_url} alt={item.name} className="w-9 h-9 object-contain drop-shadow" />
                      <div className="max-w-[130px]">
                        <span className="text-xs font-semibold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-400">{item.exterior || 'FN'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {Math.floor(item.base_price / 100).toLocaleString()} UZS
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. O'rta Ustun: Doiraviy Radar */}
        <div className="lg:col-span-4 bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden h-[560px]">
          
          <div className="w-full flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400">Yutish Ehtimoli:</span>
            <span className="font-mono text-cyan-400 text-sm font-bold">
              {odds ? `${odds.winChance}%` : '0.00%'}
            </span>
          </div>

          {/* Doira */}
          <div className="relative w-60 h-60 my-2 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#141722"
                strokeWidth="8"
              />
              {odds && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={`${(odds.winChance / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}
            </svg>

            {/* Aylanuvchi Strelka */}
            <div
              ref={needleRef}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ willChange: 'transform' }}
            >
              <div className="w-1 h-24 bg-amber-400 rounded-full shadow-sm transform -translate-y-12"></div>
            </div>

            {/* Markaziy Pult */}
            <div className="absolute w-24 h-24 rounded-full bg-[#08090d] border border-white/[0.06] flex flex-col items-center justify-center text-center shadow-inner z-20">
              <span className="text-[9px] text-zinc-400 uppercase font-bold">Multi</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {odds ? `x${odds.multiplier}` : 'x1.00'}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                {odds ? `${odds.winChance}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Multiplikator Tanlovlari */}
          <div className="w-full space-y-1.5">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1.5, 2, 5, 10, 20].map((m) => (
                <button
                  key={m}
                  onClick={() => handleSelectMultiplier(m)}
                  className="py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono font-bold text-zinc-300 transition-all"
                >
                  x{m}
                </button>
              ))}
            </div>
          </div>

          {/* Boshlash Tugmasi */}
          <button
            onClick={handleExecuteUpgrade}
            disabled={isUpgrading || !odds}
            className="w-full btn-cyan py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-2"
          >
            {isUpgrading ? (
              <span className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Apgreyd qilinmoqda...</span>
              </span>
            ) : (
              <span>UPGRADE NI BOSHLASH</span>
            )}
          </button>
        </div>

        {/* 3. O'ng Ustun: Maqsadli Skin */}
        <div className="lg:col-span-4 bg-[#0e1017] border border-white/[0.04] rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              2. Maqsadli Skin
            </span>
            {selectedTargetItem && (
              <span className="font-mono font-bold text-xs text-cyan-400">
                {Math.floor(selectedTargetItem.base_price / 100).toLocaleString()} UZS
              </span>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              placeholder="Skin qidirish..."
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
            {targetItems
              .filter((item) => item.name.toLowerCase().includes(searchTarget.toLowerCase()))
              .map((item) => {
                const isSelected = selectedTargetItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedTargetItem(item);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#171a26] border border-cyan-400/40'
                        : 'bg-[#11131c] hover:bg-[#141722] border border-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={item.image_url} alt={item.name} className="w-9 h-9 object-contain drop-shadow" />
                      <div className="max-w-[130px]">
                        <span className="text-xs font-semibold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-400">{item.weapon_type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {Math.floor(item.base_price / 100).toLocaleString()} UZS
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Natija Modali */}
      {upgradeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-md rounded-3xl p-6 text-center">
            
            <div className={`w-12 h-12 rounded-2xl ${upgradeResult.isWon ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'} flex items-center justify-center mx-auto mb-3`}>
              {upgradeResult.isWon ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>

            <h3 className={`text-xl font-bold ${upgradeResult.isWon ? 'text-emerald-400' : 'text-red-400'} uppercase`}>
              {upgradeResult.isWon ? "G'ALABA! TABRIKLAYMIZ" : "MAG'LUBIYAT"}
            </h3>

            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Roll: {upgradeResult.rollNumber}% (Talab: {upgradeResult.winChance}%)
            </p>

            {upgradeResult.isWon && upgradeResult.wonItem && (
              <div className="bg-[#0e1017] rounded-2xl p-4 my-4 flex flex-col items-center">
                <img
                  src={upgradeResult.wonItem.imageUrl}
                  alt={upgradeResult.wonItem.name}
                  className="w-36 h-24 object-contain my-2 drop-shadow"
                />
                <h4 className="text-sm font-bold text-white">{upgradeResult.wonItem.name}</h4>
                <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {Math.floor(upgradeResult.wonItem.price / 100).toLocaleString()} UZS
                </p>
              </div>
            )}

            <button
              onClick={() => {
                sound.playClick();
                setUpgradeResult(null);
              }}
              className="w-full btn-gold py-3 rounded-xl text-xs mt-4"
            >
              Davom Etish
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
