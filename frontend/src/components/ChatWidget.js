import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, X, Send, ChevronDown, PawPrint, Stethoscope } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetSelect, setShowPetSelect] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && user && user !== false) {
      axios.get(`${API}/pets`, { withCredentials: true })
        .then(r => setPets(r.data))
        .catch(() => {});
    }
  }, [open, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'specialist',
        text: 'Olá! Sou especialista em medicina veterinária integrativa. Como posso ajudar você e seu pet hoje?\n\nVocê pode me perguntar sobre qualquer uma das nossas terapias, produtos ou cuidados com seu animal.',
      }]);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/chat`, {
        message: userMsg,
        pet_id: selectedPet?.id || null,
        context: 'geral'
      }, { withCredentials: true });
      setMessages(prev => [...prev, { role: 'specialist', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'specialist', text: 'Desculpe, não consegui processar sua pergunta no momento. Tente novamente ou agende uma consulta com nossos especialistas.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="chat-fab"
          className="fixed bottom-24 right-6 z-50 bg-[#2C4C3B] hover:bg-[#1A2E24] text-[#F9F6F0] rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 pl-4 pr-5 py-3"
        >
          <Stethoscope className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Fale com Especialista</span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          data-testid="chat-panel"
          className="fixed bottom-4 right-4 z-[60] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[80vh] bg-[#F9F6F0] rounded-2xl shadow-2xl border border-[#E0DDD5] flex flex-col overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="bg-[#2C4C3B] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F9F6F0]/20 rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-[#F9F6F0]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#F9F6F0]">Nossos Especialistas</h3>
                <span className="text-[10px] text-[#F9F6F0]/60">Tire suas dúvidas sobre terapias e produtos</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} data-testid="chat-close" className="text-[#F9F6F0]/70 hover:text-[#F9F6F0] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pet Selector */}
          {user && user !== false && pets.length > 0 && (
            <div className="px-3 py-2 border-b border-[#E0DDD5] bg-white/50 flex-shrink-0">
              <button
                onClick={() => setShowPetSelect(!showPetSelect)}
                data-testid="pet-selector"
                className="flex items-center gap-2 text-xs text-[#4A6B5A] hover:text-[#2C4C3B] transition-colors w-full"
              >
                <PawPrint className="w-3.5 h-3.5" />
                <span>{selectedPet ? `Falando sobre: ${selectedPet.name}` : 'Selecionar pet para respostas personalizadas'}</span>
                <ChevronDown className="w-3 h-3 ml-auto" />
              </button>
              {showPetSelect && (
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => { setSelectedPet(null); setShowPetSelect(false); }}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${!selectedPet ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
                  >
                    Sem pet selecionado (geral)
                  </button>
                  {pets.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPet(p); setShowPetSelect(false); }}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${selectedPet?.id === p.id ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
                    >
                      {p.name} ({p.species === 'cao' ? 'Cão' : p.species === 'gato' ? 'Gato' : p.species}{p.breed ? ` - ${p.breed}` : ''})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-[#2C4C3B] text-[#F9F6F0] rounded-br-md'
                    : 'bg-white border border-[#E0DDD5] text-[#1A2E24] rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E0DDD5] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#84978F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#84978F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#84978F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-[#E0DDD5] bg-white/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Pergunte sobre terapias, produtos..."
                data-testid="chat-input"
                className="flex-1 bg-white border border-[#E0DDD5] rounded-full px-4 py-2 text-sm text-[#1A2E24] placeholder-[#84978F] focus:outline-none focus:ring-1 focus:ring-[#2C4C3B]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                data-testid="chat-send"
                className="w-9 h-9 bg-[#2C4C3B] hover:bg-[#1A2E24] disabled:bg-[#84978F] rounded-full flex items-center justify-center text-[#F9F6F0] transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {!user || user === false ? (
              <p className="text-[10px] text-[#84978F] mt-1.5 text-center">
                Faça login para salvar seu histórico e cadastrar seus pets
              </p>
            ) : pets.length === 0 ? (
              <p className="text-[10px] text-[#84978F] mt-1.5 text-center">
                Cadastre seus pets em <a href="/meus-pets" className="text-[#2C4C3B] font-medium hover:underline">Meus Pets</a> para respostas personalizadas
              </p>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
