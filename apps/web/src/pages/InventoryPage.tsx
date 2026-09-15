import React, { useEffect, useState } from 'react';
import { InventoryItem } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { SkinCard } from '../components/SkinCard.js';
import { Shield, DollarSign, Download, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../services/sound.js';

interface InventoryPageProps {
  onNavigate: (tab: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { user, updateBalance, openAuthModal } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadInventory();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getInventory('AVAILABLE');
      setInventory(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    sound.playClick();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    sound.playClick();
    if (selectedIds.length === inventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventory.map((i) => i.id));
    }
  };

  const selectedTotalValue = inventory
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + (item.base_price || item.obtained_price), 0);

  const totalInventoryValue = inventory
    .reduce((sum, item) => sum + (item.base_price || item.obtained_price), 0);

  const handleBulkSell = async () => {
    if (!selectedIds.length) return;
    sound.playCoin();
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await ApiClient.bulkSell(selectedIds);
      updateBalance(res.newBalance);
      setMessage({
        type: 'success',
        text: `${res.soldCount} ta skin sotildi! Balansingizga ${Math.floor(res.totalAmount / 100).toLocaleString()} UZS qo'shildi.`,
      });
      setSelectedIds([]);
      loadInventory();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Sotishda xatolik' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawSteam = async (inventoryItemId: string) => {
    sound.playClick();
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await ApiClient.withdrawSkin(inventoryItemId);
      setMessage({
        type: 'success',
        text: res.message || 'Steam bot savdo taklifini yubordi! Iltimos, Steam ilovangizda tasdiqlang.',
      });
      loadInventory();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Yechib olishda xatolik' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Inventarni ko'rish uchun profilingizga kiring</h2>
        <p className="text-xs text-zinc-400 mt-1 mb-6">Barcha yutilgan CS2 skinlaringiz hisobingizda xavfsiz saqlanadi</p>
        <button
          onClick={() => {
            sound.playClick();
            openAuthModal();
          }}
          className="btn-gold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm"
        >
          Kirish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Mening Inventarim ({inventory.length})</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Jami qiymat: <span className="font-mono font-bold text-amber-400">{Math.floor(totalInventoryValue / 100).toLocaleString()} UZS</span>
          </p>
        </div>

        {/* Ommaviy Amallar */}
        {inventory.length > 0 && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleSelectAll}
              className="btn-surface px-3.5 py-2 rounded-xl text-xs font-semibold"
            >
              {selectedIds.length === inventory.length ? 'Bekor qilish' : 'Barchasini tanlash'}
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkSell}
                disabled={isProcessing}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span>Tanlanganlarni Sotish (+{Math.floor(selectedTotalValue / 100).toLocaleString()} UZS)</span>
              </button>
            )}
          </div>
        )}
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

      {/* Skinlar Gridi */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="bg-[#0e1017] border border-white/[0.04] rounded-2xl h-48 animate-pulse"></div>
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-16 text-center space-y-2">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Inventaringiz Hozircha Bo'sh</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Birinchi keysingizni oching yoki bepul kunlik keys orqali noyob skinlarga ega bo'ling!
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('cases');
              }}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              <span>Keyslarga O'tish</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {inventory.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <SkinCard
                key={item.id}
                item={item}
                isSelected={isSelected}
                onSelect={() => handleToggleSelect(item.id)}
                actionButton={
                  <div className="grid grid-cols-2 gap-1.5 w-full mt-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleWithdrawSteam(item.id)}
                      disabled={isProcessing}
                      className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                      title="Steam inventariga yechib olish"
                    >
                      <Download className="w-3 h-3" />
                      <span>Steam</span>
                    </button>
                    <button
                      onClick={async () => {
                        sound.playCoin();
                        const res = await ApiClient.sellItem(item.id);
                        updateBalance(res.newBalance);
                        loadInventory();
                      }}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                    >
                      <DollarSign className="w-3 h-3" />
                      <span>Sotish</span>
                    </button>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
