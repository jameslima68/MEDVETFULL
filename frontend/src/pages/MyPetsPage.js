import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { PawPrint, Plus, Pencil, Trash2, Dog, Cat, X, Save, Heart } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SPECIES = [
  { value: 'cao', label: 'Cão', icon: Dog },
  { value: 'gato', label: 'Gato', icon: Cat },
  { value: 'outro', label: 'Outro', icon: PawPrint },
];

const COMMON_CONDITIONS = [
  'Artrose', 'Displasia coxofemoral', 'Epilepsia', 'Dermatite alérgica',
  'Diabetes', 'Insuficiência renal', 'Cardiopatia', 'Obesidade',
  'Ansiedade', 'Hipotireoidismo', 'Câncer', 'Doença periodontal',
];

const EMPTY_PET = { name: '', species: 'cao', breed: '', age_years: 0, age_months: 0, weight_kg: 0, conditions: [], notes: '' };

function PetForm({ pet, onSave, onCancel, saving }) {
  const [form, setForm] = useState(pet || EMPTY_PET);
  const [conditionInput, setConditionInput] = useState('');

  const addCondition = (c) => {
    if (c && !form.conditions.includes(c)) {
      setForm(prev => ({ ...prev, conditions: [...prev.conditions, c] }));
    }
    setConditionInput('');
  };

  const removeCondition = (c) => {
    setForm(prev => ({ ...prev, conditions: prev.conditions.filter(x => x !== c) }));
  };

  return (
    <div data-testid="pet-form" className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Nome do Pet *</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            data-testid="pet-name-input"
            className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-sm text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Ex: Luna"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Espécie *</label>
          <div className="flex gap-2">
            {SPECIES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ ...form, species: s.value })}
                data-testid={`species-${s.value}`}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${form.species === s.value ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Raça</label>
          <input
            value={form.breed}
            onChange={e => setForm({ ...form, breed: e.target.value })}
            data-testid="pet-breed-input"
            className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-sm text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Ex: Golden Retriever"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Peso (kg)</label>
          <input
            type="number"
            step="0.1"
            value={form.weight_kg || ''}
            onChange={e => setForm({ ...form, weight_kg: parseFloat(e.target.value) || 0 })}
            data-testid="pet-weight-input"
            className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-sm text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Ex: 12.5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Idade (anos)</label>
          <input
            type="number"
            value={form.age_years || ''}
            onChange={e => setForm({ ...form, age_years: parseInt(e.target.value) || 0 })}
            data-testid="pet-age-input"
            className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-sm text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Ex: 5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Idade (meses)</label>
          <input
            type="number"
            value={form.age_months || ''}
            onChange={e => setForm({ ...form, age_months: parseInt(e.target.value) || 0 })}
            className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-sm text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Ex: 3"
          />
        </div>
      </div>

      {/* Conditions */}
      <div>
        <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Condições / Doenças Diagnosticadas</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.conditions.map(c => (
            <span key={c} className="bg-[#C87A5D]/10 text-[#C87A5D] text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              {c}
              <button onClick={() => removeCondition(c)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 mb-2">
          <input
            value={conditionInput}
            onChange={e => setConditionInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCondition(conditionInput))}
            className="flex-1 bg-white border border-[#E0DDD5] rounded-xl px-3 py-1.5 text-xs text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
            placeholder="Digitar condição..."
          />
          <button onClick={() => addCondition(conditionInput)} className="text-xs bg-[#2C4C3B]/10 text-[#2C4C3B] px-3 py-1.5 rounded-xl hover:bg-[#2C4C3B]/20 transition-colors">Adicionar</button>
        </div>
        <div className="flex flex-wrap gap-1">
          {COMMON_CONDITIONS.filter(c => !form.conditions.includes(c)).slice(0, 8).map(c => (
            <button key={c} onClick={() => addCondition(c)} className="text-[10px] bg-white border border-[#E0DDD5] text-[#4A6B5A] px-2 py-0.5 rounded-full hover:bg-[#2C4C3B]/5 transition-colors">
              + {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-[#4A6B5A] block mb-1">Observações</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full bg-white border border-[#E0DDD5] rounded-xl px-3 py-2 text-xs text-[#1A2E24] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B] resize-none"
          placeholder="Informações adicionais sobre o pet..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || saving}
          data-testid="pet-save-btn"
          className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] disabled:bg-[#84978F] rounded-full px-5 py-2 text-sm font-medium transition-all"
        >
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button onClick={onCancel} className="text-sm text-[#4A6B5A] hover:text-[#1A2E24] transition-colors">Cancelar</button>
      </div>
    </div>
  );
}

export default function MyPetsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === false) navigate('/login');
    if (user && user !== false) {
      axios.get(`${API}/pets`, { withCredentials: true })
        .then(r => setPets(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, navigate]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingPet) {
        const { data } = await axios.put(`${API}/pets/${editingPet.id}`, form, { withCredentials: true });
        setPets(prev => prev.map(p => p.id === editingPet.id ? data : p));
        toast.success('Pet atualizado!');
      } else {
        const { data } = await axios.post(`${API}/pets`, form, { withCredentials: true });
        setPets(prev => [...prev, data]);
        toast.success('Pet cadastrado!');
      }
      setShowForm(false);
      setEditingPet(null);
    } catch {
      toast.error('Erro ao salvar pet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/pets/${id}`, { withCredentials: true });
      setPets(prev => prev.filter(p => p.id !== id));
      toast.success('Pet removido');
    } catch {
      toast.error('Erro ao remover pet');
    }
  };

  if (!user || user === false) return null;

  return (
    <div data-testid="my-pets-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />

      <section className="bg-[#2C4C3B] py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
            <PawPrint className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Área do Tutor</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0]">
            Meus <span className="text-[#C87A5D]">Pets</span>
          </h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-lg mx-auto">
            Cadastre seus pets para receber orientações personalizadas dos nossos especialistas com base na raça, idade, peso e histórico de saúde.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Add button */}
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingPet(null); }}
            data-testid="add-pet-btn"
            className="mb-6 flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2.5 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Pet
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6">
            <h2 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-3">
              {editingPet ? `Editando: ${editingPet.name}` : 'Novo Pet'}
            </h2>
            <PetForm
              pet={editingPet || EMPTY_PET}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingPet(null); }}
              saving={saving}
            />
          </div>
        )}

        {/* Pet Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="bg-white/40 rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : pets.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <PawPrint className="w-12 h-12 text-[#84978F] mx-auto mb-4" />
            <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-2">Nenhum pet cadastrado</h3>
            <p className="text-sm text-[#4A6B5A] mb-4">Cadastre seu primeiro pet para receber orientações personalizadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pets.map(pet => (
              <div key={pet.id} data-testid={`pet-card-${pet.id}`} className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 bg-[#2C4C3B]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {pet.species === 'cao' ? <Dog className="w-7 h-7 text-[#2C4C3B]" /> : pet.species === 'gato' ? <Cat className="w-7 h-7 text-[#2C4C3B]" /> : <PawPrint className="w-7 h-7 text-[#2C4C3B]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{pet.name}</h3>
                  <p className="text-xs text-[#4A6B5A] mt-0.5">
                    {pet.species === 'cao' ? 'Cão' : pet.species === 'gato' ? 'Gato' : 'Outro'}
                    {pet.breed && ` - ${pet.breed}`}
                    {pet.age_years > 0 && ` | ${pet.age_years} ano(s)`}
                    {pet.age_months > 0 && ` e ${pet.age_months} meses`}
                    {pet.weight_kg > 0 && ` | ${pet.weight_kg}kg`}
                  </p>
                  {pet.conditions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pet.conditions.map(c => (
                        <span key={c} className="text-[10px] bg-[#C87A5D]/10 text-[#C87A5D] px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditingPet(pet); setShowForm(true); }}
                    data-testid={`edit-pet-${pet.id}`}
                    className="p-2 text-[#4A6B5A] hover:text-[#2C4C3B] hover:bg-[#2C4C3B]/5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    data-testid={`delete-pet-${pet.id}`}
                    className="p-2 text-[#4A6B5A] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-[#2C4C3B]/5 border border-[#2C4C3B]/10 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-[#C87A5D] mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-['Outfit'] text-sm font-medium text-[#1A2E24] mb-1">Por que cadastrar meu pet?</h3>
              <p className="text-xs text-[#4A6B5A] leading-relaxed">
                Ao cadastrar seus pets com dados completos (raça, idade, peso e condições de saúde), nossos especialistas podem oferecer orientações mais precisas e personalizadas sobre terapias e produtos adequados para cada animal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
