import { createContext, useContext, useState } from 'react';

const translations = {
  pt: {
    nav: { mission: 'Nossa Missão', products: 'Produtos', videos: 'Vídeos', therapies: 'Terapias', team: 'Equipe', testimonials: 'Depoimentos', consultations: 'Consultas', courses: 'Cursos', vetPortal: 'Portal Vet', login: 'Entrar', schedule: 'Agendar Consulta' },
    home: { badge: 'MEDICINA VETERINÁRIA INTEGRATIVA', title1: 'Cuidado natural e', title2: 'integrado', title3: 'para seu pet', subtitle: 'Tratamentos personalizados com homeopatia, acupuntura, CBD e medicina chinesa. Consultas online com especialistas veterinários.', cta1: 'Agendar Consulta', cta2: 'Ver Produtos', online: '100% Online', secure: 'Atendimento seguro' },
    therapies: { sectionTitle: 'Terapias Integrativas para seu Pet', sectionSub: 'Clique em cada terapia para conhecer o conceito e os cuidados na medicina veterinária integrativa.', badge: 'Nossos Tratamentos', soon: 'Em breve', close: 'Fechar', soonMsg: 'Este tratamento presencial estará disponível em breve. Estamos estruturando a equipe de especialistas.', videoSoon: 'Vídeo sobre esta terapia em produção' },
    courses: { title: 'Cursos de Terapias Integrativas', subtitle: 'Formação profissional para veterinários com os melhores especialistas do Brasil', active: 'Cursos Disponíveis', soon: 'Em Breve', hours: 'horas', modules: 'módulos', enroll: 'Matricular-se', details: 'Ver Detalhes', level: 'Nível', instructor: 'Instrutor', comingSoon: 'Em breve', from: 'A partir de' },
    vet: { title: 'Portal do Veterinário', subtitle: 'Área exclusiva para profissionais da medicina veterinária', register: 'Cadastrar-se', login: 'Entrar', name: 'Nome completo', email: 'E-mail', password: 'Senha', crmv: 'Número CRMV', state: 'Estado', specialties: 'Especialidades', area: 'Área de Atuação', integrative: 'Integrativa', traditional: 'Tradicional', both: 'Ambas', education: 'Formação Acadêmica', bio: 'Mini biografia', phone: 'Telefone', submit: 'Criar Conta', already: 'Já tem cadastro?', noAccount: 'Não tem cadastro?' },
    footer: { rights: '2025 MEDVET Integrativa. Todos os direitos reservados.' },
    chat: { title: 'Nossos Especialistas', subtitle: 'Tire suas dúvidas sobre terapias e produtos', placeholder: 'Pergunte sobre terapias, produtos...', fab: 'Fale com Especialista', loginHint: 'Faça login para salvar seu histórico e cadastrar seus pets', petHint: 'Cadastre seus pets em', petLink: 'Meus Pets', petHint2: 'para respostas personalizadas' },
  },
  en: {
    nav: { mission: 'Our Mission', products: 'Products', videos: 'Videos', therapies: 'Therapies', team: 'Team', testimonials: 'Testimonials', consultations: 'Consultations', courses: 'Courses', vetPortal: 'Vet Portal', login: 'Sign In', schedule: 'Book Consultation' },
    home: { badge: 'INTEGRATIVE VETERINARY MEDICINE', title1: 'Natural and', title2: 'integrated', title3: 'care for your pet', subtitle: 'Personalized treatments with homeopathy, acupuncture, CBD and Chinese medicine. Online consultations with veterinary specialists.', cta1: 'Book Consultation', cta2: 'View Products', online: '100% Online', secure: 'Secure care' },
    therapies: { sectionTitle: 'Integrative Therapies for Your Pet', sectionSub: 'Click each therapy to learn about its concept and care in integrative veterinary medicine.', badge: 'Our Treatments', soon: 'Coming soon', close: 'Close', soonMsg: 'This in-person treatment will be available soon. We are building our specialist team.', videoSoon: 'Video about this therapy in production' },
    courses: { title: 'Integrative Therapy Courses', subtitle: 'Professional training for veterinarians with top specialists', active: 'Available Courses', soon: 'Coming Soon', hours: 'hours', modules: 'modules', enroll: 'Enroll Now', details: 'View Details', level: 'Level', instructor: 'Instructor', comingSoon: 'Coming soon', from: 'Starting at' },
    vet: { title: 'Veterinarian Portal', subtitle: 'Exclusive area for veterinary professionals', register: 'Register', login: 'Sign In', name: 'Full name', email: 'Email', password: 'Password', crmv: 'CRMV Number', state: 'State', specialties: 'Specialties', area: 'Practice Area', integrative: 'Integrative', traditional: 'Traditional', both: 'Both', education: 'Academic Background', bio: 'Short bio', phone: 'Phone', submit: 'Create Account', already: 'Already registered?', noAccount: 'No account yet?' },
    footer: { rights: '2025 MEDVET Integrativa. All rights reserved.' },
    chat: { title: 'Our Specialists', subtitle: 'Ask your questions about therapies and products', placeholder: 'Ask about therapies, products...', fab: 'Talk to Specialist', loginHint: 'Sign in to save your history and register your pets', petHint: 'Register your pets in', petLink: 'My Pets', petHint2: 'for personalized answers' },
  },
  es: {
    nav: { mission: 'Nuestra Misión', products: 'Productos', videos: 'Videos', therapies: 'Terapias', team: 'Equipo', testimonials: 'Testimonios', consultations: 'Consultas', courses: 'Cursos', vetPortal: 'Portal Vet', login: 'Ingresar', schedule: 'Agendar Consulta' },
    home: { badge: 'MEDICINA VETERINARIA INTEGRATIVA', title1: 'Cuidado natural e', title2: 'integrado', title3: 'para tu mascota', subtitle: 'Tratamientos personalizados con homeopatía, acupuntura, CBD y medicina china. Consultas online con especialistas veterinarios.', cta1: 'Agendar Consulta', cta2: 'Ver Productos', online: '100% Online', secure: 'Atención segura' },
    therapies: { sectionTitle: 'Terapias Integrativas para tu Mascota', sectionSub: 'Haz clic en cada terapia para conocer su concepto y cuidados en la medicina veterinaria integrativa.', badge: 'Nuestros Tratamientos', soon: 'Próximamente', close: 'Cerrar', soonMsg: 'Este tratamiento presencial estará disponible pronto. Estamos estructurando el equipo de especialistas.', videoSoon: 'Video sobre esta terapia en producción' },
    courses: { title: 'Cursos de Terapias Integrativas', subtitle: 'Formación profesional para veterinarios con los mejores especialistas', active: 'Cursos Disponibles', soon: 'Próximamente', hours: 'horas', modules: 'módulos', enroll: 'Inscribirse', details: 'Ver Detalles', level: 'Nivel', instructor: 'Instructor', comingSoon: 'Próximamente', from: 'Desde' },
    vet: { title: 'Portal del Veterinario', subtitle: 'Área exclusiva para profesionales de la medicina veterinaria', register: 'Registrarse', login: 'Ingresar', name: 'Nombre completo', email: 'Correo', password: 'Contraseña', crmv: 'Número CRMV', state: 'Estado', specialties: 'Especialidades', area: 'Área de Actuación', integrative: 'Integrativa', traditional: 'Tradicional', both: 'Ambas', education: 'Formación Académica', bio: 'Mini biografía', phone: 'Teléfono', submit: 'Crear Cuenta', already: '¿Ya tienes cuenta?', noAccount: '¿No tienes cuenta?' },
    footer: { rights: '2025 MEDVET Integrativa. Todos los derechos reservados.' },
    chat: { title: 'Nuestros Especialistas', subtitle: 'Resuelve tus dudas sobre terapias y productos', placeholder: 'Pregunta sobre terapias, productos...', fab: 'Habla con Especialista', loginHint: 'Inicia sesión para guardar tu historial y registrar tus mascotas', petHint: 'Registra tus mascotas en', petLink: 'Mis Mascotas', petHint2: 'para respuestas personalizadas' },
  }
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('pt');
  const t = (path) => {
    const keys = path.split('.');
    let val = translations[lang];
    for (const k of keys) { val = val?.[k]; }
    return val || path;
  };
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be within LangProvider');
  return ctx;
}
