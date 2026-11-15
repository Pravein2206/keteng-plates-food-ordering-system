# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.
Items marked **[confirm]** are team decisions that are not final yet. Ask before relying on them.

## Project Context

This repo is the **Keteng Plates Order & Delivery System**, a mobile-friendly PWA for a real food
business (Bonda Keteng Enterprise). It is a university project (Group G07 SLURPEE) with a real
stakeholder. It replaces their current Google Form + WhatsApp + manual bank-transfer checking.

The MVP lets a guest customer browse the menu, build a cart, choose a delivery batch, and submit an
order. Staff then review payment receipts, see kitchen totals, group deliveries and update menu
availability. The owner reports 80-150 orders per day, so speed and accuracy matter.

All work should prioritise **usefulness, correctness and real-world fit for the owner** over
cleverness.

## About the Team

- Student developers learning as they build. Explain non-obvious decisions briefly.
- Roles: Mutallib (Scrum Master / Product Owner), Pravein (Developer 1), Fathurrahman (Developer 2),
  Haiqal (Developer 3).
- Humans own the final decisions. Every merged change must be reviewed and understood by the team.

## Communication Style

- Plain, clear English. Short paragraphs. No corporate jargon.
- Explain concepts as if speaking to an intelligent beginner.
- Prefer practical examples over theory.
- Be concise. Do not add filler.

## Rules

- **Always ask clarifying questions before starting any complex task** (at least three if the task is
  non-trivial and the requirements are not fully clear).
- **Always present a written plan and wait for approval before any multi-step task.**
- Never assume business rules (prices, fees, batches, payment policy). If it is not in the user
  stories, ask.
- Stay inside the scope of the current story. Do not add features that were not requested.
- When several approaches exist, explain the trade-offs and recommend one.
- If uncertain, ask before proceeding.
- Review your own output (tests, lint, acceptance criteria) before saying it is done.
- Report test results honestly, including failures.

## Source of Truth

- User stories and acceptance criteria are in `us01.md` ... `us16.md` in the **repo root**. Planning
  documents (backlog, slides, report) are in `docs/`. **Read the relevant story file before
  implementing anything.**
- If code and a story disagree, or a story is unclear, stop and ask.

## Current Scope

**Sprint 1 (9-20 Nov 2026): US01-US04**

| Story | What |
| --- | --- |
| US01 | Menu with prices and "Sold out" labels, with an error and retry state |
| US02 | Cart with quantities, total = sum(price x quantity) + RM2 delivery fee (applied once) |
| US03 | Choose an open delivery batch and enter the delivery location |
| US04 | Submit the order, get a reference, order appears in a restricted staff queue |

Sprint 1 is **delivery-only**. Later stories (US05-US11) come in later sprints. US12-US16 are out of
scope unless the team says otherwise.

## Business Rules

- Currency is Malaysian Ringgit (RM).
- Delivery fee is a flat **RM2 per delivery order, added once**. Example: RM15 + RM8 + RM2 = RM25.
- There are **four delivery batches**. Customers can only pick an open one.
- Sold-out items cannot be added to a cart.
- Customers are guests (no account required to order).
- Empty carts and zero or invalid quantities are rejected.
- **Payment:** the MVP uses existing DuitNow QR / bank transfer. Customers upload a receipt and staff
  review it manually (US05, Sprint 2). Automatic payment confirmation (US12) is deferred. It depends
  on a bank/provider API, fees and owner approval, and none of those are confirmed. Do not build
  payment integration unless the team approves it **[confirm]**.

## Tech Stack

Agreed by the team:

- Framework: **Next.js** (frontend + server) with **TypeScript**
- Styling: **Tailwind CSS** (responsive, mobile-first)
- Database and staff authentication: **Supabase** (Postgres, Row Level Security, Storage for receipts)
- Deployment: **Vercel** (preview deployments for each PR)
- Version control and Agile tracking: **GitHub** (branches, PRs, Issues, project board)
- Testing: **Vitest + React Testing Library** (`npm test`)
- Runtime: **Node.js 24 LTS** (pinned in `.nvmrc` and `package.json` engines)

Still to decide **[confirm]**: PWA setup.

Do not add major dependencies or change tools without asking.

This project uses **Next.js 16**, which differs from older versions. See @AGENTS.md: read the docs
bundled in `node_modules/next/dist/docs/` before writing Next.js code. Supabase setup steps are in
`docs/supabase-setup.md`.

## Folder Structure

```
/              user stories (us01.md ... us16.md), README, CLAUDE.md, AGENTS.md
/docs          planning documents, Supabase setup guide, AI usage log
/src
  /app         Next.js routes (customer pages and protected staff pages)
  /components  reusable UI
  /lib         helpers (e.g. price calculation)
    /supabase  client.ts (browser), server.ts (server), env.ts (settings check)
  /types
/supabase
  /migrations  SQL schema, RLS policies, seed data (numbered .sql files)
```

Tests sit next to the code they test, named `*.test.ts` / `*.test.tsx`.

## File Naming Rules

- Lowercase file and folder names, hyphens instead of spaces, descriptive names, no special
  characters. React component files may use PascalCase (e.g. `MenuItem.tsx`).
- Examples: `menu-api.ts`, `cart-total.test.ts`, `us01-menu-wireframe.md`.

## Workflow: Implementing a User Story

Follow these steps in order. Never skip planning.

1. **Understand the objective.** Read the story file and restate the acceptance criteria.
2. **Ask clarifying questions** if anything is missing or ambiguous.
3. **Create a plan** (files to change, approach, risks) and **wait for approval**.
4. **Execute step by step** on its own branch, in small commits.
5. **Test.** Write or update tests for each acceptance criterion, especially totals and sold-out
   behaviour. Run them.
6. **Review.** Check the result against the acceptance criteria and the checklist in
   `.github/pull_request_template.md`. Fix weak areas.
7. **Deliver.** Summarise what changed, what was tested and what is still uncertain. Open a PR with
   `Closes #<issue-number>`.

Never prioritise speed over quality. If a task is blocked or unclear, stop and ask.

## Coding Conventions

- Mobile-first. Check layouts at roughly 360-430px wide.
- Money is stored and calculated as **integer sen** (RM1 = 100 sen), never floats. Format only for
  display.
- Keep price and total calculation in **one tested function** in `src/lib/`. The database is the
  source of truth for the final order total. Never trust a total sent by the browser.
- Every data fetch needs a loading state, an error state with retry, and an empty state.
- Small components, descriptive names, no dead code or leftover `console.log`.
- Basic accessibility: labelled inputs, readable contrast, tap targets large enough for phones.

## Security and Privacy

This app handles names, phone numbers, delivery addresses and payment receipts. Treat all of it as
personal data.

- **Never commit secrets.** No `.env` files or keys. Use `.env.example` with empty values.
- Only the Supabase **publishable** key (`sb_publishable_...`, the replacement for the legacy anon key)
  may appear in browser code. The **secret / service-role key must never be in frontend code.**
- Enable Row Level Security on every table. Guests can create orders and read only their own order by
  reference. Only authenticated staff can see the full queue or edit menu data.
- **Menu data:** the owner approved using the menu and prices from their Google Form
  (seeded in `supabase/migrations/0002_seed_menu.sql`). Confirm any menu or price change with the
  owner. Tests still use **synthetic** items, never real customer data.
- Never put real customer data in tests, screenshots, issues or PRs.

## Git Workflow

- Branches: `feature/usXX-name`, `bugfix/usXX-name`, `chore/task-name`.
- Never push directly to `main`. Open small, focused PRs. One human reviewer must approve.
- Keep commits small with clear messages. Do not mix unrelated changes.

## Success Criteria

A good result is:

- Correct against the story's acceptance criteria
- Tested, with honest test results
- Simple and easy for a student teammate to understand
- Safe with personal data
- Within the agreed scope

## AI Usage Log

Our lecturer expects an agentic workflow. After each task, add an entry to `docs/ai-usage-log.md`:
the task, the prompt or approach, what the agent produced, what we corrected, and what we learned.
