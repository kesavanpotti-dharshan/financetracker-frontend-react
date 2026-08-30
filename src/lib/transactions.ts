import { apiFetch } from "./apiClient";

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
}

export async function getTransactions(
  accountId: string,
  from?: string,
  to?: string,
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString() ? `?${params.toString()}` : "";

  const res = await apiFetch(`/api/accounts/${accountId}/transactions${query}`);
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function createTransaction(
  accountId: string,
  data: {
    date: string;
    description: string;
    amount: number;
    category: string | null;
  },
): Promise<Transaction> {
  const res = await apiFetch(`/api/accounts/${accountId}/transactions`, {
    method: "POST",
    body: JSON.stringify({ accountId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

export async function deleteTransaction(
  accountId: string,
  id: string,
): Promise<void> {
  const res = await apiFetch(`/api/accounts/${accountId}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete transaction");
}
