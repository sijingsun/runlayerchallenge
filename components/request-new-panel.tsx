"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, ChevronLeft, Globe, MessageSquare, Shield, CheckCircle2 } from "lucide-react";

type HostingType = "hosted" | "local";

interface ConnectorVersion {
  id: string;
  name: string;
  configured: boolean;
  tools?: number;
  resources?: number;
  prompts?: number;
  userHasAccess?: boolean;
}

export interface CatalogConnector {
  id: string;
  name: string;
  description: string;
  icon: string;
  hosting: HostingType;
  versions: ConnectorVersion[];
}

const CATALOG: CatalogConnector[] = [
  { id: "github",     name: "GitHub",      hosting: "local",  description: "GitHub MCP server for repository access, pull requests, and code review workflows.", icon: "/icons/github.svg",     versions: [{ id: "gh-1", name: "GitHub · Read + Write · Engineering", configured: true, tools: 11, prompts: 3, userHasAccess: true }] },
  { id: "slack",      name: "Slack",       hosting: "hosted", description: "Slack MCP server for team messaging, channel search, and workspace management.", icon: "/icons/slack.svg",      versions: [{ id: "sl-1", name: "Slack · Read + Write · All teams", configured: true, tools: 16, resources: 3, userHasAccess: true }, { id: "sl-2", name: "Slack · Read only · Guests", configured: true, tools: 8, resources: 1, userHasAccess: false }] },
  { id: "notion",     name: "Notion",      hosting: "hosted", description: "Notion MCP server for querying databases, reading pages, and managing workspace content.", icon: "/icons/notion.svg",     versions: [{ id: "no-1", name: "Notion · Read only · Designers", configured: true, tools: 6, resources: 2, userHasAccess: false }, { id: "no-2", name: "Notion · Read + Write · Product", configured: true, tools: 12, resources: 3, prompts: 2, userHasAccess: false }] },
  { id: "linear",     name: "Linear",      hosting: "hosted", description: "Access and manage your Linear projects, issues, and teams seamlessly with AI-driven commands.", icon: "/icons/linear.svg",     versions: [{ id: "li-1", name: "Linear · Read + Write · Engineering", configured: true, tools: 16, resources: 3, prompts: 2, userHasAccess: true }, { id: "li-2", name: "Linear · Read only · Design", configured: true, tools: 8, resources: 2, userHasAccess: false }, { id: "li-3", name: "", configured: false, tools: 12, prompts: 3 }] },
  { id: "figma",      name: "Figma",       hosting: "hosted", description: "Figma MCP server for design-to-code workflows, component extraction, and design system access.", icon: "/icons/figma.svg",      versions: [{ id: "fi-1", name: "Figma · Read only · Design", configured: true, tools: 6, resources: 3, userHasAccess: true }, { id: "fi-2", name: "Figma · Read + Write · Product", configured: true, tools: 6, resources: 3, userHasAccess: false }] },
  { id: "asana",      name: "Asana",       hosting: "hosted", description: "Asana MCP server for project management, task tracking, and cross-team collaboration.", icon: "/icons/asana.svg",      versions: [{ id: "as-1", name: "Asana · Read + Write · Product", configured: true, tools: 16, prompts: 2, resources: 3, userHasAccess: false }, { id: "as-2", name: "Asana · Read only · Designers", configured: true, tools: 8, resources: 2, userHasAccess: false }, { id: "as-3", name: "", configured: false, tools: 8, prompts: 1 }] },
  { id: "salesforce", name: "Salesforce",  hosting: "hosted", description: "Salesforce MCP server for CRM data, accounts, opportunities, and customer records.", icon: "/icons/salesforce.svg", versions: [{ id: "sf-1", name: "Salesforce · Read only · Sales", configured: true, tools: 16, prompts: 2, resources: 3, userHasAccess: false }] },
  { id: "loom",       name: "Loom",        hosting: "hosted", description: "Loom MCP server for video recording access, transcripts, and workspace libraries.", icon: "/icons/loom.svg",       versions: [] },
  { id: "clickup",    name: "ClickUp",     hosting: "local",  description: "ClickUp MCP server for task management, spaces, goals, and project workflows.", icon: "/icons/clickup.svg",    versions: [] },
  { id: "box",        name: "Box",         hosting: "hosted", description: "Box MCP server for enterprise file storage, folders, and content workflows.", icon: "/icons/box.svg",        versions: [{ id: "bx-1", name: "Box · Read only · Legal", configured: true, tools: 16, prompts: 2, resources: 3, userHasAccess: false }] },
  { id: "vanta",      name: "Vanta",       hosting: "hosted", description: "Vanta MCP server for compliance status, controls, and security monitoring data.", icon: "/icons/vanta.svg",      versions: [] },
  { id: "amazon",     name: "AWS",         hosting: "hosted", description: "AWS MCP server for cloud resource management across S3, EC2, and more.", icon: "/icons/amazon.svg",     versions: [] },
];

interface RequestNewPanelProps {
  onClose: () => void;
  onSelectVersion: (connector: CatalogConnector, version: ConnectorVersion) => void;
  onRequestNew: (connector?: CatalogConnector) => void;
}

function CardIcon({ icon, name }: { icon: string; name: string }) {
  return (
    <div className="relative">
      <Image src={icon} alt={name} width={32} height={32} />
      <div
        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ background: "#2563eb", border: "1.5px solid #ffffff" }}
      >
        <CheckCircle2 className="w-2.5 h-2.5" style={{ color: "#ffffff" }} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function CardBadges({ hosting, existingCount }: { hosting: HostingType; existingCount: number }) {
  return (
    <div className="flex items-center gap-1">
      {existingCount > 0 && (
        <span
          className="px-1.5 py-0.5 rounded"
          style={{ fontSize: "11px", fontWeight: 600, background: "rgba(28,25,23,0.06)", color: "#57534e" }}
        >
          {existingCount} existing
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {hosting === "hosted"
          ? <Globe className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
          : <MessageSquare className="w-3.5 h-3.5" style={{ color: "#ea580c" }} />
        }
        <Shield className="w-3.5 h-3.5" style={{ color: "#78716c", opacity: 0.5 }} />
      </div>
    </div>
  );
}

export function RequestNewPanel({ onClose, onSelectVersion, onRequestNew }: RequestNewPanelProps) {
  const [search, setSearch] = useState("");
  const [selectedConnector, setSelectedConnector] = useState<CatalogConnector | null>(null);

  const filtered = CATALOG.filter(
    c =>
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (connector: CatalogConnector) => {
    if (connector.versions.length === 0) {
      onRequestNew(connector);
    } else {
      setSelectedConnector(connector);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{ background: "rgba(28,25,23,0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        layout
        className="relative flex flex-col rounded-xl overflow-hidden z-10"
        style={{
          width: selectedConnector ? 560 : "min(1240px, calc(100vw - 48px))",
          maxHeight: selectedConnector ? 620 : "calc(100vh - 80px)",
          background: "#ffffff",
          boxShadow: "0 20px 60px rgba(28,25,23,0.18), 0 4px 16px rgba(28,25,23,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #e7e5e4" }}>
          <div className="flex items-center gap-2">
            {selectedConnector && (
              <button
                onClick={() => setSelectedConnector(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c", display: "flex" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {selectedConnector ? (
              <div className="flex items-center gap-2">
                <Image src={selectedConnector.icon} alt={selectedConnector.name} width={24} height={24} />
                <p style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917" }}>{selectedConnector.name}</p>
              </div>
            ) : (
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#1c1917" }}>Request connector</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!selectedConnector && (
              <button
                onClick={() => onRequestNew()}
                className="px-3 h-8 rounded-lg text-sm font-medium"
                style={{ background: "rgba(28,25,23,0.06)", color: "#1c1917", border: "none", cursor: "pointer" }}
              >
                Request new
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>

          {/* Catalog grid */}
          {!selectedConnector && (
            <motion.div
              key="catalog"
              className="flex flex-col flex-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {/* Search */}
              <div className="px-6 py-3 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#a8a29e" }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search with keywords..."
                    autoFocus
                    className="w-full pl-10 h-9 rounded-lg text-sm outline-none"
                    style={{ background: "#fafaf9", border: "1px solid rgba(28,25,23,0.09)", color: "#1c1917" }}
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {filtered.map(connector => (
                      <motion.button
                        key={connector.id}
                        onClick={() => handleCardClick(connector)}
                        className="flex flex-col rounded-xl text-left overflow-hidden"
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(28,25,23,0.09)",
                          height: 183,
                          cursor: "pointer",
                          padding: 0,
                        }}
                        whileHover={{ boxShadow: "0 4px 16px rgba(28,25,23,0.08)" }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Top row: icon + badges */}
                        <div className="flex items-start justify-between px-4 pt-4">
                          <CardIcon icon={connector.icon} name={connector.name} />
                          <CardBadges hosting={connector.hosting} existingCount={connector.versions.length} />
                        </div>

                        {/* Name + description */}
                        <div className="px-4 pt-3 flex-1">
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", lineHeight: "15px" }}>
                            {connector.name}
                          </p>
                          <p className="line-clamp-3" style={{ fontSize: "12px", color: "#78716c", lineHeight: "18px", marginTop: 4 }}>
                            {connector.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#57534e" }}>No connectors found</p>
                    <p style={{ fontSize: "13px", color: "#a8a29e", marginTop: 4 }}>
                      Can't find what you're looking for?{" "}
                      <button
                        onClick={() => onRequestNew()}
                        style={{ fontSize: "13px", color: "#1c1917", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Request a new connector →
                      </button>
                    </p>
                  </div>
                )}

                {/* Can't find — always visible at bottom when results exist */}
                {filtered.length > 0 && (
                  <div className="pt-4 mt-2" style={{ borderTop: "1px solid #f5f5f4" }}>
                    <p style={{ fontSize: "12px", color: "#a8a29e" }}>
                      Can't find what you're looking for?{" "}
                      <button
                        onClick={() => onRequestNew()}
                        style={{ fontSize: "12px", color: "#57534e", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        Request a new connector →
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Version selection — smaller focused modal style */}
          {selectedConnector && (
            <motion.div
              key="versions"
              className="flex flex-col flex-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Connector description + badges */}
              <div className="px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #e7e5e4" }}>
                <p style={{ fontSize: "13px", color: "#78716c", lineHeight: "20px" }}>
                  {selectedConnector.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ fontSize: "12px", fontWeight: 500, background: "rgba(59,130,246,0.08)", color: "#2563eb", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <Globe className="w-3 h-3" />
                    {selectedConnector.hosting === "hosted" ? "Remote" : "Local"}
                  </span>
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ fontSize: "12px", fontWeight: 500, background: "rgba(28,25,23,0.04)", color: "#57534e", border: "1px solid rgba(28,25,23,0.09)" }}
                  >
                    <Shield className="w-3 h-3" />
                    Secure
                  </span>
                </div>
              </div>

              {/* Version list */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", marginBottom: 12 }}>
                  Existing {selectedConnector.name} Connectors
                </p>
                <div className="space-y-2">
                  {selectedConnector.versions.map(version => {
                    const metaParts = [
                      version.tools ? `${version.tools} tools` : null,
                      version.resources ? `${version.resources} resources` : null,
                      version.prompts ? `${version.prompts} prompts` : null,
                    ].filter(Boolean);

                    return (
                      <div
                        key={version.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                        style={{ border: "1px solid rgba(28,25,23,0.09)", background: "#fafaf9" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Image src={selectedConnector.icon} alt={selectedConnector.name} width={24} height={24} className="shrink-0" />
                          <div className="min-w-0">
                            {version.configured ? (
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917" }}>{version.name}</p>
                            ) : (
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#78716c" }}>
                                {selectedConnector.name} (unconfigured)
                              </p>
                            )}
                            {metaParts.length > 0 && (
                              <p style={{ fontSize: "12px", color: "#a8a29e", marginTop: 2 }}>
                                {metaParts.join(" · ")}
                              </p>
                            )}
                            {!version.configured && (
                              <p style={{ fontSize: "11px", color: "#a8a29e", marginTop: 2 }}>
                                Name this connector version to help users choose the right one.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {version.userHasAccess ? (
                            <button
                              className="px-3 h-7 rounded-lg text-xs font-medium"
                              style={{ background: "none", color: "#a8a29e", border: "none", cursor: "pointer" }}
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectVersion(selectedConnector, version)}
                              className="px-3 h-7 rounded-lg text-xs font-medium"
                              style={{ background: "rgba(28,25,23,0.06)", color: "#1c1917", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}
                            >
                              Request access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderTop: "1px solid #e7e5e4" }}
              >
                <button
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: "#78716c", background: "none", border: "none", cursor: "pointer" }}
                >
                  View Documentation
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5M9.5 2.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedConnector(null)}
                    className="px-4 h-8 rounded-lg text-sm font-medium"
                    style={{ color: "#57534e", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onRequestNew(selectedConnector)}
                    className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-sm font-semibold"
                    style={{ background: "#1c1917", color: "#fafaf9", border: "none", cursor: "pointer" }}
                  >
                    + Request new
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
