import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UtensilsCrossed, Leaf, Apple, Flame, ShieldCheck, ChevronRight, ArrowRight, BookOpen, ShoppingCart, Heart } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { Toaster } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SECTIONS = [
  {
    id: 'cetogenica',
    icon: Flame,
    title: 'Alimentação Cetogênica para Pets',
    intro: 'A dieta cetogênica veterinária é uma abordagem nutricional rica em gorduras saudáveis e pobre em carboidratos, que promove a produção de corpos cetônicos como fonte de energia alternativa à glicose.',
    content: [
      { subtitle: 'O que é a Dieta Cetogênica Veterinária?', text: 'Baseada no mesmo princípio da cetogenia humana, a dieta cetogênica para pets reduz drasticamente carboidratos (grãos, amidos) e aumenta gorduras de qualidade (óleo de coco, azeite, gordura animal). Isso força o organismo a usar gordura como combustível principal, produzindo cetonas que alimentam o cérebro e os músculos de forma mais eficiente.' },
      { subtitle: 'Benefícios Comprovados', text: 'Estudos recentes em oncologia veterinária mostram que tumores dependem de glicose para crescer. A dieta cetogênica "corta" essa fonte de energia, sendo coadjuvante no tratamento de câncer em pets. Outros benefícios incluem: controle de epilepsia refratária, redução de inflamação crônica, melhora cognitiva em animais idosos e controle de peso em animais obesos.' },
      { subtitle: 'Alimentos Indicados', text: 'Proteínas: frango, peru, carne bovina magra, peixe (salmão, sardinha), ovos. Gorduras saudáveis: óleo de coco extra virgem, óleo de peixe (ômega 3), azeite de oliva, manteiga de ghee. Vegetais low-carb: brócolis, abobrinha, espinafre, couve. Evitar: arroz, milho, trigo, batata, cenoura em excesso, frutas com alto teor de açúcar.' },
      { subtitle: 'Como Iniciar', text: 'A transição deve ser gradual, durante 7-14 dias, misturando a nova alimentação com a anterior. É fundamental acompanhar com um veterinário nutrólogo que monitore os níveis de cetonas no sangue e ajuste as proporções. A proporção típica é 70% gordura, 25% proteína e 5% carboidratos.' },
    ]
  },
  {
    id: 'natural',
    icon: Leaf,
    title: 'Alimentação Natural (AN)',
    intro: 'A Alimentação Natural para pets é o preparo caseiro de refeições balanceadas com ingredientes frescos e naturais, sem ultraprocessados, corantes ou conservantes artificiais.',
    content: [
      { subtitle: 'Por que Alimentação Natural?', text: 'Rações industrializadas contêm conservantes, corantes e subprodutos de baixa qualidade que podem causar alergias, problemas digestivos e doenças crônicas a longo prazo. A AN oferece ingredientes frescos, rastreáveis e de alta biodisponibilidade, permitindo que o organismo do animal absorva melhor os nutrientes.' },
      { subtitle: 'Composição Ideal', text: 'Uma refeição natural equilibrada para cães deve conter: 40-50% de proteína animal (frango, carne, peixe), 20-30% de carboidratos complexos (batata-doce, inhame, arroz integral), 10-15% de vegetais (cenoura, abobrinha, chuchu), 5-10% de vísceras (fígado, coração) e suplementação de cálcio, ômega 3 e vitaminas. Para gatos, a proporção de proteína deve ser ainda maior (60-70%).' },
      { subtitle: 'Dieta BARF (Bones and Raw Food)', text: 'A dieta BARF é uma variação da AN que inclui alimentos crus, como ossos carnudos, carnes e vegetais triturados. Defensores argumentam que preserva enzimas e nutrientes perdidos no cozimento. Requer cuidados extras com higiene e origem dos ingredientes para evitar contaminação bacteriana.' },
      { subtitle: 'Suplementação Essencial', text: 'Toda AN precisa de suplementação para ser completa: cálcio (casca de ovo triturada ou carbonato de cálcio), ômega 3 (óleo de peixe), vitamina E, taurina (especialmente para gatos), zinco e complexo B. Nunca inicie uma dieta natural sem orientação de um veterinário nutrólogo.' },
    ]
  },
  {
    id: 'funcional',
    icon: Apple,
    title: 'Nutrição Funcional Veterinária',
    intro: 'A nutrição funcional trata a alimentação como ferramenta terapêutica, usando alimentos específicos para prevenir e tratar doenças, respeitando a individualidade bioquímica de cada animal.',
    content: [
      { subtitle: 'Alimentos como Remédio', text: 'Na nutrição funcional, cada alimento é escolhido por suas propriedades terapêuticas: cúrcuma (anti-inflamatório), gengibre (digestivo), blueberries (antioxidante), sardinha (anti-inflamatório e cerebral), abóbora (digestão e fibras), beterraba (desintoxicante hepático). A combinação correta pode ser tão eficaz quanto alguns medicamentos.' },
      { subtitle: 'Superalimentos para Pets', text: 'Spirulina: rica em proteínas e antioxidantes. Kefir: probiótico natural para saúde intestinal. Óleo de coco: antimicrobiano e energético. Sementes de chia: fibras e ômega 3. Própolis verde: antibacteriano natural. Levedura nutricional: fonte de vitaminas do complexo B. Cogumelos medicinais (reishi, shiitake): imunomoduladores.' },
      { subtitle: 'Dieta de Eliminação', text: 'Para pets com alergias ou intolerâncias alimentares, a nutrição funcional utiliza a dieta de eliminação: remove-se todos os alérgenos potenciais e reintroduz-se um ingrediente por vez, observando reações. Isso permite identificar com precisão o que causa problemas no animal.' },
      { subtitle: 'Fitoterapia Alimentar', text: 'Integração de ervas medicinais na alimentação: camomila (calmante), hortelã (digestivo), alecrim (circulatório), hibisco (antioxidante). Podem ser adicionadas à ração ou preparadas como chás diluídos na água. A dosagem deve ser ajustada pelo porte e peso do animal.' },
    ]
  },
];

export default function DietaryTherapyPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeSection, setActiveSection] = useState('cetogenica');

  useEffect(() => {
    axios.get(`${API}/products?category=terapia-alimentar`)
      .then(r => setProducts(r.data))
      .catch(() => {});
  }, []);

  return (
    <div data-testid="dietary-therapy-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />

      {/* Hero */}
      <section className="bg-[#2C4C3B] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-80 h-80 border border-[#F9F6F0] rounded-full" />
          <div className="absolute bottom-0 left-10 w-60 h-60 border border-[#F9F6F0] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
              <UtensilsCrossed className="w-4 h-4 text-[#C87A5D]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Terapia Alimentar</span>
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F9F6F0] leading-[1.1]">
              Alimentação como <span className="text-[#C87A5D]">Medicina</span>
            </h1>
            <p className="text-lg text-[#F9F6F0]/70 mt-6 max-w-2xl mx-auto">
              Descubra como a alimentação cetogênica, natural e funcional pode transformar a saúde do seu pet. Nutrição terapêutica personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="sticky top-16 sm:top-20 z-30 bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-[#E0DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}>
                <s.icon className="w-4 h-4" /> {s.title.split(' ')[0]} {s.title.split(' ')[1]}
              </a>
            ))}
            <a href="#produtos" onClick={() => setActiveSection('produtos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === 'produtos' ? 'bg-[#C87A5D] text-[#F9F6F0]' : 'bg-[#C87A5D]/10 border border-[#C87A5D]/20 text-[#C87A5D] hover:bg-[#C87A5D]/20'}`}>
              <ShoppingCart className="w-4 h-4" /> Produtos
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {SECTIONS.map(section => (
          <section key={section.id} id={section.id} className="mb-16 scroll-mt-36">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-2xl flex items-center justify-center">
                <section.icon className="w-6 h-6 text-[#2C4C3B]" />
              </div>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#1A2E24]">{section.title}</h2>
            </div>
            <p className="text-[#4A6B5A] leading-relaxed mb-8 max-w-3xl">{section.intro}</p>
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

        {/* Products */}
        <section id="produtos" className="mb-16 scroll-mt-36">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#C87A5D]/10 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#C87A5D]" />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#1A2E24]">Produtos de Terapia Alimentar</h2>
              <p className="text-[#4A6B5A] text-sm mt-1">Rações naturais, kits cetogênicos e suplementos nutricionais</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-10 text-[#84978F]">
              <p>Carregando produtos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} data-testid={`product-card-${product.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#2C4C3B] text-[#F9F6F0] text-xs font-bold px-3 py-1 rounded-full">Terapia Alimentar</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{product.name}</h3>
                    <p className="text-sm text-[#4A6B5A] line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-['Outfit'] text-xl font-semibold text-[#2C4C3B]">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        data-testid={`buy-${product.id}`}
                        className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2 text-sm font-medium transition-all"
                      >
                        <ShoppingCart className="w-4 h-4" /> Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/produtos?categoria=terapia-alimentar" className="text-sm text-[#2C4C3B] font-medium hover:underline inline-flex items-center gap-1">
              Ver todos os produtos de terapia alimentar <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#2C4C3B] rounded-3xl p-10 sm:p-14 text-center">
          <Heart className="w-10 h-10 text-[#C87A5D] mx-auto mb-4" />
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0] mb-3">
            Quer montar a dieta ideal do seu pet?
          </h2>
          <p className="text-[#F9F6F0]/70 mb-6 max-w-md mx-auto">
            Agende uma consulta com nossos veterinários nutrólogos e receba um plano alimentar personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultas" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2 justify-center">
              Agendar Consulta <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/produtos?categoria=terapia-alimentar" className="border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2 justify-center">
              Ver Produtos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      {selectedProduct && (
        <PaymentModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
