import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentData, setPaymentData] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return; }
    let attempts = 0;
    const maxAttempts = 5;
    const poll = async () => {
      if (attempts >= maxAttempts) { setStatus('timeout'); return; }
      attempts++;
      try {
        const { data } = await axios.get(`${API}/checkout/status/${sessionId}`);
        setPaymentData(data);
        if (data.payment_status === 'paid') { setStatus('paid'); return; }
        if (data.status === 'expired') { setStatus('expired'); return; }
        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 2000);
      }
    };
    poll();
  }, [sessionId]);

  return (
    <div data-testid="payment-success-page" className="min-h-screen bg-[#F9F6F0] flex items-center justify-center px-4">
      <div className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-3xl p-10 max-w-md w-full text-center shadow-lg">
        {status === 'checking' && (
          <>
            <Loader2 className="w-12 h-12 text-[#2C4C3B] mx-auto mb-6 animate-spin" />
            <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1A2E24] mb-3">Verificando pagamento...</h2>
            <p className="text-[#4A6B5A]">Aguarde enquanto confirmamos seu pagamento.</p>
          </>
        )}
        {status === 'paid' && (
          <>
            <div className="w-16 h-16 bg-[#2C4C3B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#2C4C3B]" />
            </div>
            <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1A2E24] mb-3">Pagamento Confirmado!</h2>
            <p className="text-[#4A6B5A] mb-2">Seu pedido foi processado com sucesso.</p>
            {paymentData?.metadata?.product_name && (
              <p className="font-semibold text-[#2C4C3B] mb-4">{paymentData.metadata.product_name}</p>
            )}
            <p className="text-sm text-[#84978F] mb-6">Voce recebera um e-mail com os detalhes do pedido.</p>
            <div className="flex flex-col gap-3">
              <Link to="/produtos" data-testid="back-to-products" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3 font-medium transition-all inline-block">
                Continuar Comprando
              </Link>
              <Link to="/dashboard" className="text-sm text-[#2C4C3B] font-medium hover:underline">
                Ver meu painel
              </Link>
            </div>
          </>
        )}
        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-red-600 font-bold">!</span>
            </div>
            <h2 className="font-['Outfit'] text-2xl font-semibold text-[#1A2E24] mb-3">
              {status === 'expired' ? 'Sessao Expirada' : 'Erro no Pagamento'}
            </h2>
            <p className="text-[#4A6B5A] mb-6">
              {status === 'timeout' ? 'Nao foi possivel confirmar o pagamento. Verifique seu e-mail.' : 'Houve um problema com o pagamento. Tente novamente.'}
            </p>
            <Link to="/produtos" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-8 py-3 font-medium transition-all inline-block">
              Voltar aos Produtos
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
