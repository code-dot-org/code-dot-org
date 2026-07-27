// Uploaded binary files (those the learner uploaded — a `ProjectFile.url`, no
// contents) as a `{fileName: dataURL}` map, ready to hand to the preview. The
// lab fetches each asset from its backend URL (same-origin, so it works; the
// preview sandbox could not — cross-origin + `connect-src 'none'`) and inlines
// it as a `data:` URL. The preview's CSP allows `img-src 'self' blob: data:`
// (SANDBOX.md), so the driver loads these as textures with no service worker and
// no lab-origin fetch from the sandbox. An animation frame references an uploaded
// sprite by the file's name.

import type {MultiFileSource} from '@code-dot-org/core/api';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/** Fetch every uploaded asset and return `{fileName: dataURL}`. */
export async function projectAssets(
  source: MultiFileSource | undefined,
): Promise<Record<string, string>> {
  if (!source) {
    return {};
  }
  const uploaded = Object.values(source.files).filter(file => file.url);
  const entries = await Promise.all(
    uploaded.map(async file => {
      const response = await fetch(file.url as string);
      const dataUrl = await blobToDataUrl(await response.blob());
      return [file.name, dataUrl] as const;
    }),
  );
  return Object.fromEntries(entries);
}
