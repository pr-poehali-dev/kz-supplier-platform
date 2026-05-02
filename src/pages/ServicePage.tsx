import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { SERVICES, type ServiceSlug } from "@/lib/services";

export default function ServicePage() {
  const { slug } = useParams<{ slug: ServiceSlug }>();
  const navigate = useNavigate();
  const service = slug ? SERVICES[slug as ServiceSlug] : undefined;

  useEffect(() => {
    if (!service) navigate("/", { replace: true });
    window.scrollTo(0, 0);
  }, [service, navigate]);

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF2FB] to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 bg-white/70 hover:bg-white border border-border px-4 py-2 rounded-xl transition-colors"
        >
          <Icon name="ArrowLeft" size={16} /> На главную
        </button>

        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-12">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 bg-accent/10 rounded-full">
                <Icon name={service.icon} size={14} className="text-accent" />
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">Услуга</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-ibm tracking-tight mb-4">{service.title}</h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">{service.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#order" className="btn-modern bg-foreground text-background font-medium px-7 py-3.5 rounded-2xl text-sm flex items-center gap-2 justify-center">
                  Оставить заявку <Icon name="ArrowRight" size={16} />
                </a>
                <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noreferrer" className="bg-secondary hover:bg-secondary/70 px-7 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-2 justify-center transition-colors">
                  <Icon name="MessageCircle" size={16} /> Спросить менеджера
                </a>
              </div>
            </div>
            <div className="bg-[#E3EEFB] flex items-center justify-center p-6 md:p-0 min-h-[260px]">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {service.benefits.map((b, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Icon name={b.icon} size={18} />
              </div>
              <h3 className="font-semibold mb-1.5">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 sm:p-10 mt-6">
          <h2 className="text-2xl font-bold font-ibm mb-6">Как это работает</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {service.steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-bold text-accent/30 font-ibm mb-2">0{i + 1}</div>
                <h4 className="font-semibold mb-1.5">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="order" className="bg-gradient-to-br from-foreground to-foreground/90 text-background rounded-3xl p-8 sm:p-12 mt-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-ibm mb-3">Готовы начать?</h2>
          <p className="text-background/70 mb-6 max-w-xl mx-auto">Опиши задачу — наш менеджер свяжется в течение часа и подготовит расчёт под твой бизнес.</p>
          <button onClick={() => navigate("/")} className="btn-modern bg-background text-foreground font-medium px-7 py-3.5 rounded-2xl text-sm inline-flex items-center gap-2">
            Оставить заявку <Icon name="ArrowRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
