import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, User, Search, Filter } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'acupuntura', label: 'Acupuntura' },
  { id: 'fitoterapia', label: 'Fitoterapia' },
  { id: 'ozonioterapia', label: 'Ozonioterapia' },
  { id: 'reiki', label: 'Reiki' },
  { id: 'florais', label: 'Florais' },
  { id: 'fisioterapia', label: 'Fisioterapia' },
  { id: 'regenerativa', label: 'Regenerativa' },
  { id: 'nutricao', label: 'Nutricao' },
];

function BlogArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/blog/${id}`)
      .then(r => setArticle(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin" /></div>;
  if (!article) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-[#4A6B5A]">Artigo nao encontrado.</div>;

  return (
    <div data-testid="blog-article-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[#F9F6F0]/80 hover:text-[#F9F6F0] text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Blog
          </Link>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-[#F9F6F0]">{article.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 text-sm text-[#84978F] mb-8">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{article.author}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.read_time}</span>
          <span>{article.date}</span>
          <span className="bg-[#2C4C3B]/10 text-[#2C4C3B] px-2 py-0.5 rounded-full text-xs font-bold">{article.category}</span>
        </div>
        <div className="prose max-w-none">
          <p className="text-lg font-medium text-[#1A2E24] mb-6">{article.excerpt}</p>
          {article.content.split('. ').reduce((acc, sentence, i) => {
            const pIdx = Math.floor(i / 4);
            if (!acc[pIdx]) acc[pIdx] = [];
            acc[pIdx].push(sentence);
            return acc;
          }, []).map((para, i) => (
            <p key={i} className="text-[#4A6B5A] leading-relaxed mb-4">{para.join('. ')}.</p>
          ))}
        </div>
        <div className="mt-10 flex gap-4">
          <Link to="/consultas" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-3 text-sm font-medium transition-all">Agendar Consulta</Link>
          <Link to="/terapias" className="border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5 rounded-full px-6 py-3 text-sm font-medium transition-all">Ver Terapias</Link>
        </div>
      </div>
    </div>
  );
}

function BlogList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    if (filter) params.category = filter;
    axios.get(`${API}/blog`, { params })
      .then(r => setArticles(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div data-testid="blog-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Blog</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Artigos Completos</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Conteudo aprofundado sobre cada terapia integrativa, escrito por nossos especialistas.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84978F]" />
            <input type="text" placeholder="Buscar artigos..." value={search} onChange={e => setSearch(e.target.value)} data-testid="blog-search" className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl pl-11 pr-4 py-3 text-[#1A2E24] text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#84978F]" />
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setFilter(c.id); setLoading(true); }} data-testid={`blog-filter-${c.id || 'all'}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === c.id ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-3xl h-80 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#84978F]">Nenhum artigo encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => (
              <Link to={`/blog/${a.id}`} key={a.id} data-testid={`blog-card-${a.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#2C4C3B] text-[#F9F6F0] text-xs font-bold px-3 py-1 rounded-full">{a.category}</span>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#84978F]">
                    <span>{a.date}</span>
                    <span className="w-1 h-1 bg-[#84978F] rounded-full" />
                    <span>{a.read_time}</span>
                  </div>
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] group-hover:text-[#2C4C3B] transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-sm text-[#4A6B5A] line-clamp-2">{a.excerpt}</p>
                  <p className="text-xs font-medium text-[#84978F]">Por {a.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { BlogList, BlogArticle };
