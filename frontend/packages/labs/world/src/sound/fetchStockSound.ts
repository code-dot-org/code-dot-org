// Getting a stock sound's bytes.
//
// The same arrangement a backdrop has (`appearance/fetchStockBackground`) and
// for the same reason: the bytes are not in the bundle. 39 mp3s is three
// megabytes, so they are fetched by `yarn setup:world` and served; the shelf
// carries a URL, and importing one begins by going and getting it.
//
// A static same-origin asset, so a plain `fetch` — not `DashboardApiClient`,
// which is for the API and would resolve this against the dashboard's origin.
//
// The bytes end up as a `data:` URL because that is what a project file holds:
// from the moment it is imported, a sound is the learner's file, and nothing
// outside the project decides whether their game still has it.

import type {StockSound} from './stock';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/**
 * The sound's bytes as a `data:` URL.
 *
 * Throws with the name a learner sees rather than the URL they do not: a sound
 * that will not load is one `yarn setup:world` did not fetch — the setup script
 * skips what it cannot reach — and the name is what says which.
 */
export async function fetchStockSound(sound: StockSound): Promise<string> {
  const response = await fetch(sound.url);
  if (!response.ok) {
    throw new Error(
      `Could not load the sound “${sound.name}” (${response.status}).`,
    );
  }
  return blobToDataUrl(await response.blob());
}
