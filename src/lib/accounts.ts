import { apiFetch } from "./apiClient";

export interface Account {
  id: string;
  name: string;
  accountType: string;
  institutionName: string | null;
  currency: string;
  currentBalance: number;
  balanceAsOfDate: string | null;
  isActive: boolean;
}

export interface CreditCardDetails {
  accountId: string;
  creditLimit: number;
  statementDay: number;
  dueDay: number;
  minPayment: number | null;
  interestRate: number | null;
  currentBalance: number;
  availableCredit: number;
}

export async function getAccounts(): Promise<Account[]> {
  const res = await apiFetch("/api/accounts");
  if (!res.ok) throw new Error("Failed to load accounts");
  return res.json();
}

export async function createAccount(data: {
  name: string;
  accountType: string;
  institutionId: string | null;
  currency: string;
}): Promise<Account> {
  const res = await apiFetch("/api/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create account");
  return res.json();
}

export async function updateAccount(
  id: string,
  data: { name: string; currency: string },
): Promise<Account> {
  const res = await apiFetch(`/api/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update account");
  return res.json();
}

export async function archiveAccount(id: string): Promise<void> {
  const res = await apiFetch(`/api/accounts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to archive account");
}

export async function updateBalance(
  accountId: string,
  balance: number,
  asOfDate: string,
): Promise<Account> {
  const res = await apiFetch(`/api/accounts/${accountId}/balance`, {
    method: "POST",
    body: JSON.stringify({ accountId, balance, asOfDate }),
  });
  if (!res.ok) throw new Error("Failed to update balance");
  return res.json();
}

export async function getCreditCardDetails(
  accountId: string,
): Promise<CreditCardDetails | null> {
  const res = await apiFetch(`/api/accounts/${accountId}/credit-card`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load credit card details");
  return res.json();
}

export async function setCreditCardDetails(
  accountId: string,
  data: {
    creditLimit: number;
    statementDay: number;
    dueDay: number;
    minPayment: number | null;
    interestRate: number | null;
  },
): Promise<CreditCardDetails> {
  const res = await apiFetch(`/api/accounts/${accountId}/credit-card`, {
    method: "PUT",
    body: JSON.stringify({ accountId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to save credit card details");
  return res.json();
}
