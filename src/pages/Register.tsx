import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F7F6F2" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-lg shadow-sm border space-y-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
      >
        <h1
          className="font-display text-2xl font-semibold"
          style={{ color: "#16233D" }}
        >
          Create an account
        </h1>
        {error && (
          <p className="text-sm" style={{ color: "#A83B32" }}>
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          style={{ borderColor: "#E3E0D6" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border rounded px-3 py-2"
          style={{ borderColor: "#E3E0D6" }}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          className="w-full border rounded px-3 py-2"
          style={{ borderColor: "#E3E0D6" }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white rounded py-2 font-medium disabled:opacity-50"
          style={{ backgroundColor: "#1F6F5C" }}
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="text-sm text-center" style={{ color: "#5B6472" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1F6F5C" }}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
