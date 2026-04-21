import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LangProvider } from "./contexts/LangContext";
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
import TeamPage from "./pages/TeamPage";
import TherapiesPage from "./pages/TherapiesPage";
import ElementQuizPage from "./pages/ElementQuizPage";
import { BlogList, BlogArticle } from "./pages/BlogPage";
import SymptomCalculatorPage from "./pages/SymptomCalculatorPage";
import DietaryTherapyPage from "./pages/DietaryTherapyPage";
import ProductSegmentsPage from "./pages/ProductSegmentsPage";
import VideoPortalPage from "./pages/VideoPortalPage";
import MyPetsPage from "./pages/MyPetsPage";
import ChatWidget from "./components/ChatWidget";
import VetPortalPage from "./pages/VetPortalPage";
import { CoursesListPage, CourseDetailPage } from "./pages/CoursesPage";
import NewsPage from "./pages/NewsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
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
              <Route path="/equipe" element={<TeamPage />} />
              <Route path="/terapias" element={<TherapiesPage />} />
              <Route path="/quiz-elemento" element={<ElementQuizPage />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:id" element={<BlogArticle />} />
              <Route path="/calculadora-tratamento" element={<SymptomCalculatorPage />} />
              <Route path="/terapia-alimentar" element={<DietaryTherapyPage />} />
              <Route path="/loja" element={<ProductSegmentsPage />} />
              <Route path="/videos" element={<VideoPortalPage />} />
              <Route path="/meus-pets" element={<MyPetsPage />} />
              <Route path="/portal-vet" element={<VetPortalPage />} />
              <Route path="/cursos" element={<CoursesListPage />} />
              <Route path="/cursos/:id" element={<CourseDetailPage />} />
              <Route path="/noticias" element={<NewsPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <ChatWidget />
        </div>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
