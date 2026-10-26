// Getting a stock backdrop's bytes.
//
// The one part of the library that is not in the bundle. A stock sprite is
// 32 pixels this repo draws for itself, so its base64 is committed
// (`stockImages.ts`); a backdrop is the animation library's art, fetched by
// `yarn setup:world` and served (BACKGROUNDS.md §7). The shelf carries a URL, so
// importing one begins by going and getting it.
//
// A static same-origin asset, so a plain `fetch` — not `DashboardApiClient`,
// which is for the API and would resolve this against the dashboard's origin.
// The same reason the image editor loads what it edits through an `<img>`.
//
// The bytes end up as a `data:` URL because that is what a project file holds
// (`importStock`): from the moment it is imported, a backdrop is the learner's
// file — repaintable, renamable, deletable — and nothing outside the project
// decides whether their game still has a sky.

import type {StockBackground} from './stock';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/**
 * The backdrop's bytes as a `data:` URL.
 *
 * Throws with the name a learner sees rather than the URL they do not: a
 * backdrop that will not load is a backdrop `yarn setup:world` did not fetch
 * (the setup script skips what it cannot reach), and the file name is what says
 * which one.
 */
export async function fetchStockBackground(
  background: StockBackground,
): Promise<string> {
  const response = await fetch(background.url);
  if (!response.ok) {
    throw new Error(
      `Could not load the background “${background.name}” (${response.status}).`,
    );
  }
  return blobToDataUrl(await response.blob());
}
