import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { Shield, Users, Package, DollarSign, CheckCircle, Search, AlertCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'kpi' | 'users' | 'audit'>('kpi');
  
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-brand-red mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Ushbu sahifaga kirish taqiqlangan</h2>
        <p className="text-xs text-slate-400 mt-1">Faqat tizim administratorlari uchun ruxsat berilgan</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <span>ADMIN BOSHQARUV PANELI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Platforma moliyasi, foydalanuvchilar va audit jurnallari nazorati</p>
        </div>

        <div className="flex space-x-2">
          {[
            { id: 'kpi', label: 'Umumiy KPI' },
            { id: 'users', label: 'Foydalanuvchilar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-background-secondary border border-slate-800 text-slate-300'
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
            ? 'bg-emerald-950/40 border-brand-green text-emerald-300'
            : 'bg-red-950/40 border-brand-red text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* KPI Ko'rsatkichlari */}
      {activeTab === 'kpi' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-background-secondary border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Jami Foydalanuvchilar</span>
                <Users className="w-4 h-4 text-brand-cyan" />
              </div>
              <span className="text-2xl font-mono font-black text-slate-100">{metrics.kpi.totalUsers}</span>
            </div>

            <div className="bg-background-secondary border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Jami Depozitlar</span>
                <DollarSign className="w-4 h-4 text-brand-green" />
              </div>
              <span className="text-2xl font-mono font-black text-brand-green">
                {Math.floor(metrics.kpi.totalDepositsSum / 100).toLocaleString()} UZS
              </span>
            </div>

            <div className="bg-background-secondary border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Ochilgan Keyslar</span>
                <Package className="w-4 h-4 text-brand-gold" />
              </div>
              <span className="text-2xl font-mono font-black text-brand-gold">{metrics.kpi.totalCasesOpened}</span>
            </div>

            <div className="bg-background-secondary border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">Steam Yechishlar</span>
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl font-mono font-black text-purple-300">{metrics.kpi.totalWithdrawalsCount}</span>
            </div>
          </div>

          {/* So'nggi ochilgan keyslar auditi */}
          <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4">So'nggi Jonli Ochilishlar Auditi</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold">O'yinchi</th>
                    <th className="pb-3 font-semibold">Keys</th>
                    <th className="pb-3 font-semibold">Yutilgan Skin</th>
                    <th className="pb-3 font-semibold">Narxi</th>
                    <th className="pb-3 font-semibold">Vaqt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.recentOpenings?.map((o: any) => (
                    <tr key={o.id} className="text-slate-300">
                      <td className="py-2.5 font-bold">{o.username}</td>
                      <td className="py-2.5 text-slate-400">{o.case_name}</td>
                      <td className="py-2.5 font-semibold text-slate-100">{o.item_name}</td>
                      <td className="py-2.5 font-mono text-brand-gold font-bold">
                        {Math.floor(o.base_price / 100).toLocaleString()} UZS
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono">{new Date(o.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Foydalanuvchilar Boshqaruvi */}
      {activeTab === 'users' && (
        <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Username yoki ID bo'yicha qidirish..."
              className="w-full bg-background-tertiary border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Balans</th>
                  <th className="pb-3 font-semibold">Holat</th>
                  <th className="pb-3 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList
                  .filter((u) => u.username.toLowerCase().includes(search.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="text-slate-300">
                      <td className="py-3 font-bold text-slate-100">{u.username}</td>
                      <td className="py-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-brand-gold">
                        {Math.floor((u.balance || 0) / 100).toLocaleString()} UZS
                      </td>
                      <td className="py-3">
                        {u.is_banned ? (
                          <span className="text-brand-red font-bold text-[11px]">Bloklangan</span>
                        ) : (
                          <span className="text-brand-green font-bold text-[11px]">Faol</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="bg-background-tertiary hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700"
                        >
                          Balans +/-
                        </button>
                        {u.is_banned ? (
                          <button
                            onClick={() => handleUnbanUser(u.id)}
                            className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green px-2.5 py-1 rounded-lg text-[11px] font-bold border border-brand-green/40"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(u.id)}
                            className="bg-red-950/40 hover:bg-red-900/60 text-brand-red px-2.5 py-1 rounded-lg text-[11px] font-bold border border-brand-red/40"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background-secondary border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Balansni To'g'rilash: {selectedUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Summa kiritish (Musbat qo'shadi, Manfiy ayiradi)</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Summa (UZS)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Sabab (Audit uchun)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Masalan: Test bonusi yoki to'lov xatosi"
                  className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAdjustBalance}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
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
