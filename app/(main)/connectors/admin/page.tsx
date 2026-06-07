"use client";

import Image from "@/components/img";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, MessageSquare, Users, Search, LayoutGrid, List, Bell, X } from "lucide-react";
import { seedDemoRequests } from "@/lib/requests-store";
import { useRequests } from "@/hooks/use-requests";
import { AdminReviewModal } from "@/components/admin-review-modal";
import type { SubmittedRequest } from "@/lib/requests-store";

type HostingType = "hosted" | "local";
type HostingTab = "all" | "hosted" | "local";

interface AdminConnector {
  id: string;
  name: string;
  description: string;
  icon: string;
  hosting: HostingType;
  tools?: number;
  resources?: number;
  prompts?: number;
  userCount: number;
  orgWide: boolean;
}

const ADMIN_CONNECTORS: AdminConnector[] = [
  { id: "slack",     name: "Slack · Read + Write · All teams",          description: "Slack MCP server for team communication",                                                               icon: "/icons/slack.svg",     hosting: "hosted", tools: 16, resources: 3,              userCount: 47, orgWide: true  },
  { id: "figma",     name: "Figma · Read only · Design",                description: "Figma MCP server for design-to-code workflows, component extraction, and design system access.",        icon: "/icons/figma.svg",     hosting: "hosted", tools: 6,  resources: 3,              userCount: 23, orgWide: true  },
  { id: "figma-2",   name: "Figma · Read + Write · Product",            description: "Figma MCP server for design-to-code workflows, component extraction, and design system access.",        icon: "/icons/figma-2.svg",   hosting: "hosted", tools: 6,  resources: 3,              userCount: 8,  orgWide: true  },
  { id: "github",    name: "GitHub · Read + Write · Engineering",       description: "GitHub MCP server for repository access, pull requests, and code review workflows.",                   icon: "/icons/github.svg",    hosting: "local",  tools: 11, prompts: 3,               userCount: 12, orgWide: true  },
  { id: "linear",    name: "Linear · Read + Write · Engineering",       description: "Linear MCP server for issue tracking, project management, and engineering cycles.",                    icon: "/icons/linear.svg",    hosting: "hosted", tools: 11, prompts: 3,               userCount: 19, orgWide: true  },
  { id: "notion",    name: "Notion",                                    description: "Notion MCP server for documents and knowledge management",                                              icon: "/icons/notion.svg",    hosting: "hosted",                                         userCount: 0,  orgWide: false },
  { id: "amazon",    name: "AWS",                                       description: "AWS MCP server for cloud resource management",                                                          icon: "/icons/amazon.svg",    hosting: "hosted", tools: 15,                          userCount: 0,  orgWide: false },
  { id: "asana",     name: "Asana",                                     description: "Asana MCP server for project management, task tracking, and team collaboration.",                      icon: "/icons/asana.svg",     hosting: "hosted", tools: 16, prompts: 2, resources: 3, userCount: 0,  orgWide: false },
  { id: "asana-2",   name: "Asana #2",                                  description: "Asana MCP server for project management, task tracking, and team collaboration.",                      icon: "/icons/asana-2.svg",   hosting: "hosted", tools: 8,  prompts: 1, resources: 4, userCount: 0,  orgWide: false },
  { id: "loom",      name: "Loom",                                      description: "Loom MCP server for video recording access, transcripts, and workspace libraries.",                    icon: "/icons/loom.svg",      hosting: "hosted", tools: 16, prompts: 2, resources: 3, userCount: 0,  orgWide: false },
  { id: "salesforce",name: "Salesforce",                                description: "Salesforce MCP server for CRM data, accounts, opportunities, and customer records.",                  icon: "/icons/salesforce.svg",hosting: "hosted", tools: 16, prompts: 2, resources: 3, userCount: 0,  orgWide: false },
  { id: "clickup",   name: "ClickUp",                                   description: "ClickUp MCP server for task management, spaces, goals, and project workflows.",                        icon: "/icons/clickup.svg",   hosting: "local",  tools: 11, prompts: 3,               userCount: 0,  orgWide: false },
  { id: "box",       name: "Box",                                       description: "Box MCP server for enterprise file storage, folders, and content workflows.",                          icon: "/icons/box.svg",       hosting: "hosted", tools: 16, prompts: 2, resources: 3, userCount: 0,  orgWide: false },
  { id: "vanta",     name: "Vanta",                                     description: "Vanta MCP server for compliance status, controls, and security monitoring data.",                      icon: "/icons/vanta.svg",     hosting: "hosted", tools: 16, prompts: 2, resources: 3, userCount: 0,  orgWide: false },
];

function HostingBadge({ type }: { type: HostingType }) {
  return (
    <div
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
      style={{ background: type === "hosted" ? "rgba(59,130,246,0.1)" : "rgba(234,88,12,0.1)" }}
      title={type === "hosted" ? "Hosted" : "Local"}
    >
      {type === "hosted"
        ? <Globe className="w-3 h-3" style={{ color: "#3b82f6" }} />
        : <MessageSquare className="w-3 h-3" style={{ color: "#ea580c" }} />}
    </div>
  );
}

function CountBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 h-[22px] rounded-md text-xs font-medium" style={{ background: "rgba(28,25,23,0.06)", color: "#57534e" }}>
      {label}
    </span>
  );
}

function AdminConnectorCard({ connector }: { connector: AdminConnector }) {
  const hasStats = connector.tools || connector.resources || connector.prompts;
  return (
    <motion.div
      className="flex flex-col rounded-xl cursor-pointer overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)", height: 183 }}
      whileHover={{ boxShadow: "0 4px 16px rgba(28,25,23,0.08)" }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between px-4 pt-4">
        <Image src={connector.icon} alt={connector.name} width={32} height={32} />
        <HostingBadge type={connector.hosting} />
      </div>
      <div className="px-4 pt-3 flex-1">
        <p className="font-semibold mb-1" style={{ fontSize: "13px", lineHeight: "15px", color: "#1c1917" }}>{connector.name}</p>
        <p className="line-clamp-2" style={{ fontSize: "12px", lineHeight: "18px", color: "#78716c" }}>{connector.description}</p>
      </div>
      <div className="px-4 pb-4 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {hasStats && connector.tools && <CountBadge label={`${connector.tools} tools`} />}
          {hasStats && connector.prompts && <CountBadge label={`${connector.prompts} prompt${connector.prompts > 1 ? "s" : ""}`} />}
          {hasStats && connector.resources && <CountBadge label={`${connector.resources} resource${connector.resources > 1 ? "s" : ""}`} />}
          {connector.orgWide && connector.userCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 h-[22px] rounded-md text-xs font-medium" style={{ background: "rgba(22,163,74,0.08)", color: "#15803d" }}>
              <Users className="w-3 h-3" />
              {connector.userCount}
            </span>
          )}
        </div>
        <button
          className="px-3 h-[22px] rounded-md text-xs font-medium shrink-0"
          style={{ background: "none", color: "#57534e", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}
        >
          {connector.orgWide ? "Manage" : "Deploy"}
        </button>
      </div>
    </motion.div>
  );
}

function NotificationBanner({
  pendingCount,
  onView,
  onDismiss,
}: {
  pendingCount: number;
  onView: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      className="fixed z-40 flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        top: 16,
        right: 24,
        background: "#ffffff",
        border: "1px solid rgba(28,25,23,0.09)",
        boxShadow: "0 4px 20px rgba(28,25,23,0.12), 0 1px 4px rgba(28,25,23,0.06)",
        minWidth: 280,
        maxWidth: 340,
      }}
      initial={{ opacity: 0, y: -8, x: 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -8, x: 8 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#fff7ed" }}
      >
        <Bell className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>
          {pendingCount} high-priority request{pendingCount !== 1 ? "s" : ""}
        </p>
        <p style={{ fontSize: "12px", color: "#78716c", marginTop: 1 }}>
          Needs immediate review
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onView}
          style={{ fontSize: "12px", fontWeight: 600, color: "#1c1917", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          View
        </button>
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", display: "flex", padding: 0 }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminConnectorsPage() {
  const [mainTab, setMainTab] = useState<HostingTab>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [reviewRequest, setReviewRequest] = useState<SubmittedRequest | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const submittedRequests = useRequests();

  useEffect(() => {
    seedDemoRequests();
  }, []);

  // Listen for "View" clicks from the notification popover
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

  const highPriorityPending = submittedRequests.filter(
    r => (r.status === "pending-review" || r.status === "under-review") && r.highPriority
  );

  const filteredConnectors = ADMIN_CONNECTORS.filter(c => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesHosting = mainTab === "all" || c.hosting === mainTab;
    return matchesSearch && matchesHosting;
  });

  const MAIN_TABS: { id: HostingTab; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "hosted", label: "Hosted" },
    { id: "local",  label: "Local" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 shrink-0" style={{ height: "52px", borderBottom: "1px solid rgba(28,25,23,0.07)" }}>
        <div className="flex items-center gap-0">
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917", marginRight: 16 }}>Connectors</span>
          <div className="flex items-center">
            {MAIN_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className="flex items-center gap-1.5 px-3 h-[52px] relative"
                style={{
                  fontSize: "13px",
                  fontWeight: mainTab === t.id ? 600 : 400,
                  color: mainTab === t.id ? "#1c1917" : "#78716c",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  borderBottom: mainTab === t.id ? "2px solid #1c1917" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ background: "rgba(234,179,8,0.1)", color: "#a16207" }}
          >
            Admin view
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#a8a29e" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search connectors…"
                className="w-full pl-9 h-8 rounded-lg text-xs outline-none"
                style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.12)", color: "#1c1917" }}
              />
            </div>
            <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: "rgba(28,25,23,0.06)" }}>
              <button onClick={() => setViewMode("grid")} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ background: viewMode === "grid" ? "#ffffff" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === "grid" ? "0 1px 3px rgba(28,25,23,0.08)" : "none" }}>
                <LayoutGrid className="w-3.5 h-3.5" style={{ color: viewMode === "grid" ? "#1c1917" : "#78716c" }} />
              </button>
              <button onClick={() => setViewMode("list")} className="w-7 h-7 flex items-center justify-center rounded-md" style={{ background: viewMode === "list" ? "#ffffff" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === "list" ? "0 1px 3px rgba(28,25,23,0.08)" : "none" }}>
                <List className="w-3.5 h-3.5" style={{ color: viewMode === "list" ? "#1c1917" : "#78716c" }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {filteredConnectors.map(c => <AdminConnectorCard key={c.id} connector={c} />)}
          </div>

          {filteredConnectors.length === 0 && (
            <div className="flex items-center justify-center py-20" style={{ color: "#a8a29e", fontSize: "14px" }}>
              No connectors match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Notification banner — high-priority only */}
      <AnimatePresence>
        {showBanner && highPriorityPending.length > 0 && (
          <NotificationBanner
            pendingCount={highPriorityPending.length}
            onView={() => {
              if (highPriorityPending[0]) setReviewRequest(highPriorityPending[0]);
              setShowBanner(false);
            }}
            onDismiss={() => setShowBanner(false)}
          />
        )}
      </AnimatePresence>

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
