// Vitest setup, based on the official Next.js guide (Vitest + React Testing Library).
// resolve.tsconfigPaths lets tests use the same "@/..." imports as the app.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
