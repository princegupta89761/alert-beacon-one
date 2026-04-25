import { useEffect, useState } from "react";
import { listAlerts, currentUser, subscribe, seedIfEmpty, type Alert, type AuthorityUser } from "./store";

export function useAlerts(): Alert[] {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    seedIfEmpty();
    setAlerts(listAlerts());
    return subscribe(() => setAlerts(listAlerts()));
  }, []);
  return alerts;
}

export function useAuth(): AuthorityUser | null {
  const [user, setUser] = useState<AuthorityUser | null>(null);
  useEffect(() => {
    setUser(currentUser());
    return subscribe(() => setUser(currentUser()));
  }, []);
  return user;
}
