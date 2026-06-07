"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { useSidebar } from "@/lib/sidebar-context";
import { motion } from "motion/react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <motion.main
        className="flex-1 overflow-y-auto"
        animate={{ marginLeft: collapsed ? 56 : 240 }}
        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
        style={{ background: "#fafaf9" }}
      >
        {children}
      </motion.main>
    </div>
  );
}
