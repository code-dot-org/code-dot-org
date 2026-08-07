// The World Lab domain blocks for authoring an Actor, defined with the design
// system's `defineBlock` (INTERFACE.md). Each carries its JavaScript generator,
// so passing this array to a `BlocklyWorkspace`/`BlocklyProvider` `blocks` prop
// registers both the block and its Blockly → world-lab translation on that
// workspace's generator. One source of truth for the editor and the generator.
//
// Generators emit `WorldLab.<X>` references and a single
// `import * as WorldLab from 'world-lab'`, so no per-block import analysis is
// needed; the compiler rewrites `world-lab` to the self-hosted engine.

import type {Block, FieldDropdown} from 'blockly';
import {Order, type JavascriptGenerator} from 'blockly/javascript';

import {
  defineBlock,
  defineExtension,
  type BlockArgDefinition,
  type Extension,
  type Toolbox,
  type ToolboxCategory,
} from '@code-dot-org/blockly';
import fieldColourPlugin from '@code-dot-org/blockly/fields/fieldColour';

import {
  IMPORT_BACKGROUND_VALUE,
  IMPORT_SPRITE_VALUE,
} from '../appearance/appearanceImport';
import {DEFAULT_BACKDROP_COLOR, type PropertyType} from '../engine';
import {DEFAULT_LAYER_ID, type SlotName} from '../engine/core/Layer';

import {actorInputExtension, actorSubjectExtension} from './actorInput';
import {animationOptions, animationOptionsExtension} from './animationOptions';
import {BUILTIN_RULE_META} from './builtinMeta';
import {
  cameraId,
  cameraIdFromValue,
  cameraOptions,
  cameraOptionsExtension,
} from './cameras';
import {COLOUR_CHECK} from './colorCheck';
import {installColorMessages} from './colorMessages';
import {editingRuleFor} from './editingRule';
import {
  allEnums,
  ENGINE_ENUMS,
  enumOptions,
  enumRef,
  enumRefOfParamType,
  enumValueBlockType,
  KEY_ENUM,
  type ParamType,
  type EnumMeta,
} from './enums';
import {
  builderWorldExtension,
  runtimeActorExtension,
  traitContextExtension,
} from './extensions/actorContext';
import {
  animationImportFieldExtension,
  backgroundImportFieldExtension,
  spriteImportFieldExtension,
} from './extensions/appearanceImportField';
import {
  blockDesignerInitExtension,
  blockDesignerMutator,
  eventDesignerMutator,
} from './extensions/blockDesigner';
import {effectImportFieldExtension} from './extensions/effectImportField';
import {
  effectParamsInitExtension,
  effectParamsMutator,
  paramSockets,
  type EffectParamState,
} from './extensions/effectParamsMutator';
import {openSourceButtonExtension} from './extensions/openSourceButton';
import {rgbaPreviewExtension} from './extensions/rgbaPreview';
import {ruleImportFieldExtension} from './extensions/ruleImportField';
import {sliderRangeMutator} from './extensions/sliderRange';
import {spritePickExtension} from './extensions/spritePickField';
import {worldContextExtension} from './extensions/worldContext';
import {fieldMapPlacementsArg} from './fields/FieldMapPlacements';
import {fieldSliderArg} from './fields/FieldSlider';
import {fieldVectorArg, type VectorValue} from './fields/FieldVector';
import {FOUNDATIONAL_STOCK_RULES} from './foundation';
import {
  DEFAULT_PARALLAX,
  LAYER_FIXED_OPTIONS,
  layerIdFromValue,
  layerOf,
  layerOptions,
  layerOptionsExtension,
  layerPlan,
} from './layers';
import {
  actorIdFromName,
  definesWorld,
  localActorBlockId,
  localActorFor,
  localActorVar,
} from './localActors';
import {registerManyActorBlock, yieldsMany} from './manyActors';
import {instanceId, type MapPlacement} from './mapPlacements';
import {
  actorFieldOptions,
  actorOptionsExtension,
  actorTypeOptionsExtension,
  animationFileOptions,
  effectFileImportOptions,
  effectFileImportOptionsExtension,
  effectFileOptions,
  effectFileOptionsExtension,
  liveDropdown,
  mapActorTypes,
  mapOptions,
  mapOptionsExtension,
  ruleModuleOptions,
  backgroundImportOptions,
  spriteOptions,
} from './moduleOptions';
import {phaseOptions, phaseOptionsExtension} from './phaseOptions';
import {IMPORT_RULE_VALUE} from './ruleImport';
import type {
  ActionMeta,
  EventMeta,
  MemberRef,
  PropertyMeta,
  QueryMeta,
  RuleMeta,
} from './ruleMeta';
import {refFromValue, refModule, ruleLocation, ruleSlug} from './ruleRegistry';
import {parseSpriteRef, spriteCell} from './spriteCells';
import {
  projectRuleIdentities,
  stepOptions,
  stepOptionsExtension,
  anyTraitOptions,
  anyTraitOptionsExtension,
  traitOptions,
  traitOptionsExtension,
  traitSubjectFor,
} from './traitOptions';
import {
  ActorVariable,
  paramFlavour,
  PARAM_GETTER_BLOCKS,
  PARAM_SETTER_BLOCKS,
  PARAM_TYPE_OPTIONS,
  PARAM_VARIABLE_TYPES,
} from './typedVariables';
import {
  registerValueShadows,
  valueShadowExtension,
  type ShadowSpec,
} from './valueShadow';

/** JS string literal for a field value. */
const str = (value: unknown): string => JSON.stringify(String(value));

// The images a `set sprite` block may name: the project's own (populated live by
// the extension), and `(import…)` to copy one in. There is no built-in list —
// what a game draws is what its project holds.
const spriteFieldOptions = (): Array<[string, string]> => [
  ...spriteOptions().filter(([, value]: [string, string]) => value),
  ['(import…)', IMPORT_SPRITE_VALUE],
];

/** Point a `SPRITE` dropdown at the live list (the project's images + import). */
const spriteOptionsExtension = liveDropdown(
  'world_sprite_options',
  'SPRITE',
  spriteFieldOptions,
);

// The animation dropdown's static fallback. The `animationOptionsExtension`
// replaces it at block-init with the live registry: the ids the project's own
// `.anim` files define, and `(import…)`. There are no built-in animations —
// an animation is frames of an image, and both are files a project holds.
const ANIMATION_OPTIONS = (): Array<[string, string]> => animationOptions();

// The rules whose members drive the block palette: the built-in library as
// `RuleMeta` (dependency order — the toolbox lists one category per rule and the
// generators walk them in order). Project `.rule` metadata will join this list
// so a project rule contributes blocks the same way (a later step).
const AUTHORING_RULES: readonly RuleMeta[] = BUILTIN_RULE_META;

// How generated code names a rule member: `WorldLab.<name>` for a built-in; for
// a project rule, the bare export with a hoisted `import {<name>} from
// '<module>'`. One helper so a single generator emits code for either source.
//
// SELF-REFERENCE: when generating a rule's OWN module (its `.rule` file), that
// rule's members are `export const`s declared locally — a body referencing one
// (e.g. `get strength` inside its own action) must use the bare local name, not
// import the module into itself. The generator carries the module being written
// as `__ruleModule` (set by BlocklyGenerator); a member whose module matches is
// local, so we skip the import.
const refCode = (ref: MemberRef, generator?: JavascriptGenerator): string => {
  const modulePath = refModule(ref);
  if (modulePath) {
    const selfModule = (generator as {__ruleModule?: string} | undefined)
      ?.__ruleModule;
    if (generator && modulePath !== selfModule) {
      addImport(
        generator,
        `named:${modulePath}:${ref.exportName}`,
        `import {${ref.exportName}} from ${str(modulePath)};`,
      );
    }
    return ref.exportName;
  }
  return `WorldLab.${ref.exportName}`;
};

// A globally-unique key for a member's block TYPE (registry + toolbox name),
// distinct from its codegen reference (`refCode`). Namespaced by the RULE, so
// two rules' same-named members (e.g. both a `strength`) don't collide on one
// block type — and so a member keeps its block type when the rule it belongs to
// moves, which the reference format is the whole point of.
const memberKey = (ref: MemberRef): string =>
  ref.ruleName ? `${ruleSlug(ref.ruleName)}_${ref.exportName}` : ref.exportName;

// The keyboard's keys, from the enum that declares them (`Engine#Key`). Both
// key dropdowns read it rather than carrying a list: the World owns the
// keyboard, so the set of key names is one fact with one home, and a rule that
// wants it points at the same enum (specs/ENUMS.md).
const keyOptions = (): Array<[string, string]> =>
  enumOptions(enumRef(KEY_ENUM));

/**
 * The value block for one enum: a bare dropdown of its choices, reporting the
 * string it stands for.
 *
 * Bare — no wording of its own — because it is what an enum-typed socket
 * carries as its shadow, and the argument around it has already said what the
 * choice is FOR ("push ⟨up arrow ▾⟩"). `world_key` keeps its own wording for
 * the standalone case, where "key ⟨space⟩" is a phrase rather than a chip.
 *
 * Live options, so a project enum edited in its `.rule` reaches the blocks
 * using it — and so a stored value the enum no longer offers is KEPT and shown
 * as itself rather than silently rewritten (`liveDropdown`).
 */
const defineEnumValueBlock = (meta: EnumMeta) => {
  const ref = enumRef(meta);
  const options = (): Array<[string, string]> => enumOptions(ref);
  return defineBlock({
    type: enumValueBlockType(ref),
    message0: '%1',
    args0: [{type: 'field_dropdown', name: 'VALUE', options: options()}],
    extensions: [
      liveDropdown(
        `world_choice_options_${ref.replace(/[^A-Za-z0-9]+/g, '_')}`,
        'VALUE',
        options,
      ),
    ],
    output: 'String',
    style: 'text_blocks',
    tooltip: `One of ${meta.name}'s choices.`,
    generator: {
      javascript(block) {
        return [str(block.getFieldValue('VALUE') ?? ''), Order.ATOMIC] as [
          string,
          number,
        ];
      },
    },
  });
};

/** The engine's enums as blocks; a project's follow with its rules (step 3). */
const ENUM_VALUE_BLOCKS = ENGINE_ENUMS.map(defineEnumValueBlock);

/** The toolbox/registry type for the block that handles `event`. */
const eventBlockType = (event: EventMeta): string =>
  `world_on_${memberKey(event.ref)}`;

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
      // Registered rather than emitted inline, so it is deduped against the
      // other blocks that need `WorldLab` — an effect's color parameter
      // generates a `WorldLab.rgb(…)` call and registers the same import.
      // Emitting it here as well produced a second copy in the hoisted block
      // and "The symbol WorldLab has already been declared" at compile.
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      const built = `new WorldLab.ActorBuilder({id: ${str(
        id_from_name(name),
      )}, name: ${str(name)}})`;
      // In a `.world` file this actor is the world's own: no export, no module,
      // and a name of its own so several can coexist (blockly/localActors). Its
      // body still speaks of `actor`, so the chain runs in a block scope where
      // that is what the builder is called — the same shape `add actor` uses.
      if (definesWorld(block.workspace)) {
        const variable = localActorVar(name, block.id);
        return (
          `const ${variable} = ${built};\n` +
          `{\nconst actor = ${variable};\n` +
          `${nextChainCode(block, generator)}}\n` +
          // Registered under the type a placed one carries, so the module can
          // hand its own templates out (`export {localActors}`) — which is how
          // the map editor introspects an actor that is not a module
          // (MAPS.md §5). Two actors of the same name share a key, as they
          // already share what `is a` can tell about them.
          `localActors[${str(actorIdFromName(name))}] = ${variable};\n`
        );
      }
      // The `export default actor;` and the floating event handlers are appended
      // by the generator's assembly step (BlocklyGenerator), not here — events
      // are their own top-level blocks, so this block only builds the actor.
      return `const actor = ${built};\n` + nextChainCode(block, generator);
    },
  },
});

const worldUseTrait = defineBlock({
  type: 'world_use_trait',
  message0: 'use trait %1',
  // The options are the traits in play — those a rule the project's worlds attach
  // provides (populated live by the extension); the value is the trait's export.
  args0: [{type: 'field_dropdown', name: 'TRAIT', options: traitOptions}],
  previousStatement: true,
  nextStatement: true,
  // `useTraits` is a builder method, so this belongs under `define actor` — or
  // inside `define trait`, where it declares that trait's own dependencies and
  // is read statically rather than generated. In an event handler `actor` is
  // the live instance and the call would throw; the extension warns in the
  // editor instead.
  extensions: [
    traitOptionsExtension,
    traitContextExtension,
    openSourceButtonExtension,
  ],
  style: 'behavior_blocks',
  tooltip: 'Give the actor a trait (its properties and behavior).',
  generator: {
    javascript(block, generator) {
      // Inside `define camera` the declaration collects these and passes them
      // to `defineCamera` in one call, so there is nothing to emit here: a
      // camera is made complete, and has no builder to add a trait to.
      if (traitSubjectFor({getSourceBlock: () => block}) === 'camera') {
        return '';
      }
      const ref = refFromValue(block.getFieldValue('TRAIT'));
      return `actor.useTraits([${refCode(ref, generator)}]);\n`;
    },
  },
});

/** How many number sockets each effect parameter type occupies. */
/**
 * The `{id: value}` object literal for an effect's parameters, or `''` when the
 * effect declares none — in which case the call omits the argument rather than
 * passing an empty object.
 *
 * Read off the block's OWN serialized parameter list, not the project registry:
 * the sockets were built from that list, so it is what matches the sockets
 * being read here. Reconciling a project edited since the block was saved is
 * the mutator's job, and it happens before generation.
 *
 * The socket layout comes from `paramSockets`, the same function the mutator
 * built those sockets from — so what is read here cannot drift from what is
 * there.
 */
const effectParamValuesCode = (
  block: Block,
  generator: JavascriptGenerator,
): string => {
  const params =
    (block as unknown as {effectParams_?: EffectParamState[]}).effectParams_ ??
    [];
  const entries = params.map((parameter, index) => {
    const sockets = paramSockets(parameter.type);
    /** The nth component of the declared default, as source text. */
    const fallback = (component: number): string => {
      const value = parameter.defaultValue;
      const scalar = Array.isArray(value) ? (value[component] ?? 0) : value;
      if (parameter.type === 'bool') {
        return scalar ? 'true' : 'false';
      }
      return String(Number(scalar ?? 0));
    };
    /**
     * A socket's code, or the default it stands in for when emptied.
     *
     * A color default is handed over as the float array the effect declared,
     * not as hex: `rgb`/`rgba` take either, and going through hex would drop a
     * vec4's alpha and quantize the rest for no reason.
     */
    const socket = (n: number): string =>
      generator.valueToCode(block, `EPARAM_${index}_${n}`, Order.NONE) ||
      (sockets[n]?.kind === 'color'
        ? // Exactly the components the effect declared. Padding to four would
          // write an explicit alpha of 0 for a three-component default, and
          // `rgba`'s "missing means opaque" could no longer see it was missing.
          `[${(Array.isArray(parameter.defaultValue)
            ? parameter.defaultValue
            : [0, 0, 0]
          )
            .map((_unused, component) => fallback(component))
            .join(', ')}]`
        : fallback(n));

    // Colors arrive as `#rrggbb` — from the picker, or from any other color
    // block a learner plugged in — and a shader wants floats. The conversion
    // is a call in the generated code rather than a step in the block, which
    // is what lets `colour_random` and `colour_blend` work here too.
    const value = (() => {
      switch (parameter.type) {
        case 'vec3':
          return `WorldLab.rgb(${socket(0)})`;
        case 'vec4':
          return `WorldLab.rgba(${socket(0)})`;
        case 'vec2':
          return `[${socket(0)}, ${socket(1)}]`;
        default:
          return socket(0);
      }
    })();
    if (parameter.type === 'vec3' || parameter.type === 'vec4') {
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
    }
    return `${str(parameter.id)}: ${value}`;
  });
  return entries.length ? `{${entries.join(', ')}}` : '';
};

/**
 * Play an effect on one actor.
 *
 * ONE block for both jobs. Chained under `define actor` its `to` socket holds
 * the default `this actor` shadow, `actor` is the template, and every instance
 * is born wearing the effect. Inside an event handler the same block reaches a
 * live actor — "when the player is hit, glow" — either the principal one or
 * whatever is plugged into the socket (a `for each` loop's variable, a query
 * result).
 *
 * There is no separate declarative block. `ActorBuilder.addEffect` and
 * `Actor.addEffect` take the same arguments and mean the same thing, and both
 * contexts bind the identifier `actor`, so the generated call is correct in
 * both — exactly as `set position` has always worked. Both are idempotent by
 * path, which is what makes this safe in an event that fires every frame while
 * a condition holds.
 */
const worldAddEffect = defineBlock({
  type: 'world_add_effect',
  message0: 'add effect %1 to %2',
  args0: [
    {
      type: 'field_dropdown',
      name: 'EFFECT',
      options: effectFileImportOptions,
    },
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  mutator: effectParamsMutator,
  // No context guard: `addEffect` exists on the builder and on the live actor
  // alike, so this block is correct wherever `actor` is bound. The effect's own
  // parameters become value sockets, one row per knob, rebuilt whenever the
  // dropdown changes (effectParamsMutator).
  extensions: [
    effectFileImportOptionsExtension,
    actorInputExtension,
    effectParamsInitExtension,
    effectImportFieldExtension,
  ],
  // An effect changes how the actor is DRAWN, so it reads with the appearance
  // blocks (`set sprite`, `play animation`) rather than with traits.
  style: 'sprite_blocks',
  tooltip:
    "Play a visual effect on an actor's image (authored in an .effect file). Adding one it already has changes nothing.",
  generator: {
    javascript(block, generator) {
      const path = block.getFieldValue('EFFECT');
      if (!path) {
        return '';
      }
      const target = actorTarget(block, generator, Order.MEMBER);
      // The `.effect` is imported as DATA — the bundler loads it as JSON — and
      // compiled to GLSL in the preview surface, where Phaser is. Nothing about
      // shaders reaches the generated code.
      addImport(
        generator,
        `mod:${path}`,
        `import ${importVar(path)} from ${str(path)};`,
      );
      const values = effectParamValuesCode(block, generator);
      return forEachActor(target, actor =>
        values
          ? `${actor}.addEffect(${str(path)}, ${importVar(path)}, ${values})`
          : `${actor}.addEffect(${str(path)}, ${importVar(path)})`,
      );
    },
  },
});

/** Stop an effect on one actor. Removing one it does not have is a no-op. */
const worldRemoveEffect = defineBlock({
  type: 'world_remove_effect',
  message0: 'remove effect %1 from %2',
  args0: [
    {type: 'field_dropdown', name: 'EFFECT', options: effectFileOptions},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // Runtime-only, unlike `add effect`: `removeEffect` is a live-actor method,
  // and there is nothing to un-declare on a template that was described once.
  extensions: [
    effectFileOptionsExtension,
    actorInputExtension,
    runtimeActorExtension,
  ],
  style: 'sprite_blocks',
  tooltip: 'Stop playing an effect on an actor.',
  generator: {
    javascript(block, generator) {
      const path = block.getFieldValue('EFFECT');
      if (!path) {
        return '';
      }
      const target = actorTarget(block, generator, Order.MEMBER);
      // No import: removing needs only the effect's identity, not its graph.
      return forEachActor(
        target,
        actor => `${actor}.removeEffect(${str(path)})`,
      );
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
      const target = actorTarget(block, generator, Order.MEMBER);
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      return forEachActor(
        target,
        actor =>
          `${actor}.set(WorldLab.PositionProperty, new WorldLab.Vector(${x}, ${y}))`,
      );
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
    {type: 'field_dropdown', name: 'SPRITE', options: spriteFieldOptions},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  // The options extension first, then the import one, so the latter wraps that
  // validator rather than being wrapped by it (see appearanceImportField).
  // `spritePick` replaces how the field is EDITED, which is independent of both.
  extensions: [
    actorInputExtension,
    spriteOptionsExtension,
    spritePickExtension,
    spriteImportFieldExtension,
  ],
  previousStatement: true,
  nextStatement: true,
  style: 'default',
  // Like `play animation`, this only sets the property; the actor must already
  // have the appearance trait (`use trait Has Appearance`). The ACTOR socket
  // defaults to a `this actor` shadow, or take another actor.
  tooltip: "Set an actor's sprite (it must have the appearance trait).",
  generator: {
    javascript(block, generator) {
      const target = actorTarget(block, generator, Order.MEMBER);
      const value = block.getFieldValue('SPRITE');
      // The field may name one cell of a spritesheet (`coinSpin.png#3`); the
      // rectangle is resolved HERE, where the project's `.sheet` files are
      // known, because the engine is only ever told rectangles (spriteCells).
      const {sprite} = parseSpriteRef(value);
      const cell = spriteCell(value);
      // Always all three: an actor that drew a cell and is then set to a plain
      // picture must stop drawing that cell, and a size of zero says "all of it".
      const lines = (actor: string) =>
        [
          `${actor}.set(WorldLab.SpriteProperty, ${str(sprite)})`,
          `${actor}.set(WorldLab.SpriteCellOriginProperty, new WorldLab.Vector(${
            cell?.x ?? 0
          }, ${cell?.y ?? 0}))`,
          `${actor}.set(WorldLab.SpriteCellSizeProperty, new WorldLab.Vector(${
            cell?.width ?? 0
          }, ${cell?.height ?? 0}))`,
        ].join(';\n');
      return forEachActor(target, lines);
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
  extensions: [
    animationOptionsExtension,
    animationImportFieldExtension,
    actorInputExtension,
  ],
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
      const target = actorTarget(block, generator);
      const animation = block.getFieldValue('ANIMATION');
      return forEachActor(
        target,
        actor => `WorldLab.playAnimation(${actor}, ${str(animation)})`,
      );
    },
  },
});

// Event blocks are generated one-per-event from the rule library, not authored
// by hand: each engine event becomes a `world_on_<id>` "when …" block, filed
// under its rule's toolbox category. Like `when_run`, an event is a top-level
// root: no previous connection, but a NEXT connection — the handler body
// attaches below as the next statement, not nested in a `do` input. The ACTOR
// socket is whose handler this is — the one socket in the language that names a
// SUBJECT rather than a target, so it takes `actorSubjectExtension` and reads
// `any <kind>` in a world file. A handler runs at RUNTIME, so its args
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

/** The field an event's filter dropdown occupies, by position in the phrasing. */
const filterFieldName = (index: number): string => `FILTER${index}`;

/** The dropdown entry meaning "whatever was emitted" — no filter at all. */
const ANY_CHOICE: [string, string] = ['(any)', ''];

/**
 * An event's hat: `when <actor> <phrasing>`, body chained below.
 *
 * The phrasing is the event's own, when it designed one (`define event`), and
 * a parameter in it is a FILTER: the hat shows that enum's choices with `(any)`
 * at the front, and the handler generated runs only when what was emitted
 * matches. `(any)` emits no guard, which is what an undesigned event has always
 * done — so a hat that filters and a hat that hears everything are the same
 * block with a different word in it (specs/ENUMS.md).
 */
const defineEventBlock = (event: EventMeta) => {
  const args0: BlockArgDefinition[] = [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ];
  const extensions: Extension[] = [actorSubjectExtension];
  // `%1` is the actor; the phrasing follows it.
  let message0 = 'when %1';
  const filters: Array<{field: string; ref: string}> = [];
  for (const part of event.parts ?? [{kind: 'label', text: event.name}]) {
    if (part.kind === 'label') {
      message0 += ` ${part.text}`;
      continue;
    }
    const choice = enumRefOfParamType(part.type);
    if (!choice) {
      continue; // only a set of choices can be filtered on
    }
    const field = filterFieldName(filters.length);
    const options = (): Array<[string, string]> => [
      ANY_CHOICE,
      ...enumOptions(choice),
    ];
    args0.push({type: 'field_dropdown', name: field, options: options()});
    extensions.push(
      liveDropdown(
        `world_event_filter_${choice.replace(/[^A-Za-z0-9]+/g, '_')}_${field}`,
        field,
        options,
      ),
    );
    filters.push({field, ref: choice});
    message0 += ` %${args0.length}`;
  }
  return defineBlock({
    type: eventBlockType(event),
    message0,
    args0,
    nextStatement: true,
    inputsInline: true,
    extensions,
    style: 'event_blocks',
    tooltip: `Run the blocks below when this actor ${event.name}.`,
    generator: {
      javascript(block, generator) {
        const target = actorTarget(block, generator, Order.MEMBER);
        // The guard a learner would otherwise write themselves: compare the
        // event's value against the choice and leave if it is not the one.
        const guards = filters
          .map(filter => block.getFieldValue(filter.field))
          .filter(value => value)
          .map(value => `  if (eventValue !== ${str(value)}) return;\n`)
          .join('');
        return onHandler(
          target.code,
          refCode(event.ref, generator),
          guards + nextChainCode(block, generator),
        );
      },
    },
  });
};

/** The toolbox/registry type for the block that RAISES `event`. */
const emitBlockType = (event: EventMeta): string =>
  `world_emit_${memberKey(event.ref)}`;

/**
 * The block that raises an event: `emit ⟨space ▾⟩ is pressed for ⟨this actor⟩`.
 *
 * Generated per event, from the same signature the hat is built from, because
 * an event is a member like any other and every other member reaches the
 * palette this way. What it replaces is a pair of hand-written blocks that
 * named their event in a dropdown and always said "with", whether the event
 * carried anything or not — so the arity was wrong for events with nothing to
 * carry and unextendable for events with more than one thing.
 *
 * A parameter is a SOCKET here, where the hat gives it a field. That is the
 * distinction the two sides genuinely have: a hat picks one of the choices to
 * wait for, an emit supplies whichever the code worked out. `rules/input` is
 * the case in point — it raises its event once per key it is looping over.
 */
const defineEmitBlock = (event: EventMeta) => {
  const parts = event.parts ?? [{kind: 'label' as const, text: event.name}];
  const params = parts.filter(part => part.kind === 'param');
  const names = params.map(param =>
    params.length > 1 ? paramValueNames(param.name) : DEFAULT_VALUE_NAMES,
  );
  const args0: BlockArgDefinition[] = [];
  const shadows: Array<{name: string; shadow: ShadowSpec}> = [];
  let message0 = 'emit';
  let paramIndex = 0;
  for (const part of parts) {
    if (part.kind === 'label') {
      message0 += ` ${part.text}`;
      continue;
    }
    // Only a set of choices can be carried, as only a set of choices can be
    // filtered on — the two sides of one event agree about that.
    if (!enumRefOfParamType(part.type)) {
      continue;
    }
    const built = typedValueInputs(part, args0.length + 1, names[paramIndex], {
      enumAsSocket: true,
    });
    paramIndex += 1;
    args0.push(...built.args);
    shadows.push(...built.shadows);
    message0 += ` ${built.message}`;
  }
  // The subject last, as `emit … for …` always read.
  args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
  message0 += ` for %${args0.length}`;

  const type = emitBlockType(event);
  if (shadows.length) {
    registerValueShadows(type, shadows);
  }
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    extensions: [
      actorInputExtension,
      worldContextExtension,
      ...(shadows.length ? [valueShadowExtension] : []),
    ],
    style: 'event_blocks',
    tooltip: `Raise "${event.name}" for an actor — every “when …” handler listening for it runs.`,
    generator: {
      javascript(block, generator) {
        const target = actorTarget(block, generator);
        const carried = names
          .slice(0, paramIndex)
          .map(name => generator.valueToCode(block, name.value, Order.NONE))
          .map(code => code || '""');
        // `refCode` resolves a project event to the bare local name when the
        // rule is emitting its OWN event (it is an `export const` in the module
        // being written), and imports it otherwise.
        const event_ = refCode(event.ref, generator);
        const values = carried.map(code => `, ${code}`).join('');
        return forEachActor(
          target,
          actor => `world.emit(${event_}, ${actor}${values})`,
        );
      },
    },
  });
};

// Build a block for every event the rule library declares.
//
// One shape for all of them. The keyboard's events used to get a special hat
// with a KEY dropdown built in ("when this actor presses key ⟨space⟩"), because
// they were the engine's own and it could know what they carried. They are an
// authored rule's events now (rules/stock/input), and an authored rule's event
// is an ordinary event: the hat hands the handler `event value`, and a handler
// that cares about one key compares it — `if event value = key ⟨space⟩`. One
// block more, and nothing magic about the keyboard's events that a rule of your
// own could not have.
const EVENT_BLOCKS = AUTHORING_RULES.flatMap(rule =>
  rule.events.map(event => defineEventBlock(event)),
);
/** …and the block that raises each, beside the hat that hears it. */
const EMIT_BLOCKS = AUTHORING_RULES.flatMap(rule =>
  rule.events.map(event => defineEmitBlock(event)),
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
  'world_world',
  'world_rule',
  // A trait is a definition root too — its members chain below it, beside the
  // rule rather than inside it. So is each step: its body chains below it.
  'world_rule_trait',
  'world_rule_step_tick',
  'world_rule_step_before',
  'world_rule_step_after',
  'world_rule_step_in',
  // …and a set of choices, whose options chain below it.
  'world_rule_enum',
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

/**
 * Properties that are plumbing for a bespoke block, and get no blocks at all.
 *
 * The cell of a spritesheet that `set sprite` draws is carried on the actor as
 * two vectors, because the engine has to be told a rectangle (spriteCells). It
 * is not vocabulary: "get sprite cell origin of this actor" answers a question
 * nobody asked, in units nobody chose.
 */
const HIDDEN_PROPERTY_EXPORTS: ReadonlySet<string> = new Set([
  'SpriteCellOriginProperty',
  'SpriteCellSizeProperty',
]);

/**
 * Whether a property gets a generated `set` block.
 *
 * Not read-only (a step owns the value), and not one a bespoke block already
 * sets — `set position`, `set sprite`, `play animation` read better than the
 * generated form would.
 */
const isSettable = (property: PropertyMeta): boolean =>
  !HIDDEN_PROPERTY_EXPORTS.has(property.ref.exportName) &&
  !property.readonly &&
  !COVERED_PROPERTY_EXPORTS.has(property.ref.exportName) &&
  property.ref.exportName !== '';

/**
 * Whether a property gets a generated `get` block. Anything with a name does.
 *
 * Separate from {@link isSettable}, which it used to share. Conflating them cost
 * two things: a READ-ONLY property could not be read — the whole point of one —
 * so a rule declaring `falling` had no way to look at it, not even from its own
 * query; and `position` had no getter at all, because a bespoke `set position`
 * block suppressed the generated pair wholesale.
 */
const isGettable = (property: PropertyMeta): boolean =>
  property.ref.exportName !== '' &&
  !HIDDEN_PROPERTY_EXPORTS.has(property.ref.exportName);

// ── Actor values: one actor, or several ──────────────────────────────────────
// An actor socket carries one actor or many (specs/ACTOR_LISTS.md), and what a
// block does with it depends on which kind of block it is: a statement
// broadcasts, a value reads the first. Generated code says so out loud, through
// `WorldLab.each` and `WorldLab.one` — but only where the value could BE many,
// because wrapping `this actor` in a broadcast would make every actor file
// harder to read for a case it does not have.

/** An `ACTOR` socket's expression, and whether it could hold several. */
interface ActorTarget {
  code: string;
  many: boolean;
}

/**
 * Read a block's `ACTOR` socket.
 *
 * `many` asks the block plugged in, not the value at runtime: only
 * `any ⟨Kind⟩` yields several today. A VARIABLE will be able to, once there is
 * a way to put several in one (`push`, ACTOR_LISTS.md step 4) — that is the
 * moment this has to start asking where the variable came from, and until then
 * treating one as single keeps every rule body reading as it does.
 */
const actorTarget = (
  block: Block,
  generator: JavascriptGenerator,
  order: number = Order.NONE,
  name = 'ACTOR',
): ActorTarget => {
  const code = generator.valueToCode(block, name, order) || 'actor';
  return {code, many: yieldsMany(block.getInputTargetBlock?.(name))};
};

/**
 * A statement over an actor value: run `body` for each actor in it.
 *
 * `body` is handed the expression naming one actor, so a single value emits the
 * line it always did and a many-valued one emits the broadcast around it.
 */
const forEachActor = (
  target: ActorTarget,
  body: (actor: string) => string,
): string =>
  target.many
    ? `WorldLab.each(${target.code}, actor => ${body('actor')});\n`
    : `${body(target.code)};\n`;

/**
 * What a `for … of` walks for a loop's SOURCE socket.
 *
 * `all actors` is already every actor and already iterable, so the common case
 * emits what it always did — `world.actors`, no copy, no wrapper. Anything else
 * is an actor value, one or many, and `WorldLab.all` makes a list of it.
 */
const actorSource = (block: Block, generator: JavascriptGenerator): string => {
  const plugged = block.getInputTargetBlock?.('SOURCE');
  if (!plugged || plugged.type === 'world_all_actors') {
    return 'world.actors';
  }
  return `WorldLab.all(${generator.valueToCode(block, 'SOURCE', Order.NONE) || 'actor'})`;
};

/** An actor value read as one actor — the first, when it holds several. */
const oneActor = (target: ActorTarget): string =>
  target.many ? `WorldLab.one(${target.code})` : target.code;

/** A typed value slot — the shared shape of a property, an action parameter, and
 * a query argument. Uses the widest list, {@link ParamType}: an `actor` socket
 * (a query argument) is expressible, and so is a parameter typed by an enum,
 * whose socket wears a dropdown. Properties only ever carry a
 * {@link PropertyType}. */
interface TypedValue {
  // The editor's wider list: the engine's kinds, plus a parameter typed by an
  // enum (`blockly/enums`), whose socket wears a dropdown.
  type: ParamType;
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
    case 'actors':
      return read(names.value) || '[]';
    case 'number':
      return read(names.value) || String(Number(d ?? 0));
    default:
      // An enum parameter (`enum:<Owner>#<Name>`): the choice is a FIELD on the
      // block, so it is read rather than pulled through a socket, and what it
      // stands for is the word itself.
      return enumRefOfParamType(value.type)
        ? str(String(block.getFieldValue(names.value) ?? d ?? ''))
        : read(names.value) || String(Number(d ?? 0));
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
  // A signature's parameter is a FIELD where a constant is meant and a SOCKET
  // where a value is meant: a hat filters on one of an enum's choices, an
  // `emit` supplies whichever the code worked out (specs/ENUMS.md). Every
  // caller but the emit side means the first.
  opts: {enumAsSocket?: boolean} = {},
): {
  message: string;
  args: BlockArgDefinition[];
  shadows: Array<{name: string; shadow: ShadowSpec}>;
  /** Extensions the block must carry for this slot (an enum's live options). */
  extensions?: Extension[];
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
  // An enum-typed parameter: the dropdown itself, on the block.
  //
  // A FIELD rather than a socket, because the choices are the whole of what the
  // argument can be — a set of words the rule named. A socket would draw a
  // notch, an outline and a plug around a list of five words, and offer to
  // accept a value that is not one of them. Naming a choice somewhere a socket
  // is genuinely wanted (a comparison, an `emit … with`) is what the enum's own
  // chip block is for.
  //
  // Live options, so a `define choices` edited a moment ago reaches the blocks
  // built from it — and so a stored word the set no longer offers is KEPT and
  // shown as itself rather than silently becoming the first option
  // (`liveDropdown`).
  const choice = enumRefOfParamType(value.type);
  if (choice && opts.enumAsSocket) {
    // The choices as a block that can be replaced: `rules/input` emits the key
    // it is looping over, so a dropdown has to be droppable-over here.
    const first = enumOptions(choice)[0]?.[1] ?? '';
    return {
      message: `%${slot}`,
      args: [{type: 'input_value', name: names.value, check: 'String'}],
      shadows: [
        {
          name: names.value,
          shadow: {
            type: enumValueBlockType(choice),
            fields: {VALUE: String(d ?? first)},
          },
        },
      ],
    };
  }
  if (choice) {
    const options = (): Array<[string, string]> => {
      const live = enumOptions(choice);
      return live.length > 0 ? live : [['(no choices yet)', '']];
    };
    return {
      message: `%${slot}`,
      args: [{type: 'field_dropdown', name: names.value, options: options()}],
      shadows: [],
      extensions: [
        liveDropdown(
          `world_choice_field_${choice.replace(/[^A-Za-z0-9]+/g, '_')}_${names.value}`,
          names.value,
          options,
        ),
      ],
    };
  }
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
    case 'actors':
      // An actor value, one or many — and no shadow: the empty socket means no
      // actors, which is the only default a set of them has.
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: 'Actor'}],
        shadows: [],
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
        : // An actors property reports an ACTOR value, so it plugs into a loop's
          // source, `is in`, `how many actors in` — every actor socket there is.
          type === 'actors'
          ? 'Actor'
          : 'Number';

// A value block's style by the kind it reports: a boolean is logic, a whole
// vector is a location, everything else (numbers, point axes) is math.
const valueStyle = (type: PropertyType): string =>
  type === 'boolean'
    ? 'logic_blocks'
    : type === 'vector'
      ? 'location_blocks'
      : type === 'actors'
        ? 'sprite_blocks' // the colour that groups the actors
        : 'math_blocks';

/**
 * A "set …" block for one settable property, generated from its definition. An
 * actor property (a trait's) takes an ACTOR value input defaulting to a `this
 * actor` shadow and sets it on that actor; a world property (a rule's own) sets
 * it on `world`. The value input(s) match the property's type.
 */
const defineSetPropertyBlock = (property: PropertyMeta) => {
  const name = property.name;
  // Anything that is not the world's own has a SUBJECT, and so takes a socket
  // to say which one. A camera-scoped property is a subject property like an
  // actor's — testing `=== 'actor'` here made a camera trait's property
  // generate `world.get(…)` and fail at runtime looking for a slot the world
  // never had (`MemberScope`).
  const subjectScoped = property.scope !== 'world';
  // The value inputs start at %2 after the ACTOR input (%1), else at %1.
  const value = typedValueInputs(property, subjectScoped ? 2 : 1);
  // No `world` in front of a world property: the name is the whole label. What
  // tells the two apart is the subject — an actor property says whose it is
  // (`set health of ⟨this actor⟩`) and a world property has nobody to name, so
  // the prefix was answering a question the block never asked. It also read
  // badly the moment a property named itself properly: "set world amount of
  // gravity to" against "set amount of gravity to".
  const message0 = subjectScoped
    ? `set ${name} of %1 to ${value.message}`
    : `set ${name} to ${value.message}`;
  const args0: BlockArgDefinition[] = subjectScoped
    ? [{type: 'input_value', name: 'ACTOR', check: 'Actor'}, ...value.args]
    : value.args;
  const type = setPropertyBlockType(memberKey(property.ref));
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
    extensions: subjectScoped
      ? [actorInputExtension, valueShadowExtension]
      : [valueShadowExtension, worldContextExtension],
    style: 'default',
    tooltip: subjectScoped
      ? `Set an actor's ${name}.`
      : `Set the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        const value = typedValueCode(property, block, generator);
        const set = (subject: string) =>
          `${subject}.set(${refCode(property.ref, generator)}, ${value})`;
        return subjectScoped
          ? forEachActor(actorTarget(block, generator, Order.MEMBER), set)
          : `${set('world')};\n`;
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
  // Anything that is not the world's own has a SUBJECT, and so takes a socket
  // to say which one. A camera-scoped property is a subject property like an
  // actor's — testing `=== 'actor'` here made a camera trait's property
  // generate `world.get(…)` and fail at runtime looking for a slot the world
  // never had (`MemberScope`).
  const subjectScoped = property.scope !== 'world';
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

  // Unprefixed for a world property, as the setter is above.
  const message0 = subjectScoped
    ? hasComponent
      ? `get ${name} ${component()} of ${actorSocket()}`
      : `get ${name} of ${actorSocket()}`
    : hasComponent
      ? `get ${name} ${component()}`
      : `get ${name}`;

  const type = getPropertyBlockType(memberKey(property.ref));
  if (property.type === 'actors') {
    // It reports a LIST, always — see `registerManyActorBlock`. A socket that
    // reads one actor has to know, or it reads the property off the array.
    registerManyActorBlock(type);
  }

  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    output: outputForType(property.type),
    // A world property reads from `world`; warn if placed where it is unbound.
    extensions: subjectScoped ? [actorInputExtension] : [worldContextExtension],
    // Style by the value it reports: a boolean reads as logic, a whole vector as
    // a location, a number/point axis as math.
    style: valueStyle(property.type),
    tooltip: subjectScoped
      ? `Get an actor's ${name}.`
      : `Get the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        const subject = subjectScoped
          ? oneActor(actorTarget(block, generator, Order.MEMBER))
          : 'world';
        const component = hasComponent
          ? `.${block.getFieldValue('COMPONENT')}`
          : '';
        return [
          `${subject}.get(${refCode(property.ref, generator)})${component}`,
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
    if (isSettable(property)) {
      const setBlock = defineSetPropertyBlock(property);
      PROPERTY_BLOCKS.push(setBlock);
      types.push(setBlock.type);
    }
    if (isGettable(property)) {
      const getBlock = defineGetPropertyBlock(property);
      PROPERTY_BLOCKS.push(getBlock);
      types.push(getBlock.type);
    }
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

/** The input names a typed argument (an action/query param) occupies, derived
 * from its declared name (a vector uses `<NAME>_X`/`<NAME>_Y`). */
const paramValueNames = (name: string): ValueNames => {
  const upper = name.toUpperCase();
  return {value: upper, x: `${upper}_X`, y: `${upper}_Y`};
};

/**
 * A "do this action" block for one rule action, generated from its definition.
 * A world action runs on `world`; an actor action takes an `on …` ACTOR socket
 * (default `this actor`) and runs on it. Each of the action's params is a typed
 * value socket (a getter/math slots in), passed positionally to `act`. A single
 * param trails the name bare ("apply force %1"); two or more are each labelled
 * by name ("nudge amount %1 direction %2") to keep them apart.
 */
const defineActionBlock = (action: ActionMeta) => {
  const subjectScoped = action.scope !== 'world';
  const name = action.name;
  const params = action.params;
  const labelled = params.length > 1;
  // A lone argument keeps the default `VALUE`/`X`/`Y` sockets (so built-in
  // single-arg action blocks are unchanged); several need per-name sockets to
  // stay distinct.
  const paramNames = params.map(param =>
    labelled ? paramValueNames(param.name) : DEFAULT_VALUE_NAMES,
  );

  const args0: BlockArgDefinition[] = [];
  const shadows: Array<{name: string; shadow: ShadowSpec}> = [];
  // What an enum-typed argument's dropdown needs to stay live (typedValueInputs).
  const slotExtensions: Extension[] = [];
  // A DESIGNED member (`define block`) carries the arrangement its author saw
  // in the preview, so the call site is built from that rather than from
  // "name, then arguments" — which is the whole point of designing it.
  let message0 = action.parts ? '' : name;
  if (action.parts) {
    let paramIndex = 0;
    for (const part of action.parts) {
      if (part.kind === 'label') {
        message0 += `${message0 ? ' ' : ''}${part.text}`;
        continue;
      }
      const built = typedValueInputs(
        params[paramIndex],
        args0.length + 1,
        paramNames[paramIndex],
      );
      paramIndex += 1;
      args0.push(...built.args);
      shadows.push(...built.shadows);
      slotExtensions.push(...(built.extensions ?? []));
      message0 += `${message0 ? ' ' : ''}${built.message}`;
    }
  } else {
    params.forEach((param, i) => {
      const built = typedValueInputs(param, args0.length + 1, paramNames[i]);
      args0.push(...built.args);
      shadows.push(...built.shadows);
      slotExtensions.push(...(built.extensions ?? []));
      // Label each socket by param name only when there are several; a lone
      // param trails the verb bare, preserving the built-in blocks' look.
      message0 += labelled
        ? ` ${param.name} ${built.message}`
        : ` ${built.message}`;
    });
  }
  if (subjectScoped) {
    // Target socket last, like `play animation … on …`.
    args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
    message0 = `${message0} on %${args0.length}`;
  }

  const type = actionBlockType(memberKey(action.ref));
  if (shadows.length) {
    registerValueShadows(type, shadows);
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
      ...(subjectScoped ? [actorInputExtension] : [worldContextExtension]),
      ...(shadows.length ? [valueShadowExtension] : []),
      ...slotExtensions,
    ],
    style: 'default',
    // The author's own sentence, when they wrote one.
    tooltip:
      action.description || (subjectScoped ? `${name} — for an actor.` : name),
    generator: {
      javascript(block, generator) {
        const argCode = params
          .map(
            (param, i) =>
              `, ${typedValueCode(param, block, generator, paramNames[i])}`,
          )
          .join('');
        const call = (subject: string) =>
          `${subject}.act(${refCode(action.ref, generator)}${argCode})`;
        return subjectScoped
          ? forEachActor(actorTarget(block, generator, Order.MEMBER), call)
          : `${call('world')};\n`;
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
 * A query's `params` (built-in or authored) become value sockets after the
 * subject, passed positionally to `query`.
 */
const defineQueryBlock = (query: QueryMeta) => {
  const subjectScoped = query.scope !== 'world';
  const name = query.name;
  const returns = query.returns ?? 'boolean';
  const type = queryBlockType(memberKey(query.ref));
  const params = query.params;
  const paramNames = params.map(param => paramValueNames(param.name));

  const args0: BlockArgDefinition[] = [];
  const shadows: Array<{name: string; shadow: ShadowSpec}> = [];
  const slotExtensions: Extension[] = [];
  let message0: string;
  if (query.parts) {
    // A DESIGNED query (`define block`) reads in the arrangement its author saw
    // in the preview — the same rule the action side follows. An actor query
    // still leads with its subject, since the arrangement describes the block's
    // own words, not what it is asked of.
    let designed = '';
    let paramIndex = 0;
    if (subjectScoped) {
      args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
      designed = '%1';
    }
    for (const part of query.parts) {
      if (part.kind === 'label') {
        designed += `${designed ? ' ' : ''}${part.text}`;
        continue;
      }
      const built = typedValueInputs(
        params[paramIndex],
        args0.length + 1,
        paramNames[paramIndex],
      );
      paramIndex += 1;
      args0.push(...built.args);
      shadows.push(...built.shadows);
      slotExtensions.push(...(built.extensions ?? []));
      designed += `${designed ? ' ' : ''}${built.message}`;
    }
    message0 = designed;
  } else if (subjectScoped) {
    // The name reads as a predicate ("is on the ground?"), so the subject leads:
    // "this actor is on the ground?"; any params trail, each labelled by name.
    message0 = `%1 ${name}`;
    args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
    params.forEach((param, i) => {
      const built = typedValueInputs(param, args0.length + 1, paramNames[i]);
      args0.push(...built.args);
      shadows.push(...built.shadows);
      slotExtensions.push(...(built.extensions ?? []));
      message0 += ` ${param.name} ${built.message}`;
    });
  } else if (params.length > 0) {
    // A predicate over its arguments — the first argument leads, the name
    // follows, the rest trail: "%1 is touching %2".
    const frags = params.map((param, i) => {
      const built = typedValueInputs(param, args0.length + 1, paramNames[i]);
      args0.push(...built.args);
      shadows.push(...built.shadows);
      slotExtensions.push(...(built.extensions ?? []));
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
    extensions: [
      ...(subjectScoped ? [actorInputExtension] : [worldContextExtension]),
      ...(shadows.length ? [valueShadowExtension] : []),
      ...slotExtensions,
    ],
    style: valueStyle(returns),
    tooltip:
      query.description ||
      (subjectScoped ? `Whether an actor ${name}` : `The world's ${name}`),
    generator: {
      javascript(block, generator) {
        const argCode = params
          .map(
            (param, i) =>
              `, ${typedValueCode(param, block, generator, paramNames[i])}`,
          )
          .join('');
        if (subjectScoped) {
          const subject = oneActor(actorTarget(block, generator, Order.MEMBER));
          return [
            `${subject}.query(${refCode(query.ref, generator)}${argCode})`,
            Order.ATOMIC,
          ] as [string, number];
        }
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

// The current event's value as an expression — the animation frame in a "when
// animation frame changes" handler, the key in a "when a key is pressed" one.
// `eventValue` is the handler arg bound by world_on_event, so this is only
// meaningful inside a "when" block.
//
// Untyped ON PURPOSE. It reported a Number, from when the only event carrying
// anything was an animation's frame — which made it unusable the moment an event
// carried something else: `logic_compare` refuses to hold two operands whose
// output types disagree, so `event value = key ⟨space⟩` could not be assembled
// at all, and a saved one was pulled apart on load. What the value IS depends on
// the event the handler is for, and Blockly's word for that is `null`.
const worldEventValue = defineBlock({
  type: 'world_event_value',
  message0: 'event value',
  output: null,
  style: 'variable_blocks',
  tooltip:
    'The value of the current event — the key that was pressed, the animation ' +
    'frame, whatever the event carries.',
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

// The slider: `math_number` with the range made visible and reachable.
//
// Offered as the shadow for any effect parameter that declares bounds (see
// effectParamsMutator), which is why it is here rather than in the toolbox —
// a learner meets it already plugged into `add effect`, and can still drop a
// getter or an expression on top of it like any other shadow.
const worldSlider = defineBlock({
  type: 'world_slider',
  message0: '%1',
  args0: [fieldSliderArg('NUM', 0)],
  output: 'Number',
  // The number blocks' color: it stands in for `math_number` and should not
  // read as a different kind of thing.
  style: 'math_blocks',
  mutator: sliderRangeMutator,
  tooltip: 'A number in a fixed range — type it, or drag the slider.',
  generator: {
    javascript(block) {
      return [
        String(Number(block.getFieldValue('NUM')) || 0),
        Order.ATOMIC,
      ] as [string, number];
    },
  },
});

// A color by its channels, for when the swatch is not enough.
//
// The picker is the easy road and covers most of what a learner wants: pick a
// color, see a color. It cannot do two things, though — set an alpha, or let
// a channel be driven by something (a variable, a loop counter, a query). This
// block is where you go for either, and it drops straight onto the picker
// because both output `Color`.
//
// Channels are 0–1, not 0–255, matching the shader and the numbers in the
// `.effect` file. The sliders are what makes that workable: nobody has to know
// the convention to set a color by dragging, and a learner who opens the
// effect afterwards sees the same numbers there.
//
// It leads with a swatch showing what the channels add up to, which is also
// where the presets live — see `rgbaPreview` for how the two stay in step.
/**
 * A color-swatch field arg. Built by a helper, like the vector and slider
 * fields: a plugin-typed arg carrying extra config trips TypeScript's
 * excess-property check when written as a literal at the call site.
 */
const swatchArg = (name: string) =>
  ({type: fieldColourPlugin, name, colour: '#000000'}) as const;

// Each channel is seeded with a 0–1 slider, which is `world_slider`'s own
// default range — so no per-socket bounds are needed here.
registerValueShadows(
  'world_rgba',
  ['R', 'G', 'B', 'A'].map(name => ({
    name,
    shadow: {type: 'world_slider', fields: {NUM: name === 'A' ? 1 : 0}},
  })),
);

const worldRgba = defineBlock({
  type: 'world_rgba',
  message0: '%1 r %2 g %3 b %4 a %5',
  args0: [
    // The swatch leads: it is the answer the channels are working toward, and
    // it doubles as the preset picker (rgbaPreview).
    swatchArg('PREVIEW'),
    {type: 'input_value', name: 'R', check: 'Number'},
    {type: 'input_value', name: 'G', check: 'Number'},
    {type: 'input_value', name: 'B', check: 'Number'},
    {type: 'input_value', name: 'A', check: 'Number'},
  ],
  inputsInline: true,
  // Blockly's spelling, deliberately: it has to match what the stock color
  // blocks offer or neither can plug into the other. See `colorCheck`.
  output: COLOUR_CHECK,
  extensions: [valueShadowExtension, rgbaPreviewExtension],
  // Blockly's own color blocks' style, so this reads as one of them — which,
  // as far as any socket is concerned, it is.
  style: 'colour_blocks',
  tooltip:
    'A color from its red, green, blue and alpha channels (0 to 1). Drop it on a color to set them yourself.',
  generator: {
    javascript(block, generator) {
      // Straight to floats. `rgb`/`rgba` accept an array as readily as hex, so
      // this does not detour through a hex string — which would quantize the
      // learner's values to 8 bits and throw the alpha away.
      const channel = (name: string, fallback: string) =>
        generator.valueToCode(block, name, Order.NONE) || fallback;
      return [
        `[${channel('R', '0')}, ${channel('G', '0')}, ${channel('B', '0')}, ${channel('A', '1')}]`,
        Order.ATOMIC,
      ] as [string, number];
    },
  },
});

// Vector arithmetic — one block, which infers what it is doing.
//
// A step that does physics needs it, and `world_vector` (build one) and
// `world_vector_component` (read an axis back out) did not combine. It began as
// two blocks, `+` over two vectors and `×` by a number, which is how the
// operations differ in TYPE and not at all in what a learner is thinking:
// "velocity × delta" and "velocity × wind" are the same sentence.
//
// So this is the GLSL rule instead. Either side may be a vector or a number, the
// work is component-wise, and a number broadcasts to both components. Gravity's
// step is the worked example: `velocity + direction × strength × delta` — one
// vector and three scalars, written the way it is said.
//
// Output is always a Vector: an operation with a vector in it produces one, and
// the case with no vector at all (`2 + 3`) is what the stock math block is for.
const VECTOR_OPS: Array<[string, string]> = [
  ['+', 'ADD'],
  ['−', 'SUBTRACT'],
  ['×', 'MULTIPLY'],
  ['÷', 'DIVIDE'],
];
const VECTOR_OP_METHODS: Record<string, string> = {
  ADD: 'add',
  SUBTRACT: 'subtract',
  MULTIPLY: 'multiply',
  DIVIDE: 'divide',
};
/** Both sockets take either kind — that is the whole point. */
const VECTOR_OPERAND_CHECK = ['Vector', 'Number'];

const worldVectorMath = defineBlock({
  type: 'world_vector_math',
  message0: '%1 %2 %3',
  args0: [
    {type: 'input_value', name: 'A', check: VECTOR_OPERAND_CHECK},
    {type: 'field_dropdown', name: 'OP', options: VECTOR_OPS},
    {type: 'input_value', name: 'B', check: VECTOR_OPERAND_CHECK},
  ],
  inputsInline: true,
  output: 'Vector',
  style: 'location_blocks',
  tooltip:
    'Vector arithmetic, component by component. Either side may be a vector ' +
    'or a number; a number applies to both components.',
  generator: {
    javascript(block, generator) {
      const method = VECTOR_OP_METHODS[block.getFieldValue('OP') ?? 'ADD'];
      const a =
        generator.valueToCode(block, 'A', Order.MEMBER) ||
        'new WorldLab.Vector(0, 0)';
      const b = generator.valueToCode(block, 'B', Order.NONE) || '0';
      // `a.add(b)` needs `a` to BE a vector. It is, whenever the plugged block
      // says so — a getter of a vector variable, another of these, a literal.
      // When it does not (a number leading: `2 × direction`), the operand is
      // broadcast first, which is the same rule applied to the left-hand side.
      const left = block.getInputTargetBlock('A');
      const isVector = left?.outputConnection?.getCheck()?.includes('Vector');
      const receiver = isVector ? a : `WorldLab.Vector.broadcast(${a})`;
      return [`${receiver}.${method}(${b})`, Order.MEMBER] as [string, number];
    },
  },
});

// A vector built from two COMPUTED components — the counterpart to
// `world_vector_component`, which takes one apart. `world_vector` holds a
// literal in its arrow-grid field, so until now a vector could only be typed,
// never derived: "set velocity to (its x, 0)" — zeroing one axis on landing —
// had no expression that could say it.
const worldVectorOf = defineBlock({
  type: 'world_vector_of',
  message0: 'vector x %1 y %2',
  args0: [
    {type: 'input_value', name: 'X', check: 'Number'},
    {type: 'input_value', name: 'Y', check: 'Number'},
  ],
  inputsInline: true,
  output: 'Vector',
  style: 'location_blocks',
  tooltip: 'A vector built from an x and a y value.',
  generator: {
    javascript(block, generator) {
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      return [`new WorldLab.Vector(${x}, ${y})`, Order.ATOMIC] as [
        string,
        number,
      ];
    },
  },
});
registerValueShadows('world_vector_of', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 0}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 0}}},
]);

const worldVectorRotate = defineBlock({
  type: 'world_vector_rotate',
  message0: 'rotate %1 by %2°',
  args0: [
    {type: 'input_value', name: 'VECTOR', check: 'Vector'},
    {type: 'input_value', name: 'DEGREES', check: 'Number'},
  ],
  inputsInline: true,
  output: 'Vector',
  style: 'location_blocks',
  tooltip: 'A vector turned by an angle, in degrees.',
  generator: {
    javascript(block, generator) {
      const vector =
        generator.valueToCode(block, 'VECTOR', Order.MEMBER) ||
        'new WorldLab.Vector(0, 0)';
      const degrees =
        generator.valueToCode(block, 'DEGREES', Order.NONE) || '0';
      return [`${vector}.rotate(${degrees})`, Order.MEMBER] as [string, number];
    },
  },
});
registerValueShadows('world_vector_rotate', [
  {name: 'DEGREES', shadow: {type: 'math_number', fields: {NUM: 90}}},
]);

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

/**
 * A KIND of actor: every one of them, and every one there will be.
 *
 * The counterpart to `this actor`, and the one a `.world` file needs. In an
 * `.actor` file the subject is obvious — the file is about one actor, and
 * `this actor` is it. A world names several, so a block there has to say which,
 * and what it usually means is "any of them": when ANY coin is collected, when
 * ANY enemy lands.
 *
 * It resolves to the actor's TEMPLATE, and templates take the same messages
 * their instances do (`ActorBuilder.on` and `Actor.on` agree on name, arguments
 * and meaning). So `when any Coin starts falling` generates the same
 * `X.on(event, handler)` that `when this actor starts falling` does, and the
 * handler reaches every coin the world places rather than one of them.
 *
 * Registration is copied into an instance when it is made (`ActorBuilder
 * .instantiate`), so a handler has to be registered before the actors are
 * placed — which is what `assembleWorldModule` orders (event hats above the
 * world block).
 *
 * The context guard is for the OTHER compilation, the one that reads the world:
 * `world.actors.ofType(…)` needs a `world` to read from. It does not fire on
 * the hat-subject case, which names the template and touches no world at all —
 * an event hat counts as binding `world`. What it catches is `any ⟨Coin⟩` read
 * as a value inside `define actor`, where the name is unbound entirely.
 *
 * Under `define world` this is FINE, and used to warn. The builder now hands
 * back the actors of the world it is describing (`WorldBuilder.actors`), so
 * `load map` followed by `first actor of type ⟨Player⟩` reads the actors the
 * map just placed. Read before anything is placed it finds none, which is the
 * truth about that point in the program rather than an error.
 */
const worldActorKind = defineBlock({
  type: 'world_actor_kind',
  message0: 'any %1',
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorFieldOptions}],
  output: 'Actor',
  extensions: [actorOptionsExtension, worldContextExtension],
  // Actor values share the sprite style — the color that groups the actors.
  style: 'sprite_blocks',
  tooltip:
    'Every actor of this kind — the ones placed now and the ones placed later.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      const local = localActorFor(block, actor);
      // A definition since deleted, or nothing chosen: the caller falls back to
      // its own subject rather than naming a variable no line declares.
      if (!actor || (localActorBlockId(actor) && !local)) {
        return ['actor', Order.ATOMIC] as [string, number];
      }
      // Two compilations of one idea (specs/ACTOR_LISTS.md). Plugged into a
      // handler's subject socket this is the TEMPLATE, so registering on it
      // reaches the coins placed later as well; anywhere else it is the coins
      // there are, which is what a statement acts on and a value reads.
      const parent = block.outputConnection?.targetConnection?.getSourceBlock();
      if (!parent?.type.startsWith('world_on_')) {
        // The world stamps each placed actor with its type: a module path for a
        // project actor, the id `add actor` gave a world's own. Either way it
        // is a string, so nothing has to be imported to ask for them.
        const type = local?.type ?? actor;
        return [`world.actors.ofType(${str(type)})`, Order.MEMBER] as [
          string,
          number,
        ];
      }
      if (local) {
        return [local.variable, Order.ATOMIC] as [string, number];
      }
      addImport(
        generator,
        `mod:${actor}`,
        `import ${importVar(actor)} from ${str(actor)};`,
      );
      return [importVar(actor), Order.ATOMIC] as [string, number];
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
/**
 * Every actor in the world — the value a loop walked before it could be given
 * one, and an actor value like any other (specs/ACTOR_LISTS.md).
 *
 * A copy, because a source is read once at the top of a loop: a rule that adds
 * actors while iterating them terminates.
 */
const worldAllActors = defineBlock({
  type: 'world_all_actors',
  message0: 'all actors',
  output: 'Actor',
  extensions: [worldContextExtension],
  style: 'sprite_blocks',
  tooltip: 'Every actor in the world, as it is now.',
  generator: {
    javascript() {
      return ['[...world.actors]', Order.ATOMIC] as [string, number];
    },
  },
});

/**
 * Add an actor to what a variable holds (specs/ACTOR_LISTS.md).
 *
 * The variable is a FIELD, not a socket, because this changes what the variable
 * holds and a socket hands over a value rather than a place to put one. A
 * variable holding one actor becomes a list of two; one already holding several
 * is appended to in place, so a set built across a loop is one list and not a
 * chain of copies.
 */
/**
 * One camera, by name, as an actor value.
 *
 * The piece that lets a WORLD wire a camera up. `all cameras` hands over the
 * set, which is what a rule wants ("whichever have this trait"); a world body
 * knows exactly which one it means, and needs to say so:
 *
 *   load map ⟨Level 1⟩
 *   set actor to follow of ⟨camera ⟨Chase⟩⟩ to ⟨first actor … is a ⟨Player⟩⟩
 *
 * Actor-typed like every camera value, so the generated property setters — the
 * ones a camera TRAIT brings — take it without knowing what it is.
 *
 * Naming a camera the world has not defined yet reads as the default one, the
 * same answer `World.camera` gives: the id comes from a dropdown whose block
 * may have been deleted, and a view through no camera is not an answer.
 */
const worldCameraValue = defineBlock({
  type: 'world_camera',
  message0: 'camera %1',
  args0: [{type: 'field_dropdown', name: 'CAMERA', options: cameraOptions}],
  output: 'Actor',
  extensions: [cameraOptionsExtension, worldContextExtension],
  style: 'sprite_blocks',
  tooltip:
    'One camera, to read or set something on. Its traits’ properties are set ' +
    'like an actor’s.',
  generator: {
    javascript(block) {
      const camera = cameraIdFromValue(
        block,
        String(block.getFieldValue('CAMERA') ?? ''),
      );
      return [`world.camera(${str(camera)})`, Order.MEMBER] as [string, number];
    },
  },
});

/**
 * Every camera in the world, as an actor value.
 *
 * Actor-typed on purpose, so the whole existing vocabulary reaches a camera:
 * `for each actor ⟨c⟩ in ⟨all cameras⟩ where ⟨⟨c⟩ has trait ⟨Follows⟩⟩` then
 * `set position of ⟨c⟩` is how a rule makes a camera follow something, built
 * entirely from blocks that already existed. A separate Camera type would have
 * meant a second loop, a second filter and a second set-position.
 *
 * It is the only way a rule can reach a camera at all: `move camera ⟨C⟩` names
 * one from a dropdown, which cannot say "whichever cameras have this trait".
 *
 * A copy, like `all actors`, because a source is read once at the top of a loop.
 */
const worldAllCameras = defineBlock({
  type: 'world_all_cameras',
  message0: 'all cameras',
  output: 'Actor',
  extensions: [worldContextExtension],
  style: 'sprite_blocks',
  tooltip:
    'Every camera in the world. Loop over them to move the ones with a trait ' +
    '— which is how a camera is made to follow something.',
  generator: {
    javascript() {
      return ['[...world.cameras]', Order.ATOMIC] as [string, number];
    },
  },
});

const worldPushActor = defineBlock({
  type: 'world_push_actor',
  message0: 'add %1 to %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    ActorVariable.field('LIST'),
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [actorInputExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'Add an actor to the actors a variable holds — building up a group as you ' +
    'go, one at a time.',
  generator: {
    javascript(block, generator) {
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      const target = actorTarget(block, generator);
      return `${list} = WorldLab.pushed(${list}, ${oneActor(target)});\n`;
    },
  },
});

/** Empty a variable — what a per-tick set does before it is filled again. */
const worldClearActors = defineBlock({
  type: 'world_clear_actors',
  message0: 'empty %1',
  args0: [ActorVariable.field('LIST')],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip: 'Leave a variable holding no actors at all.',
  generator: {
    javascript(block, generator) {
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      return `${list} = [];\n`;
    },
  },
});

/** How many actors a value holds — one, for a value holding one. */
/**
 * Every actor drawn in one layer (specs/VIEWPORT.md).
 *
 * `all actors` narrowed to a group. Most programs never need it — you place
 * game actors in a game layer and widgets in an interface layer, so a loop over
 * "all actors" is usually already the ones you meant — but a rule that must not
 * reach the HUD has no other way to say so.
 *
 * A copy, like `all actors`, because a source is read once at the top of a
 * loop: a rule that adds actors while iterating them terminates.
 */
const worldAllActorsInLayer = defineBlock({
  type: 'world_all_actors_in_layer',
  message0: 'all actors in layer %1',
  args0: [{type: 'field_dropdown', name: 'LAYER', options: layerOptions}],
  output: 'Actor',
  extensions: [layerOptionsExtension, worldContextExtension],
  style: 'sprite_blocks',
  tooltip: 'Every actor drawn in one layer, as it is now.',
  generator: {
    javascript(block) {
      return [
        `world.actors.inLayer(${str(layerIdFromValue(block, String(block.getFieldValue('LAYER') ?? '')))})`,
        Order.MEMBER,
      ] as [string, number];
    },
  },
});

/** Whether an actor is drawn in a layer — the question, rather than the list. */
const worldIsInLayer = defineBlock({
  type: 'world_is_in_layer',
  message0: '%1 is in layer %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'field_dropdown', name: 'LAYER', options: layerOptions},
  ],
  inputsInline: true,
  output: 'Boolean',
  extensions: [actorInputExtension, layerOptionsExtension],
  style: 'logic_blocks',
  tooltip: 'Whether an actor is drawn in a given layer.',
  generator: {
    javascript(block, generator) {
      // A value over several actors reads the first, as every value does
      // (specs/ACTOR_LISTS.md).
      const target = actorTarget(block, generator, Order.MEMBER);
      const layer = layerIdFromValue(
        block,
        String(block.getFieldValue('LAYER') ?? ''),
      );
      return [
        `${oneActor(target)}.layer === ${str(layer)}`,
        Order.EQUALITY,
      ] as [string, number];
    },
  },
});

const worldCountActors = defineBlock({
  type: 'world_count_actors',
  message0: 'how many actors in %1',
  args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
  inputsInline: true,
  output: 'Number',
  extensions: [actorInputExtension],
  style: 'math_blocks',
  tooltip: 'How many actors a value holds.',
  generator: {
    javascript(block, generator) {
      const target = actorTarget(block, generator);
      return [`WorldLab.all(${target.code}).length`, Order.MEMBER] as [
        string,
        number,
      ];
    },
  },
});

/**
 * Whether a value holds any actor at all.
 *
 * The question `first actor … where …` created the need for. A search that
 * matches nothing answers with a value holding NO actors (specs/ACTOR_LISTS.md),
 * which is what keeps `remove actor ⟨first actor … where …⟩` from failing — but
 * a program that wants to do something ELSE when there was no match has to be
 * able to ask, and until now the only way to ask was `how many actors in ⟨…⟩ >
 * 0`, which is arithmetic standing in for a yes-or-no question.
 *
 * `any actors in ⟨…⟩` rather than `any ⟨…⟩`, which is what it was asked for:
 * `any ⟨Coin⟩` is already a block, and it is an ACTOR — so `any ⟨…⟩` returning
 * a Boolean would put two different answers behind one word, and `any ⟨any
 * ⟨Coin⟩⟩` would be a sentence nobody should have to parse. The longer name
 * also lines this up with the two questions it belongs beside: `how many actors
 * in ⟨…⟩` and `⟨x⟩ is in ⟨…⟩`.
 */
const worldAnyActors = defineBlock({
  type: 'world_any_actors',
  message0: 'any actors in %1',
  args0: [{type: 'input_value', name: 'LIST', check: 'Actor'}],
  inputsInline: true,
  output: 'Boolean',
  // The socket is a LIST, so it seeds `all actors` — not `actorInput`'s `this
  // actor`, which would make the block dragged out read `any actors in ⟨this
  // actor⟩` and answer true forever.
  extensions: [valueShadowExtension],
  style: 'logic_blocks',
  tooltip:
    'Whether there is at least one actor in the list. Answers no for a value ' +
    'holding none — what a search that matched nothing gives back.',
  generator: {
    javascript(block, generator) {
      const list = actorTarget(block, generator, Order.NONE, 'LIST');
      return [`WorldLab.all(${list.code}).length > 0`, Order.RELATIONAL] as [
        string,
        number,
      ];
    },
  },
});
registerValueShadows('world_any_actors', [
  {name: 'LIST', shadow: {type: 'world_all_actors'}},
]);

/** Whether an actor is among the actors a value holds. */
const worldIsInActors = defineBlock({
  type: 'world_is_in_actors',
  message0: '%1 is in %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'input_value', name: 'LIST', check: 'Actor'},
  ],
  inputsInline: true,
  output: 'Boolean',
  extensions: [actorInputExtension, valueShadowExtension],
  style: 'logic_blocks',
  tooltip: 'Whether an actor is one of the actors a value holds.',
  generator: {
    javascript(block, generator) {
      const actor = actorTarget(block, generator);
      const list = actorTarget(block, generator, Order.NONE, 'LIST');
      return [
        `WorldLab.all(${list.code}).includes(${oneActor(actor)})`,
        Order.MEMBER,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_is_in_actors', [
  {name: 'LIST', shadow: {type: 'world_all_actors'}},
]);

const worldForEach = defineBlock({
  type: 'world_for_each',
  message0: 'for each actor %1 in %2 where %3',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {type: 'input_value', name: 'WHERE', check: 'Boolean'},
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // Iterates a source, so warn where `world` is unbound (the default source is
  // the world's own actors); the SOURCE socket seeds `all actors` and the WHERE
  // socket a `true` shadow, so a loop dragged out reads as it always did.
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
      return `for (const ${variable} of ${actorSource(block, generator)}) {\nif (${where}) {\n${body}}\n}\n`;
    },
  },
});
registerValueShadows('world_for_each', [
  {name: 'SOURCE', shadow: {type: 'world_all_actors'}},
  {name: 'WHERE', shadow: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
]);

/**
 * The first actor a test accepts — `for each … where` that stops and hands one
 * back.
 *
 * The same three parts in the same order, so the two read as one idea in two
 * moods: a variable to call the actor being considered, a source to look
 * through, a test to apply. What differs is what comes out. The loop is a
 * statement and runs a body; this is a value, and the answer is the actor.
 *
 * It exists because the alternative is a paragraph: declare a variable, loop,
 * test, assign, and remember to stop — five blocks and a bug (the loop that
 * forgets to stop keeps going and answers with the LAST match, not the first).
 * "The coin I am touching" is one thought and should be one block.
 *
 * NOTHING MATCHING answers with an actor value holding NONE — not with an
 * error, and not with some other actor. That is the language's existing answer
 * for "no actors" (specs/ACTOR_LISTS.md): `empty ⟨var⟩` makes such a value, and
 * a statement over one runs no times. So `remove actor ⟨first actor … where …⟩`
 * that matches nothing removes nothing, which is what the block is reaching for.
 * `how many actors in ⟨…⟩` is how a program asks whether there was a match, and
 * reading a property off no match fails the way a deleted actor does.
 *
 * Which is why this is in `manyActors`' MANY_BY_TYPE: the value is zero-or-one,
 * never guaranteed-one, and a statement over it needs the same broadcast
 * wrapper a many-valued one does.
 *
 * The loop variable is bound for the WHERE socket the same way the loop binds
 * it for its body — Blockly variables are workspace-wide, so the two blocks
 * behave alike here too, including sharing a variable if both name the same one.
 */
const worldFirstWhere = defineBlock({
  type: 'world_first_where',
  message0: 'first actor %1 in %2 where %3',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {type: 'input_value', name: 'WHERE', check: 'Boolean'},
  ],
  output: 'Actor',
  // Same guard and same shadows as the loop: the default source is the world's
  // own actors, so `world` has to be bound, and a block dragged out reads as
  // `first actor ⟨other⟩ in ⟨all actors⟩ where ⟨true⟩`.
  extensions: [worldContextExtension, valueShadowExtension],
  // Actor values share the sprite style — the colour that groups the actors —
  // rather than the loop colour of the block it mirrors. What a block hands
  // over is what its colour says, and this one hands over an actor.
  style: 'sprite_blocks',
  tooltip:
    'The first actor the “where” test accepts, looking through the actors in ' +
    'the list. Bind the variable to read the actor being considered. When none ' +
    'of them match it answers with no actors, so a statement using it does ' +
    'nothing rather than failing.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const where = generator.valueToCode(block, 'WHERE', Order.NONE) || 'true';
      // `actorSource` hands back exactly what the loop walks — `world.actors`
      // for the common case, `WorldLab.all(…)` otherwise — and `firstWhere`
      // takes an iterable so that both work without a copy.
      return [
        `WorldLab.firstWhere(${actorSource(block, generator)}, ${variable} => ${where})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_first_where', [
  {name: 'SOURCE', shadow: {type: 'world_all_actors'}},
  {name: 'WHERE', shadow: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
]);

const worldIsA = defineBlock({
  type: 'world_is_a',
  message0: '%1 is a %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    {type: 'field_dropdown', name: 'TYPE', options: actorFieldOptions},
  ],
  inputsInline: true,
  output: 'Boolean',
  // ACTOR defaults to a `this actor` shadow; the dropdown lists the project's
  // actor templates AND the world's own `define actor`s, the same as
  // `world_add_actor` — through the TYPE-bound extension, because the socket
  // here has taken the name ACTOR.
  extensions: [actorInputExtension, actorTypeOptionsExtension],
  style: 'logic_blocks',
  tooltip:
    'Whether an actor is of a given kind (the map places it by its type).',
  generator: {
    javascript(block, generator) {
      // The dropdown value is the module path (`actors/coin`), which the world
      // stamps as each placed actor's `type` — so an actor's kind is its `.type`.
      const target = actorTarget(block, generator, Order.MEMBER);
      const chosen = block.getFieldValue('TYPE');
      // A world's own actor is stamped with its id, not a module path — the
      // same string `add actor` gave it (blockly/localActors).
      const modulePath = localActorFor(block, chosen)?.type ?? chosen;
      return [
        `${oneActor(target)}.type === ${str(modulePath)}`,
        Order.EQUALITY,
      ] as [string, number];
    },
  },
});

// ── Placing actors ───────────────────────────────────────────────────────────
// `world_add_actor` and `world_load_map` chain under a `.world` file's root and
// PLACE actors in it. An `add` block binds `const actor = world.addActor(
// Template, <id>)` in its own block scope, so the very same `set`-style body
// blocks that target `actor` in an actor definition compose here unchanged
// (only the pure `actor.set(...)` ones — `set position` — are valid on a live
// instance; trait/appearance blocks belong to the template). The instance id is
// the Blockly block's own id, which is stable across edits.

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

const worldAddActor = defineBlock({
  type: 'world_add_actor',
  message0: 'add actor %1',
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorFieldOptions}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // Builder-only: `world.addActor(Template, id, type)` is `WorldBuilder`'s, and
  // the live `World.addActor` takes an already-made Actor (see the extension).
  extensions: [actorOptionsExtension, builderWorldExtension],
  style: 'behavior_blocks',
  tooltip: 'Place an instance of an actor and set its per-instance properties.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      const local = localActorFor(block, actor);
      // A world's own actor is a `const` in this same module — nothing to
      // import, and its `type` is its id rather than a module path. A value
      // naming a definition that has since been deleted emits nothing.
      if (localActorBlockId(actor) && !local) {
        return '';
      }
      if (!local) {
        addImport(
          generator,
          `mod:${actor}`,
          `import ${importVar(actor)} from ${str(actor)};`,
        );
      }
      const template = local ? local.variable : importVar(actor);
      const type = local ? local.type : actor;
      const body = generator.statementToCode(block, 'DO');
      // Block scope: each add's `actor` binding is independent, so several adds
      // in one world don't collide, and the DO body's `actor.set(...)` blocks
      // (e.g. set position) target it. The block id is the stable instance id;
      // the module path is the actor's kind (its `type`), so "for each … I'm
      // touching" matches it regardless of the template's authored name.
      // Which layer it lands in — its nearest layer ancestor, or the default
      // (blockly/layers). Resolved lexically, so no layer context exists at
      // runtime and nothing has to track one.
      return (
        `{\nconst actor = world.addActor(${template}, ${str(
          block.id,
        )}, ${str(type)}, ${str(layerOf(block))});\n` + `${body}}\n`
      );
    },
  },
});

/**
 * Place many actors of one kind, arranged on the map (MAPS.md).
 *
 * The arrangement lives in the block (`mapPlacements`), so it is part of the
 * `.world` file — which is what lets a world place its OWN actors this way, the
 * ones no file can name. `edit…` opens the map canvas on them.
 *
 * Sugar over `add actor`, in the same sense a map file is: twenty `add actor`
 * stacks is not an arrangement, it is a wall of blocks.
 */
/**
 * Take an actor out of the world, while the game is running.
 *
 * The other half of `add actor`, and the one a learner reaches for first: when
 * the player touches a coin, the coin goes. Runtime-only — there is nothing to
 * un-place under `define world`, where the actor has not been placed yet.
 *
 * The subject is a socket rather than a dropdown because what is removed is an
 * INSTANCE, not a kind: the coin that was touched, the actor a loop is looking
 * at, `this actor`. A dropdown of templates could not say which one.
 */
const worldRemoveActor = defineBlock({
  type: 'world_remove_actor',
  message0: 'remove actor %1',
  args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [actorInputExtension, worldContextExtension],
  style: 'behavior_blocks',
  tooltip:
    'Remove an actor from the world. It stops being drawn and stops being ' +
    'seen by the rules. Removing one already gone does nothing.',
  generator: {
    javascript(block, generator) {
      const target = actorTarget(block, generator, Order.MEMBER);
      return forEachActor(target, actor => `world.removeActor(${actor})`);
    },
  },
});

/**
 * A layer, and the actors in it (specs/VIEWPORT.md).
 *
 * A group drawn together, at a depth given by where this block sits: layers
 * draw in the order they are declared, so the first is furthest back. The body
 * is what is IN it — a layer owns its contents, so a placement inside this
 * block is placed in this layer and you can see which by looking at it.
 *
 * The declaration itself is HOISTED by `define world`, not emitted here: a
 * layer must be declared before the first actor is placed, because the first
 * placement builds the World and a layer cannot be spliced into one that
 * exists. So this block generates only its contents (`layerPlan`).
 *
 * No parallax or fit fields yet, deliberately. Both are stored by the engine
 * and neither is READ until there is a camera to be a factor of — a knob that
 * does nothing is worse than no knob.
 */
const worldDefineLayer = defineBlock({
  type: 'world_define_layer',
  message0: 'define layer %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'Layer'}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [builderWorldExtension],
  style: 'setup_blocks',
  tooltip:
    'A group of actors drawn together. Layers draw in the order you define ' +
    'them, so the first one is furthest back. A new layer moves with the ' +
    'camera like the game does; put “this layer …” inside it to change that.',
  generator: {
    javascript(block, generator) {
      return generator.statementToCode(block, 'DO');
    },
  },
});

/**
 * Place into a layer declared somewhere else.
 *
 * The reopener. `define layer`'s own body covers the common case by
 * containment; this covers the one it cannot — adding to a layer that was
 * declared earlier, beside other things. Innermost wins when they nest.
 *
 * It declares nothing, so it does not appear in `layerPlan`: naming a layer is
 * not defining one.
 */
/**
 * How much of the camera's motion this layer takes — the opt-in to parallax.
 *
 * Deliberately NOT part of `define layer`. A new layer moves with the camera
 * like the game does, which is what a learner adding their first one means, and
 * a declaration carrying settings nobody needs yet is settings to read past.
 * Parallax is a thing you go and ask for.
 *
 * It names no layer: it sets the one it is written in, like `set background`
 * and every other slot block (blockly/layers).
 *
 * `1, 1` is the game itself. `0.2, 0` is a sky that shifts as the player walks
 * and stays put when they jump — horizontal only, because a sky that bobs on
 * every jump reads as broken. `0, 0.5` is the same idea in a climbing game,
 * which is the case a fixed list of presets could not have said and the reason
 * this is a vector at all.
 */
const worldLayerParallax = defineBlock({
  type: 'world_layer_parallax',
  message0: 'this layer moves %1 with the camera',
  args0: [fieldVectorArg('PARALLAX', DEFAULT_PARALLAX)],
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'setup_blocks',
  tooltip:
    'How much of the camera’s motion this layer takes, across and down. 1 and ' +
    '1 moves with the game; smaller drifts behind it; larger runs ahead of it; ' +
    '0 on an axis does not move along it at all.',
  generator: {
    javascript(block) {
      const value = (block.getFieldValue('PARALLAX') ?? {
        x: 1,
        y: 1,
      }) as VectorValue;
      return `world.setLayerParallax(new WorldLab.Vector(${Number(value.x)}, ${Number(value.y)}), ${str(layerOf(block))});\n`;
    },
  },
});

/**
 * Whether this layer consults the camera at all — what a HUD is.
 *
 * A separate block from the factor above, because it is a separate question.
 * Folding them together left a vector sitting on the block doing nothing
 * whenever the answer was "fixed", which is a field that lies about mattering.
 *
 * A WORD and never the vector `0, 0`. The two look identical until a camera has
 * a zoom — a layer at zero still zooms, a fixed one does not — so a score that
 * would shrink when the player zooms out must not be expressible by typing two
 * zeros into the block above.
 */
const worldLayerFixed = defineBlock({
  type: 'world_layer_fixed',
  message0: 'this layer %1',
  args0: [
    {type: 'field_dropdown', name: 'FIXED', options: LAYER_FIXED_OPTIONS},
  ],
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'setup_blocks',
  tooltip:
    'Fixed to the screen ignores the camera altogether, which is what an ' +
    'interface layer wants. Following the camera is what every other layer does.',
  generator: {
    javascript(block) {
      const fixed = block.getFieldValue('FIXED') === 'fixed';
      return `world.setLayerFit(${fixed}, ${str(layerOf(block))});\n`;
    },
  },
});

const worldWithinLayer = defineBlock({
  type: 'world_within_layer',
  message0: 'within layer %1',
  args0: [{type: 'field_dropdown', name: 'LAYER', options: layerOptions}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [layerOptionsExtension, builderWorldExtension],
  style: 'setup_blocks',
  tooltip:
    'Place the actors inside into a layer you defined earlier, rather than ' +
    'into the one this block sits in.',
  generator: {
    javascript(block, generator) {
      return generator.statementToCode(block, 'DO');
    },
  },
});

/**
 * Take every actor out of the world at once.
 *
 * `remove actor` in bulk, and the block a learner reaches for at the end of a
 * level: the exit is touched, the room empties, the next one is placed. Doing it
 * one at a time needs a loop over a list that is being emptied as it is walked,
 * which is the sort of thing that works until it does not.
 *
 * Runtime-only, like `remove actor`: under `define world` the name `world` is
 * the builder, and the world it is building has nothing in it yet.
 *
 * No socket and no field — "all of them" is the whole meaning of the block.
 */
const worldClearWorld = defineBlock({
  type: 'world_clear_world',
  message0: 'clear world',
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'behavior_blocks',
  tooltip:
    'Remove every actor from the world. Nothing is left to draw or for the ' +
    'rules to see. The world itself, and the rules it uses, stay as they are.',
  generator: {
    javascript() {
      return 'world.clearActors();\n';
    },
  },
});

const worldCreateInMap = defineBlock({
  type: 'world_create_in_map',
  message0: 'create %1 in map %2',
  args0: [
    {type: 'field_dropdown', name: 'ACTOR', options: actorFieldOptions},
    // The arrangement is this field's VALUE, so Blockly saves it with the block
    // and the `.world` file carries it (MAPS.md §2). Clicking it opens the grid.
    fieldMapPlacementsArg('PLACEMENTS'),
  ],
  previousStatement: true,
  nextStatement: true,
  // `builderWorld` rather than `worldContext`: it subsumes it here. Anywhere
  // `world` is unbound this also warns, and it additionally catches `world`
  // being bound to the LIVE world, which has no `define` or `loadMap` at all.
  // Both would be two warnings saying one thing.
  extensions: [actorOptionsExtension, builderWorldExtension],
  style: 'behavior_blocks',
  tooltip:
    'Place several actors of one kind, arranged on the map. Their positions ' +
    'and properties are part of this world.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      const placements =
        (block.getFieldValue('PLACEMENTS') as MapPlacement[] | null) ?? [];
      // Nothing arranged yet is nothing to place — and a `define actor` that
      // has since been deleted leaves a block naming nothing (localActors).
      const local = localActorFor(block, actor);
      if (
        !actor ||
        !placements.length ||
        (localActorBlockId(actor) && !local)
      ) {
        return '';
      }
      const template = local ? local.variable : importVar(actor);
      const type = local ? local.type : actor;
      if (!local) {
        addImport(
          generator,
          `mod:${actor}`,
          `import ${importVar(actor)} from ${str(actor)};`,
        );
      }
      // Through `loadMap`, which already resolves each entry's overrides
      // against the world's property registry and stamps the actor's type.
      const actors = placements
        .map(placement =>
          JSON.stringify({
            type,
            id: instanceId(block.id, placement.id),
            ...(placement.properties ? {properties: placement.properties} : {}),
          }),
        )
        .join(', ');
      return (
        `world.define(${str(type)}, ${template});\n` +
        `world.loadMap({actors: [${actors}]}, ${str(layerOf(block))});\n`
      );
    },
  },
});

const worldLoadMap = defineBlock({
  type: 'world_load_map',
  message0: 'load map %1',
  args0: [{type: 'field_dropdown', name: 'MAP', options: mapOptions}],
  previousStatement: true,
  nextStatement: true,
  // Builder-only for the same reason as its siblings: `define` and `loadMap`
  // are `WorldBuilder`'s and the live `World` has neither.
  extensions: [mapOptionsExtension, builderWorldExtension],
  style: 'setup_blocks',
  tooltip: 'Place all the actors a map file describes into the world.',
  generator: {
    javascript(block, generator) {
      const map = block.getFieldValue('MAP');
      // A map places instances of actor templates (`world.loadMap`), so each
      // referenced template is imported and registered first. The generator
      // reads the map's actor modules from the live project registry.
      const defines = mapActorTypes(map)
        .map(type => {
          addImport(
            generator,
            `mod:${type}`,
            `import ${importVar(type)} from ${str(type)};`,
          );
          return `world.define(${str(type)}, ${importVar(type)});\n`;
        })
        .join('');
      addImport(
        generator,
        `map:${map}`,
        `import ${importVar(map)} from ${str(map)};`,
      );
      return `${defines}world.loadMap(${importVar(map)}, ${str(layerOf(block))});\n`;
    },
  },
});

// ── World composition ────────────────────────────────────────────────────────
// A `.world` file is authored with `world_world` (the root, like `world_actor`)
// and `world_use_rule` / `world_use_animations` / `world_load_map` children —
// the rules in play, the animation files to register, and the actors placed.
// Each body block targets the `const world` the root binds, mirroring the actor
// pattern.

const worldWorld = defineBlock({
  type: 'world_world',
  message0: 'define world named %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'World'}],
  // A definition root: no previous connection, a NEXT connection — the `use
  // rule` / `use animations` body chains below it, not nested in a `do` input.
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'Define a world: the rules in play, and the actors that live in it.',
  generator: {
    javascript(block, generator) {
      const name = block.getFieldValue('NAME');
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      const body = nextChainCode(block, generator);
      // The foundational rules the project HOLDS, in play without being named.
      //
      // The engine seeds its own two (Space and Appearance — `WorldBuilder`),
      // but the keyboard's events are an authored rule now, and noticing a
      // keypress is not a mechanic a game opts into. So a project holding
      // `rules/input.rule` runs it, on the same terms as the `.anim` files
      // below: holding the file is the opting-in. Delete the file and nothing
      // is emitted; name it in a `use rule` as well and it is the same module,
      // so the world has it once.
      const foundation = FOUNDATIONAL_STOCK_RULES.map(rule =>
        ruleLocation(rule.name),
      )
        .filter(located => located?.source === 'project')
        .map(located => {
          const modulePath = (located as {modulePath: string}).modulePath;
          addImport(
            generator,
            `mod:${modulePath}`,
            `import ${importVar(modulePath)} from ${str(modulePath)};`,
          );
          return `world.useRules([${importVar(modulePath)}]);\n`;
        })
        .join('');
      // Every `.anim` in the project, registered. There is no block for this and
      // deliberately so: an animation file is not a thing a world opts into, it
      // is a thing the project HAS — a learner who draws one and plays it should
      // not also have to remember to say the world may use it. The blocks below
      // decide what plays; this decides what exists.
      const animations = animationFileOptions()
        .map(([, modulePath]) => modulePath)
        .filter(modulePath => modulePath)
        .map(modulePath => {
          addImport(
            generator,
            `mod:${modulePath}`,
            `import ${importVar(modulePath)} from ${str(modulePath)};`,
          );
          return `world.useAnimations(WorldLab.parseAnimationFile(${importVar(
            modulePath,
          )}));\n`;
        })
        .join('');
      // Layers, hoisted (blockly/layers). Every `defineLayer` has to precede
      // the first placement — the first placement builds the World, and a
      // layer cannot be spliced into one that exists — so the declarations
      // cannot be emitted where their blocks sit. `layerPlan` reads the body's
      // order and reports the stack, including where the default belongs.
      // Emitted only when the world declares one: a world with no layers says
      // nothing about layers, and the engine supplies the default.
      const plan = layerPlan(block);
      const layers = plan.some(entry => entry.id !== DEFAULT_LAYER_ID)
        ? plan
            .map(entry => `world.defineLayer({id: ${str(entry.id)}});\n`)
            .join('')
        : '';
      return (
        `const world = new WorldLab.WorldBuilder({id: ${str(id_from_name(name))}, name: ${str(
          name,
        )}});\n` +
        foundation +
        animations +
        layers +
        body
      );
    },
  },
});

// The `use rule` dropdown offers the built-in rules AND the project's own rule
// modules (under `rules/`). A built-in's value is its `world-lab` export name; a
// project rule's is its module path — the generator branches on the `/` a path
// carries, importing the module rather than reading `WorldLab`.
//
// Labelled by the rule's ABILITY, not its name: this block says what the world
// has, and "use rule Has Gravity" is the sentence. The category in the toolbox
// says the other half — "Gravity", the thing you open and edit.
const BUILTIN_RULE_OPTIONS: Array<[string, string]> = AUTHORING_RULES.map(
  rule => [rule.ability, rule.name],
);
/**
 * The rules a world (or another rule) may put in play, plus a way to get more.
 *
 * `(import…)` is listed last and copies a stock rule into the project — the
 * same affordance the effect dropdown has, and the only way to reach gravity
 * now that it is not built in. Offered even when the project already has rules:
 * wanting a second one is the normal case.
 */
const useRuleOptions = (field?: FieldDropdown): Array<[string, string]> => {
  const identities = projectRuleIdentities();
  // Not the rule this workspace IS: a rule that uses itself generates a module
  // that imports its own default export, and the project stops before it starts.
  const own = editingRuleFor(field);
  return [
    ...BUILTIN_RULE_OPTIONS,
    ...ruleModuleOptions()
      .filter(([, modulePath]) => modulePath !== own)
      .map(([fileLabel, modulePath]): [string, string] => {
        // A parsed `.rule` says what it is and what it gives, and is referred to
        // by that name from then on, wherever its file ends up. A `.js` rule
        // declares neither, so it is named by its module — as is a `.rule` the
        // editor could not parse, which still has to be pickable mid-edit.
        const identity = identities.get(modulePath);
        return identity
          ? [identity.ability, identity.name]
          : [fileLabel, modulePath];
      }),
    ['(import…)', IMPORT_RULE_VALUE],
  ];
};
const useRuleOptionsExtension = liveDropdown(
  'world_use_rule_options',
  'RULE',
  useRuleOptions,
);

const worldUseRule = defineBlock({
  type: 'world_use_rule',
  message0: 'use rule %1',
  args0: [{type: 'field_dropdown', name: 'RULE', options: useRuleOptions}],
  previousStatement: true,
  nextStatement: true,
  // The import extension AFTER the options one, so it wraps that validator
  // rather than being wrapped by it (see ruleImportField).
  extensions: [
    useRuleOptionsExtension,
    ruleImportFieldExtension,
    openSourceButtonExtension,
  ],
  style: 'behavior_blocks',
  tooltip: 'Put a rule (a game mechanic) in play for this world.',
  generator: {
    javascript(block, generator) {
      const rule = block.getFieldValue('RULE');
      // The field holds a rule's NAME. Where that rule lives is looked up here
      // and nowhere else: a built-in reads `WorldLab`, a project `.rule` is
      // imported from whatever module currently declares that name. A value the
      // registry doesn't know is a module path — a `.js` rule names nothing, so
      // it can only be referred to by its file.
      const located = ruleLocation(rule);
      const modulePath =
        located?.source === 'project'
          ? located.modulePath
          : located
            ? undefined
            : rule;
      if (modulePath) {
        addImport(
          generator,
          `mod:${modulePath}`,
          `import ${importVar(modulePath)} from ${str(modulePath)};`,
        );
        return `world.useRules([${importVar(modulePath)}]);\n`;
      }
      const exportName =
        located?.source === 'builtin' ? located.exportName : rule;
      return `world.useRules([WorldLab.${exportName}]);\n`;
    },
  },
});

// ── Backgrounds (BACKGROUNDS.md) ─────────────────────────────────────────────
// A backdrop is the appearance half of an actor with none of the body: something
// to draw behind everything, a colour behind that, and effects of its own. It is
// not an actor, so these are world blocks with no subject socket — the world is
// the subject, as it is for `add effect … to the world`.
//
// Every one of them means backdrop layer 0. The engine's methods take an
// optional layer index, so parallax later adds blocks that name a layer and
// changes nothing a learner has already built.

// The backdrops a `set background to` block may name: the project's own
// (populated live by the extension), and `(import…)` to copy one in.
const backgroundFieldOptions = (): Array<[string, string]> =>
  backgroundImportOptions();

/** Point a `BACKGROUND` dropdown at the live list (the project's backdrops). */
const backgroundOptionsExtension = liveDropdown(
  'world_background_options',
  'BACKGROUND',
  backgroundFieldOptions,
);

/**
 * The blocks for one of a layer's two image slots, generated.
 *
 * A slot has an image, an offset and a repeat, and there are two slots — six
 * blocks that differ in one word. They were hand-written, and `set foreground`
 * was already a copy of `set background` with the noun changed; a second copy
 * per setting is how a family like this stops agreeing with itself. Generating
 * them is the house idiom rather than a new one: every property, action, query,
 * event and emit block in this file already comes from a factory over metadata.
 *
 * The block TYPES are the names they already had (`world_set_background`), so
 * nothing a learner has saved changes.
 */
/**
 * Engine methods the block FACTORIES generate calls to.
 *
 * Recorded rather than scanned for. A factory emits `world.set${slot.method}
 * Repeat(…)`, and no amount of reading this file's source finds the name
 * `setBackgroundRepeat` in it — which is how a missing `WorldBuilder` method
 * survived the guard that exists to catch exactly that (`builderSurface.test`).
 * The factory is the only thing that knows, so the factory says.
 */
export const GENERATED_WORLD_CALLS: string[] = [];

const defineSlotBlocks = (slot: {
  /** The slot's name, in the block type and in the engine method. */
  id: SlotName;
  /** What it is called in front of a learner. */
  label: string;
  /** `Background` / `Foreground` — the engine's method suffix. */
  method: string;
  /** Where the image is drawn, for the tooltip. */
  where: string;
}) => {
  GENERATED_WORLD_CALLS.push(
    `set${slot.method}`,
    `set${slot.method}Offset`,
    `set${slot.method}Repeat`,
  );

  const setImage = defineBlock({
    type: `world_set_${slot.id}`,
    message0: `set ${slot.label} to %1`,
    args0: [
      {
        type: 'field_dropdown',
        name: 'BACKGROUND',
        options: backgroundFieldOptions,
      },
    ],
    previousStatement: true,
    nextStatement: true,
    // Chained under `define world` it is the image from the start; in a handler
    // or a rule step it changes it mid-game. Both engine objects have the
    // method, so there is no context guard. The options extension first, then
    // the import one, so the latter wraps that validator rather than being
    // wrapped by it (see appearanceImportField).
    extensions: [
      backgroundOptionsExtension,
      worldContextExtension,
      backgroundImportFieldExtension,
    ],
    style: 'sprite_blocks',
    tooltip:
      `Draw an image ${slot.where}, stretched to fill the view. The images ` +
      'are the ones in the project’s backgrounds folder.',
    generator: {
      javascript(block) {
        const name = block.getFieldValue('BACKGROUND');
        // Nothing chosen, or the `(import…)` row still sitting in the field
        // because no editor was there to answer it (the headless generator).
        if (!name || name === IMPORT_BACKGROUND_VALUE) {
          return '';
        }
        // A whole image, never a cell: a backdrop is not a spritesheet, so this
        // field never carries the `name.png#3` a `set sprite` field can.
        return `world.set${slot.method}(${str(name)}, ${str(layerOf(block))});\n`;
      },
    },
  });

  const setOffset = defineBlock({
    type: `world_set_${slot.id}_offset`,
    message0: `slide ${slot.label} to %1`,
    args0: [{type: 'input_value', name: 'OFFSET', check: 'Vector'}],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    extensions: [worldContextExtension, valueShadowExtension],
    style: 'sprite_blocks',
    tooltip:
      `Move the ${slot.label} image, in pixels. Written every tick this is ` +
      'how a sky drifts; pair it with “draw … tiled” or the image slides off ' +
      'its own edge.',
    generator: {
      javascript(block, generator) {
        const offset =
          generator.valueToCode(block, 'OFFSET', Order.NONE) ||
          'new WorldLab.Vector(0, 0)';
        return `world.set${slot.method}Offset(${offset}, ${str(layerOf(block))});\n`;
      },
    },
  });
  registerValueShadows(`world_set_${slot.id}_offset`, [
    {
      name: 'OFFSET',
      shadow: {type: 'world_vector', fields: {VECTOR: {x: 0, y: 0}}},
    },
  ]);

  const setRepeat = defineBlock({
    type: `world_set_${slot.id}_repeat`,
    message0: `draw ${slot.label} %1`,
    args0: [
      {
        type: 'field_dropdown',
        name: 'REPEAT',
        options: [
          ['stretched', 'false'],
          ['tiled', 'true'],
        ],
      },
    ],
    previousStatement: true,
    nextStatement: true,
    extensions: [worldContextExtension],
    style: 'sprite_blocks',
    tooltip:
      'Stretch the image over the whole view, or tile it. Tiled is what a ' +
      'sliding image needs: a stretched one leaves a gap as it moves.',
    generator: {
      javascript(block) {
        const repeat = block.getFieldValue('REPEAT') === 'true';
        return `world.set${slot.method}Repeat(${repeat}, ${str(layerOf(block))});\n`;
      },
    },
  });

  return [setImage, setOffset, setRepeat];
};

/** The two slots, and the six blocks they generate between them. */
const SLOT_BLOCKS = [
  defineSlotBlocks({
    id: 'background',
    label: 'background',
    method: 'Background',
    where: 'behind this layer’s actors',
  }),
  defineSlotBlocks({
    id: 'foreground',
    label: 'foreground',
    method: 'Foreground',
    where: 'in front of this layer’s actors',
  }),
].flat();

/**
 * The add/remove effect pair for one non-actor owner, generated.
 *
 * An effect can land on the world, on a layer's background, or on its
 * foreground, and those six blocks differ in a noun and a method name. They
 * were hand-written, and the background pair was already a copy of the world
 * pair; a foreground pair would have been a third. Generating them is what the
 * rest of this file already does for every property, action, query, event and
 * emit block.
 *
 * THE ACTOR PAIR IS NOT HERE, and that asymmetry is the point rather than an
 * omission: an actor effect must be able to name the coin that was touched, a
 * loop's actor, `any <Coin>` — so it takes a SOCKET, and a socket is a
 * different block. Everything else is singular or named by its layer.
 *
 * The block TYPES are the names they already had, so nothing saved changes.
 */
const defineEffectBlocks = (owner: {
  /** Block type infix: `world_add_<infix>_effect`. */
  infix: string;
  /** What it reads as: "add effect … to THE WORLD". */
  noun: string;
  /** The engine method's middle: `addEffect` / `addBackgroundEffect`. */
  method: string;
  /**
   * Whether the call names a layer.
   *
   * The world's effect covers the whole screen and belongs to no layer; a
   * slot's belongs to the layer the block is written in (blockly/layers).
   */
  layered: boolean;
  /** The tooltip's description of what gets filtered. */
  filters: string;
}) => {
  GENERATED_WORLD_CALLS.push(
    `add${owner.method}Effect`,
    `remove${owner.method}Effect`,
  );

  const add = defineBlock({
    type: `world_add_${owner.infix}_effect`,
    message0: `add effect %1 to ${owner.noun}`,
    args0: [
      {
        type: 'field_dropdown',
        name: 'EFFECT',
        options: effectFileImportOptions,
      },
    ],
    previousStatement: true,
    nextStatement: true,
    mutator: effectParamsMutator,
    // `worldContext` still applies — it asks whether `world` is bound at all —
    // but there is no builder/runtime guard, because `addEffect` and its
    // siblings are on the builder and the live World alike.
    extensions: [
      effectFileImportOptionsExtension,
      worldContextExtension,
      effectParamsInitExtension,
      effectImportFieldExtension,
    ],
    style: 'sprite_blocks',
    tooltip:
      `Play a visual effect on ${owner.filters} (authored in an .effect ` +
      'file). Adding one already playing changes nothing.',
    generator: {
      javascript(block, generator) {
        const path = block.getFieldValue('EFFECT');
        if (!path) {
          return '';
        }
        addImport(
          generator,
          `mod:${path}`,
          `import ${importVar(path)} from ${str(path)};`,
        );
        const values = effectParamValuesCode(block, generator);
        const layer = owner.layered ? `, ${str(layerOf(block))}` : '';
        // `undefined` rather than nothing when a layer follows: the layer is
        // the fourth argument, so the third cannot simply be left off.
        const settings = values || (owner.layered ? 'undefined' : '');
        return `world.add${owner.method}Effect(${str(path)}, ${importVar(path)}${
          settings ? `, ${settings}` : ''
        }${layer});\n`;
      },
    },
  });

  const remove = defineBlock({
    type: `world_remove_${owner.infix}_effect`,
    message0: `remove effect %1 from ${owner.noun}`,
    args0: [
      {type: 'field_dropdown', name: 'EFFECT', options: effectFileOptions},
    ],
    previousStatement: true,
    nextStatement: true,
    // Valid wherever `world` is bound, `define world` included. It used to be
    // guarded there on the grounds that un-declaring something described once
    // has no meaning — true of a builder that accumulated state, false of one
    // that records calls: `add effect` then `remove effect` is a sequence, and
    // replaying it leaves no effect. The actor counterpart is still guarded,
    // because `ActorBuilder` does accumulate.
    extensions: [effectFileOptionsExtension, worldContextExtension],
    style: 'sprite_blocks',
    tooltip: `Stop playing an effect on ${owner.filters}.`,
    generator: {
      javascript(block) {
        const path = block.getFieldValue('EFFECT');
        if (!path) {
          return '';
        }
        // No import: removing needs only the effect's identity, not its graph.
        const layer = owner.layered ? `, ${str(layerOf(block))}` : '';
        return `world.remove${owner.method}Effect(${str(path)}${layer});\n`;
      },
    },
  });

  return [add, remove];
};

/** The three non-actor owners, and the six blocks they generate. */
const EFFECT_OWNER_BLOCKS = [
  defineEffectBlocks({
    infix: 'world',
    noun: 'the world',
    method: '',
    layered: false,
    filters: 'the whole view',
  }),
  defineEffectBlocks({
    infix: 'layer',
    noun: 'this layer',
    method: 'Layer',
    layered: true,
    filters:
      'everything this layer draws — its actors and its images together, ' +
      'leaving the other layers alone',
  }),
  defineEffectBlocks({
    infix: 'background',
    noun: 'the background',
    method: 'Background',
    layered: true,
    filters: 'the background only — the actors in front of it are not affected',
  }),
  defineEffectBlocks({
    infix: 'foreground',
    noun: 'the foreground',
    method: 'Foreground',
    layered: true,
    filters: 'the foreground only — the actors behind it are not affected',
  }),
].flat();

/**
 * Move the camera — where the view is taken from.
 *
 * The whole of what a camera does today. Layers respond to it by their own
 * depth setting, so moving it by (32, 0) scrolls the game a tile, drifts the
 * scenery a fifth of that, and leaves anything fixed to the screen alone.
 *
 * Runtime-shaped but valid anywhere `world` is bound: setting it under
 * `define world` chooses where the view starts, and setting it in a step is how
 * a camera follows a player.
 */
const worldMoveCamera = defineBlock({
  type: 'world_move_camera',
  message0: 'move camera %1 to %2',
  args0: [
    {type: 'field_dropdown', name: 'CAMERA', options: cameraOptions},
    {type: 'input_value', name: 'POSITION', check: 'Vector'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [
    cameraOptionsExtension,
    worldContextExtension,
    valueShadowExtension,
  ],
  style: 'setup_blocks',
  tooltip:
    'Point a camera at a place in the world. Everything moves with it except ' +
    'layers fixed to the screen.',
  generator: {
    javascript(block, generator) {
      const position =
        generator.valueToCode(block, 'POSITION', Order.NONE) ||
        'new WorldLab.Vector(0, 0)';
      const camera = cameraIdFromValue(
        block,
        String(block.getFieldValue('CAMERA') ?? ''),
      );
      return `world.setCameraPosition(${position}, ${str(camera)});\n`;
    },
  },
});

/**
 * Declare a camera — a second place to look from.
 *
 * Not hoisted, unlike `define layer`: a camera is an entry in a list rather
 * than a place in a scene graph, so one can be added to a world that already
 * exists and there is nothing to order. Declaring it before you name it is
 * therefore just reading order, which is how the block chain runs anyway.
 *
 * A world has one without asking. This is for the second: an overview to cut to
 * when the player dies, a fixed shot for a boss room.
 */
const worldDefineCamera = defineBlock({
  type: 'world_define_camera',
  message0: 'define camera %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'Camera'}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'setup_blocks',
  tooltip:
    'A place to look from, and how it behaves. Every world has one already; ' +
    'define another to cut between views. Give it traits to make it follow ' +
    'something.',
  generator: {
    javascript(block, generator) {
      // The traits are COLLECTED here rather than emitted by the `use trait`
      // blocks themselves. An actor's `use trait` calls a builder method, but a
      // camera is made in one call — `defineCamera({…, traits})` — and there is
      // no half-built camera to add to. So the declaration gathers its body,
      // and `use trait` inside a camera generates nothing (see its generator).
      const traits: string[] = [];
      for (
        let member = block.getInputTargetBlock?.('DO') ?? null;
        member;
        member = member.getNextBlock?.() ?? null
      ) {
        if (member.type !== 'world_use_trait') {
          continue;
        }
        const ref = refFromValue(String(member.getFieldValue('TRAIT') ?? ''));
        if (ref) {
          traits.push(refCode(ref, generator));
        }
      }
      const settings = [
        `id: ${str(cameraId(block.id))}`,
        `name: ${str(String(block.getFieldValue('NAME') ?? 'Camera'))}`,
      ];
      if (traits.length) {
        settings.push(`traits: [${traits.join(', ')}]`);
      }
      return `world.defineCamera({${settings.join(', ')}});\n`;
    },
  },
});

/**
 * Take the view through a camera — the cut.
 *
 * Which camera draws is a VALUE rather than structure: it moves a transform and
 * rebuilds nothing, so a game may cut between cameras mid-play without the
 * preview restarting around the learner.
 *
 * This is the default viewport's camera by another name. When viewports arrive
 * a viewport is told which camera to use, and this becomes that for the one
 * viewport every world already has.
 */
const worldUseCamera = defineBlock({
  type: 'world_use_camera',
  message0: 'look through camera %1',
  args0: [{type: 'field_dropdown', name: 'CAMERA', options: cameraOptions}],
  previousStatement: true,
  nextStatement: true,
  extensions: [cameraOptionsExtension, worldContextExtension],
  style: 'setup_blocks',
  tooltip: 'Draw the world through this camera from now on.',
  generator: {
    javascript(block) {
      const camera = cameraIdFromValue(
        block,
        String(block.getFieldValue('CAMERA') ?? ''),
      );
      return `world.setActiveCamera(${str(camera)});\n`;
    },
  },
});
registerValueShadows('world_move_camera', [
  {
    name: 'POSITION',
    shadow: {type: 'world_vector', fields: {VECTOR: {x: 0, y: 0}}},
  },
]);

const worldSetBackgroundColor = defineBlock({
  type: 'world_set_background_color',
  message0: 'set background color to %1',
  args0: [{type: 'input_value', name: 'COLOR', check: COLOUR_CHECK}],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'Set the color behind the background image — and the whole view when ' +
    'there is no background image.',
  generator: {
    javascript(block, generator) {
      const color = generator.valueToCode(block, 'COLOR', Order.NONE);
      if (!color) {
        return '';
      }
      // Handed over as the color block produced it. `setBackgroundColor` takes
      // hex or floats (engine color.ts), so a `colour_picker`, a blend and the
      // `r g b a` block all arrive intact — converting here would quantize the
      // floats and throw away an alpha the picker cannot express anyway.
      return `world.setBackgroundColor(${color});\n`;
    },
  },
});
registerValueShadows('world_set_background_color', [
  {
    name: 'COLOR',
    // The colour a world starts with, so the swatch opens on what is on screen
    // rather than on Blockly's red.
    shadow: {type: 'colour_picker', fields: {COLOUR: DEFAULT_BACKDROP_COLOR}},
  },
]);

/**
 * The domain blocks — pass to a workspace/provider `blocks` prop. The standard
 * Blockly blocks the toolbox also offers (controls_if, logic_compare,
 * math_number, text, …) are NOT listed here: importing `@code-dot-org/blockly`
 * already registers them (and their JavaScript generators) natively, and
 * re-registering them through the design-system Driver drops their statement
 * connections. The toolbox references them by type; the workspace resolves them
 * from the native registry.
 */
// ── Rule authoring (`.rule` files) ───────────────────────────────────────────
// A `.rule` is a Blockly workspace declaring a rule's metadata: a `define rule`
// root chaining `define property`/`define trait` blocks; a `define trait` nests
// its own `define property`/`define event` in a `do` input. A property is a
// WORLD property at the rule level and an ACTOR property inside a trait — the
// same block, scope by nesting. Ids are derived from the NAME (slug + PascalCase
// export). These blocks are read STATICALLY — parsed into `RuleMeta` for the
// editor and into a `RuleBuilder` module for the runtime (ruleMeta.ts) — so they
// carry no JavaScript generator of their own (a `.rule` never hits `blockToCode`).
const noGenerator = {javascript: () => ''};

const PROPERTY_TYPE_OPTIONS: Array<[string, string]> = [
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['string', 'string'],
  ['vector', 'vector'],
  ['point', 'point'],
  // Actors — what a rule works out about who is where: a contact set, a group.
  // Read-only in practice (the rule that fills it owns it) and never carried
  // across a hot reload (specs/COLLISION.md).
  ['actors', 'actors'],
];

// A query reports one value; `point` (two scalars) isn't a single report, so it
// is omitted — a whole `vector` covers 2D.
const QUERY_RETURN_TYPE_OPTIONS: Array<[string, string]> = [
  ['number', 'number'],
  ['boolean', 'boolean'],
  ['string', 'string'],
  ['vector', 'vector'],
];

const worldRule = defineBlock({
  type: 'world_rule',
  // Two names, because a rule reads two ways round. NAME is what it IS
  // ("Gravity") — its toolbox category, and how everything refers to it. ABILITY
  // is what using it GIVES a world ("Has Gravity"), which is what `use rule`
  // shows, because that block is a sentence about the world.
  message0: 'define rule %1 which adds ability %2',
  args0: [
    {type: 'field_input', name: 'NAME', text: 'My Rule'},
    {type: 'field_input', name: 'ABILITY', text: 'Has My Rule'},
  ],
  // A definition root: no previous connection; its declarations chain below.
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'Define a rule: its world properties, traits, and events.',
  generator: noGenerator,
});

// A trait is a DEFINITION, like the rule itself, so it is a top block: it sits
// beside `define rule` in the workspace rather than chained inside it, and its
// members chain below it the same way the rule's do.
//
// It reads better and it scales. A rule with three traits used to be one tower
// with three `do` mouths nested in it, and every member of every trait was
// indented inside that. Now each trait is its own stack a learner can move,
// collapse and read on its own — which is what they are: separate things an
// actor may take, belonging to one rule.
//
// The rule it belongs to is the one defined in the SAME FILE. A `.rule` declares
// exactly one rule, so there is nothing to disambiguate and nothing to wire up.
const worldRuleTrait = defineBlock({
  type: 'world_rule_trait',
  message0: 'define trait %1 for %2',
  args0: [
    {type: 'field_input', name: 'NAME', text: 'My Trait'},
    // What elects it. A FIELD rather than a second declaration block: the
    // subject is which kind of thing a trait's members belong to, and this
    // project already models that as a member's SCOPE, derived from where it
    // was declared. `world_rule_block` took the same road — one block with a
    // field, rather than one block per kind.
    //
    // Defaults to `actor`, so every trait that exists reads and behaves
    // unchanged, and so does every trait saved before the field existed.
    {
      type: 'field_dropdown',
      name: 'SUBJECT',
      options: [
        ['an actor', 'actor'],
        ['a camera', 'camera'],
      ],
    },
  ],
  // A definition root: no previous connection; its declarations chain below.
  nextStatement: true,
  style: 'setup_blocks',
  tooltip:
    'Define a trait for the rule in this file, and say what takes it. An ' +
    'actor trait is the usual kind; a camera trait is how a camera is told to ' +
    'behave — “follows the player” is one. Its properties, events, actions ' +
    'and queries chain below it.',
  generator: noGenerator,
});

// `WRITABLE` distinguishes a knob from a readout. A property a STEP owns —
// gravity's "falling", which its landing step sets and nothing else may — must
// not grow a `set` block: offering one invites a learner to write a value the
// next tick overwrites, which looks like the block is broken. The engine has
// carried `readonly` since the built-in rules were written; there was simply no
// way to say it in a `.rule`.
const PROPERTY_ACCESS_OPTIONS: Array<[string, string]> = [
  ['property', 'writable'],
  ['read-only property', 'readonly'],
];

const worldRuleProperty = defineBlock({
  type: 'world_rule_property',
  message0: 'define %1 %2 %3 with default %4',
  args0: [
    {type: 'field_dropdown', name: 'TYPE', options: PROPERTY_TYPE_OPTIONS},
    {type: 'field_dropdown', name: 'ACCESS', options: PROPERTY_ACCESS_OPTIONS},
    {type: 'field_input', name: 'NAME', text: 'strength'},
    {type: 'field_input', name: 'DEFAULT', text: '0'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'default',
  tooltip:
    'Define a property — a world property at the rule level, an actor property ' +
    'inside a "define trait". A read-only one can be read but not set, for a ' +
    'value a step owns.',
  generator: noGenerator,
});

const worldRuleEvent = defineBlock({
  type: 'world_rule_event',
  // Designed, like `define block`: the row below is the HAT this event makes,
  // built from the same parts. An event whose phrasing takes a choice —
  // "⟨space⟩ is pressed" — is one a handler can filter on, which is the whole
  // of specs/ENUMS.md.
  message0: 'define event',
  previousStatement: true,
  nextStatement: true,
  mutator: eventDesignerMutator,
  extensions: [blockDesignerInitExtension],
  // A DEFINITION, coloured like the other definitions — `define rule`,
  // `define trait`, `define block`. The event colour belongs to the hat this
  // makes, which the preview row below draws.
  style: 'setup_blocks',
  tooltip:
    'Define an event a rule can raise. The row below is the "when …" block it ' +
    'makes — edit it with the pencil. A choice in it is what a handler filters on.',
  generator: noGenerator,
});

/**
 * `define choices` — a named set of string choices this rule declares
 * (specs/ENUMS.md).
 *
 * A definition ROOT, beside `define trait` and the step hats rather than
 * chained under the rule: its options stack below it, and a rule with three
 * sets of choices reads as three lists rather than one long column.
 *
 * What it buys is at the edit surface. A parameter typed by these choices is a
 * dropdown of them, and an event argument typed by them is a filter. Nothing
 * of it survives into generated code: the value is the string.
 */
const worldRuleEnum = defineBlock({
  type: 'world_rule_enum',
  message0: 'define choices %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'Colors'}],
  nextStatement: true,
  style: 'setup_blocks',
  tooltip:
    'Define a named set of choices. A block input typed by them is a dropdown ' +
    'of these words; an event argument typed by them filters on one.',
  generator: noGenerator,
});

/**
 * One choice. The word IS the value — what a learner reads and what the block
 * emits are the same string, which is what makes a set of choices something
 * they can reason about without a table of translations. (The engine's `Key`
 * differs there, and can: it is naming keys the browser already named.)
 */
const worldRuleEnumOption = defineBlock({
  type: 'world_rule_enum_option',
  message0: 'option %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'red'}],
  previousStatement: true,
  nextStatement: true,
  style: 'text_blocks',
  tooltip: 'One of the choices. The word is the value.',
  generator: noGenerator,
});

// ── The signature mutator's own blocks ───────────────────────────────────────
// These live only inside `define block`'s bubble; they are never in the
// toolbox. The container holds a statement stack, and the stack IS the
// signature, read left-to-right as top-to-bottom: drag a `text` in to add
// wording, drag a type in to add an input, reorder by reordering statements,
// remove by dragging out. The familiar mutator, doing the job a signature
// actually needs.

const SIGNATURE_CONTAINER = 'world_signature';
/** One item block per parameter type, plus the label. Order = flyout order. */
const SIGNATURE_ITEMS: Array<{type: string; label: string; param?: string}> = [
  {type: 'world_signature_text', label: 'text'},
  ...PARAM_TYPE_OPTIONS.map(([label, value]) => ({
    type: `world_signature_${value}`,
    label,
    param: value,
  })),
];

const signatureContainer = defineBlock({
  type: SIGNATURE_CONTAINER,
  message0: 'block %1',
  args0: [{type: 'input_statement', name: 'PARTS'}],
  style: 'setup_blocks',
  tooltip:
    'The block being designed. Stack words and inputs here, in the order they ' +
    'should read.',
  generator: noGenerator,
});

/**
 * The `choice` item: a parameter typed by an ENUM.
 *
 * One item rather than one per enum, because which enum is a FIELD on it. The
 * dropdown is live, so a `define choices` written a minute ago is offered here
 * without the bubble being rebuilt, and an enum that has gone away leaves the
 * name it had rather than silently becoming another one.
 */
const SIGNATURE_CHOICE = 'world_signature_choice';

const enumChoiceOptions = (): Array<[string, string]> => {
  const enums = allEnums();
  return enums.length > 0
    ? enums.map(meta => [`${meta.name} (${meta.owner})`, enumRef(meta)])
    : [['(no choices yet)', '']];
};

const signatureChoice = defineBlock({
  type: SIGNATURE_CHOICE,
  // The enum first, then the name, so the row reads as "a Key called `key`".
  message0: 'choice %1 %2',
  args0: [
    {type: 'field_dropdown', name: 'ENUM', options: enumChoiceOptions()},
    {type: 'field_input', name: 'TEXT', text: 'choice'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [
    liveDropdown('world_signature_choice_options', 'ENUM', enumChoiceOptions),
  ],
  style: 'variable_blocks',
  tooltip:
    'An input the block takes, chosen from a named set of choices. Its name ' +
    'is the variable the body reads.',
  generator: noGenerator,
});

const signatureItems = SIGNATURE_ITEMS.map(item =>
  defineBlock({
    type: item.type,
    // Both carry one text field, named TEXT so the designer reads them the same
    // way: on a label it is the wording, on an input it is the parameter's name.
    // An input's name is the name of the VARIABLE the body reads, so typing here
    // renames it everywhere it is used — which is why it is edited here and not
    // through the preview's variable dropdown.
    message0: item.param ? `${item.label} %1` : 'text %1',
    args0: [
      {
        type: 'field_input',
        name: 'TEXT',
        text: item.param ? item.param : 'word',
      },
    ],
    previousStatement: true,
    nextStatement: true,
    style: item.param ? 'variable_blocks' : 'text_blocks',
    tooltip: item.param
      ? `An input the block takes: a ${item.label}. Its name is the variable ` +
        'the body reads.'
      : 'Wording that appears on the block at this position.',
    generator: noGenerator,
  }),
);

// Blockly clips a text field's DISPLAY at 50 characters (`maxDisplayLength`) —
// enough for a name, not for a sentence. The value was always whole; only the
// reading was cut off, mid-word, with an ellipsis. Any field holding PROSE (a
// note, a block's help) asks for more.
const wideTextExtension = (fieldName: string): Extension =>
  defineExtension(`world_wide_text_${fieldName.toLowerCase()}`, {
    extension() {
      const field = (
        this as unknown as {
          getField: (name: string) => {maxDisplayLength?: number} | null;
        }
      ).getField(fieldName);
      if (field) {
        field.maxDisplayLength = 140;
      }
    },
  });

// The generalized member: one block that defines any block a rule adds.
//
// `RETURNS` says whether it is an action ("does something") or a query, and
// what a query reports — a distinction that was once two separate blocks, made
// by a dropdown instead, because everything else about them is identical.
//
// Its signature lives in the designer mutator (blockDesigner), which renders it
// above the body exactly as the call site will read.
const BLOCK_RETURNS_OPTIONS: Array<[string, string]> = [
  ['does something', 'none'],
  ...QUERY_RETURN_TYPE_OPTIONS.map(
    ([label, value]) => [`reports a ${label}`, value] as [string, string],
  ),
];

const worldRuleBlock = defineBlock({
  type: 'world_rule_block',
  message0: 'define block %1',
  args0: [
    {type: 'field_dropdown', name: 'RETURNS', options: BLOCK_RETURNS_OPTIONS},
  ],
  // The tooltip of the block being DEFINED — the sentence someone reads when
  // they hover it in the toolbox months later, having forgotten what "rest
  // height of" meant. On its own row because it is a sentence: sharing a line
  // with the returns dropdown made both hard to read.
  message1: 'description %1',
  args1: [
    {type: 'field_input', name: 'DESCRIPTION', text: '', spellcheck: true},
  ],
  message2: 'do %1',
  args2: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  mutator: blockDesignerMutator,
  extensions: [blockDesignerInitExtension, wideTextExtension('DESCRIPTION')],
  style: 'setup_blocks',
  tooltip:
    'Define a block this rule adds. The row above "do" is the block itself — ' +
    'edit it with the pencil, and it is what you will see when you use it.',
  generator: noGenerator,
});

// `return` ends a query body with the value it reports. A body block (generated
// via the standard path, not statically), so it carries its own generator. No
// next connection — nothing runs after a return.
const worldReturn = defineBlock({
  type: 'world_return',
  message0: 'return %1',
  args0: [{type: 'input_value', name: 'VALUE'}],
  previousStatement: true,
  style: 'default',
  tooltip: 'Report a value back from the query.',
  generator: {
    javascript(block, generator) {
      const value =
        generator.valueToCode(block, 'VALUE', Order.NONE) || 'undefined';
      return `return ${value};\n`;
    },
  },
});

// ── Steps: per-tick behavior ─────────────────────────────────────────────────
// A `define step` runs its `do` body every tick, with `world` bound (it acts on
// the world) and the frame `delta` available (`step delta`). Ordering (the ORDER
// dropdown + STEP anchor) places it relative to another rule's step — the whole
// point for physics: gravity's step runs BEFORE Motion integrates. Read
// statically for its ordering + as an anchor target; its body is generated like
// an action's (so it carries no generator here).

// A step is a per-tick EVENT the rule handles, so it is an event hat: a top
// block with its body chained below, like `when this actor …` in an actor file.
//
// Three blocks rather than one with an order dropdown. The ordering is not a
// setting on a step, it is what KIND of step it is — "run before Motion moves
// things" and "run every tick, whenever" are different statements about when
// behaviour happens, and a dropdown that changes whether a second dropdown is
// even meaningful (which is what the old block needed `stepOrder` for, to hide
// the anchor when unordered) is a shape hiding two blocks in one.
//
// `before Motion ▸ reposition do applyVelocity` reads as the sentence it is.

/** The shared shape: a name, a body chained below, no previous connection. */
const stepBlock = (
  type: string,
  message0: string,
  args0: BlockArgDefinition[],
  tooltip: string,
  extensions: Extension[] = [],
) =>
  defineBlock({
    type,
    message0,
    args0,
    // A definition root, like `define rule` and `define trait`: its body chains
    // below rather than nesting in a `do` mouth.
    nextStatement: true,
    extensions,
    style: 'event_blocks',
    tooltip,
    generator: noGenerator,
  });

const nameArg: BlockArgDefinition = {
  type: 'field_input',
  name: 'NAME',
  text: 'each tick',
};
const anchorArg: BlockArgDefinition = {
  type: 'field_dropdown',
  name: 'STEP',
  options: stepOptions,
};

const worldRuleStepBefore = stepBlock(
  'world_rule_step_before',
  'before %1 do %2',
  [anchorArg, nameArg],
  'Run this every tick, before another rule’s step — gravity adds to velocity ' +
    'before Motion turns velocity into movement.',
  [stepOptionsExtension],
);

const worldRuleStepAfter = stepBlock(
  'world_rule_step_after',
  'after %1 do %2',
  [anchorArg, nameArg],
  'Run this every tick, after another rule’s step — landing happens after ' +
    'Collision has pushed things out of walls.',
  [stepOptionsExtension],
);

// Naming the MOMENT rather than a neighbour. What the other three cannot say:
// gravity is a force, and saying so should not require knowing that Physics
// exists (engine/core/phases). Rule-level, so it is offered every moment —
// the work that fits no single actor lives here.
const worldRuleStepIn = stepBlock(
  'world_rule_step_in',
  'in %1 do %2',
  [{type: 'field_dropdown', name: 'PHASE', options: phaseOptions}, nameArg],
  'Run this every tick, in a named part of the frame — “this is a force”, ' +
    'rather than “this runs before that other rule’s step”.',
  [phaseOptionsExtension],
);

// A step that belongs to a TRAIT, chained under `define trait` beside the
// properties, because that is where every other member of a trait is declared.
//
// Two things follow from the position, and neither has to be typed. The body
// runs once per subject that HAS the trait, with that subject bound — the
// `for each … where has trait ⟨mine⟩` that four of the seven stock steps open
// by writing out. And the subject narrows the phase list, so a camera trait is
// offered the camera's moments and an actor trait the actor's.
//
// A mouth rather than a chained body, unlike the hats: a trait's members chain
// through `next`, so the body needs somewhere else to be. `define block` has
// the same shape for the same reason.
const worldTraitStep = defineBlock({
  type: 'world_trait_step',
  message0: 'each frame in %1 do %2',
  args0: [
    {type: 'field_dropdown', name: 'PHASE', options: phaseOptions},
    {type: 'field_input', name: 'NAME', text: 'do something'},
  ],
  message1: '%1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [phaseOptionsExtension],
  style: 'event_blocks',
  tooltip:
    'Run this every tick for each thing that has this trait, in a named part ' +
    'of the frame. The thing itself is what the blocks inside act on.',
  generator: noGenerator,
});

const worldRuleStepTick = stepBlock(
  'world_rule_step_tick',
  'when tick do %1',
  [nameArg],
  'Run this every tick, in no particular order relative to other rules.',
);

const worldStepDelta = defineBlock({
  type: 'world_step_delta',
  message0: 'delta',
  output: 'Number',
  style: 'variable_blocks',
  tooltip:
    'The time since the last frame, in seconds — usable inside a “define step”.',
  generator: {
    javascript() {
      return ['delta', Order.ATOMIC] as [string, number];
    },
  },
});

// `key <key>` — a key's name as a value, so a comparison against `event value`
// reads as a key rather than as the string ' ' (which is what space is).
const worldKey = defineBlock({
  type: 'world_key',
  message0: 'key %1',
  args0: [{type: 'field_dropdown', name: 'KEY', options: keyOptions()}],
  output: 'String',
  style: 'text_blocks',
  tooltip: 'The name of a key, as the keyboard reports it.',
  generator: {
    javascript(block) {
      return [str(block.getFieldValue('KEY')), Order.ATOMIC] as [
        string,
        number,
      ];
    },
  },
});

// `for each newly pressed/released key <k> do …` — the frame boundary, which is
// the one thing about the keyboard a rule cannot work out for itself: the World
// knows which keys went down or came up SINCE THE LAST TICK, and a rule holding
// only "is it down now?" cannot tell a press from a hold.
//
// A loop rather than a list value because the lab has no list type; iterating is
// the only thing anyone does with these anyway.
const KEY_EDGES: Array<[string, string]> = [
  ['newly pressed', 'PRESSED'],
  ['newly released', 'RELEASED'],
];
const KEY_EDGE_METHODS: Record<string, string> = {
  PRESSED: 'newlyPressedKeys',
  RELEASED: 'newlyReleasedKeys',
};
const worldForEachKey = defineBlock({
  type: 'world_for_each_key',
  message0: 'for each %1 key %2',
  args0: [
    {type: 'field_dropdown', name: 'EDGE', options: KEY_EDGES},
    paramFlavour('string').field('VAR'),
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'loop_blocks',
  tooltip:
    'Run the blocks once for each key that went down (or came up) since the ' +
    'last frame. Bind the loop variable to read which key it was.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const edge = KEY_EDGE_METHODS[block.getFieldValue('EDGE') ?? 'PRESSED'];
      const body = generator.statementToCode(block, 'DO');
      return `for (const ${variable} of world.${edge}()) {\n${body}}\n`;
    },
  },
});

// `note …` — a comment, as a block.
//
// Blockly can attach a comment to a block through its context menu, which is
// where a note ABOUT one block belongs. This is for the other kind: a line of
// explanation in the flow of a body, sitting where the thing it explains
// happens. A rule's arithmetic is where a learner meets a lot of this maths for
// the first time, and "half my height plus half the ground's height" is worth
// saying next to the blocks that say it in symbols.
//
// It generates a `//` comment, so the note survives into the code the project
// runs — the same sentence in both places, rather than a note that exists only
// in the editor.
const worldComment = defineBlock({
  type: 'world_comment',
  message0: 'note %1',
  args0: [
    {
      type: 'field_input',
      name: 'TEXT',
      text: 'what this does',
      spellcheck: true,
    },
  ],
  previousStatement: true,
  nextStatement: true,
  extensions: [wideTextExtension('TEXT')],
  style: 'comment_blocks',
  tooltip:
    'A note for whoever reads this next — it changes nothing about what runs.',
  generator: {
    javascript(block) {
      // One line, whatever was typed: a note that broke across lines would
      // comment out only its first one.
      const text = String(block.getFieldValue('TEXT') ?? '').replace(
        /[\r\n]+/g,
        ' ',
      );
      return `// ${text}\n`;
    },
  },
});

// `pixels per unit` — the scale between a rate and a position.
//
// Speeds are in units per second and positions are in pixels (engine/core/units),
// so anything turning one into the other multiplies by this. That used to be a
// constant buried in the engine, back when the only code that converted was the
// engine's own Motion rule; moving belongs to `rules/stock/motion` now, so the
// number it needs has to be reachable — but as a FACT about the coordinate
// system the renderer draws in, not as a knob any one rule owns.
const worldPixelsPerUnit = defineBlock({
  type: 'world_pixels_per_unit',
  message0: 'pixels per unit',
  output: 'Number',
  style: 'math_blocks',
  tooltip:
    'How many pixels one unit of speed covers — the number that turns a speed ' +
    'into a distance.',
  generator: {
    javascript() {
      return ['WorldLab.PIXELS_PER_UNIT', Order.MEMBER] as [string, number];
    },
  },
});

// `key <key> is down` — the polling side of input, which the engine has always
// had (`World.isKeyDown`) and the palette never offered: only the edge-triggered
// event hats ("when this actor presses space") were reachable from blocks, so a
// rule that wanted "while held" — which is what walking is — could not be
// written. The dropdown is the same key list the event hats use.
const worldIsKeyDown = defineBlock({
  type: 'world_is_key_down',
  message0: 'key %1 is down',
  args0: [{type: 'field_dropdown', name: 'KEY', options: keyOptions()}],
  output: 'Boolean',
  extensions: [worldContextExtension],
  style: 'logic_blocks',
  tooltip:
    'True while the key is held (and the game has focus). For a one-shot ' +
    'reaction to a press, use the “when … presses key” event instead.',
  generator: {
    javascript(block) {
      const key = block.getFieldValue('KEY');
      return [`world.isKeyDown(${str(key)})`, Order.FUNCTION_CALL] as [
        string,
        number,
      ];
    },
  },
});

// `<actor> has trait <trait>` — a boolean predicate, so a step's `for each actor
// where …` can select actors by trait (mirroring the engine's
// `world.actors.with(Trait)`). The TRAIT dropdown reuses the traits in play.
const worldHasTrait = defineBlock({
  type: 'world_has_trait',
  message0: '%1 has trait %2',
  args0: [
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    // EVERY trait, not just an actor's. What is plugged into the socket decides
    // the subject, and that cannot be read at edit time — a camera's value is
    // Actor-typed on purpose, so a `for each actor` over `all cameras` is
    // indistinguishable from one over actors. Narrowing this by where the block
    // sits hid every camera trait from the one loop that needed them.
    {type: 'field_dropdown', name: 'TRAIT', options: anyTraitOptions},
  ],
  inputsInline: true,
  output: 'Boolean',
  extensions: [actorInputExtension, anyTraitOptionsExtension],
  style: 'logic_blocks',
  tooltip:
    'Whether an actor — or a camera — has a given trait. Every trait in play ' +
    'is offered, because what you ask about is whatever you plug in.',
  generator: {
    javascript(block, generator) {
      const target = actorTarget(block, generator, Order.MEMBER);
      const ref = refFromValue(block.getFieldValue('TRAIT'));
      return [
        `${oneActor(target)}.has(${refCode(ref, generator)})`,
        Order.MEMBER,
      ] as [string, number];
    },
  },
});

export const DOMAIN_BLOCKS = [
  worldActor,
  worldUseTrait,
  worldAddEffect,
  worldRemoveEffect,
  ...EFFECT_OWNER_BLOCKS,
  ...SLOT_BLOCKS,
  worldSetBackgroundColor,
  worldSetPosition,
  worldSetSprite,
  worldPlayAnimation,
  ...PROPERTY_BLOCKS,
  ...ACTION_BLOCKS,
  ...QUERY_BLOCKS,
  ...EVENT_BLOCKS,
  ...EMIT_BLOCKS,
  worldLog,
  worldPrint,
  worldEventValue,
  worldVector,
  worldVectorMath,
  worldVectorRotate,
  worldVectorOf,
  worldSlider,
  worldRgba,
  worldVectorComponent,
  worldThisActor,
  worldActorKind,
  ActorVariable.getterBlock,
  worldAllActors,
  worldCameraValue,
  worldAllCameras,
  worldPushActor,
  worldClearActors,
  worldCountActors,
  worldAnyActors,
  worldAllActorsInLayer,
  worldIsInLayer,
  worldIsInActors,
  worldForEach,
  worldFirstWhere,
  worldIsA,
  worldDefineLayer,
  worldLayerParallax,
  worldLayerFixed,
  worldWithinLayer,
  worldDefineCamera,
  worldUseCamera,
  worldMoveCamera,
  worldAddActor,
  worldRemoveActor,
  worldClearWorld,
  worldCreateInMap,
  worldLoadMap,
  worldWorld,
  worldUseRule,
  worldRule,
  worldRuleTrait,
  worldRuleProperty,
  worldRuleEvent,
  worldRuleBlock,
  worldRuleEnum,
  worldRuleEnumOption,
  signatureContainer,
  ...signatureItems,
  signatureChoice,
  worldReturn,
  worldRuleStepBefore,
  worldRuleStepAfter,
  worldRuleStepIn,
  worldTraitStep,
  worldRuleStepTick,
  worldKey,
  worldForEachKey,
  worldComment,
  worldPixelsPerUnit,
  worldStepDelta,
  worldIsKeyDown,
  worldHasTrait,
  ...PARAM_GETTER_BLOCKS,
  ...PARAM_SETTER_BLOCKS,
  // One dropdown chip per engine enum. Not in any toolbox category: it is what
  // an enum-typed socket wears, not something to go looking for.
  ...ENUM_VALUE_BLOCKS,
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
 * The toolbox for the Blockly editor. Structural categories (Actor, World)
 * come first, then one category per rule (in dependency order) holding
 * that rule's blocks, generated property setters, and events, then the
 * general-purpose blocks (Console output, Logic, Math, Text).
 */
// The toolbox in three segments so the per-project builder can splice project
// rule categories between the built-in rule categories and the general blocks.
const TOOLBOX_HEAD: ToolboxCategory[] = [
  {
    name: 'Actor',
    blocks: [
      'world_actor',
      'world_use_trait',
      // One block plays an effect on an actor, in a template or at runtime;
      // `remove` is runtime-only (there is nothing to un-declare).
      'world_add_effect',
      'world_remove_effect',
      'world_this_actor',
      // The 'any of this kind' counterpart, for a world file naming several.
      'world_actor_kind',
      'world_all_actors',
      // Building a group up, and asking about one.
      'world_push_actor',
      'world_clear_actors',
      'world_count_actors',
      'world_any_actors',
      'world_is_in_actors',
      // Narrowing to a layer: the list, and the question (specs/VIEWPORT.md).
      'world_all_actors_in_layer',
      'world_is_in_layer',
      ActorVariable.getterType,
      'world_is_a',
    ],
  },
  {
    name: 'World',
    blocks: [
      'world_world',
      'world_use_rule',
      // Placing actors: from a map file, or one at a time.
      'world_load_map',
      'world_add_actor',
      // Grouping what is placed, and what draws in front of what.
      'world_define_layer',
      // The opt-in to parallax, and the separate question of whether the
      // layer looks at the camera at all.
      'world_layer_parallax',
      'world_layer_fixed',
      'world_within_layer',
      // Where the view is taken from; layers respond by their own parallax.
      'world_define_camera',
      'world_use_camera',
      'world_move_camera',
      // One camera by name, for a world wiring one up; and all of them, which
      // is the only way a RULE can reach a camera — a dropdown cannot say
      // "whichever cameras have this trait".
      'world_camera',
      'world_all_cameras',
      // …and taking one back out again, while the game runs — or all of them.
      'world_remove_actor',
      'world_clear_world',
      // Here as well as in Actor, because this is the category a world file is
      // built from and `any ⟨Coin⟩` is what its blocks take as a subject. It is
      // also how "remove every coin" is written: `remove actor` over a value
      // holding several broadcasts, so the two blocks together are the bulk
      // operation, and no third block has to exist to say it.
      'world_actor_kind',
      // Many of one kind, arranged on a map that lives in this world (MAPS.md).
      'world_create_in_map',
      'world_add_world_effect',
      'world_remove_world_effect',
      // What is behind everything: an image, a colour, and effects on that
      // image alone (BACKGROUNDS.md).
      'world_set_background',
      'world_set_background_offset',
      'world_set_background_repeat',
      'world_set_foreground',
      'world_set_foreground_offset',
      'world_set_foreground_repeat',
      'world_set_background_color',
      'world_add_background_effect',
      'world_remove_background_effect',
      'world_add_foreground_effect',
      'world_remove_foreground_effect',
      // The scope between a slot's and the world's: blur the game, leave the
      // score sharp (specs/VIEWPORT.md).
      'world_add_layer_effect',
      'world_remove_layer_effect',
    ],
  },
  {
    name: 'Rule',
    blocks: [
      'world_rule',
      'world_use_rule', // a rule's dependencies (requires)
      'world_rule_trait', // a second definition root, beside the rule
      'world_use_trait', // a trait's dependencies (requires), under a trait
      'world_rule_property',
      'world_rule_event',
      'world_rule_enum', // a named set of choices, its options chained below
      'world_rule_enum_option',
      'world_rule_block', // the generalized member: design the block it adds
      'world_return', // ends a query's body
      // Per-tick behaviour, one block per kind of ordering.
      'world_rule_step_tick',
      'world_rule_step_in',
      'world_trait_step',
      'world_rule_step_before',
      'world_rule_step_after',
      'world_step_delta', // the frame time, inside a step
      // Reading and writing a variable lives in Variables (below), not here: a
      // rule's parameters are variables like any other, and a body wanting a
      // local is not a fact about rules.
    ],
  },
];
const BUILTIN_RULE_CATEGORIES: ToolboxCategory[] = AUTHORING_RULES.map(
  ruleCategory,
).filter(category => category.blocks.length > 0);
/**
 * Blocks that reach into the engine, offered ONLY while editing a `.rule`.
 *
 * These are the primitives a rule needs to do what the engine used to do for it,
 * and that nothing else has any business with: the keyboard's frame boundary is
 * how the input rule turns held keys into press and release events, and a
 * `.world` or `.actor` that reached for it would be writing a rule in the wrong
 * file. Keeping them out of the everyday palette is also what lets the everyday
 * palette stay short.
 *
 * They are always REGISTERED (a file that uses one has to load anywhere); this
 * is only about what the toolbox lists.
 */
const ENGINE_CATEGORY: ToolboxCategory = {
  name: 'Engine',
  blocks: [
    'world_is_key_down', // the polling side: "while held"
    'world_for_each_key', // the edges: what went down or came up this frame
    'world_key', // a key's name, for comparing against an event's value
    'world_pixels_per_unit', // the scale between a speed and a distance
  ],
};

const TOOLBOX_TAIL: ToolboxCategory[] = [
  // The loop, and the same question asked for one answer instead of a body.
  {name: 'Loops', blocks: ['world_for_each', 'world_first_where']},
  {name: 'Console', blocks: ['world_log', 'world_print', 'world_event_value']},
  {
    name: 'Logic',
    blocks: [
      'controls_if',
      'logic_compare',
      'logic_operation',
      'logic_negate',
      'logic_boolean',
      'world_has_trait', // whether an actor has a trait
      // …and whether there is an actor to ask about at all, which is how a
      // program tests a search that may have matched nothing.
      'world_any_actors',
    ],
  },
  {
    name: 'Math',
    blocks: [
      'math_number',
      'math_arithmetic',
      'math_modulo',
      // Absolute value and friends — `abs` is what a distance test needs.
      'math_single',
      'world_vector',
      'world_vector_of',
      'world_vector_math',
      'world_vector_rotate',
      'world_vector_component',
    ],
  },
  // Color values, beside Math because that is what they are. The picker is
  // what an effect's color socket already holds; `world_rgba` is the way past
  // it, and `colour_random`/`colour_blend` fit the same socket.
  {
    name: 'Color',
    blocks: ['colour_picker', 'world_rgba', 'colour_random', 'colour_blend'],
  },
  // A note block sits with Text: it is words, and it is the one block here that
  // a learner writes for another person rather than for the machine.
  {name: 'Text', blocks: ['text', 'world_comment']},
  // Variables last, as Blockly's own toolboxes have them. A rule's parameters
  // are declared in `define block`'s signature, so there is no block for
  // declaring one — these read and write whatever is in scope, whether that is a
  // parameter, a `for each` loop's variable, or a local a body made for itself.
  {name: 'Variables', blocks: [...PARAM_VARIABLE_TYPES]},
];

/** The toolbox as a `.rule` sees it: everything, plus the Engine category. */
const withEngine = (categories: ToolboxCategory[]): ToolboxCategory[] => [
  ...categories,
  ENGINE_CATEGORY,
];

const DOMAIN_CATEGORIES: ToolboxCategory[] = [
  ...TOOLBOX_HEAD,
  ...BUILTIN_RULE_CATEGORIES,
  ...TOOLBOX_TAIL,
];

export const DOMAIN_TOOLBOX: Toolbox = DOMAIN_CATEGORIES;

// ── Per-project rule palette ─────────────────────────────────────────────────
// Generate the blocks + toolbox category for a set of rules — the project's own
// `.rule` rules (their `RuleMeta`). Reuses the same generators as the built-ins
// (which are generated once above); a project member's block type is namespaced
// (`memberKey`) and its codegen imports from the rule's module (`refCode`), so a
// project rule contributes set/get/action/query/event blocks exactly like a
// built-in. `buildDomainPalette` splices these onto the built-in palette; the
// editor and headless generator call it with the current project's rules.

type DomainBlock = (typeof DOMAIN_BLOCKS)[number];

/** `ownRuleModule` sentinel meaning "every rule is its own" (see `allRuleModules`). */
const ALL_RULE_MODULES = '\u0000all';

function generateRulePalette(
  rules: readonly RuleMeta[],
  ownRuleModule?: string,
  /**
   * Whether to LIST the `emit` blocks in each rule's category.
   *
   * Raising an event is a rule-authoring act: an event is a rule's own
   * vocabulary, and the code that decides the moment it happened is the rule's
   * — gravity is what knows a fall started. An `.actor` or a `.world` firing
   * one is announcing something it is not the authority on, and every listener
   * then believes it. So the blocks are offered while a `.rule` is being
   * edited, and nowhere else.
   *
   * Only about the TOOLBOX. The blocks are registered whatever this says (see
   * the loop below), because a file that already holds one has to keep loading
   * and generating — a palette that could not define it would take the whole
   * project down rather than the one block.
   */
  offerEmits = false,
): {
  blocks: DomainBlock[];
  categories: ToolboxCategory[];
  eventTypes: string[];
} {
  const blocks: DomainBlock[] = [];
  const categories: ToolboxCategory[] = [];
  const eventTypes: string[] = [];
  // Chips already built, by reference. Two `define choices` naming one set
  // produce one reference and would produce one block type twice — and
  // registering a type twice does not fail, it silently replaces
  // (`Driver.registerBlocks`). The duplicate is reported elsewhere
  // (duplicateEnumNames); here it simply does not get a second block.
  const chipped = new Set<string>();
  for (const rule of rules) {
    const propTypes: string[] = [];
    const queryTypes: string[] = [];
    const actionTypes: string[] = [];
    const ruleEventTypes: string[] = [];
    for (const property of rule.properties) {
      // A rule's own read-only property IS settable inside that rule's own
      // file. "Read-only" means the declaring rule owns the value, not that
      // nothing may write it — gravity's landing step is what sets `falling`,
      // and the built-in does exactly that. Outside its own `.rule` the setter
      // stays absent, which is the guarantee the flag is for.
      const ownProperty =
        ownRuleModule === ALL_RULE_MODULES ||
        (ownRuleModule !== undefined &&
          refModule(property.ref) === ownRuleModule);
      if (
        isSettable(property) ||
        (ownProperty && !isSettable(property) && property.readonly)
      ) {
        const setBlock = defineSetPropertyBlock(property);
        blocks.push(setBlock);
        propTypes.push(setBlock.type);
      }
      if (isGettable(property)) {
        const getBlock = defineGetPropertyBlock(property);
        blocks.push(getBlock);
        propTypes.push(getBlock.type);
      }
    }
    for (const query of rule.queries) {
      if (!query.returns || query.ref.exportName === '') {
        continue;
      }
      const block = defineQueryBlock(query);
      blocks.push(block);
      queryTypes.push(block.type);
    }
    for (const action of rule.actions) {
      if (action.ref.exportName === '') {
        continue;
      }
      const block = defineActionBlock(action);
      blocks.push(block);
      actionTypes.push(block.type);
    }
    for (const event of rule.events) {
      const block = defineEventBlock(event);
      blocks.push(block);
      ruleEventTypes.push(block.type);
      eventTypes.push(block.type);
      // The block that raises it, next to the one that hears it — but only in
      // the palette of a `.rule`. Defined either way: an `.actor` that already
      // has one still has to load and generate.
      const emit = defineEmitBlock(event);
      blocks.push(emit);
      if (offerEmits) {
        ruleEventTypes.push(emit.type);
      }
    }
    // A chip per set of choices this rule declares — the block an enum-typed
    // socket wears, and the only way to name one of the choices anywhere else
    // (a comparison, a variable). The engine's `Key` has `world_key` for that
    // and so is not listed; a rule's own has nothing but this.
    const choiceTypes: string[] = [];
    for (const meta of rule.enums) {
      const ref = enumRef(meta);
      if (chipped.has(ref)) {
        continue;
      }
      chipped.add(ref);
      const block = defineEnumValueBlock(meta);
      blocks.push(block);
      choiceTypes.push(block.type);
    }
    const categoryBlocks = [
      ...propTypes,
      ...queryTypes,
      ...actionTypes,
      ...ruleEventTypes,
      ...choiceTypes,
    ];
    if (categoryBlocks.length > 0) {
      categories.push({name: rule.name, blocks: categoryBlocks});
    }
  }
  return {blocks, categories, eventTypes};
}

/**
 * The block palette for a project: the built-in blocks/toolbox/root-types
 * extended with the project's own `.rule` rules. With no project rules it is the
 * static built-in palette. Callers (BlocklyFileEditor, BlocklyGenerator) pass the
 * project's parsed rule `RuleMeta`.
 */
export function buildDomainPalette(
  projectRules: readonly RuleMeta[],
  options: {
    /**
     * The module path of the `.rule` being edited, when one is. Its own
     * read-only properties get `set` blocks here and nowhere else.
     */
    ownRuleModule?: string;
    /**
     * Define EVERY rule's read-only setters, whichever rule is being written.
     *
     * For the headless generator, which turns all of a project's Blockly files
     * into code with one palette and so cannot scope per file. Its palette is
     * never shown, so an extra block there costs nothing — where its ABSENCE is
     * fatal: a `.rule` that legitimately sets its own read-only property fails
     * to generate at all ("Invalid block definition for type
     * world_set_…FallingProperty"), and the whole project stops compiling.
     */
    allRuleModules?: boolean;
  } = {},
): {
  blocks: DomainBlock[];
  toolbox: Toolbox;
  rootTypes: ReadonlySet<string>;
} {
  // Here rather than at module scope: `Blockly.Msg` is not safe to write until
  // Blockly's own locale has loaded, and touching it during module evaluation
  // takes the workspace down with "Cannot read properties of undefined". This
  // runs once per editor mount, before the palette reaches a workspace.
  installColorMessages();
  const editingRule = options.ownRuleModule !== undefined;
  if (projectRules.length === 0) {
    return {
      blocks: DOMAIN_BLOCKS,
      toolbox: editingRule ? withEngine(DOMAIN_CATEGORIES) : DOMAIN_TOOLBOX,
      rootTypes: ROOT_BLOCK_TYPES,
    };
  }
  const palette = generateRulePalette(
    projectRules,
    options.allRuleModules ? ALL_RULE_MODULES : options.ownRuleModule,
    // `emit` is offered while writing a rule, and to the headless generator,
    // whose palette is never shown and is deliberately everything.
    editingRule || Boolean(options.allRuleModules),
  );
  const toolbox: ToolboxCategory[] = [
    ...TOOLBOX_HEAD,
    ...BUILTIN_RULE_CATEGORIES,
    ...palette.categories,
    ...TOOLBOX_TAIL,
  ];
  return {
    blocks: [...DOMAIN_BLOCKS, ...palette.blocks],
    toolbox: editingRule ? withEngine(toolbox) : toolbox,
    rootTypes: new Set([...ROOT_BLOCK_TYPES, ...palette.eventTypes]),
  };
}
