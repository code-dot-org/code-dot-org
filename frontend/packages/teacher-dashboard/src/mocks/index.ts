// Public mock API for @code-dot-org/teacher-dashboard/mocks.
//
// Re-exports persona definitions and provides a `registerHomepageFixtures`
// function that wires all personas into the core mock registry.

import {registerMockFixture} from '@code-dot-org/core/api/mocks';

import {homepageHandlers} from './homepageHandlers';
import {routesForPersona} from './personaHandlers';
import {PERSONA_TAGS, PERSONAS} from './personas';

export {PERSONA_TAGS, PERSONAS};
export type {Persona, PersonaTag} from './personas';
export {homepageHandlers} from './homepageHandlers';
export {routesForPersona} from './personaHandlers';

export const HOMEPAGE_LAB_KEY = 'teacher-homepage';

export function registerHomepageFixtures(): void {
  // Global handlers apply to every persona.
  registerMockFixture(homepageHandlers);

  // Per-persona overrides, scoped to {labKey, tag}.
  for (const tag of PERSONA_TAGS) {
    registerMockFixture({labKey: HOMEPAGE_LAB_KEY, tag}, routesForPersona(tag));
  }
}
