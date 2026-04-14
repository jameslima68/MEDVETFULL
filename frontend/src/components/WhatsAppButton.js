import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20os%20tratamentos%20da%20MEDVET%20Integrativa."
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-fab"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
    </a>
  );
}
