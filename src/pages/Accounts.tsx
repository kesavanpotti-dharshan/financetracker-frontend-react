import { useEffect, useState } from "react";
import type { Account } from "../lib/accounts";
import { getAccounts } from "../lib/accounts";
import AccountCard from "../components/AccountCard";
import CreateAccountForm from "../components/CreateAccountForm";

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setAccounts(await getAccounts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <button
          onClick={() => setShowCreateForm((s) => !s)}
          className="bg-blue-600 text-white text-sm font-medium rounded px-4 py-2"
        >
          {showCreateForm ? "Close" : "+ Add Account"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showCreateForm && (
        <CreateAccountForm
          onCreated={() => {
            setShowCreateForm(false);
            load();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {accounts.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No accounts yet — add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}
