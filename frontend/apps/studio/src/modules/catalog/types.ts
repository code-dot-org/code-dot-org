/**
 * A single tile on the catalog screen. `slug` is the stable identifier used
 * for routing (/lab/$slug) and IDB progress keys (courseProgress:$slug).
 *
 * `sampleOffline` distinguishes courses we bundle for offline play (AI for
 * Oceans today, possibly more) from courses that exist in the catalog as
 * discoverable-but-online-only entries. The catalog screen uses this to
 * pick between the "Ready offline" and "Needs internet" state badges.
 */
export interface Course {
  slug: string;
  title: string;
  description: string;
  /**
   * Image asset URL. For bundled tiles this is an imported asset URL so it
   * lands in the Vite module graph (and the SW precache manifest).
   */
  illustration: string;
  /** True iff every asset needed to play this course is bundled or precached. */
  sampleOffline: boolean;
}

/**
 * The shape we persist to IDB. `version` lets us evolve the schema later
 * without writing a migration today. `fetchedAt` is the unix-ms timestamp
 * of the most recent successful Dashboard fetch, or 0 for bundled-only.
 */
export interface Catalog {
  version: 1;
  fetchedAt: number;
  courses: Course[];
}
