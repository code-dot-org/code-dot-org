/**
 * Notebook Lab journey manifest.
 * Grades 6-9; entry at /m/journey/notebook (four-node onboarding path).
 */

import type {Seat} from '@/modules/seats/types';

import type {JourneyManifest, JourneyState} from './types';

/** Derives tile state from Notebook journey progress stored in the seat. */
function notebookProgress(seat: Seat): JourneyState {
  const p = seat.journeys?.['notebook'];
  if (!p || p.kind !== 'notebook') return 'start';
  if (p.graduated) return 'done';
  if (p.nodes.some(Boolean)) return 'continue';
  return 'start';
}

/** Notebook Lab journey manifest. */
export const NOTEBOOK_JOURNEY: JourneyManifest = {
  id: 'notebook',
  title: 'Python Notebook Lab',
  description: 'Write and run Python code in an interactive notebook.',
  gradeBand: '6-9',
  entryRoute: '/m/notebook',
  progressSelector: notebookProgress,
};
