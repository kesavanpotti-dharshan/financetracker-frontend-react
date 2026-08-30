import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          Sign in
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
          className="w-full border rounded px-3 py-2"
          style={{ borderColor: "#E3E0D6" }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white rounded py-2 font-medium disabled:opacity-50"
          style={{ backgroundColor: "#1F6F5C" }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        <p className="text-sm text-center" style={{ color: "#5B6472" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#1F6F5C" }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
