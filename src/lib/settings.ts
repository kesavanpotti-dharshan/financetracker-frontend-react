import { apiFetch } from "./apiClient";

export interface UserSettings {
  email: string;
  preferredSecondaryCurrency: string | null;
}

export async function getUserSettings(): Promise<UserSettings> {
  const res = await apiFetch("/api/users/me/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function updateSecondaryCurrency(
  currency: string | null,
): Promise<UserSettings> {
  const res = await apiFetch("/api/users/me/settings", {
    method: "PUT",
    body: JSON.stringify({ currency }),
  });
  if (!res.ok) throw new Error("Failed to update currency");
  return res.json();
}

export async function getFxRate(from: string, to: string): Promise<number> {
  const res = await apiFetch(`/api/users/me/fx-rate?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to get exchange rate");
  const data = await res.json();
  return data.rate;
}
