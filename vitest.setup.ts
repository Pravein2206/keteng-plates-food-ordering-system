// Runs before every test file: after each test, remove rendered components and
// clear the saved cart, so one test never leaks into the next.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
