import { apiFetch } from "./apiClient";

export type BillingCycle = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  nextBillingDate: string;
  monthlyEquivalentAmount: number;
  category: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface SubscriptionSummary {
  activeCount: number;
  monthlyTotalsByCurrency: { currency: string; totalMonthlyCost: number }[];
}

export interface SubscriptionInput {
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  category: string | null;
  notes: string | null;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const res = await apiFetch("/api/subscriptions");
  if (!res.ok) throw new Error("Failed to load subscriptions");
  return res.json();
}

export async function getSubscription(id: string): Promise<Subscription> {
  const res = await apiFetch(`/api/subscriptions/${id}`);
  if (!res.ok) throw new Error("Failed to load subscription");
  return res.json();
}

export async function createSubscription(
  data: SubscriptionInput,
): Promise<Subscription> {
  const res = await apiFetch("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create subscription");
  return res.json();
}

export async function updateSubscription(
  id: string,
  data: SubscriptionInput,
): Promise<Subscription> {
  const res = await apiFetch(`/api/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update subscription");
  return res.json();
}

export async function cancelSubscription(id: string): Promise<void> {
  const res = await apiFetch(`/api/subscriptions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to cancel subscription");
}

export async function getUpcomingSubscriptions(
  days = 30,
): Promise<Subscription[]> {
  const res = await apiFetch(`/api/subscriptions/upcoming?days=${days}`);
  if (!res.ok) throw new Error("Failed to load upcoming subscriptions");
  return res.json();
}

export async function getSubscriptionSummary(): Promise<SubscriptionSummary> {
  const res = await apiFetch("/api/subscriptions/summary");
  if (!res.ok) throw new Error("Failed to load subscription summary");
  return res.json();
}
