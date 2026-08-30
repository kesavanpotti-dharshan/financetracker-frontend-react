import { useState } from "react";
import type { Account, CreditCardDetails } from "../lib/accounts";
import {
  archiveAccount,
  getCreditCardDetails,
  setCreditCardDetails,
} from "../lib/accounts";
import UpdateBalanceForm from "./UpdateBalanceForm";
import StatementUpload from "./StatementUpload";
import TransactionsPanel from "./TransactionsPanel";

const TYPE_LABELS: Record<string, string> = {
  Checking: "Checking",
  Savings: "Savings",
  Investment: "Investment",
  CreditCard: "Credit Card",
};

const TYPE_ACCENT: Record<string, string> = {
  Checking: "#16233D",
  Savings: "#16233D",
  Investment: "#1F6F5C",
  CreditCard: "#A83B32",
};

export default function AccountCard({
  account,
  onChanged,
}: {
  account: Account;
  onChanged: () => void;
}) {
  const [showBalanceForm, setShowBalanceForm] = useState(false);
  const [showCcForm, setShowCcForm] = useState(false);
  const [showStatementUpload, setShowStatementUpload] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [ccDetails, setCcDetails] = useState<CreditCardDetails | null>(null);
  const [ccLoaded, setCcLoaded] = useState(false);

  async function toggleCcDetails() {
    if (!ccLoaded) {
      const details = await getCreditCardDetails(account.id);
      setCcDetails(details);
      setCcLoaded(true);
    }
    setShowCcForm((s) => !s);
  }

  async function handleArchive() {
    if (
      !confirm(
        `Archive "${account.name}"? This hides it from your active accounts.`,
      )
    )
      return;
    await archiveAccount(account.id);
    onChanged();
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4"
      style={{
        borderTop: `3px solid ${TYPE_ACCENT[account.accountType] ?? "#16233D"}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium" style={{ color: "#16233D" }}>
            {account.name}
          </p>
          <p className="text-xs" style={{ color: "#5B6472" }}>
            {TYPE_LABELS[account.accountType] ?? account.accountType}
            {account.institutionName ? ` · ${account.institutionName}` : ""}
            {account.balanceAsOfDate
              ? ` · as of ${account.balanceAsOfDate}`
              : ""}
          </p>
        </div>
        <p
          className="font-mono-num text-lg font-medium"
          style={{
            color: account.accountType === "CreditCard" ? "#A83B32" : "#16233D",
          }}
        >
          {account.currency}{" "}
          {account.currentBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      <div className="flex gap-4 mt-3 text-sm flex-wrap">
        <button
          onClick={() => setShowBalanceForm((s) => !s)}
          className="hover:underline"
          style={{ color: "#1F6F5C" }}
        >
          Update balance
        </button>
        <button
          onClick={() => setShowStatementUpload((s) => !s)}
          className="hover:underline"
          style={{ color: "#1F6F5C" }}
        >
          Upload statement
        </button>
        <button
          onClick={() => setShowTransactions((s) => !s)}
          className="hover:underline"
          style={{ color: "#1F6F5C" }}
        >
          Transactions
        </button>
        {account.accountType === "CreditCard" && (
          <button
            onClick={toggleCcDetails}
            className="hover:underline"
            style={{ color: "#1F6F5C" }}
          >
            Credit card details
          </button>
        )}
        <button
          onClick={handleArchive}
          className="ml-auto hover:underline"
          style={{ color: "#A3A3A3" }}
        >
          Archive
        </button>
      </div>

      {showBalanceForm && (
        <UpdateBalanceForm
          accountId={account.id}
          onUpdated={() => {
            setShowBalanceForm(false);
            onChanged();
          }}
          onCancel={() => setShowBalanceForm(false)}
        />
      )}

      {showStatementUpload && (
        <div className="mt-3">
          <StatementUpload
            accountId={account.id}
            onConfirmed={() => {
              setShowStatementUpload(false);
              onChanged();
            }}
          />
        </div>
      )}

      {showTransactions && <TransactionsPanel accountId={account.id} />}

      {showCcForm && (
        <CreditCardDetailsForm
          accountId={account.id}
          existing={ccDetails}
          onSaved={(details) => {
            setCcDetails(details);
          }}
        />
      )}
    </div>
  );
}

function CreditCardDetailsForm({
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
