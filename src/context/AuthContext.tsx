import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { apiFetch, setAccessToken } from "../lib/apiClient";
import { AuthContext } from "./AuthContextInstance";
import type { User } from "./AuthContextInstance";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser({ email: "" });
      }
      setLoading(false);
    })();
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid email or password");
    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser({ email: data.email });
  }

  async function register(email: string, password: string) {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok)
      throw new Error("Registration failed — email may already be in use");
    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser({ email: data.email });
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
