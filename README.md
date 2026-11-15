# Keteng Plates Order & Delivery System

A mobile-friendly PWA for food ordering, order tracking, and restaurant operations for Keteng Plates.

## Project summary
This project supports a partner food business with a lightweight online ordering flow, customer visibility of order/payment status, and staff-side tools for kitchen preparation and dispatch coordination. The product is planned around a guest ordering journey, protected staff operations, and a later community/adoption expansion path.

## Team and roles
- Mutallib Afsahov — Scrum Master cum Product Owner
- Pravein A/L Letchumanan — Developer 1
- Fathurrahman Hakim bin Suliman — Developer 2
- Muhammad Haiqal Razeeq bin Mohd Zaidi — Developer 3

## Tech stack
- Framework: Next.js 16 (App Router) with TypeScript
- Styling: Tailwind CSS (mobile-first)
- Database, staff login and receipt storage: Supabase (Postgres with Row Level Security)
- Tests: Vitest + React Testing Library
- Hosting: Vercel
- Runtime: Node.js 24 LTS
- Payment and notifications: to be confirmed with partner approval

## How to run locally
1. Install **Node.js 24 LTS**. The version is pinned in `.nvmrc`. If you use a version manager
   such as `nvm-windows` or `fnm`, run `nvm use` / `fnm use` inside the project folder.
2. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

3. Create your local settings file and fill in the Supabase values
   (see [docs/supabase-setup.md](docs/supabase-setup.md)):

   ```bash
   cp .env.example .env.local
   ```

   The app still starts without these values. Pages that need data will show a clear
   "Supabase is not configured" error until they are filled in.

4. Start the app and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app locally with live reload |
| `npm test` | Run all tests once |
| `npm run test:watch` | Re-run tests whenever you save a file |
| `npm run lint` | Check code for common mistakes |
| `npm run build` | Build for production (also type-checks) |

## Project layout
- `us01.md` ... `us16.md`: user stories and acceptance criteria
- `docs/`: planning documents, Supabase setup guide, AI usage log
- `src/app/`: pages (Next.js routes)
- `src/components/`: reusable UI
- `src/lib/`: Supabase clients and helpers
- `supabase/migrations/`: database schema as SQL files

## Project status
Sprint 1 (US01–US04): the project scaffold is in place, and the menu, cart, delivery batch and
order submission are next.
