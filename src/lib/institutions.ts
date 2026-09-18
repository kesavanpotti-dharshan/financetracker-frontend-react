import { apiFetch } from "./apiClient";

export interface Institution {
  id: string;
  name: string;
  type: string | null;
}

export async function getInstitutions(): Promise<Institution[]> {
  const res = await apiFetch("/api/institutions");
  if (!res.ok) throw new Error("Failed to load institutions");
  return res.json();
}

export async function createInstitution(name: string): Promise<Institution> {
  const res = await apiFetch("/api/institutions", {
    method: "POST",
    body: JSON.stringify({ name, type: null }),
  });
  if (!res.ok) throw new Error("Failed to create institution");
  return res.json();
}
