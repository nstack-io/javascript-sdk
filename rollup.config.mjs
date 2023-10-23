import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import pkg from "./package.json" assert { type: "json" };

export default [
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "esm" },
    ],
    plugins: [del({ targets: ["dist/*"] }), typescript()],
    external: Object.keys(pkg.peerDependencies || {}),
  },

  {
    input: "src/scripts/sync-translation.ts",
    output: [
      { file: "dist/sync-translation.js", format: "esm" },
    ],
    plugins: [typescript()],
  },
];
