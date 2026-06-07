# Runlayer: Proposed Design
## Implementation specification for the redesigned approvals and notifications experience

---

### What this file is

This is a screen-by-screen implementation spec for UI changes to the Runlayer product. It covers two user flows (requesting an existing connector, requesting a new connector) plus the supporting notification system that replaces the removed top-level "Requests" nav item.

Each section is a **frame** — one screen state to build. Frames are named: `J` = Jane (non-admin end user), `A` = Admin; `1` or `2` = which flow; letter = sequential step within that flow.

Read the frames in order. Build them in order. Each frame describes what the screen looks like, what components to use, and what interactions it supports.

---

### Tech stack

- **Framework:** Next.js (React)
- **Components:** shadcn/ui — use the exact component names referenced in each frame (`Dialog`, `Tabs`, `Badge`, etc.)
- **Styling:** Tailwind CSS utility classes as written. Where Tailwind doesn't have a value (e.g., `letter-spacing: -0.2px`), use inline styles.
- **Font:** Geist (not Inter). See `Runlayer_Implementation_Notes.md` §1 for the import.
- **Icons:** Lucide React (`Bell`, `Clock`, `AlertTriangle`, `CheckCircle`, etc.)

---

### Before writing any code, read these files first

| File | When to use it |
|---|---|
| `Runlayer_Design_System.md` | Color tokens, component variants, spacing, the Tool Capability Row pattern, sidebar layout |
| `Runlayer_Implementation_Notes.md` | Known corrections — font, nav typography, color values that differ from Tailwind defaults. Check this before writing any CSS. |
| `Runlayer_Design_Challenge_Findings.md` | Background research and friction map — context only, not needed for implementation |

---

### Scope of changes

This is **additive and modifying** — not a ground-up rebuild. The existing Runlayer UI is the base. Changes are:

1. **Remove** the top-level "Requests" nav item from both admin and end-user nav
2. **Add** a bell icon + ambient dot to the sidebar header (both roles)
3. **Add** the bell notification popover (admin variant and end-user variant)
4. **Add** the global interruptive toast component
5. **Modify** the end-user Connectors page: add "+ Request new" panel, add Pending tab with status tracking
6. **Add** the redesigned request modal (structured fields: AI client selector, reason, priority flag)
7. **Modify** the admin request review flow: 2-step modal (review → configure), security summary inline, batch co-requester approval
8. **Add** the full request queue page under Settings → Requests

---

### Structure of this document

The document follows the same narrative as the Flow & Friction Map: **Jane's experience first, then the admin's experience**, for each of the two flows. Read it the way a user would experience it — Jane acts, hands off, admin responds.

---

## Flow 1: Requesting Access to an Existing Connector

---

### Jane's Experience

#### Frame J1-A: Connectors Page — Browse & Identify

Jane navigates to the **Connectors** page via the left nav (under the Build section). This is her starting point for both viewing her active connectors and requesting new ones. The Figma annotates this screen as *"the entry point for non-admins to view our catalog and request new connectors."*

The page opens to the **My connectors** view, showing connectors already available to her. To browse what else is available, she clicks **"+ Request new"** (top right), which opens a slide-in panel listing all connectors in the workspace — effectively the catalog.

Each connector card in the panel shows:
- Tool name and short description
- An **"X existing"** badge if the org already has configured versions of that connector (e.g., "2 existing" on Notion means two named versions are already set up). This is the entry point for Flow 1 — Jane clicks a connector with an existing badge to request access to a preconfigured version.
- No badge = no versions exist yet. Clicking leads to a new connector request (Flow 2).

The fix from friction point **F12** is applied at the version-selection step: when Jane clicks a connector with existing versions, she sees them listed with descriptive names rather than auto-incremented labels. Instead of "Linear #2", she sees **"Linear · Read + Write · Engineering"** — name, permission scope, and intended audience in one line.

If a version hasn't been named yet, it defaults to "Linear (unconfigured)" with an inline nudge: `Name this connector version to help users choose the right one. [Edit name →]` — visible only to admins.

---

#### Frame J1-B: Request Access Modal

After selecting a connector version from the panel, a Dialog opens for Jane to complete her request. This is the redesigned request form — addressing friction point **F11** (AI client scope buried in free text) and adding the priority flag (**F2**).

`Dialog`, `max-w-[480px]`.

`DialogHeader`:
- Title: **"Request access to Linear · Read + Write · Engineering"**
- Subtitle: "Your admin will review this request." in `text-muted-foreground`

Body — form fields, `space-y-4`:

**1. Which AI clients do you need this for?**

A horizontal row of checkbox-style chips. Each: `border border-border rounded-md px-3 py-1.5 text-sm cursor-pointer`. Selected state: `border-foreground bg-muted font-medium`. Available chips: `ChatGPT` · `Cursor` · `Claude Code` · `GitHub Copilot` · `[+ Other]`.

This is the structured field that replaces burying client scope in free text. What Jane selects here becomes a structured signal the admin reads at review time.

**2. Why do you need access?**

`<Textarea>` with `placeholder="Describe your use case — e.g., I need to create and update issues for my sprint work."` and `rows={3}`.

**3. Is this urgent?**

A single checkbox row:
```
[checkbox] Mark as high priority — this is blocking my work
```

When checked, the request card in the admin's queue gets a priority flag. Binary, not a dropdown. Jane knows best.

`DialogFooter`:
- Left: `[Cancel]` outline
- Right: `[Submit request]` default

---

#### Frame J1-C: Confirmation State

After Jane submits, the modal body transitions in place to a confirmation view — no close and reopen.

Centered content:
- Checkmark icon in a `bg-green-50 border border-green-200 rounded-full` circle, `h-12 w-12`
- "Request submitted" (`text-base font-semibold`)
- "You'll be notified when your admin reviews it." (`text-sm text-muted-foreground`)
- Link: `View my pending requests →` — navigates to My Connectors → Pending tab

`DialogFooter`:
- Single button: `[Done]` outline, closes the modal

---

#### Frame J1-D: My Connectors — Pending Tab

Jane can check request status in-product at any time. This resolves friction point **F3** (requester status blindness after submit).

Accessed via the `My connectors` nav item. "Requests" is not a separate nav item — it lives here as a tab.

Page header: "My connectors" (`text-2xl font-semibold`).

Filter tabs (underline style): `Active | Pending | All`

The `Pending` tab shows a count when requests are in-flight: `Pending  2` where "2" is `text-orange-500 font-semibold`.

**Active tab:** Grid of connector cards showing only granted, installed connectors. CTA per card: "Manage".

**Pending tab:** A list view (not grid — these are in-flight, not browsable). Each row:

```
[connector icon]  Linear · Read + Write · Engineering
                  Requested 2 days ago · ChatGPT, Cursor
                  [Pending review]  ← amber badge
```

Status progression per row:
- `Pending review` — amber, waiting for admin
- `Under review` — blue, admin has opened the request
- `Approved` — green, auto-moves to Active tab after a short delay
- `Denied` — muted red, with a `See reason →` link if the admin left a note

---

#### Frame J1-E: Jane's Bell Notification Panel

When the admin makes a decision, Jane's bell dot appears (see nav shell notes below). Clicking the bell opens her notification panel.

The panel is simpler than the admin's — no action items, just status updates.

**Section — "Updates":**

```
[green dot]  Linear approved
             Your request was approved. Linear is now available in ChatGPT and Cursor.
             [Go to My connectors →]   2 hours ago

[muted red dot]  GitHub denied
             Your request was denied. [See admin's note]
             3 days ago
```

No "Needs review" section — end users don't review anything.

Empty state: "No updates yet. We'll let you know when your requests are reviewed."

This resolves friction point **F4** (email-only notification). The bell dot is the in-product channel; email remains as a parallel fallback, not the primary signal.

---

### ↕ Handoff — Jane submits, admin picks it up

---

### Admin's Experience

#### Frame A1-A: Nav Shell & Bell Dot

The admin's persistent sidebar (240px, fixed left). The bell dot is the primary signal that something needs attention — addressing friction point **F1** (admin awareness gap after nav changes).

Top of sidebar: horizontal row with Runlayer logo left, Bell icon right. Next to the bell: a small filled dot (`w-2 h-2`, `bg-orange-500`, `rounded-full`). Dot present = something unread. Dot absent = all clear. No count, no badge ring — just the dot.

**Admin nav items:**
```
[group] Connectors
  - Connectors (browsing + "My connectors" view)
  - All connectors (admin manage view)

[group] Users
  - Members
  - Groups

[group] Monitoring
  - Audit log

[bottom] Settings
```

No "Requests" item in nav. Requests surface through the bell. The full queue is available via bell → "View all requests →" or Settings → Requests.

---

#### Frame A1-B: Interruptive Toast — High-Priority Request

When Jane marks her request high-priority, the admin sees a toast immediately — even before they click the bell. This is the interruptive tier for **F1** (awareness gap) at the highest urgency level.

A floating card, `max-w-[360px]`, `rounded-lg`, `shadow-lg`, `fixed top-4 right-4 z-50`. Thin left border as the only color accent; rest of the surface is `bg-white border border-border`.

**High-priority request variant (neutral):**
```
[left border: 3px solid #18181b]
[icon: Clock, text-foreground]  High-priority request
Jane Cooper flagged her Linear request as urgent — she's blocked on her sprint.
[Review →]  [Dismiss ×]
```

Behavior: auto-dismisses after 10s, but the request stays in the bell panel. If multiple high-priority requests arrive at once: "and 2 more" count indicator.

Other toast variants (not triggered by Jane's flow, but same component):
- **Security violation** (red left border) — persists until actioned
- **Connector failure / credential expiry** (amber left border) — auto-dismisses

---

#### Frame A1-C: Bell Notification Popover

Clicking the bell opens a popover anchored just below-right of the bell — not a drawer. This is the admin's incoming work queue, replacing the old standalone "Requests" nav.

Popover ~420px wide, dark background (`#1a1a1a`).

**Header row:** "All notifications" label + chevron dropdown (future: filter by workspace) · Right: gear icon → notification preferences in Settings.

**Tab bar:** `All` | `Requests (3)` | `Alerts`
- `Requests` count = unreviewed pending requests
- `Alerts` = operational events (credential expiry, failures, security violations)
- "Mark all read" right-aligned, `text-sm` muted

**Content — date-grouped:**

Group labels: TODAY / YESTERDAY / [date] — `text-xs font-semibold uppercase tracking-wide` muted.

Each item has a read/unread dot far left: filled = unread, hollow = read.

**Grouped request item** (multiple people requesting the same connector — addresses **F6**, approval fatigue):
```
● [JC][PR][MC]  3 people requested                    [View →]
                Linear · Read + Write · Engineering
                Jane, Priya, Marcus · Waiting up to 3h
                [⚠ High priority]  [Low risk]
```
- Stacked avatar initials, each a different muted color
- Descriptive connector name (not "Linear #2")
- Requester names + max wait time below
- Tag chips: "⚠ High priority" amber, "Low risk" muted, "High risk" red — addresses **F2** (no urgency differentiation)

**Individual request item:**
```
● [JC]  Jane Cooper requested Linear · Read + Write · Eng   [View →]
        [⚠ High priority]  [Waiting 1h]
```

**System alert item:**
```
○  Slack connector credential expiring in 3 days
   System · 1d ago
```

Empty state: "All caught up — no pending requests or alerts."

---

#### Frame A1-D: Full Request Queue (Settings → Requests)

The full list of all connector requests. Accessed via "View all requests →" from the bell popover, or Settings nav. Same functionality as the old "Requests" page — different access path.

Full-width content area, page header: "Requests" (`text-2xl font-semibold`).

Filter tabs: `Pending | Approved | Denied | All`

Pending count as plain orange text: `Pending  3` where "3" is `text-orange-500 font-semibold`.

Each row:
```
[avatar]  Linear · Read + Write · Engineering
          Jane Cooper · 3 hours  ←  [Low risk] [Pending] [›]
```

High-priority rows have a subtle orange left border: `border-l-2 border-orange-400`.

Three signals on each card, resolving **F2**:
1. **Priority flag** — amber "⚠ High priority" chip if Jane flagged it
2. **Wait time** — elapsed time since submission, shown inline
3. **Risk level** — "High risk" red chip or "Low risk" muted chip, derived from tool risk profile + org precedent

Clicking a row opens the review modal.

---

#### Frame A1-E: Admin Review Modal — Step 1 of 2

The modal the admin sees when reviewing a request. Step 1: evaluate context, decide approve or deny. Addresses **F9** (security info inconsistent), **F11** (AI client scope invisible), and **F5** (approval and config feel collapsed into one click).

`Dialog`, `max-w-[600px]`.

`DialogHeader`:
- Title: "Review request" (`text-lg font-semibold`)
- Connector name pill below title: `Linear · Read + Write · Engineering` — not "Linear #2"

Body — two structured columns:

**Left — requester context:**
- Avatar + name: "Jane Cooper"
- Role/team: "Engineering · Gusto"
- Reason: quoted in `bg-muted rounded-md p-3 text-sm`
- AI clients (structured, not buried): chips — `ChatGPT` · `Cursor`
- Priority: if flagged, "⚠ Marked high priority — requester says this is blocking their work" in amber-tinted row

**Right — connector context:**
- Descriptive connector name + version info
- Security summary inline (not hidden in a tab — resolves **F9**): "This connector has 3 high-risk tools" with a `[View details ↓]` expander — clicking expands the specific tools with risk labels (Destructive, External) and a tooltip explaining each label
- Org precedent signal: "✓ Already approved for 4 members in this org" in muted text if this connector has prior approvals; "⚠ No one in your org has used this connector yet" in amber muted if first time

`DialogFooter`:
- Left: `[Deny]` — destructive variant. Clicking opens an inline input for an optional denial reason sent to Jane.
- Right: `[Approve & configure →]` — default variant. The arrow signals a second step follows, resolving the label confusion from **F5** ("Grant access" read as terminal).

---

#### Frame A1-F: Configure Grant — Step 2 of 2

After clicking "Approve & configure →", the modal transitions to the configuration step. Addresses **F7** (forced 36-tool checklist) and **F6** (approval fatigue) organically.

Same `Dialog`. Header updates:
- Title: "Configure access" (`text-lg font-semibold`)
- Subtitle: "For Jane Cooper · Linear · Read + Write · Engineering" (`text-sm text-muted-foreground`)
- Step indicator: `Step 2 of 2` in `text-xs text-muted-foreground` — just text, not a visual progress bar

**Default fast path (resolves F7):**

An info block (`bg-muted rounded-md p-4`): "Jane will receive the full Linear · Read + Write · Engineering toolset (36 tools)."

Below: `Customize Jane's access ↓` — expands the full tool list with toggles for admins who need to restrict scope. The tool list uses the Tool Capability Row pattern from the design system (mono tool names, destructive badge + red row bg for high-risk tools, switch toggles). Collapsed by default — fast approvals stay fast.

**Suggested users (resolves F6):**

A contextual block between the info block and footer:
```
[bg-muted rounded-md p-3]
2 others also requested this connector
Priya Patel and Marcus Chen are waiting for the same access.
[+ Add them to this grant]  ← checkbox, checked by default
```

The admin adds co-requesters in one action, at the moment they're already in grant mode. No separate queue review required.

`DialogFooter`:
- Left: `[← Back]` — outline, returns to Step 1 without losing state
- Right: `[Grant access]` — default variant. "Grant access" is correct here: configuration is done, saving is the final act. The label confusion was in Step 1, not Step 2.

Jane and any added co-requesters are notified (bell dot + email).

---

---

## Flow 2: Requesting a New / Custom Connector

---

### Jane's Experience

#### Frame J2-A: Connectors Page — Connector Not Found

Jane opens the **"+ Request new"** panel on the Connectors page and scans the available connectors. She doesn't find what she needs. The panel's empty/not-found state (after searching) surfaces a path forward: `Can't find what you're looking for? [Request a new connector →]`.

This links directly to the new connector request form.

---

#### Frame J2-B: New Connector Request Form

A separate form from the existing-connector request. Jane fills in what she knows about the tool she wants connected.

`Dialog`, `max-w-[520px]`.

`DialogHeader`:
- Title: "Request a new connector"
- Subtitle: "Your admin will review and set it up if approved." in `text-muted-foreground`

Body — `space-y-4`:

**1. What tool do you need connected?** — text input, `placeholder="e.g., GitHub, Notion, internal API"`

**2. Transport / registration details** — optional text input for URL or endpoint info Jane may know

**3. Which AI clients do you need this for?** — same chip multi-select as Frame J1-B

**4. Why do you need this?** — `<Textarea>` same as Frame J1-B

**5. Is this urgent?** — same priority checkbox as Frame J1-B

`DialogFooter`:
- Left: `[Cancel]`
- Right: `[Submit request]`

---

#### Frame J2-C through J2-E: Confirmation, Pending Tab, Bell

Same experience as Flow 1 (Frames J1-C, J1-D, J1-E). The pending tab row reads:

```
[connector icon]  GitHub (new connector request)
                  Requested 1 day ago · Cursor
                  [Pending review]
```

When approved, the row updates to `Approved` and the connector appears in Jane's **My connectors** view with access already granted.

---

### ↕ Handoff — Jane submits, admin picks it up

---

### Admin's Experience

#### Frame A2-A: Awareness — Bell Dot & Queue

Same bell dot and popover as Flow 1. New connector requests appear in the queue with a visual distinction from access requests — the item type is labeled: "New connector request" vs. "Access request."

In the queue list (**Frame A1-D** equivalent):
```
[avatar]  GitHub  ·  New connector request
          Jane Cooper · 1 day  ←  [⚠ High risk] [Pending] [›]
```

New connector requests (unvetted, no org precedent) automatically carry higher risk signals. The three triage signals (priority, wait time, risk level) apply equally here.

---

#### Frame A2-B: Admin Review Modal — Step 1 of 2 (New Connector Variant)

Same `Dialog` structure as Frame A1-E, with one key difference in the right column: instead of org-precedent data, the connector context shows the security summary for an unvetted connector.

**Right column — connector context (new connector variant):**
- Tool name + details Jane provided
- Security summary: "This connector has not been vetted by your org — no permission profile exists yet." in amber-tinted info block
- High-risk tools count if detectable from the registration info: "3 high-risk tools detected" with `[View details ↓]` expander — same pattern as Flow 1, same position (**F9** resolved consistently across both flows)
- Org precedent: "⚠ No one in your org has used this connector yet" — always true for new connectors

Three decision options in the footer, clarified labels (resolves **F5**):
- `[Deny]` — destructive
- `[Approve existing connector →]` — if the request maps to a connector already configured in the workspace
- `[Approve & configure new →]` — if this is genuinely new. Arrow signals more steps follow.

---

#### Frame A2-C: Configure New Connector — Step 2 of 2

After clicking "Approve & configure new →", the admin sets up the connector from scratch.

Same `Dialog`. Header:
- Title: "Configure new connector"
- Subtitle: "Setting up GitHub for Jane Cooper" (`text-sm text-muted-foreground`)
- Step indicator: `Step 2 of 2`

**Configuration fields:**
- Connector name (descriptive — this is where the naming standard is enforced): pre-filled with Jane's input, editable. Hint text: `Name it so others can identify it — e.g., "GitHub · Read only · Designers"`
- Transport / endpoint details
- Permission profile — tool checklist with no defaults (new connector, no prior history). High-risk tools flagged with destructive badges. Admin must actively toggle each tool ON — safe by default.

Note: **F7** (default vs. power path) is harder here — no org history means no suggested defaults. The current design requires explicit configuration. This remains an open design problem flagged for future iteration.

**Suggested users:** Same pattern as Frame A1-F — if other users are waiting for a GitHub connector, surface them here to batch-approve.

`DialogFooter`:
- Left: `[← Back]`
- Right: `[Create connector & grant access]` — terminal action

Jane (and any added co-requesters) are notified. The connector appears in the Connectors page for all approved users.

---

---

## Supporting Frames (Role-Agnostic)

These apply to both flows and both roles.

#### Nav Shell — Bell Dot Logic

Both roles share the same sidebar shell. The bell dot follows two tiers:

| Event | Recipient | Tier |
|---|---|---|
| New connector request submitted | Admin | Ambient dot |
| High-priority request (user flagged) | Admin | Interruptive toast |
| Security violation detected | Admin | Interruptive toast |
| Connector failure | Admin | Interruptive toast |
| Credential expiring ≤3 days | Admin | Interruptive toast |
| Request approved | End user | Ambient dot |
| Request denied | End user | Ambient dot |
| Credential expiring (info only) | Admin | Ambient dot |

**Ambient** = small red dot on the bell icon. Dot present = unread. Dot absent = all clear. No count shown anywhere.

**Interruptive** = global toast, top-right, temporarily overlaying content. Only for events that can't wait.

#### Connector Naming — Applied Everywhere

The descriptive name format (`[Tool] · [Permission scope] · [Audience]`) appears consistently across all surfaces:

- Connector card (in the "+ Request new" panel): "Linear · Read only · Designers"
- Request modal title: "Request access to Linear · Read only · Designers"
- Admin review modal header: "Linear · Read + Write · Engineering"
- Admin queue row: same
- Bell notification: "Linear · Read + Write · Engineering requested by Jane Cooper"
- Pending tab row: same

Unconfigured connector fallback: "Linear (unconfigured)" + `Name this connector version to help users choose the right one. [Edit name →]` visible to admins only.

---

## Follow-ups & Stale Requests

The brief asks how follow-ups should behave. The current design handles the normal path (submit → admin reviews → outcome notified). For stale requests:

- If a request has been waiting longer than a defined SLA (e.g., 5 days), the admin's bell popover and queue row surface an escalated wait-time signal — the elapsed time chip turns amber (e.g., "5 days" in `text-amber-600`) rather than muted text.
- The requester's Pending tab row similarly escalates the wait display: `Pending review · 5 days` where "5 days" turns amber.
- No automated escalation emails or admin nudges are designed in this pass — that's deferred.

For credential expiry on already-approved connectors (not a request flow, but a follow-up type): the notification tiers table covers this — ambient dot for advance notice, interruptive toast when expiry is ≤3 days. The admin clicks through to the connector settings to re-authenticate. No dedicated expiry flow is designed here.

---

## What This Does Not Cover (Deferred)

- **Request follow-up nudges** — automated emails or in-product prompts to admins when a request sits unreviewed past an SLA threshold
- **Request delegation** — admin A assigns a pending request to admin B for review
- **Pattern-triggered group provisioning** — "8 people requested this — create a group policy?" conceptually solved via grouped bell items and batch-add in Step 2, but not designed as a standalone screen
- **Additional future event types** — the brief names policy violations, audit issues, deployment warnings, and workspace configuration issues as potential future notification types. These map naturally into the Alerts tab in the bell popover and the interruptive toast system, using the same component with appropriate left-border color and icon. None are designed here.
- **Email / in-product notification preference controls** — the existing Settings page handles this; new event types need to be added as rows to the existing notification preference list
- **Real-time alerting (push/sound) for security violations** — noted as a future escalation path beyond the toast

---

*Paired with: `Runlayer_Design_System.md` (component tokens) · `Runlayer_Implementation_Notes.md` (correction log) · `Runlayer_Design_Challenge_Findings.md` (research + friction map)*
