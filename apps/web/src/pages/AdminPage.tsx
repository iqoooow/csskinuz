import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { Shield, Users, Package, DollarSign, CheckCircle, Search, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kpi' | 'users'>('kpi');
  
  // Balance Adjust Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100000);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      const overview = await ApiClient.getAdminOverview();
      setMetrics(overview);
      const uList = await ApiClient.getAdminUsers();
      setUsersList(uList);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Bloklash sababini kiriting:') || 'Qoidabuzarlik';
    try {
      await ApiClient.banUser(userId, reason);
      setMessage({ type: 'success', text: 'Foydalanuvchi bloklandi' });
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await ApiClient.unbanUser(userId);
      setMessage({ type: 'success', text: 'Foydalanuvchi blokdan chiqarildi' });
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    try {
      await ApiClient.adjustBalance(selectedUser.id, adjustAmount * 100, adjustReason);
      setMessage({ type: 'success', text: 'Balans muvaffaqiyatli to\'g\'rilandi' });
      setSelectedUser(null);
      setAdjustReason('');
      loadAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Ushbu sahifaga kirish taqiqlangan</h2>
        <p className="text-xs text-zinc-400 mt-1">Faqat tizim administratorlari uchun ruxsat berilgan</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-8">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <span>ADMIN BOSHQARUV PANELI</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Platforma moliyasi, foydalanuvchilar va audit jurnallari nazorati</p>
        </div>

        <div className="flex space-x-2">
          {[
            { id: 'kpi', label: 'Umumiy KPI' },
            { id: 'users', label: 'Foydalanuvchilar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'btn-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
          message.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            : 'bg-red-950/40 border-red-800/40 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Ko'rsatkichlari */}
      {activeTab === 'kpi' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0e1017] border border-white/[0.04] rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-bold uppercase">Jami Foydalanuvchilar</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-2xl font-mono font-black text-white">{metrics.totalUsers}</span>
            </div>

            <div className="bg-[#0e1017] border border-white/[0.04] rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-bold uppercase">Jami Aylanma</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-mono font-black text-emerald-400">
                {Math.floor(metrics.totalVolume / 100).toLocaleString()} UZS
              </span>
            </div>

            <div className="bg-[#0e1017] border border-white/[0.04] rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-bold uppercase">Ochilgan Keyslar</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-mono font-black text-amber-400">{metrics.totalCasesOpened}</span>
            </div>

            <div className="bg-[#0e1017] border border-white/[0.04] rounded-2xl p-5">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-bold uppercase">Bugungi Foyda</span>
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl font-mono font-black text-purple-300">
                {Math.floor(metrics.todayProfit / 100).toLocaleString()} UZS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Foydalanuvchilar Boshqaruvi */}
      {activeTab === 'users' && (
        <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Username yoki ID bo'yicha qidirish..."
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl pl-9 pr-4 py-2 text-white text-xs outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.04] text-zinc-400">
                <tr>
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Balans</th>
                  <th className="pb-3 font-semibold">Holat</th>
                  <th className="pb-3 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {usersList
                  .filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="text-zinc-300">
                      <td className="py-3 font-bold text-white">{u.username}</td>
                      <td className="py-3">
                        <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-amber-400">
                        {Math.floor((u.balance || 0) / 100).toLocaleString()} UZS
                      </td>
                      <td className="py-3">
                        {u.is_banned ? (
                          <span className="text-red-400 font-bold text-[11px]">Bloklangan</span>
                        ) : (
                          <span className="text-emerald-400 font-bold text-[11px]">Faol</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="btn-surface px-2.5 py-1 rounded-lg text-[11px] font-bold"
                        >
                          Balans +/-
                        </button>
                        {u.is_banned ? (
                          <button
                            onClick={() => handleUnbanUser(u.id)}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/40"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(u.id)}
                            className="bg-red-950/40 hover:bg-red-900/60 text-red-300 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-red-800/40"
                          >
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Balansni To'g'rilash Modali */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              Balansni To'g'rilash: {selectedUser.username}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Summa kiritish (Musbat qo'shadi, Manfiy ayiradi)</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Summa (UZS)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Sabab (Audit uchun)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Masalan: Test bonusi yoki to'lov xatosi"
                  className="w-full bg-[#0e1017] border border-white/[0.06] focus:border-white/20 rounded-xl px-3.5 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAdjustBalance}
                className="btn-gold px-5 py-2 rounded-xl text-xs"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
