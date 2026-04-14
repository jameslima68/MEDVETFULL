import { useState } from 'react';
import { X, Copy, CheckCircle2, CreditCard, Tag, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentModal({ product, onClose }) {
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [pixForm, setPixForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const finalPrice = couponApplied ? couponApplied.final_price : product.price;
  const discount = couponApplied ? couponApplied.discount : 0;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await axios.post(`${API}/coupons/validate?code=${couponCode}&product_id=${product.id}`);
      setCouponApplied(data);
      toast.success(`Cupom aplicado! Desconto de R$ ${data.discount.toFixed(2).replace('.', ',')}`);
    } catch (e) {
      const msg = e.response?.data?.detail || 'Cupom inválido';
      toast.error(typeof msg === 'string' ? msg : 'Cupom inválido');
      setCouponApplied(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
  };

  const handleStripe = async () => {
    setLoading(true);
    try {
      const origin = window.location.origin;
      const { data } = await axios.post(`${API}/checkout`, {
        product_id: product.id,
        origin_url: origin,
        email: user?.email || '',
        coupon_code: couponApplied?.coupon_code || ''
      });
      window.location.href = data.url;
    } catch {
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  const handlePix = async () => {
    if (!pixForm.name || !pixForm.email) { toast.error('Preencha nome e email'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/checkout/pix`, {
        product_id: product.id,
        name: pixForm.name,
        email: pixForm.email,
        coupon_code: couponApplied?.coupon_code || ''
      });
      setPixData(data);
      toast.success('Código PIX gerado!');
    } catch {
      toast.error('Erro ao gerar PIX.');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixData.pix_code);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#1A2E24]/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#F9F6F0] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E0DDD5]" onClick={e => e.stopPropagation()} data-testid="payment-modal">
        {/* Header */}
        <div className="p-6 border-b border-[#E0DDD5] flex items-center justify-between">
          <h2 className="font-['Outfit'] text-xl font-semibold text-[#1A2E24]">Finalizar Compra</h2>
          <button onClick={onClose} data-testid="close-payment-modal" className="p-2 text-[#84978F] hover:text-[#1A2E24] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 bg-white/40">
          <div className="flex items-center gap-4">
            {product.image_url && <img src={product.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />}
            <div>
              <p className="font-medium text-[#1A2E24]">{product.name}</p>
              {discount > 0 ? (
                <div>
                  <span className="text-sm text-[#84978F] line-through mr-2">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  <span className="font-['Outfit'] text-2xl font-bold text-[#2C4C3B]">R$ {finalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              ) : (
                <p className="font-['Outfit'] text-2xl font-bold text-[#2C4C3B]">R$ {product.price.toFixed(2).replace('.', ',')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Coupon */}
          {!pixData && (
            <div className="mb-5">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-[#2C4C3B]/5 border border-[#2C4C3B]/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#2C4C3B]" />
                    <span className="text-sm font-medium text-[#2C4C3B]">{couponApplied.coupon_code}</span>
                    <span className="text-sm text-[#4A6B5A]">-R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-[#C87A5D] hover:underline">Remover</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    data-testid="coupon-input"
                    className="flex-1 bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-2.5 text-[#1A2E24] text-sm outline-none transition-all uppercase"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    data-testid="apply-coupon-btn"
                    className="px-4 py-2.5 bg-[#2C4C3B] text-[#F9F6F0] rounded-xl text-sm font-medium hover:bg-[#1A2E24] transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          )}

          {!method && !pixData && (
            <div className="space-y-4">
              <p className="text-sm text-[#4A6B5A] mb-2">Escolha o método de pagamento:</p>
              <button
                onClick={() => { setMethod('stripe'); handleStripe(); }}
                disabled={loading}
                data-testid="pay-stripe-btn"
                className="w-full flex items-center gap-4 p-4 bg-white/60 border border-[#E0DDD5] rounded-2xl hover:shadow-md transition-all group text-left"
              >
                <div className="w-12 h-12 bg-[#2C4C3B]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-[#2C4C3B]" />
                </div>
                <div>
                  <p className="font-medium text-[#1A2E24]">Cartão de Crédito/Débito</p>
                  <p className="text-xs text-[#84978F]">Pagamento seguro via Stripe</p>
                </div>
              </button>
              <button
                onClick={() => setMethod('pix')}
                disabled={loading}
                data-testid="pay-pix-btn"
                className="w-full flex items-center gap-4 p-4 bg-white/60 border border-[#E0DDD5] rounded-2xl hover:shadow-md transition-all group text-left"
              >
                <div className="w-12 h-12 bg-[#00BDAE]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00BDAE] font-bold text-lg">PIX</span>
                </div>
                <div>
                  <p className="font-medium text-[#1A2E24]">PIX</p>
                  <p className="text-xs text-[#84978F]">Transferência instantânea</p>
                </div>
              </button>
            </div>
          )}

          {method === 'pix' && !pixData && (
            <div className="space-y-4">
              <p className="text-sm text-[#4A6B5A]">Preencha seus dados para gerar o código PIX:</p>
              <input placeholder="Seu nome" value={pixForm.name} onChange={e => setPixForm(f => ({...f, name: e.target.value}))} data-testid="pix-name" className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all" />
              <input placeholder="seu@email.com" type="email" value={pixForm.email} onChange={e => setPixForm(f => ({...f, email: e.target.value}))} data-testid="pix-email" className="w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-3 text-[#1A2E24] text-sm outline-none transition-all" />
              <div className="flex gap-3">
                <button onClick={handlePix} disabled={loading} data-testid="generate-pix-btn" className="flex-1 bg-[#00BDAE] text-white hover:bg-[#00A99D] rounded-full px-6 py-3 text-sm font-medium transition-all disabled:opacity-50">
                  {loading ? 'Gerando...' : 'Gerar Código PIX'}
                </button>
                <button onClick={() => setMethod(null)} className="px-4 py-3 border border-[#E0DDD5] rounded-full text-sm text-[#4A6B5A]">Voltar</button>
              </div>
            </div>
          )}

          {pixData && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 bg-[#00BDAE]/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#00BDAE]" />
              </div>
              <p className="text-sm text-[#4A6B5A]">Escaneie o QR Code ou copie o código PIX:</p>
              {pixData.qr_code && (
                <div className="bg-white rounded-2xl p-4 inline-block mx-auto border border-[#E0DDD5]">
                  <img src={pixData.qr_code} alt="QR Code PIX" className="w-48 h-48 mx-auto" data-testid="pix-qr-code" />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-xs text-[#84978F]">Chave PIX:</p>
                <p className="font-medium text-[#2C4C3B]">{pixData.pix_key}</p>
              </div>
              <div className="bg-white/50 border border-[#E0DDD5] rounded-xl p-3 text-xs text-[#4A6B5A] break-all max-h-20 overflow-y-auto">{pixData.pix_code}</div>
              <button onClick={copyPix} data-testid="copy-pix-btn" className={`w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${copied ? 'bg-[#2C4C3B] text-[#F9F6F0]' : 'bg-[#00BDAE] text-white hover:bg-[#00A99D]'}`}>
                {copied ? <><CheckCircle2 className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Código PIX</>}
              </button>
              <p className="text-xs text-[#84978F]">Após o pagamento, sua compra será confirmada em até 24 horas.</p>
              <button onClick={onClose} className="text-sm text-[#2C4C3B] font-medium hover:underline">Fechar</button>
            </div>
          )}

          {method === 'stripe' && loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#4A6B5A]">Redirecionando para pagamento seguro...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
