// World Lab's mock scenarios, one per entry in the catalogue (./scenarios).
//
// The studio host and the standalone demo both register these under the lab key
// `world`; the route's channel id picks the active tag, so
// `/projects/world/empty/edit` loads the empty project and the demo's switcher
// asks for the same thing by the same name.
//
// What a scenario says is its project and its instructions. Everything else a
// level carries is the same for all of them and is written once, here — a
// second scenario that had to restate `usesProjects: true` would be a second
// place for that to be wrong.

import {
  createLevelPropertyFixture,
  type LabFixture,
  type LabFixtures,
} from '@code-dot-org/core/api/mocks';

import {
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  type WorldScenario,
} from './scenarios';

export {
  DEFAULT_SCENARIO_TAG,
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  isScenarioTag,
} from './scenarios';
export type {WorldScenario, WorldScenarioTag} from './scenarios';

/** The lab key every World Lab fixture is registered under. */
export const WORLD_LAB_KEY = 'world';

/**
 * One scenario as the host's four requests answer it.
 *
 * The sources double as the version panel's "Initial version": it restores what
 * was first loaded, which is this.
 */
function fixtureFor(scenario: WorldScenario): LabFixture {
  return {
    sources: {source: scenario.source},
    levelProperties: {
      '1': createLevelPropertyFixture({
        id: 1,
        name: 'World Lab',
        type: 'World',
        appName: 'world',
        usesProjects: true,
        isProjectLevel: true,
        offerBrowserTts: false,
        showExemplarLink: false,
        exemplarSources: null,
        longInstructions: scenario.instructions,
      }),
    },
    theme: {},
  };
}

export const WorldFixtures: LabFixtures = Object.fromEntries(
  WORLD_SCENARIO_TAGS.map(tag => [tag, fixtureFor(WORLD_SCENARIOS[tag])]),
);
