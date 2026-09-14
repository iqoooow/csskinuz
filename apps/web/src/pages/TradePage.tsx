import React, { useEffect, useState } from 'react';
import { InventoryItem, SkinItem } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
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
      openAuthModal();
      return;
    }

    if (!selectedTargetIds.length) {
      setError('Iltimos, olmoqchi bo\'lgan yangi skinni tanlang');
      return;
    }

    if (difference > 0 && wallet && wallet.balance < difference) {
      openDepositModal();
      return;
    }

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
    } catch (err: any) {
      setError(err.message || 'Almashtirish xatoligi');
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center justify-center space-x-2">
          <ArrowLeftRight className="w-7 h-7 text-brand-gold" />
          <span>SKINLARNI ALMASHTIRISH (TRADE)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inventaringizdagi skinlarni sarmoyasiz o'zingiz xohlagan yangi qurollarga almashtiring
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-brand-red" />
          <span>{error}</span>
        </div>
      )}

      {tradeResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-brand-green text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-brand-green shrink-0" />
            <span>
              Muvaffaqiyatli almashtirildi! Yangi {tradeResult.receivedCount} ta skin inventaringizga qo'shildi.
            </span>
          </div>
          <button onClick={() => setTradeResult(null)} className="text-xs underline text-emerald-200">
            Yopish
          </button>
        </div>
      )}

      {/* 2-Ustunli Ayirboshlash Maydoni */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chap: Mening Inventarim */}
        <div className="bg-background-secondary border border-slate-800 rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-bold text-slate-200">Mening Inventarim ({inventory.length})</h3>
            <span className="text-xs font-mono font-bold text-brand-gold">
              Tanlangan: {Math.floor(mySelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {inventory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4 text-xs text-slate-500">
                Inventaringiz bo'sh. Avval keys oching yoki bepul bonuslardan foydalaning.
              </div>
            ) : (
              inventory.map((item) => {
                const isSelected = selectedInvIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedInvIds(selectedInvIds.filter((id) => id !== item.id));
                      } else {
                        setSelectedInvIds([...selectedInvIds, item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-slate-800 bg-background-tertiary hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain drop-shadow" />
                      <div className="max-w-[170px]">
                        <span className="text-xs font-bold text-slate-200 truncate block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.exterior}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-gold">
                      {Math.floor(item.base_price / 100).toLocaleString()} UZS
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* O'ng: Botlar Zaxirasi */}
        <div className="bg-background-secondary border border-slate-800 rounded-3xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-bold text-slate-200">Platforma Zaxirasi</h3>
            <span className="text-xs font-mono font-bold text-brand-cyan">
              Tanlangan: {Math.floor(targetSelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zaxiradan qidirish..."
              className="w-full bg-background-tertiary border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {stock
              .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
              .map((item) => {
                const isSelected = selectedTargetIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTargetIds(selectedTargetIds.filter((id) => id !== item.id));
                      } else {
                        setSelectedTargetIds([...selectedTargetIds, item.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-cyan bg-brand-cyan/10'
                        : 'border-slate-800 bg-background-tertiary hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 object-contain drop-shadow" />
                      <div className="max-w-[170px]">
                        <span className="text-xs font-bold text-slate-200 truncate block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.weapon_type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-cyan">
                      {Math.floor(item.base_price / 100).toLocaleString()} UZS
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Pastki Narxlar Farqi va Almashtirish Paneli */}
      <div className="bg-background-secondary border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Mening Skinlarim</span>
            <span className="text-sm font-mono font-bold text-brand-gold">
              {Math.floor(mySelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <ArrowLeftRight className="w-5 h-5 text-slate-600" />

          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Yangi Skinlar</span>
            <span className="text-sm font-mono font-bold text-brand-cyan">
              {Math.floor(targetSelectedValue / 100).toLocaleString()} UZS
            </span>
          </div>

          <div className="border-l border-slate-800 pl-6">
            <span className="text-[10px] text-slate-400 block uppercase">Farq</span>
            <span className={`text-sm font-mono font-bold ${difference > 0 ? 'text-brand-red' : 'text-brand-green'}`}>
              {difference > 0 ? `+${Math.floor(difference / 100).toLocaleString()} UZS (Balansdan to'lanadi)` : `${Math.floor(difference / 100).toLocaleString()} UZS (Balansga qaytadi)`}
            </span>
          </div>
        </div>

        <button
          onClick={handleExchange}
          disabled={isTrading || selectedTargetIds.length === 0}
          className="w-full sm:w-auto bg-gradient-to-r from-brand-gold to-amber-500 hover:from-amber-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-glow-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
