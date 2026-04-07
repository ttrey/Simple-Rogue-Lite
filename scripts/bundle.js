const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "..", "renderer.jsx")],
    bundle: true,
    outfile: path.join(__dirname, "..", "dist", "renderer.js"),
    format: "iife",
    platform: "browser",
    target: ["chrome138"],
    jsx: "automatic",
    loader: {
      ".js": "jsx",
      ".jsx": "jsx",
    },
    logLevel: "info",
  })
  .catch(() => process.exit(1));
