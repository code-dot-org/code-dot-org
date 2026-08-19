// Flattens the Codebridge project (a `MultiFileSource` of files + nested
// folders) into the path-keyed `{path: contents}` map the compiler bundles.
// Adapted from web-lab's projectFiles.ts folder-path walking; World needs only
// the text map (the compiler resolves imports against it), not mime types.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {isSoundFile} from '../sound/soundFiles';

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

/**
 * The id of the file at a folder-prefixed path, if the project has one.
 *
 * The inverse of {@link filePath}, for a caller that knows the path a project
 * always has — the entry world — and needs the id everything else is keyed by.
 */
export function fileIdAt(
  source: MultiFileSource | undefined,
  path: string,
): string | undefined {
  if (!source) {
    return undefined;
  }
  return Object.keys(source.files).find(id => filePath(source, id) === path);
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
/** What counts as an image here, matching `projectModules`' own test. */
const IMAGE_FILE = /\.(png|jpg|jpeg|gif|webp)$/i;

export function projectImagePaths(
  source: MultiFileSource | undefined,
): string[] {
  return binaryPaths(source).filter(path => IMAGE_FILE.test(path));
}

/**
 * The project's SOUNDS, folder and all (`sounds/coin.mp3`).
 *
 * A sound is a file with bytes on a `url`, exactly as an image is
 * (specs/SOUND.md), so the only thing telling the two pools apart is the
 * extension — which is why the function above grew a filter the day this one
 * was written. Without it a sound turned up in the `set sprite` dropdown, being
 * a url-bearing file in no `backgrounds/` folder.
 */
export function projectSoundPaths(
  source: MultiFileSource | undefined,
): string[] {
  return binaryPaths(source).filter(path => isSoundFile(path));
}

/** What the two above share: every file that carries bytes rather than text. */
function binaryPaths(source: MultiFileSource | undefined): string[] {
  if (!source) {
    return [];
  }
  return Object.values(source.files)
    .filter(file => file.url)
    .map(file => `${folderPath(source, file.folderId)}${file.name}`);
}
