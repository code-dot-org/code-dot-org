import {installAllBlocks} from '@blockly/field-colour';
import {afterEach, describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {COLOUR_CHECK} from '../colorCheck';
import {installColorMessages} from '../colorMessages';
import {
  buildDomainPalette,
  DOMAIN_BLOCKS,
  DOMAIN_TOOLBOX,
  ROOT_BLOCK_TYPES,
} from '../domainBlocks';
import {
  RUNTIME_ACTOR_EXTENSION,
  RUNTIME_WORLD_EXTENSION,
  TRAIT_CONTEXT_EXTENSION,
} from '../extensions/actorContext';
import {paramSockets} from '../extensions/effectParamsMutator';
import {RGBA_PREVIEW_EXTENSION} from '../extensions/rgbaPreview';
import {WORLD_CONTEXT_EXTENSION} from '../extensions/worldContext';
import {setProjectAnimationFiles, setProjectMaps} from '../moduleOptions';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {setProjectGrids} from '../spriteCells';
import {VALUE_SHADOW_EXTENSION} from '../valueShadow';

// The domain blocks each carry a `world-lab` JavaScript generator. These test
// them in isolation with fake `block`/`generator` objects — no rendered Blockly
// workspace — locking the exact code each block emits. The assembly that orders
// them into a module is covered by assembleActorModule.test.ts.

/**
 * A project rule with the members no BUILT-IN rule has any more.
 *
 * Gravity used to be the worked example for world-scoped properties, a world
 * action and an actor query; it is a stock `.rule` now (`src/rules/stock`), and
 * no engine rule declares a world property or action. So the generators for
 * those are exercised against a project rule — which is the only kind that has
 * them, and therefore the honest subject.
 */
const PROJECT_RULE = parseRuleMeta(
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
              fields: {TYPE: 'number', NAME: 'strength', DEFAULT: '900'},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {TYPE: 'vector', NAME: 'direction', DEFAULT: '0,1'},
                  next: {
                    block: {
                      type: 'world_rule_block',
                      fields: {RETURNS: 'none'},
                      extraState: {
                        parts: [{kind: 'label', text: 'Invert'}],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // A trait is a TOP BLOCK beside the rule, with its members chained
        // below it — not a `do` mouth nested inside the rule.
        {
          type: 'world_rule_trait',
          fields: {NAME: 'Windblown'},
          next: {
            block: {
              type: 'world_rule_block',
              fields: {RETURNS: 'boolean'},
              extraState: {
                parts: [{kind: 'label', text: 'is gusting'}],
              },
              next: {
                block: {
                  type: 'world_rule_event',
                  fields: {NAME: 'gusted'},
                },
              },
            },
          },
        },
      ],
    },
  }),
)!;

// A stored reference names "Has Wind", so this is the project that has one:
// registered as the editor registers a project's parsed `.rule` files, and the
// only thing that can say which module the name means.
registerProjectRules([PROJECT_RULE]);

/** The palette that project rule contributes, built once. */
const PROJECT_BLOCKS = buildDomainPalette([PROJECT_RULE]);

/** A toolbox category from the project palette. */
const projectCategory = (name: string): string[] =>
  (PROJECT_BLOCKS.toolbox as Array<{name: string; blocks: string[]}>).find(
    c => c.name === name,
  )?.blocks ?? [];

/** `generatorFor`, over the project palette rather than the built-in one. */
const projectGeneratorFor = (type: string) => {
  const block = PROJECT_BLOCKS.blocks.find(b => b.type === type);
  if (!block) {
    throw new Error(`no project block '${type}'`);
  }
  return block.generator.javascript;
};

const emitProject = (
  type: string,
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): string =>
  projectGeneratorFor(type)(
    {getFieldValue: (name: string) => fields[name]} as never,
    {
      valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      definitions_: {} as Record<string, string>,
    } as never,
    {} as never,
  ) as string;

const emitProjectValue = (
  type: string,
  fields: Record<string, unknown> = {},
  values: Record<string, string> = {},
): [string, number] =>
  projectGeneratorFor(type)(
    {getFieldValue: (name: string) => fields[name]} as never,
    {
      valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      definitions_: {} as Record<string, string>,
    } as never,
    {} as never,
  ) as [string, number];

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
    // Imports are registered here and hoisted by Blockly's `finish()`, so a
    // block that needs one does not emit it inline (see `world_actor`).
    definitions_: {} as Record<string, string>,
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
    // Registered for hoisting, not emitted inline: an effect's color
    // parameter registers the same import, and two inline copies is a
    // duplicate declaration at compile.
    expect(code).not.toContain('import ');
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

  it('world_use_trait imports a project trait from the rule it names', () => {
    const defs: Record<string, string> = {};
    const code = generatorFor('world_use_trait')(
      {getFieldValue: () => 'Has Wind#WindblownTrait'} as never,
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

  it('world_set_sprite sets the sprite on the ACTOR value (no trait election)', () => {
    // Default (empty socket → `this actor`) sets it on the current actor. The
    // cell is written every time — an actor that drew one cell and is then set
    // to a picture must stop drawing it — and (0, 0) means the whole image.
    expect(emit('world_set_sprite', {SPRITE: 'player'})).toBe(
      'actor.set(WorldLab.SpriteProperty, "player");\n' +
        'actor.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(0, 0));\n' +
        'actor.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(0, 0));\n',
    );
    // A plugged-in actor (e.g. a loop's touched actor) is set instead.
    expect(
      emit('world_set_sprite', {SPRITE: 'switch'}, {}, {ACTOR: 'touched'}),
    ).toBe(
      'touched.set(WorldLab.SpriteProperty, "switch");\n' +
        'touched.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(0, 0));\n' +
        'touched.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(0, 0));\n',
    );
  });

  it('world_set_sprite resolves a chosen cell to its rectangle', () => {
    // The field names a cell (`coinSpin.png#3`); the RECTANGLE is generated,
    // because the engine is never told about grids (blockly/spriteCells).
    setProjectGrids(
      {'coinSpin.png': {type: 'sheet', cell: {width: 32, height: 32}}},
      {'coinSpin.png': {width: 192, height: 32}},
    );

    expect(emit('world_set_sprite', {SPRITE: 'coinSpin.png#3'})).toBe(
      'actor.set(WorldLab.SpriteProperty, "coinSpin.png");\n' +
        'actor.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(96, 0));\n' +
        'actor.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(32, 32));\n',
    );

    // An index the grid no longer holds draws the whole picture: a visible
    // wrong answer beats a made-up rectangle.
    expect(emit('world_set_sprite', {SPRITE: 'coinSpin.png#99'})).toContain(
      'SpriteCellSizeProperty, new WorldLab.Vector(0, 0)',
    );
    setProjectGrids({}, {});
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
      emit(
        'world_on_Appearance_AnimationEndedEvent',
        {},
        {},
        {},
        'console.log("hi");\n',
      ),
    ).toBe(
      'actor.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n' +
        'console.log("hi");\n});\n',
    );
    expect(
      emit(
        'world_on_Appearance_FrameChangedEvent',
        {},
        {},
        {},
        'console.log(eventValue);\n',
      ),
    ).toBe(
      'actor.on(WorldLab.FrameChangedEvent, (world, actor, eventValue) => {\n' +
        'console.log(eventValue);\n});\n',
    );
  });

  it('event blocks register the handler on their ACTOR value', () => {
    // Default (empty socket → `this actor` shadow) registers on `actor`; an
    // empty next chain yields an empty handler body.
    expect(emit('world_on_Appearance_AnimationEndedEvent', {}, {}, {})).toBe(
      'actor.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n});\n',
    );
    // A plugged-in actor value registers on it instead.
    expect(
      emit('world_on_Appearance_AnimationEndedEvent', {}, {}, {ACTOR: 'other'}),
    ).toBe(
      'other.on(WorldLab.AnimationEndedEvent, (world, actor, eventValue) => {\n});\n',
    );
  });

  it('hands Blockly a generator for every dropdown over project content', () => {
    // Not a snapshot of one. Two reasons, and the second is the one that bit:
    //
    //  • the content changes (a project's rules, files, the events in play), and
    //  • Blockly TRIMS a static array — it factors out any word every label
    //    shares and renders it as a fixed label beside the field. Defined before
    //    a project loads, every event read "Has Appearance ▸ animation …", so
    //    that prefix was stamped onto `emit` for good; every step anchor read
    //    "Has …", so `before`/`after` grew a stray "Has".
    const live = [
      ['world_use_trait', 'TRAIT'],
      ['world_use_rule', 'RULE'],
      ['world_emit', 'EVENT'],
      ['world_emit_with', 'EVENT'],
      ['world_rule_step_before', 'STEP'],
      ['world_rule_step_after', 'STEP'],
      ['world_add_actor', 'ACTOR'],
      ['world_load_map', 'MAP'],
    ] as const;
    for (const [type, field] of live) {
      const args = (
        DOMAIN_BLOCKS.find(b => b.type === type) as {
          args0?: Array<{name?: string; options?: unknown}>;
        }
      ).args0!;
      const arg = args.find(a => a.name === field);
      expect(typeof arg?.options, `${type}.${field}`).toBe('function');
    }
  });

  it('lets an event value sit opposite anything in a comparison', () => {
    // `logic_compare` refuses two operands whose output checks disagree — that
    // is the block's own onchange, not ours — so an `event value` that claimed
    // to be a Number could not be compared against a key, and a saved handler
    // was pulled apart on load. This asks the real predicate the compare block
    // asks: are these two outputs compatible?
    const definition = (type: string) =>
      DOMAIN_BLOCKS.find(b => b.type === type) as {output?: unknown};
    expect(definition('world_event_value').output).toBeNull();

    const workspace = new Blockly.Workspace();
    const checker = workspace.connectionChecker;
    const connection = (check: string | null) => {
      const block = workspace.newBlock('logic_boolean');
      block.setOutput(true, check);
      return block.outputConnection!;
    };
    const eventValue = connection(null);
    for (const other of ['String', 'Number', 'Boolean', 'Actor', 'Vector']) {
      expect(checker.doTypeChecks(eventValue, connection(other))).toBe(true);
    }
  });

  it('a key names itself, for comparing against an event value', () => {
    // The keyboard's events are an authored rule's now, so a handler filters
    // for its key rather than being built around one: `if event value = key
    // ⟨space⟩`. This block is what keeps that from reading as `= " "`.
    expect(emitValue('world_key', {KEY: ' '})[0]).toBe('" "');
    expect(emitValue('world_key', {KEY: 'ArrowLeft'})[0]).toBe('"ArrowLeft"');
  });

  it('reports the scale between a speed and a distance', () => {
    // The Engine block `rules/stock/motion` multiplies by, in both places it
    // turns a rate into a distance.
    expect(emitValue('world_pixels_per_unit')[0]).toBe(
      'WorldLab.PIXELS_PER_UNIT',
    );
  });

  it('a note generates a comment, on one line', () => {
    // The note survives into the running code, which is the point: the same
    // sentence in the editor and in what the project runs.
    expect(emit('world_comment', {TEXT: 'gravity speeds things up'})).toBe(
      '// gravity speeds things up\n',
    );
    // A pasted line break would comment out only the first line.
    expect(emit('world_comment', {TEXT: 'first\nsecond'})).toBe(
      '// first second\n',
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
    expect(
      emit('world_set_Space_RotationProperty', {}, {}, {VALUE: '45'}),
    ).toBe('actor.set(WorldLab.RotationProperty, 45);\n');
    // Plugged-in actor value targets it instead.
    expect(
      emit(
        'world_set_Space_RotationProperty',
        {},
        {},
        {ACTOR: 'touched', VALUE: '90'},
      ),
    ).toBe('touched.set(WorldLab.RotationProperty, 90);\n');
    // A getter slotted into the value composes through.
    expect(
      emit(
        'world_set_Space_RotationProperty',
        {},
        {},
        {VALUE: 'actor.get(WorldLab.RotationProperty)'},
      ),
    ).toBe(
      'actor.set(WorldLab.RotationProperty, actor.get(WorldLab.RotationProperty));\n',
    );
    // An empty socket falls back to the property default (rotation 0).
    expect(emit('world_set_Space_RotationProperty', {}, {}, {})).toBe(
      'actor.set(WorldLab.RotationProperty, 0);\n',
    );
    // A point actor property (spatial scale): two number x/y sockets → a Vector.
    expect(
      emit('world_set_Space_ScaleProperty', {}, {}, {X: '2', Y: '3'}),
    ).toBe('actor.set(WorldLab.ScaleProperty, new WorldLab.Vector(2, 3));\n');
  });

  it('generated world-property set blocks set the property on the world', () => {
    // A number world property — no ACTOR input, targets the world. Read off a
    // PROJECT rule: no built-in declares a world property any more.
    expect(
      emitProject(
        `world_set_${'HasWind_'}StrengthProperty`,
        {},
        {VALUE: '500'},
      ),
    ).toBe('world.set(StrengthProperty, 500);\n');
    // Empty socket → the property default (900).
    expect(emitProject(`world_set_${'HasWind_'}StrengthProperty`)).toBe(
      'world.set(StrengthProperty, 900);\n',
    );
    // A vector world property is a single Vector socket — a world_vector
    // literal, or another Vector block, slots straight in.
    expect(
      emitProject(
        `world_set_${'HasWind_'}DirectionProperty`,
        {},
        {
          VALUE: 'new WorldLab.Vector(0, -1)',
        },
      ),
    ).toBe('world.set(DirectionProperty, new WorldLab.Vector(0, -1));\n');
    // Empty socket → the property default (0, 1).
    expect(emitProject(`world_set_${'HasWind_'}DirectionProperty`)).toBe(
      'world.set(DirectionProperty, new WorldLab.Vector(0, 1));\n',
    );
  });

  it('generated actor-property get blocks read the property off the ACTOR value', () => {
    // A number actor property reports the value directly.
    expect(emitValue('world_get_Space_RotationProperty')[0]).toBe(
      'actor.get(WorldLab.RotationProperty)',
    );
    // Plugged-in actor value is read instead.
    expect(
      emitValue('world_get_Space_RotationProperty', {}, {ACTOR: 'touched'})[0],
    ).toBe('touched.get(WorldLab.RotationProperty)');
    // A point actor property reads one axis via the x/y dropdown.
    expect(
      emitValue('world_get_Space_ScaleProperty', {COMPONENT: 'y'})[0],
    ).toBe('actor.get(WorldLab.ScaleProperty).y');
  });

  it('generated world-property get blocks read the property off the world', () => {
    expect(emitProjectValue(`world_get_${'HasWind_'}StrengthProperty`)[0]).toBe(
      'world.get(StrengthProperty)',
    );
    // A vector property reads the whole Vector (no axis dropdown).
    expect(
      emitProjectValue(`world_get_${'HasWind_'}DirectionProperty`)[0],
    ).toBe('world.get(DirectionProperty)');
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
    const dir = PROJECT_BLOCKS.blocks.find(
      b => b.type === `world_get_${'HasWind_'}DirectionProperty`,
    ) as {output?: string; style?: string};
    expect(dir.output).toBe('Vector');
    expect(dir.style).toBe('location_blocks');
  });

  it('generated world-action blocks run the action on the world', () => {
    // A no-argument world action (gravity Invert) → `world.act(Action)`.
    expect(emitProject(`world_do_${'HasWind_'}InvertAction`)).toBe(
      'world.act(InvertAction);\n',
    );
  });

  it('generated actor-action blocks run the action on the ACTOR value', () => {
    // A number-argument actor action (Rotate to). The argument is a value socket
    // (a shadow number, or a slotted getter/math), and the actor is the `on …`
    // socket (default `this actor`).
    expect(emit('world_do_Space_RotateAction', {}, {}, {VALUE: '45'})).toBe(
      'actor.act(WorldLab.RotateAction, 45);\n',
    );
    // Plugged-in actor value runs it on that actor.
    expect(
      emit(
        'world_do_Space_RotateAction',
        {},
        {},
        {ACTOR: 'touched', VALUE: '90'},
      ),
    ).toBe('touched.act(WorldLab.RotateAction, 90);\n');
    // Empty argument socket falls back to the param default (0 degrees).
    expect(emit('world_do_Space_RotateAction', {}, {}, {})).toBe(
      'actor.act(WorldLab.RotateAction, 0);\n',
    );
    // A vector-argument actor action (Move to) → a Vector argument.
    expect(emit('world_do_Space_MoveAction', {}, {}, {X: '3', Y: '4'})).toBe(
      'actor.act(WorldLab.MoveAction, new WorldLab.Vector(3, 4));\n',
    );
  });

  it('generated query blocks read the query as a boolean reporter', () => {
    // Gravity's "is on the ground?" — reads the ACTOR value (default `this actor`).
    expect(emitProjectValue(`world_query_${'HasWind_'}IsGustingQuery`)[0]).toBe(
      'actor.query(IsGustingQuery)',
    );
    expect(
      emitProjectValue(
        `world_query_${'HasWind_'}IsGustingQuery`,
        {},
        {
          ACTOR: 'touched',
        },
      )[0],
    ).toBe('touched.query(IsGustingQuery)');
    // It is a Boolean reporter styled as logic, so it plugs into `if`/comparisons.
    const block = PROJECT_BLOCKS.blocks.find(
      b => b.type === `world_query_${'HasWind_'}IsGustingQuery`,
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
    // Each built-in rule's events are surfaced. The keyboard's are not among
    // them any more: they belong to `rules/stock/input`, whose hats the project
    // palette generates (see arrowsRule/inputRule tests).
    for (const t of [
      'world_on_Appearance_AnimationEndedEvent',
      'world_on_Appearance_FrameChangedEvent',
    ]) {
      expect(toolboxTypes).toContain(t);
    }
  });

  it('puts the actor-placing blocks in the World category', () => {
    // There is no Scene category: a world holds both the laws and the actors,
    // so `load map` / `add actor` belong beside the rules they run under.
    const names = (DOMAIN_TOOLBOX as Array<{name: string}>).map(c => c.name);
    expect(names).not.toContain('Scene');
    expect(
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === 'World',
      )?.blocks,
    ).toEqual(expect.arrayContaining(['world_load_map', 'world_add_actor']));
  });

  it('surfaces generated property setters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Spatial's, which is the only built-in rule left with a settable property
    // a learner writes: motion's velocity went with motion (rules/stock/motion).
    expect(category('Space')).toEqual(
      expect.arrayContaining(['world_set_position']),
    );
    // Gravity gains its world properties and its actor property, set and get.
    expect(projectCategory('Has Wind')).toEqual(
      expect.arrayContaining([
        `world_set_${'HasWind_'}StrengthProperty`,
        `world_get_${'HasWind_'}StrengthProperty`,
        `world_set_${'HasWind_'}DirectionProperty`,
        `world_get_${'HasWind_'}DirectionProperty`,
      ]),
    );
    // Spatial keeps the bespoke set-position and gains scale/rotation/skew.
    expect(category('Space')).toEqual(
      expect.arrayContaining([
        'world_set_position',
        'world_set_Space_ScaleProperty',
        'world_get_Space_ScaleProperty',
        'world_set_Space_RotationProperty',
        'world_get_Space_RotationProperty',
        'world_set_Space_SkewProperty',
        'world_get_Space_SkewProperty',
      ]),
    );
  });

  it('surfaces generated rule-action blocks in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // Gravity's world action, Motion's + Spatial's actor actions.
    expect(projectCategory('Has Wind')).toContain(
      `world_do_${'HasWind_'}InvertAction`,
    );
    // Motion's `apply force` is a project block now (rules/stock/motion), so
    // the built-in categories carry only Spatial's and Animation's actions.
    expect(category('Space')).toContain('world_do_Space_MoveAction');
    expect(category('Space')).toEqual(
      expect.arrayContaining([
        'world_do_Space_MoveAction',
        'world_do_Space_RotateAction',
        'world_do_Space_ScaleAction',
        'world_do_Space_ResizeAction',
      ]),
    );
  });

  it('surfaces generated query reporters in their rule categories', () => {
    const category = (name: string) =>
      (DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>).find(
        c => c.name === name,
      )?.blocks ?? [];
    // A project rule's query gets a block in that rule's own category —
    // collision's "is touching" and "collision size of" are project blocks now,
    // covered by collisionRule.test; what is left built in is Motion's.
    expect(projectCategory('Has Wind')).toContain(
      `world_query_${'HasWind_'}IsGustingQuery`,
    );
    void category;
    expect(
      (DOMAIN_TOOLBOX as Array<{blocks: string[]}>)
        .flatMap(c => c.blocks)
        .filter(t => t.startsWith('world_query_')),
    ).toEqual([
      // None left built in: motion's "position before" went with motion, as
      // collision's went with collision. Every query a rule offers is now a
      // rule's own, and a project rule's blocks live in its own category.
    ]);
  });
});

describe('world_slider', () => {
  it('generates the bare number, like the math_number it stands in for', () => {
    const code = generatorFor('world_slider')(
      {getFieldValue: () => 0.035} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('0.035');
  });

  it('generates 0 rather than NaN for an empty field', () => {
    // A shadow the learner has cleared must not emit `actor.addEffect(…, NaN)`,
    // which reaches the shader as a uniform and blanks the sprite.
    const code = generatorFor('world_slider')(
      {getFieldValue: () => null} as never,
      {} as never,
      {} as never,
    ) as [string, number];

    expect(code[0]).toBe('0');
  });
});

describe('world_rgba', () => {
  const rgbaCode = (values: Record<string, string>) =>
    (
      generatorFor('world_rgba')(
        {} as never,
        {
          valueToCode: (_block: unknown, name: string) => values[name] ?? '',
        } as never,
        {} as never,
      ) as [string, number]
    )[0];

  it('emits floats, not hex', () => {
    // The whole reason this block exists beside the picker: hex cannot carry
    // an alpha, and round-tripping through it would quantize every channel to
    // 8 bits — a slider dragged to 0.337 would arrive as 0.3372549.
    expect(rgbaCode({R: '1', G: '0.5', B: '0', A: '0.337'})).toBe(
      '[1, 0.5, 0, 0.337]',
    );
  });

  it('passes an expression through untouched', () => {
    // A channel can be driven by something — a variable, a query, arithmetic.
    // That is the other thing the picker cannot do.
    expect(rgbaCode({R: 'other', G: '0', B: '0', A: '1'})).toBe(
      '[other, 0, 0, 1]',
    );
  });

  it('defaults a cleared channel to 0, and a cleared alpha to opaque', () => {
    // Alpha is the odd one out: an empty socket meaning "invisible" would make
    // clearing it look like the block broke.
    expect(rgbaCode({})).toBe('[0, 0, 0, 1]');
  });
});

describe('color spelling', () => {
  // The lab is US English throughout — the effect editor calls a vec3
  // "color (RGB)", the stock effects name the parameter `color` — and the
  // stock Blockly blocks in this category ship British text. This pins the
  // replacement so a Blockly upgrade re-introducing "colour" is caught here
  // rather than by someone reading the toolbox.
  it('replaces the British text on the stock color blocks', () => {
    installColorMessages();

    for (const key of [
      'COLOUR_PICKER_TOOLTIP',
      'COLOUR_RANDOM_TITLE',
      'COLOUR_RANDOM_TOOLTIP',
      'COLOUR_BLEND_COLOUR1',
      'COLOUR_BLEND_TOOLTIP',
      'COLOUR_RGB_TITLE',
      'COLOUR_RGB_TOOLTIP',
    ]) {
      expect(Blockly.Msg[key]).not.toMatch(/colour/i);
      expect(Blockly.Msg[key]).toMatch(/color/i);
    }
  });

  it('leaves the rest of the locale intact', () => {
    // The trap this hit: `Agent.inject` loads English only when `Blockly.Msg`
    // is empty, so assigning a single override skips the whole locale and
    // every other message reads undefined.
    installColorMessages();

    expect(Blockly.Msg.WORKSPACE_LABEL_MANY_STACKS).toBeTruthy();
    expect(Object.keys(Blockly.Msg).length).toBeGreaterThan(100);
  });

  it('names the category in US spelling', () => {
    const names = (DOMAIN_TOOLBOX as Array<{name: string}>).map(c => c.name);
    expect(names).toContain('Color');
    expect(names).not.toContain('Colour');
  });
});

describe('world_emit', () => {
  // The block that raises an event. Until it existed a rule could DECLARE an
  // event and nothing in the language could fire it.
  const run = (
    _type: string,
    fields: Record<string, string>,
    definitions: Record<string, string>,
    _body: string,
    values: Record<string, string>,
  ): string =>
    generatorFor('world_emit')(
      {getFieldValue: (name: string) => fields[name]} as never,
      {
        definitions_: definitions,
        valueToCode: (_block: unknown, name: string) => values[name] ?? '',
      } as never,
      {} as never,
    ) as string;
  it('emits a built-in event through the WorldLab namespace', () => {
    const code = run(
      'world_emit',
      {EVENT: 'Appearance#AnimationEndedEvent'},
      {},
      '',
      {
        ACTOR: 'other',
      },
    );
    expect(code).toBe('world.emit(WorldLab.AnimationEndedEvent, other);\n');
  });

  it('imports a project rule’s event from its module', () => {
    const defs: Record<string, string> = {};
    const code = run('world_emit', {EVENT: 'Has Wind#GustedEvent'}, defs, '', {
      ACTOR: 'other',
    });
    expect(code).toBe('world.emit(GustedEvent, other);\n');
    expect(defs['named:rules/wind:GustedEvent']).toBe(
      'import {GustedEvent} from "rules/wind";',
    );
  });

  it('defaults to the principal actor when the socket is empty', () => {
    expect(
      run('world_emit', {EVENT: 'Appearance#AnimationEndedEvent'}, {}, '', {}),
    ).toBe('world.emit(WorldLab.AnimationEndedEvent, actor);\n');
  });

  it('emits nothing when no rule in play declares an event', () => {
    // The dropdown's "(none)" placeholder. `world.emit(undefined, actor)` would
    // be a runtime error for a block the learner has not finished.
    expect(run('world_emit', {EVENT: ''}, {}, '', {})).toBe('');
  });
});

describe('vector arithmetic', () => {
  // Gravity's step is the worked example: "add direction × strength × delta to
  // the velocity" could not be written at all before this block, and reads as
  // one sentence because either side may be a vector or a number.
  const value = (
    type: string,
    values: Record<string, string>,
    fields: Record<string, string> = {},
    leftCheck: string[] | null = ['Vector'],
  ) =>
    (
      generatorFor(type)(
        {
          getFieldValue: (name: string) => fields[name] ?? null,
          getInputTargetBlock: (name: string) =>
            name === 'A' && values.A
              ? {outputConnection: {getCheck: () => leftCheck}}
              : null,
        } as never,
        {
          valueToCode: (_b: unknown, name: string) => values[name] ?? '',
        } as never,
        {} as never,
      ) as [string, number]
    )[0];

  it('maps each operator to its component-wise method', () => {
    const ops = {
      ADD: 'add',
      SUBTRACT: 'subtract',
      MULTIPLY: 'multiply',
      DIVIDE: 'divide',
    };
    for (const [op, method] of Object.entries(ops)) {
      expect(value('world_vector_math', {A: 'v', B: 'w'}, {OP: op})).toBe(
        `v.${method}(w)`,
      );
    }
  });

  it('takes a number on either side, GLSL-style', () => {
    // `velocity × delta` — a scalar on the right needs nothing: the engine's
    // Vector methods broadcast it (core/Vector).
    expect(
      value('world_vector_math', {A: 'v', B: 'delta'}, {OP: 'MULTIPLY'}),
    ).toBe('v.multiply(delta)');
    // `2 × direction` — a scalar on the LEFT has no method to call, so it is
    // broadcast into a vector first. Same rule, other side.
    expect(
      value('world_vector_math', {A: '2', B: 'v'}, {OP: 'MULTIPLY'}, [
        'Number',
      ]),
    ).toBe('WorldLab.Vector.broadcast(2).multiply(v)');
  });

  it('defaults to adding when the operator is missing', () => {
    // A block deserialized without its field still has to generate something.
    expect(value('world_vector_math', {A: 'v', B: 'w'})).toBe('v.add(w)');
  });

  it('falls back to a zero vector rather than emitting nothing', () => {
    // An empty socket must still produce a Vector: `undefined.add(…)` would
    // take the game down on the first tick.
    expect(value('world_vector_math', {}, {OP: 'ADD'}, null)).toBe(
      'WorldLab.Vector.broadcast(new WorldLab.Vector(0, 0)).add(0)',
    );
  });

  it('still rotates, which is not arithmetic', () => {
    expect(value('world_vector_rotate', {VECTOR: 'v', DEGREES: '180'})).toBe(
      'v.rotate(180)',
    );
  });
});

describe('world_rgba block shape', () => {
  const rgbaBlock = () => {
    const block = DOMAIN_BLOCKS.find(b => b.type === 'world_rgba');
    if (!block) {
      throw new Error('no world_rgba block');
    }
    return block;
  };

  it('leads with a color swatch, then the four channels', () => {
    // The swatch is what the channels are working toward; reading it first is
    // the point. It is also where the presets live (rgbaPreview).
    const args = (rgbaBlock().args0 ?? []) as Array<{name?: string}>;
    expect(args.map(arg => arg.name)).toEqual(['PREVIEW', 'R', 'G', 'B', 'A']);
  });

  it('carries the extension that keeps the swatch and channels in step', () => {
    const names = (rgbaBlock().extensions ?? []).map(extension =>
      typeof extension === 'string' ? extension : extension.name,
    );
    expect(names).toContain(RGBA_PREVIEW_EXTENSION);
    // …and the one that seeds each channel with a slider.
    expect(names).toContain(VALUE_SHADOW_EXTENSION);
  });

  it('outputs what the stock color blocks actually output', () => {
    // Built and asked, rather than compared against a literal. A connection
    // check is a string equality, and asserting a literal is precisely what
    // failed to catch it when a spelling sweep changed our side and the test
    // together, leaving the picker unable to plug into its own socket:
    //
    //   Output Connection of "colour_picker" expected Colour, found Color
    //
    // Reading it off the block we have to connect to cannot drift that way.
    installAllBlocks({});
    const workspace = new Blockly.Workspace();
    const picker = workspace.newBlock('colour_picker');

    expect(picker.outputConnection?.getCheck()).toEqual([rgbaBlock().output]);
  });

  it('offers exactly what an effect’s color socket checks for', () => {
    // The other half of the same equality. Both sides read one constant now,
    // and this is the assertion that says so.
    expect(rgbaBlock().output).toBe(COLOUR_CHECK);
    expect(paramSockets('vec3')[0].kind).toBe('color');
  });
});

describe('actor-placing block generators', () => {
  // These blocks read block.id and register imports on generator.definitions_
  // (which Blockly's finish() hoists), so they need richer fakes than `emit`.
  // `world_add_actor` reads its `DO` input via `statementToCode` — the fake
  // returns `body` for both that and the next chain.
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

  it('world_add_actor block-scopes the instance, using the block id as its id', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_actor',
      {ACTOR: 'actors/coin', id: 'add-coin'},
      defs,
      'actor.set(X);\n',
    );
    expect(code).toBe(
      '{\nconst actor = world.addActor(Coin, "add-coin", "actors/coin");\n' +
        'actor.set(X);\n}\n',
    );
    expect(defs['mod:actors/coin']).toBe('import Coin from "actors/coin";');
  });
});

describe('world block generators', () => {
  // The world root reads its body from the next chain, like the actor root.
  const run = (
    type: string,
    block: Record<string, unknown>,
    definitions: Record<string, string>,
    body: string,
    // Value sockets, by input name — what `valueToCode` would return. An input
    // with no entry reads as '' (a socket emptied of its shadow).
    sockets: Record<string, string> = {},
    // `add effect`'s serialized parameter list, which its generator reads off
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

  it('world_use_rule adds a built-in rule by name, as its world-lab export', () => {
    expect(run('world_use_rule', {RULE: 'Space'}, {}, '')).toBe(
      'world.useRules([WorldLab.SpatialRule]);\n',
    );
  });

  it('world_use_rule imports a project rule from wherever its name lives', () => {
    // The field says "Has Wind"; which file that is comes from the registry,
    // and is the only place in the generated module a path appears at all.
    const defs: Record<string, string> = {};
    expect(run('world_use_rule', {RULE: 'Has Wind'}, defs, '')).toBe(
      'world.useRules([Wind]);\n',
    );
    expect(defs['mod:rules/wind']).toBe('import Wind from "rules/wind";');
  });

  it('world_use_rule treats an unknown value as a module — a `.js` rule', () => {
    // A hand-written rule declares no name to be found by, so it is referred to
    // by its file and imported from exactly there.
    const defs: Record<string, string> = {};
    expect(run('world_use_rule', {RULE: 'rules/animation'}, defs, '')).toBe(
      'world.useRules([Animation]);\n',
    );
    expect(defs['mod:rules/animation']).toBe(
      'import Animation from "rules/animation";',
    );
  });

  it('world_add_effect imports the .effect as data and applies it', () => {
    // The path is passed alongside the document because it is the effect's
    // identity: the driver registers one shader render node per path, so the
    // same effect on many actors is one compiled program.
    //
    // With the ACTOR socket empty the target is the bare identifier `actor` —
    // which is the template under `define actor` and the live actor inside a
    // handler. One block, both jobs; `addEffect` is on both objects.
    const defs: Record<string, string> = {};
    const code = run('world_add_effect', {EFFECT: 'effects/ripple'}, defs, '');
    expect(code).toBe('actor.addEffect("effects/ripple", Ripple);\n');
    expect(defs['mod:effects/ripple']).toBe(
      'import Ripple from "effects/ripple";',
    );
  });

  it('world_add_effect passes parameter values by parameter id', () => {
    // The sockets are built from the block's own serialized parameter list, so
    // the generator reads that same list to know what to emit.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
      {EPARAM_0_0: '0.05'},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toBe(
      'actor.addEffect("effects/ripple", Ripple, {"strength": 0.05});\n',
    );
  });

  it('world_add_effect falls back to a parameter default for an empty socket', () => {
    // A socket emptied of its shadow reads as '' — the declared default is what
    // the effect would have used anyway, so emit that rather than 0.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/ripple'},
      {},
      '',
      {},
      [{id: 'strength', name: 'strength', type: 'float', defaultValue: 0.02}],
    );
    expect(code).toContain('{"strength": 0.02}');
  });

  it('world_add_effect gathers a vec2 into an array', () => {
    // A vec2 is a direction or an offset, not a color — it keeps its pair of
    // number sockets.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/skew'},
      {},
      '',
      {EPARAM_0_0: '1', EPARAM_0_1: '0.5'},
      [{id: 'offset', name: 'offset', type: 'vec2', defaultValue: [0, 0]}],
    );
    expect(code).toContain('{"offset": [1, 0.5]}');
  });

  it('world_add_effect converts a vec3 color socket to shader floats', () => {
    // The socket holds a color block, which speaks `#rrggbb`; the uniform
    // wants three 0–1 floats. Converting in the generated code rather than in
    // the block is what lets any color block feed the socket.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/tint'},
      defs,
      '',
      {EPARAM_0_0: "'#ff8800'"},
      [{id: 'color', name: 'color', type: 'vec3', defaultValue: [0, 0, 0]}],
    );
    expect(code).toContain(`{"color": WorldLab.rgb('#ff8800')}`);
    // …and the module it names has to be imported.
    expect(defs['world_lab']).toBe(`import * as WorldLab from 'world-lab';`);
  });

  it('world_add_effect takes a vec4 from the same single color socket', () => {
    // No separate opacity socket: alpha rides in the value, whether that is an
    // eight-digit hex or the float array `r g b a` produces.
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/tint'},
      {},
      '',
      {EPARAM_0_0: '[1, 0.5, 0, 0.25]'},
      [{id: 'color', name: 'color', type: 'vec4', defaultValue: [0, 0, 0, 1]}],
    );
    expect(code).toContain(`{"color": WorldLab.rgba([1, 0.5, 0, 0.25])}`);
  });

  it('world_add_effect falls back to the declared color as floats', () => {
    // An emptied color socket still has to produce the effect's own default.
    // Handed over as floats, not hex: `rgb`/`rgba` take either, and hex would
    // drop a vec4's alpha and quantize the rest for nothing.
    const code = run('world_add_effect', {EFFECT: 'effects/tint'}, {}, '', {}, [
      {id: 'color', name: 'color', type: 'vec3', defaultValue: [1, 0.5, 0]},
    ]);
    expect(code).toContain(`{"color": WorldLab.rgb([1, 0.5, 0])}`);
  });

  it('world_add_effect keeps a vec4 default’s alpha in the fallback', () => {
    // Padding a three-component default to four would write an explicit alpha
    // of 0, and `rgba` could no longer tell it was never given one.
    const code = run('world_add_effect', {EFFECT: 'effects/tint'}, {}, '', {}, [
      {
        id: 'color',
        name: 'color',
        type: 'vec4',
        defaultValue: [1, 0.6, 0.6, 1],
      },
    ]);
    expect(code).toContain(`{"color": WorldLab.rgba([1, 0.6, 0.6, 1])}`);
  });

  it('world_add_effect emits a boolean parameter as true/false', () => {
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, {}, '', {}, [
      {id: 'on', name: 'on', type: 'bool', defaultValue: 1},
    ]);
    expect(code).toContain('{"on": true}');
  });

  it('world_add_effect omits the argument when the effect has no parameters', () => {
    const code = run('world_add_effect', {EFFECT: 'effects/ripple'}, {}, '');
    expect(code).toBe('actor.addEffect("effects/ripple", Ripple);\n');
  });

  it('world_add_effect names the socket target when one is plugged in', () => {
    const defs: Record<string, string> = {};
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, defs, '', {
      ACTOR: 'actor',
    });
    expect(code).toBe('actor.addEffect("effects/glow", Glow);\n');
    expect(defs['mod:effects/glow']).toBe('import Glow from "effects/glow";');
  });

  it('world_add_effect passes explicit values alongside a socket target', () => {
    const code = run(
      'world_add_effect',
      {EFFECT: 'effects/glow'},
      {},
      '',
      {ACTOR: 'actor', EPARAM_0_0: '0.8'},
      [{id: 'bright', name: 'bright', type: 'float', defaultValue: 0.2}],
    );
    expect(code).toContain('{"bright": 0.8}');
  });

  it('world_add_effect targets whatever is in the ACTOR socket', () => {
    // A loop's touched actor, say — not just `this actor`.
    const code = run('world_add_effect', {EFFECT: 'effects/glow'}, {}, '', {
      ACTOR: 'touched',
    });
    expect(code).toBe('touched.addEffect("effects/glow", Glow);\n');
  });

  it('world_remove_effect needs only the path, so imports nothing', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_effect',
      {EFFECT: 'effects/glow'},
      defs,
      '',
      {
        ACTOR: 'actor',
      },
    );
    expect(code).toBe('actor.removeEffect("effects/glow");\n');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('the runtime effect blocks emit nothing without a chosen effect', () => {
    expect(run('world_add_effect', {EFFECT: ''}, {}, '', {})).toBe('');
    expect(run('world_remove_effect', {EFFECT: ''}, {}, '', {})).toBe('');
  });

  it('world_add_effect emits nothing when the project has no effects', () => {
    // The dropdown shows a "(none)" placeholder with an empty value; emitting
    // `actor.addEffect("", undefined)` would be a runtime error for a block the
    // learner has not finished filling in.
    const defs: Record<string, string> = {};
    expect(run('world_add_effect', {EFFECT: ''}, defs, '')).toBe('');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('world_add_world_effect starts a viewport effect at runtime', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_world_effect',
      {EFFECT: 'effects/underwater'},
      defs,
      '',
    );
    expect(code).toBe('world.addEffect("effects/underwater", Underwater);\n');
    expect(defs['mod:effects/underwater']).toBe(
      'import Underwater from "effects/underwater";',
    );
  });

  it('world_add_world_effect carries parameter values', () => {
    const code = run(
      'world_add_world_effect',
      {EFFECT: 'effects/underwater'},
      {},
      '',
      {EPARAM_0_0: '0.4'},
      [{id: 'murk', name: 'murk', type: 'float', defaultValue: 0.1}],
    );
    expect(code).toContain('{"murk": 0.4}');
  });

  it('world_remove_world_effect needs only the path', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_world_effect',
      {EFFECT: 'effects/underwater'},
      defs,
      '',
    );
    expect(code).toBe('world.removeEffect("effects/underwater");\n');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('the runtime world blocks emit nothing without a chosen effect', () => {
    expect(run('world_add_world_effect', {EFFECT: ''}, {}, '')).toBe('');
    expect(run('world_remove_world_effect', {EFFECT: ''}, {}, '')).toBe('');
  });

  it('world_set_background names a whole image, never a cell', () => {
    // The sprite field can carry `coinSpin.png#3`; this one cannot. A backdrop
    // is stretched over the viewport, so a grid of it means nothing.
    expect(run('world_set_background', {BACKGROUND: 'cave.png'}, {}, '')).toBe(
      'world.setBackground("cave.png");\n',
    );
  });

  it('world_set_background_color hands the color over as it arrived', () => {
    // Not through `WorldLab.rgb`, unlike an effect's color parameter: a uniform
    // needs floats, `setBackgroundColor` takes either, and converting here
    // would drop the alpha of an `r g b a` block on the way past.
    expect(
      run('world_set_background_color', {}, {}, '', {COLOR: "'#88ccff'"}),
    ).toBe("world.setBackgroundColor('#88ccff');\n");
    expect(
      run('world_set_background_color', {}, {}, '', {
        COLOR: '[1, 0.5, 0, 0.25]',
      }),
    ).toBe('world.setBackgroundColor([1, 0.5, 0, 0.25]);\n');
  });

  it('world_add_background_effect filters the sky and not the swimmer', () => {
    // The whole point of a backdrop carrying its own effects: `addEffect` would
    // filter the camera, and everything the camera drew with it.
    const defs: Record<string, string> = {};
    const code = run(
      'world_add_background_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
    );
    expect(code).toBe('world.addBackgroundEffect("effects/ripple", Ripple);\n');
    expect(defs['mod:effects/ripple']).toBe(
      'import Ripple from "effects/ripple";',
    );
  });

  it('world_add_background_effect carries parameter values', () => {
    const code = run(
      'world_add_background_effect',
      {EFFECT: 'effects/ripple'},
      {},
      '',
      {EPARAM_0_0: '0.4'},
      [{id: 'speed', name: 'speed', type: 'float', defaultValue: 0.1}],
    );
    expect(code).toContain('{"speed": 0.4}');
  });

  it('world_remove_background_effect needs only the path', () => {
    const defs: Record<string, string> = {};
    const code = run(
      'world_remove_background_effect',
      {EFFECT: 'effects/ripple'},
      defs,
      '',
    );
    expect(code).toBe('world.removeBackgroundEffect("effects/ripple");\n');
    expect(Object.keys(defs)).toEqual([]);
  });

  it('the background blocks emit nothing before they are filled in', () => {
    // A "(none)" dropdown and an emptied socket both read as ''; emitting a
    // call with it would be a runtime error for a half-built block.
    expect(run('world_set_background', {BACKGROUND: ''}, {}, '')).toBe('');
    expect(run('world_set_background_color', {}, {}, '', {COLOR: ''})).toBe('');
    expect(run('world_add_background_effect', {EFFECT: ''}, {}, '')).toBe('');
    expect(run('world_remove_background_effect', {EFFECT: ''}, {}, '')).toBe(
      '',
    );
  });

  it('registers every animation file the project holds, with no block for it', () => {
    // There is no `use animations` block and deliberately so: an animation file
    // is not something a world opts into, it is something the project HAS. A
    // learner who draws one and plays it should not also have to remember to
    // say the world may use it.
    setProjectAnimationFiles([
      ['game', 'animations/game'],
      ['coinSpin', 'animations/coinSpin'],
    ]);
    const defs: Record<string, string> = {};
    const code = run('world_world', {NAME: 'Platform World'}, defs, '');

    expect(code).toContain(
      'world.useAnimations(WorldLab.parseAnimationFile(Game));',
    );
    expect(code).toContain(
      'world.useAnimations(WorldLab.parseAnimationFile(CoinSpin));',
    );
    expect(defs['mod:animations/game']).toBe(
      'import Game from "animations/game";',
    );
    setProjectAnimationFiles([]);
  });
});

describe('world_load_map generator', () => {
  afterEach(() => setProjectMaps({}));

  it('imports+defines each actor the map places, then loads it', () => {
    setProjectMaps({'maps/level1': ['actors/player', 'actors/coin']});
    const defs: Record<string, string> = {};
    const code = generatorFor('world_load_map')(
      {getFieldValue: () => 'maps/level1'} as never,
      {definitions_: defs, statementToCode: () => ''} as never,
      {} as never,
    ) as string;
    expect(code).toBe(
      'world.define("actors/player", Player);\n' +
        'world.define("actors/coin", Coin);\n' +
        'world.loadMap(Level1);\n',
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
              },
            },
          },
          // The trait, beside the rule.
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Windblown'},
            next: {
              block: {type: 'world_rule_event', fields: {NAME: 'gusted'}},
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
    // Namespaced by the RULE, so two rules' same-named members cannot collide —
    // and a member keeps its block type if its rule's file is renamed.
    expect(types).toContain('world_set_HasWind_StrengthProperty');
    expect(types).toContain('world_get_HasWind_StrengthProperty');
    expect(types).toContain('world_on_HasWind_GustedEvent'); // project event hat
    // Built-ins are still present, namespaced the same way.
    expect(types).toContain('world_set_position'); // Spatial's, a hand-written one
    expect(types).toContain('world_get_Space_PositionProperty');
    // A toolbox category for the project rule, carrying its blocks.
    const cats = toolbox as Array<{name: string; blocks: string[]}>;
    expect(cats.find(c => c.name === 'Has Wind')?.blocks).toContain(
      'world_set_HasWind_StrengthProperty',
    );
    // The project event hat is a root (so the generator owns its next chain).
    expect(rootTypes.has('world_on_HasWind_GustedEvent')).toBe(true);
  });

  it('generates a project member’s codegen as an import from its module', () => {
    const {blocks} = buildDomainPalette([wind]);
    const setBlock = blocks.find(
      b => b.type === 'world_set_HasWind_StrengthProperty',
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
                type: 'world_rule_block',
                fields: {RETURNS: 'none'},
                extraState: {
                  parts: [
                    {kind: 'label', text: 'Nudge'},
                    {kind: 'param', type: 'number', var: 'a'},
                    {kind: 'param', type: 'vector', var: 'b'},
                  ],
                },
              },
            },
          },
          // The trait, beside the rule.
          {
            type: 'world_rule_trait',
            fields: {NAME: 'Pushable'},
            next: {
              block: {
                type: 'world_rule_block',
                fields: {RETURNS: 'boolean'},
                extraState: {
                  parts: [
                    {kind: 'label', text: 'Near'},
                    {kind: 'param', type: 'actor', var: 'c'},
                  ],
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
    const nudge = blocks.find(b => b.type === 'world_do_Pushes_NudgeAction')!;
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
    const near = blocks.find(b => b.type === 'world_query_Pushes_NearQuery')!;
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
    // the imperative `define block` (+ its `return`).
    expect(cats.find(c => c.name === 'Rule')?.blocks).toEqual([
      'world_rule',
      'world_use_rule',
      'world_rule_trait',
      'world_use_trait',
      'world_rule_property',
      'world_rule_event',
      'world_rule_block',
      'world_return',
      'world_rule_step_tick',
      'world_rule_step_before',
      'world_rule_step_after',
      'world_emit',
      'world_emit_with',
      'world_step_delta',
      // Reading and writing a variable is its own category (below): a rule's
      // parameters are variables like any other.
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

  it('offers a Variables category, paired by flavour', () => {
    // Paired get/set per type rather than all-gets-then-all-sets: the question
    // a learner arrives with is "how do I keep a vector?", so both blocks for
    // a type should be together when they find it.
    const variables = (
      DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>
    ).find(c => c.name === 'Variables')?.blocks;
    expect(variables).toEqual([
      'variables_get_Number',
      'variables_set_Number',
      'variables_get_Boolean',
      'variables_set_Boolean',
      'variables_get_String',
      'variables_set_String',
      'variables_get_Vector',
      'variables_set_Vector',
      'variables_get_Actor',
      'variables_set_Actor',
    ]);
  });

  it('leaves the actor getter in the Actor category too', () => {
    // Deliberate duplication: the `for each` loop binds an actor variable, and
    // reading it belongs beside the loop that made it as much as in Variables.
    const actor = (
      DOMAIN_TOOLBOX as Array<{name: string; blocks: string[]}>
    ).find(c => c.name === 'Actor')?.blocks;
    expect(actor).toContain('variables_get_Actor');
  });

  it('guards `use trait`, whose `useTraits` is builder-only', () => {
    expect(extensionsOf('world_use_trait')).toContain(TRAIT_CONTEXT_EXTENSION);
  });

  it('guards `remove effect`, which needs a live actor', () => {
    // `Actor.removeEffect` has no builder counterpart — un-declaring on a
    // template described once means nothing — so under `define actor`, where
    // `actor` is the builder, this would throw.
    expect(extensionsOf('world_remove_effect')).toContain(
      RUNTIME_ACTOR_EXTENSION,
    );
  });

  it('guards `remove effect from the world`, which needs a live world', () => {
    // It also carries `worldContext`, which catches `world` being unbound
    // entirely — the two warnings answer different questions.
    expect(extensionsOf('world_remove_world_effect')).toContain(
      RUNTIME_WORLD_EXTENSION,
    );
    expect(extensionsOf('world_remove_world_effect')).toContain(
      WORLD_CONTEXT_EXTENSION,
    );
  });

  it('leaves `add effect` alone, because `addEffect` exists on both', () => {
    // The same reasoning as the `set` blocks below, and the reason there is no
    // separate `use effect`: `ActorBuilder.addEffect` and `Actor.addEffect`
    // agree, so this one block is valid as a template default AND at runtime.
    // Guarding it either way would warn about correct programs.
    const names = extensionsOf('world_add_effect');
    expect(names).not.toContain(RUNTIME_ACTOR_EXTENSION);
    expect(names).not.toContain(TRAIT_CONTEXT_EXTENSION);

    const worldNames = extensionsOf('world_add_world_effect');
    expect(worldNames).not.toContain(RUNTIME_WORLD_EXTENSION);
    // …but `world` must still be bound to something.
    expect(worldNames).toContain(WORLD_CONTEXT_EXTENSION);
  });

  it('leaves the `set` blocks alone, because `set` exists on both', () => {
    // `set sprite` and `set position` emit `target.set(Property, value)`, and
    // both `ActorBuilder` and `Actor` have `set`. They are legitimately valid
    // as a template default AND at runtime, so a guard here would warn about
    // correct programs.
    for (const type of ['world_set_sprite', 'world_set_position']) {
      const names = extensionsOf(type);
      expect(names).not.toContain(RUNTIME_ACTOR_EXTENSION);
      expect(names).not.toContain(TRAIT_CONTEXT_EXTENSION);
    }
  });
});
