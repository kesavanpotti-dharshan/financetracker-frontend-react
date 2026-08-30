import { useEffect, useState } from "react";
import type { Transaction } from "../lib/transactions";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../lib/transactions";

export default function TransactionsPanel({
  accountId,
}: {
  accountId: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getTransactions(accountId);
        if (!cancelled) setTransactions(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load transactions",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(accountId, id);
    setRefreshKey((k) => k + 1);
  }

  const now = new Date();
  const currentMonthTotal = transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div
      className="mt-3 border-t pt-3 space-y-3"
      style={{ borderColor: "#E3E0D6" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: "#16233D" }}>
          Transactions{" "}
          {transactions.length > 0 && (
            <span className="font-mono-num" style={{ color: "#5B6472" }}>
              ({transactions.length})
            </span>
          )}
        </p>
        <button
          onClick={() => setShowAddForm((s) => !s)}
          className="text-sm hover:underline"
          style={{ color: "#1F6F5C" }}
        >
          {showAddForm ? "Cancel" : "+ Add manual"}
        </button>
      </div>

      <p className="text-xs font-mono-num" style={{ color: "#5B6472" }}>
        This month's total: {currentMonthTotal.toFixed(2)}
      </p>

      {showAddForm && (
        <AddTransactionForm
          accountId={accountId}
          onAdded={() => {
            setShowAddForm(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      {error && (
        <p className="text-xs" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-xs" style={{ color: "#5B6472" }}>
          Loading...
        </p>
      ) : transactions.length === 0 ? (
        <p className="text-xs" style={{ color: "#5B6472" }}>
          No transactions yet.
        </p>
      ) : (
        <div
          className="rounded divide-y max-h-64 overflow-y-auto border"
          style={{ borderColor: "#E3E0D6" }}
        >
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-3 py-2 text-xs group"
              style={{ borderColor: "#E3E0D6" }}
            >
              <div>
                <span style={{ color: "#5B6472" }}>{t.date}</span>
                <span className="ml-2" style={{ color: "#16233D" }}>
                  {t.description}
                </span>
                {t.category && (
                  <span className="ml-2" style={{ color: "#A3A3A3" }}>
                    · {t.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono-num font-medium"
                  style={{ color: "#16233D" }}
                >
                  {t.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#A83B32" }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTransactionForm({
  accountId,
  onAdded,
}: {
  accountId: string;
  onAdded: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createTransaction(accountId, {
        date,
        description,
        amount: parseFloat(amount),
        category: category || null,
      });
      onAdded();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded p-3 space-y-2"
      style={{ backgroundColor: "#F7F6F2" }}
    >
      {error && (
        <p className="text-xs" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-xs"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-xs font-mono-num"
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="border border-gray-300 rounded px-2 py-1 text-xs col-span-2"
        />
        <input
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-xs col-span-2"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="text-xs font-medium disabled:opacity-50"
        style={{ color: "#1F6F5C" }}
      >
        {submitting ? "Adding..." : "Add transaction"}
      </button>
    </form>
  );
}
