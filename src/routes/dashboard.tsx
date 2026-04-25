import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useAlerts, useAuth } from "@/lib/hooks";
import {
  cancelAlert, createAlert, deleteAlert, updateAlert,
  type Channel, type Severity, type Alert,
} from "@/lib/store";
import { SeverityBadge, timeAgo } from "@/components/ChannelPanels";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Authority Dashboard — UMCES" },
      { name: "description", content: "Compose and broadcast verified emergency alerts across every channel." },
    ],
  }),
  component: DashboardPage,
});

const ALL_CHANNELS: { id: Channel; label: string }[] = [
  { id: "sms", label: "SMS" },
  { id: "app", label: "Mobile App" },
  { id: "twitter", label: "Social (X)" },
  { id: "radio", label: "Radio" },
  { id: "siren", label: "Siren / Mesh" },
];

function DashboardPage() {
  const user = useAuth();
  const alerts = useAlerts();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      // give the hook one render to hydrate
      const t = setTimeout(() => {
        if (!user) navigate({ to: "/login" });
      }, 30);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Authority sign-in required.</p>
            <Link to="/login" className="inline-block mt-3 px-4 py-2 rounded bg-gov-navy text-white text-sm">
              Go to login
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Composer />
          <Stats alerts={alerts} />
        </div>
        <div className="lg:col-span-3">
          <Manage alerts={alerts} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Composer() {
  const user = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("high");
  const [region, setRegion] = useState("All Regions");
  const [channels, setChannels] = useState<Channel[]>(["sms", "app", "twitter", "radio"]);
  const [flash, setFlash] = useState<string | null>(null);

  function toggle(c: Channel) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !message.trim() || channels.length === 0) {
      setFlash("Fill title, message and select at least one channel.");
      return;
    }
    // Auto-activate sirens for critical/high alerts (offline mode)
    const finalChannels =
      severity === "critical" || severity === "high"
        ? Array.from(new Set([...channels, "siren" as Channel]))
        : channels;
    createAlert({
      title: title.trim(),
      message: message.trim(),
      severity,
      region: region.trim() || "All Regions",
      channels: finalChannels,
      authorName: user.name,
      authorEmail: user.email,
    });
    setTitle("");
    setMessage("");
    setFlash(`✓ Broadcast published to ${finalChannels.length} channel(s).`);
    setTimeout(() => setFlash(null), 3500);
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden shadow-elegant">
      <div className="bg-gov-navy-deep text-white px-5 py-4 border-b-4 border-gov-gold">
        <div className="text-xs uppercase tracking-widest text-gov-gold">Compose Broadcast</div>
        <h2 className="font-serif text-xl font-semibold">New Emergency Alert</h2>
      </div>
      <form onSubmit={publish} className="p-5 space-y-4">
        <Field label="Alert title" value={title} onChange={setTitle} placeholder="e.g. Cyclone Warning — Coastal Districts" />
        <div>
          <label className="block text-xs font-medium mb-1">Message to citizens</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gov-navy/30 text-sm"
            placeholder="Clear instruction. e.g. Evacuate to nearest shelter immediately."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 border rounded bg-background text-sm"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low / Advisory</option>
            </select>
          </div>
          <Field label="Region" value={region} onChange={setRegion} placeholder="District / state" />
        </div>

        <div>
          <div className="text-xs font-medium mb-1">Broadcast channels</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_CHANNELS.map((c) => {
              const active = channels.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`text-xs px-3 py-2 rounded border transition ${
                    active
                      ? "bg-gov-navy text-white border-gov-navy"
                      : "bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {active ? "✓ " : ""}{c.label}
                </button>
              );
            })}
          </div>
          {(severity === "critical" || severity === "high") && !channels.includes("siren") && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Siren / mesh will be auto-activated for {severity} alerts.
            </p>
          )}
        </div>

        {flash && (
          <div className="text-sm bg-secondary border rounded px-3 py-2 text-gov-navy">{flash}</div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded bg-destructive text-destructive-foreground font-semibold hover:brightness-110 transition uppercase tracking-wider text-sm"
        >
          📡 Broadcast Now
        </button>
      </form>
    </div>
  );
}

function Stats({ alerts }: { alerts: Alert[] }) {
  const active = alerts.filter((a) => a.status !== "cancelled").length;
  const critical = alerts.filter((a) => a.severity === "critical" && a.status !== "cancelled").length;
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <Stat label="Total" value={alerts.length} />
      <Stat label="Active" value={active} accent />
      <Stat label="Critical" value={critical} danger />
    </div>
  );
}
function Stat({ label, value, accent, danger }: { label: string; value: number; accent?: boolean; danger?: boolean }) {
  return (
    <div className={`border rounded-lg p-3 text-center ${
      danger ? "bg-destructive text-destructive-foreground" :
      accent ? "bg-gov-navy text-white" : "bg-card"
    }`}>
      <div className="text-2xl font-serif font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-widest opacity-80">{label}</div>
    </div>
  );
}

function Manage({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="bg-card border rounded-lg">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Operations</div>
          <h2 className="font-serif text-xl font-semibold text-gov-navy">Manage Broadcasts</h2>
        </div>
        <Link
          to="/citizen"
          target="_blank"
          className="text-xs px-3 py-1.5 rounded border border-gov-navy text-gov-navy hover:bg-secondary"
        >
          Open citizen view ↗
        </Link>
      </div>
      <div className="divide-y">
        {alerts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No broadcasts yet. Publish your first alert from the composer.
          </div>
        )}
        {alerts.map((a) => <Row key={a.id} a={a} />)}
      </div>
    </div>
  );
}

function Row({ a }: { a: Alert }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(a.message);

  function saveEdit() {
    updateAlert(a.id, { message: draft, status: "updated" });
    setEditing(false);
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={a.severity} />
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
              a.status === "cancelled" ? "bg-muted text-muted-foreground" :
              a.status === "updated" ? "bg-gov-gold text-gov-navy-deep" :
              "bg-gov-navy text-white"
            }`}>{a.status} v{a.version}</span>
            <span className="text-[11px] text-muted-foreground">
              {a.region} · by {a.authorName} · {timeAgo(a.updatedAt)}
            </span>
          </div>
          <div className="font-semibold mt-1">{a.title}</div>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full mt-2 px-3 py-2 border rounded bg-background text-sm"
            />
          ) : (
            <div className="text-sm text-muted-foreground mt-1">{a.message}</div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {a.channels.map((c) => (
              <span key={c} className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {editing ? (
            <>
              <button onClick={saveEdit} className="text-xs px-3 py-1.5 rounded bg-gov-navy text-white">
                Save & resync
              </button>
              <button onClick={() => { setEditing(false); setDraft(a.message); }} className="text-xs px-3 py-1.5 rounded border">
                Cancel
              </button>
            </>
          ) : (
            <>
              {a.status !== "cancelled" && (
                <>
                  <button onClick={() => setEditing(true)} className="text-xs px-3 py-1.5 rounded border border-gov-navy text-gov-navy">
                    Edit
                  </button>
                  <button
                    onClick={() => cancelAlert(a.id)}
                    className="text-xs px-3 py-1.5 rounded bg-accent text-accent-foreground"
                  >
                    Cancel alert
                  </button>
                </>
              )}
              <button
                onClick={() => { if (confirm("Delete this broadcast permanently?")) deleteAlert(a.id); }}
                className="text-xs px-3 py-1.5 rounded text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:ring-2 focus:ring-gov-navy/30 text-sm"
      />
    </label>
  );
}
