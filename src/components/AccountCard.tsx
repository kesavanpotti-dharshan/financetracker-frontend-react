import { useState } from "react";
import type { Account, CreditCardDetails } from "../lib/accounts";
import { archiveAccount, getCreditCardDetails } from "../lib/accounts";
import UpdateBalanceForm from "./UpdateBalanceForm";
import StatementUpload from "./StatementUpload";
import TransactionsPanel from "./TransactionsPanel";
import EditAccountForm from "./EditAccountForm";
import CreditCardDetailsForm from "./CreditCardDetailsForm";

const TYPE_LABELS: Record<string, string> = {
  Checking: "Checking",
  Savings: "Savings",
  Investment: "Investment",
  CreditCard: "Credit Card",
};

const TYPE_STYLES: Record<
  string,
  { accent: string; bg: string; badge: string }
> = {
  Checking: { accent: "#16233D", bg: "#F4F6FA", badge: "#16233D" },
  Savings: { accent: "#1F6F5C", bg: "#F0F7F5", badge: "#1F6F5C" },
  Investment: { accent: "#7A5C1E", bg: "#FBF6EC", badge: "#7A5C1E" },
  CreditCard: { accent: "#A83B32", bg: "#FBF1F0", badge: "#A83B32" },
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
  const [isEditing, setIsEditing] = useState(false);
  const [ccDetails, setCcDetails] = useState<CreditCardDetails | null>(null);
  const [ccLoaded, setCcLoaded] = useState(false);

  const style = TYPE_STYLES[account.accountType] ?? TYPE_STYLES.Checking;

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
      className="border rounded-lg p-4"
      style={{
        borderTop: `3px solid ${style.accent}`,
        backgroundColor: style.bg,
        borderColor: "#E3E0D6",
      }}
    >
      {isEditing ? (
        <EditAccountForm
          account={account}
          onSaved={() => {
            setIsEditing(false);
            onChanged();
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium" style={{ color: "#16233D" }}>
              {account.name}
            </p>
            <span
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: style.badge, color: "#FFFFFF" }}
            >
              {TYPE_LABELS[account.accountType] ?? account.accountType}
            </span>
            <p className="text-xs mt-1" style={{ color: "#5B6472" }}>
              {account.institutionName
                ? account.institutionName
                : "No institution"}
              {account.balanceAsOfDate
                ? ` · as of ${account.balanceAsOfDate}`
                : ""}
            </p>
          </div>
          <p
            className="font-mono-num text-lg font-medium"
            style={{
              color:
                account.accountType === "CreditCard" ? "#A83B32" : "#16233D",
            }}
          >
            {account.currency}{" "}
            {account.currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      )}

      {!isEditing && (
        <div className="flex gap-4 mt-3 text-sm flex-wrap">
          <button
            onClick={() => setIsEditing(true)}
            className="hover:underline"
            style={{ color: "#1F6F5C" }}
          >
            Edit
          </button>
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
      )}

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
