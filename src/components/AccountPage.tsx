import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { COMPANY_API, PRODUCTS_API, getToken, clearToken, type User } from "@/lib/auth";
import { toast } from "sonner";

type Company = {
  id?: number;
  name: string;
  logo_url: string;
  description: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  website: string;
};

type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  moq: number;
  description: string;
  image_url: string;
  in_stock: boolean;
};

const EMPTY_COMPANY: Company = {
  name: "",
  logo_url: "",
  description: "",
  category: "",
  location: "",
  phone: "",
  email: "",
  website: "",
};

const EMPTY_PRODUCT = {
  title: "",
  category: "",
  price: 0,
  currency: "RUB",
  moq: 1,
  description: "",
  image_url: "",
  in_stock: true,
};

export default function AccountPage({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<"company" | "products">("company");
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
  const [savingCompany, setSavingCompany] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [savingProduct, setSavingProduct] = useState(false);

  const token = getToken() || "";
  const authHeaders = { "Content-Type": "application/json", "X-Auth-Token": token };

  const loadCompany = async () => {
    const res = await fetch(COMPANY_API, { headers: { "X-Auth-Token": token } });
    const d = await res.json();
    if (d.company) setCompany(d.company);
  };

  const loadProducts = async () => {
    const res = await fetch(`${PRODUCTS_API}?mine=1`, { headers: { "X-Auth-Token": token } });
    const d = await res.json();
    setProducts(d.items || []);
  };

  useEffect(() => {
    loadCompany();
    loadProducts();
  }, []);

  const saveCompany = async () => {
    if (!company.name.trim()) {
      toast.error("Укажи название компании");
      return;
    }
    setSavingCompany(true);
    try {
      const res = await fetch(COMPANY_API, { method: "POST", headers: authHeaders, body: JSON.stringify(company) });
      if (!res.ok) throw new Error();
      toast.success("Компания сохранена");
    } catch {
      toast.error("Не удалось сохранить");
    } finally {
      setSavingCompany(false);
    }
  };

  const submitProduct = async () => {
    if (!productForm.title.trim() || !productForm.category.trim()) {
      toast.error("Укажи название и категорию");
      return;
    }
    setSavingProduct(true);
    try {
      const method = editingProductId ? "PUT" : "POST";
      const body = editingProductId ? { ...productForm, id: editingProductId } : productForm;
      const res = await fetch(PRODUCTS_API, { method, headers: authHeaders, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(editingProductId ? "Обновлено" : "Товар добавлен");
      setEditingProductId(null);
      setProductForm({ ...EMPTY_PRODUCT });
      loadProducts();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSavingProduct(false);
    }
  };

  const editProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProductForm({
      title: p.title,
      category: p.category,
      price: p.price,
      currency: p.currency,
      moq: p.moq,
      description: p.description,
      image_url: p.image_url,
      in_stock: p.in_stock,
    });
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    const res = await fetch(PRODUCTS_API, { method: "DELETE", headers: authHeaders, body: JSON.stringify({ id }) });
    if (res.ok) {
      toast.success("Удалено");
      loadProducts();
    }
  };

  const logout = () => {
    clearToken();
    onLogout();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="bg-white border border-border rounded-3xl p-6 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-ibm tracking-tight">{user.name || "Личный кабинет"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary px-4 py-2 rounded-xl flex items-center gap-2">
          <Icon name="LogOut" size={14} /> Выйти
        </button>
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-2xl p-1.5 mb-6 w-fit">
        <button onClick={() => setTab("company")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "company" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          <Icon name="Building2" size={14} className="inline mr-1.5" /> Моя компания
        </button>
        <button onClick={() => setTab("products")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "products" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          <Icon name="Package" size={14} className="inline mr-1.5" /> Мои товары · {products.length}
        </button>
      </div>

      {tab === "company" && (
        <div className="bg-white border border-border rounded-3xl p-7">
          <h2 className="text-xl font-bold font-ibm mb-1">Карточка компании</h2>
          <p className="text-sm text-muted-foreground mb-6">Заполни — она появится в каталоге поставщиков</p>

          <div className="grid sm:grid-cols-[160px_1fr] gap-6 mb-5">
            <div>
              <div className="aspect-square bg-secondary rounded-2xl overflow-hidden flex items-center justify-center">
                {company.logo_url ? (
                  <img src={company.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="Image" size={32} className="text-muted-foreground/40" />
                )}
              </div>
              <input value={company.logo_url} onChange={(e) => setCompany({ ...company, logo_url: e.target.value })} placeholder="URL логотипа"
                className="w-full mt-2 bg-secondary/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Название компании *</label>
                <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="ТехноПоставка"
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Категория</label>
                  <input value={company.category} onChange={(e) => setCompany({ ...company, category: e.target.value })} placeholder="Оборудование"
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Город</label>
                  <input value={company.location} onChange={(e) => setCompany({ ...company, location: e.target.value })} placeholder="Москва"
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Описание</label>
                <textarea rows={4} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} placeholder="Чем занимается компания, какие услуги..."
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white resize-none" />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5 mb-5">
            <h3 className="font-semibold text-sm mb-4">Контакты</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Телефон</label>
                <input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="+7 ..."
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Email</label>
                <input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="info@..."
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Сайт</label>
                <input value={company.website} onChange={(e) => setCompany({ ...company, website: e.target.value })} placeholder="company.ru"
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
            </div>
          </div>

          <button onClick={saveCompany} disabled={savingCompany} className="btn-modern bg-foreground text-background px-7 py-3 rounded-xl text-sm font-medium disabled:opacity-50">
            {savingCompany ? "Сохраняю..." : "Сохранить"}
          </button>
        </div>
      )}

      {tab === "products" && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          <div className="bg-white border border-border rounded-3xl p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <Icon name={editingProductId ? "Pencil" : "Plus"} size={16} />
              {editingProductId ? "Редактирование" : "Новый товар"}
            </h3>
            <div className="space-y-3">
              <input value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} placeholder="Название *"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="Категория *"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} placeholder="Цена"
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                <input value={productForm.currency} onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })} placeholder="RUB"
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <input type="number" value={productForm.moq} onChange={(e) => setProductForm({ ...productForm, moq: Number(e.target.value) })} placeholder="Минимальная партия"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              <input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="URL фото"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              <textarea rows={2} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Описание"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white resize-none" />
              <label className="flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-2.5 text-sm cursor-pointer">
                <span>В наличии</span>
                <input type="checkbox" checked={productForm.in_stock} onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })} className="accent-accent w-4 h-4" />
              </label>
              <div className="flex gap-2">
                <button onClick={submitProduct} disabled={savingProduct} className="btn-modern flex-1 bg-foreground text-background py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                  {savingProduct ? "..." : editingProductId ? "Сохранить" : "Добавить"}
                </button>
                {editingProductId && (
                  <button onClick={() => { setEditingProductId(null); setProductForm({ ...EMPTY_PRODUCT }); }} className="bg-secondary px-4 rounded-xl text-sm hover:bg-secondary/80">
                    Отмена
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            {products.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Package" size={28} className="text-muted-foreground/60" />
                </div>
                <p className="text-sm text-muted-foreground">Пока товаров нет. Добавь первый через форму слева.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-white border border-border rounded-2xl p-4 flex gap-4">
                    <div className="w-16 h-16 bg-secondary rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <Icon name="Image" size={20} className="text-muted-foreground/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{p.category}</span>
                          <h4 className="font-semibold mt-1.5 truncate">{p.title}</h4>
                          <p className="text-sm text-muted-foreground truncate">{p.description || "—"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold">{p.price.toLocaleString("ru")} {p.currency}</div>
                          <div className="text-xs text-muted-foreground">от {p.moq} шт.</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <button onClick={() => editProduct(p)} className="text-xs bg-secondary/60 hover:bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Icon name="Pencil" size={12} /> Изменить
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-xs bg-secondary/60 hover:bg-secondary px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Icon name="Trash2" size={12} /> Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
