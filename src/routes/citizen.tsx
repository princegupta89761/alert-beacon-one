import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useAlerts } from "@/lib/hooks";
import {
  SmsPanel, AppPanel, TwitterPanel, RadioPanel, SirenPanel, SeverityBadge, timeAgo,
} from "@/components/ChannelPanels";
import { MeshSimulator } from "@/components/MeshSimulator";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "Citizen Alerts — UMCES Live Broadcasts" },
      {
        name: "description",
        content:
          "Live emergency alerts published by verified authorities, synchronised in real time across SMS, mobile app, social media and radio.",
      },
      { property: "og:title", content: "UMCES — Live Citizen Alerts" },
      {
        property: "og:description",
        content: "Real-time multi-channel emergency broadcasts for citizens.",
      },
    ],
  }),
  component: CitizenPage,
});

function CitizenPage() {
  const alerts = useAlerts();
  const active = alerts.filter((a) => a.status !== "cancelled");
  const headline = active[0];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* live ticker */}
      <div className="bg-gov-navy-deep text-gov-gold text-sm overflow-hidden border-b-2 border-gov-gold">
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="text-[10px] uppercase tracking-widest bg-gov-gold text-gov-navy-deep px-2 py-0.5 rounded font-bold shrink-0">
            ● Live
          </span>
          <div className="overflow-hidden flex-1">
            <div className="whitespace-nowrap animate-ticker">
              {active.length === 0
                ? "All clear · No active emergency broadcasts at this time."
                : active.map((a) => `[${a.severity.toUpperCase()}] ${a.title} — ${a.region}`).join("   •   ")}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-gov-navy">Public Alerts</div>
            <h1 className="font-serif text-3xl font-semibold text-gov-navy">Citizen View</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Same alert, every channel, in real time. No need to refresh.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {active.length} active · {alerts.length} total broadcasts
          </div>
        </div>

        {headline && (
          <div className={`rounded-lg p-5 mb-8 border-l-8 ${
            headline.severity === "critical" ? "bg-destructive/10 border-destructive" :
            headline.severity === "high" ? "bg-accent/10 border-accent" :
            "bg-secondary border-gov-navy"
          }`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={headline.severity} />
                  <span className="text-xs text-muted-foreground">
                    {headline.region} · issued by {headline.authorName} · {timeAgo(headline.updatedAt)}
                    {headline.version > 1 && <> · <em>updated v{headline.version}</em></>}
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-gov-navy mt-2">{headline.title}</h2>
                <p className="text-foreground/90 mt-2 max-w-3xl">{headline.message}</p>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {headline.channels.map((c) => (
                  <span key={c} className="px-2 py-1 rounded bg-gov-navy text-white uppercase tracking-wider">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SmsPanel alerts={alerts} />
          <AppPanel alerts={alerts} />
          <TwitterPanel alerts={alerts} />
          <RadioPanel alerts={alerts} />
          <SirenPanel alerts={alerts} />
          <div className="bg-gov-navy text-white rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-gov-gold">Sync Status</div>
              <div className="font-serif text-xl mt-1">All channels in sync</div>
              <p className="text-sm text-white/70 mt-2">
                Every panel above is reading from the same central record. When an authority updates an alert,
                all channels reflect the change instantly.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4 text-center text-[10px]">
              {["SMS", "APP", "𝕏", "RADIO", "SIREN"].map((c) => (
                <div key={c} className="py-2 rounded bg-white/10 border border-white/20">
                  ✓ {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h3 className="font-serif text-xl text-gov-navy font-semibold">Broadcast History</h3>
          <div className="mt-3 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2">Severity</th>
                  <th className="text-left px-4 py-2">Title</th>
                  <th className="text-left px-4 py-2 hidden sm:table-cell">Region</th>
                  <th className="text-left px-4 py-2 hidden md:table-cell">Channels</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No broadcasts yet.</td></tr>
                )}
                {alerts.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-secondary/40">
                    <td className="px-4 py-2"><SeverityBadge severity={a.severity} /></td>
                    <td className="px-4 py-2 font-medium">{a.title}</td>
                    <td className="px-4 py-2 hidden sm:table-cell text-muted-foreground">{a.region}</td>
                    <td className="px-4 py-2 hidden md:table-cell text-xs text-muted-foreground">{a.channels.join(", ")}</td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                        a.status === "cancelled" ? "bg-muted text-muted-foreground" :
                        a.status === "updated" ? "bg-gov-gold text-gov-navy-deep" :
                        "bg-gov-navy text-white"
                      }`}>
                        {a.status} v{a.version}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">{timeAgo(a.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
