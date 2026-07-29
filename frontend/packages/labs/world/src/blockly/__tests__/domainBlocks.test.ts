import {afterEach, describe, expect, it} from 'vitest';

import {DOMAIN_BLOCKS, DOMAIN_TOOLBOX} from '../domainBlocks';
import {setProjectMaps} from '../moduleOptions';

// The domain blocks each carry a `world-lab` JavaScript generator. These test
// them in isolation with fake `block`/`generator` objects — no rendered Blockly
// workspace — locking the exact code each block emits. The assembly that orders
// them into a module is covered by assembleActorModule.test.ts.

const generatorFor = (type: string) => {
  const block = DOMAIN_BLOCKS.find(b => b.type === type);
  if (!block) {
    throw new Error(`no domain block '${type}'`);
  }
  return block.generator.javascript;
};

/**
 * Run a block's generator with fake field values and statement bodies. The real
 * `block`/`generator`/`environment` are a rendered Blockly workspace's; these
 * blocks only read fields and `statementToCode`, so canned stand-ins suffice.
 */
const emit = (
  type: string,
  fields: Record<string, string | number>,
  statements: Record<string, string> = {},
  values: Record<string, string> = {},
): string => {
  const block = {getFieldValue: (name: string) => fields[name]};
  const generator = {
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as string;
};

describe('domain block generators', () => {
  it('world_actor builds the actor and its body, without the export', () => {
    const code = emit(
      'world_actor',
      {ID: 'player', NAME: 'Player'},
      {BODY: 'actor.useTraits([X]);\n'},
    );
    expect(code).toContain(`import * as WorldLab from 'world-lab';`);
    expect(code).toContain(
      `const actor = new WorldLab.ActorBuilder({id: "player", name: "Player"});`,
    );
    expect(code).toContain('actor.useTraits([X]);');
    // The export is the assembly's job, not this block's.
    expect(code).not.toContain('export default');
  });

  it('world_use_trait maps the dropdown to a trait', () => {
    expect(emit('world_use_trait', {TRAIT: 'affected'})).toBe(
      'actor.useTraits([WorldLab.AffectedByGravityTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'ground'})).toBe(
      'actor.useTraits([WorldLab.GroundTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'controlled'})).toBe(
      'actor.useTraits([WorldLab.ControlledByArrowsTrait]);\n',
    );
  });

  it('world_set_position sets a Vector from the numeric fields', () => {
    // No ACTOR value plugged in → defaults to the current actor (the shadow
    // `this actor` generates `actor`).
    expect(emit('world_set_position', {X: 200, Y: 20})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(200, 20));\n',
    );
  });

  it('world_set_position targets the ACTOR value when one is plugged in', () => {
    expect(
      emit('world_set_position', {X: 0, Y: 0}, {}, {ACTOR: 'touched'}),
    ).toBe(
      'touched.set(WorldLab.PositionProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_this_actor / world_touched_actor yield actor expressions', () => {
    const thisActor = generatorFor('world_this_actor')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(thisActor) && thisActor[0]).toBe('actor');
    const touched = generatorFor('world_touched_actor')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(touched) && touched[0]).toBe('touched');
  });

  it('world_for_each_touching loops the touching query, by template id', () => {
    // The dropdown value is the module path; the runtime type is its basename.
    expect(
      emit(
        'world_for_each_touching',
        {ACTOR: 'actors/coin'},
        {DO: 'touched.set(X, Y);\n'},
      ),
    ).toBe(
      'for (const touched of world.query(WorldLab.TouchingQuery, actor, "coin")) {\n' +
        'touched.set(X, Y);\n}\n',
    );
  });

  it('world_set_sprite elects the appearance trait and sets the sprite', () => {
    expect(emit('world_set_sprite', {SPRITE: 'player'})).toBe(
      'actor.useTraits([WorldLab.AppearanceTrait]);\n' +
        'actor.set(WorldLab.SpriteProperty, "player");\n',
    );
  });

  it('world_play_animation elects the appearance trait and sets the animation', () => {
    expect(emit('world_play_animation', {ANIMATION: 'coinSpin'})).toBe(
      'actor.useTraits([WorldLab.AppearanceTrait]);\n' +
        'actor.set(WorldLab.AnimationProperty, "coinSpin");\n',
    );
  });

  it('world_on_event registers a handler binding the event value', () => {
    expect(
      emit(
        'world_on_event',
        {EVENT: 'startsFalling'},
        {HANDLER: 'console.log("hi");\n'},
      ),
    ).toBe(
      'actor.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n' +
        'console.log("hi");\n});\n',
    );
  });

  it('world_on_event handles the frameChanged event', () => {
    expect(
      emit(
        'world_on_event',
        {EVENT: 'frameChanged'},
        {HANDLER: 'console.log(eventValue);\n'},
      ),
    ).toBe(
      'actor.on(WorldLab.FrameChangedEvent, (world, actor, eventValue) => {\n' +
        'console.log(eventValue);\n});\n',
    );
  });

  it('event blocks register the handler on their ACTOR value', () => {
    // Default (empty socket → `this actor` shadow) registers on `actor`.
    expect(
      emit('world_on_event', {EVENT: 'startsFalling'}, {HANDLER: ''}),
    ).toBe(
      'actor.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n});\n',
    );
    // A plugged-in actor value registers on it instead.
    expect(
      emit(
        'world_on_event',
        {EVENT: 'startsFalling'},
        {HANDLER: ''},
        {
          ACTOR: 'other',
        },
      ),
    ).toBe(
      'other.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n});\n',
    );
  });

  it('world_on_key filters the pressed/released key event to the chosen key', () => {
    expect(
      emit('world_on_key', {KEY: ' ', STATE: 'keyPressed'}, {HANDLER: 'x;\n'}),
    ).toBe(
      'actor.on(WorldLab.KeyPressedEvent, (world, actor, eventValue) => {\n' +
        'if (eventValue === " ") {\nx;\n}\n});\n',
    );
    // The STATE dropdown selects which event to hang off.
    expect(
      emit('world_on_key', {KEY: 'a', STATE: 'keyReleased'}, {HANDLER: ''}),
    ).toContain('actor.on(WorldLab.KeyReleasedEvent');
  });

  it('world_log prints the text field', () => {
    expect(emit('world_log', {TEXT: 'Player landed!'})).toBe(
      'console.log("Player landed!");\n',
    );
  });

  it('world_print logs a value input', () => {
    expect(emit('world_print', {}, {}, {VALUE: 'eventValue'})).toBe(
      'console.log(eventValue);\n',
    );
    // No value connected → prints an empty string, not `undefined`.
    expect(emit('world_print', {})).toBe("console.log('');\n");
  });

  it('world_event_value yields the handler event value as an expression', () => {
    const result = generatorFor('world_event_value')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(result) && result[0]).toBe('eventValue');
  });

  it('offers the standard logic/math/text blocks in the toolbox', () => {
    const toolboxTypes = (DOMAIN_TOOLBOX as Array<{blocks: string[]}>).flatMap(
      c => c.blocks,
    );
    for (const t of ['controls_if', 'logic_compare', 'math_number', 'text']) {
      expect(toolboxTypes).toContain(t);
    }
  });
});

describe('scene block generators', () => {
  // The scene blocks read block.id and register imports on generator.definitions_
  // (which Blockly's finish() hoists), so they need richer fakes than `emit`.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) =>
    generatorFor(type)(
      {getFieldValue: (n: string) => block[n], id: block.id} as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
      } as never,
      {} as never,
    ) as string;

  it('world_scene builds the scene, imports the world, and hosts the body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_scene',
      {ID: 'game', NAME: 'Game', WORLD: 'worlds/platform'},
      defs,
      '{ /* add */ }\n',
    );
    expect(code).toContain(
      'const scene = new WorldLab.SceneBuilder({id: "game", name: "Game"});',
    );
    expect(code).toContain('scene.useWorld(Platform);');
    expect(code).toContain('{ /* add */ }');
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
    expect(defs['mod:worlds/platform']).toBe(
      'import Platform from "worlds/platform";',
    );
  });

  it('world_add_actor block-scopes the instance, using the block id as its id', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin'},
      defs,
      'actor.set(X);\n',
    );
    expect(code).toBe(
      '{\nconst actor = scene.addActor(Coin, "add-coin");\nactor.set(X);\n}\n',
    );
    expect(defs['mod:actors/coin']).toBe('import Coin from "actors/coin";');
  });
});

describe('world block generators', () => {
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) =>
    generatorFor(type)(
      {getFieldValue: (n: string) => block[n], id: block.id} as never,
      {definitions_: definitions, statementToCode: () => body} as never,
      {} as never,
    ) as string;

  it('world_world builds the world and hosts its body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_world',
      {ID: 'platform', NAME: 'Platform World'},
      defs,
      'world.useRules([X]);\n',
    );
    expect(code).toBe(
      'const world = new WorldLab.WorldBuilder({id: "platform", name: "Platform World"});\n' +
        'world.useRules([X]);\n',
    );
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
  });

  it('world_use_rule adds a rule by its world-lab export name', () => {
    expect(run('world_use_rule', {RULE: 'GravityRule'}, {}, '')).toBe(
      'world.useRules([WorldLab.GravityRule]);\n',
    );
  });

  it('world_use_animations imports the file and registers its animations', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_use_animations',
      {FILE: 'animations/game'},
      defs,
      '',
    );
    expect(code).toBe(
      'world.useAnimations(WorldLab.parseAnimationFile(Game));\n',
    );
    expect(defs['mod:animations/game']).toBe(
      'import Game from "animations/game";',
    );
  });
});

describe('world_load_map generator', () => {
  afterEach(() => setProjectMaps({}));

  it('imports+defines each actor the map places, then populates', () => {
    setProjectMaps({'maps/level1': ['actors/player', 'actors/coin']});
    const defs: Record<string, string> = {};
    const code = generatorFor('world_load_map')(
      {getFieldValue: () => 'maps/level1'} as never,
      {definitions_: defs, statementToCode: () => ''} as never,
      {} as never,
    ) as string;
    expect(code).toBe(
      'scene.define("actors/player", Player);\n' +
        'scene.define("actors/coin", Coin);\n' +
        'scene.populate(Level1);\n',
    );
    expect(defs['mod:actors/player']).toBe(
      'import Player from "actors/player";',
    );
    expect(defs['mod:actors/coin']).toBe('import Coin from "actors/coin";');
    expect(defs['map:maps/level1']).toBe('import Level1 from "maps/level1";');
  });
});
