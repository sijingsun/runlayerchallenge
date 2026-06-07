@AGENTS.md

# Design Process — Mandatory

**Before writing any new UI component or page:**

1. Read `DESIGN_TOKENS.md` in this directory — it is the single source of truth for colors, typography, surfaces, and component patterns.
2. Open at least one existing component that's visually similar and match it.
3. Run through the pre-build checklist in `DESIGN_TOKENS.md` §0.

**After establishing a new pattern:**
Update `DESIGN_TOKENS.md` with it so future work stays consistent.

**On conflicting sources:**
`DESIGN_TOKENS.md` > spec MDs > intuition. The actual codebase is always right.

# Key things that have burned us before
- Dark surfaces: this product has NO dark panels. Spec may say dark — ignore it.
- Warm stone vs zinc: we use `#1c1917` / `#57534e` / `#78716c`, not `#09090b` / `#71717a`.
- Font is Geist, not Inter.
- `gap-2` in collapsed sidebar nav offsets icons — use no gap when collapsed.
