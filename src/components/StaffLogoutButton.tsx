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
        className="min-h-10 rounded-full border border-[#c5d5cb] px-4 text-sm font-semibold text-[#1d5b45] hover:bg-[#edf5ef] disabled:opacity-60"
      >
        {submitting ? "Signing out…" : "Sign out"}
      </button>
      {error ? (
        <p role="alert" className="max-w-48 text-right text-xs text-[#a94816]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
