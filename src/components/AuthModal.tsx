import { useState } from "react";
import Icon from "@/components/ui/icon";
import { authRequest, setToken, type User } from "@/lib/auth";
import { toast } from "sonner";

export default function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Заполни email и пароль");
      return;
    }
    if (mode === "register" && password.length < 6) {
      toast.error("Пароль минимум 6 символов");
      return;
    }
    setLoading(true);
    try {
      const data = await authRequest(mode, email.trim(), password, name.trim());
      setToken(data.token);
      onSuccess(data.user);
      toast.success(mode === "login" ? "Добро пожаловать!" : "Аккаунт создан");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-7 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
          <Icon name="X" size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold font-ibm tracking-tight mb-1.5">
            {mode === "login" ? "Вход в кабинет" : "Создать аккаунт"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Введи email и пароль" : "Зарегистрируйся, чтобы разместить компанию"}
          </p>
        </div>

        <div className="flex bg-secondary/60 rounded-xl p-1 mb-5">
          <button onClick={() => setMode("login")} className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>
            Вход
          </button>
          <button onClick={() => setMode("register")} className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${mode === "register" ? "bg-white shadow-sm" : "text-muted-foreground"}`}>
            Регистрация
          </button>
        </div>

        <div className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Имя</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван"
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ru"
              className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••"
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all" />
          </div>
        </div>

        <button onClick={submit} disabled={loading} className="btn-modern w-full mt-5 bg-foreground text-background py-3 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? "..." : mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}
