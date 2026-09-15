import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { ApiClient } from '../services/api.js';
import { sound } from '../services/sound.js';
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
    sound.playClick();
    setIsSavingTradeUrl(true);
    setMessage(null);

    try {
      await ApiClient.setTradeUrl(tradeUrl);
      setMessage({ type: 'success', text: 'Steam Trade URL muvaffaqiyatli saqlandi!' });
      sound.playWin(false);
      await refreshUserData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Trade URL noto\'g\'ri' });
      sound.playFail();
    } finally {
      setIsSavingTradeUrl(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Profil Header Kartasi */}
      <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-amber-400/40 overflow-hidden flex items-center justify-center shadow-md">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              ID: #{user.id.substring(0, 10)}
            </p>
            {user.telegram_id && (
              <p className="text-xs text-cyan-400 font-mono mt-0.5">
                Telegram ID: {user.telegram_id}
              </p>
            )}
          </div>
        </div>

        {/* Balans Blok */}
        <div className="bg-[#11131c] border border-white/[0.04] rounded-2xl p-4 flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Joriy Balans</span>
            <span className="text-xl font-mono font-bold text-amber-400">
              {wallet ? Math.floor(wallet.balance / 100).toLocaleString() : 0} <span className="text-xs font-sans">UZS</span>
            </span>
          </div>

          <div className="border-l border-white/[0.06] pl-6">
            <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Wager (Aylanma)</span>
            <span className="text-xs font-mono text-zinc-300">
              {wallet ? Math.floor(wallet.wager_current / 100).toLocaleString() : 0} / {wallet ? Math.floor(wallet.wager_required / 100).toLocaleString() : 0} UZS
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
          message.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-red-950/40 border-red-800/40 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Steam Trade URL sozlamasi */}
      <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-4">
          <Link2 className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Steam Trade URL Sozlamasi</h3>
            <p className="text-xs text-zinc-400">Yutilgan skinlarni Steam akkauntingizga chiqarish uchun zarur</p>
          </div>
        </div>

        <form onSubmit={handleSaveTradeUrl} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=...&token=..."
              className="flex-1 bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSavingTradeUrl}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50"
            >
              {isSavingTradeUrl ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>

          <p className="text-[11px] text-zinc-500">
            Trade URL havolangizni olish uchun: Steam profil &rarr; Inventar &rarr; Savdo takliflari &rarr; "Kim menga savdo takliflarini yubora oladi?" bo'limiga kiring.
          </p>
        </form>
      </div>

      {/* Tranzaksiyalar Tarixi (Ledger) */}
      <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-4">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Moliyaviy Tarix</h3>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Hozircha tranzaksiyalar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.04] text-zinc-400">
                <tr>
                  <th className="pb-3 font-semibold">Turi</th>
                  <th className="pb-3 font-semibold">Summa</th>
                  <th className="pb-3 font-semibold">Izoh</th>
                  <th className="pb-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="text-zinc-300">
                    <td className="py-3 font-bold uppercase text-[10px] text-zinc-400">{tx.type}</td>
                    <td className={`py-3 font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? `+${Math.floor(tx.amount / 100).toLocaleString()}` : `${Math.floor(tx.amount / 100).toLocaleString()}`} UZS
                    </td>
                    <td className="py-3 text-zinc-400">{tx.description || '-'}</td>
                    <td className="py-3 text-zinc-500 font-mono">{new Date(tx.created_at).toLocaleString()}</td>
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
