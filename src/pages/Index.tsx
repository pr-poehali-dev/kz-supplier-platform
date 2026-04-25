import { useState } from "react";
import Icon from "@/components/ui/icon";
import { translations, type Lang, type Translation } from "@/lib/i18n";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/files/84c5569f-5d72-4607-9942-6fd7f5ed1dfd.jpg";

type Page = "home" | "catalog" | "supplier" | "blog" | "contacts" | "messages";

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
    <div className="flex items-center bg-secondary rounded overflow-hidden text-xs font-medium">
      <button
        onClick={() => setLang("ru")}
        className={`px-2.5 py-1.5 transition-colors ${lang === "ru" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
      >
        RU
      </button>
      <button
        onClick={() => setLang("zh")}
        className={`px-2.5 py-1.5 transition-colors ${lang === "zh" ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground"}`}
      >
        中文
      </button>
    </div>
  );
}

function Navbar({ current, onNav, lang, setLang, t }: { current: Page; onNav: (p: Page) => void; lang: Lang; setLang: (l: Lang) => void; t: Translation }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: t.nav.home, page: "home" },
    { label: t.nav.catalog, page: "catalog" },
    { label: t.nav.blog, page: "blog" },
    { label: t.nav.contacts, page: "contacts" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => onNav("home")} className="flex items-center gap-2 font-bold text-xl text-navy-800 tracking-tight font-ibm">
          <span className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center text-white text-sm font-bold">P</span>
          {t.brand}
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.page}
              onClick={() => onNav(l.page)}
              className={`nav-link text-sm font-medium transition-colors ${current === l.page ? "text-accent active" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <LangSwitcher lang={lang} setLang={setLang} />
          <button
            onClick={() => onNav("messages")}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="MessageSquare" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <button className="text-sm font-medium text-foreground px-4 py-2 border border-border rounded hover:bg-secondary transition-colors">
            {t.nav.login}
          </button>
          <button className="text-sm font-medium bg-accent text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            {t.nav.addCompany}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LangSwitcher lang={lang} setLang={setLang} />
          <button className="p-2" onClick={() => setOpen(!open)}>
            <Icon name={open ? "X" : "Menu"} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <button
              key={l.page}
              onClick={() => { onNav(l.page); setOpen(false); }}
              className="text-sm font-medium text-left py-2 border-b border-border last:border-0"
            >
              {l.label}
            </button>
          ))}
          <button onClick={() => { onNav("messages"); setOpen(false); }} className="text-sm font-medium text-left py-2">
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
    <div className="card-hover bg-white border border-border rounded p-5 cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-navy-900 rounded flex items-center justify-center text-white font-bold text-lg">
          {meta.avatar}
        </div>
        {meta.verified && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <Icon name="BadgeCheck" size={14} />
            {t.card.verified}
          </div>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{data.name}</h3>
      <p className="text-xs text-accent font-medium mb-2">{data.category}</p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{data.description}</p>
      <div className="flex items-center gap-3 mb-4">
        <StarRating rating={meta.rating} />
        <span className="text-sm font-semibold text-foreground">{meta.rating}</span>
        <span className="text-xs text-muted-foreground">({meta.reviews} {t.card.reviews})</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {data.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">{tag}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1"><Icon name="MapPin" size={12} />{data.location}</span>
        <span className="flex items-center gap-1"><Icon name="Calendar" size={12} />{t.card.since} {meta.since}</span>
      </div>
    </div>
  );
}

function HomePage({ onNav, t }: { onNav: (p: Page) => void; t: Translation }) {
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
      <section className="relative bg-navy-900 text-white overflow-hidden min-h-[580px] flex items-center">
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6 animate-fade-in-up animate-fade-in-up-delay-1">
              <div className="h-px w-8 bg-accent" />
              <span className="text-sm font-medium text-blue-300 uppercase tracking-widest">{t.hero.tag}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 font-ibm animate-fade-in-up animate-fade-in-up-delay-2">
              {t.hero.title1}<br />
              <span className="text-blue-300">{t.hero.title2}</span>
            </h1>
            <p className="text-lg text-blue-100/80 mb-10 max-w-xl leading-relaxed animate-fade-in-up animate-fade-in-up-delay-3">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-fade-in-up-delay-4">
              <button onClick={() => onNav("catalog")} className="bg-accent hover:bg-blue-500 text-white font-medium px-8 py-3 rounded text-sm transition-colors flex items-center gap-2 justify-center">
                {t.hero.findSupplier} <Icon name="ArrowRight" size={16} />
              </button>
              <button className="border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
                {t.hero.placeCompany}
              </button>
            </div>
          </div>
          <div className="flex gap-12 mt-16 animate-fade-in-up animate-fade-in-up-delay-4">
            {[
              { value: "2 400+", label: t.hero.stat1Label },
              { value: "18 000+", label: t.hero.stat2Label },
              { value: "96%", label: t.hero.stat3Label },
            ].map((s, i) => (
              <div key={i} className={`${i > 0 ? "stat-divider pl-12" : ""}`}>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-blue-200/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.search.placeholder} className="w-full pl-10 pr-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <select className="px-3 py-2.5 border border-border rounded text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30">
              {t.catalog.categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => onNav("catalog")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">
              {t.search.find}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.directionsTag}</p>
            <h2 className="text-2xl font-bold text-foreground font-ibm">{t.sections.directionsTitle}</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="text-sm text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
            {t.sections.allCategories} <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {catIcons.map((cat) => (
            <button key={cat.label} onClick={() => onNav("catalog")} className="card-hover bg-white border border-border rounded p-5 text-center flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <Icon name={cat.icon} size={22} className="text-accent" fallback="Box" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{cat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{cat.count} {t.cats.companies}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.bestTag}</p>
              <h2 className="text-2xl font-bold font-ibm">{t.sections.bestTitle}</h2>
            </div>
            <button onClick={() => onNav("catalog")} className="text-sm text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
              {t.sections.allSuppliers} <Icon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <SupplierCard key={i} idx={i} t={t} onView={() => onNav("supplier")} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.sections.simpleTag}</p>
          <h2 className="text-2xl font-bold font-ibm">{t.sections.simpleTitle}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map((item, i) => (
            <div key={i}>
              <div className="text-6xl font-bold text-border/60 font-ibm leading-none mb-4">{String(i + 1).padStart(2, "0")}</div>
              <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center mb-4">
                <Icon name={stepIcons[i]} size={20} className="text-accent" fallback="Star" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold font-ibm mb-4">{t.sections.ctaTitle}</h2>
          <p className="text-blue-200/80 mb-8 max-w-lg mx-auto">{t.sections.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNav("catalog")} className="bg-accent hover:bg-blue-500 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
              {t.hero.findSupplier}
            </button>
            <button className="border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
              {t.sections.becomeSupplier}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CatalogPage({ onViewSupplier, t }: { onViewSupplier: () => void; t: Translation }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(t.catalog.categories[0]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-ibm mb-2">{t.catalog.title}</h1>
        <p className="text-muted-foreground">{t.catalog.foundCount(baseSuppliers.length)}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-border rounded p-5 mb-4">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.searchTitle}</h3>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.catalog.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
          </div>

          <div className="bg-white border border-border rounded p-5 mb-4">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.categoriesTitle}</h3>
            <div className="flex flex-col gap-1">
              {t.catalog.categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-sm text-left px-3 py-2 rounded transition-colors ${activeCategory === cat ? "bg-accent text-white font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded p-5">
            <h3 className="font-semibold mb-4 text-sm">{t.catalog.filtersTitle}</h3>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent" defaultChecked />
              <span>{t.catalog.onlyVerified}</span>
            </label>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent" />
              <span>{t.catalog.ratingPlus}</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-accent" />
              <span>{t.catalog.sinceFilter}</span>
            </label>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-muted-foreground">{filtered.length} {t.catalog.companies}</span>
            <select className="text-sm border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option>{t.catalog.sortRating}</option>
              <option>{t.catalog.sortReviews}</option>
              <option>{t.catalog.sortName}</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <Icon name="ArrowLeft" size={16} />
        {t.profile.back}
      </button>

      <div className="bg-white border border-border rounded mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-navy-900 to-navy-700 relative">
          <div className="absolute bottom-0 left-6 translate-y-1/2 w-20 h-20 bg-white border-4 border-white rounded shadow-lg flex items-center justify-center text-navy-900 font-bold text-2xl">
            {meta.avatar}
          </div>
        </div>
        <div className="pt-14 pb-6 px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-ibm">{data.name}</h1>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <Icon name="BadgeCheck" size={16} />
                {t.profile.verified}
              </div>
            </div>
            <p className="text-accent font-medium mb-2">{data.category}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Icon name="MapPin" size={14} />{data.location}</span>
              <span className="flex items-center gap-1"><Icon name="Calendar" size={14} />{t.profile.since} {meta.since} {t.profile.year}</span>
              <span className="flex items-center gap-1"><Icon name="Users" size={14} />{t.profile.employees}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onMessage} className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-blue-500 transition-colors">
              <Icon name="MessageSquare" size={16} />
              {t.profile.message}
            </button>
            <button className="flex items-center gap-2 border border-border px-5 py-2.5 rounded text-sm font-medium hover:bg-secondary transition-colors">
              <Icon name="Phone" size={16} />
              {t.profile.contacts}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: t.profile.stats.rating, value: "4.8", icon: "Star" },
          { label: t.profile.stats.reviews, value: "127", icon: "MessageSquare" },
          { label: t.profile.stats.deals, value: "1 840", icon: "Handshake" },
          { label: t.profile.stats.years, value: "11", icon: "TrendingUp" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={stat.icon} size={16} className="text-accent" fallback="Info" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold font-ibm">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded overflow-hidden">
        <div className="flex border-b border-border">
          {(["about", "reviews", "contacts"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"}`}>
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
                  <div key={cert} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 rounded font-medium">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactsList.map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-secondary rounded flex items-center justify-center flex-shrink-0">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold font-ibm mb-6">{t.messages.title}</h1>
      <div className="bg-white border border-border rounded overflow-hidden flex h-[600px]">
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder={t.messages.searchPlaceholder} className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatList.map((m) => (
              <button key={m.id} onClick={() => setActiveChat(m)}
                className={`w-full text-left p-4 border-b border-border transition-colors ${activeChat.id === m.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-secondary/50"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-navy-900 text-white rounded-full flex items-center justify-center text-xs font-bold">{m.avatar}</div>
                    <span className="text-sm font-medium">{m.from}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.unread > 0 && <span className="w-5 h-5 bg-accent text-white rounded-full text-xs flex items-center justify-center font-medium">{m.unread}</span>}
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{m.text}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-navy-900 text-white rounded-full flex items-center justify-center text-sm font-bold">{activeChat.avatar}</div>
              <div>
                <div className="font-medium text-sm">{activeChat.from}</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {t.messages.online}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-secondary rounded transition-colors"><Icon name="Phone" size={16} className="text-muted-foreground" /></button>
              <button className="p-2 hover:bg-secondary rounded transition-colors"><Icon name="MoreVertical" size={16} className="text-muted-foreground" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary/20">
            {conversation.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded text-sm ${msg.from === "me" ? "bg-accent text-white" : "bg-white border border-border text-foreground"}`}>
                  <p>{msg.text}</p>
                  <div className={`text-xs mt-1 ${msg.from === "me" ? "text-blue-200" : "text-muted-foreground"}`}>{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input type="text" placeholder={t.messages.inputPlaceholder} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                className="flex-1 border border-border rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              <button onClick={send} className="bg-accent hover:bg-blue-500 text-white px-4 py-2.5 rounded text-sm font-medium transition-colors">
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogPage({ t }: { t: Translation }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.blog.tag}</p>
        <h1 className="text-3xl font-bold font-ibm">{t.blog.title}</h1>
        <p className="text-muted-foreground mt-2">{t.blog.subtitle}</p>
      </div>

      <div className="bg-navy-900 text-white rounded p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 hero-grid" />
        <span className="text-xs font-medium uppercase tracking-widest text-blue-300 bg-blue-900/50 px-3 py-1 rounded mb-4 inline-block">{t.blog.featuredCategory}</span>
        <h2 className="text-2xl font-bold font-ibm max-w-xl mb-4">{t.blog.featuredTitle}</h2>
        <p className="text-blue-200/80 max-w-lg mb-6 text-sm leading-relaxed">{t.blog.featuredExcerpt}</p>
        <div className="flex items-center gap-4 text-sm text-blue-300">
          <span>{t.blog.featuredDate}</span>
          <span>•</span>
          <span>{t.blog.readMin(8)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {t.blogPosts.map((post, i) => (
          <div key={i} className="card-hover bg-white border border-border rounded overflow-hidden cursor-pointer">
            <div className="h-40 bg-gradient-to-br from-navy-800 to-navy-600 flex items-center justify-center">
              <Icon name="FileText" size={40} className="text-white/20" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">{post.category}</span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <button className="text-xs text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
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

function ContactsPage({ t }: { t: Translation }) {
  const contactIcons = ["Phone", "Mail", "MessageSquare", "MapPin"];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.contacts.tag}</p>
        <h1 className="text-3xl font-bold font-ibm">{t.contacts.title}</h1>
        <p className="text-muted-foreground mt-2">{t.contacts.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded p-8">
            <h2 className="font-semibold text-lg mb-6">{t.contacts.formTitle}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.contacts.name}</label>
                  <input type="text" placeholder={t.contacts.namePh} className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.contacts.company}</label>
                  <input type="text" placeholder={t.contacts.companyPh} className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.contacts.email}</label>
                <input type="email" placeholder={t.contacts.emailPh} className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.contacts.topic}</label>
                <select className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                  {t.contacts.topics.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">{t.contacts.message}</label>
                <textarea rows={5} placeholder={t.contacts.messagePh} className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none" />
              </div>
              <button className="bg-accent text-white px-6 py-3 rounded text-sm font-medium hover:bg-blue-500 transition-colors">
                {t.contacts.submit}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {t.contacts.contactCards.map((c, i) => (
            <div key={c.title} className="bg-white border border-border rounded p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center flex-shrink-0">
                <Icon name={contactIcons[i]} size={18} className="text-accent" fallback="Info" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">{c.title}</div>
                <div className="font-medium text-sm">{c.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
              </div>
            </div>
          ))}

          <div className="bg-navy-900 text-white rounded p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="HelpCircle" size={18} className="text-blue-300" />
              <span className="font-semibold text-sm">{t.contacts.kbTitle}</span>
            </div>
            <p className="text-xs text-blue-200/80 mb-4">{t.contacts.kbText}</p>
            <button className="text-xs text-blue-300 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              {t.contacts.kbLink} <Icon name="ArrowRight" size={12} />
            </button>
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
    <footer className="bg-navy-950 text-blue-200/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center text-white text-sm font-bold">P</span>
              <span className="font-bold text-white font-ibm">{t.brand}</span>
            </div>
            <p className="text-xs leading-relaxed">{t.footer.desc}</p>
          </div>
          {t.footer.cols.map((col, ci) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
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
    </footer>
  );
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [lang, setLang] = useState<Lang>("ru");
  const t = translations[lang];

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-ibm">
      <Navbar current={page} onNav={navigate} lang={lang} setLang={setLang} t={t} />
      <main className="flex-1">
        {page === "home" && <HomePage onNav={navigate} t={t} />}
        {page === "catalog" && <CatalogPage onViewSupplier={() => navigate("supplier")} t={t} />}
        {page === "supplier" && <SupplierProfilePage onBack={() => navigate("catalog")} onMessage={() => navigate("messages")} t={t} />}
        {page === "messages" && <MessagesPage t={t} />}
        {page === "blog" && <BlogPage t={t} />}
        {page === "contacts" && <ContactsPage t={t} />}
      </main>
      <Footer onNav={navigate} t={t} />
    </div>
  );
}
