import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { ApiClient } from '../services/api.js';
import { sound } from '../services/sound.js';
import { X, CreditCard, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const DepositModal: React.FC = () => {
  const { isDepositModalOpen, closeDepositModal, updateBalance } = useAuthStore();
  const [amount, setAmount] = useState<number>(50000);
  const [gateway, setGateway] = useState<string>('PAYME');
  const [promoCode, setPromoCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isDepositModalOpen) return null;

  const quickAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

  const handleDeposit = async () => {
    sound.playClick();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const amountInTiyin = amount * 100;
      const res = await ApiClient.simulateDeposit(amountInTiyin, gateway, promoCode);
      updateBalance(res.newBalance);
      sound.playCoin();
      setSuccessMsg(`To'lov qabul qilindi! Balansingizga ${(amount + calculatedBonus).toLocaleString()} UZS qo'shildi.`);
      
      setTimeout(() => {
        setSuccessMsg(null);
        closeDepositModal();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Depozit xatoligi');
      sound.playFail();
    } finally {
      setIsLoading(false);
    }
  };

  const promoBonusPercent = promoCode.toUpperCase() === 'WELCOME' ? 20 : promoCode.toUpperCase() === 'CSSKIN2026' ? 15 : 0;
  const calculatedBonus = promoBonusPercent > 0 ? (amount * promoBonusPercent) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-md rounded-3xl p-6 relative">
        
        <button
          onClick={() => {
            sound.playClick();
            closeDepositModal();
          }}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-white/[0.04] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sarlavha */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Balansni To'ldirish</h3>
            <p className="text-xs text-zinc-400">Komissiyasiz lahzali to'lov</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* To'lov Tizimlari */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-zinc-400 mb-2 block">
            To'lov Usuli:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {[
              { id: 'PAYME', label: 'Payme', badge: '0%' },
              { id: 'CLICK', label: 'Click', badge: '0%' },
              { id: 'UZUM', label: 'Uzum', badge: '0%' },
              { id: 'CRYPTO_USDT', label: 'USDT', badge: 'TRC20' },
              { id: 'TELEGRAM_STARS', label: 'Stars', badge: 'TG' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  sound.playClick();
                  setGateway(g.id);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  gateway === g.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#0e1017] text-zinc-300 hover:bg-[#141722]'
                }`}
              >
                <span className="text-xs">{g.label}</span>
                <span className="text-[9px] opacity-75 font-mono">{g.badge}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summa Kiritish */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
            To'lov Summasi (UZS):
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value || '0', 10)))}
              className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-base outline-none"
              placeholder="50000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-mono font-bold">UZS</span>
          </div>

          {/* Tezkor Summalar */}
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                onClick={() => {
                  sound.playClick();
                  setAmount(q);
                }}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all ${
                  amount === q
                    ? 'bg-white/[0.1] text-amber-400 font-bold'
                    : 'bg-[#0e1017] text-zinc-400 hover:text-white'
                }`}
              >
                +{q.toLocaleString()} UZS
              </button>
            ))}
          </div>
        </div>

        {/* Promo Kod */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-zinc-400">Promo-kod (Bonus)</span>
            <span className="text-[10px] text-amber-400 font-medium">WELCOME (+20%)</span>
          </div>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs uppercase font-mono outline-none"
            placeholder="WELCOME"
          />
          {promoBonusPercent > 0 && (
            <div className="mt-1.5 text-xs text-emerald-400 flex items-center space-x-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{promoBonusPercent}% bonus (+{calculatedBonus.toLocaleString()} UZS)</span>
            </div>
          )}
        </div>

        {/* Jami To'lov Tugmasi */}
        <button
          onClick={handleDeposit}
          disabled={isLoading || amount < 5000}
          className="w-full btn-gold py-3 rounded-xl text-xs uppercase tracking-wider disabled:opacity-40"
        >
          {isLoading ? (
            <span>To'lov amalga oshirilmoqda...</span>
          ) : (
            <span>To'ldirish: {(amount + calculatedBonus).toLocaleString()} UZS</span>
          )}
        </button>
      </div>
    </div>
  );
};
