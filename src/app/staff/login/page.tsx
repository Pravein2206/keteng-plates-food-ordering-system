import Link from "next/link";
import { StaffLoginForm } from "@/components/StaffLoginForm";

export default function StaffLoginPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <div className="absolute inset-x-4 top-8 -z-10 h-72 rounded-[2.5rem] bg-[#f5e6d4] sm:inset-x-16" aria-hidden="true" />
      <section className="w-full max-w-md rounded-3xl border border-[#e6dfd3] bg-white p-6 shadow-[0_20px_60px_rgba(20,63,49,0.12)] sm:p-8">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[#1d5b45] hover:bg-[#f3efe7]">
          ← <span className="ml-2">Back to menu</span>
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#e87932]">Team access</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#143f31]">Staff sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[#627269]">
          Sign in with an account that has staff access.
        </p>
        <StaffLoginForm />
      </section>
    </main>
  );
}
