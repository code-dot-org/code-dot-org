/**
 * Ordered array of all registered journeys shown on the home picker.
 * Manifest order determines default tile order (resume-hoist applied on top).
 */

import {AI_DECISIONS_JOURNEY} from './ai-decisions.journey';
import {NOTEBOOK_JOURNEY} from './notebook.journey';
import type {JourneyManifest} from './types';

/** All registered journeys in default display order. */
export const JOURNEYS: JourneyManifest[] = [
  AI_DECISIONS_JOURNEY,
  NOTEBOOK_JOURNEY,
];

export type {JourneyManifest, GradeBand, JourneyState} from './types';
