/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  overrides: [
    {
      // Boundary: middleware.ts is the session gate only — it must never pull
      // in the OAuth flow (or Node-only deps like the removed openid-client).
      files: ["middleware.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "openid-client",
                message:
                  "openid-client was removed (Node-only, breaks the Edge runtime). Do not reintroduce it — use lib/oauth.ts (fetch + jose + Web Crypto).",
              },
            ],
            patterns: [
              {
                group: ["**/lib/oauth*"],
                message:
                  "middleware.ts is the session gate only — it must not import the OAuth flow (lib/oauth.ts). Use lib/session-edge.ts instead.",
              },
            ],
          },
        ],
      },
    },
  ],
};
