import {useEffect, useState} from 'react';

import {loadCatalog, onCatalogUpdated} from '@/modules/catalog/data/loadCatalog';
import type {Catalog} from '@/modules/catalog/types';

export type Connectivity = 'online' | 'offline';

export interface CatalogState {
  /** Latest catalog known to the app (cached/bundled at first paint). */
  catalog: Catalog | undefined;
  /** Live connectivity reading, driven by `navigator.onLine`. */
  connectivity: Connectivity;
}

function readConnectivity(): Connectivity {
  if (typeof navigator === 'undefined') return 'online';
  return navigator.onLine ? 'online' : 'offline';
}

/**
 * One-stop hook for the catalog screen.
 *
 *   - First render returns `catalog: undefined`; the second render delivers
 *     the cached or bundled catalog (no network spinner).
 *   - A background Dashboard fetch may then emit an update event, causing
 *     a third render with the freshened list.
 *   - `connectivity` re-renders on online/offline window events.
 */
export function useCatalog(): CatalogState {
  const [catalog, setCatalog] = useState<Catalog | undefined>(undefined);
  const [connectivity, setConnectivity] = useState<Connectivity>(
    readConnectivity(),
  );

  useEffect(() => {
    let alive = true;
    loadCatalog().then(c => {
      if (alive) setCatalog(c);
    });
    const unsub = onCatalogUpdated(c => setCatalog(c));
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setConnectivity('online');
    const onOffline = () => setConnectivity('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return {catalog, connectivity};
}
