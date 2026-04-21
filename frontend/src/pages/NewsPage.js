import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Newspaper, ExternalLink, Calendar, User, BookOpen, Mail, Check, ArrowRight, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'acupuntura', label: 'Acupuntura' },
  { value: 'cbd', label: 'CBD' },
  { value: 'ozonioterapia', label: 'Ozonioterapia' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'fitoterapia', label: 'Fitoterapia' },
  { value: 'florais', label: 'Florais' },
  { value: 'celulas', label: 'Células-Tronco' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'prp', label: 'PRP' },
  { value: 'homeopatia', label: 'Homeopatia' },
];

function NewsCard({ article }) {
  return (
    <div data-testid={`news-card-${article.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-6 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2C4C3B]/10 text-[#2C4C3B] px-2.5 py-0.5 rounded-full">{article.category}</span>
        <span className="text-[10px] text-[#84978F] flex items-center gap-1 flex-shrink-0"><Calendar className="w-3 h-3" /> {article.date}</span>
      </div>
      <h3 className="font-['Outfit'] text-base font-medium text-[#1A2E24] leading-snug mb-2 group-hover:text-[#2C4C3B] transition-colors">{article.title}</h3>
      <div className="flex items-center gap-3 mb-3 text-[10px] text-[#84978F]">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {article.source}</span>
        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
      </div>
      <p className="text-sm text-[#4A6B5A] leading-relaxed mb-4">{article.summary}</p>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C87A5D] hover:text-[#B3674C] transition-colors"
      >
        Ver publicação original <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter/subscribe`, { email });
      setSubscribed(true);
      toast.success('E-mail cadastrado com sucesso!');
    } catch {
      toast.error('Erro ao cadastrar e-mail');
    } finally { setLoading(false); }
  };

  const handleUnsubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter/unsubscribe`, { email });
      toast.success('E-mail descadastrado da newsletter');
      setEmail('');
      setSubscribed(false);
    } catch {
      toast.error('E-mail não encontrado');
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="newsletter-form" className="bg-[#2C4C3B] rounded-3xl p-8 sm:p-10 text-center">
      <Mail className="w-10 h-10 text-[#C87A5D] mx-auto mb-4" />
      <h2 className="font-['Outfit'] text-2xl font-medium text-[#F9F6F0] mb-2">MEDVET News na sua caixa de entrada</h2>
      <p className="text-[#F9F6F0]/60 text-sm mb-6 max-w-md mx-auto">
        Receba semanalmente os estudos científicos mais relevantes sobre medicina veterinária integrativa e tradicional.
      </p>
      {subscribed ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#C87A5D]">
            <Check className="w-5 h-5" />
            <span className="font-medium">Inscrito com sucesso!</span>
          </div>
          <button onClick={handleUnsubscribe} className="text-xs text-[#F9F6F0]/40 hover:text-[#F9F6F0]/60 underline transition-colors">
            Descadastrar este e-mail
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            data-testid="newsletter-email"
            required
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-[#F9F6F0] placeholder-[#F9F6F0]/40 focus:outline-none focus:ring-1 focus:ring-[#C87A5D]"
          />
          <button
            type="submit"
            disabled={loading}
            data-testid="newsletter-submit"
            className="bg-[#C87A5D] hover:bg-[#B3674C] text-white rounded-full px-6 py-3 text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? '...' : <><ArrowRight className="w-4 h-4" /> Inscrever</>}
          </button>
        </form>
      )}
      <p className="text-[10px] text-[#F9F6F0]/30 mt-4">Você pode descadastrar a qualquer momento. Sem spam.</p>
    </div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const url = filter ? `${API}/news?category=${filter}` : `${API}/news`;
    axios.get(url).then(r => setNews(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div data-testid="news-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />

      {/* Hero */}
      <section className="bg-[#2C4C3B] py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-5">
            <Newspaper className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">MEDVET News</span>
          </div>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#F9F6F0]">
            Ciência Veterinária <span className="text-[#C87A5D]">Atualizada</span>
          </h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
            Estudos científicos dos principais portais do mundo sobre medicina veterinária integrativa e tradicional, atualizados semanalmente.
          </p>
        </div>
      </section>

      {/* Filter */}
      <div className="sticky top-[88px] sm:top-[96px] z-20 bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-[#E0DDD5]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-hide">
            <Search className="w-4 h-4 text-[#84978F] flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setFilter(cat.value); setLoading(true); }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === cat.value ? 'bg-[#2C4C3B] text-white' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16 text-[#84978F]">
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma notícia encontrada para este filtro.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-12">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
