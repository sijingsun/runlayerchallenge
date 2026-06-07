"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, Globe, MessageSquare, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { setFromDone } from "@/lib/requests-store";
import { RequestNewPanel } from "@/components/request-new-panel";
import { RequestAccessModal } from "@/components/request-access-modal";
import type { SubmittedRequest } from "@/lib/requests-store";

// Jane's requests in various states for the full Settings → Requests demo
const JANE_REQUESTS: SubmittedRequest[] = [
  {
    id: "demo-1",
    connectorName: "Linear · Read + Write",
    connectorIcon: "/icons/linear.svg",
    clients: ["Claude Desktop", "Cursor"],
    reason: "Need to track engineering issues and project cycles",
    highPriority: true,
    submittedAt: Date.now() - 3 * 60 * 60 * 1000,
    requesterName: "Jane Cooper",
    requesterInitials: "JC",
    requestType: "access",
    status: "approved",
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
    requestType: "access",
    status: "pending-review",
  },
  {
    id: "demo-3",
    connectorName: "Salesforce · Read + Write",
    connectorIcon: "/icons/salesforce.svg",
    clients: ["Claude Desktop"],
    reason: "Need CRM data for account management",
    highPriority: false,
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    requesterName: "Jane Cooper",
    requesterInitials: "JC",
    requestType: "access",
    status: "denied",
    denialReason: "Salesforce access is restricted to the Revenue team only. Please request through your team lead.",
  },
];

const STORAGE_KEY = "runlayer_requests";
const REQUESTS_EVENT = "runlayer_requests_updated";

type HostingType = "hosted" | "local";
type HostingTab = "all" | "hosted" | "local";

const CONNECTORS = [
  { id: "slack",     name: "Slack · Read + Write · All teams",        description: "Slack MCP server for team communication",                                                             icon: "/icons/slack.svg",      hosting: "hosted" as HostingType, tools: 16, resources: 3 },
  { id: "figma",     name: "Figma · Read only · Design",              description: "Figma MCP server for design-to-code workflows, component extraction, and design system access.",      icon: "/icons/figma.svg",      hosting: "hosted" as HostingType, tools: 6,  resources: 3 },
  { id: "figma-2",   name: "Figma · Read + Write · Product",          description: "Figma MCP server for design-to-code workflows, component extraction, and design system access.",      icon: "/icons/figma-2.svg",    hosting: "hosted" as HostingType, tools: 6,  resources: 3 },
  { id: "github",    name: "GitHub · Read + Write · Engineering",     description: "GitHub MCP server for repository access, pull requests, and code review workflows.",                 icon: "/icons/github.svg",     hosting: "local" as HostingType,  tools: 11, prompts: 3 },
  { id: "linear",    name: "Linear · Read + Write · Engineering",     description: "Linear MCP server for issue tracking, project management, and engineering cycles.",                  icon: "/icons/linear.svg",     hosting: "hosted" as HostingType, tools: 11, prompts: 3 },
  { id: "notion",    name: "Notion",                                   description: "Notion MCP server for documents and knowledge management",                                            icon: "/icons/notion.svg",     hosting: "hosted" as HostingType },
  { id: "amazon",    name: "AWS",                                      description: "AWS MCP server for cloud resource management",                                                        icon: "/icons/amazon.svg",     hosting: "hosted" as HostingType, tools: 15 },
  { id: "asana",     name: "Asana",                                    description: "Asana MCP server for project management, task tracking, and team collaboration.",                    icon: "/icons/asana.svg",      hosting: "hosted" as HostingType, tools: 16, prompts: 2, resources: 3 },
  { id: "loom",      name: "Loom",                                     description: "Loom MCP server for video recording access, transcripts, and workspace libraries.",                  icon: "/icons/loom.svg",       hosting: "hosted" as HostingType, tools: 16, prompts: 2, resources: 3 },
  { id: "salesforce",name: "Salesforce",                               description: "Salesforce MCP server for CRM data, accounts, opportunities, and customer records.",                icon: "/icons/salesforce.svg", hosting: "hosted" as HostingType, tools: 16, prompts: 2, resources: 3 },
  { id: "clickup",   name: "ClickUp",                                  description: "ClickUp MCP server for task management, spaces, goals, and project workflows.",                     icon: "/icons/clickup.svg",    hosting: "local" as HostingType,  tools: 11, prompts: 3 },
  { id: "vanta",     name: "Vanta",                                    description: "Vanta MCP server for compliance status, controls, and security monitoring data.",                    icon: "/icons/vanta.svg",      hosting: "hosted" as HostingType, tools: 16, prompts: 2, resources: 3 },
];

function HostingBadge({ type }: { type: HostingType }) {
  return (
    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
      style={{ background: type === "hosted" ? "rgba(59,130,246,0.1)" : "rgba(234,88,12,0.1)" }} title={type}>
      {type === "hosted"
        ? <Globe className="w-3 h-3" style={{ color: "#3b82f6" }} />
        : <MessageSquare className="w-3 h-3" style={{ color: "#ea580c" }} />}
    </div>
  );
}

function CountBadge({ label }: { label: string }) {
  return <span className="inline-flex items-center px-2 h-[22px] rounded-md text-xs font-medium" style={{ background: "rgba(28,25,23,0.06)", color: "#57534e" }}>{label}</span>;
}

function ConnectorCard({ connector }: { connector: typeof CONNECTORS[0] }) {
  const hasStats = connector.tools || (connector as { resources?: number }).resources || (connector as { prompts?: number }).prompts;
  return (
    <motion.div className="flex flex-col rounded-xl cursor-pointer overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)", height: 183 }}
      whileHover={{ boxShadow: "0 4px 16px rgba(28,25,23,0.08)" }} transition={{ duration: 0.15 }}>
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
          {hasStats && (connector as { prompts?: number }).prompts && <CountBadge label={`${(connector as { prompts?: number }).prompts} prompts`} />}
          {hasStats && (connector as { resources?: number }).resources && <CountBadge label={`${(connector as { resources?: number }).resources} resources`} />}
        </div>
        <button className="px-3 h-[22px] rounded-md text-xs font-medium shrink-0"
          style={{ background: "none", color: "#57534e", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}>
          Manage
        </button>
      </div>
    </motion.div>
  );
}

export default function DonePage() {
  const [mainTab, setMainTab] = useState<HostingTab>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalConnector, setModalConnector] = useState<{ name: string; icon: string } | null>(null);

  useEffect(() => {
    // Set up Jane's approved state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(JANE_REQUESTS));
    window.dispatchEvent(new CustomEvent(REQUESTS_EVENT));
    setFromDone(); // so if user navigates to /connectors, data is preserved
    localStorage.setItem("demo_role", "user");
  }, []);

  const filteredConnectors = CONNECTORS.filter(c => {
    const matchesSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesHosting = mainTab === "all" || c.hosting === mainTab;
    return matchesSearch && matchesHosting;
  });

  const MAIN_TABS: { id: HostingTab; label: string }[] = [
    { id: "all", label: "All" }, { id: "hosted", label: "Hosted" }, { id: "local", label: "Local" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 shrink-0" style={{ height: "52px", borderBottom: "1px solid rgba(28,25,23,0.07)" }}>
        <div className="flex items-center gap-0">
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#1c1917", marginRight: 16 }}>My connectors</span>
          <div className="flex items-center">
            {MAIN_TABS.map(t => (
              <button key={t.id} onClick={() => setMainTab(t.id)} className="flex items-center gap-1.5 px-3 h-[52px] relative"
                style={{ fontSize: "13px", fontWeight: mainTab === t.id ? 600 : 400, color: mainTab === t.id ? "#1c1917" : "#78716c", background: "none", border: "none", cursor: "pointer", borderBottom: mainTab === t.id ? "2px solid #1c1917" : "2px solid transparent", marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setPanelOpen(true)} className="flex items-center gap-1.5 px-3 h-[28px] rounded-lg text-xs font-semibold"
          style={{ background: "#1c1917", color: "#fafaf9", border: "none", cursor: "pointer" }}>
          <Plus className="w-3.5 h-3.5" /> Request new
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="relative w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#a8a29e" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connectors…"
                className="w-full pl-9 h-8 rounded-lg text-xs outline-none"
                style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.12)", color: "#1c1917" }} />
            </div>
            <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{ background: "rgba(28,25,23,0.06)" }}>
              <button onClick={() => setViewMode("grid")} className="w-7 h-7 flex items-center justify-center rounded-md"
                style={{ background: viewMode === "grid" ? "#ffffff" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === "grid" ? "0 1px 3px rgba(28,25,23,0.08)" : "none" }}>
                <LayoutGrid className="w-3.5 h-3.5" style={{ color: viewMode === "grid" ? "#1c1917" : "#78716c" }} />
              </button>
              <button onClick={() => setViewMode("list")} className="w-7 h-7 flex items-center justify-center rounded-md"
                style={{ background: viewMode === "list" ? "#ffffff" : "transparent", border: "none", cursor: "pointer", boxShadow: viewMode === "list" ? "0 1px 3px rgba(28,25,23,0.08)" : "none" }}>
                <List className="w-3.5 h-3.5" style={{ color: viewMode === "list" ? "#1c1917" : "#78716c" }} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {filteredConnectors.map(c => <ConnectorCard key={c.id} connector={c} />)}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {panelOpen && (
          <RequestNewPanel onClose={() => setPanelOpen(false)}
            onSelectVersion={(connector, version) => { setPanelOpen(false); setModalConnector({ name: version.name || connector.name, icon: connector.icon }); }}
            onRequestNew={() => { setPanelOpen(false); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modalConnector && (
          <RequestAccessModal connectorName={modalConnector.name} connectorIcon={modalConnector.icon}
            onClose={() => setModalConnector(null)} onSubmitted={() => setModalConnector(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
