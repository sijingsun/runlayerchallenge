"use client";

import { useEffect, useState } from "react";
import Image from "@/components/img";
import { AnimatePresence, motion } from "motion/react";
import { useRequests } from "@/hooks/use-requests";
import { seedDemoRequests } from "@/lib/requests-store";
import type { SubmittedRequest } from "@/lib/requests-store";

type FilterTab = "all" | "pending" | "denied";

const STATUS_MAP: Record<SubmittedRequest["status"], { label: string; bg: string; color: string }> = {
  "pending-review": { label: "Pending review", bg: "#fef3c7", color: "#d97706" },
  "under-review":   { label: "Under review",   bg: "#dbeafe", color: "#1d4ed8" },
  "approved":       { label: "Approved",        bg: "#dcfce7", color: "#16a34a" },
  "denied":         { label: "Denied",          bg: "#fee2e2", color: "#dc2626" },
};

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }: { status: SubmittedRequest["status"] }) {
  const s = STATUS_MAP[status];
  return (
    <span className="px-2 py-0.5 rounded-md"
      style={{ fontSize: "12px", fontWeight: 600, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function RequestRow({ request, isLast }: { request: SubmittedRequest; isLast: boolean }) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const connectorBase = request.connectorName.split(" · ")[0];
  const isDenied = request.status === "denied";
  const isApproved = request.status === "approved";

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid rgba(28,25,23,0.07)" }}>
      <motion.div
        className="flex items-center gap-4 px-4 py-3 cursor-default"
        whileHover={{ background: "rgba(28,25,23,0.015)" }}
        transition={{ duration: 0.1 }}
        style={{ opacity: isDenied ? 0.7 : 1 }}
      >
        <Image src={request.connectorIcon} alt={connectorBase} width={32} height={32} className="shrink-0"
          style={{ opacity: isDenied ? 0.5 : 1 }} />

        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "13px", fontWeight: 600, color: isDenied ? "#78716c" : "#1c1917" }}>
            {request.connectorName}
          </p>
          <p style={{ fontSize: "12px", color: "#78716c", marginTop: 2 }}>
            Requested {timeAgo(request.submittedAt)}
            {request.clients.length > 0 && (
              <span style={{ color: "#a8a29e" }}> · {request.clients.join(", ")}</span>
            )}
          </p>
          {isApproved && (
            <p style={{ fontSize: "11px", color: "#16a34a", marginTop: 3, fontWeight: 500 }}>
              Access granted — available in your AI clients
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={request.status} />
          {isDenied && request.denialReason && (
            <button
              onClick={() => setReasonOpen(o => !o)}
              style={{ fontSize: "12px", color: "#78716c", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#d6d3d1", whiteSpace: "nowrap" }}
            >
              {reasonOpen ? "Hide reason" : "See reason →"}
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isDenied && reasonOpen && request.denialReason && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#b91c1c", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Admin&apos;s note</p>
              <p style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "18px" }}>{request.denialReason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UserRequestsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const submittedRequests = useRequests();

  useEffect(() => { seedDemoRequests(); }, []);

  const FILTER_TABS: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all",     label: "All",     count: submittedRequests.length || undefined },
    { id: "pending", label: "Pending", count: submittedRequests.filter(r => r.status === "pending-review" || r.status === "under-review").length || undefined },
    { id: "denied",  label: "Denied",  count: submittedRequests.filter(r => r.status === "denied").length || undefined },
  ];

  const filtered = submittedRequests.filter(r => {
    if (filter === "pending") return r.status === "pending-review" || r.status === "under-review" || r.status === "approved";
    if (filter === "denied")  return r.status === "denied";
    return true;
  });

  const inFlight = filtered.filter(r => r.status !== "denied");
  const denied   = filtered.filter(r => r.status === "denied");

  return (
    <div className="py-6 flex flex-col gap-5">

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 -mx-16 px-5 py-3"
        style={{ borderBottom: "1px solid rgba(28,25,23,0.09)", marginTop: -24 }}
      >
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#57534e" }}>My requests</span>
        <div className="flex items-center gap-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className="inline-flex items-center gap-1.5"
              style={{
                height: 25, padding: "0 8px", borderRadius: 6,
                fontSize: "14px", fontWeight: 500, cursor: "pointer", border: "none",
                background: filter === tab.id ? "rgba(28,25,23,0.06)" : "transparent",
                color: filter === tab.id ? "#1c1917" : "#57534e",
              }}>
              {tab.label}
              {tab.count ? (
                <span style={{ fontSize: "11px", fontWeight: 700, color: filter === tab.id ? "#1c1917" : "#a8a29e" }}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#57534e" }}>No requests</p>
          <p style={{ fontSize: "13px", color: "#a8a29e" }}>
            Your connector access requests will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Active / in-flight */}
          {inFlight.length > 0 && (
            <div className="rounded-lg overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)" }}>
              {/* Column headers */}
              <div className="flex items-center gap-4 px-4 py-2"
                style={{ borderBottom: "1px solid rgba(28,25,23,0.07)", background: "rgba(28,25,23,0.02)" }}>
                <div style={{ width: 32 }} />
                <p className="flex-1" style={{ fontSize: "11px", fontWeight: 600, color: "#a8a29e", letterSpacing: "0.04em", textTransform: "uppercase" }}>Connector</p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "#a8a29e", letterSpacing: "0.04em", textTransform: "uppercase" }}>Status</p>
              </div>
              {inFlight.map((r, i) => (
                <RequestRow key={r.id} request={r} isLast={i === inFlight.length - 1} />
              ))}
            </div>
          )}

          {/* Denied / resolved */}
          {denied.length > 0 && (
            <div>
              <p className="mb-2 px-1"
                style={{ fontSize: "11px", fontWeight: 600, color: "#a8a29e", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Denied
              </p>
              <div className="rounded-lg overflow-hidden"
                style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)" }}>
                {denied.map((r, i) => (
                  <RequestRow key={r.id} request={r} isLast={i === denied.length - 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
