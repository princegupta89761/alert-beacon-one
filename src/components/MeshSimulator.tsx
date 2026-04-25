import { useEffect, useMemo, useRef, useState } from "react";
import type { Alert } from "@/lib/store";

/**
 * Offline / Bluetooth-mesh simulator.
 * - Toggle the internet OFF to simulate a network outage.
 * - The "Authority Tower" originates an alert that propagates hop-by-hop
 *   through nearby citizen nodes via Bluetooth mesh.
 * - Local sirens light up in the affected area.
 */

interface Node {
  id: string;
  x: number; // 0-100 %
  y: number; // 0-100 %
  label: string;
  isTower?: boolean;
  reached: boolean;
  hop: number | null;
}

const NODES: Omit<Node, "reached" | "hop">[] = [
  { id: "tower", x: 12, y: 50, label: "Authority Tower", isTower: true },
  { id: "n1", x: 28, y: 32 },
  { id: "n2", x: 30, y: 68 },
  { id: "n3", x: 46, y: 22 },
  { id: "n4", x: 48, y: 50 },
  { id: "n5", x: 50, y: 78 },
  { id: "n6", x: 64, y: 36 },
  { id: "n7", x: 66, y: 64 },
  { id: "n8", x: 80, y: 28 },
  { id: "n9", x: 82, y: 56 },
  { id: "n10", x: 90, y: 78 },
].map((n, i) => ({ ...n, label: n.label ?? `Citizen ${i}` }));

const LINK_RADIUS = 22; // % of the canvas — mesh hop range

// Precompute neighbor links once
function neighbors(id: string): string[] {
  const me = NODES.find((n) => n.id === id)!;
  return NODES.filter((n) => {
    if (n.id === id) return false;
    const dx = n.x - me.x;
    const dy = n.y - me.y;
    return Math.hypot(dx, dy) <= LINK_RADIUS;
  }).map((n) => n.id);
}

const LINKS: { a: string; b: string }[] = (() => {
  const seen = new Set<string>();
  const out: { a: string; b: string }[] = [];
  for (const n of NODES) {
    for (const m of neighbors(n.id)) {
      const key = [n.id, m].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ a: n.id, b: m });
    }
  }
  return out;
})();

interface Props {
  latestAlert: Alert | null;
}

export function MeshSimulator({ latestAlert }: Props) {
  const [online, setOnline] = useState(true);
  const [nodes, setNodes] = useState<Node[]>(() =>
    NODES.map((n) => ({ ...n, reached: !!n.isTower && false, hop: null })),
  );
  const [propagating, setPropagating] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [activeLinks, setActiveLinks] = useState<Set<string>>(new Set());
  const timersRef = useRef<number[]>([]);

  // Reset helpers
  function reset() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setNodes(NODES.map((n) => ({ ...n, reached: false, hop: null })));
    setActiveLinks(new Set());
    setPropagating(false);
    setLog([]);
  }

  function logLine(s: string) {
    setLog((l) => [`[${new Date().toLocaleTimeString()}] ${s}`, ...l].slice(0, 40));
  }

  function broadcastMesh(reason: string) {
    reset();
    setPropagating(true);
    logLine(`📡 Tower originating mesh broadcast — ${reason}`);

    // BFS hop-by-hop
    const visited: Record<string, number> = { tower: 0 };
    const queue: string[] = ["tower"];
    const layers: string[][] = [["tower"]];
    while (queue.length) {
      const id = queue.shift()!;
      const hop = visited[id];
      for (const nb of neighbors(id)) {
        if (visited[nb] === undefined) {
          visited[nb] = hop + 1;
          queue.push(nb);
          (layers[hop + 1] ||= []).push(nb);
        }
      }
    }

    const HOP_MS = 700;
    layers.forEach((ids, hop) => {
      const t = window.setTimeout(() => {
        setNodes((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, reached: true, hop } : n)),
        );
        // Light up the links used to reach this hop
        setActiveLinks((prev) => {
          const next = new Set(prev);
          for (const id of ids) {
            for (const nb of neighbors(id)) {
              if (visited[nb] !== undefined && visited[nb] < hop) {
                next.add([id, nb].sort().join("|"));
              }
            }
          }
          return next;
        });
        if (hop > 0) {
          logLine(`🔗 Hop ${hop}: relayed to ${ids.length} node(s) [${ids.join(", ")}]`);
        }
        if (hop === layers.length - 1) {
          window.setTimeout(() => {
            setPropagating(false);
            const reached = Object.keys(visited).length - 1;
            logLine(`✅ Mesh delivery complete — ${reached} citizen node(s) reached in ${layers.length - 1} hop(s).`);
          }, 400);
        }
      }, hop * HOP_MS);
      timersRef.current.push(t);
    });
  }

  // Auto-trigger when a new critical/high alert arrives AND we're offline (most realistic)
  const lastSeenIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!latestAlert) return;
    if (lastSeenIdRef.current === latestAlert.id) return;
    lastSeenIdRef.current = latestAlert.id;
    if (!online && (latestAlert.severity === "critical" || latestAlert.severity === "high")) {
      broadcastMesh(`offline alert "${latestAlert.title}"`);
    }
  }, [latestAlert, online]);

  // Cleanup timers on unmount
  useEffect(() => () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const reachedCount = nodes.filter((n) => n.reached && !n.isTower).length;
  const totalCitizens = nodes.length - 1;
  const sirenActive = !online && reachedCount > 0;

  function onToggleOnline() {
    setOnline((v) => {
      const next = !v;
      logLine(next ? "🌐 Internet restored. Cloud channels resume." : "🚫 Internet outage detected. Switching to offline mesh.");
      if (next) {
        // Clear visualisation when going back online
        reset();
      }
      return next;
    });
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b bg-gov-navy-deep text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-gov-gold">Offline Resilience</div>
          <h2 className="font-serif text-xl font-semibold">Bluetooth-Mesh & Siren Simulator</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded font-medium ${
              online ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40" : "bg-destructive/30 text-white border border-destructive"
            }`}
          >
            {online ? "● Internet ONLINE" : "✖ Internet OFFLINE"}
          </span>
          <button
            onClick={onToggleOnline}
            className="text-xs px-3 py-1.5 rounded bg-gov-gold text-gov-navy-deep font-semibold"
          >
            {online ? "Simulate outage" : "Restore internet"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3 p-4 border-b lg:border-b-0 lg:border-r bg-secondary/30">
          <MeshMap nodes={nodes} activeLinks={activeLinks} online={online} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => broadcastMesh("manual test")}
              disabled={propagating}
              className="text-xs px-3 py-1.5 rounded bg-destructive text-destructive-foreground font-semibold disabled:opacity-50"
            >
              📡 Trigger mesh broadcast
            </button>
            <button
              onClick={reset}
              className="text-xs px-3 py-1.5 rounded border border-gov-navy text-gov-navy"
            >
              Reset
            </button>
            <div className="text-xs text-muted-foreground ml-auto">
              {reachedCount}/{totalCitizens} citizens reached
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-2 p-4 space-y-3">
          <SirenWidget active={sirenActive} />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">How it works</div>
            <ol className="text-xs space-y-1.5 list-decimal pl-4 text-foreground/80">
              <li>The Authority Tower originates an alert.</li>
              <li>Each citizen device relays the message via Bluetooth mesh to neighbours in range.</li>
              <li>Sirens trigger automatically once the alert reaches a node — no internet required.</li>
              <li>When connectivity returns, the cloud channels resume normally.</li>
            </ol>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Event log</div>
            <div className="bg-gov-navy-deep text-emerald-300 font-mono text-[11px] rounded p-2 h-44 overflow-auto">
              {log.length === 0 ? (
                <div className="text-white/40 italic">Idle. Toggle internet OFF or trigger a manual broadcast.</div>
              ) : (
                log.map((l, i) => <div key={i}>{l}</div>)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeshMap({
  nodes, activeLinks, online,
}: { nodes: Node[]; activeLinks: Set<string>; online: boolean }) {
  // Build a quick lookup
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="relative w-full aspect-[16/9] rounded-lg border-2 border-dashed border-gov-navy/30 bg-gradient-to-br from-secondary to-background overflow-hidden">
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--gov-navy) 1px, transparent 1px), linear-gradient(90deg, var(--gov-navy) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Cloud / internet status overlay */}
      <div className="absolute top-2 left-2 text-[11px] flex items-center gap-1 px-2 py-1 rounded bg-card/80 border">
        <span>☁</span>
        <span className={online ? "text-emerald-700" : "text-destructive line-through"}>
          Cloud uplink
        </span>
      </div>

      {/* Links */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {LINKS.map(({ a, b }) => {
          const A = byId[a]; const B = byId[b];
          const key = [a, b].sort().join("|");
          const active = activeLinks.has(key);
          return (
            <line
              key={key}
              x1={`${A.x}%`} y1={`${A.y}%`}
              x2={`${B.x}%`} y2={`${B.y}%`}
              stroke={active ? "var(--severity-critical)" : "var(--gov-navy)"}
              strokeOpacity={active ? 0.9 : 0.18}
              strokeWidth={active ? 2.5 : 1}
              strokeDasharray={active ? "0" : "4 4"}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <div
            className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${
              n.isTower
                ? "bg-gov-navy text-gov-gold border-gov-gold animate-siren"
                : n.reached
                  ? "bg-destructive text-white border-destructive animate-siren"
                  : "bg-card text-muted-foreground border-gov-navy/40"
            }`}
            title={n.isTower ? "Authority Tower" : `Citizen ${n.id}${n.hop !== null ? ` · hop ${n.hop}` : ""}`}
          >
            {n.isTower ? "📡" : n.reached ? "📲" : "○"}
          </div>
          {n.hop !== null && !n.isTower && (
            <div className="text-[9px] mt-0.5 px-1 rounded bg-destructive text-white">h{n.hop}</div>
          )}
          {n.isTower && (
            <div className="text-[9px] mt-0.5 px-1 rounded bg-gov-navy text-gov-gold">TOWER</div>
          )}
        </div>
      ))}
    </div>
  );
}

function SirenWidget({ active }: { active: boolean }) {
  return (
    <div
      className={`rounded-lg p-3 border flex items-center gap-3 ${
        active ? "bg-destructive text-destructive-foreground border-destructive" : "bg-secondary border-border"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          active ? "bg-white/20 animate-siren" : "bg-card text-muted-foreground"
        }`}
      >
        🚨
      </div>
      <div className="text-sm">
        <div className={`font-semibold ${active ? "" : "text-foreground"}`}>
          {active ? "Local sirens ACTIVE" : "Sirens idle"}
        </div>
        <div className={`text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>
          {active
            ? "Sounding in mesh-reached areas. No internet required."
            : "Will activate automatically when a high-priority alert arrives offline."}
        </div>
      </div>
    </div>
  );
}
