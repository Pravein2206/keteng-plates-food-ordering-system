# AI Usage Log

One entry per task where an AI agent helped. Record what we asked, what it produced, what we
changed and what we learned.

---

## 2026-11-15: Project scaffold (chore/project-setup)

**Agent:** Claude Code (Claude Opus 5.5)
**Team member:** Pravein (Developer 1)

### Task
Scaffold the app: Next.js with TypeScript and Tailwind, a Supabase client, `.gitignore` and
`.env.example`, before Sprint 1 stories begin.

### Prompt / approach
1. Asked the agent to read CLAUDE.md and us01.md, explain its understanding and propose a plan
   **without writing code**.
2. The agent asked 7 clarifying questions (Supabase status, extra packages, testing tools,
   CLAUDE.md location, duplicate story files, Node version, linked issue). We answered and approved
   the plan before any code was written.
3. The agent worked in small commits on `chore/project-setup` and ran lint, tests and build.

### What the agent produced
- Next.js 16 app (App Router, `src/`, TypeScript, Tailwind, ESLint) with a placeholder home page
- Supabase browser and server clients in `src/lib/supabase/`, plus a settings check with a clear
  error message when keys are missing
- Vitest + React Testing Library with 6 passing tests
- `.env.example`, a stricter `.gitignore`, Node 24 LTS pinned via `.nvmrc` and `engines`
- `docs/supabase-setup.md` beginner guide, updated README and CLAUDE.md
- Removed 14 duplicate user story files; moved CLAUDE.md into the repo

### What was corrected along the way
- **Supabase key type:** the plan said "anon key". While writing the setup guide, the agent checked
  Supabase's docs and found the legacy anon key is being retired by the end of 2026. It switched to
  the newer **publishable key** and updated CLAUDE.md.
- **Test plugin:** the Next.js guide uses `vite-tsconfig-paths`, but Vitest warned that Vite now
  supports `@/` paths natively. The agent removed the extra dependency.
- **Node version:** Vercel's default is now Node 26, but we chose Node 24 LTS for the widest
  compatibility across team laptops and libraries.
- *Team review:* add anything the reviewer changes here.

### What we learned
- Ask the agent to plan and ask questions first. Its questions found problems we had not noticed
  (CLAUDE.md outside the repo, duplicate story files).
- AI knowledge can be out of date. Checking official docs (Vercel, Supabase, the Next.js docs
  bundled in `node_modules`) caught two outdated assumptions.
- The publishable key is safe to be public. Real security comes from Row Level Security rules.

### Still uncertain / follow-ups
- Supabase project not created yet (see `docs/supabase-setup.md`).
- 7 moderate `npm audit` warnings in ESLint's dev-only tooling; no fix available until
  `eslint-config-next` updates. They do not affect the deployed app.
- PWA setup is still to be decided.

---

## 2026-11-15: US01 View menu and available items (feature/us01-menu, issue #1)

**Agent:** Claude Code (Claude Opus 5.5)
**Team member:** Pravein (Developer 1)

### Task
Show the current menu with prices and "Sold out" labels, with a clear error and retry state, using
real data from Supabase.

### Prompt / approach
1. Asked the agent to explain US01 and propose a plan before coding.
2. The agent asked about the Supabase project, menu fields, how sold-out items should behave and
   which menu data to use. We gave it the owner's Google Form menu and decided:
   - real menu (owner approved), items without a price left out
   - names tidied (capital letters only), English interface text
   - sold-out items show a label and no add button
3. We created the Supabase project ourselves using `docs/supabase-setup.md`, and ran the SQL files
   in the dashboard. The agent never had the database password or secret key.

### What the agent produced
- SQL: `menu_categories` and `menu_items` tables (prices in sen, unique item codes), read-only Row
  Level Security for guests, and a seed of the 25 priced items from the Google Form
- `formatRinggit` (sen to "RM14.90"), `getMenu` (loads and orders the menu)
- `MenuItemCard`, `MenuList`, `MenuSkeleton`, the menu home page and `error.tsx` with Try again
- 24 passing tests, including one or more for each acceptance criterion

### Verification
- Guest key can read 25 items; a guest attempt to change a price was blocked by RLS.
- At 375px: real menu in 5 sections, no horizontal scroll, no console errors, light and dark mode.
- Error state seen for real (before the tables existed). Sold out seen for real by setting M3
  `is_available = false` in the Table Editor.
- Empty state is covered by an automated test only.

### What was corrected along the way
- The agent first said 27 seed items; the real count is 25 (its counting mistake, no item missing).
- The agent's SQL instructions were buried in a long message and we missed them. Lesson for us
  and the agent: put actions the human must take at the end, as clear numbered steps.
- Crossed-out prices on sold-out items looked like a discount, so they are greyed out instead.
- An old test server was still holding the port, so the first manual check showed the old page.
- *Team review:* add anything the reviewer changes here.

### What we learned
- Security rules (RLS) are enforced by the database, so even someone using the public key
  directly cannot edit the menu.
- Next.js 16 caches pages by default. Reading the menu inside `<Suspense>` with the
  cookie-based Supabase client keeps it fresh, so "Sold out" changes appear on the next reload.

### Still uncertain / follow-ups
- Prices for the sold-out items left out (M10, M11, M13, M15, M16, N2, S3, AK1-4, SM1-4).
- Until US09, the owner or staff must mark items sold out in the Supabase Table Editor.
- Whether "Add On" items can be ordered alone is a business rule to settle in US02.
