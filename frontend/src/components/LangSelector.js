import { useLang } from '../contexts/LangContext';

const FLAGS = { pt: 'BR', en: 'US', es: 'ES' };
const LABELS = { pt: 'PT', en: 'EN', es: 'ES' };

export default function LangSelector() {
  const { lang, setLang } = useLang();

  return (
    <div data-testid="lang-selector" className="relative flex items-center gap-1">
      {Object.keys(FLAGS).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`lang-${l}`}
          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${lang === l ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'text-[#84978F] hover:bg-[#2C4C3B]/5'}`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
