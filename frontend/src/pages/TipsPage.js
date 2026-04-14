import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, User } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function TipDetail() {
  const { id } = useParams();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/tips/${id}`)
      .then(res => setTip(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin" /></div>;
  if (!tip) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-[#4A6B5A]">Artigo não encontrado.</div>;

  return (
    <div data-testid="tip-detail-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={tip.image_url} alt={tip.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
          <Link to="/dicas" className="inline-flex items-center gap-2 text-[#F9F6F0]/80 hover:text-[#F9F6F0] text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-[#F9F6F0]">{tip.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 text-sm text-[#84978F] mb-8">
          <span className="flex items-center gap-1"><User className="w-4 h-4" />{tip.author}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{tip.read_time}</span>
          <span>{tip.date}</span>
        </div>
        <div className="prose prose-green max-w-none text-[#4A6B5A] leading-relaxed">
          <p className="text-lg font-medium text-[#1A2E24] mb-6">{tip.excerpt}</p>
          <p>{tip.content}</p>
        </div>
      </div>
    </div>
  );
}

function TipsList() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/tips`)
      .then(res => setTips(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="tips-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Blog</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Dicas de Especialistas</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Conteúdo educacional sobre medicina veterinária integrativa.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-3xl h-80 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map(tip => (
              <Link to={`/dicas/${tip.id}`} key={tip.id} data-testid={`tip-card-${tip.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)] hover:shadow-[0_12px_48px_rgba(44,76,59,0.08)] transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
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
                  <p className="text-xs font-medium text-[#84978F]">Por {tip.author}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { TipsList, TipDetail };
