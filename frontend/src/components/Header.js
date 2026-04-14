import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Leaf, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

const NAV_LINKS = [
  { label: 'Produtos', href: '/produtos' },
  { label: 'Dicas', href: '/dicas' },
  { label: 'Consultas', href: '/consultas' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header data-testid="main-header" className="sticky top-0 z-50 backdrop-blur-xl bg-[#F9F6F0]/80 border-b border-[#2C4C3B]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#2C4C3B] rounded-xl flex items-center justify-center group-hover:bg-[#1A2E24] transition-colors">
              <Leaf className="w-5 h-5 text-[#F9F6F0]" />
            </div>
            <span className="font-['Outfit'] font-semibold text-lg text-[#1A2E24] hidden sm:block">
              MEDVET <span className="text-[#84978F]">INTEGRATIVA</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-${link.label.toLowerCase()}`}
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
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 ${isActive(link.href) ? 'text-[#2C4C3B]' : 'text-[#4A6B5A]'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[#E0DDD5] space-y-2">
              {user && user !== false ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-[#2C4C3B] py-2">Meu Painel</Link>
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
    </header>
  );
}
