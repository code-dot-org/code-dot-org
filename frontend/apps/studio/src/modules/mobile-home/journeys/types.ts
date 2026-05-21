/**
 * Journey manifest type used by the home screen picker (FR-040b).
 * Each journey registered in JOURNEYS gets one tile on /m/home.
 */

import type {Seat} from '@/modules/seats/types';

/** Grade band targeting the curriculum. */
export type GradeBand = 'K-5' | '6-9' | '9-12';

/** Tile state visible to the learner. */
export type JourneyState = 'start' | 'continue' | 'done';

/** Declares a single learnable journey that appears in the home picker. */
export interface JourneyManifest {
  /** Unique stable identifier matching JourneyId in seats/types.ts. */
  id: string;
  /** Display title shown on the tile. */
  title: string;
  /** One-sentence description shown under the title. */
  description: string;
  /** Grade band filter; absent = shown for all deployments. */
  gradeBand?: GradeBand;
  /**
   * Route the journey tile navigates to on tap.
   * The catch-all /m/journey/$journeyId handler resolves this.
   */
  entryRoute: string;
  /**
   * Reads the learner's progress from a seat to determine tile state.
   * Called synchronously inside HomeView.
   * @param seat Currently active Seat
   * @returns 'start' | 'continue' | 'done'
   */
  progressSelector: (seat: Seat) => JourneyState;
}
