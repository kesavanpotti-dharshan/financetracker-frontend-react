import { useState } from "react";
import type { BillingCycle, Subscription } from "../lib/subscriptions";
import { updateSubscription } from "../lib/subscriptions";

const BILLING_CYCLES: BillingCycle[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

export default function EditSubscriptionForm({
  subscription,
  onSaved,
  onCancel,
}: {
  subscription: Subscription;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(subscription.name);
  const [amount, setAmount] = useState(String(subscription.amount));
  const [currency, setCurrency] = useState(subscription.currency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription.billingCycle,
  );
  const [startDate, setStartDate] = useState(subscription.startDate);
  const [category, setCategory] = useState(subscription.category ?? "");
  const [notes, setNotes] = useState(subscription.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateSubscription(subscription.id, {
        name,
        amount: parseFloat(amount),
        currency,
        billingCycle,
        startDate,
        category: category || null,
        notes: notes || null,
      });
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update subscription",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-xs" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border rounded px-2 py-1 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded px-2 py-1 text-sm font-mono-num"
          style={{ borderColor: "#E3E0D6" }}
        />
        <input
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
          className="w-full border rounded px-2 py-1 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
          className="w-full border rounded px-2 py-1 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        >
          {BILLING_CYCLES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full border rounded px-2 py-1 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        />
      </div>
      <input
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-sm font-medium disabled:opacity-50"
          style={{ color: "#1F6F5C" }}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm"
          style={{ color: "#5B6472" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
