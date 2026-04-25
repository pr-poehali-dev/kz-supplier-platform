export const AUTH_API = "https://functions.poehali.dev/566326d4-29ae-4c27-bbec-91fa3e080a28";
export const COMPANY_API = "https://functions.poehali.dev/8c5a112a-69ee-45e1-bab8-ce9a83537caa";
export const PRODUCTS_API = "https://functions.poehali.dev/0d3d03b7-73bc-4278-a3b4-b0d2196eea41";

export type User = { id: number; email: string; name: string };

export const TOKEN_KEY = "ps_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function fetchMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(AUTH_API, { headers: { "X-Auth-Token": token } });
    if (!res.ok) return null;
    const d = await res.json();
    return d.user || null;
  } catch {
    return null;
  }
}

export async function authRequest(action: "login" | "register", email: string, password: string, name?: string) {
  const res = await fetch(AUTH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, email, password, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка");
  return data as { token: string; user: User };
}
