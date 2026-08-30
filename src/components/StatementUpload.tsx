import { useState } from "react";
import {
  uploadStatement,
  confirmStatement,
  parseExtractedJson,
} from "../lib/statements";
import type { Statement } from "../lib/statements";

export default function StatementUpload({
  accountId,
  onConfirmed,
}: {
  accountId: string;
  onConfirmed: () => void;
}) {
  const [statement, setStatement] = useState<Statement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmedBalance, setConfirmedBalance] = useState("");
  const [asOfDate, setAsOfDate] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setStatement(null);
    try {
      const result = await uploadStatement(accountId, file);
      setStatement(result);

      const extracted = parseExtractedJson(result.rawExtractedJson);
      if (extracted?.closingBalance != null)
        setConfirmedBalance(extracted.closingBalance.toString());
      if (extracted?.statementDate) setAsOfDate(extracted.statementDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirm() {
    if (!statement) return;
    setError(null);
    setConfirming(true);
    try {
      await confirmStatement(
        statement.id,
        parseFloat(confirmedBalance),
        asOfDate,
      );
      setStatement(null);
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed");
    } finally {
      setConfirming(false);
    }
  }

  const extracted = statement
    ? parseExtractedJson(statement.rawExtractedJson)
    : null;

  return (
    <div
      className="rounded-lg p-5 space-y-4 border"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
    >
      <h3 className="font-medium" style={{ color: "#16233D" }}>
        Upload Statement
      </h3>

      {!statement && (
        <div>
          <label
            className="inline-block text-sm font-medium rounded px-4 py-2 cursor-pointer border"
            style={{
              backgroundColor: "#EEF4F2",
              color: "#1F6F5C",
              borderColor: "#1F6F5C33",
            }}
          >
            {uploading ? "Uploading..." : "Choose PDF statement"}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && (
            <p className="text-sm mt-2" style={{ color: "#5B6472" }}>
              Uploading and extracting — this can take a few seconds...
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: "#A83B32" }}>
          {error}
        </p>
      )}

      {statement?.status === "Failed" && (
        <div className="text-sm" style={{ color: "#A83B32" }}>
          <p className="font-medium">Extraction failed</p>
          <p>{statement.errorMessage}</p>
          <button
            onClick={() => setStatement(null)}
            className="hover:underline mt-2"
            style={{ color: "#1F6F5C" }}
          >
            Try another file
          </button>
        </div>
      )}

      {statement?.status === "Parsed" && extracted && (
        <div className="space-y-4">
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#16233D" }}
            >
              Review extracted data
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#5B6472" }}
                >
                  Statement balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={confirmedBalance}
                  onChange={(e) => setConfirmedBalance(e.target.value)}
                  className="w-full border rounded px-2 py-1 font-mono-num"
                  style={{ borderColor: "#E3E0D6" }}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: "#5B6472" }}
                >
                  As of date
                </label>
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  style={{ borderColor: "#E3E0D6" }}
                />
              </div>
            </div>
            {extracted.dueDate && (
              <p className="text-xs mt-2" style={{ color: "#5B6472" }}>
                AI-detected due date: {extracted.dueDate}
              </p>
            )}
          </div>

          {extracted.transactions.length > 0 && (
            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: "#16233D" }}
              >
                {extracted.transactions.length} transaction
                {extracted.transactions.length !== 1 ? "s" : ""} found
              </p>
              <div
                className="border rounded divide-y max-h-48 overflow-y-auto"
                style={{ borderColor: "#E3E0D6" }}
              >
                {extracted.transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex justify-between px-3 py-2 text-xs"
                    style={{ borderColor: "#E3E0D6" }}
                  >
                    <span style={{ color: "#5B6472" }}>
                      {tx.date} · {tx.description}
                    </span>
                    <span
                      className="font-mono-num font-medium"
                      style={{ color: "#16233D" }}
                    >
                      {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: "#A3A3A3" }}>
                These will be added to your transaction history when you
                confirm.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={confirming || !confirmedBalance || !asOfDate}
              className="text-white text-sm font-medium rounded px-4 py-2 disabled:opacity-50"
              style={{ backgroundColor: "#1F6F5C" }}
            >
              {confirming ? "Confirming..." : "Confirm & Save"}
            </button>
            <button
              onClick={() => setStatement(null)}
              className="text-sm px-4 py-2"
              style={{ color: "#5B6472" }}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
