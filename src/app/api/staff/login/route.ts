import { SupabaseConfigError } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isStaffUser } from "@/lib/staff-orders";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a valid email and password." }, { status: 400, headers: noStore });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.password
  ) {
    return Response.json({ error: "Enter a valid email and password." }, { status: 400, headers: noStore });
  }

  try {
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: body.email.trim(),
      password: body.password,
    });

    if (error || !data.user) {
      return Response.json({ error: "Email or password is incorrect." }, { status: 401, headers: noStore });
    }

    if (!isStaffUser(data.user)) {
      await client.auth.signOut();
      return Response.json({ error: "This account is not authorized for staff access." }, { status: 403, headers: noStore });
    }

    return Response.json({ ok: true }, { headers: noStore });
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return Response.json(
        { error: "Staff sign-in is unavailable because the database is not configured." },
        { status: 503, headers: noStore },
      );
    }
    throw error;
  }
}
