"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type DemoRole = "admin" | "user";

const ROLE_KEY = "demo_role";

export function useDemoRole(): DemoRole {
  const pathname = usePathname();
  const [role, setRole] = useState<DemoRole>("user");

  useEffect(() => {
    const isAdminPath =
      pathname.startsWith("/connectors/admin") ||
      pathname.startsWith("/settings/requests/admin");

    const isUserPath =
      pathname === "/connectors" ||
      pathname === "/done";

    if (isAdminPath) {
      localStorage.setItem(ROLE_KEY, "admin");
      setRole("admin");
    } else if (isUserPath) {
      localStorage.setItem(ROLE_KEY, "user");
      setRole("user");
    } else {
      // Neutral path (settings, etc.) — preserve last known role
      const stored = (localStorage.getItem(ROLE_KEY) as DemoRole) ?? "user";
      setRole(stored);
    }
  }, [pathname]);

  return role;
}
