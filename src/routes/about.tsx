import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About UMCES — Unified Multi-Channel Emergency Communication System" },
      {
        name: "description",
        content:
          "Learn how UMCES synchronises emergency alerts across SMS, mobile app, social media, radio and offline sirens.",
      },
      { property: "og:title", content: "About UMCES" },
      {
        property: "og:description",
        content: "How a single, verified alert reaches every citizen, on every channel, instantly.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gov-gradient text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
            <div className="text-xs uppercase tracking-widest text-gov-gold">About the System</div>
            <h1 className="text-4xl sm:text-5xl font-semibold mt-2">
              Unified Multi-Channel Emergency Communication
            </h1>
            <p className="text-white/80 mt-4 max-w-2xl">
              A centralised disaster-communication platform that eliminates contradictory
              messaging across SMS, app, social media and radio.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
          <Block
            title="The Problem"
            body="Authorities release updates through multiple platforms, but with no central synchronisation. The result is inconsistent and delayed information, panic and wrong decisions during emergencies."
          />

          <Block
            title="Our Objectives"
            list={[
              "Provide a single centralised system for alert generation",
              "Ensure consistent messaging across all platforms",
              "Enable real-time updates without delay",
              "Maintain communication even in low or no network conditions",
            ]}
          />

          <Block
            title="Working Principle"
            list={[
              "Authority logs into the secure dashboard",
              "Creates and reviews an emergency alert",
              "System verifies and timestamps the broadcast",
              "Alert is dispatched simultaneously to all channels",
              "Citizens receive consistent, real-time information",
            ]}
          />

          <Block
            title="Example Scenario — Cyclone"
            body="One alert: ‘Evacuate to nearest shelter immediately.’ The system delivers the same message via SMS, mobile app, Twitter and radio at the same moment. No confusion, faster response, safer evacuation."
          />

          <div className="grid sm:grid-cols-2 gap-6">
            <Card title="Advantages" items={[
              "Eliminates misinformation",
              "Improves public trust",
              "Faster emergency response",
              "Works in both online and offline conditions",
              "Reduces panic and chaos",
            ]} />
            <Card title="Future Enhancements" items={[
              "AI-based alert prioritisation",
              "Regional language translation",
              "GPS-based location targeting",
              "Voice-based emergency instructions",
            ]} />
          </div>

          <div className="bg-secondary border rounded-lg p-6">
            <div className="text-xs uppercase tracking-widest text-gov-navy">Try the demo</div>
            <h3 className="font-serif text-xl font-semibold text-gov-navy mt-1">
              See real-time multi-channel sync
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Open the citizen view in one tab, sign in as authority in another, and publish an alert.
            </p>
            <div className="flex gap-2 mt-4">
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

function Block({ title, body, list }: { title: string; body?: string; list?: string[] }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-gov-navy font-semibold">{title}</h2>
      {body && <p className="text-muted-foreground mt-2">{body}</p>}
      {list && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {list.map((x) => (
            <li key={x} className="flex gap-2">
              <span className="text-gov-gold">▶</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border rounded-lg p-5 bg-card">
      <h3 className="font-semibold text-gov-navy">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {items.map((x) => (
          <li key={x}>• {x}</li>
        ))}
      </ul>
    </div>
  );
}
