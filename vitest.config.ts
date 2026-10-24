import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: [
      "packages/shared/src/learning/**/*.test.ts",
      "packages/shared/src/*.test.ts",
      "apps/edge/supabase/functions/_shared/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: [
        "packages/shared/src/learning/engine.ts",
        "packages/shared/src/learning/storage.ts",
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
