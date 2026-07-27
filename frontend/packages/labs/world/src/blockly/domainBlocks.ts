// The World Lab domain blocks for authoring an Actor, defined with the design
// system's `defineBlock` (INTERFACE.md). Each carries its JavaScript generator,
// so passing this array to a `BlocklyWorkspace`/`BlocklyProvider` `blocks` prop
// registers both the block and its Blockly → world-lab translation on that
// workspace's generator. One source of truth for the editor and the generator.
//
// Generators emit `WorldLab.<X>` references and a single
// `import * as WorldLab from 'world-lab'`, so no per-block import analysis is
// needed; the compiler rewrites `world-lab` to the self-hosted engine.

import {defineBlock, type Toolbox} from '@code-dot-org/blockly';

import {ANIMATION_NAMES, SPRITE_NAMES} from '../sprites';

/** JS string literal for a field value. */
const str = (value: unknown): string => JSON.stringify(String(value));

/** `camelCase`/`name` → a human "Title Case" dropdown label. */
const label = (name: string): string =>
  name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase())
    .trim();

/** Dropdown `[label, value]` pairs for the built-in sprites. */
const SPRITE_OPTIONS: Array<[string, string]> = SPRITE_NAMES.map(name => [
  label(name),
  name,
]);

/** Dropdown `[label, value]` pairs for the built-in animations. */
const ANIMATION_OPTIONS: Array<[string, string]> = ANIMATION_NAMES.map(name => [
  label(name),
  name,
]);

// Dropdown value -> the `world-lab` export name.
const TRAIT_CONST: Record<string, string> = {
  affected: 'AffectedByGravityTrait',
  ground: 'GroundTrait',
  controlled: 'ControlledByArrowsTrait',
};
const EVENT_CONST: Record<string, string> = {
  startsFalling: 'StartsFallingEvent',
  stopsFalling: 'StopsFallingEvent',
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
      return `actor.set(WorldLab.SpriteProperty, ${str(sprite)});\n`;
    },
  },
});

const worldPlayAnimation = defineBlock({
  type: 'world_play_animation',
  message0: 'play animation %1',
  args0: [
    {type: 'field_dropdown', name: 'ANIMATION', options: ANIMATION_OPTIONS},
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip: 'Draw the actor with a looping built-in animation.',
  generator: {
    javascript(block) {
      const animation = block.getFieldValue('ANIMATION');
      return `actor.set(WorldLab.AnimationProperty, ${str(animation)});\n`;
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
      return `actor.on(WorldLab.${eventConst}, () => {\n${handler}});\n`;
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

/** The domain blocks — pass to a workspace/provider `blocks` prop. */
export const DOMAIN_BLOCKS = [
  worldActor,
  worldUseTrait,
  worldSetPosition,
  worldSetSprite,
  worldPlayAnimation,
  worldOnEvent,
  worldLog,
];

/** The toolbox for the Blockly editor: the domain blocks, grouped. */
export const DOMAIN_TOOLBOX: Toolbox = [
  {name: 'Actor', blocks: ['world_actor']},
  {
    name: 'Traits',
    blocks: ['world_use_trait', 'world_set_position'],
  },
  {
    name: 'Looks',
    blocks: ['world_set_sprite', 'world_play_animation'],
  },
  {name: 'Events', blocks: ['world_on_event', 'world_log']},
];
