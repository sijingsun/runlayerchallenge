"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { seedDemoRequests, updateRequestStatus, getRequests } from "@/lib/requests-store";

export default function DonePage() {
  const router = useRouter();

  useEffect(() => {
    // Ensure demo data exists, then mark Linear as approved
    seedDemoRequests();

    const requests = getRequests();
    const linear = requests.find(r => r.id === "demo-1");
    if (linear && linear.status !== "approved") {
      updateRequestStatus("demo-1", "approved");
    }

    // Switch to Jane's view
    router.replace("/connectors");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: "#fafaf9" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-600 animate-spin" />
        <p style={{ fontSize: "13px", color: "#78716c" }}>Switching to user view…</p>
      </div>
    </div>
  );
}
