import { useState } from 'react';
import axios from 'axios';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

const CATEGORIES = [
  { value: 'homeopatia', label: 'Homeopatia Veterinaria' },
  { value: 'hormonios', label: 'Hormonios Bioidenticos' },
  { value: 'medicina-chinesa', label: 'Medicina Chinesa' },
  { value: 'cbd', label: 'CBD para Pets' },
  { value: 'acupuntura', label: 'Acupuntura Veterinaria' },
];

const PET_TYPES = [
  { value: 'cao', label: 'Cao' },
  { value: 'gato', label: 'Gato' },
  { value: 'ave', label: 'Ave' },
  { value: 'equino', label: 'Equino' },
  { value: 'outro', label: 'Outro' },
];

export default function ConsultationPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', pet_name: '', pet_type: '', pet_age: '', category: '', time: '', notes: ''
  });
  const [date, setDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      toast.error('Selecione uma data para a consulta');
      return;
    }
    if (!form.time) {
      toast.error('Selecione um horario');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/consultations`, {
        ...form,
        date: format(date, 'yyyy-MM-dd'),
      });
      setSubmitted(true);
      toast.success('Consulta agendada com sucesso!');
    } catch (err) {
      toast.error('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="consultation-success" className="min-h-screen bg-[#F9F6F0] flex items-center justify-center px-4">
        <Toaster position="top-right" richColors />
        <div className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-[#2C4C3B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#2C4C3B]" />
          </div>
          <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1A2E24] mb-3">Consulta Agendada!</h2>
          <p className="text-[#4A6B5A] mb-2">Sua consulta foi agendada para:</p>
          <p className="font-semibold text-[#2C4C3B]">{date && format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} as {form.time}</p>
          <p className="text-sm text-[#84978F] mt-4">Voce recebera um e-mail de confirmacao com os detalhes da consulta.</p>
          <button
            onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', pet_name: '', pet_type: '', pet_age: '', category: '', time: '', notes: '' }); setDate(null); }}
            data-testid="new-consultation-btn"
            className="mt-6 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3 font-medium transition-all"
          >
            Agendar outra consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="consultation-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Consultas Online</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Agendar Consulta</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">Atendimento personalizado com veterinarios especializados em medicina integrativa.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-8 sm:p-10 shadow-[0_8px_32px_rgba(44,76,59,0.04)] space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Seu Nome *</label>
              <input
                required
                data-testid="consultation-name"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="Seu nome completo"
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">E-mail *</label>
              <input
                required type="email"
                data-testid="consultation-email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Telefone *</label>
              <input
                required
                data-testid="consultation-phone"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="(11) 99999-9999"
              />
            </div>
            {/* Pet Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Nome do Pet *</label>
              <input
                required
                data-testid="consultation-pet-name"
                value={form.pet_name}
                onChange={e => handleChange('pet_name', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="Nome do seu pet"
              />
            </div>
            {/* Pet Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Tipo de Animal *</label>
              <select
                required
                data-testid="consultation-pet-type"
                value={form.pet_type}
                onChange={e => handleChange('pet_type', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
              >
                <option value="">Selecione...</option>
                {PET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            {/* Pet Age */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Idade do Pet</label>
              <input
                data-testid="consultation-pet-age"
                value={form.pet_age}
                onChange={e => handleChange('pet_age', e.target.value)}
                className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
                placeholder="Ex: 5 anos"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">Especialidade Desejada *</label>
            <select
              required
              data-testid="consultation-category"
              value={form.category}
              onChange={e => handleChange('category', e.target.value)}
              className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all"
            >
              <option value="">Selecione a especialidade...</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Data *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    data-testid="consultation-date-picker"
                    className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] rounded-xl px-4 py-3 text-sm text-left flex items-center gap-2 outline-none transition-all"
                  >
                    <CalendarDays className="w-4 h-4 text-[#84978F]" />
                    {date ? format(date, "dd/MM/yyyy") : <span className="text-[#84978F]">Selecione a data</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-[#E0DDD5] rounded-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date() || d.getDay() === 0}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A2E24]">Horario *</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    type="button"
                    key={t}
                    data-testid={`time-slot-${t}`}
                    onClick={() => handleChange('time', t)}
                    className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${form.time === t ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
                  >
                    <Clock className="w-3 h-3" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1A2E24]">Observacoes</label>
            <textarea
              data-testid="consultation-notes"
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all resize-none"
              placeholder="Descreva os sintomas ou motivo da consulta..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="consultation-submit"
            className="w-full bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3.5 font-medium transition-all disabled:opacity-50"
          >
            {loading ? 'Agendando...' : 'Agendar Consulta'}
          </button>
        </form>
      </div>
    </div>
  );
}
