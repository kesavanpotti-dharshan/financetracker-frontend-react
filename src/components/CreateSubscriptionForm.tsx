import { useState } from "react";
import type { BillingCycle } from "../lib/subscriptions";
import { createSubscription } from "../lib/subscriptions";

const BILLING_CYCLES: BillingCycle[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

export default function CreateSubscriptionForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createSubscription({
        name,
        amount: parseFloat(amount),
        currency,
        billingCycle,
        startDate,
        category: category || null,
        notes: notes || null,
      });
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subscription",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg p-5 space-y-3 border"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
    >
      <h3 className="font-medium" style={{ color: "#16233D" }}>
        Add Subscription
      </h3>
      {error && (
        <p className="text-sm" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      <input
        placeholder="Name (e.g. Netflix)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border rounded px-3 py-2 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm font-mono-num"
          style={{ borderColor: "#E3E0D6" }}
        />
        <input
          placeholder="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={billingCycle}
          onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
          className="w-full border rounded px-3 py-2 text-sm"
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
          className="w-full border rounded px-3 py-2 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        />
      </div>
      <input
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <input
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "#1F6F5C" }}
        >
          {submitting ? "Adding..." : "Add Subscription"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2"
          style={{ color: "#5B6472" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
