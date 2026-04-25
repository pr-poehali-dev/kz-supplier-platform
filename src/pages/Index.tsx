import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { translations, type Lang, type Translation } from "@/lib/i18n";
import AuthModal from "@/components/AuthModal";
import AccountPage from "@/components/AccountPage";
import ProductPage from "@/components/ProductPage";
import ServicePage from "@/components/ServicePage";
import { fetchMe, type User } from "@/lib/auth";

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

type Page = "home" | "catalog" | "supplier" | "blog" | "blogPost" | "contacts" | "messages" | "services" | "products" | "account" | "product" | "service";

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
          <span className="w-8 h-8 bg-gradient-to-br from-accent to-blue-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-accent/30">P</span>
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
          <LangSwitcher lang={lang} setLang={setLang} />
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
          <LangSwitcher lang={lang} setLang={setLang} />
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

function HomePage({ onNav, t }: { onNav: (p: Page) => void; t: Translation }) {
  const [homeProducts, setHomeProducts] = useState<AdminProduct[]>([]);
  useEffect(() => {
    fetch(PRODUCTS_API)
      .then((r) => r.json())
      .then((d) => setHomeProducts((d.items || []).slice(0, 4)))
      .catch(() => setHomeProducts([]));
  }, []);
  const catIcons = [
    { icon: "Cpu", label: t.cats.equipment, count: 412 },
    { icon: "FlaskConical", label: t.cats.chemistry, count: 187 },
    { icon: "Building2", label: t.cats.construction, count: 354 },
    { icon: "Truck", label: t.cats.logistics, count: 298 },
    { icon: "Monitor", label: t.cats.it, count: 231 },
    { icon: "Stethoscope", label: t.cats.medicine, count: 143 },
  ];
  const stepIcons = ["Search", "ShieldCheck", "MessageSquare", "Handshake"];

  return (
    <div className="animate-fade-in">
      <section className="relative mesh-bg overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="absolute top-32 right-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 bg-white/70 border border-white/80 rounded-full backdrop-blur-md animate-fade-in-up animate-fade-in-up-delay-1 shadow-sm">
              <span className="w-2 h-2 bg-accent rounded-full pulse-glow" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-widest">{t.hero.tag}</span>
            </div>
            <h1 className="sm:text-6xl lg:text-7xl leading-[1.05] mb-7 font-ibm animate-fade-in-up animate-fade-in-up-delay-2 font-bold tracking-tight text-4xl">
              {t.hero.title1}<br />
              <span className="gradient-text">{t.hero.title2}</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed animate-fade-in-up animate-fade-in-up-delay-3">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up animate-fade-in-up-delay-4">
              <button onClick={() => onNav("catalog")} className="btn-modern bg-foreground text-background font-medium px-7 py-3.5 rounded-2xl text-sm flex items-center gap-2 justify-center">
                {t.hero.findSupplier} <Icon name="ArrowRight" size={16} />
              </button>
              <button className="bg-white/70 border border-border hover:bg-white text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm transition-all backdrop-blur-md">
                {t.hero.placeCompany}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-16 max-w-3xl mx-auto animate-fade-in-up animate-fade-in-up-delay-4">
            {[
              { value: "2 400+", label: t.hero.stat1Label },
              { value: "18 000+", label: t.hero.stat2Label },
              { value: "96%", label: t.hero.stat3Label },
            ].map((s, i) => (
              <div key={i} className="bg-white/60 border border-white/80 rounded-2xl p-5 backdrop-blur-md text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</div>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.directionsTag}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground font-ibm tracking-tight">{t.sections.directionsTitle}</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="text-sm text-foreground font-medium flex items-center gap-1.5 hover:gap-3 transition-all bg-secondary/60 px-4 py-2 rounded-xl hover:bg-secondary">
            {t.sections.allCategories} <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {catIcons.map((cat) => (
            <button key={cat.label} onClick={() => onNav("catalog")} className="card-hover bg-white border border-border rounded-2xl p-5 text-center flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/40 rounded-2xl flex items-center justify-center group-hover:from-accent/10 group-hover:to-accent/5 transition-all">
                <Icon name={cat.icon} size={24} className="text-accent" fallback="Box" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{cat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{cat.count} {t.cats.companies}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.bestTag}</p>
            <h2 className="text-3xl sm:text-4xl font-bold font-ibm tracking-tight">{t.sections.bestTitle}</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="text-sm text-foreground font-medium flex items-center gap-1.5 hover:gap-3 transition-all bg-secondary/60 px-4 py-2 rounded-xl hover:bg-secondary">
            {t.sections.allSuppliers} <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <SupplierCard key={i} idx={i} t={t} onView={() => onNav("supplier")} />
          ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {homeProducts.map((p) => (
              <ProductCard key={p.id} p={p} t={t} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.simpleTag}</p>
          <h2 className="text-3xl sm:text-4xl font-bold font-ibm tracking-tight">{t.sections.simpleTitle}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.steps.map((item, i) => (
            <div key={i} className="card-hover bg-white border border-border rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -top-2 -right-2 text-7xl font-bold gradient-text opacity-20 font-ibm leading-none select-none">{String(i + 1).padStart(2, "0")}</div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mb-4 relative">
                <Icon name={stepIcons[i]} size={20} className="text-accent" fallback="Star" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 relative">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed relative">{item.text}</p>
            </div>
          ))}
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

type RealCompany = { id: number; name: string; logo_url: string; description: string; category: string; location: string; phone: string; email: string; website: string; products_count: number };

function CatalogPage({ onViewSupplier, t }: { onViewSupplier: () => void; t: Translation }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(t.catalog.categories[0]);
  const [realCompanies, setRealCompanies] = useState<RealCompany[]>([]);

  useEffect(() => {
    fetch("https://functions.poehali.dev/8c5a112a-69ee-45e1-bab8-ce9a83537caa?all=1")
      .then((r) => r.json())
      .then((d) => setRealCompanies(d.items || []))
      .catch(() => setRealCompanies([]));
  }, []);

  const filteredReal = realCompanies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.category || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
    const matchCat = activeCategory === t.catalog.categories[0] || (c.category || "").includes(activeCategory);
    return matchSearch && matchCat;
  });

  const allIdx = baseSuppliers.map((_, i) => i);
  const filtered = allIdx.filter((i) => {
    const s = t.suppliersData[i];
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === t.catalog.categories[0]
      || s.tags.some((tag) => tag.includes(activeCategory))
      || s.category.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold font-ibm mb-3 tracking-tight">{t.catalog.title}</h1>
        <p className="text-muted-foreground">{t.catalog.foundCount(baseSuppliers.length)}</p>
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
            <span className="text-sm text-muted-foreground font-medium">{filtered.length} {t.catalog.companies}</span>
            <select className="text-sm bg-secondary/60 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer font-medium">
              <option>{t.catalog.sortRating}</option>
              <option>{t.catalog.sortReviews}</option>
              <option>{t.catalog.sortName}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredReal.map((c) => (
              <div key={`real-${c.id}`} className="card-hover bg-white border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                    {c.logo_url ? <img src={c.logo_url} alt="" className="w-full h-full object-cover" /> : c.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">Новый</span>
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-base">{c.name}</h3>
                {c.category && <p className="text-xs text-accent font-medium mb-3">{c.category}</p>}
                {c.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{c.description}</p>}
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-4 flex-wrap">
                  {c.location && <span className="flex items-center gap-1.5"><Icon name="MapPin" size={12} />{c.location}</span>}
                  {c.products_count > 0 && <span className="flex items-center gap-1.5"><Icon name="Package" size={12} />{c.products_count} тов.</span>}
                </div>
              </div>
            ))}
            {filtered.map((i) => (
              <SupplierCard key={i} idx={i} t={t} onView={onViewSupplier} />
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

function ProductCard({ p, t, onOpen }: { p: AdminProduct; t: Translation; onOpen: (id: number) => void }) {
  return (
    <button
      onClick={() => onOpen(p.id)}
      className="card-hover bg-white border border-border rounded-2xl overflow-hidden text-left w-full hover:border-foreground/20 transition-colors"
    >
      <div className="h-44 bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center overflow-hidden relative">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <Icon name="Image" size={28} className="text-muted-foreground/40" />
        )}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium text-foreground bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">{p.category}</span>
        </div>
        {!p.in_stock && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium text-white bg-foreground/80 backdrop-blur-md px-2.5 py-1 rounded-full">{t.products.outOfStock}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{p.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div>
            <div className="font-bold text-base">{p.price.toLocaleString("ru")} <span className="text-xs text-muted-foreground font-normal">{p.currency}</span></div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.products.from} {p.moq} {t.products.pcs}</div>
          </div>
          {p.supplier && <span className="text-xs text-muted-foreground truncate ml-2">{p.supplier}</span>}
        </div>
      </div>
    </button>
  );
}

function ProductsPage({ t, onOpen }: { t: Translation; onOpen: (id: number) => void }) {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(PRODUCTS_API)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} t={t} onOpen={onOpen} />
          ))}
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
            <div className="w-14 h-14 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mb-5">
              <Icon name={s.icon} size={24} className="text-accent" fallback="Star" />
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

function Footer({ onNav, t }: { onNav: (p: Page) => void; t: Translation }) {
  const colPages: Page[][] = [
    ["home", "catalog", "blog"],
    ["contacts", "contacts", "contacts"],
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
                <span className="w-8 h-8 bg-gradient-to-br from-accent to-blue-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-accent/30">P</span>
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

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [lang, setLang] = useState<Lang>("ru");
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);
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
          {page === "home" && <HomePage onNav={navigate} t={t} />}
          {page === "catalog" && <CatalogPage onViewSupplier={() => navigate("supplier")} t={t} />}
          {page === "supplier" && <SupplierProfilePage onBack={() => navigate("catalog")} onMessage={() => navigate("messages")} t={t} />}
          {page === "messages" && <MessagesPage t={t} />}
          {page === "products" && <ProductsPage t={t} onOpen={(id) => { setActiveProductId(id); navigate("product"); }} />}
          {page === "product" && activeProductId !== null && (
            <ProductPage productId={activeProductId} onBack={() => navigate("products")} user={user} onLogin={() => setAuthOpen(true)} />
          )}
          {page === "services" && <ServicesPage t={t} onNav={navigate} onOpenService={(i) => { setActiveServiceIndex(i); navigate("service"); }} />}
          {page === "service" && activeServiceIndex !== null && (
            <ServicePage serviceIndex={activeServiceIndex} t={t} onBack={() => navigate("services")} />
          )}
          {page === "blog" && <BlogPage t={t} onOpenPost={openPost} />}
          {page === "blogPost" && <BlogPostPage t={t} postIndex={activePostIndex} onBack={() => navigate("blog")} onOpenPost={openPost} />}
          {page === "contacts" && <ContactsPage t={t} />}
          {page === "account" && user && <AccountPage user={user} onLogout={() => { setUser(null); navigate("home"); }} />}
          {page === "account" && !user && <div className="max-w-xl mx-auto p-12 text-center"><p className="text-muted-foreground mb-4">Войди, чтобы открыть кабинет</p><button onClick={() => setAuthOpen(true)} className="btn-modern bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium">Войти</button></div>}
        </div>
      </main>
      <Footer onNav={navigate} t={t} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={(u) => { setUser(u); setAuthOpen(false); navigate("account"); }} />}
    </div>
  );
}