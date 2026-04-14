import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Check, Star, Sparkles, Crown, ArrowRight, Calendar } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLANS = [
  {
    id: 'basico',
    name: 'Basico',
    icon: Sparkles,
    price: 79.90,
    period: 'mes',
    color: 'border-[#84978F]',
    accent: 'bg-[#84978F]',
    features: [
      'Oleo de Gergelim Prensado a Frio (200ml)',
      'Shampoo Natural Aveia e Aloe Vera',
      'Guia digital de cuidados com a pelagem',
      'Suporte por WhatsApp',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Star,
    price: 149.90,
    period: 'mes',
    color: 'border-[#C87A5D]',
    accent: 'bg-[#C87A5D]',
    features: [
      'Oleo de Gergelim + Oleo de Coco (200ml cada)',
      'Omega 3-6-9 Veterinario',
      'Shampoo + Condicionador Leave-in',
      'Biotina + Zinco Manipulados',
      'Consulta online mensal (15 min)',
      'Frete gratis',
      '15% OFF em produtos avulsos',
    ],
    popular: true,
  },
  {
    id: 'ouro',
    name: 'Ouro',
    icon: Crown,
    price: 249.90,
    period: 'mes',
    color: 'border-[#2C4C3B]',
    accent: 'bg-[#2C4C3B]',
    features: [
      'Kit Pelagem Saudavel Completo',
      'Racao Natural Receita Ayurvedica',
      'Mix Nutricional Pelagem Brilhante',
      'Todos os oleos (Gergelim, Coco, Linhaca)',
      'Consulta online mensal (30 min)',
      'Frete gratis + entrega prioritaria',
      '25% OFF em todos os produtos',
      'Pontos de fidelidade em dobro',
    ],
    popular: false,
  },
];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [subscribing, setSubscribing] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!user || user === false) {
      toast.error('Faca login para assinar um plano');
      return;
    }
    setSubscribing(plan.id);
    try {
      const { data } = await axios.post(`${API}/subscriptions`, {
        plan_id: plan.id,
        plan_name: plan.name,
        price: plan.price,
      }, { withCredentials: true });
      setSuccess(data);
      toast.success(`Assinatura ${plan.name} ativada!`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erro ao assinar');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div data-testid="subscriptions-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      {/* Hero */}
      <section className="bg-[#2C4C3B] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
            <Calendar className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Assinaturas Mensais</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0]">
            Planos de <span className="text-[#C87A5D]">Pelagem Saudavel</span>
          </h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">
            Receba mensalmente os melhores produtos naturais para a pelagem do seu pet, com acompanhamento profissional e descontos exclusivos.
          </p>
        </div>
      </section>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map(plan => (
            <div key={plan.id} data-testid={`plan-${plan.id}`}
              className={`relative bg-white/60 backdrop-blur-sm border-2 ${plan.popular ? 'border-[#C87A5D] shadow-[0_12px_48px_rgba(200,122,93,0.15)]' : 'border-[#E0DDD5]'} rounded-3xl p-8 flex flex-col hover:-translate-y-1 transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C87A5D] text-[#F9F6F0] text-xs font-bold px-4 py-1.5 rounded-full">
                  Mais Popular
                </div>
              )}
              <div className={`w-12 h-12 ${plan.accent} rounded-2xl flex items-center justify-center mb-5`}>
                <plan.icon className="w-6 h-6 text-[#F9F6F0]" />
              </div>
              <h3 className="font-['Outfit'] text-2xl font-semibold text-[#1A2E24]">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-['Outfit'] text-4xl font-bold text-[#2C4C3B]">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                <span className="text-[#84978F] text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#4A6B5A]">
                    <Check className="w-4 h-4 text-[#2C4C3B] flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={subscribing === plan.id}
                data-testid={`subscribe-${plan.id}`}
                className={`w-full rounded-full px-6 py-3.5 font-medium transition-all text-center disabled:opacity-50 ${plan.popular ? 'bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C]' : 'bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24]'}`}>
                {subscribing === plan.id ? 'Processando...' : 'Assinar Agora'}
              </button>
            </div>
          ))}
        </div>

        {success && (
          <div data-testid="subscription-success" className="mt-10 bg-[#2C4C3B]/5 border border-[#2C4C3B]/20 rounded-3xl p-8 max-w-lg mx-auto text-center">
            <Check className="w-12 h-12 text-[#2C4C3B] mx-auto mb-4" />
            <h3 className="font-['Outfit'] text-xl font-semibold text-[#1A2E24] mb-2">Assinatura Ativada!</h3>
            <p className="text-[#4A6B5A] mb-1">Plano: <strong>{success.plan_name}</strong></p>
            <p className="text-[#4A6B5A] mb-4">Proximo envio em: <strong>{success.next_delivery}</strong></p>
            <p className="text-xs text-[#84978F]">Voce recebera um e-mail com os detalhes da assinatura.</p>
            <Link to="/dashboard" className="inline-block mt-4 text-sm text-[#2C4C3B] font-medium hover:underline">Ver meu painel</Link>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-['Outfit'] text-2xl font-medium text-[#1A2E24] text-center mb-8">Duvidas sobre assinaturas</h2>
          <div className="space-y-4">
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Sem fidelidade ou multa. Cancele quando quiser pelo painel ou WhatsApp.' },
              { q: 'Como funciona a entrega?', a: 'Os produtos sao enviados no dia 5 de cada mes com frete gratis (Premium e Ouro). Entrega em 3-7 dias uteis.' },
              { q: 'Posso trocar de plano?', a: 'Sim, voce pode fazer upgrade ou downgrade a qualquer momento. A mudanca vale a partir do proximo ciclo.' },
              { q: 'A consulta online esta inclusa?', a: 'Nos planos Premium (15 min) e Ouro (30 min). Um veterinario especialista avalia a pelagem do seu pet por video.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                <h4 className="font-medium text-[#1A2E24] mb-2">{item.q}</h4>
                <p className="text-sm text-[#4A6B5A]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
