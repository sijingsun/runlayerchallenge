"use client";

import { useEffect, useState } from "react";
import Image from "@/components/img";
import { Search, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRequests } from "@/hooks/use-requests";
import { seedDemoRequests } from "@/lib/requests-store";
import { AdminReviewModal } from "@/components/admin-review-modal";
import type { SubmittedRequest } from "@/lib/requests-store";

type FilterTab = "all" | "access" | "new-connector";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all",           label: "All" },
  { id: "access",        label: "Access requests" },
  { id: "new-connector", label: "New connector requests" },
];

const PALETTES = [
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#dbeafe", color: "#1d4ed8" },
];
function avatarPal(name: string) { return PALETTES[name.charCodeAt(0) % PALETTES.length]; }
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }

function TypeBadge({ type }: { type: "access" | "new-connector" }) {
  const label = type === "new-connector" ? "New connector request" : "Access request";
  return (
    <span style={{
      height: 22, padding: "0 8px", borderRadius: 6,
      fontSize: "12px", fontWeight: 500,
      background: "rgba(249,115,22,0.08)", color: "#f97316",
      display: "inline-flex", alignItems: "center", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function RequestCard({ request, onReview }: { request: SubmittedRequest; onReview: () => void }) {
  const connectorBase = request.connectorName.split(" · ")[0];
  const isPending = request.status === "pending-review" || request.status === "under-review";
  const pal = avatarPal(request.requesterName);
  const type = request.requestType ?? "access";

  return (
    <motion.div
      layout
      className="flex flex-col"
      style={{
        width: 240, flexShrink: 0,
        background: "#fafaf9",
        border: "1px solid rgba(28,25,23,0.06)",
        borderRadius: 8, padding: 16, gap: 14,
      }}
      whileHover={{ boxShadow: "0 4px 12px rgba(28,25,23,0.07)" }}
      transition={{ duration: 0.15 }}
    >
      {/* Top: icon + type badge */}
      <div className="flex items-start justify-between gap-2">
        <div style={{
          width: 32, height: 32, borderRadius: 8, padding: 2,
          background: "#ffffff", flexShrink: 0,
          boxShadow: "0 0 0 1.33px rgba(28,25,23,0.09), 0 4px 8px -2.67px rgba(28,25,23,0.09)",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          <Image src={request.connectorIcon} alt={connectorBase} width={28} height={28}
            style={{ borderRadius: 4, objectFit: "cover", width: 28, height: 28 }} />
        </div>
        <TypeBadge type={type} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#292524", lineHeight: "15px" }}>{connectorBase}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p style={{ fontSize: "13px", color: "#78716c" }}>Requested by</p>
          <div className="flex items-center gap-1 shrink-0">
            <div className="rounded-full flex items-center justify-center shrink-0"
              style={{ width: 16, height: 16, background: pal.bg, fontSize: "7px", fontWeight: 700, color: pal.color }}>
              {initials(request.requesterName)}
            </div>
            <p style={{ fontSize: "13px", color: "#78716c", whiteSpace: "nowrap" }}>{request.requesterName}</p>
          </div>
        </div>
      </div>

      {/* Review button */}
      {isPending && (
        <button onClick={onReview} style={{
          height: 22, padding: "0 10px", borderRadius: 6, border: "none",
          fontSize: "14px", fontWeight: 600, cursor: "pointer",
          color: "#57534e", background: "#ffffff", alignSelf: "flex-start",
          boxShadow: "0 0 0 1px rgba(28,25,23,0.09), 0 3px 6px -2px rgba(28,25,23,0.09)",
        }}>
          Review
        </button>
      )}
    </motion.div>
  );
}

export default function AdminRequestsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [reviewRequest, setReviewRequest] = useState<SubmittedRequest | null>(null);
  const submittedRequests = useRequests();

  useEffect(() => { seedDemoRequests(); }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      const req =
        (id ? submittedRequests.find(r => r.id === id) : undefined) ??
        submittedRequests.find(r => r.status === "pending-review" || r.status === "under-review");
      if (req) setReviewRequest(req);
    };
    window.addEventListener("open-review-request", handler);
    return () => window.removeEventListener("open-review-request", handler);
  }, [submittedRequests]);

  const filtered = submittedRequests.filter(r => {
    const matchesSearch =
      search === "" ||
      r.connectorName.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase());
    const type = r.requestType ?? "access";
    const matchesFilter = filter === "all" || filter === type;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="py-6 flex flex-col gap-5">

      {/* Top filter bar — breaks out of px-16 parent padding to span full panel width */}
      <div
        className="flex items-center gap-3 -mx-16 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(28,25,23,0.09)", marginTop: -24 }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <Users size={15} strokeWidth={1.75} style={{ color: "#a8a29e" }} />
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#57534e" }}>Requested</span>
          <span
            className="ml-1 px-1.5 rounded-md"
            style={{ fontSize: "11px", fontWeight: 700, background: "rgba(234,179,8,0.1)", color: "#a16207" }}
          >
            Admin
          </span>
        </div>

        <div className="flex items-center gap-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              style={{
                height: 25, padding: "0 8px", borderRadius: 6,
                fontSize: "14px", fontWeight: 500, cursor: "pointer", border: "none",
                background: filter === tab.id ? "rgba(28,25,23,0.06)" : "transparent",
                color: filter === tab.id ? "#1c1917" : "#57534e",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative" style={{ width: 400 }}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#a8a29e" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search with keywords..."
          className="w-full outline-none"
          style={{
            height: 32, paddingLeft: 32, paddingRight: 12,
            borderRadius: 6, border: "1px solid rgba(28,25,23,0.09)",
            background: "transparent", color: "#1c1917", fontSize: "13px",
          }}
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="py-16 flex items-center justify-center">
          <p style={{ fontSize: "13px", color: "#a8a29e" }}>No requests found.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filtered.map(request => (
            <RequestCard key={request.id} request={request} onReview={() => setReviewRequest(request)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewRequest && (
          <AdminReviewModal
            request={reviewRequest}
            allRequests={submittedRequests}
            onClose={() => setReviewRequest(null)}
            onDone={() => setReviewRequest(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
