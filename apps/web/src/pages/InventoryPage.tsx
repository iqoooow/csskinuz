import React, { useEffect, useState } from 'react';
import { InventoryItem } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { SkinCard } from '../components/SkinCard.js';
import { Shield, DollarSign, Download, CheckCircle2, AlertCircle } from 'lucide-react';

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
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === inventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventory.map((i) => i.id));
    }
  };

  const selectedTotalValue = inventory
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + (item.base_price || item.obtained_price), 0);

  const handleBulkSell = async () => {
    if (!selectedIds.length) return;
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
    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await ApiClient.withdrawSkin(inventoryItemId);
      setMessage({
        type: 'success',
        text: res.message || 'Steam bot savdo taklifini yubordi! Iltimos, Steam Guard ilovangizda tasdiqlang.',
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
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Inventarni ko'rish uchun profilingizga kiring</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">Barcha yutilgan CS2 skinlaringiz hisobingizda xavfsiz saqlanadi</p>
        <button
          onClick={openAuthModal}
          className="bg-brand-gold hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-glow-gold"
        >
          Kirish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight flex items-center space-x-2">
            <Shield className="w-6 h-6 text-brand-gold" />
            <span>Mening Inventarim ({inventory.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Yutilgan skinlarni sotishingiz yoki Steamga yechib olishingiz mumkin</p>
        </div>

        {/* Ommaviy Amallar */}
        {inventory.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSelectAll}
              className="bg-background-secondary hover:bg-background-tertiary border border-slate-800 text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              {selectedIds.length === inventory.length ? 'Bekor qilish' : 'Barchasini tanlash'}
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkSell}
                disabled={isProcessing}
                className="bg-brand-green hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
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
            ? 'bg-emerald-950/40 border-brand-green text-emerald-300'
            : 'bg-red-950/40 border-brand-red text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Skinlar Gridi */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="bg-background-secondary border border-slate-800 rounded-2xl h-48 animate-pulse"></div>
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-background-secondary border border-slate-800 rounded-3xl p-16 text-center">
          <Shield className="w-14 h-14 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Inventaringiz bo'sh</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">Birinchi keysingizni oching va noyob skinlarga ega bo'ling!</p>
          <button
            onClick={() => onNavigate('cases')}
            className="bg-brand-gold hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-glow-gold"
          >
            Keyslarga O'tish
          </button>
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
                      className="bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/40 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                      title="Steam inventariga yechib olish"
                    >
                      <Download className="w-3 h-3" />
                      <span>Steam</span>
                    </button>
                    <button
                      onClick={async () => {
                        const res = await ApiClient.sellItem(item.id);
                        updateBalance(res.newBalance);
                        loadInventory();
                      }}
                      className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/40 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
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
