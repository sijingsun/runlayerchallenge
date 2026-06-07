"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Settings, ArrowRight, AlertTriangle, ChevronRight, Zap } from "lucide-react";
import { useRequests } from "@/hooks/use-requests";
import { SEEN_EVENT, getSeenRequestIds } from "@/lib/requests-store";

type Tab = "all" | "requests" | "alerts";
type RequestCategory = "access" | "new-connector";

interface NotificationItem {
  id: string;
  type: "request-group" | "request-single" | "alert";
  requestCategory?: RequestCategory;
  unread: boolean;
  avatars: { initials: string; bg: string; color: string }[];
  icon?: string;
  title: string;
  connector: string;
  requesters?: string;
  waitTime?: string;
  priority?: boolean;
  risk?: "low" | "high";
  group: "today" | "yesterday";
}

// Static items — only alerts; requests come exclusively from the store
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "alert-1",
    type: "alert",
    unread: false,
    avatars: [],
    icon: "/icons/slack.svg",
    title: "Slack connector credential expiring in 3 days",
    connector: "",
    group: "yesterday",
  },
];

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function Avatar({ initials, bg, color }: { initials: string; bg: string; color: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
      style={{ background: bg, color, fontSize: "9px", fontWeight: 700, border: "2px solid #ffffff" }}
    >
      {initials}
    </div>
  );
}

function AvatarStack({ avatars }: { avatars: NotificationItem["avatars"] }) {
  return (
    <div className="flex shrink-0">
      {avatars.slice(0, 3).map((a, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i, position: "relative" }}>
          <Avatar {...a} />
        </div>
      ))}
    </div>
  );
}

function UnreadDot({ unread }: { unread: boolean }) {
  return (
    <div className="w-4 shrink-0 flex justify-center pt-[5px]">
      {unread
        ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
        : <div className="w-1.5 h-1.5 rounded-full" style={{ border: "1.5px solid #d6d3d1" }} />
      }
    </div>
  );
}

function RiskChip({ risk }: { risk: "low" | "high" }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded"
      style={{
        fontSize: "11px",
        fontWeight: 500,
        background: risk === "high" ? "#fee2e2" : "rgba(28,25,23,0.06)",
        color: risk === "high" ? "#991b1b" : "#78716c",
      }}
    >
      {risk === "high" ? "High risk" : "Low risk"}
    </span>
  );
}

function PriorityChip() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ fontSize: "11px", fontWeight: 500, background: "#fff7ed", color: "#c2410c" }}
    >
      <AlertTriangle className="w-2.5 h-2.5" />
      High priority
    </span>
  );
}


function NotificationRow({ item, onViewRequest }: { item: NotificationItem; onViewRequest?: (id: string) => void }) {
  if (item.type === "alert") {
    return (
      <div className="flex items-start gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid #f5f5f4" }}>
        <UnreadDot unread={item.unread} />
        {item.icon && (
          <Image src={item.icon} alt="" width={24} height={24} className="shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "13px", fontWeight: 500, color: "#44403c", lineHeight: "18px" }}>{item.title}</p>
          <p style={{ fontSize: "11px", color: "#a8a29e", marginTop: 2 }}>System</p>
        </div>
      </div>
    );
  }

  const requesterLabel = item.requesters ?? "";

  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3 group transition-colors"
      style={{ borderBottom: "1px solid #f5f5f4" }}
    >
      <UnreadDot unread={item.unread} />
      {item.icon && (
        <Image src={item.icon} alt="" width={24} height={24} className="shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        {/* Row 1: Connector + request type (ends with "request") + hover View CTA */}
        <div className="flex items-start justify-between gap-2">
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", lineHeight: "18px" }}>
            {item.connector}{" "}
            <span style={{ fontWeight: 400, color: "#57534e" }}>
              {item.requestCategory === "new-connector" ? "new connector request" : "access request"}
            </span>
          </p>
          <button
            onClick={() => onViewRequest?.(item.id)}
            className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ fontSize: "11px", color: "#57534e", fontWeight: 600, background: "none", border: "none", cursor: "pointer", paddingTop: 1 }}
          >
            View <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Row 2: Who requested · time */}
        <p style={{ fontSize: "12px", color: "#78716c", marginTop: 2, lineHeight: "16px" }}>
          {requesterLabel}
          {item.waitTime && (
            <span style={{ color: "#a8a29e" }}> · {item.waitTime}</span>
          )}
        </p>

        {/* Row 3: Priority/risk chips */}
        {(item.priority || item.risk) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {item.priority && <PriorityChip />}
            {item.risk && <RiskChip risk={item.risk} />}
          </div>
        )}
      </div>
    </div>
  );
}

const GROUP_LABEL: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#a8a29e",
};

interface NotificationPopoverProps {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  anchorRect?: DOMRect;
  onViewAllRequests?: () => void;
  onViewRequest?: (id: string) => void;
}

export function NotificationPopover({ onClose, anchorRect, onViewAllRequests, onViewRequest }: NotificationPopoverProps) {
  const top = anchorRect ? anchorRect.bottom + 8 : 60;
  const left = anchorRect ? anchorRect.left - 360 + anchorRect.width : 208;
  const [tab, setTab] = useState<Tab>("all");
  // Initialize from module-level set so seen state survives popover close/reopen
  const [seenIds, setSeenIds] = useState<Set<string>>(() => getSeenRequestIds());

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id) setSeenIds(prev => new Set([...prev, id]));
    };
    window.addEventListener(SEEN_EVENT, handler);
    return () => window.removeEventListener(SEEN_EVENT, handler);
  }, []);

  const submittedRequests = useRequests();
  const dynamicItems: NotificationItem[] = submittedRequests.map(r => ({
    id: r.id,
    type: "request-single" as const,
    requestCategory: (r.requestType ?? "access") as RequestCategory,
    unread: (r.status === "pending-review" || r.status === "under-review") && !seenIds.has(r.id),
    avatars: [{ initials: r.requesterInitials, bg: "#ede9fe", color: "#7c3aed" }],
    icon: r.connectorIcon,
    title: r.requesterName,
    connector: r.connectorName,
    requesters: r.requesterName,
    waitTime: timeAgo(r.submittedAt),
    priority: r.highPriority,
    risk: "low" as const,
    group: "today" as const,
  }));

  const allNotifications: NotificationItem[] = [...dynamicItems, ...NOTIFICATIONS];
  const requests = allNotifications.filter(n => n.type !== "alert");
  const alerts = allNotifications.filter(n => n.type === "alert");
  const unreadRequestCount = requests.filter(n => n.unread).length;

  const visible =
    tab === "all" ? allNotifications : tab === "requests" ? requests : alerts;

  const todayItems = visible.filter(n => n.group === "today");
  const yesterdayItems = visible.filter(n => n.group === "yesterday");

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "requests", label: "Requests", count: unreadRequestCount || undefined },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[5]" onClick={onClose} />

      <motion.div
        className="fixed z-50 rounded-xl overflow-hidden"
        style={{
          width: 400,
          top,
          left: Math.max(8, left),
          background: "#ffffff",
          border: "1px solid rgba(28,25,23,0.09)",
          boxShadow: "0 8px 32px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)",
        }}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 pt-3.5 pb-0"
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917" }}>
            Notifications
          </p>
          <div className="flex items-center gap-2">
            <button
              style={{ fontSize: "12px", color: "#a8a29e", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            >
              Mark all read
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", display: "flex" }}>
              <Settings size={13} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center px-4 mt-1"
          style={{ borderBottom: "1px solid #e7e5e4" }}
        >
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-2 py-2.5 mr-1 relative"
              style={{
                fontSize: "13px",
                fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? "#1c1917" : "#78716c",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderBottom: tab === t.id ? "2px solid #1c1917" : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t.label}
              {t.count ? (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{t.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {todayItems.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <p style={GROUP_LABEL}>Today</p>
              </div>
              {todayItems.map(item => <NotificationRow key={item.id} item={item} onViewRequest={onViewRequest} />)}
            </>
          )}
          {yesterdayItems.length > 0 && (
            <>
              <div className="px-4 pt-3 pb-1">
                <p style={GROUP_LABEL}>Yesterday</p>
              </div>
              {yesterdayItems.map(item => <NotificationRow key={item.id} item={item} onViewRequest={onViewRequest} />)}
            </>
          )}
          {visible.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p style={{ fontSize: "13px", color: "#a8a29e" }}>
                All caught up — no pending requests or alerts.
              </p>
            </div>
          )}
        </div>

        {/* Footer — only shown on Requests or Alerts tab, not All */}
        {tab !== "all" && (
          <div
            className="px-4 py-3"
            style={{ borderTop: "1px solid #f5f5f4" }}
          >
            <button
              onClick={onViewAllRequests}
              className="flex items-center gap-1"
              style={{ fontSize: "13px", fontWeight: 600, color: "#57534e", background: "none", border: "none", cursor: "pointer" }}
            >
              View all requests <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
