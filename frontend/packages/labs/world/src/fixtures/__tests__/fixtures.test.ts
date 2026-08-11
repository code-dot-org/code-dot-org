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

  it('says the single-world breakout without leaving main.world', () => {
    // The whole claim of that scenario. An actor file or a map file sneaking
    // back in would make the pair stop being a diff about one thing.
    const files = Object.values(
      WORLD_SCENARIOS['breakout-single'].source.files,
    );
    const worlds = files.filter(file => file.name.endsWith('.world'));

    expect(worlds).toHaveLength(1);
    expect(files.some(file => file.name.endsWith('.actor'))).toBe(false);
    expect(files.some(file => file.name.endsWith('.map'))).toBe(false);

    const main = worlds[0].contents;
    expect(main).toContain('world_actor');
    expect(main).toContain('world_create_in_map');
    expect(main).not.toContain('world_load_map');
  });

  it('points every local reference at an actor that is defined', () => {
    // A world-local actor is named by its DEFINING BLOCK'S id, so a mistyped
    // one is not an error — `create in map` generates nothing at all, and the
    // board comes up missing a third of itself with the console silent.
    const main = Object.values(
      WORLD_SCENARIOS['breakout-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;
    const workspace = JSON.parse(main) as {
      blocks: {blocks: Array<{type: string; id?: string}>};
    };

    const defined = new Set(
      workspace.blocks.blocks
        .filter(block => block.type === 'world_actor')
        .map(block => block.id),
    );
    expect(defined.size).toBe(4);

    for (const [, id] of main.matchAll(/"local:([^"]+)"/g)) {
      expect(defined).toContain(id);
    }
  });

  it('opens on the world block, not on an actor', () => {
    // Where a reader starts. The emitted module still puts the actor `const`s
    // first — the assembler hoists them (assembleActorModule), which is what
    // frees the canvas to be laid out for reading rather than for the compiler.
    const main = Object.values(
      WORLD_SCENARIOS['breakout-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;
    const workspace = JSON.parse(main) as {
      blocks: {blocks: Array<{type: string; x: number; y: number}>};
    };
    const world = workspace.blocks.blocks.find(
      block => block.type === 'world_world',
    )!;

    for (const block of workspace.blocks.blocks) {
      if (block === world) {
        continue;
      }
      expect(block.y).toBeGreaterThanOrEqual(world.y);
    }
    expect(world.x).toBe(20);
  });

  it('is the same game as the other breakout', () => {
    // The two differ in how the game is SAID, not in what it is made of. Rules
    // or pictures drifting apart would make the diff between them noise.
    const named = (tag: 'breakout' | 'breakout-single') =>
      Object.values(WORLD_SCENARIOS[tag].source.files)
        .map(file => file.name)
        .filter(name => name.endsWith('.rule') || name.endsWith('.png'))
        .sort();

    expect(named('breakout-single')).toEqual(named('breakout'));
  });

  it('gives meteors the rules that make it a different game', () => {
    // The point of a third scenario: it is the one that exercises Arrow Drive,
    // Screen Wrap, Shooting and Expiry, none of which breakout uses. A rule it
    // names but does not hold is a `use rule` that silently resolves to
    // something else.
    const files = Object.values(WORLD_SCENARIOS.meteors.source.files);
    const named = (name: string) => files.some(file => file.name === name);

    for (const rule of [
      'drive.rule',
      'wrap.rule',
      'shoots.rule',
      'expires.rule',
      'collisions.rule',
      'input.rule',
      'motion.rule',
    ]) {
      expect(named(rule)).toBe(true);
    }
    for (const actor of ['ship.actor', 'shot.actor', 'meteor.actor']) {
      expect(named(actor)).toBe(true);
    }
  });

  it('asks to fire in one place and says what a shot is in another', () => {
    // The Shooting rule's whole design: pressing a key ASKS and the cooldown
    // answers, so a held key is not a wall of bullets. Spawning the bullet
    // straight from the key press would be a gun with no rate limit — it would
    // look identical until someone held the key down.
    const ship = Object.values(WORLD_SCENARIOS.meteors.source.files).find(
      file => file.name === 'ship.actor',
    )!.contents;

    expect(ship).toContain('world_do_Shooting_MakeFireAction');
    expect(ship).toContain('world_on_Shooting_FiresEvent');
    // And the shot is spawned NAMED, because inside `add actor` the words
    // `this actor` mean the new one — a bullet put where the ship is cannot be
    // written otherwise without silently reading the bullet's own position.
    expect(ship).toContain('"NAMED":"named"');
    expect(ship).toContain('world_vector_rotate');
  });

  it('takes its shots away again', () => {
    // The other half of spawning. Without Expiry a game slowly fills with
    // bullets and grinds down, which presents as "it gets slower the longer
    // you play" and is very hard to see in a short demo.
    const shot = Object.values(WORLD_SCENARIOS.meteors.source.files).find(
      file => file.name === 'shot.actor',
    )!.contents;

    expect(shot).toContain('Expiry#ExpiresTrait');
    expect(shot).toContain('world_set_Expiry_LifetimeProperty');
  });

  it('says the single-world meteors without leaving main.world', () => {
    const files = Object.values(WORLD_SCENARIOS['meteors-single'].source.files);
    const worlds = files.filter(file => file.name.endsWith('.world'));

    expect(worlds).toHaveLength(1);
    expect(files.some(file => file.name.endsWith('.actor'))).toBe(false);

    const main = worlds[0].contents;
    // Including the handler that SPAWNS, which is what makes this pair worth
    // having on top of the breakout one: a hat on `any ⟨Ship⟩` that adds a
    // world-local actor and names it, because inside `add actor` the words
    // `this actor` mean the new one.
    expect(main).toContain('world_on_Shooting_FiresEvent');
    expect(main).toContain('"NAMED":"named"');
    expect(main).toContain('world_create_in_map');
  });

  it('writes each rock a heading, since an arrangement cannot roll one', () => {
    // The honest cost of the shape, and the one real difference between the two
    // tellings. `create in map` is DATA — positions and per-instance property
    // overrides — so a heading is written down; the file version places each
    // rock with `add actor` and a body, which is somewhere code can run, and
    // rolls one instead.
    const main = Object.values(
      WORLD_SCENARIOS['meteors-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;
    const rolled = Object.values(WORLD_SCENARIOS.meteors.source.files).find(
      file => file.name === 'main.world',
    )!.contents;

    // The trait and property ids Physics declares, which is how an override
    // names what it is overriding.
    expect(main).toContain('Can_Move');
    expect(main).toContain('velocity');
    expect(main).not.toContain('math_random_int');
    expect(rolled).toContain('math_random_int');
  });

  it('is the same game as the other meteors', () => {
    const named = (tag: 'meteors' | 'meteors-single') =>
      Object.values(WORLD_SCENARIOS[tag].source.files)
        .map(file => file.name)
        .filter(name => name.endsWith('.rule') || name.endsWith('.png'))
        .sort();

    expect(named('meteors-single')).toEqual(named('meteors'));
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
