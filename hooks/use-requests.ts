"use client";

import { useEffect, useState } from "react";
import { getRequests, REQUESTS_EVENT, type SubmittedRequest } from "@/lib/requests-store";

export function useRequests(): SubmittedRequest[] {
  // Lazy init from localStorage so there's no flash of empty on first render
  const [requests, setRequests] = useState<SubmittedRequest[]>(() => getRequests());

  useEffect(() => {
    setRequests(getRequests());
    const sync = () => setRequests(getRequests());
    window.addEventListener(REQUESTS_EVENT, sync);
    window.addEventListener("storage", sync); // cross-tab
    return () => {
      window.removeEventListener(REQUESTS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return requests;
}
