// Consumer-facing setter for the asset base path used to fetch datasets.
//
// The function writes a single property on the shared page global. The
// dataset loaders (`index.tsx`, `SelectDataset.tsx`) read it at runtime
// to build `<path>datasets/<file>` URLs against whatever location the
// consumer serves the datasets from (dashboard: a media-skins path). The
// UI images are inlined into the bundle, so they do not depend on this.
//
// Ordering: the value is consumed lazily — at `initAll(...)` time and on
// user dataset selection — not at module-evaluation time, so simply call
// this before `initAll(...)`.
export const setAssetPath = (path: string): void => {
  (
    global as unknown as Record<string, unknown>
  ).__ml_playground_asset_public_path__ = path;
};
