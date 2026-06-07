# Process & Assumptions
## Runlayer Design Challenge

---

## How We Worked

1. **Research & problem framing** — Reviewed the brief and Figma starter file. Mapped Runlayer's product architecture (connector catalog, permission versioning, the proxy model), identified the three stakeholder layers, and wrote up JTBDs for both admin and end-user roles.

2. **Friction mapping** — Went through every Figma flow screen-by-screen and catalogued friction points: flat approval queue with no urgency signals, requester status blindness, email-only operational alerts, misleading button labels, risk info buried in tabs, AI client scope buried in free text, meaningless connector version names.

3. **Notification framework design** — Brainstormed ambient vs. interruptive tier model, mapped each event type to a tier and a recipient role, and aligned on the bell popover pattern (red dot ambient, top-right toast interruptive, popover with All / Requests / Alerts tabs on click).

4. **Design spec** — Wrote all decisions into a proposed design doc as screen-by-screen conceptual frames, ready for implementation.

5. **Implementation** — Built design system reference matching Figma tokens, then implemented Flow 1 end-to-end in Claude Code, adding the new connector modal as the closing screen for Flow 2.

---

## Assumptions

**1. Admin and end user share the same nav shell.**
The Figma shows both roles using a near-identical navigation. I kept this assumption rather than designing separate nav structures, but this warrants a stakeholder conversation — the mental models are different enough that role-specific nav may be the right long-term direction.

**2. Both roles navigate to Settings to see their full request history.**
Admins see all incoming requests under Settings → Requests. End users see their submitted requests under Settings → My requests (or My connectors → Pending). The bell popover is the ambient entry point; Settings is the full-history fallback for both.

**3. Priority is self-reported by the requester, not system-inferred.**
The "mark as high priority" flag on the request form is a checkbox the user sets themselves. Requesters know their own urgency better than any algorithm. This keeps the system simple but means urgency signals are only as reliable as the requester's judgment.

**4. Risk level is binary: High or Low.**
Derived from a two-factor composite (connector has destructive/external tools AND no org precedent = High; established connector with low-risk tools = Low). A more granular taxonomy might be more accurate but adds cognitive overhead for admins at review time.

**5. Grouped notifications assume same connector = same request.**
When multiple people request the same connector version, they collapse into one notification item. Edge cases (different AI clients, different reasons) are not handled in this model.

**6. The org's approved AI clients are a known, finite list.**
The AI client selector on the request form shows a fixed set of chips (ChatGPT, Cursor, Claude Code, GitHub Copilot). This assumes Runlayer knows which AI clients are active in the org — which aligns with the proxy model but may need admin configuration.

**7. Descriptive connector naming is opt-in, not enforced.**
We added a naming nudge at connector setup but didn't make it a required field. Whether to enforce naming is a product decision.

**8. No delegation or multi-admin assignment.**
A single admin reviews and approves. Assigning requests to another admin is a known gap that would matter at larger org sizes.

**9. Denial flow and expiration handling are out of scope.**
The brief mentions denials and expirations. We designed the approval path fully but did not design denial (with reason) or expired request states. These follow the same notification and modal patterns and can be added without structural changes.
