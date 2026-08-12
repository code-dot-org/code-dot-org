// Lab fixture registry — sugar over the generic mock fixtures in `fixtures.ts`.
//
// A `LabFixture` is a scenario's worth of canned data for a lab, split into
// two kinds of slice:
//
//   - read-only (level properties, theme): desugared into `registerMockFixture`
//     routes, so the generic dispatcher serves them.
//   - stateful (channel, sources): kept as seed data that the behavioral
//     handlers (`channels.handlers`, `sources.handlers`) read via
//     `getActiveFixture()`, layering write-through over it.
//
// The studio app, in `msw` mode, registers a fixture set per lab and selects
// the active scenario from the URL params (channelId acts as the tag).

import type {Channel} from '../dashboard/channels';
import type {
  LevelPropertiesMap,
  LevelProperties,
  LevelPropertiesBaseInput,
} from '../dashboard/levels';
import type {UserThemeSettings} from '../dashboard/preferences';
import type {ProjectSourcesAny} from '../dashboard/sources';

import {
  clearMockFixtures,
  registerMockFixture,
  type MockRoute,
} from './fixtures';
import {getActiveScenario} from './scenario';

/**
 * One scenario's worth of canned data for a single lab. Every field is
 * optional; handlers fall back to defaults when a fixture is missing.
 */
export type LabFixture = {
  channel?: Channel;
  sources?: ProjectSourcesAny;
  levelProperties?: LevelPropertiesMap;
  theme?: UserThemeSettings | null;
};

/** All scenarios for a lab, keyed by tag (e.g. `simple`, `complex`, `error`). */
export type LabFixtures = Record<string, LabFixture>;

// The bundle, kept so the stateful handlers can read `channel`/`sources` seed
// for the active scenario.
const registry = new Map<string, LabFixtures>();

// The level_properties endpoints a lab may hit, in specific-before-wildcard
// order. The same fixture map answers all three.
const LEVEL_PROPERTIES_PATHS = [
  '*/levels/:levelId/level_properties',
  '*/projects/:standaloneProjectType/level_properties',
  '*/s/:scriptName/lessons/:lessonPosition/level_properties',
];

/**
 * The fixture's sources, reported as the level's `startSources`.
 *
 * A fixture IS a start state — it is the project as authored, before anyone
 * touched it — and saying so is what makes "Initial version" and "Start over"
 * mean it. Without this they fall back to the sources as first LOADED, which
 * is the fixture only until the first save: reload after editing and the
 * client's idea of "initial" is the last thing you saved, which is not a
 * version history so much as a mirror.
 *
 * Only when the fixture has not said otherwise. A scenario that sets its own
 * `startSources` (or `templateSources`) is making a point about a level whose
 * start state differs from its saved state, and that is a thing to be able to
 * mock.
 *
 * The wire shape is a BARE `MultiFileSource`, which is what the schema
 * validates and so what this must send — the fixture's `sources` is the
 * `{source}` wrapper around it, so the inner value is what goes here. Readers
 * differ on which they expect; normalising is theirs to do (see codebridge's
 * `InfoPanel`), and sending the other shape only fails validation on the way
 * in, before any of them see it.
 */
function withStartSources(fixture: LabFixture): LevelPropertiesMap {
  const properties = fixture.levelProperties ?? {};
  if (!fixture.sources) {
    return properties;
  }
  const withStart: LevelPropertiesMap = {};
  for (const [id, level] of Object.entries(properties)) {
    const source = (fixture.sources as {source?: unknown} | undefined)?.source;
    withStart[id] =
      level.startSources || level.templateSources || !source
        ? level
        : ({
            ...level,
            startSources: source,
          } as unknown as (typeof properties)[string]);
  }
  return withStart;
}

/** Routes for the read-only slices of one scenario's fixture. */
function readOnlyRoutes(fixture: LabFixture): MockRoute[] {
  const routes: MockRoute[] = [];

  if (fixture.levelProperties) {
    const body = withStartSources(fixture);
    for (const path of LEVEL_PROPERTIES_PATHS) {
      routes.push({path, respond: body});
    }
  }

  if (fixture.theme !== undefined) {
    // UserThemeSettingsSchema expects `{theme: {...}}`; the fixture carries
    // just the inner record (or null), so wrap it.
    routes.push({
      path: '*/user_preference/theme',
      respond: {theme: fixture.theme ?? {}},
    });
  }

  return routes;
}

/**
 * Register all scenarios for a lab. Idempotent — replaces any earlier
 * registration for the same lab, both the seed bundle and the desugared
 * read-only routes.
 *
 * Convenience wrapper over `registerMockFixture`: it wires up the common
 * level-loading endpoints from the fixture's read-only slices and seeds the
 * stateful slices for the channel/sources handlers.
 */
export function registerLabFixtures(
  labKey: string,
  fixtures: LabFixtures,
): void {
  registry.set(labKey, fixtures);

  // Replace, don't accumulate: clear this lab's routes before re-registering.
  clearMockFixtures({labKey});
  for (const [tag, fixture] of Object.entries(fixtures)) {
    const routes = readOnlyRoutes(fixture);
    if (routes.length > 0) registerMockFixture({labKey, tag}, routes);
  }
}

/** Returns the fixture bundle for the active `{labKey, tag}` pair, if any. */
export function getActiveFixture(): LabFixture | undefined {
  const active = getActiveScenario();
  if (!active) return undefined;
  return registry.get(active.labKey)?.[active.tag];
}

/**
 * Wraps a raw level-properties fixture so it slots into a `LevelPropertiesMap`.
 *
 * The fixture is typed against the schema *input* (the wire shape), so missing
 * `.default()` fields are allowed and nullable fields must be `null` rather
 * than the `undefined` a transform yields. The cast to the output
 * `LevelProperties` is sound because the handler returns this verbatim and the
 * API client re-parses it, running the transforms for real.
 */
export function createLevelPropertyFixture<
  T extends LevelPropertiesBaseInput = LevelPropertiesBaseInput,
>(fixture: T): LevelProperties {
  return fixture as unknown as LevelProperties;
}
