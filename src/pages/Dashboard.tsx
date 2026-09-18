import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Wallet,
  Clock,
} from "lucide-react";
import { getAccounts } from "../lib/accounts";
import type { Account } from "../lib/accounts";
import { getTransactions } from "../lib/transactions";
import type { Transaction } from "../lib/transactions";
import {
  getUserSettings,
  updateSecondaryCurrency,
  getFxRate,
} from "../lib/settings";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  Checking: "Checking",
  Savings: "Savings",
  Investment: "Investment",
  CreditCard: "Credit Card",
};

const TYPE_COLORS: Record<string, string> = {
  Checking: "#16233D",
  Savings: "#1F6F5C",
  Investment: "#7A5C1E",
  CreditCard: "#A83B32",
};

type IconComponent = ComponentType<{ size?: number; color?: string }>;

const TYPE_ICONS: Record<string, IconComponent> = {
  Checking: Landmark,
  Savings: PiggyBank,
  Investment: TrendingUp,
  CreditCard: CreditCard,
};

const CURRENCY_OPTIONS = [
  "EUR",
  "GBP",
  "INR",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "SGD",
];

interface ActivityItem extends Transaction {
  accountName: string;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [secondaryCurrency, setSecondaryCurrency] = useState<string | null>(
    null,
  );
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [currencySaving, setCurrencySaving] = useState(false);

  useEffect(() => {
    getAccounts()
      .then(async (accs) => {
        setAccounts(accs);

        const results = await Promise.all(
          accs.map(async (a) => {
            try {
              const txs = await getTransactions(a.id);
              return txs.map((t) => ({ ...t, accountName: a.name }));
            } catch {
              return [];
            }
          }),
        );
        const merged = results
          .flat()
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 6);
        setActivity(merged);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    getUserSettings()
      .then((s) => setSecondaryCurrency(s.preferredSecondaryCurrency))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!secondaryCurrency) {
      setFxRate(null);
      return;
    }
    let cancelled = false;
    setFxLoading(true);
    getFxRate("USD", secondaryCurrency)
      .then((rate) => {
        if (!cancelled) setFxRate(rate);
      })
      .catch(() => {
        if (!cancelled) setFxRate(null);
      })
      .finally(() => {
        if (!cancelled) setFxLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [secondaryCurrency]);

  async function handleCurrencyChange(value: string) {
    const currency = value || null;
    setCurrencySaving(true);
    try {
      await updateSecondaryCurrency(currency);
      setSecondaryCurrency(currency);
    } catch {
      // ignore — selector reflects last successful value
    } finally {
      setCurrencySaving(false);
    }
  }

  if (loading) return <p style={{ color: "#5B6472" }}>Loading...</p>;
  if (error) return <p style={{ color: "#A83B32" }}>{error}</p>;

  const assets = accounts.filter((a) => a.accountType !== "CreditCard");
  const liabilities = accounts.filter((a) => a.accountType === "CreditCard");

  const cashAccounts = assets.filter(
    (a) => a.accountType === "Checking" || a.accountType === "Savings",
  );
  const investmentAccounts = assets.filter(
    (a) => a.accountType === "Investment",
  );

  const topCash = [...cashAccounts]
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 5);
  const topInvestments = [...investmentAccounts]
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 5);

  const totalAssets = assets.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalLiabilities = liabilities.reduce(
    (sum, a) => sum + a.currentBalance,
    0,
  );
  const netWorth = totalAssets - totalLiabilities;

  const allocationByType = ["Checking", "Savings", "Investment"]
    .map((type) => {
      const sum = accounts
        .filter((a) => a.accountType === type)
        .reduce((s, a) => s + a.currentBalance, 0);
      return {
        type,
        sum,
        pct: totalAssets > 0 ? (sum / totalAssets) * 100 : 0,
      };
    })
    .filter((a) => a.sum > 0);

  const convert = (v: number) => (fxRate != null ? v * fxRate : null);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
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

        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: "#5B6472" }}>
            Also show in
          </label>
          <select
            value={secondaryCurrency ?? ""}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={currencySaving}
            className="border rounded px-2 py-1 text-sm"
            style={{ borderColor: "#E3E0D6", color: "#16233D" }}
          >
            <option value="">None</option>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {secondaryCurrency && (
            <span
              className="font-mono-num text-xs"
              style={{ color: "#5B6472" }}
            >
              {fxLoading ? (
                "..."
              ) : fxRate != null ? (
                <>
                  1 USD = {fxRate.toFixed(4)} {secondaryCurrency}
                </>
              ) : (
                "rate unavailable"
              )}
            </span>
          )}
        </div>
      </div>

      {/* Hero net worth card */}
      <div className="rounded-xl p-6" style={{ backgroundColor: "#16233D" }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "#1F6F5C" }}
            >
              <Wallet size={22} color="#FFFFFF" />
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "#9CA9C0" }}
              >
                Net Worth
              </p>
              <p className="font-mono-num text-4xl font-semibold text-white">
                {netWorth.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
              {secondaryCurrency && (
                <p
                  className="font-mono-num text-sm mt-0.5"
                  style={{ color: "#9CA9C0" }}
                >
                  {fxLoading
                    ? "converting..."
                    : convert(netWorth) != null
                      ? `≈ ${convert(netWorth)!.toLocaleString(undefined, { style: "currency", currency: secondaryCurrency })}`
                      : "rate unavailable"}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "#9CA9C0" }}
              >
                Assets
              </p>
              <p className="font-mono-num text-lg text-white">
                {totalAssets.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "#9CA9C0" }}
              >
                Owed
              </p>
              <p className="font-mono-num text-lg" style={{ color: "#F3A69C" }}>
                {totalLiabilities.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
            </div>
          </div>
        </div>

        {allocationByType.length > 0 && (
          <div className="mt-6">
            <div className="h-2 rounded-full overflow-hidden flex">
              {allocationByType.map((a) => (
                <div
                  key={a.type}
                  style={{
                    width: `${a.pct}%`,
                    backgroundColor:
                      TYPE_COLORS[a.type] === "#16233D"
                        ? "#3B4B6B"
                        : TYPE_COLORS[a.type],
                  }}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              {allocationByType.map((a) => (
                <span
                  key={a.type}
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: "#9CA9C0" }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        TYPE_COLORS[a.type] === "#16233D"
                          ? "#3B4B6B"
                          : TYPE_COLORS[a.type],
                    }}
                  />
                  {ACCOUNT_TYPE_LABELS[a.type]} · {a.pct.toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column: Cash + Investments */}
        <div className="space-y-6">
          <div
            className="rounded-lg border p-5"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="font-display text-lg font-medium"
                style={{ color: "#16233D" }}
              >
                Cash
              </h2>
              <Link
                to="/accounts"
                className="text-sm hover:underline"
                style={{ color: "#1F6F5C" }}
              >
                View all →
              </Link>
            </div>
            {topCash.length === 0 ? (
              <p
                className="text-center py-4 text-sm"
                style={{ color: "#5B6472" }}
              >
                No checking or savings accounts yet.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
                {topCash.map((a) => {
                  const Icon = TYPE_ICONS[a.accountType] ?? Wallet;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-full p-1.5"
                          style={{
                            backgroundColor: `${TYPE_COLORS[a.accountType]}1A`,
                          }}
                        >
                          <Icon
                            size={14}
                            color={TYPE_COLORS[a.accountType] ?? "#16233D"}
                          />
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#16233D" }}
                          >
                            {a.name}
                          </p>
                          <p className="text-xs" style={{ color: "#5B6472" }}>
                            {ACCOUNT_TYPE_LABELS[a.accountType]}
                            {a.institutionName ? ` · ${a.institutionName}` : ""}
                          </p>
                        </div>
                      </div>
                      <p
                        className="font-mono-num text-sm font-medium"
                        style={{ color: "#16233D" }}
                      >
                        {a.currency}{" "}
                        {a.currentBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className="rounded-lg border p-5"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2
                className="font-display text-lg font-medium"
                style={{ color: "#16233D" }}
              >
                Investments
              </h2>
              <Link
                to="/accounts"
                className="text-sm hover:underline"
                style={{ color: "#1F6F5C" }}
              >
                View all →
              </Link>
            </div>
            {topInvestments.length === 0 ? (
              <p
                className="text-center py-4 text-sm"
                style={{ color: "#5B6472" }}
              >
                No investment accounts yet.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
                {topInvestments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full p-1.5"
                        style={{
                          backgroundColor: `${TYPE_COLORS.Investment}1A`,
                        }}
                      >
                        <TrendingUp size={14} color={TYPE_COLORS.Investment} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#16233D" }}
                        >
                          {a.name}
                        </p>
                        <p className="text-xs" style={{ color: "#5B6472" }}>
                          Investment
                          {a.institutionName ? ` · ${a.institutionName}` : ""}
                        </p>
                      </div>
                    </div>
                    <p
                      className="font-mono-num text-sm font-medium"
                      style={{ color: "#16233D" }}
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

        {/* Right column: Credit Cards + Recent Activity */}
        <div className="space-y-6">
          {liabilities.length > 0 && (
            <div
              className="rounded-lg border p-5"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="font-display text-lg font-medium"
                  style={{ color: "#16233D" }}
                >
                  Credit Cards
                </h2>
                <Link
                  to="/accounts"
                  className="text-sm hover:underline"
                  style={{ color: "#1F6F5C" }}
                >
                  View all →
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
                {liabilities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-full p-1.5"
                        style={{ backgroundColor: "#A83B321A" }}
                      >
                        <CreditCard size={14} color="#A83B32" />
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#16233D" }}
                        >
                          {a.name}
                        </p>
                        <p className="text-xs" style={{ color: "#5B6472" }}>
                          {a.institutionName
                            ? a.institutionName
                            : "Credit Card"}
                          {a.balanceAsOfDate
                            ? ` · as of ${a.balanceAsOfDate}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p
                      className="font-mono-num text-sm font-medium"
                      style={{ color: "#A83B32" }}
                    >
                      {a.currency}{" "}
                      {a.currentBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="rounded-lg border p-5"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} color="#16233D" />
              <h2
                className="font-display text-lg font-medium"
                style={{ color: "#16233D" }}
              >
                Recent Activity
              </h2>
            </div>

            {activity.length === 0 ? (
              <p
                className="text-center py-4 text-sm"
                style={{ color: "#5B6472" }}
              >
                No transactions yet.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
                {activity.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm" style={{ color: "#16233D" }}>
                        {t.description}
                      </p>
                      <p className="text-xs" style={{ color: "#5B6472" }}>
                        {t.accountName} · {t.date}
                      </p>
                    </div>
                    <p
                      className="font-mono-num text-sm font-medium"
                      style={{ color: "#16233D" }}
                    >
                      {t.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
