import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "next/app": path.resolve(__dirname, "node_modules/vinext/dist/shims/app"),
      "next/compat/router": path.resolve(__dirname, "node_modules/vinext/dist/shims/compat-router"),
      "next/document": path.resolve(__dirname, "node_modules/vinext/dist/shims/document"),
      "next/head": path.resolve(__dirname, "node_modules/vinext/dist/shims/head"),
      "next/link": path.resolve(__dirname, "node_modules/vinext/dist/shims/link"),
      "next/router": path.resolve(__dirname, "node_modules/vinext/dist/shims/router"),
      "next/navigation": path.resolve(__dirname, "node_modules/vinext/dist/shims/navigation"),
      "next/image": path.resolve(__dirname, "node_modules/vinext/dist/shims/image"),
      "next/dynamic": path.resolve(__dirname, "node_modules/vinext/dist/shims/dynamic"),
      "next/og": path.resolve(__dirname, "node_modules/vinext/dist/shims/og"),
      "next/font/google": path.resolve(__dirname, "node_modules/vinext/dist/shims/font-google"),
      "next/server": path.resolve(__dirname, "node_modules/vinext/dist/shims/server"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", "dist", ".worktrees", "tests/smoke.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules",
        "dist",
        ".worktrees",
        "**/*.test.ts",
        "**/*.test.tsx",
        "tests/**",
        "vitest.config.ts",
        "vite.config.ts",
        "next-env.d.ts",
        "env.d.ts",
        "app/**/opengraph-image.tsx",
      ],
    },
  },
});
