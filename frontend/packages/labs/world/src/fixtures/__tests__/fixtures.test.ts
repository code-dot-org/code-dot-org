// The scenario catalogue, and what the mock API makes of it.
//
// These exist because a fixture is only useful if it is reachable by the name
// something else uses for it: the switcher offers a tag, the studio route
// carries a tag, and a test activates a tag. If those three drift, the failure
// is a lab that loads an empty project and says nothing about why.

import {describe, expect, it} from 'vitest';

import {keyName, KEY_CHOICES} from '../../engine/core/keys';
import {lessonChannel} from '../../progression/lessonRoute';
import {LESSONS} from '../../progression/lessons';
import {VIEWPORT_TILES} from '../../runtime/viewport';
import {
  WORLD_SCENARIOS,
  WORLD_SCENARIO_TAGS,
  WorldFixtures,
  DEFAULT_SCENARIO_TAG,
  isFixtureTag,
  isScenarioTag,
} from '../index';

describe('the scenario catalogue', () => {
  it('has a fixture for every tag, and no tag without one', () => {
    // The switcher walks the tag list and the mock API is keyed by tag, so a
    // scenario in one and not the other is an option that loads nothing.
    //
    // The fixture record holds MORE than the tags now: a lesson has a channel
    // here too (`progression/lessonRoute`), served by the same mock through the
    // same `fixtureFor`, and it is deliberately not in the switcher's list —
    // lessons are reached from the progression map, not from the dropdown.
    expect(Object.keys(WORLD_SCENARIOS).sort()).toEqual(
      [...WORLD_SCENARIO_TAGS].sort(),
    );
    for (const tag of WORLD_SCENARIO_TAGS) {
      expect(WorldFixtures[tag], tag).toBeDefined();
    }
  });

  it('serves every lesson as a channel of its own', () => {
    // A lesson whose channel the mock does not answer is a Start button that
    // opens an empty project, and nothing says so (specs/PROGRESSION_UI.md).
    for (const id of Object.keys(LESSONS)) {
      expect(WorldFixtures[lessonChannel(id)], id).toBeDefined();
      expect(isFixtureTag(lessonChannel(id)), id).toBe(true);
    }
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

  it('gives tapper the mouse, and the rules a click is made of', () => {
    // The one scenario played with the pointer, and the only demonstration
    // there is that the driver's half of the mouse works: a click has to reach
    // the engine, become an event, and find what it landed on.
    const files = Object.values(WORLD_SCENARIOS.tapper.source.files);
    const named = (name: string) => files.some(file => file.name === name);
    const main = files.find(file => file.name === 'main.world')!.contents;

    // `mouse.rule` above all: holding it is what puts it in play, so a scenario
    // about the mouse that forgot the file would be a scenario about nothing.
    expect(named('mouse.rule')).toBe(true);
    // …and nothing else. The coins used to be hit by a mark that collected
    // them, which took four more rules to say "the pointer was over this" —
    // `Can Be Clicked` says it, so a scenario about the mouse now holds the
    // mouse rule alone.
    for (const rule of ['collisions.rule', 'collect.rule', 'expires.rule']) {
      expect(named(rule)).toBe(false);
    }
    // All THREE tellings are shown, which is the point of the scenario: the
    // WORLD's event (it happened to nobody), the coin's (`Can Be Clicked`,
    // raised only on what the press landed on), and the scoreboard's (`Takes
    // Mouse Input`, every press wherever it landed).
    expect(main).toContain('world_on_Mouse_IsPressedEvent');
    expect(main).toContain('world_on_Mouse_IsClickedWithEvent');
    expect(main).toContain('world_on_Mouse_PressesMouseButtonEvent');
    // …and the two traits, each in the file of the actor that elects it.
    const actor = (name: string) =>
      files.find(file => file.name === name)!.contents;
    expect(actor('coin.actor')).toContain('Mouse#CanBeClickedTrait');
    expect(actor('scoreboard.actor')).toContain('Mouse#TakesMouseInputTrait');
    // …and the count, which is the world's own state (specs/WORLD_STATE.md).
    // The scenario logged `Got one!` for as long as there was nowhere to put a
    // number that outlives the coin raising the event.
    expect(main).toContain('world_rule_property');
    expect(main).toContain('world_set_WorldsMain_ScoreProperty');
    expect(main).toContain('world_get_WorldsMain_ScoreProperty');
    // Shown, not logged: a Label is an ordinary actor that draws its text.
    expect(named('label.actor')).toBe(true);
    // Words and a number, chained: `⟨SCORE ⟩ + ⟨“ the score ”⟩`.
    expect(main).toContain('world_as_text');
    // …and the thing no keyboard can say: WHERE.
    expect(main).toContain('world_mouse_position');
    // The crosshair is a FILE, and has to be: `each frame` compiles to
    // `actor.defineStep`, which needs the const an actor module opens with.
    // A RULE WITH ONE TRAIT — the one thing an actor's own `each frame`
    // cannot be, which is shared. Two kinds carry this one, and the coins
    // carry their own copy of its state, which is the whole claim.
    expect(named('spin.rule')).toBe(true);
    const carriers = files.filter(file =>
      file.contents.includes('Spin#SpinTrait'),
    );
    expect(carriers.map(file => file.name).sort()).toEqual([
      'coin.actor',
      'crosshair.actor',
    ]);
    // Each coin's own copy of the behavior's state, set from the loop's
    // counters — where it used to be written into nine map placements, which is
    // a thing no editor in this lab can do (the `create in map` popup places
    // prefabs and has no inspector).
    expect(main).toContain('world_set_Spin_SpinSpeedProperty');
    expect(main).toContain('world_count_with');

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
      'zaps.rule',
      'expires.rule',
      'collisions.rule',
      'input.rule',
      'motion.rule',
    ]) {
      expect(named(rule)).toBe(true);
    }
    for (const actor of ['ship.actor', 'energyBall.actor', 'meteor.actor']) {
      expect(named(actor)).toBe(true);
    }
  });

  it('asks to zap in one place and says what a zap sends in another', () => {
    // The Shooting rule's whole design: pressing a key ASKS and the cooldown
    // answers, so a held key is not a wall of energy balls. Spawning the ball
    // straight from the key press would be a gun with no rate limit — it would
    // look identical until someone held the key down.
    const ship = Object.values(WORLD_SCENARIOS.meteors.source.files).find(
      file => file.name === 'ship.actor',
    )!.contents;

    expect(ship).toContain('world_do_Zapping_MakeZapAction');
    expect(ship).toContain('world_on_Zapping_ZapsEvent');
    // And the ball is spawned NAMED, because inside `add actor` the words
    // `this actor` mean the new one — a ball put where the ship is cannot be
    // written otherwise without silently reading the ball's own position.
    expect(ship).toContain('"NAMED":"named"');
    expect(ship).toContain('world_vector_rotate');
  });

  it('takes its energy balls away again', () => {
    // The other half of spawning. Without Expiry a game slowly fills with
    // balls and grinds down, which presents as "it gets slower the longer
    // you play" and is very hard to see in a short demo.
    const ball = Object.values(WORLD_SCENARIOS.meteors.source.files).find(
      file => file.name === 'energyBall.actor',
    )!.contents;

    expect(ball).toContain('Expiry#ExpiresTrait');
    expect(ball).toContain('world_set_Expiry_LifetimeProperty');
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

  it('shows the file list in every scenario', () => {
    // The single-world tellings hid it, and they are gone: every actor is a
    // file, and a scenario is a project to look around in.
    for (const tag of WORLD_SCENARIO_TAGS) {
      expect(WORLD_SCENARIOS[tag].levelData?.showFileBrowser).not.toBe(false);
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

// Every file's LANGUAGE against its name.
//
// The language is what the editor opens a file WITH: `.actor` with `world`,
// `actor`, `rule` or `map` on it gets a Blockly workspace, and anything else
// gets a text editor. Sokoban shipped every one of its files as `json`, so the
// whole scenario opened as raw serialization — a project you could look at and
// not edit. Nothing failed; the tests here compile from PATHS, which is why
// they were all green while the lab was unusable.
describe('the language on each file', () => {
  /** What a file of this name has to be opened as. */
  const wanted: Record<string, string> = {
    world: 'world',
    actor: 'actor',
    rule: 'rule',
    map: 'map',
    anim: 'anim',
    effect: 'effect',
  };

  it('matches what the name says the file is', () => {
    const wrong: string[] = [];
    for (const tag of WORLD_SCENARIO_TAGS) {
      for (const file of Object.values(WORLD_SCENARIOS[tag].source.files)) {
        const extension = file.name.split('.').pop() ?? '';
        const expected = wanted[extension];
        if (expected && file.language !== expected) {
          wrong.push(`${tag}: ${file.name} is '${file.language}'`);
        }
      }
    }

    expect(wrong).toEqual([]);
  });
});

// Every key a handler waits for, against the names the world is ever sent.
//
// The driver translates `KeyboardEvent.key` before `setInput`
// (`engine/core/keys`), so the lab's name is what a handler must be registered
// for: "up arrow", not "ArrowUp". Sokoban shipped with all four of its
// controls waiting for browser names, which meant a board that rendered and
// could not be moved — and nine tests passed, because they fed `setInput`
// directly and so fed something the running lab never sends.
describe('the keys a handler waits for', () => {
  it('are never the browser’s name for one the lab renames', () => {
    // A key the table does not rename passes through unchanged, so "F7" is
    // fine and this cannot just demand membership of a list. What it can say
    // is that no handler waits for a name the driver will have replaced.
    const renamed = new Set(
      KEY_CHOICES.map(([, value]) => value).filter(
        value => keyName(value) !== value,
      ),
    );
    const domNames = new Set(
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].filter(
        dom => keyName(dom) !== dom,
      ),
    );
    const wrong: string[] = [];

    for (const tag of WORLD_SCENARIO_TAGS) {
      for (const file of Object.values(WORLD_SCENARIOS[tag].source.files)) {
        for (const match of file.contents.matchAll(
          /"world_on_Input_[A-Za-z]*Event"[\s\S]{0,200}?"FILTER0":\s*"([^"]*)"/g,
        )) {
          const key = match[1];
          if (domNames.has(key) || renamed.has(key)) {
            wrong.push(`${tag}: ${file.name} waits for "${key}"`);
          }
        }
      }
    }

    expect(wrong).toEqual([]);
  });
});

describe('every actor file a scenario ships', () => {
  /** Each `.actor` in every scenario, as its parsed roots. */
  const actorFiles = Object.entries(WORLD_SCENARIOS).flatMap(
    ([tag, scenario]) =>
      Object.values(scenario.source.files)
        .filter(file => file.name.endsWith('.actor'))
        .map(file => ({
          where: `${tag}/${file.name}`,
          roots: (JSON.parse(file.contents).blocks?.blocks ?? []) as Array<{
            type: string;
          }>,
        })),
  );

  it('has some, or this is checking nothing', () => {
    expect(actorFiles.length).toBeGreaterThan(20);
  });

  it('chains every `each frame` under the `define actor`', () => {
    // A step left standing on its own is TWO failures at once, and the second
    // is the quiet one: `DisableOrphansPlugin` grays it out, and its generator
    // writes nothing because the top of its chain is not a `define actor`
    // (`domainBlocks.worldTraitStep`). So the actor simply stops doing that
    // work, and the file still loads and still compiles.
    const loose = actorFiles.flatMap(({where, roots}) =>
      roots.some(root => root.type === 'world_trait_step') ? [where] : [],
    );

    expect(loose).toEqual([]);
  });

  it('still gives each of them a `define actor` to chain under', () => {
    // The other half: the fix for the above is not "delete the step".
    const headless = actorFiles.flatMap(({where, roots}) =>
      roots.some(root => root.type === 'world_actor') ? [] : [where],
    );

    expect(headless).toEqual([]);
  });
});
