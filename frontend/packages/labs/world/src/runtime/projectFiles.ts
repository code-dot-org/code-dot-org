// Flattens the Codebridge project (a `MultiFileSource` of files + nested
// folders) into the path-keyed `{path: contents}` map the compiler bundles.
// Adapted from web-lab's projectFiles.ts folder-path walking; World needs only
// the text map (the compiler resolves imports against it), not mime types.

import type {MultiFileSource} from '@code-dot-org/core/api';

/** The `folder/sub/` prefix a file sits under; '' at the project root. */
function folderPath(source: MultiFileSource, folderId: string): string {
  const segments: string[] = [];
  let current = source.folders[folderId];
  const seen = new Set<string>();
  // Guard against a malformed cycle rather than hanging.
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    segments.unshift(current.name);
    current = source.folders[current.parentId];
  }
  return segments.length ? `${segments.join('/')}/` : '';
}

/** Project as `path -> source text`, e.g. `worlds/main.world` -> "…". */
/**
 * One file's folder-prefixed path (`rules/gravity.rule`), or undefined if the
 * id is unknown. The same path {@link projectFiles} keys by, for a caller that
 * has an id rather than the whole map — the Blockly editor asking "which file
 * am I editing?".
 */
export function filePath(
  source: MultiFileSource,
  fileId: string,
): string | undefined {
  const file = source.files[fileId];
  return file && `${folderPath(source, file.folderId)}${file.name}`;
}

export function projectFiles(
  source: MultiFileSource | undefined,
): Record<string, string> {
  if (!source) {
    return {};
  }
  const files: Record<string, string> = {};
  for (const file of Object.values(source.files)) {
    // An image is bytes on a `url`, not text: its `contents` are empty, and an
    // empty module in the bundle is a module the compiler could be asked to
    // resolve. The driver gets those separately (projectAssets).
    if (file.url) {
      continue;
    }
    files[`${folderPath(source, file.folderId)}${file.name}`] = file.contents;
  }
  return files;
}

/**
 * The names of the images the project holds.
 *
 * An image is bytes on a `url`, not text, so it never appears in `projectFiles`
 * — but it is exactly what a `set sprite` block names and what the driver keys a
 * texture by, so the editor's registries need it alongside them.
 */
export function projectImageNames(
  source: MultiFileSource | undefined,
): string[] {
  if (!source) {
    return [];
  }
  return Object.values(source.files)
    .filter(file => file.url)
    .map(file => file.name);
}

/**
 * The same images, folder and all (`backgrounds/cave.png`).
 *
 * A name is what a block stores and what the driver keys a texture by, so
 * {@link projectImageNames} is what most of the lab wants. The editor's
 * dropdowns want more than that: which pool an image belongs to is its folder
 * and nothing else (`backgrounds/` versus `sprites/`, BACKGROUNDS.md §5), and a
 * bare name cannot answer that question.
 */
export function projectImagePaths(
  source: MultiFileSource | undefined,
): string[] {
  if (!source) {
    return [];
  }
  return Object.values(source.files)
    .filter(file => file.url)
    .map(file => `${folderPath(source, file.folderId)}${file.name}`);
}
