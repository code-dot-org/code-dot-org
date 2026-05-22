import {createFileRoute, redirect} from '@tanstack/react-router';

import {JOURNEYS} from '@/modules/mobile-home/journeys';
import {readSeatIndex, prefsSet} from '@/modules/seats/storage';

/** Storage key for a pending deep-link journey target (T214). */
export const PENDING_JOURNEY_KEY = 'pendingJourneyTarget';

/** Validates `?lock=1` forwarded from the home screen. */
function validateSearch(search: Record<string, unknown>): {lock?: boolean} {
  const locked = search.lock === '1' || search.lock === 1;
  return locked ? {lock: true} : {};
}

/**
 * Catch-all journey dispatch — resolves journeyId to an entryRoute and
 * redirects.  Always uses replace so the dispatch URL never appears in
 * browser history.
 *
 * T214: when no active seat exists, stores the target in prefsStore and
 * redirects to the seat picker so the user can pick a seat first.
 *
 * T211: ?lock=1 is honored — the home → dispatch navigation uses replace when
 * lock is set, so the picker is not in back-navigation history.
 */
export const Route = createFileRoute('/m/journey/$journeyId')({
  validateSearch,
  loader: async ({params: {journeyId}}) => {
    const manifest = JOURNEYS.find(j => j.id === journeyId);
    if (manifest === undefined) {
      throw redirect({to: '/m/seats', replace: true});
    }

    const index = await readSeatIndex();
    if (index.activeSeatId === null) {
      await prefsSet(PENDING_JOURNEY_KEY, journeyId);
      throw redirect({to: '/m/seats', replace: true});
    }

    // Guard: if entryRoute would match this same dispatch path (e.g.,
    // '/m/journey/notebook' when the notebook route does not yet exist as a
    // dedicated file route), the redirect would loop.  Fall back to /m/home
    // until Phase 18 creates the dedicated route.
    const dispatchPath = `/m/journey/${journeyId}`;
    if (manifest.entryRoute === dispatchPath) {
      throw redirect({to: '/m/home', search: {}, replace: true});
    }

    // Always replace so the dispatch URL never lands in browser history.
    throw redirect({
      to: manifest.entryRoute as '/m/journey',
      replace: true,
    });
  },
  component: () => null,
});
