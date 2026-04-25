import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { MeshSimulator } from "@/components/MeshSimulator";
import { useAlerts } from "@/lib/hooks";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Offline / Mesh Simulator — UMCES" },
      {
        name: "description",
        content:
          "Test how UMCES delivers emergency alerts via Bluetooth mesh and local sirens when the internet is down.",
      },
      { property: "og:title", content: "UMCES — Offline & Mesh Resilience" },
      {
        property: "og:description",
        content: "Simulate an internet outage and watch alerts propagate hop-by-hop through citizen devices.",
      },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  const alerts = useAlerts();
  const latest = alerts.find((a) => a.status !== "cancelled") ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-gov-navy">Resilience</div>
          <h1 className="font-serif text-3xl font-semibold text-gov-navy">Offline & Mesh Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            When mobile networks fail during disasters, UMCES falls back to a Bluetooth mesh between
            citizen devices and locally-triggered sirens. Use this simulator to demonstrate that flow.
          </p>
        </div>

        <MeshSimulator latestAlert={latest} />

        <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
          <Tip title="① Toggle outage">
            Click <em>Simulate outage</em> to cut the cloud uplink. SMS, app, Twitter and radio go silent.
          </Tip>
          <Tip title="② Mesh kicks in">
            Publish a Critical or High alert from the dashboard — it's relayed hop-by-hop through nearby devices.
          </Tip>
          <Tip title="③ Sirens sound">
            Local sirens activate automatically the moment a node receives the alert. No data plan required.
          </Tip>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="font-semibold text-gov-navy">{title}</div>
      <div className="text-muted-foreground text-xs mt-1">{children}</div>
    </div>
  );
}
