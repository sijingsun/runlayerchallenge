export interface SubmittedRequest {
  id: string;
  connectorName: string;
  connectorIcon: string;
  clients: string[];
  reason: string;
  highPriority: boolean;
  submittedAt: number;
  requesterName: string;
  requesterInitials: string;
  requesterNames?: string[];
  requestType?: "access" | "new-connector";
  status: "pending-review" | "under-review" | "approved" | "denied";
  denialReason?: string;
}

const STORAGE_KEY = "runlayer_requests";
export const REQUESTS_EVENT = "runlayer_requests_updated";
export const SEEN_EVENT = "runlayer_request_seen";

const _seenIds = new Set<string>();
export function markRequestSeen(id: string): void {
  if (_seenIds.has(id)) return;
  _seenIds.add(id);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SEEN_EVENT, { detail: { id } }));
  }
}
export function isRequestSeen(id: string): boolean {
  return _seenIds.has(id);
}
export function getSeenRequestIds(): Set<string> {
  return new Set(_seenIds);
}

// Timestamp set by /done — /connectors skips clearing if this is recent (< 5s)
let _fromDoneAt: number | null = null;
export function setFromDone(): void { _fromDoneAt = Date.now(); }
export function isFromDone(): boolean {
  if (_fromDoneAt === null) return false;
  return (Date.now() - _fromDoneAt) < 5000;
}

export function getRequests(): SubmittedRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function updateRequestStatus(
  id: string,
  status: SubmittedRequest["status"],
  denialReason?: string
): void {
  const requests = getRequests();
  const updated = requests.map(r =>
    r.id === id
      ? { ...r, status, ...(denialReason !== undefined ? { denialReason } : {}) }
      : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
}

export function clearRequests(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
}

export function seedDemoRequests(): void {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem("admin_demo_seeded_v6")) return;
  // Clear any stale seed from previous versions
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem("admin_demo_seeded");
  const demos: SubmittedRequest[] = [
    {
      id: "demo-1",
      connectorName: "Linear · Read + Write",
      connectorIcon: "/icons/linear.svg",
      clients: ["Claude Desktop", "Cursor"],
      reason: "Need to track engineering issues and project cycles",
      highPriority: true,
      submittedAt: Date.now() - 3 * 60 * 60 * 1000,
      requesterName: "3 people",
      requesterInitials: "3P",
      requesterNames: ["Jane Cooper", "Priya Patel", "Marco Chen"],
      status: "pending-review",
    },
    {
      id: "demo-2",
      connectorName: "Notion · Read only",
      connectorIcon: "/icons/notion.svg",
      clients: ["Claude Desktop"],
      reason: "Need access to team knowledge base and documentation",
      highPriority: false,
      submittedAt: Date.now() - 2 * 60 * 60 * 1000,
      requesterName: "Jane Cooper",
      requesterInitials: "JC",
      status: "pending-review",
    },
    {
      id: "demo-3",
      connectorName: "GitHub · Read + Write",
      connectorIcon: "/icons/github.svg",
      clients: ["Cursor", "Windsurf"],
      reason: "Need to manage pull requests and code reviews",
      highPriority: false,
      submittedAt: Date.now() - 5 * 60 * 60 * 1000,
      requesterName: "Priya Patel",
      requesterInitials: "PR",
      requestType: "new-connector",
      status: "pending-review",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
  sessionStorage.setItem("admin_demo_seeded_v6", "1");
  window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
}

export function addRequest(
  req: Omit<SubmittedRequest, "id" | "submittedAt" | "status">
): SubmittedRequest {
  const newReq: SubmittedRequest = {
    ...req,
    id: crypto.randomUUID(),
    submittedAt: Date.now(),
    status: "pending-review",
  };
  const existing = getRequests();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newReq]));
  window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
  return newReq;
}
