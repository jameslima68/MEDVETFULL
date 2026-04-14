import { Link } from 'react-router-dom';
import { Star, Mail, Phone, Award, Heart, MapPin } from 'lucide-react';

const MENTOR = {
  name: 'Dra. Tabatha Novikov',
  role: 'Mentora & Fundadora',
  specialty: 'Medicina Veterinaria Integrativa',
  crmv: 'CRMV-SP 21194',
  location: 'Sao Paulo - SP',
  bio: 'Visionaria e apaixonada pela saude animal, a Dra. Tabatha Novikov e a mente e o coracao por tras da MEDVET Integrativa. Com formacao em Medicina Veterinaria e especializacoes em Acupuntura, Medicina Tradicional Chinesa, Fitoterapia, Homeopatia e Terapias Bioenergeticas, Tabatha dedicou sua carreira a integrar o melhor da ciencia moderna com a sabedoria milenar das medicinas ancestrais. Sua abordagem unica combina diagnostico energetico, tratamentos personalizados e um profundo respeito pela individualidade de cada animal. Acredita que a verdadeira cura comeca pelo amor e que cada pet merece ser tratado como um ser completo — corpo, mente e espirito.',
  philosophy: 'Minha missao e mostrar que existe um caminho mais natural, mais humano e mais eficaz de cuidar dos nossos companheiros. A medicina integrativa nao nega a ciencia — ela a amplia com milhares de anos de sabedoria.',
  specialties: ['Acupuntura & MTC', 'Fitoterapia Chinesa', 'Homeopatia', 'Ozonioterapia', 'Terapia Neural', 'Nutricao Funcional'],
  email: 'tabatha@medvetintegrativa.com',
  phone: '(11) 99999-0001',
  image: 'https://customer-assets.emergentagent.com/job_holistic-vet-shop/artifacts/ausjnm3m_Tabatha%20Novikok.webp'
};

const TEAM = [
  { name: 'Dr. Paulo Henrique Viana', specialty: 'Acupuntura & Eletroacupuntura', bio: 'Especialista em acupuntura veterinaria com mais de 12 anos de experiencia. Formado pela ANCLIVEPA-SP em MTC, atua com foco em dor cronica, reabilitacao neurologica e displasia.', crmv: 'CRMV-SP 00001', email: 'paulo@medvetintegrativa.com', phone: '(11) 99999-0002', image: 'https://images.unsplash.com/photo-1770836037816-4445dbd449fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJpYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGRvY3RvciUyMHBldHxlbnwwfHx8fDE3NzYxOTAyMjB8MA&ixlib=rb-4.1.0&q=85', color: 'bg-[#2C4C3B]' },
  { name: 'Dra. Camila Santos', specialty: 'CBD & Fitoterapia', bio: 'Pioneira no uso terapeutico de CBD veterinario no Brasil. Pesquisadora em canabinoides e fitoterapia chinesa, com especializacao em manejo de dor e epilepsia refrataria.', crmv: 'CRMV-RJ 00002', email: 'camila@medvetintegrativa.com', phone: '(11) 99999-0003', image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwZG9jdG9yJTIwY2xpbmljfGVufDB8fHx8MTc3NjE5MDIyMXww&ixlib=rb-4.1.0&q=85', color: 'bg-[#84978F]' },
  { name: 'Dra. Juliana Ferreira', specialty: 'Nutricao Funcional & Ayurveda', bio: 'Formada em nutricao veterinaria integrativa com especializacao em dietoterapia chinesa e principios ayurvedicos. Referencia em saude da pelagem e nutricao personalizada.', crmv: 'CRMV-MG 00003', email: 'juliana@medvetintegrativa.com', phone: '(11) 99999-0004', image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwZG9jdG9yJTIwY2xpbmljfGVufDB8fHx8MTc3NjE5MDIyMXww&ixlib=rb-4.1.0&q=85', color: 'bg-[#C87A5D]' },
  { name: 'Dr. Ricardo Lima', specialty: 'Fisioterapia & Reabilitacao', bio: 'Especialista em fisioterapia veterinaria, hidroterapia e quiropraxia animal. Foco em reabilitacao pos-cirurgica, paralisia e mobilidade de pets idosos.', crmv: 'CRMV-SP 00004', email: 'ricardo@medvetintegrativa.com', phone: '(11) 99999-0005', image: 'https://images.unsplash.com/photo-1596058939740-516d0d71f3d4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHx2ZXRlcmluYXJpYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGRvY3RvciUyMHBldHxlbnwwfHx8fDE3NzYxOTAyMjB8MA&ixlib=rb-4.1.0&q=85', color: 'bg-[#A4B8C4]' },
  { name: 'Dra. Renata Campos', specialty: 'Cromoterapia & Florais', bio: 'Terapeuta holisticacom formacao em cromoterapia, florais de Bach e Reiki animal. Atua com equilibrio emocional, traumas comportamentais e terapias energeticas.', crmv: 'CRMV-PR 00005', email: 'renata@medvetintegrativa.com', phone: '(11) 99999-0006', image: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwZG9jdG9yJTIwY2xpbmljfGVufDB8fHx8MTc3NjE5MDIyMXww&ixlib=rb-4.1.0&q=85', color: 'bg-[#84978F]' },
  { name: 'Dr. Fernando Costa', specialty: 'Ozonioterapia & Terapias Avancadas', bio: 'Especialista em ozonioterapia, laserterapia, magnetoterapia e PRP veterinario. Referencia em terapias regenerativas e tratamento de feridas complexas.', crmv: 'CRMV-SP 00006', email: 'fernando@medvetintegrativa.com', phone: '(11) 99999-0007', image: 'https://images.unsplash.com/photo-1770836037793-95bdbf190f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGRvY3RvciUyMHBldHxlbnwwfHx8fDE3NzYxOTAyMjB8MA&ixlib=rb-4.1.0&q=85', color: 'bg-[#2C4C3B]' },
];

export default function TeamPage() {
  return (
    <div data-testid="team-page" className="min-h-screen bg-[#F9F6F0]">
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossa Equipe</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Especialistas que Cuidam com Amor</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Veterinarios formados em medicina integrativa, unidos pela paixao por tratar animais de forma natural e holistica.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mentor Section */}
        <section className="mb-20" data-testid="mentor-section">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#C87A5D]/10 rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-[#C87A5D]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#C87A5D]">Mentora & Fundadora</span>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border-2 border-[#C87A5D]/20 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(200,122,93,0.1)]">
            <div className="grid lg:grid-cols-5 gap-0">
              <div className="lg:col-span-2 relative h-[400px] lg:h-auto">
                <img src={MENTOR.image} alt={MENTOR.name} className="w-full h-full object-cover object-top" style={{filter: 'contrast(1.08) brightness(1.06) saturate(1.12)'}} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/40 to-transparent lg:bg-gradient-to-r" />
              </div>
              <div className="lg:col-span-3 p-8 sm:p-10 lg:p-12 space-y-5">
                <div>
                  <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-[#1A2E24]">{MENTOR.name}</h2>
                  <p className="text-[#C87A5D] font-medium mt-1">{MENTOR.specialty} | {MENTOR.crmv}</p>
                  <p className="text-[#84978F] text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{MENTOR.location}</p>
                </div>
                <p className="text-[#4A6B5A] leading-relaxed">{MENTOR.bio}</p>
                <blockquote className="border-l-4 border-[#C87A5D] pl-5 py-2 bg-[#C87A5D]/5 rounded-r-xl">
                  <p className="text-[#1A2E24] italic leading-relaxed">"{MENTOR.philosophy}"</p>
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  {MENTOR.specialties.map(s => (
                    <span key={s} className="bg-[#2C4C3B]/10 text-[#2C4C3B] text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a href={`mailto:${MENTOR.email}`} className="flex items-center gap-2 text-sm text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors"><Mail className="w-4 h-4" />{MENTOR.email}</a>
                  <a href={`tel:${MENTOR.phone}`} className="flex items-center gap-2 text-sm text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors"><Phone className="w-4 h-4" />{MENTOR.phone}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Grid */}
        <section>
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Equipe Clinica</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">Nossos Especialistas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((vet, i) => (
              <div key={i} data-testid={`vet-card-${i}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="relative h-56 overflow-hidden">
                  <img src={vet.image} alt={vet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-['Outfit'] text-xl font-semibold text-[#F9F6F0]">{vet.name}</h3>
                    <p className="text-[#C87A5D] text-sm font-medium">{vet.specialty}</p>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-xs text-[#84978F]">{vet.crmv}</p>
                  <p className="text-sm text-[#4A6B5A] leading-relaxed line-clamp-3">{vet.bio}</p>
                  <div className="flex items-center gap-4 pt-2 text-xs text-[#84978F]">
                    <a href={`mailto:${vet.email}`} className="flex items-center gap-1 hover:text-[#2C4C3B] transition-colors"><Mail className="w-3 h-3" /> E-mail</a>
                    <a href={`tel:${vet.phone}`} className="flex items-center gap-1 hover:text-[#2C4C3B] transition-colors"><Phone className="w-3 h-3" /> Ligar</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 bg-[#2C4C3B] rounded-3xl p-10 sm:p-14 text-center">
          <Heart className="w-10 h-10 text-[#C87A5D] mx-auto mb-4" />
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0] mb-3">Agende com nossos especialistas</h2>
          <p className="text-[#F9F6F0]/70 mb-6 max-w-md mx-auto">Escolha a especialidade e horario ideal para a consulta do seu pet.</p>
          <Link to="/consultas" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all inline-block">Agendar Consulta</Link>
        </section>
      </div>
    </div>
  );
}
