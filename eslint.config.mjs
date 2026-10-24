import js from "@eslint/js";
import ts from "typescript-eslint";

export default ts.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/.expo/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        Deno: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        AbortController: "readonly",
        URL: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
