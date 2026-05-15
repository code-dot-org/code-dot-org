import {fetchCourseOfferings} from '@/modules/catalog/api/courseOfferings';
import {tileForSlug} from '@/modules/catalog/assets';
import bundled from '@/modules/catalog/data/bundled-catalog.json';
import type {Catalog, Course} from '@/modules/catalog/types';
import {get, set} from '@/modules/storage/idb';

// Resolves the bundled JSON's `illustration: "tile-oceans.webp"` strings to
// the imported asset URLs so the catalog screen can render them directly.
function rehydrateBundled(): Catalog {
  return {
    ...(bundled as unknown as Catalog),
    courses: (bundled as unknown as Catalog).courses.map(c => ({
      ...c,
      illustration: tileForSlug(c.slug),
    })),
  };
}

const CATALOG_UPDATED = 'studio:catalog-updated';

/**
 * Subscribe to background-refresh events. Returns an unsubscribe fn.
 * The catalog screen subscribes so it can re-render once the network fetch
 * lands without making the first paint wait on it.
 */
export function onCatalogUpdated(handler: (catalog: Catalog) => void) {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<Catalog>;
    handler(ce.detail);
  };
  window.addEventListener(CATALOG_UPDATED, listener);
  return () => window.removeEventListener(CATALOG_UPDATED, listener);
}

function emitUpdate(catalog: Catalog) {
  window.dispatchEvent(new CustomEvent(CATALOG_UPDATED, {detail: catalog}));
}

/**
 * Cache-first, network-update-in-background.
 *
 * 1. Read IDB. If present → return that immediately as the "first paint" data.
 * 2. Otherwise return the bundled JSON.
 * 3. In parallel, fire a Dashboard fetch; on success persist and emit an
 *    update event so the UI can re-render.
 *
 * Network failures are swallowed — the catalog stays whatever it already
 * was. This is intentional: the UX brief forbids any full-screen offline
 * error, and the catalog must render on every cold start.
 */
export async function loadCatalog(): Promise<Catalog> {
  const cached = await get('catalog');
  const initial = cached ?? rehydrateBundled();
  refreshInBackground();
  return initial;
}

function refreshInBackground(): void {
  // Don't bother trying when the device says it's offline. We still get a
  // "shouldn't have tried" event in some browsers' offline emulation, but
  // skipping here avoids spurious console errors during airplane-mode demos.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  fetchCourseOfferings()
    .then(async (courses: Course[]) => {
      if (courses.length === 0) return;
      const next: Catalog = {
        version: 1,
        fetchedAt: Date.now(),
        courses,
      };
      await set('catalog', next);
      emitUpdate(next);
    })
    .catch(() => {
      // Intentionally silent. The cached/bundled catalog is good enough.
    });
}
