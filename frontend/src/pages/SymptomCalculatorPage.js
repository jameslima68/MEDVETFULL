import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, AlertTriangle, CheckCircle2, ArrowRight, ChevronRight, RotateCw } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const URGENCY_CONFIG = {
  leve: { color: 'bg-[#2C4C3B]/10 text-[#2C4C3B]', label: 'Leve', desc: 'Pode ser tratado com terapias complementares.' },
  moderado: { color: 'bg-[#C87A5D]/10 text-[#C87A5D]', label: 'Moderado', desc: 'Recomenda-se consulta com especialista.' },
  severo: { color: 'bg-red-100 text-red-600', label: 'Severo', desc: 'Consulte um veterinário urgentemente.' },
};

export default function SymptomCalculatorPage() {
  const [symptomGroups, setSymptomGroups] = useState(null);
  const [petType, setPetType] = useState('cao');
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState('moderado');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/symptom-calculator/symptoms`)
      .then(r => setSymptomGroups(r.data))
      .catch(() => {});
  }, []);

  const toggleSymptom = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const calculate = async () => {
    if (selected.length === 0) { toast.error('Selecione pelo menos um sintoma'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/symptom-calculator`, { pet_type: petType, symptoms: selected, severity });
      setResult(data);
    } catch {
      toast.error('Erro ao calcular');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => { setSelected([]); setResult(null); setSeverity('moderado'); };

  return (
    <div data-testid="symptom-calculator-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Ferramenta Inteligente</span>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0] mt-3">Calculadora de Tratamento</h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">Selecione os sintomas do seu pet e descubra quais terapias integrativas sao mais indicadas.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!result ? (
          <div className="space-y-8">
            {/* Pet Type */}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Tipo de animal</h3>
              <div className="flex gap-3">
                {[{ v: 'cao', l: 'Cão' }, { v: 'gato', l: 'Gato' }].map(t => (
                  <button key={t.v} onClick={() => setPetType(t.v)} data-testid={`calc-pet-${t.v}`}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${petType === t.v ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A]'}`}>{t.l}</button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            {symptomGroups && Object.entries(symptomGroups).map(([group, symptoms]) => (
              <div key={group} className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">{group}</h3>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map(s => (
                    <button key={s.id} onClick={() => toggleSymptom(s.id)} data-testid={`symptom-${s.id}`}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selected.includes(s.id) ? 'bg-[#2C4C3B] text-[#F9F6F0] shadow-sm' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Severity */}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Gravidade dos sintomas</h3>
              <div className="flex gap-3">
                {[{ v: 'leve', l: 'Leve' }, { v: 'moderado', l: 'Moderado' }, { v: 'severo', l: 'Severo' }].map(s => (
                  <button key={s.v} onClick={() => setSeverity(s.v)} data-testid={`severity-${s.v}`}
                    className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${severity === s.v ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A]'}`}>{s.l}</button>
                ))}
              </div>
            </div>

            {/* Selected summary */}
            {selected.length > 0 && (
              <div className="bg-[#2C4C3B]/5 border border-[#2C4C3B]/20 rounded-2xl p-5 flex items-center justify-between">
                <p className="text-sm text-[#2C4C3B]"><strong>{selected.length}</strong> sintoma{selected.length > 1 ? 's' : ''} selecionado{selected.length > 1 ? 's' : ''}</p>
                <button onClick={() => setSelected([])} className="text-xs text-[#C87A5D] hover:underline">Limpar</button>
              </div>
            )}

            <button onClick={calculate} disabled={loading || selected.length === 0} data-testid="calculate-btn"
              className="w-full bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-4 font-medium transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5" /> {loading ? 'Calculando...' : 'Calcular Tratamento'}
            </button>
          </div>
        ) : (
          <div className="space-y-8" data-testid="calculator-result">
            {/* Urgency */}
            <div className={`rounded-3xl p-8 text-center ${result.overall_urgency === 'severo' ? 'bg-red-50 border-2 border-red-200' : result.overall_urgency === 'moderado' ? 'bg-[#C87A5D]/5 border-2 border-[#C87A5D]/20' : 'bg-[#2C4C3B]/5 border-2 border-[#2C4C3B]/20'}`}>
              {result.overall_urgency === 'severo' ? <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /> : <CheckCircle2 className="w-12 h-12 text-[#2C4C3B] mx-auto mb-4" />}
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${URGENCY_CONFIG[result.overall_urgency].color}`}>
                {URGENCY_CONFIG[result.overall_urgency].label}
              </span>
              <p className="text-[#4A6B5A]">{URGENCY_CONFIG[result.overall_urgency].desc}</p>
            </div>

            {/* Recommended Therapies */}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
              <h3 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-6">Terapias Recomendadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.recommended_therapies.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#2C4C3B]/5 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 bg-[#2C4C3B] rounded-full" />
                    <span className="text-sm font-medium text-[#1A2E24]">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories */}
            {result.recommended_categories.length > 0 && (
              <div className="bg-white/60 border border-[#E0DDD5] rounded-3xl p-8">
                <h3 className="font-['Outfit'] text-xl font-medium text-[#1A2E24] mb-4">Produtos Indicados</h3>
                <div className="flex flex-wrap gap-3">
                  {result.recommended_categories.map((cat, i) => (
                    <Link key={i} to={`/produtos?categoria=${cat}`} data-testid={`result-category-${cat}`}
                      className="flex items-center gap-2 bg-[#C87A5D]/10 text-[#C87A5D] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#C87A5D]/20 transition-colors">
                      {cat} <ChevronRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-[#EAE7E1] border border-[#E0DDD5] rounded-2xl p-5">
              <p className="text-xs text-[#4A6B5A] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C87A5D]" />
                {result.message} Esta ferramenta é informativa e não substitui uma consulta veterinária profissional.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={restart} data-testid="restart-calc" className="flex items-center justify-center gap-2 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5 rounded-full px-6 py-3 font-medium transition-all">
                <RotateCw className="w-4 h-4" /> Nova Consulta
              </button>
              <Link to="/consultas" className="flex items-center justify-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3 font-medium transition-all">
                Agendar com Especialista <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/terapias" className="flex items-center justify-center gap-2 bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3 font-medium transition-all">
                Ver Todas as Terapias <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
