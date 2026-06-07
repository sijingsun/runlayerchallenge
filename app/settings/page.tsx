"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";

const CARD_LABEL: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: "13px",
  color: "#44403c",
  letterSpacing: "0px",
};

const CARD_DESC: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: "18px",
  color: "#78716c",
  letterSpacing: "0px",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "16px",
  color: "#1c1917",
  letterSpacing: "-0.2px",
};

const SECTION_DESC: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  color: "#78716c",
};

const DIVIDER = <div style={{ height: "1px", background: "#e7e5e4" }} />;

interface ClientRow {
  id: string;
  name: string;
  enabled: boolean;
}

const initialClients: ClientRow[] = [
  { id: "cursor", name: "Cursor", enabled: true },
  { id: "vscode", name: "VS Code", enabled: true },
  { id: "claude", name: "Claude", enabled: true },
  { id: "claude-code", name: "Claude Code", enabled: false },
  { id: "windsurf", name: "Windsurf", enabled: false },
  { id: "chatgpt", name: "ChatGPT", enabled: false },
  { id: "codex", name: "Codex", enabled: false },
  { id: "gumloop", name: "Gumloop", enabled: false },
  { id: "raycast", name: "Raycast", enabled: false },
  { id: "warp", name: "Warp", enabled: false },
  { id: "github-copilot", name: "Github Copilot", enabled: false },
  { id: "typescript-sdk", name: "Typescript SDK", enabled: false },
  { id: "gemini-cli", name: "Gemini CLI", enabled: false },
  { id: "python-sdk", name: "Python SDK", enabled: false },
];

const clientColors: Record<string, string> = {
  cursor: "#000",
  vscode: "#007ACC",
  claude: "#D97706",
  "claude-code": "#D97706",
  windsurf: "#0D9488",
  chatgpt: "#10B981",
  codex: "#27272a",
  gumloop: "#2563EB",
  raycast: "#EF4444",
  warp: "#18181b",
  "github-copilot": "#52525b",
  "typescript-sdk": "#1D4ED8",
  "gemini-cli": "#3B82F6",
  "python-sdk": "#EAB308",
};

function ClientIcon({ id, name }: { id: string; name: string }) {
  const bg = clientColors[id] || "#a8a29e";
  const letter = name[0].toUpperCase();
  return (
    <div
      className="w-5 h-5 rounded shrink-0 flex items-center justify-center"
      style={{ background: bg }}
    >
      <span style={{ fontSize: "9px", fontWeight: 700, color: "#fff" }}>{letter}</span>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid #e7e5e4", background: "#fdfdfd" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3">
      <p style={SECTION_TITLE}>{title}</p>
      <p style={SECTION_DESC}>{description}</p>
    </div>
  );
}

export default function SettingsGeneralPage() {
  const [orgName, setOrgName] = useState("Anysource");
  const [logoUrl, setLogoUrl] = useState("");
  const [newConnectorRequests, setNewConnectorRequests] = useState(false);
  const [existingConnectorRequests, setExistingConnectorRequests] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>(initialClients);

  function toggleClient(id: string) {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  return (
    <div className="max-w-[520px] py-8 space-y-8">

      {/* Organization Information */}
      <div>
        <SectionHeader
          title="Organization Information"
          description="Configure your organization's basic information and branding."
        />
        <SectionCard>
          <div className="flex items-center justify-between px-3 py-2.5">
            <p style={CARD_LABEL}>Organization Name</p>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-60 h-7 text-xs border-stone-200"
            />
          </div>
          {DIVIDER}
          <div className="flex items-center justify-between px-3 py-2.5">
            <p style={CARD_LABEL}>Logo URL (optional)</p>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-60 h-7 text-xs border-stone-200 placeholder:text-stone-400"
            />
          </div>
        </SectionCard>
      </div>

      {/* Employee permissions */}
      <div>
        <SectionHeader
          title="Employee permissions"
          description="Control what employees can do in your workspace."
        />
        <SectionCard>
          <motion.div
            className="flex items-start justify-between px-4 py-3 gap-4 cursor-pointer"
            whileHover={{ backgroundColor: "rgba(28,25,23,0.02)" }}
            transition={{ duration: 0.12 }}
            onClick={() => setNewConnectorRequests(!newConnectorRequests)}
          >
            <div className="flex-1 space-y-1">
              <p style={CARD_LABEL}>New connector requests</p>
              <p style={CARD_DESC}>
                Allow non-admins to request the creation of new connectors. New connector requests require admin approval.
              </p>
            </div>
            <Switch checked={newConnectorRequests} onCheckedChange={setNewConnectorRequests} className="shrink-0 mt-0.5" />
          </motion.div>
          {DIVIDER}
          <motion.div
            className="flex items-start justify-between px-4 py-3 gap-4 cursor-pointer"
            whileHover={{ backgroundColor: "rgba(28,25,23,0.02)" }}
            transition={{ duration: 0.12 }}
            onClick={() => setExistingConnectorRequests(!existingConnectorRequests)}
          >
            <div className="flex-1 space-y-1">
              <p style={CARD_LABEL}>Existing connector requests</p>
              <p style={CARD_DESC}>
                Allow non-admins to request access to connectors that already exist in the workspace. Access to existing connectors require admin approval.
              </p>
            </div>
            <Switch checked={existingConnectorRequests} onCheckedChange={setExistingConnectorRequests} className="shrink-0 mt-0.5" />
          </motion.div>
        </SectionCard>
      </div>

      {/* Deployment Version */}
      <div>
        <SectionHeader
          title="Deployment Version"
          description="This is the version of Anysource that you currently have deployed."
        />
        <SectionCard>
          <div className="flex items-center justify-between px-3 py-2.5">
            <p style={CARD_LABEL}>Backend Version</p>
            <span className="text-xs font-mono font-medium px-1.5 py-0.5" style={{ borderRadius: "6px", background: "rgba(28,25,23,0.06)", color: "#44403c" }}>1.6.0</span>
          </div>
          {DIVIDER}
          <div className="flex items-center justify-between px-3 py-2.5">
            <p style={CARD_LABEL}>Frontend Version</p>
            <span className="text-xs font-mono font-medium px-1.5 py-0.5" style={{ borderRadius: "6px", background: "rgba(28,25,23,0.06)", color: "#44403c" }}>1.6.0</span>
          </div>
        </SectionCard>
      </div>

      {/* Directory Sync */}
      <div>
        <SectionHeader
          title="Directory Sync"
          description="Automatically sync users and groups from your directory service."
        />
        <SectionCard>
          <div className="flex items-center justify-between px-3 py-2.5">
            <p style={CARD_LABEL}>Directory Sync</p>
            <span className="text-xs font-medium px-1.5 py-0.5" style={{ borderRadius: "6px", background: "rgba(28,25,23,0.06)", color: "#78716c" }}>Not Configured</span>
          </div>
        </SectionCard>
      </div>

      {/* Client Visibility */}
      <div>
        <SectionHeader
          title="Client Visibility"
          description="Manage which AI clients are shown when users add a connector to a client."
        />
        <SectionCard>
          {clients.map((client, i) => (
            <div key={client.id}>
              {i > 0 && DIVIDER}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
                whileHover={{ backgroundColor: "rgba(28,25,23,0.02)" }}
                transition={{ duration: 0.12 }}
                onClick={() => toggleClient(client.id)}
              >
                <div className="flex items-center gap-2.5">
                  <ClientIcon id={client.id} name={client.name} />
                  <p style={CARD_LABEL}>{client.name}</p>
                </div>
                <Switch checked={client.enabled} onCheckedChange={() => toggleClient(client.id)} className="shrink-0" />
              </motion.div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
