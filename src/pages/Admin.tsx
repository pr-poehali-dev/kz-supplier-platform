import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const API_URL = "https://functions.poehali.dev/0d3d03b7-73bc-4278-a3b4-b0d2196eea41";

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
  created_at?: string;
};

const EMPTY: Omit<Product, "id" | "created_at"> = {
  title: "",
  category: "",
  price: 0,
  currency: "RUB",
  moq: 1,
  description: "",
  image_url: "",
  supplier: "",
  in_stock: true,
};

export default function Admin() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.category.trim()) {
      toast.error("Укажи название и категорию");
      return;
    }
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Товар обновлён" : "Товар добавлен");
      resetForm();
      load();
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const edit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      category: p.category,
      price: p.price,
      currency: p.currency,
      moq: p.moq,
      description: p.description,
      image_url: p.image_url,
      supplier: p.supplier,
      in_stock: p.in_stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Удалено");
      load();
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  return (
    <div className="min-h-screen bg-background font-ibm">
      <div className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Settings" size={20} className="text-accent" />
            <h1 className="text-lg font-bold font-ibm">Админка · Товары</h1>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <Icon name="ArrowLeft" size={14} /> На сайт
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[420px_1fr] gap-8">
        <div className="bg-white border border-border rounded p-6 h-fit lg:sticky lg:top-20">
          <h2 className="font-bold mb-5 flex items-center gap-2">
            <Icon name={editingId ? "Pencil" : "Plus"} size={16} />
            {editingId ? "Редактировать товар" : "Новый товар"}
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Кастрюля 3л нерж." />
            </div>
            <div>
              <Label htmlFor="category">Категория *</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Кухня и посуда" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="price">Цена</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="moq">Мин. партия (MOQ)</Label>
              <Input id="moq" type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="supplier">Поставщик</Label>
              <Input id="supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="image_url">Ссылка на фото</Label>
              <Input id="image_url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label htmlFor="in_stock" className="cursor-pointer">В наличии</Label>
              <Switch id="in_stock" checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={submit} disabled={saving} className="flex-1">
                {saving ? "Сохраняю..." : editingId ? "Сохранить" : "Добавить"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Все товары · {items.length}</h2>
            <Button variant="outline" size="sm" onClick={load}>
              <Icon name="RefreshCw" size={14} /> Обновить
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Загрузка...</div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-dashed border-border rounded p-12 text-center text-muted-foreground">
              <Icon name="Package" size={32} className="mx-auto mb-3 opacity-40" />
              Пока нет товаров. Добавь первый через форму слева.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => (
                <div key={p.id} className="bg-white border border-border rounded p-4 flex gap-4">
                  <div className="w-16 h-16 bg-secondary rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="Image" size={20} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">{p.category}</span>
                          {!p.in_stock && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">Нет в наличии</span>}
                        </div>
                        <h3 className="font-semibold truncate">{p.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{p.description || "—"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold">{p.price.toLocaleString("ru")} {p.currency}</div>
                        <div className="text-xs text-muted-foreground">от {p.moq} шт.</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{p.supplier || "—"}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => edit(p)}>
                          <Icon name="Pencil" size={13} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => remove(p.id)}>
                          <Icon name="Trash2" size={13} />
                        </Button>
                      </div>
                    </div>
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
