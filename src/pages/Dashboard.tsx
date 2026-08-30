import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccounts } from "../lib/accounts";
import type { Account } from "../lib/accounts";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  Checking: "Checking",
  Savings: "Savings",
  Investment: "Investment",
  CreditCard: "Credit Card",
};

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "#5B6472" }}>Loading...</p>;
  if (error) return <p style={{ color: "#A83B32" }}>{error}</p>;

  const assets = accounts.filter((a) => a.accountType !== "CreditCard");
  const liabilities = accounts.filter((a) => a.accountType === "CreditCard");

  const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, a) => sum + a.currentBalance,
    0,
  );
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="font-display text-3xl font-semibold"
          style={{ color: "#16233D" }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#5B6472" }}>
          Overview of your accounts and net worth
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Net Worth" value={netWorth} highlight />
        <SummaryCard label="Total Assets" value={totalAssets} />
        <SummaryCard
          label="Total Owed (Credit Cards)"
          value={totalLiabilities}
          negative
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-display text-lg font-medium"
            style={{ color: "#16233D" }}
          >
            Accounts
          </h2>
          <Link
            to="/accounts"
            className="text-sm hover:underline"
            style={{ color: "#1F6F5C" }}
          >
            View all →
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center border"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
          >
            <p className="mb-3" style={{ color: "#5B6472" }}>
              No accounts yet.
            </p>
            <Link
              to="/accounts"
              className="text-sm hover:underline"
              style={{ color: "#1F6F5C" }}
            >
              Add your first account
            </Link>
          </div>
        ) : (
          <div
            className="rounded-lg border divide-y"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
          >
            {accounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderColor: "#E3E0D6" }}
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#16233D" }}
                  >
                    {a.name}
                  </p>
                  <p className="text-xs" style={{ color: "#5B6472" }}>
                    {ACCOUNT_TYPE_LABELS[a.accountType] ?? a.accountType}
                    {a.institutionName ? ` · ${a.institutionName}` : ""}
                  </p>
                </div>
                <p
                  className="font-mono-num text-sm font-medium"
                  style={{
                    color:
                      a.accountType === "CreditCard" ? "#A83B32" : "#16233D",
                  }}
                >
                  {a.currency}{" "}
                  {a.currentBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
  negative = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-5 border"
      style={{
        backgroundColor: highlight ? "#16233D" : "#FFFFFF",
        borderColor: highlight ? "#16233D" : "#E3E0D6",
      }}
    >
      <p
        className="text-xs mb-1 tracking-wide uppercase"
        style={{ color: highlight ? "#9CA9C0" : "#5B6472" }}
      >
        {label}
      </p>
      <p
        className="font-mono-num text-3xl font-medium"
        style={{
          color: highlight ? "#FFFFFF" : negative ? "#A83B32" : "#16233D",
        }}
      >
        {value.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
        })}
      </p>
    </div>
  );
}
