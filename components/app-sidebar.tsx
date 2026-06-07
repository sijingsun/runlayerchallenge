"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { UserNotificationPopover } from "@/components/user-notification-popover";
import { NotificationPopover } from "@/components/notification-popover";
import { useRequests } from "@/hooks/use-requests";
import { useDemoRole } from "@/hooks/use-demo-role";
import {
  LayoutGrid,
  Layers,
  Package,
  Bot,
  Zap,
  BarChart,
  ScrollText,
  Shield,
  Globe,
  Settings,
  ChevronDown,
  Plus,
  Pencil,
  Code2,
  HelpCircle,
  ChevronsUpDown,
  Asterisk,
  Bell,
} from "lucide-react";

const NAV_TEXT: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "16px",
  letterSpacing: "-0.2px",
  color: "#57534E",
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: "15px",
  letterSpacing: "0px",
  color: "#78716c",
};

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  active?: boolean;
  collapsed?: boolean;
}

function NavItem({ href, icon: Icon, label, badge, active, collapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = active ?? pathname === href;
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center rounded-md transition-colors",
        collapsed ? "h-8 w-full justify-center" : "gap-2 px-2 h-8"
      )}
      style={{
        background: isActive ? "rgba(28,25,23,0.06)" : "transparent",
        color: isActive ? "#1c1917" : "#57534E",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, flexShrink: 0 }}>
        <Icon size={15} strokeWidth={1.75} style={{ opacity: 0.75 }} />
      </span>
      <span
        className="flex-1 truncate"
        style={{
          ...(isActive ? { ...NAV_TEXT, color: "#1c1917" } : NAV_TEXT),
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 200,
          overflow: "hidden",
          whiteSpace: "nowrap",
          transition: "opacity 120ms ease, max-width 220ms cubic-bezier(0.25, 1, 0.5, 1)",
          pointerEvents: collapsed ? "none" : undefined,
        }}
      >
        {label}
      </span>
      {badge && (
        <span
          className="text-xs font-semibold px-1 py-0.5"
          style={{
            fontSize: "12px",
            color: "#57534E",
            borderRadius: "6px",
            background: "rgba(28,25,23,0.06)",
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 60,
            overflow: "hidden",
            transition: "opacity 100ms ease, max-width 220ms cubic-bezier(0.25, 1, 0.5, 1)",
            pointerEvents: collapsed ? "none" : undefined,
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useDemoRole();
  const { collapsed, toggle } = useSidebar();
  const [bellOpen, setBellOpen] = useState(false);
  const [bellRect, setBellRect] = useState<DOMRect | undefined>();
  const bellRef = useRef<HTMLButtonElement>(null);
  const submittedRequests = useRequests();
  const isAdmin = role === "admin";
  const hasUnread = isAdmin
    ? submittedRequests.some(r => r.status === "pending-review" || r.status === "under-review")
    : submittedRequests.some(r => r.status === "approved" || r.status === "denied");

  return (
    <>
    <motion.aside
      className="h-screen fixed left-0 top-0 flex flex-col z-10 overflow-hidden"
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      style={{ background: "#fafaf9" }}
    >
      {/* Header: logo/toggle + bell */}
      <div className={cn("h-[52px] shrink-0 flex items-center", collapsed ? "justify-center px-0" : "px-4 justify-between")}>
        <button
          onClick={toggle}
          className="flex items-center"
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Asterisk className="h-5 w-5" style={{ color: "#A48977" }} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.05 }}
              >
                <Image src="/Logo_noEffect.svg" alt="Runlayer" width={108} height={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {!collapsed && (
          <button
            ref={bellRef}
            onClick={() => {
              setBellRect(bellRef.current?.getBoundingClientRect());
              setBellOpen(o => !o);
            }}
            className="flex items-center gap-1 px-1.5 h-7 rounded-md transition-colors"
            style={{ background: bellOpen ? "rgba(28,25,23,0.06)" : "transparent", border: "none", cursor: "pointer" }}
          >
            <Bell size={15} strokeWidth={1.75} style={{ color: "#57534e", opacity: 0.8 }} />
            {hasUnread && (
              <span className="w-2 h-2 rounded-full" style={{ background: "#f97316", flexShrink: 0 }} />
            )}
          </button>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-2 space-y-3", collapsed ? "px-0" : "px-3")}>
        {/* Build */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="flex items-center gap-0.5 px-2 h-8">
              <span style={SECTION_TITLE}>Build</span>
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" style={{ color: "#78716c" }} />
            </div>
          )}
          <NavItem href={isAdmin ? "/connectors/admin" : "/connectors"} icon={LayoutGrid} label="Connectors"
            active={pathname === "/connectors" || pathname.startsWith("/connectors/admin")}
            collapsed={collapsed} />
          <NavItem href="/skills" icon={Layers} label="Skills" badge="Beta" collapsed={collapsed} />
          <NavItem href="/plugins" icon={Package} label="Plugins" badge="Beta" collapsed={collapsed} />
          <NavItem href="/agents" icon={Bot} label="Agents" badge="Beta" collapsed={collapsed} />
          <NavItem href="/deployments" icon={Zap} label="Deployments" collapsed={collapsed} />
        </div>

        {/* Monitor */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="flex items-center gap-0.5 px-2 h-8">
              <span style={SECTION_TITLE}>Monitor</span>
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" style={{ color: "#78716c" }} />
            </div>
          )}
          <NavItem href="/analytics" icon={BarChart} label="Analytics" collapsed={collapsed} />
          <NavItem href="/audit-logs" icon={ScrollText} label="Audit Logs" collapsed={collapsed} />
          <NavItem href="/security" icon={Shield} label="Security" collapsed={collapsed} />
          <NavItem href="/sessions" icon={Globe} label="Sessions" collapsed={collapsed} />
          <NavItem href="/api-usage" icon={Code2} label="API usage" collapsed={collapsed} />
        </div>

        {/* Your teams */}
        <div className="space-y-0.5">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 h-8">
              <div className="flex items-center gap-0.5">
                <span style={SECTION_TITLE}>Your teams</span>
                <ChevronDown className="h-3.5 w-3.5 ml-0.5" style={{ color: "#78716c" }} />
              </div>
              <Plus className="h-4 w-4 opacity-60" style={{ color: "#78716c" }} />
            </div>
          )}
          <NavItem href="/teams/all" icon={LayoutGrid} label="All Runlayer" collapsed={collapsed} />
          <NavItem href="/teams/design" icon={Pencil} label="Design" collapsed={collapsed} />
          <NavItem href="/teams/product" icon={Package} label="Product" collapsed={collapsed} />
          <NavItem href="/teams/engineering" icon={Code2} label="Engineering" collapsed={collapsed} />
        </div>
      </nav>

      {/* Bottom */}
      <div className={cn("pb-3 space-y-0.5", collapsed ? "px-0" : "px-3")}>
        <NavItem href="/help" icon={HelpCircle} label="Help Center" collapsed={collapsed} />
        <NavItem href="/settings" icon={Settings} label="Settings" active={pathname.startsWith("/settings")} collapsed={collapsed} />
        {!collapsed && (
          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 h-8 rounded-md"
            style={{ color: "#57534E" }}
          >
            {isAdmin ? (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(211deg, #fef3c7 54%, #fbbf24 95%)" }}
              >
                <span style={{ color: "#92400e", fontSize: "9px", fontWeight: 700 }}>AD</span>
              </div>
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(211deg, #f5f3ff 54%, #a78bfa 95%)" }}
              >
                <span style={{ color: "#7c3aed", fontSize: "9px", fontWeight: 700 }}>JC</span>
              </div>
            )}
            <span className="flex-1" style={NAV_TEXT}>{isAdmin ? "Admin" : "Jane Cooper"}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-full flex items-center justify-center">
            {isAdmin ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(211deg, #fef3c7 54%, #fbbf24 95%)" }}
              >
                <span style={{ color: "#92400e", fontSize: "9px", fontWeight: 700 }}>AD</span>
              </div>
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(211deg, #f5f3ff 54%, #a78bfa 95%)" }}
              >
                <span style={{ color: "#7c3aed", fontSize: "9px", fontWeight: 700 }}>JC</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>

    <AnimatePresence>
      {bellOpen && (
        isAdmin ? (
          <NotificationPopover
            anchorRef={bellRef}
            anchorRect={bellRect}
            onClose={() => setBellOpen(false)}
            onViewRequest={(id) => {
              setBellOpen(false);
              window.dispatchEvent(new CustomEvent("open-review-request", { detail: { id } }));
            }}
            onViewAllRequests={() => {
              setBellOpen(false);
              router.push("/settings/requests/admin");
            }}
          />
        ) : (
          <UserNotificationPopover
            onClose={() => setBellOpen(false)}
            anchorRect={bellRect}
          />
        )
      )}
    </AnimatePresence>
    </>
  );
}
