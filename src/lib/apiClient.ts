const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7271";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  // dedupe concurrent refresh calls (e.g. two failed requests at once)
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends the httpOnly refreshToken cookie
      });
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken as string;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken); // retry once with the fresh token
    }
  }

  return res;
}
