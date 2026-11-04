import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
  viteConfig,
  defineConfig({
    envDir: false,
    test: {
      // I test Deno richiedono il proprio runtime; .netlify contiene output generati.
      include: ["src/**/*.test.{js,jsx}", "tests/backend/**/*.test.mjs"],
    },
  }),
);
