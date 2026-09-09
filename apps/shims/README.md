# apps/shims

Shims for the rspack build (`yarn start --rspack`): small loaders that
reproduce babel behaviors the codebase depends on and swc has no options
for. `rspack.config.js` chains them into its loader pipeline; the
webpack build never loads them.

Each shim is unit-tested under `test/unit/`. When `apps/src` is fully
ESM, `add-module-exports-shim-loader.js` becomes deletable — see the
interop notes in its header comment.
