import { useState } from "react";
import type { Account } from "../lib/accounts";
import { updateAccount } from "../lib/accounts";
import InstitutionSelect from "./InstitutionSelect";

export default function EditAccountForm({
  account,
  onSaved,
  onCancel,
}: {
  account: Account;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(account.name);
  const [currency, setCurrency] = useState(account.currency);
  const [institutionId, setInstitutionId] = useState<string | null>(
    account.institutionId,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateAccount(account.id, { name, currency, institutionId });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
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
      <InstitutionSelect value={institutionId} onChange={setInstitutionId} />
      <input
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
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
