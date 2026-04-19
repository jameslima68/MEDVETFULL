import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Leaf, User, LogOut, ChevronDown, Shield, Award, Target, Sparkles, BookOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import SidebarMenu from './SidebarMenu';

const NAV_LINKS = [
  { label: 'Nossa Missão', href: '/missao' },
  { label: 'Produtos', href: '/loja' },
  { label: 'Vídeos', href: '/videos' },
];

const THERAPY_LINKS = [
  { label: 'Todas as Terapias', href: '/terapias' },
  { label: 'Acupuntura & MTC', href: '/acupuntura-mtc' },
  { label: 'Blog de Terapias', href: '/blog' },
  { label: 'Calculadora de Tratamento', href: '/calculadora-tratamento' },
  { label: 'Quiz: Elemento do Pet', href: '/quiz-elemento' },
  { label: 'Guia de Pelagem', href: '/guia-pelagem' },
];

const NAV_LINKS_2 = [
  { label: 'Equipe', href: '/equipe' },
  { label: 'Depoimentos', href: '/depoimentos' },
  { label: 'Consultas', href: '/consultas' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header data-testid="main-header" className="sticky top-0 z-50 backdrop-blur-xl bg-[#F9F6F0]/80 border-b border-[#2C4C3B]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              data-testid="sidebar-trigger"
              className="p-2 text-[#2C4C3B] hover:bg-[#2C4C3B]/5 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
            <img src="/api/static/medvet_logo.png" alt="MEDVET Integrativa" className="w-9 h-9 rounded-xl" />
            <span className="font-['Outfit'] font-semibold text-lg text-[#1A2E24] hidden sm:block">
              MEDVET <span className="text-[#84978F]">INTEGRATIVA</span>
            </span>
          </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-[#2C4C3B]' : 'text-[#4A6B5A] hover:text-[#2C4C3B]'}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Terapias Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="nav-terapias" className={`flex items-center gap-1 text-sm font-medium transition-colors outline-none ${['/terapias','/acupuntura-mtc','/guia-pelagem','/quiz-elemento'].includes(location.pathname) ? 'text-[#2C4C3B]' : 'text-[#4A6B5A] hover:text-[#2C4C3B]'}`}>
                Terapias <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="bg-white border border-[#E0DDD5] rounded-xl w-52">
                {THERAPY_LINKS.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="flex items-center gap-2 cursor-pointer text-sm">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {NAV_LINKS_2.map(link => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-[#2C4C3B]' : 'text-[#4A6B5A] hover:text-[#2C4C3B]'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user && user !== false ? (
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="user-menu-trigger" className="flex items-center gap-2 text-sm font-medium text-[#2C4C3B] hover:text-[#1A2E24] transition-colors outline-none">
                  <div className="w-8 h-8 bg-[#84978F] rounded-full flex items-center justify-center text-[#F9F6F0] text-xs font-bold">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border border-[#E0DDD5]">
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" data-testid="admin-link" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-4 h-4" /> Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" data-testid="dashboard-link" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Meu Painel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/fidelidade" data-testid="loyalty-link" className="flex items-center gap-2 cursor-pointer">
                      <Award className="w-4 h-4" /> Meus Pontos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="logout-btn" onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" data-testid="login-link" className="text-sm font-medium text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors">
                  Entrar
                </Link>
                <Link to="/consultas" data-testid="cta-schedule" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-2.5 text-sm font-medium transition-all">
                  Agendar Consulta
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button data-testid="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[#2C4C3B]">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div data-testid="mobile-menu" className="md:hidden bg-[#F9F6F0] border-t border-[#E0DDD5] animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {[...NAV_LINKS, ...THERAPY_LINKS.map(l => ({...l, sub: true})), ...NAV_LINKS_2].map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 ${link.sub ? 'pl-4 text-[#84978F]' : ''} ${isActive(link.href) ? 'text-[#2C4C3B]' : 'text-[#4A6B5A]'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E0DDD5] space-y-2">
              {user && user !== false ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#2C4C3B] py-2">Meu Painel</Link>
                  <Link to="/fidelidade" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#84978F] py-2">Meus Pontos</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#C87A5D] py-2">Admin</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-red-600 py-2">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#4A6B5A] py-2">Entrar</Link>
                  <Link to="/consultas" onClick={() => setMobileOpen(false)} className="block bg-[#2C4C3B] text-[#F9F6F0] rounded-full px-6 py-2.5 text-sm font-medium text-center">Agendar Consulta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  );
}
