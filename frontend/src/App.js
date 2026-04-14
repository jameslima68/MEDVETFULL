import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ConsultationPage from "./pages/ConsultationPage";
import { TipsList, TipDetail } from "./pages/TipsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import MissionPage from "./pages/MissionPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import CoatGuidePage from "./pages/CoatGuidePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import AcupunctureTCMPage from "./pages/AcupunctureTCMPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F9F6F0]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/missao" element={<MissionPage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/consultas" element={<ConsultationPage />} />
              <Route path="/dicas" element={<TipsList />} />
              <Route path="/dicas/:id" element={<TipDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
              <Route path="/depoimentos" element={<TestimonialsPage />} />
              <Route path="/fidelidade" element={<LoyaltyPage />} />
              <Route path="/guia-pelagem" element={<CoatGuidePage />} />
              <Route path="/assinaturas" element={<SubscriptionsPage />} />
              <Route path="/acupuntura-mtc" element={<AcupunctureTCMPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
