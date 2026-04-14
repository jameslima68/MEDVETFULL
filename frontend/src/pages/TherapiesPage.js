import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Leaf, Heart, Zap, Droplets, Sparkles, Sun, Music, Brain, Stethoscope, ShieldCheck, Flame, Wind, Waves, Gem, TreePine, Syringe, Activity, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'milenar', label: 'Medicinas Milenares' },
  { id: 'manual', label: 'Terapias Manuais' },
  { id: 'natural', label: 'Naturais & Energeticas' },
  { id: 'bio', label: 'Biologicas' },
  { id: 'avancada', label: 'Avancadas' },
  { id: 'suporte', label: 'Suporte' },
];

const THERAPIES = [
  // Medicinas Milenares
  { name: 'Acupuntura', cat: 'milenar', icon: Target, color: '#2C4C3B', desc: 'Tecnica da MTC que insere agulhas ultrafinas em pontos especificos dos 14 meridianos para equilibrar o Qi (energia vital). Libera endorfinas, melhora circulacao e modula o sistema nervoso.', indications: ['Dor cronica e artrite', 'Displasia de quadril', 'Hernia de disco', 'Reabilitacao neurologica'], link: '/acupuntura-mtc', exists: true },
  { name: 'Fitoterapia Chinesa', cat: 'milenar', icon: Leaf, color: '#84978F', desc: 'Formulas manipuladas com combinacoes sinergicas de ervas medicinais chinesas. Cada ingrediente tem papel especifico — do "imperador" (acao principal) aos "assistentes" que harmonizam.', indications: ['Imunidade baixa', 'Problemas hepaticos e renais', 'Ansiedade e estresse', 'Digestao e gastrite'], link: '/produtos?categoria=medicina-chinesa', exists: true },
  { name: 'Homeopatia', cat: 'milenar', icon: Droplets, color: '#A4B8C4', desc: '"Semelhante cura semelhante" — medicamentos altamente diluidos estimulam a autocura do organismo. Tratamento suave, sem efeitos colaterais, personalizado para cada animal.', indications: ['Alergias e dermatites', 'Problemas digestivos', 'Traumas e contusoes', 'Infeccoes recorrentes'], link: '/produtos?categoria=homeopatia', exists: true },
  { name: 'Terapia Canabica (CBD)', cat: 'milenar', icon: Leaf, color: '#6B8077', desc: 'Canabidiol (CBD) com resultados promissores em dor cronica, ansiedade e convulsoes. Atua no sistema endocanabinoide presente em todos os mamiferos. Regulamentado pela ANVISA.', indications: ['Epilepsia refrataria', 'Dor cronica oncologica', 'Ansiedade severa', 'Inflamacao articular'], link: '/produtos?categoria=cbd', exists: true },
  { name: 'Hormonios Bioidenticos', cat: 'milenar', icon: Activity, color: '#C87A5D', desc: 'Reposicao hormonal com moleculas identicas as produzidas naturalmente. Restaura equilibrio hormonal em animais com deficiencias endocrinas, melhorando vitalidade e qualidade de vida.', indications: ['Desequilibrio hormonal', 'Hipotireoidismo', 'Menopausa/andropausa animal', 'Alopecia hormonal'], link: '/produtos?categoria=hormonios', exists: true },
  { name: 'Terapia Neural', cat: 'milenar', icon: Zap, color: '#4A6B7A', desc: 'Injecao de anestesico local em pontos especificos para "reiniciar" o sistema nervoso autonomo. Trata campos interferentes que mantem padroes de dor e inflamacao cronica.', indications: ['Dor cronica refrataria', 'Cicatrizes interferentes', 'Inflamacao persistente', 'Disturbios autonomicos'] },
  // Terapias Manuais
  { name: 'Fisioterapia e Reabilitacao', cat: 'manual', icon: Activity, color: '#2C4C3B', desc: 'Cinesioterapia (exercicios terapeuticos) e eletroterapia para recuperar mobilidade. Protocolos personalizados para cada fase da reabilitacao, do pos-cirurgico ao geriatrico.', indications: ['Pos-operatorio ortopedico', 'Atrofia muscular', 'Perda de mobilidade', 'Fortalecimento idosos'] },
  { name: 'Quiropraxia Veterinaria', cat: 'manual', icon: ShieldCheck, color: '#84978F', desc: 'Ajustes manuais especificos na coluna e articulacoes para restaurar o alinhamento e a funcao do sistema nervoso. Melhora a comunicacao neural e reduz compensacoes posturais.', indications: ['Dor cervical e lombar', 'Subluxacoes vertebrais', 'Claudicacao', 'Problemas posturais'] },
  { name: 'Massoterapia e Liberacao Miofascial', cat: 'manual', icon: Heart, color: '#C87A5D', desc: 'Tecnicas manuais que liberam tensoes musculares profundas, melhoram flexibilidade e promovem relaxamento. A liberacao miofascial atua nas fascias que envolvem musculos e orgaos.', indications: ['Tensao muscular cronica', 'Pontos-gatilho miofasciais', 'Estresse e rigidez', 'Complemento a acupuntura'] },
  { name: 'Osteopatia Veterinaria', cat: 'manual', icon: ShieldCheck, color: '#A4B8C4', desc: 'Manipulacao suave de articulacoes e tecidos moles para restaurar o equilibrio estrutural. Foca na relacao entre estrutura e funcao — quando a estrutura se alinha, o corpo se cura.', indications: ['Desequilibrio postural', 'Restricoes articulares', 'Compensacoes mecanicas', 'Disfuncoes viscerais'] },
  { name: 'Hidroterapia', cat: 'manual', icon: Waves, color: '#4A6B7A', desc: 'Reabilitacao em esteira aquatica ou piscina terapeutica. A flutuabilidade reduz impacto em 60%, permitindo exercicio seguro. A resistencia da agua fortalece musculatura.', indications: ['Displasia com baixa mobilidade', 'Obesidade', 'Pos-cirurgico de ligamento', 'Artrite severa'] },
  // Naturais & Energeticas
  { name: 'Florais de Bach', cat: 'natural', icon: Sparkles, color: '#84978F', desc: '38 essencias florais criadas por Dr. Edward Bach para tratar desequilibrios emocionais. Cada floral age em uma emocao especifica: Rescue Remedy para emergencias, Mimulus para medos conhecidos.', indications: ['Ansiedade de separacao', 'Medo de fogos e trovoes', 'Agressividade por medo', 'Luto e depressao'] },
  { name: 'Reiki Animal', cat: 'natural', icon: Sun, color: '#C87A5D', desc: 'Terapia energetica japonesa que canaliza energia universal pelas maos do terapeuta. Equilibra os centros energeticos (chakras) do animal, promovendo relaxamento profundo e autocura.', indications: ['Estresse e trauma', 'Complemento pos-cirurgico', 'Animais em hospice', 'Equilibrio emocional'] },
  { name: 'Cromoterapia', cat: 'natural', icon: Sparkles, color: '#6B8077', desc: 'Terapia das cores reconhecida pela OMS. Cada cor possui vibracao que atua no corpo: azul (calmante), verde (equilibrio), vermelho (energia), amarelo (cicatrizacao).', indications: ['Ansiedade e insonia', 'Inflamacoes', 'Imunidade baixa', 'Depressao'], link: '/produtos?categoria=cromoterapia', exists: true },
  { name: 'Musicoterapia', cat: 'natural', icon: Music, color: '#A4B8C4', desc: 'Sons e frequencias especificas para reduzir estresse e ansiedade. Frequencias de 432Hz e 528Hz promovem relaxamento. Musica classica e sons da natureza demonstram reducao de cortisol em pets.', indications: ['Medo de fogos de artificio', 'Ansiedade em canil/clinica', 'Insonia', 'Estresse de viagem'] },
  { name: 'Nutricao Funcional', cat: 'natural', icon: Leaf, color: '#2C4C3B', desc: 'Alimentacao natural personalizada baseada na bioquimica individual. Cada alimento e visto como ferramenta terapeutica — proteinas de qualidade, gorduras boas, fitoquimicos e prebioticos.', indications: ['Alergias alimentares', 'Obesidade', 'Problemas de pelagem', 'Prevencao de doencas'], link: '/guia-pelagem', exists: true },
  // Biologicas
  { name: 'Ozonioterapia', cat: 'bio', icon: Wind, color: '#2C4C3B', desc: 'Mistura de oxigenio e ozonio (O3) com potentes propriedades anti-inflamatorias, antisepticas e imunomoduladoras. Aplicacao via retal, topica, subcutanea ou auto-hemoterapia.', indications: ['Feridas infectadas', 'Otites cronicas', 'Dermatites fungicas', 'Doenca periodontal'] },
  { name: 'Apiterapia', cat: 'bio', icon: Gem, color: '#C87A5D', desc: 'Produtos de abelhas (mel, propolis, geleia real, apitoxina) para fins terapeuticos. Propolis e poderoso antibacteriano natural. Mel de Manuka para cicatrizacao de feridas.', indications: ['Cicatrizacao de feridas', 'Fortalecimento imunologico', 'Infeccoes bacterianas', 'Inflamacoes cronicas'] },
  { name: 'Geoterapia (Argiloterapia)', cat: 'bio', icon: TreePine, color: '#84978F', desc: 'Argilas medicinais (verde, branca, vermelha) com propriedades minerais, absorventes e anti-inflamatorias. Aplicacao em cataplasmas para desintoxicar, drenar edemas e tratar pele.', indications: ['Dermatites e eczemas', 'Edemas e inchacos', 'Feridas superficiais', 'Desintoxicacao'] },
  { name: 'Viscum Album (Antroposofia)', cat: 'bio', icon: Leaf, color: '#A4B8C4', desc: 'Terapia derivada do visco europeu, pilar da medicina antroposofica integrativa. Utilizada como complemento oncologico para melhorar resposta imunologica, reduzir efeitos da quimio e qualidade de vida.', indications: ['Suporte oncologico', 'Estimulo imunologico', 'Qualidade de vida em cancer', 'Reducao efeitos quimio'] },
  { name: 'Biorressonancia', cat: 'bio', icon: Zap, color: '#4A6B7A', desc: 'Identifica e trata desequilibrios energeticos celulares por frequencias eletromagneticas. Equipamento capta sinais do corpo e emite frequencias corretivas para restaurar a homeostase.', indications: ['Alergias e intolerancias', 'Desequilibrios energeticos', 'Deteccao precoce', 'Suporte geral'] },
  // Avancadas
  { name: 'Laserterapia', cat: 'avancada', icon: Zap, color: '#C87A5D', desc: 'Laser de baixa intensidade (LLLT) que penetra os tecidos e estimula producao de ATP celular. Acelera cicatrizacao, reduz inflamacao e alivia dor sem efeitos colaterais.', indications: ['Cicatrizacao de feridas', 'Inflamacao articular', 'Pontos de acupuntura', 'Edemas pos-cirurgicos'] },
  { name: 'Magnetoterapia', cat: 'avancada', icon: Activity, color: '#2C4C3B', desc: 'Campos magneticos pulsados que aumentam oxigenacao celular, estimulam regeneracao ossea e reduzem inflamacao. Tratamento indolor e nao invasivo com sessoes de 20-30 minutos.', indications: ['Fraturas (consolidacao ossea)', 'Artrose', 'Edema cronico', 'Dor neuropatica'] },
  { name: 'Celulas-Tronco', cat: 'avancada', icon: Syringe, color: '#84978F', desc: 'Celulas-tronco mesenquimais extraidas do tecido adiposo do proprio animal e reinjetadas para regenerar tecidos danificados. Tratamento de ponta com resultados promissores.', indications: ['Articulacoes desgastadas', 'Hernia de disco cronica', 'Doenca renal cronica', 'Tendoes e ligamentos'] },
  { name: 'PRP (Plasma Rico em Plaquetas)', cat: 'avancada', icon: Droplets, color: '#A4B8C4', desc: 'Concentrado de plaquetas do sangue do animal contendo fatores de crescimento. Injetado no local da lesao para acelerar a cicatrizacao natural de tendoes, ligamentos e feridas complexas.', indications: ['Lesoes tendineanas', 'Feridas de dificil cicatrizacao', 'Osteoartrite', 'Pos-cirurgico articular'] },
  // Suporte
  { name: 'Constelacao Familiar para Pets', cat: 'suporte', icon: Heart, color: '#C87A5D', desc: 'Abordagem sistemica que investiga se problemas de saude ou comportamento do animal estao ligados a dinamicas emocionais do sistema familiar do tutor. Pets espelham estados emocionais.', indications: ['Doencas sem causa aparente', 'Comportamento repetitivo', 'Vinculo tutor-pet', 'Mudancas familiares'] },
  { name: 'Termalismo (Crenoterapia)', cat: 'suporte', icon: Flame, color: '#84978F', desc: 'Aguas termais e banhos terapeuticos com propriedades minerais para aliviar dores articulares, condicoes de pele e doencas cronicas. Temperatura e minerais agem sinergicamente.', indications: ['Dores articulares cronicas', 'Dermatites cronicas', 'Rigidez muscular', 'Estresse'] },
  { name: 'Eletroacupuntura', cat: 'milenar', icon: Zap, color: '#4A6B7A', desc: 'Estimulacao eletrica aplicada nas agulhas de acupuntura para potencializar efeito analgesico. Correntes de baixa frequencia para dor cronica, alta frequencia para dor aguda.', indications: ['Paralisia e paresia', 'Dor severa pos-cirurgica', 'Incontinencia urinaria', 'Hernia de disco'], link: '/acupuntura-mtc', exists: true },
  { name: 'Moxabustao', cat: 'milenar', icon: Flame, color: '#C87A5D', desc: 'Calor terapeutico com artemisia (moxa) aplicado em pontos de acupuntura. Aquece meridianos, expulsa frio e umidade, tonifica Yang. Essencial em condicoes agravadas pelo frio.', indications: ['Artrite por frio/umidade', 'Diarreia cronica', 'Pets idosos debilitados', 'Deficiencia de Yang'], link: '/acupuntura-mtc', exists: true },
];

export default function TherapiesPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? THERAPIES : THERAPIES.filter(t => t.cat === filter);

  return (
    <div data-testid="therapies-page" className="min-h-screen bg-[#F9F6F0]">
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Catalogo Completo</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Terapias Integrativas</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">Mais de 25 terapias naturais e integrativas para a saude completa do seu pet. Da acupuntura milenar as terapias regenerativas avancadas.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} data-testid={`filter-${c.id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === c.id ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-[#84978F] mb-6">{filtered.length} terapia{filtered.length !== 1 ? 's' : ''}</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t, i) => (
            <div key={i} data-testid={`therapy-card-${i}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.color + '15' }}>
                  <t.icon className="w-5 h-5" style={{ color: t.color }} />
                </div>
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{t.name}</h3>
              </div>
              <p className="text-sm text-[#4A6B5A] leading-relaxed mb-4 flex-1">{t.desc}</p>
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#84978F] uppercase tracking-wider">Indicacoes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.indications.map((ind, j) => (
                    <span key={j} className="bg-[#2C4C3B]/5 text-[#4A6B5A] text-[11px] px-2.5 py-1 rounded-full">{ind}</span>
                  ))}
                </div>
                {t.link && t.exists && (
                  <Link to={t.link} className="inline-flex items-center gap-1 text-sm font-medium text-[#2C4C3B] hover:text-[#1A2E24] transition-colors mt-2">
                    Saiba mais <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <section className="mt-16 bg-[#2C4C3B] rounded-3xl p-10 sm:p-14 text-center">
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0] mb-3">Nao sabe qual terapia escolher?</h2>
          <p className="text-[#F9F6F0]/70 mb-6 max-w-lg mx-auto">Agende uma consulta com nossos especialistas e receba um plano de tratamento personalizado para seu pet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultas" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all">Agendar Consulta</Link>
            <Link to="/equipe" className="bg-transparent border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all">Conhecer a Equipe</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
