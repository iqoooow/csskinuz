import React, { useState } from 'react';
import { ApiClient } from '../services/api.js';
import { sound } from '../services/sound.js';
import { ShieldCheck, CheckCircle2, AlertCircle, Calculator } from 'lucide-react';

export const FairnessPage: React.FC = () => {
  const [serverSeed, setServerSeed] = useState<string>('');
  const [clientSeed, setClientSeed] = useState<string>('');
  const [nonce, setNonce] = useState<number>(1);
  const [rollNumber, setRollNumber] = useState<string>('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setError(null);
    setResult(null);

    try {
      const res = await ApiClient.verifyFairness(
        serverSeed.trim(),
        clientSeed.trim(),
        nonce,
        parseFloat(rollNumber)
      );
      setResult(res);
      sound.playWin(false);
    } catch (err: any) {
      setError(err.message || 'Tekshirishda xatolik');
      sound.playFail();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-8">
      <div className="text-center space-y-1">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          PROVABLY FAIR ADOLAT KAFOLATI
        </h1>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Bizning platformadagi har bir keys ochish va apgreyd natijasi HMAC-SHA256 algoritmi orqali matematik ravishda oldindan belgilanadi va manipulyatsiya qilinishi mumkin emas.
        </p>
      </div>

      {/* Mustaqil Tekshirgich Formasi */}
      <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Natijani Mustaqil Tekshirish</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  100% ADOLATLI! NATIJA TO'G'RI
                </h4>
                <p className="text-[11px] font-mono mt-0.5">
                  Hisoblangan Roll: {result.rollNumber}% | SHA256 Hash: {result.calculatedHash}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Server Seed (Ochiq kod)</label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              placeholder="64 ta belgili hex Server Seed..."
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Client Seed</label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="Client Seed..."
                className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Nonce (Tartib raqami)</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value || '1', 10))}
                className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Olingan Roll Natijasi (0..100)</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Masalan: 42.849120"
              className="w-full bg-[#11131c] border border-white/[0.06] focus:border-white/20 rounded-xl px-4 py-2.5 text-white text-xs font-mono outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-3 rounded-xl text-xs uppercase tracking-wider mt-2"
          >
            Natijani Tekshirish (Verify)
          </button>
        </form>
      </div>
    </div>
  );
};
