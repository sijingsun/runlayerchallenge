# Runlayer Implementation Notes
## Corrections & Design System Accuracy Log

This doc captures every design decision corrected during implementation — use it to avoid repeating the same mistakes.

---

## 1. Font Family — Geist, NOT Inter

**Mistake:** Defaulted to Inter when scaffolding the Next.js project.
**Correct:** Runlayer uses **Geist** (and Geist Mono for code). Import from `next/font/google`.

```tsx
import { Geist, Geist_Mono } from "next/font/google";
const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
```

---

## 2. Nav Item Typography — Full Spec

**Mistake:** Used `text-sm text-muted-foreground font-medium` (zinc gray, 14px/400).
**Correct:** All nav item labels use:

```css
color: #57534E;           /* warm stone — NOT zinc #71717a */
font-family: Geist;
font-size: 14px;
font-weight: 600;         /* semibold, NOT medium/400 */
line-height: 16px;
letter-spacing: -0.2px;   /* negative tracking — easy to miss */
```

Apply via inline style (Tailwind doesn't have `-0.2px` tracking out of the box):
```tsx
style={{ fontSize: "14px", fontWeight: 600, lineHeight: "16px", letterSpacing: "-0.2px", color: "#57534E" }}
```

---

## 3. Nav Color — Warm Stone, NOT Zinc

**Mistake:** Used shadcn `text-muted-foreground` = `#71717a` (zinc, cool gray).
**Correct:** `#57534E` — this is a **warm stone** tone. The entire sidebar uses warm neutrals, not cool zinc. This is a deliberate brand choice.

Active nav item: same color `#57534E` + `bg-muted` background. Do NOT switch to `text-foreground` (#09090b) on active.

---

## 4. Switch / Toggle Color — Indigo, NOT Primary Black

**Mistake:** shadcn default switch uses `--primary` = `#18181b` (near-black) for checked state.
**Correct:** Runlayer switches are **indigo** when checked.

Fix in `components/ui/switch.tsx`:
```diff
- data-checked:bg-primary
+ data-checked:bg-indigo-600
```

---

## 5. Badge Style — Rounded rect with semi-transparent bg

**Mistake:** Used Tailwind `rounded-full` with dark background pill.
**Correct spec from Figma:**
```css
border-radius: 6px;
background: rgba(28, 25, 23, 0.06);
```
Apply as inline style. Color is near-black at 6% opacity — renders as a warm light gray chip.
For text content: inherit color (dark) from parent.

---

## 6. Requests Badge — Orange text, no background

**Mistake:** Used black pill badge for the "3" count next to Requests in settings nav.
**Correct:** Plain orange text — `text-orange-500`, no background pill, no border-radius.

```tsx
<span className="text-xs font-medium text-orange-500 leading-none">{badge}</span>
```

---

## 7. Logo — Use exported SVG, not icon substitutes

**Mistake:** Tried to use Lucide `Asterisk` as a logo substitute.
**Correct:** Always use the actual exported `Logo_noEffect.svg` from Figma. Place in `/public/`, render with Next.js `<Image>`.

The Runlayer logo is a custom 6-ray snowflake/asterisk in warm brown (`#A48977`) + "Runlayer" wordmark in dark stone (`#292524`). SVG dimensions: 108×32px.

---

## 8. Design Token Philosophy — Warm Stone, Not Zinc

The shadcn default uses **zinc** neutrals. Runlayer uses **stone** (warm undertone).
- Nav text: `#57534E` (stone-600 equivalent)
- Logo icon color: `#A48977` (warm terracotta)  
- Wordmark: `#292524` (stone-900 equivalent)
- Badge bg: `rgba(28, 25, 23, 0.06)` — warm near-black at low opacity

When in doubt, reach for warm stone tones, not cool zinc.

---

## 9. Active Nav State — bg-muted only, color stays the same

**Mistake:** Switched to `text-foreground` (near-black) for active nav items.
**Correct:** Active state = `bg-muted` background ONLY. Text color stays `#57534E`. No color shift on text.

---

## Quick Reference — Nav Item Pattern

```tsx
<Link
  href={href}
  className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors", isActive && "bg-muted")}
  style={{ color: "#57534E" }}
>
  <Icon className="h-4 w-4 shrink-0 opacity-80" />
  <span style={{ fontSize: "14px", fontWeight: 600, lineHeight: "16px", letterSpacing: "-0.2px" }}>
    {label}
  </span>
</Link>
```
