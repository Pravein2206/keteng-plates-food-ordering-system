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
