// Simulated backend: localStorage-based "database" with live cross-tab sync.
// Acts as our DB layer for the demo (Authority + Citizen sides stay in sync).

export type Severity = "critical" | "high" | "medium" | "low";
export type Channel = "sms" | "app" | "twitter" | "radio" | "siren";

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  region: string;
  channels: Channel[];
  authorName: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  status: "active" | "updated" | "cancelled";
  version: number;
}

export interface AuthorityUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  passwordHash: string;
  createdAt: number;
}

const ALERTS_KEY = "umces.alerts.v1";
const USERS_KEY = "umces.users.v1";
const SESSION_KEY = "umces.session.v1";

// --- tiny hash so we don't store plaintext passwords (demo only) ---
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h${h}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  // Notify same-tab listeners (storage event only fires across tabs).
  window.dispatchEvent(new CustomEvent("umces:change", { detail: { key } }));
}

// ---------------- USERS ----------------

export function listUsers(): AuthorityUser[] {
  return read<AuthorityUser[]>(USERS_KEY, []);
}

export function signUp(input: {
  name: string;
  email: string;
  password: string;
  department: string;
  role: string;
}): { ok: true; user: AuthorityUser } | { ok: false; error: string } {
  const users = listUsers();
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || !input.name) {
    return { ok: false, error: "Please fill in all required fields." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: AuthorityUser = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    role: input.role.trim() || "Authority",
    department: input.department.trim() || "Disaster Management Cell",
    passwordHash: hash(input.password),
    createdAt: Date.now(),
  };
  write(USERS_KEY, [...users, user]);
  setSession(user.id);
  return { ok: true, user };
}

export function signIn(
  email: string,
  password: string,
): { ok: true; user: AuthorityUser } | { ok: false; error: string } {
  const users = listUsers();
  const u = users.find((x) => x.email === email.trim().toLowerCase());
  if (!u || u.passwordHash !== hash(password)) {
    return { ok: false, error: "Invalid email or password." };
  }
  setSession(u.id);
  return { ok: true, user: u };
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("umces:change", { detail: { key: SESSION_KEY } }));
}

function setSession(userId: string) {
  write(SESSION_KEY, { userId, at: Date.now() });
}

export function currentUser(): AuthorityUser | null {
  const session = read<{ userId: string } | null>(SESSION_KEY, null);
  if (!session) return null;
  return listUsers().find((u) => u.id === session.userId) ?? null;
}

// ---------------- ALERTS ----------------

export function listAlerts(): Alert[] {
  return read<Alert[]>(ALERTS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function createAlert(
  input: Omit<Alert, "id" | "createdAt" | "updatedAt" | "status" | "version">,
): Alert {
  const now = Date.now();
  const alert: Alert = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    status: "active",
    version: 1,
  };
  write(ALERTS_KEY, [alert, ...listAlerts()]);
  return alert;
}

export function updateAlert(id: string, patch: Partial<Alert>): Alert | null {
  const all = listAlerts();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated: Alert = {
    ...all[idx],
    ...patch,
    id: all[idx].id,
    createdAt: all[idx].createdAt,
    updatedAt: Date.now(),
    status: patch.status ?? "updated",
    version: all[idx].version + 1,
  };
  all[idx] = updated;
  write(ALERTS_KEY, all);
  return updated;
}

export function cancelAlert(id: string): Alert | null {
  return updateAlert(id, { status: "cancelled" });
}

export function deleteAlert(id: string) {
  write(
    ALERTS_KEY,
    listAlerts().filter((a) => a.id !== id),
  );
}

// ---------------- LIVE SUBSCRIPTION ----------------

export function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("umces:change", handler as EventListener);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("umces:change", handler as EventListener);
  };
}

// Seed a sample alert so the citizen view isn't empty on first load.
export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (listAlerts().length > 0) return;
  createAlert({
    title: "System Online — Test Broadcast",
    message:
      "The Unified Multi-Channel Emergency Communication System is active. This is a test broadcast across all channels.",
    severity: "low",
    region: "All Regions",
    channels: ["sms", "app", "twitter", "radio"],
    authorName: "Control Room",
    authorEmail: "control@umces.gov",
  });
}
