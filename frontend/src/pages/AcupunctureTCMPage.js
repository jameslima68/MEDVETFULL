import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Leaf, Heart, Zap, ShieldCheck, Thermometer, Brain, Stethoscope, ArrowRight, ChevronRight, Droplets, Wind, Flame, Mountain, TreePine } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const IMG_HERO = "https://images.unsplash.com/photo-1584738620467-51b852c2af2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NjV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJ5JTIwYWN1cHVuY3R1cmUlMjBkb2clMjB0cmVhdG1lbnR8ZW58MHx8fHwxNzc2MTI5NDU0fDA&ixlib=rb-4.1.0&q=85";
const IMG_MERIDIAN = "https://images.unsplash.com/photo-1598555763574-dca77e10427e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxhY3VwdW5jdHVyZSUyMG5lZWRsZXMlMjBtZXJpZGlhbiUyMHRyYWRpdGlvbmFsJTIwY2hpbmVzZSUyMG1lZGljaW5lfGVufDB8fHx8MTc3NjE4NjI1NHww&ixlib=rb-4.1.0&q=85";
const IMG_ZEN = "https://images.unsplash.com/photo-1772899778463-876b9e7c8508?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwzfHx5aW4lMjB5YW5nJTIwYmFsYW5jZSUyMHplbiUyMHN0b25lcyUyMGhhcm1vbnklMjBuYXR1cmV8ZW58MHx8fHwxNzc2MTg2MjU0fDA&ixlib=rb-4.1.0&q=85";
const IMG_HERBS = "https://images.unsplash.com/photo-1545840716-c82e9eec6930?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxjaGluZXNlJTIwaGVyYmFsJTIwbWVkaWNpbmUlMjB0cmFkaXRpb25hbHxlbnwwfHx8fDE3NzYxMjk0NTR8MA&ixlib=rb-4.1.0&q=85";

const FIVE_ELEMENTS = [
  { name: 'Madeira', organ: 'Fígado / Vesicula', emotion: 'Raiva / Frustração', season: 'Primavera', color: '#2C4C3B', icon: TreePine, symptoms: 'Rigidez muscular, problemas oculares, irritabilidade', herbs: 'Xiao Yao San, Chai Hu' },
  { name: 'Fogo', organ: 'Coração / Intestino', emotion: 'Alegria excessiva', season: 'Verao', color: '#C87A5D', icon: Flame, symptoms: 'Ansiedade, insonia, agitação, problemas cardíacos', herbs: 'Gui Pi Tang, Suan Zao Ren' },
  { name: 'Terra', organ: 'Baco / Estômago', emotion: 'Preocupacao', season: 'Final do verao', color: '#B8A078', icon: Mountain, symptoms: 'Problemas digestivos, diarreia, fadiga, obesidade', herbs: 'Si Jun Zi Tang, Bu Zhong Yi Qi' },
  { name: 'Metal', organ: 'Pulmão / Intestino Grosso', emotion: 'Tristeza', season: 'Outono', color: '#A4B8C4', icon: Wind, symptoms: 'Tosse, alergias respiratorias, problemas de pele', herbs: 'Yin Qiao San, Bai He Gu Jin' },
  { name: 'Água', organ: 'Rim / Bexiga', emotion: 'Medo', season: 'Inverno', color: '#4A6B7A', icon: Droplets, symptoms: 'Fraqueza lombar, incontinencia, medo excessivo, envelhecimento', herbs: 'Liu Wei Di Huang, Ba Wei Di Huang' },
];

const TECHNIQUES = [
  { name: 'Acupuntura com Agulhas', desc: 'Insercao de agulhas ultrafinas (0,2mm) em pontos especificos dos 14 meridianos principais. Indolor na maioria dos casos — muitos pets relaxam e ate dormem durante a sessao. Sessões de 20-30 minutos.', icon: Target, indication: 'Dor crônica, artrite, displasia, reabilitação' },
  { name: 'Eletroacupuntura', desc: 'Estimulacao eletrica suave aplicada nas agulhas para potencializar o efeito analgesico e anti-inflamatório. Especialmente eficaz para dores severas e condicoes neurológicas como hernia de disco e paralisia.', icon: Zap, indication: 'Hernia de disco, paralisia, dor severa' },
  { name: 'Moxabustao', desc: 'Aplicacao de calor terapêutico com artemisia (moxa) nos pontos de acupuntura. Aquece meridianos, dispersa estagnacao e alivia condicoes agravadas pelo frio. Ideal para pets idosos e condicoes crônicas.', icon: Thermometer, indication: 'Artrite por frio, pets idosos, deficiência de Yang' },
  { name: 'Fitoterapia Chinesa', desc: 'Fórmulas manipuladas com ervas medicinais chinesas adaptadas para uso veterinário. Cada formula e personalizada após diagnóstico energético, considerando excesso/deficiência, calor/frio e a constituição do animal.', icon: Leaf, indication: 'Todas as condicoes — complementa acupuntura' },
  { name: 'Tui Na (Massagem)', desc: 'Massagem terapêutica chinesa que trabalha meridianos e pontos de acupuntura sem agulhas. Tecnicas de pressao, friccao e mobilizacao para aliviar tensao, melhorar circulação e promover relaxamento.', icon: Heart, indication: 'Estresse, tensao muscular, complemento da acupuntura' },
  { name: 'Dietoterapia Chinesa', desc: 'Orientacao alimentar baseada na MTC — cada alimento possui natureza termica (quente, morna, neutra, fresca, fria) e propriedades energéticas. Adequar a dieta ao padrao de desequilíbrio do animal.', icon: Stethoscope, indication: 'Suporte a todos os tratamentos, prevenção' },
];

const CONDITIONS = [
  { area: 'Musculoesqueletico', items: ['Artrite e osteoartrose', 'Displasia de quadril e cotovelo', 'Hernia de disco (DDIV)', 'Lesoes ligamentares e tendinosas', 'Espondillose', 'Rigidez muscular em idosos'] },
  { area: 'Neurologico', items: ['Paralisia e paresia', 'Sequelas de cinomose', 'Sindrome vestibular', 'Convulsoes e epilepsia', 'Neuropatia periferica', 'Dor neuropatica'] },
  { area: 'Emocional e Comportamental', items: ['Ansiedade de separação', 'Medo de fogos e trovoes', 'Depressao em pets idosos', 'Compulsao e automutilacao', 'Agressividade', 'Estresse por mudança de rotina'] },
  { area: 'Gastrointestinal', items: ['Vomitos crônicos', 'Diarreia persistente', 'Inapetencia', 'Doenca inflamatoria intestinal', 'Gastrite', 'Constipacao'] },
  { area: 'Respiratorio e Imunologico', items: ['Asma felina', 'Bronquite crônica', 'Rinite alergica', 'Dermatite atopica', 'Alergias alimentares', 'Imunodeficiência'] },
  { area: 'Geriatrico e Oncologico', items: ['Dor crônica oncologica', 'Suporte quimioterapia', 'Insuficiência renal crônica', 'Problemas hepaticos', 'Melhora de qualidade de vida', 'Longevidade e vitalidade'] },
];

export default function AcupunctureTCMPage() {
  const [activeElement, setActiveElement] = useState(0);

  return (
    <div data-testid="acupuncture-tcm-page" className="min-h-screen bg-[#F9F6F0]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_HERO} alt="Acupuntura veterinária" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A2E24]/90 via-[#1A2E24]/70 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Target className="w-4 h-4 text-[#C87A5D]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Tratamentos Milenares</span>
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F9F6F0] leading-[1.1]">
              Acupuntura & <span className="text-[#C87A5D]">Medicina Chinesa</span> Veterinária
            </h1>
            <p className="text-lg text-[#F9F6F0]/80 mt-6 leading-relaxed max-w-xl">
              Mais de 3.000 anos de sabedoria milenar aplicada com rigor científico para restaurar o equilíbrio e a saúde do seu pet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/consultas" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all text-center">
                Agendar Sessão
              </Link>
              <Link to="/produtos?categoria=acupuntura" className="bg-white/10 backdrop-blur-sm border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-white/20 rounded-full px-8 py-3.5 font-medium transition-all text-center">
                Ver Produtos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro: What is TCVM */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">O que e a MTC Veterinária</span>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24]">
                Uma visao holística da saúde animal
              </h2>
              <div className="space-y-4 text-[#4A6B5A] leading-relaxed">
                <p>
                  A <strong className="text-[#1A2E24]">Medicina Tradicional Chinesa Veterinária (MTCV)</strong> enxerga o animal como um todo integrado — corpo, mente e espírito conectados por uma rede de <strong className="text-[#1A2E24]">meridianos</strong> por onde flui o <strong className="text-[#C87A5D]">Qi</strong> (energia vital).
                </p>
                <p>
                  Quando esse fluxo e interrompido ou desequilibrado, surgem os sintomas e as doenças. A MTCV nao trata apenas o sintoma — busca a <strong className="text-[#1A2E24]">raiz do desequilíbrio</strong>, restaurando a harmonia entre <strong className="text-[#1A2E24]">Yin e Yang</strong> e os Cinco Elementos que governam todos os orgaos e funcoes do corpo.
                </p>
                <p>
                  Com mais de 3.000 anos de prática documentada e reconhecida pela OMS, a MTC veterinária integra <strong className="text-[#1A2E24]">acupuntura, fitoterapia, dietoterapia, moxabustao e Tui Na</strong> (massagem) em protocolos personalizados para cada animal.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden h-[280px]">
                <img src={IMG_ZEN} alt="Equilibrio" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden h-[280px] mt-8">
                <img src={IMG_MERIDIAN} alt="Acupuntura" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Elements */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]" data-testid="five-elements">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Teoria dos Cinco Elementos</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mt-3">Wu Xing: a base do diagnóstico</h2>
            <p className="text-[#F9F6F0]/60 mt-4 max-w-2xl mx-auto">Cada animal possui uma constituição energética que se relaciona com os Cinco Elementos. Entender essa relacao e a chave para o tratamento personalizado.</p>
          </div>
          {/* Element Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {FIVE_ELEMENTS.map((el, i) => (
              <button key={i} onClick={() => setActiveElement(i)} data-testid={`element-${el.name.toLowerCase()}`}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${activeElement === i ? 'bg-[#F9F6F0] text-[#1A2E24] shadow-lg' : 'bg-[#F9F6F0]/10 text-[#F9F6F0]/70 hover:bg-[#F9F6F0]/20'}`}>
                <el.icon className="w-4 h-4" /> {el.name}
              </button>
            ))}
          </div>
          {/* Active Element Detail */}
          <div className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-3xl p-8 sm:p-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: FIVE_ELEMENTS[activeElement].color + '33' }}>
                {(() => { const Icon = FIVE_ELEMENTS[activeElement].icon; return <Icon className="w-7 h-7" style={{ color: FIVE_ELEMENTS[activeElement].color === '#2C4C3B' ? '#84978F' : FIVE_ELEMENTS[activeElement].color }} />; })()}
              </div>
              <div>
                <h3 className="font-['Outfit'] text-2xl font-semibold text-[#F9F6F0]">Elemento {FIVE_ELEMENTS[activeElement].name}</h3>
                <p className="text-[#F9F6F0]/60 text-sm">Estação: {FIVE_ELEMENTS[activeElement].season}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div><p className="text-xs text-[#F9F6F0]/40 font-bold uppercase tracking-wider">Órgãos Associados</p><p className="text-[#F9F6F0] font-medium mt-1">{FIVE_ELEMENTS[activeElement].organ}</p></div>
                <div><p className="text-xs text-[#F9F6F0]/40 font-bold uppercase tracking-wider">Emoção</p><p className="text-[#F9F6F0] font-medium mt-1">{FIVE_ELEMENTS[activeElement].emotion}</p></div>
              </div>
              <div className="space-y-3">
                <div><p className="text-xs text-[#F9F6F0]/40 font-bold uppercase tracking-wider">Sintomas de Desequilíbrio</p><p className="text-[#F9F6F0]/80 text-sm mt-1">{FIVE_ELEMENTS[activeElement].symptoms}</p></div>
                <div><p className="text-xs text-[#F9F6F0]/40 font-bold uppercase tracking-wider">Fórmulas Indicadas</p><p className="text-[#C87A5D] font-medium text-sm mt-1">{FIVE_ELEMENTS[activeElement].herbs}</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Techniques */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Tecnicas Terapeuticas</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">As ferramentas da MTC veterinária</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECHNIQUES.map((tech, i) => (
              <div key={i} data-testid={`technique-${i}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-7 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-2xl flex items-center justify-center mb-4">
                  <tech.icon className="w-6 h-6 text-[#2C4C3B]" />
                </div>
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-2">{tech.name}</h3>
                <p className="text-sm text-[#4A6B5A] leading-relaxed mb-4">{tech.desc}</p>
                <div className="bg-[#2C4C3B]/5 rounded-xl px-3 py-2">
                  <p className="text-xs text-[#84978F]"><strong className="text-[#2C4C3B]">Indicacao:</strong> {tech.indication}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions Treated */}
      <section className="py-20 sm:py-28 bg-[#EAE7E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Condicoes Tratadas</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">O que podemos tratar</h2>
            <p className="text-[#4A6B5A] mt-4 max-w-2xl mx-auto">A acupuntura e a medicina chinesa veterinária sao eficazes em uma ampla gama de condicoes, atuando como tratamento principal ou complementar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONDITIONS.map((cond, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-7">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#2C4C3B] mb-4">{cond.area}</h3>
                <ul className="space-y-2">
                  {cond.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#4A6B5A]">
                      <div className="w-1.5 h-1.5 bg-[#C87A5D] rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herbal Medicine */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-3xl overflow-hidden h-[400px] shadow-lg">
              <img src={IMG_HERBS} alt="Fitoterapia chinesa" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Fitoterapia Chinesa</span>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24]">
                Fórmulas milenares adaptadas para seu pet
              </h2>
              <div className="space-y-4 text-[#4A6B5A] leading-relaxed">
                <p>A fitoterapia chinesa utiliza <strong className="text-[#1A2E24]">fórmulas com combinacoes sinergicas de ervas</strong>, onde cada ingrediente tem um papel especifico — desde o ingrediente "imperador" (acao principal) ate os "assistentes" que potencializam e harmonizam a formula.</p>
                <p>Na MEDVET, todas as fórmulas sao <strong className="text-[#1A2E24]">manipuladas sob medida</strong> após diagnóstico energético completo, adaptando dosagens ao peso, especie e padrao de desequilíbrio do animal.</p>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {[
                  { title: 'Huang Qi (Astragalus)', desc: 'Tonificante imunológico poderoso. Fortalece o Qi do Baco e Pulmão, aumenta resistencia a infeccoes e melhora energia vital.' },
                  { title: 'Gui Zhi (Canela)', desc: 'Aquece meridianos e alivia dor muscular. Harmoniza Ying e Wei Qi, melhora circulação periferica.' },
                  { title: 'Ren Shen (Ginseng)', desc: 'Tonifica o Qi primordial. Fortalece orgaos debilitados, combate fadiga crônica e suporta recuperação pos-doença.' },
                  { title: 'Dan Shen (Salvia)', desc: 'Move o Sangue e dissolve estase. Eficaz para dores fixas, tumores e problemas circulatorios.' },
                ].map((herb, i) => (
                  <AccordionItem key={i} value={`herb-${i}`} className="bg-white/60 border border-[#E0DDD5] rounded-2xl px-5 overflow-hidden">
                    <AccordionTrigger className="text-left font-['Outfit'] text-[#1A2E24] font-medium hover:no-underline py-4 text-sm">{herb.title}</AccordionTrigger>
                    <AccordionContent className="text-[#4A6B5A] text-sm pb-4">{herb.desc}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Link to="/produtos?categoria=medicina-chinesa" className="inline-flex items-center gap-2 text-sm font-medium text-[#2C4C3B] hover:text-[#1A2E24] transition-colors">
                Ver fórmulas manipuladas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How a Session Works */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Como Funciona</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mt-3">Uma sessao passo a passo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Diagnostico', desc: 'Avaliação completa: observacao da lingua, palpacao de pulso, analise dos 8 princípios diagnósticos da MTC e história clinica detalhada.' },
              { step: '02', title: 'Plano Terapeutico', desc: 'Definicao do padrao de desequilíbrio (excesso/deficiência, calor/frio) e selecao dos pontos de acupuntura e fórmulas herbais.' },
              { step: '03', title: 'Aplicacao', desc: 'Insercao suave das agulhas nos pontos selecionados. Sessão de 20-30 min — a maioria dos pets relaxa profundamente.' },
              { step: '04', title: 'Acompanhamento', desc: 'Reavaliação a cada sessao. Protocolos de 3-10 sessões conforme a condicao. Resultados progressivos e duradouros.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-3xl p-7 text-center">
                <div className="w-14 h-14 bg-[#C87A5D]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="font-['Outfit'] text-xl font-bold text-[#C87A5D]">{item.step}</span>
                </div>
                <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0] mb-2">{item.title}</h3>
                <p className="text-sm text-[#F9F6F0]/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Perguntas Frequentes</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">Dúvidas sobre acupuntura e MTC</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'A acupuntura doi? Meu pet vai sofrer?', a: 'Nao! As agulhas sao ultrafinas (0,2mm) e a maioria dos animais nao demonstra desconforto. Muitos relaxam tanto que dormem durante a sessao. O veterinário usa tecnicas de contencao gentil e respeita o limite de cada animal.' },
              { q: 'Quantas sessões sao necessarias?', a: 'Depende da condicao. Quadros agudos podem melhorar em 1-3 sessões. Cronicos geralmente necessitam de 5-10 sessões semanais ou quinzenais, seguidas de manutencao mensal. Resultados visiveis costumam aparecer entre a 3a e 5a sessao.' },
              { q: 'Pode ser feito junto com medicamentos convencionais?', a: 'Sim! A MTC veterinária e complementar a medicina convencional. Na verdade, a integração das duas abordagens costuma trazer os melhores resultados, podendo inclusive reduzir a necessidade de medicamentos ao longo do tempo.' },
              { q: 'Gatos tambem podem fazer acupuntura?', a: 'Sim! A acupuntura e segura e eficaz para gatos. E especialmente indicada para asma felina, dores crônicas, ansiedade e problemas renais. Os gatos costumam responder muito bem, com sessões mais curtas (15-20 minutos).' },
              { q: 'As fórmulas chinesas sao seguras?', a: 'Quando prescritas por veterinário qualificado em MTC e manipuladas em farmacias especializadas, sim. Cada formula e personalizada para o animal, considerando peso, especie e condicao. Efeitos colaterais sao raros e geralmente leves.' },
              { q: 'A partir de que idade o pet pode fazer acupuntura?', a: 'Nao ha restricao de idade. Filhotes, adultos e idosos podem se beneficiar. Para filhotes, sessões sao mais curtas. Para idosos, a acupuntura é especialmente valiosa para qualidade de vida e manejo de dor.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl px-6 overflow-hidden">
                <AccordionTrigger className="text-left font-['Outfit'] text-[#1A2E24] font-medium hover:no-underline py-5">{item.q}</AccordionTrigger>
                <AccordionContent className="text-[#4A6B5A] pb-5 leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target className="w-10 h-10 text-[#C87A5D] mx-auto mb-6" />
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mb-4">
            Agende uma avaliação com nossos especialistas
          </h2>
          <p className="text-[#F9F6F0]/70 mb-8 max-w-lg mx-auto">
            Nossos veterinários sao formados em Medicina Tradicional Chinesa e prontos para criar um protocolo personalizado para seu pet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultas" data-testid="tcm-cta-consultation" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2 justify-center">
              Agendar Consulta <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/produtos?categoria=acupuntura" className="bg-transparent border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all">
              Sessões de Acupuntura
            </Link>
            <Link to="/produtos?categoria=medicina-chinesa" className="bg-transparent border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all">
              Fórmulas Chinesas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
