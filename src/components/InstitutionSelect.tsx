import { useEffect, useState } from "react";
import type { Institution } from "../lib/institutions";
import { getInstitutions, createInstitution } from "../lib/institutions";

export default function InstitutionSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (institutionId: string | null) => void;
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    getInstitutions()
      .then(setInstitutions)
      .catch(() => {});
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    const created = await createInstitution(newName.trim());
    setInstitutions((prev) => [...prev, created]);
    onChange(created.id);
    setShowNewInput(false);
    setNewName("");
  }

  if (showNewInput) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          placeholder="New institution name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleCreate())
          }
          className="flex-1 border rounded px-3 py-2 text-sm"
          style={{ borderColor: "#E3E0D6" }}
        />
        <button
          type="button"
          onClick={handleCreate}
          className="text-sm font-medium"
          style={{ color: "#1F6F5C" }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShowNewInput(false)}
          className="text-sm"
          style={{ color: "#5B6472" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value === "__new__") {
          setShowNewInput(true);
        } else {
          onChange(e.target.value || null);
        }
      }}
      className="w-full border rounded px-3 py-2 text-sm"
      style={{ borderColor: "#E3E0D6" }}
    >
      <option value="">No institution</option>
      {institutions.map((i) => (
        <option key={i.id} value={i.id}>
          {i.name}
        </option>
      ))}
      <option value="__new__">+ Add new institution...</option>
    </select>
  );
}
