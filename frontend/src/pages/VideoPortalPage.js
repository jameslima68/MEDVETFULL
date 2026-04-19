import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Clock, Instagram, Youtube, Music2, Filter, X, Heart, Share2, Eye } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TAGS_ALL = ['Todos', 'bem-estar', 'acupuntura', 'fitoterapia', 'homeopatia', 'CBD', 'dor', 'ansiedade', 'nutrição', 'pelagem', 'reabilitação', 'energia', 'comportamento'];

function VideoCard({ video, onPlay }) {
  return (
    <div data-testid={`video-card-${video.id}`} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative aspect-[9/16] sm:aspect-video overflow-hidden cursor-pointer" onClick={() => onPlay(video)}>
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-[#1A2E24]/30 group-hover:bg-[#1A2E24]/40 transition-colors flex items-center justify-center">
          {video.has_video ? (
            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-[#2C4C3B] ml-1" fill="#2C4C3B" />
            </div>
          ) : (
            <div className="bg-[#C87A5D]/90 rounded-full px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Em breve</span>
            </div>
          )}
        </div>
        {video.has_video && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{video.duration}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-['Outfit'] text-sm font-medium text-[#1A2E24] line-clamp-2 mb-1">{video.title}</h3>
        <p className="text-xs text-[#4A6B5A] line-clamp-2 mb-2">{video.description}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {video.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-[#2C4C3B]/5 text-[#4A6B5A] px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} data-testid="video-player-close" className="absolute -top-10 right-0 text-white hover:text-[#C87A5D] transition-colors">
          <X className="w-8 h-8" />
        </button>
        {video.video_url ? (
          <video
            src={`${process.env.REACT_APP_BACKEND_URL}${video.video_url}`}
            controls
            autoPlay
            className="w-full rounded-2xl"
            style={{ maxHeight: '80vh' }}
          />
        ) : (
          <div className="bg-[#1A2E24] rounded-2xl p-10 text-center">
            <Clock className="w-12 h-12 text-[#C87A5D] mx-auto mb-4" />
            <h3 className="text-white font-['Outfit'] text-xl font-medium mb-2">{video.title}</h3>
            <p className="text-white/60 text-sm">Este vídeo está sendo produzido e estará disponível em breve.</p>
          </div>
        )}
        <div className="mt-4 text-white">
          <h3 className="font-['Outfit'] text-lg font-medium">{video.title}</h3>
          <p className="text-white/60 text-sm mt-1">{video.description}</p>
        </div>
      </div>
    </div>
  );
}

function SocialSection({ social }) {
  return (
    <section data-testid="social-section" className="bg-[#2C4C3B] rounded-3xl p-8 sm:p-12">
      <div className="text-center mb-8">
        <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-medium text-[#F9F6F0]">Siga-nos nas Redes</h2>
        <p className="text-[#F9F6F0]/60 text-sm mt-2">Conteúdo exclusivo de bem-estar pet nas nossas redes sociais</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Instagram */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Instagram className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0]">Instagram</h3>
          <p className="text-[#F9F6F0]/50 text-xs mt-1 mb-3">Reels e stories diários</p>
          {social?.instagram?.configured ? (
            <a href={social.instagram.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C87A5D] font-medium hover:underline">
              @{social.instagram.username}
            </a>
          ) : (
            <span className="text-xs bg-[#C87A5D]/20 text-[#C87A5D] px-3 py-1 rounded-full font-medium">Em breve</span>
          )}
        </div>

        {/* TikTok */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Music2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0]">TikTok</h3>
          <p className="text-[#F9F6F0]/50 text-xs mt-1 mb-3">Vídeos curtos e dicas rápidas</p>
          {social?.tiktok?.configured ? (
            <a href={social.tiktok.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C87A5D] font-medium hover:underline">
              @{social.tiktok.username}
            </a>
          ) : (
            <span className="text-xs bg-[#C87A5D]/20 text-[#C87A5D] px-3 py-1 rounded-full font-medium">Em breve</span>
          )}
        </div>

        {/* YouTube */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all">
          <div className="w-14 h-14 bg-[#FF0000] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-['Outfit'] text-lg font-medium text-[#F9F6F0]">YouTube</h3>
          <p className="text-[#F9F6F0]/50 text-xs mt-1 mb-3">Vídeos longos e tratamentos</p>
          {social?.youtube?.configured ? (
            <a href={social.youtube.channel_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C87A5D] font-medium hover:underline">
              Nosso Canal
            </a>
          ) : (
            <span className="text-xs bg-[#C87A5D]/20 text-[#C87A5D] px-3 py-1 rounded-full font-medium">Em breve</span>
          )}
        </div>
      </div>
    </section>
  );
}

export default function VideoPortalPage() {
  const [videos, setVideos] = useState([]);
  const [social, setSocial] = useState(null);
  const [activeTag, setActiveTag] = useState('Todos');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/videos`),
      axios.get(`${API}/social/config`)
    ]).then(([vRes, sRes]) => {
      setVideos(vRes.data);
      setSocial(sRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeTag === 'Todos' ? videos : videos.filter(v => v.tags.some(t => t.toLowerCase() === activeTag.toLowerCase()));

  return (
    <div data-testid="video-portal-page" className="min-h-screen bg-[#F9F6F0]">
      {/* Hero */}
      <section className="bg-[#2C4C3B] py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-20 w-96 h-96 border border-[#F9F6F0] rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#F9F6F0]/10 rounded-full px-4 py-2 mb-6">
            <Play className="w-4 h-4 text-[#C87A5D]" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#F9F6F0]/80">MEDVET TV</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#F9F6F0]">
            Vídeos de <span className="text-[#C87A5D]">Bem-estar Pet</span>
          </h1>
          <p className="text-[#F9F6F0]/70 mt-4 max-w-2xl mx-auto">
            Dicas de cuidados, tratamentos integrativos e bem-estar animal produzidos pela Dra. Tabatha Novikov e nossa equipe de especialistas.
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      <div className="sticky top-16 sm:top-20 z-30 bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-[#E0DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <Filter className="w-4 h-4 text-[#84978F] flex-shrink-0" />
            {TAGS_ALL.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                data-testid={`filter-tag-${tag}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTag === tag ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-white/50 border border-[#E0DDD5] text-[#4A6B5A] hover:bg-[#2C4C3B]/5'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white/40 rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Available Videos */}
            {filtered.filter(v => v.has_video).length > 0 && (
              <div className="mb-12">
                <h2 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#2C4C3B]" /> Vídeos Disponíveis
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.filter(v => v.has_video).map(v => (
                    <VideoCard key={v.id} video={v} onPlay={setPlayingVideo} />
                  ))}
                </div>
              </div>
            )}

            {/* Coming Soon Videos */}
            {filtered.filter(v => !v.has_video).length > 0 && (
              <div className="mb-12">
                <h2 className="font-['Outfit'] text-lg font-medium text-[#84978F] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C87A5D]" /> Em Produção
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.filter(v => !v.has_video).map(v => (
                    <VideoCard key={v.id} video={v} onPlay={setPlayingVideo} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-[#84978F]">
                <p>Nenhum vídeo encontrado para este filtro.</p>
              </div>
            )}
          </>
        )}

        {/* Social Section */}
        <div className="mt-12">
          <SocialSection social={social} />
        </div>
      </div>

      {playingVideo && <VideoPlayer video={playingVideo} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
}
