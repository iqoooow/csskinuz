import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { ApiClient } from '../services/api.js';
import { User, Link2, History, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, wallet, refreshUserData } = useAuthStore();
  const [tradeUrl, setTradeUrl] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSavingTradeUrl, setIsSavingTradeUrl] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      if (user.trade_url) setTradeUrl(user.trade_url);
      ApiClient.getTransactions(15, 0).then(setTransactions).catch(() => {});
    }
  }, [user]);

  const handleSaveTradeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTradeUrl(true);
    setMessage(null);

    try {
      await ApiClient.setTradeUrl(tradeUrl);
      setMessage({ type: 'success', text: 'Steam Trade URL muvaffaqiyatli saqlandi!' });
      await refreshUserData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Trade URL noto\'g\'ri' });
    } finally {
      setIsSavingTradeUrl(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 space-y-8">
      {/* Profil Header Kartasi */}
      <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-brand-gold overflow-hidden flex items-center justify-center shadow-glow-gold">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-slate-100">{user.username}</h2>
              <span className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: {user.id.substring(0, 12)}...
            </p>
            {user.telegram_id && (
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                Telegram: {user.telegram_id}
              </p>
            )}
          </div>
        </div>

        {/* Balans Blok */}
        <div className="bg-background-tertiary border border-slate-800 rounded-2xl p-4 flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Joriy Balans</span>
            <span className="text-xl font-mono font-bold text-brand-gold">
              {wallet ? Math.floor(wallet.balance / 100).toLocaleString() : 0} <span className="text-xs font-sans">UZS</span>
            </span>
          </div>

          <div className="border-l border-slate-800 pl-6">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Wager (Aylanma)</span>
            <span className="text-xs font-mono text-slate-300">
              {wallet ? Math.floor(wallet.wager_current / 100).toLocaleString() : 0} / {wallet ? Math.floor(wallet.wager_required / 100).toLocaleString() : 0} UZS
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
          message.type === 'success'
            ? 'bg-emerald-950/40 border-brand-green text-emerald-300'
            : 'bg-red-950/40 border-brand-red text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Steam Trade URL sozlamasi */}
      <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-4">
          <Link2 className="w-5 h-5 text-brand-cyan" />
          <div>
            <h3 className="text-base font-bold text-slate-100">Steam Trade URL Sozlamasi</h3>
            <p className="text-xs text-slate-400">Yutilgan skinlarni Steam akkauntingizga chiqarish uchun zarur</p>
          </div>
        </div>

        <form onSubmit={handleSaveTradeUrl} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
              className="flex-1 bg-background-tertiary border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono focus:outline-none focus:border-brand-gold"
              required
            />
            <button
              type="submit"
              disabled={isSavingTradeUrl}
              className="bg-brand-gold hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-glow-gold disabled:opacity-50"
            >
              {isSavingTradeUrl ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Trade URL havolangizni olish uchun: Steam profil $\rightarrow$ Inventar $\rightarrow$ Savdo takliflari $\rightarrow$ "Kim menga savdo takliflarini yubora oladi?" bo'limiga kiring.
          </p>
        </form>
      </div>

      {/* Tranzaksiyalar Tarixi (Ledger) */}
      <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-4">
          <History className="w-5 h-5 text-brand-gold" />
          <h3 className="text-base font-bold text-slate-100">Moliyaviy Tarix</h3>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Hozircha tranzaksiyalar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Turi</th>
                  <th className="pb-3 font-semibold">Summa</th>
                  <th className="pb-3 font-semibold">Izoh</th>
                  <th className="pb-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-slate-300">
                    <td className="py-3 font-bold uppercase text-[10px] text-slate-400">{tx.type}</td>
                    <td className={`py-3 font-mono font-bold ${tx.amount > 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {tx.amount > 0 ? `+${Math.floor(tx.amount / 100).toLocaleString()}` : `${Math.floor(tx.amount / 100).toLocaleString()}`} UZS
                    </td>
                    <td className="py-3 text-slate-400">{tx.description || '-'}</td>
                    <td className="py-3 text-slate-500 font-mono">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
