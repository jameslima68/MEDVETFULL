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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F9F6F0]">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/consultas" element={<ConsultationPage />} />
              <Route path="/dicas" element={<TipsList />} />
              <Route path="/dicas/:id" element={<TipDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
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
