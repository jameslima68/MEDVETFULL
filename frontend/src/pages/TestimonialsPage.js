import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Camera, Send, CheckCircle2, Video, Play } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', pet: '', text: '', rating: 5 });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sending, setSending] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/testimonials`),
      axios.get(`${API}/testimonials/approved`).catch(() => ({ data: [] }))
    ]).then(([seeded, customer]) => {
      setTestimonials([...customer.data, ...seeded.data]);
    }).finally(() => setLoading(false));
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no maximo 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.pet || !form.text) { toast.error('Preencha todos os campos'); return; }
    setSending(true);
    try {
      await axios.post(`${API}/testimonials/submit`, {
        ...form,
        photo_base64: photo || '',
        video_url: videoUrl || ''
      }, { withCredentials: true });
      setSubmitted(true);
      toast.success('Depoimento enviado!');
    } catch {
      toast.error('Erro ao enviar depoimento');
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="testimonials-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Depoimentos</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Historias de Amor e Cura</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Depoimentos reais de tutores que transformaram a vida dos seus pets.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CTA to submit */}
        <div className="text-center mb-12">
          <button
            onClick={() => setShowForm(!showForm)}
            data-testid="submit-testimonial-btn"
            className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Compartilhe sua historia
          </button>
        </div>

        {/* Submit Form */}
        {showForm && !submitted && (
          <div className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-8 mb-12 max-w-2xl mx-auto" data-testid="testimonial-form">
            <h3 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-6">Conte sua experiencia</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A2E24]">Seu Nome *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="testimonial-name" className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none" placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1A2E24]">Seu Pet *</label>
                  <input required value={form.pet} onChange={e => setForm(f => ({...f, pet: e.target.value}))} data-testid="testimonial-pet" className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none" placeholder="Nome e raca (ex: Luna, Golden)" />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A2E24]">Avaliacao *</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({...f, rating: s}))} data-testid={`star-${s}`} className="p-1 transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 ${s <= form.rating ? 'fill-[#C87A5D] text-[#C87A5D]' : 'text-[#E0DDD5]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A2E24]">Seu Depoimento *</label>
                <textarea required value={form.text} onChange={e => setForm(f => ({...f, text: e.target.value}))} data-testid="testimonial-text" rows={4} className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none resize-none" placeholder="Conte como a MEDVET Integrativa ajudou seu pet..." />
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A2E24]">Foto do seu pet (opcional)</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fileRef.current?.click()} data-testid="upload-photo-btn" className="flex items-center gap-2 bg-[#2C4C3B]/5 border border-[#E0DDD5] rounded-xl px-4 py-3 text-sm text-[#4A6B5A] hover:bg-[#2C4C3B]/10 transition-colors">
                    <Camera className="w-4 h-4" /> Escolher foto
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  {photoPreview && (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-[#E0DDD5]" />
                      <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(''); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">x</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A2E24]">Video depoimento - YouTube (opcional)</label>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#84978F]" />
                  <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} data-testid="video-url-input" placeholder="https://www.youtube.com/watch?v=..." className="flex-1 bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none" />
                </div>
                <p className="text-xs text-[#84978F]">Cole o link do YouTube com o depoimento em video sobre o tratamento do seu pet.</p>
              </div>

              <button type="submit" disabled={sending} data-testid="submit-testimonial-form" className="w-full bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar Depoimento'}
              </button>
            </form>
          </div>
        )}

        {submitted && (
          <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-10 mb-12 max-w-md mx-auto text-center">
            <CheckCircle2 className="w-12 h-12 text-[#2C4C3B] mx-auto mb-4" />
            <h3 className="font-['Outfit'] text-xl font-semibold text-[#1A2E24] mb-2">Obrigado!</h3>
            <p className="text-[#4A6B5A]">Seu depoimento foi enviado e sera publicado apos aprovacao.</p>
          </div>
        )}

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="bg-white/40 rounded-3xl h-48 animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map(t => {
              const youtubeId = t.video_url ? t.video_url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] : null;
              return (
              <div key={t.id} data-testid={`testimonial-${t.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(44,76,59,0.04)]">
                {youtubeId && (
                  <div className="relative aspect-video">
                    <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title="Video depoimento" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C87A5D] text-[#C87A5D]" />
                    ))}
                  </div>
                  <p className="text-[#4A6B5A] leading-relaxed mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#E0DDD5]" />
                    ) : (
                      <div className="w-12 h-12 bg-[#84978F] rounded-full flex items-center justify-center text-[#F9F6F0] text-sm font-bold">
                        {t.avatar || t.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#1A2E24]">{t.name}</p>
                      <p className="text-xs text-[#84978F]">{t.pet}</p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
