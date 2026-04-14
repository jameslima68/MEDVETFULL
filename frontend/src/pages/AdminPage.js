import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Package, Users, Calendar, CreditCard, TrendingUp, Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Toaster, toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const ax = axios.create({ baseURL: API, withCredentials: true });

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'homeopatia', image_url: '', in_stock: true, featured: false });
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [s, p, c, u, pay] = await Promise.all([
        ax.get('/admin/stats'), ax.get('/products'), ax.get('/admin/consultations'), ax.get('/admin/users'), ax.get('/admin/payments')
      ]);
      setStats(s.data); setProducts(p.data); setConsultations(c.data); setUsers(u.data); setPayments(pay.data);
    } catch (e) { console.error(e); }
    setLoadingData(false);
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
    } catch (e) { toast.error('Erro ao salvar produto'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await ax.delete(`/admin/products/${id}`);
      toast.success('Produto excluido!');
      loadData();
    } catch { toast.error('Erro ao excluir'); }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setProductForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image_url: p.image_url || '', in_stock: p.in_stock, featured: p.featured || false });
    setNewProduct(true);
  };

  const openNew = () => {
    setEditProduct(null);
    setProductForm({ name: '', description: '', price: '', category: 'homeopatia', image_url: '', in_stock: true, featured: false });
    setNewProduct(true);
  };

  const updateConsultationStatus = async (id, status) => {
    try {
      await ax.put(`/admin/consultations/${id}/status?status=${status}`);
      toast.success(`Consulta ${status === 'confirmed' ? 'confirmada' : 'atualizada'}!`);
      loadData();
    } catch { toast.error('Erro ao atualizar status'); }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full bg-white/50 border border-[#E0DDD5] focus:border-[#84978F] focus:ring-1 focus:ring-[#84978F] rounded-xl px-4 py-2.5 text-[#1A2E24] text-sm outline-none transition-all";

  return (
    <div data-testid="admin-page" className="min-h-screen bg-[#F9F6F0]">
      <Toaster position="top-right" richColors />
      <div className="bg-[#2C4C3B] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#84978F]">Administracao</span>
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold tracking-tight text-[#F9F6F0] mt-2">Painel Admin</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { icon: Package, label: 'Produtos', value: stats.products, color: 'bg-[#2C4C3B]' },
              { icon: Calendar, label: 'Consultas', value: stats.consultations, color: 'bg-[#84978F]' },
              { icon: Users, label: 'Usuarios', value: stats.users, color: 'bg-[#C87A5D]' },
              { icon: CreditCard, label: 'Pagamentos', value: stats.total_payments, color: 'bg-[#A4B8C4]' },
              { icon: TrendingUp, label: 'Pagos', value: stats.paid_payments, color: 'bg-[#2C4C3B]' },
              { icon: TrendingUp, label: 'Receita', value: `R$ ${stats.total_revenue.toFixed(2).replace('.', ',')}`, color: 'bg-[#C87A5D]' },
            ].map((s, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm border border-[#E0DDD5] rounded-2xl p-5">
                <div className={`w-9 h-9 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className="w-4 h-4 text-[#F9F6F0]" />
                </div>
                <p className="text-xs text-[#84978F] font-medium">{s.label}</p>
                <p className="font-['Outfit'] text-xl font-semibold text-[#1A2E24] mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white/60 border border-[#E0DDD5] rounded-xl p-1 h-auto flex-wrap">
            <TabsTrigger value="products" data-testid="admin-tab-products" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Produtos</TabsTrigger>
            <TabsTrigger value="consultations" data-testid="admin-tab-consultations" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Consultas</TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Usuarios</TabsTrigger>
            <TabsTrigger value="payments" data-testid="admin-tab-payments" className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-[#2C4C3B] data-[state=active]:text-[#F9F6F0]">Pagamentos</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84978F]" />
                <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${inputCls} pl-10`} />
              </div>
              <button onClick={openNew} data-testid="admin-add-product" className="flex items-center gap-2 bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-5 py-2.5 text-sm font-medium transition-all ml-4">
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            {/* Product Form Dialog */}
            {newProduct && (
              <div className="bg-white/80 border border-[#E0DDD5] rounded-2xl p-6 mb-6 space-y-4">
                <h3 className="font-['Outfit'] text-lg font-medium text-[#1A2E24]">{editProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Nome" value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} className={inputCls} data-testid="admin-product-name" />
                  <input placeholder="Preco" type="number" step="0.01" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} className={inputCls} data-testid="admin-product-price" />
                  <select value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))} className={inputCls} data-testid="admin-product-category">
                    <option value="homeopatia">Homeopatia</option>
                    <option value="hormonios">Hormonios Bioidenticos</option>
                    <option value="medicina-chinesa">Medicina Chinesa</option>
                    <option value="cbd">CBD</option>
                    <option value="acupuntura">Acupuntura</option>
                  </select>
                  <input placeholder="URL da Imagem" value={productForm.image_url} onChange={e => setProductForm(f => ({...f, image_url: e.target.value}))} className={inputCls} />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-[#1A2E24]">
                      <input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm(f => ({...f, in_stock: e.target.checked}))} className="rounded" /> Em estoque
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#1A2E24]">
                      <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(f => ({...f, featured: e.target.checked}))} className="rounded" /> Destaque
                    </label>
                  </div>
                </div>
                <textarea placeholder="Descricao" value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} rows={3} className={inputCls} data-testid="admin-product-description" />
                <div className="flex gap-3">
                  <button onClick={handleSaveProduct} data-testid="admin-save-product" className="bg-[#2C4C3B] text-[#F9F6F0] hover:bg-[#1A2E24] rounded-full px-6 py-2.5 text-sm font-medium transition-all">Salvar</button>
                  <button onClick={() => { setNewProduct(false); setEditProduct(null); }} className="bg-transparent border border-[#E0DDD5] text-[#4A6B5A] rounded-full px-6 py-2.5 text-sm font-medium transition-all hover:bg-[#E0DDD5]/30">Cancelar</button>
                </div>
              </div>
            )}

            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Produto</th>
                      <th className="text-left px-4 py-3 font-medium">Categoria</th>
                      <th className="text-left px-4 py-3 font-medium">Preco</th>
                      <th className="text-left px-4 py-3 font-medium">Estoque</th>
                      <th className="text-right px-4 py-3 font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {filteredProducts.map(p => (
                      <tr key={p.id} data-testid={`admin-product-row-${p.id}`} className="hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                            <div>
                              <p className="font-medium text-[#1A2E24]">{p.name}</p>
                              {p.featured && <span className="text-xs text-[#C87A5D]">Destaque</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{p.category}</td>
                        <td className="px-4 py-3 font-medium text-[#2C4C3B]">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.in_stock ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : 'bg-red-100 text-red-600'}`}>
                            {p.in_stock ? 'Sim' : 'Nao'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(p)} className="p-2 text-[#84978F] hover:text-[#2C4C3B] transition-colors" data-testid={`admin-edit-${p.id}`}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-[#84978F] hover:text-red-600 transition-colors" data-testid={`admin-delete-${p.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Consultations Tab */}
          <TabsContent value="consultations">
            <div className="bg-white/60 border border-[#E0DDD5] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium">Pet</th>
                      <th className="text-left px-4 py-3 font-medium">Especialidade</th>
                      <th className="text-left px-4 py-3 font-medium">Data/Hora</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {consultations.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-[#84978F]">Nenhuma consulta agendada</td></tr>
                    ) : consultations.map(c => (
                      <tr key={c.id} className="hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1A2E24]">{c.name}</p>
                          <p className="text-xs text-[#84978F]">{c.email}</p>
                        </td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.pet_name} ({c.pet_type})</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.category}</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{c.date} {c.time}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'confirmed' ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : c.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-[#C87A5D]/10 text-[#C87A5D]'}`}>
                            {c.status === 'confirmed' ? 'Confirmada' : c.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => updateConsultationStatus(c.id, 'confirmed')} className="px-3 py-1 bg-[#2C4C3B] text-[#F9F6F0] rounded-full text-xs font-medium">Confirmar</button>
                              <button onClick={() => updateConsultationStatus(c.id, 'cancelled')} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Cancelar</button>
                            </div>
                          )}
                        </td>
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
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">E-mail</th>
                      <th className="text-left px-4 py-3 font-medium">Telefone</th>
                      <th className="text-left px-4 py-3 font-medium">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2E24]">{u.name}</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{u.email}</td>
                        <td className="px-4 py-3 text-[#4A6B5A]">{u.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-[#C87A5D]/10 text-[#C87A5D]' : 'bg-[#84978F]/10 text-[#84978F]'}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3 text-[#84978F] text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}</td>
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
                  <thead className="bg-[#EAE7E1] text-[#1A2E24]">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Produto</th>
                      <th className="text-left px-4 py-3 font-medium">Valor</th>
                      <th className="text-left px-4 py-3 font-medium">Metodo</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium">Data</th>
                      <th className="text-right px-4 py-3 font-medium">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DDD5]">
                    {payments.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-[#84978F]">Nenhum pagamento registrado</td></tr>
                    ) : payments.map((p, i) => (
                      <tr key={i} className="hover:bg-white/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2E24]">{p.product_name}</td>
                        <td className="px-4 py-3 text-[#2C4C3B] font-medium">R$ {p.amount?.toFixed(2).replace('.', ',')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.payment_method === 'pix' ? 'bg-[#00BDAE]/10 text-[#00BDAE]' : 'bg-[#84978F]/10 text-[#84978F]'}`}>
                            {p.payment_method === 'pix' ? 'PIX' : 'Stripe'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.payment_status === 'paid' ? 'bg-[#2C4C3B]/10 text-[#2C4C3B]' : p.payment_status === 'pending' ? 'bg-[#C87A5D]/10 text-[#C87A5D]' : 'bg-red-100 text-red-600'}`}>
                            {p.payment_status === 'paid' ? 'Pago' : p.payment_status === 'pending' ? 'Pendente' : p.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#4A6B5A] text-xs">{p.email || p.customer_name || '-'}</td>
                        <td className="px-4 py-3 text-[#84978F] text-xs">{p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          {p.payment_status !== 'paid' && p.payment_method === 'pix' && (
                            <button
                              onClick={async () => { try { await ax.put(`/admin/payments/${p.id}/confirm`); toast.success('Pagamento confirmado!'); loadData(); } catch { toast.error('Erro'); } }}
                              data-testid={`confirm-pix-${p.id}`}
                              className="px-3 py-1 bg-[#00BDAE] text-white rounded-full text-xs font-medium hover:bg-[#00A99D] transition-colors"
                            >
                              Confirmar PIX
                            </button>
                          )}
                        </td>
                      </tr>
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
