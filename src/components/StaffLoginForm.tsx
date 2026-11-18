"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClass =
  "mt-1 min-h-12 w-full rounded-xl border border-[#d8d0c3] bg-[#fbf8f2] px-3 text-base text-[#18352b] placeholder:text-[#9a9f99]";

export function StaffLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Could not sign in. Please try again.");
        return;
      }

      router.replace("/staff/orders");
      router.refresh();
    } catch {
      setError("Could not reach the sign-in service. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
      <div>
        <label htmlFor="staff-email" className="font-semibold text-[#18352b]">
          Email
        </label>
        <input
          id="staff-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="staff-password" className="font-semibold text-[#18352b]">
          Password
        </label>
        <input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>
      {error ? (
        <p role="alert" className="rounded-xl border border-[#efc8b7] bg-[#fff0e5] p-3 text-sm text-[#8b3f22]">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 rounded-xl bg-[#1d5b45] px-5 font-semibold text-white hover:bg-[#143f31] disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
