"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Globe, ShieldCheck, Plus, Check } from "lucide-react";
import Image from "@/components/img";
import { updateRequestStatus, markRequestSeen } from "@/lib/requests-store";
import type { SubmittedRequest } from "@/lib/requests-store";

// ─── Connector / tool data ───────────────────────────────────────────────────

interface ToolEntry { name: string; risk: "high" | "low"; labels: string[]; description: string }
interface ConnectorSecurity { total: number; highRiskCount: number; sample: ToolEntry[]; resources?: number; prompts?: number }

const SECURITY: Record<string, ConnectorSecurity> = {
  GitHub: { total: 11, highRiskCount: 3, resources: 2, prompts: 1, sample: [
    { name: "push_code",           risk: "high", labels: ["Destructive", "External"], description: "Push commits to a remote repository branch" },
    { name: "delete_branch",       risk: "high", labels: ["Destructive"],             description: "Permanently delete a branch from the repository" },
    { name: "merge_pull_request",  risk: "high", labels: ["Destructive"],             description: "Merge a pull request into the target branch" },
    { name: "create_pull_request", risk: "low",  labels: [],                          description: "Open a new pull request between two branches" },
    { name: "list_repositories",   risk: "low",  labels: [],                          description: "List accessible repositories for the authenticated user" },
    { name: "get_commit",          risk: "low",  labels: [],                          description: "Retrieve detailed information about a specific commit" },
  ]},
  Linear: { total: 16, highRiskCount: 1, resources: 3, prompts: 2, sample: [
    { name: "delete_issue",  risk: "high", labels: ["Destructive"], description: "Permanently delete an issue from the workspace" },
    { name: "create_issue",  risk: "low",  labels: [],              description: "Create a new issue in a Linear team" },
    { name: "update_issue",  risk: "low",  labels: [],              description: "Update properties of an existing Linear issue" },
    { name: "list_teams",    risk: "low",  labels: [],              description: "List all teams in the Linear workspace" },
    { name: "get_project",   risk: "low",  labels: [],              description: "Retrieve details of a Linear project by ID" },
    { name: "search_issues", risk: "low",  labels: [],              description: "Search for issues across the Linear workspace" },
  ]},
  Slack: { total: 16, highRiskCount: 2, resources: 3, sample: [
    { name: "delete_message",  risk: "high", labels: ["Destructive"], description: "Permanently delete a message from a channel" },
    { name: "send_message",    risk: "high", labels: ["External"],    description: "Post a message to a channel or direct message" },
    { name: "list_channels",   risk: "low",  labels: [],              description: "List all channels in the Slack workspace" },
    { name: "read_messages",   risk: "low",  labels: [],              description: "Read messages from a channel or conversation" },
    { name: "search_messages", risk: "low",  labels: [],              description: "Search messages across the workspace" },
  ]},
  Notion: { total: 6, highRiskCount: 1, resources: 2, sample: [
    { name: "delete_page",    risk: "high", labels: ["Destructive"], description: "Permanently delete a page from the workspace" },
    { name: "create_page",    risk: "low",  labels: [],              description: "Create a new page inside a Notion workspace or parent" },
    { name: "update_page",    risk: "low",  labels: [],              description: "Update properties and content of an existing page" },
    { name: "query_database", risk: "low",  labels: [],              description: "Query a Notion database with filters and sorts" },
    { name: "read_block",     risk: "low",  labels: [],              description: "Read the content of a block and its children" },
  ]},
};

function getSecurity(connectorName: string): ConnectorSecurity {
  const base = connectorName.split(" · ")[0];
  return SECURITY[base] ?? { total: 8, highRiskCount: 0, sample: [
    { name: "read_data",    risk: "low", labels: [], description: "Read data from the connected service" },
    { name: "list_items",   risk: "low", labels: [], description: "List available items in the workspace" },
    { name: "search",       risk: "low", labels: [], description: "Search for content across the service" },
    { name: "export_data",  risk: "low", labels: [], description: "Export data in a structured format" },
    { name: "get_metadata", risk: "low", labels: [], description: "Retrieve metadata about resources" },
  ]};
}

// ─── Shared atoms ────────────────────────────────────────────────────────────

function FormRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex flex-col gap-1.5 px-3 py-3"
      style={{ borderBottom: last ? "none" : "1px solid rgba(28,25,23,0.09)" }}
    >
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#78716c", lineHeight: "15px" }}>{label}</p>
      {children}
    </div>
  );
}

function InlineBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 rounded-md"
      style={{ height: 18, fontSize: "12px", fontWeight: 500, color: "#44403c", background: "rgba(28,25,23,0.06)" }}
    >
      {children}
    </span>
  );
}

function PurpleCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: checked ? "#8b5cf6" : "#ffffff",
        border: checked ? "none" : "1.5px solid rgba(28,25,23,0.25)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: checked ? "0px 4px 8px -2px rgba(28,25,23,0.09)" : "none",
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function PassedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 rounded-md shrink-0"
      style={{ height: 18, fontSize: "12px", fontWeight: 600, background: "rgba(20,184,166,0.08)", color: "#0d9488", whiteSpace: "nowrap" }}
    >
      <ShieldCheck size={10} />
      Passed
    </span>
  );
}

function HighRiskBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 rounded-md shrink-0"
      style={{ height: 18, fontSize: "12px", fontWeight: 600, background: "#fee2e2", color: "#991b1b", whiteSpace: "nowrap" }}
    >
      <AlertTriangle size={10} />
      High risk
    </span>
  );
}

// Derives initials colour palette from name
const AVATAR_PALETTES = [
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fef3c7", color: "#92400e" },
];
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }
function avatarPalette(name: string) { return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length]; }

function UserChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  const pal = avatarPalette(name);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-1.5 rounded-md"
      style={{ height: 22, background: "rgba(28,25,23,0.06)", fontSize: "12px", fontWeight: 600, color: "#57534e" }}
    >
      <span
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: 14, height: 14, background: pal.bg, color: pal.color, fontSize: "8px", fontWeight: 700 }}
      >
        {initials(name)}
      </span>
      {name}
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", display: "flex", padding: 0, opacity: 0.7 }}
      >
        <X size={11} />
      </button>
    </span>
  );
}

type Step1Tab = "overview" | "tools" | "security";
type AppliesTo = "everyone" | "users" | "agents" | "groups" | "roles";
type AccessTab = "tools" | "resources" | "prompts";

// ─── Main modal ──────────────────────────────────────────────────────────────

interface AdminReviewModalProps {
  request: SubmittedRequest;
  allRequests: SubmittedRequest[];
  onClose: () => void;
  onDone: () => void;
}

export function AdminReviewModal({ request, allRequests, onClose, onDone }: AdminReviewModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tab, setTab] = useState<Step1Tab>("overview");
  const [denyMode, setDenyMode] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [toolToggles, setToolToggles] = useState<Record<string, boolean>>({});
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const isNewConnector = request.requestType === "new-connector";

  // Mark as seen immediately on open
  useEffect(() => { markRequestSeen(request.id); }, [request.id]);

  function timeAgo(ts: number): string {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  function getAuthMethod(name: string): string {
    const base = name.split(" · ")[0].toLowerCase();
    if (["github", "google", "slack", "notion", "figma"].includes(base)) return "OAuth";
    return "API key";
  }

  // Step 2 state
  const [appliesTo, setAppliesTo] = useState<AppliesTo>("users");
  const [accessTab, setAccessTab] = useState<AccessTab>("tools");
  const [userChips, setUserChips] = useState<string[]>(() => {
    const names = request.requesterNames ?? [request.requesterName];
    return names.filter(n => n !== "3 people");
  });

  const security = getSecurity(request.connectorName);
  const connectorBase = request.connectorName.split(" · ")[0];

  const coRequesters = allRequests.filter(
    r => r.id !== request.id &&
      r.connectorName.split(" · ")[0] === connectorBase &&
      (r.status === "pending-review" || r.status === "under-review")
  );

  function getToolEnabled(name: string) { return toolToggles[name] !== false; }
  function toggleTool(name: string) { setToolToggles(p => ({ ...p, [name]: !getToolEnabled(name) })); }
  const allToolsEnabled = security.sample.every(t => getToolEnabled(t.name));
  function toggleAllTools() {
    const val = !allToolsEnabled;
    setToolToggles(Object.fromEntries(security.sample.map(t => [t.name, val])));
  }

  function handleDeny() {
    updateRequestStatus(request.id, "denied", denyReason || undefined);
    onDone();
  }

  function handleGrant() {
    updateRequestStatus(request.id, "approved");
    coRequesters.forEach(r => updateRequestStatus(r.id, "approved"));
    setStep(3);
  }

  const TABS: { id: Step1Tab; label: string; count?: number; countColor?: string; countBg?: string }[] = [
    { id: "overview",  label: "Overview" },
    { id: "tools",     label: "Tools",         count: security.total },
    { id: "security",  label: "Security risks", count: security.highRiskCount, countColor: "#f43f5e", countBg: "rgba(244,63,94,0.10)" },
  ];

  const APPLIES_TO_OPTS: { id: AppliesTo; label: string }[] = [
    { id: "everyone", label: "Everyone" },
    { id: "users",    label: "Users" },
    { id: "agents",   label: "Agents" },
    { id: "groups",   label: "Groups" },
    { id: "roles",    label: "Roles" },
  ];

  const allNames = request.requesterNames ?? [request.requesterName];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="fixed inset-0"
        style={{ background: "rgba(28,25,23,0.20)", backdropFilter: "blur(8px)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        layout
        className="relative z-10 flex flex-col rounded-lg overflow-hidden"
        style={{
          width: 600, maxHeight: "calc(100vh - 80px)",
          background: "#fdfdfd",
          border: "1px solid rgba(28,25,23,0.09)",
          boxShadow: "0px 8px 16px -2px rgba(28,25,23,0.09), 0px 2px 4px -2px rgba(28,25,23,0.09)",
        }}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* ── Step 1: Review ───────────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" className="flex flex-col" style={{ maxHeight: "calc(100vh - 80px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between shrink-0" style={{ padding: "14px 16px" }}>
                <div className="flex flex-col gap-0.5">
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#292524" }}>
                    {isNewConnector ? "New connector request" : "Connector access request"}
                  </p>
                  {isNewConnector && (
                    <p style={{ fontSize: "12px", color: "#78716c", lineHeight: "16px" }}>
                      {`${connectorBase} hasn't been added to your org yet. Review before approving.`}
                    </p>
                  )}
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#a8a29e", opacity: 0.6, display: "flex" }}>
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 60 }}>
                <div className="flex flex-col gap-4 px-4 pb-4" style={{ borderTop: "1px solid #e7e5e4" }}>
                  {/* Connector name */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded shrink-0 overflow-hidden"
                        style={{ width: 24, height: 24, background: "#fff", border: "1px solid rgba(28,25,23,0.09)", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)", padding: 3 }}>
                        <Image src={request.connectorIcon} alt="" width={18} height={18} />
                      </div>
                      <p style={{ fontSize: "20px", fontWeight: 500, color: "#292524", letterSpacing: "-0.26px", lineHeight: "26px" }}>
                        {request.connectorName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 px-1.5 rounded-md"
                        style={{ height: 22, background: "rgba(14,165,233,0.08)", fontSize: "12px", fontWeight: 600, color: "#0ea5e9" }}>
                        <Globe size={12} /> Remote
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: "13px", color: "#78716c", lineHeight: "22px" }}>
                    Access and manage your {connectorBase} workspace seamlessly with AI-driven commands.
                    Use it to automate tasks, retrieve data, and integrate with your team&apos;s workflow.
                  </p>

                  {/* Tab bar */}
                  <div className="flex items-center gap-1">
                    {TABS.map(t => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className="flex items-center gap-1.5 px-2 rounded-md"
                        style={{ height: 26, background: tab === t.id ? "rgba(28,25,23,0.06)" : "transparent", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: tab === t.id ? 500 : 400, color: tab === t.id ? "#1c1917" : "#57534e" }}
                      >
                        {t.label}
                        {t.count !== undefined && (
                          <span className="flex items-center justify-center rounded-md px-1"
                            style={{ height: 18, minWidth: 18, fontSize: "12px", fontWeight: 600, background: t.countBg ?? "rgba(28,25,23,0.06)", color: t.countColor ?? "#57534e" }}>
                            {t.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div className="px-4">

                  {/* Overview tab */}
                  {tab === "overview" && (
                    <div className="flex flex-col gap-3">

                      {/* Security summary — directly below the tab bar */}
                      <div className="rounded-lg px-3 py-3 flex flex-col gap-2.5"
                        style={{ background: "rgba(28,25,23,0.03)", border: "1px solid rgba(28,25,23,0.09)" }}>
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#44403c" }}>Security summary:</p>
                          {security.highRiskCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 rounded-md"
                              style={{ height: 22, fontSize: "12px", fontWeight: 600, background: "rgba(244,63,94,0.08)", color: "#e11d48" }}>
                              <AlertTriangle size={11} />
                              {security.highRiskCount} high risk tool{security.highRiskCount !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 rounded-md"
                              style={{ height: 22, fontSize: "12px", fontWeight: 600, background: "rgba(22,163,74,0.08)", color: "#15803d" }}>
                              No high risk tools
                            </span>
                          )}
                        </div>
                        {security.highRiskCount > 0 && (
                          <>
                            <p style={{ fontSize: "13px", color: "#78716c", lineHeight: "20px" }}>
                              {security.highRiskCount} tool{security.highRiskCount !== 1 ? "s" : ""} in this connector{" "}
                              {security.highRiskCount !== 1 ? "have" : "has"} been classified as High Risk. These tools
                              can perform sensitive or potentially destructive actions. Review their capabilities before
                              deciding whether to approve this connector.{" "}
                              <button
                                onClick={() => setToolsExpanded(v => !v)}
                                style={{ fontSize: "13px", color: "#44403c", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "rgba(28,25,23,0.3)" }}
                              >
                                {toolsExpanded ? "Hide tools" : "View tools"}
                              </button>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {security.sample.filter(t => t.risk === "high").map(tool => (
                                <span key={tool.name} className="inline-flex items-center gap-1 px-2 font-mono rounded-md"
                                  style={{ height: 22, fontSize: "11px", fontWeight: 500, background: "#fee2e2", color: "#991b1b" }}>
                                  {tool.name}
                                  <AlertTriangle size={9} style={{ color: "#dc2626", flexShrink: 0 }} />
                                </span>
                              ))}
                            </div>
                            {/* Inline tools expansion */}
                            <AnimatePresence>
                              {toolsExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div className="rounded-lg overflow-hidden mt-1" style={{ border: "1px solid rgba(28,25,23,0.09)" }}>
                                    {security.sample.map((tool, i) => (
                                      <div key={tool.name} className="flex items-center justify-between px-3 py-2"
                                        style={{ borderBottom: i < security.sample.length - 1 ? "1px solid rgba(28,25,23,0.06)" : "none", background: tool.risk === "high" ? "rgba(254,226,226,0.3)" : "rgba(28,25,23,0.02)" }}>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono" style={{ fontSize: "12px", color: tool.risk === "high" ? "#991b1b" : "#44403c" }}>{tool.name}</span>
                                          {tool.labels.map(l => (
                                            <span key={l} className="px-1.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", background: "#fee2e2" }}>{l}</span>
                                          ))}
                                        </div>
                                        <span style={{ fontSize: "11px", color: "#a8a29e" }}>{tool.description}</span>
                                      </div>
                                    ))}
                                    {security.total > security.sample.length && (
                                      <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(28,25,23,0.06)", background: "rgba(28,25,23,0.02)" }}>
                                        <p style={{ fontSize: "12px", color: "#a8a29e" }}>+{security.total - security.sample.length} more tools</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>

                      {/* Request details card */}
                      <div className="rounded-lg overflow-hidden" style={{ background: "rgba(28,25,23,0.03)", border: "1px solid rgba(28,25,23,0.09)" }}>
                        <FormRow label="Requested by:">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {allNames.map((name, i) => {
                              const pal = avatarPalette(name);
                              return (
                                <div key={i} className="flex items-center gap-1">
                                  <div className="rounded-full flex items-center justify-center shrink-0"
                                    style={{ width: 16, height: 16, background: pal.bg, fontSize: "8px", fontWeight: 700, color: pal.color }}>
                                    {initials(name)}
                                  </div>
                                  <InlineBadge>{name}</InlineBadge>
                                </div>
                              );
                            })}
                            <span style={{ fontSize: "12px", color: "#a8a29e" }}>· {timeAgo(request.submittedAt)}</span>
                          </div>
                        </FormRow>

                        {request.clients.length > 0 && (
                          <FormRow label={isNewConnector ? "Requested for:" : "AI clients:"}>
                            <div className="flex flex-wrap gap-1.5">
                              {request.clients.map(c => <InlineBadge key={c}>{c}</InlineBadge>)}
                            </div>
                          </FormRow>
                        )}

                        {isNewConnector && (
                          <FormRow label="Authentication method:">
                            <InlineBadge>{getAuthMethod(request.connectorName)}</InlineBadge>
                          </FormRow>
                        )}

                        {request.reason && (
                          <FormRow label="Reason for request:">
                            <p style={{ fontSize: "13px", color: "#78716c", lineHeight: "22px" }}>
                              &ldquo;{request.reason}&rdquo;
                            </p>
                          </FormRow>
                        )}

                        {request.highPriority && (
                          <FormRow label="Priority:" last>
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={12} style={{ color: "#c2410c" }} />
                              <span style={{ fontSize: "13px", color: "#9a3412", fontWeight: 500 }}>
                                Marked urgent — requester says this is blocking their work
                              </span>
                            </div>
                          </FormRow>
                        )}

                        {!request.highPriority && !request.reason && request.clients.length === 0 && (
                          <FormRow label="" last>
                            <p style={{ fontSize: "13px", color: "#a8a29e" }}>No additional context provided.</p>
                          </FormRow>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Tools tab */}
                  {tab === "tools" && (
                    <div className="rounded-lg overflow-hidden" style={{ background: "rgba(28,25,23,0.03)", border: "1px solid rgba(28,25,23,0.09)" }}>
                      {security.sample.map((tool, i) => (
                        <div key={tool.name} className="flex items-center justify-between px-3 py-2.5"
                          style={{ borderBottom: i < security.sample.length - 1 ? "1px solid rgba(28,25,23,0.07)" : "none", background: tool.risk === "high" ? "rgba(254,226,226,0.3)" : "transparent" }}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono" style={{ fontSize: "12px", color: tool.risk === "high" ? "#991b1b" : "#44403c" }}>{tool.name}</span>
                            {tool.labels.map(l => (
                              <span key={l} className="px-1.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", background: "#fee2e2" }}>{l}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                      {security.total > security.sample.length && (
                        <div className="px-3 py-2.5" style={{ borderTop: "1px solid rgba(28,25,23,0.07)" }}>
                          <p style={{ fontSize: "12px", color: "#a8a29e" }}>+ {security.total - security.sample.length} more tools included</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security risks tab */}
                  {tab === "security" && (
                    <div className="rounded-lg overflow-hidden" style={{ background: "rgba(28,25,23,0.03)", border: "1px solid rgba(28,25,23,0.09)" }}>
                      {security.highRiskCount === 0 ? (
                        <div className="px-3 py-4">
                          <p style={{ fontSize: "13px", color: "#78716c" }}>No high-risk tools in this connector.</p>
                        </div>
                      ) : (
                        <>
                          {security.sample.filter(t => t.risk === "high").map((tool, i, arr) => (
                            <div key={tool.name} className="px-3 py-3"
                              style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(28,25,23,0.07)" : "none" }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono" style={{ fontSize: "12px", color: "#991b1b" }}>{tool.name}</span>
                                {tool.labels.map(l => (
                                  <span key={l} className="px-1.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: "#dc2626", background: "#fee2e2" }}>{l}</span>
                                ))}
                              </div>
                              <p style={{ fontSize: "12px", color: "#78716c", lineHeight: "18px" }}>
                                {tool.labels.includes("Destructive")
                                  ? "This tool can permanently modify or delete data and cannot be undone."
                                  : "This tool sends data to external systems outside your organization."}
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Deny input */}
                  <AnimatePresence>
                    {denyMode && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }} style={{ overflow: "hidden", marginTop: 12 }}>
                        <textarea value={denyReason} onChange={e => setDenyReason(e.target.value)} rows={2}
                          placeholder="Optional: leave a note for the requester explaining why."
                          className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none" autoFocus
                          style={{ border: "1px solid rgba(28,25,23,0.15)", color: "#1c1917", background: "#fafaf9", lineHeight: "20px", fontSize: "13px" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 px-4"
                style={{ height: 52, background: "#fdfdfd", borderTop: "1px solid rgba(28,25,23,0.06)" }}>
                {denyMode ? (
                  <>
                    <button onClick={() => { setDenyMode(false); setDenyReason(""); }} className="px-3 rounded-md"
                      style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#57534e", background: "none", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button onClick={handleDeny} className="px-3 rounded-md"
                      style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#e11d48", background: "#fff", border: "1px solid rgba(28,25,23,0.09)", cursor: "pointer", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)" }}>
                      Confirm reject
                    </button>
                  </>
                ) : isNewConnector ? (
                  /* New connector request buttons */
                  <>
                    <button onClick={() => setDenyMode(true)} className="px-3 rounded-md"
                      style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#e11d48", background: "#fff", border: "1px solid rgba(28,25,23,0.09)", cursor: "pointer", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)" }}>
                      Reject
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={handleGrant} className="px-3 rounded-md flex items-center gap-1"
                        style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#57534e", background: "#fff", border: "1px solid rgba(28,25,23,0.09)", cursor: "pointer", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)" }}>
                        Use existing
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5, flexShrink: 0 }}>
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button onClick={() => setStep(2)} className="px-3 rounded-md"
                        style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#fafaf9", background: "#14110f", border: "none", cursor: "pointer" }}>
                        Set up custom configuration
                      </button>
                    </div>
                  </>
                ) : (
                  /* Access request buttons */
                  <>
                    <button onClick={() => setDenyMode(true)} className="px-3 rounded-md"
                      style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#e11d48", background: "#fff", border: "1px solid rgba(28,25,23,0.09)", cursor: "pointer", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)" }}>
                      Reject
                    </button>
                    <button onClick={() => setStep(2)} className="px-3 rounded-md"
                      style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#fafaf9", background: "#14110f", border: "none", cursor: "pointer" }}>
                      Approve &amp; configure →
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Add permissions ───────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" className="flex flex-col" style={{ maxHeight: "calc(100vh - 80px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
            >
              {/* Header */}
              <div className="relative shrink-0 px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(28,25,23,0.09)" }}>
                <button onClick={onClose} className="absolute flex items-center justify-center"
                  style={{ top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#a8a29e", opacity: 0.6 }}>
                  <X size={16} />
                </button>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#292524", letterSpacing: "-0.2px", lineHeight: "20px" }}>
                  Add permissions to {connectorBase}
                </p>
                <p style={{ fontSize: "13px", color: "#78716c", marginTop: 4, lineHeight: "22px" }}>
                  Give your team access to this connector.
                </p>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5" style={{ paddingBottom: 68 }}>

                {/* Applies to */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-0.5">
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#78716c" }}>Applies to</p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#f43f5e", lineHeight: "13px" }}>*</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {APPLIES_TO_OPTS.map(opt => (
                      <button key={opt.id} onClick={() => setAppliesTo(opt.id)}
                        style={{
                          height: 28, padding: "0 12px", borderRadius: 6,
                          fontSize: "14px", fontWeight: 600, color: "#57534e",
                          background: "#ffffff", cursor: "pointer",
                          border: appliesTo === opt.id ? "1.5px solid #8b5cf6" : "1px solid rgba(28,25,23,0.09)",
                          boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09), 0px 0px 0px 1px rgba(28,25,23,0.09)",
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="flex flex-col gap-2">
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#78716c" }}>Conditions (optional)</p>
                  <button className="inline-flex items-center gap-1"
                    style={{ height: 22, padding: "0 8px", borderRadius: 6, fontSize: "14px", fontWeight: 600, color: "#57534e", background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)", cursor: "pointer", boxShadow: "0px 3px 6px -2px rgba(28,25,23,0.09)" }}>
                    <Plus size={13} style={{ opacity: 0.6 }} /> Add condition
                  </button>
                </div>

                {/* Users (shown when appliesTo is "users" or "everyone") */}
                {(appliesTo === "users" || appliesTo === "everyone") && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-0.5">
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#78716c" }}>Users</p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#f43f5e", lineHeight: "13px" }}>*</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 px-1.5 py-1.5 rounded-md min-h-[32px]"
                      style={{ border: "1px solid rgba(28,25,23,0.09)", background: "transparent" }}>
                      {userChips.map(name => (
                        <UserChip key={name} name={name} onRemove={() => setUserChips(c => c.filter(n => n !== name))} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Access */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-0.5">
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#78716c" }}>Access</p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#f43f5e", lineHeight: "13px" }}>*</p>
                  </div>

                  {/* Access sub-tabs */}
                  <div className="flex items-center gap-1">
                    {([
                      { id: "tools" as const,     label: "Tools",     count: security.total },
                      { id: "resources" as const,  label: "Resources", count: security.resources ?? 0 },
                      { id: "prompts" as const,    label: "Prompts",   count: security.prompts ?? 0 },
                    ]).map(t => (
                      <button key={t.id} onClick={() => setAccessTab(t.id)}
                        className="inline-flex items-center gap-1.5 px-2 rounded-md"
                        style={{ height: 26, fontSize: "14px", fontWeight: 500, cursor: "pointer", border: "none", background: accessTab === t.id ? "rgba(28,25,23,0.06)" : "#fdfdfd", color: accessTab === t.id ? "#1c1917" : "#57534e" }}>
                        {t.label}
                        {t.count > 0 && (
                          <span className="inline-flex items-center justify-center px-1 rounded-md"
                            style={{ height: 18, minWidth: 18, fontSize: "12px", fontWeight: 600, background: "rgba(28,25,23,0.06)", color: "#57534e" }}>
                            {t.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tool list */}
                  {accessTab === "tools" && (
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(28,25,23,0.09)" }}>
                      {/* Full access header row */}
                      <div className="flex items-center gap-4 px-4 py-3"
                        style={{ background: "rgba(28,25,23,0.03)", borderBottom: "1px solid rgba(28,25,23,0.06)" }}>
                        <PurpleCheckbox checked={allToolsEnabled} onChange={toggleAllTools} />
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#292524" }}>Full access</p>
                      </div>

                      {/* Individual tools */}
                      {security.sample.map((tool, i) => (
                        <div key={tool.name}
                          className="flex items-center gap-4 px-4 py-3"
                          style={{ background: "rgba(28,25,23,0.03)", borderBottom: i < security.sample.length - 1 ? "1px solid rgba(28,25,23,0.06)" : "none" }}>
                          <PurpleCheckbox checked={getToolEnabled(tool.name)} onChange={() => toggleTool(tool.name)} />
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#292524", lineHeight: "15px" }}>{tool.name}</p>
                            <p className="truncate" style={{ fontSize: "12px", color: "#78716c", lineHeight: "18px" }}>{tool.description}</p>
                          </div>
                          <div className="shrink-0">
                            {tool.risk === "high" ? <HighRiskBadge /> : <PassedBadge />}
                          </div>
                        </div>
                      ))}

                      {security.total > security.sample.length && (
                        <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(28,25,23,0.06)", background: "rgba(28,25,23,0.03)" }}>
                          <p style={{ fontSize: "12px", color: "#a8a29e" }}>
                            + {security.total - security.sample.length} more — all enabled by default
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {accessTab !== "tools" && (
                    <div className="rounded-lg px-4 py-6 flex items-center justify-center"
                      style={{ background: "rgba(28,25,23,0.03)", border: "1px solid rgba(28,25,23,0.09)" }}>
                      <p style={{ fontSize: "13px", color: "#a8a29e" }}>
                        No {accessTab} configured for this connector.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 px-4"
                style={{ height: 52, background: "#fdfdfd", borderTop: "1px solid rgba(28,25,23,0.06)" }}>
                <button onClick={onClose} className="px-3 rounded-md"
                  style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#57534e", background: "transparent", border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleGrant} className="px-3 rounded-md"
                  style={{ height: 28, fontSize: "14px", fontWeight: 600, color: "#fafaf9", background: "#14110f", border: "none", cursor: "pointer" }}>
                  Add permissions
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Success ───────────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" className="flex flex-col items-center justify-center px-8 py-12 gap-5"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              {/* Green circle with ring */}
              <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
                <div className="absolute inset-0 rounded-full" style={{ border: "1.5px solid rgba(22,163,74,0.25)" }} />
                <div className="absolute rounded-full flex items-center justify-center"
                  style={{ inset: 7, background: "rgba(22,163,74,0.10)" }}>
                  <Check size={22} strokeWidth={2.5} style={{ color: "#16a34a" }} />
                </div>
              </div>

              {/* Copy */}
              <div className="flex flex-col items-center gap-2 text-center">
                <p style={{ fontSize: "18px", fontWeight: 700, color: "#1c1917", letterSpacing: "-0.2px" }}>
                  Permissions added
                </p>
                <p style={{ fontSize: "14px", color: "#78716c", lineHeight: "22px", maxWidth: 340 }}>
                  {userChips.length > 0
                    ? `${userChips.join(", ")} now ${userChips.length === 1 ? "has" : "have"} access to ${connectorBase}.`
                    : `Access to ${connectorBase} has been granted.`}
                </p>
              </div>

              {/* Divider + Done */}
              <div className="w-full flex flex-col items-center gap-0" style={{ marginTop: 8 }}>
                <div className="w-full" style={{ borderTop: "1px solid rgba(28,25,23,0.07)", marginBottom: 20 }} />
                <button
                  onClick={onDone}
                  className="px-10 rounded-xl"
                  style={{
                    height: 40, fontSize: "15px", fontWeight: 600, color: "#1c1917",
                    background: "#ffffff", cursor: "pointer",
                    border: "1px solid rgba(28,25,23,0.12)",
                    boxShadow: "0px 3px 8px -2px rgba(28,25,23,0.08)",
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
}
