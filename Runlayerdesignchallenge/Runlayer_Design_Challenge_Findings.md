# Runlayer Design Challenge: Research & Findings Summary

**Challenge:** Rethinking Approvals & Admin Visibility  
**Date:** June 2026  
**Last updated:** After extended product analysis session  

---

## 1. Company & Product Overview

Runlayer is an **enterprise MCP (Model Context Protocol) control plane** — a security and governance layer that sits between AI clients (Cursor, Claude Code, ChatGPT, GitHub Copilot, etc.) and the external tools those clients connect to.

Its core value proposition: *"AI enablement and control in one platform."* Runlayer lets organizations say yes to AI adoption without losing visibility or security posture.

**The problem Runlayer solves:** When developers and employees use AI coding or productivity tools, those tools increasingly connect to real systems — databases, GitHub, Slack, Linear, AWS. Without a control plane, organizations face:
- Long-lived API keys and OAuth tokens sitting on individual laptops
- Hundreds of unsanctioned, unreviewed tool connections
- Zero audit trail of what AI agents are actually doing
- No mechanism to disable a dangerous tool before it acts

**Market recognition:** SOC 2 Type II certified, HIPAA and GDPR certified, named to Morgan Stanley's *Rising in Cyber 2026* list. Customers include Gusto, OpenDoor, AngelList, Lemonade, Xcel Energy, and Decagon.

---

## 2. What Are Connectors — And Why They Matter

Connectors are **managed MCP servers** that allow users and AI agents to securely interact with external tools. Think of them as the approved, governed pathways from an AI client to a real system.

Examples of connectors: Slack, GitHub, Linear, PostgreSQL, AWS, Figma, Notion, Asana, Sentry, Okta, dbt.

**Why connectors are the core of the product:**
- Every interaction an AI agent has with a real tool goes through a connector
- Connectors are the unit of governance — permissions, audit logs, and policies are attached at the connector level
- Without connector management, AI tool adoption creates security blind spots
- With connector management, IT and security teams get the "golden path" — full visibility with low friction for employees

**Why access is permissioned:** Connectors can expose destructive operations (deleting records, pushing code, sending messages on behalf of users) and access to sensitive data (customer PII, financial data, internal docs). An ungoverned connector is a direct data loss vector.

---

## 3. The Stakeholder Landscape: Who Uses Runlayer and Why

Understanding who Runlayer's users are requires mapping three distinct layers:

**Layer 1 — The AI Client** (Copilot, Cursor, Claude Code, ChatGPT)
The tool developers actually open and use. Each client is an island — it can only govern connections within itself.

**Layer 2 — The Enterprise Company** (Gusto, OpenDoor, Acme Corp)
The company that deploys AI clients for its employees. Has its own IT team, security team, and platform engineers — entirely separate from the AI client vendor.

**Layer 3 — The MCP Servers / Tools** (Linear, Slack, GitHub, AWS, PostgreSQL)
External systems that AI clients connect to via the MCP protocol.

**Runlayer lives at Layer 2, inside the enterprise.** Its users are the enterprise IT/security/platform team — not the AI client vendor, and not the end-user developer in their day-to-day work.

### Why Jane (a Gusto developer) Comes to Runlayer Instead of Her AI Client

The intuitive assumption is that Jane would request connector access inside ChatGPT or Cursor — wherever she's already working. But this breaks down for two reasons:

**Reason 1 — The many-to-many problem.** Jane's real need isn't "Linear in ChatGPT." It's Linear, Notion, and GitHub across ChatGPT, Cursor, and Claude Code simultaneously. No individual AI client can solve this — each client is scoped to itself. Going client-by-client means submitting the same requests in 3–4 different tools, tracking approvals in 3–4 different places, and repeating the process every time a new AI client appears. Runlayer is the one place Jane can manage all of it at once.

**Reason 2 — Not every AI client has a governance flow.** Some AI clients are permissive — they let users self-connect to MCP servers without any organizational oversight. This isn't a gap Runlayer fills by adding a request UI inside those clients. It's a gap Runlayer fills at the **infrastructure level**.

### Runlayer as a Network-Level Gateway

This is the most important architectural insight: Runlayer is not a feature inside AI clients. It is a **proxy layer that sits between every AI client and every MCP server.** When Jane's ChatGPT tries to connect to Linear, it isn't connecting directly to Linear's MCP server — it's connecting to Runlayer's managed endpoint, which applies Gusto's policies and then proxies the call through.

This means even a permissive AI client like "HBT" that says "connect to anything you want" is still governed by Runlayer, because the connection goes through Runlayer regardless. Gusto configures their policies once in Runlayer's admin console, and those policies are enforced across every AI client — with or without the client's participation.

Jane's journey with Runlayer is brief and specific: she **requests** access through Runlayer, and she's **notified** of the outcome. At usage time, Runlayer is entirely invisible — she just sees that Linear works in ChatGPT now.

---

## 4. Jobs to Be Done (JTBD)

### Non-Admin Users (Developers, Employees)
- "When I want to connect my AI tool to [service], I want to quickly request access and understand how long it will take, so I can plan my work without being blocked."
- "When my request is approved or denied, I want to know immediately and understand why, so I can either get to work or adjust my approach."
- "When I need a tool that isn't in the catalog, I want a way to surface that need, so the organization's AI toolkit can grow with actual demand."

### Admin Users (IT, Platform, DevOps Leads)
- "When a connector request comes in, I want to know about it right away — even when I'm deep in another task — so I can keep my team unblocked."
- "When I have a queue of pending requests, I want to triage by urgency and risk, so I focus my attention where it matters most."
- "When I approve a connector, I want to configure access level at the same time, so I don't need a separate follow-up workflow."
- "When the navigation changes and 'Requests' disappears from my main nav, I don't want to lose operational awareness."

---

## 5. The Core User Flow: Connector Request & Approval

### Flow 1: Jane Requests Access to an Existing Connector

Using Jane Cooper (Gusto developer) and the Gusto admin as our working example:

**Step 1 — Jane identifies what she needs.** She wants to use Linear in ChatGPT. She comes to Runlayer's connector catalog — not ChatGPT — and finds Linear. She may also want Notion in ChatGPT and Linear in Cursor. She submits all of these from one place.

**Step 2 — Request enters the admin queue.** Gusto's admin sees Jane's requests in Runlayer's approval surface. The request includes: which connector, which AI client, Jane's stated reason.

**Step 3 — Admin approves with a permission profile.** When approving, the admin assigns Jane to a pre-configured connector version (e.g., "Linear #2"). Each connector version is essentially an IAM-style role — a ceiling of allowed tools (e.g., 36 tool capabilities enabled). This is not configured per-user; it is configured once per connector version and applies to everyone assigned to it.

**Step 4 — Optional per-user refinement.** The admin can, at approval time, grant Jane a subset of what the connector version allows — say, 30 of 36 tools — if her use case warrants tighter scope. The connector version is the ceiling; the user assignment can be equal to or less than that ceiling. This is a power feature, not the default path.

**Step 5 — Runlayer provisions the connection silently.** After approval, Jane returns to ChatGPT. Linear is now available. She never interacts with Runlayer again until she needs something new.

---

### Flow 2: Jane Requests a Custom Connector (Not in Catalog)

When Jane needs a tool that doesn't exist in Runlayer's catalog, she doesn't browse — she initiates a custom connector request directly.

**Jane's side:**

1. Jane clicks "Request Connector" (distinct from browsing the catalog)
2. She fills out a form specifying what the connector is: name, description, transport type, and registration details
3. Transport type and registration are technical fields that define how the connector communicates — this is more involved than a standard access request, as Jane (or her team) is proposing something new to the org's approved toolkit
4. She submits the request

**Admin's side:**

The admin receives this request in the same approval surface as standard connector requests, but the detail view looks different. Instead of showing a known connector's capability list, it surfaces: what this connector is, what Jane has described it as, and a security summary — since the admin is evaluating an unknown tool rather than confirming access to an already-vetted one.

**Key difference from Flow 1:** In Flow 1, the connector is known and pre-vetted by Runlayer. The admin's decision is about *who* gets access. In Flow 2, the connector itself is unvetted. The admin's decision is about *whether this tool should exist in the org's catalog at all* — a meaningfully higher-stakes call that involves evaluating the connector's legitimacy, not just the requester's need.

---

### Why Multiple Versions of the Same Connector Exist

The catalog may show "Linear," "Linear #2," and "Linear #3." These are not duplicates — they are differently configured permission profiles for different teams or use cases:

- **Linear** — read-only, for designers and PMs
- **Linear #2** — read and write, for engineers
- **Linear #3** — full admin, for team leads

This mirrors how IAM roles work: you don't hand-craft permissions per employee, you define roles and assign employees to roles. The connector version is Runlayer's equivalent of the role.

---

## 7. Design Challenge Brief — Key Takeaways

**Core trigger:** A navigation redesign is moving all admin functionality behind a bottom-left "Settings" entry point. The top-level "Requests" nav item — currently the primary surface for connector access management — is being removed.

**The opportunity this creates:** Rather than just relocating the Requests view into Settings, Runlayer wants to rethink how operational events (approvals, violations, failures) surface *throughout* the product more broadly. This is a systems design challenge, not just a UI relocation.

**Two-part challenge:**

**Part 1 — Connector Request Experience:** Improve the existing request and approval flow for admins and non-admin users. Key questions: How do admins discover requests? How do urgent requests surface? How do requesters track status? How does the experience scale?

**Part 2 — Notifications & Operational Awareness:** Design a scalable foundation for how important operational workflows surface in the product going forward — not just connector requests, but security violations, policy violations, connector failures, expiring credentials, audit issues, and deployment warnings.

**What Runlayer cares about most in this exercise:** Product thinking, systems thinking, information architecture, interaction design, and clarity of tradeoffs. Not pixel-perfect polish.

**Time constraint:** 4 hours total (compensated at $150/hr).

---

## 8. Existing Figma Screens — Flow Analysis

The Figma starter file contains 6 clearly labeled flow sections:

### 5.1 Connectors Catalog (Non-Admin View)
**Two screens:** The connector marketplace grid ("My connectors") and a connector detail view ("Connector details / Tools").

- The catalog shows connectors as cards — name, description, category, install status
- The detail view shows the individual tools/capabilities within a connector (e.g., a "Linear" connector might expose tools like `create_issue`, `list_projects`, `close_issue`)
- Each tool shows a permission status (enabled, disabled, restricted)
- A "Request access" CTA is prominent for connectors the user doesn't yet have

**Friction observed:** The catalog view doesn't visibly distinguish between "I have access," "I've requested access (pending)," and "I haven't requested yet" — three states with very different implications for the user's mental model.

### 5.2 Non-Admin: Request Flow from Catalog (7 screens)
The primary flow for a non-admin user requesting access to a connector from the catalog.

**Flow:**
1. Browse catalog → find connector → click "Request access"
2. Modal appears: "Request access to [Connector]" — form asks for reason/use case
3. Submission confirmation
4. Pending state reflected in "My connectors"
5. (After approval) Connector shows as active/installed

**Friction observed:**
- The request modal is minimal — no preview of what tools/capabilities they're requesting or what access level they need
- After submission, there's no clear indication of when to expect a response or who will review it
- The requester has no in-product mechanism to follow up or check status without navigating back to the catalog

### 5.3 Non-Admin: Requesting Custom / Suggest a Connector (5-6 screens)
For users who want a connector not yet in the catalog.

**Flow:**
1. User can't find what they need in catalog → triggers "Suggest a connector" or "Add new" path
2. Form: connector name, description, use case, reason
3. Confirmation: "Suggestion submitted"
4. User sees pending status

**Friction observed:** This path is less visible than the catalog request — users need to know it exists. There's also no feedback loop for whether their suggestion is actively being reviewed vs. sitting in a backlog.

### 5.4 Admin: Review New Connector Request (5 screens)
The current admin-facing flow for reviewing requests — this lives in the dedicated "Requests" nav section that is being removed.

**Current state:**
- Admin sees a list of connector requests: connector name, requester, date requested, status
- Filter tabs: Pending, Approved, Denied, All
- Detail panel shows: full request context, requester identity, stated reason, requested connector info
- Actions: Approve or Deny, with options to configure access level on approval
- Post-action: connector reflects new status in catalog

**Friction observed:**
- The list is flat — no urgency signaling, no risk level, no context about how long someone has been waiting
- Approval and permission configuration are somewhat separate steps
- No way for the admin to communicate reasoning back to the requester in-product (presumably only via email or Slack externally)

### 5.5 Navigation Update (5 screens)
This section shows the **current navigation state** and the context of what's changing.

**What's shown:**
- Screen 1: Current nav with "Requests" tab prominently at the top level — the entry point that's going away
- Screens 2-3: Connector request detail modals — one showing a "Linear" request with contextual info, another showing a "Linear #2" request with flagged (red-highlighted) tool capabilities indicating potential risk
- Screen 4: Permission configuration panel — "Request access to Linear #2" with tabs for Connectors, Config, Limit
- Screen 5: Detailed "Add permissions to Linear #2" panel showing individual tool capabilities with Enable/Disable toggles

**Key insight from this section:** The current system already has some sophistication (risk flagging on tools, granular permission configuration), but it's all buried behind a navigation entry point that's being removed. The challenge is surfacing this appropriately in a nav-less world.

### 5.6 Other Alert Types: Only via Email Today (2 screens)
This section documents the **current gap** in notification channels.

**What's shown:**
- A settings panel showing notification preferences across multiple categories
- Categories visible: Connector information, Notification status, Employment Status, MFA settings, and others
- Current state: most operational event types (credential expiry, security violations, policy violations, connector failures) only surface via **email** — there is no in-product notification channel today

**Why this matters for the challenge:** The design needs to go beyond just relocating the Requests list. It needs to establish a new **in-product notification layer** that can handle both connector approvals (workflow-driven, human action required) and operational events (alert-driven, may require immediate response). These are fundamentally different interaction patterns.

---

## 9. Key Friction Points & Design Opportunities

### Friction 1: Admin Awareness Gap
With "Requests" removed from primary nav, there's no persistent signal that something needs attention. Admins will miss requests — and the time-to-approval will increase.

**Opportunity:** A persistent, lightweight ambient indicator (badge, bell, inbox count) that appears regardless of where the admin is in the product. This needs to feel native to the product's existing nav patterns, not bolted-on.

### Friction 2: No Urgency Differentiation
The current approval queue is a flat list. Every request looks identical regardless of how long it has been waiting, how urgent the requester says it is, or how risky the connector is. Admins have no basis for triage.

**Opportunity:** Three focused signals on each queue card — no more, no less:

**Signal 1 — Priority flag (user-set).** Jane marks "High priority" at request submission, similar to flagging an email urgent. This appears as an exclamation mark badge on the top-right of the admin's queue card. No system inference needed — the requester knows their own urgency better than any algorithm. If it can wait, it's normal; if it's blocking work, Jane says so.

**Signal 2 — Wait time (system-calculated).** Elapsed time since submission displayed on every card: "2h", "3 days". Passive and always visible. Creates natural compounding pressure without any admin configuration — the longer it sits, the more obvious the backlog becomes.

**Signal 3 — Risk level (system-calculated composite).** A single High / Low label derived from two factors combined:
- **High risk** = the connector has a significant number of destructive or external tools *and* no one at the org has been approved for it before. Both conditions together mean uncharted territory — the admin is making a decision without precedent and with real blast radius.
- **Low risk** = it's an existing connector already approved for others in the org *and* the connector has few or no high-risk tools. Precedent is established, the risk profile is known, and the admin can confidently fast-track.

The composite logic matters: tool risk alone is not the full picture. A connector with destructive tools that has been approved ten times is a very different decision from the same connector being requested for the first time. The combination of tool risk + org precedent is what determines actual review burden.

### Friction 3: Requester Status Blindness
After submitting a request, non-admin users have no in-product way to see where they stand or prompt a response.

**Opportunity:** A lightweight "My requests" view (could be a sub-section of "My connectors") that shows active request states — submitted, under review, approved, denied — with timestamps and any admin communication.

### Friction 4: Email-Only Operational Events
Security violations, expiring credentials, connector failures — all currently email-only. Email is a lossy channel for time-sensitive operational events.

**Opportunity:** A unified in-product inbox/notification center that can handle both workflow events (approve this request) and alert events (credential expiring in 3 days). These have different interaction patterns: workflow events need action UI embedded, alert events need status and context.

### Friction 5: "Grant Access" Implies Finality When a Configuration Step Follows

**Friction observed:** The two-step flow — review request, then configure the grant — is actually well-reasoned and should stay. Step 1 (review context, evaluate risk, make the approval decision) and Step 2 (configure scope, set permissions, potentially add other users) are genuinely distinct cognitive acts. The problem is not the two steps. It's the button label. "Grant access" reads as a terminal action — the admin clicks it expecting to be done. A second modal then appears for configuration, and that moment of surprise is the friction. The label implies completion when it's actually a gateway.

The same issue appears in Flow 2 on the "Grant access to existing" button, which sounds even more final — "existing" implies the connector is already set up, so why would there be more to configure?

**Potential idea — wording:**
Two directions for the button label, both of which communicate that more is coming:
- **"Approve & configure →"** — names both the decision (approve) and what comes next (configure). The arrow signals continuation. Direct and accurate for admins who have already decided yes.
- **"Continue to access setup →"** — softer framing that emphasizes the journey. "Setup" signals there is work ahead without implying the approval itself is deferred.

The second modal (Step 2) should also open with a clear orientation header — something like "Configure access for Jane Cooper" with a light step indicator — so the admin is oriented rather than disoriented.

**Potential idea — suggested users in Step 2:**
The configuration modal is a natural place to surface a suggestion from the system: *"Priya Patel and Marcus Chen are also waiting for Linear #2. Add them to this grant?"* The admin is already in grant mode, the decision is made, and adding more recipients costs one checkbox each. This dissolves F6 (approval fatigue) organically — no separate group policy flow required, just a nudge at the right moment.

### Friction 6: Scale & Volume / Approval Fatigue from a Pull-Only Model
The current model is entirely demand-driven — Jane has to know she wants something and ask for it. This is conservative by design, which is appropriate for a security product. But as AI tool adoption grows across the org, the admin approval queue becomes a bottleneck. One slow admin can block an entire team.

At steady scale, the same connector (e.g., Linear) will be requested repeatedly by different people. The admin ends up reviewing the same decision over and over rather than making a policy once.

**Opportunity: Pattern-triggered group provisioning.** Rather than forcing the admin to manually recognize that 8 engineers requested Linear #2 this month, the product should surface this signal proactively — "8 people have requested this connector in the last 30 days. Would you like to grant it to the Engineering group by default?" This lets the model graduate from per-user reactive approvals to group-level proactive policies, without abandoning the security-first posture. The admin still makes the decision; the product just helps them make it at the right level of abstraction.

### Friction 7: Default vs. Power Path Collapsed in the Approval Dialog
When an admin approves a request, the current design immediately presents the full tool-selection checklist (all 36 capabilities). This conflates two very different admin intents: "I want to approve this quickly with the standard profile" and "I want to customize Jane's access specifically."

Most approvals are fast-path decisions. Forcing every admin to face a 36-tool checklist creates unnecessary cognitive overhead and slows down what should be a one-click action.

**Opportunity:** Make the fast path the default — approve with the connector version's full toolset in one click — with "Customize access" as a clearly secondary expansion for cases that warrant it. Don't make every approval feel like a complex permission configuration decision.

### Friction 9: Security Risk Information Is Inconsistent, Redundant, and Buried

Observed across the two admin approval modals in the Figma.

**Inconsistency between flows.** The new connector request (Flow 2) surfaces a "Security summary: 3 high risk tools" inline in the Overview tab. The existing connector access request (Flow 1) does not — the Overview shows only requester, auth method, and reason. The only signal of risk in Flow 1 is a "3" badge on the Security risks tab, which is easy to miss entirely. This is arguably backwards: both decisions carry real consequences, and the admin should get equivalent safety context in both cases.

**Two labels for one concept.** "Security risks 3" (tab label), "3 high risk tools" (Overview summary), and "This connector has 3 high risk tools" (Tools tab banner) all refer to the same thing — tools within this connector that carry elevated risk. Using two different terms across the same modal makes the admin unsure whether these are distinct categories or the same information repeated.

**Nested redundancy with no payoff.** The admin's path to actually understanding what the risks are:
1. See "Security risks 3" badge on the tab — signal registered, but no context
2. In Overview: "Security summary: 3 high risk tools" → click "View tools" → lands on Tools tab
3. In Tools tab: red banner "This connector has 3 high risk tools" → click "View risks" CTA → navigates to Security risks tab
4. Finally see the actual risk details

The admin encounters the number 3 three times before seeing what it means. The "View risks" CTA inside the Tools tab is also cross-tab navigation — clicking something within one tab silently switches you to another, which is a disorienting pattern.

**Unexplained risk labels.** Individual tools in the Tools tab are labeled Read only, External, and Destructive. "Destructive" is self-explanatory. "External" is not — it's unclear what makes a tool "External" or why that constitutes a risk without any inline explanation.

**Opportunity:** Elevate the security summary into the Overview for both flows equally. Collapse the redundant "you have 3 high risk tools" signals into one clear moment — ideally in the Overview — and link directly to the risk detail from there. Replace cross-tab navigation with an inline expandable or a direct anchor. Define risk labels (especially "External") with a tooltip or short description at point of use.

### Friction 11: AI Client Scope Is Buried in Free Text

**Friction observed:** When Jane requests a connector, the only structured fields are the connector version she selected and a free-text reason box. Which AI client(s) she's requesting for — ChatGPT, Cursor, Claude Code — ends up buried somewhere in her prose description, if she mentions it at all. The admin reviewing the request has to read and parse a paragraph to understand scope. "Approving Linear #2" means something very different depending on whether it's for one client or all of them — but that distinction is invisible in the current request modal.

Note: Jane does not need to select specific tools — the connector version (e.g., Linear #2) already comes with a pre-configured set of tools. That decision was made by the admin when setting up the version. Jane's job is only to say what she needs it for and where.

**Potential idea:** Add an explicit AI client selector to the request form — a simple multi-select of the AI clients Jane uses (ChatGPT, Cursor, Claude Code, etc.). This is one structured field, not a complex decision. When the admin opens the review modal, they see "Requested for: ChatGPT · Cursor" as a clear display rather than inferring it from a paragraph. It also makes the admin's approval decision more precise — they can approve for all requested clients, or scope it down to fewer.

### Friction 12: Connector Version Names Are Meaningless

**Friction observed:** Connector versions are displayed as "Linear", "Linear #2", "Linear #3" — auto-incremented numbers with no descriptive meaning. Jane, browsing the catalog, has no way to know which version is appropriate for her use case. Admins, reviewing a request for "Linear #2", must remember from memory what that version was configured as. The numbering system treats connector versions like file copies ("Document (1)") rather than distinct, purposeful configurations.

**Potential idea:** Encourage descriptive naming at the point of connector setup, through two lightweight mechanisms. First, hint text in the name field: "Give this a name that reflects its permission scope — e.g., 'Linear · Read only · Designers' or 'Linear · Full access · Engineering'." Second, for admins who don't rename manually, an LLM-generated suggestion based on the tools they've enabled and the description they wrote — surfaced as a one-click "Use suggested name" before saving. The name should then appear as the primary label everywhere the connector is shown: catalog cards, request modals, approval queue, and permission panels.

---

## 10. Systems Thinking: Notification Architecture Considerations

The Part 2 challenge asks for a scalable foundation. Here are the key design dimensions to address:

**Ambient vs. Interruptive:** Not all events warrant the same interrupt level. A connector approval request (someone's work is blocked) is medium-urgency. A security violation detection is high-urgency. A monthly audit report is low-urgency. The system needs a tier model.

**Action-required vs. Informational:** Some notifications require a human decision (approve/deny). Others are informational (credential renewed automatically). The UI pattern for each is fundamentally different — the former needs embedded action controls, the latter needs acknowledgment and context.

**Role-based routing:** Within the scope of this challenge, there are two roles — non-admin users and workspace admins. Connector requests route to admins; status updates route back to requesters. Any future event types (security violations, deployment warnings) may introduce additional recipient roles, so the system should be designed to support routing without assuming a fixed role list today.

**Scalability to new event types:** The system should be designed so that adding a new event type (say, "workspace configuration drift") requires minimal new UI pattern definition — just a new payload mapped to an existing template.

**Persistence vs. ephemeral:** Some events should live in a persistent inbox until actioned. Others are transient alerts. The architecture should support both without conflating them.

---

## 11. Comparable Products & Patterns Worth Studying

- **GitHub notifications inbox** — strong model for multi-type, role-routed notifications with triage and "done" states
- **PagerDuty incident workflow** — tiered urgency, on-call routing, escalation chains — relevant for the security violation case
- **Linear's notification drawer** — lightweight, contextual, embedded in a developer workflow context (relevant since Linear is a Runlayer connector)
- **Slack's "Your requests" / admin center** — enterprise approval flows surfaced without leaving the primary product
- **Figma's notification bell** — minimal ambient indicator that expands to a contextual list

---

## 12. Open Questions for Design Exploration

1. Where exactly does the notification/inbox entry point live in the new nav? (Bell icon in header? Persistent sidebar count? Bottom-left alongside Settings?)
2. What is the right "home" for non-admin users to track their request status? A dedicated section, or inline in the connector catalog?
3. Should the approval flow support delegation? (Admin A assigns a request to Admin B)
4. What's the right email/in-product relationship? Does in-product notification replace email, supplement it, or let users choose?
5. Should high-urgency events (security violations) support real-time alerting (push, sound, screen interruption)?
6. What's the notification lifecycle? When does an item move from "needs attention" to "done"? Who can archive/dismiss?

---

*Sources: runlayer.com, Notion design brief (Runlayer Design Challenge: Rethinking Approvals & Admin Visibility), Figma design file (Design Challenge: Request Flows)*
