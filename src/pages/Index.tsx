import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { translations, type Lang, type Translation } from "@/lib/i18n";
import { SERVICE_LIST } from "@/lib/services";
import AuthModal from "@/components/AuthModal";
import AccountPage from "@/components/AccountPage";
import ProductPage from "@/components/ProductPage";
import ServicePage from "@/components/ServicePage";
import { fetchMe, getToken, type User } from "@/lib/auth";
import { toast } from "sonner";

const PRODUCTS_API = "https://functions.poehali.dev/0d3d03b7-73bc-4278-a3b4-b0d2196eea41";

type AdminProduct = {
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
};

const HERO_IMAGE = "https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/files/84c5569f-5d72-4607-9942-6fd7f5ed1dfd.jpg";

type Page = "home" | "catalog" | "supplier" | "realSupplier" | "blog" | "blogPost" | "contacts" | "messages" | "services" | "products" | "account" | "product" | "service" | "addCompany";

const COMPANY_API = "https://functions.poehali.dev/8c5a112a-69ee-45e1-bab8-ce9a83537caa";

const baseSuppliers = [
  { id: 1, verified: true, rating: 4.8, reviews: 127, since: 2015, avatar: "ТП" },
  { id: 2, verified: true, rating: 4.6, reviews: 89, since: 2012, avatar: "АХ" },
  { id: 3, verified: false, rating: 4.3, reviews: 54, since: 2018, avatar: "СМ" },
  { id: 4, verified: true, rating: 4.9, reviews: 203, since: 2010, avatar: "ЛС" },
  { id: 5, verified: true, rating: 4.7, reviews: 76, since: 2016, avatar: "ИТ" },
  { id: 6, verified: true, rating: 4.5, reviews: 41, since: 2019, avatar: "МТ" },
];

const reviewMeta = [
  { rating: 5, date: "12.03.2026" },
  { rating: 4, date: "05.02.2026" },
  { rating: 5, date: "18.01.2026" },
];

const chatTimes = ["14:32", "11:15"];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 16 16" fill={s <= Math.round(rating) ? "#f59e0b" : "#d1d5db"}>
          <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.12L8 10.77 4.29 12.54l.71-4.12L2 5.5l4.15-.75z" />
        </svg>
      ))}
    </span>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center bg-secondary/70 rounded-xl overflow-hidden text-xs font-semibold p-0.5">
      <button
        onClick={() => setLang("ru")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${lang === "ru" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        RU
      </button>
      <button
        onClick={() => setLang("zh")}
        className={`px-2.5 py-1.5 rounded-lg transition-all ${lang === "zh" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        中文
      </button>
    </div>
  );
}

function Navbar({ current, onNav, lang, setLang, t, user, onLogin }: { current: Page; onNav: (p: Page) => void; lang: Lang; setLang: (l: Lang) => void; t: Translation; user: User | null; onLogin: () => void }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: t.nav.home, page: "home" },
    { label: t.nav.catalog, page: "catalog" },
    { label: t.nav.products, page: "products" },
    { label: t.nav.services, page: "services" },
    { label: t.nav.blog, page: "blog" },
    { label: t.nav.contacts, page: "contacts" },
  ];

  return (
    <header className="sticky top-3 z-50 mx-3 sm:mx-6">
      <div className="max-w-7xl mx-auto glass border border-white/40 rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] flex items-center justify-between h-16 px-4 sm:px-6">
        <button onClick={() => onNav("home")} className="flex items-center gap-2.5 font-bold text-lg tracking-tight font-ibm">
          <span className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Icon name="Container" size={18} fallback="Package" />
          </span>
          <span className="gradient-text">{t.brand}</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.page}
              onClick={() => onNav(l.page)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${current === l.page ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://max.ru"
            target="_blank"
            rel="noopener noreferrer"
            title="MAX"
            className="px-2.5 py-1.5 text-xs font-bold text-foreground hover:text-accent hover:bg-secondary/60 rounded-xl transition-colors border border-border"
          >
            MAX
          </a>
          <a
            href="https://vk.com"
            target="_blank"
            rel="noopener noreferrer"
            title="VK"
            className="p-2 text-muted-foreground hover:text-[#0077FF] hover:bg-secondary/60 rounded-xl transition-colors"
          >
            <Icon name="Send" fallback="Share2" size={18} />
          </a>
          <button
            onClick={() => onNav("messages")}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl transition-colors"
          >
            <Icon name="MessageSquare" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full pulse-glow"></span>
          </button>
          {user ? (
            <button onClick={() => onNav("account")} className="text-sm font-medium text-foreground px-3 py-2 rounded-xl hover:bg-secondary/60 transition-colors flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-br from-foreground to-foreground/80 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
            </button>
          ) : (
            <>
              <button onClick={onLogin} className="text-sm font-medium text-foreground px-4 py-2 rounded-xl hover:bg-secondary/60 transition-colors">
                {t.nav.login}
              </button>
              <button onClick={onLogin} className="btn-modern text-sm font-medium bg-foreground text-background px-4 py-2 rounded-xl">
                {t.nav.addCompany}
              </button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button className="p-2 rounded-xl hover:bg-secondary/60" onClick={() => setOpen(!open)}>
            <Icon name={open ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-2 glass border border-white/40 rounded-2xl px-4 py-3 flex flex-col gap-1 shadow-lg">
          {links.map((l) => (
            <button
              key={l.page}
              onClick={() => { onNav(l.page); setOpen(false); }}
              className="text-sm font-medium text-left py-2.5 px-3 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              {l.label}
            </button>
          ))}
          <button onClick={() => { onNav("messages"); setOpen(false); }} className="text-sm font-medium text-left py-2.5 px-3 rounded-xl hover:bg-secondary/60">
            {t.nav.messages}
          </button>
        </div>
      )}
    </header>
  );
}

function SupplierCard({ idx, t, onView }: { idx: number; t: Translation; onView: () => void }) {
  const meta = baseSuppliers[idx];
  const data = t.suppliersData[idx];
  return (
    <div className="card-hover bg-white border border-border rounded-2xl p-6 cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md">
          {meta.avatar}
        </div>
        {meta.verified && (
          <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
            <Icon name="BadgeCheck" size={13} />
            {t.card.verified}
          </div>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1 text-base">{data.name}</h3>
      <p className="text-xs text-accent font-medium mb-3">{data.category}</p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{data.description}</p>
      <div className="flex items-center gap-3 mb-4">
        <StarRating rating={meta.rating} />
        <span className="text-sm font-semibold text-foreground">{meta.rating}</span>
        <span className="text-xs text-muted-foreground">({meta.reviews} {t.card.reviews})</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {data.tags.map((tag) => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-foreground/80">{tag}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
        <span className="flex items-center gap-1.5"><Icon name="MapPin" size={12} />{data.location}</span>
        <span className="flex items-center gap-1.5"><Icon name="Calendar" size={12} />{t.card.since} {meta.since}</span>
      </div>
    </div>
  );
}

function HomePage({ onNav, t, onOpenService, onOpenProduct }: { onNav: (p: Page) => void; t: Translation; onOpenService: (i: number) => void; onOpenProduct: (id: number) => void }) {
  const [homeProducts, setHomeProducts] = useState<AdminProduct[]>([]);
  useEffect(() => {
    fetch(PRODUCTS_API)
      .then((r) => r.json())
      .then((d) => setHomeProducts((d.items || []).slice(0, 6)))
      .catch(() => setHomeProducts([]));
  }, []);
  const stepIcons = ["Search", "ShieldCheck", "MessageSquare", "Handshake"];

  return (
    <div className="animate-fade-in">
      <section className="relative mesh-bg overflow-hidden pt-10 pb-20 sm:pt-16 sm:pb-28">
        <div className="absolute top-20 right-0 w-[420px] h-[420px] rounded-full bg-accent/15 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-[380px] h-[380px] rounded-full bg-blue-300/25 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] [background-size:24px_24px] opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-white/80 border border-white rounded-full backdrop-blur-md animate-fade-in-up animate-fade-in-up-delay-1 shadow-sm">
                <span className="w-2 h-2 bg-accent rounded-full pulse-glow" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">{t.hero.tag}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] mb-6 font-ibm animate-fade-in-up animate-fade-in-up-delay-2 tracking-tight font-semibold">
                {t.hero.title1}{" "}
                <span className="gradient-text">{t.hero.title2}</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed animate-fade-in-up animate-fade-in-up-delay-3">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-fade-in-up animate-fade-in-up-delay-4">
                <button onClick={() => onNav("addCompany")} className="btn-modern bg-foreground text-background font-medium px-7 py-3.5 rounded-2xl text-sm flex items-center gap-2 justify-center group">
                  Оставить заявку <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => onNav("catalog")} className="bg-white/80 border border-border hover:bg-white text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm transition-all backdrop-blur-md flex items-center gap-2 justify-center">
                  <Icon name="Compass" size={16} /> {t.hero.findSupplier}
                </button>
              </div>

              <div className="flex items-center gap-5 animate-fade-in-up animate-fade-in-up-delay-4">
                <div className="flex -space-x-2">
                  {["bg-accent","bg-blue-400","bg-emerald-400","bg-amber-400"].map((c, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {["A","M","K","D"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[0,1,2,3,4].map((i) => <Icon key={i} name="Star" size={12} className="text-amber-400 fill-amber-400" />)}
                    <span className="text-xs font-semibold ml-1.5">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">2 400+ компаний уже работают с нами</p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-up animate-fade-in-up-delay-3">
              <div className="absolute -inset-6 bg-gradient-to-br from-accent/20 via-blue-300/20 to-transparent rounded-[40px] blur-2xl" />
              <div className="relative bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                      <Icon name="Package" size={16} className="text-background" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Сделка #C-1842</p>
                      <p className="text-sm font-semibold">Поставка из Шэньчжэня</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">В пути</span>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: "Search", title: "Поиск поставщика", status: "Готово", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: "ShieldCheck", title: "Проверка фабрики", status: "Готово", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: "PackageCheck", title: "Контроль качества", status: "Идёт", color: "text-accent", bg: "bg-accent/10" },
                    { icon: "Truck", title: "Доставка на склад", status: "Ожидает", color: "text-muted-foreground", bg: "bg-secondary" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border/50">
                      <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={s.icon} size={15} className={s.color} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.title}</p>
                      </div>
                      <span className={`text-xs font-semibold ${s.color}`}>{s.status}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Экономия на закупке</p>
                    <p className="text-lg font-bold gradient-text">−32%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">До прибытия</p>
                    <p className="text-lg font-bold">12 дней</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white border border-border rounded-2xl p-3 shadow-lg flex items-center gap-2 animate-float" style={{ animationDelay: "0.8s" }}>
                <div className="w-8 h-8 bg-accent/15 rounded-lg flex items-center justify-center">
                  <Icon name="Factory" size={15} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Прямые контракты</p>
                  <p className="text-xs font-semibold">с фабриками</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border border-border rounded-2xl p-3 shadow-lg flex items-center gap-2 animate-float" style={{ animationDelay: "1.2s" }}>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icon name="ShieldCheck" size={15} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Гарантия качества</p>
                  <p className="text-xs font-semibold">на каждом этапе</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-20 animate-fade-in-up animate-fade-in-up-delay-4">
            {[
              { icon: "Users", value: "2 400+", label: t.hero.stat1Label },
              { icon: "CheckCircle2", value: "18 000+", label: t.hero.stat2Label },
              { icon: "Smile", value: "96%", label: t.hero.stat3Label },
              { icon: "Clock", value: "24/7", label: "поддержка" },
            ].map((s, i) => (
              <div key={i} className="bg-white/70 border border-white rounded-2xl p-5 backdrop-blur-md hover:bg-white transition-colors group">
                <div className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center mb-3 group-hover:bg-accent/15 transition-colors">
                  <Icon name={s.icon} size={18} className="text-foreground group-hover:text-accent transition-colors" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-ibm">{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white border border-border rounded-2xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-3">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.search.placeholder} className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
            </div>
            <select className="px-4 py-3 bg-secondary/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer">
              {t.catalog.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => onNav("catalog")} className="btn-modern bg-foreground text-background px-7 py-3 rounded-xl text-sm font-medium">
              {t.search.find}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Что мы делаем</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-ibm tracking-tight">Услуги в Китае</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">Полный цикл — от поиска товара до доставки до вашей двери. Выбирайте нужное.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_LIST.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="group bg-[#E3EEFB] hover:bg-[#D7E6F8] rounded-3xl p-6 pr-3 flex items-center gap-3 transition-all hover:shadow-lg hover:shadow-blue-200/60 hover:-translate-y-0.5"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg sm:text-xl font-ibm text-foreground mb-1.5 truncate">{s.title}</h3>
                <p className="text-xs sm:text-sm text-foreground/60 leading-snug line-clamp-2">{s.short}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Подробнее <Icon name="ArrowRight" size={12} />
                </span>
              </div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-white/40">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <div className="bg-white border border-border rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => onNav("messages")} className="group flex flex-col items-center text-left">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-accent/15 to-blue-200/40 overflow-hidden shadow-xl shadow-accent/20 flex items-end justify-center transition-all group-hover:shadow-accent/40 group-hover:scale-[1.03]">
                  <img
                    src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/bucket/58194f38-4408-4cb6-90bc-4685390ee777.png"
                    alt="Лин — персональный менеджер OptCarts"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white text-foreground rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <Icon name="MessageSquare" size={12} /> Написать
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="font-semibold text-sm flex items-center justify-center gap-1.5">
                    Лин
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="на связи" />
                  </div>
                  <div className="text-xs text-muted-foreground">персональный менеджер</div>
                </div>
              </button>
              <div className="hidden lg:block w-px h-32 bg-border" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">О бренде</p>
              <h2 className="text-2xl sm:text-3xl font-bold font-ibm tracking-tight mb-3">Оптовые поставщики из Китая </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                Объединяем оптовых поставщиков и закупщиков в одной платформе. Заполняйте «корзины» оптовыми партиями, проверяйте поставщиков, договаривайтесь и отгружайте — всё в одном месте, без посредников.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 bg-secondary/40 rounded-2xl p-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="ShieldCheck" size={16} className="text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Проверенные</div>
                    <div className="text-xs text-muted-foreground">поставщики с верификацией</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-secondary/40 rounded-2xl p-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Package" size={16} className="text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Оптом</div>
                    <div className="text-xs text-muted-foreground">от минимальных партий</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-secondary/40 rounded-2xl p-4">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Zap" size={16} className="text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Быстро</div>
                    <div className="text-xs text-muted-foreground">сделка за пару дней</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.services.tag}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-ibm tracking-tight">{t.services.title}</h2>
          </div>
          <button onClick={() => onNav("services")} className="text-sm text-foreground font-medium flex items-center gap-1.5 hover:gap-3 transition-all bg-secondary/60 px-4 py-2 rounded-xl hover:bg-secondary">
            {t.services.allBtn ?? "Все услуги"} <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {t.services.items.map((s, i) => (
            <button key={i} onClick={() => onOpenService(i)} className="card-hover bg-white border border-border rounded-2xl p-4 text-left flex items-center gap-4 group">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/40 rounded-xl flex items-center justify-center group-hover:from-accent/10 group-hover:to-accent/5 transition-all overflow-hidden flex-shrink-0">
                {s.icon === "Taobao" ? (
                  <img src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/bucket/8322b202-2dcf-4f1e-b13c-86fe2d1b6c4b.png" alt="Taobao" className="w-8 h-8 object-contain" />
                ) : s.icon === "WeChat" ? (
                  <img src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/bucket/ef3d3318-f000-48e2-9eb1-53341f2fbbec.png" alt="WeChat" className="w-8 h-8 object-contain" />
                ) : (
                  <Icon name={s.icon} size={22} className="text-accent" fallback="Star" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground line-clamp-1">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.services.detailBtn}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B0000] via-[#C8102E] to-[#FFB81C]">
          <div className="absolute inset-0 hero-grid opacity-20" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-red-500/30 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-12">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 bg-white/15 border border-white/25 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full pulse-glow" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">Готовое решение</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-ibm tracking-tight mb-4 leading-tight">
                Выход на рынок Китая
              </h2>
              <p className="text-white/85 text-sm sm:text-base mb-7 max-w-md leading-relaxed">
                Полный цикл сопровождения: от регистрации компании и сертификации до выхода на маркетплейсы и поиска дистрибьюторов.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-7 max-w-md">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-yellow-300 flex-shrink-0" />
                  <span>Регистрация бизнеса</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-yellow-300 flex-shrink-0" />
                  <span>Сертификация CCC</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-yellow-300 flex-shrink-0" />
                  <span>Tmall и JD.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className="text-yellow-300 flex-shrink-0" />
                  <span>Поиск партнёров</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => onNav("services")} className="btn-modern bg-white text-[#8B0000] font-semibold px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2">
                  Узнать подробнее <Icon name="ArrowRight" size={15} />
                </button>
                <button onClick={() => onNav("addCompany")} className="bg-white/10 border border-white/25 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-2xl text-sm transition-all backdrop-blur-md">
                  Получить консультацию
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/20 to-transparent rounded-2xl blur-2xl" />
              <img
                src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/files/3b0587d5-08ab-490e-bf97-b38db20647c1.jpg"
                alt="Выход на рынок Китая"
                className="relative w-full h-full max-h-[380px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {homeProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.products.homeTag}</p>
              <h2 className="text-3xl sm:text-4xl font-bold font-ibm tracking-tight">{t.products.homeTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.products.homeSubtitle}</p>
            </div>
            <button onClick={() => onNav("products")} className="text-sm text-foreground font-medium flex items-center gap-1.5 hover:gap-3 transition-all bg-secondary/60 px-4 py-2 rounded-xl hover:bg-secondary">
              {t.products.allBtn} <Icon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {homeProducts.map((p) => (
              <ProductCard key={p.id} p={p} t={t} onOpen={onOpenProduct} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative bg-gradient-to-br from-foreground to-foreground/95 rounded-[32px] p-8 sm:p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="absolute inset-0 hero-grid opacity-30" />

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <span className="text-[10px] font-semibold text-white/90 uppercase tracking-widest">{t.sections.simpleTag}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-ibm tracking-tight text-white max-w-2xl">
                  {t.sections.simpleTitle}
                </h2>
              </div>
              <button onClick={() => onNav("addCompany")} className="btn-modern bg-white text-foreground font-medium px-6 py-3 rounded-2xl text-sm flex items-center gap-2 self-start lg:self-auto">
                Начать сделку <Icon name="ArrowRight" size={15} />
              </button>
            </div>

            <div className="hidden lg:block absolute left-0 right-0 top-[58%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ marginTop: "60px" }} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
              {t.steps.map((item, i) => (
                <div key={i} className="group relative">
                  <div className="bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all h-full">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent/30">
                        <Icon name={stepIcons[i]} size={20} className="text-white" fallback="Star" />
                      </div>
                      <span className="text-4xl font-bold font-ibm text-white/15 leading-none select-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-2 text-base">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.text}</p>
                  </div>
                  {i < t.steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-12 -right-3 z-10 w-6 h-6 items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center">
                        <Icon name="ChevronRight" size={12} className="text-white/70" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { icon: "Zap", label: "Старт за 24 часа" },
                { icon: "FileCheck", label: "Договор и закрывающие" },
                { icon: "Languages", label: "Переводчик в команде" },
                { icon: "HeadphonesIcon", label: "Менеджер на связи" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={f.icon} size={15} className="text-white" fallback="Check" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="gradient-bg text-white rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold font-ibm mb-4 tracking-tight">{t.sections.ctaTitle}</h2>
            <p className="text-blue-100/80 mb-8 max-w-lg mx-auto">{t.sections.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => onNav("catalog")} className="btn-modern bg-white text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm">
                {t.hero.findSupplier}
              </button>
              <button className="bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium px-7 py-3.5 rounded-2xl text-sm transition-all backdrop-blur-md">
                {t.sections.becomeSupplier}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type RealCompany = { id: number; user_id: number; name: string; logo_url: string; description: string; category: string; location: string; phone: string; email: string; website: string; products_count: number };

function CatalogPage({ onViewReal, t, user }: { onViewReal: (userId: number) => void; t: Translation; user: User | null }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(t.catalog.categories[0]);
  const [realCompanies, setRealCompanies] = useState<RealCompany[]>([]);

  const loadCompanies = () => {
    fetch(`${COMPANY_API}?all=1`)
      .then((r) => r.json())
      .then((d) => setRealCompanies(d.items || []))
      .catch(() => setRealCompanies([]));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDeleteCompany = async (c: RealCompany, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Удалить поставщика «${c.name}»? Также удалятся его товары и видео.`)) return;
    const token = getToken() || "";
    try {
      const res = await fetch(COMPANY_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({ id: c.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Поставщик удалён");
      loadCompanies();
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const filteredReal = realCompanies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.category || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
    const matchCat = activeCategory === t.catalog.categories[0] || (c.category || "").includes(activeCategory);
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm mb-3 tracking-tight">{t.catalog.title}</h1>
        <p className="text-muted-foreground">{t.catalog.foundCount(realCompanies.length)}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 flex-shrink-0 space-y-4">
          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.searchTitle}</h3>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.catalog.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-secondary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.categoriesTitle}</h3>
            <div className="flex flex-col gap-1">
              {t.catalog.categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-sm text-left px-3 py-2.5 rounded-xl transition-all ${activeCategory === cat ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-5">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.filtersTitle}</h3>
            <label className="flex items-center gap-2.5 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent w-4 h-4 rounded" defaultChecked />
              <span>{t.catalog.onlyVerified}</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent w-4 h-4 rounded" />
              <span>{t.catalog.ratingPlus}</span>
            </label>
            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" className="accent-accent w-4 h-4 rounded" />
              <span>{t.catalog.sinceFilter}</span>
            </label>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 bg-white border border-border rounded-2xl px-5 py-3">
            <span className="text-sm text-muted-foreground font-medium">{filteredReal.length} {t.catalog.companies}</span>
            <select className="text-sm bg-secondary/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer font-medium">
              <option>{t.catalog.sortRating}</option>
              <option>{t.catalog.sortReviews}</option>
              <option>{t.catalog.sortName}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredReal.map((c) => (
              <div
                key={`real-${c.id}`}
                onClick={() => onViewReal(c.user_id)}
                className="card-hover bg-white border border-border rounded-2xl p-6 text-left hover:border-foreground/30 transition-colors relative group cursor-pointer"
              >
                {user && (
                  <button
                    onClick={(e) => handleDeleteCompany(c, e)}
                    title="Удалить поставщика"
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Icon name="Trash2" size={13} />
                  </button>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                    {c.logo_url ? <img src={c.logo_url} alt="" className="w-full h-full object-cover" /> : c.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Новый</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-base">{c.name}</h3>
                {c.category && <p className="text-xs text-accent font-medium mb-3">{c.category}</p>}
                {c.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{c.description}</p>}
                <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground border-t border-border pt-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-wrap">
                    {c.location && <span className="flex items-center gap-1.5"><Icon name="MapPin" size={12} />{c.location}</span>}
                    {c.products_count > 0 && <span className="flex items-center gap-1.5"><Icon name="Package" size={12} />{c.products_count} тов.</span>}
                  </div>
                  <span className="flex items-center gap-1 text-foreground font-medium">Открыть <Icon name="ArrowRight" size={12} /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierProfilePage({ onBack, onMessage, t }: { onBack: () => void; onMessage: () => void; t: Translation }) {
  const meta = baseSuppliers[0];
  const data = t.suppliersData[0];
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "contacts">("about");

  const contactsList = [
    { icon: "Phone", label: t.profile.contactLabels.phone, value: "+7 (495) 123-45-67" },
    { icon: "Mail", label: t.profile.contactLabels.email, value: "info@techno-supply.ru" },
    { icon: "Globe", label: t.profile.contactLabels.site, value: "techno-supply.ru" },
    { icon: "MapPin", label: t.profile.contactLabels.address, value: data.location },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors bg-white/50 hover:bg-white border border-border px-4 py-2 rounded-xl">
        <Icon name="ArrowLeft" size={16} />
        {t.profile.back}
      </button>

      <div className="bg-white border border-border rounded-3xl mb-5 overflow-hidden">
        <div className="h-36 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-8 translate-y-1/2 w-24 h-24 bg-white border-4 border-white rounded-2xl shadow-xl flex items-center justify-center text-foreground font-bold text-2xl">
            {meta.avatar}
          </div>
        </div>
        <div className="pt-16 pb-7 px-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold font-ibm tracking-tight">{data.name}</h1>
              <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <Icon name="BadgeCheck" size={13} />
                {t.profile.verified}
              </div>
            </div>
            <p className="text-accent font-medium mb-3 text-sm">{data.category}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Icon name="MapPin" size={14} />{data.location}</span>
              <span className="flex items-center gap-1.5"><Icon name="Calendar" size={14} />{t.profile.since} {meta.since} {t.profile.year}</span>
              <span className="flex items-center gap-1.5"><Icon name="Users" size={14} />{t.profile.employees}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onMessage} className="btn-modern flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-medium">
              <Icon name="MessageSquare" size={16} />
              {t.profile.message}
            </button>
            <button className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary px-5 py-3 rounded-xl text-sm font-medium transition-colors">
              <Icon name="Phone" size={16} />
              {t.profile.contacts}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: t.profile.stats.rating, value: "4.8", icon: "Star" },
          { label: t.profile.stats.reviews, value: "127", icon: "MessageSquare" },
          { label: t.profile.stats.deals, value: "1 840", icon: "Handshake" },
          { label: t.profile.stats.years, value: "11", icon: "TrendingUp" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <Icon name={stat.icon} size={14} className="text-accent" fallback="Info" />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-ibm">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border px-2 pt-2 gap-1">
          {(["about", "reviews", "contacts"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}>
              {tab === "about" ? t.profile.tabs.about : tab === "reviews" ? `${t.profile.tabs.reviews} (${t.reviewsData.length})` : t.profile.tabs.contacts}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "about" && (
            <div>
              <p className="text-muted-foreground mb-6 leading-relaxed">{t.profile.aboutText}</p>
              <h3 className="font-semibold mb-4">{t.profile.directionsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {t.profile.directions.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-4">{t.profile.certsTitle}</h3>
              <div className="flex flex-wrap gap-2">
                {["ISO 9001:2015", "ISO 14001", "ГОСТ Р ИСО 9001", "Ростехнадзор"].map((cert) => (
                  <div key={cert} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    <Icon name="Award" size={12} />
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-5">
              {t.reviewsData.map((r, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{r.author}</div>
                      <div className="text-xs text-muted-foreground">{r.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={reviewMeta[i].rating} />
                      <span className="text-xs text-muted-foreground">{reviewMeta[i].date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactsList.map((c) => (
                <div key={c.label} className="flex items-start gap-3 bg-secondary/40 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={c.icon} size={16} className="text-accent" fallback="Info" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">{c.label}</div>
                    <div className="text-sm font-medium">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessagesPage({ t }: { t: Translation }) {
  const chatList = t.chatList.map((c, i) => ({
    id: i + 1,
    from: c.from,
    avatar: ["ТП", "АХ", "ЛС"][i],
    time: i < 2 ? chatTimes[i] : t.yesterday,
    text: c.text,
    unread: i === 0 ? 2 : 0,
  }));
  const [activeChat, setActiveChat] = useState(chatList[0]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(t.conversation.map((c, i) => ({ ...c, time: ["14:32", "14:35", "14:38"][i] })));

  const send = () => {
    if (!input.trim()) return;
    setConversation((prev) => [...prev, { from: "me", text: input, time: t.now }]);
    setInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-bold font-ibm mb-8 tracking-tight">{t.messages.title}</h1>
      <div className="bg-white border border-border rounded-3xl overflow-hidden flex h-[640px]">
        <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-secondary/30">
          <div className="p-4">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.messages.searchPlaceholder} className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {chatList.map((m) => (
              <button key={m.id} onClick={() => setActiveChat(m)}
                className={`w-full text-left p-3 rounded-2xl mb-1 transition-all ${activeChat.id === m.id ? "bg-white shadow-sm" : "hover:bg-white/60"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-gradient-to-br from-foreground to-foreground/80 text-white rounded-xl flex items-center justify-center text-xs font-bold shadow-sm">{m.avatar}</div>
                    <span className="text-sm font-medium">{m.from}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.unread > 0 && <span className="w-5 h-5 bg-accent text-white rounded-full text-xs flex items-center justify-center font-medium">{m.unread}</span>}
                    <span className="text-[10px] text-muted-foreground">{m.time}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 pl-12">{m.text}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-foreground to-foreground/80 text-white rounded-xl flex items-center justify-center text-sm font-bold">{activeChat.avatar}</div>
              <div>
                <div className="font-semibold text-sm">{activeChat.from}</div>
                <div className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {t.messages.online}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors"><Icon name="Phone" size={16} className="text-muted-foreground" /></button>
              <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors"><Icon name="MoreVertical" size={16} className="text-muted-foreground" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-secondary/20">
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 text-sm ${msg.from === "me" ? "bg-foreground text-background rounded-2xl rounded-br-sm" : "bg-white border border-border text-foreground rounded-2xl rounded-bl-sm"}`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`text-[10px] mt-1 ${msg.from === "me" ? "text-background/60" : "text-muted-foreground"}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input type="text" placeholder={t.messages.inputPlaceholder} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 bg-secondary/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
              <button onClick={send} className="btn-modern bg-foreground text-background px-5 py-3 rounded-xl text-sm font-medium">
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogPage({ t, onOpenPost }: { t: Translation; onOpenPost: (i: number) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.blog.tag}</p>
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm tracking-tight">{t.blog.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t.blog.subtitle}</p>
      </div>

      <button onClick={() => onOpenPost(0)} className="w-full text-left gradient-bg text-white rounded-3xl p-10 mb-12 relative overflow-hidden card-hover cursor-pointer">
        <div className="absolute top-0 right-0 w-full h-full opacity-30 hero-grid" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/90 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full mb-5 inline-block">{t.blog.featuredCategory}</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-ibm mb-4 tracking-tight leading-tight">{t.blog.featuredTitle}</h2>
          <p className="text-blue-100/90 mb-6 leading-relaxed">{t.blog.featuredExcerpt}</p>
          <div className="flex items-center gap-4 text-sm text-blue-200/80">
            <span>{t.blog.featuredDate}</span>
            <span>•</span>
            <span>{t.blog.readMin(8)}</span>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {t.blogPosts.map((post, i) => (
          <div key={i} onClick={() => onOpenPost(i)} className="card-hover bg-white border border-border rounded-2xl overflow-hidden cursor-pointer">
            <div className="h-44 bg-gradient-to-br from-foreground to-foreground/70 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 hero-grid opacity-50" />
              <Icon name="FileText" size={40} className="text-white/30 relative" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">{post.category}</span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <button onClick={(e) => { e.stopPropagation(); onOpenPost(i); }} className="text-xs text-foreground font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all bg-secondary/60 px-3 py-1.5 rounded-full hover:bg-secondary">
                  {t.blog.read} <Icon name="ArrowRight" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogPostPage({ t, postIndex, onBack, onOpenPost }: { t: Translation; postIndex: number; onBack: () => void; onOpenPost: (i: number) => void }) {
  const post = t.blogPosts[postIndex];
  const related = t.blogPosts.map((p, i) => ({ p, i })).filter(({ i }) => i !== postIndex).slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors bg-white/50 hover:bg-white border border-border px-4 py-2 rounded-xl">
        <Icon name="ArrowLeft" size={16} />
        {t.blog.backToBlog}
      </button>

      <div className="mb-6">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">{post.category}</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold font-ibm leading-[1.1] mb-6 tracking-tight">{post.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border flex-wrap">
        <span className="flex items-center gap-1.5"><Icon name="User" size={14} />{post.author}</span>
        <span className="flex items-center gap-1.5"><Icon name="Calendar" size={14} />{post.date}</span>
        <span className="flex items-center gap-1.5"><Icon name="Clock" size={14} />{post.readTime}</span>
      </div>

      <div className="h-72 gradient-bg rounded-3xl flex items-center justify-center mb-10 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
        <Icon name="FileText" size={56} className="text-white/30 relative" />
      </div>

      <article className="prose max-w-none mb-10">
        <p className="text-lg text-foreground leading-relaxed mb-6 font-medium">{post.excerpt}</p>
        {post.content.map((para, i) => (
          <p key={i} className="text-base text-foreground leading-relaxed mb-5">{para}</p>
        ))}
      </article>

      <div className="border-t border-border pt-6 mb-12">
        <div className="text-sm font-semibold mb-3">{t.blog.shareTitle}</div>
        <div className="flex gap-2">
          {["Send", "Mail", "Link", "Copy"].map((icon) => (
            <button key={icon} className="w-10 h-10 bg-secondary/60 rounded-xl flex items-center justify-center hover:bg-secondary transition-colors">
              <Icon name={icon} size={15} className="text-muted-foreground" fallback="Share2" />
            </button>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold font-ibm mb-5 tracking-tight">{t.blog.relatedTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {related.map(({ p, i }) => (
              <div key={i} onClick={() => onOpenPost(i)} className="card-hover bg-white border border-border rounded-2xl overflow-hidden cursor-pointer">
                <div className="h-36 bg-gradient-to-br from-foreground to-foreground/70 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 hero-grid opacity-50" />
                  <Icon name="FileText" size={28} className="text-white/30 relative" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">{p.category}</span>
                  <h4 className="font-semibold text-foreground mt-3 mb-2 leading-snug text-sm">{p.title}</h4>
                  <span className="text-xs text-muted-foreground">{p.date} · {p.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ p, t, onOpen, canManage, onEdit, onDelete }: { p: AdminProduct; t: Translation; onOpen: (id: number) => void; canManage?: boolean; onEdit?: (p: AdminProduct) => void; onDelete?: (p: AdminProduct) => void }) {
  return (
    <div className="card-hover bg-white border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-colors relative group">
      {canManage && (
        <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(p); }}
            title="Редактировать"
            className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg flex items-center justify-center shadow-sm hover:bg-accent hover:text-white transition-colors"
          >
            <Icon name="Pencil" size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(p); }}
            title="Удалить"
            className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-lg flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors"
          >
            <Icon name="Trash2" size={13} />
          </button>
        </div>
      )}
      <button onClick={() => onOpen(p.id)} className="text-left w-full">
        <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center overflow-hidden relative">
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
          ) : (
            <Icon name="Image" size={22} className="text-muted-foreground/40" />
          )}
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[10px] font-medium text-foreground bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm">{p.category}</span>
          </div>
          {!p.in_stock && !canManage && (
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[10px] font-medium text-white bg-foreground/80 backdrop-blur-md px-2 py-0.5 rounded-full">{t.products.outOfStock}</span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="font-semibold text-xs leading-snug mb-1 line-clamp-2 min-h-[2.2em]">{p.title}</h3>
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <div className="font-bold text-sm leading-tight">{p.price.toLocaleString("ru")} <span className="text-[10px] text-muted-foreground font-normal">{p.currency}</span></div>
              <div className="text-[10px] text-muted-foreground">{t.products.from} {p.moq} {t.products.pcs}</div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function ProductsPage({ t, user, onOpen }: { t: Translation; user: User | null; onOpen: (id: number) => void }) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const canManage = !!user;

  const load = () => {
    setLoading(true);
    fetch(PRODUCTS_API)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (p: AdminProduct) => {
    if (!confirm(`Удалить товар «${p.title}»?`)) return;
    const token = getToken() || "";
    try {
      const res = await fetch(PRODUCTS_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify({ id: p.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Товар удалён");
      setItems((prev) => prev.filter((x) => x.id !== p.id));
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.category.trim()) {
      toast.error("Название и категория обязательны");
      return;
    }
    setSaving(true);
    const token = getToken() || "";
    try {
      const res = await fetch(PRODUCTS_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Auth-Token": token },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success("Сохранено");
      setItems((prev) => prev.map((x) => (x.id === editing.id ? editing : x)));
      setEditing(null);
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((p) => {
    const q = search.toLowerCase();
    return !search || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.products.tag}</p>
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm tracking-tight">{t.products.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t.products.subtitle}</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white border border-border rounded-2xl p-3">
        <div className="relative w-full sm:max-w-md">
          <Icon name="Search" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.products.searchPlaceholder}
            className="w-full pl-10 pr-3 py-2.5 bg-secondary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all"
          />
        </div>
        <span className="text-sm text-muted-foreground font-medium px-3">{t.products.found(filtered.length)}</span>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-16">...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-border rounded-2xl p-20 text-center">
          <div className="w-16 h-16 bg-secondary/60 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Icon name="Package" size={28} className="text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">{t.products.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} t={t} onOpen={onOpen} canManage={canManage} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold font-ibm">Редактировать товар</h3>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Название *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Категория *</label>
                  <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Поставщик</label>
                  <input value={editing.supplier} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Цена</label>
                  <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Валюта</label>
                  <input value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Мин. шт.</label>
                  <input type="number" value={editing.moq} onChange={(e) => setEditing({ ...editing, moq: parseInt(e.target.value) || 1 })}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Описание</label>
                <textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-muted-foreground">URL картинки</label>
                <input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" checked={editing.in_stock} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} className="w-4 h-4 accent-accent" />
                <span className="text-sm">В наличии</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80">Отмена</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 btn-modern bg-foreground text-background px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesPage({ t, onNav, onOpenService }: { t: Translation; onNav: (p: Page) => void; onOpenService: (i: number) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.services.tag}</p>
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm tracking-tight">{t.services.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{t.services.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {t.services.items.map((s, i) => (
          <div key={i} className="card-hover bg-white border border-border rounded-2xl p-6 flex flex-col">
            <div className="w-14 h-14 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mb-5 overflow-hidden">
              {s.icon === "Taobao" ? (
                <img src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/bucket/8322b202-2dcf-4f1e-b13c-86fe2d1b6c4b.png" alt="Taobao" className="w-10 h-10 object-contain" />
              ) : s.icon === "WeChat" ? (
                <img src="https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/bucket/ef3d3318-f000-48e2-9eb1-53341f2fbbec.png" alt="WeChat" className="w-10 h-10 object-contain" />
              ) : (
                <Icon name={s.icon} size={24} className="text-accent" fallback="Star" />
              )}
            </div>
            <h3 className="font-semibold text-foreground mb-2 leading-snug text-lg">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{s.desc}</p>
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button onClick={() => onOpenService(i)} className="text-xs font-medium text-foreground hover:text-accent transition-all flex items-center gap-1 hover:gap-2 px-3 py-2.5 rounded-xl hover:bg-secondary/60">
                {t.services.detailBtn} <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="gradient-bg text-white rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold font-ibm mb-4 tracking-tight">{t.services.ctaTitle}</h2>
          <p className="text-blue-100/80 mb-8 max-w-xl mx-auto">{t.services.ctaSubtitle}</p>
          <button onClick={() => onNav("contacts")} className="btn-modern bg-white text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm">
            {t.services.ctaBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactsPage({ t }: { t: Translation }) {
  const contactIcons = ["Phone", "Mail", "MessageSquare", "MapPin"];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.contacts.tag}</p>
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm tracking-tight">{t.contacts.title}</h1>
        <p className="text-muted-foreground mt-3">{t.contacts.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-3xl p-8">
            <h2 className="font-bold text-xl mb-6 font-ibm">{t.contacts.formTitle}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.contacts.name}</label>
                  <input type="text" placeholder={t.contacts.namePh} className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.contacts.company}</label>
                  <input type="text" placeholder={t.contacts.companyPh} className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.contacts.email}</label>
                <input type="email" placeholder={t.contacts.emailPh} className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.contacts.topic}</label>
                <select className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all cursor-pointer">
                  {t.contacts.topics.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.contacts.message}</label>
                <textarea rows={5} placeholder={t.contacts.messagePh} className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all resize-none" />
              </div>
              <button className="btn-modern bg-foreground text-background px-7 py-3.5 rounded-xl text-sm font-medium">
                {t.contacts.submit}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {t.contacts.contactCards.map((c, i) => (
            <div key={c.title} className="bg-white border border-border rounded-2xl p-5 flex items-start gap-4 card-hover">
              <div className="w-11 h-11 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon name={contactIcons[i]} size={18} className="text-accent" fallback="Info" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{c.title}</div>
                <div className="font-semibold text-sm">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
              </div>
            </div>
          ))}

          <div className="gradient-bg text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 hero-grid opacity-50" />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="HelpCircle" size={18} className="text-blue-300" />
                <span className="font-semibold text-sm">{t.contacts.kbTitle}</span>
              </div>
              <p className="text-xs text-blue-100/80 mb-4 leading-relaxed">{t.contacts.kbText}</p>
              <button className="text-xs text-white font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                {t.contacts.kbLink} <Icon name="ArrowRight" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCompanyPage({ t, onNav }: { t: Translation; onNav: (p: Page) => void }) {
  const ru = {
    tag: "Размещение компании",
    title: "Разместите свою компанию на платформе",
    subtitle: "Сервис для российских и китайских компаний: попадите в каталог, публикуйте товары и получайте заявки от проверенных партнёров.",
    whyTitle: "Почему стоит разместиться",
    why: [
      { icon: "Globe", title: "Двуязычная аудитория", text: "Ваши товары увидят покупатели и поставщики из России и Китая." },
      { icon: "Search", title: "Видимость в каталоге", text: "Карточка компании в общем каталоге с фильтрами и поиском." },
      { icon: "Package", title: "Каталог товаров", text: "Загружайте товары с фото, ценами и характеристиками." },
      { icon: "MessageSquare", title: "Прямые заявки", text: "Получайте сообщения от заинтересованных клиентов напрямую." },
    ],
    stepsTitle: "Как разместиться — 4 шага",
    steps: [
      { title: "Заявка", text: "Оставьте заявку через форму ниже — укажите название и контакты." },
      { title: "Верификация", text: "Проверим документы компании и подтвердим её статус." },
      { title: "Заполнение профиля", text: "Добавьте логотип, описание, категории и реквизиты." },
      { title: "Публикация товаров", text: "Загрузите карточки товаров и начинайте получать заявки." },
    ],
    needTitle: "Что понадобится",
    need: [
      "Регистрационные документы компании (ОГРН/营业执照)",
      "Логотип и краткое описание деятельности",
      "Контактное лицо и способы связи",
      "Фото и характеристики товаров",
    ],
    cta: "Оставить заявку",
  };
  const zh = {
    tag: "公司入驻",
    title: "在平台上发布您的公司",
    subtitle: "面向中俄两国企业的服务：进入商品目录、发布产品并获取来自可靠合作伙伴的询盘。",
    whyTitle: "为什么选择入驻",
    why: [
      { icon: "Globe", title: "双语受众", text: "您的产品将被来自中国和俄罗斯的买家与供应商看到。" },
      { icon: "Search", title: "目录中的曝光", text: "您的公司卡片将出现在带有筛选和搜索的公共目录中。" },
      { icon: "Package", title: "产品目录", text: "上传带图片、价格与规格的产品。" },
      { icon: "MessageSquare", title: "直接询盘", text: "直接接收感兴趣客户的消息。" },
    ],
    stepsTitle: "如何入驻 — 四个步骤",
    steps: [
      { title: "提交申请", text: "通过下方表单提交申请，填写公司名称和联系方式。" },
      { title: "认证审核", text: "我们将核对公司证件并确认其资质。" },
      { title: "完善资料", text: "添加 Logo、简介、分类和企业信息。" },
      { title: "发布产品", text: "上传产品卡片，开始接收询盘。" },
    ],
    needTitle: "您需要准备",
    need: [
      "公司注册文件（营业执照 / ОГРН）",
      "Logo 与公司业务简介",
      "联系人及联系方式",
      "产品图片与规格",
    ],
    cta: "提交申请",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{ru.tag} / {zh.tag}</p>
        <h1 className="text-3xl sm:text-5xl font-bold font-ibm tracking-tight mb-3">{ru.title}</h1>
        <p className="text-lg sm:text-xl font-medium text-foreground/80 mb-4">{zh.title}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {[ru, zh].map((lang, idx) => (
          <div key={idx} className="bg-white border border-border rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                {idx === 0 ? "RU · Русский" : "ZH · 中文"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{lang.subtitle}</p>

            <h3 className="font-bold text-base mb-4 font-ibm">{lang.whyTitle}</h3>
            <div className="space-y-3 mb-6">
              {lang.why.map((w) => (
                <div key={w.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={w.icon} size={16} className="text-accent" fallback="Star" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{w.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{w.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-base mb-4 font-ibm">{lang.stepsTitle}</h3>
            <div className="space-y-3 mb-6">
              {lang.steps.map((s, i) => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{s.title}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-base mb-3 font-ibm">{lang.needTitle}</h3>
            <ul className="space-y-2">
              {lang.need.map((n) => (
                <li key={n} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Icon name="Check" size={14} className="text-accent flex-shrink-0 mt-0.5" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="gradient-bg text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden text-center">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold font-ibm mb-2">{ru.cta} · {zh.cta}</h2>
          <p className="text-sm text-blue-100/80 mb-6 max-w-xl mx-auto">
            Заполните короткую форму — менеджер свяжется в течение рабочего дня.<br />
            填写简短表单 — 经理将在一个工作日内与您联系。
          </p>
          <button
            onClick={() => onNav("contacts")}
            className="btn-modern bg-white text-foreground px-8 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          >
            {ru.cta} / {zh.cta} <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer({ onNav, t }: { onNav: (p: Page) => void; t: Translation }) {
  const colPages: Page[][] = [
    ["home", "catalog", "blog"],
    ["addCompany", "contacts", "contacts"],
    ["contacts", "contacts", "messages"],
  ];
  return (
    <footer className="mt-auto px-3 sm:px-6 pb-3 sm:pb-6">
      <div className="max-w-7xl mx-auto gradient-bg text-blue-100/70 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative px-6 sm:px-10 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Icon name="Container" size={18} fallback="Package" />
          </span>
                <span className="font-bold text-white font-ibm text-lg">{t.brand}</span>
              </div>
              <p className="text-xs leading-relaxed">{t.footer.desc}</p>
            </div>
            {t.footer.cols.map((col, ci) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l, li) => (
                    <li key={l}>
                      <button onClick={() => onNav(colPages[ci][li])} className="text-xs hover:text-white transition-colors">{l}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <span>{t.footer.copyright}</span>
            <div className="flex gap-4">
              <button className="hover:text-white transition-colors">{t.footer.privacy}</button>
              <button className="hover:text-white transition-colors">{t.footer.terms}</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type RealSupplierData = {
  id: number;
  user_id: number;
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

type SupplierVideo = { id: number; title: string; url: string; provider: string; video_id: string };

function RealSupplierPage({ userId, onBack, onOpenProduct, user }: { userId: number; onBack: () => void; onOpenProduct: (id: number) => void; user: User | null }) {
  const [company, setCompany] = useState<RealSupplierData | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [videos, setVideos] = useState<SupplierVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "videos" | "products" | "contacts">("about");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${COMPANY_API}?user_id=${userId}`).then((r) => r.json()).catch(() => ({ company: null })),
      fetch(`${COMPANY_API}?resource=videos&user_id=${userId}`).then((r) => r.json()).catch(() => ({ items: [] })),
      fetch(PRODUCTS_API).then((r) => r.json()).catch(() => ({ items: [] })),
    ]).then(([c, v, p]) => {
      setCompany(c.company || null);
      setVideos(v.items || []);
      const all: AdminProduct[] = (p.items || []).filter((x: AdminProduct & { user_id?: number }) => x.user_id === userId);
      setProducts(all);
    }).finally(() => setLoading(false));
  }, [userId]);

  const videoEmbed = (v: SupplierVideo) =>
    v.provider === "youtube"
      ? `https://www.youtube.com/embed/${v.video_id}`
      : `https://rutube.ru/play/embed/${v.video_id}/`;

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground animate-fade-in">Загружаем...</div>;
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors bg-white/50 hover:bg-white border border-border px-4 py-2 rounded-xl">
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>
        <div className="bg-white border border-dashed border-border rounded-3xl p-20 text-center">
          <Icon name="Building2" size={32} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Компания не найдена</p>
        </div>
      </div>
    );
  }

  const socials = [
    { key: "telegram", label: "Telegram", icon: "Send", color: "bg-sky-50 text-sky-600", href: (v: string) => v.startsWith("@") ? `https://t.me/${v.slice(1)}` : v.startsWith("http") ? v : `https://t.me/${v}` },
    { key: "whatsapp", label: "WhatsApp", icon: "MessageCircle", color: "bg-emerald-50 text-emerald-600", href: (v: string) => v.startsWith("http") ? v : `https://wa.me/${v.replace(/[^\d]/g, "")}` },
    { key: "wechat", label: "WeChat", icon: "MessageSquare", color: "bg-green-50 text-green-700", href: (v: string) => `#${v}` },
    { key: "vk", label: "ВКонтакте", icon: "Globe", color: "bg-blue-50 text-blue-600", href: (v: string) => v.startsWith("http") ? v : `https://vk.com/${v}` },
    { key: "instagram", label: "Instagram", icon: "Instagram", color: "bg-pink-50 text-pink-600", href: (v: string) => v.startsWith("http") ? v : `https://instagram.com/${v.replace("@", "")}` },
  ];
  const activeSocials = socials.filter((s) => (company as unknown as Record<string, string>)[s.key]);
  const initial = company.name ? company.name[0].toUpperCase() : "?";

  const contactsList = [
    company.phone && { icon: "Phone", label: "Телефон", value: company.phone, href: `tel:${company.phone}` },
    company.email && { icon: "Mail", label: "Email", value: company.email, href: `mailto:${company.email}` },
    company.website && { icon: "Globe", label: "Сайт", value: company.website, href: company.website.startsWith("http") ? company.website : `https://${company.website}` },
    company.location && { icon: "MapPin", label: "Адрес", value: company.location, href: "" },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string }[];

  const primaryContact = company.telegram
    ? { label: "Написать в Telegram", icon: "Send", href: socials[0].href(company.telegram) }
    : company.whatsapp
    ? { label: "Написать в WhatsApp", icon: "MessageCircle", href: socials[1].href(company.whatsapp) }
    : company.email
    ? { label: "Написать на email", icon: "Mail", href: `mailto:${company.email}` }
    : company.phone
    ? { label: "Позвонить", icon: "Phone", href: `tel:${company.phone}` }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors bg-white/50 hover:bg-white border border-border px-4 py-2 rounded-xl">
        <Icon name="ArrowLeft" size={16} /> Назад в каталог
      </button>

      <div className="bg-white border border-border rounded-3xl mb-5 overflow-hidden">
        <div className="h-36 gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 left-8 translate-y-1/2 w-24 h-24 bg-white border-4 border-white rounded-2xl shadow-xl flex items-center justify-center text-foreground font-bold text-2xl overflow-hidden">
            {company.logo_url ? <img src={company.logo_url} alt="" className="w-full h-full object-cover" /> : initial}
          </div>
        </div>
        <div className="pt-16 pb-7 px-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold font-ibm tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <Icon name="Sparkles" size={13} /> Новый
              </div>
            </div>
            {company.category && <p className="text-accent font-medium mb-3 text-sm">{company.category}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {company.location && <span className="flex items-center gap-1.5"><Icon name="MapPin" size={14} />{company.location}</span>}
              <span className="flex items-center gap-1.5"><Icon name="Package" size={14} />{products.length} товаров</span>
              {videos.length > 0 && <span className="flex items-center gap-1.5"><Icon name="Video" size={14} />{videos.length} видео</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {primaryContact && (
              <a href={primaryContact.href} target="_blank" rel="noreferrer" className="btn-modern flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-medium">
                <Icon name={primaryContact.icon} size={16} /> {primaryContact.label}
              </a>
            )}
            <button onClick={() => setActiveTab("contacts")} className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary px-5 py-3 rounded-xl text-sm font-medium transition-colors">
              <Icon name="Phone" size={16} /> Контакты
            </button>
            {user && (
              <button
                onClick={async () => {
                  if (!confirm(`Удалить поставщика «${company.name}»? Также удалятся все его товары и видео.`)) return;
                  const token = getToken() || "";
                  try {
                    const res = await fetch(COMPANY_API, {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json", "X-Auth-Token": token },
                      body: JSON.stringify({ id: company.id }),
                    });
                    if (!res.ok) throw new Error();
                    toast.success("Поставщик удалён");
                    onBack();
                  } catch {
                    toast.error("Не удалось удалить");
                  }
                }}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                <Icon name="Trash2" size={16} /> Удалить
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Товаров", value: String(products.length), icon: "Package" },
          { label: "Видео", value: String(videos.length), icon: "Video" },
          { label: "Каналов связи", value: String(activeSocials.length + contactsList.length), icon: "MessageSquare" },
          { label: "Город", value: company.location || "—", icon: "MapPin" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <Icon name={stat.icon} size={14} className="text-accent" fallback="Info" />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-ibm truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="flex border-b border-border px-2 pt-2 gap-1 overflow-x-auto">
          {([
            ["about", "О компании"],
            ["videos", `Видео${videos.length ? ` (${videos.length})` : ""}`],
            ["products", `Товары${products.length ? ` (${products.length})` : ""}`],
            ["contacts", "Контакты"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-5 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${activeTab === key ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "about" && (
            <div>
              {company.description ? (
                <p className="text-muted-foreground mb-6 leading-relaxed">{company.description}</p>
              ) : (
                <p className="text-muted-foreground mb-6 leading-relaxed italic">Компания пока не добавила описание</p>
              )}
              {company.category && (
                <>
                  <h3 className="font-semibold mb-4">Направление</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full font-medium">{company.category}</span>
                  </div>
                </>
              )}
              {activeSocials.length > 0 && (
                <>
                  <h3 className="font-semibold mb-4">Где найти</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map((s) => {
                      const value = (company as unknown as Record<string, string>)[s.key];
                      return (
                        <a key={s.key} href={s.href(value)} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${s.color} hover:opacity-80 transition-opacity`}>
                          <Icon name={s.icon} size={14} fallback="Link" /> {s.label}
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "videos" && (
            videos.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Video" size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Видео пока не добавлены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((v) => (
                  <div key={v.id} className="rounded-2xl overflow-hidden border border-border bg-secondary/20">
                    <div className="aspect-video bg-black">
                      {v.provider === "file" ? (
                        <video src={v.url} controls className="w-full h-full" />
                      ) : (
                        <iframe src={videoEmbed(v)} title={v.title || "Видео"} className="w-full h-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; clipboard-write" allowFullScreen />
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{v.title || "Без названия"}</span>
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${v.provider === "youtube" ? "bg-red-50 text-red-600" : v.provider === "file" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>{v.provider === "file" ? "файл" : v.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "products" && (
            products.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Package" size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Товаров пока нет</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <button key={p.id} onClick={() => onOpenProduct(p.id)} className="card-hover bg-white border border-border rounded-2xl overflow-hidden text-left hover:border-foreground/20">
                    <div className="h-40 bg-secondary/40 flex items-center justify-center overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <Icon name="Image" size={24} className="text-muted-foreground/40" />}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{p.category}</span>
                      <h4 className="font-semibold text-sm mt-2 line-clamp-2">{p.title}</h4>
                      <div className="font-bold text-base mt-2">{p.price.toLocaleString("ru")} <span className="text-xs text-muted-foreground font-normal">{p.currency}</span></div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {activeTab === "contacts" && (
            <div>
              {contactsList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {contactsList.map((c) => (
                    <a key={c.label} href={c.href || "#"} target={c.href ? "_blank" : undefined} rel="noreferrer" className="flex items-start gap-3 bg-secondary/40 hover:bg-secondary/70 transition-colors p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name={c.icon} size={16} className="text-accent" fallback="Info" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">{c.label}</div>
                        <div className="text-sm font-medium truncate">{c.value}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {activeSocials.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Соцсети и мессенджеры</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map((s) => {
                      const value = (company as unknown as Record<string, string>)[s.key];
                      return (
                        <a key={s.key} href={s.href(value)} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${s.color} hover:opacity-80 transition-opacity`}>
                          <Icon name={s.icon} size={14} fallback="Link" /> {s.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              {contactsList.length === 0 && activeSocials.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Контакты пока не указаны</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const lang: Lang = "ru";
  const setLang = (_l: Lang) => {};
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
  const [activeRealSupplierId, setActiveRealSupplierId] = useState<number | null>(null);
  const t = translations[lang];

  useEffect(() => {
    fetchMe().then(setUser);
  }, []);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPost = (i: number) => {
    setActivePostIndex(i);
    navigate("blogPost");
  };

  const requireAuth = () => {
    if (!user) {
      setAuthOpen(true);
    } else {
      navigate("account");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-ibm">
      <Navbar current={page} onNav={navigate} lang={lang} setLang={setLang} t={t} user={user} onLogin={requireAuth} />
      <main className="flex-1">
        <div key={`${page}-${activePostIndex}`} className="animate-page">
          {page === "home" && <HomePage onNav={navigate} t={t} onOpenService={(i) => { setActiveServiceIndex(i); navigate("service"); }} onOpenProduct={(id) => { setActiveProductId(id); navigate("product"); }} />}
          {page === "catalog" && <CatalogPage onViewReal={(uid) => { setActiveRealSupplierId(uid); navigate("realSupplier"); }} t={t} user={user} />}
          {page === "supplier" && <SupplierProfilePage onBack={() => navigate("catalog")} onMessage={() => navigate("messages")} t={t} />}
          {page === "realSupplier" && activeRealSupplierId !== null && (
            <RealSupplierPage userId={activeRealSupplierId} onBack={() => navigate("catalog")} onOpenProduct={(id) => { setActiveProductId(id); navigate("product"); }} user={user} />
          )}
          {page === "messages" && <MessagesPage t={t} />}
          {page === "products" && <ProductsPage t={t} user={user} onOpen={(id) => { setActiveProductId(id); navigate("product"); }} />}
          {page === "product" && activeProductId !== null && (
            <ProductPage
              productId={activeProductId}
              onBack={() => navigate("products")}
              user={user}
              onLogin={() => setAuthOpen(true)}
              onOpenSupplier={(uid) => { setActiveRealSupplierId(uid); navigate("realSupplier"); }}
            />
          )}
          {page === "services" && <ServicesPage t={t} onNav={navigate} onOpenService={(i) => { setActiveServiceIndex(i); navigate("service"); }} />}
          {page === "service" && activeServiceIndex !== null && (
            <ServicePage serviceIndex={activeServiceIndex} t={t} onBack={() => navigate("services")} />
          )}
          {page === "blog" && <BlogPage t={t} onOpenPost={openPost} />}
          {page === "blogPost" && <BlogPostPage t={t} postIndex={activePostIndex} onBack={() => navigate("blog")} onOpenPost={openPost} />}
          {page === "contacts" && <ContactsPage t={t} />}
        {page === "addCompany" && <AddCompanyPage t={t} onNav={navigate} />}
          {page === "account" && user && <AccountPage user={user} onLogout={() => { setUser(null); navigate("home"); }} />}
          {page === "account" && !user && <div className="max-w-xl mx-auto p-12 text-center"><p className="text-muted-foreground mb-4">Войди, чтобы открыть кабинет</p><button onClick={() => setAuthOpen(true)} className="btn-modern bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium">Войти</button></div>}
        </div>
      </main>
      <Footer onNav={navigate} t={t} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={(u) => { setUser(u); setAuthOpen(false); navigate("account"); }} />}
    </div>
  );
}