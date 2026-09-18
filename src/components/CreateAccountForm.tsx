import { useState } from "react";
import { createAccount } from "../lib/accounts";
import InstitutionSelect from "./InstitutionSelect";

const ACCOUNT_TYPES = ["Checking", "Savings", "Investment", "CreditCard"];

export default function CreateAccountForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("Checking");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createAccount({ name, accountType, institutionId, currency });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
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
        Add Account
      </h3>
      {error && (
        <p className="text-sm" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}
      <input
        placeholder="Account name (e.g. Everyday Checking)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full border rounded px-3 py-2 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      />
      <select
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
        style={{ borderColor: "#E3E0D6" }}
      >
        {ACCOUNT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t === "CreditCard" ? "Credit Card" : t}
          </option>
        ))}
      </select>
      <InstitutionSelect value={institutionId} onChange={setInstitutionId} />
      <input
        placeholder="Currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
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
          {submitting ? "Adding..." : "Add Account"}
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
