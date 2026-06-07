"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";
import Image from "@/components/img";
import { addRequest } from "@/lib/requests-store";

const AI_CLIENTS = ["ChatGPT", "Cursor", "Claude Code", "GitHub Copilot", "Windsurf", "Gemini", "Cline", "+ Other"];

interface RequestAccessModalProps {
  connectorName: string;
  connectorIcon: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RequestAccessModal({ connectorName, connectorIcon, onClose, onSubmitted }: RequestAccessModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [highPriority, setHighPriority] = useState(false);

  function toggleClient(client: string) {
    setSelectedClients(prev =>
      prev.includes(client) ? prev.filter(c => c !== client) : [...prev, client]
    );
  }

  function handleSubmit() {
    addRequest({
      connectorName,
      connectorIcon,
      clients: selectedClients,
      reason,
      highPriority,
      requesterName: "Jane Cooper",
      requesterInitials: "JC",
    });
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0"
        style={{ background: "rgba(28,25,23,0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!submitted ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 flex flex-col rounded-xl overflow-hidden"
        style={{
          width: 480,
          background: "#ffffff",
          boxShadow: "0 20px 60px rgba(28,25,23,0.18), 0 4px 16px rgba(28,25,23,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* Form state */}
          {!submitted && (
            <motion.div
              key="form"
              className="flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #e7e5e4" }}>
                <div className="flex items-start gap-3 pr-4">
                  <Image src={connectorIcon} alt={connectorName} width={32} height={32} className="shrink-0 mt-0.5" />
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#1c1917", lineHeight: "20px" }}>
                      Request access to {connectorName}
                    </p>
                    <p style={{ fontSize: "13px", color: "#78716c", marginTop: 2 }}>
                      Your admin will review this request.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#78716c" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">

                {/* AI client chips */}
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", marginBottom: 10 }}>
                    Which AI clients do you need this for?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AI_CLIENTS.map(client => {
                      const selected = selectedClients.includes(client);
                      return (
                        <button
                          key={client}
                          onClick={() => toggleClient(client)}
                          className="px-3 py-1.5 rounded-md text-sm transition-colors"
                          style={{
                            border: selected ? "1px solid #1c1917" : "1px solid rgba(28,25,23,0.15)",
                            background: selected ? "rgba(28,25,23,0.06)" : "#ffffff",
                            color: selected ? "#1c1917" : "#57534e",
                            fontWeight: selected ? 600 : 400,
                            cursor: "pointer",
                          }}
                        >
                          {client}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1c1917", marginBottom: 8 }}>
                    Why do you need access?
                  </p>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    placeholder="Describe your use case — e.g., I need to create and update issues for my sprint work."
                    className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none"
                    style={{
                      border: "1px solid rgba(28,25,23,0.15)",
                      color: "#1c1917",
                      background: "#fafaf9",
                      lineHeight: "20px",
                    }}
                  />
                </div>

                {/* Priority checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={highPriority}
                      onChange={e => setHighPriority(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                      style={{
                        border: highPriority ? "none" : "1.5px solid rgba(28,25,23,0.25)",
                        background: highPriority ? "#1c1917" : "#ffffff",
                      }}
                      onClick={() => setHighPriority(p => !p)}
                    >
                      {highPriority && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", color: "#44403c", lineHeight: "18px" }}>
                    Mark as high priority — this is blocking my work
                  </span>
                </label>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid #e7e5e4" }}>
                <button
                  onClick={onClose}
                  className="px-4 h-8 rounded-lg text-sm font-medium"
                  style={{ background: "none", color: "#57534e", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 h-8 rounded-lg text-sm font-semibold"
                  style={{ background: "#1c1917", color: "#fafaf9", border: "none", cursor: "pointer" }}
                >
                  Submit request
                </button>
              </div>
            </motion.div>
          )}

          {/* Confirmation state — J1-C */}
          {submitted && (
            <motion.div
              key="confirmation"
              className="flex flex-col items-center text-center px-8 py-10"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              {/* Checkmark */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: "#16a34a" }} />
              </div>

              <p style={{ fontSize: "15px", fontWeight: 600, color: "#1c1917", marginBottom: 6 }}>
                Request submitted
              </p>
              <p style={{ fontSize: "13px", color: "#78716c", lineHeight: "20px", marginBottom: 16 }}>
                You'll be notified when your admin reviews it.
              </p>
              <button
                onClick={onSubmitted}
                style={{ fontSize: "13px", fontWeight: 600, color: "#57534e", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                View my pending requests →
              </button>

              {/* Footer */}
              <div className="w-full pt-6 mt-4 flex justify-center" style={{ borderTop: "1px solid #e7e5e4" }}>
                <button
                  onClick={onClose}
                  className="px-4 h-8 rounded-lg text-sm font-medium"
                  style={{ background: "none", color: "#57534e", border: "1px solid rgba(28,25,23,0.15)", cursor: "pointer" }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
