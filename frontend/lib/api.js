const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function saveToken(token) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}

export function getToken() {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body && !(options.body instanceof URLSearchParams)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "เกิดข้อผิดพลาด" }));
    throw new Error(err.detail || "เกิดข้อผิดพลาด");
  }
  return res.json();
}

export const api = {
  register: (email, password) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return request("/auth/login", { method: "POST", body: form });
  },

  me: () => request("/auth/me"),

  listTransactions: () => request("/transactions"),
  createTransaction: (data) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: "DELETE" }),

  listGoals: () => request("/goals"),
  createGoal: (data) => request("/goals", { method: "POST", body: JSON.stringify(data) }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  getAdvice: () => request("/advice", { method: "POST" }),
  adviceHistory: () => request("/advice/history"),
};
