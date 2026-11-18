// Runs before every test file: removes rendered components after each test
// so one test's screen never leaks into the next.
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
