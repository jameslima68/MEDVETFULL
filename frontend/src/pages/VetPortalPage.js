import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../contexts/LangContext';
import { Stethoscope, GraduationCap, Plus, X, Shield } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const SPECIALTIES_OPTIONS = ['Acupuntura','Fitoterapia','Homeopatia','Ozonioterapia','CBD/Cannabis Medicinal','Quiropraxia','Fisioterapia','Nutrição Funcional','Florais de Bach','Reiki','Cromoterapia','Terapia Neural','Hormônios Bioidênticos','Oncologia','Ortopedia','Dermatologia','Cardiologia','Neurologia','Clínica Geral'];

export default function VetPortalPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', crmv:'', crmv_state:'SP', specialties:[], area:'integrativa', education:[], bio:'', phone:'' });
  const [loginForm, setLoginForm] = useState({ email:'', password:'' });
  const [eduInput, setEduInput] = useState({ type:'graduacao', institution:'', year:'' });

  const addSpecialty = (s) => {
    if (!form.specialties.includes(s)) setForm(prev => ({...prev, specialties:[...prev.specialties, s]}));
  };
  const removeSpecialty = (s) => setForm(prev => ({...prev, specialties: prev.specialties.filter(x => x !== s)}));

  const addEducation = () => {
    if (eduInput.institution) {
      setForm(prev => ({...prev, education:[...prev.education, {...eduInput}]}));
      setEduInput({ type:'graduacao', institution:'', year:'' });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.crmv) return toast.error('Preencha os campos obrigatórios');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/vet/register`, form);
      localStorage.setItem('vet_token', data.token);
      toast.success('Cadastro realizado com sucesso!');
      setTimeout(() => navigate('/vet-dashboard'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro no cadastro');
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/vet/login`, loginForm);
      localStorage.setItem('vet_token', data.token);
      toast.success('Login realizado!');
      setTimeout(() => navigate('/vet-dashboard'), 500);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Credenciais inválidas');
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="vet-portal-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
            <Stethoscope className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">{t('vet.title')}</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-[#F9F6F0]">{t('vet.title')}</h1>
          <p className="text-[#F9F6F0]/70 mt-4">{t('vet.subtitle')}</p>
          <div className="flex gap-3 justify-center mt-8">
            <button onClick={() => setMode('register')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${mode === 'register' ? 'bg-[#C87A5D] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{t('vet.register')}</button>
            <button onClick={() => setMode('login')} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${mode === 'login' ? 'bg-[#C87A5D] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{t('vet.login')}</button>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-8 space-y-4">
            <h2 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-4">{t('vet.login')}</h2>
            <input value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} type="email" placeholder={t('vet.email')} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
            <input value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} type="password" placeholder={t('vet.password')} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
            <button type="submit" disabled={loading} data-testid="vet-login-btn" className="w-full bg-[#2C4C3B] text-white hover:bg-[#1A2E24] rounded-full py-3 font-medium transition-all disabled:bg-[#84978F]">{loading ? '...' : t('vet.login')}</button>
            <p className="text-center text-xs text-[#84978F]">{t('vet.noAccount')} <button type="button" onClick={() => setMode('register')} className="text-[#2C4C3B] font-medium hover:underline">{t('vet.register')}</button></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} data-testid="vet-register-form" className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-8 space-y-5">
            <h2 className="font-['Outfit'] text-xl font-medium text-[#1A2E24]">{t('vet.register')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={t('vet.name') + ' *'} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder={t('vet.email') + ' *'} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" placeholder={t('vet.password') + ' *'} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder={t('vet.phone')} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" />
              <input value={form.crmv} onChange={e => setForm({...form, crmv: e.target.value})} placeholder={t('vet.crmv') + ' *'} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]" required />
              <select value={form.crmv_state} onChange={e => setForm({...form, crmv_state: e.target.value})} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]">
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="text-xs font-medium text-[#4A6B5A] block mb-2">{t('vet.area')}</label>
              <div className="flex gap-2">
                {[{v:'integrativa',l:t('vet.integrative')},{v:'tradicional',l:t('vet.traditional')},{v:'ambas',l:t('vet.both')}].map(o => (
                  <button key={o.v} type="button" onClick={() => setForm({...form, area: o.v})} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${form.area === o.v ? 'bg-[#2C4C3B] text-white' : 'bg-white border border-[#E0DDD5] text-[#4A6B5A]'}`}>{o.l}</button>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="text-xs font-medium text-[#4A6B5A] block mb-2">{t('vet.specialties')}</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.specialties.map(s => (
                  <span key={s} className="bg-[#2C4C3B]/10 text-[#2C4C3B] text-xs px-2.5 py-1 rounded-full flex items-center gap-1">{s} <button type="button" onClick={() => removeSpecialty(s)}><X className="w-3 h-3" /></button></span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {SPECIALTIES_OPTIONS.filter(s => !form.specialties.includes(s)).map(s => (
                  <button key={s} type="button" onClick={() => addSpecialty(s)} className="text-[10px] bg-white border border-[#E0DDD5] text-[#4A6B5A] px-2 py-0.5 rounded-full hover:bg-[#2C4C3B]/5">+ {s}</button>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="text-xs font-medium text-[#4A6B5A] block mb-2">{t('vet.education')}</label>
              {form.education.map((e, i) => (
                <div key={i} className="text-xs text-[#4A6B5A] bg-white/50 rounded-lg px-3 py-2 mb-1 flex justify-between">
                  <span>{e.type === 'graduacao' ? 'Graduação' : e.type === 'pos' ? 'Pós-graduação' : e.type === 'mestrado' ? 'Mestrado' : 'Doutorado'} - {e.institution} {e.year && `(${e.year})`}</span>
                  <button type="button" onClick={() => setForm(prev => ({...prev, education: prev.education.filter((_,j) => j !== i)}))}><X className="w-3 h-3 text-red-400" /></button>
                </div>
              ))}
              <div className="flex gap-2 items-end">
                <select value={eduInput.type} onChange={e => setEduInput({...eduInput, type: e.target.value})} className="bg-white border border-[#E0DDD5] rounded-lg px-2 py-1.5 text-xs">
                  <option value="graduacao">Graduação</option>
                  <option value="pos">Pós-graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
                <input value={eduInput.institution} onChange={e => setEduInput({...eduInput, institution: e.target.value})} placeholder="Instituição" className="flex-1 bg-white border border-[#E0DDD5] rounded-lg px-2 py-1.5 text-xs" />
                <input value={eduInput.year} onChange={e => setEduInput({...eduInput, year: e.target.value})} placeholder="Ano" className="w-16 bg-white border border-[#E0DDD5] rounded-lg px-2 py-1.5 text-xs" />
                <button type="button" onClick={addEducation} className="bg-[#2C4C3B]/10 text-[#2C4C3B] p-1.5 rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder={t('vet.bio')} rows={3} className="w-full bg-white border border-[#E0DDD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2C4C3B] resize-none" />

            <button type="submit" disabled={loading} data-testid="vet-register-btn" className="w-full bg-[#2C4C3B] text-white hover:bg-[#1A2E24] rounded-full py-3 font-medium transition-all disabled:bg-[#84978F] flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> {loading ? 'Cadastrando...' : t('vet.submit')}
            </button>
            <p className="text-center text-xs text-[#84978F]">{t('vet.already')} <button type="button" onClick={() => setMode('login')} className="text-[#2C4C3B] font-medium hover:underline">{t('vet.login')}</button></p>
          </form>
        )}
      </div>
    </div>
  );
}
