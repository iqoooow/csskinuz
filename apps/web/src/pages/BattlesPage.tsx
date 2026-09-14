import React, { useEffect, useState } from 'react';
import { Battle, Case } from '../types/index.js';
import { ApiClient } from '../services/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { sound } from '../services/sound.js';
import { 
  Swords, 
  Plus, 
  Bot, 
  Trophy, 
  ArrowLeft, 
  ShieldAlert, 
  UserPlus
} from 'lucide-react';

export const BattlesPage: React.FC = () => {
  const { user, wallet, openAuthModal, openDepositModal } = useAuthStore();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [isCrazyMode, setIsCrazyMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBattles();
    ApiClient.getCases().then((cases) => setAvailableCases(cases.filter((c) => !c.is_free)));
  }, []);

  const loadBattles = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getBattles();
      setBattles(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBattle = async (battleId: string) => {
    sound.playClick();
    try {
      const battle = await ApiClient.getBattle(battleId);
      setSelectedBattle(battle);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateBattle = async () => {
    if (!user) {
      sound.playClick();
      openAuthModal();
      return;
    }

    if (!selectedCaseIds.length) {
      sound.playFail();
      setError('Kamida 1 ta keys tanlang');
      return;
    }

    const totalCost = selectedCaseIds.reduce((sum, id) => {
      const c = availableCases.find((item) => item.id === id);
      return sum + (c?.price || 0);
    }, 0);

    if (wallet && wallet.balance < totalCost) {
      sound.playClick();
      openDepositModal();
      return;
    }

    sound.playClick();
    try {
      const newBattle = await ApiClient.createBattle(selectedCaseIds, maxPlayers, isCrazyMode);
      setIsCreateModalOpen(false);
      setSelectedCaseIds([]);
      setSelectedBattle(newBattle);
      loadBattles();
    } catch (err: any) {
      setError(err.message || 'Jang yaratishda xatolik');
      sound.playFail();
    }
  };

  const handleJoinBattle = async (battleId: string) => {
    if (!user) {
      sound.playClick();
      openAuthModal();
      return;
    }

    sound.playClick();
    try {
      const updated = await ApiClient.joinBattle(battleId);
      setSelectedBattle(updated);
      loadBattles();
      sound.playWin(false);
    } catch (err: any) {
      setError(err.message || 'Qo\'shilishda xatolik');
      sound.playFail();
    }
  };

  const handleAddBot = async (battleId: string) => {
    sound.playClick();
    try {
      const updated = await ApiClient.addBotToBattle(battleId);
      setSelectedBattle(updated);
      loadBattles();
      if (updated.status === 'COMPLETED') {
        sound.playWin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Bot qo\'shishda xatolik');
      sound.playFail();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 space-y-8">
      
      {/* Tanlangan Jang Arenasi */}
      {selectedBattle ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedBattle(null);
                loadBattles();
              }}
              className="btn-surface px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Barcha Janglar Ro'yxatiga Qaytish</span>
            </button>

            <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              selectedBattle.status === 'COMPLETED'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}>
              {selectedBattle.status === 'COMPLETED' ? 'Jang Yakunlandi' : "O'yinchilar Kutilmoqda"}
            </span>
          </div>

          {/* Jang Arenasi */}
          <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-6 sm:p-8 shadow-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.04] pb-5 mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Swords className="w-5 h-5 text-amber-400" />
                  <span>Case Battle #{selectedBattle.id.substring(0, 8)}</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Rejim: <span className={selectedBattle.is_crazy_mode ? 'text-purple-400 font-bold' : 'text-zinc-300'}>
                    {selectedBattle.is_crazy_mode ? 'Crazy Mode (Kam yutgan g\'olib)' : 'Normal Mode (Ko\'p yutgan g\'olib)'}
                  </span>
                </p>
              </div>

              <div className="text-left sm:text-right bg-white/[0.02] p-2.5 px-4 rounded-xl border border-white/[0.04]">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Jami Bank</span>
                <span className="text-lg font-mono font-bold text-amber-400">
                  {Math.floor((selectedBattle.total_cost * selectedBattle.max_players) / 100).toLocaleString()} UZS
                </span>
              </div>
            </div>

            {/* O'yinchilar Slotlari */}
            <div className={`grid grid-cols-1 md:grid-cols-${selectedBattle.max_players} gap-4`}>
              {Array.from({ length: selectedBattle.max_players }).map((_, slotIdx) => {
                const player = selectedBattle.players?.find((p) => p.slot_number === slotIdx);
                const isCreator = user?.id === selectedBattle.creator_id;
                const canAddBot = isCreator && !player && selectedBattle.status === 'WAITING_FOR_PLAYERS';
                const canJoin = !player && user && selectedBattle.status === 'WAITING_FOR_PLAYERS';

                return (
                  <div
                    key={slotIdx}
                    className={`bg-[#11131c] rounded-3xl p-5 flex flex-col items-center justify-between min-h-[360px] relative border ${
                      player?.is_winner ? 'border-amber-400/40 bg-[#151824]' : 'border-white/[0.03]'
                    }`}
                  >
                    {player?.is_winner && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center space-x-1">
                        <Trophy className="w-3 h-3" />
                        <span>G'OLIB</span>
                      </div>
                    )}

                    {/* O'yinchi Avatar */}
                    <div className="flex flex-col items-center text-center mt-2">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden flex items-center justify-center mb-2">
                        {player ? (
                          player.is_bot ? (
                            <Bot className="w-8 h-8 text-cyan-400" />
                          ) : (
                            <img
                              src={player.avatar_url || 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/0000000000000000000000000000000000000000_full.jpg'}
                              alt={player.username}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <UserPlus className="w-6 h-6 text-zinc-600" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {player ? (player.is_bot ? 'AI Bot (Raqib)' : player.username) : `Bo'sh O'rin #${slotIdx + 1}`}
                      </h4>

                      <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                        Yutuq: {player ? Math.floor(player.total_drop_value / 100).toLocaleString() : 0} UZS
                      </p>
                    </div>

                    {/* Droplar Ro'yxati */}
                    {selectedBattle.drops && (
                      <div className="w-full my-3 space-y-1.5 overflow-y-auto max-h-36 pr-1 no-scrollbar">
                        {selectedBattle.drops
                          .filter((d) => d.player_id === player?.id)
                          .map((drop, dIdx) => (
                            <div key={dIdx} className="bg-[#0b0c11] rounded-xl p-2 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img src={drop.image_url} alt={drop.item_name} className="w-7 h-7 object-contain" />
                                <span className="text-[11px] font-medium text-zinc-200 truncate max-w-[110px]">{drop.item_name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-amber-400 font-bold">{Math.floor(drop.item_price / 100).toLocaleString()} UZS</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Amallar */}
                    {!player && (
                      <div className="w-full space-y-2 mt-auto">
                        {canJoin && (
                          <button
                            onClick={() => handleJoinBattle(selectedBattle.id)}
                            className="w-full btn-gold py-2.5 rounded-xl text-xs"
                          >
                            Jangga Qo'shilish
                          </button>
                        )}
                        {canAddBot && (
                          <button
                            onClick={() => handleAddBot(selectedBattle.id)}
                            className="w-full btn-surface py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5"
                          >
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                            <span>AI Bot Qo'shish</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Case Battles Lobby */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                <Swords className="w-6 h-6 text-amber-400" />
                <span>CASE BATTLES ARENASI</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Boshqa o'yinchilar bilan bellashing — eng ko'p yutgan barcha skinlarni oladi!
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                if (!user) {
                  openAuthModal();
                  return;
                }
                setIsCreateModalOpen(true);
              }}
              className="btn-gold px-5 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>JANG YARATISH</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Janglar Ro'yxati */}
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-[#0e1017] border border-white/[0.04] rounded-2xl h-20 animate-pulse"></div>
              ))}
            </div>
          ) : battles.length === 0 ? (
            <div className="bg-[#0e1017] border border-white/[0.04] rounded-3xl p-14 text-center space-y-2">
              <Swords className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Hozircha Faol Janglar Yo'q</h3>
              <p className="text-xs text-zinc-500">
                Birinchi bo'lib jang xonasini yarating va boshqa o'yinchilarni taklif qiling!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {battles.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBattle(b.id)}
                  className="bg-[#0e1017] hover:bg-[#12141d] border border-white/[0.04] hover:border-white/[0.1] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="flex items-center -space-x-2">
                      {b.players?.map((p, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border border-[#0e1017] flex items-center justify-center overflow-hidden">
                          {p.is_bot ? (
                            <Bot className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <img src={p.avatar_url || 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/0000000000000000000000000000000000000000_full.jpg'} alt={p.username} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                        {b.creator_name} ning jangi ({b.players?.length || 0}/{b.max_players})
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>{b.cases?.length || 0} ta keys</span>
                        <span>•</span>
                        <span className={b.is_crazy_mode ? 'text-purple-400 font-semibold' : ''}>
                          {b.is_crazy_mode ? 'Crazy Mode' : 'Normal Mode'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Jang Narxi</span>
                      <span className="text-sm font-mono font-bold text-amber-400">
                        {Math.floor(b.total_cost / 100).toLocaleString()} UZS
                      </span>
                    </div>

                    <button
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        b.status === 'COMPLETED'
                          ? 'btn-surface'
                          : 'btn-gold'
                      }`}
                    >
                      {b.status === 'COMPLETED' ? "Ko'rish" : "Qo'shilish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jang Yaratish Modali */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#11131c] border border-white/[0.08] w-full max-w-xl rounded-3xl p-6 relative max-h-[90vh] flex flex-col">
            
            <h3 className="text-lg font-bold text-white mb-1">Yangi Case Battle Yaratish</h3>
            <p className="text-xs text-zinc-400 mb-5">Keyslar va o'yinchilar sonini tanlang</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">O'yinchilar Soni</label>
                <div className="flex space-x-2">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        sound.playClick();
                        setMaxPlayers(num);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        maxPlayers === num
                          ? 'bg-amber-500 text-slate-950'
                          : 'btn-surface'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">O'yin Rejimi</label>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsCrazyMode(!isCrazyMode);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    isCrazyMode
                      ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                      : 'btn-surface'
                  }`}
                >
                  {isCrazyMode ? '🤪 Crazy Mode' : '🏆 Normal Mode'}
                </button>
              </div>
            </div>

            {/* Keyslar Tanlash */}
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">
              Keyslarni Tanlang ({selectedCaseIds.length} ta)
            </label>
            
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 no-scrollbar max-h-56">
              {availableCases.map((c) => {
                const count = selectedCaseIds.filter((id) => id === c.id).length;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCaseIds([...selectedCaseIds, c.id]);
                    }}
                    className="bg-[#0e1017] hover:bg-[#141722] p-2 rounded-xl flex items-center justify-between cursor-pointer border border-white/[0.03]"
                  >
                    <div className="flex items-center space-x-2">
                      <img src={c.image_url} alt={c.name} className="w-8 h-8 object-contain" />
                      <div className="max-w-[75px]">
                        <span className="text-[11px] font-semibold text-zinc-200 truncate block">{c.name}</span>
                        <span className="text-[9px] font-mono text-amber-400">{Math.floor(c.price / 100).toLocaleString()} UZS</span>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pastki Qism */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsCreateModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Bekor Qilish
              </button>

              <button
                onClick={handleCreateBattle}
                disabled={selectedCaseIds.length === 0}
                className="btn-gold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider disabled:opacity-40"
              >
                Jangni Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
