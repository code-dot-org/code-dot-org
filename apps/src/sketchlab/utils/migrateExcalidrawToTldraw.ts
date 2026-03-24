import {DataURL} from '@excalidraw/excalidraw/types/types';
import {Editor, putExcalidrawContent} from 'tldraw';

import {ExcalidrawSourceWithExternalFiles} from '@cdo/apps/lab2/types';

import {imageUrlToBase64} from './imageUrlToBase64';

export function isExcalidrawSource(
  source: unknown
): source is ExcalidrawSourceWithExternalFiles {
  return (
    typeof source === 'object' &&
    source !== null &&
    'elements' in source &&
    Array.isArray((source as Record<string, unknown>).elements)
  );
}

export async function migrateExcalidrawToTldraw(
  editor: Editor,
  source: ExcalidrawSourceWithExternalFiles
): Promise<void> {
  // Deep clone to avoid mutating the saved sources.
  const cloned = structuredClone(source);

  // Populate dataURL for any images stored in S3 before passing to tldraw.
  if (cloned.files) {
    await Promise.allSettled(
      Object.values(cloned.files).map(async file => {
        const externalFile = cloned.externalFiles?.[file.id];
        if (externalFile?.url && externalFile.uploaded && !file.dataURL) {
          try {
            file.dataURL = (await imageUrlToBase64(
              externalFile.url
            )) as DataURL;
          } catch {
            // If download fails, tldraw will show a placeholder image.
          }
        }
      })
    );
  }

  await putExcalidrawContent(editor, {
    elements: cloned.elements ?? [],
    files: cloned.files ?? {},
  });
}
