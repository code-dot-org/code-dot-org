/**
 * Session catalog persistence layer built on top of prefsStore.
 * The entire catalog is stored as a single JSON blob; suitable for the small
 * counts of sessions expected in a classroom context (typically < 10).
 */

import * as prefsStore from './prefsStore';

/** UUIDv4-identified learner session. */
export interface Session {
  /** UUIDv4 session identifier. */
  id: string;
  /** Learner-visible label, e.g. "Home account". */
  label: string;
  /** Creation timestamp as epoch milliseconds. */
  created: number;
  /** Last-activity timestamp as epoch milliseconds; used for idle eviction. */
  lastActive: number;
}

/** Top-level structure persisted under CATALOG_KEY. */
export interface SessionCatalog {
  /** Ordered list of known sessions. */
  sessions: Session[];
  /** Id of the currently active session, or null when signed out. */
  activeId: string | null;
  /** Milliseconds of inactivity before the session is auto-signed-out. */
  idleTimeoutMs: number;
}

/** Prefs key under which the catalog is stored. */
const CATALOG_KEY = 'nblab.sessionCatalog';

/** Sentinel returned when no catalog has been persisted yet. */
const DEFAULT_CATALOG: SessionCatalog = {
  sessions: [],
  activeId: null,
  idleTimeoutMs: 1_200_000,
};

/**
 * Loads the catalog, returning the default if absent.
 * @returns Current SessionCatalog
 */
async function loadCatalog(): Promise<SessionCatalog> {
  return (
    (await prefsStore.get<SessionCatalog>(CATALOG_KEY)) ?? {
      ...DEFAULT_CATALOG,
    }
  );
}

/**
 * Persists the catalog.
 * @param catalog Catalog to save
 */
async function saveCatalog(catalog: SessionCatalog): Promise<void> {
  await prefsStore.set(CATALOG_KEY, catalog);
}

/**
 * Returns all sessions in the catalog, ordered by creation time.
 * @returns Array of Session objects
 */
export async function listSessions(): Promise<Session[]> {
  const catalog = await loadCatalog();
  return catalog.sessions;
}

/**
 * Creates a new session, appends it to the catalog, and persists.
 * @param label Learner-visible display label
 * @returns The newly created Session
 */
export async function createSession(label: string): Promise<Session> {
  const catalog = await loadCatalog();
  const now = Date.now();
  const session: Session = {
    id: crypto.randomUUID(),
    label,
    created: now,
    lastActive: now,
  };
  catalog.sessions.push(session);
  await saveCatalog(catalog);
  return session;
}

/**
 * Sets the active session by id.  Does not validate that the id exists; callers
 * should only pass ids obtained from listSessions or createSession.
 * @param id Id of the session to activate
 */
export async function activateSession(id: string): Promise<void> {
  const catalog = await loadCatalog();
  catalog.activeId = id;
  await saveCatalog(catalog);
}

/**
 * Updates the lastActive timestamp for the session matching id.  No-ops if
 * the id is not found — avoids throwing during background timer callbacks.
 * @param id Session id to touch
 */
export async function touchLastActive(id: string): Promise<void> {
  const catalog = await loadCatalog();
  const session = catalog.sessions.find(s => s.id === id);
  if (session !== undefined) {
    session.lastActive = Date.now();
    await saveCatalog(catalog);
  }
}

/**
 * Signs out by clearing the active session id.  Does not destroy session data.
 */
export async function signOut(): Promise<void> {
  const catalog = await loadCatalog();
  catalog.activeId = null;
  await saveCatalog(catalog);
}

/**
 * Removes a session from the catalog.  Clears activeId if it matched.
 * Does NOT cascade to notebook data — caller is responsible for that cleanup.
 * @param id Id of the session to remove
 */
export async function deleteSession(id: string): Promise<void> {
  const catalog = await loadCatalog();
  catalog.sessions = catalog.sessions.filter(s => s.id !== id);
  if (catalog.activeId === id) {
    catalog.activeId = null;
  }
  await saveCatalog(catalog);
}

/**
 * Returns the session currently marked active, or null when signed out.
 * @returns Active Session or null
 */
export async function getActiveSession(): Promise<Session | null> {
  const catalog = await loadCatalog();
  if (catalog.activeId === null) return null;
  return catalog.sessions.find(s => s.id === catalog.activeId) ?? null;
}
