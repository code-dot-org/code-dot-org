import {getFilePath} from '@codebridge/utils/getFilePath';

import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';

const FALLBACK_NAME = 'my-project';

// The files the student sees in the editor; support and validation files
// belong to the level, not the student.
const isStudentFile = (file: ProjectFile) =>
  !file.type ||
  file.type === ProjectFileType.STARTER ||
  file.type === ProjectFileType.LOCKED_STARTER;

/** A project name made safe to use as a file and folder name. */
export function exportName(projectName: string | undefined): string {
  const name = (projectName ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .trim();
  return name.length > 0 ? name : FALLBACK_NAME;
}

/**
 * Zips the student's files under one folder named rootName, keeping their
 * folder structure. Uploaded files hold no contents, only a URL, so their
 * bytes are fetched; any failed fetch rejects the whole export.
 */
export async function buildProjectZip(
  source: MultiFileSource,
  rootName: string,
  fetchFile: typeof fetch = fetch
): Promise<Blob> {
  const {default: JSZip} = await import('jszip');
  const zip = new JSZip();
  const root = zip.folder(rootName) ?? zip;
  await Promise.all(
    Object.values(source.files)
      .filter(isStudentFile)
      .map(async file => {
        // Paths in subfolders come back with a leading slash.
        const path = getFilePath(file, source.folders).replace(/^\/+/, '');
        if (file.url) {
          const response = await fetchFile(file.url);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${path}: ${response.status} ${response.statusText}`
            );
          }
          root.file(path, await response.blob());
        } else {
          root.file(path, file.contents);
        }
      })
  );
  return zip.generateAsync({type: 'blob'});
}
