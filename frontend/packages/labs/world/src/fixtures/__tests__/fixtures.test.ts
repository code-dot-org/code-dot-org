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
    expect(isScenarioTag('platformer')).toBe(false);
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

  it('gives breakout everything it names', () => {
    // A scenario naming a rule the project does not hold is a world that loads
    // with a `use rule` pointing at nothing — and the dropdown quietly falls
    // back to the first rule in the list rather than saying so, which is how
    // this one shipped four rows of `use rule ⟨Has Space⟩` the first time.
    const files = Object.values(WORLD_SCENARIOS.breakout.source.files);
    const named = (name: string) => files.some(file => file.name === name);

    for (const rule of [
      'arrows.rule',
      'input.rule',
      'motion.rule',
      'collisions.rule',
      'solid.rule',
      'collect.rule',
    ]) {
      expect(named(rule)).toBe(true);
    }
    // All four in blocks: every actor in this project can be opened and read
    // in the editor, which is most of what a demo project is for.
    for (const actor of [
      'paddle.actor',
      'ball.actor',
      'brick.actor',
      'wall.actor',
    ]) {
      expect(named(actor)).toBe(true);
    }
    // The images it draws with. A project draws only what it holds.
    for (const sprite of ['ground.png', 'ball.png', 'box.png']) {
      expect(named(sprite)).toBe(true);
    }
  });

  it('bounces off the surfaces, not off the ball', () => {
    // The one that cost a debugging round: `bounciness` is read off the SOLID
    // body in a contact, not off the thing that hit it (rules/solid). A ball
    // with the dial and walls without it stops dead on first contact.
    const files = Object.values(WORLD_SCENARIOS.breakout.source.files);
    const contents = (name: string) =>
      files.find(file => file.name === name)?.contents ?? '';

    expect(contents('wall.actor')).toContain('BouncinessProperty');
    expect(contents('brick.actor')).toContain('BouncinessProperty');
    expect(contents('paddle.actor')).toContain('BouncinessProperty');
    expect(contents('ball.actor')).not.toContain('BouncinessProperty');
  });

  it('names its rules the way the dropdown stores them', () => {
    // A parsed `.rule` is referred to by its NAME from then on, wherever its
    // file sits (useRuleOptions). A module path is what an UNPARSEABLE one
    // falls back to, so `use rule ⟨rules/solid⟩` reads as a rule that could not
    // be read — and silently resolves to something else.
    const main = Object.values(WORLD_SCENARIOS.breakout.source.files).find(
      file => file.name === 'main.world',
    )!.contents;

    for (const name of ['Arrow Keys', 'Solid Bodies', 'Collection']) {
      expect(main).toContain(`"RULE":"${name}"`);
    }
    expect(main).not.toContain('"RULE":"rules/');
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
