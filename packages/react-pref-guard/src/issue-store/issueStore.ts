// issueStore.ts – global dev-only issue store

export type IssueRow = {
  id: string;
  component: string;
  ruleId: string;
  severity: string;
  confidence: number;
  boundaryType: string;
  status: "NEW" | "ACTIVE" | "RESOLVED";
  lastSeen: number;
  reason:string;
};

type Listener = (issues: IssueRow[]) => void;

const store = new Map<string, IssueRow>();
const listeners = new Set<Listener>();

export function upsertIssue(issue: IssueRow) {
  store.set(issue.id, issue);
  notify();
}

export function resolveIssue(id: string) {
  const row = store.get(id);
  if (!row) return;

  row.status = "RESOLVED";
  notify();

  // auto-remove after 10s
  setTimeout(() => {
    store.delete(id);
    notify();
  }, 10_000);
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(Array.from(store.values()));
  return () => listeners.delete(listener);
}

function notify() {
  const snapshot = Array.from(store.values());
  listeners.forEach(l => l(snapshot));
}
