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

import {lessonChannel} from '../progression/lessonRoute';
import {LESSONS} from '../progression/lessons';

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
 *
 * `levelData` is the one place a scenario may differ in something other than
 * its project, and it is spread in only when the scenario asked for it — an
 * explicit `levelData: undefined` is not the same as an absent key to a schema
 * that validates on the way in, and the difference is a level that looks edited
 * when it is not.
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
        // Opt this level into the AI Tutor. World Lab is not an app whose
        // experience assumes one (unlike weblab2), so `shouldShowAiTutor`
        // requires the level to say — which a curriculum author decides per
        // level, and which the harness has to stand in for.
        aiTutorAvailable: true,
        ...(scenario.levelData ? {levelData: scenario.levelData} : {}),
      }),
    },
    theme: {},
  };
}

/**
 * The scenarios, plus one channel per LESSON.
 *
 * A lesson opens in a channel of its own (`progression/lessonRoute`), so the
 * mock API has to answer for it exactly as it does for a scenario — and it can,
 * because a lesson IS a scenario: the same three fields, through the same
 * `fixtureFor`. That equivalence is the reason the progression could be built
 * on top of the demo harness rather than beside it.
 */
export const WorldFixtures: LabFixtures = Object.fromEntries([
  ...WORLD_SCENARIO_TAGS.map(tag => [tag, fixtureFor(WORLD_SCENARIOS[tag])]),
  ...Object.entries(LESSONS).map(([id, lesson]) => [
    lessonChannel(id),
    fixtureFor(lesson),
  ]),
]);

/** Whether a channel id is one this harness can serve. */
export const isFixtureTag = (tag: string | null): boolean =>
  tag !== null && tag in WorldFixtures;

/**
 * What the dev switcher calls a channel — a scenario or a lesson.
 *
 * Its own function because the switcher can now be showing either, and a lesson
 * is not in the scenario record it used to index straight into.
 */
export const fixtureLabel = (
  tag: string,
): {name: string; description: string} | undefined => {
  const scenario = WORLD_SCENARIOS[tag as keyof typeof WORLD_SCENARIOS];
  if (scenario) {
    return {name: scenario.name, description: scenario.description};
  }
  const lesson = Object.entries(LESSONS).find(
    ([id]) => lessonChannel(id) === tag,
  )?.[1];
  return (
    lesson && {
      name: `Lesson: ${lesson.name}`,
      description: lesson.description,
    }
  );
};
