export function hasPreview(miniApp: string | undefined) {
  // Any lab with a mini app has a preview.
  return miniApp !== undefined;
}
