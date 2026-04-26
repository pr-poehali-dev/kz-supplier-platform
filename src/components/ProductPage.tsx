import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { PRODUCTS_API, getToken, type User } from "@/lib/auth";
import { toast } from "sonner";

const REVIEWS_API = "https://functions.poehali.dev/96054947-1ff6-4cff-b5b9-e76a86aff8b8";
const COMPANY_API = "https://functions.poehali.dev/8c5a112a-69ee-45e1-bab8-ce9a83537caa";

type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  currency: string;
  moq: number;
  description: string;
  image_url: string;
  supplier: string;
  in_stock: boolean;
  user_id?: number | null;
};

type SupplierInfo = {
  id: number;
  user_id: number;
  name: string;
  logo_url: string;
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

type Review = {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string | null;
};

function Stars({ rating, size = 14, onChange }: { rating: number; size?: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={onChange ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Icon
            name="Star"
            size={size}
            className={i <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductPage({
  productId,
  onBack,
  user,
  onLogin,
  onOpenSupplier,
}: {
  productId: number;
  onBack: () => void;
  user: User | null;
  onLogin: () => void;
  onOpenSupplier?: (userId: number) => void;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState<SupplierInfo | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);

  const loadProduct = async () => {
    try {
      const res = await fetch(PRODUCTS_API);
      const d = await res.json();
      const p = (d.items || []).find((x: Product) => x.id === productId);
      setProduct(p || null);
      if (p) {
        setQuantity(p.moq);
        if (p.user_id) {
          fetch(`${COMPANY_API}?user_id=${p.user_id}`)
            .then((r) => r.json())
            .then((d) => setSupplierInfo(d.company || null))
            .catch(() => setSupplierInfo(null));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    const res = await fetch(`${REVIEWS_API}?product_id=${productId}`);
    const d = await res.json();
    setReviews(d.items || []);
    setAvgRating(d.avg_rating || 0);
    setReviewsCount(d.count || 0);
  };

  useEffect(() => {
    setLoading(true);
    loadProduct();
    loadReviews();
  }, [productId]);

  const submitReview = async () => {
    if (!user) {
      onLogin();
      return;
    }
    if (newRating < 1) {
      toast.error("Поставь оценку");
      return;
    }
    setSubmitting(true);
    try {
      const token = getToken() || "";
      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({
          product_id: productId,
          rating: newRating,
          text: newText.trim(),
          author_name: newAuthor.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Отзыв добавлен");
      setNewText("");
      setNewRating(5);
      setNewAuthor("");
      loadReviews();
    } catch {
      toast.error("Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">Загружаю...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Товар не найден</p>
        <button onClick={onBack} className="btn-modern bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium">
          Вернуться к каталогу
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <Icon name="ArrowLeft" size={16} />
        К списку товаров
      </button>

      <div className="grid lg:grid-cols-[480px_1fr] gap-8 mb-10">
        <div className="bg-white border border-border rounded-3xl overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <Icon name="Image" size={48} className="text-muted-foreground/40" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-accent bg-accent/10 px-3 py-1 rounded-full font-medium">{product.category}</span>
            {product.in_stock ? (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> В наличии
              </span>
            ) : (
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full font-medium">Нет в наличии</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-ibm tracking-tight mb-3">{product.title}</h1>

          {reviewsCount > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <Stars rating={Math.round(avgRating)} size={16} />
              <span className="font-semibold text-sm">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">· {reviewsCount} {reviewsCount === 1 ? "отзыв" : reviewsCount < 5 ? "отзыва" : "отзывов"}</span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>
          )}

          {(supplierInfo || product.supplier) && (
            <div className="bg-secondary/40 rounded-2xl p-4 mb-6 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold overflow-hidden bg-foreground text-background flex-shrink-0">
                {supplierInfo?.logo_url ? (
                  <img src={supplierInfo.logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (supplierInfo?.name || product.supplier)[0].toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Поставщик</div>
                <div className="font-semibold text-sm truncate">{supplierInfo?.name || product.supplier}</div>
              </div>
              {supplierInfo && onOpenSupplier && (
                <button
                  onClick={() => onOpenSupplier(supplierInfo.user_id)}
                  className="text-xs font-medium text-foreground bg-white hover:bg-secondary px-3 py-2 rounded-xl flex items-center gap-1.5 border border-border"
                >
                  Профиль <Icon name="ArrowRight" size={12} />
                </button>
              )}
            </div>
          )}

          <div className="bg-white border border-border rounded-2xl p-5 mb-5">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">{product.price.toLocaleString("ru")}</span>
              <span className="text-sm text-muted-foreground">{product.currency} / шт</span>
            </div>

            <div className="border-t border-border pt-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Количество (от {product.moq} шт.)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-secondary/50 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                    className="w-10 h-10 hover:bg-secondary rounded-l-xl flex items-center justify-center"
                  >
                    <Icon name="Minus" size={14} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min={product.moq}
                    onChange={(e) => setQuantity(Math.max(product.moq, Number(e.target.value) || product.moq))}
                    className="w-16 bg-transparent text-center text-sm font-semibold focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 hover:bg-secondary rounded-r-xl flex items-center justify-center"
                  >
                    <Icon name="Plus" size={14} />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-xs text-muted-foreground">Итого</div>
                  <div className="font-bold text-lg">{totalPrice.toLocaleString("ru")} {product.currency}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              disabled={!product.in_stock}
              onClick={() => toast.success("Запрос на покупку отправлен поставщику")}
              className="btn-modern flex-1 bg-foreground text-background py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Icon name="ShoppingCart" size={16} /> Купить
            </button>
            <button
              onClick={() => setContactsOpen(true)}
              className="btn-modern bg-accent text-white px-5 rounded-xl text-sm font-medium flex items-center gap-2 hover:opacity-90"
            >
              <Icon name="MessageSquare" size={16} /> Написать поставщику
            </button>
          </div>
        </div>
      </div>

      {contactsOpen && (
        <SupplierContactsModal
          info={supplierInfo}
          fallbackName={product.supplier}
          onClose={() => setContactsOpen(false)}
        />
      )}

      <div className="bg-white border border-border rounded-3xl p-7">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold font-ibm tracking-tight">
            Отзывы <span className="text-muted-foreground font-medium">· {reviewsCount}</span>
          </h2>
          {reviewsCount > 0 && (
            <div className="flex items-center gap-2">
              <Stars rating={Math.round(avgRating)} size={18} />
              <span className="font-bold">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">из 5</span>
            </div>
          )}
        </div>

        <div className="bg-secondary/30 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-sm mb-3">Оставить отзыв</h3>
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Ваша оценка</label>
            <Stars rating={newRating} size={26} onChange={setNewRating} />
          </div>
          {!user && (
            <input
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              placeholder="Ваше имя"
              className="w-full bg-white rounded-xl px-4 py-2.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          )}
          <textarea
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Поделись впечатлением о товаре..."
            className="w-full bg-white rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            onClick={submitReview}
            disabled={submitting}
            className="btn-modern mt-3 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "..." : "Отправить отзыв"}
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Пока отзывов нет. Будь первым!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-foreground to-foreground/70 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {r.author_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-semibold text-sm">{r.author_name}</div>
                        <Stars rating={r.rating} size={12} />
                      </div>
                      {r.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString("ru")}
                        </span>
                      )}
                    </div>
                    {r.text && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.text}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupplierContactsModal({
  info,
  fallbackName,
  onClose,
}: {
  info: SupplierInfo | null;
  fallbackName: string;
  onClose: () => void;
}) {
  const channels: { key: string; label: string; icon: string; color: string; href: string; sub: string }[] = [];
  if (info?.telegram) {
    const v = info.telegram;
    const href = v.startsWith("@") ? `https://t.me/${v.slice(1)}` : v.startsWith("http") ? v : `https://t.me/${v}`;
    channels.push({ key: "telegram", label: "Telegram", icon: "Send", color: "bg-sky-50 text-sky-600 border-sky-200", href, sub: v });
  }
  if (info?.whatsapp) {
    const v = info.whatsapp;
    const href = v.startsWith("http") ? v : `https://wa.me/${v.replace(/[^\d]/g, "")}`;
    channels.push({ key: "whatsapp", label: "WhatsApp", icon: "MessageCircle", color: "bg-emerald-50 text-emerald-600 border-emerald-200", href, sub: v });
  }
  if (info?.wechat) {
    channels.push({ key: "wechat", label: "WeChat", icon: "MessageSquare", color: "bg-green-50 text-green-700 border-green-200", href: "#", sub: info.wechat });
  }
  if (info?.phone) {
    channels.push({ key: "phone", label: "Позвонить", icon: "Phone", color: "bg-secondary text-foreground border-border", href: `tel:${info.phone}`, sub: info.phone });
  }
  if (info?.email) {
    channels.push({ key: "email", label: "Email", icon: "Mail", color: "bg-secondary text-foreground border-border", href: `mailto:${info.email}`, sub: info.email });
  }
  if (info?.vk) {
    const href = info.vk.startsWith("http") ? info.vk : `https://vk.com/${info.vk}`;
    channels.push({ key: "vk", label: "ВКонтакте", icon: "Globe", color: "bg-blue-50 text-blue-600 border-blue-200", href, sub: info.vk });
  }
  if (info?.instagram) {
    const href = info.instagram.startsWith("http") ? info.instagram : `https://instagram.com/${info.instagram.replace("@", "")}`;
    channels.push({ key: "instagram", label: "Instagram", icon: "Instagram", color: "bg-pink-50 text-pink-600 border-pink-200", href, sub: info.instagram });
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Скопировано")).catch(() => {});
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold font-ibm">Связаться с поставщиком</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{info?.name || fallbackName || "Поставщик"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="MessageSquareOff" size={32} className="text-muted-foreground/40 mx-auto mb-3" fallback="MessageSquare" />
            <p className="text-sm text-muted-foreground">Поставщик пока не указал контактные данные</p>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((c) => (
              <div key={c.key} className={`flex items-center gap-3 p-3 rounded-2xl border ${c.color}`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={c.icon} size={16} fallback="Link" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{c.label}</div>
                  <div className="text-xs opacity-70 truncate">{c.sub}</div>
                </div>
                {c.href && c.href !== "#" ? (
                  <a href={c.href} target="_blank" rel="noreferrer" className="text-xs font-medium bg-white px-3 py-2 rounded-xl hover:opacity-80">
                    Открыть
                  </a>
                ) : (
                  <button onClick={() => copy(c.sub)} className="text-xs font-medium bg-white px-3 py-2 rounded-xl hover:opacity-80">
                    Копировать
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}