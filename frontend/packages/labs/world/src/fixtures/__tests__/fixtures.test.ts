// The scenario catalogue, and what the mock API makes of it.
//
// These exist because a fixture is only useful if it is reachable by the name
// something else uses for it: the switcher offers a tag, the studio route
// carries a tag, and a test activates a tag. If those three drift, the failure
// is a lab that loads an empty project and says nothing about why.

import {describe, expect, it} from 'vitest';

import {VIEWPORT_TILES} from '../../runtime/viewport';
import {
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  WorldFixtures,
  DEFAULT_SCENARIO_TAG,
  isScenarioTag,
  type WorldScenarioTag,
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

  it('says the single-world platformer without leaving main.world', () => {
    const files = Object.values(
      WORLD_SCENARIOS['platformer-single'].source.files,
    );
    const worlds = files.filter(file => file.name.endsWith('.world'));

    expect(worlds).toHaveLength(1);
    expect(files.some(file => file.name.endsWith('.actor'))).toBe(false);
    expect(files.some(file => file.name.endsWith('.map'))).toBe(false);

    const main = worlds[0].contents;
    expect(main).toContain('world_create_in_map');
    expect(main).not.toContain('world_load_map');
    // All five of the player's handlers, which is what makes this pair the
    // fullest of the three: a jump, two things it says about falling, and the
    // count. A hat left behind in the move would be a game that runs and is
    // quietly missing a mechanic.
    for (const hat of [
      'world_on_Input_PressesEvent',
      'world_on_Gravity_StartsFallingEvent',
      'world_on_Gravity_StopsFallingEvent',
      'world_on_Collection_CollectsEvent',
    ]) {
      expect(main).toContain(hat);
    }
  });

  it('is the starter minus the files that moved into the world', () => {
    // Written as a subtraction (STARTER_SPEC), so what is checked is that the
    // subtraction took the right five and nothing else: a rule or a picture
    // dropped here would be a `use rule` pointing at nothing, and the dropdown
    // resolves that to another rule rather than saying so.
    const named = (tag: 'simple' | 'platformer-single') =>
      new Set(
        Object.values(WORLD_SCENARIOS[tag].source.files).map(file => file.name),
      );
    const starter = named('simple');
    const single = named('platformer-single');

    const missing = [...starter].filter(name => !single.has(name));
    expect(new Set(missing)).toEqual(
      new Set([
        'player.actor',
        'ground.actor',
        'coin.actor',
        'ball.actor',
        'level1.map',
      ]),
    );
    expect([...single].filter(name => !starter.has(name))).toEqual([]);
  });

  it('places the same board as the map it was made from', () => {
    // The two boards are one board (`LEVEL1_ACTORS`), grouped by kind on this
    // side because an arrangement belongs to the kind it places. Checked by
    // position rather than by count: a board with the right number of tiles in
    // the wrong places is the failure worth catching.
    const map = JSON.parse(
      Object.values(WORLD_SCENARIOS.simple.source.files).find(
        file => file.name === 'level1.map',
      )!.contents,
    ) as {actors: Array<{id: string; properties: object}>};

    const main = Object.values(
      WORLD_SCENARIOS['platformer-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;

    // Every arrangement entry across the four `create in map` blocks, as
    // `<id> <serialized overrides>` — which is the whole of what a placement
    // says, and comparable with what the map file says.
    const said = (entry: {id: string; properties: object}) =>
      `${entry.id} ${JSON.stringify(entry.properties)}`;
    const placed = new Set(
      [...main.matchAll(/"PLACEMENTS":(\[.*?\}\])(?=,"|\})/g)].flatMap(match =>
        (JSON.parse(match[1]) as Array<{id: string; properties: object}>).map(
          said,
        ),
      ),
    );

    expect(placed.size).toBe(map.actors.length);
    for (const actor of map.actors) {
      expect(placed).toContain(said(actor));
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

  it('gives tapper the mouse, and the rules a click is made of', () => {
    // The one scenario played with the pointer, and the only demonstration
    // there is that the driver's half of the mouse works: a click has to reach
    // the engine, become an event, and land a mark where the pointer was.
    const files = Object.values(WORLD_SCENARIOS.tapper.source.files);
    const named = (name: string) => files.some(file => file.name === name);
    const main = files.find(file => file.name === 'main.world')!.contents;

    // `mouse.rule` above all: holding it is what puts it in play, so a scenario
    // about the mouse that forgot the file would be a scenario about nothing.
    for (const rule of [
      'mouse.rule',
      'motion.rule',
      'collisions.rule',
      'collect.rule',
      'expires.rule',
    ]) {
      expect(named(rule)).toBe(true);
    }
    // Both halves of the rule are shown, which is the point of the scenario:
    // the WORLD's event (a click happened to nobody) and the ACTOR's (an actor
    // that elected `Takes Mouse Input` and hears the ones it asked for).
    expect(main).toContain('world_on_Mouse_IsPressedEvent');
    expect(main).toContain('world_on_Mouse_PressesMouseButtonEvent');
    expect(main).toContain('Mouse#TakesMouseInputTrait');
    // …and the thing no keyboard can say: WHERE.
    expect(main).toContain('world_mouse_position');
    // The crosshair is a FILE, and has to be: `each frame` compiles to
    // `actor.defineStep`, which needs the const an actor module opens with.
    const crosshair = files.find(file => file.name === 'crosshair.actor')!;
    expect(crosshair.contents).toContain('world_trait_step');
    expect(crosshair.contents).toContain('world_mouse_position');
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

  it('names no rules at all — the folder is the list', () => {
    // These worlds used to carry a `use rule` row per mechanic, and the test
    // here pinned the form those rows took (a NAME, never a module path, since
    // a path reads as a rule that could not be parsed). Holding the file is
    // the whole of putting a rule in play now (blockly/projectModules), so the
    // rows are gone from every scenario rather than left as no-ops that a
    // reader would take for the answer.
    //
    // Which rules each scenario HOLDS is checked per scenario below; this is
    // the other half, and it is what keeps a copied fixture from reintroducing
    // a second place to say it.
    for (const [tag, scenario] of Object.entries(WORLD_SCENARIOS)) {
      for (const file of Object.values(scenario.source.files)) {
        if (file.name.endsWith('.world')) {
          expect(`${tag}: ${file.contents}`).not.toContain('world_use_rule');
        }
      }
    }
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

  it('gives flappy a map bigger than the screen, and a camera to see it', () => {
    // The reason this scenario exists. A map ten tiles wide would make the
    // camera rules compile, run, and do nothing visible — which is the failure
    // that reads as "cameras work".
    const files = Object.values(WORLD_SCENARIOS.flappy.source.files);
    const contents = (name: string) =>
      files.find(file => file.name === name)?.contents ?? '';

    const map = JSON.parse(contents('flappy.map')) as {
      size: {width: number; height: number};
    };
    expect(map.size.width).toBeGreaterThan(VIEWPORT_TILES);
    // …and exactly one screen tall, which is why the header rules out the two
    // camera rules that only have something to say about y.
    expect(map.size.height).toBe(VIEWPORT_TILES);

    const main = contents('main.world');
    expect(main).toContain('world_define_camera');
    expect(main).toContain('Camera Follow#FollowsTrait');
    expect(main).toContain('Camera Confined#ConfinedToTheMapTrait');
    // The camera is wired up AFTER the map is loaded. Before it, `any ⟨Bird⟩`
    // is an empty list and the camera follows nothing for the whole game —
    // with nothing in the console to say so.
    expect(main.indexOf('world_load_map')).toBeLessThan(
      main.indexOf('world_define_camera'),
    );
    // And the world looks through the one it defined, not the one every world
    // has: the traits are on the new camera, so the default one would follow
    // nothing.
    expect(main).toContain('world_use_camera');
  });

  it('holds every rule flappy needs, including the ones it did not choose', () => {
    // Gravity requires Solid Bodies, and a project that names Gravity without
    // holding it does not run at all — "cannot resolve 'Solid Bodies'", which
    // is how this scenario first failed. Nothing in flappy is solid; the rule
    // is a dependency rather than a mechanic.
    const named = Object.values(WORLD_SCENARIOS.flappy.source.files).map(
      file => file.name,
    );
    for (const rule of [
      'gravity.rule',
      'solid.rule',
      'motion.rule',
      'collisions.rule',
      'input.rule',
      'collect.rule',
      'camera.rule',
      'cameraFollow.rule',
      'cameraConfined.rule',
    ]) {
      expect(named).toContain(rule);
    }
  });

  it('ends flappy rather than narrating it', () => {
    // Both ways to lose take the bird OUT. Logging alone left it flying
    // through the pipe with "Crashed!" once a frame, and stopping it instead
    // would be undone by the next flap — nothing here remembers that the game
    // is over.
    const bird = Object.values(WORLD_SCENARIOS.flappy.source.files).find(
      file => file.name === 'bird.actor',
    )!.contents;

    expect(bird).toContain('world_on_Collisions_StartsTouchingEvent');
    expect(bird).toContain('world_on_Space_LeftMapEvent');
    expect(
      [...bird.matchAll(/world_remove_actor/g)].length,
    ).toBeGreaterThanOrEqual(2);
    // And it does not start until asked: a world runs the moment it compiles,
    // so a bird that falls from frame one is gone before anyone has looked.
    expect(bird).toContain('world_set_Gravity_GravityScaleProperty');
  });

  it('says the single-world flappy without leaving main.world', () => {
    const files = Object.values(WORLD_SCENARIOS['flappy-single'].source.files);
    const worlds = files.filter(file => file.name.endsWith('.world'));

    expect(worlds).toHaveLength(1);
    expect(files.some(file => file.name.endsWith('.actor'))).toBe(false);
    expect(files.some(file => file.name.endsWith('.map'))).toBe(false);

    const main = worlds[0].contents;
    expect(main).toContain('world_create_in_map');
    expect(main).not.toContain('world_load_map');
    // The camera is handed a WORLD-LOCAL bird here, which is the one block
    // that reads the same as the file telling and means something narrower.
    expect(main).toContain('world_set_CameraFollow_ActorToFollowProperty');
    expect(main).toContain('"ACTOR":"local:flappyBirdDef"');
  });

  it('places flappy’s bird before the camera that follows it', () => {
    // The trap this telling makes sharper: `any ⟨Bird⟩` is READ when the
    // camera is wired, and an empty list is not an error. Wire it first and
    // the game runs, the bird flies, and the view never moves — with nothing
    // in the console to say why.
    const main = Object.values(
      WORLD_SCENARIOS['flappy-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;

    expect(main.indexOf('"id":"placeBird"')).toBeGreaterThan(-1);
    expect(main.indexOf('"id":"placeBird"')).toBeLessThan(
      main.indexOf('world_define_camera'),
    );
    // …and looking through it comes last of the three.
    expect(main.indexOf('world_define_camera')).toBeLessThan(
      main.indexOf('world_use_camera'),
    );
  });

  it('is the same game as the other flappy', () => {
    // The two differ in how the game is SAID, not in what it is made of.
    const named = (tag: 'flappy' | 'flappy-single') =>
      Object.values(WORLD_SCENARIOS[tag].source.files)
        .map(file => file.name)
        .filter(name => name.endsWith('.rule') || name.endsWith('.png'))
        .sort();

    expect(named('flappy-single')).toEqual(named('flappy'));

    // …including the board, which is one board (FLAPPY_ACTORS) told twice.
    const map = JSON.parse(
      Object.values(WORLD_SCENARIOS.flappy.source.files).find(
        file => file.name === 'flappy.map',
      )!.contents,
    ) as {actors: Array<{id: string; properties: object}>};

    const main = Object.values(
      WORLD_SCENARIOS['flappy-single'].source.files,
    ).find(file => file.name === 'main.world')!.contents;
    const said = (entry: {id: string; properties: object}) =>
      `${entry.id} ${JSON.stringify(entry.properties)}`;
    const placed = new Set(
      [...main.matchAll(/"PLACEMENTS":(\[.*?\}\])(?=,"|\})/g)].flatMap(match =>
        (JSON.parse(match[1]) as Array<{id: string; properties: object}>).map(
          said,
        ),
      ),
    );

    expect(placed.size).toBe(map.actors.length);
    for (const actor of map.actors) {
      expect(placed).toContain(said(actor));
    }
  });

  it('leaves the file list out of the scenarios with one file', () => {
    // A sidebar listing eleven files argues with a scenario whose whole claim
    // is that the game is said in `main.world` — and the first thing it
    // invites is the click that leaves it. Paired with the assertion that the
    // others keep it, because "hide the browser" applied to the starter would
    // be a project whose actors cannot be opened at all.
    const hides = (tag: WorldScenarioTag) =>
      WORLD_SCENARIOS[tag].levelData?.showFileBrowser === false;

    const single = WORLD_SCENARIO_TAGS.filter(tag => tag.endsWith('-single'));
    expect(single.length).toBe(4);
    for (const tag of single) {
      expect(hides(tag)).toBe(true);
    }
    for (const tag of WORLD_SCENARIO_TAGS.filter(t => !t.endsWith('-single'))) {
      expect(hides(tag)).toBe(false);
    }
  });

  it('carries a scenario’s levelData into what the host is served', () => {
    // The level properties are written once for all of them, so this is the
    // one field that has to be threaded through rather than stated — and a
    // scenario that set it and did not get it would look exactly like a
    // scenario that did not set it.
    for (const tag of WORLD_SCENARIO_TAGS) {
      const level = WorldFixtures[tag].levelProperties?.['1'] as {
        levelData?: object;
      };
      expect(level.levelData).toEqual(WORLD_SCENARIOS[tag].levelData);
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
