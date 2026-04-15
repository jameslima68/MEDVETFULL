import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Target, Leaf, Droplets, FlaskConical, Sparkles, Rainbow, UtensilsCrossed, Heart } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import { Toaster } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SEGMENTS = [
  {
    id: 'acupuntura',
    title: 'Acupuntura & Medicina Chinesa',
    subtitle: 'Restaure o equilíbrio energético do seu pet',
    desc: 'A acupuntura e a fitoterapia chinesa atuam nos meridianos de energia, aliviando dores, melhorando a mobilidade e fortalecendo o organismo como um todo.',
    icon: Target,
    category: 'acupuntura',
    color: '#2C4C3B',
    link: '/acupuntura-mtc',
  },
  {
    id: 'homeopatia',
    title: 'Homeopatia Veterinária',
    subtitle: 'Tratamento suave e sem efeitos colaterais',
    desc: 'Medicamentos manipulados que estimulam a capacidade natural de cura do organismo, tratando desde problemas crônicos até quadros agudos.',
    icon: Leaf,
    category: 'homeopatia',
    color: '#4A6B5A',
  },
  {
    id: 'cbd',
    title: 'CBD para Pets',
    subtitle: 'Alívio natural para dor e ansiedade',
    desc: 'Óleos e produtos à base de canabidiol com resultados comprovados no manejo de dor crônica, convulsões e distúrbios comportamentais.',
    icon: Droplets,
    category: 'cbd',
    color: '#84978F',
  },
  {
    id: 'hormonios',
    title: 'Hormônios Bioidênticos',
    subtitle: 'Restaure o equilíbrio hormonal naturalmente',
    desc: 'Reposição hormonal com moléculas idênticas às naturais, devolvendo vitalidade e qualidade de vida ao seu animal.',
    icon: FlaskConical,
    category: 'hormonios',
    color: '#C87A5D',
  },
  {
    id: 'medicina-chinesa',
    title: 'Fitoterapia & Medicina Chinesa',
    subtitle: 'Fórmulas milenares adaptadas para pets',
    desc: 'Ervas medicinais em combinações sinérgicas para tratar desde problemas digestivos até doenças crônicas com sabedoria milenar.',
    icon: Leaf,
    category: 'medicina-chinesa',
    color: '#2C4C3B',
  },
  {
    id: 'saude-pelos',
    title: 'Saúde da Pelagem',
    subtitle: 'Nutrição de dentro para fora',
    desc: 'Óleos prensados a frio, suplementos e nutrientes essenciais para pelos brilhantes, fortes e saudáveis.',
    icon: Sparkles,
    category: 'saúde-pelos',
    color: '#84978F',
    link: '/guia-pelagem',
  },
  {
    id: 'cromoterapia',
    title: 'Cromoterapia & Florais',
    subtitle: 'Equilíbrio através das cores e energias',
    desc: 'Lâmpadas LED, cristais, água solarizada e florais de Bach para equilíbrio físico, emocional e energético do seu pet.',
    icon: Rainbow,
    category: 'cromoterapia',
    color: '#C87A5D',
  },
  {
    id: 'terapia-alimentar',
    title: 'Terapia Alimentar',
    subtitle: 'Alimentação como medicina',
    desc: 'Rações naturais, dietas cetogênicas e suplementos nutricionais para tratar e prevenir doenças pela alimentação.',
    icon: UtensilsCrossed,
    category: 'terapia-alimentar',
    color: '#4A6B5A',
    link: '/terapia-alimentar',
  },
];

function ProductCard({ product, onBuy }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative h-40 overflow-hidden">
        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4 space-y-2">
        <h4 className="font-['Outfit'] text-sm font-medium text-[#1A2E24] line-clamp-1">{product.name}</h4>
        <p className="text-xs text-[#4A6B5A] line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-['Outfit'] text-lg font-semibold text-[#2C4C3B]">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button
            onClick={() => onBuy(product)}
            data-testid={`segment-buy-${product.id}`}
            className="text-xs bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-3.5 py-1.5 font-medium transition-all"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductSegmentsPage() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get(`${API}/products`).then(r => {
      const grouped = {};
      r.data.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p);
      });
      setProductsByCategory(grouped);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="product-segments-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />

      {/* Hero */}
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Loja Integrativa</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">
            Produtos por Tratamento
          </h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">
            Cada terapia integrativa conta com produtos selecionados por nossos veterinários especialistas. Encontre o cuidado ideal para o seu pet.
          </p>
        </div>
      </section>

      {/* Segments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-12">
            {[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-3xl h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-16">
            {SEGMENTS.map(segment => {
              const products = (productsByCategory[segment.category] || []).slice(0, 4);
              if (products.length === 0) return null;
              return (
                <section key={segment.id} data-testid={`segment-${segment.id}`} className="scroll-mt-24">
                  {/* Segment Header */}
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
                    <div className="flex items-start gap-4 max-w-2xl">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${segment.color}15` }}>
                        <segment.icon className="w-6 h-6" style={{ color: segment.color }} />
                      </div>
                      <div>
                        <h2 className="font-['Outfit'] text-xl sm:text-2xl font-medium text-[#1A2E24]">{segment.title}</h2>
                        <p className="text-[#C87A5D] text-sm font-medium mt-0.5">{segment.subtitle}</p>
                        <p className="text-sm text-[#4A6B5A] leading-relaxed mt-2">{segment.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      {segment.link && (
                        <Link to={segment.link} className="text-xs border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5 rounded-full px-4 py-2 font-medium transition-all whitespace-nowrap">
                          Saiba mais
                        </Link>
                      )}
                      <Link to={`/produtos?categoria=${segment.category}`} className="text-xs bg-[#2C4C3B]/5 text-[#2C4C3B] hover:bg-[#2C4C3B]/10 rounded-full px-4 py-2 font-medium transition-all inline-flex items-center gap-1 whitespace-nowrap">
                        Ver todos <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(p => (
                      <ProductCard key={p.id} product={p} onBuy={setSelectedProduct} />
                    ))}
                  </div>

                  {/* Subtle CTA */}
                  <div className="mt-5 flex items-center gap-3 text-xs text-[#84978F]">
                    <Heart className="w-3.5 h-3.5 text-[#C87A5D]" />
                    <span>Nossos veterinários recomendam combinar produtos com consultas para resultados mais eficazes.</span>
                    <Link to="/consultas" className="text-[#2C4C3B] font-medium hover:underline whitespace-nowrap">Agendar consulta</Link>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <section className="mt-16 bg-[#2C4C3B] rounded-3xl p-10 sm:p-14 text-center">
          <Heart className="w-10 h-10 text-[#C87A5D] mx-auto mb-4" />
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0] mb-3">
            Não sabe qual tratamento escolher?
          </h2>
          <p className="text-[#F9F6F0]/70 mb-6 max-w-md mx-auto">
            Nossos especialistas podem avaliar o seu pet e recomendar o melhor protocolo integrativo personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/calculadora-tratamento" className="border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all">
              Calculadora de Tratamento
            </Link>
            <Link to="/consultas" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all">
              Agendar Consulta
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
