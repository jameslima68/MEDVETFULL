import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { Leaf, FlaskConical, Droplets, Target, BookOpen, Star, ChevronRight, Shield, Truck, Clock, Headphones, Heart, Sparkles, Rainbow, Zap, Wind, Music, Brain, Waves, Hand, Bone, Syringe, Sun, Play } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ICON_MAP = {
  Leaf: Leaf,
  FlaskConical: FlaskConical,
  Droplets: Droplets,
  Target: Target,
  BookOpen: BookOpen,
  Yin: Leaf,
  Sparkles: Sparkles,
  Rainbow: Rainbow,
};

const THERAPIES = [
  { id: 'acupuntura', title: 'Acupuntura', desc: 'Parte da Medicina Tradicional Chinesa, a acupuntura veterinária utiliza agulhas finíssimas em pontos específicos do corpo (meridianos) para restaurar o fluxo de energia vital (Qi). Na medicina integrativa para pets, é uma das terapias mais estudadas e eficazes, com resultados comprovados no alívio de dor crônica, doenças neurológicas, problemas articulares e distúrbios digestivos. A técnica estimula a liberação de endorfinas e neurotransmissores naturais, promovendo analgesia e redução da inflamação sem efeitos colaterais.', icon: Target, img: 'https://static.prod-images.emergentagent.com/jobs/10aec1f8-3381-451e-883e-da9e1b489f6e/images/68a1b8cf9fd017bcbe17cba6ee1ccaf26ad0770b26596b80ffaf3a5114a01da3.png', pro: true },
  { id: 'fitoterapia', title: 'Fitoterapia', desc: 'A fitoterapia veterinária utiliza substâncias derivadas de plantas medicinais para tratamento e prevenção de diversas condições em animais. Conhecida como "cura pelas plantas", integra tanto a tradição ocidental quanto as fórmulas milenares da Medicina Tradicional Chinesa. Cada planta possui compostos bioativos específicos que atuam no organismo do animal de forma sinérgica — como a cúrcuma (anti-inflamatório), o gengibre (digestivo), a camomila (calmante) e a equinácea (imunoestimulante). As fórmulas são manipuladas sob medida após avaliação individualizada.', icon: Leaf, img: 'https://static.prod-images.emergentagent.com/jobs/10aec1f8-3381-451e-883e-da9e1b489f6e/images/5366d2b01fc7978ff7fbffa2ca2f375bbdf91523dd7ccd5bb3168b0dbd5cc859.png' },
  { id: 'ozonioterapia', title: 'Ozonioterapia', desc: 'A ozonioterapia veterinária consiste na aplicação terapêutica de uma mistura de gás oxigênio e ozônio medicinal. Possui propriedades anti-inflamatórias, antissépticas, analgésicas e de fortalecimento imunológico. Na medicina integrativa para pets, é utilizada no tratamento de feridas crônicas, infecções resistentes, doenças articulares, dermatites e como coadjuvante em tratamentos oncológicos. A técnica pode ser aplicada por via retal, tópica ou em autohemoterapia, sempre sob supervisão veterinária especializada.', icon: Wind, img: 'https://static.prod-images.emergentagent.com/jobs/10aec1f8-3381-451e-883e-da9e1b489f6e/images/30625b9c6e4a77141a37fa522b4de3fce64060f6862b3a431b61a02da21a4901.png', pro: true },
  { id: 'homeopatia', title: 'Homeopatia', desc: 'A homeopatia veterinária baseia-se no princípio fundamental de que "semelhante cura semelhante" (Similia similibus curantur). Utiliza medicamentos altamente diluídos e dinamizados para estimular a capacidade intrínseca de autocura do organismo animal. Cada tratamento é individualizado — o homeopata veterinário avalia não apenas os sintomas físicos, mas o comportamento, o temperamento e a história completa do animal para escolher o medicamento mais adequado. É uma abordagem suave, sem efeitos colaterais, indicada para todas as idades e espécies.', icon: Droplets, img: 'https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?w=400&h=300&fit=crop' },
  { id: 'reiki', title: 'Reiki', desc: 'O Reiki é uma terapia energética de origem japonesa que busca equilibrar o campo energético do animal através da imposição de mãos. Na veterinária integrativa, é utilizado para promover relaxamento profundo, reduzir ansiedade, acelerar processos de cicatrização e complementar outros tratamentos. Os animais são naturalmente receptivos à energia do Reiki — é comum observar sinais imediatos de relaxamento como bocejos, suspiros e sonolência durante as sessões. Especialmente indicado para pets em recuperação cirúrgica, animais resgatados com traumas emocionais e idosos.', icon: Sparkles, img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop', pro: true },
  { id: 'fisioterapia', title: 'Fisioterapia e Reabilitação', desc: 'A fisioterapia veterinária integrativa inclui técnicas como hidroterapia (esteira aquática e piscina), cinesioterapia (exercícios terapêuticos dirigidos), eletroterapia (TENS, FES) e termoterapia para recuperar a mobilidade, fortalecer a musculatura e devolver qualidade de vida. É fundamental na reabilitação pós-cirúrgica (como hérnias de disco e fraturas), no manejo de displasia coxofemoral, artrose e doenças neurológicas. O programa é sempre personalizado conforme a condição, porte e necessidades específicas do animal.', icon: Zap, img: 'https://images.unsplash.com/photo-1612830565936-6388483d801b?w=400&h=300&fit=crop', pro: true },
  { id: 'quiropraxia', title: 'Quiropraxia', desc: 'A quiropraxia veterinária foca no alinhamento da coluna vertebral e na integridade do sistema nervoso para melhorar a função física global do animal. Através de ajustes manuais precisos e suaves nas vértebras e articulações, o quiroprático veterinário corrige subluxações que podem causar dor, rigidez e comprometimento neurológico. É especialmente eficaz em cães atletas, animais com claudicação, rigidez de movimentos e como complemento no tratamento de hérnias discais.', icon: Bone, img: 'https://static.prod-images.emergentagent.com/jobs/10aec1f8-3381-451e-883e-da9e1b489f6e/images/e69dd964795b120110cc89e19b1ff8b55b32a866439dd02e8b3f9e0029ca3601.png', pro: true },
  { id: 'cbd', title: 'Terapia Canábica (CBD)', desc: 'A terapia com canabidiol (CBD) tem demonstrado resultados promissores na medicina veterinária integrativa. O CBD é um fitocanabinóide não psicoativo extraído da Cannabis que atua no sistema endocanabinoide presente em todos os mamíferos. Na veterinária, é utilizado no manejo da dor crônica, controle de crises convulsivas (epilepsia refratária), redução de ansiedade e distúrbios comportamentais, além de propriedades anti-inflamatórias. Todos os produtos seguem regulamentação da ANVISA e são prescritos por veterinários habilitados.', icon: Droplets, img: 'https://static.prod-images.emergentagent.com/jobs/10aec1f8-3381-451e-883e-da9e1b489f6e/images/8d8cbfdac65213e6ddbb93ef09091eb53ef5637f3db20063737c244ee330f627.png' },
  { id: 'florais', title: 'Florais de Bach', desc: 'Os Florais de Bach são essências vibracionais extraídas de flores silvestres, desenvolvidas pelo Dr. Edward Bach. Na veterinária integrativa, são utilizados para tratar desequilíbrios emocionais e comportamentais em pets — como medos específicos (trovões, fogos), ansiedade de separação, agressividade, ciúmes, luto e adaptação a mudanças. Os florais atuam de forma sutil e segura, sem contraindicações ou efeitos colaterais, e podem ser combinados com qualquer outro tratamento. Cada fórmula é personalizada conforme o perfil emocional do animal.', icon: Heart, img: 'https://images.unsplash.com/photo-1585383234137-2367d3c5302d?w=400&h=300&fit=crop' },
  { id: 'nutricao', title: 'Nutrição Funcional e Alimentação Natural', desc: 'A nutrição funcional veterinária trata a alimentação como ferramenta terapêutica. Dietas balanceadas e personalizadas — incluindo alimentação natural (AN), dieta cetogênica e dieta BARF — visam a saúde interna, o fortalecimento imunológico e a prevenção de doenças. Cada alimento é escolhido por suas propriedades específicas: proteínas de qualidade para musculatura, ômega 3 para inflamação, probióticos para flora intestinal, antioxidantes para envelhecimento. O plano alimentar é elaborado por veterinário nutrólogo conforme a individualidade do animal.', icon: Leaf, img: 'https://images.unsplash.com/photo-1745252798506-29500efc5b39?w=400&h=300&fit=crop' },
  { id: 'cromoterapia', title: 'Musicoterapia e Cromoterapia', desc: 'A cromoterapia utiliza a vibração das cores do espectro solar para restabelecer o equilíbrio físico e energético do animal — azul para calma, verde para imunidade, vermelho para vitalidade. A musicoterapia emprega sons e frequências específicas para reduzir estresse, ansiedade e promover relaxamento profundo. Juntas, essas terapias criam um ambiente terapêutico que equilibra o estado emocional do pet, sendo especialmente úteis em situações de hospitalização, pós-operatório e para animais com fobias sonoras.', icon: Rainbow, img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop' },
  { id: 'neural', title: 'Terapia Neural', desc: 'A terapia neural veterinária consiste na aplicação de microdoses de anestésicos locais (como procaína) em pontos específicos — cicatrizes, pontos de acupuntura, gânglios nervosos — para restaurar o funcionamento adequado do sistema nervoso autônomo. Atua "resetando" campos interferentes que perpetuam processos de dor crônica e disfunção. Na medicina integrativa para pets, é indicada para dores de difícil tratamento, doenças crônicas e como complemento a outras terapias regulatórias.', icon: Zap, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop', pro: true },
  { id: 'hormonios', title: 'Terapia Hormonal Bioidêntica', desc: 'A terapia hormonal bioidêntica veterinária utiliza hormônios com estrutura molecular idêntica aos produzidos naturalmente pelo organismo do animal. Diferente dos hormônios sintéticos, os bioidênticos são melhor reconhecidos e metabolizados pelo corpo, com menos efeitos colaterais. Na veterinária integrativa, é utilizada para tratar desequilíbrios da tireoide, insuficiência adrenal, menopausa em fêmeas e declínio hormonal em animais idosos, restaurando vitalidade, energia e qualidade de vida de forma natural.', icon: FlaskConical, img: 'https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop' },
  { id: 'massoterapia', title: 'Massoterapia e Liberação Miofascial', desc: 'A massoterapia veterinária emprega técnicas manuais especializadas para liberar tensões musculares, melhorar a circulação sanguínea e linfática, aumentar a flexibilidade e promover relaxamento profundo no animal. A liberação miofascial trabalha especificamente as fáscias — membranas que envolvem músculos e órgãos — desfazendo aderências e restrições que causam dor e limitação de movimento. É indicada para animais atletas, pets com dor muscular crônica, idosos com rigidez e como complemento à fisioterapia.', icon: Hand, img: 'https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?w=400&h=300&fit=crop', pro: true },
  { id: 'osteopatia', title: 'Osteopatia', desc: 'A osteopatia veterinária é uma abordagem manual que foca na manipulação suave das articulações, tecidos moles e estruturas cranianas para restaurar o equilíbrio estrutural e funcional do corpo do animal. O osteopata veterinário avalia o corpo como um todo integrado, identificando restrições de mobilidade que podem afetar órgãos, circulação e sistema nervoso. É especialmente eficaz em cães com problemas posturais, dores crônicas, disfunções viscerais e como preventivo em animais de esporte.', icon: Bone, img: 'https://images.unsplash.com/photo-1612830565936-6388483d801b?w=400&h=300&fit=crop', pro: true },
  { id: 'hidroterapia', title: 'Hidroterapia', desc: 'A hidroterapia veterinária utiliza as propriedades terapêuticas da água — flutuabilidade, resistência e temperatura controlada — para reabilitação física com baixo impacto articular. Realizada em esteiras aquáticas ou piscinas adaptadas, é excelente para pets com problemas de mobilidade, pós-operatórios ortopédicos, displasia, artrose e controle de peso. A flutuação reduz em até 60% o peso corporal sobre as articulações, permitindo exercícios que seriam impossíveis em solo. Melhora a amplitude de movimento, fortalece a musculatura e acelera a recuperação.', icon: Waves, img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop', pro: true },
  { id: 'biorressonancia', title: 'Biorressonância', desc: 'A biorressonância é uma técnica da medicina bioenergética que busca identificar e tratar desequilíbrios energéticos nas células do animal por meio de frequências eletromagnéticas específicas. O equipamento capta as oscilações do organismo, identifica padrões de desequilíbrio e emite frequências corretivas que estimulam a autorregulação. Na veterinária integrativa, é utilizada para diagnóstico energético, tratamento de alergias, detoxificação e como suporte em doenças crônicas e autoimunes.', icon: Zap, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop', pro: true },
  { id: 'geoterapia', title: 'Geoterapia (Argiloterapia)', desc: 'A geoterapia veterinária utiliza argilas medicinais para tratar inflamações, edemas, dermatites e problemas de pele. As argilas possuem propriedades minerais e absorventes naturais — a argila verde é anti-inflamatória e cicatrizante, a branca é calmante e suavizante, a vermelha é estimulante circulatória. Na medicina integrativa para pets, são aplicadas como cataplasmas e compressas nas áreas afetadas, oferecendo um tratamento natural, acessível e eficaz que complementa outras terapias.', icon: Sun, img: 'https://images.unsplash.com/photo-1759141936083-d10203b4d4f6?w=400&h=300&fit=crop' },
  { id: 'apiterapia', title: 'Apiterapia', desc: 'A apiterapia veterinária emprega produtos derivados de abelhas para fins terapêuticos. O mel possui propriedades cicatrizantes e antibacterianas para tratamento de feridas. O própolis é um potente antibacteriano e antifúngico natural, utilizado em infecções e fortalecimento imunológico. A geleia real é nutritiva e imunoestimulante. A apitoxina (veneno de abelha) tem propriedades anti-inflamatórias e analgésicas, sendo pesquisada no manejo de artrite e doenças autoimunes em animais.', icon: Heart, img: 'https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?w=400&h=300&fit=crop' },
  { id: 'viscum', title: 'Viscum Album (Antroposofia)', desc: 'O Viscum album (visco) é uma planta utilizada na medicina antroposófica como terapia integrativa no tratamento oncológico. Na veterinária, extratos padronizados de Viscum album são utilizados como coadjuvantes no tratamento de câncer, com o objetivo de estimular o sistema imunológico, melhorar a qualidade de vida, reduzir efeitos colaterais da quimioterapia e potencialmente retardar o crescimento tumoral. É sempre utilizado sob supervisão de veterinário especializado em oncologia integrativa.', icon: Leaf, img: 'https://images.unsplash.com/photo-1572005256772-af4c47972590?w=400&h=300&fit=crop', pro: true },
  { id: 'constelacao', title: 'Constelação Familiar para Pets', desc: 'A constelação familiar sistêmica aplicada a pets é uma abordagem terapêutica que investiga se problemas comportamentais ou de saúde do animal estão ligados a dinâmicas emocionais e energéticas do sistema familiar do tutor. Parte do princípio de que os pets absorvem e espelham desequilíbrios do ambiente familiar. Através de sessões conduzidas por facilitadores especializados, busca-se identificar e resolver emaranhamentos sistêmicos, promovendo harmonia no vínculo pet-tutor e melhorando a saúde emocional de ambos.', icon: Brain, img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop', pro: true },
  { id: 'termalismo', title: 'Termalismo (Crenoterapia)', desc: 'O termalismo veterinário utiliza águas minerais termais e banhos terapêuticos para aliviar dores articulares, tratar doenças crônicas e promover relaxamento. As águas termais contêm minerais como enxofre, magnésio e cálcio que possuem propriedades anti-inflamatórias e analgésicas naturais. Na medicina integrativa para pets, é indicado para animais com artrose, doenças reumáticas, problemas dermatológicos e como terapia de bem-estar para animais idosos.', icon: Waves, img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop', pro: true },
  { id: 'laser', title: 'Laserterapia e Magnetoterapia', desc: 'A laserterapia de baixa intensidade (LLLT) e a magnetoterapia utilizam, respectivamente, luz laser e campos magnéticos pulsados para acelerar a regeneração celular, reduzir inflamações e aliviar a dor de forma não invasiva. Na veterinária integrativa, são indicadas para cicatrização de feridas, pós-operatórios, edemas, tendinites e neuropatias. Os tratamentos são indolores, rápidos (sessões de 5-20 minutos) e podem ser combinados com outras terapias para potencializar resultados.', icon: Zap, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop', pro: true },
  { id: 'celulas', title: 'Células-Tronco (Stem Cell)', desc: 'A terapia com células-tronco na veterinária representa a fronteira da medicina regenerativa. Células-tronco mesenquimais, obtidas geralmente do tecido adiposo do próprio animal, são processadas e reinjetadas nas áreas lesionadas para regenerar tecidos danificados. Na medicina integrativa, é utilizada principalmente em articulações desgastadas (artrose severa), hérnias de disco, doenças renais crônicas e lesões tendíneas. Os resultados incluem redução significativa da dor, melhora da mobilidade e regeneração tecidual comprovada por exames.', icon: Syringe, img: 'https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop', pro: true },
  { id: 'prp', title: 'PRP (Plasma Rico em Plaquetas)', desc: 'O PRP veterinário é uma terapia de regeneração avançada que utiliza um concentrado de plaquetas obtido do próprio sangue do animal. As plaquetas liberam fatores de crescimento que aceleram significativamente a cicatrização de tendões, ligamentos, cartilagens e feridas de difícil resolução. Na medicina integrativa, é indicado para lesões esportivas em cães atletas, artrose, feridas crônicas e como complemento a cirurgias ortopédicas. O procedimento é seguro, minimamente invasivo e com baixo risco de rejeição por utilizar material autólogo.', icon: Syringe, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop', pro: true },
  { id: 'pelagem', title: 'Saúde da Pelagem', desc: 'O cuidado integrativo com a pelagem vai muito além da estética — pelos opacos, quebradiços ou com queda excessiva são sinais de desequilíbrios internos. Na medicina veterinária integrativa, tratamos a pelagem de dentro para fora: óleos prensados a frio (gergelim, coco, linhaça) ricos em ômega 3 e 6 nutrem os folículos pilosos; a Ayurveda ensina a prática do Abhyanga (massagem com óleos mornos); a nutrição funcional fornece os aminoácidos, biotina, zinco e vitaminas essenciais para queratina forte e brilhante.', icon: Sparkles, img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop' },
];

function TherapiesShowcase() {
  const [expanded, setExpanded] = useState(null);
  const [videos, setVideos] = useState([]);
  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  useEffect(() => {
    axios.get(`${API}/videos`).then(r => setVideos(r.data)).catch(() => {});
  }, []);

  return (
    <section data-testid="featured-therapies" className="py-20 sm:py-28 bg-[#EAE7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossos Tratamentos</span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">
            Terapias Integrativas para seu Pet
          </h2>
          <p className="text-base text-[#4A6B5A] mt-4 max-w-2xl mx-auto">
            Clique em cada terapia para conhecer o conceito e os cuidados na medicina veterinária integrativa.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {THERAPIES.map(t => {
            const isOpen = expanded === t.id;
            return (
              <div key={t.id} className={`${isOpen ? 'col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5' : ''}`}>
                <button
                  onClick={() => toggle(t.id)}
                  data-testid={`therapy-${t.id}`}
                  className={`w-full text-left rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-[#2C4C3B]' : 'hover:shadow-md hover:-translate-y-0.5'}`}
                >
                  {!isOpen ? (
                    <div className="bg-white/70 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl overflow-hidden">
                      <div className="relative h-28 sm:h-32 overflow-hidden">
                        <img src={t.img} alt={t.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/60 to-transparent" />
                        {t.pro && <span className="absolute top-2 right-2 bg-[#C87A5D] text-[#F9F6F0] text-[9px] font-bold px-2 py-0.5 rounded-full">Em breve</span>}
                        <div className="absolute bottom-2 left-3 right-3">
                          <h4 className="font-['Outfit'] text-sm font-medium text-[#F9F6F0] leading-tight">{t.title}</h4>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#2C4C3B]/20 rounded-2xl">
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center">
                            <t.icon className="w-5 h-5 text-[#2C4C3B]" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{t.title}</h4>
                            {t.pro && <span className="bg-[#C87A5D]/10 text-[#C87A5D] text-[10px] font-bold px-2 py-0.5 rounded-full">Em breve</span>}
                          </div>
                        </div>
                        <span className="text-xs text-[#84978F] font-medium">Fechar</span>
                      </div>
                    </div>
                  )}
                </button>

                {isOpen && (
                  <div className="bg-white border border-[#E0DDD5] border-t-0 rounded-b-2xl px-5 pb-6 -mt-2 pt-4 animate-fade-in">
                    <p className="text-sm text-[#4A6B5A] leading-relaxed max-w-4xl">{t.desc}</p>

                    {(() => {
                      const vid = videos.find(v => v.therapy === t.id);
                      if (vid && vid.has_video) return (
                        <div className="mt-4">
                          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#84978F] mb-2">Vídeo sobre esta terapia</p>
                          <video
                            src={`${process.env.REACT_APP_BACKEND_URL}${vid.video_url}`}
                            controls
                            className="rounded-xl w-full max-w-md"
                            poster={vid.thumbnail}
                          />
                        </div>
                      );
                      if (vid) return (
                        <div className="mt-4 flex items-center gap-2 text-xs text-[#84978F]">
                          <Play className="w-3.5 h-3.5 text-[#C87A5D]" />
                          <span>Vídeo sobre esta terapia em produção</span>
                        </div>
                      );
                      return null;
                    })()}

                    {t.pro && (
                      <p className="mt-4 text-xs text-[#C87A5D] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Este tratamento presencial estará disponível em breve. Estamos estruturando a equipe de especialistas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes, testRes, faqRes, tipRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/products`),
          axios.get(`${API}/testimonials`),
          axios.get(`${API}/faq`),
          axios.get(`${API}/tips`),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
        setTestimonials(testRes.data);
        setFaqs(faqRes.data);
        setTips(tipRes.data.slice(0, 3));
      } catch (e) {
        console.error('Error loading homepage data:', e);
      }
    };
    load();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section data-testid="hero-section" className="relative overflow-hidden bg-[#F9F6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-[#2C4C3B]/5 rounded-full px-4 py-2">
                <Leaf className="w-4 h-4 text-[#2C4C3B]" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">{t('home.badge')}</span>
              </div>
              <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1A2E24] leading-[1.1]">
                {t('home.title1')} <span className="text-[#84978F]">{t('home.title2')}</span> {t('home.title3')}
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-[#4A6B5A] max-w-lg">
                {t('home.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/consultas"
                  data-testid="hero-cta-consultation"
                  className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all text-center shadow-sm"
                >
                  {t('home.cta1')}
                </Link>
                <Link
                  to="/produtos"
                  data-testid="hero-cta-products"
                  className="bg-transparent border border-[#2C4C3B] text-[#2C4C3B] hover:bg-[#2C4C3B]/5 rounded-full px-8 py-3.5 font-medium transition-all text-center"
                >
                  {t('home.cta2')}
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(44,76,59,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1750967028438-acc4042504eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMHNtaWxpbmclMjBuYXR1cmUlMjBvdXRkb29ycyUyMGJlYXV0aWZ1bCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3NjcwMjEwMnww&ixlib=rb-4.1.0&q=85"
                  alt="Pet wellness"
                  className="w-full h-[400px] sm:h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/30 to-transparent" />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:-left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#E0DDD5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#2C4C3B]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2E24]">{t('home.online')}</p>
                    <p className="text-xs text-[#4A6B5A]">{t('home.secure')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-[#EAE7E1] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Shield, label: 'Veterinários Especialistas', sub: 'Equipe certificada' },
              { icon: Truck, label: 'Envio Seguro', sub: 'Para todo Brasil' },
              { icon: Clock, label: 'Consultas Online', sub: 'Sem filas de espera' },
              { icon: Headphones, label: 'Suporte 24/7', sub: 'Estamos aqui por você' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#2C4C3B]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A2E24]">{item.label}</p>
                  <p className="text-xs text-[#4A6B5A]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Preview */}
      <section data-testid="mission-preview" className="py-20 sm:py-28 bg-[#2C4C3B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 border border-[#F9F6F0] rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border border-[#F9F6F0] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-[#F9F6F0] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="w-4 h-4 text-[#C87A5D]" />
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Nossa Missão</span>
              </div>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0]">
                Conhecimento, paixão e <span className="text-[#C87A5D]">cura milenar</span>
              </h2>
              <p className="text-[#F9F6F0]/70 leading-relaxed">
                Nascemos da união entre paixão pelos animais e sabedoria ancestral. Resgatamos o poder de cura da <strong className="text-[#F9F6F0]">Ayurveda</strong> e da <strong className="text-[#F9F6F0]">Medicina Tradicional Chinesa</strong> — sistemas milenares que enxergam o ser vivo como um todo — para oferecer tratamentos verdadeiramente integradores ao seu pet.
              </p>
              <p className="text-[#F9F6F0]/70 leading-relaxed">
                Mais do que tratar sintomas, buscamos o equilíbrio natural com <strong className="text-[#F9F6F0]">carinho, amor</strong> e ciência. Cada animal é único e merece um cuidado que respeite sua essencia.
              </p>
              <Link
                to="/missao"
                data-testid="mission-read-more"
                className="inline-flex items-center gap-2 bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-7 py-3 font-medium transition-all mt-2"
              >
                Conheca nossa história <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-2xl p-6 hover:-translate-y-1 transition-all">
                  <Leaf className="w-8 h-8 text-[#C87A5D] mb-3" />
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0] mb-2">Ayurveda</h3>
                  <p className="text-[#F9F6F0]/60 text-sm">5.000 anos de sabedoria adaptados para a saúde do seu pet.</p>
                </div>
                <div className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-2xl p-6 hover:-translate-y-1 transition-all">
                  <Target className="w-8 h-8 text-[#C87A5D] mb-3" />
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0] mb-2">Medicina Chinesa</h3>
                  <p className="text-[#F9F6F0]/60 text-sm">Acupuntura e fitoterapia para restaurar o equilíbrio vital.</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-2xl p-6 hover:-translate-y-1 transition-all">
                  <Droplets className="w-8 h-8 text-[#C87A5D] mb-3" />
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0] mb-2">Homeopatia</h3>
                  <p className="text-[#F9F6F0]/60 text-sm">Tratamentos suaves e sem efeitos colaterais.</p>
                </div>
                <div className="bg-[#F9F6F0]/10 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-2xl p-6 hover:-translate-y-1 transition-all">
                  <Heart className="w-8 h-8 text-[#C87A5D] mb-3" />
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0] mb-2">Amor & Cuidado</h3>
                  <p className="text-[#F9F6F0]/60 text-sm">Tratar com carinho é o primeiro passo para a cura.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section data-testid="categories-section" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossos Tratamentos</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">
              Terapias integrativas para seu pet
            </h2>
            <p className="text-base leading-relaxed text-[#4A6B5A] mt-4 max-w-2xl mx-auto">
              Oferecemos uma gama completa de tratamentos naturais, combinando o melhor da medicina integrativa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => {
              const IconComp = ICON_MAP[cat.icon] || Leaf;
              return (
                <Link
                  to={`/produtos?categoria=${cat.slug}`}
                  key={cat.id}
                  data-testid={`category-card-${cat.slug}`}
                  className={`group relative bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-[0_12px_48px_rgba(44,76,59,0.08)] transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
                >
                  <div className={`relative ${i === 0 ? 'h-64 sm:h-72' : 'h-48 sm:h-56'}`}>
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/70 via-[#1A2E24]/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-[#F9F6F0]/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <IconComp className="w-5 h-5 text-[#F9F6F0]" />
                        </div>
                        <h3 className="font-['Outfit'] text-lg sm:text-xl font-medium text-[#F9F6F0]">{cat.name}</h3>
                      </div>
                      <p className="text-sm text-[#F9F6F0]/80 line-clamp-2">{cat.description}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2C4C3B]">Explorar</span>
                    <ChevronRight className="w-4 h-4 text-[#84978F] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terapias Integrativas em Destaque */}
      <TherapiesShowcase />

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Como Funciona</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">Simples e prático</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Escolha o Tratamento', desc: 'Navegue pelas categorias e encontre o tratamento ideal para seu pet.' },
              { step: '02', title: 'Consulte um Especialista', desc: 'Agende uma consulta online com nossos veterinários especializados.' },
              { step: '03', title: 'Receba em Casa', desc: 'Seus produtos manipulados são enviados com segurança para todo o Brasil.' },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 group">
                <div className="w-16 h-16 bg-[#2C4C3B] rounded-2xl flex items-center justify-center mx-auto group-hover:-translate-y-1 transition-transform">
                  <span className="font-['Outfit'] text-xl font-bold text-[#F9F6F0]">{item.step}</span>
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A2E24]">{item.title}</h3>
                <p className="text-sm text-[#4A6B5A] max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Preview */}
      {tips.length > 0 && (
        <section data-testid="tips-preview" className="py-20 sm:py-28 bg-[#EAE7E1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-14">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Blog</span>
                <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">Dicas de especialistas</h2>
              </div>
              <Link to="/dicas" className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#2C4C3B] hover:text-[#1A2E24] transition-colors">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tips.map(tip => (
                <Link to={`/dicas/${tip.id}`} key={tip.id} data-testid={`tip-card-${tip.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-[0_12px_48px_rgba(44,76,59,0.08)] transition-all duration-300 hover:-translate-y-1 group">
                  <div className="relative h-44 overflow-hidden">
                    <img src={tip.image_url} alt={tip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-[#84978F]">
                      <span>{tip.date}</span>
                      <span className="w-1 h-1 bg-[#84978F] rounded-full" />
                      <span>{tip.read_time}</span>
                    </div>
                    <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] group-hover:text-[#2C4C3B] transition-colors">{tip.title}</h3>
                    <p className="text-sm text-[#4A6B5A] line-clamp-2">{tip.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section data-testid="testimonials-section" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Depoimentos</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">O que dizem nossos clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(t => (
              <div key={t.id} data-testid={`testimonial-${t.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-8 shadow-[0_8px_32px_rgba(44,76,59,0.04)]">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C87A5D] text-[#C87A5D]" />
                  ))}
                </div>
                <p className="text-[#4A6B5A] leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#84978F] rounded-full flex items-center justify-center text-[#F9F6F0] text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A2E24]">{t.name}</p>
                    <p className="text-xs text-[#84978F]">{t.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section data-testid="faq-section" className="py-20 sm:py-28 bg-[#EAE7E1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">FAQ</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">Perguntas frequentes</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} data-testid={`faq-${faq.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl px-6 overflow-hidden">
                <AccordionTrigger className="text-left font-['Outfit'] text-[#1A2E24] font-medium hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#4A6B5A] pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mb-4">
            Pronto para cuidar melhor do seu pet?
          </h2>
          <p className="text-[#F9F6F0]/70 mb-8 max-w-lg mx-auto">
            Agende uma consulta com nossos especialistas e descubra o poder da medicina veterinária integrativa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/consultas"
              data-testid="cta-bottom-consultation"
              className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all"
            >
              Agendar Consulta
            </Link>
            <Link
              to="/produtos"
              className="bg-transparent border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all"
            >
              Explorar Produtos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
