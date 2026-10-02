import { useEffect, useState } from "react";
import { Repeat, TrendingUp, Clock } from "lucide-react";
import type { Subscription, SubscriptionSummary } from "../lib/subscriptions";
import {
  getSubscriptions,
  getUpcomingSubscriptions,
  getSubscriptionSummary,
} from "../lib/subscriptions";
import SubscriptionCard from "../components/SubscriptionCard";
import CreateSubscriptionForm from "../components/CreateSubscriptionForm";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcoming, setUpcoming] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [subs, soon, summaryData] = await Promise.all([
        getSubscriptions(),
        getUpcomingSubscriptions(30),
        getSubscriptionSummary(),
      ]);
      setSubscriptions(subs);
      setUpcoming(soon);
      setSummary(summaryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load subscriptions",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p style={{ color: "#5B6472" }}>Loading...</p>;
  if (error) return <p style={{ color: "#A83B32" }}>{error}</p>;

  const topFive = [...subscriptions]
    .sort((a, b) => b.monthlyEquivalentAmount - a.monthlyEquivalentAmount)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1
            className="font-display text-3xl font-semibold"
            style={{ color: "#16233D" }}
          >
            Subscriptions
          </h1>
          <p className="text-sm mt-1" style={{ color: "#5B6472" }}>
            Track recurring charges and upcoming renewals
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm((s) => !s)}
          className="text-white rounded px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: "#1F6F5C" }}
        >
          {showCreateForm ? "Close" : "+ Add Subscription"}
        </button>
      </div>

      {showCreateForm && (
        <CreateSubscriptionForm
          onCreated={() => {
            setShowCreateForm(false);
            load();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Summary */}
      {summary && (
        <div className="rounded-xl p-6" style={{ backgroundColor: "#16233D" }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "#9CA9C0" }}
              >
                Active Subscriptions
              </p>
              <p className="font-mono-num text-3xl font-semibold text-white">
                {summary.activeCount}
              </p>
            </div>
            {summary.monthlyTotalsByCurrency.map((t) => (
              <div key={t.currency}>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "#9CA9C0" }}
                >
                  Monthly Spend ({t.currency})
                </p>
                <p className="font-mono-num text-3xl font-semibold text-white">
                  {t.currency}{" "}
                  {t.totalMonthlyCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Top 5 highest subscriptions */}
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} color="#16233D" />
            <h2
              className="font-display text-lg font-medium"
              style={{ color: "#16233D" }}
            >
              Top 5 Highest Subscriptions
            </h2>
          </div>

          {topFive.length === 0 ? (
            <p
              className="text-center py-4 text-sm"
              style={{ color: "#5B6472" }}
            >
              No active subscriptions yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
              {topFive.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-full w-7 h-7 flex items-center justify-center font-mono-num text-xs font-semibold"
                      style={{
                        backgroundColor: "#16233D1A",
                        color: "#16233D",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "#16233D" }}
                      >
                        {s.name}
                      </p>
                      <p className="text-xs" style={{ color: "#5B6472" }}>
                        {s.billingCycle} · next {s.nextBillingDate}
                      </p>
                    </div>
                  </div>
                  <p
                    className="font-mono-num text-sm font-medium"
                    style={{ color: "#A83B32" }}
                  >
                    {s.currency}{" "}
                    {s.monthlyEquivalentAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                    /mo
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming renewals */}
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
              Renewing in the Next 30 Days
            </h2>
          </div>

          {upcoming.length === 0 ? (
            <p
              className="text-center py-4 text-sm"
              style={{ color: "#5B6472" }}
            >
              Nothing renewing soon.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: "#E3E0D6" }}>
              {upcoming.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#16233D" }}
                    >
                      {s.name}
                    </p>
                    <p className="text-xs" style={{ color: "#5B6472" }}>
                      {s.nextBillingDate}
                    </p>
                  </div>
                  <p
                    className="font-mono-num text-sm font-medium"
                    style={{ color: "#16233D" }}
                  >
                    {s.currency}{" "}
                    {s.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All subscriptions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Repeat size={16} color="#16233D" />
          <h2
            className="font-display text-lg font-medium"
            style={{ color: "#16233D" }}
          >
            All Subscriptions{" "}
            {subscriptions.length > 0 && (
              <span className="font-mono-num" style={{ color: "#5B6472" }}>
                ({subscriptions.length})
              </span>
            )}
          </h2>
        </div>

        {subscriptions.length === 0 ? (
          <p className="text-sm" style={{ color: "#5B6472" }}>
            No subscriptions yet — add one above.
          </p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((s) => (
              <SubscriptionCard key={s.id} subscription={s} onChanged={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
