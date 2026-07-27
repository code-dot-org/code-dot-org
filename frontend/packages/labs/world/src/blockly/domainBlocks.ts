// The World Lab domain blocks for authoring an Actor, defined with the design
// system's `defineBlock` (INTERFACE.md). Each carries its JavaScript generator,
// so passing this array to a `BlocklyWorkspace`/`BlocklyProvider` `blocks` prop
// registers both the block and its Blockly → world-lab translation on that
// workspace's generator. One source of truth for the editor and the generator.
//
// Generators emit `WorldLab.<X>` references and a single
// `import * as WorldLab from 'world-lab'`, so no per-block import analysis is
// needed; the compiler rewrites `world-lab` to the self-hosted engine.

import {Order} from 'blockly/javascript';

import {defineBlock, type Toolbox} from '@code-dot-org/blockly';

import {SPRITESHEET_NAMES, SPRITE_NAMES} from '../sprites';

import {animationOptionsExtension} from './animationOptions';
import {label} from './label';

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

// Dropdown value -> the `world-lab` export name.
const TRAIT_CONST: Record<string, string> = {
  affected: 'AffectedByGravityTrait',
  ground: 'GroundTrait',
  controlled: 'ControlledByArrowsTrait',
};
const EVENT_CONST: Record<string, string> = {
  startsFalling: 'StartsFallingEvent',
  stopsFalling: 'StopsFallingEvent',
  animationEnded: 'AnimationEndedEvent',
  frameChanged: 'FrameChangedEvent',
};

const worldActor = defineBlock({
  type: 'world_actor',
  message0: 'actor  id %1  name %2',
  args0: [
    {type: 'field_input', name: 'ID', text: 'actor'},
    {type: 'field_input', name: 'NAME', text: 'Actor'},
  ],
  message1: '%1',
  args1: [{type: 'input_statement', name: 'BODY'}],
  style: 'setup_blocks',
  tooltip: 'Define an actor: its traits, properties, and event handlers.',
  generator: {
    javascript(block, generator) {
      const id = block.getFieldValue('ID');
      const name = block.getFieldValue('NAME');
      const body = generator.statementToCode(block, 'BODY');
      // The `export default actor;` and the floating event handlers are appended
      // by the generator's assembly step (BlocklyGenerator), not here — events
      // are their own top-level blocks, so this block only builds the actor.
      return (
        `import * as WorldLab from 'world-lab';\n` +
        `const actor = new WorldLab.ActorBuilder({id: ${str(id)}, name: ${str(name)}});\n` +
        body
      );
    },
  },
});

const worldUseTrait = defineBlock({
  type: 'world_use_trait',
  message0: 'use trait %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'TRAIT',
      options: [
        ['Affected by Gravity', 'affected'],
        ['Acts as Ground', 'ground'],
        ['Controlled by Arrow Keys', 'controlled'],
      ],
    },
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'behavior_blocks',
  tooltip: 'Give the actor a trait (its properties and behavior).',
  generator: {
    javascript(block) {
      const constName = TRAIT_CONST[block.getFieldValue('TRAIT')] ?? '';
      return `actor.useTraits([WorldLab.${constName}]);\n`;
    },
  },
});

const worldSetPosition = defineBlock({
  type: 'world_set_position',
  message0: 'set position  x %1  y %2',
  args0: [
    {type: 'field_number', name: 'X', value: 0},
    {type: 'field_number', name: 'Y', value: 0},
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'location_blocks',
  tooltip: "Set the actor's starting position.",
  generator: {
    javascript(block) {
      const x = Number(block.getFieldValue('X'));
      const y = Number(block.getFieldValue('Y'));
      return `actor.set(WorldLab.PositionProperty, new WorldLab.Vector(${x}, ${y}));\n`;
    },
  },
});

const worldSetSprite = defineBlock({
  type: 'world_set_sprite',
  message0: 'set sprite %1',
  args0: [{type: 'field_dropdown', name: 'SPRITE', options: SPRITE_OPTIONS}],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip: 'Draw the actor with a built-in sprite instead of a plain square.',
  generator: {
    javascript(block) {
      const sprite = block.getFieldValue('SPRITE');
      // Drawing a sprite needs the appearance trait; elect it here so the block
      // "just works" on its own.
      return (
        `actor.useTraits([WorldLab.AppearanceTrait]);\n` +
        `actor.set(WorldLab.SpriteProperty, ${str(sprite)});\n`
      );
    },
  },
});

const worldPlayAnimation = defineBlock({
  type: 'world_play_animation',
  message0: 'play animation %1',
  args0: [
    {type: 'field_dropdown', name: 'ANIMATION', options: ANIMATION_OPTIONS},
  ],
  extensions: [animationOptionsExtension],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip: 'Draw the actor with a looping animation.',
  generator: {
    javascript(block) {
      const animation = block.getFieldValue('ANIMATION');
      return (
        `actor.useTraits([WorldLab.AppearanceTrait]);\n` +
        `actor.set(WorldLab.AnimationProperty, ${str(animation)});\n`
      );
    },
  },
});

const worldOnEvent = defineBlock({
  type: 'world_on_event',
  message0: 'when %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'EVENT',
      options: [
        ['starts falling', 'startsFalling'],
        ['stops falling', 'stopsFalling'],
        ['animation ends', 'animationEnded'],
        ['animation frame changes', 'frameChanged'],
      ],
    },
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'HANDLER'}],
  // An event is a free-floating starting block (its own root in the workspace),
  // like `when_run` / Music Lab's trigger blocks — no previous/next connection,
  // so it can't chain into the actor or another event. Its `HANDLER` body is
  // enclosed, matching the `actor.on(evt, () => {...})` it generates.
  style: 'event_blocks',
  tooltip: 'Run blocks when an event happens to this actor.',
  generator: {
    javascript(block, generator) {
      const eventConst = EVENT_CONST[block.getFieldValue('EVENT')] ?? '';
      const handler = generator.statementToCode(block, 'HANDLER');
      // Bind the handler args so a body block can read the event's value
      // (`eventValue` — e.g. the animation frame). `_world`/`_actor` don't shadow
      // the outer `actor` builder, so it stays reachable inside the handler.
      return (
        `actor.on(WorldLab.${eventConst}, (_world, _actor, eventValue) => {\n` +
        `${handler}});\n`
      );
    },
  },
});

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
  message0: 'scene  id %1  name %2',
  args0: [
    {type: 'field_input', name: 'ID', text: 'game'},
    {type: 'field_input', name: 'NAME', text: 'Game'},
  ],
  message1: 'world %1',
  args1: [{type: 'field_input', name: 'WORLD', text: 'worlds/platform'}],
  message2: '%1',
  args2: [{type: 'input_statement', name: 'BODY'}],
  style: 'setup_blocks',
  tooltip:
    'Define a scene: the world its actors live in, and the actors in it.',
  generator: {
    javascript(block, generator) {
      const id = block.getFieldValue('ID');
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
      const body = generator.statementToCode(block, 'BODY');
      return (
        `const scene = new WorldLab.SceneBuilder({id: ${str(id)}, name: ${str(
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
  args0: [{type: 'field_input', name: 'ACTOR', text: 'actors/player'}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
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
      // (e.g. set position) target it. The block id is the stable instance id.
      return (
        `{\nconst actor = scene.addActor(${importVar(actor)}, ${str(
          block.id,
        )});\n` + `${body}}\n`
      );
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
  worldOnEvent,
  worldLog,
  worldPrint,
  worldEventValue,
  worldScene,
  worldAddActor,
];

/** The toolbox for the Blockly editor: the domain blocks, grouped. */
export const DOMAIN_TOOLBOX: Toolbox = [
  {
    name: 'Scene',
    blocks: ['world_scene', 'world_add_actor', 'world_set_position'],
  },
  {name: 'Actor', blocks: ['world_actor']},
  {
    name: 'Traits',
    blocks: ['world_use_trait', 'world_set_position'],
  },
  {
    name: 'Looks',
    blocks: ['world_set_sprite', 'world_play_animation'],
  },
  {
    name: 'Events',
    blocks: ['world_on_event', 'world_log', 'world_print', 'world_event_value'],
  },
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
  {name: 'Math', blocks: ['math_number', 'math_arithmetic', 'math_modulo']},
  {name: 'Text', blocks: ['text']},
];
