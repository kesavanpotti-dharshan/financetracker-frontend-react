import { useState } from "react";
import type { CreditCardDetails } from "../lib/accounts";
import { setCreditCardDetails } from "../lib/accounts";

export default function CreditCardDetailsForm({
  accountId,
  existing,
  onSaved,
}: {
  accountId: string;
  existing: CreditCardDetails | null;
  onSaved: (details: CreditCardDetails) => void;
}) {
  const [creditLimit, setCreditLimit] = useState(
    existing?.creditLimit?.toString() ?? "",
  );
  const [statementDay, setStatementDay] = useState(
    existing?.statementDay?.toString() ?? "1",
  );
  const [dueDay, setDueDay] = useState(existing?.dueDay?.toString() ?? "15");
  const [minPayment, setMinPayment] = useState(
    existing?.minPayment?.toString() ?? "",
  );
  const [interestRate, setInterestRate] = useState(
    existing?.interestRate?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const saved = await setCreditCardDetails(accountId, {
        creditLimit: parseFloat(creditLimit),
        statementDay: parseInt(statementDay, 10),
        dueDay: parseInt(dueDay, 10),
        minPayment: minPayment ? parseFloat(minPayment) : null,
        interestRate: interestRate ? parseFloat(interestRate) : null,
      });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 border-t pt-3 space-y-2"
      style={{ borderColor: "#E3E0D6" }}
    >
      {error && (
        <p className="text-xs" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      {existing && (
        <p className="text-xs font-mono-num" style={{ color: "#5B6472" }}>
          Available credit: USD {existing.availableCredit.toLocaleString()}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          placeholder="Credit limit"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Min payment"
          value={minPayment}
          onChange={(e) => setMinPayment(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          min="1"
          max="31"
          placeholder="Statement day"
          value={statementDay}
          onChange={(e) => setStatementDay(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          min="1"
          max="31"
          placeholder="Due day"
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Interest rate %"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="text-sm font-medium disabled:opacity-50"
        style={{ color: "#1F6F5C" }}
      >
        {submitting ? "Saving..." : "Save credit card details"}
      </button>
    </form>
  );
}
