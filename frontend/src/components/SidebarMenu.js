import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, ChevronRight, Leaf, Droplets, FlaskConical, Target, Sparkles, Rainbow, UtensilsCrossed, MessageCircle, Heart, User, LogOut, Shield, Award, Play } from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Homeopatia Veterinária', href: '/produtos?categoria=homeopatia', icon: Leaf },
  { label: 'Hormônios Bioidênticos', href: '/produtos?categoria=hormonios', icon: FlaskConical },
  { label: 'Acupuntura & Medicina Chinesa', href: '/acupuntura-mtc', icon: Target },
  { label: 'CBD para Pets', href: '/produtos?categoria=cbd', icon: Droplets },
  { label: 'Terapia Alimentar', href: '/terapia-alimentar', icon: UtensilsCrossed },
  { label: 'Saúde da Pelagem', href: '/guia-pelagem', icon: Sparkles },
  { label: 'Cromoterapia & Florais', href: '/produtos?categoria=cromoterapia', icon: Rainbow },
  { label: 'Suplementos Naturais', href: '/produtos?categoria=saúde-pelos', icon: Leaf },
  { label: 'Todas as Terapias', href: '/terapias', icon: Target },
  { label: 'Nossos Veterinários', href: '/equipe', icon: User },
  { label: 'Depoimentos', href: '/depoimentos', icon: Heart },
  { label: 'MEDVET TV', href: '/videos', icon: Play },
];

export default function SidebarMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      onClose();
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="sidebar-backdrop"
        className="fixed inset-0 bg-[#1A2E24]/50 backdrop-blur-sm z-[70] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        data-testid="sidebar-menu"
        className="fixed top-0 left-0 h-screen w-[340px] max-w-[85vw] bg-[#F9F6F0] z-[80] shadow-2xl flex flex-col animate-slide-in-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0DDD5]">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <img src="/api/static/medvet_logo.png" alt="MEDVET Integrativa" className="w-9 h-9 rounded-xl" />
            <span className="font-['Outfit'] font-semibold text-lg text-[#1A2E24]">
              MEDVET <span className="text-[#84978F]">INTEGRATIVA</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            data-testid="sidebar-close-btn"
            className="p-2 text-[#4A6B5A] hover:text-[#1A2E24] transition-colors rounded-lg hover:bg-[#2C4C3B]/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map((item, i) => (
            <Link
              key={i}
              to={item.href}
              data-testid={`sidebar-item-${i}`}
              className="flex items-center justify-between px-6 py-4 text-[#1A2E24] hover:bg-[#2C4C3B]/5 transition-colors group border-b border-[#E0DDD5]/50"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-[#84978F] group-hover:text-[#2C4C3B] transition-colors" />
                <span className="text-[15px] font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#84978F] group-hover:text-[#2C4C3B] group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}

          {/* User Section */}
          {user && user !== false && (
            <div className="border-t border-[#E0DDD5] mt-2 pt-2">
              <Link
                to="/dashboard"
                className="flex items-center justify-between px-6 py-4 text-[#1A2E24] hover:bg-[#2C4C3B]/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#84978F]" />
                  <span className="text-[15px] font-medium">Meu Painel</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#84978F]" />
              </Link>
              <Link
                to="/fidelidade"
                className="flex items-center justify-between px-6 py-4 text-[#1A2E24] hover:bg-[#2C4C3B]/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#84978F]" />
                  <span className="text-[15px] font-medium">Meus Pontos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#84978F]" />
              </Link>
              <Link
                to="/meus-pets"
                className="flex items-center justify-between px-6 py-4 text-[#1A2E24] hover:bg-[#2C4C3B]/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-[#84978F]" />
                  <span className="text-[15px] font-medium">Meus Pets</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#84978F]" />
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center justify-between px-6 py-4 text-[#C87A5D] hover:bg-[#C87A5D]/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span className="text-[15px] font-medium">Painel Admin</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <button
                onClick={() => { logout(); onClose(); }}
                className="flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[15px] font-medium">Sair</span>
              </button>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#E0DDD5] px-6 py-4 flex items-center gap-6">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contate o suporte</span>
          </a>
          <Link to="/missao" className="flex items-center gap-2 text-sm text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors">
            <Heart className="w-4 h-4" />
            <span>Sobre nós</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
