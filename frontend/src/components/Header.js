import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Shield, Award, Stethoscope, PawPrint, Calendar, Newspaper } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import SidebarMenu from './SidebarMenu';
import LangSelector from './LangSelector';
import { useLang } from '../contexts/LangContext';

const BOTTOM_NAV = [
  { label: 'Nossa Missão', href: '/missao', tKey: 'nav.mission' },
  { label: 'Equipe', href: '/equipe', tKey: 'nav.team' },
  { label: 'Terapias', href: '/terapias', tKey: 'nav.therapies' },
  { label: 'Produtos', href: '/loja', tKey: 'nav.products' },
  { label: 'Vídeos', href: '/videos', tKey: 'nav.videos' },
  { label: 'Depoimentos', href: '/depoimentos', tKey: 'nav.testimonials' },
  { label: 'Cursos', href: '/cursos', tKey: 'nav.courses' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLang();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <header data-testid="main-header" className="sticky top-0 z-50">
        {/* TOP BAR - Principal Navigation */}
        <div className="bg-[#2C4C3B] text-[#F9F6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12 sm:h-14">
              {/* Left: Sidebar + Logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  data-testid="sidebar-trigger"
                  className="p-1.5 text-[#F9F6F0]/70 hover:text-[#F9F6F0] hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
                  <img src="/api/static/medvet_logo.png" alt="MEDVET Integrativa" className="w-8 h-8 rounded-lg bg-white p-0.5" />
                  <span className="font-['Outfit'] font-semibold text-base text-[#F9F6F0] hidden sm:block">
                    MEDVET <span className="text-[#C87A5D]">INTEGRATIVA</span>
                  </span>
                </Link>
              </div>

              {/* Center: For Tutors | For Vets */}
              <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-full p-1">
                <Link
                  to="/"
                  data-testid="nav-for-tutors"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${['/', '/loja', '/produtos', '/meus-pets', '/depoimentos'].some(p => location.pathname === p) ? 'bg-white text-[#2C4C3B]' : 'text-[#F9F6F0]/80 hover:text-[#F9F6F0]'}`}
                >
                  <PawPrint className="w-3.5 h-3.5" /> Para Tutores
                </Link>
                <Link
                  to="/portal-vet"
                  data-testid="nav-for-vets"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${['/portal-vet', '/cursos'].some(p => location.pathname.startsWith(p)) ? 'bg-[#C87A5D] text-white' : 'text-[#F9F6F0]/80 hover:text-[#F9F6F0]'}`}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Para Veterinários
                </Link>
              </div>

              {/* Right: Quick Actions */}
              <div className="flex items-center gap-2">
                <LangSelector />
                {user && user !== false ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger data-testid="user-menu-trigger" className="flex items-center gap-1.5 text-xs font-medium text-[#F9F6F0]/80 hover:text-[#F9F6F0] outline-none">
                      <div className="w-7 h-7 bg-[#C87A5D] rounded-full flex items-center justify-center text-[#F9F6F0] text-[10px] font-bold">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:inline">{user.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-[#E0DDD5] rounded-xl">
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" data-testid="admin-link" className="flex items-center gap-2 cursor-pointer text-sm">
                            <Shield className="w-4 h-4" /> Admin
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" data-testid="dashboard-link" className="flex items-center gap-2 cursor-pointer text-sm">
                          <User className="w-4 h-4" /> Meu Painel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/meus-pets" className="flex items-center gap-2 cursor-pointer text-sm">
                          <PawPrint className="w-4 h-4" /> Meus Pets
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/fidelidade" data-testid="loyalty-link" className="flex items-center gap-2 cursor-pointer text-sm">
                          <Award className="w-4 h-4" /> Meus Pontos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid="logout-btn" onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600 text-sm">
                        <LogOut className="w-4 h-4" /> Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Link to="/login" data-testid="login-link" className="text-xs font-medium text-[#F9F6F0]/70 hover:text-[#F9F6F0] transition-colors hidden sm:block">
                      {t('nav.login')}
                    </Link>
                    <Link to="/consultas" data-testid="cta-schedule" className="bg-[#C87A5D] hover:bg-[#B3674C] text-[#F9F6F0] rounded-full px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('nav.schedule')}</span><span className="sm:hidden">{t('nav.schedule')}</span>
                    </Link>
                  </>
                )}

                {/* Mobile Toggle */}
                <button data-testid="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 text-[#F9F6F0]/70 hover:text-[#F9F6F0]">
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR - Content Navigation */}
        <div className="bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-[#E0DDD5] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-center gap-1 h-10 overflow-x-auto">
              {BOTTOM_NAV.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-testid={`nav-bottom-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${isActive(link.href) ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'text-[#4A6B5A] hover:text-[#2C4C3B] hover:bg-[#2C4C3B]/5'}`}
                >
                  {link.tKey ? t(link.tKey) : link.label}
                </Link>
              ))}
              <Link
                to="/noticias"
                data-testid="nav-bottom-news"
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${isActive('/noticias') ? 'bg-[#C87A5D] text-white' : 'bg-[#C87A5D]/10 text-[#C87A5D] hover:bg-[#C87A5D]/20'}`}
              >
                <Newspaper className="w-3 h-3" /> MEDVET News
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div data-testid="mobile-menu" className="fixed inset-0 top-12 z-40 bg-[#F9F6F0] md:hidden animate-fade-in overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {/* For Tutors / For Vets */}
            <div className="flex gap-2 mb-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#2C4C3B] text-white rounded-xl py-3 text-sm font-medium">
                <PawPrint className="w-4 h-4" /> Para Tutores
              </Link>
              <Link to="/portal-vet" onClick={() => setMobileOpen(false)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#C87A5D] text-white rounded-xl py-3 text-sm font-medium">
                <Stethoscope className="w-4 h-4" /> Para Veterinários
              </Link>
            </div>
            {BOTTOM_NAV.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2.5 px-3 rounded-lg ${isActive(link.href) ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'text-[#4A6B5A]'}`}
              >
                {link.tKey ? t(link.tKey) : link.label}
              </Link>
            ))}
            <Link to="/noticias" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-bold py-2.5 px-3 rounded-lg text-[#C87A5D] bg-[#C87A5D]/5">
              <Newspaper className="w-4 h-4" /> MEDVET News
            </Link>
            <div className="pt-3 border-t border-[#E0DDD5] space-y-1">
              {user && user !== false ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#2C4C3B] py-2.5 px-3">Meu Painel</Link>
                  <Link to="/meus-pets" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#4A6B5A] py-2.5 px-3">Meus Pets</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#C87A5D] py-2.5 px-3">Admin</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm font-medium text-red-600 py-2.5 px-3 w-full text-left">Sair</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#4A6B5A] py-2.5 px-3">Entrar</Link>
                  <Link to="/consultas" onClick={() => setMobileOpen(false)} className="block bg-[#2C4C3B] text-[#F9F6F0] rounded-xl px-6 py-3 text-sm font-medium text-center">Agendar Consulta</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
