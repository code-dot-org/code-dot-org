import type {MultiFileSource} from '@code-dot-org/core/api';

// Turning the lab's project into the flat, path-keyed map the service worker
// serves. Ported from the source-walking parts of
// apps/src/weblab2/htmlPreview/{filterSourceForPreview,useProjectServiceWorker}.ts.

/**
 * One file as the service worker stores it. The worker also understands a `url`
 * form (an uploaded asset fetched rather than inlined), but the frontend
 * `ProjectFile` schema has no `url` field — uploads are deferred — so nothing
 * produces one yet.
 */
export interface PreviewFile {
  content: string;
  mimeType: string;
  url?: string;
}

/** Path (`folder/name.html`) -> file. */
export type PreviewFiles = Record<string, PreviewFile>;

// Legacy resolves these with the `mime-types` package; the project only holds
// the types Web Lab supports, so a small table avoids the dependency.
const MIME_TYPES: Record<string, string> = {
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  md: 'text/markdown',
  txt: 'text/plain',
  csv: 'text/csv',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
};

const mimeTypeFor = (fileName: string) =>
  MIME_TYPES[fileName.split('.').pop()?.toLowerCase() ?? ''] ??
  'application/octet-stream';

/**
 * Strip the fields that describe the *editor's* state — which file is active,
 * which folders are open — so switching tabs does not look like a project change
 * and re-render the preview. (Legacy `filterSourceForPreview`.)
 */
export const filterSourceForPreview = (
  source: MultiFileSource | undefined,
): MultiFileSource | undefined => {
  if (!source) {
    return source;
  }
  const files = Object.fromEntries(
    Object.entries(source.files).map(([fileId, file]) => {
      // Drop `active` (editor state) but keep everything else.
      const rest = {...file};
      delete rest.active;
      return [fileId, rest];
    }),
  );
  const folders = Object.fromEntries(
    Object.entries(source.folders).map(([folderId, folder]) => {
      // Drop `open` (editor state) but keep everything else.
      const rest = {...folder};
      delete rest.open;
      return [folderId, rest];
    }),
  );
  return {...source, files, folders, openFiles: []};
};

/** The `folder/sub/` prefix a file sits under, '' at the project root. */
const folderPath = (source: MultiFileSource, folderId: string): string => {
  const segments: string[] = [];
  let current = source.folders[folderId];
  // Guard against a malformed cycle rather than hanging the preview.
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    segments.unshift(current.name);
    current = source.folders[current.parentId];
  }
  return segments.length ? `${segments.join('/')}/` : '';
};

/** Flatten the project to the path-keyed map the service worker serves. */
export const getPreviewFiles = (source: MultiFileSource): PreviewFiles =>
  Object.fromEntries(
    Object.values(source.files).map(file => [
      `${folderPath(source, file.folderId)}${file.name}`,
      {content: file.contents, mimeType: mimeTypeFor(file.name)},
    ]),
  );
