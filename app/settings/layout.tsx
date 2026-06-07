"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { PageTransition } from "@/components/page-transition";
import { useSidebar } from "@/lib/sidebar-context";
import { motion } from "motion/react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <motion.div
        className="flex-1 pt-2 pb-2 pr-2 overflow-hidden"
        animate={{ marginLeft: collapsed ? 56 : 240 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      >
        <div
          className="flex h-full rounded-xl overflow-hidden"
          style={{
            background: "#fdfdfd",
            border: "1px solid rgba(28,25,23,0.09)",
          }}
        >
          <div
            className="w-60 shrink-0 overflow-y-auto overflow-x-hidden px-3 py-4"
            style={{ borderRight: "1px solid rgba(28,25,23,0.09)" }}
          >
            <SettingsSidebar />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-16">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
