/**
 * AI Decisions journey manifest.
 * Grades K-5; entry at /m/journey/ai-decisions (redirects to the lesson path).
 */

import type {Seat} from '@/modules/seats/types';

import type {JourneyManifest, JourneyState} from './types';

/** Derives tile state from AI Decisions journey progress stored in the seat. */
function aiDecisionsProgress(seat: Seat): JourneyState {
  const p = seat.journeys?.['ai-decisions'];
  if (!p || p.kind !== 'ai-decisions') return 'start';
  // Any lesson visited = in progress; all lessons complete = done.
  const lessons = Object.values(p.lessons);
  if (lessons.length === 0) return 'start';
  const allComplete = lessons.every(l => l.complete);
  return allComplete ? 'done' : 'continue';
}

/** AI Decisions journey manifest. */
export const AI_DECISIONS_JOURNEY: JourneyManifest = {
  id: 'ai-decisions',
  title: 'How AI Makes Decisions',
  description: 'Explore how AI systems learn from data and make choices.',
  gradeBand: 'K-5',
  entryRoute: '/m/journey',
  progressSelector: aiDecisionsProgress,
};
