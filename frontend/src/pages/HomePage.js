import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Leaf, FlaskConical, Droplets, Target, BookOpen, Star, ChevronRight, Shield, Truck, Clock, Headphones, Heart, Sparkles, Rainbow, Zap, Wind, Music, Brain, Waves, Hand, Bone, Syringe, Sun } from 'lucide-react';
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
  { id: 'acupuntura', title: 'Acupuntura', desc: 'Parte da Medicina Tradicional Chinesa, é uma das mais conhecidas e utilizadas para alívio de dor, inflamação e doenças neurológicas.', icon: Target, category: 'acupuntura', img: 'https://images.unsplash.com/photo-1584738620467-51b852c2af2e?w=400&h=300&fit=crop' },
  { id: 'fitoterapia', title: 'Fitoterapia', desc: 'Utiliza substâncias derivadas de plantas para tratamento e prevenção de diversas condições, também conhecida como "cura pelas plantas".', icon: Leaf, category: 'medicina-chinesa', img: 'https://images.unsplash.com/photo-1545840716-c82e9eec6930?w=400&h=300&fit=crop' },
  { id: 'ozonioterapia', title: 'Ozonioterapia', desc: 'Consiste na aplicação de uma mistura de gás oxigênio e ozônio, com propriedades anti-inflamatórias, antissépticas e de fortalecimento imunológico.', icon: Wind, category: null, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop' },
  { id: 'homeopatia', title: 'Homeopatia', desc: 'Baseia-se no princípio de que "semelhante cura semelhante", utilizando medicamentos altamente diluídos para estimular a capacidade de autocura do organismo.', icon: Droplets, category: 'homeopatia', img: 'https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?w=400&h=300&fit=crop' },
  { id: 'reiki', title: 'Reiki', desc: 'Terapia energética que busca equilibrar a energia do pet, promovendo relaxamento e cura.', icon: Sparkles, category: null, img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop' },
  { id: 'fisioterapia', title: 'Fisioterapia e Reabilitação', desc: 'Inclui técnicas como hidroterapia, cinesioterapia e eletroterapia para recuperar a mobilidade.', icon: Zap, category: null, img: 'https://images.unsplash.com/photo-1612830565936-6388483d801b?w=400&h=300&fit=crop' },
  { id: 'quiropraxia', title: 'Quiropraxia', desc: 'Foca no alinhamento da coluna vertebral e do sistema nervoso para melhorar a função física e reduzir dores.', icon: Bone, category: null, img: 'https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?w=400&h=300&fit=crop' },
  { id: 'cbd', title: 'Terapia Canábica (CBD)', desc: 'Resultados promissores no manejo da dor crônica, ansiedade e convulsões.', icon: Droplets, category: 'cbd', img: 'https://images.unsplash.com/photo-1610243684348-dc537f6067ca?w=400&h=300&fit=crop' },
  { id: 'florais', title: 'Florais de Bach', desc: 'Utilizados para tratar desequilíbrios emocionais, como medos, ansiedade de separação e agressividade.', icon: Heart, category: 'cromoterapia', img: 'https://images.unsplash.com/photo-1585383234137-2367d3c5302d?w=400&h=300&fit=crop' },
  { id: 'nutricao', title: 'Nutrição Funcional e Alimentação Natural', desc: 'Dietas balanceadas e personalizadas que visam a saúde interna e a prevenção de doenças.', icon: Leaf, category: 'terapia-alimentar', img: 'https://images.unsplash.com/photo-1745252798506-29500efc5b39?w=400&h=300&fit=crop' },
  { id: 'cromoterapia', title: 'Musicoterapia e Cromoterapia', desc: 'Uso de sons e cores para reduzir estresse e equilibrar o ambiente emocional do pet.', icon: Rainbow, category: 'cromoterapia', img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop' },
  { id: 'neural', title: 'Terapia Neural', desc: 'Injeções de anestésicos locais em pontos específicos para restaurar o funcionamento do sistema nervoso autônomo e aliviar dores.', icon: Zap, category: null, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop' },
  { id: 'hormonios', title: 'Terapia Hormonal Bioidêntica', desc: 'Reposição hormonal com moléculas idênticas às naturais, restaurando o equilíbrio e a qualidade de vida do animal.', icon: FlaskConical, category: 'hormonios', img: 'https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop' },
  { id: 'massoterapia', title: 'Massoterapia e Liberação Miofascial', desc: 'Técnicas manuais que ajudam a liberar tensões musculares, melhorar a flexibilidade e promover relaxamento profundo.', icon: Hand, category: null, img: 'https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?w=400&h=300&fit=crop' },
  { id: 'osteopatia', title: 'Osteopatia', desc: 'Foca na manipulação das articulações e tecidos moles para restaurar o equilíbrio estrutural do corpo e melhorar a função geral.', icon: Bone, category: null, img: 'https://images.unsplash.com/photo-1612830565936-6388483d801b?w=400&h=300&fit=crop' },
  { id: 'hidroterapia', title: 'Hidroterapia', desc: 'Utiliza as propriedades da água para reabilitação física com baixo impacto, sendo excelente para pets com problemas de mobilidade.', icon: Waves, category: null, img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop' },
  { id: 'biorressonancia', title: 'Biorressonância', desc: 'Técnica que busca identificar e tratar desequilíbrios energéticos nas células por meio de frequências eletromagnéticas.', icon: Zap, category: null, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop' },
  { id: 'geoterapia', title: 'Geoterapia (Argiloterapia)', desc: 'Uso de argilas medicinais para tratar inflamações, edemas e problemas de pele devido às propriedades minerais e absorventes.', icon: Sun, category: null, img: 'https://images.unsplash.com/photo-1759141936083-d10203b4d4f6?w=400&h=300&fit=crop' },
  { id: 'apiterapia', title: 'Apiterapia', desc: 'Emprega produtos derivados de abelhas (mel, própolis e apitoxina) para fins terapêuticos e fortalecimento do sistema imunológico.', icon: Heart, category: null, img: 'https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d?w=400&h=300&fit=crop' },
  { id: 'viscum', title: 'Viscum Album (Antroposofia)', desc: 'Terapia derivada da planta Viscum album, utilizada de forma integrativa no tratamento de câncer para melhorar a resposta imunológica.', icon: Leaf, category: null, img: 'https://images.unsplash.com/photo-1572005256772-af4c47972590?w=400&h=300&fit=crop' },
  { id: 'constelacao', title: 'Constelação Familiar para Pets', desc: 'Abordagem sistêmica que busca entender se problemas comportamentais ou de saúde do pet estão ligados a dinâmicas emocionais do tutor.', icon: Brain, category: null, img: 'https://images.unsplash.com/photo-1618018353764-685cb47681d9?w=400&h=300&fit=crop' },
  { id: 'termalismo', title: 'Termalismo (Crenoterapia)', desc: 'Tratamento que utiliza águas termais e banhos terapêuticos para aliviar dores articulares e doenças crônicas.', icon: Waves, category: null, img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop' },
  { id: 'laser', title: 'Laserterapia e Magnetoterapia', desc: 'Uso de luz laser de baixa intensidade ou campos magnéticos para acelerar a regeneração celular e aliviar a dor.', icon: Zap, category: null, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop' },
  { id: 'celulas', title: 'Células-Tronco (Stem Cell)', desc: 'Utilizada para regenerar tecidos danificados, especialmente em articulações desgastadas, hérnias de disco e doenças renais crônicas.', icon: Syringe, category: null, img: 'https://images.unsplash.com/photo-1582719299074-be127353065f?w=400&h=300&fit=crop' },
  { id: 'prp', title: 'PRP (Plasma Rico em Plaquetas)', desc: 'Aplicação de concentrado de plaquetas do próprio sangue do animal para acelerar a cicatrização de tendões, ligamentos e feridas difíceis.', icon: Syringe, category: null, img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop' },
  { id: 'pelagem', title: 'Saúde da Pelagem', desc: 'Produtos naturais, óleos prensados a frio e nutrição especializada para pelos brilhantes, fortes e saudáveis.', icon: Sparkles, category: 'saúde-pelos', img: 'https://images.unsplash.com/photo-1603890227524-e6f9a790c263?w=400&h=300&fit=crop' },
];

function TherapiesShowcase({ products }) {
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const getRelatedProducts = (category) => {
    if (!category) return [];
    return products.filter(p => p.category === category).slice(0, 4);
  };

  return (
    <section data-testid="featured-therapies" className="py-20 sm:py-28 bg-[#EAE7E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossos Tratamentos</span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">
            Terapias Integrativas para seu Pet
          </h2>
          <p className="text-base text-[#4A6B5A] mt-4 max-w-2xl mx-auto">
            Clique em cada terapia para conhecer mais e descobrir produtos relacionados.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {THERAPIES.map(t => {
            const isOpen = expanded === t.id;
            const related = getRelatedProducts(t.category);
            return (
              <div key={t.id} className={`${isOpen ? 'col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5' : ''}`}>
                {/* Card */}
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
                          <h4 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{t.title}</h4>
                        </div>
                        <span className="text-xs text-[#84978F] font-medium">Fechar</span>
                      </div>
                    </div>
                  )}
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="bg-white border border-[#E0DDD5] border-t-0 rounded-b-2xl px-5 pb-6 -mt-2 pt-4 animate-fade-in">
                    <p className="text-sm text-[#4A6B5A] leading-relaxed mb-5 max-w-3xl">{t.desc}</p>

                    {related.length > 0 && (
                      <div>
                        <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#84978F] mb-3">Produtos relacionados</p>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                          {related.map(p => (
                            <Link to={`/produtos?categoria=${p.category}`} key={p.id} className="flex-shrink-0 w-36 group">
                              <div className="rounded-xl overflow-hidden h-24 mb-2">
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <p className="text-xs text-[#1A2E24] font-medium line-clamp-2 group-hover:text-[#2C4C3B] transition-colors">{p.name}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {!related.length && (
                      <Link to="/consultas" className="text-xs text-[#C87A5D] font-medium hover:underline">
                        Agende uma consulta para saber mais sobre este tratamento
                      </Link>
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
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Medicina Veterinária Integrativa</span>
              </div>
              <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1A2E24] leading-[1.1]">
                Cuidado natural e <span className="text-[#84978F]">integrado</span> para seu pet
              </h1>
              <p className="text-base sm:text-lg leading-relaxed text-[#4A6B5A] max-w-lg">
                Tratamentos personalizados com homeopatia, acupuntura, CBD e medicina chinesa. Consultas online com especialistas veterinários.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/consultas"
                  data-testid="hero-cta-consultation"
                  className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all text-center shadow-sm"
                >
                  Agendar Consulta
                </Link>
                <Link
                  to="/produtos"
                  data-testid="hero-cta-products"
                  className="bg-transparent border border-[#2C4C3B] text-[#2C4C3B] hover:bg-[#2C4C3B]/5 rounded-full px-8 py-3.5 font-medium transition-all text-center"
                >
                  Ver Produtos
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(44,76,59,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1763586756425-9cb57b53a437?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxwZXQlMjB3ZWxsbmVzcyUyMGNhdCUyMGRvZyUyMG5hdHVyZXxlbnwwfHx8fDE3NzYxMjU4NTh8MA&ixlib=rb-4.1.0&q=85"
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
                    <p className="text-sm font-semibold text-[#1A2E24]">100% Online</p>
                    <p className="text-xs text-[#4A6B5A]">Atendimento seguro</p>
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
      <TherapiesShowcase products={products} />

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
