import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F6F2" }}>
      <nav
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E3E0D6" }}
      >
        <div className="flex items-center gap-6">
          <span
            className="font-display font-semibold"
            style={{ color: "#16233D" }}
          >
            FinanceTracker
          </span>
          <Link
            to="/dashboard"
            className="text-sm hover:underline"
            style={{ color: "#5B6472" }}
          >
            Dashboard
          </Link>
          <Link
            to="/accounts"
            className="text-sm hover:underline"
            style={{ color: "#5B6472" }}
          >
            Accounts
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm" style={{ color: "#5B6472" }}>
              {user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm hover:underline"
            style={{ color: "#A83B32" }}
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
