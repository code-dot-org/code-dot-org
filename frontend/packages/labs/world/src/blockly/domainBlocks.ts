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

import {actorInputExtension} from './actorInput';
import {animationOptionsExtension} from './animationOptions';
import {label} from './label';
import {
  actorOptions,
  actorOptionsExtension,
  animationFileOptions,
  animationFileOptionsExtension,
  mapActorTypes,
  mapOptions,
  mapOptionsExtension,
  worldOptions,
  worldOptionsExtension,
} from './moduleOptions';

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
  message0: 'set position of %1  x %2  y %3',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'field_number', name: 'X', value: 0},
    {type: 'field_number', name: 'Y', value: 0},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // The ACTOR socket defaults to a `this actor` shadow; a loop's touched actor
  // can be dropped in to move that one instead.
  extensions: [actorInputExtension],
  style: 'location_blocks',
  tooltip: "Set an actor's position.",
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const x = Number(block.getFieldValue('X'));
      const y = Number(block.getFieldValue('Y'));
      return `${target}.set(WorldLab.PositionProperty, new WorldLab.Vector(${x}, ${y}));\n`;
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
  message0: 'when %1 %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
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
  inputsInline: true,
  // An event is a free-floating starting block (its own root in the workspace),
  // like `when_run` / Music Lab's trigger blocks — no previous/next connection.
  // The ACTOR socket is which actor's handler this is; it defaults to a `this
  // actor` shadow (on an `.actor` file the subject is obvious).
  extensions: [actorInputExtension],
  style: 'event_blocks',
  tooltip: 'Run blocks when an event happens to an actor.',
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const eventConst = EVENT_CONST[block.getFieldValue('EVENT')] ?? '';
      const handler = generator.statementToCode(block, 'HANDLER');
      // A handler runs at RUNTIME, so its args are the live `world` and `actor`
      // (they shadow the outer `actor` builder): body blocks act on the instance,
      // and a "for each … I'm touching" loop can query the world. `eventValue` is
      // the event's detail (e.g. the animation frame).
      return (
        `${target}.on(WorldLab.${eventConst}, (world, actor, eventValue) => {\n` +
        `${handler}});\n`
      );
    },
  },
});

// "when [this actor] presses/releases key [x]" — a free-floating handler on the
// Input rule's key events. The event fires for every key (its detail is the key
// name), so the handler filters for the chosen one. Like `world_on_event`, the
// ACTOR socket is whose handler this is (default `this actor` shadow), and the
// handler binds the live `world`/`actor` so a "for each … touching" loop inside
// can query the world.
const worldOnKey = defineBlock({
  type: 'world_on_key',
  message0: 'when %1 %2 key %3',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {
      type: 'field_dropdown',
      name: 'STATE',
      options: [
        ['presses', 'keyPressed'],
        ['releases', 'keyReleased'],
      ],
    },
    {type: 'field_dropdown', name: 'KEY', options: KEY_OPTIONS},
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'HANDLER'}],
  inputsInline: true,
  extensions: [actorInputExtension],
  style: 'event_blocks',
  tooltip:
    'Run blocks when an actor presses or releases a key (while the game is focused).',
  generator: {
    javascript(block, generator) {
      const target =
        generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
      const eventConst =
        block.getFieldValue('STATE') === 'keyReleased'
          ? 'KeyReleasedEvent'
          : 'KeyPressedEvent';
      const key = block.getFieldValue('KEY');
      const handler = generator.statementToCode(block, 'HANDLER');
      // `eventValue` is the key that fired; act only for the chosen key.
      return (
        `${target}.on(WorldLab.${eventConst}, (world, actor, eventValue) => {\n` +
        `if (eventValue === ${str(key)}) {\n${handler}}\n});\n`
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

// ── Actor values & touching ──────────────────────────────────────────────────
// Blocks that yield an Actor (output type "Actor") for an action block's `of …`
// socket. `world_this_actor` is the principal actor (`this`) — the default shadow;
// `world_touched_actor` is the actor a `for each … I'm touching` loop is on now.

const worldThisActor = defineBlock({
  type: 'world_this_actor',
  message0: 'this actor',
  output: 'Actor',
  style: 'variable_blocks',
  tooltip: 'This actor — the one these blocks belong to.',
  generator: {
    javascript() {
      return ['actor', Order.ATOMIC] as [string, number];
    },
  },
});

const worldTouchedActor = defineBlock({
  type: 'world_touched_actor',
  message0: "the actor I'm touching",
  output: 'Actor',
  style: 'variable_blocks',
  tooltip: "Inside a “for each … I'm touching” loop, the actor it is on now.",
  generator: {
    javascript() {
      return ['touched', Order.ATOMIC] as [string, number];
    },
  },
});

const worldForEachTouching = defineBlock({
  type: 'world_for_each_touching',
  message0: "for each %1 I'm touching",
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorOptions()}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // The dropdown lists the project's actor templates (populated live), the same
  // as `world_add_actor`.
  extensions: [actorOptionsExtension],
  style: 'behavior_blocks',
  tooltip:
    'Run blocks once for each actor of a type this actor is touching. Use ' +
    "“the actor I'm touching” to act on each one. Only valid inside a " +
    '“when” handler.',
  generator: {
    javascript(block, generator) {
      // Dropdown values are module paths (`actors/coin`); an actor's runtime
      // `type` is the template id — the module basename.
      const modulePath = block.getFieldValue('ACTOR');
      const type = modulePath.split('/').pop() ?? modulePath;
      const body = generator.statementToCode(block, 'DO');
      return `for (const touched of world.query(WorldLab.TouchingQuery, actor, ${str(
        type,
      )})) {\n${body}}\n`;
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
  args1: [{type: 'field_dropdown', name: 'WORLD', options: worldOptions()}],
  message2: '%1',
  args2: [{type: 'input_statement', name: 'BODY'}],
  extensions: [worldOptionsExtension],
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
      // (e.g. set position) target it. The block id is the stable instance id.
      return (
        `{\nconst actor = scene.addActor(${importVar(actor)}, ${str(
          block.id,
        )});\n` + `${body}}\n`
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
  message0: 'world  id %1  name %2',
  args0: [
    {type: 'field_input', name: 'ID', text: 'world'},
    {type: 'field_input', name: 'NAME', text: 'World'},
  ],
  message1: '%1',
  args1: [{type: 'input_statement', name: 'BODY'}],
  style: 'setup_blocks',
  tooltip: 'Define a world: the rules in play and the animations it registers.',
  generator: {
    javascript(block, generator) {
      const id = block.getFieldValue('ID');
      const name = block.getFieldValue('NAME');
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      const body = generator.statementToCode(block, 'BODY');
      return (
        `const world = new WorldLab.WorldBuilder({id: ${str(id)}, name: ${str(
          name,
        )}});\n` + body
      );
    },
  },
});

const worldUseRule = defineBlock({
  type: 'world_use_rule',
  message0: 'use rule %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'RULE',
      options: [
        ['Has Gravity', 'GravityRule'],
        ['Responds to Input', 'InputRule'],
        ['Has Appearance', 'AnimationRule'],
        ['Has Collisions', 'CollisionRule'],
        ['Has Motion', 'MotionRule'],
        ['Has Space', 'SpatialRule'],
      ],
    },
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'behavior_blocks',
  tooltip: 'Put a rule (a game mechanic) in play for this world.',
  generator: {
    javascript(block) {
      return `world.useRules([WorldLab.${block.getFieldValue('RULE')}]);\n`;
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
  worldOnEvent,
  worldOnKey,
  worldLog,
  worldPrint,
  worldEventValue,
  worldThisActor,
  worldTouchedActor,
  worldForEachTouching,
  worldScene,
  worldAddActor,
  worldLoadMap,
  worldWorld,
  worldUseRule,
  worldUseAnimations,
];

/** The toolbox for the Blockly editor: the domain blocks, grouped. */
export const DOMAIN_TOOLBOX: Toolbox = [
  {
    name: 'Scene',
    blocks: [
      'world_scene',
      'world_add_actor',
      'world_load_map',
      'world_set_position',
    ],
  },
  {
    name: 'World',
    blocks: ['world_world', 'world_use_rule', 'world_use_animations'],
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
    blocks: [
      'world_on_event',
      'world_on_key',
      'world_log',
      'world_print',
      'world_event_value',
    ],
  },
  {
    name: 'Actors',
    blocks: [
      'world_for_each_touching',
      'world_touched_actor',
      'world_this_actor',
    ],
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
