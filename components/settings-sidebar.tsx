"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  UserCircle,
  SlidersHorizontal,
  Bell,
  Link2,
  Key,
  Settings,
  AlertTriangle,
  LayoutGrid,
  User,
  Users,
  Lock,
  KeyRound,
  ShieldOff,
  Wrench,
} from "lucide-react";
import { useRequests } from "@/hooks/use-requests";
import { useDemoRole } from "@/hooks/use-demo-role";

interface SettingsNavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  active?: boolean;
}

function SettingsNavItem({ href, icon: Icon, label, badge, active }: SettingsNavItemProps) {
  const pathname = usePathname();
  const isActive = active ?? pathname === href;
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 h-8 rounded-md transition-colors"
      style={{
        background: isActive ? "rgba(28,25,23,0.06)" : "transparent",
        color: isActive ? "#1c1917" : "#57534E",
      }}
    >
      <span className="shrink-0" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 16, height: 16 }}>
        <Icon size={15} strokeWidth={1.75} style={{ opacity: 0.7 }} />
      </span>
      <span
        className="flex-1"
        style={{ fontSize: "14px", fontWeight: 600, lineHeight: "16px", letterSpacing: "-0.2px", color: isActive ? "#1c1917" : "#57534E" }}
      >
        {label}
      </span>
      {badge !== undefined && badge !== 0 && (
        <span className="text-xs font-medium text-orange-500 leading-none">
          {badge}
        </span>
      )}
    </Link>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0, transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] } },
};

export function SettingsSidebar() {
  const requests = useRequests();
  const role = useDemoRole();
  const isAdmin = role === "admin";
  const requestsHref = isAdmin ? "/settings/requests/admin" : "/settings/requests";
  const requestCount = requests.length || undefined;

  return (
    <div className="w-60 shrink-0 py-1">
      <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
        {/* Personal */}
        <div>
          <motion.p variants={item} className="px-2 mb-1" style={{ fontSize: "14px", fontWeight: 500, lineHeight: "15px", color: "#78716c", letterSpacing: "0px" }}>
            Personal
          </motion.p>
          <div className="space-y-0.5">
            {[
              { href: "/settings/profile", icon: UserCircle, label: "Profile" },
              { href: "/settings/preferences", icon: SlidersHorizontal, label: "Preferences" },
              { href: "/settings/notifications", icon: Bell, label: "Notifications" },
              { href: "/settings/connections", icon: Link2, label: "Connections" },
              { href: "/settings/api-keys", icon: Key, label: "Personal API keys" },
            ].map((navItem) => (
              <motion.div key={navItem.href} variants={item}>
                <SettingsNavItem {...navItem} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div>
          <motion.p variants={item} className="px-2 mb-1" style={{ fontSize: "14px", fontWeight: 500, lineHeight: "15px", color: "#78716c", letterSpacing: "0px" }}>
            Workspace
          </motion.p>
          <div className="space-y-0.5">
            {[
              { href: "/settings", icon: Settings, label: "General" },
              { href: "/settings/notifications-workspace", icon: Bell, label: "Notification preferences" },
              { href: requestsHref, icon: AlertTriangle, label: "Requests", badge: requestCount },
              { href: "/settings/security-scanners", icon: ShieldOff, label: "Security scanners" },
              { href: "/settings/integrations", icon: LayoutGrid, label: "Integrations" },
              { href: "/settings/users", icon: User, label: "Users" },
              { href: "/settings/groups", icon: Users, label: "Groups" },
              { href: "/settings/policies", icon: Lock, label: "Policies" },
              { href: "/settings/org-api-keys", icon: KeyRound, label: "Org API keys" },
              { href: "/settings/shadow-mcps", icon: ShieldOff, label: "Shadow MCPs" },
              { href: "/settings/npm-configuration", icon: Wrench, label: "NPM configuration" },
            ].map((navItem) => (
              <motion.div key={navItem.href} variants={item}>
                <SettingsNavItem {...navItem} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
