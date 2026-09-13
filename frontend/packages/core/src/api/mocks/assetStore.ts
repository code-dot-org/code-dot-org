// Where the standalone demo keeps uploaded bytes.
//
// IndexedDB, and not the `sessionStorage` every other mock resource uses
// (`scenarioStore`). The difference is size: that store holds small JSON — a
// project's files, a channel, a list of levels — and a browser gives an origin
// about five megabytes of it for everything together. An uploaded picture is
// not small JSON. One image a model drew is a megabyte and a half, and two of
// them took the whole budget:
//
//     QuotaExceededError: Setting the value of
//     'cdo-mock:world:jetpack:sources' exceeded the quota
//
// IndexedDB is where a browser expects bytes to go, its budget is measured in
// hundreds of megabytes rather than units of five, and it stores a Blob as a
// Blob instead of as base64 — which is a third smaller before anything else is
// considered.
//
// ASYNC, WHICH IS WHY THIS IS SEPARATE rather than a change to the store next
// door. `readResource` and `writeResource` are synchronous and are called from
// handlers that are not; making them async would touch every mock in the
// package to solve a problem only assets have.
//
// NOT `api/transports/simpleIdb`, which a reader will find and wonder about.
// That one is pinned to the API-replay database and its `recordings` store, has
// no delete and no clear, and REJECTS when the database will not open. Assets
// want their own database, want both of those verbs, and must not take the
// demo down with them — so this is a sibling rather than a caller.
//
// IT DEGRADES RATHER THAN FAILS. A browser with IndexedDB blocked — a private
// window, some test environments — gets an in-memory map for the life of the
// page. The demo then forgets its uploads on reload, which is worse and works;
// refusing to store anything would break uploading altogether.

const DATABASE = 'cdo-mock-assets';
const STORE = 'assets';

/** What an upload keeps: the bytes, and what they are. */
export interface StoredAsset {
  blob: Blob;
  contentType: string;
}

/** The fallback when IndexedDB will not open, for the life of the page. */
const inMemory = new Map<string, StoredAsset>();

let opening: Promise<IDBDatabase | undefined> | undefined;

const openDatabase = (): Promise<IDBDatabase | undefined> => {
  opening ??= new Promise<IDBDatabase | undefined>(resolve => {
    if (typeof indexedDB === 'undefined') {
      resolve(undefined);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DATABASE, 1);
    } catch {
      resolve(undefined);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    // Blocked, or a private window that refuses: the map takes over.
    request.onerror = () => resolve(undefined);
    request.onblocked = () => resolve(undefined);
  });
  return opening;
};

/** Run one transaction, answering undefined if the database would not open. */
const withStore = async <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | undefined> => {
  const database = await openDatabase();
  if (!database) {
    return undefined;
  }
  return new Promise<T | undefined>(resolve => {
    try {
      const transaction = database.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
};

export async function writeAsset(
  key: string,
  asset: StoredAsset,
): Promise<void> {
  inMemory.set(key, asset);
  await withStore('readwrite', store => store.put(asset, key));
}

export async function readAsset(key: string): Promise<StoredAsset | undefined> {
  const stored = await withStore<StoredAsset | undefined>('readonly', store =>
    store.get(key),
  );
  // The map is both the fallback AND a cache of this page's own writes, which
  // is what makes an upload readable immediately even where the database is
  // refusing.
  return stored ?? inMemory.get(key);
}

export async function clearAsset(key: string): Promise<void> {
  inMemory.delete(key);
  await withStore('readwrite', store => store.delete(key));
}

/** Wipe every stored asset — what `?cdoMockReset=1` means for bytes. */
export async function clearAllAssets(): Promise<void> {
  inMemory.clear();
  await withStore('readwrite', store => store.clear());
}
