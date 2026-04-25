import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/8f6e0248-9eef-44c9-b7df-4a2c56853a70/files/84c5569f-5d72-4607-9942-6fd7f5ed1dfd.jpg";

type Page = "home" | "catalog" | "supplier" | "blog" | "contacts" | "messages";

const suppliers = [
  {
    id: 1,
    name: "ТехноПоставка",
    category: "Промышленное оборудование",
    verified: true,
    rating: 4.8,
    reviews: 127,
    since: 2015,
    location: "Москва",
    description: "Поставки промышленного оборудования и запчастей для производственных предприятий.",
    tags: ["Оборудование", "Запчасти", "Сервис"],
  },
  {
    id: 2,
    name: "АгроХим Групп",
    category: "Химическое сырьё",
    verified: true,
    rating: 4.6,
    reviews: 89,
    since: 2012,
    location: "Санкт-Петербург",
    description: "Оптовые поставки химического сырья и реагентов для промышленности и сельского хозяйства.",
    tags: ["Химия", "Оптом", "Сертифицировано"],
  },
  {
    id: 3,
    name: "СтройМатериалы Про",
    category: "Строительные материалы",
    verified: false,
    rating: 4.3,
    reviews: 54,
    since: 2018,
    location: "Екатеринбург",
    description: "Строительные и отделочные материалы от производителей без посредников.",
    tags: ["Стройматериалы", "Прямой импорт"],
  },
  {
    id: 4,
    name: "ЛогистикСервис",
    category: "Логистика и склад",
    verified: true,
    rating: 4.9,
    reviews: 203,
    since: 2010,
    location: "Москва",
    description: "Комплексные логистические решения: хранение, перевозка, таможенное оформление.",
    tags: ["Логистика", "Склад", "Таможня"],
  },
  {
    id: 5,
    name: "ИТ Решения",
    category: "IT и программное обеспечение",
    verified: true,
    rating: 4.7,
    reviews: 76,
    since: 2016,
    location: "Новосибирск",
    description: "Лицензионное ПО, серверное оборудование, корпоративные IT-решения под ключ.",
    tags: ["IT", "Лицензии", "Интеграция"],
  },
  {
    id: 6,
    name: "МедТехника",
    category: "Медицинское оборудование",
    verified: true,
    rating: 4.5,
    reviews: 41,
    since: 2019,
    location: "Казань",
    description: "Медицинское оборудование, расходные материалы и техническое обслуживание.",
    tags: ["Медицина", "Сертифицировано", "Сервис"],
  },
];

const reviewsData = [
  { author: "Алексей Морозов", company: "ПромСталь ОАО", rating: 5, date: "12.03.2026", text: "Работаем уже 3 года. Качество продукции всегда на высоте, сроки соблюдаются. Рекомендуем как надёжного партнёра." },
  { author: "Марина Соколова", company: "АгроИнвест", rating: 4, date: "05.02.2026", text: "Хорошее соотношение цена-качество. Документация оформляется корректно, менеджер всегда на связи." },
  { author: "Дмитрий Павлов", company: "СтройГрупп", rating: 5, date: "18.01.2026", text: "Лучший поставщик с которым работали. Договорились об индивидуальных условиях поставки, всё выполнили." },
];

const blogPosts = [
  {
    id: 1,
    date: "22 апреля 2026",
    category: "Аналитика",
    title: "Тренды B2B-рынка в 2026 году: что изменилось и как адаптироваться",
    excerpt: "Цифровизация цепочек поставок, рост требований к ESG и новые инструменты автоматизации — разбираем ключевые изменения рынка.",
    readTime: "8 мин",
  },
  {
    id: 2,
    date: "15 апреля 2026",
    category: "Практика",
    title: "Как правильно выбрать поставщика: чек-лист для закупщика",
    excerpt: "Проверка репутации, анализ финансовой устойчивости, переговоры об условиях — подробное руководство по due diligence поставщика.",
    readTime: "6 мин",
  },
  {
    id: 3,
    date: "08 апреля 2026",
    category: "Право",
    title: "Договор поставки: 10 пунктов, которые защитят ваш бизнес",
    excerpt: "Штрафные санкции, форс-мажор, ответственность сторон — юридические аспекты, которые нельзя упускать при заключении договора.",
    readTime: "5 мин",
  },
];

const chatMessages = [
  { id: 1, from: "ТехноПоставка", avatar: "ТП", time: "14:32", text: "Добрый день! Готовы обсудить условия поставки оборудования для вашего проекта.", unread: 2 },
  { id: 2, from: "АгроХим Групп", avatar: "АХ", time: "11:15", text: "Подготовили коммерческое предложение по вашему запросу. Направляем на ваш email.", unread: 0 },
  { id: 3, from: "ЛогистикСервис", avatar: "ЛС", time: "Вчера", text: "Партия товара отправлена, трек-номер в приложении к этому сообщению.", unread: 0 },
];

const categories = ["Все", "Оборудование", "Химия", "Строительство", "Логистика", "IT", "Медицина"];

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

function Navbar({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  const [open, setOpen] = useState(false);
  const links: { label: string; page: Page }[] = [
    { label: "Главная", page: "home" },
    { label: "Каталог", page: "catalog" },
    { label: "Блог", page: "blog" },
    { label: "Контакты", page: "contacts" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => onNav("home")} className="flex items-center gap-2 font-bold text-xl text-navy-800 tracking-tight font-ibm">
          <span className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center text-white text-sm font-bold">P</span>
          ProSupply
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
          <button
            onClick={() => onNav("messages")}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="MessageSquare" size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>
          <button className="text-sm font-medium text-foreground px-4 py-2 border border-border rounded hover:bg-secondary transition-colors">
            Войти
          </button>
          <button className="text-sm font-medium bg-accent text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Разместить компанию
          </button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          <Icon name={open ? "X" : "Menu"} size={22} />
        </button>
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
            Сообщения
          </button>
        </div>
      )}
    </header>
  );
}

function SupplierCard({ supplier, onView }: { supplier: typeof suppliers[0]; onView: () => void }) {
  return (
    <div className="card-hover bg-white border border-border rounded p-5 cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-navy-900 rounded flex items-center justify-center text-white font-bold text-lg">
          {supplier.name.slice(0, 2)}
        </div>
        {supplier.verified && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <Icon name="BadgeCheck" size={14} />
            Верифицирован
          </div>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{supplier.name}</h3>
      <p className="text-xs text-accent font-medium mb-2">{supplier.category}</p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{supplier.description}</p>
      <div className="flex items-center gap-3 mb-4">
        <StarRating rating={supplier.rating} />
        <span className="text-sm font-semibold text-foreground">{supplier.rating}</span>
        <span className="text-xs text-muted-foreground">({supplier.reviews} отзывов)</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {supplier.tags.map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 rounded font-medium bg-blue-50 text-blue-700 border border-blue-200">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1"><Icon name="MapPin" size={12} />{supplier.location}</span>
        <span className="flex items-center gap-1"><Icon name="Calendar" size={12} />С {supplier.since}</span>
      </div>
    </div>
  );
}

function HomePage({ onNav }: { onNav: (p: Page) => void }) {
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
              <span className="text-sm font-medium text-blue-300 uppercase tracking-widest">B2B Платформа</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 font-ibm animate-fade-in-up animate-fade-in-up-delay-2">
              Надёжные поставщики<br />
              <span className="text-blue-300">для вашего бизнеса</span>
            </h1>
            <p className="text-lg text-blue-100/80 mb-10 max-w-xl leading-relaxed animate-fade-in-up animate-fade-in-up-delay-3">
              Верифицированные компании, прозрачные рейтинги, прямая переписка — всё для эффективных B2B-сделок.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animate-fade-in-up-delay-4">
              <button onClick={() => onNav("catalog")} className="bg-accent hover:bg-blue-500 text-white font-medium px-8 py-3 rounded text-sm transition-colors flex items-center gap-2 justify-center">
                Найти поставщика <Icon name="ArrowRight" size={16} />
              </button>
              <button className="border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
                Разместить компанию
              </button>
            </div>
          </div>
          <div className="flex gap-12 mt-16 animate-fade-in-up animate-fade-in-up-delay-4">
            {[{ value: "2 400+", label: "поставщиков" }, { value: "18 000+", label: "сделок закрыто" }, { value: "96%", label: "довольных клиентов" }].map((s, i) => (
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
              <input type="text" placeholder="Поиск поставщика, услуги или категории..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
            <select className="px-3 py-2.5 border border-border rounded text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option>Все категории</option>
              <option>Оборудование</option>
              <option>Химия</option>
              <option>Строительство</option>
              <option>Логистика</option>
              <option>IT</option>
            </select>
            <button onClick={() => onNav("catalog")} className="bg-primary text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">
              Найти
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Направления</p>
            <h2 className="text-2xl font-bold text-foreground font-ibm">Категории поставщиков</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="text-sm text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Все категории <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: "Cpu", label: "Оборудование", count: 412 },
            { icon: "FlaskConical", label: "Химия", count: 187 },
            { icon: "Building2", label: "Строительство", count: 354 },
            { icon: "Truck", label: "Логистика", count: 298 },
            { icon: "Monitor", label: "IT & Технологии", count: 231 },
            { icon: "Stethoscope", label: "Медицина", count: 143 },
          ].map((cat) => (
            <button key={cat.label} onClick={() => onNav("catalog")} className="card-hover bg-white border border-border rounded p-5 text-center flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <Icon name={cat.icon} size={22} className="text-accent" fallback="Box" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{cat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{cat.count} компаний</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Лучшие</p>
              <h2 className="text-2xl font-bold font-ibm">Топ поставщиков</h2>
            </div>
            <button onClick={() => onNav("catalog")} className="text-sm text-accent font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Все поставщики <Icon name="ArrowRight" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.slice(0, 3).map((s) => (
              <SupplierCard key={s.id} supplier={s} onView={() => onNav("supplier")} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Просто</p>
          <h2 className="text-2xl font-bold font-ibm">Как работает платформа</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", icon: "Search", title: "Поиск", text: "Найдите поставщика по категории, региону или ключевым словам" },
            { step: "02", icon: "ShieldCheck", title: "Верификация", text: "Все компании проходят проверку документов и репутации" },
            { step: "03", icon: "MessageSquare", title: "Переписка", text: "Свяжитесь напрямую и обсудите условия сотрудничества" },
            { step: "04", icon: "Handshake", title: "Сделка", text: "Заключите договор и оцените партнёра после сотрудничества" },
          ].map((item) => (
            <div key={item.step}>
              <div className="text-6xl font-bold text-border/60 font-ibm leading-none mb-4">{item.step}</div>
              <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center mb-4">
                <Icon name={item.icon} size={20} className="text-accent" fallback="Star" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold font-ibm mb-4">Готовы найти надёжного поставщика?</h2>
          <p className="text-blue-200/80 mb-8 max-w-lg mx-auto">Присоединяйтесь к тысячам компаний, которые уже нашли своих партнёров на ProSupply</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNav("catalog")} className="bg-accent hover:bg-blue-500 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
              Найти поставщика
            </button>
            <button className="border border-white/30 hover:border-white/60 text-white font-medium px-8 py-3 rounded text-sm transition-colors">
              Стать поставщиком
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CatalogPage({ onViewSupplier }: { onViewSupplier: () => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");

  const filtered = suppliers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "Все" || s.tags.some((t) => t.includes(activeCategory)) || s.category.includes(activeCategory);
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-ibm mb-2">Каталог поставщиков</h1>
        <p className="text-muted-foreground">Найдено {suppliers.length} верифицированных компаний</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white border border-border rounded p-5 mb-4">
            <h3 className="font-semibold mb-4 text-sm">Поиск</h3>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Название, услуга..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
            </div>
          </div>

          <div className="bg-white border border-border rounded p-5 mb-4">
            <h3 className="font-semibold mb-4 text-sm">Категории</h3>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-sm text-left px-3 py-2 rounded transition-colors ${activeCategory === cat ? "bg-accent text-white font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded p-5">
            <h3 className="font-semibold mb-4 text-sm">Фильтры</h3>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent" defaultChecked />
              <span>Только верифицированные</span>
            </label>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" className="accent-accent" />
              <span>Рейтинг 4.5+</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="accent-accent" />
              <span>Работают с 2015</span>
            </label>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-muted-foreground">{filtered.length} компаний</span>
            <select className="text-sm border border-border rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30">
              <option>По рейтингу</option>
              <option>По отзывам</option>
              <option>По алфавиту</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map((s) => (
              <SupplierCard key={s.id} supplier={s} onView={onViewSupplier} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierProfilePage({ onBack, onMessage }: { onBack: () => void; onMessage: () => void }) {
  const supplier = suppliers[0];
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "contacts">("about");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <Icon name="ArrowLeft" size={16} />
        Назад в каталог
      </button>

      <div className="bg-white border border-border rounded mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-navy-900 to-navy-700 relative">
          <div className="absolute bottom-0 left-6 translate-y-1/2 w-20 h-20 bg-white border-4 border-white rounded shadow-lg flex items-center justify-center text-navy-900 font-bold text-2xl">
            ТП
          </div>
        </div>
        <div className="pt-14 pb-6 px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-ibm">{supplier.name}</h1>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                <Icon name="BadgeCheck" size={16} />
                Верифицирован
              </div>
            </div>
            <p className="text-accent font-medium mb-2">{supplier.category}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Icon name="MapPin" size={14} />{supplier.location}</span>
              <span className="flex items-center gap-1"><Icon name="Calendar" size={14} />С {supplier.since} года</span>
              <span className="flex items-center gap-1"><Icon name="Users" size={14} />250–500 сотрудников</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onMessage} className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded text-sm font-medium hover:bg-blue-500 transition-colors">
              <Icon name="MessageSquare" size={16} />
              Написать
            </button>
            <button className="flex items-center gap-2 border border-border px-5 py-2.5 rounded text-sm font-medium hover:bg-secondary transition-colors">
              <Icon name="Phone" size={16} />
              Контакты
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Рейтинг", value: "4.8", icon: "Star" },
          { label: "Отзывов", value: "127", icon: "MessageSquare" },
          { label: "Сделок", value: "1 840", icon: "Handshake" },
          { label: "Лет на рынке", value: "11", icon: "TrendingUp" },
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
              {tab === "about" ? "О компании" : tab === "reviews" ? `Отзывы (${reviewsData.length})` : "Контакты"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "about" && (
            <div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                ТехноПоставка — ведущий поставщик промышленного оборудования и запасных частей на российском рынке. С 2015 года мы работаем с крупнейшими производственными предприятиями страны, обеспечивая бесперебойные поставки и техническое сопровождение.
              </p>
              <h3 className="font-semibold mb-4">Основные направления</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {["Поставка промышленного оборудования", "Запасные части и расходники", "Техническое обслуживание", "Проектирование и монтаж", "Гарантийный сервис", "Обучение персонала"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              <h3 className="font-semibold mb-4">Сертификаты и лицензии</h3>
              <div className="flex flex-wrap gap-2">
                {["ISO 9001:2015", "ИСО 14001", "ГОСТ Р ИСО 9001", "Ростехнадзор"].map((cert) => (
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
              {reviewsData.map((r, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-5 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{r.author}</div>
                      <div className="text-xs text-muted-foreground">{r.company}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: "Phone", label: "Телефон", value: "+7 (495) 123-45-67" },
                { icon: "Mail", label: "Email", value: "info@techno-supply.ru" },
                { icon: "Globe", label: "Сайт", value: "techno-supply.ru" },
                { icon: "MapPin", label: "Адрес", value: "Москва, ул. Промышленная, 15" },
              ].map((c) => (
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

function MessagesPage() {
  const [activeChat, setActiveChat] = useState(chatMessages[0]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([
    { from: "them", text: "Добрый день! Готовы обсудить условия поставки оборудования для вашего проекта.", time: "14:32" },
    { from: "me", text: "Добрый день! Интересует поставка токарных станков, объём около 10 единиц.", time: "14:35" },
    { from: "them", text: "Отлично, у нас есть несколько подходящих моделей. Подготовим коммерческое предложение в течение дня.", time: "14:38" },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setConversation((prev) => [...prev, { from: "me", text: input, time: "сейчас" }]);
    setInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <h1 className="text-3xl font-bold font-ibm mb-6">Сообщения</h1>
      <div className="bg-white border border-border rounded overflow-hidden flex h-[600px]">
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Поиск..." className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatMessages.map((m) => (
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
                  Онлайн
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
              <input type="text" placeholder="Введите сообщение..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
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

function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Экспертиза</p>
        <h1 className="text-3xl font-bold font-ibm">Деловой блог</h1>
        <p className="text-muted-foreground mt-2">Аналитика, практические советы и правовые аспекты B2B-рынка</p>
      </div>

      <div className="bg-navy-900 text-white rounded p-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10 hero-grid" />
        <span className="text-xs font-medium uppercase tracking-widest text-blue-300 bg-blue-900/50 px-3 py-1 rounded mb-4 inline-block">Аналитика</span>
        <h2 className="text-2xl font-bold font-ibm max-w-xl mb-4">Тренды B2B-рынка в 2026 году: что изменилось и как адаптироваться</h2>
        <p className="text-blue-200/80 max-w-lg mb-6 text-sm leading-relaxed">Цифровизация цепочек поставок, рост требований к ESG и новые инструменты автоматизации — разбираем ключевые изменения рынка.</p>
        <div className="flex items-center gap-4 text-sm text-blue-300">
          <span>22 апреля 2026</span>
          <span>•</span>
          <span>8 мин чтения</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <div key={post.id} className="card-hover bg-white border border-border rounded overflow-hidden cursor-pointer">
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
                  Читать <Icon name="ArrowRight" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Поддержка</p>
        <h1 className="text-3xl font-bold font-ibm">Контакты и поддержка</h1>
        <p className="text-muted-foreground mt-2">Мы на связи в рабочие дни с 9:00 до 18:00 МСК</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded p-8">
            <h2 className="font-semibold text-lg mb-6">Написать в поддержку</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Имя</label>
                  <input type="text" placeholder="Иван Петров" className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Компания</label>
                  <input type="text" placeholder="ООО Название" className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" placeholder="email@company.ru" className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Тема обращения</label>
                <select className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option>Техническая поддержка</option>
                  <option>Верификация компании</option>
                  <option>Вопрос по тарифам</option>
                  <option>Другое</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Сообщение</label>
                <textarea rows={5} placeholder="Опишите ваш вопрос..." className="w-full border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none" />
              </div>
              <button className="bg-accent text-white px-6 py-3 rounded text-sm font-medium hover:bg-blue-500 transition-colors">
                Отправить обращение
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: "Phone", title: "Телефон", value: "+7 (800) 555-01-23", sub: "Бесплатно по России" },
            { icon: "Mail", title: "Email", value: "support@prosupply.ru", sub: "Ответ в течение 24 часов" },
            { icon: "MessageSquare", title: "Чат", value: "В личном кабинете", sub: "Будни 9:00–18:00 МСК" },
            { icon: "MapPin", title: "Адрес", value: "Москва, Пресненская наб. 8", sub: "БЦ «Москва-Сити»" },
          ].map((c) => (
            <div key={c.title} className="bg-white border border-border rounded p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center flex-shrink-0">
                <Icon name={c.icon} size={18} className="text-accent" fallback="Info" />
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
              <span className="font-semibold text-sm">База знаний</span>
            </div>
            <p className="text-xs text-blue-200/80 mb-4">Ответы на часто задаваемые вопросы и инструкции для пользователей платформы.</p>
            <button className="text-xs text-blue-300 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Перейти в базу знаний <Icon name="ArrowRight" size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-navy-950 text-blue-200/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center text-white text-sm font-bold">P</span>
              <span className="font-bold text-white font-ibm">ProSupply</span>
            </div>
            <p className="text-xs leading-relaxed">Профессиональная платформа для B2B-сотрудничества и поиска проверенных поставщиков.</p>
          </div>
          {[
            { title: "Платформа", links: [{ l: "Главная", p: "home" as Page }, { l: "Каталог", p: "catalog" as Page }, { l: "Блог", p: "blog" as Page }] },
            { title: "Компаниям", links: [{ l: "Разместить компанию", p: "contacts" as Page }, { l: "Верификация", p: "contacts" as Page }, { l: "Тарифы", p: "contacts" as Page }] },
            { title: "Поддержка", links: [{ l: "Контакты", p: "contacts" as Page }, { l: "База знаний", p: "contacts" as Page }, { l: "Сообщения", p: "messages" as Page }] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((item) => (
                  <li key={item.l}>
                    <button onClick={() => onNav(item.p)} className="text-xs hover:text-white transition-colors">{item.l}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <span>© 2026 ProSupply. Все права защищены.</span>
          <div className="flex gap-4">
            <button className="hover:text-white transition-colors">Политика конфиденциальности</button>
            <button className="hover:text-white transition-colors">Условия использования</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-ibm">
      <Navbar current={page} onNav={navigate} />
      <main className="flex-1">
        {page === "home" && <HomePage onNav={navigate} />}
        {page === "catalog" && <CatalogPage onViewSupplier={() => navigate("supplier")} />}
        {page === "supplier" && <SupplierProfilePage onBack={() => navigate("catalog")} onMessage={() => navigate("messages")} />}
        {page === "messages" && <MessagesPage />}
        {page === "blog" && <BlogPage />}
        {page === "contacts" && <ContactsPage />}
      </main>
      <Footer onNav={navigate} />
    </div>
  );
}