import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Award, Gift, Star, TrendingUp, History, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIERS = {
  Bronze: { color: 'bg-[#CD7F32]', min: 0, next: 'Prata', nextMin: 5000 },
  Prata: { color: 'bg-[#C0C0C0]', min: 5000, next: 'Ouro', nextMin: 10000 },
  Ouro: { color: 'bg-[#FFD700]', min: 10000, next: null, nextMin: null },
};

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState(500);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (user && user !== false) {
      axios.get(`${API}/loyalty`, { withCredentials: true })
        .then(res => { setLoyalty(res.data.loyalty); setHistory(res.data.history); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user === false) return <Navigate to="/login" />;

  const points = loyalty?.points || 0;
  const tier = loyalty?.tier || 'Bronze';
  const tierInfo = TIERS[tier] || TIERS.Bronze;
  const progress = tierInfo.next ? Math.min(100, ((loyalty?.total_earned || 0) - tierInfo.min) / (tierInfo.nextMin - tierInfo.min) * 100) : 100;

  const handleRedeem = async () => {
    if (redeemAmount < 500) { toast.error('Mínimo 500 pontos'); return; }
    if (redeemAmount > points) { toast.error('Pontos insuficientes'); return; }
    setRedeeming(true);
    try {
      const { data } = await axios.post(`${API}/loyalty/redeem?points=${redeemAmount}`, {}, { withCredentials: true });
      toast.success(`Cupom ${data.coupon_code} gerado! Desconto de R$ ${data.discount_value.toFixed(2).replace('.', ',')}`);
      setLoyalty(prev => ({ ...prev, points: data.remaining_points }));
      // Reload history
      const res = await axios.get(`${API}/loyalty`, { withCredentials: true });
      setHistory(res.data.history);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao resgatar');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div data-testid="loyalty-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Fidelidade</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Programa de Pontos</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Ganhe pontos a cada compra e troque por descontos exclusivos.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-2xl h-32 animate-pulse" />)}</div>
        ) : (
          <>
            {/* Points Card */}
            <div className="bg-[#2C4C3B] rounded-3xl p-8 sm:p-10 mb-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className={`w-16 h-16 ${tierInfo.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nível {tier}</p>
                <p className="font-['Outfit'] text-5xl sm:text-6xl font-bold text-[#F9F6F0] mt-2" data-testid="points-balance">{points.toLocaleString('pt-BR')}</p>
                <p className="text-[#F9F6F0]/60 text-sm mt-1">pontos disponíveis</p>

                {tierInfo.next && (
                  <div className="mt-6 max-w-xs mx-auto">
                    <div className="flex items-center justify-between text-xs text-[#F9F6F0]/50 mb-1">
                      <span>{tier}</span>
                      <span>{tierInfo.next}</span>
                    </div>
                    <div className="w-full bg-[#F9F6F0]/10 rounded-full h-2">
                      <div className="bg-[#C87A5D] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-[#F9F6F0]/40 mt-1">{tierInfo.nextMin - (loyalty?.total_earned || 0)} pontos para {tierInfo.next}</p>
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: TrendingUp, title: 'Ganhe', desc: '10 pontos por cada R$ 1 em compras' },
                { icon: Gift, title: 'Troque', desc: '500 pontos = R$ 5 de desconto' },
                { icon: Star, title: 'Suba de Nível', desc: 'Bronze > Prata > Ouro com benefícios' },
              ].map((item, i) => (
                <div key={i} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6 text-center">
                  <div className="w-10 h-10 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-[#2C4C3B]" />
                  </div>
                  <h3 className="font-['Outfit'] font-medium text-[#1A2E24] mb-1">{item.title}</h3>
                  <p className="text-xs text-[#4A6B5A]">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Redeem */}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8 mb-8">
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#C87A5D]" /> Resgatar Pontos
              </h3>
              <p className="text-sm text-[#4A6B5A] mb-4">Troque seus pontos por cupons de desconto. Mínimo: 500 pontos (R$ 5,00).</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 2000, 5000].map(p => (
                      <button
                        key={p}
                        onClick={() => setRedeemAmount(p)}
                        disabled={points < p}
                        data-testid={`redeem-${p}`}
                        className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${redeemAmount === p ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'} disabled:opacity-30`}
                      >
                        <span className="block font-bold">{p.toLocaleString()}</span>
                        <span className="block text-xs mt-0.5">R$ {(p / 100).toFixed(0)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleRedeem}
                  disabled={redeeming || points < 500}
                  data-testid="redeem-btn"
                  className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3 font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {redeeming ? 'Gerando...' : `Resgatar ${redeemAmount} pts`}
                </button>
              </div>
            </div>

            {/* History */}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#84978F]" /> Histórico
              </h3>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#84978F] mb-4">Nenhuma atividade ainda.</p>
                  <Link to="/produtos" className="text-sm text-[#2C4C3B] font-medium hover:underline">Faça sua primeira compra</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="flex items-center justify-between py-3 border-b border-[#E0DDD5] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${h.type === 'earn' ? 'bg-[#2C4C3B]/10' : 'bg-[#C87A5D]/10'}`}>
                          {h.type === 'earn' ? <TrendingUp className="w-4 h-4 text-[#2C4C3B]" /> : <Gift className="w-4 h-4 text-[#C87A5D]" />}
                        </div>
                        <div>
                          <p className="text-sm text-[#1A2E24]">{h.description}</p>
                          <p className="text-xs text-[#84978F]">{new Date(h.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <span className={`font-['Outfit'] font-bold ${h.points > 0 ? 'text-[#2C4C3B]' : 'text-[#C87A5D]'}`}>
                        {h.points > 0 ? '+' : ''}{h.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
