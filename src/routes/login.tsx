import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { signIn, signUp } from "@/lib/store";
import { useAuth } from "@/lib/hooks";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Authority Login — UMCES" },
      {
        name: "description",
        content: "Authorised emergency officials sign in to publish verified alerts across all channels.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Disaster Management Cell");
  const [role, setRole] = useState("District Officer");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    // already signed in
    navigate({ to: "/dashboard" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res =
      mode === "signin"
        ? signIn(email, password)
        : signUp({ email, password, name, department, role });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/40">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-card border rounded-lg shadow-elegant overflow-hidden">
            <div className="bg-gov-navy-deep text-white px-6 py-5 border-b-4 border-gov-gold">
              <div className="text-xs uppercase tracking-widest text-gov-gold">Restricted Access</div>
              <h1 className="font-serif text-2xl font-semibold mt-1">Authority Portal</h1>
              <p className="text-sm text-white/70 mt-1">
                Only verified officials may publish emergency broadcasts.
              </p>
            </div>

            <div className="p-6">
              <div className="flex border rounded overflow-hidden mb-5 text-sm">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-2 ${mode === "signin" ? "bg-gov-navy text-white" : "bg-background"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 ${mode === "signup" ? "bg-gov-navy text-white" : "bg-background"}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <>
                    <Field label="Full name" value={name} onChange={setName} required />
                    <Field label="Department" value={department} onChange={setDepartment} />
                    <Field label="Role / designation" value={role} onChange={setRole} />
                  </>
                )}
                <Field label="Official email" type="email" value={email} onChange={setEmail} required />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  required
                  hint={mode === "signup" ? "Minimum 6 characters." : undefined}
                />

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-gov-navy text-white font-medium hover:bg-gov-navy-deep transition"
                >
                  {mode === "signin" ? "Sign in to dashboard" : "Create authority account"}
                </button>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Are you a citizen?{" "}
                  <Link to="/citizen" className="text-gov-navy underline">
                    Open public alerts view
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo build · accounts are stored locally in your browser only.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-foreground/80 mb-1">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gov-navy/30"
      />
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}
