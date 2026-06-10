/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  overrides: [
    {
      // Enforce the Edge/Node boundary: middleware.ts must never import Node-only modules.
      files: ["middleware.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "openid-client",
                message:
                  "middleware.ts runs on Vercel Edge — importing openid-client (Node-only) will break the edge bundle. Use lib/session-edge.ts (jose) instead.",
              },
            ],
            patterns: [
              {
                group: ["**/lib/oauth-node", "**/lib/oauth-node.ts"],
                message:
                  "middleware.ts runs on Vercel Edge — lib/oauth-node.ts is NODE-ONLY. Use lib/session-edge.ts instead.",
              },
            ],
          },
        ],
      },
    },
  ],
};
