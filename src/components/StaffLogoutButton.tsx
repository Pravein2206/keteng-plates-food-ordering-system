"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StaffLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function signOut() {
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/staff/logout", { method: "POST" });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Could not sign out. Please try again.");
        return;
      }
      router.replace("/staff/login");
      router.refresh();
    } catch {
      setError("Could not reach the sign-out service. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={signOut}
        disabled={submitting}
        className="min-h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {submitting ? "Signing out…" : "Sign out"}
      </button>
      {error ? (
        <p role="alert" className="max-w-48 text-right text-xs text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
