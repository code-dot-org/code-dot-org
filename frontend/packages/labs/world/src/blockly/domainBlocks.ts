// The World Lab domain blocks for authoring an Actor, defined with the design
// system's `defineBlock` (INTERFACE.md). Each carries its JavaScript generator,
// so passing this array to a `BlocklyWorkspace`/`BlocklyProvider` `blocks` prop
// registers both the block and its Blockly → world-lab translation on that
// workspace's generator. One source of truth for the editor and the generator.
//
// Generators emit `WorldLab.<X>` references and a single
// `import * as WorldLab from 'world-lab'`, so no per-block import analysis is
// needed; the compiler rewrites `world-lab` to the self-hosted engine.

import type {Block} from 'blockly';
import {Order, type JavascriptGenerator} from 'blockly/javascript';

import {
  createTypedVariable,
  defineBlock,
  type BlockArgDefinition,
  type Toolbox,
} from '@code-dot-org/blockly';

import type {ArgType, PropertyType} from '../engine';
import {SPRITESHEET_NAMES, SPRITE_NAMES} from '../sprites';

import {actorInputExtension} from './actorInput';
import {animationOptionsExtension} from './animationOptions';
import {BUILTIN_RULE_META} from './builtinMeta';
import {worldContextExtension} from './extensions/worldContext';
import {fieldVectorArg, type VectorValue} from './fields/FieldVector';
import {label} from './label';
import {
  actorOptions,
  actorOptionsExtension,
  animationFileOptions,
  animationFileOptionsExtension,
  liveDropdown,
  mapActorTypes,
  mapOptions,
  mapOptionsExtension,
  ruleModuleOptions,
  worldOptions,
  worldOptionsExtension,
} from './moduleOptions';
import type {
  ActionMeta,
  EventMeta,
  MemberRef,
  PropertyMeta,
  QueryMeta,
  RuleMeta,
} from './ruleMeta';
import {traitOptions, traitOptionsExtension} from './traitOptions';
import {
  registerValueShadows,
  valueShadowExtension,
  type ShadowSpec,
} from './valueShadow';

/** JS string literal for a field value. */
const str = (value: unknown): string => JSON.stringify(String(value));

/** Dropdown `[label, value]` pairs for the built-in sprites. */
const SPRITE_OPTIONS: Array<[string, string]> = SPRITE_NAMES.map(name => [
  label(name),
  name,
]);

// The animation dropdown's static fallback — the stock ids. The
// `animationOptionsExtension` replaces this at block-init with the live registry
// (stock + the project's authored animations).
const ANIMATION_OPTIONS: Array<[string, string]> = SPRITESHEET_NAMES.map(
  name => [label(name), name],
);

// The rules whose members drive the block palette: the built-in library as
// `RuleMeta` (dependency order — the toolbox lists one category per rule and the
// generators walk them in order). Project `.rule` metadata will join this list
// so a project rule contributes blocks the same way (a later step).
const AUTHORING_RULES: readonly RuleMeta[] = BUILTIN_RULE_META;

// How generated code names a rule member: `WorldLab.<name>` for a built-in; for
// a project rule, the bare export with a hoisted `import {<name>} from
// '<module>'`. One helper so a single generator emits code for either source.
const refCode = (ref: MemberRef, generator?: JavascriptGenerator): string => {
  if (ref.source === 'project' && ref.modulePath) {
    if (generator) {
      addImport(
        generator,
        `named:${ref.modulePath}:${ref.exportName}`,
        `import {${ref.exportName}} from ${str(ref.modulePath)};`,
      );
    }
    return ref.exportName;
  }
  return `WorldLab.${ref.exportName}`;
};

/** The toolbox/registry type for the block that handles `event`. */
const eventBlockType = (event: EventMeta): string => `world_on_${event.id}`;

// `when key … is pressed/released` dropdown: friendly label -> the DOM
// `KeyboardEvent.key` name the driver reports (space is ' ', letters lowercase).
const KEY_OPTIONS: Array<[string, string]> = [
  ['space', ' '],
  ['up arrow', 'ArrowUp'],
  ['down arrow', 'ArrowDown'],
  ['left arrow', 'ArrowLeft'],
  ['right arrow', 'ArrowRight'],
  ['enter', 'Enter'],
  ...'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map(c => [c.toUpperCase(), c] as [string, string]),
];

// Derive a module/instance id from an authored name: spaces (and any other
// non-identifier character) become underscores, so "Platform World" → the id
// "Platform_World".
const id_from_name = (name: string): string =>
  name.replaceAll(/[^A-Za-z0-9_]/g, '_');

const worldActor = defineBlock({
  type: 'world_actor',
  message0: 'define actor named %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'Actor'}],
  // A definition root, like an event block: no previous connection, a NEXT
  // connection — the actor's `use trait` / `set` / `play` body chains below it,
  // not nested in a `do` input.
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'Define an actor: its traits, properties, and event handlers.',
  generator: {
    javascript(block, generator) {
      const name = block.getFieldValue('NAME');
      // The `export default actor;` and the floating event handlers are appended
      // by the generator's assembly step (BlocklyGenerator), not here — events
      // are their own top-level blocks, so this block only builds the actor.
      return (
        `import * as WorldLab from 'world-lab';\n` +
        `const actor = new WorldLab.ActorBuilder({id: ${str(id_from_name(name))}, name: ${str(name)}});\n` +
        nextChainCode(block, generator)
      );
    },
  },
});

const worldUseTrait = defineBlock({
  type: 'world_use_trait',
  message0: 'use trait %1',
  // The options are the traits in play — those a rule the project's worlds attach
  // provides (populated live by the extension); the value is the trait's export.
  args0: [{type: 'field_dropdown', name: 'TRAIT', options: traitOptions()}],
  previousStatement: true,
  nextStatement: true,
  extensions: [traitOptionsExtension],
  style: 'behavior_blocks',
  tooltip: 'Give the actor a trait (its properties and behavior).',
  generator: {
    javascript(block) {
      const traitExport = block.getFieldValue('TRAIT');
      return `actor.useTraits([WorldLab.${traitExport}]);\n`;
    },
  },
});

const worldSetPosition = defineBlock({
  type: 'world_set_position',
  message0: 'set position of %1  x %2  y %3',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'input_value', name: 'X', check: 'Number'},
    {type: 'input_value', name: 'Y', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // The ACTOR socket defaults to a `this actor` shadow; a loop's touched actor
  // can be dropped in to move that one instead. X/Y are value sockets seeded with
  // `math_number` shadows, so a learner can type a number or slot in a getter.
  extensions: [actorInputExtension, valueShadowExtension],
  style: 'default',
  tooltip: "Set an actor's position.",
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      return `${target}.set(WorldLab.PositionProperty, new WorldLab.Vector(${x}, ${y}));\n`;
    },
  },
});
registerValueShadows('world_set_position', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 0}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 0}}},
]);

const worldSetSprite = defineBlock({
  type: 'world_set_sprite',
  message0: 'set sprite %1 on %2',
  args0: [
    {type: 'field_dropdown', name: 'SPRITE', options: SPRITE_OPTIONS},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  extensions: [actorInputExtension],
  previousStatement: true,
  nextStatement: true,
  style: 'default',
  // Like `play animation`, this only sets the property; the actor must already
  // have the appearance trait (`use trait Has Appearance`). The ACTOR socket
  // defaults to a `this actor` shadow, or take another actor.
  tooltip: "Set an actor's sprite (it must have the appearance trait).",
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const sprite = block.getFieldValue('SPRITE');
      return `${target}.set(WorldLab.SpriteProperty, ${str(sprite)});\n`;
    },
  },
});

const worldPlayAnimation = defineBlock({
  type: 'world_play_animation',
  message0: 'play animation %1 on %2',
  args0: [
    {type: 'field_dropdown', name: 'ANIMATION', options: ANIMATION_OPTIONS},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  extensions: [animationOptionsExtension, actorInputExtension],
  previousStatement: true,
  nextStatement: true,
  // `play animation` is an action of the appearance rule → the action (default)
  // style, like the generated rule-action blocks.
  style: 'default',
  // This only selects which animation plays; the actor must already have the
  // appearance trait (add `use trait Has Appearance`). `playAnimation` restarts
  // it from the first frame — so replaying a finished non-looping animation (a
  // switch) plays it again. It works at runtime on another actor too: the ACTOR
  // socket defaults to a `this actor` shadow, or take a loop's touched actor.
  tooltip: "Play an actor's animation (it must have the appearance trait).",
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.NONE) || 'actor';
      const animation = block.getFieldValue('ANIMATION');
      return `WorldLab.playAnimation(${target}, ${str(animation)});\n`;
    },
  },
});

// Event blocks are generated one-per-event from the rule library, not authored
// by hand: each engine event becomes a `world_on_<id>` "when …" block, filed
// under its rule's toolbox category. Like `when_run`, an event is a top-level
// root: no previous connection, but a NEXT connection — the handler body
// attaches below as the next statement, not nested in a `do` input. The ACTOR
// socket is whose handler this is; it defaults to a `this actor` shadow (on an
// `.actor` file the subject is obvious). A handler runs at RUNTIME, so its args
// are the live `world` and `actor` (they shadow the outer `actor` builder) and
// `eventValue` (the event's detail — the animation frame, the key pressed).

/** Wrap a handler body as the runtime `.on` registration on the target actor. */
const onHandler = (target: string, eventRef: string, body: string): string =>
  `${target}.on(${eventRef}, (world, actor, eventValue) => {\n` +
  `${body}});\n`;

/**
 * The generated code of the blocks chained below `block` — its handler body.
 * The top-level generation pass (BlocklyGenerator) generates these roots with
 * `thisOnly`, so the block owns its next chain here rather than having it
 * appended after the closure by the generator's default `scrub_`.
 */
const nextChainCode = (
  block: Block,
  generator: JavascriptGenerator,
): string => {
  const code = generator.blockToCode(block.getNextBlock());
  return Array.isArray(code) ? code[0] : code;
};

/** A plain event block: `when <actor> <event name>`, body chained below. */
const defineEventBlock = (event: EventMeta) => {
  return defineBlock({
    type: eventBlockType(event),
    message0: `when %1 ${event.name}`,
    args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
    nextStatement: true,
    inputsInline: true,
    extensions: [actorInputExtension],
    style: 'event_blocks',
    tooltip: `Run the blocks below when this actor ${event.name}.`,
    generator: {
      javascript(block, generator) {
        const target =
          generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
        return onHandler(
          target,
          refCode(event.ref, generator),
          nextChainCode(block, generator),
        );
      },
    },
  });
};

// The Input rule's key events carry a per-key detail, so their blocks add a KEY
// dropdown and the handler filters for the chosen key. "presses"/"releases" is
// which event this block hangs off — one block per event, no state dropdown.
const KEY_VERB: Record<string, string> = {
  keyPressed: 'presses',
  keyReleased: 'releases',
};

/** A key event block: `when <actor> presses/releases key <key>`, body below. */
const defineKeyEventBlock = (event: EventMeta) => {
  const verb = KEY_VERB[event.id] ?? 'presses';
  return defineBlock({
    type: eventBlockType(event),
    message0: `when %1 ${verb} key %2`,
    args0: [
      {type: 'input_value', name: 'ACTOR', check: 'Actor'},
      {type: 'field_dropdown', name: 'KEY', options: KEY_OPTIONS},
    ],
    nextStatement: true,
    inputsInline: true,
    extensions: [actorInputExtension],
    style: 'event_blocks',
    tooltip: `Run the blocks below when an actor ${verb} a key (while the game is focused).`,
    generator: {
      javascript(block, generator) {
        const target =
          generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
        const key = block.getFieldValue('KEY');
        // `eventValue` is the key that fired; act only for the chosen key.
        const body = `if (eventValue === ${str(key)}) {\n${nextChainCode(
          block,
          generator,
        )}}\n`;
        return onHandler(target, refCode(event.ref, generator), body);
      },
    },
  });
};

// Build a block for every event the rule library declares. Input's key events
// take the KEY-filtered shape; the rest take the plain shape.
const EVENT_BLOCKS = AUTHORING_RULES.flatMap(rule =>
  rule.events.map(event =>
    rule.id === 'input' ? defineKeyEventBlock(event) : defineEventBlock(event),
  ),
);

/**
 * Root block types — top-level blocks that own the chain below them as a body
 * (an event handler, or an actor/scene/world definition) and generate it
 * themselves. The generator must generate these with `thisOnly` so the body is
 * not also appended after them by the default `scrub_` (see BlocklyGenerator).
 */
export const ROOT_BLOCK_TYPES: ReadonlySet<string> = new Set([
  ...EVENT_BLOCKS.map(block => block.type),
  'world_actor',
  'world_scene',
  'world_world',
]);

// ── Property-driven "set" blocks ─────────────────────────────────────────────
// Every settable property a rule declares becomes a "set …" block, generated
// from the property definition — world-scoped properties (a rule's own, e.g.
// gravity's strength/direction) set on `world`; actor-scoped properties (a
// trait's, e.g. an actor's scale or gravity scale) set on an actor value, like
// the hand-authored `set position`. Reading the engine's Property objects keeps
// these in step with the rule library, the same tack as the trait/event blocks.

// Properties a bespoke block already sets — skip them (by export name) so we
// don't offer two blocks for the same property.
const COVERED_PROPERTY_EXPORTS: ReadonlySet<string> = new Set([
  'PositionProperty', // world_set_position
  'SpriteProperty', // world_set_sprite
  'AnimationProperty', // world_play_animation
]);

/** A property gets a generated block unless it is read-only or bespoke-covered. */
const isSettable = (property: PropertyMeta): boolean =>
  !property.readonly &&
  !COVERED_PROPERTY_EXPORTS.has(property.ref.exportName) &&
  property.ref.exportName !== '';

/** A typed value slot — the shared shape of a property, an action parameter, and
 * a query argument. Uses the wider {@link ArgType} so an `actor` socket (a query
 * argument) is expressible; properties only ever carry a {@link PropertyType}. */
interface TypedValue {
  type: ArgType;
  default?: unknown;
}

/** The input names a {@link TypedValue} occupies (a vector uses `x`/`y`). */
interface ValueNames {
  value: string;
  x: string;
  y: string;
}

const DEFAULT_VALUE_NAMES: ValueNames = {value: 'VALUE', x: 'X', y: 'Y'};

/**
 * The JS value expression a block emits for a typed value, read from its
 * socket(s) via `valueToCode` (so a getter or math block can be slotted in); the
 * value's default is the fallback if a socket is emptied of its shadow.
 */
const typedValueCode = (
  value: TypedValue,
  block: Block,
  generator: JavascriptGenerator,
  names: ValueNames = DEFAULT_VALUE_NAMES,
): string => {
  const d = value.default;
  const read = (name: string): string =>
    generator.valueToCode(block, name, Order.NONE);
  switch (value.type) {
    case 'vector': {
      // A single `Vector` socket (a `world_vector` literal, or a plugged getter).
      const v = (d ?? {x: 0, y: 0}) as {x: number; y: number};
      return (
        read(names.value) ||
        `new WorldLab.Vector(${Number(v.x)}, ${Number(v.y)})`
      );
    }
    case 'point': {
      // Two independent number axes (a scale, a size, a position).
      const v = (d ?? {x: 0, y: 0}) as {x: number; y: number};
      return `new WorldLab.Vector(${read(names.x) || String(v.x)}, ${
        read(names.y) || String(v.y)
      })`;
    }
    case 'actor':
      // An Actor socket (default `this actor`); a plugged actor value replaces it.
      return read(names.value) || 'actor';
    case 'boolean':
      return read(names.value) || (d ? 'true' : 'false');
    case 'string':
      return read(names.value) || str(String(d ?? ''));
    case 'number':
    default:
      return read(names.value) || String(Number(d ?? 0));
  }
};

/**
 * The value input(s) for a typed value: a `%n`-numbered message fragment, the
 * `input_value` args, and the default shadow to seed each (a `math_number` for
 * numbers/vector components, `logic_boolean`/`text` for the other kinds).
 */
const typedValueInputs = (
  value: TypedValue,
  slot: number,
  names: ValueNames = DEFAULT_VALUE_NAMES,
): {
  message: string;
  args: BlockArgDefinition[];
  shadows: Array<{name: string; shadow: ShadowSpec}>;
} => {
  const d = value.default;
  const numberInput = (name: string): BlockArgDefinition => ({
    type: 'input_value',
    name,
    check: 'Number',
  });
  const numberShadow = (name: string, num: number) => ({
    name,
    shadow: {type: 'math_number', fields: {NUM: num}},
  });
  switch (value.type) {
    case 'actor':
      // One `Actor` socket, seeded with a `this actor` shadow — a plugged actor
      // value (a loop variable, a getter) replaces it.
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: 'Actor'}],
        shadows: [{name: names.value, shadow: {type: 'world_this_actor'}}],
      };
    case 'vector': {
      // One `Vector` socket, seeded with a `world_vector` literal (the arrow-grid
      // field) — so you get inline editing and can drop another vector block in.
      const v = (d ?? {x: 0, y: 0}) as {x: number; y: number};
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: 'Vector'}],
        shadows: [
          {
            name: names.value,
            shadow: {
              type: 'world_vector',
              fields: {VECTOR: {x: v.x, y: v.y}},
            },
          },
        ],
      };
    }
    case 'point': {
      // Two independent number axes (each a `math_number`-seeded Number socket).
      const v = (d ?? {x: 0, y: 0}) as {x: number; y: number};
      return {
        message: `x %${slot}  y %${slot + 1}`,
        args: [numberInput(names.x), numberInput(names.y)],
        shadows: [numberShadow(names.x, v.x), numberShadow(names.y, v.y)],
      };
    }
    case 'boolean':
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: 'Boolean'}],
        shadows: [
          {
            name: names.value,
            shadow: {
              type: 'logic_boolean',
              fields: {BOOL: d ? 'TRUE' : 'FALSE'},
            },
          },
        ],
      };
    case 'string':
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: 'String'}],
        shadows: [
          {
            name: names.value,
            shadow: {type: 'text', fields: {TEXT: String(d ?? '')}},
          },
        ],
      };
    case 'number':
    default:
      return {
        message: `%${slot}`,
        args: [numberInput(names.value)],
        shadows: [numberShadow(names.value, Number(d ?? 0))],
      };
  }
};

/** The registry/toolbox types for the blocks that set / get `property`. */
const setPropertyBlockType = (exportName: string): string =>
  `world_set_${exportName}`;
const getPropertyBlockType = (exportName: string): string =>
  `world_get_${exportName}`;

// The `output` check for a value kind. A `vector` reports a whole `Vector`; a
// `point` getter reports one axis (a Number, chosen by a dropdown).
const outputForType = (type: PropertyType): string =>
  type === 'boolean'
    ? 'Boolean'
    : type === 'string'
      ? 'String'
      : type === 'vector'
        ? 'Vector'
        : 'Number';

// A value block's style by the kind it reports: a boolean is logic, a whole
// vector is a location, everything else (numbers, point axes) is math.
const valueStyle = (type: PropertyType): string =>
  type === 'boolean'
    ? 'logic_blocks'
    : type === 'vector'
      ? 'location_blocks'
      : 'math_blocks';

/**
 * A "set …" block for one settable property, generated from its definition. An
 * actor property (a trait's) takes an ACTOR value input defaulting to a `this
 * actor` shadow and sets it on that actor; a world property (a rule's own) sets
 * it on `world`. The value input(s) match the property's type.
 */
const defineSetPropertyBlock = (property: PropertyMeta) => {
  const name = property.name;
  const actorScoped = property.scope === 'actor';
  // The value inputs start at %2 after the ACTOR input (%1), else at %1.
  const value = typedValueInputs(property, actorScoped ? 2 : 1);
  const message0 = actorScoped
    ? `set ${name} of %1 to ${value.message}`
    : `set world ${name} to ${value.message}`;
  const args0: BlockArgDefinition[] = actorScoped
    ? [{type: 'input_value', name: 'ACTOR', check: 'Actor'}, ...value.args]
    : value.args;
  const type = setPropertyBlockType(property.ref.exportName);
  // Seed the value sockets with their default shadow blocks (attached on init).
  registerValueShadows(type, value.shadows);
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    // A world property sets on `world`; warn if placed where `world` is unbound.
    extensions: actorScoped
      ? [actorInputExtension, valueShadowExtension]
      : [valueShadowExtension, worldContextExtension],
    style: 'default',
    tooltip: actorScoped
      ? `Set an actor's ${name}.`
      : `Set the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        const target = actorScoped
          ? generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor'
          : 'world';
        return `${target}.set(${refCode(property.ref, generator)}, ${typedValueCode(
          property,
          block,
          generator,
        )});\n`;
      },
    },
  });
};

/**
 * A "get …" reporter for one settable property — the read counterpart of the set
 * block. An actor property takes an ACTOR value input (defaulting to a `this
 * actor` shadow); a world property reads `world`. A `vector` property reads the
 * whole Vector; a `point` reads one axis via an x/y dropdown (a Number); scalars
 * read directly — so a value plugs into logic/math/vector sockets.
 */
const defineGetPropertyBlock = (property: PropertyMeta) => {
  const name = property.name;
  const actorScoped = property.scope === 'actor';
  // A point is read one axis at a time (an x/y dropdown → a Number); a vector is
  // read whole. Everything else is a plain scalar read.
  const hasComponent = property.type === 'point';

  // Build message + args left-to-right: an optional x/y component dropdown (for
  // points), then the ACTOR input (for actor properties).
  const args0: BlockArgDefinition[] = [];
  const slot = (arg: BlockArgDefinition): string => {
    args0.push(arg);
    return `%${args0.length}`;
  };
  const component = (): string =>
    slot({
      type: 'field_dropdown',
      name: 'COMPONENT',
      options: [
        ['x', 'x'],
        ['y', 'y'],
      ],
    });
  const actorSocket = (): string =>
    slot({type: 'input_value', name: 'ACTOR', check: 'Actor'});

  const message0 = actorScoped
    ? hasComponent
      ? `get ${name} ${component()} of ${actorSocket()}`
      : `get ${name} of ${actorSocket()}`
    : hasComponent
      ? `get world ${name} ${component()}`
      : `get world ${name}`;

  return defineBlock({
    type: getPropertyBlockType(property.ref.exportName),
    message0,
    args0,
    inputsInline: true,
    output: outputForType(property.type),
    // A world property reads from `world`; warn if placed where it is unbound.
    extensions: actorScoped ? [actorInputExtension] : [worldContextExtension],
    // Style by the value it reports: a boolean reads as logic, a whole vector as
    // a location, a number/point axis as math.
    style: valueStyle(property.type),
    tooltip: actorScoped
      ? `Get an actor's ${name}.`
      : `Get the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        const target = actorScoped
          ? generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor'
          : 'world';
        const component = hasComponent
          ? `.${block.getFieldValue('COMPONENT')}`
          : '';
        return [
          `${target}.get(${refCode(property.ref, generator)})${component}`,
          Order.ATOMIC,
        ] as [string, number];
      },
    },
  });
};

// Generate a set + get block for every settable property, in rule/trait
// declaration order, and record which belong to each rule's toolbox category: a
// rule's own (world) properties, then those of every trait it defines (actor).
type PropertyBlock =
  | ReturnType<typeof defineSetPropertyBlock>
  | ReturnType<typeof defineGetPropertyBlock>;
const PROPERTY_BLOCKS: PropertyBlock[] = [];
const PROPERTY_BLOCK_TYPES_BY_RULE = new Map<RuleMeta, string[]>();
for (const rule of AUTHORING_RULES) {
  const types: string[] = [];
  // `rule.properties` is already world-scoped members then each trait's — the
  // same order the two nested loops walked.
  for (const property of rule.properties) {
    if (!isSettable(property)) {
      continue;
    }
    const setBlock = defineSetPropertyBlock(property);
    const getBlock = defineGetPropertyBlock(property);
    PROPERTY_BLOCKS.push(setBlock, getBlock);
    types.push(setBlock.type, getBlock.type);
  }
  PROPERTY_BLOCK_TYPES_BY_RULE.set(rule, types);
}

// ── Rule action blocks ───────────────────────────────────────────────────────
// Every action a rule exposes becomes a "do it" block, generated from the action
// definition — a world action (a rule's own, e.g. gravity's Invert) runs on
// `world`; an actor action (a trait's, e.g. Move to / Apply force) runs on an
// actor value via an `on …` socket, like `play animation`. The value inputs come
// from the action's `params` (the action analogue of a property's type).

/** The registry/toolbox type for the block that runs `action`. */
const actionBlockType = (exportName: string): string =>
  `world_do_${exportName}`;

/**
 * A "do this action" block for one rule action, generated from its definition.
 * A world action runs on `world`; an actor action takes an `on …` ACTOR socket
 * (default `this actor`) and runs on it. The single argument (actions take zero
 * or one) is a typed value socket, like a setter's — a getter/math can slot in.
 */
const defineActionBlock = (action: ActionMeta) => {
  const actorScoped = action.scope === 'actor';
  const name = action.name;
  const param = action.params[0]; // actions take zero or one argument
  const value = param
    ? typedValueInputs(param, 1)
    : {message: '', args: [] as BlockArgDefinition[], shadows: []};

  const args0: BlockArgDefinition[] = [...value.args];
  let message0 = value.message ? `${name} ${value.message}` : name;
  if (actorScoped) {
    // Target socket last, like `play animation … on …`.
    args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
    message0 = `${message0} on %${args0.length}`;
  }

  const type = actionBlockType(action.ref.exportName);
  if (value.shadows.length) {
    registerValueShadows(type, value.shadows);
  }
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    // A world action runs on `world`; warn if placed where `world` is unbound.
    extensions: [
      ...(actorScoped ? [actorInputExtension] : [worldContextExtension]),
      ...(value.shadows.length ? [valueShadowExtension] : []),
    ],
    style: 'default',
    tooltip: actorScoped ? `${name} — for an actor.` : name,
    generator: {
      javascript(block, generator) {
        const target = actorScoped
          ? generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor'
          : 'world';
        const argCode = param
          ? `, ${typedValueCode(param, block, generator)}`
          : '';
        return `${target}.act(${refCode(action.ref, generator)}${argCode});\n`;
      },
    },
  });
};

// Generate a block for every rule action (world actions first, then each trait's
// actor actions), recording which belong to each rule's toolbox category.
const ACTION_BLOCKS: ReturnType<typeof defineActionBlock>[] = [];
const ACTION_BLOCK_TYPES_BY_RULE = new Map<RuleMeta, string[]>();
for (const rule of AUTHORING_RULES) {
  const types: string[] = [];
  // `rule.actions` is the rule's own (world) actions then each trait's (actor),
  // in the same order the two nested loops walked.
  for (const action of rule.actions) {
    if (action.ref.exportName === '') {
      continue;
    }
    const block = defineActionBlock(action);
    ACTION_BLOCKS.push(block);
    types.push(block.type);
  }
  ACTION_BLOCK_TYPES_BY_RULE.set(rule, types);
}

// ── Rule query blocks ────────────────────────────────────────────────────────
// A query that declares a scalar return (`returns`) becomes a reporter block — a
// read like a getter, but computed by the rule (e.g. gravity's "is on the
// ground?"). An actor query (a trait's) reads an actor value; a world query (a
// rule's own) reads `world`. Styled by the value it reports — a boolean as logic.
// A query with no `returns` (e.g. Collision's `TouchingQuery`, which returns an
// actor list surfaced as the `for each … touching` loop) gets no block.

/** The registry/toolbox type for the block that reads `query`. */
const queryBlockType = (exportName: string): string =>
  `world_query_${exportName}`;

/**
 * A reporter for one rule query. An actor query takes an ACTOR value input
 * (default `this actor`) and reads it — `actor.query(WorldLab.X)`; a world query
 * reads `world`. Its output/style match the value it returns (a boolean → logic).
 */
/** The input names a query param occupies, derived from its declared name. */
const paramValueNames = (name: string): ValueNames => {
  const upper = name.toUpperCase();
  return {value: upper, x: `${upper}_X`, y: `${upper}_Y`};
};

const defineQueryBlock = (query: QueryMeta) => {
  const actorScoped = query.scope === 'actor';
  const name = query.name;
  const returns = query.returns ?? 'boolean';
  const type = queryBlockType(query.ref.exportName);
  // A world query may take typed arguments (its `params`), each a value socket;
  // an actor query reads the actor it is called on.
  const params = actorScoped ? [] : query.params;
  const paramNames = params.map(param => paramValueNames(param.name));

  const args0: BlockArgDefinition[] = [];
  const shadows: Array<{name: string; shadow: ShadowSpec}> = [];
  let message0: string;
  if (actorScoped) {
    // The name reads as a predicate ("is on the ground?"), so the subject leads:
    // "this actor is on the ground?".
    message0 = `%1 ${name}`;
    args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
  } else if (params.length > 0) {
    // A predicate over its arguments — the first argument leads, the name
    // follows, the rest trail: "%1 is touching %2".
    const frags = params.map((param, i) => {
      const built = typedValueInputs(param, args0.length + 1, paramNames[i]);
      args0.push(...built.args);
      shadows.push(...built.shadows);
      return built.message;
    });
    message0 = `${frags[0]} ${name}${frags
      .slice(1)
      .map(f => ` ${f}`)
      .join('')}`;
  } else {
    // A nullary world query — stands alone.
    message0 = name;
  }

  if (shadows.length) {
    registerValueShadows(type, shadows);
  }

  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    output: outputForType(returns),
    extensions: actorScoped
      ? [actorInputExtension]
      : [
          worldContextExtension,
          ...(shadows.length ? [valueShadowExtension] : []),
        ],
    style: valueStyle(returns),
    tooltip: actorScoped ? `Whether an actor ${name}` : `The world's ${name}`,
    generator: {
      javascript(block, generator) {
        if (actorScoped) {
          const target =
            generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
          return [
            `${target}.query(${refCode(query.ref, generator)})`,
            Order.ATOMIC,
          ] as [string, number];
        }
        const argCode = params
          .map(
            (param, i) =>
              `, ${typedValueCode(param, block, generator, paramNames[i])}`,
          )
          .join('');
        return [
          `world.query(${refCode(query.ref, generator)}${argCode})`,
          Order.ATOMIC,
        ] as [string, number];
      },
    },
  });
};

// Generate a reporter for every query that declares a return type — a rule's own
// (world) queries, then those of every trait it defines (actor).
const QUERY_BLOCKS: ReturnType<typeof defineQueryBlock>[] = [];
const QUERY_BLOCK_TYPES_BY_RULE = new Map<RuleMeta, string[]>();
for (const rule of AUTHORING_RULES) {
  const types: string[] = [];
  // World queries then each trait's, in declaration order (as `rule.queries`).
  for (const query of rule.queries) {
    if (!query.returns || query.ref.exportName === '') {
      continue;
    }
    const block = defineQueryBlock(query);
    QUERY_BLOCKS.push(block);
    types.push(block.type);
  }
  QUERY_BLOCK_TYPES_BY_RULE.set(rule, types);
}

const worldLog = defineBlock({
  type: 'world_log',
  message0: 'log %1',
  args0: [{type: 'field_input', name: 'TEXT', text: 'Hello'}],
  previousStatement: true,
  nextStatement: true,
  style: 'text_blocks',
  tooltip: 'Print a message to the console.',
  generator: {
    javascript(block) {
      return `console.log(${str(block.getFieldValue('TEXT'))});\n`;
    },
  },
});

// Prints any value — pairs with the standard expression blocks (and
// `world_event_value`) so a learner can log a computed value, not just a literal.
const worldPrint = defineBlock({
  type: 'world_print',
  message0: 'print %1',
  args0: [{type: 'input_value', name: 'VALUE'}],
  previousStatement: true,
  nextStatement: true,
  style: 'text_blocks',
  tooltip: 'Print a value to the console.',
  generator: {
    javascript(block, generator) {
      const value = generator.valueToCode(block, 'VALUE', Order.NONE) || "''";
      return `console.log(${value});\n`;
    },
  },
});

// The current event's value as an expression — e.g. the animation frame in a
// "when animation frame changes" handler. `eventValue` is the handler arg bound
// by world_on_event, so this is only meaningful inside a "when" block.
const worldEventValue = defineBlock({
  type: 'world_event_value',
  message0: 'event value',
  output: 'Number',
  style: 'variable_blocks',
  tooltip: 'The value of the current event (e.g. the animation frame).',
  generator: {
    javascript() {
      return ['eventValue', Order.ATOMIC] as [string, number];
    },
  },
});

// ── Vector values ────────────────────────────────────────────────────────────
// A `Vector` value block — the literal that seeds every `vector` socket (the
// analogue of `math_number` for `Number`). Its `field_vector` opens the arrow-
// grid editor; it outputs a `Vector`. `world_vector_component` reads one axis of
// a Vector back out as a Number.

const worldVector = defineBlock({
  type: 'world_vector',
  message0: '%1',
  args0: [fieldVectorArg('VECTOR', {x: 0, y: 0})],
  output: 'Vector',
  style: 'location_blocks',
  tooltip: 'A 2D vector (x, y) — click to edit it on an arrow grid.',
  generator: {
    javascript(block) {
      const v = (block.getFieldValue('VECTOR') ?? {x: 0, y: 0}) as VectorValue;
      return [
        `new WorldLab.Vector(${Number(v.x)}, ${Number(v.y)})`,
        Order.ATOMIC,
      ] as [string, number];
    },
  },
});

const worldVectorComponent = defineBlock({
  type: 'world_vector_component',
  message0: '%1 of %2',
  args0: [
    {
      type: 'field_dropdown',
      name: 'COMPONENT',
      options: [
        ['x', 'x'],
        ['y', 'y'],
      ],
    },
    {type: 'input_value', name: 'VEC', check: 'Vector'},
  ],
  inputsInline: true,
  output: 'Number',
  style: 'math_blocks',
  tooltip: 'Read one axis (x or y) of a vector as a number.',
  generator: {
    javascript(block, generator) {
      const component = block.getFieldValue('COMPONENT');
      const vec =
        generator.valueToCode(block, 'VEC', Order.MEMBER) ||
        'new WorldLab.Vector(0, 0)';
      return [`${vec}.${component}`, Order.MEMBER] as [string, number];
    },
  },
});
registerValueShadows('world_vector_component', [
  {name: 'VEC', shadow: {type: 'world_vector', fields: {VECTOR: {x: 0, y: 0}}}},
]);

// ── Actor values, variables & filtering ──────────────────────────────────────
// Blocks that yield an Actor (output type "Actor") for a block's `of …`/socket.
// `world_this_actor` is the principal actor (`this`); `ActorVariable` is a
// reusable typed variable (its getter reads a bound actor, e.g. a loop's), built
// on the shared `createTypedVariable` facility. `world_for_each` iterates the
// world's actors, filtered by a `where` predicate; `world_is_a` tests an actor's
// kind — together they replace the old bespoke `for each … touching` loop,
// composing with the generated `is touching` predicate instead.

const worldThisActor = defineBlock({
  type: 'world_this_actor',
  message0: 'this actor',
  output: 'Actor',
  // Actor values share the sprite style — the color that groups the actors.
  style: 'sprite_blocks',
  tooltip: 'This actor — the one these blocks belong to.',
  generator: {
    javascript() {
      return ['actor', Order.ATOMIC] as [string, number];
    },
  },
});

// The `Actor` typed variable: a getter (`variables_get_Actor`, output `Actor`)
// and a `field(name)` helper for binding one (the for-each loop variable). An
// Actor variable only plugs into Actor sockets, and reads with the sprite style.
// `defaultName` is `other`, not `actor`: the principal actor generates as the
// bare identifier `actor`, so a loop variable named `actor` would shadow it
// (`for (const actor of world.actors)`) and break "this actor is touching it".
// The generator also reserves `actor` (see BlocklyGenerator) against a rename.
const ActorVariable = createTypedVariable({
  type: 'Actor',
  style: 'sprite_blocks',
  defaultName: 'other',
  tooltip:
    'An actor held in a variable — e.g. the one a “for each” loop is on.',
});

const worldForEach = defineBlock({
  type: 'world_for_each',
  message0: 'for each actor %1 where %2',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'WHERE', check: 'Boolean'},
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // Iterates `world.actors`, so warn where `world` is unbound; the WHERE socket
  // seeds a `true` shadow (run for every actor until a predicate is dropped in).
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'loop_blocks',
  tooltip:
    'Run the blocks once for each actor the “where” test accepts. Bind the ' +
    'loop variable to read the current actor. Only valid where a world is known.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const where = generator.valueToCode(block, 'WHERE', Order.NONE) || 'true';
      const body = generator.statementToCode(block, 'DO');
      return `for (const ${variable} of world.actors) {\nif (${where}) {\n${body}}\n}\n`;
    },
  },
});
registerValueShadows('world_for_each', [
  {name: 'WHERE', shadow: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
]);

const worldIsA = defineBlock({
  type: 'world_is_a',
  message0: '%1 is a %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'field_dropdown', name: 'TYPE', options: actorOptions()},
  ],
  inputsInline: true,
  output: 'Boolean',
  // ACTOR defaults to a `this actor` shadow; the dropdown lists the project's
  // actor templates (populated live), the same as `world_add_actor`.
  extensions: [actorInputExtension, actorOptionsExtension],
  style: 'logic_blocks',
  tooltip:
    'Whether an actor is of a given kind (the map places it by its type).',
  generator: {
    javascript(block, generator) {
      // The dropdown value is the module path (`actors/coin`), which the scene
      // stamps as each placed actor's `type` — so an actor's kind is its `.type`.
      const actor =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const modulePath = block.getFieldValue('TYPE');
      return [`${actor}.type === ${str(modulePath)}`, Order.EQUALITY] as [
        string,
        number,
      ];
    },
  },
});

// ── Scene composition ────────────────────────────────────────────────────────
// A `.scene` file is authored with `world_scene` (the root, like `world_actor`)
// and `world_add_actor` children. Each `add` block PLACES an instance of an
// actor template: it binds `const actor = scene.addActor(Template, <id>)` in its
// own block scope, so the very same `set`-style body blocks that target `actor`
// in an actor definition compose here unchanged (only the pure `actor.set(...)`
// ones — `set position` — are valid on a live instance; trait/appearance blocks
// belong to the template). The instance id is the Blockly block's own id, which
// is stable across edits — realizing "scene tools supply stable ids".

/** A JS import identifier for a project module path (`actors/coin` → `Coin`). */
const importVar = (path: string): string => {
  const base = (path.split('/').pop() ?? path).replace(/\.[^.]+$/, '');
  const camel = base.replace(/[^a-zA-Z0-9]+(.)?/g, (_all, c: string) =>
    c ? c.toUpperCase() : '',
  );
  const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
  return pascal || 'Module';
};

/** Register a hoisted top-level import; Blockly's `finish()` emits it, deduped. */
const addImport = (generator: unknown, key: string, code: string): void => {
  (generator as {definitions_: Record<string, string>}).definitions_[key] =
    code;
};

const worldScene = defineBlock({
  type: 'world_scene',
  message0: 'define scene named %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'Game'}],
  message1: 'world %1',
  args1: [{type: 'field_dropdown', name: 'WORLD', options: worldOptions()}],
  // A definition root: no previous connection, a NEXT connection — the `add
  // actor` / `load map` body chains below it, not nested in a `do` input.
  nextStatement: true,
  extensions: [worldOptionsExtension],
  style: 'setup_blocks',
  tooltip:
    'Define a scene: the world its actors live in, and the actors in it.',
  generator: {
    javascript(block, generator) {
      const name = block.getFieldValue('NAME');
      const world = block.getFieldValue('WORLD');
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      addImport(
        generator,
        `mod:${world}`,
        `import ${importVar(world)} from ${str(world)};`,
      );
      const body = nextChainCode(block, generator);
      return (
        `const scene = new WorldLab.SceneBuilder({id: ${str(id_from_name(name))}, name: ${str(
          name,
        )}});\n` +
        `scene.useWorld(${importVar(world)});\n` +
        body
      );
    },
  },
});

const worldAddActor = defineBlock({
  type: 'world_add_actor',
  message0: 'add actor %1',
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorOptions()}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [actorOptionsExtension],
  style: 'behavior_blocks',
  tooltip: 'Place an instance of an actor and set its per-instance properties.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      addImport(
        generator,
        `mod:${actor}`,
        `import ${importVar(actor)} from ${str(actor)};`,
      );
      const body = generator.statementToCode(block, 'DO');
      // Block scope: each add's `actor` binding is independent, so several adds
      // in one scene don't collide, and the DO body's `actor.set(...)` blocks
      // (e.g. set position) target it. The block id is the stable instance id;
      // the module path is the actor's kind (its `type`), so "for each … I'm
      // touching" matches it regardless of the template's authored name.
      return (
        `{\nconst actor = scene.addActor(${importVar(actor)}, ${str(
          block.id,
        )}, ${str(actor)});\n` + `${body}}\n`
      );
    },
  },
});

const worldLoadMap = defineBlock({
  type: 'world_load_map',
  message0: 'load map %1',
  args0: [{type: 'field_dropdown', name: 'MAP', options: mapOptions()}],
  previousStatement: true,
  nextStatement: true,
  extensions: [mapOptionsExtension],
  style: 'setup_blocks',
  tooltip: 'Place all the actors a map file describes into the scene.',
  generator: {
    javascript(block, generator) {
      const map = block.getFieldValue('MAP');
      // A map places instances of actor templates (`scene.populate`), so each
      // referenced template is imported and registered first. The generator
      // reads the map's actor modules from the live project registry.
      const defines = mapActorTypes(map)
        .map(type => {
          addImport(
            generator,
            `mod:${type}`,
            `import ${importVar(type)} from ${str(type)};`,
          );
          return `scene.define(${str(type)}, ${importVar(type)});\n`;
        })
        .join('');
      addImport(
        generator,
        `map:${map}`,
        `import ${importVar(map)} from ${str(map)};`,
      );
      return `${defines}scene.populate(${importVar(map)});\n`;
    },
  },
});

// ── World composition ────────────────────────────────────────────────────────
// A `.world` file is authored with `world_world` (the root, like `world_actor`)
// and `world_use_rule` / `world_use_animations` children — the rules in play and
// the animation files to register. Each body block targets the `const world`
// the root binds, mirroring the actor/scene pattern.

const worldWorld = defineBlock({
  type: 'world_world',
  message0: 'define world named %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'World'}],
  // A definition root: no previous connection, a NEXT connection — the `use
  // rule` / `use animations` body chains below it, not nested in a `do` input.
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'Define a world: the rules in play and the animations it registers.',
  generator: {
    javascript(block, generator) {
      const name = block.getFieldValue('NAME');
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      const body = nextChainCode(block, generator);
      return (
        `const world = new WorldLab.WorldBuilder({id: ${str(id_from_name(name))}, name: ${str(
          name,
        )}});\n` + body
      );
    },
  },
});

// The `use rule` dropdown offers the built-in rules AND the project's own rule
// modules (under `rules/`). A built-in's value is its `world-lab` export name; a
// project rule's is its module path — the generator branches on the `/` a path
// carries, importing the module rather than reading `WorldLab`. This is the
// first seam toward rules living in the project rather than the engine bundle.
const BUILTIN_RULE_OPTIONS: Array<[string, string]> = AUTHORING_RULES.map(
  rule => [rule.name, rule.ref.exportName],
);
const useRuleOptions = (): Array<[string, string]> => [
  ...BUILTIN_RULE_OPTIONS,
  ...ruleModuleOptions(),
];
const useRuleOptionsExtension = liveDropdown(
  'world_use_rule_options',
  'RULE',
  useRuleOptions,
);

const worldUseRule = defineBlock({
  type: 'world_use_rule',
  message0: 'use rule %1',
  args0: [
    {type: 'field_dropdown', name: 'RULE', options: BUILTIN_RULE_OPTIONS},
  ],
  previousStatement: true,
  nextStatement: true,
  extensions: [useRuleOptionsExtension],
  style: 'behavior_blocks',
  tooltip: 'Put a rule (a game mechanic) in play for this world.',
  generator: {
    javascript(block, generator) {
      const rule = block.getFieldValue('RULE');
      // A project rule module (a path) is imported; a built-in reads `WorldLab`.
      if (rule.includes('/')) {
        addImport(
          generator,
          `mod:${rule}`,
          `import ${importVar(rule)} from ${str(rule)};`,
        );
        return `world.useRules([${importVar(rule)}]);\n`;
      }
      return `world.useRules([WorldLab.${rule}]);\n`;
    },
  },
});

const worldUseAnimations = defineBlock({
  type: 'world_use_animations',
  message0: 'use animations %1',
  args0: [
    {type: 'field_dropdown', name: 'FILE', options: animationFileOptions()},
  ],
  previousStatement: true,
  nextStatement: true,
  extensions: [animationFileOptionsExtension],
  style: 'sprite_blocks',
  tooltip: 'Register the animations authored in a project animation file.',
  generator: {
    javascript(block, generator) {
      const file = block.getFieldValue('FILE');
      addImport(
        generator,
        `mod:${file}`,
        `import ${importVar(file)} from ${str(file)};`,
      );
      return `world.useAnimations(WorldLab.parseAnimationFile(${importVar(
        file,
      )}));\n`;
    },
  },
});

/**
 * The domain blocks — pass to a workspace/provider `blocks` prop. The standard
 * Blockly blocks the toolbox also offers (controls_if, logic_compare,
 * math_number, text, …) are NOT listed here: importing `@code-dot-org/blockly`
 * already registers them (and their JavaScript generators) natively, and
 * re-registering them through the design-system Driver drops their statement
 * connections. The toolbox references them by type; the workspace resolves them
 * from the native registry.
 */
export const DOMAIN_BLOCKS = [
  worldActor,
  worldUseTrait,
  worldSetPosition,
  worldSetSprite,
  worldPlayAnimation,
  ...PROPERTY_BLOCKS,
  ...ACTION_BLOCKS,
  ...QUERY_BLOCKS,
  ...EVENT_BLOCKS,
  worldLog,
  worldPrint,
  worldEventValue,
  worldVector,
  worldVectorComponent,
  worldThisActor,
  ActorVariable.getterBlock,
  worldForEach,
  worldIsA,
  worldScene,
  worldAddActor,
  worldLoadMap,
  worldWorld,
  worldUseRule,
  worldUseAnimations,
];

// Keyed by rule id: the hand-authored (non-generated) blocks that act on a
// rule's traits/queries. `use trait`/`use rule` span every rule, so they live
// with the Actor/World they build, not in any one rule category.
const RULE_HAND_BLOCKS = new Map<string, string[]>([
  ['spatial', ['world_set_position']],
  ['animation', ['world_set_sprite', 'world_play_animation']],
]);

// A rule's category: its hand-authored blocks, the generated set/get property
// blocks, the generated query reporters, the generated action blocks, then the
// generated event hats. A rule with none of these is dropped.
const ruleCategory = (rule: RuleMeta) => ({
  name: rule.name,
  blocks: [
    ...(RULE_HAND_BLOCKS.get(rule.id) ?? []),
    ...(PROPERTY_BLOCK_TYPES_BY_RULE.get(rule) ?? []),
    ...(QUERY_BLOCK_TYPES_BY_RULE.get(rule) ?? []),
    ...(ACTION_BLOCK_TYPES_BY_RULE.get(rule) ?? []),
    ...rule.events.map(eventBlockType),
  ],
});

/**
 * The toolbox for the Blockly editor. Structural categories (Actor, Scene,
 * World) come first, then one category per rule (in dependency order) holding
 * that rule's blocks, generated property setters, and events, then the
 * general-purpose blocks (Console output, Logic, Math, Text).
 */
export const DOMAIN_TOOLBOX: Toolbox = [
  {
    name: 'Actor',
    blocks: [
      'world_actor',
      'world_use_trait',
      'world_this_actor',
      ActorVariable.getterType,
      'world_is_a',
    ],
  },
  {name: 'Scene', blocks: ['world_scene', 'world_add_actor', 'world_load_map']},
  {
    name: 'World',
    blocks: ['world_world', 'world_use_rule', 'world_use_animations'],
  },
  ...AUTHORING_RULES.map(ruleCategory).filter(
    category => category.blocks.length > 0,
  ),
  {name: 'Loops', blocks: ['world_for_each']},
  {name: 'Console', blocks: ['world_log', 'world_print', 'world_event_value']},
  {
    name: 'Logic',
    blocks: [
      'controls_if',
      'logic_compare',
      'logic_operation',
      'logic_negate',
      'logic_boolean',
    ],
  },
  {
    name: 'Math',
    blocks: [
      'math_number',
      'math_arithmetic',
      'math_modulo',
      'world_vector',
      'world_vector_component',
    ],
  },
  {name: 'Text', blocks: ['text']},
];
