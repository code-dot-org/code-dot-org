// Consumer-facing setter for the ml-playground asset base path.
//
// The function writes a single property on the shared page global,
// which the main bundle reads at startup (see `setPublicPath.ts`) to
// assign webpack's `__webpack_public_path__`. That assignment is what
// controls image and chunk URLs at runtime.
//
// Ordering: call this BEFORE the ml-playground main bundle is loaded
// (i.e. before `require('@code-dot-org/ml-playground')` or any import
// that resolves through the main entry). Asset URLs are computed when
// each asset module first evaluates, so a late call can't retroactively
// rewrite them. The natural CommonJS pattern (`setAssetPath(...); const
// ml = require('@code-dot-org/ml-playground'); ...`) is correct;
// pure-ESM consumers should call this then `await import(...)` the
// main entry.
//
// No module-init side effect on purpose — the fallback for "consumer
// never set it" lives in `setPublicPath.ts` as `|| './'`, so there's
// one place to look when chasing publicPath behavior.
export const setAssetPath = (path: string): void => {
  (
    global as unknown as Record<string, unknown>
  ).__ml_playground_asset_public_path__ = path;
};
