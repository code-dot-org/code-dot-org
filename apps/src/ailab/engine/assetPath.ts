// Base path for the lab's runtime assets (datasets + UI images). The consumer
// supplies it via `mount({assetPath})`, which calls `setAssetPath`. Held as a
// module singleton and read back lazily — at mount/loadLevel time and on
// render / user dataset selection — to build
// `<path>datasets/<file>` and `<path>images/<file>` URLs against wherever the
// consumer serves them (dashboard: a media-skins path).

let assetPath = '';

export const setAssetPath = (path: string): void => {
  assetPath = path;
};

// Empty string if the consumer never set it, in which case URLs resolve
// relative to the host page.
export const getAssetPath = (): string => assetPath;

// Runtime URL for a bundled UI image. The host serves the `images/` tree
// (emitted to `dist/assets/images/`) under the same base as the datasets.
export const imageUrl = (relativePath: string): string =>
  getAssetPath() + 'images/' + relativePath;
