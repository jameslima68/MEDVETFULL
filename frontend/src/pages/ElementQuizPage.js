import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, TreePine, Flame, Mountain, Wind, Droplets, RotateCw } from 'lucide-react';

const QUESTIONS = [
  { q: 'Como e o temperamento do seu pet no dia a dia?', options: [
    { text: 'Energico, impaciente, gosta de correr e explorar', element: 0 },
    { text: 'Alegre, sociável, adora atenção e brincadeiras', element: 1 },
    { text: 'Calmo, carinhoso, gosta de rotina e conforto', element: 2 },
    { text: 'Independente, reservado, sensível a mudanças', element: 3 },
    { text: 'Cauteloso, tímido, assusta facilmente', element: 4 },
  ]},
  { q: 'Como seu pet reage ao estresse?', options: [
    { text: 'Fica irritado, late/mia, pode ficar agressivo', element: 0 },
    { text: 'Fica ansioso, agitado, nao para quieto', element: 1 },
    { text: 'Come demais ou perde o apetite', element: 2 },
    { text: 'Se isola, fica triste, perde interesse', element: 3 },
    { text: 'Treme, se esconde, fica paralisado de medo', element: 4 },
  ]},
  { q: 'Qual o principal problema de saúde do seu pet?', options: [
    { text: 'Rigidez muscular, problemas nos olhos ou unhas', element: 0 },
    { text: 'Problemas cardíacos, agitação, insonia', element: 1 },
    { text: 'Digestao ruim, diarreia ou vômitos', element: 2 },
    { text: 'Problemas respiratórios, pele seca, alergias', element: 3 },
    { text: 'Problemas urinários, fraqueza nas patas traseiras', element: 4 },
  ]},
  { q: 'Em que estacao do ano seu pet fica mais indisposto?', options: [
    { text: 'Primavera — fica mais irritável', element: 0 },
    { text: 'Verao — fica muito agitado com o calor', element: 1 },
    { text: 'Final do verao/inicio do outono — digestao piora', element: 2 },
    { text: 'Outono — problemas respiratórios e pele', element: 3 },
    { text: 'Inverno — fica mais lento e medroso', element: 4 },
  ]},
  { q: 'Qual a preferência de temperatura do seu pet?', options: [
    { text: 'Gosta de vento e brisa, prefere ambientes ventilados', element: 0 },
    { text: 'Adora calor, busca sol e lugares quentes', element: 1 },
    { text: 'Prefere ambiente estavel, nem quente nem frio', element: 2 },
    { text: 'Gosta de ar seco e fresco', element: 3 },
    { text: 'Detesta frio, busca calor e aconchego', element: 4 },
  ]},
  { q: 'Como e o apetite do seu pet?', options: [
    { text: 'Come rápido, competitivo com comida', element: 0 },
    { text: 'Apetite variável, come mais quando esta animado', element: 1 },
    { text: 'Adora comer, tendencia a obesidade', element: 2 },
    { text: 'Apetite pequeno, seletivo com comida', element: 3 },
    { text: 'Bebe muita agua, apetite moderado', element: 4 },
  ]},
];

const ELEMENTS = [
  { name: 'Madeira', icon: TreePine, color: '#2C4C3B', organ: 'Fígado / Vesícula Biliar', emotion: 'Raiva / Frustração', season: 'Primavera',
    profile: 'Seu pet tem personalidade forte, é energético e determinado. Quando em equilíbrio, é corajoso e confiante. Em desequilíbrio, pode ficar irritável, rigido e impaciente.',
    care: 'Precisa de exercicio regular para liberar energia. Evite restricao excessiva. A acupuntura nos pontos do meridiano do Fígado (F3, F8) ajuda a suavizar a rigidez. Fórmulas como Xiao Yao San harmonizam o Qi do Fígado.',
    foods: 'Alimentos verdes e frescos: brocolis, espinafre, abobrinha. Evite excesso de gordura e frituras.',
    herbs: 'Xiao Yao San, Chai Hu, Bai Shao' },
  { name: 'Fogo', icon: Flame, color: '#C87A5D', organ: 'Coração / Intestino Delgado', emotion: 'Alegria excessiva / Ansiedade', season: 'Verao',
    profile: 'Seu pet é sociável, alegre e adora atenção. Quando em equilíbrio, é afetuoso e caloroso. Em desequilíbrio, fica ansioso, agitado e pode ter problemas cardíacos.',
    care: 'Precisa de rotina tranquila e momentos de calma. Cromoterapia com azul ajuda. Acupuntura no meridiano do Coração (C7) acalma o Shen (espírito). Florais de Bach como Rock Rose.',
    foods: 'Alimentos amargos e refrescantes: rucula, cha verde, melancia. Evite estimulantes.',
    herbs: 'Gui Pi Tang, Suan Zao Ren Tang, An Shen Ding Zhi' },
  { name: 'Terra', icon: Mountain, color: '#B8A078', organ: 'Baço (Pâncreas) / Estômago', emotion: 'Preocupação / Pensamento excessivo', season: 'Final do Verao',
    profile: 'Seu pet é doce, carinhoso e adora rotina. Quando em equilíbrio, é estável e acolhedor. Em desequilíbrio, fica preocupado, come demais e tem problemas digestivos.',
    care: 'Alimentação regular em horários fixos é essencial. Massagem abdominal suave ajuda. Acupuntura no Baco (BP6, E36) fortalece a digestao. Moxabustao aquece e tonifica.',
    foods: 'Alimentos amarelos e doces naturais: abóbora, batata-doce, cenoura cozida. Evite alimentos crus em excesso.',
    herbs: 'Si Jun Zi Tang, Bu Zhong Yi Qi Tang, Shen Ling Bai Zhu' },
  { name: 'Metal', icon: Wind, color: '#A4B8C4', organ: 'Pulmão / Intestino Grosso', emotion: 'Tristeza / Melancolia', season: 'Outono',
    profile: 'Seu pet é sensível, refinado e independente. Quando em equilíbrio, é organizado e sereno. Em desequilíbrio, fica triste, isolado e desenvolve problemas de pele e respiratórios.',
    care: 'Precisa de ambiente limpo e ar puro. Aromaterapia com eucalipto ajuda. Acupuntura no Pulmão (P7, P9) fortalece Wei Qi (imunidade). CBD pode ajudar na ansiedade.',
    foods: 'Alimentos brancos e picantes suaves: arroz, pera, gengibre, alho cozido. Evite laticínios em excesso.',
    herbs: 'Yin Qiao San, Bai He Gu Jin Tang, Yu Ping Feng' },
  { name: 'Água', icon: Droplets, color: '#4A6B7A', organ: 'Rim / Bexiga', emotion: 'Medo / Insegurança', season: 'Inverno',
    profile: 'Seu pet é cauteloso, introvertido e muito inteligente. Quando em equilíbrio, é sábio e adaptável. Em desequilíbrio, fica medroso, inseguro e pode ter problemas renais e ósseos.',
    care: 'Ambiente seguro e previsivel é fundamental. Evite sustos e exposição a frio intenso. Acupuntura nos Rins (R3, R7) fortalece a essencia vital. Moxabustao aquece Yang do Rim.',
    foods: 'Alimentos pretos e salgados moderados: feijao preto, sardinha, gergelim preto. Evite alimentos gelados.',
    herbs: 'Liu Wei Di Huang Wan, Ba Wei Di Huang, Jin Gui Shen Qi' },
];

export default function ElementQuizPage() {
  const [step, setStep] = useState(0); // 0=intro, 1-6=questions, 7=result
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const handleAnswer = (elementIdx) => {
    const newAnswers = [...answers, elementIdx];
    setAnswers(newAnswers);
    if (newAnswers.length >= QUESTIONS.length) {
      // Calculate result
      const counts = [0, 0, 0, 0, 0];
      newAnswers.forEach(a => counts[a]++);
      const maxIdx = counts.indexOf(Math.max(...counts));
      setResult(ELEMENTS[maxIdx]);
      setStep(QUESTIONS.length + 1);
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => { setStep(0); setAnswers([]); setResult(null); };
  const qIdx = step - 1;

  return (
    <div data-testid="quiz-page" className="min-h-screen bg-[#F9F6F0]">
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Quiz Interativo</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Descubra o Elemento do seu Pet</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Responda 6 perguntas e descubra qual dos Cinco Elementos da Medicina Chinesa rege a constituição do seu pet.</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        {step === 0 && (
          <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8 sm:p-10 text-center" data-testid="quiz-intro">
            <div className="flex justify-center gap-3 mb-6">
              {ELEMENTS.map((el, i) => <el.icon key={i} className="w-8 h-8" style={{ color: el.color }} />)}
            </div>
            <h2 className="font-['Outfit'] text-2xl font-medium text-[#1A2E24] mb-4">Madeira, Fogo, Terra, Metal ou Água?</h2>
            <p className="text-[#4A6B5A] mb-8 leading-relaxed">Na Medicina Tradicional Chinesa, cada ser vivo é influenciado por um dos Cinco Elementos (Wu Xing). Descobrir o elemento predominante do seu pet ajuda a entender seu temperamento, pontos fracos e os melhores tratamentos.</p>
            <button onClick={() => setStep(1)} data-testid="start-quiz" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-10 py-3.5 font-medium transition-all inline-flex items-center gap-2">
              Começar Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Questions */}
        {step >= 1 && step <= QUESTIONS.length && (
          <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8 sm:p-10" data-testid={`quiz-question-${qIdx}`}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-[#84978F]">Pergunta {step} de {QUESTIONS.length}</span>
              <div className="flex gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < step ? 'bg-[#2C4C3B]' : i === qIdx ? 'bg-[#C87A5D]' : 'bg-[#E0DDD5]'}`} />
                ))}
              </div>
            </div>
            <h2 className="font-['Outfit'] text-xl sm:text-2xl font-medium text-[#1A2E24] mb-6">{QUESTIONS[qIdx].q}</h2>
            <div className="space-y-3">
              {QUESTIONS[qIdx].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt.element)} data-testid={`quiz-option-${i}`}
                  className="w-full text-left bg-white/50 border border-[#E0DDD5] hover:border-[#2C4C3B] hover:bg-[#2C4C3B]/5 rounded-2xl px-5 py-4 text-sm text-[#4A6B5A] hover:text-[#1A2E24] transition-all">
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && step > QUESTIONS.length && (
          <div data-testid="quiz-result">
            <div className="rounded-3xl overflow-hidden mb-8" style={{ backgroundColor: result.color }}>
              <div className="p-10 sm:p-14 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <result.icon className="w-16 h-16 text-white/80 mx-auto mb-4" />
                  <p className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">O elemento do seu pet é</p>
                  <h2 className="font-['Outfit'] text-4xl sm:text-5xl font-bold text-white mt-2">{result.name}</h2>
                  <p className="text-white/70 mt-4 max-w-md mx-auto">{result.profile}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Órgãos Associados', content: result.organ },
                { title: 'Emoção Dominante', content: result.emotion },
                { title: 'Estação Sensível', content: result.season },
                { title: 'Cuidados Recomendados', content: result.care },
                { title: 'Alimentação Ideal', content: result.foods },
                { title: 'Fórmulas Chinesas Indicadas', content: result.herbs },
              ].map((item, i) => (
                <div key={i} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                  <h3 className="font-['Outfit'] text-sm font-bold text-[#84978F] uppercase tracking-wider mb-2">{item.title}</h3>
                  <p className="text-[#1A2E24] leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <button onClick={restart} data-testid="restart-quiz" className="flex items-center justify-center gap-2 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5 rounded-full px-6 py-3 font-medium transition-all">
                <RotateCw className="w-4 h-4" /> Refazer Quiz
              </button>
              <Link to="/consultas" className="flex items-center justify-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3 font-medium transition-all">
                Agendar Consulta <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/acupuntura-mtc" className="flex items-center justify-center gap-2 bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3 font-medium transition-all">
                Acupuntura & MTC <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
