import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UMCES — Unified Multi-Channel Emergency Communication System" },
      {
        name: "description",
        content:
          "Government of India emergency portal: one alert, broadcast simultaneously across SMS, Mobile App, Twitter, Radio and offline siren channels.",
      },
      { property: "og:title", content: "UMCES — Emergency Communication Portal" },
      {
        property: "og:description",
        content: "One trusted source. Every channel. Real time.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gov-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gov-gold/60 text-gov-gold text-xs uppercase tracking-widest mb-5">
                <span className="w-2 h-2 rounded-full bg-gov-gold animate-pulse" />
                Live System · Operational
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                One alert.<br />Every channel.<br />
                <span className="text-gov-gold">Zero confusion.</span>
              </h1>
              <p className="mt-6 text-white/80 text-lg max-w-xl">
                The Unified Multi-Channel Emergency Communication System (UMCES) lets
                authorised officials publish a single, verified alert that reaches
                citizens through SMS, the mobile app, social media, radio and offline
                sirens — all at the same time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/citizen"
                  className="px-5 py-3 rounded bg-gov-gold text-gov-navy-deep font-semibold hover:brightness-105 transition shadow-elegant"
                >
                  Open Citizen View
                </Link>
                <Link
                  to="/dashboard"
                  className="px-5 py-3 rounded border border-white/40 hover:bg-white/10 transition"
                >
                  Authority Dashboard
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white text-gov-navy-deep rounded-lg shadow-elegant p-6 border-t-4 border-gov-gold">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Sample broadcast
                  </div>
                  <span className="severity-critical text-xs px-2 py-0.5 rounded">CRITICAL</span>
                </div>
                <h3 className="font-serif text-xl font-semibold">Cyclone Warning — Coastal Districts</h3>
                <p className="text-sm mt-2 text-muted-foreground">
                  Evacuate to nearest shelter immediately. Do not return until the official all-clear is issued.
                </p>
                <div className="grid grid-cols-4 gap-2 mt-5">
                  {["SMS", "App", "Twitter", "Radio"].map((c) => (
                    <div
                      key={c}
                      className="text-center text-xs py-2 rounded bg-secondary text-secondary-foreground border"
                    >
                      ✓ {c}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[11px] text-muted-foreground">
                  Issued by: Disaster Management Cell · v1 · synced
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-semibold text-gov-navy">Why UMCES</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Different platforms used to give different information during emergencies.
            UMCES guarantees one verified message, delivered everywhere, instantly.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {[
              ["Centralised Alerts", "All alerts originate from a single, authenticated control dashboard — no duplicate sources."],
              ["Multi-Channel Broadcast", "SMS, Mobile App, Twitter, Radio and Sirens — all triggered from one publish action."],
              ["Real-Time Sync", "Every channel updates simultaneously. Edits propagate instantly to every citizen."],
              ["Offline Mode", "Sirens and Bluetooth mesh keep critical alerts flowing even with no internet."],
              ["Verified Authority", "Only authenticated officials can publish — preventing fake or misleading messages."],
              ["Auto Updates", "Cancel or revise an alert and every channel reflects the change in real time."],
            ].map(([title, body]) => (
              <div key={title} className="border bg-card rounded-lg p-5 hover:shadow-elegant transition">
                <div className="w-9 h-9 rounded bg-gov-navy text-gov-gold flex items-center justify-center font-serif font-bold mb-3">
                  ✦
                </div>
                <h3 className="font-semibold text-gov-navy">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-secondary border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-serif text-xl text-gov-navy font-semibold">Ready to see it in action?</div>
              <p className="text-sm text-muted-foreground">
                Sign in as an authority on one tab, open the citizen view on another. Watch them sync in real time.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 rounded bg-gov-navy text-white text-sm font-medium">
                Authority Login
              </Link>
              <Link to="/citizen" className="px-4 py-2 rounded border border-gov-navy text-gov-navy text-sm font-medium">
                Citizen View
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
