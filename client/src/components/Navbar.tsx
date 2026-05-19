import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 text-sm font-medium transition",
      isActive
        ? "bg-brand-100 text-brand-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    ].join(" ");

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-bold text-slate-950">
          Scalable Jobs
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>
          <NavLink to="/companies" className={linkClass}>
            Companies
          </NavLink>
          {isAuthenticated ? (
            <>
              {user?.role === "CANDIDATE" && (
                <>
                  <NavLink to="/candidate-dashboard" className={linkClass}>
                    Candidate Dashboard
                  </NavLink>
                  <NavLink to="/my-applications" className={linkClass}>
                    My Applications
                  </NavLink>
                </>
              )}
              {user?.role === "EMPLOYER" && (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/employer/applications" className={linkClass}>
                    Applications
                  </NavLink>
                </>
              )}
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.success("Logged out successfully");
                  navigate("/");
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
