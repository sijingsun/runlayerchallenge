"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings } from "lucide-react";
import Image from "@/components/img";
import Link from "next/link";
import { useRequests } from "@/hooks/use-requests";

interface StaticNotification {
  id: string;
  type: "approved" | "denied";
  connectorName: string;
  connectorIcon: string;
  clients: string[];
  denialNote?: string;
  timeLabel: string;
  read: boolean;
}

const STATIC_NOTIFICATIONS: StaticNotification[] = [];

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function UnreadDot({ unread }: { unread: boolean }) {
  return (
    <div className="w-4 shrink-0 flex justify-center pt-[5px]">
      {unread
        ? <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#f97316" }} />
        : <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ border: "1.5px solid #d6d3d1" }} />
      }
    </div>
  );
}

interface NoteExpanderProps {
  note: string;
}

function NoteExpander({ note }: NoteExpanderProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        style={{ fontSize: "12px", color: "#57534e", fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        {open ? "Hide admin's note" : "See admin's note →"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mt-2 px-3 py-2 rounded-lg"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#b91c1c", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>Admin's note</p>
              <p style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "18px" }}>{note}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NotificationRowProps {
  type: "approved" | "denied";
  connectorName: string;
  connectorIcon: string;
  clients: string[];
  denialNote?: string;
  timeLabel: string;
  unread: boolean;
  isLast: boolean;
}

function NotificationRow({ type, connectorName, connectorIcon, clients, denialNote, timeLabel, unread, isLast }: NotificationRowProps) {
  const isApproved = type === "approved";
  const statusColor = isApproved ? "#16a34a" : "#dc2626";

  return (
    <div
      className="flex items-start gap-2.5 px-4 py-3"
      style={{ borderBottom: isLast ? "none" : "1px solid #f5f5f4" }}
    >
      <UnreadDot unread={unread} />

      <Image src={connectorIcon} alt="" width={20} height={20} className="shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", lineHeight: "18px" }}>
            {connectorName.split(" · ")[0]}{" "}
            <span style={{ fontWeight: 500, color: statusColor }}>
              {isApproved ? "approved" : "denied"}
            </span>
          </p>
          <span style={{ fontSize: "11px", color: "#a8a29e", whiteSpace: "nowrap", paddingTop: 1 }}>{timeLabel}</span>
        </div>

        {/* Detail */}
        <p style={{ fontSize: "12px", color: "#78716c", marginTop: 2, lineHeight: "17px" }}>
          {isApproved
            ? `Your request was approved.${clients.length > 0 ? ` ${connectorName.split(" · ")[0]} is now available in ${clients.join(" and ")}.` : ""}`
            : "Your request was denied."
          }
        </p>

        {/* CTA */}
        {isApproved && (
          <Link
            href="/settings/requests"
            style={{ fontSize: "12px", color: "#57534e", fontWeight: 500, display: "inline-block", marginTop: 4 }}
          >
            View →
          </Link>
        )}
        {!isApproved && denialNote && <NoteExpander note={denialNote} />}
      </div>
    </div>
  );
}

interface UserNotificationPopoverProps {
  onClose: () => void;
  anchorRect?: DOMRect;
}

export function UserNotificationPopover({ onClose, anchorRect }: UserNotificationPopoverProps) {
  const top = anchorRect ? anchorRect.bottom + 8 : 60;
  const left = anchorRect ? anchorRect.left - 360 + anchorRect.width : 208;

  const submittedRequests = useRequests();
  const resolvedFromStore: StaticNotification[] = submittedRequests
    .filter(r => r.status === "approved" || r.status === "denied")
    .map(r => ({
      id: r.id,
      type: r.status as "approved" | "denied",
      connectorName: r.connectorName,
      connectorIcon: r.connectorIcon,
      clients: r.clients,
      timeLabel: timeAgo(r.submittedAt),
      read: false,
    }));

  const allNotifications = [...resolvedFromStore, ...STATIC_NOTIFICATIONS];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-[5]" onClick={onClose} />

      <motion.div
        className="fixed z-50 rounded-xl overflow-hidden"
        style={{
          width: 380,
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
        <div className="flex items-center justify-between px-4 pt-3.5 pb-3" style={{ borderBottom: "1px solid #e7e5e4" }}>
          <div className="flex items-center gap-2">
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917" }}>Updates</p>
            {unreadCount > 0 && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f97316" }}>{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button style={{ fontSize: "12px", color: "#a8a29e", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                Mark all read
              </button>
            )}
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", display: "flex" }}>
              <Settings size={13} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Content */}
        {allNotifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#57534e" }}>No updates yet</p>
            <p style={{ fontSize: "12px", color: "#a8a29e", marginTop: 4, lineHeight: "18px" }}>
              We'll let you know when your requests are reviewed.
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {allNotifications.map((n, i) => (
              <NotificationRow
                key={n.id}
                type={n.type}
                connectorName={n.connectorName}
                connectorIcon={n.connectorIcon}
                clients={n.clients}
                denialNote={n.denialNote}
                timeLabel={n.timeLabel}
                unread={!n.read}
                isLast={i === allNotifications.length - 1}
              />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
