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
  telegram: string;
  whatsapp: string;
  vk: string;
  instagram: string;
  wechat: string;
};

type Video = {
  id: number;
  title: string;
  url: string;
  provider: string;
  video_id: string;
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
  telegram: "",
  whatsapp: "",
  vk: "",
  instagram: "",
  wechat: "",
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
  const [tab, setTab] = useState<"company" | "products" | "videos">("company");
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
  const [savingCompany, setSavingCompany] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT });
  const [savingProduct, setSavingProduct] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [savingVideo, setSavingVideo] = useState(false);

  const token = getToken() || "";
  const authHeaders = { "Content-Type": "application/json", "X-Auth-Token": token };
  const VIDEOS_API = `${COMPANY_API}?resource=videos`;
  const UPLOAD_API = `${COMPANY_API}?resource=upload`;
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const b64: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("read error"));
      r.readAsDataURL(file);
    });
    const res = await fetch(UPLOAD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: b64, name: file.name, content_type: file.type || "application/octet-stream", folder }),
    });
    const d = await res.json();
    if (!res.ok || !d.url) throw new Error(d.error || "Не удалось загрузить");
    return d.url as string;
  };

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

  const loadVideos = async () => {
    const res = await fetch(VIDEOS_API, { headers: { "X-Auth-Token": token } });
    const d = await res.json();
    setVideos(d.items || []);
  };

  useEffect(() => {
    loadCompany();
    loadProducts();
    loadVideos();
  }, []);

  const addVideo = async () => {
    if (!videoUrl.trim()) {
      toast.error("Вставь ссылку на YouTube или RuTube");
      return;
    }
    setSavingVideo(true);
    try {
      const res = await fetch(VIDEOS_API, { method: "POST", headers: authHeaders, body: JSON.stringify({ url: videoUrl, title: videoTitle }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "");
      toast.success("Видео добавлено");
      setVideoUrl("");
      setVideoTitle("");
      loadVideos();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      toast.error(msg || "Не удалось добавить");
    } finally {
      setSavingVideo(false);
    }
  };

  const removeVideo = async (id: number) => {
    if (!confirm("Удалить видео?")) return;
    const res = await fetch(VIDEOS_API, { method: "DELETE", headers: authHeaders, body: JSON.stringify({ id }) });
    if (res.ok) {
      toast.success("Удалено");
      setVideos((v) => v.filter((x) => x.id !== id));
    }
  };

  const videoEmbed = (v: Video) =>
    v.provider === "youtube"
      ? `https://www.youtube.com/embed/${v.video_id}`
      : `https://rutube.ru/play/embed/${v.video_id}`;

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
        <button onClick={() => setTab("videos")} className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === "videos" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          <Icon name="Video" size={14} className="inline mr-1.5" /> Видео · {videos.length}
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

          <div className="border-t border-border pt-5 mb-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Icon name="Share2" size={14} /> Соцсети и мессенджеры
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: "telegram", label: "Telegram", icon: "Send", placeholder: "@username или ссылка" },
                { key: "whatsapp", label: "WhatsApp", icon: "MessageCircle", placeholder: "+7..." },
                { key: "wechat", label: "WeChat", icon: "MessageSquare", placeholder: "WeChat ID" },
                { key: "vk", label: "ВКонтакте", icon: "Globe", placeholder: "vk.com/..." },
                { key: "instagram", label: "Instagram", icon: "Instagram", placeholder: "@username" },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground flex items-center gap-1.5">
                    <Icon name={s.icon} size={12} /> {s.label}
                  </label>
                  <input
                    value={(company as unknown as Record<string, string>)[s.key] || ""}
                    onChange={(e) => setCompany({ ...company, [s.key]: e.target.value } as Company)}
                    placeholder={s.placeholder}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white"
                  />
                </div>
              ))}
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
              <div className="space-y-2">
                {productForm.image_url ? (
                  <div className="relative bg-secondary/40 rounded-xl overflow-hidden">
                    <img src={productForm.image_url} alt="" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setProductForm({ ...productForm, image_url: "" })}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/95 rounded-lg flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors">
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 bg-secondary/40 hover:bg-secondary border-2 border-dashed border-border hover:border-accent/40 rounded-xl px-4 py-6 cursor-pointer transition-colors text-center">
                    <Icon name={uploadingPhoto ? "Loader2" : "ImagePlus"} size={22} className={`text-accent ${uploadingPhoto ? "animate-spin" : ""}`} />
                    <span className="text-sm font-medium">{uploadingPhoto ? "Загрузка..." : "Загрузить фото"}</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG, до 50 МБ</span>
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingPhoto(true);
                        try {
                          const url = await uploadFile(file, "products");
                          setProductForm((p) => ({ ...p, image_url: url }));
                          toast.success("Фото загружено");
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
                        } finally {
                          setUploadingPhoto(false);
                          e.target.value = "";
                        }
                      }} />
                  </label>
                )}
                <input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="…или вставь URL фото"
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
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

      {tab === "videos" && (
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          <div className="bg-white border border-border rounded-3xl p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Icon name="Plus" size={16} /> Добавить видео
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Загрузи файл (MP4) или вставь ссылку YouTube / RuTube.</p>
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center gap-2 bg-secondary/40 hover:bg-secondary border-2 border-dashed border-border hover:border-accent/40 rounded-xl px-4 py-6 cursor-pointer transition-colors text-center">
                <Icon name={uploadingVideo ? "Loader2" : "Upload"} size={22} className={`text-accent ${uploadingVideo ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">{uploadingVideo ? "Загрузка..." : "Загрузить видео"}</span>
                <span className="text-xs text-muted-foreground">MP4, до 50 МБ</span>
                <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingVideo(true);
                    try {
                      const url = await uploadFile(file, "videos");
                      setVideoUrl(url);
                      toast.success("Видео загружено — нажми «Добавить»");
                    } catch (err: unknown) {
                      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
                    } finally {
                      setUploadingVideo(false);
                      e.target.value = "";
                    }
                  }} />
              </label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-1 h-px bg-border" />
                <span>или ссылка</span>
                <span className="flex-1 h-px bg-border" />
              </div>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/... или rutube.ru/video/..."
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white"
              />
              <input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Название (необязательно)"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white"
              />
              <button
                onClick={addVideo}
                disabled={savingVideo}
                className="btn-modern w-full bg-foreground text-background py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {savingVideo ? "..." : "Добавить"}
              </button>
            </div>
            <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-2"><Icon name="Youtube" size={13} className="text-red-500 mt-0.5" /> youtube.com/watch?v=..., youtu.be/...</p>
              <p className="flex items-start gap-2"><Icon name="Play" size={13} className="text-blue-500 mt-0.5" /> rutube.ru/video/...</p>
            </div>
          </div>

          <div>
            {videos.length === 0 ? (
              <div className="bg-white border border-dashed border-border rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Video" size={28} className="text-muted-foreground/60" />
                </div>
                <p className="text-sm text-muted-foreground">Видео ещё не добавлены. Покажи свой товар или производство — это повышает доверие.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {videos.map((v) => (
                  <div key={v.id} className="bg-white border border-border rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-black">
                      {v.provider === "file" ? (
                        <video src={v.url} controls className="w-full h-full" />
                      ) : (
                        <iframe
                          src={videoEmbed(v)}
                          title={v.title || "Видео"}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${v.provider === "youtube" ? "bg-red-50 text-red-600" : v.provider === "file" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                            {v.provider === "file" ? "файл" : v.provider}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm truncate">{v.title || "Без названия"}</h4>
                      </div>
                      <button
                        onClick={() => removeVideo(v.id)}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
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