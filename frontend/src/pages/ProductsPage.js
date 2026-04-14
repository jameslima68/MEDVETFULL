import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal, ShoppingCart, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Slider } from '../components/ui/slider';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [activePrice, setActivePrice] = useState(false);
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get('categoria') || '';

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (activePrice) {
        params.min_price = priceRange[0];
        params.max_price = priceRange[1];
      }
      if (searchTerm) params.search = searchTerm;
      const { data } = await axios.get(`${API}/products`, { params });
      setProducts(data);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activePrice, priceRange, searchTerm]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleBuy = (product) => {
    const origin = window.location.origin;
    axios.post(`${API}/checkout`, { product_id: product.id, origin_url: origin })
      .then(res => { window.location.href = res.data.url; })
      .catch(() => alert('Erro ao iniciar pagamento. Tente novamente.'));
  };

  const clearPriceFilter = () => {
    setActivePrice(false);
    setPriceRange([0, 2000]);
  };

  return (
    <div data-testid="products-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Catalogo</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Nossos Produtos</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Tratamentos naturais e integradores para a saude do seu animal.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84978F]" />
              <input
                type="text"
                data-testid="product-search"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl pl-11 pr-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
              />
            </div>
            {/* Price Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-testid="price-filter-trigger"
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${activePrice ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activePrice ? `R$ ${priceRange[0]} - R$ ${priceRange[1]}` : 'Filtrar por preco'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white border border-[#E0DDD5] rounded-2xl p-6" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-['Outfit'] font-medium text-[#1A2E24]">Faixa de Preco</h4>
                    {activePrice && (
                      <button onClick={clearPriceFilter} className="text-xs text-[#C87A5D] hover:underline">Limpar</button>
                    )}
                  </div>
                  <Slider
                    data-testid="price-slider"
                    min={0}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between text-sm text-[#4A6B5A]">
                    <span>R$ {priceRange[0].toFixed(0)}</span>
                    <span>R$ {priceRange[1].toFixed(0)}</span>
                  </div>
                  <button
                    data-testid="apply-price-filter"
                    onClick={() => setActivePrice(true)}
                    className="w-full bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-4 py-2.5 text-sm font-medium transition-all"
                  >
                    Aplicar Filtro
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* Category Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#84978F]" />
            <button
              data-testid="filter-all"
              onClick={() => setSearchParams({})}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!activeCategory ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
            >
              Todos
            </button>
            {categories.filter(c => c.slug !== 'dicas').map(cat => (
              <button
                key={cat.slug}
                data-testid={`filter-${cat.slug}`}
                onClick={() => setSearchParams({ categoria: cat.slug })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
              >
                {cat.name}
              </button>
            ))}
            {activePrice && (
              <button onClick={clearPriceFilter} className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-[#C87A5D]/10 text-[#C87A5D]">
                R$ {priceRange[0]}-{priceRange[1]} <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-sm text-[#84978F]">{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white/40 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div data-testid="no-products" className="text-center py-20">
            <p className="text-[#4A6B5A] text-lg">Nenhum produto encontrado.</p>
            <button onClick={() => { setSearchTerm(''); clearPriceFilter(); setSearchParams({}); }} className="mt-4 text-[#2C4C3B] font-medium hover:underline text-sm">Limpar filtros</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} data-testid={`product-card-${product.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-[0_12px_48px_rgba(44,76,59,0.08)] transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#C87A5D] text-[#F9F6F0] text-xs font-bold px-3 py-1 rounded-full">Destaque</span>
                    </div>
                  )}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-[#1A2E24]/50 flex items-center justify-center">
                      <span className="bg-white/90 text-[#1A2E24] text-sm font-bold px-4 py-2 rounded-full">Indisponivel</span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#84978F]">{product.category}</span>
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{product.name}</h3>
                  <p className="text-sm text-[#4A6B5A] line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-['Outfit'] text-xl font-semibold text-[#2C4C3B]">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={!product.in_stock}
                      data-testid={`product-buy-${product.id}`}
                      className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
