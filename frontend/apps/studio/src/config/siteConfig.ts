/**
 * Site-level configuration consumed by the mobile home screen.
 *
 * In v1, configuration is sourced from environment variables injected at
 * build time.  Future versions may read from a remote config endpoint.
 */

import type {GradeBand} from '@/modules/mobile-home/journeys/types';

/**
 * Optional list of grade bands to show on the home screen.
 * When absent (undefined), all grade bands are shown.
 * Configured via VITE_HOME_GRADE_BANDS="K-5,6-9" at build time.
 */
export function getHomeGradeBands(): GradeBand[] | undefined {
  const raw = import.meta.env['VITE_HOME_GRADE_BANDS'] as string | undefined;
  if (!raw) return undefined;
  const bands = raw.split(',').map(s => s.trim()) as GradeBand[];
  return bands.length > 0 ? bands : undefined;
}
