import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/smoke.test.ts"],
    exclude: ["node_modules", "dist", ".worktrees"],
    testTimeout: 30_000,
  },
});
