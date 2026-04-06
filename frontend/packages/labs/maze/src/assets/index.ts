// Eagerly import all skin assets as resolved URLs.
// Vite inlines files under assetsInlineLimit and emits larger ones as separate files.
const skinAssets = import.meta.glob<{default: string}>(
  './skins/**/*.{png,gif,mp3,ogg}',
  {eager: true},
);

/**
 * Resolves a skin asset path (e.g. "avatar.png") to a bundled URL.
 * Falls back to the legacy absolute path if the asset isn't found.
 */
export function resolveSkinAsset(skinId: string, filename: string): string {
  const key = `./skins/${skinId}/${filename}`;
  return skinAssets[key]?.default ?? `/skins/${skinId}/${filename}`;
}
