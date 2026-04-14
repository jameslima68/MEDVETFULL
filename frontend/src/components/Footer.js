import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="main-footer" className="bg-[#2C4C3B] text-[#F9F6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#F9F6F0]/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#F9F6F0]" />
              </div>
              <span className="font-['Outfit'] font-semibold text-lg">
                MEDVET <span className="text-[#84978F]">INTEGRATIVA</span>
              </span>
            </div>
            <p className="text-sm text-[#F9F6F0]/70 leading-relaxed">
              Cuidado integrado e natural para o seu pet. Homeopatia, acupuntura, CBD e mais.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-['Outfit'] font-medium text-sm mb-4 text-[#F9F6F0]/90">Tratamentos</h4>
            <ul className="space-y-2.5">
              {['Homeopatia', 'Hormonios Bioidenticos', 'Medicina Chinesa', 'CBD para Pets', 'Acupuntura', 'Saude dos Pelos'].map(item => (
                <li key={item}>
                  <Link to="/produtos" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-['Outfit'] font-medium text-sm mb-4 text-[#F9F6F0]/90">Empresa</h4>
            <ul className="space-y-2.5">
              <li><Link to="/missao" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Nossa Missao</Link></li>
              <li><Link to="/guia-pelagem" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Guia de Pelagem</Link></li>
              <li><Link to="/assinaturas" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Assinaturas</Link></li>
              <li><Link to="/dicas" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Blog & Dicas</Link></li>
              <li><Link to="/consultas" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Agendar Consulta</Link></li>
              <li><Link to="/login" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] transition-colors">Minha Conta</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Outfit'] font-medium text-sm mb-4 text-[#F9F6F0]/90">Contato</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-[#F9F6F0]/60">
                <Phone className="w-4 h-4 flex-shrink-0" /> (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm text-[#F9F6F0]/60">
                <Mail className="w-4 h-4 flex-shrink-0" /> contato@medvetintegrativa.com
              </li>
              <li className="flex items-start gap-2 text-sm text-[#F9F6F0]/60">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> Sao Paulo, SP - Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F9F6F0]/10 text-center">
          <p className="text-xs text-[#F9F6F0]/40">
            2025 MEDVET Integrativa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
