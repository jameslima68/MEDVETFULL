import { Link } from 'react-router-dom';
import { Heart, Leaf, Sparkles, BookOpen, Users, Globe } from 'lucide-react';

const HERO_IMG = "https://images.unsplash.com/photo-1751831123224-a28d611a6987?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHx2ZXRlcmluYXJpYW4lMjBjYXJpbmclMjBwZXQlMjBkb2clMjBsb3ZlJTIwbmF0dXJhbHxlbnwwfHx8fDE3NzYxNzQzNTd8MA&ixlib=rb-4.1.0&q=85";
const IMG_CARING = "https://images.unsplash.com/photo-1705769939303-aaacafc7fc78?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHw0fHx2ZXRlcmluYXJpYW4lMjBjYXJpbmclMjBwZXQlMjBkb2clMjBsb3ZlJTIwbmF0dXJhbHxlbnwwfHx8fDE3NzYxNzQzNTd8MA&ixlib=rb-4.1.0&q=85";
const IMG_HERBS = "https://images.unsplash.com/photo-1759141936083-d10203b4d4f6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxheXVydmVkYSUyMGhlcmJzJTIwbW9ydGFyJTIwcGVzdGxlJTIwbmF0dXJhbCUyMGhlYWxpbmd8ZW58MHx8fHwxNzc2MTc0MzU2fDA&ixlib=rb-4.1.0&q=85";
const IMG_DOG = "https://images.unsplash.com/photo-1656926305383-20faba4390a9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBjYXJpbmclMjBwZXQlMjBkb2clMjBsb3ZlJTIwbmF0dXJhbHxlbnwwfHx8fDE3NzYxNzQzNTd8MA&ixlib=rb-4.1.0&q=85";

export default function MissionPage() {
  return (
    <div data-testid="mission-page" className="min-h-screen bg-[#F9F6F0]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Cuidado com amor" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A2E24]/90 via-[#1A2E24]/70 to-[#1A2E24]/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="w-4 h-4 text-[#C87A5D]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">Nossa Missao</span>
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#F9F6F0] leading-[1.1]">
              Amor, conhecimento e <span className="text-[#C87A5D]">cura natural</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#F9F6F0]/80 mt-6 leading-relaxed">
              Nascemos da uniao entre paixao pelos animais e a sabedoria de medicinas milenares para transformar a saude veterinaria.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Quem Somos</span>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24]">
                A MEDVET Integrativa nasceu de um proposito profundo
              </h2>
              <div className="space-y-5 text-[#4A6B5A] leading-relaxed">
                <p>
                  Acreditamos que cada animal merece ser tratado com o mesmo carinho, respeito e dedicacao que dedicamos aos seres que mais amamos. A MEDVET Integrativa nasceu da convergencia entre <strong className="text-[#1A2E24]">conhecimento cientifico</strong>, <strong className="text-[#1A2E24]">paixao genuina pelos pets</strong> e a sabedoria ancestral de medicinas que curam ha milhares de anos.
                </p>
                <p>
                  Nossa missao e resgatar o poder de cura da <strong className="text-[#1A2E24]">Ayurveda</strong> e da <strong className="text-[#1A2E24]">Medicina Tradicional Chinesa</strong> — sistemas milenares que enxergam o ser vivo como um todo integrado — e adapta-los com rigor cientifico para o universo veterinario. Nao tratamos apenas sintomas: buscamos a raiz do desequilibrio, respeitando a natureza unica de cada animal.
                </p>
                <p>
                  Mais do que oferecer produtos e tratamentos, queremos ser uma <strong className="text-[#1A2E24]">fonte de conhecimento e acolhimento</strong> para tutores que desejam cuidar de seus companheiros de forma mais consciente, natural e amorosa. Cada consulta, cada formula manipulada, cada dica que compartilhamos carrega o mesmo principio: <strong className="text-[#C87A5D]">tratar com carinho e amor e o primeiro passo para a verdadeira cura.</strong>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(44,76,59,0.15)]">
                <img src={IMG_CARING} alt="Cuidado com amor" className="w-full h-[400px] sm:h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#2C4C3B] rounded-2xl p-6 shadow-lg max-w-[220px]">
                <Heart className="w-8 h-8 text-[#C87A5D] mb-2" />
                <p className="text-[#F9F6F0] text-sm font-medium leading-relaxed">
                  "Curar com amor e sabedoria milenar"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossos Pilares</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mt-3">
              O que nos guia todos os dias
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Amor e Compaixao',
                desc: 'Cada animal que chega ate nos e tratado como se fosse nosso. O amor e a base de tudo que fazemos — da formulacao dos produtos ao atendimento online.'
              },
              {
                icon: Leaf,
                title: 'Sabedoria Milenar',
                desc: 'Resgatamos conhecimentos da Ayurveda, Medicina Chinesa e outras tradicoes ancestrais que entendem a saude como equilibrio entre corpo, mente e espirito.'
              },
              {
                icon: Sparkles,
                title: 'Ciencia e Natureza',
                desc: 'Unimos o rigor da ciencia moderna com o poder da natureza. Nossos tratamentos sao validados cientificamente e formulados com ingredientes naturais de alta qualidade.'
              },
            ].map((v, i) => (
              <div key={i} className="bg-[#F9F6F0]/5 backdrop-blur-sm border border-[#F9F6F0]/10 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-[#C87A5D]/20 rounded-2xl flex items-center justify-center mb-5">
                  <v.icon className="w-7 h-7 text-[#C87A5D]" />
                </div>
                <h3 className="font-['Outfit'] text-xl font-medium text-[#F9F6F0] mb-3">{v.title}</h3>
                <p className="text-[#F9F6F0]/70 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden h-[260px]">
                  <img src={IMG_HERBS} alt="Ervas naturais" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-2xl overflow-hidden h-[260px] mt-8">
                  <img src={IMG_DOG} alt="Pet feliz" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nossa Filosofia</span>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24]">
                Medicinas milenares para o mundo moderno
              </h2>
              <div className="space-y-5 text-[#4A6B5A] leading-relaxed">
                <p>
                  A <strong className="text-[#1A2E24]">Ayurveda</strong>, com mais de 5.000 anos de historia, nos ensina que a saude e o equilibrio entre os elementos naturais. Adaptamos seus principios para compreender a constituicao unica de cada animal e oferecer tratamentos verdadeiramente personalizados.
                </p>
                <p>
                  Da <strong className="text-[#1A2E24]">Medicina Tradicional Chinesa</strong>, herdamos a visao holistica que integra acupuntura, fitoterapia e formulas manipuladas para restaurar o fluxo vital de energia — tratando nao apenas o corpo, mas tambem o emocional do animal.
                </p>
                <p>
                  Combinamos essas tradicoes com <strong className="text-[#1A2E24]">homeopatia, hormonios bioidenticos e CBD</strong>, criando protocolos integradores que respeitam a individualidade de cada pet. Porque nao existe tratamento unico — existe o tratamento certo para cada ser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-20 sm:py-28 bg-[#EAE7E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Nosso Compromisso</span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#1A2E24] mt-3">
              O que voce pode esperar de nos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Educacao', desc: 'Conteudo gratuito e acessivel para que voce entenda os tratamentos e cuide melhor do seu pet.' },
              { icon: Users, title: 'Acolhimento', desc: 'Cada tutor e ouvido com atencao. Entendemos a preocupacao com quem voce ama.' },
              { icon: Globe, title: 'Acessibilidade', desc: 'Consultas 100% online, envio para todo o Brasil e precos justos para tratamentos de qualidade.' },
              { icon: Leaf, title: 'Transparencia', desc: 'Sabemos a origem de cada ingrediente. Voce sabe exatamente o que seu pet esta recebendo.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-8 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[#2C4C3B]" />
                </div>
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-2">{item.title}</h3>
                <p className="text-sm text-[#4A6B5A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-[#2C4C3B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-10 h-10 text-[#C87A5D] mx-auto mb-6" />
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-medium tracking-tight text-[#F9F6F0] mb-4">
            Vamos juntos cuidar de quem voce ama?
          </h2>
          <p className="text-[#F9F6F0]/70 mb-8 max-w-lg mx-auto leading-relaxed">
            Agende uma consulta com nossos especialistas e descubra como a medicina integrativa pode transformar a vida do seu pet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/consultas" data-testid="mission-cta-consultation" className="bg-[#C87A5D] text-[#F9F6F0] hover:bg-[#B3674C] rounded-full px-8 py-3.5 font-medium transition-all">
              Agendar Consulta
            </Link>
            <Link to="/produtos" className="bg-transparent border border-[#F9F6F0]/30 text-[#F9F6F0] hover:bg-[#F9F6F0]/10 rounded-full px-8 py-3.5 font-medium transition-all">
              Conhecer Produtos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
