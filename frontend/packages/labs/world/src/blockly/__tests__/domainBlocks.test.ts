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
  next = '',
): string => {
  // Cap-hat blocks (events) read their body from the next-connected chain via
  // `blockToCode(getNextBlock())`; stand that in with a sentinel + `next` string.
  const nextBlock = next ? {} : null;
  const block = {
    getFieldValue: (name: string) => fields[name],
    getNextBlock: () => nextBlock,
  };
  const generator = {
    statementToCode: (_block: unknown, name: string) => statements[name] ?? '',
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
    blockToCode: (b: unknown) => (b === nextBlock && next ? next : ''),
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as string;
};

describe('domain block generators', () => {
  it('world_actor builds the actor and its body, without the export', () => {
    // The body (traits/behaviors) chains below the actor root, not in a `do`
    // input — so it is fed via `next`.
    const code = emit(
      'world_actor',
      {NAME: 'Player'},
      {},
      {},
      'actor.useTraits([X]);\n',
    );
    expect(code).toContain(`import * as WorldLab from 'world-lab';`);
    // The id is derived from the name (spaces → underscores).
    expect(code).toContain(
      `const actor = new WorldLab.ActorBuilder({id: "Player", name: "Player"});`,
    );
    expect(code).toContain('actor.useTraits([X]);');
    // The export is the assembly's job, not this block's.
    expect(code).not.toContain('export default');
  });

  it('world_use_trait uses the dropdown value (a trait export name) directly', () => {
    expect(emit('world_use_trait', {TRAIT: 'CollidableTrait'})).toBe(
      'actor.useTraits([WorldLab.CollidableTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'ControlledByArrowsTrait'})).toBe(
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

  it('world_set_sprite sets the sprite on the ACTOR value (no trait election)', () => {
    // Default (empty socket → `this actor`) sets it on the current actor.
    expect(emit('world_set_sprite', {SPRITE: 'player'})).toBe(
      'actor.set(WorldLab.SpriteProperty, "player");\n',
    );
    // A plugged-in actor (e.g. a loop's touched actor) is set instead.
    expect(
      emit('world_set_sprite', {SPRITE: 'switch'}, {}, {ACTOR: 'touched'}),
    ).toBe('touched.set(WorldLab.SpriteProperty, "switch");\n');
  });

  it('world_play_animation plays the animation on the ACTOR value (restarting it)', () => {
    // Default (empty socket → `this actor`) plays it on the current actor.
    expect(emit('world_play_animation', {ANIMATION: 'coinSpin'})).toBe(
      'WorldLab.playAnimation(actor, "coinSpin");\n',
    );
    // A plugged-in actor (e.g. a loop's touched actor) is played instead.
    expect(
      emit(
        'world_play_animation',
        {ANIMATION: 'switch'},
        {},
        {ACTOR: 'touched'},
      ),
    ).toBe('WorldLab.playAnimation(touched, "switch");\n');
  });

  it('per-event blocks wrap the body chained below them (next), by event', () => {
    // Each engine event has its own `world_on_<id>` cap hat; the handler body is
    // the blocks connected below it (the next chain), wrapped in `.on(...)`.
    expect(
      emit('world_on_startsFalling', {}, {}, {}, 'console.log("hi");\n'),
    ).toBe(
      'actor.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n' +
        'console.log("hi");\n});\n',
    );
    expect(
      emit('world_on_frameChanged', {}, {}, {}, 'console.log(eventValue);\n'),
    ).toBe(
      'actor.on(WorldLab.FrameChangedEvent, (world, actor, eventValue) => {\n' +
        'console.log(eventValue);\n});\n',
    );
  });

  it('event blocks register the handler on their ACTOR value', () => {
    // Default (empty socket → `this actor` shadow) registers on `actor`; an
    // empty next chain yields an empty handler body.
    expect(emit('world_on_startsFalling', {}, {}, {})).toBe(
      'actor.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n});\n',
    );
    // A plugged-in actor value registers on it instead.
    expect(emit('world_on_startsFalling', {}, {}, {ACTOR: 'other'})).toBe(
      'other.on(WorldLab.StartsFallingEvent, (world, actor, eventValue) => {\n});\n',
    );
  });

  it('key event blocks filter the chosen key, one block per event', () => {
    // `presses` and `releases` are distinct blocks (no STATE dropdown), each hung
    // off its own Input event, keeping the KEY dropdown filter; body is the chain.
    expect(emit('world_on_keyPressed', {KEY: ' '}, {}, {}, 'x;\n')).toBe(
      'actor.on(WorldLab.KeyPressedEvent, (world, actor, eventValue) => {\n' +
        'if (eventValue === " ") {\nx;\n}\n});\n',
    );
    expect(emit('world_on_keyReleased', {KEY: 'a'}, {}, {})).toContain(
      'actor.on(WorldLab.KeyReleasedEvent',
    );
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

  it('generated actor-property set blocks set the property on the ACTOR value', () => {
    // A number actor property (spatial rotation): `set rotation of [actor] to n`.
    expect(emit('world_set_RotationProperty', {VALUE: 45})).toBe(
      'actor.set(WorldLab.RotationProperty, 45);\n',
    );
    // Plugged-in actor value targets it instead.
    expect(
      emit('world_set_RotationProperty', {VALUE: 90}, {}, {ACTOR: 'touched'}),
    ).toBe('touched.set(WorldLab.RotationProperty, 90);\n');
    // A vector actor property (spatial scale): x/y fields → a Vector.
    expect(emit('world_set_ScaleProperty', {X: 2, Y: 3})).toBe(
      'actor.set(WorldLab.ScaleProperty, new WorldLab.Vector(2, 3));\n',
    );
  });

  it('generated world-property set blocks set the property on the world', () => {
    // A number world property (gravity strength) — no ACTOR input, targets world.
    expect(emit('world_set_StrengthProperty', {VALUE: 500})).toBe(
      'world.set(WorldLab.StrengthProperty, 500);\n',
    );
    // A vector world property (gravity direction).
    expect(emit('world_set_DirectionProperty', {X: 0, Y: -1})).toBe(
      'world.set(WorldLab.DirectionProperty, new WorldLab.Vector(0, -1));\n',
    );
  });

  it('registers every world_ block the toolbox references', () => {
    // The rule categories reference generated event types (`world_on_<id>`); this
    // catches any drift between what the toolbox lists and what is registered.
    const registered = new Set(DOMAIN_BLOCKS.map(b => b.type));
    const toolboxTypes = (DOMAIN_TOOLBOX as Array<{blocks: string[]}>).flatMap(
      c => c.blocks,
    );
    for (const t of toolboxTypes.filter(t => t.startsWith('world_'))) {
      expect(registered).toContain(t);
    }
    // Each rule's events are surfaced: the gravity, input, and animation hats.
    for (const t of [
      'world_on_startsFalling',
      'world_on_stopsFalling',
      'world_on_keyPressed',
      'world_on_keyReleased',
      'world_on_animationEnded',
      'world_on_frameChanged',
    ]) {
      expect(toolboxTypes).toContain(t);
    }
  });

  it('surfaces generated property setters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Motion had no blocks before; its velocity setter now populates it.
    expect(category('Has Physics')).toContain('world_set_VelocityProperty');
    // Gravity gains its world properties and its actor property.
    expect(category('Has Gravity')).toEqual(
      expect.arrayContaining([
        'world_set_StrengthProperty',
        'world_set_DirectionProperty',
        'world_set_GravityScaleProperty',
      ]),
    );
    // Spatial keeps the bespoke set-position and gains scale/rotation/skew.
    expect(category('Has Space')).toEqual(
      expect.arrayContaining([
        'world_set_position',
        'world_set_ScaleProperty',
        'world_set_RotationProperty',
        'world_set_SkewProperty',
      ]),
    );
  });
});

describe('scene block generators', () => {
  // The scene blocks read block.id and register imports on generator.definitions_
  // (which Blockly's finish() hoists), so they need richer fakes than `emit`. The
  // scene root reads its body from the next chain (`blockToCode(getNextBlock())`);
  // `world_add_actor` still reads its `DO` input via `statementToCode` — the fake
  // returns `body` for both.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) => {
    const nextBlock = body ? {} : null;
    return generatorFor(type)(
      {
        getFieldValue: (n: string) => block[n],
        id: block.id,
        getNextBlock: () => nextBlock,
      } as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
        blockToCode: (b: unknown) => (b === nextBlock ? body : ''),
      } as never,
      {} as never,
    ) as string;
  };

  it('world_scene builds the scene, imports the world, and hosts the body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_scene',
      {NAME: 'Game', WORLD: 'worlds/platform'},
      defs,
      '{ /* add */ }\n',
    );
    // The id is derived from the name.
    expect(code).toContain(
      'const scene = new WorldLab.SceneBuilder({id: "Game", name: "Game"});',
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
  // The world root reads its body from the next chain, like the actor/scene root.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
  ) => {
    const nextBlock = body ? {} : null;
    return generatorFor(type)(
      {
        getFieldValue: (n: string) => block[n],
        id: block.id,
        getNextBlock: () => nextBlock,
      } as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
        blockToCode: (b: unknown) => (b === nextBlock ? body : ''),
      } as never,
      {} as never,
    ) as string;
  };

  it('world_world builds the world and hosts its body', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_world',
      {NAME: 'Platform World'},
      defs,
      'world.useRules([X]);\n',
    );
    // The id is derived from the name: spaces become underscores.
    expect(code).toBe(
      'const world = new WorldLab.WorldBuilder({id: "Platform_World", name: "Platform World"});\n' +
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
