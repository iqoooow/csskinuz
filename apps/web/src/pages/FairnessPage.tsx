import React, { useState } from 'react';
import { ApiClient } from '../services/api.js';
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
    } catch (err: any) {
      setError(err.message || 'Tekshirishda xatolik');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-slate-100 uppercase tracking-tight">
          PROVABLY FAIR ADOLAT KAFOLATI
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
          Bizning platformadagi har bir keys ochish va apgreyd natijasi HMAC-SHA256 algoritmi orqali matematik ravishda oldindan belgilanadi va manipulyatsiya qilinishi mumkin emas.
        </p>
      </div>

      {/* Mustaqil Tekshirgich Formasi */}
      <div className="bg-background-secondary border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-2.5 mb-6">
          <Calculator className="w-5 h-5 text-brand-gold" />
          <h3 className="text-lg font-bold text-slate-100">Natijani Mustaqil Tekshirish</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-brand-red" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between ${
            result.isValid
              ? 'bg-emerald-950/40 border-brand-green text-emerald-300'
              : 'bg-red-950/40 border-brand-red text-red-300'
          }`}>
            <div className="flex items-center space-x-3">
              {result.isValid ? <CheckCircle2 className="w-6 h-6 text-brand-green shrink-0" /> : <AlertCircle className="w-6 h-6 text-brand-red shrink-0" />}
              <div>
                <h4 className="font-bold text-sm">
                  {result.isValid ? '100% ADOLATLI! NATIJA TO\'G\'RI' : 'XATOLIK: NATIJA MOS KELMADI'}
                </h4>
                <p className="text-[11px] font-mono mt-0.5">
                  Hisoblangan Roll: {result.calculatedRoll}% | Kiritilgan Roll: {result.providedRoll}%
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Server Seed (Ochiq kod)</label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              placeholder="64 ta belgili hex Server Seed..."
              className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-gold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Client Seed</label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                placeholder="Client Seed..."
                className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-gold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Nonce (Tartib raqami)</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(parseInt(e.target.value || '1', 10))}
                className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-gold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Olingan Roll Natijasi (0..100)</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Masalan: 42.849120"
              className="w-full bg-background-tertiary border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-gold"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-green to-emerald-500 hover:from-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-md mt-2"
          >
            Natijani Tekshirish (Verify)
          </button>
        </form>
      </div>
    </div>
  );
};
