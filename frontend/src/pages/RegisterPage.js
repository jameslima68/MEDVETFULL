import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Eye, EyeOff } from 'lucide-react';

function formatApiErrorDetail(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map(e => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/dashboard');
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="register-page" className="min-h-screen bg-[#F9F6F0] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#2C4C3B] rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#F9F6F0]" />
            </div>
            <span className="font-['Outfit'] font-semibold text-xl text-[#1A2E24]">MEDVET <span className="text-[#84978F]">INTEGRATIVA</span></span>
          </Link>
          <h1 className="font-['Outfit'] text-3xl font-semibold text-[#1A2E24]">Criar sua conta</h1>
          <p className="text-sm text-[#4A6B5A] mt-2">Cadastre-se para agendar consultas e acompanhar pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-8 shadow-[0_8px_32px_rgba(44,76,59,0.04)] space-y-5">
          {error && (
            <div data-testid="register-error" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">Nome completo</label>
            <input required data-testid="register-name" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
              placeholder="Seu nome completo" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">E-mail</label>
            <input required type="email" data-testid="register-email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
              placeholder="seu@email.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">Telefone</label>
            <input data-testid="register-phone" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
              placeholder="(11) 99999-9999" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">Senha</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required data-testid="register-password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 pr-11 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="Minimo 6 caracteres" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#84978F]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} data-testid="register-submit"
            className="w-full bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all disabled:opacity-50">
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-[#4A6B5A]">
            Ja tem conta?{' '}
            <Link to="/login" data-testid="login-link" className="text-[#2C4C3B] font-medium hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
