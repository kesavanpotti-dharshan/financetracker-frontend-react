import { useState } from "react";
import { updateBalance } from "../lib/accounts";

export default function UpdateBalanceForm({
  accountId,
  onUpdated,
  onCancel,
}: {
  accountId: string;
  onUpdated: () => void;
  onCancel: () => void;
}) {
  const [balance, setBalance] = useState("");
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateBalance(accountId, parseFloat(balance), asOfDate);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update balance");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      {error && (
        <p className="text-xs" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      <input
        type="number"
        step="0.01"
        placeholder="New balance"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        required
        className="border rounded px-2 py-1 text-sm w-32 font-mono-num"
        style={{ borderColor: "#E3E0D6" }}
      />
      <input
        type="date"
        value={asOfDate}
        onChange={(e) => setAsOfDate(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-sm font-medium disabled:opacity-50"
        style={{ color: "#1F6F5C" }}
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm"
        style={{ color: "#5B6472" }}
      >
        Cancel
      </button>
    </form>
  );
}
