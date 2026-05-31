// Fixture registry consumed by the MSW handlers.
//
// The studio app, in `msw` mode, registers a fixture set per lab and then
// selects the active scenario from the URL params (channelId acts as the tag).
// Handlers consult `getActiveFixture()` and fall back to handler-specific
// defaults when a fixture is absent or doesn't cover a given endpoint.

import type {Channel} from '../dashboard/channels';
import type {
  LevelPropertiesMap,
  LevelProperties,
  LevelPropertiesBaseInput,
} from '../dashboard/levels';
import type {UserThemeSettings} from '../dashboard/preferences';
import type {ProjectSourcesAny} from '../dashboard/sources';

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

const registry = new Map<string, LabFixtures>();
let active: {labKey: string; tag: string} | undefined;

/**
 * Register all scenarios for a lab. Idempotent — calling twice replaces the
 * earlier registration.
 *
 * A convenience function specifically for lab fixtures that wires up common
 * API paths for level loading.
 */
export function registerLabFixtures(
  labKey: string,
  fixtures: LabFixtures,
): void {
  registry.set(labKey, fixtures);
}

/**
 * Tell the registry which lab + tag is being rendered. The studio route
 * loader calls this from the URL params before the lab makes any API call.
 */
export function setActiveScenario(scenario: {
  labKey: string;
  tag: string;
}): void {
  active = scenario;
}

/** Clear the active scenario. Useful between tests. */
export function clearActiveScenario(): void {
  active = undefined;
}

/** Returns the fixture for the active `{labKey, tag}` pair, if any. */
export function getActiveFixture(): LabFixture | undefined {
  if (!active) return undefined;
  return registry.get(active.labKey)?.[active.tag];
}

/** Returns `{labKey, tag}` if a scenario is active. */
export function getActiveScenario(): {labKey: string; tag: string} | undefined {
  return active;
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
