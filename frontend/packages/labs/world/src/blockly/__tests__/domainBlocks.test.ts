import {afterEach, describe, expect, it} from 'vitest';

import {
  buildDomainPalette,
  DOMAIN_BLOCKS,
  DOMAIN_TOOLBOX,
  ROOT_BLOCK_TYPES,
} from '../domainBlocks';
import {
  ACTOR_DEFINITION_EXTENSION,
  TRAIT_CONTEXT_EXTENSION,
} from '../extensions/actorContext';
import {setProjectMaps} from '../moduleOptions';
import {parseRuleMeta} from '../ruleMeta';

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

/** Run a value (reporter) block's generator; returns its `[code, order]` tuple. */
const emitValue = (
  type: string,
  // A field value is usually a scalar, but a custom field (the vector field)
  // holds a structured `{x, y}`.
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): [string, number] => {
  const block = {getFieldValue: (name: string) => fields[name]};
  const generator = {
    valueToCode: (_block: unknown, name: string) => values[name] ?? '',
  };
  return generatorFor(type)(
    block as never,
    generator as never,
    {} as never,
  ) as [string, number];
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

  it('world_use_trait references a built-in trait via WorldLab', () => {
    expect(emit('world_use_trait', {TRAIT: 'CollidableTrait'})).toBe(
      'actor.useTraits([WorldLab.CollidableTrait]);\n',
    );
    expect(emit('world_use_trait', {TRAIT: 'ControlledByArrowsTrait'})).toBe(
      'actor.useTraits([WorldLab.ControlledByArrowsTrait]);\n',
    );
  });

  it('world_use_trait imports a project trait (module#export) from its module', () => {
    const defs: Record<string, string> = {};
    const code = generatorFor('world_use_trait')(
      {getFieldValue: () => 'rules/wind#WindblownTrait'} as never,
      {definitions_: defs} as never,
      {} as never,
    );
    expect(code).toBe('actor.useTraits([WindblownTrait]);\n');
    expect(defs['named:rules/wind:WindblownTrait']).toBe(
      'import {WindblownTrait} from "rules/wind";',
    );
  });

  it('world_set_position reads a Vector from the x/y value sockets', () => {
    // X/Y are value sockets: their code comes from `valueToCode` (a shadow
    // math_number, or a plugged getter/math block). No ACTOR value → `actor`.
    expect(emit('world_set_position', {}, {}, {X: '200', Y: '20'})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(200, 20));\n',
    );
    // A getter slotted into X composes into the Vector.
    expect(
      emit(
        'world_set_position',
        {},
        {},
        {X: 'actor.get(WorldLab.PositionProperty).x', Y: '20'},
      ),
    ).toBe(
      'actor.set(WorldLab.PositionProperty, ' +
        'new WorldLab.Vector(actor.get(WorldLab.PositionProperty).x, 20));\n',
    );
    // Empty sockets fall back to the block's defaults (0, 0).
    expect(emit('world_set_position', {}, {}, {})).toBe(
      'actor.set(WorldLab.PositionProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_set_position targets the ACTOR value when one is plugged in', () => {
    expect(
      emit('world_set_position', {}, {}, {ACTOR: 'touched', X: '0', Y: '0'}),
    ).toBe(
      'touched.set(WorldLab.PositionProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_this_actor yields the principal actor expression', () => {
    const thisActor = generatorFor('world_this_actor')(
      {} as never,
      {} as never,
      {} as never,
    );
    expect(Array.isArray(thisActor) && thisActor[0]).toBe('actor');
  });

  it('variables_get_Actor reads its bound variable name', () => {
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'id7' : ''),
    };
    const generator = {getVariableName: (id: string) => `v_${id}`};
    const code = generatorFor('variables_get_Actor')(
      block as never,
      generator as never,
      {} as never,
    );
    expect(Array.isArray(code) && code[0]).toBe('v_id7');
  });

  it('world_is_a tests an actor value against a module path', () => {
    // Default (empty ACTOR socket → `this actor`).
    expect(emitValue('world_is_a', {TYPE: 'actors/coin'})[0]).toBe(
      'actor.type === "actors/coin"',
    );
    // A plugged-in actor (e.g. a loop variable) is tested instead.
    expect(
      emitValue('world_is_a', {TYPE: 'actors/coin'}, {ACTOR: 'each'})[0],
    ).toBe('each.type === "actors/coin"');
  });

  it('world_for_each iterates world.actors, guarded by its where predicate', () => {
    const block = {
      getFieldValue: (name: string) => (name === 'VAR' ? 'vid' : ''),
    };
    const generator = {
      getVariableName: (id: string) => (id === 'vid' ? 'each' : id),
      valueToCode: (_b: unknown, name: string) =>
        name === 'WHERE' ? 'each.type === "actors/coin"' : '',
      statementToCode: (_b: unknown, name: string) =>
        name === 'DO' ? 'each.set(X, Y);\n' : '',
    };
    const code = generatorFor('world_for_each')(
      block as never,
      generator as never,
      {} as never,
    );
    expect(code).toBe(
      'for (const each of world.actors) {\n' +
        'if (each.type === "actors/coin") {\n' +
        'each.set(X, Y);\n}\n}\n',
    );
  });

  it('world_query_IsTouchingQuery reads its two actor sockets', () => {
    // Empty sockets default to `this actor` on both sides.
    expect(emitValue('world_query_IsTouchingQuery')[0]).toBe(
      'world.query(WorldLab.IsTouchingQuery, actor, actor)',
    );
    // A subject and a candidate plugged in (e.g. this actor vs a loop variable).
    expect(
      emitValue('world_query_IsTouchingQuery', {}, {A: 'actor', B: 'each'})[0],
    ).toBe('world.query(WorldLab.IsTouchingQuery, actor, each)');
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

  it('world_return reports its value (a query body ends in one)', () => {
    expect(
      emit(
        'world_return',
        {},
        {},
        {VALUE: 'actor.get(WorldLab.SpeedProperty)'},
      ),
    ).toBe('return actor.get(WorldLab.SpeedProperty);\n');
    // No value connected → returns `undefined`, not an empty statement.
    expect(emit('world_return', {})).toBe('return undefined;\n');
  });

  it('world_step_delta yields the frame delta (bound in a step closure)', () => {
    expect(emitValue('world_step_delta')[0]).toBe('delta');
  });

  it('world_has_trait tests actor.has(trait)', () => {
    // A built-in trait reads `WorldLab.<Trait>`; the actor comes from its socket.
    expect(
      emitValue(
        'world_has_trait',
        {TRAIT: 'AffectedByGravityTrait'},
        {ACTOR: 'each'},
      )[0],
    ).toBe('each.has(WorldLab.AffectedByGravityTrait)');
    // Empty socket → the principal `actor`.
    expect(emitValue('world_has_trait', {TRAIT: 'GroundTrait'})[0]).toBe(
      'actor.has(WorldLab.GroundTrait)',
    );
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
    // The value comes from a socket (`valueToCode`) — a shadow number, or a
    // slotted getter/math block. A number actor property (spatial rotation):
    expect(emit('world_set_RotationProperty', {}, {}, {VALUE: '45'})).toBe(
      'actor.set(WorldLab.RotationProperty, 45);\n',
    );
    // Plugged-in actor value targets it instead.
    expect(
      emit(
        'world_set_RotationProperty',
        {},
        {},
        {ACTOR: 'touched', VALUE: '90'},
      ),
    ).toBe('touched.set(WorldLab.RotationProperty, 90);\n');
    // A getter slotted into the value composes through.
    expect(
      emit(
        'world_set_RotationProperty',
        {},
        {},
        {VALUE: 'actor.get(WorldLab.RotationProperty)'},
      ),
    ).toBe(
      'actor.set(WorldLab.RotationProperty, actor.get(WorldLab.RotationProperty));\n',
    );
    // An empty socket falls back to the property default (rotation 0).
    expect(emit('world_set_RotationProperty', {}, {}, {})).toBe(
      'actor.set(WorldLab.RotationProperty, 0);\n',
    );
    // A point actor property (spatial scale): two number x/y sockets → a Vector.
    expect(emit('world_set_ScaleProperty', {}, {}, {X: '2', Y: '3'})).toBe(
      'actor.set(WorldLab.ScaleProperty, new WorldLab.Vector(2, 3));\n',
    );
  });

  it('generated world-property set blocks set the property on the world', () => {
    // A number world property (gravity strength) — no ACTOR input, targets world.
    expect(emit('world_set_StrengthProperty', {}, {}, {VALUE: '500'})).toBe(
      'world.set(WorldLab.StrengthProperty, 500);\n',
    );
    // Empty socket → the property default (strength 900).
    expect(emit('world_set_StrengthProperty', {}, {}, {})).toBe(
      'world.set(WorldLab.StrengthProperty, 900);\n',
    );
    // A vector world property (gravity direction) is a single Vector socket — a
    // world_vector literal, or another Vector block, slots straight in.
    expect(
      emit(
        'world_set_DirectionProperty',
        {},
        {},
        {
          VALUE: 'new WorldLab.Vector(0, -1)',
        },
      ),
    ).toBe(
      'world.set(WorldLab.DirectionProperty, new WorldLab.Vector(0, -1));\n',
    );
    // Empty socket → the property default (0, 1).
    expect(emit('world_set_DirectionProperty', {}, {}, {})).toBe(
      'world.set(WorldLab.DirectionProperty, new WorldLab.Vector(0, 1));\n',
    );
  });

  it('generated actor-property get blocks read the property off the ACTOR value', () => {
    // A number actor property reports the value directly.
    expect(emitValue('world_get_RotationProperty')[0]).toBe(
      'actor.get(WorldLab.RotationProperty)',
    );
    // Plugged-in actor value is read instead.
    expect(
      emitValue('world_get_RotationProperty', {}, {ACTOR: 'touched'})[0],
    ).toBe('touched.get(WorldLab.RotationProperty)');
    // A point actor property reads one axis via the x/y dropdown.
    expect(emitValue('world_get_ScaleProperty', {COMPONENT: 'y'})[0]).toBe(
      'actor.get(WorldLab.ScaleProperty).y',
    );
  });

  it('generated world-property get blocks read the property off the world', () => {
    expect(emitValue('world_get_StrengthProperty')[0]).toBe(
      'world.get(WorldLab.StrengthProperty)',
    );
    // A vector property reads the whole Vector (no axis dropdown).
    expect(emitValue('world_get_DirectionProperty')[0]).toBe(
      'world.get(WorldLab.DirectionProperty)',
    );
  });

  it('world_vector builds a Vector literal from its field', () => {
    // The field holds a structured {x, y}; the block emits a Vector.
    expect(emitValue('world_vector', {VECTOR: {x: 3, y: -2}})[0]).toBe(
      'new WorldLab.Vector(3, -2)',
    );
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_vector') as {
      output?: string;
      style?: string;
    };
    expect(block.output).toBe('Vector'); // plugs into vector sockets
    expect(block.style).toBe('location_blocks');
  });

  it('world_vector_component reads one axis of a Vector as a Number', () => {
    expect(
      emitValue('world_vector_component', {COMPONENT: 'y'}, {VEC: 'v'})[0],
    ).toBe('v.y');
    // Empty socket falls back to a zero vector.
    expect(emitValue('world_vector_component', {COMPONENT: 'x'})[0]).toBe(
      'new WorldLab.Vector(0, 0).x',
    );
  });

  it('a vector getter/property outputs a Vector styled as a location', () => {
    const dir = DOMAIN_BLOCKS.find(
      b => b.type === 'world_get_DirectionProperty',
    ) as {output?: string; style?: string};
    expect(dir.output).toBe('Vector');
    expect(dir.style).toBe('location_blocks');
  });

  it('generated world-action blocks run the action on the world', () => {
    // A no-argument world action (gravity Invert) → `world.act(Action)`.
    expect(emit('world_do_InvertAction', {})).toBe(
      'world.act(WorldLab.InvertAction);\n',
    );
  });

  it('generated actor-action blocks run the action on the ACTOR value', () => {
    // A number-argument actor action (Rotate to). The argument is a value socket
    // (a shadow number, or a slotted getter/math), and the actor is the `on …`
    // socket (default `this actor`).
    expect(emit('world_do_RotateAction', {}, {}, {VALUE: '45'})).toBe(
      'actor.act(WorldLab.RotateAction, 45);\n',
    );
    // Plugged-in actor value runs it on that actor.
    expect(
      emit('world_do_RotateAction', {}, {}, {ACTOR: 'touched', VALUE: '90'}),
    ).toBe('touched.act(WorldLab.RotateAction, 90);\n');
    // Empty argument socket falls back to the param default (0 degrees).
    expect(emit('world_do_RotateAction', {}, {}, {})).toBe(
      'actor.act(WorldLab.RotateAction, 0);\n',
    );
    // A vector-argument actor action (Move to) → a Vector argument.
    expect(emit('world_do_MoveAction', {}, {}, {X: '3', Y: '4'})).toBe(
      'actor.act(WorldLab.MoveAction, new WorldLab.Vector(3, 4));\n',
    );
  });

  it('generated query blocks read the query as a boolean reporter', () => {
    // Gravity's "is on the ground?" — reads the ACTOR value (default `this actor`).
    expect(emitValue('world_query_IsOnGroundQuery')[0]).toBe(
      'actor.query(WorldLab.IsOnGroundQuery)',
    );
    expect(
      emitValue('world_query_IsOnGroundQuery', {}, {ACTOR: 'touched'})[0],
    ).toBe('touched.query(WorldLab.IsOnGroundQuery)');
    // It is a Boolean reporter styled as logic, so it plugs into `if`/comparisons.
    const block = DOMAIN_BLOCKS.find(
      b => b.type === 'world_query_IsOnGroundQuery',
    ) as {output?: string; style?: string};
    expect(block.output).toBe('Boolean');
    expect(block.style).toBe('logic_blocks');
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
    // Motion had no blocks before; its velocity set + get now populate it.
    expect(category('Has Physics')).toEqual(
      expect.arrayContaining([
        'world_set_VelocityProperty',
        'world_get_VelocityProperty',
      ]),
    );
    // Gravity gains its world properties and its actor property, set and get.
    expect(category('Has Gravity')).toEqual(
      expect.arrayContaining([
        'world_set_StrengthProperty',
        'world_get_StrengthProperty',
        'world_set_DirectionProperty',
        'world_get_DirectionProperty',
        'world_set_GravityScaleProperty',
        'world_get_GravityScaleProperty',
      ]),
    );
    // Spatial keeps the bespoke set-position and gains scale/rotation/skew.
    expect(category('Has Space')).toEqual(
      expect.arrayContaining([
        'world_set_position',
        'world_set_ScaleProperty',
        'world_get_ScaleProperty',
        'world_set_RotationProperty',
        'world_get_RotationProperty',
        'world_set_SkewProperty',
        'world_get_SkewProperty',
      ]),
    );
  });

  it('surfaces generated rule-action blocks in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Gravity's world action, Motion's + Spatial's actor actions.
    expect(category('Has Gravity')).toContain('world_do_InvertAction');
    expect(category('Has Physics')).toContain('world_do_ApplyForceAction');
    expect(category('Has Space')).toEqual(
      expect.arrayContaining([
        'world_do_MoveAction',
        'world_do_RotateAction',
        'world_do_ScaleAction',
        'world_do_ResizeAction',
      ]),
    );
  });

  it('surfaces generated query reporters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Gravity's "is on the ground?" query and Collision's "is touching?" predicate
    // (a boolean query with two actor params — the hoisted heart of the touching
    // filter). Collision's list `TouchingQuery` has no return type, so it gets no
    // block; the `for each … where` loop rebuilds the list from the predicate.
    expect(category('Has Gravity')).toContain('world_query_IsOnGroundQuery');
    expect(category('Has Collisions')).toContain('world_query_IsTouchingQuery');
    expect(
      (DOMAIN_TOOLBOX as Array<{blocks: string[]}>)
        .flatMap(c => c.blocks)
        .filter(t => t.startsWith('world_query_')),
    ).toEqual(['world_query_IsTouchingQuery', 'world_query_IsOnGroundQuery']);
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
      '{\nconst actor = scene.addActor(Coin, "add-coin", "actors/coin");\n' +
        'actor.set(X);\n}\n',
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
    // Value sockets, by input name — what `valueToCode` would return. An input
    // with no entry reads as '' (a socket emptied of its shadow).
    sockets: Record<string, string> = {},
    // `use effect`'s serialized parameter list, which its generator reads off
    // the block to know which sockets exist.
    effectParams?: unknown[],
  ) => {
    const nextBlock = body ? {} : null;
    return generatorFor(type)(
      {
        getFieldValue: (n: string) => block[n],
        id: block.id,
        getNextBlock: () => nextBlock,
        effectParams_: effectParams,
      } as never,
      {
        definitions_: definitions,
        statementToCode: () => body,
        blockToCode: (b: unknown) => (b === nextBlock ? body : ''),
        valueToCode: (_block: unknown, name: string) => sockets[name] ?? '',
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

  it('world_use_rule adds a built-in rule by its world-lab export name', () => {
    expect(run('world_use_rule', {RULE: 'GravityRule'}, {}, '')).toBe(
      'world.useRules([WorldLab.GravityRule]);\n',
    );
  });

  it('world_use_rule imports a project rule module (a path) and uses it', () => {
    const defs: Record<string, string> = {};
    expect(run('world_use_rule', {RULE: 'rules/gravity'}, defs, '')).toBe(
      'world.useRules([Gravity]);\n',
    );
    expect(defs['mod:rules/gravity']).toBe(
      'import Gravity from "rules/gravity";',
    );
  });

  it('world_use_effect imports the .effect as data and applies it', () => {
    // The path is passed alongside the document because it is the effect's
    // identity: the driver registers one shader render node per path, so the
    // same effect on many actors is one compiled program.
    const defs: Record<string, string> = {};
    const code = run('world_use_effect', {EFFECT: 'effects/ripple'}, defs, '');
    expect(code).toBe('actor.useEffect("effects/ripple", Ripple);\n');
    expect(defs['mod:effects/ripple']).toBe(
      'import Ripple from "effects/ripple";',
    );
  });

  it('world_use_effect passes parameter values by parameter id', () => {
    // The sockets are built from the block's own serialized parameter list, so
    // the generator reads that same list to know what to emit.
    const defs: Record<string, string> = {};
    const code = run(
      'world_use_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
      {EPARAM_0_0: '0.05'},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toBe(
      'actor.useEffect("effects/ripple", Ripple, {"strength": 0.05});\n',
    );
  });

  it('world_use_effect falls back to a parameter default for an empty socket', () => {
    // A socket emptied of its shadow reads as '' — the declared default is what
    // the effect would have used anyway, so emit that rather than 0.
    const code = run(
      'world_use_effect',
      {EFFECT: 'effects/ripple'},
      {},
      '',
      {},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toContain('{"strength": 0.02}');
  });

  it('world_use_effect gathers a vector parameter into an array', () => {
    const code = run(
      'world_use_effect',
      {EFFECT: 'effects/tint'},
      {},
      '',
      {
        EPARAM_0_0: '1',
        EPARAM_0_2: '0.5',
      },
      [{id: 'color', name: 'color', type: 'vec3', defaultValue: [0, 0, 0]}],
    );
    expect(code).toContain('{"color": [1, 0, 0.5]}');
  });

  it('world_use_effect emits a boolean parameter as true/false', () => {
    const code = run('world_use_effect', {EFFECT: 'effects/glow'}, {}, '', {}, [
      {id: 'on', name: 'on', type: 'bool', defaultValue: 1},
    ]);
    expect(code).toContain('{"on": true}');
  });

  it('world_use_effect omits the argument when the effect has no parameters', () => {
    const code = run('world_use_effect', {EFFECT: 'effects/ripple'}, {}, '');
    expect(code).toBe('actor.useEffect("effects/ripple", Ripple);\n');
  });

  it('world_use_effect emits nothing when the project has no effects', () => {
    // The dropdown shows a "(none)" placeholder with an empty value; emitting
    // `actor.useEffect("", undefined)` would be a runtime error for a block the
    // learner has not finished filling in.
    const defs: Record<string, string> = {};
    expect(run('world_use_effect', {EFFECT: ''}, defs, '')).toBe('');
    expect(Object.keys(defs)).toEqual([]);
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

describe('buildDomainPalette (project rule blocks)', () => {
  // A declarative project rule: a world `strength` property + a `gusted` event.
  // define rule Has Wind → world property `strength`; a `Windblown` trait whose
  // `do` holds an event. (Events nest inside a trait.)
  const wind = parseRuleMeta(
    'rules/wind',
    JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Has Wind'},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {TYPE: 'number', NAME: 'strength', DEFAULT: '0'},
                next: {
                  block: {
                    type: 'world_rule_trait',
                    fields: {NAME: 'Windblown'},
                    inputs: {
                      DO: {
                        block: {
                          type: 'world_rule_event',
                          fields: {NAME: 'gusted'},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  )!;

  it('returns the built-in palette unchanged with no project rules', () => {
    const p = buildDomainPalette([]);
    expect(p.blocks).toBe(DOMAIN_BLOCKS);
    expect(p.toolbox).toBe(DOMAIN_TOOLBOX);
    expect(p.rootTypes).toBe(ROOT_BLOCK_TYPES);
  });

  it('extends the palette with a project rule’s blocks (collision-safe types)', () => {
    const {blocks, toolbox, rootTypes} = buildDomainPalette([wind]);
    const types = blocks.map(b => b.type);
    // Namespaced by module, so it can't collide with gravity's `StrengthProperty`.
    expect(types).toContain('world_set_rules_wind_StrengthProperty');
    expect(types).toContain('world_get_rules_wind_StrengthProperty');
    expect(types).toContain('world_on_rules_wind_GustedEvent'); // project event hat
    // Built-ins are still present, un-namespaced.
    expect(types).toContain('world_set_StrengthProperty'); // gravity's
    // A toolbox category for the project rule, carrying its blocks.
    const cats = toolbox as Array<{name: string; blocks: string[]}>;
    expect(cats.find(c => c.name === 'Has Wind')?.blocks).toContain(
      'world_set_rules_wind_StrengthProperty',
    );
    // The project event hat is a root (so the generator owns its next chain).
    expect(rootTypes.has('world_on_rules_wind_GustedEvent')).toBe(true);
  });

  it('generates a project member’s codegen as an import from its module', () => {
    const {blocks} = buildDomainPalette([wind]);
    const setBlock = blocks.find(
      b => b.type === 'world_set_rules_wind_StrengthProperty',
    )!;
    const defs: Record<string, string> = {};
    const code = setBlock.generator.javascript(
      {getFieldValue: () => ''} as never,
      {valueToCode: () => '5', definitions_: defs} as never,
      {} as never,
    );
    expect(code).toBe('world.set(StrengthProperty, 5);\n');
    expect(defs['named:rules/wind:StrengthProperty']).toBe(
      'import {StrengthProperty} from "rules/wind";',
    );
  });

  // A project rule whose members take parameters (declared via the params
  // mutator's `extraState`): a world action `Nudge(number amount, vector push)`
  // and an actor query `Near(actor other)`.
  const pushRule = parseRuleMeta(
    'rules/push',
    JSON.stringify({
      variables: [
        {id: 'a', name: 'amount', type: 'Number'},
        {id: 'b', name: 'push', type: 'Vector'},
        {id: 'c', name: 'other', type: 'Actor'},
      ],
      blocks: {
        blocks: [
          {
            type: 'world_rule',
            fields: {NAME: 'Pushes'},
            next: {
              block: {
                type: 'world_rule_action',
                fields: {NAME: 'Nudge'},
                extraState: {
                  params: [
                    {type: 'number', var: 'a'},
                    {type: 'vector', var: 'b'},
                  ],
                },
                next: {
                  block: {
                    type: 'world_rule_trait',
                    fields: {NAME: 'Pushable'},
                    inputs: {
                      DO: {
                        block: {
                          type: 'world_rule_query',
                          fields: {TYPE: 'boolean', NAME: 'Near'},
                          extraState: {params: [{type: 'actor', var: 'c'}]},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  )!;

  it('a project action’s call-site block passes all its params positionally', () => {
    const {blocks} = buildDomainPalette([pushRule]);
    const nudge = blocks.find(
      b => b.type === 'world_do_rules_push_NudgeAction',
    )!;
    // Two params → two labelled sockets (AMOUNT, PUSH); both passed to `act`.
    const code = nudge.generator.javascript(
      {getFieldValue: () => ''} as never,
      {
        valueToCode: (_b: unknown, name: string) =>
          name === 'AMOUNT'
            ? '5'
            : name === 'PUSH'
              ? 'new WorldLab.Vector(1, 0)'
              : '',
        definitions_: {},
      } as never,
      {} as never,
    );
    expect(code).toBe(
      'world.act(NudgeAction, 5, new WorldLab.Vector(1, 0));\n',
    );
  });

  it('a project actor-query block takes its param after the actor', () => {
    const {blocks} = buildDomainPalette([pushRule]);
    const near = blocks.find(
      b => b.type === 'world_query_rules_push_NearQuery',
    )!;
    const [code] = near.generator.javascript(
      {getFieldValue: () => ''} as never,
      {
        valueToCode: (_b: unknown, name: string) =>
          name === 'ACTOR' ? 'actor' : name === 'OTHER' ? 'other' : '',
        definitions_: {},
      } as never,
      {} as never,
    ) as [string, number];
    expect(code).toBe('actor.query(NearQuery, other)');
  });
});

describe('rule authoring blocks (`.rule` files)', () => {
  const AUTHORING = [
    'world_rule',
    'world_rule_trait',
    'world_rule_property',
    'world_rule_event',
  ];

  it('registers the declaration blocks with no-op generators', () => {
    for (const type of AUTHORING) {
      const block = DOMAIN_BLOCKS.find(b => b.type === type);
      expect(block, type).toBeDefined();
      // No JavaScript generator of their own — a `.rule` is codegen'd from its
      // parsed metadata (ruleMetaToModule), not block-by-block.
      expect(
        block!.generator.javascript({} as never, {} as never, {} as never),
      ).toBe('');
    }
  });

  it('offers a Rule toolbox category (with the dependency blocks)', () => {
    const cats = DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>;
    // The declarative authoring blocks, `use rule` / `use trait` for deps, and
    // the imperative `define action` / `define query` (+ its `return`).
    expect(cats.find(c => c.name === 'Rule')?.blocks).toEqual([
      'world_rule',
      'world_use_rule',
      'world_rule_trait',
      'world_use_trait',
      'world_rule_property',
      'world_rule_event',
      'world_rule_action',
      'world_rule_query',
      'world_return',
      'world_rule_step',
      'world_step_delta',
      // Parameters are declared via the +/− mutator (no toolbox block); only the
      // getters that read a parameter in the body appear here.
      'variables_get_Number',
      'variables_get_Boolean',
      'variables_get_String',
      'variables_get_Vector',
      'variables_get_Actor',
    ]);
  });

  it('is a root block type (owns its declaration chain)', () => {
    expect(ROOT_BLOCK_TYPES.has('world_rule')).toBe(true);
  });
});

// Blocks that call a method only `ActorBuilder` has must warn when they are
// placed where `actor` is the live instance instead — an event handler. The
// predicate is covered in extensions/__tests__/actorContext.test.ts; what is
// checked here is that the extension is actually attached to the blocks that
// need it, and to no others.
describe('builder-context warnings', () => {
  const extensionsOf = (type: string): string[] => {
    const block = DOMAIN_BLOCKS.find(b => b.type === type);
    if (!block) {
      throw new Error(`no domain block '${type}'`);
    }
    return (block.extensions ?? []).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );
  };

  it('guards `use effect`, whose `useEffect` is builder-only', () => {
    expect(extensionsOf('world_use_effect')).toContain(
      ACTOR_DEFINITION_EXTENSION,
    );
  });

  it('guards `use trait`, whose `useTraits` is builder-only', () => {
    expect(extensionsOf('world_use_trait')).toContain(TRAIT_CONTEXT_EXTENSION);
  });

  it('leaves the `set` blocks alone, because `set` exists on both', () => {
    // `set sprite` and `set position` emit `target.set(Property, value)`, and
    // both `ActorBuilder` and `Actor` have `set`. They are legitimately valid
    // as a template default AND at runtime, so a guard here would warn about
    // correct programs.
    for (const type of ['world_set_sprite', 'world_set_position']) {
      const names = extensionsOf(type);
      expect(names).not.toContain(ACTOR_DEFINITION_EXTENSION);
      expect(names).not.toContain(TRAIT_CONTEXT_EXTENSION);
    }
  });
});
