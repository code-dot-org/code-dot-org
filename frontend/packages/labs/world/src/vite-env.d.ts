/// <reference types="vite/client" />

// The demo harness's build-time knobs. The library build reads neither: the
// studio host configures the sandbox and the asset bases through
// `runtime/worldConfig`, at runtime, as a host should.
interface ImportMetaEnv {
  /**
   * Where the sandbox is served from — an absolute URL, or the literal
   * `same-origin` for a deployment that serves the sandbox surfaces itself.
   *
   * Unset, a dev build falls back to the `dev:sandbox` port and a production
   * build configures nothing, which the preview reports rather than papering
   * over (see `src/main.tsx`, `specs/SANDBOX.md`).
   */
  readonly VITE_WORLD_SANDBOX?: string;

  /**
   * `free` to carry FontAwesome Free in the build itself, rather than loading
   * the design system's Pro from `dsco.code.org` — which answers CORS for
   * code.org origins only, so every icon is an empty box anywhere else. Set
   * from `WORLD_DEMO_ICONS` (vite.config.ts), which the asset script reads too.
   */
  readonly VITE_WORLD_ICONS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
