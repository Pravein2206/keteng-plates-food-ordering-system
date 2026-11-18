# Supabase setup guide

A beginner's guide to connecting the app to Supabase. It takes about 15 minutes.

## What Supabase is (in one paragraph)

Supabase gives us a hosted **Postgres database**, **login for staff**, and **file storage** for
payment receipts, all managed from a website dashboard. Our Next.js app talks to it using two values:
the **Project URL** and the **publishable key**. Security comes from **Row Level Security (RLS)**
rules written in the database, not from hiding the key. The publishable key is designed to be public.

## Part 1: one person creates the project

Only one teammate does this part (suggested: the Scrum Master).

1. Go to [supabase.com](https://supabase.com) and sign up. Signing in with GitHub is the easiest.
2. Create an **organization** (e.g. `G07 SLURPEE`) on the **Free** plan.
3. Click **New project**:
   - **Name:** `keteng-plates-dev`
   - **Database password:** click *Generate*, then save it in a password manager. Do not post it in
     WhatsApp, GitHub or chat. We rarely need it, but it cannot be shown again.
   - **Region:** **Southeast Asia (Singapore)**. This is the closest region to Malaysia, so the app
     responds faster.
   - Leave the other options at their defaults. Keep any Row Level Security option **on**.
4. Wait a minute or two for the project to start.
5. Invite the team: **Organization settings > Team > Invite**, using each member's email.

## Part 2: everyone connects their own laptop

Each teammate does this once.

1. In the dashboard, open the project, then **Project Settings > API Keys** (the **Connect** button at
   the top also shows these values).
2. Copy two values:
   - **Project URL**, e.g. `https://abcdefgh.supabase.co`
   - **Publishable key**, starting with `sb_publishable_`
3. In the project folder, copy the template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

4. Restart `npm run dev` so Next.js picks up the new values.

`.env.local` is ignored by git, so it never reaches GitHub.

## Rules that keep us safe

- **Never** use the **secret key** (`sb_secret_...`) or the legacy **service_role** key in this app.
  They bypass all security rules. If one is ever committed or shared, rotate it in the dashboard
  straight away.
- Supabase is retiring the legacy **anon** key. Use the **publishable** key instead.
- **Every table must have RLS enabled** with explicit rules (see CLAUDE.md, *Security and Privacy*).
- Use **synthetic test data only** until the owner approves the real menu. Never put real customer
  names, phone numbers or addresses in this project.

## How we will change the database

For now we skip the Supabase CLI and Docker. They are useful but add setup work we do not need yet.

1. Write each change as a numbered SQL file in `supabase/migrations/`, e.g.
   `0001_create_menu_items.sql`, and commit it with the feature.
2. After the PR is reviewed, paste the SQL into the dashboard's **SQL Editor** and run it.

This keeps every schema change reviewed and in git. We can switch to the Supabase CLI later
without rewriting anything.

### US04 order submission and staff access

After review, run `supabase/migrations/0004_create_orders.sql` in the SQL Editor after migrations
0001–0003. The migration seeds the four current delivery batches into `delivery_batches`, creates
the order tables, enables Row Level Security, and grants guests read-only access to batch settings
and access to the order-submission function. Customer names, phone numbers, addresses and order
items are readable only by authenticated users whose trusted `app_metadata.role` is `staff`.

The checkout page and the database submission function both use `delivery_batches` as the source
for batch labels, enabled status and optional cut-offs. A project admin may update those rows after
the restaurant confirms the schedule. Cut-off dates and times are Malaysia local time; leave both
cut-off columns empty until a cut-off is confirmed.

Create staff accounts through the Supabase Auth admin workflow. Assign `role: "staff"` in the
account's **app metadata** using a trusted admin environment; never put the role in user-editable
metadata, add a staff signup form, or expose a service-role key in the app. A normal customer
account must not be assigned the staff role.

The customer order form submits without a payment status. Payment remains manual and is not
confirmed or marked paid by this feature. Orders use database menu prices and the configured RM2
delivery fee. Configure and verify the Supabase project before accepting real customer orders.

## Good to know

- **Free projects pause after about a week with no activity.** Restoring takes one click in the
  dashboard, but check that the project is awake before any owner demo.
- **Vercel:** when the app is deployed, add the same two variables under
  *Vercel project > Settings > Environment Variables*.
- If the app shows **"Supabase is not configured"**, one of the two values in `.env.local` is
  missing or empty.
