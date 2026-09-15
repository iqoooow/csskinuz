import React, { useEffect, useState } from 'react';
import { InventoryItem, SkinItem } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { ArrowLeftRight, Search, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

export const TradePage: React.FC = () => {
  const { user, wallet, updateBalance, openAuthModal, openDepositModal } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stock, setStock] = useState<SkinItem[]>([]);
  const [selectedInvIds, setSelectedInvIds] = useState<string[]>([]);
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isTrading, setIsTrading] = useState<boolean>(false);
  const [tradeResult, setTradeResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user) {
        const inv = await ApiClient.getInventory('AVAILABLE');
        setInventory(inv);
      }
      const botStock = await ApiClient.getTradeStock();
      setStock(botStock);
    } catch {
      // Ignored
    }
  };

  const mySelectedValue = inventory
    .filter((item) => selectedInvIds.includes(item.id))
    .reduce((sum, item) => sum + (item.base_price || item.obtained_price), 0);

  const targetSelectedValue = stock
    .filter((item) => selectedTargetIds.includes(item.id))
    .reduce((sum, item) => sum + item.base_price, 0);

  const difference = targetSelectedValue - mySelectedValue; // Musbat: qo'shimcha to'lov, Manfiy: qaytariladigan pul

  const handleExchange = async () => {
    if (!user) {
      sound.playClick();
      openAuthModal();
      return;
    }

    if (!selectedTargetIds.length) {
      sound.playFail();
      setError('Iltimos, olmoqchi bo\'lgan yangi skinni tanlang');
      return;
    }

    if (difference > 0 && wallet && wallet.balance < difference) {
      sound.playClick();
      openDepositModal();
      return;
    }

    sound.playClick();
    setIsTrading(true);
    setError(null);
    setTradeResult(null);

    try {
      const res = await ApiClient.executeTrade(selectedInvIds, selectedTargetIds);
      updateBalance(res.newBalance);
      setTradeResult(res);
      setSelectedInvIds([]);
      setSelectedTargetIds([]);
      loadData();
      sound.playWin(false);
    } catch (err: any) {
      setError(err.message || 'Almashtirish xatoligi');
      sound.playFail();
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center space-x-2">
          <ArrowLeftRight className="w-6 h-6 text-amber-400" />
          <span>SKINLARNI ALMASHTIRISH (TRADE)</span>
        </h1>
        <p className="text-xs text-zinc-400">
          Inventaringizdagi skinlarni sarmoyasiz o'zingiz xohlagan yangi qurollarga almashtiring
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {tradeResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Muvaffaqiyatli almashtirildi! Yangi {tradeResult.receivedCount} ta skin inventaringizga qo'shildi.
            </span>
          </div>
          <button onClick={() => setTradeResult(null)} className="text-xs underline text-emerald-300 hover:text-white">
            Yopish
          </button>
        </div>
      )}

      {/* 2-Ustunli Ayirboshlash Maydoni */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chap: Mening Inventarim */}
        <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mening Inventarim ({inventory.length})</h3>
            <span className="text-xs font-mono font-bold text-amber-400">
              Tanlangan: {Math.floor(mySelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
            {inventory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4 text-xs text-zinc-500">
                Inventaringiz bo'sh. Avval keys oching yoki bepul bonuslardan foydalaning.
              </div>
            ) : (
              inventory.map((item) => {
                const isSelected = selectedInvIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      if (isSelected) {
                        setSelectedInvIds(selectedInvIds.filter((id) => id !== item.id));
                      } else {
                        setSelectedInvIds([...selectedInvIds, item.id]);
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
                      <div className="max-w-[170px]">
                        <span className="text-xs font-semibold text-white truncate block">{item.name}</span>
                        <span className="text-[10px] text-zinc-400">{item.exterior}</span>
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

        {/* O'ng: Botlar Zaxirasi */}
        <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Platforma Zaxirasi</h3>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Tanlangan: {Math.floor(targetSelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zaxiradan qidirish..."
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
            {stock
              .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
              .map((item) => {
                const isSelected = selectedTargetIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      sound.playClick();
                      if (isSelected) {
                        setSelectedTargetIds(selectedTargetIds.filter((id) => id !== item.id));
                      } else {
                        setSelectedTargetIds([...selectedTargetIds, item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#171a26] border border-cyan-400/40'
                        : 'bg-[#11131c] hover:bg-[#141722] border border-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={item.image_url} alt={item.name} className="w-9 h-9 object-contain drop-shadow" />
                      <div className="max-w-[170px]">
                        <span className="text-xs font-semibold text-white truncate block">{item.name}</span>
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

      {/* Pastki Narxlar Farqi va Almashtirish Paneli */}
      <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Mening Skinlarim</span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {Math.floor(mySelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <ArrowLeftRight className="w-4 h-4 text-zinc-600" />

          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Yangi Skinlar</span>
            <span className="text-sm font-mono font-bold text-cyan-400">
              {Math.floor(targetSelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="border-l border-white/[0.06] pl-6">
            <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Farq</span>
            <span className={`text-xs font-mono font-bold ${difference > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {difference > 0 ? `+${Math.floor(difference / 100).toLocaleString()} UZS (Balansdan to'lanadi)` : `${Math.floor(difference / 100).toLocaleString()} UZS (Balansga qaytadi)`}
            </span>
          </div>
        </div>

        <button
          onClick={handleExchange}
          disabled={isTrading || selectedTargetIds.length === 0}
          className="w-full sm:w-auto btn-gold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-40 flex items-center justify-center space-x-2"
        >
          {isTrading ? (
            <span className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Almashtirilmoqda...</span>
            </span>
          ) : (
            <span>ALMASHTIRISH (EXCHANGE)</span>
          )}
        </button>
      </div>
    </div>
  );
};
