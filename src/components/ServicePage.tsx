import Icon from "@/components/ui/icon";
import type { Translation } from "@/lib/i18n";

const SERVICE_DETAILS: Record<string, {
  hero: string;
  features: { icon: string; title: string; text: string }[];
  steps: { title: string; text: string }[];
  faq: { q: string; a: string }[];
}> = {
  Taobao: {
    hero: "Выкупаем товары с Taobao и 1688 под ключ: поиск, проверка продавца, оплата в юанях, консолидация на складе в Китае и доставка к вам. Экономия до 50% против покупки через посредников.",
    features: [
      { icon: "Search", title: "Поиск товара", text: "Найдём нужный артикул на Taobao/1688 или подберём аналог дешевле." },
      { icon: "ShieldCheck", title: "Проверка продавца", text: "Рейтинг магазина, отзывы, выкуп образца перед крупным заказом." },
      { icon: "Wallet", title: "Оплата в юанях", text: "Платим продавцу напрямую через Alipay — без скрытых комиссий." },
      { icon: "Package", title: "Консолидация", text: "Принимаем все посылки на складе в Китае и отправляем одним грузом." },
    ],
    steps: [
      { title: "Заявка", text: "Присылаете ссылки на товары или ТЗ — считаем итоговую стоимость." },
      { title: "Выкуп", text: "Оплачиваем продавцам и контролируем отправку на наш склад." },
      { title: "Проверка", text: "Сверяем количество, проверяем качество, фотоотчёт по запросу." },
      { title: "Доставка", text: "Отправляем в Россию авто/авиа/ж/д с растаможкой под ключ." },
    ],
    faq: [
      { q: "Какая комиссия за выкуп?", a: "От 5% от суммы заказа — итоговый процент зависит от объёма и сложности." },
      { q: "Можно ли заказать один товар?", a: "Да, работаем как с разовыми покупками, так и с регулярными оптовыми заказами." },
      { q: "Что если товар придёт бракованный?", a: "Делаем фотоотчёт перед отправкой — брак возвращаем продавцу за наш счёт." },
    ],
  },
  Search: {
    hero: "Полный цикл подбора надёжного поставщика — от брифа до подписания контракта. Анализируем рынок, проверяем компании по 30+ критериям и предлагаем 3–5 лучших вариантов под ваши требования.",
    features: [
      { icon: "Target", title: "Точный подбор", text: "Поставщики строго под ваш ассортимент, объёмы и бюджет." },
      { icon: "ShieldCheck", title: "Только проверенные", text: "Юридический и финансовый чек каждой компании." },
      { icon: "Clock", title: "Срок 5–10 дней", text: "От первого брифа до коммерческих предложений на руках." },
      { icon: "Users", title: "Личный менеджер", text: "Сопровождение на всех этапах: переговоры, образцы, контракт." },
    ],
    steps: [
      { title: "Бриф и анализ", text: "Уточняем требования, объёмы, ценовой коридор и сроки." },
      { title: "Поиск и отбор", text: "Сканируем рынок, выбираем 15–20 кандидатов, проверяем 5–7." },
      { title: "Презентация", text: "Получаете подборку с КП, образцами и характеристиками." },
      { title: "Сделка", text: "Помогаем согласовать договор и провести первую отгрузку." },
    ],
    faq: [
      { q: "Сколько стоит услуга?", a: "Стоимость рассчитывается индивидуально и зависит от категории товара и сложности подбора." },
      { q: "А если не подойдут варианты?", a: "Мы продолжаем поиск до тех пор, пока вы не выберете поставщика — это входит в стоимость." },
      { q: "Работаете с любыми категориями?", a: "Да: электроника, одежда, оборудование, продукты питания, стройматериалы и многое другое." },
    ],
  },
  WeChat: {
    hero: "Находим проверенных продавцов копий известных брендов в WeChat. Прямые контакты с поставщиками, переговоры на китайском, проверка качества образцов и безопасный выкуп товара.",
    features: [
      { icon: "Search", title: "Поиск контактов", text: "Подберём активных продавцов копий по нужной категории и бренду." },
      { icon: "MessageSquare", title: "Переговоры", text: "Общаемся с продавцом на китайском, торгуемся за лучшую цену." },
      { icon: "ShieldCheck", title: "Проверка", text: "Запрашиваем фото/видео товара, выкупаем образец перед оптом." },
      { icon: "Package", title: "Выкуп и доставка", text: "Оплата продавцу и отправка через наш склад в Китае." },
    ],
    steps: [
      { title: "Бриф", text: "Уточняем бренды, модели, объём и бюджет." },
      { title: "Контакты", text: "Находим 3–5 проверенных WeChat-продавцов под задачу." },
      { title: "Образец", text: "Выкупаем образец, делаем фотоотчёт и проверку качества." },
      { title: "Заказ", text: "Оплачиваем партию, консолидируем и отправляем к вам." },
    ],
    faq: [
      { q: "Это легально?", a: "Услуга — поиск контактов и логистика. Ответственность за выбор товара и его ввоз лежит на заказчике." },
      { q: "Какие бренды можно найти?", a: "Одежда, обувь, аксессуары, электроника — практически все популярные категории." },
      { q: "Сколько стоит услуга?", a: "Поиск контактов — фиксированная плата, выкуп — комиссия от суммы заказа." },
    ],
  },
  ShieldCheck: {
    hero: "Глубокая проверка компании-партнёра до сделки: юридический статус, финансовое состояние, репутация на рынке и наличие производственных мощностей. Минимизируем риски срыва поставок и мошенничества.",
    features: [
      { icon: "FileCheck", title: "Юридический чек", text: "Лицензии, регистрационные документы, судебные дела." },
      { icon: "TrendingUp", title: "Финансы", text: "Анализ выручки, долговой нагрузки и платёжной дисциплины." },
      { icon: "Star", title: "Репутация", text: "Отзывы клиентов, упоминания в СМИ, история работы." },
      { icon: "Factory", title: "Производство", text: "Аудит мощностей, при необходимости — выезд на завод." },
    ],
    steps: [
      { title: "Запрос на проверку", text: "Передаёте реквизиты потенциального партнёра." },
      { title: "Сбор данных", text: "Получаем сведения из открытых и закрытых источников." },
      { title: "Анализ рисков", text: "Эксперты оценивают компанию по 30+ критериям." },
      { title: "Отчёт", text: "Получаете детальный отчёт с рекомендациями за 3–5 дней." },
    ],
    faq: [
      { q: "Можно ли проверить китайскую компанию?", a: "Да, у нас есть локальные эксперты в Китае — проверяем по китайским реестрам." },
      { q: "Что входит в отчёт?", a: "Юридический статус, финансы, репутация, производство, итоговая оценка надёжности." },
      { q: "Сколько занимает проверка?", a: "Стандартный срок — 3–5 рабочих дней. Срочная проверка — за 24 часа." },
    ],
  },
  Wallet: {
    hero: "Принимаем и проводим платежи через Alipay для расчётов с китайскими поставщиками. Быстро, безопасно и без посредников. Решение для тех, кто работает с Китаем напрямую.",
    features: [
      { icon: "Zap", title: "Быстро", text: "Перевод доходит до поставщика за 1–2 рабочих дня." },
      { icon: "Lock", title: "Безопасно", text: "Все операции по официальным каналам с подтверждением." },
      { icon: "DollarSign", title: "Выгодный курс", text: "Прозрачная конвертация по биржевому курсу." },
      { icon: "FileText", title: "Документы", text: "Полный комплект закрывающих документов для бухгалтерии." },
    ],
    steps: [
      { title: "Заявка", text: "Передаёте реквизиты получателя и сумму платежа." },
      { title: "Договор", text: "Подписываем договор и выставляем счёт." },
      { title: "Оплата", text: "Получаем средства и переводим через Alipay поставщику." },
      { title: "Подтверждение", text: "Отправляем подтверждение оплаты и закрывающие документы." },
    ],
    faq: [
      { q: "Какая комиссия?", a: "Комиссия зависит от суммы перевода и обсуждается индивидуально." },
      { q: "Есть ли лимиты?", a: "Работаем с суммами от $1 000 до $1 000 000 за операцию." },
      { q: "Можно ли вернуть деньги?", a: "До отправки поставщику — да, после — по правилам Alipay." },
    ],
  },
  Truck: {
    hero: "Организуем доставку груза «под ключ»: от склада поставщика до вашего склада. Авто, авиа, морские контейнеры, ж/д. Таможенное оформление, страхование и складское хранение.",
    features: [
      { icon: "Globe", title: "Все направления", text: "Китай, Турция, ОАЭ, Европа — доставка в РФ и СНГ." },
      { icon: "Package", title: "Любые грузы", text: "Сборные, негабарит, опасные, температурный режим." },
      { icon: "FileCheck", title: "Таможня", text: "Полное оформление ВЭД и сертификация." },
      { icon: "Warehouse", title: "Склад", text: "Хранение и фулфилмент в Москве и регионах." },
    ],
    steps: [
      { title: "Расчёт", text: "Получаете точную стоимость и сроки доставки." },
      { title: "Договор", text: "Подписываем контракт с фиксированными условиями." },
      { title: "Перевозка", text: "Забираем груз у поставщика и везём до точки назначения." },
      { title: "Выдача", text: "Передаём груз с полным комплектом документов." },
    ],
    faq: [
      { q: "Сколько идёт груз из Китая?", a: "Авто — 25–35 дней, ж/д — 20–30, авиа — 5–7, море — 40–55 дней." },
      { q: "Страхуете ли груз?", a: "Да, по умолчанию страхуем на 100% стоимости товара." },
      { q: "Что если задержка на таможне?", a: "Решаем вопросы за свой счёт, если задержка по нашей вине." },
    ],
  },
  BarChart3: {
    hero: "Ежемесячные аналитические отчёты по вашей отрасли: динамика цен, новые игроки на рынке, тренды спроса и прогнозы. Принимайте решения на основе данных, а не интуиции.",
    features: [
      { icon: "TrendingUp", title: "Цены", text: "Мониторинг цен по 200+ позициям ежедневно." },
      { icon: "Users", title: "Игроки", text: "База поставщиков и их доли на рынке." },
      { icon: "LineChart", title: "Тренды", text: "Прогноз спроса и сезонность по категориям." },
      { icon: "Download", title: "Отчёты", text: "PDF, Excel и онлайн-дашборд с фильтрами." },
    ],
    steps: [
      { title: "Подписка", text: "Выбираете отрасль и периодичность отчётов." },
      { title: "Настройка", text: "Уточняем интересующие категории и регионы." },
      { title: "Отчёты", text: "Получаете отчёты в начале каждого месяца." },
      { title: "Консультация", text: "Эксперт-аналитик отвечает на ваши вопросы." },
    ],
    faq: [
      { q: "По каким отраслям есть данные?", a: "Электроника, одежда, продукты, стройматериалы, оборудование, химия и др." },
      { q: "Можно ли заказать разовый отчёт?", a: "Да, делаем индивидуальные исследования под задачу." },
      { q: "Откуда берёте данные?", a: "Открытые источники, биржевые сводки, наша база поставщиков, парсинг." },
    ],
  },
  Headphones: {
    hero: "Ваш персональный менеджер закрывает все вопросы: подбор поставщиков, документы, переговоры, контроль качества и послепродажное обслуживание. Один контакт вместо десяти подрядчиков.",
    features: [
      { icon: "MessageSquare", title: "На связи 24/7", text: "Чат, телефон, мессенджеры — отвечаем в течение часа." },
      { icon: "Briefcase", title: "Полный цикл", text: "От первого брифа до постпродажной поддержки." },
      { icon: "Award", title: "Опытные эксперты", text: "Минимум 5 лет опыта в B2B-сделках." },
      { icon: "Repeat", title: "Без переключений", text: "Один менеджер ведёт вас от и до." },
    ],
    steps: [
      { title: "Знакомство", text: "Встреча, погружение в ваш бизнес и задачи." },
      { title: "План", text: "Согласовываем формат работы и KPI." },
      { title: "Работа", text: "Менеджер ведёт все ваши сделки и задачи." },
      { title: "Отчёт", text: "Регулярные созвоны с отчётами по результатам." },
    ],
    faq: [
      { q: "Сколько стоит услуга?", a: "Фиксированная месячная плата или процент от сделок — обсуждаем индивидуально." },
      { q: "А если менеджер не подойдёт?", a: "Заменим в течение 3 рабочих дней без вопросов." },
      { q: "Работаете с малым бизнесом?", a: "Да, у нас есть тарифы и для небольших компаний." },
    ],
  },
};

export default function ServicePage({
  serviceIndex,
  t,
  onBack,
}: {
  serviceIndex: number;
  t: Translation;
  onBack: () => void;
}) {
  const service = t.services.items[serviceIndex];
  if (!service) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Услуга не найдена</p>
        <button onClick={onBack} className="btn-modern bg-foreground text-background px-6 py-3 rounded-xl text-sm font-medium">
          К списку услуг
        </button>
      </div>
    );
  }

  const details = SERVICE_DETAILS[service.icon] || {
    hero: service.desc,
    features: [],
    steps: [],
    faq: [],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <Icon name="ArrowLeft" size={16} />
        К списку услуг
      </button>

      <div className="bg-white border border-border rounded-3xl p-8 sm:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl flex items-center justify-center mb-6">
            <Icon name={service.icon} size={28} className="text-accent" fallback="Star" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">{t.services.tag}</p>
          <h1 className="text-3xl sm:text-5xl font-bold font-ibm tracking-tight mb-5">{service.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">{details.hero}</p>
        </div>
      </div>

      {details.features.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold font-ibm tracking-tight mb-5">Что входит в услугу</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.features.map((f, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-5 flex items-start gap-4">
                <div className="w-11 h-11 bg-secondary/60 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={20} className="text-foreground" fallback="Check" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.steps.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold font-ibm tracking-tight mb-5">Как мы работаем</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {details.steps.map((s, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-5">
                <div className="w-9 h-9 bg-foreground text-background rounded-xl flex items-center justify-center font-bold text-sm mb-3">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.faq.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold font-ibm tracking-tight mb-5">Частые вопросы</h2>
          <div className="space-y-3">
            {details.faq.map((item, i) => (
              <details key={i} className="bg-white border border-border rounded-2xl p-5 group">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm list-none">
                  <span>{item.q}</span>
                  <Icon name="ChevronDown" size={18} className="text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="gradient-bg text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold font-ibm mb-3 tracking-tight">{t.services.ctaTitle}</h2>
          <p className="text-blue-100/80 mb-6 max-w-xl mx-auto">{t.services.ctaSubtitle}</p>
          <button onClick={onBack} className="btn-modern bg-white text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm">
            Все услуги
          </button>
        </div>
      </div>
    </div>
  );
}