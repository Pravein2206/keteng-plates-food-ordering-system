import Link from "next/link";
import { StaffLoginForm } from "@/components/StaffLoginForm";

export default function StaffLoginPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <Link href="/" className="text-sm font-medium underline underline-offset-4">
        ← Back to menu
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Staff sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sign in with an account that has staff access.
      </p>
      <StaffLoginForm />
    </main>
  );
}
