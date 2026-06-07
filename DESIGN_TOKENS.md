# Runlayer Design Reference
## Single source of truth — merged from design system spec + actual implementation

> **How to use this file:**
> Read this before writing ANY new component, page, or style.
> Where "Spec" and "Actual" differ, **Actual wins** — it reflects what's in the codebase.
> Update this file whenever a new pattern is established.

---

## 0. Mandatory Pre-Build Checklist

Before writing a single line of UI code:
- [ ] Did I read the color palette below and pick only from it?
- [ ] Did I open an existing component (e.g. `settings-sidebar.tsx`, `connectors/page.tsx`) and check how it handles this pattern?
- [ ] Is this surface light? (If dark, stop — this product has no dark surfaces)
- [ ] Am I using the warm stone palette, not zinc/slate/gray?
- [ ] Have I checked the Do's and Don'ts section at the bottom?

---

## 1. Color Palette

### Backgrounds & Surfaces

| Role | Value | Notes |
|---|---|---|
| Page / sidebar bg | `#fafaf9` | Warm off-white — NOT `#f4f4f5` (zinc) |
| Card / panel bg | `#fdfdfd` | Settings panel, connector cards |
| Modal / popover bg | `#ffffff` | Pure white |
| Muted row bg | `rgba(28,25,23,0.06)` | Hover state, active nav, pill backgrounds |
| Hover row bg | `rgba(28,25,23,0.02)` | Subtle row hover inside cards |

> **Spec says** `--background: #ffffff`, `--muted: #f4f4f5`. **Actual uses** warm stone tones above. Use actual.

### Text

| Role | Value | Usage |
|---|---|---|
| Primary text | `#1c1917` | Headings, active nav labels, card names |
| Secondary text | `#57534e` | Nav labels, body text |
| Muted text | `#78716c` | Section titles, descriptions, section headers |
| Subtle / placeholder | `#a8a29e` | Search placeholders, empty states, timestamps |

> **Spec says** `--foreground: #09090b`. **Actual uses** `#1c1917` (warmer). Use actual.

### Borders & Dividers

| Role | Value |
|---|---|
| Card / panel border | `1px solid rgba(28,25,23,0.09)` |
| Divider inside cards | `height: 1px; background: #e7e5e4` |
| Row separator (subtle) | `#f5f5f4` |

> **Spec says** `--border: #e4e4e7`. **Actual uses** `rgba(28,25,23,0.09)` on cards, `#e7e5e4` on dividers.

### Status / Semantic Colors
Use **only** in badges, dots, status indicators — never in nav, layout, or buttons.

| Role | Value | Usage |
|---|---|---|
| Success / connected | `#16a34a` | Connected dot, approved state |
| Warning / pending | `#d97706` | Pending badge text |
| Pending bg | `#fef3c7` | Amber badge background |
| Destructive / risk | `#ef4444` | High risk badge, deny button |
| Risk bg | `#fee2e2` | High risk badge background |
| Info / hosted | `#3b82f6` | Hosted globe badge |
| Unread / priority dot | `#f97316` | Bell dot, unread indicator |
| Priority bg | `#fff7ed` | High priority chip background |
| Priority text | `#c2410c` | High priority chip text |

---

## 2. Typography

- **Font family**: Geist (`--font-sans`) — imported in `app/layout.tsx`. **NOT Inter** (spec is wrong here).
- **Mono font**: Geist Mono (`--font-mono`) — for tool names, API identifiers.

| Role | Size / Weight / Color |
|---|---|
| Page title | `18px / 600 / -0.3px / #1c1917` |
| Section heading (modal) | `text-lg font-semibold` = `18px / 600` |
| Card label | `13px / 600 / -0.1px / #1c1917` |
| Nav label | `14px / 600 / -0.2px / #57534e` |
| Section title | `14px / 500 / #78716c` |
| Body / description | `12px / 400 / 16px line-height / #78716c` |
| Caption / meta | `11–12px / 400–500 / #a8a29e` |
| Code / tool name | `font-mono text-xs` |
| Badge / chip text | `11–12px / 500` |
| Uppercase label | `10px / 600 / 0.06em tracking / uppercase / #a8a29e` |

---

## 3. Elevation & Shadows

| Surface | Shadow |
|---|---|
| Card (hover) | `0 4px 16px rgba(28,25,23,0.08)` |
| Popover / dropdown | `0 8px 32px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)` |
| Modal | `shadow-lg` (shadcn default) |
| Sidebar | none — flat |

**No dark surfaces.** No `#1a1a1a`, `#18181b`, or any dark-mode-style backgrounds. This is a light-mode-only product.

---

## 4. Border Radius

| Element | Radius |
|---|---|
| Cards | `rounded-xl` (12px) |
| Buttons (primary) | `rounded-lg` (8px) |
| Badges / chips | `6px` |
| Avatars | `rounded-full` |
| Nav items | `rounded-md` (6px) |
| Inputs | `rounded-lg` |
| Modals | `rounded-xl` (shadcn default) |

---

## 5. Component Patterns

### 5.1 Buttons

```tsx
// Primary CTA (approve, save, submit)
<Button variant="default">Approve</Button>
// → background: #1c1917, color: #fafaf9, rounded-lg

// Secondary / cancel
<Button variant="outline">Cancel</Button>
// → white bg, border, same radius

// Destructive (deny, remove)
<Button variant="destructive">Deny</Button>
// → red fill

// Ghost (icon actions, sidebar)
<Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
```

**Modal footer rule:** Always `flex justify-end gap-2` — outline Cancel left, default Action right.

---

### 5.2 Dialog / Modal

```tsx
<Dialog>
  <DialogContent className="sm:max-w-[480px]">  {/* or max-w-[600px] for wide */}
    <DialogHeader>
      <DialogTitle>Title here</DialogTitle>
      <DialogDescription>Helper text in muted-foreground.</DialogDescription>
    </DialogHeader>
    <div className="py-4 space-y-4">{/* body */}</div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="default">Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Widths: `480px` for request/form modals, `600px` for review/config modals.

---

### 5.3 Tabs (underline style)

Used for page-level filters (Active / Pending / All) and modal tabs.

```tsx
// Active tab styles:
borderBottom: "2px solid #1c1917"
color: "#1c1917"
fontWeight: 600

// Inactive tab:
color: "#78716c"
fontWeight: 400
borderBottom: "2px solid transparent"

// Tab bar container:
borderBottom: "1px solid #e7e5e4"
```

No background pill on the tab bar — underline only.

---

### 5.4 Badges / Status Chips

```tsx
// Generic muted tag (tools count, hosting type)
background: rgba(28,25,23,0.06), color: #57534e, borderRadius: 6px, padding: "2px 6px", fontSize: 11–12px

// Connected / success
background: #dcfce7, color: #16a34a

// Pending / warning
background: #fef3c7, color: #d97706

// High risk
background: #fee2e2, color: #991b1b

// High priority
background: #fff7ed, color: #c2410c  (+ AlertTriangle icon)

// Low risk
background: rgba(28,25,23,0.06), color: #78716c
```

---

### 5.5 Connector Card

```tsx
<div className="flex flex-col rounded-xl cursor-pointer overflow-hidden"
  style={{ background: "#ffffff", border: "1px solid rgba(28,25,23,0.09)", height: 183 }}>
  {/* Top: 32px icon + hosting badge */}
  {/* Content: name (13px/600) + description (12px/400/#78716c) */}
  {/* Bottom: count chips OR "Connect" button */}
</div>
```

---

### 5.6 Tool Capability Row (in permission config modals)

```tsx
<div className={cn(
  "flex items-center justify-between px-4 py-3 rounded-md",
  tool.isDestructive && "bg-red-50 border border-red-200"
)}>
  <div>
    <p className="font-mono text-xs font-medium">{tool.name}</p>
    <p className="text-xs text-muted-foreground">{tool.description}</p>
  </div>
  <div className="flex items-center gap-3">
    {tool.isDestructive && <Badge variant="destructive">Destructive</Badge>}
    <Switch checked={tool.enabled} onCheckedChange={() => toggle(tool.id)} />
  </div>
</div>
```

Destructive rows: `bg-red-50 border-red-200` — the ONLY colored row background in the product.

---

### 5.7 Request List Row (admin queue)

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-border
                hover:bg-muted/50 cursor-pointer"
     style={{ borderLeft: isPriority ? "2px solid #fb923c" : undefined }}>
  <div className="flex items-center gap-3">
    <Avatar initials={requester.initials} />
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1917" }}>{connector.name}</p>
      <p style={{ fontSize: 12, color: "#78716c" }}>{requester.name} · {timeAgo}</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <RiskChip /><StatusBadge /><ChevronRight />
  </div>
</div>
```

High-priority rows: `border-l-2 border-orange-400`.

---

### 5.8 Settings Row (label + switch)

```tsx
<div className="flex items-start justify-between px-4 py-3 gap-4">
  <div>
    <p style={{ fontSize: 13, fontWeight: 600, color: "#44403c" }}>Label</p>
    <p style={{ fontSize: 12, color: "#78716c", lineHeight: "18px" }}>Description</p>
  </div>
  <Switch checked={value} onCheckedChange={setValue} className="shrink-0 mt-0.5" />
</div>
```

Rows separated by `height: 1px; background: #e7e5e4` divider.

---

### 5.9 Empty State

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
    <Inbox className="h-6 w-6 text-muted-foreground" />
  </div>
  <p className="text-sm font-medium mb-1">No pending requests</p>
  <p className="text-sm text-muted-foreground">Description here.</p>
</div>
```

---

### 5.10 Sidebar Nav Item (collapsed vs expanded)

```tsx
// Expanded
<Link className="flex items-center gap-2 rounded-md px-2 h-8 transition-colors">
  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:16, height:16, flexShrink:0 }}>
    <Icon size={15} strokeWidth={1.75} style={{ opacity: 0.75 }} />
  </span>
  <span>{label}</span>
</Link>

// Collapsed — NO gap-2, use w-full + justify-center
<Link className="flex items-center rounded-md w-full h-8 justify-center transition-colors">
  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:16, height:16, flexShrink:0 }}>
    <Icon size={15} strokeWidth={1.75} />
  </span>
  {/* text span still rendered but maxWidth:0, opacity:0 for animation */}
</Link>
```

**Known gotcha:** `gap-2` with hidden (width:0) badge/text spans offsets icon centering in collapsed mode. Always remove gap when collapsed.

---

## 6. Layout

| Zone | Value |
|---|---|
| Sidebar collapsed | `56px` wide |
| Sidebar expanded | `240px` wide |
| Sidebar bg | `#fafaf9` |
| Settings content padding | `px-16 py-8` |
| Connectors page padding | `px-5 py-5` |
| Main content bg | `#fafaf9` |
| Settings panel (inner card) | `#fdfdfd`, `border: 1px solid rgba(28,25,23,0.09)`, `rounded-xl` |

---

## 7. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use warm stone palette (`#1c1917`, `#57534e`, `#78716c`) | Use zinc/slate (`#09090b`, `#71717a`) — the spec is wrong here |
| Light surfaces only — white / `#fafaf9` / `#fdfdfd` | Dark surfaces (`#1a1a1a`, `#18181b`) even if the spec says so |
| `font-mono text-xs` for tool/API names | Colored backgrounds on non-status rows |
| Status colors ONLY in badges, dots, status indicators | Color in navigation, layout chrome, or buttons |
| Right-align modal footers: Cancel (outline) → Action (default) | Center or left-align modal buttons |
| `rounded-xl` for cards and panels | `rounded-lg` on cards (too small) |
| `shadow-sm` only on cards and modals | Heavy shadows or colored shadows |
| Check an existing component first | Trust spec docs blindly without cross-checking the actual codebase |
| `divide-y` / `#e7e5e4` for settings rows | Striped tables or heavy table borders |
| Sidebar active state: `rgba(28,25,23,0.06)` bg only | Colored active states in nav |
| Update this file when establishing a new pattern | Let new patterns go undocumented |

---

## 8. Lucide Icon Usage

```tsx
// Standard usage
<Icon size={15} strokeWidth={1.75} style={{ opacity: 0.75 }} />

// In collapsed nav (wrapped for centering)
<span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:16, height:16, flexShrink:0 }}>
  <Icon size={15} strokeWidth={1.75} style={{ opacity: 0.75 }} />
</span>
```

Icons to avoid in collapsed nav (visually asymmetric): `Rocket`, `PenTool`, `BarChart2`. Prefer symmetric alternatives.

---

*Sources: `Runlayer_Design_System.md` (spec) + actual implementation in this codebase. Actual always wins on conflicts.*
