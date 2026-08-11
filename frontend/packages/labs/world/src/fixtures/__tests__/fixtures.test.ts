// The scenario catalogue, and what the mock API makes of it.
//
// These exist because a fixture is only useful if it is reachable by the name
// something else uses for it: the switcher offers a tag, the studio route
// carries a tag, and a test activates a tag. If those three drift, the failure
// is a lab that loads an empty project and says nothing about why.

import {describe, expect, it} from 'vitest';

import {
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  WorldFixtures,
  DEFAULT_SCENARIO_TAG,
  isScenarioTag,
} from '../index';

describe('the scenario catalogue', () => {
  it('has a fixture for every tag, and no tag without one', () => {
    // The switcher walks the tag list and the mock API is keyed by tag, so a
    // scenario in one and not the other is an option that loads nothing.
    expect(Object.keys(WorldFixtures).sort()).toEqual(
      [...WORLD_SCENARIO_TAGS].sort(),
    );
    expect(Object.keys(WORLD_SCENARIOS).sort()).toEqual(
      [...WORLD_SCENARIO_TAGS].sort(),
    );
  });

  it('offers a default that exists', () => {
    expect(isScenarioTag(DEFAULT_SCENARIO_TAG)).toBe(true);
  });

  it('rejects a tag that names nothing', () => {
    // What keeps a typo in a URL showing the starter rather than a lab with no
    // project in it.
    expect(isScenarioTag('breakout')).toBe(false);
    expect(isScenarioTag(null)).toBe(false);
  });

  it('gives each scenario a name and a reason', () => {
    // The name is what the switcher shows and the description is why the
    // scenario is kept — an unnamed one is an option nobody can choose between,
    // and an undescribed one is a project nobody dares delete.
    for (const tag of WORLD_SCENARIO_TAGS) {
      const scenario = WORLD_SCENARIOS[tag];
      expect(scenario.name.length).toBeGreaterThan(0);
      expect(scenario.description.length).toBeGreaterThan(0);
      expect(scenario.instructions).toContain('##');
    }
    const names = WORLD_SCENARIO_TAGS.map(tag => WORLD_SCENARIOS[tag].name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('serves each scenario its own project', () => {
    // The one thing a scenario IS. Two tags sharing a source object would be
    // two options that do the same thing.
    for (const tag of WORLD_SCENARIO_TAGS) {
      const fixture = WorldFixtures[tag];
      expect(fixture.sources).toEqual({source: WORLD_SCENARIOS[tag].source});
    }
    expect(WORLD_SCENARIOS.simple.source).not.toBe(
      WORLD_SCENARIOS.empty.source,
    );
  });

  it('gives every project a world to open into', () => {
    // A lab that opens on no file is a blank screen with a file tree. Every
    // scenario names an open file, and it is a real one.
    for (const tag of WORLD_SCENARIO_TAGS) {
      const {files, openFiles = []} = WORLD_SCENARIOS[tag].source;
      expect(openFiles.length).toBeGreaterThan(0);
      for (const id of openFiles) {
        expect(files[id]).toBeDefined();
      }
      expect(
        Object.values(files).some(file => file.name.endsWith('.world')),
      ).toBe(true);
    }
  });

  it('writes the level properties once, for all of them', () => {
    // Only the instructions differ. A scenario that had to restate
    // `usesProjects` would be a second place for it to be wrong.
    for (const tag of WORLD_SCENARIO_TAGS) {
      const level = WorldFixtures[tag].levelProperties?.['1'];
      expect(level?.appName).toBe('world');
      expect(level?.usesProjects).toBe(true);
      expect(level?.longInstructions).toBe(WORLD_SCENARIOS[tag].instructions);
    }
  });
});
