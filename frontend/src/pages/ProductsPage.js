import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const activeCategory = searchParams.get('categoria') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/categories`),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (e) {
        console.error('Error loading products:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div data-testid="products-page" className="min-h-screen bg-[#F9F6F0]">
      {/* Header */}
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Catalogo</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Nossos Produtos</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Tratamentos naturais e integradores para a saude do seu animal.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
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
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white/40 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div data-testid="no-products" className="text-center py-20">
            <p className="text-[#4A6B5A] text-lg">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
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
                    <a
                      href={`https://wa.me/5511999999999?text=Ola!%20Gostaria%20de%20saber%20mais%20sobre%20o%20produto%20${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`product-whatsapp-${product.id}`}
                      className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2 text-sm font-medium transition-all"
                    >
                      Consultar
                    </a>
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
