import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/hooks";
import { signOut } from "@/lib/store";

export function SiteHeader() {
  const user = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const linkClass = (active: boolean) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      active ? "text-gov-gold" : "text-white/80 hover:text-white"
    }`;

  return (
    <header className="bg-gov-navy-deep text-white border-b-4 border-gov-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gov-gold flex items-center justify-center text-gov-navy-deep font-bold text-lg shadow-elegant">
            ⚠
          </div>
          <div className="leading-tight">
            <div className="text-xs uppercase tracking-widest text-gov-gold">Govt. Emergency Portal</div>
            <div className="font-serif text-lg font-semibold">UMCES</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={linkClass(path === "/")}>Home</Link>
          <Link to="/citizen" className={linkClass(path.startsWith("/citizen"))}>Citizen View</Link>
          <Link to="/dashboard" className={linkClass(path.startsWith("/dashboard"))}>Authority</Link>
          <Link to="/offline" className={linkClass(path.startsWith("/offline"))}>Offline / Mesh</Link>
          <Link to="/about" className={linkClass(path.startsWith("/about"))}>About</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-white/70">
                {user.name} · {user.department}
              </span>
              <button
                onClick={() => signOut()}
                className="text-xs px-3 py-1.5 rounded border border-white/30 hover:bg-white/10 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-xs px-3 py-1.5 rounded bg-gov-gold text-gov-navy-deep font-semibold hover:brightness-105 transition"
            >
              Authority Login
            </Link>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden flex justify-around border-t border-white/10 bg-gov-navy">
        <Link to="/" className={linkClass(path === "/")}>Home</Link>
        <Link to="/citizen" className={linkClass(path.startsWith("/citizen"))}>Citizen</Link>
        <Link to="/dashboard" className={linkClass(path.startsWith("/dashboard"))}>Authority</Link>
        <Link to="/about" className={linkClass(path.startsWith("/about"))}>About</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-gov-navy-deep text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-xs flex flex-col sm:flex-row gap-2 justify-between">
        <div>
          © {new Date().getFullYear()} Unified Multi-Channel Emergency Communication System
        </div>
        <div>Demo build · Government of India · Disaster Management Cell</div>
      </div>
    </footer>
  );
}
