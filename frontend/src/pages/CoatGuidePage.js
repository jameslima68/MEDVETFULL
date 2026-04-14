import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Droplets, Calculator, ChevronRight, BookOpen, Apple, Sparkles, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Slider } from '../components/ui/slider';

const OILS = [
  { name: 'Óleo de Gergelim', perKg: 0.5, unit: 'ml', desc: 'Rico em vitamina E e antioxidantes. Nutre folículos e cria barreira protetora.', color: '#C87A5D', benefits: ['Vitamina E', 'Ômega 6 e 9', 'Sesamina'] },
  { name: 'Óleo de Coco', perKg: 0.5, unit: 'ml', desc: 'Hidrata pele e pelos. Acido laurico com acao antibacteriana.', color: '#84978F', benefits: ['Acido Laurico', 'Hidratacao', 'Antifúngico'] },
  { name: 'Óleo de Linhaça', perKg: 0.3, unit: 'ml', desc: 'Fonte vegetal de Ômega 3. Combate dermatites e inflamação.', color: '#2C4C3B', benefits: ['Ômega 3 (ALA)', 'Anti-inflamatório', 'Fibras'] },
  { name: 'Ômega 3 (Peixe)', perKg: 0.2, unit: 'ml', desc: 'EPA e DHA para pelo brilhante. Reduz queda e inflamação.', color: '#A4B8C4', benefits: ['EPA', 'DHA', 'Pelo Brilhante'] },
];

const GUIDE_SECTIONS = [
  {
    id: 'alimentação',
    icon: Apple,
    title: 'Alimentação para Pelagem',
    content: [
      { subtitle: 'Proteínas de Alta Qualidade', text: 'Os pelos sao compostos por 95% de queratina, uma proteína. Frango, peixe, ovos e carne magra fornecem os aminoácidos essenciais (metionina e cisteina) para a formação de pelos fortes. Animais com dieta pobre em proteínas apresentam pelagem opaca e quebradiça.' },
      { subtitle: 'Ácidos Graxos Essenciais', text: 'Ômega 3 (salmao, sardinha, linhaça) e Ômega 6 (gergelim, girassol) sao fundamentais. O Ômega 3 reduz inflamação na pele, enquanto o Ômega 6 mantem a barreira cutanea hidratada. A proporcao ideal e 1:5 a 1:10 (Ômega 3:6).' },
      { subtitle: 'Vitaminas e Minerais', text: 'Vitamina A (cenoura, abóbora) para renovação celular. Vitamina E (gergelim, amendoim) como antioxidante. Biotina/B7 para ciclo de crescimento. Zinco para sintese de queratina. Cobre para pigmentação dos pelos.' },
      { subtitle: 'Alimentos a Evitar', text: 'Rações com excesso de milho, soja e subprodutos. Alimentos processados com corantes e conservantes artificiais. Excesso de carboidratos refinados que causam inflamação crônica na pele.' },
    ]
  },
  {
    id: 'óleos',
    icon: Droplets,
    title: 'Óleos Naturais',
    content: [
      { subtitle: 'Óleo de Gergelim Prensado a Frio', text: 'O grande destaque da Ayurveda. Rico em sesamina e sesamolina (antioxidantes exclusivos), vitamina E e acidos graxos ômega 6 e 9. Pode ser adicionado a ração ou aplicado topicamente com massagem suave. Na Ayurveda, é considerado um alimento "sattvico" que promove equilíbrio e vitalidade.' },
      { subtitle: 'Óleo de Coco Extra Virgem', text: 'Contém acido laurico com propriedades antibacterianas e antifungicas naturais. Hidrata profundamente a pele ressecada, reduz coceira e pode ser usado tanto na alimentação quanto como condicionador topico após o banho.' },
      { subtitle: 'Óleo de Linhaça Dourada', text: 'Principal fonte vegetal de ômega 3 (ALA). Ideal para animais com alergias a peixe. Combate dermatites, reduz a queda de pelos e promove crescimento saudavel. Use sempre prensado a frio e armazene na geladeira.' },
      { subtitle: 'Como Aplicar', text: 'Via oral: misture o óleo na ração em temperatura ambiente (nunca aquecer óleos prensados a frio). Via topica: aplique pequena quantidade nas maos e massageie na pelagem, especialmente em areas ressecadas. Deixe agir 15-30min antes do banho.' },
    ]
  },
  {
    id: 'cuidados',
    icon: Heart,
    title: 'Cuidados Diários',
    content: [
      { subtitle: 'Escovação Regular', text: 'Escove seu pet 3-5 vezes por semana (diariamente para raças de pelo longo). A escovacao distribui os óleos naturais pela pelagem, remove pelos mortos, estimula a circulação na pele e previne nos. Use escova adequada para o tipo de pelo.' },
      { subtitle: 'Banhos na Medida Certa', text: 'Banhos excessivos removem os óleos naturais da pele. Para caes: a cada 15-30 dias. Para gatos: apenas quando necessario. Use shampoos sem sulfatos, com ingredientes naturais como aveia coloidal e aloe vera.' },
      { subtitle: 'Hidratacao e Protecao', text: 'Apos o banho, aplique condicionador leave-in ou óleo de gergelim diluido. Proteja seu pet do sol excessivo e do ar condicionado (que resseca a pele). No inverno, hidrate mais frequentemente.' },
      { subtitle: 'Sinais de Alerta', text: 'Queda excessiva fora dos periodos normais de troca. Falhas na pelagem. Pele avermelhada ou com crostas. Coceira intensa. Pelos sem brilho e quebradiços. Nesses casos, consulte um veterinário integrativo.' },
    ]
  },
  {
    id: 'ayurveda',
    icon: Sparkles,
    title: 'Ayurveda e Pelagem',
    content: [
      { subtitle: 'Doshas e Tipos de Pelo', text: 'Na Ayurveda, cada animal tem uma constituição (dosha) que influencia o tipo de pelo. Vata: pelos finos, secos, com tendencia a queda. Pitta: pelos medios, com tendencia a inflamação e vermelhidao. Kapha: pelos grossos, óleosos, com tendencia a acumulo.' },
      { subtitle: 'Abhyanga (Massagem com Óleo)', text: 'A prática ayurvedica de massagem com óleo morno (abhyanga) pode ser adaptada para pets. Use óleo de gergelim morno (nunca quente) e massageie suavemente por 5-10 minutos. Acalma o sistema nervoso, nutre a pele e fortalece os pelos.' },
      { subtitle: 'Ervas Ayurvédicas', text: 'Ashwagandha: adaptógeno que reduz estresse (causa comum de queda). Amla (groselha indiana): rica em vitamina C, fortalece folículos. Brahmi: melhora circulação na pele. Neem: antifúngico e antibacteriano natural.' },
      { subtitle: 'Alimentação Ayurvédica', text: 'Ghee (manteiga clarificada): fonte de vitaminas A, D, E e K. Curcuma (açafrão): poderoso anti-inflamatório. Triphala: combinacao de 3 frutas que desintoxica e nutre de dentro para fora. Sempre consulte um veterinário antes de introduzir novos ingredientes.' },
    ]
  },
];

export default function CoatGuidePage() {
  const [petWeight, setPetWeight] = useState([10]);
  const [petType, setPetType] = useState('cao');
  const [activeSection, setActiveSection] = useState('alimentação');

  const weight = petWeight[0];
  const factor = petType === 'gato' ? 0.7 : 1;

  return (
    <div data-testid="coat-guide-page" className="min-h-screen bg-[#F9F6F0]">
      {/* Hero */}
      <section className="bg-[#2C4C3B] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-80 h-80 border border-[#F9F6F0] rounded-full" />
          <div className="absolute bottom-0 left-10 w-60 h-60 border border-[#F9F6F0] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-4 h-4 text-[#C87A5D]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Guia Completo</span>
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F9F6F0] leading-[1.1]">
              Guia de <span className="text-[#C87A5D]">Pelagem Saudável</span>
            </h1>
            <p className="text-lg text-[#F9F6F0]/70 mt-6 max-w-2xl mx-auto">
              Tudo sobre alimentação, óleos naturais, cuidados diarios e a sabedoria da Ayurveda para uma pelagem exuberante.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="sticky top-16 sm:top-20 z-30 bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-[#E0DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {GUIDE_SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}>
                <s.icon className="w-4 h-4" /> {s.title}
              </a>
            ))}
            <a href="#calculadora" onClick={() => setActiveSection('calc')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === 'calc' ? 'bg-[#C87A5D] text-[#F9F6F0]' : 'bg-[#C87A5D]/10 border border-[#C87A5D]/20 text-[#C87A5D] hover:bg-[#C87A5D]/20'}`}>
              <Calculator className="w-4 h-4" /> Calculadora
            </a>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {GUIDE_SECTIONS.map(section => (
          <section key={section.id} id={section.id} className="mb-16 scroll-mt-36">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-2xl flex items-center justify-center">
                <section.icon className="w-6 h-6 text-[#2C4C3B]" />
              </div>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#1A2E24]">{section.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.content.map((item, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-7 hover:shadow-md transition-all">
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-3">{item.subtitle}</h3>
                  <p className="text-sm text-[#4A6B5A] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Dosage Calculator */}
        <section id="calculadora" className="mb-16 scroll-mt-36">
          <div className="bg-[#2C4C3B] rounded-3xl p-8 sm:p-12 relative overflow-hidden" data-testid="dosage-calculator">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#C87A5D]/20 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-[#C87A5D]" />
                </div>
                <div>
                  <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0]">Calculadora de Dosagem</h2>
                  <p className="text-[#F9F6F0]/60 text-sm mt-1">Descubra a quantidade ideal de óleo para seu pet</p>
                </div>
              </div>

              {/* Pet Type */}
              <div className="flex gap-3 mb-8">
                {[{ value: 'cao', label: 'Cão' }, { value: 'gato', label: 'Gato' }].map(t => (
                  <button key={t.value} onClick={() => setPetType(t.value)} data-testid={`pet-type-${t.value}`}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${petType === t.value ? 'bg-[#C87A5D] text-[#F9F6F0]' : 'bg-[#F9F6F0]/10 text-[#F9F6F0]/70 hover:bg-[#F9F6F0]/20'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Weight Slider */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-[#F9F6F0]/70">Peso do animal</label>
                  <span className="font-['Outfit'] text-3xl font-bold text-[#F9F6F0]" data-testid="pet-weight-display">{weight} kg</span>
                </div>
                <Slider min={1} max={petType === 'gato' ? 15 : 80} step={1} value={petWeight} onValueChange={setPetWeight} data-testid="weight-slider" className="mt-2" />
                <div className="flex justify-between text-xs text-[#F9F6F0]/40 mt-2">
                  <span>1 kg</span>
                  <span>{petType === 'gato' ? '15' : '80'} kg</span>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OILS.map((oil, i) => {
                  const dose = Math.max(0.1, Math.round(weight * oil.perKg * factor * 10) / 10);
                  const measure = dose < 5 ? `${dose} ml (~${Math.round(dose / 5 * 100) / 100} colher de chá)` : `${dose} ml (~${Math.round(dose / 15 * 10) / 10} colher de sopa)`;
                  return (
                    <div key={i} data-testid={`dosage-result-${i}`} className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: oil.color }} />
                        <h4 className="font-medium text-[#F9F6F0] text-sm">{oil.name}</h4>
                      </div>
                      <p className="font-['Outfit'] text-2xl font-bold text-[#C87A5D]">{measure}</p>
                      <p className="text-xs text-[#F9F6F0]/50 mt-1">por dia, na ração</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {oil.benefits.map((b, j) => (
                          <span key={j} className="bg-[#F9F6F0]/10 text-[#F9F6F0]/70 text-[10px] px-2 py-0.5 rounded-full">{b}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-[#F9F6F0]/5 border border-[#F9F6F0]/10 rounded-xl">
                <p className="text-xs text-[#F9F6F0]/50 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Valores de referência para orientacao geral. Comece com metade da dose e aumente gradualmente. Consulte sempre um veterinário antes de iniciar qualquer suplementação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#1A2E24] mb-4">Pronto para cuidar da pelagem?</h2>
          <p className="text-[#4A6B5A] mb-8 max-w-lg mx-auto">Confira nossos produtos naturais para pelagem ou assine um plano mensal de tratamento.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/produtos?categoria=saúde-pelos" data-testid="guide-cta-products" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2 justify-center">
              Ver Produtos <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/assinaturas" data-testid="guide-cta-subscriptions" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2 justify-center">
              Assinar Plano Mensal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
