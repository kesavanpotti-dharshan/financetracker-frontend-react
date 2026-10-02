import { useState } from "react";
import type { Subscription } from "../lib/subscriptions";
import { cancelSubscription } from "../lib/subscriptions";
import EditSubscriptionForm from "./EditSubscriptionForm";

export default function SubscriptionCard({
  subscription,
  onChanged,
}: {
  subscription: Subscription;
  onChanged: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  async function handleCancel() {
    if (
      !confirm(
        `Cancel "${subscription.name}"? This stops tracking future renewals.`,
      )
    )
      return;
    await cancelSubscription(subscription.id);
    onChanged();
  }

  return (
    <div
      className="border rounded-lg p-4"
      style={{ borderColor: "#E3E0D6", backgroundColor: "#FFFFFF" }}
    >
      {isEditing ? (
        <EditSubscriptionForm
          subscription={subscription}
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
              {subscription.name}
            </p>
            <span
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: "#1F6F5C", color: "#FFFFFF" }}
            >
              {subscription.billingCycle}
            </span>
            <p className="text-xs mt-1" style={{ color: "#5B6472" }}>
              {subscription.category ? `${subscription.category} · ` : ""}
              next billing {subscription.nextBillingDate}
            </p>
          </div>
          <div className="text-right">
            <p
              className="font-mono-num text-lg font-medium"
              style={{ color: "#16233D" }}
            >
              {subscription.currency}{" "}
              {subscription.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            {subscription.billingCycle !== "Monthly" && (
              <p className="font-mono-num text-xs" style={{ color: "#5B6472" }}>
                ≈ {subscription.currency}{" "}
                {subscription.monthlyEquivalentAmount.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 },
                )}
                /mo
              </p>
            )}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="flex gap-4 mt-3 text-sm">
          <button
            onClick={() => setIsEditing(true)}
            className="hover:underline"
            style={{ color: "#1F6F5C" }}
          >
            Edit
          </button>
          <button
            onClick={handleCancel}
            className="ml-auto hover:underline"
            style={{ color: "#A3A3A3" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
