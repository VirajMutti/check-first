import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests run in plain Node — the rules engine has no browser dependencies.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: { include: ["lib/**/*.test.ts"] },
});
