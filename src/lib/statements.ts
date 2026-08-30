import { apiFetch } from "./apiClient";

export interface Statement {
  id: string;
  accountId: string;
  status: string; // Pending | Parsed | Failed | Reviewed
  rawExtractedJson: string | null;
  uploadedAt: string;
  errorMessage: string | null;
}

export interface ExtractedData {
  statementDate: string | null;
  dueDate: string | null;
  closingBalance: number | null;
  creditLimit: number | null;
  minPayment: number | null;
  accountLast4: string | null;
  transactions: { date: string; description: string; amount: number }[];
}

export async function uploadStatement(
  accountId: string,
  file: File,
): Promise<Statement> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/api/statements/upload/${accountId}`, {
    method: "POST",
    body: formData,
    // note: don't set Content-Type here — the browser sets the multipart boundary automatically
  });
  if (!res.ok) throw new Error("Failed to upload statement");
  return res.json();
}

export async function getStatement(id: string): Promise<Statement> {
  const res = await apiFetch(`/api/statements/${id}`);
  if (!res.ok) throw new Error("Failed to load statement");
  return res.json();
}

export async function confirmStatement(
  statementId: string,
  confirmedBalance: number,
  asOfDate: string,
): Promise<{ accountId: string; balance: number; asOfDate: string }> {
  const res = await apiFetch(`/api/statements/${statementId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ statementId, confirmedBalance, asOfDate }),
  });
  if (!res.ok) throw new Error("Failed to confirm statement");
  return res.json();
}

export function parseExtractedJson(raw: string | null): ExtractedData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
