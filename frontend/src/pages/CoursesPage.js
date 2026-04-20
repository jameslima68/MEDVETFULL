import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { GraduationCap, Clock, BookOpen, ChevronRight, Star, Users, Play, Award } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function CourseCard({ course, t }) {
  const isActive = course.status === 'active';
  return (
    <div data-testid={`course-card-${course.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative h-44 overflow-hidden">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E24]/60 to-transparent" />
        {!isActive && <div className="absolute inset-0 bg-[#1A2E24]/40 flex items-center justify-center"><span className="bg-[#C87A5D] text-white text-sm font-bold px-4 py-1.5 rounded-full">{t('courses.comingSoon')}</span></div>}
        {isActive && course.original_price && <span className="absolute top-3 right-3 bg-[#C87A5D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{Math.round((1 - course.price / course.original_price) * 100)}%</span>}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {course.hours}{t('courses.hours')}</span>
          {course.modules && <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.modules.length} {t('courses.modules')}</span>}
        </div>
      </div>
      <div className="p-5 space-y-2">
        <h3 className="font-['Outfit'] text-base font-medium text-[#1A2E24] line-clamp-2">{course.title}</h3>
        {course.subtitle && <p className="text-xs text-[#4A6B5A] line-clamp-1">{course.subtitle}</p>}
        {course.instructor && <p className="text-xs text-[#84978F]">{t('courses.instructor')}: {course.instructor}</p>}
        <div className="flex items-center justify-between pt-2">
          <div>
            {course.original_price && <span className="text-xs text-[#84978F] line-through mr-2">R$ {course.original_price.toFixed(0)}</span>}
            <span className="font-['Outfit'] text-lg font-semibold text-[#2C4C3B]">R$ {course.price.toFixed(0)}</span>
          </div>
          {isActive ? (
            <Link to={`/cursos/${course.id}`} className="bg-[#2C4C3B] text-white hover:bg-[#1A2E24] rounded-full px-4 py-1.5 text-xs font-medium transition-all">{t('courses.details')}</Link>
          ) : (
            <span className="text-xs text-[#C87A5D] font-medium">{t('courses.comingSoon')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoursesListPage() {
  const { t } = useLang();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/courses`).then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = courses.filter(c => c.status === 'active');
  const coming = courses.filter(c => c.status === 'coming_soon');

  return (
    <div data-testid="courses-page" className="min-h-screen bg-[#F9F6F0]">
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
            <GraduationCap className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">MEDVET Academy</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-[#F9F6F0]">{t('courses.title')}</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">{t('courses.subtitle')}</p>
          <div className="flex justify-center gap-6 mt-8">
            <div className="text-center"><span className="text-2xl font-bold text-[#C87A5D]">{active.length}</span><p className="text-xs text-[#F9F6F0]/60">{t('courses.active')}</p></div>
            <div className="text-center"><span className="text-2xl font-bold text-[#F9F6F0]">{coming.length}</span><p className="text-xs text-[#F9F6F0]/60">{t('courses.soon')}</p></div>
            <div className="text-center"><span className="text-2xl font-bold text-[#F9F6F0]">25+</span><p className="text-xs text-[#F9F6F0]/60">{t('courses.hours')}</p></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {active.length > 0 && (
          <div className="mb-14">
            <h2 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-[#2C4C3B]" /> {t('courses.active')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{active.map(c => <CourseCard key={c.id} course={c} t={t} />)}</div>
          </div>
        )}
        {coming.length > 0 && (
          <div>
            <h2 className="font-['Outfit'] text-xl font-medium text-[#84978F] mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#C87A5D]" /> {t('courses.soon')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{coming.map(c => <CourseCard key={c.id} course={c} t={t} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CourseDetailPage() {
  const { t } = useLang();
  const [course, setCourse] = useState(null);
  const courseId = window.location.pathname.split('/').pop();

  useEffect(() => {
    axios.get(`${API}/courses/${courseId}`).then(r => setCourse(r.data)).catch(() => {});
  }, [courseId]);

  if (!course) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center text-[#84978F]">Carregando...</div>;

  return (
    <div data-testid="course-detail-page" className="min-h-screen bg-[#F9F6F0]">
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/cursos" className="text-sm text-[#F9F6F0]/60 hover:text-[#F9F6F0] mb-4 inline-block">← Voltar aos cursos</Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#C87A5D]/20 text-[#C87A5D] text-xs font-bold px-3 py-1 rounded-full">{course.level}</span>
            <span className="bg-[#F9F6F0]/10 text-[#F9F6F0]/70 text-xs px-3 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> {course.hours}h</span>
          </div>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-[#F9F6F0]">{course.title}</h1>
          <p className="text-[#F9F6F0]/70 mt-3">{course.subtitle}</p>
          <p className="text-sm text-[#C87A5D] mt-4">{course.instructor} — {course.instructor_crmv}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-3">Sobre o Curso</h2>
              <p className="text-sm text-[#4A6B5A] leading-relaxed">{course.description}</p>
            </div>

            {course.modules && (
              <div>
                <h2 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Programa do Curso</h2>
                <div className="space-y-3">
                  {course.modules.map(m => (
                    <div key={m.num} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-['Outfit'] text-sm font-medium text-[#1A2E24]">Módulo {m.num}: {m.title}</h3>
                        <span className="text-xs text-[#84978F]">{m.hours}h</span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {m.topics.map((topic, i) => (
                          <li key={i} className="text-xs text-[#4A6B5A] flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-[#C87A5D] mt-0.5 flex-shrink-0" /> {topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6 sticky top-24 space-y-4">
              <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-xl" />
              <div>
                {course.original_price && <span className="text-sm text-[#84978F] line-through mr-2">R$ {course.original_price.toFixed(0)}</span>}
                <span className="font-['Outfit'] text-3xl font-bold text-[#2C4C3B]">R$ {course.price.toFixed(0)}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#4A6B5A]">
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#84978F]" /> {course.hours} horas de conteúdo</li>
                <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#84978F]" /> {course.modules?.length || 0} módulos</li>
                <li className="flex items-center gap-2"><Play className="w-4 h-4 text-[#84978F]" /> Aulas ao vivo + gravadas</li>
                <li className="flex items-center gap-2"><Award className="w-4 h-4 text-[#84978F]" /> Certificado de conclusão</li>
                <li className="flex items-center gap-2"><Users className="w-4 h-4 text-[#84978F]" /> Acesso vitalício</li>
              </ul>
              <button data-testid="enroll-btn" className="w-full bg-[#C87A5D] text-white hover:bg-[#B3674C] rounded-full py-3 font-medium transition-all">{t('courses.enroll')}</button>
              <p className="text-[10px] text-[#84978F] text-center">Pagamento seguro via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
