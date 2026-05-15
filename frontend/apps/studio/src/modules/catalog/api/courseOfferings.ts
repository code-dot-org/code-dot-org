import ky from 'ky';

import {tileForSlug} from '@/modules/catalog/assets';
import type {Course} from '@/modules/catalog/types';

// Slugs we ship offline-capable bundles for. Anything else from the
// Dashboard endpoint comes back as `sampleOffline: false`.
const OFFLINE_BUNDLED = new Set(['ai-for-oceans']);

// Shape we actually consume. The Dashboard endpoint returns a much larger
// record per course offering; we adapt to the slim `Course` type so the
// catalog screen and IDB persistence both speak one vocabulary.
interface RawCourseOffering {
  key?: string;
  slug?: string;
  display_name?: string;
  title?: string;
  description?: string;
  summary?: string;
  image_url?: string;
  illustration?: string;
}

// Dashboard sometimes returns an envelope `{ course_offerings: [...] }` and
// sometimes a bare array depending on the endpoint variant. Accept both.
type RawCatalogResponse =
  | RawCourseOffering[]
  | {course_offerings?: RawCourseOffering[]};

function unwrap(raw: RawCatalogResponse): RawCourseOffering[] {
  if (Array.isArray(raw)) return raw;
  return raw.course_offerings ?? [];
}

function toCourse(raw: RawCourseOffering): Course | null {
  const slug = raw.slug ?? raw.key;
  const title = raw.display_name ?? raw.title;
  if (!slug || !title) return null;
  return {
    slug,
    title,
    description: raw.description ?? raw.summary ?? '',
    // Prefer the server-supplied illustration; fall back to the bundled tile
    // so an unknown course still renders something instead of a broken img.
    illustration: raw.image_url ?? raw.illustration ?? tileForSlug(slug),
    sampleOffline: OFFLINE_BUNDLED.has(slug),
  };
}

/**
 * Fetch the live course catalog from Dashboard.
 *
 * Hackathon scope: this targets the `/dashboardapi/course_offerings` route
 * (read-only, no auth required for the mobile catalog). We do not block the
 * UI on this — the caller (loadCatalog) treats any error as "stick with the
 * cached/bundled catalog" so offline launch is always instant.
 */
export async function fetchCourseOfferings(): Promise<Course[]> {
  const raw = await ky
    .get('/dashboardapi/course_offerings', {
      timeout: 8000,
      retry: 0,
    })
    .json<RawCatalogResponse>();
  return unwrap(raw)
    .map(toCourse)
    .filter((c): c is Course => c !== null);
}
