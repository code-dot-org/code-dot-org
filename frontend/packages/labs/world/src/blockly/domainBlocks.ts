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

import {defineBlock, type Toolbox} from '@code-dot-org/blockly';

import * as WorldLab from '../engine';
import {
  AnimationRule,
  CollisionRule,
  GravityRule,
  InputRule,
  MotionRule,
  SpatialRule,
} from '../engine';
import type {GameEvent, Rule} from '../engine';
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
import {traitOptions, traitOptionsExtension} from './traitOptions';

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

// The standard rules, in dependency order — the toolbox lists one category per
// rule, and the event blocks are generated from each rule's events. Reading the
// engine objects (not a mirror) keeps the editor in step with the rule library:
// add a rule or an event and its block/category follow. (Same tack as
// traitOptions.)
const ALL_RULES: readonly Rule[] = [
  SpatialRule,
  MotionRule,
  CollisionRule,
  GravityRule,
  InputRule,
  AnimationRule,
];

// Every GameEvent object → the name it is exported under (for `WorldLab.<name>`
// in generated code), discovered once from the engine namespace by reference
// (a rule's `events` entry and its `export const …Event` are the same object).
const EVENT_EXPORT_NAME = new Map<GameEvent, string>();
{
  const events = new Set<GameEvent>();
  for (const rule of ALL_RULES) {
    for (const event of Object.values(rule.events)) {
      events.add(event);
    }
  }
  for (const [name, value] of Object.entries(WorldLab)) {
    if (events.has(value as GameEvent)) {
      EVENT_EXPORT_NAME.set(value as GameEvent, name);
    }
  }
}

/** The toolbox/registry type for the block that handles `event`. */
const eventBlockType = (event: GameEvent): string => `world_on_${event.id}`;

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
  message0: 'set sprite %1 on %2',
  args0: [
    {type: 'field_dropdown', name: 'SPRITE', options: SPRITE_OPTIONS},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  extensions: [actorInputExtension],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
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
  style: 'sprite_blocks',
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
const onHandler = (target: string, exportName: string, body: string): string =>
  `${target}.on(WorldLab.${exportName}, (world, actor, eventValue) => {\n` +
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
const defineEventBlock = (event: GameEvent) => {
  const exportName = EVENT_EXPORT_NAME.get(event) ?? '';
  return defineBlock({
    type: eventBlockType(event),
    message0: `when %1 ${event.name ?? event.id}`,
    args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
    nextStatement: true,
    inputsInline: true,
    extensions: [actorInputExtension],
    style: 'event_blocks',
    tooltip: `Run the blocks below when this actor ${event.name ?? event.id}.`,
    generator: {
      javascript(block, generator) {
        const target =
          generator.valueToCode(block, 'ACTOR', Order.MEMBER) || 'actor';
        return onHandler(target, exportName, nextChainCode(block, generator));
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
const defineKeyEventBlock = (event: GameEvent) => {
  const exportName = EVENT_EXPORT_NAME.get(event) ?? '';
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
        return onHandler(target, exportName, body);
      },
    },
  });
};

// Build a block for every event the rule library declares. Input's key events
// take the KEY-filtered shape; the rest take the plain shape.
const EVENT_BLOCKS = ALL_RULES.flatMap(rule =>
  Object.values(rule.events).map(event =>
    rule === InputRule ? defineKeyEventBlock(event) : defineEventBlock(event),
  ),
);

/**
 * Event root block types — top-level roots that own their next chain as a
 * handler body. The generator must generate these with `thisOnly` so the body is
 * not also appended after the closure by the default `scrub_` (see
 * BlocklyGenerator).
 */
export const EVENT_ROOT_TYPES: ReadonlySet<string> = new Set(
  EVENT_BLOCKS.map(block => block.type),
);

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
  ...EVENT_BLOCKS,
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

// Each rule owns a toolbox category: its name is the rule's, and its blocks are
// the hand-authored blocks that act on that rule's traits/queries, followed by
// the generated event hats for that rule's events. A rule with neither (Motion)
// is omitted. `use trait`/`use rule` span every rule, so they live with the
// Actor/World they build, not in any one rule category.
const RULE_CATEGORY_BLOCKS = new Map<Rule, string[]>([
  [SpatialRule, ['world_set_position']],
  [CollisionRule, ['world_for_each_touching', 'world_touched_actor']],
  [GravityRule, []],
  [InputRule, []],
  [AnimationRule, ['world_set_sprite', 'world_play_animation']],
]);

const ruleCategory = (rule: Rule, blocks: string[]) => ({
  name: rule.name,
  blocks: [...blocks, ...Object.values(rule.events).map(eventBlockType)],
});

/**
 * The toolbox for the Blockly editor. Structural categories (Actor, Scene,
 * World) come first, then one category per rule holding that rule's blocks and
 * events, then the general-purpose blocks (Console output, Logic, Math, Text).
 */
export const DOMAIN_TOOLBOX: Toolbox = [
  {
    name: 'Actor',
    blocks: ['world_actor', 'world_use_trait', 'world_this_actor'],
  },
  {name: 'Scene', blocks: ['world_scene', 'world_add_actor', 'world_load_map']},
  {
    name: 'World',
    blocks: ['world_world', 'world_use_rule', 'world_use_animations'],
  },
  ...[...RULE_CATEGORY_BLOCKS].map(([rule, blocks]) =>
    ruleCategory(rule, blocks),
  ),
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
  {name: 'Math', blocks: ['math_number', 'math_arithmetic', 'math_modulo']},
  {name: 'Text', blocks: ['text']},
];
