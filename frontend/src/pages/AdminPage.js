import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Package, Users, Calendar, CreditCard, TrendingUp, Plus, Pencil, Trash2, Search, Tag, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ax = axios.create({ baseURL: API, withCredentials: true });

const CHART_COLORS = ['#2C4C3B', '#84978F', '#C87A5D', '#A4B8C4', '#6B8077', '#B3674C'];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [consultationAnalytics, setConsultationAnalytics] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(false);
  const [newCoupon, setNewCoupon] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'homeopatia', image_url: '', in_stock: true, featured: false });
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_purchase: '0', max_uses: '100', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [ov, p, c, u, pay, cp, rev, pa, ca] = await Promise.all([
        ax.get('/admin/analytics/overview'), ax.get('/products'), ax.get('/admin/consultations'),
        ax.get('/admin/users'), ax.get('/admin/payments'), ax.get('/admin/coupons'),
        ax.get('/admin/analytics/revenue'), ax.get('/admin/analytics/products'), ax.get('/admin/analytics/consultations')
      ]);
      setOverview(ov.data); setProducts(p.data); setConsultations(c.data);
      setUsers(u.data); setPayments(pay.data); setCoupons(cp.data);
      setRevenueData(rev.data); setProductAnalytics(pa.data); setConsultationAnalytics(ca.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (user && user.role === 'admin') loadData(); }, [user]);

  if (authLoading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#2C4C3B] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user === false) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;

  const handleSaveProduct = async () => {
    try {
      if (editProduct) {
        await ax.put(`/admin/products/${editProduct.id}`, { ...productForm, price: parseFloat(productForm.price) });
        toast.success('Produto atualizado!');
      } else {
        await ax.post('/admin/products', { ...productForm, price: parseFloat(productForm.price) });
        toast.success('Produto criado!');
      }
      setEditProduct(null); setNewProduct(false);
      setProductForm({ name: '', description: '', price: '', category: 'homeopatia', image_url: '', in_stock: true, featured: false });
      loadData();
    } catch { toast.error('Erro ao salvar produto'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try { await ax.delete(`/admin/products/${id}`); toast.success('Excluido!'); loadData(); } catch { toast.error('Erro'); }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image_url: p.image_url || '', in_stock: p.in_stock, featured: p.featured || false });
    setNewProduct(true);
  };

  const handleSaveCoupon = async () => {
    try {
      await ax.post('/admin/coupons', { ...couponForm, discount_value: parseFloat(couponForm.discount_value), min_purchase: parseFloat(couponForm.min_purchase), max_uses: parseInt(couponForm.max_uses), active: true });
      toast.success('Cupom criado!');
      setNewCoupon(false);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', min_purchase: '0', max_uses: '100', description: '' });
      loadData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Erro ao criar cupom'); }
  };

  const toggleCoupon = async (id) => {
    try { await ax.put(`/admin/coupons/${id}/toggle`); loadData(); } catch { toast.error('Erro'); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Excluir este cupom?')) return;
    try { await ax.delete(`/admin/coupons/${id}`); toast.success('Excluido!'); loadData(); } catch { toast.error('Erro'); }
  };

  const updateConsultationStatus = async (id, status) => {
    try { await ax.put(`/admin/consultations/${id}/status?status=${status}`); toast.success('Atualizado!'); loadData(); } catch { toast.error('Erro'); }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const inputCls = "w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-2.5 text-[#1A2E24] text-sm outline-none transition-all";

  return (
    <div data-testid="admin-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <div className="bg-[#2C4C3B] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Administração</span>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold tracking-tight text-[#F9F6F0] mt-2">Painel Admin</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { icon: Package, label: 'Produtos', value: overview.products, color: 'bg-[#2C4C3B]' },
              { icon: Calendar, label: 'Consultas', value: overview.consultations, color: 'bg-[#84978F]' },
              { icon: Users, label: 'Usuarios', value: overview.users, color: 'bg-[#C87A5D]' },
              { icon: CreditCard, label: 'Pagamentos', value: `${overview.pix_payments} PIX / ${overview.stripe_payments} Stripe`, color: 'bg-[#A4B8C4]' },
              { icon: TrendingUp, label: 'Receita', value: `R$ ${overview.total_revenue.toFixed(2).replace('.', ',')}`, color: 'bg-[#2C4C3B]' },
            ].map((s, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-5">
                <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className="w-4 h-4 text-[#F9F6F0]" />
                </div>
                <p className="text-xs text-[#84978F] font-medium">{s.label}</p>
                <p className="font-['Outfit'] text-lg font-semibold text-[#1A2E24] mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-white/60 border border-[#E0DDD5] rounded-xl p-1 h-auto flex-wrap">
            <TabsTrigger value="reports" data-testid="admin-tab-reports" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Relatórios</TabsTrigger>
            <TabsTrigger value="products" data-testid="admin-tab-products" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Produtos</TabsTrigger>
            <TabsTrigger value="coupons" data-testid="admin-tab-coupons" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Cupons</TabsTrigger>
            <TabsTrigger value="consultations" data-testid="admin-tab-consultations" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Consultas</TabsTrigger>
            <TabsTrigger value="payments" data-testid="admin-tab-payments" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Pagamentos</TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Usuarios</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#2C4C3B]" /> Receita por Dia</h3>
                {revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#84978F' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#84978F' }} />
                      <Tooltip contentStyle={{ background: '#F9F6F0', border: '1px solid #E0DDD5', borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="revenue" fill="#2C4C3B" radius={[6, 6, 0, 0]} name="Receita (R$)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-[#84978F] text-center py-10">Sem dados de receita ainda</p>}
              </div>

              {/* Products by Category */}
              <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Produtos por Categoria</h3>
                {productAnalytics?.by_category?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={productAnalytics.by_category} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={({ category, count }) => `${category} (${count})`} labelLine={false}>
                        {productAnalytics.by_category.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#F9F6F0', border: '1px solid #E0DDD5', borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-[#84978F] text-center py-10">Carregando...</p>}
              </div>

              {/* Consultation Stats */}
              <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Consultas por Especialidade</h3>
                {consultationAnalytics?.by_category?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={consultationAnalytics.by_category} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD5" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#84978F' }} />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#84978F' }} width={120} />
                      <Tooltip contentStyle={{ background: '#F9F6F0', border: '1px solid #E0DDD5', borderRadius: 12, fontSize: 12 }} />
                      <Bar dataKey="count" fill="#84978F" radius={[0, 6, 6, 0]} name="Consultas" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-sm text-[#84978F] text-center py-10">Sem consultas ainda</p>}
              </div>

              {/* Top Sold */}
              <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl p-6">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24] mb-4">Produtos Mais Vendidos</h3>
                {productAnalytics?.top_sold?.length > 0 ? (
                  <div className="space-y-3">
                    {productAnalytics.top_sold.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-[#E0DDD5] last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#2C4C3B] rounded-full flex items-center justify-center text-[#F9F6F0] text-xs font-bold">{i + 1}</span>
                          <span className="text-sm text-[#1A2E24] font-medium">{p.product}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-[#2C4C3B]">R$ {p.revenue.toFixed(2).replace('.', ',')}</span>
                          <span className="text-xs text-[#84978F] ml-2">({p.sold}x)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[#84978F] text-center py-10">Sem vendas ainda</p>}
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84978F]" />
                <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputCls} pl-10`} />
              </div>
              <button onClick={() => { setEditProduct(null); setProductForm({ name: '', description: '', price: '', category: 'homeopatia', image_url: '', in_stock: true, featured: false }); setNewProduct(true); }} data-testid="admin-add-product" className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2.5 text-sm font-medium ml-4">
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>
            {newProduct && (
              <div className="bg-white/80 border border-[#E0DDD5] rounded-2xl p-6 mb-6 space-y-4">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{editProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Nome" value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} className={inputCls} data-testid="admin-product-name" />
                  <input placeholder="Preco" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} className={inputCls} data-testid="admin-product-price" />
                  <select value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))} className={inputCls}>
                    <option value="homeopatia">Homeopatia</option><option value="hormonios">Hormônios</option><option value="medicina-chinesa">Medicina Chinesa</option><option value="cbd">CBD</option><option value="acupuntura">Acupuntura</option><option value="saúde-pelos">Saúde dos Pelos</option><option value="cromoterapia">Cromoterapia</option>
                  </select>
                  <input placeholder="URL da Imagem" value={productForm.image_url} onChange={e => setProductForm(f => ({...f, image_url: e.target.value}))} className={inputCls} />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm(f => ({...f, in_stock: e.target.checked}))} className="rounded" /> Em estoque</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(f => ({...f, featured: e.target.checked}))} className="rounded" /> Destaque</label>
                  </div>
                </div>
                <textarea placeholder="Descricao" value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} rows={3} className={inputCls} />
                <div className="flex gap-3">
                  <button onClick={handleSaveProduct} data-testid="admin-save-product" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-2.5 text-sm font-medium">Salvar</button>
                  <button onClick={() => { setNewProduct(false); setEditProduct(null); }} className="border border-[#E0DDD5] text-[#4A6B5A] rounded-full px-6 py-2.5 text-sm">Cancelar</button>
                </div>
              </div>
            )}
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]"><tr><th className="text-left px-4 py-3 font-medium">Produto</th><th className="text-left px-4 py-3 font-medium">Categoria</th><th className="text-left px-4 py-3 font-medium">Preco</th><th className="text-left px-4 py-3 font-medium">Estoque</th><th className="text-right px-4 py-3 font-medium">Acoes</th></tr></thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {filteredProducts.slice(0, 20).map(p => (
                      <tr key={p.id} className="hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3"><div className="flex items-center gap-3">{p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div><p className="font-medium text-[#1A2E24]">{p.name}</p>{p.featured && <span className="text-xs text-[#C87A5D]">Destaque</span>}</div></div></td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{p.category}</td>
                        <td className="px-4 py-3 font-medium text-[#2C4C3B]">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.in_stock ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'bg-red-100 text-red-600'}`}>{p.in_stock ? 'Sim' : 'Nao'}</span></td>
                        <td className="px-4 py-3 text-right"><button onClick={() => openEdit(p)} className="p-2 text-[#84978F] hover:text-[#2C4C3B]"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-[#84978F] hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length > 20 && <p className="text-center py-3 text-xs text-[#84978F]">Mostrando 20 de {filteredProducts.length} produtos</p>}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Cupons de Desconto</h3>
              <button onClick={() => setNewCoupon(true)} data-testid="admin-add-coupon" className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2.5 text-sm font-medium">
                <Plus className="w-4 h-4" /> Novo Cupom
              </button>
            </div>
            {newCoupon && (
              <div className="bg-white/80 border border-[#E0DDD5] rounded-2xl p-6 mb-6 space-y-4">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">Criar Cupom</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input placeholder="Código (ex: MEDVET20)" value={couponForm.code} onChange={e => setCouponForm(f => ({...f, code: e.target.value}))} className={`${inputCls} uppercase`} data-testid="coupon-code-input" />
                  <select value={couponForm.discount_type} onChange={e => setCouponForm(f => ({...f, discount_type: e.target.value}))} className={inputCls}>
                    <option value="percentage">Porcentagem (%)</option><option value="fixed">Valor Fixo (R$)</option>
                  </select>
                  <input placeholder={couponForm.discount_type === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'} type="number" step="0.01" value={couponForm.discount_value} onChange={e => setCouponForm(f => ({...f, discount_value: e.target.value}))} className={inputCls} data-testid="coupon-value-input" />
                  <input placeholder="Compra minima (R$)" type="number" step="0.01" value={couponForm.min_purchase} onChange={e => setCouponForm(f => ({...f, min_purchase: e.target.value}))} className={inputCls} />
                  <input placeholder="Usos máximos" type="number" value={couponForm.max_uses} onChange={e => setCouponForm(f => ({...f, max_uses: e.target.value}))} className={inputCls} />
                  <input placeholder="Descricao" value={couponForm.description} onChange={e => setCouponForm(f => ({...f, description: e.target.value}))} className={inputCls} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveCoupon} data-testid="admin-save-coupon" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-2.5 text-sm font-medium">Criar Cupom</button>
                  <button onClick={() => setNewCoupon(false)} className="border border-[#E0DDD5] text-[#4A6B5A] rounded-full px-6 py-2.5 text-sm">Cancelar</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div key={c.id} data-testid={`coupon-card-${c.id}`} className={`bg-white/60 border rounded-2xl p-5 transition-all ${c.active ? 'border-[#2C4C3B]/20' : 'border-[#E0DDD5] opacity-60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#C87A5D]" />
                      <span className="font-['Outfit'] font-bold text-[#1A2E24] text-lg">{c.code}</span>
                    </div>
                    <button onClick={() => toggleCoupon(c.id)} className="text-[#84978F] hover:text-[#2C4C3B]">
                      {c.active ? <ToggleRight className="w-6 h-6 text-[#2C4C3B]" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-[#2C4C3B]">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${c.discount_value.toFixed(2)}`} <span className="text-sm font-normal text-[#84978F]">OFF</span></p>
                  {c.description && <p className="text-xs text-[#4A6B5A] mt-1">{c.description}</p>}
                  <div className="flex items-center justify-between mt-3 text-xs text-[#84978F]">
                    <span>Usos: {c.uses || 0}/{c.max_uses}</span>
                    {c.min_purchase > 0 && <span>Min: R$ {c.min_purchase.toFixed(2)}</span>}
                  </div>
                  <button onClick={() => deleteCoupon(c.id)} className="mt-3 text-xs text-red-400 hover:text-red-600">Excluir cupom</button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]"><tr><th className="text-left px-4 py-3 font-medium">Cliente</th><th className="text-left px-4 py-3 font-medium">Pet</th><th className="text-left px-4 py-3 font-medium">Especialidade</th><th className="text-left px-4 py-3 font-medium">Data/Hora</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="text-right px-4 py-3 font-medium">Acoes</th></tr></thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {consultations.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-[#84978F]">Nenhuma consulta</td></tr>
                    ) : consultations.map(c => (
                      <tr key={c.id} className="hover:bg-white/40">
                        <td className="px-4 py-3"><p className="font-medium text-[#1A2E24]">{c.name}</p><p className="text-xs text-[#84978F]">{c.email}</p></td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.pet_name} ({c.pet_type})</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.category}</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.date} {c.time}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'confirmed' ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : c.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-[#C87A5D]/10 text-[#C87A5D]'}`}>{c.status === 'confirmed' ? 'Confirmada' : c.status === 'cancelled' ? 'Cancelada' : 'Pendente'}</span></td>
                        <td className="px-4 py-3 text-right">{c.status === 'pending' && (<><button onClick={() => updateConsultationStatus(c.id, 'confirmed')} className="px-3 py-1 bg-[#2C4C3B] text-[#F9F6F0] rounded-full text-xs mr-1">Confirmar</button><button onClick={() => updateConsultationStatus(c.id, 'cancelled')} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs">Cancelar</button></>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]"><tr><th className="text-left px-4 py-3 font-medium">Produto</th><th className="text-left px-4 py-3 font-medium">Valor</th><th className="text-left px-4 py-3 font-medium">Metodo</th><th className="text-left px-4 py-3 font-medium">Cupom</th><th className="text-left px-4 py-3 font-medium">Status</th><th className="text-left px-4 py-3 font-medium">Cliente</th><th className="text-left px-4 py-3 font-medium">Data</th><th className="text-right px-4 py-3 font-medium">Acoes</th></tr></thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {payments.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-10 text-[#84978F]">Nenhum pagamento</td></tr>
                    ) : payments.map((p, i) => (
                      <tr key={i} className="hover:bg-white/40">
                        <td className="px-4 py-3 font-medium text-[#1A2E24]">{p.product_name}</td>
                        <td className="px-4 py-3 text-[#2C4C3B] font-medium">{p.discount > 0 ? <><span className="line-through text-[#84978F] text-xs mr-1">R$ {p.original_price?.toFixed(2).replace('.', ',')}</span>R$ {p.amount?.toFixed(2).replace('.', ',')}</> : `R$ ${p.amount?.toFixed(2).replace('.', ',')}`}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.payment_method === 'pix' ? 'bg-[#00BDAE]/10 text-[#00BDAE]' : 'bg-[#84978F]/10 text-[#84978F]'}`}>{p.payment_method === 'pix' ? 'PIX' : 'Stripe'}</span></td>
                        <td className="px-4 py-3 text-xs">{p.coupon_code ? <span className="px-2 py-1 bg-[#C87A5D]/10 text-[#C87A5D] rounded-full font-bold">{p.coupon_code}</span> : '-'}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.payment_status === 'paid' ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'bg-[#C87A5D]/10 text-[#C87A5D]'}`}>{p.payment_status === 'paid' ? 'Pago' : 'Pendente'}</span></td>
                        <td className="px-4 py-3 text-[#4A6B5A] text-xs">{p.email || '-'}</td>
                        <td className="px-4 py-3 text-[#84978F] text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                        <td className="px-4 py-3 text-right">{p.payment_status !== 'paid' && p.payment_method === 'pix' && (<button onClick={async () => { try { await ax.put(`/admin/payments/${p.id}/confirm`); toast.success('Confirmado!'); loadData(); } catch { toast.error('Erro'); } }} className="px-3 py-1 bg-[#00BDAE] text-white rounded-full text-xs font-medium">Confirmar PIX</button>)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]"><tr><th className="text-left px-4 py-3 font-medium">Nome</th><th className="text-left px-4 py-3 font-medium">E-mail</th><th className="text-left px-4 py-3 font-medium">Telefone</th><th className="text-left px-4 py-3 font-medium">Tipo</th><th className="text-left px-4 py-3 font-medium">Criado em</th></tr></thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-white/40"><td className="px-4 py-3 font-medium text-[#1A2E24]">{u.name}</td><td className="px-4 py-3 text-[#4A6B5A]">{u.email}</td><td className="px-4 py-3 text-[#4A6B5A]">{u.phone || '-'}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-[#C87A5D]/10 text-[#C87A5D]' : 'bg-[#84978F]/10 text-[#84978F]'}`}>{u.role}</span></td><td className="px-4 py-3 text-[#84978F] text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
