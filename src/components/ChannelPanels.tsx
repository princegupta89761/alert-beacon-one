import type { Alert, Severity } from "@/lib/store";

const sevLabel: Record<Severity, string> = {
  critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`severity-${severity} text-[10px] font-bold tracking-wider px-2 py-0.5 rounded`}>
      {sevLabel[severity]}
    </span>
  );
}

export function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleString();
}

interface PanelProps {
  alerts: Alert[];
}

function activeAlertsFor(channel: keyof Alert["channels"] | string, alerts: Alert[]): Alert[] {
  return alerts
    .filter((a) => a.status !== "cancelled" && a.channels.includes(channel as Alert["channels"][number]))
    .slice(0, 5);
}

export function SmsPanel({ alerts }: PanelProps) {
  const list = activeAlertsFor("sms", alerts);
  return (
    <ChannelShell title="SMS Gateway" icon="📱" subtitle="Bulk SMS to registered numbers">
      <div className="space-y-2">
        {list.length === 0 && <Empty label="No active SMS broadcasts." />}
        {list.map((a) => (
          <div key={a.id} className="bg-secondary rounded p-3 text-sm border-l-4 border-gov-navy">
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>+91-DM-ALERT</span>
              <span>{timeAgo(a.updatedAt)}</span>
            </div>
            <div className="font-medium mt-1">[{a.severity.toUpperCase()}] {a.title}</div>
            <div className="text-foreground/80 text-xs mt-1">{a.message}</div>
            <div className="text-[11px] text-muted-foreground mt-1">— {a.region} · v{a.version}</div>
          </div>
        ))}
      </div>
    </ChannelShell>
  );
}

export function AppPanel({ alerts }: PanelProps) {
  const list = activeAlertsFor("app", alerts);
  return (
    <ChannelShell title="Mobile App" icon="🔔" subtitle="Push notifications">
      <div className="space-y-2">
        {list.length === 0 && <Empty label="No active app notifications." />}
        {list.map((a) => (
          <div key={a.id} className="bg-card rounded p-3 text-sm border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gov-navy text-white flex items-center justify-center text-xs">⚠</div>
                <div className="text-xs font-medium">UMCES Alerts</div>
              </div>
              <SeverityBadge severity={a.severity} />
            </div>
            <div className="font-semibold mt-2">{a.title}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{a.message}</div>
            <div className="text-[11px] text-muted-foreground mt-2">{a.region} · {timeAgo(a.updatedAt)}</div>
          </div>
        ))}
      </div>
    </ChannelShell>
  );
}

export function TwitterPanel({ alerts }: PanelProps) {
  const list = activeAlertsFor("twitter", alerts);
  return (
    <ChannelShell title="Social Media" icon="𝕏" subtitle="@UMCES_Alerts">
      <div className="space-y-2">
        {list.length === 0 && <Empty label="No active social posts." />}
        {list.map((a) => (
          <div key={a.id} className="bg-card rounded p-3 text-sm border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gov-navy-deep text-gov-gold flex items-center justify-center font-bold">U</div>
              <div className="leading-tight">
                <div className="text-xs font-semibold">UMCES Alerts <span className="text-gov-gold">✓</span></div>
                <div className="text-[11px] text-muted-foreground">@UMCES_Alerts · {timeAgo(a.updatedAt)}</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              <span className="font-semibold">[{a.severity.toUpperCase()}]</span> {a.title}. {a.message}{" "}
              <span className="text-gov-navy">#{a.region.replace(/\s+/g, "")}</span>{" "}
              <span className="text-gov-navy">#EmergencyAlert</span>
            </div>
          </div>
        ))}
      </div>
    </ChannelShell>
  );
}

export function RadioPanel({ alerts }: PanelProps) {
  const list = activeAlertsFor("radio", alerts);
  return (
    <ChannelShell title="Radio Broadcast" icon="📻" subtitle="All India Radio · 101.0 MHz">
      <div className="space-y-2">
        {list.length === 0 && <Empty label="No bulletins on air." />}
        {list.map((a) => (
          <div key={a.id} className="bg-gov-navy-deep text-white rounded p-3 text-sm">
            <div className="flex items-center justify-between text-[11px] text-gov-gold">
              <span>● ON AIR</span>
              <span>{timeAgo(a.updatedAt)}</span>
            </div>
            <div className="mt-1 font-serif italic">
              “Attention. This is an emergency bulletin. {a.title}. {a.message} Region: {a.region}.”
            </div>
            <div className="text-[11px] text-white/60 mt-2">Bulletin v{a.version}</div>
          </div>
        ))}
      </div>
    </ChannelShell>
  );
}

export function SirenPanel({ alerts }: PanelProps) {
  const list = activeAlertsFor("siren", alerts);
  const active = list.length > 0;
  return (
    <ChannelShell title="Offline · Siren / Mesh" icon="🚨" subtitle="Bluetooth mesh + community sirens">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          active ? "bg-destructive text-white animate-siren" : "bg-secondary text-muted-foreground"
        }`}>
          🚨
        </div>
        <div className="text-sm">
          {active ? (
            <>
              <div className="font-semibold text-destructive">Sirens active in {list.length} alert(s)</div>
              <div className="text-xs text-muted-foreground">Mesh broadcast in progress · no internet required</div>
            </>
          ) : (
            <>
              <div className="font-medium">Sirens idle</div>
              <div className="text-xs text-muted-foreground">Activated automatically for critical/high alerts</div>
            </>
          )}
        </div>
      </div>
      {active && (
        <ul className="mt-3 text-xs text-muted-foreground space-y-1">
          {list.map((a) => <li key={a.id}>• {a.title} — {a.region}</li>)}
        </ul>
      )}
    </ChannelShell>
  );
}

function ChannelShell({
  title, icon, subtitle, children,
}: { title: string; icon: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b bg-secondary/60 flex items-center gap-2">
        <span className="text-lg" aria-hidden>{icon}</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-gov-navy">{title}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        <span className="ml-auto text-[10px] text-gov-gold uppercase tracking-widest">Live</span>
      </div>
      <div className="p-3 flex-1 min-h-[140px]">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-xs text-muted-foreground italic py-6 text-center">{label}</div>;
}
