// Consumer-facing setter for the asset base path used to fetch the lab's
// runtime assets (datasets and UI images).
//
// The function writes a single property on the shared page global. The
// runtime asset loaders read it back to build `<path>datasets/<file>` and
// `<path>images/<file>` URLs against wherever the consumer serves them
// (dashboard: a media-skins path); see `getAssetPath` / `imageUrl` below and
// the dataset loaders in `index.tsx` / `SelectDataset.tsx`.
//
// Ordering: the value is consumed lazily — at `initAll(...)` time and on
// render / user dataset selection — not at module-evaluation time, so simply
// call this before `initAll(...)`.
export const setAssetPath = (path: string): void => {
  (
    global as unknown as Record<string, unknown>
  ).__ml_playground_asset_public_path__ = path;
};

// Read the base path back. Empty string if the consumer never set it, in which
// case URLs resolve relative to the host page.
export const getAssetPath = (): string =>
  (global as unknown as Record<string, string | undefined>)
    .__ml_playground_asset_public_path__ ?? '';

// Runtime URL for a bundled UI image. The host serves the `images/` tree
// (emitted to `dist/assets/images/`) under the same base as the datasets.
export const imageUrl = (relativePath: string): string =>
  getAssetPath() + 'images/' + relativePath;
