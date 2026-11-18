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

---

## 2026-11-15: US02 Cart totals and delivery fee (feature/us02-cart, issue #2)

**Agent:** Claude Code (Claude Opus 5.5)
**Team member:** Pravein (Developer 1)

### Task
Let customers add available items, change quantities, and see item totals plus the RM2 delivery
fee charged once. Block checkout for an empty cart or invalid quantities.

### Prompt / approach
1. Asked the agent to explain US02 and propose a plan first. It asked six questions.
2. Decisions we made:
   - save the cart on the phone (localStorage) and drop it after 24 hours; we asked for the pros
     and cons of each option before choosing
   - no maximum quantity until the owner decides
   - pressing − at 1 removes the item
   - `/checkout` is a placeholder until US03
   - items that sell out while in a cart are flagged and block checkout
   - add-ons need at least one **main** dish; drinks can be ordered alone
3. Unconfirmed business rules went into GitHub issue #19 ("Questions for the owner").
4. We changed the plan once: first the agent let drinks count as a main for add-ons; we said
   add-ons need a real main dish, so it switched from a yes/no add-on flag to section types
   (`main`, `add_on`, `drink`).

### What the agent produced
- `0003_category_kinds.sql`: section type per menu section (we ran it in the SQL Editor)
- `cart-total.ts`: the single tested total function (integer sen, RM2 once, rejects empty carts
  and zero/negative/decimal quantities)
- `cart.ts` (rules), `cart-storage.ts` (save/load with 24-hour expiry), `cart-store.ts` +
  `CartProvider` (shared cart)
- Add button and − 1 + stepper, sticky cart bar, `/cart` page, `/checkout` placeholder
- 80 passing tests

### Verification (375px, real Supabase menu)
- M1 + M4: cart bar and cart page both show RM25.00 (the story's example).
- Cart survived a page reload; only item ids and quantities are saved.
- + on the cart page updated the line (2 × RM8.00) and the total (RM33.00).
- Checkout rules with real items: add-ons only and add-on + drink blocked; drinks only and
  main + add-on allowed; sold-out M3 flagged; empty cart blocked.
- No horizontal scroll, no console errors.

### What was corrected along the way
- A one-off command used `python`, which on Windows opened the Microsoft Store and hung. The agent
  stopped it and used its file-editing tool instead.
- During the manual check, pages got stuck on "Loading menu…". The agent tested and ruled out its
  first guess (the cart storage) and found the real cause: the Browser pane in the Claude app was
  hidden, so the browser paused the animation timer React uses to show streamed content. Not an
  app bug; it worked as soon as the pane was visible. Lesson: keep the preview visible while
  testing, and test a hypothesis before "fixing" code.
- Stopping a background server task did not always stop the Node process holding the port; the
  agent now checks the port and stops only its own Next.js process.
- *Team review:* add anything the reviewer changes here.

### What we learned
- Keeping money in whole sen and in one function makes totals easy to test (e.g. RM25 example).
- Unconfirmed business rules should be written down (issue #19) and coded so they are easy to
  change: here, section types live in the database, not in the code.
- The cart total is for display only. In US04 the server must recalculate it from database
  prices.

### Still uncertain / follow-ups
- Max quantity per item, add-ons alone and drinks alone: waiting for the owner (issue #19).
- `/checkout` is reachable by typing the URL even with an empty cart; US03 must guard it.
- The cart is cleared after an order is placed in US04 (not yet built).

---

## 2026-11-18: US03 Delivery details and checkout (feature/us03-delivery)

**Agent:** GitHub Copilot

### Task
Implement the US03 delivery-details stage and connect it to the US02 cart without building US04 order submission or payment verification.

### Prompt / approach
1. Read `us03.md`, inspected the latest `origin/feature/us02-cart` commit (`d6a85d1`) and its cart provider, cart rules, prices and checkout placeholder.
2. Used the current clean, isolated worktree for `feature/us03-delivery`, based on that US02 commit. No existing teammate worktree or branch was changed.
3. Kept delivery-batch names configurable and did not invent delivery times or cut-offs. Unconfigured batches are selectable, with a visible notice that owner confirmation is pending.
4. Read the Next.js 16 App Router guidance bundled in `node_modules/next/dist/docs/` before writing the checkout UI.

### What the agent produced
- A responsive checkout form for name, Malaysian phone, address and one of four delivery batches, with field validation and a review summary.
- Configurable batch enablement and cut-offs evaluated in `Asia/Kuala_Lumpur`, including an exact close-at-cut-off boundary.
- A typed `CheckoutData` contract containing validated delivery details and item IDs/quantities. It excludes totals so US04 must recalculate from database prices.
- Checkout cart guards, fresh menu prices/availability, one RM2 delivery charge, and localStorage-backed cart preservation when returning to the cart.
- Focused validation, batch-schedule and checkout tests.

### Verification
- `npm test`: 100 tests passed across 14 files.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: Next.js compilation and TypeScript passed; prerendering then stopped because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are not configured locally. No `.env.local` or credentials were added.
- The installed runtime was Node 26.13.1 rather than the repository's required Node 24, so npm reported an engine warning.

### What was corrected along the way
- Checkout now rejects whitespace-only names and addresses, validates Malaysian phone formats, and re-checks batch availability when details are reviewed.
- The checkout review state explicitly says order submission is not available yet and that no order has been saved.

### What we learned
- Reusing the existing cart store and single total function preserves quantities and avoids charging the delivery fee twice.
- Cut-offs can be represented as Malaysia-local dates/times, so the app does not depend on the customer's device timezone or invent schedules.

### Still uncertain / follow-ups
- The restaurant owner must confirm delivery schedules, cut-offs and batch availability before those settings are configured for real ordering.
- US04 must accept `CheckoutData`, revalidate item IDs and quantities, recalculate the total from current database prices and persist the order. The checkout does not submit or save an order.
- Configure local Supabase publishable settings and use Node 24 to verify the production build in the project runtime.

---

## 2026-11-18: US04 Order submission and staff queue (feature/us04-orders)

**Agent:** GitHub Copilot

### Task
Implement US04 on an isolated branch based on the latest `origin/feature/us03-delivery`, with
idempotent order submission, success-only confirmation, private staff access, and no payment
automation.

### Prompt / approach
1. Read `us04.md`, the US02/US03 checkout and cart implementation, existing Supabase migrations,
   and the Next.js 16 Route Handler, Proxy, authentication and data-security guides bundled with
   the installed Next.js package.
2. Refreshed `origin/feature/us03-delivery` and verified the exact `feature/us04-orders` branch
   starts at its tip. No files on another branch were changed.
3. Keep customer submission on a server endpoint and use a database function for atomic,
   idempotent persistence and current menu price calculation. Restrict queue reads using trusted
   staff app metadata and RLS.

### What the agent produced
- An order schema, private staff-only read policies, and a fixed-search-path `SECURITY DEFINER`
  function that uses current database prices, adds the existing RM2 fee once, and returns the
  same reference for a repeated matching idempotency key.
- A `delivery_batches` table seeded with the existing four settings. Both server validation and
  the database function enforce enabled status and Malaysia-local cut-offs, using current labels
  rather than duplicated hardcoded values.
- Server validation and persistence handling, checkout retry behavior, and a confirmation shown
  only after a saved-order result is returned.
- Staff sign-in, session refresh, protected order queue, and sign-out.
- Focused tests for successful, failed and duplicate submissions, staff authorization, and the
  confirmation/retry behavior.

### What was corrected along the way
- The generated branch name initially did not match the requested exact name. A separate exact
  branch was created from the freshly fetched origin tip before any files were edited.
- A correctness review found hardcoded batch labels and no database-side cut-off check. The
  migration now stores the existing settings in `delivery_batches`, and the checkout, API and RPC
  all use that table; no new schedules were invented.
- *Team review:* add anything the reviewer changes here.

### What we learned
- Database uniqueness plus a payload comparison is needed for reliable idempotency; client-side
  button disabling alone cannot prevent duplicate orders after network retries.
- A staff page check is not sufficient by itself. Order-table RLS independently checks trusted
  app metadata before returning customer details.

### Verification
- `npm test`: 111 tests passed across 17 files.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed after Next.js generated its route/layout types.
- `npm run build`: compilation and TypeScript passed; prerendering stopped because
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are not configured.
- The available runtime was Node 26.13.1 rather than the repository's required Node 24, so npm
  reported an engine warning.

### Still uncertain / follow-ups
- No Supabase credentials were available, so the migration, RPC grants/RLS, staff metadata
  provisioning, live insert/retry behavior, and live staff queue could not be exercised.
- The restaurant owner must still confirm delivery batch schedules and cut-offs. The code reuses
  current configured batch availability and does not invent times or payment rules.
