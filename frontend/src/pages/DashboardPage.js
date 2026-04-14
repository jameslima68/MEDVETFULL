import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Tag, FileText, ChevronRight, Shield } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user !== false) {
      axios.get(`${API}/consultations`, { withCredentials: true })
        .then(res => setConsultations(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user === false) return <Navigate to="/login" />;

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-[#F9F6F0]">
      <div className="bg-[#2C4C3B] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Meu Painel</span>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold tracking-tight text-[#F9F6F0] mt-2">
            Ola, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-[#F9F6F0]/70 mt-2">Gerencie suas consultas e acompanhe seus tratamentos.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Actions */}
        <div className={`grid grid-cols-1 ${user.role === 'admin' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4 mb-10`}>
          {user.role === 'admin' && (
            <Link to="/admin" data-testid="quick-admin" className="bg-[#C87A5D]/10 border border-[#C87A5D]/20 rounded-2xl p-6 hover:shadow-md transition-all group">
              <Shield className="w-8 h-8 text-[#C87A5D] mb-3" />
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Painel Admin</h3>
              <p className="text-sm text-[#4A6B5A] mt-1">Gerenciar produtos e pagamentos</p>
              <ChevronRight className="w-5 h-5 text-[#C87A5D] mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <Link to="/consultas" data-testid="quick-schedule" className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-6 hover:shadow-md transition-all group">
            <Calendar className="w-8 h-8 text-[#2C4C3B] mb-3" />
            <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Agendar Consulta</h3>
            <p className="text-sm text-[#4A6B5A] mt-1">Marque um atendimento com nossos especialistas</p>
            <ChevronRight className="w-5 h-5 text-[#84978F] mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/produtos" data-testid="quick-products" className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-6 hover:shadow-md transition-all group">
            <Tag className="w-8 h-8 text-[#2C4C3B] mb-3" />
            <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Ver Produtos</h3>
            <p className="text-sm text-[#4A6B5A] mt-1">Explore nosso catalogo de tratamentos</p>
            <ChevronRight className="w-5 h-5 text-[#84978F] mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dicas" data-testid="quick-tips" className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-6 hover:shadow-md transition-all group">
            <FileText className="w-8 h-8 text-[#2C4C3B] mb-3" />
            <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Dicas & Blog</h3>
            <p className="text-sm text-[#4A6B5A] mt-1">Conteudo educacional de especialistas</p>
            <ChevronRight className="w-5 h-5 text-[#84978F] mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Consultations */}
        <div>
          <h2 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-6">Minhas Consultas</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white/40 rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : consultations.length === 0 ? (
            <div data-testid="no-consultations" className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-10 text-center">
              <Calendar className="w-12 h-12 text-[#84978F] mx-auto mb-4" />
              <p className="text-[#4A6B5A] mb-4">Voce ainda nao tem consultas agendadas.</p>
              <Link to="/consultas" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-2.5 text-sm font-medium transition-all inline-block">
                Agendar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map(c => (
                <div key={c.id} data-testid={`consultation-item-${c.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-[#2C4C3B]" />
                    </div>
                    <div>
                      <p className="font-['Outfit'] font-medium text-[#1A2E24]">{c.category}</p>
                      <p className="text-sm text-[#4A6B5A]">Pet: {c.pet_name} ({c.pet_type})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#84978F]">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{c.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{c.time}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'pending' ? 'bg-[#C87A5D]/10 text-[#C87A5D]' : 'bg-[#2C4C3B]/10 text-[#2C4C3B]'}`}>
                    {c.status === 'pending' ? 'Pendente' : 'Confirmada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
