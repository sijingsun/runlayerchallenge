# Runlayer Design System
## Vibe-Coding Reference — shadcn/ui Customization Layer

> **Base library:** shadcn/ui (Radix UI primitives + Tailwind CSS)  
> **Purpose:** Reproduce Runlayer screens accurately when vibe-coding. This doc covers every token override, component pattern, and layout convention observed across the Figma starter file.

---

## 1. Design Philosophy

Runlayer uses the **shadcn/ui default aesthetic with minimal theming** — the product reads as deliberate restraint, not unfinished. Key principles:

- **Near-zero color** in the UI chrome. Color is reserved exclusively for status and risk signals.
- **Neutral grays dominate** — backgrounds, borders, text hierarchy all live within a gray ramp.
- **Density is moderate** — not as tight as Linear, not as airy as Notion. Enterprise-appropriate.
- **Actions are always unambiguous** — every state has a clear primary CTA. No visual ambiguity about what to do next.

---

## 2. Color Tokens

Runlayer maps tightly to shadcn's CSS variable system. Override only these values from the default shadcn theme:

### Background & Surface
```css
--background: #ffffff;           /* Page background */
--card: #ffffff;                 /* Card / panel surface */
--popover: #ffffff;              /* Dropdown, tooltip surface */
--muted: #f4f4f5;                /* Subtle section background (e.g., settings rows) */
--muted-foreground: #71717a;     /* De-emphasized text */
```

### Foreground / Text
```css
--foreground: #09090b;           /* Primary text — near-black, not pure black */
--card-foreground: #09090b;
--secondary-foreground: #18181b;
```

### Border & Input
```css
--border: #e4e4e7;               /* Default border — light zinc */
--input: #e4e4e7;                /* Input border */
--ring: #18181b;                 /* Focus ring — near-black */
```

### Primary (CTA / Action)
```css
--primary: #18181b;              /* Near-black — used for all primary buttons */
--primary-foreground: #fafafa;   /* White text on primary */
```

### Secondary / Ghost
```css
--secondary: #f4f4f5;
--secondary-foreground: #18181b;
```

### Status Colors (Semantic — use sparingly)
| Token | Hex | Usage |
|---|---|---|
| Destructive / Risk | `#ef4444` | Red — destructive tool capabilities, deny actions |
| Success / Installed | `#22c55e` | Green — installed/active connector status |
| Warning / Pending | `#f59e0b` | Amber — pending request state |
| Info / In-review | `#3b82f6` | Blue — under review state (optional) |
| Neutral muted | `#71717a` | Not installed, inactive |

> **Rule:** These status colors appear **only** in badges, status dots, and risk-flag highlights. Never in navigation, buttons, or layout elements.

---

## 3. Typography

Runlayer uses the shadcn/ui default type scale. Font family is **Inter** (system-ui fallback acceptable).

### Scale
| Role | Class | Size / Weight |
|---|---|---|
| Page title | `text-2xl font-semibold` | 24px / 600 |
| Section heading | `text-lg font-semibold` | 18px / 600 |
| Card / panel title | `text-base font-medium` | 16px / 500 |
| Body default | `text-sm` | 14px / 400 |
| Description / helper | `text-sm text-muted-foreground` | 14px / 400, gray |
| Label (form) | `text-sm font-medium` | 14px / 500 |
| Caption / meta | `text-xs text-muted-foreground` | 12px / 400, gray |
| Code / tool name | `font-mono text-xs` | 12px mono |

> **Pattern:** Titles are `font-semibold`. Descriptive copy below a title always uses `text-muted-foreground`. This two-tone hierarchy (dark title + gray description) repeats everywhere — modals, settings rows, cards.

---

## 4. Spacing & Layout

### Page Shell
```
Sidebar (fixed, left) | Main content area (flex-1)
```
- Sidebar width: **240px**
- Content max-width: **none** — fills available space
- Content padding: `px-8 py-6`

### Card / Panel
- Padding: `p-6` (24px all sides)
- Border radius: `rounded-lg` (8px)
- Border: `border border-border`
- Shadow: `shadow-sm` (barely visible — `0 1px 2px rgba(0,0,0,0.05)`)

### Grid (Connector Catalog)
- Layout: CSS grid, `grid-cols-3` at desktop, `grid-cols-2` at medium
- Gap: `gap-4`
- Each connector card: `p-5 rounded-lg border border-border`

---

## 5. Component Patterns

### 5.1 Button

Runlayer uses exactly two button variants from shadcn — no custom variants needed.

**Primary CTA** (Approve, Save, Request access, Add)
```tsx
<Button variant="default">Approve</Button>
// Renders: bg-primary text-primary-foreground — near-black fill, white text
// Hover: opacity-90
// Size: default (h-10 px-4 py-2)
```

**Secondary / Cancel**
```tsx
<Button variant="outline">Cancel</Button>
// Renders: border border-input bg-background — white with gray border
```

**Destructive** (Deny, Remove)
```tsx
<Button variant="destructive">Deny</Button>
// Renders: bg-destructive text-destructive-foreground — red fill
```

**Ghost** (sidebar nav items, icon actions)
```tsx
<Button variant="ghost" size="icon">
  <X className="h-4 w-4" />
</Button>
```

> **Pairing rule:** Every modal footer has exactly two buttons: `outline` (Cancel) on the left, `default` (action) on the right. They are right-aligned using `flex justify-end gap-2`.

---

### 5.2 Dialog / Modal

This is the most-used compound component. It follows shadcn's `<Dialog>` exactly.

```tsx
<Dialog>
  <DialogContent className="sm:max-w-[480px]">
    <DialogHeader>
      <DialogTitle>Request access to Linear</DialogTitle>
      <DialogDescription>
        Describe your use case so your admin can review the request.
      </DialogDescription>
    </DialogHeader>

    {/* Form or content body */}
    <div className="py-4 space-y-4">
      {/* content */}
    </div>

    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="default">Request access</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Observed widths:**
- Standard request/form modals: `max-w-[480px]`
- Permission configuration panels (with tabs): `max-w-[600px]`
- Full detail / review panels: may use a `Sheet` (side panel) instead

**Always present:**
- `×` close button top-right (built into shadcn `DialogContent`)
- `DialogTitle` + `DialogDescription` header block
- `DialogFooter` with Cancel + primary action

---

### 5.3 Tabs (within modals)

Used in the permission configuration modal (Connectors / Config / Limit / Trust tabs).

```tsx
<Tabs defaultValue="connectors">
  <TabsList>
    <TabsTrigger value="connectors">Connectors</TabsTrigger>
    <TabsTrigger value="config">Config</TabsTrigger>
    <TabsTrigger value="limit">Limit</TabsTrigger>
    <TabsTrigger value="trust">Trust</TabsTrigger>
  </TabsList>
  <TabsContent value="connectors">
    {/* tool list with toggles */}
  </TabsContent>
</Tabs>
```

Runlayer uses the **underline style** tab variant — `TabsList` has no background pill, just an underline indicator on the active tab. This is the shadcn default `TabsList` without `rounded-md bg-muted` styling.

Override in `components/ui/tabs.tsx` if needed:
```css
/* TabsList — remove background, add bottom border */
TabsList: "inline-flex h-9 items-center border-b border-border w-full rounded-none bg-transparent p-0"
TabsTrigger: "pb-2 pt-1 px-3 text-sm border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground"
```

---

### 5.4 Switch (Toggle)

Used in the settings notification panel and tool enable/disable rows.

```tsx
<div className="flex items-center justify-between py-3">
  <div>
    <p className="text-sm font-medium">Connector information</p>
    <p className="text-sm text-muted-foreground">
      Receive alerts when connector credentials expire.
    </p>
  </div>
  <Switch checked={enabled} onCheckedChange={setEnabled} />
</div>
```

**Settings row pattern:**
- Full-width `flex items-center justify-between`
- Left: label (`font-medium`) + description (`text-muted-foreground`) stacked
- Right: `<Switch />` — no additional label needed
- Rows separated by a `<Separator />` or `border-b border-border` on the container
- Container: `divide-y divide-border` on the wrapping `div`

---

### 5.5 Badge (Status Indicator)

```tsx
// Installed / Active
<Badge variant="secondary" className="bg-green-100 text-green-700">Installed</Badge>

// Pending
<Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>

// Not installed / inactive
<Badge variant="secondary" className="bg-muted text-muted-foreground">Not installed</Badge>

// Destructive tool capability (risk flag)
<Badge variant="destructive">Destructive</Badge>
// or inline red highlight on tool row background:
// className="bg-red-50 border border-red-200 rounded px-2 py-1"
```

> Badges are `text-xs font-medium` with `rounded-full` or `rounded-md`. Runlayer uses `rounded-md` (pill is too soft for an enterprise tool).

---

### 5.6 Connector Card

```tsx
<div className="p-5 rounded-lg border border-border hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
  {/* Header row */}
  <div className="flex items-start justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
        {/* Connector logo/icon */}
        <img src={connector.icon} className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{connector.name}</p>
        <p className="text-xs text-muted-foreground">{connector.category}</p>
      </div>
    </div>
    <Badge ...>{connector.status}</Badge>
  </div>

  {/* Description */}
  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
    {connector.description}
  </p>

  {/* Action */}
  <Button variant="outline" size="sm" className="w-full">
    {connector.installed ? "Manage" : "Request access"}
  </Button>
</div>
```

---

### 5.7 Tool Capability Row (within connector detail / permission config)

```tsx
<div className={cn(
  "flex items-center justify-between px-4 py-3 rounded-md",
  tool.isDestructive && "bg-red-50 border border-red-200"
)}>
  <div>
    <p className="text-sm font-mono font-medium">{tool.name}</p>
    {/* e.g., create_issue, delete_record */}
    <p className="text-xs text-muted-foreground">{tool.description}</p>
  </div>
  <div className="flex items-center gap-3">
    {tool.isDestructive && (
      <Badge variant="destructive" className="text-xs">Destructive</Badge>
    )}
    <Switch checked={tool.enabled} onCheckedChange={() => toggle(tool.id)} />
  </div>
</div>
```

> **Risk flagging pattern:** Destructive tool rows get a `bg-red-50 border-red-200` background — the only use of a colored row background in the product. This is the primary visual risk signal.

---

### 5.8 Request List Row (Admin queue)

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 cursor-pointer">
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
      {requester.initials}
    </div>
    <div>
      <p className="text-sm font-medium">{connector.name}</p>
      <p className="text-xs text-muted-foreground">
        {requester.name} · {timeAgo(request.createdAt)}
      </p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <Badge ...>{request.status}</Badge>
    <Button variant="ghost" size="icon">
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
</div>
```

---

### 5.9 Sidebar Navigation

```tsx
<aside className="w-60 h-screen fixed left-0 top-0 border-r border-border flex flex-col">
  {/* Logo */}
  <div className="px-4 py-4 border-b border-border">
    <img src="/runlayer-logo.svg" className="h-6" />
  </div>

  {/* Nav groups */}
  <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
        Connectors
      </p>
      <NavItem href="/catalog" icon={Grid} label="Catalog" />
      <NavItem href="/my-connectors" icon={Plug} label="My connectors" />
    </div>
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
        Admin
      </p>
      <NavItem href="/requests" icon={Inbox} label="Requests" badge={pendingCount} />
      <NavItem href="/audit" icon={Activity} label="Audit log" />
    </div>
  </nav>

  {/* Bottom: Settings */}
  <div className="px-3 py-4 border-t border-border">
    <NavItem href="/settings" icon={Settings} label="Settings" />
  </div>
</aside>
```

**NavItem pattern:**
```tsx
function NavItem({ href, icon: Icon, label, badge }) {
  return (
    <Link href={href} className={cn(
      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
      "text-muted-foreground hover:text-foreground hover:bg-muted",
      isActive && "text-foreground bg-muted font-medium"
    )}>
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="text-xs bg-foreground text-background rounded-full px-1.5 py-0.5 font-medium">
          {badge}
        </span>
      )}
    </Link>
  )
}
```

> **Active state:** `bg-muted` background + `font-medium` + `text-foreground`. No colored accent — purely weight + background shift.

---

## 6. Form Patterns

### Text Input
```tsx
<div className="space-y-2">
  <Label htmlFor="reason">Reason for access</Label>
  <Textarea
    id="reason"
    placeholder="Describe your use case..."
    className="resize-none"
    rows={3}
  />
  <p className="text-xs text-muted-foreground">
    This will be visible to your admin when reviewing the request.
  </p>
</div>
```

### Select / Dropdown
```tsx
<div className="space-y-2">
  <Label>Access level</Label>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select access level" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="read">Read only</SelectItem>
      <SelectItem value="write">Read + Write</SelectItem>
      <SelectItem value="admin">Full access</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Form spacing:** `space-y-4` between form fields inside a modal.

---

## 7. Notification / Alert Patterns

These are **design targets** for new work (Part 2 of the challenge), informed by the existing component language.

### Inline Alert Banner (for critical events)
```tsx
<div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
  <div>
    <p className="text-sm font-medium text-red-900">Security violation detected</p>
    <p className="text-xs text-red-700 mt-0.5">
      The GitHub connector attempted an action outside its permitted scope.
    </p>
  </div>
  <Button variant="outline" size="sm" className="ml-auto shrink-0">Review</Button>
</div>
```

### Notification Bell (header / sidebar)
- Use `<Bell className="h-5 w-5" />` with a numeric badge overlay
- Badge: `absolute -top-1 -right-1 h-4 w-4 bg-foreground text-background text-[10px] rounded-full`
- When count > 9: show `9+`

### Notification Drawer Item
```tsx
<div className="flex gap-3 px-4 py-3 border-b border-border hover:bg-muted/50">
  {/* Status dot */}
  <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium truncate">{notification.title}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
    <p className="text-xs text-muted-foreground mt-1">{timeAgo(notification.createdAt)}</p>
  </div>
  {notification.actionRequired && (
    <Button variant="outline" size="sm" className="shrink-0 self-center">
      Review
    </Button>
  )}
</div>
```

---

## 8. Empty States

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="h-6 w-6 text-muted-foreground" />
  </div>
  <p className="text-sm font-medium mb-1">No pending requests</p>
  <p className="text-sm text-muted-foreground">
    When users request connector access, they'll appear here.
  </p>
</div>
```

> Pattern: icon in muted circle → bold short title → muted description. No CTA in most empty states.

---

## 9. Screen-by-Screen Cheat Sheet

### Connector Catalog (Non-admin)
- Page layout: header (`text-2xl font-semibold` "Connectors") + filter tabs + `grid-cols-3` card grid
- Filter tabs: "All", "Installed", "Available", "Pending" — use shadcn `<Tabs>` underline style
- Each card: connector icon + name + category + description + status badge + CTA button
- Status drives CTA label: installed → "Manage", pending → "Pending" (disabled), not installed → "Request access"

### Request Modal (Non-admin)
- `max-w-[480px]` Dialog
- Header: connector name as title, permission scope as description
- Body: `<Textarea>` for reason, optional `<Select>` for access level
- Footer: "Cancel" outline + "Request access" default

### Admin Request Queue
- Full-page list view with tabs: Pending / Approved / Denied / All
- Each row: requester avatar + connector name + requester name + time + status badge + chevron
- Clicking a row opens a `max-w-[600px]` Dialog with full request context
- Dialog body: requester info, stated reason, connector info + risk assessment
- Dialog footer: "Deny" destructive + "Approve" default (triggers permission config inline)

### Permission Config Modal (Admin)
- `max-w-[600px]` Dialog
- 4-tab structure: Connectors / Config / Limit / Trust — underline tabs
- "Connectors" tab: list of tool capability rows (tool name + description + destructive badge if applicable + toggle)
- "Config" tab: access level settings, scope restrictions
- Footer: "Cancel" + "Save permissions" default

### Settings — Notification Preferences
- Page: sidebar left, full-width settings content right
- Section: "Notification preferences" heading + description
- Rows: `divide-y divide-border` container, each row = label + description + `<Switch>`
- Categories: Connector information / Security violations / Policy violations / Connector failures / Credential expiry / Audit events

---

## 10. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use `text-muted-foreground` for all helper/description text | Use color in navigation or layout chrome |
| Right-align modal footers with Cancel → Action order | Center or left-align modal buttons |
| Use `font-mono` for tool/connector API names | Use colored backgrounds on non-status rows |
| Show status via badges, not row colors (except destructive risk) | Use more than 2 primary actions in any view |
| Use `shadow-sm` only on cards and modals | Add decorative gradients, illustrations, or icons in headers |
| Keep empty states icon + title + description, no CTA | Use emoji or color icons in the nav |
| Use `divide-y` for settings rows | Use striped tables or heavy table borders |
| Keep the sidebar monochromatic — active = `bg-muted` only | Use colored active states in the nav |

---

## 11. Tailwind Config Additions

Add to `tailwind.config.js` to support Runlayer's zinc-based scale:

```js
theme: {
  extend: {
    colors: {
      // Runlayer uses zinc (not slate, not gray) as its neutral
      // shadcn default with zinc already covers this — no additions needed
    },
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    }
  }
}
```

---

## 12. Component Import Checklist

For any Runlayer screen, you will need these shadcn components installed:

```bash
npx shadcn@latest add button dialog tabs switch badge select textarea label separator
```

Additional Lucide icons used across screens:
```
Bell, ChevronRight, X, Settings, Inbox, Grid, Plug, Activity, 
AlertTriangle, Check, Ban, Clock, Shield, ExternalLink
```

---

*Generated from: Figma screen analysis (Runlayer Design Challenge starter file) + Runlayer_Design_Challenge_Findings.md*
