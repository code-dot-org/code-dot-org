import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {FileId, MultiFileSource} from '@cdo/apps/lab2/types';

// Bytes of the project's url-backed files, keyed by file id.
export type ExternalFileContents = Record<FileId, Uint8Array<ArrayBuffer>>;

// An asset url carries a uuid minted when the file was uploaded, so the bytes
// behind a given url never change. Only the urls of the source most recently
// loaded are kept, so a deleted file's bytes are not pinned for the lifetime of
// the tab.
const contentsByUrl = new Map<string, Uint8Array<ArrayBuffer>>();

/**
 * Fetch the bytes of every url-backed file in the project.
 *
 * An uploaded file lives in S3 and its ProjectFile holds a
 * url with empty contents, so the bytes have to be fetched before a run can
 * write them to the pyodide filesystem. This runs on studio.code.org rather
 * than in the worker because with the sandbox enabled the worker sits on an
 * isolated origin that cannot read studio's assets.
 *
 * A file whose fetch fails is left out of the result; writeSource then leaves
 * it out of the filesystem, so python reports a missing file rather than an
 * unreadable one.
 */
export async function loadExternalFileContents(
  source: MultiFileSource
): Promise<ExternalFileContents> {
  const contents: ExternalFileContents = {};
  const urlFiles = Object.values(source.files).filter(file => file.url);
  const urls = new Set(urlFiles.map(file => file.url as string));
  for (const cachedUrl of contentsByUrl.keys()) {
    if (!urls.has(cachedUrl)) {
      contentsByUrl.delete(cachedUrl);
    }
  }

  await Promise.all(
    urlFiles.map(async file => {
      const url = file.url as string;
      const cached = contentsByUrl.get(url);
      if (cached) {
        contents[file.id] = cached;
        return;
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Request for ${url} returned ${response.status}`);
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        contentsByUrl.set(url, bytes);
        contents[file.id] = bytes;
      } catch (error) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Failed to load Python Lab project file', error as Error, {
            fileName: file.name,
          });
      }
    })
  );
  return contents;
}
