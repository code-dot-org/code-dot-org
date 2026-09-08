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
import {
  DEFAULT_BACKDROP_COLOR,
  TEXT_ANCHORS,
  type PropertyType,
} from '../engine';
import {DEFAULT_LAYER_ID, type SlotName} from '../engine/core/Layer';
import {FILE_ICONS} from '../fileIcons';
import {VIEWPORT_TILES} from '../runtime/viewport';
import {IMPORT_SOUND_VALUE} from '../sound/soundImport';

import {actorPictureExtension, registerKindFilter} from './actorAbout';
import {SHOW_AS} from './actorIconMeta';
import {ACTOR_ICON_OPTIONS} from './actorIcons';
import {
  actorInputExtension,
  actorSubjectExtension,
  cameraInputExtension,
} from './actorInput';
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
import {editingActorModule, editingRuleFor} from './editingRule';
import {
  allEnums,
  BUTTON_ENUM,
  ENGINE_ENUMS,
  enumOptions,
  enumParamType,
  enumRef,
  enumRefOfParamType,
  enumValueBlockType,
  KEY_ENUM,
  type EnumMeta,
  type ParamType,
} from './enums';
import {actorBlockReportsExtension} from './extensions/actorBlockReports';
import {
  actorContextExtension,
  builderWorldExtension,
  runtimeActorExtension,
  traitContextExtension,
} from './extensions/actorContext';
import {actorImportFieldExtension} from './extensions/actorImportField';
import {
  addActorNameExtension,
  addActorNameMutator,
  namesPlacedActor,
} from './extensions/addActorName';
import {
  animationImportFieldExtension,
  backgroundImportFieldExtension,
  spriteImportFieldExtension,
} from './extensions/appearanceImportField';
import {
  ARGUMENTS_INPUT,
  argumentDefaultExtension,
  DESCRIPTION_ROW,
  blockDesignerInitExtension,
  RETURNS_ROW,
  blockDesignerMutator,
  eventDesignerMutator,
  SIGNATURE_ARGUMENT,
} from './extensions/blockDesigner';
import {bodyButtonExtension} from './extensions/bodyButton';
import {bodySurfaceExtension} from './extensions/bodyOwner';
import {drawingContextExtension} from './extensions/drawingContext';
import {effectImportFieldExtension} from './extensions/effectImportField';
import {
  effectParamsInitExtension,
  effectParamsMutator,
  paramSockets,
  type EffectParamState,
} from './extensions/effectParamsMutator';
import {enhanceButtonExtension} from './extensions/enhanceButton';
import {eventActorToolboxExtension} from './extensions/eventActorToolbox';
import {lessonButtonExtension} from './extensions/lessonButton';
import {missingRuleExtension} from './extensions/missingRule';
import {openSourceButtonExtension} from './extensions/openSourceButton';
import {rgbaPreviewExtension} from './extensions/rgbaPreview';
import {ruleImportFieldExtension} from './extensions/ruleImportField';
import {rulesButtonExtension} from './extensions/rulesButton';
import {sliderRangeMutator} from './extensions/sliderRange';
import {soundImportFieldExtension} from './extensions/soundImportField';
import {spritePickExtension} from './extensions/spritePickField';
import {textNeedsDrawingExtension} from './extensions/textNeedsDrawing';
import {worldContextExtension} from './extensions/worldContext';
import {fieldMapPlacementsArg} from './fields/FieldMapPlacements';
import {FieldMarkdown} from './fields/FieldMarkdown';
import {fieldSliderArg} from './fields/FieldSlider';
import {fieldVectorArg, type VectorValue} from './fields/FieldVector';
import {ROOT_HOMES, type FileKind} from './fileKind';
import {
  DEFAULT_PARALLAX,
  LAYER_FIXED_OPTIONS,
  layerIdFromValue,
  layerOf,
  layerOptions,
  layerOptionsExtension,
  layerPlan,
} from './layers';
import {lessonFlyoutButton} from './lessonFlyoutButton';
import {
  actorIdFromName,
  definesRule,
  definesWorld,
  definingActorRoot,
  localActorBlockId,
  localActorFor,
  localActorVar,
  workspaceOfBlock,
} from './localActors';
import {localizeText} from './localizeBlocks';
import {registerManyActorBlock, yieldsMany} from './manyActors';
import {instanceId, type MapPlacement} from './mapPlacements';
import {
  actorFieldOptions,
  actorParentOptions,
  actorParentOptionsExtension,
  type DropdownOptions,
  actorImportOptionsExtension,
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
  orNone,
  ruleModuleOptions,
  backgroundImportOptions,
  soundImportOptions,
  soundOptionsExtension,
  spriteOptions,
} from './moduleOptions';
import {
  ownPropertyCodeName,
  ownPropertyDeclarationFor,
  type OwnMeta,
} from './ownProperties';
import {phaseOptions, phaseOptionsExtension} from './phaseOptions';
import {
  propertyByKey,
  propertyOptions,
  setKnownProperties,
  writablePropertyOptions,
  type PropertyKind,
} from './propertyOptions';
import {IMPORT_RULE_VALUE} from './ruleImport';
import {designedName, pascal, slug} from './ruleMeta';
import type {
  ActionMeta,
  EventMeta,
  MemberRef,
  MemberScope,
  PropertyMeta,
  QueryMeta,
  RuleMeta,
} from './ruleMeta';
import {
  refFromValue,
  refModule,
  registerMemberBlockType,
  memberLocalName,
  pathSlug,
  refResolves,
  ruleLocation,
} from './ruleRegistry';
import {measuredImages, parseSpriteRef, spriteCell} from './spriteCells';
import {TOOLBOX_HEADING, toolboxHeading} from './toolboxStyle';
import {
  projectRuleIdentities,
  actorTraitOptions,
  actorTraitOptionsExtension,
  anyTraitOptions,
  anyTraitOptionsExtension,
  cameraTraitOptions,
  cameraTraitOptionsExtension,
  traitOptions,
  traitOptionsExtension,
  traitSubjectFor,
} from './traitOptions';
import {
  DEFINE_TWEEN,
  inTweenBody,
  PLAY_TWEEN_HERE,
  tweenStepCode,
  tweenOptions,
  tweenOptionsExtension,
  tweensIn,
  tweenVar,
} from './tweens';
import {
  ActorVariable,
  ListVariable,
  NumberVariable,
  paramFlavour,
  PARAM_GETTER_BLOCKS,
  PARAM_SETTER_BLOCKS,
  PARAM_TYPE_OPTIONS,
  PARAM_VARIABLE_TYPES,
  StringVariable,
  VectorVariable,
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
const spriteFieldOptions = (): DropdownOptions => [
  // The placeholder STAYS, and is first. It was filtered out when the import
  // row arrived, which left `(import…)` as the only row in a project with no
  // images — and a fresh block takes its first option as its value, so
  // `set sprite` opened reading "(import…)", one click from a dialog nobody
  // asked for. The sound and effect dropdowns say the same thing in their own
  // headers; this is the one that was not doing it.
  ...spriteOptions(),
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
    // …and an actor a WORLD defines carries `worlds/main#thatBlock`, which is
    // the same module with the declaring block on the end (`ownProperties`).
    // Compared whole it never matches, so the world imported a property it
    // declares itself, from a path nothing resolves.
    const [owning, definingBlock] = modulePath.split('#');
    // …and when there IS a block on the end, the name is the hoisted one the
    // definition emitted: a world-defined actor's property is a `const` at the
    // world module's top level, named apart from every other local actor's
    // (`ownPropertyCodeName`). Its block TYPE still carries the plain name,
    // which is the one a reader sees.
    if (definingBlock && ref.own) {
      return ownPropertyCodeName(ref.exportName, {
        actorName: ref.ruleName ?? '',
        blockId: definingBlock,
      });
    }
    // IMPORTED UNDER THE NAME ITS BLOCK TYPE CARRIES, not under its own.
    //
    // An export name says what a member is called and nothing about who
    // declared it, so two files may export the same one — and two of those
    // imported into one module is not a shadowing, it is a `SyntaxError:
    // Identifier 'GoAction' has already been declared`, and the project does
    // not compile at all.
    //
    // TWO ACTORS ARE THE EASY WAY THERE: a `define block` called `go` on one
    // kind and another on a second are two different things spelled alike, and
    // nothing warns. Thirteen pairs of the STOCK RULES already share an export
    // name too — `Scoring` and `Goals` both have a `won`, `Input` and `Mouse`
    // both have `is pressed` — so a file reading both was one step from the
    // same error.
    //
    // `memberKey` is the name already minted for exactly this: it is what
    // makes a block TYPE unique across the project, and it reads as its
    // origin — `ActorsFoo_GoAction` — which is what a learner opening the
    // generated code should see anyway.
    //
    // EVERY named import, not only an actor's own. A rule's module is written
    // by two hands — the declarations in `ruleMeta` and the bodies here —
    // which key their imports identically and dedupe against each other
    // (`alreadyImported`), so both have to spell the local name the same way
    // or whichever import loses the dedupe leaves the other's references
    // undefined. `memberLocalName` is where they agree.
    const local = memberLocalName(ref);
    if (generator && owning !== selfModule) {
      addImport(
        generator,
        `named:${modulePath}:${ref.exportName}`,
        `import {${ref.exportName} as ${local}} from ${str(modulePath)};`,
      );
      return local;
    }
    return ref.exportName;
  }
  return `WorldLab.${ref.exportName}`;
};

// ── A rule that is not there any more ────────────────────────────────────────
// Removing a rule deletes its file (rules/removeRule), and a block that named
// one of its members is left pointing at nothing. Blockly does not forget a
// block DEFINITION — once registered it stays for the session — so those blocks
// go on loading and go on generating, with a reference that was built when the
// rule existed and still carries the path it lived at. The generated module
// then imported a file that is not there, and the whole project stopped:
//
//   cannot resolve 'rules/gravity' from 'actors/player.actor'
//
// Over one row, in one actor, naming a file the learner may never have opened.
//
// So every generator that names a member asks first, and a dead one writes
// NOTHING it can get away with writing nothing for: a handler for an event that
// cannot happen is no handler, an action nobody can perform is no line. What is
// left is the value blocks, which have to report SOMETHING because the block
// they are plugged into is expecting a value — so they report the emptiest one
// of the right shape, and `if ⟨is on the ground?⟩` on a game with no gravity
// takes the branch it would take if the answer were simply no.
//
// The block says which rule went missing on its own face, so none of this is
// silent (extensions/missingRule).

/**
 * A member block's extensions, plus the one that warns when its rule has gone.
 *
 * Last, so the warning it sets is the last word on a block that may already
 * carry another (`addOnChange` composes them; the two are namespaced apart).
 */
const missingRuleAware = (extensions: Extension[]): Extension[] => [
  ...extensions,
  missingRuleExtension,
];

/** What a value block reports when the rule that gave it meaning has gone. */
const deadValue = (
  type: PropertyType,
  generator?: JavascriptGenerator,
): string => {
  if (type === 'boolean') {
    return 'false';
  }
  if (type === 'string') {
    return "''";
  }
  if (type === 'vector') {
    // The origin rather than `null`: a vector flows into arithmetic, and the
    // next block along would read `.x` off whatever this is.
    if (generator) {
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
    }
    return 'new WorldLab.Vector(0, 0)';
  }
  if (type === 'actor' || type === 'actors') {
    // An empty list, because that is what every actor socket accepts and what
    // a loop over it does nothing with (specs/ACTOR_LISTS.md).
    return '[]';
  }
  return '0';
};

// A globally-unique key for a member's block TYPE (registry + toolbox name),
// distinct from its codegen reference (`refCode`). Namespaced by the RULE, so
// two rules' same-named members (e.g. both a `strength`) don't collide on one
// block type — and so a member keeps its block type when the rule it belongs to
// moves, which the reference format is the whole point of.
//
// A FILE'S OWN PROPERTY IS NAMESPACED BY THE FILE INSTEAD, and that is the
// whole of the difference. For a rule the NAME is the identity — a `use trait`
// dropdown stores `Gravity#AffectedByGravityTrait`, which is why renaming one
// has to be swept through every file that mentions it (`renameRule`). For an
// own property nothing anywhere stores the name; the block type is the only
// thing derived from it. So keying on the name bought nothing and cost a
// rename: `define actor ⟨Player⟩` renamed to ⟨Hero⟩ re-minted every block as
// `world_get_Hero_…`, the saved ones became stand-ins, and the learner was told
// their project no longer had a RULE called Player.
//
// This is the treatment layers and a world's own actors already get, for the
// reason `layers.ts` states in one line: a name is a label, and renaming it
// should break nothing.
const memberKey = memberLocalName;

/**
 * A module path as a block-type segment: `actors/player` → `ActorsPlayer`.
 *
 * Pascal-cased per segment rather than merely stripped, so the two things that
 * read a block type back still work: `standInBlocks` splits the segment on case
 * to put words on a dead block's face and into its warning, and "Actors Player"
 * points at a file where "actorsplayer" is a mangle.
 */
/**
 * Every `define property` chained under a `define actor`, as declarations.
 *
 * Read off the BLOCKS, because this runs while generating and there is no
 * metadata pass reaching into a block scope. `ownPropertyDeclarationFor` is
 * shared with the assembler so the two agree on the name a `get` block will
 * reach for.
 */
/**
 * Whether a block that speaks of `actor` has one to speak of.
 *
 * In an `.actor` file the module has `const actor = …` at the top and the
 * answer is always yes. In a WORLD, `actor` is bound only inside the block a
 * `define actor` opens — so a `define drawing` or an `each frame` chained
 * under `define world` instead would emit a call on a name that is not there,
 * and the module would throw as it loaded, taking the whole project with it.
 *
 * Both generators ask, and write nothing when the answer is no. Silence is not
 * a good outcome, but it is the one the lab gives a misplaced block everywhere
 * else — a hat in the wrong file, a `use trait` outside an actor — and it is a
 * great deal better than a project that will not start.
 */
const hasActorInScope = (block: Block): boolean => {
  if (!definesWorld(block.workspace)) {
    return true;
  }
  for (let at: Block | null = block; at; at = at.getParent?.() ?? null) {
    if (at.type === 'world_actor') {
      return true;
    }
  }
  return false;
};

/**
 * The `const`s for everything a world-defined actor declares.
 *
 * `on` is the actor's own variable, because these are emitted at the world
 * MODULE's top level rather than inside the block its body generates into —
 * see `world_actor` below for why.
 */
const ownDeclarationsIn = (
  block: Block,
  on: {variable: string; actorName: string},
): string => {
  let out = '';
  for (let at = block.getNextBlock?.(); at; at = at.getNextBlock?.()) {
    if (at.type !== 'world_rule_property') {
      continue;
    }
    out += ownPropertyDeclarationFor(
      {
        name: at.getFieldValue('NAME') ?? '',
        type: at.getFieldValue('TYPE') ?? '',
        default: at.getFieldValue('DEFAULT') ?? '',
        access: at.getFieldValue('ACCESS') ?? '',
      },
      {...on, blockId: block.id},
    );
  }
  return out;
};

/**
 * A module path as a block-type segment: `actors/player` → `ActorsPlayer`.
 *
 * Exported because renaming an actor's FILE changes it, and every block type
 * minted for that actor's own properties and blocks carries it
 * (`files/renameThing`).
 */
export {pathSlug};

// The keyboard's keys, from the enum that declares them (`Engine#Key`). Both
// key dropdowns read it rather than carrying a list: the World owns the
// keyboard, so the set of key names is one fact with one home, and a rule that
// wants it points at the same enum (specs/ENUMS.md).
const keyOptions = (): Array<[string, string]> =>
  enumOptions(enumRef(KEY_ENUM));

/** The mouse's buttons, from `Engine#MouseButton` — the keyboard's argument. */
const buttonOptions = (): Array<[string, string]> =>
  enumOptions(enumRef(BUTTON_ENUM));

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
  // …and a wand: the shelf of things this actor could be given
  // (extensions/enhanceButton), whether it has a file of its own or is one a
  // world defines.
  extensions: [enhanceButtonExtension],
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
          // Its own properties, declared BESIDE the actor rather than inside
          // the block its body opens. They were inside it, which is where its
          // own drawing reads them from — and nowhere else in the file could:
          // `set ⟨id⟩ of ⟨this actor⟩` in the world's own body, or in a
          // handler, is a block the palette offers and the module threw on as
          // it loaded, `ReferenceError: IdProperty is not defined`. That is
          // what made `memory/actor-state` the one lesson with two files
          // (specs/PROGRESSION.md).
          //
          // At the module's top level the name is unique per declaring actor
          // (`ownPropertyName`), so two local actors may both declare
          // `subject`; the body still sees it, because a block scope can read
          // what encloses it.
          `${ownDeclarationsIn(block, {variable, actorName: name})}` +
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
    // …and the way back to the lesson it was met in
    // (extensions/lessonButton).
    lessonButtonExtension,
    // …and, when the rule that declares this trait has been deleted, a warning
    // saying so — since the generator's answer to that is to write nothing.
    missingRuleExtension,
    // …and, for `Shows Text` alone, one saying the actor has words nothing
    // paints — which is a correct-looking file that draws a plain box.
    textNeedsDrawingExtension,
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
      const trait = block.getFieldValue('TRAIT');
      // "(none)" — the rules in play offer nothing electable, which is the
      // ordinary state of a project with no rules now that the two traits every
      // actor already has are not offered. Same bargain `use rule` makes: an
      // unfinished block emits nothing rather than `WorldLab.` with no name
      // after it, which does not parse.
      if (!trait) {
        return '';
      }
      const ref = refFromValue(trait);
      // A trait whose RULE the project no longer has — deleted from the rules
      // panel, or a file removed by hand. Emitting it would import a module
      // that is not there and stop the whole project compiling, over one row
      // in one actor; so nothing is written, the actor goes without that trait,
      // and the block wears a warning saying which rule is missing
      // (extensions/missingRule, ruleRegistry.refResolves).
      if (!refResolves(ref)) {
        return '';
      }
      return `actor.useTraits([${refCode(ref, generator)}]);\n`;
    },
  },
});

/**
 * `acts like ⟨Progress Bar⟩` — this kind of actor, and everything another one
 * is.
 *
 * The subclassing row, and the smallest thing it could be: one dropdown, one
 * builder call. What comes across is the other kind's DESCRIPTION — its traits,
 * its properties' slots, its per-frame work, its picture, its handlers
 * (`ActorBuilder.actsLike`). What does not is its identity: `is a ⟨Progress
 * Bar⟩` asks what an instance was placed FROM, so a Health Bar that acts like
 * one is not among `any ⟨Progress Bar⟩`. It qualifies under every trait
 * relationship instead.
 *
 * WHERE IT SITS DECIDES NOTHING, unusually for a row here — it means the same
 * in an `.actor` file and inside a world's own `define actor`, because both
 * bind `actor` to a builder and neither declaration is an `export const`. That
 * is what separates it from `define block`, which is refused in a world.
 *
 * ROWS BELOW IT HAVE THE LAST WORD. A `set` after it overrides an inherited
 * default and a `define drawing` after it replaces the inherited picture,
 * because that is what reading a file downwards should mean. The builder says
 * how; this only has to be a row.
 */
const worldActsLike = defineBlock({
  type: 'world_acts_like',
  message0: 'acts like %1',
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorParentOptions}],
  previousStatement: true,
  nextStatement: true,
  extensions: [
    actorParentOptionsExtension,
    // `actsLike` is a builder method, so this belongs under `define actor` —
    // the same home, and the same warning, `use trait` has.
    traitContextExtension,
    openSourceButtonExtension,
  ],
  style: 'behavior_blocks',
  tooltip:
    'Be everything another kind of actor is — its traits, its properties, ' +
    'what it does each frame and what it looks like — and go on being this ' +
    'kind. Rows below this one override what they name.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      // Nothing chosen. The silence every other unfinished dropdown keeps.
      if (!actor) {
        return '';
      }
      // A CO-LOCATED ACTOR, which is a `const` in this same module rather than
      // a file to import. Its declaration has to come first, which is the
      // assembler's business: `assembleWorldModule` orders a world's own
      // actors so a parent is bound before a child reads it.
      const localId = localActorBlockId(actor);
      if (localId) {
        const local = localActorFor(block, actor);
        // A definition since deleted, or this actor naming itself — which is
        // not a shadowing but a `const` reading itself as it is declared. The
        // dropdown offers neither; a saved file may hold either.
        if (!local || localId === definingActorRoot(block)?.id) {
          return '';
        }
        return `actor.actsLike(${local.variable});\n`;
      }
      // ITSELF, which the dropdown does not offer and a saved file may hold —
      // an actor renamed into the place of the one it acted like, say. The
      // import would be a module importing its own default export.
      if (actor === editingActorModule(block)) {
        return '';
      }
      addImport(
        generator,
        `mod:${actor}`,
        `import ${importVar(actor)} from ${str(actor)};`,
      );
      return `actor.actsLike(${importVar(actor)});\n`;
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
      const to = `new WorldLab.Vector(${x}, ${y})`;
      // A destination inside a tween, as every other setter is — position is
      // the one people tween most, and leaving the bespoke block out would
      // have been the one gap nobody could explain.
      if (inTweenBody(block)) {
        return tweenStepCode('WorldLab.PositionProperty', to);
      }
      return forEachActor(
        target,
        actor => `${actor}.set(WorldLab.PositionProperty, ${to})`,
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
 * The same for an event that is about the WORLD.
 *
 * Registered on `world` and handed no actor, because there is none — the event
 * happened to the world. `world` is bound at module scope in a `.world` file
 * (it is the builder), which is where such a handler belongs.
 */
/**
 * Which shadow a MEMBER's subject socket is seeded with.
 *
 * The scope is where the member was declared: a trait a camera elects gives
 * `camera`, and the only sensible subject then is `this camera` — an actor one
 * is not merely odd, it generates `actor`, which a `define camera` body does
 * not bind. Said once here because four block factories ask it.
 */
const subjectInputExtension = (scope: MemberScope) =>
  scope === 'camera' ? cameraInputExtension : actorInputExtension;

const onWorldHandler = (eventRef: string, body: string): string =>
  `world.on(${eventRef}, (world, eventValue) => {\n${body}});\n`;

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
  // A world event has no subject to socket: it happened to the world, not to
  // anybody in it. So the hat reads `when ⟨space⟩ is pressed` rather than
  // `when ⟨actor⟩ …`, and registers on the world.
  const forActor = event.scope !== 'world';
  const args0: BlockArgDefinition[] = forActor
    ? [{type: 'input_value', name: 'ACTOR', check: 'Actor'}]
    : [];
  const extensions: Extension[] = forActor ? [actorSubjectExtension] : [];
  // `%1` is the actor, when there is one; the phrasing follows it.
  let message0 = forActor ? 'when %1' : 'when';
  const filters: Array<{field: string; ref: string}> = [];
  // An ACTOR parameter filters by KIND. "Starts touching a brick" is what a
  // game means almost every time, and a kind is a set of named choices like an
  // enum is — just a live one, since it is the project's own actors.
  //
  // The value itself is not offered as a name here. An earlier version bound it
  // to a variable field, which listed every other Actor variable in the file as
  // though picking one were a choice; the handler reaches it with `event actor`
  // instead. So a hat filters, and never binds.
  const kinds: string[] = [];
  for (const part of event.parts ?? [{kind: 'label', text: event.name}]) {
    if (part.kind === 'label') {
      message0 += ` ${part.text}`;
      continue;
    }
    const choice = enumRefOfParamType(part.type);
    if (!choice) {
      if (part.type !== 'actor') {
        continue; // nothing else has a set of choices to wait for
      }
      const field = filterFieldName(filters.length + kinds.length);
      // Pictures where the project has them, names where it does not — and
      // `(any)` is always a word, since "no filter" has nothing to draw.
      //
      // THE FIELD IS PASSED, and it is the whole of whether this dropdown has
      // anything in it. A world's own `define actor` kinds are found through
      // the field's workspace (`localActorOptions`); without it the list is the
      // project's `.actor` FILES alone — so in a world that defines its actors
      // inline, which is every lesson and the starter, the filter offered
      // nothing but `(any)` and the placeholder beside it.
      //
      // …and the placeholder goes. `orNone` adds a row to an empty list to say
      // there is nothing to choose, and its value is the empty string — which
      // is what `(any)` already means here. Two entries doing one job, one of
      // them reading as a kind of actor that a game might have.
      const options = (own?: FieldDropdown): DropdownOptions => [
        ANY_CHOICE,
        ...actorFieldOptions(own).filter(([, value]) => value !== ''),
      ];
      args0.push({type: 'field_dropdown', name: field, options: options()});
      extensions.push(
        liveDropdown(`world_event_kind_${field}`, field, options),
      );
      kinds.push(field);
      // So `event actor` under this hat can draw the kind it was filtered to
      // (`actorAbout`): from here, an enum filter and a kind filter are two
      // dropdowns with numbered names, and only this side knows which is which.
      registerKindFilter(eventBlockType(event), field);
      message0 += ` %${args0.length}`;
      // The hat carries an actor, so offer the block that names it — a flyout
      // inside the block, opened by a `+` (extensions/eventActorToolbox).
      extensions.push(eventActorToolboxExtension);
      continue;
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
  registerMemberBlockType(eventBlockType(event), event.ref.ruleName);
  return defineBlock({
    type: eventBlockType(event),
    message0,
    args0,
    nextStatement: true,
    inputsInline: true,
    extensions: [...extensions, missingRuleExtension],
    style: 'event_blocks',
    tooltip: forActor
      ? `Run the blocks below when this actor ${event.name}.`
      : `Run the blocks below when ${event.name}. It is about the world, so ` +
        `there is no actor it happened to.`,
    generator: {
      javascript(block, generator) {
        // The rule that raises this is gone, so nothing can raise it: the
        // handler and its whole body are not written at all.
        if (!refResolves(event.ref)) {
          return '';
        }
        // The guard a learner would otherwise write themselves: compare the
        // event's value against the choice and leave if it is not the one.
        const guards = filters
          .map(filter => block.getFieldValue(filter.field))
          .filter(value => value)
          .map(value => `  if (eventValue !== ${str(value)}) return;\n`)
          .join('');
        // A kind filter tests what the carried actor IS, where an enum filter
        // tests what the carried value equals — the same guard shape over the
        // same `.type` that `is a` compares (blockly/localActors stamps a
        // world's own actors with their id rather than a module path).
        const kindGuards = kinds
          .map(field => block.getFieldValue(field))
          .filter(chosen => chosen)
          .map(chosen => localActorFor(block, chosen)?.type ?? chosen)
          .map(type => `  if (eventValue?.type !== ${str(type)}) return;\n`)
          .join('');
        const body = guards + kindGuards + nextChainCode(block, generator);
        if (!forActor) {
          return onWorldHandler(refCode(event.ref, generator), body);
        }
        const target = actorTarget(block, generator, Order.MEMBER);
        return onHandler(target.code, refCode(event.ref, generator), body);
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
    // ANY type, not only an enum. The two sides of an event do not have to
    // agree about this, and making them agree cost more than it bought: an
    // event that carries an actor — "started touching THAT one" — was not
    // sayable at all, and the param vanished from both sides rather than
    // falling back to a treatment that works.
    //
    // The hat still filters only on enums, because a filter is a dropdown of
    // named choices and a kind of actor is not one. It simply offers no filter
    // for the rest; the handler reads what came through with `event value`,
    // which is untyped for exactly this reason.
    const built = typedValueInputs(part, args0.length + 1, names[paramIndex], {
      enumAsSocket: true,
    });
    paramIndex += 1;
    args0.push(...built.args);
    shadows.push(...built.shadows);
    message0 += ` ${built.message}`;
  }
  // The subject last, as `emit … for …` always read — and only when there is
  // one. A world event happened to the world, so there is nobody to raise it
  // for, and saying `for ⟨some actor⟩` would be inventing a subject.
  const forActor = event.scope !== 'world';
  if (forActor) {
    args0.push({type: 'input_value', name: 'ACTOR', check: 'Actor'});
    message0 += ` for %${args0.length}`;
  }

  const type = emitBlockType(event);
  if (shadows.length) {
    registerValueShadows(type, shadows);
  }
  registerMemberBlockType(type, event.ref.ruleName);
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    extensions: [
      ...(forActor ? [subjectInputExtension(event.scope)] : []),
      worldContextExtension,
      ...(shadows.length ? [valueShadowExtension] : []),
      missingRuleExtension,
    ],
    style: 'event_blocks',
    tooltip: forActor
      ? `Raise "${event.name}" for an actor — every “when …” handler listening for it runs.`
      : `Raise "${event.name}" — every “when …” handler listening for it runs. ` +
        `It is about the world, so it is raised once rather than per actor.`,
    generator: {
      javascript(block, generator) {
        // Nothing listens for an event whose rule is gone, so raising it is a
        // line with no reader.
        if (!refResolves(event.ref)) {
          return '';
        }
        // What the handler is handed, one value per parameter.
        //
        // An ACTOR-typed one is narrowed to a single actor, because that is
        // the language's rule for reading a value of several
        // (specs/ACTOR_LISTS.md) and every other actor socket already obeys
        // it. Without this, a rule raising an event with `first actor in ⟨…⟩`
        // in the socket handed its listeners a LIST of one, and a handler
        // asking that value anything about itself got nothing back — which is
        // how `Inventory.spends` told a door it had used undefined.
        const carried = params.slice(0, paramIndex).map((param, index) => {
          const socket = names[index].value;
          const code = generator.valueToCode(block, socket, Order.NONE);
          if (!code) {
            return '""';
          }
          return param.type === 'actor' ? `WorldLab.one(${code})` : code;
        });
        // `refCode` resolves a project event to the bare local name when the
        // rule is emitting its OWN event (it is an `export const` in the module
        // being written), and imports it otherwise.
        const event_ = refCode(event.ref, generator);
        const values = carried.map(code => `, ${code}`).join('');
        if (!forActor) {
          // Once, however many actors are in the world.
          return `world.emitToWorld(${event_}${values});\n`;
        }
        const target = actorTarget(block, generator);
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
  // A tween's definition, for both of the reasons above: it declares rather
  // than does, and a chained one would be an orphan at the top level.
  'world_define_tween',
  'world_world',
  'world_rule',
  // A trait is a definition root too — its members chain below it, beside the
  // rule rather than inside it. So is each step: its body chains below it.
  'world_rule_trait',
  'world_rule_step_tick',
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
/**
 * Whether a property gets `add … to` / `remove … from` blocks.
 *
 * A LIST of actors, and only a list: `actor` says one, and list blocks around
 * one actor would let a learner name a second that nothing reads. That
 * distinction is the whole reason the two types are told apart.
 *
 * Written where a set block would be — a push IS a write, and a read-only
 * property is one its own rule writes, so the same rule applies: outside the
 * declaring `.rule` there is no way to change a contact set, and inside it
 * there is.
 */
const isList = (property: PropertyMeta): boolean =>
  property.type === 'actors' && isGettable(property);

/** …and one that holds a list of plain values (specs/LISTS.md). */
const isValueList = (property: PropertyMeta): boolean =>
  ['numbers', 'words', 'vectors'].includes(property.type) &&
  isGettable(property);

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
 *
 * THE PARAMETER IS NOT CALLED `actor`, and that is a bug fix rather than
 * taste. `body` may embed an expression generated in the ENCLOSING scope —
 * `set ⟨fraction⟩ of ⟨any ⟨Health Bar⟩⟩ to ⟨health of ⟨this actor⟩⟩` puts a
 * read of the handler's own actor inside this lambda — and `this actor`
 * compiles to the bare name `actor`. A parameter of that name captured it, so
 * the starter's health bar read its own health, found none, and threw
 * "Actor 'HealthBar' has no property 'health'". The shadowing `actor` that
 * `define drawing` and `each frame` rely on is the opposite case: there the
 * body IS about the subject, and here it is about whoever asked.
 */
/*
 * THE BODY IS A BLOCK, not an expression, and that is the second bug fix here.
 * Most callers hand back one expression, and an arrow without braces carried it
 * perfectly well — until `set sprite`, whose body is THREE statements joined by
 * semicolons (a sprite, a cell origin, a cell size). Spliced into an
 * expression-bodied arrow, the first statement became the whole lambda and the
 * other two became garbage in the middle of the call: `set sprite of ⟨any
 * ⟨Portrait⟩⟩` generated a module that would not parse, and the project died as
 * it loaded with "missing ) after argument list" naming nothing in particular.
 */
export const forEachActor = (
  target: ActorTarget,
  body: (actor: string) => string,
): string =>
  target.many
    ? `WorldLab.each(${target.code}, subject => {\n${body('subject')};\n});\n`
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

/**
 * What an actor LIST's source socket wears when nothing has been put in it.
 *
 * `any ⟨Coin ▾⟩` in a world or an actor file, because that is what a learner
 * reaches for first — "the closest Enemy", "the coins that are gold" — and a
 * default you change with one dropdown click beats one you change by dragging a
 * block out of the toolbox. `all actors` is almost never the list somebody
 * wanted; it was the default because it was the only list there was.
 *
 * `all actors` in a `.rule`, and that exception is not a preference. A rule is
 * generic over the actors that elect its traits — it says "everything with this
 * trait", never "every Coin" — and the dropdown there would offer a rule author
 * precisely the thing they must not name. Read off the workspace's own blocks
 * (`definesRule`) rather than off the file's path, which a block does not have.
 *
 * The kind block emits NO ACTORS when its dropdown names nothing, so an
 * untouched shadow is inert rather than quietly meaning `this actor` — see
 * `world_actor_kind`, where getting that wrong would have made every one of
 * these loops run its body once.
 */
const actorListShadow = (block: Block): ShadowSpec =>
  definesRule(workspaceOfBlock(block))
    ? {type: 'world_all_actors'}
    : {type: 'world_actor_kind'};

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
      // An Actor socket (default `this actor`), read as ONE actor.
      //
      // Through `actorTarget`/`oneActor` rather than raw, because a parameter
      // typed `actor` takes one and the thing plugged into it may hold several:
      // `any ⟨Coin⟩` does, and so does any `actor`-typed PROPERTY, which
      // `Traited.coerce` stores as a list whatever it was given. Read raw, the
      // body of a rule's own query then called `.get` on an array — which is
      // how Steering's `distance from ⟨a⟩ to ⟨b⟩` crashed the moment a chaser
      // had something to chase, while every test passed.
      //
      // Taking the first is the language's own rule for a value read of
      // several (specs/ACTOR_LISTS.md), and it is what every built-in getter
      // beside these already did — which is why Camera Follow, reading its
      // target through `x position of`, escaped this.
      return oneActor(actorTarget(block, generator, Order.NONE, names.value));
    case 'boolean':
      return read(names.value) || (d ? 'true' : 'false');
    case 'string':
    case 'color':
      return read(names.value) || str(String(d ?? ''));
    case 'actors':
      return read(names.value) || '[]';
    case 'numbers':
    case 'words':
    case 'vectors':
      // An empty socket is an empty list, which is the only default a list has
      // — and the same answer `actors` gives one.
      return read(names.value) || '[]';
    case 'kind':
      // A FIELD, like an enum's, so it is read rather than pulled through a
      // socket — and resolved the way `is a` and `how many ⟨Coin⟩ in` resolve
      // one: a world's own `define actor` is stamped with its id, a project
      // template with its module path. What the rule is handed is that string,
      // which is what `kind of ⟨actor⟩` answers with.
      return str(
        localActorFor(block, block.getFieldValue(names.value) ?? '')?.type ??
          String(block.getFieldValue(names.value) ?? d ?? ''),
      );
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
    case 'color':
      // A SWATCH, not a text box. The value is the same `#rrggbb` a string
      // property would hold, and the socket takes every color block — the
      // picker, `world_rgba`, a blend — because they all report `Colour`.
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: COLOUR_CHECK}],
        shadows: [
          {
            name: names.value,
            shadow: {
              type: 'colour_picker',
              fields: {COLOUR: String(d ?? '#ffffff')},
            },
          },
        ],
      };
    case 'kind':
      // The project's actor kinds, as a dropdown on the block. A FIELD for the
      // reason an enum's choices are one: the kinds are the whole of what the
      // argument can be, and a socket would draw a plug around a list and offer
      // to accept something that is not on it.
      //
      // A LIVE dropdown bound to this field's own name, which is the whole of
      // why `actorTypeOptionsExtension` will not do: an extension rebinds the
      // one field it was given, and that one is bound to `TYPE`
      // (`moduleOptions`). Bound to the wrong name it silently rebinds nothing,
      // the options stay whatever they were when the block was defined, and a
      // stored kind the list has never heard of is dropped on load — a project
      // that says `spends a ⟨Key⟩` and generates `spends a ⟨⟩`.
      //
      // Live also means a kind added a moment ago is in the list, and a kind
      // that has been deleted still reads as itself rather than becoming the
      // first thing in it.
      return {
        message: `%${slot}`,
        args: [
          {
            type: 'field_dropdown',
            name: names.value,
            options: actorFieldOptions(),
          },
        ],
        shadows: [],
        extensions: [
          liveDropdown(
            `world_kind_field_${names.value}`,
            names.value,
            actorFieldOptions,
          ),
        ],
      };
    case 'numbers':
    case 'words':
    case 'vectors':
      // A list socket, and no shadow: an empty one is an empty list, and a
      // seeded literal would be a list a learner has to empty before they can
      // put their own in.
      return {
        message: `%${slot}`,
        args: [{type: 'input_value', name: names.value, check: LIST_CHECK}],
        shadows: [],
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

/**
 * A property as a plain typed value, for the two functions that build its
 * socket and read it back.
 *
 * `actor` becomes `actors` on the way in, and it has to: those switches speak
 * ARGUMENT types, where `actor` is a parameter that defaults to `this actor` —
 * right for `collision size of ⟨⟩`, and wrong for `set actor to follow to ⟨⟩`,
 * which would then set the camera to follow whatever `actor` happened to name,
 * in a file that may not bind one at all.
 *
 * Which is the honest mapping anyway. A singular property IS a list — narrowed
 * on the way into the store (Traited) — so its socket is a list's socket, its
 * empty value is a list's empty value, and the one thing that differs is that
 * no `add … to` is generated for it.
 */
const asTypedValue = (property: PropertyMeta): TypedValue => ({
  ...property,
  type: property.type === 'actor' ? 'actors' : property.type,
});

/** The registry/toolbox types for the blocks that set / get `property`. */
const setPropertyBlockType = (exportName: string): string =>
  `world_set_${exportName}`;
const getPropertyBlockType = (exportName: string): string =>
  `world_get_${exportName}`;
const pushPropertyBlockType = (exportName: string): string =>
  `world_push_${exportName}`;
const dropPropertyBlockType = (exportName: string): string =>
  `world_drop_${exportName}`;

// The `output` check for a value kind. A `vector` reports a whole `Vector`; a
// `point` getter reports one axis (a Number, chosen by a dropdown).
/**
 * The rule a property block belongs to, for the "your project does not have
 * ⟨rule⟩ any more" warning — and NOTHING for a property that belongs to no rule.
 *
 * A file's own property (`blockly/ownProperties`) carries the declaring file's
 * name in `ruleName` because that is what its block type is keyed from. It is
 * not a rule, so looking it up finds nothing, and the block wore a warning
 * saying the project no longer had "My World" — on a world that was open at the
 * time. Every project with world or actor state showed it, the two fixtures
 * that keep a score included.
 *
 * Deleting the declaration still says so: the block type stops being minted,
 * and a stand-in takes its place (`blockly/standInBlocks`).
 */
const memberRule = (ref: MemberRef): string | undefined =>
  ref.own ? undefined : ref.ruleName;

const outputForType = (type: PropertyType): string =>
  type === 'boolean'
    ? 'Boolean'
    : // A color reports what every color block reports, so `get text color`
      // plugs into `set fill` and into an effect's parameter with nothing
      // widened to let it (`colorCheck`).
      type === 'color'
      ? COLOUR_CHECK
      : type === 'string'
        ? 'String'
        : type === 'vector'
          ? 'Vector'
          : // An actors property reports an ACTOR value, so it plugs into a loop's
            // source, `is in`, `how many actors in` — every actor socket there is.
            type === 'actors' || type === 'actor'
            ? 'Actor'
            : // A list of plain values reports `List`, and a socket says no
              // more than that: what it HOLDS is the property's business
              // (specs/LISTS.md).
              type === 'numbers' || type === 'words' || type === 'vectors'
              ? LIST_CHECK
              : 'Number';

// A value block's style by the kind it reports: a boolean is logic, a whole
// vector is a location, everything else (numbers, point axes) is math.
const valueStyle = (type: PropertyType): string =>
  type === 'color'
    ? 'text_blocks' // where the color blocks themselves sit
    : type === 'boolean'
      ? 'logic_blocks'
      : type === 'vector'
        ? 'location_blocks'
        : type === 'actors' || type === 'actor'
          ? 'sprite_blocks' // the color that groups the actors
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
  const value = typedValueInputs(asTypedValue(property), subjectScoped ? 2 : 1);
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
  registerMemberBlockType(type, memberRule(property.ref));
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    // A world property sets on `world`; warn if placed where `world` is unbound.
    extensions: missingRuleAware(
      subjectScoped
        ? [subjectInputExtension(property.scope), valueShadowExtension]
        : [valueShadowExtension, worldContextExtension],
    ),
    style: 'default',
    tooltip: subjectScoped
      ? `Set an actor's ${name}.`
      : `Set the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        // Writing a property the project can no longer name: nothing to write
        // it to, and nothing lost by not writing it.
        if (!refResolves(property.ref)) {
          return '';
        }
        const value = typedValueCode(asTypedValue(property), block, generator);
        // INSIDE A TWEEN this is a destination, not a write. The same block
        // says "put it here" and "end up here" depending on where it sits,
        // which is the whole of what makes a tween's vocabulary the same
        // vocabulary as everything else's (`blockly/tweens`).
        if (subjectScoped && inTweenBody(block)) {
          return tweenStepCode(refCode(property.ref, generator), value);
        }
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
 * Adding to and taking from a property that holds a LIST of actors.
 *
 * Only for `actors`, never for `actor` — which is the whole reason the two
 * types are told apart. A camera's actor to follow is one actor, and offering
 * `push ⟨…⟩ to actor to follow` would let a learner name a second one that
 * nothing will ever read: a block that works, does something, and means
 * nothing.
 *
 * `set` can already say both of these — read the list out, change it, write it
 * back — and that is exactly the problem. It is three blocks and a variable to
 * say "and this one too", and the Collection rule had to spell it out in its
 * own step before these existed.
 *
 * Whole-list semantics on the way in: pushing a value that holds several adds
 * all of them, dropping one removes every one it names. That falls out of
 * `ActorValue` being one-or-many everywhere else, and the alternative — taking
 * the first and silently dropping the rest — would be the surprise.
 */
const defineListPropertyBlocks = (property: PropertyMeta) => {
  const name = property.name;
  const subjectScoped = property.scope !== 'world';
  const owner = (label: string) =>
    subjectScoped ? `${label} of %2` : `${label}`;
  const args = (): BlockArgDefinition[] => [
    {type: 'input_value', name: 'ITEM', check: 'Actor'},
    ...(subjectScoped
      ? [
          {
            type: 'input_value',
            name: 'ACTOR',
            check: 'Actor',
          } as BlockArgDefinition,
        ]
      : []),
  ];
  // The list is read off ONE owner and written back to it. `forEachActor` would
  // be wrong here in a way it is not for `set`: pushing to "every coin's" list
  // is a sentence, but the value being pushed is read once and the list is
  // read-modify-written, so the broadcast has to wrap the whole operation.
  const change = (verb: 'push' | 'drop') => (subject: string) => {
    const ref = 'REF';
    return verb === 'push'
      ? `${subject}.set(${ref}, [...WorldLab.all(${subject}.get(${ref})), ...WorldLab.all(ITEM)])`
      : `${subject}.set(${ref}, WorldLab.all(${subject}.get(${ref})).filter(each => !WorldLab.all(ITEM).includes(each)))`;
  };
  const build = (verb: 'push' | 'drop', message0: string, tooltip: string) => {
    const type =
      verb === 'push'
        ? pushPropertyBlockType(memberKey(property.ref))
        : dropPropertyBlockType(memberKey(property.ref));
    registerMemberBlockType(type, memberRule(property.ref));
    return defineBlock({
      type,
      message0,
      args0: args(),
      inputsInline: true,
      previousStatement: true,
      nextStatement: true,
      extensions: missingRuleAware(
        subjectScoped
          ? [subjectInputExtension(property.scope), valueShadowExtension]
          : [valueShadowExtension, worldContextExtension],
      ),
      style: 'default',
      tooltip,
      generator: {
        javascript(block, generator) {
          if (!refResolves(property.ref)) {
            return '';
          }
          const item = generator.valueToCode(block, 'ITEM', Order.NONE) || '[]';
          const ref = refCode(property.ref, generator);
          const write = (subject: string) =>
            change(verb)(subject)
              .replace(/REF/g, ref)
              .replace(/ITEM/g, `(${item})`);
          return subjectScoped
            ? forEachActor(actorTarget(block, generator, Order.MEMBER), write)
            : `${write('world')};\n`;
        },
      },
    });
  };
  return [
    build(
      'push',
      `add %1 to ${owner(name)}`,
      `Add an actor to ${subjectScoped ? "an actor's" : "the world's"} ${name}.`,
    ),
    build(
      'drop',
      `remove %1 from ${owner(name)}`,
      `Take an actor out of ${
        subjectScoped ? "an actor's" : "the world's"
      } ${name}.`,
    ),
  ];
};

/**
 * Adding to and taking from a property that holds a LIST OF VALUES.
 *
 * The value-list twin of the actor pair above, and it exists for the reason
 * that one does: `set` can say both of these — read the list out, change it,
 * write it back — and that is three blocks and a variable to say "and this one
 * too". History's tape is the case that asked for them, and what it needs is
 * exactly a push and a pop.
 *
 * REMOVE IS THE LAST ONE, not one by value. A tape of places holds duplicates
 * the moment anything stands still, and "take the one I just put on" is what a
 * stack means; removing by value would take the first one equal to it, which is
 * a different sentence that happens to leave a list of the same length.
 */
const defineValueListPropertyBlocks = (property: PropertyMeta) => {
  const name = property.name;
  const subjectScoped = property.scope !== 'world';
  const owner = (label: string) =>
    subjectScoped ? `${label} of %2` : `${label}`;
  const ownerArg = (): BlockArgDefinition[] =>
    subjectScoped ? [{type: 'input_value', name: 'ACTOR', check: 'Actor'}] : [];
  const build = (
    verb: 'push' | 'pop',
    args0: BlockArgDefinition[],
    message0: string,
    tooltip: string,
  ) => {
    const type =
      verb === 'push'
        ? pushPropertyBlockType(memberKey(property.ref))
        : dropPropertyBlockType(memberKey(property.ref));
    registerMemberBlockType(type, memberRule(property.ref));
    return defineBlock({
      type,
      message0,
      args0,
      inputsInline: true,
      previousStatement: true,
      nextStatement: true,
      extensions: missingRuleAware(
        subjectScoped
          ? [subjectInputExtension(property.scope), valueShadowExtension]
          : [valueShadowExtension, worldContextExtension],
      ),
      style: 'default',
      tooltip,
      generator: {
        javascript(block, generator) {
          if (!refResolves(property.ref)) {
            return '';
          }
          const ref = refCode(property.ref, generator);
          const item =
            verb === 'push'
              ? generator.valueToCode(block, 'ITEM', Order.NONE) || '0'
              : '';
          // Read, change, write — through the setter, so the store's own
          // copying happens (`core/lists`) and a watcher sees the change.
          const write = (subject: string) =>
            verb === 'push'
              ? `${subject}.set(${ref}, [...WorldLab.items(${subject}.get(${ref})), ${item}])`
              : `${subject}.set(${ref}, WorldLab.items(${subject}.get(${ref})).slice(0, -1))`;
          return subjectScoped
            ? forEachActor(actorTarget(block, generator, Order.MEMBER), write)
            : `${write('world')};\n`;
        },
      },
    });
  };
  return [
    build(
      'push',
      [{type: 'input_value', name: 'ITEM'}, ...ownerArg()],
      `add %1 to ${owner(name)}`,
      `Put something on the end of ${
        subjectScoped ? "an actor's" : "the world's"
      } ${name}.`,
    ),
    build(
      'pop',
      ownerArg().map((argument, index) =>
        index === 0 ? {...argument, name: 'ACTOR'} : argument,
      ),
      subjectScoped
        ? `take the last off ${name} of %1`
        : `take the last off ${name}`,
      `Take the last thing off ${
        subjectScoped ? "an actor's" : "the world's"
      } ${name}. Nothing happens if it is already empty.`,
    ),
  ];
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
  if (property.type === 'actors' || property.type === 'actor') {
    // It reports a LIST, always — see `registerManyActorBlock`. A socket that
    // reads one actor has to know, or it reads the property off the array.
    //
    // Including `actor`, which says one and is stored as one, because SAYING
    // one is not the same as being handed one: nothing stops `set actor to
    // follow to ⟨any Player⟩`, and that is a reasonable thing to write. The
    // store narrows it (Traited), and this is what covers every path that does
    // not go through the store.
    registerManyActorBlock(type);
  }
  registerMemberBlockType(type, memberRule(property.ref));

  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    output: outputForType(property.type),
    // A world property reads from `world`; warn if placed where it is unbound.
    extensions: missingRuleAware(
      subjectScoped
        ? [subjectInputExtension(property.scope)]
        : [worldContextExtension],
    ),
    // Style by the value it reports: a boolean reads as logic, a whole vector as
    // a location, a number/point axis as math.
    style: valueStyle(property.type),
    tooltip: subjectScoped
      ? `Get an actor's ${name}.`
      : `Get the world's ${name}.`,
    generator: {
      javascript(block, generator) {
        // A value block, so it has to report SOMETHING: the emptiest value of
        // the shape whatever it is plugged into is expecting.
        if (!refResolves(property.ref)) {
          return [deadValue(property.type, generator), Order.ATOMIC] as [
            string,
            number,
          ];
        }
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

// ── The general property blocks ──────────────────────────────────────────────
// One `get` and one `set` PER KIND, covering every actor property in the
// project from a dropdown (blockly/propertyOptions). The per-property blocks
// below are not going anywhere — a rule's category is a catalogue you can
// browse, and that is the good half of minting one each — but they cannot
// cover an actor's OWN property without giving every actor a category of its
// own, and these can.
//
// SIX KINDS, TWELVE BLOCKS, against a hundred and sixty-eight. The alternative
// was one polymorphic pair whose output changed as the dropdown moved; that
// works and disconnects whatever was plugged in the moment somebody browses
// the menu. A block per kind is statically typed, and the list inside it is
// only the properties it could possibly report.
//
// A POINT REPORTS THE WHOLE VECTOR here, where its own getter reports one axis
// from a second dropdown. `⟨x⟩ of ⟨…⟩` is a block that already exists and
// composes, and two dropdowns on one block — the second meaningless for most
// of what the first offers — is worse than asking for it.

/** The output/socket check each kind carries. */
/**
 * What a list plugs into — Blockly's own name, so the core literal fits.
 *
 * `lists_create_with` reports `Array`, and it is the one core list block this
 * lab reuses: it carries the mutator that makes a literal growable, which is a
 * hundred lines nobody has to write twice (specs/LISTS.md).
 */
export const LIST_CHECK = 'Array';

const KIND_CHECK: Record<PropertyKind, string> = {
  number: 'Number',
  text: 'String',
  boolean: 'Boolean',
  color: COLOUR_CHECK,
  vector: 'Vector',
  actor: 'Actor',
};

/** What the menu says when the project has no property of this kind. */
const kindOptions =
  (kind: PropertyKind, writable: boolean) => (): Array<[string, string]> =>
    orNone(
      writable ? writablePropertyOptions(kind) : propertyOptions(kind),
    ) as Array<[string, string]>;

const generalPropertyBlocks = (kind: PropertyKind) => {
  const getType = `world_get_${kind}_property`;
  const setType = `world_set_${kind}_property`;
  // An actor value reports a LIST, always, so a socket reading one narrows it
  // rather than reading the property off an array (`registerManyActorBlock`).
  if (kind === 'actor') {
    registerManyActorBlock(getType);
  }
  return [
    defineBlock({
      type: getType,
      message0: 'get %1 of %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PROP',
          options: kindOptions(kind, false),
        },
        {type: 'input_value', name: 'ACTOR', check: 'Actor'},
      ],
      inputsInline: true,
      output: KIND_CHECK[kind],
      extensions: [
        subjectInputExtension('actor'),
        liveDropdown(`world_get_${kind}_property_options`, 'PROP', () =>
          kindOptions(kind, false)(),
        ),
      ],
      style: valueStyle(kind === 'text' ? 'string' : (kind as PropertyType)),
      tooltip:
        'Read any property an actor has — one a rule gives it, or one its ' +
        'own file declares.',
      generator: {
        javascript(block, generator) {
          const known = propertyByKey(
            String(block.getFieldValue('PROP') ?? ''),
          );
          if (!known) {
            // A property the project no longer holds. A value block has to
            // report SOMETHING of the shape its socket expects, which is what
            // every other dead reference here does.
            return [deadValue(kindType(kind), generator), Order.ATOMIC] as [
              string,
              number,
            ];
          }
          const subject = oneActor(actorTarget(block, generator, Order.MEMBER));
          return [
            `${subject}.get(${refCode(known.property.ref, generator)})`,
            Order.ATOMIC,
          ] as [string, number];
        },
      },
    }),
    defineBlock({
      type: setType,
      message0: 'set %1 of %2 to %3',
      args0: [
        {
          type: 'field_dropdown',
          name: 'PROP',
          options: kindOptions(kind, true),
        },
        {type: 'input_value', name: 'ACTOR', check: 'Actor'},
        {type: 'input_value', name: 'VALUE', check: KIND_CHECK[kind]},
      ],
      inputsInline: true,
      previousStatement: true,
      nextStatement: true,
      extensions: [
        subjectInputExtension('actor'),
        liveDropdown(`world_set_${kind}_property_options`, 'PROP', () =>
          kindOptions(kind, true)(),
        ),
      ],
      style: valueStyle(kind === 'text' ? 'string' : (kind as PropertyType)),
      tooltip:
        'Write any property an actor has — one a rule gives it, or one its ' +
        'own file declares.',
      generator: {
        javascript(block, generator) {
          const known = propertyByKey(
            String(block.getFieldValue('PROP') ?? ''),
          );
          const value =
            generator.valueToCode(block, 'VALUE', Order.NONE) || 'null';
          if (!known) {
            return '';
          }
          if (inTweenBody(block)) {
            return tweenStepCode(refCode(known.property.ref, generator), value);
          }
          // Over the actor value, which may hold several: `set ⟨…⟩ of ⟨any
          // ⟨Coin⟩⟩` broadcasts, exactly as the per-property setter does.
          return forEachActor(
            actorTarget(block, generator),
            who =>
              `${who}.set(${refCode(known.property.ref, generator)}, ${value})`,
          );
        },
      },
    }),
  ];
};

/** A representative property type for a kind, for `deadValue` and `valueStyle`. */
const kindType = (kind: PropertyKind): PropertyType =>
  kind === 'text'
    ? 'string'
    : kind === 'actor'
      ? 'actors'
      : (kind as PropertyType);

const GENERAL_PROPERTY_BLOCKS = (
  ['number', 'text', 'boolean', 'color', 'vector', 'actor'] as PropertyKind[]
).flatMap(generalPropertyBlocks);

/** …and their types, for the toolbox. */
const GENERAL_PROPERTY_TYPES = GENERAL_PROPERTY_BLOCKS.map(block => block.type);

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
    if (isList(property) && isSettable(property)) {
      for (const block of defineListPropertyBlocks(property)) {
        PROPERTY_BLOCKS.push(block);
        types.push(block.type);
      }
    }
    if (isValueList(property) && isSettable(property)) {
      for (const block of defineValueListPropertyBlocks(property)) {
        PROPERTY_BLOCKS.push(block);
        types.push(block.type);
      }
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
 * param trails the name bare ("apply force %1"); two or more are each labeled
 * by name ("nudge amount %1 direction %2") to keep them apart.
 */
const defineActionBlock = (action: ActionMeta) => {
  const subjectScoped = action.scope !== 'world';
  const name = action.name;
  const params = action.params;
  const labeled = params.length > 1;
  // A lone argument keeps the default `VALUE`/`X`/`Y` sockets (so built-in
  // single-arg action blocks are unchanged); several need per-name sockets to
  // stay distinct.
  const paramNames = params.map(param =>
    labeled ? paramValueNames(param.name) : DEFAULT_VALUE_NAMES,
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
      message0 += labeled
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
  // `memberRule`, not the ref's name: an actor's OWN action carries the
  // declaring actor in `ruleName`, and registering that as its rule made the
  // call site warn that the project no longer had a rule called "Ball" — the
  // same trap the property blocks describe.
  registerMemberBlockType(type, memberRule(action.ref));
  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    // A world action runs on `world`; warn if placed where `world` is unbound.
    extensions: missingRuleAware([
      ...(subjectScoped
        ? [subjectInputExtension(action.scope)]
        : [worldContextExtension]),
      ...(shadows.length ? [valueShadowExtension] : []),
      ...slotExtensions,
    ]),
    style: 'default',
    // The author's own sentence, when they wrote one.
    tooltip:
      action.description || (subjectScoped ? `${name} — for an actor.` : name),
    generator: {
      javascript(block, generator) {
        // An action nobody can perform is no line at all.
        if (!refResolves(action.ref)) {
          return '';
        }
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
    // "this actor is on the ground?"; any params trail, each labeled by name.
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
  registerMemberBlockType(type, query.ref.ruleName);

  return defineBlock({
    type,
    message0,
    args0,
    inputsInline: true,
    output: outputForType(returns),
    extensions: missingRuleAware([
      ...(subjectScoped
        ? [subjectInputExtension(query.scope)]
        : [worldContextExtension]),
      ...(shadows.length ? [valueShadowExtension] : []),
      ...slotExtensions,
    ]),
    style: valueStyle(returns),
    tooltip:
      query.description ||
      (subjectScoped ? `Whether an actor ${name}` : `The world's ${name}`),
    generator: {
      javascript(block, generator) {
        // A value block: it reports the emptiest answer of the right shape, so
        // `if ⟨is on the ground?⟩` in a game with no gravity takes the branch
        // it would take if the answer were simply no.
        if (!refResolves(query.ref)) {
          return [deadValue(returns, generator), Order.ATOMIC] as [
            string,
            number,
          ];
        }
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

/**
 * `log ⟨Hello⟩` — SUPERSEDED, and kept only so saved files keep loading.
 *
 * It took its text in a FIELD, so the one thing it could say was a literal;
 * `write to console` takes a socket and wears a text shadow, which types the
 * same and also holds a score, a position, or anything else a learner has
 * worked out. Two blocks that both compiled to `console.log` and differed in
 * what they would accept is one block and a shadow.
 *
 * Off the toolbox, still registered — the bargain `use rule` makes for the
 * same reason (`ROOT_HOMES`). A project saved with one goes on loading and
 * goes on printing; nothing offers a second one.
 */
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

/**
 * `write to console ⟨…⟩` — the one way to say something to the console.
 *
 * A SOCKET WITH A TEXT SHADOW, which is what lets it replace the two blocks
 * that were here. Dragged out it reads `write to console ⟨" "⟩` and can be
 * typed into like a field, so the literal case costs nothing; drop a `score`
 * or a `⟨x⟩ of ⟨this actor⟩` in and it prints that instead. The old pair made
 * a learner choose between those before knowing there was a choice.
 */
const worldPrint = defineBlock({
  type: 'world_print',
  message0: 'write to console %1',
  args0: [{type: 'input_value', name: 'VALUE'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [valueShadowExtension],
  style: 'text_blocks',
  tooltip:
    'Write a message to the console. Type into it, or drop in anything that ' +
    'works out a value — a score, a position, whatever the event carried.',
  generator: {
    javascript(block, generator) {
      const value = generator.valueToCode(block, 'VALUE', Order.NONE) || "''";
      return `console.log(${value});\n`;
    },
  },
});

// Empty text, not a word. A shadow a learner types over should not first have
// to be cleared, and `Hello` in every fresh one is a word the program appears
// to have meant.
registerValueShadows('world_print', [
  {name: 'VALUE', shadow: {type: 'text', fields: {TEXT: ''}}},
]);

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

// ── Lists of values ──────────────────────────────────────────────────────────
// The language could hold one number, one word, one place, and any number of
// ACTORS; these are the blocks that let it hold two numbers (specs/LISTS.md).
//
// The literal and the count are Blockly's own, reworded (`colorMessages`): the
// literal carries the mutator that makes it growable, and rebuilding that to
// change three words would be the wrong trade. Everything else is here, in the
// voice the actor lists already speak — `add … to`, `empty`, `how many`, and a
// `for each` per kind of thing.

const worldListAdd = defineBlock({
  type: 'world_list_add',
  message0: 'add %1 to %2',
  args0: [
    // UNTYPED, deliberately. A list holds numbers, words or places, and which
    // is a fact about the list rather than about this block; a socket that
    // asked would be three blocks to say one thing.
    {type: 'input_value', name: 'ITEM'},
    ListVariable.field('LIST'),
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip:
    'Put something on the end of a list. Two variables holding one list both ' +
    'see it, and a variable holding nothing yet becomes a list of one.',
  generator: {
    javascript(block, generator) {
      const item = generator.valueToCode(block, 'ITEM', Order.NONE) || '0';
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      // An assignment rather than a bare `push`, which is what covers the
      // variable that held nothing (`WorldLab.addTo`).
      return `${list} = WorldLab.addTo(${list}, ${item});\n`;
    },
  },
});

/**
 * `add ⟨x⟩ to the front of ⟨queue⟩` — the other end of `add … to`.
 *
 * A list with `add … to` and `take the last off` is a STACK: the last thing in
 * is the first thing out, which is what "keep going down this branch" wants and
 * the opposite of what "deal with these in the order they turned up" wants.
 * With this and `take the first off` it is also a QUEUE, and the difference
 * between the two is the difference between a search that dives and a search
 * that spreads.
 */
const worldListAddFront = defineBlock({
  type: 'world_list_add_front',
  message0: 'add %1 to the front of %2',
  args0: [{type: 'input_value', name: 'ITEM'}, ListVariable.field('LIST')],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip:
    'Put something on the FRONT of a list, where the next “take the first ' +
    'off” will find it.',
  generator: {
    javascript(block, generator) {
      const item = generator.valueToCode(block, 'ITEM', Order.NONE) || '0';
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      return `${list} = WorldLab.addToFront(${list}, ${item});\n`;
    },
  },
});

/**
 * `take the first off ⟨queue⟩` — the front of the list, and shorter by one.
 *
 * A STATEMENT that changes the list and a VALUE that reads it would be two
 * blocks for one idea, and a learner would have to write them in the right
 * order. This is the value: it hands back what it took.
 *
 * Taking the first is O(n) on an array, and at the sizes anything here holds
 * that is not worth a ring buffer — a list a search walks is hundreds, not
 * millions. Left as it is on purpose.
 */
const worldListTakeFirst = defineBlock({
  type: 'world_list_take_first',
  message0: 'take the first off %1',
  args0: [ListVariable.field('LIST')],
  inputsInline: true,
  output: null,
  style: 'sprite_blocks',
  tooltip:
    'Take the first thing off a list and hand it back, leaving the list ' +
    'one shorter. Nothing, if the list is empty.',
  generator: {
    javascript(block, generator) {
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      return [`WorldLab.takeFirst(${list})`, Order.FUNCTION_CALL] as [
        string,
        number,
      ];
    },
  },
});

const worldListEmpty = defineBlock({
  type: 'world_list_empty',
  message0: 'empty %1',
  args0: [ListVariable.field('LIST')],
  previousStatement: true,
  nextStatement: true,
  style: 'sprite_blocks',
  tooltip: 'Take everything out of a list.',
  generator: {
    javascript(block, generator) {
      const list = generator.getVariableName(block.getFieldValue('LIST'));
      return `${list} = [];\n`;
    },
  },
});

const worldListLast = defineBlock({
  type: 'world_list_last',
  message0: 'last of %1',
  args0: [{type: 'input_value', name: 'LIST', check: LIST_CHECK}],
  inputsInline: true,
  // UNTYPED, because what a list holds is the list's business — the same
  // reason `event value` is untyped, and the same bargain: it plugs anywhere,
  // and what it means depends on where it came from.
  output: null,
  style: 'sprite_blocks',
  tooltip:
    'The last thing in a list — the end a stack is read from. An empty list ' +
    'has no last thing, and answers with nothing.',
  generator: {
    javascript(block, generator) {
      const list = generator.valueToCode(block, 'LIST', Order.NONE) || '[]';
      return [`WorldLab.lastOf(${list})`, Order.FUNCTION_CALL] as [
        string,
        number,
      ];
    },
  },
});

const worldListHas = defineBlock({
  type: 'world_list_has',
  message0: '%1 has %2',
  args0: [
    {type: 'input_value', name: 'LIST', check: LIST_CHECK},
    {type: 'input_value', name: 'ITEM'},
  ],
  inputsInline: true,
  output: 'Boolean',
  style: 'logic_blocks',
  tooltip:
    'Whether a list holds something. Two places at the same spot count as ' +
    'the same place, which `includes` alone would not say.',
  generator: {
    javascript(block, generator) {
      const list = generator.valueToCode(block, 'LIST', Order.NONE) || '[]';
      const item = generator.valueToCode(block, 'ITEM', Order.NONE) || '0';
      return [`WorldLab.listHas(${list}, ${item})`, Order.FUNCTION_CALL] as [
        string,
        number,
      ];
    },
  },
});

/**
 * `for each ⟨number ⟨n⟩⟩ in ⟨scores⟩` — one block per kind of thing.
 *
 * THREE BLOCKS RATHER THAN ONE WITH A DROPDOWN, because the thing a dropdown
 * would choose is the TYPE of the variable it binds, and a variable's type is
 * fixed once it is made: switching it would have to find, rename or replace the
 * binding, which is the machinery `define block`'s designer needs and nothing
 * else here does. Three blocks say it with none of that, and read as a family
 * with `for each actor` — which is the fourth of them and was here first.
 */
const listLoop = (
  kind: 'number' | 'word' | 'place',
  variable: {field: (name: string) => BlockArgDefinition},
  noun: string,
) =>
  defineBlock({
    type: `world_for_each_${kind}`,
    message0: `for each ${kind} %1 in %2`,
    args0: [
      variable.field('VAR'),
      {type: 'input_value', name: 'LIST', check: LIST_CHECK},
    ],
    message1: 'do %1',
    args1: [{type: 'input_statement', name: 'DO'}],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'loop_blocks',
    tooltip: `Run the blocks below once for each ${noun} in a list.`,
    generator: {
      javascript(block, generator) {
        const name = generator.getVariableName(block.getFieldValue('VAR'));
        const list = generator.valueToCode(block, 'LIST', Order.NONE) || '[]';
        const body = generator.statementToCode(block, 'DO');
        // `WorldLab.items` rather than the value itself: a variable that has
        // never been set is not a list, and a loop over one should run no
        // times rather than throw.
        return `for (const ${name} of WorldLab.items(${list})) {\n${body}}\n`;
      },
    },
  });

const worldForEachNumber = listLoop('number', NumberVariable, 'number');
const worldForEachWord = listLoop('word', StringVariable, 'word');
const worldForEachPlace = listLoop('place', VectorVariable, 'place');

/**
 * `kind of ⟨actor⟩` — which KIND a thing is, as the name a map or a dropdown
 * calls it by.
 *
 * `is a ⟨Coin⟩` answers the question a project asks, and cannot be asked at all
 * by a RULE: its dropdown names the project's own kinds, and a rule has never
 * seen them. This is the half a rule can hold — the kind as a value — so that a
 * rule taking a `kind` parameter can compare what it was given against what it
 * is looking at (`Inventory.spends a ⟨Key⟩`).
 *
 * A STRING, and the string is a module path (`actors/key`) or a world's own
 * stamped id. That is why a project should still use `is a`: this is the shape
 * a comparison needs, not a name anybody wants to type.
 */
const worldKindOf = defineBlock({
  type: 'world_kind_of',
  message0: 'kind of %1',
  args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
  inputsInline: true,
  output: 'String',
  extensions: [valueShadowExtension],
  style: 'text_blocks',
  tooltip:
    'Which kind of actor this is, as a name — for comparing one actor’s kind ' +
    'with another’s. To ask whether it is a particular kind, use “is a”.',
  generator: {
    javascript(block, generator) {
      return [
        `${oneActor(actorTarget(block, generator, Order.MEMBER))}.type`,
        Order.MEMBER,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_kind_of', [
  {name: 'ACTOR', shadow: {type: 'world_this_actor'}},
]);

/**
 * The actor an event was about — the one just touched, the one just hit.
 *
 * `event value` says the same thing untyped, and would do: this is that block
 * with a name and a type. Both matter here. The name, because "the actor this
 * event is about" is what a learner is looking for and "event value" is not
 * what they would search for; and the type, because an untyped block plugs
 * anywhere, including sockets where it means nothing.
 *
 * A BLOCK rather than a variable the hat binds, which is what this replaces.
 * A variable field on the hat offered every other Actor variable in the file —
 * a loop's `other`, a parameter — as though picking one were a meaningful
 * choice, when the hat has exactly one thing to hand over. There was nothing to
 * choose, so there should not have been a chooser.
 *
 * Only meaningful inside a handler for an event that carries an actor, and
 * unguarded for the reason `event value` is: what an event carries depends on
 * the event, and a block cannot know which handler it will end up in.
 */
const worldEventActor = defineBlock({
  type: 'world_event_actor',
  message0: '%1',
  args0: [{type: 'field_label', name: 'WORD', text: 'event actor'}],
  output: 'Actor',
  style: 'sprite_blocks',
  extensions: [actorPictureExtension],
  tooltip:
    'The actor this event is about — the one that was just touched. Only ' +
    'meaningful inside a “when” block for an event that carries an actor.',
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
  ({type: fieldColourPlugin, name, color: '#000000'}) as const;

/** Whether `colour_picker` and friends have been registered yet. */
let colorBlocksInstalled = false;

/**
 * Register Blockly's stock color blocks AND their JavaScript generators.
 *
 * These come from `@blockly/field-colour`, and until this existed they arrived
 * only as a SIDE EFFECT of the field plugin initializing — which happens when
 * the Driver registers a workspace's blocks, and therefore after anything that
 * asks what is registered.
 *
 * `standInBlocks` is what asked. It mints a placeholder for every type a
 * project's files hold that the palette does not define, and its generator
 * returns `null` so a dead reference cannot stop a file compiling. Computed
 * before the plugin had run, `colour_picker` looked dead — so a swatch in any
 * project file generated the literal `null`, and `set background color`, an
 * effect's color parameter and `set fill` all quietly drew nothing. Nothing
 * caught it because no fixture held a swatch.
 *
 * Here, at the top of the one function that builds a palette, for the same
 * reason `installColorMessages` is: it is the moment before anybody reads the
 * registry, and it is not module scope, which `Blockly.Msg` is not safe at.
 */
function installColorBlocks(): void {
  if (colorBlocksInstalled) {
    return;
  }
  colorBlocksInstalled = true;
  fieldColourPlugin.initialize?.();
}

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

/**
 * `length of ⟨…⟩` — how long a vector is.
 *
 * How fast something is going, how far apart two points are. It was written by
 * hand until now, as Pythagoras in a rule's own blocks
 * (`rules/steering`'s distance block did exactly that), which is four blocks
 * for a thing with a name.
 */
const worldVectorLength = defineBlock({
  type: 'world_vector_length',
  message0: 'length of %1',
  args0: [{type: 'input_value', name: 'VECTOR', check: 'Vector'}],
  inputsInline: true,
  output: 'Number',
  style: 'location_blocks',
  tooltip: 'How long a vector is — its speed, or a distance.',
  generator: {
    javascript(block, generator) {
      const vector =
        generator.valueToCode(block, 'VECTOR', Order.MEMBER) ||
        'new WorldLab.Vector(0, 0)';
      return [`${vector}.length()`, Order.MEMBER] as [string, number];
    },
  },
});

/**
 * `direction of ⟨…⟩` — which way a vector points, in degrees.
 *
 * 0 is to the right and 90 is DOWN, clockwise, because y is down — the same
 * convention `rotate ⟨…⟩ by ⟨…⟩°` turns in and the same one an actor's
 * rotation is drawn with. So the direction of a velocity IS the rotation that
 * faces along it, and `set rotation of ⟨me⟩ to ⟨direction of ⟨my velocity⟩⟩`
 * is a sprite that points where it is going.
 *
 * THE MISSING BLOCK. Until this, nothing in the language turned a direction
 * into an angle — no arctangent, no angle-of-a-vector, nothing. Which meant
 * `turn to face ⟨actor⟩` could not be written at all, and the Steering rule
 * shipped without it and said so in its header.
 */
const worldVectorDirection = defineBlock({
  type: 'world_vector_direction',
  message0: 'direction of %1',
  args0: [{type: 'input_value', name: 'VECTOR', check: 'Vector'}],
  inputsInline: true,
  output: 'Number',
  style: 'location_blocks',
  tooltip:
    'Which way a vector points, in degrees: 0 is right, 90 is down. The same ' +
    'angle an actor’s rotation uses, so a sprite can face the way it moves.',
  generator: {
    javascript(block, generator) {
      const vector =
        generator.valueToCode(block, 'VECTOR', Order.MEMBER) ||
        'new WorldLab.Vector(0, 0)';
      return [`${vector}.angle()`, Order.MEMBER] as [string, number];
    },
  },
});

/**
 * `⟨1⟩ in direction ⟨0⟩°` — a vector from a length and an angle.
 *
 * `direction of`'s inverse, and the half a game needs to ACT on an angle:
 * thrust the way I am facing, fire a bullet along my rotation, scatter things
 * around a circle. Written as length-then-angle because that is the order the
 * sentence wants — "5 in direction 90" — and because the length is the part a
 * learner most often plugs a speed into.
 */
const worldVectorFromAngle = defineBlock({
  type: 'world_vector_from_angle',
  message0: '%1 in direction %2°',
  args0: [
    {type: 'input_value', name: 'LENGTH', check: 'Number'},
    {type: 'input_value', name: 'DEGREES', check: 'Number'},
  ],
  inputsInline: true,
  output: 'Vector',
  extensions: [valueShadowExtension],
  style: 'location_blocks',
  tooltip:
    'A vector of this length pointing this way — 0 is right, 90 is down.',
  generator: {
    javascript(block, generator) {
      const length = generator.valueToCode(block, 'LENGTH', Order.NONE) || '1';
      const degrees =
        generator.valueToCode(block, 'DEGREES', Order.NONE) || '0';
      return [
        `WorldLab.Vector.fromAngle(${degrees}, ${length})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_vector_from_angle', [
  {name: 'LENGTH', shadow: {type: 'math_number', fields: {NUM: 1}}},
  {name: 'DEGREES', shadow: {type: 'math_number', fields: {NUM: 0}}},
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
  // The word is a FIELD so the picture beside it can replace "actor" with the
  // kind, where the block's surroundings say which (`actorAbout`).
  message0: '%1',
  args0: [{type: 'field_label', name: 'WORD', text: 'this actor'}],
  output: 'Actor',
  // Actor values share the sprite style — the color that groups the actors.
  style: 'sprite_blocks',
  extensions: [actorPictureExtension],
  tooltip: 'This actor — the one these blocks belong to.',
  generator: {
    javascript() {
      return ['actor', Order.ATOMIC] as [string, number];
    },
  },
});

/**
 * The camera a camera-scoped step is running for.
 *
 * `this actor`'s counterpart, and needed for the same reason: a step declared
 * under a trait runs once per subject with that subject BOUND, so the body has
 * to be able to name it. An actor-scoped step binds `actor`, which `this actor`
 * emits; a camera-scoped one binds `camera`, and nothing emitted that.
 *
 * Actor-typed, like `all cameras` and for the same reason: it makes the whole
 * existing vocabulary reach a camera. `set position of ⟨this camera⟩` is the
 * ordinary set-position block, and a camera answers it with its own pose
 * (core/Camera).
 */
const worldThisCamera = defineBlock({
  type: 'world_this_camera',
  message0: 'this camera',
  output: 'Actor',
  // Camera values read as actor values — the color that groups the actors.
  style: 'sprite_blocks',
  tooltip: 'This camera — the one these blocks are running for.',
  generator: {
    javascript() {
      return ['camera', Order.ATOMIC] as [string, number];
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
  extensions: [
    actorOptionsExtension,
    worldContextExtension,
    openSourceButtonExtension,
  ],
  // Actor values share the sprite style — the color that groups the actors.
  style: 'sprite_blocks',
  tooltip:
    'Every actor of this kind — the ones placed now and the ones placed later.',
  generator: {
    javascript(block, generator) {
      const actor = block.getFieldValue('ACTOR');
      const local = localActorFor(block, actor);
      // Two compilations of one idea (specs/ACTOR_LISTS.md). Plugged into a
      // handler's subject socket this is the TEMPLATE, so registering on it
      // reaches the coins placed later as well; anywhere else it is the coins
      // there are, which is what a statement acts on and a value reads.
      const parent = block.outputConnection?.targetConnection?.getSourceBlock();
      const isSubject = Boolean(parent?.type.startsWith('world_on_'));
      // A definition since deleted, or nothing chosen at all.
      //
      // On a HAT the answer is the hat's own subject: `when ⟨any …⟩ is
      // clicked` with the kind missing is a handler registered on the actor
      // the file is about, which is what a `.actor` file's hats mean anyway.
      //
      // Anywhere ELSE it is NO ACTORS, and the difference matters now that
      // this block is a list source: `for each actor ⟨each⟩ in ⟨any ⟨…⟩⟩`
      // falling back to `actor` is a loop that runs its body exactly once, on
      // the subject — a loop that looks like a loop and is not. Emitting none
      // is the bargain every other unfinished dropdown here makes
      // (`world_actors_with_trait`, `use trait`): nothing happens, visibly.
      if (!actor || (localActorBlockId(actor) && !local)) {
        return [isSubject ? 'actor' : '[]', Order.ATOMIC] as [string, number];
      }
      if (!isSubject) {
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
 * How big the world is, in world pixels — the largest map loaded into it.
 *
 * A Vector, so `x of ⟨map size⟩` reads its width, and the block that keeps a
 * camera inside the level can be written without a learner retyping numbers the
 * map already knows. The map editor's Width/Height decide it (`World.mapBounds`).
 */
const worldMapSize = defineBlock({
  type: 'world_map_size',
  message0: 'map size',
  output: 'Vector',
  extensions: [worldContextExtension],
  style: 'location_blocks',
  tooltip:
    'How big the world is, in pixels — as big as the biggest map loaded into ' +
    'it. One screen if no map has been.',
  generator: {
    javascript() {
      return ['world.mapBounds()', Order.MEMBER] as [string, number];
    },
  },
});

/**
 * Say how big the world is, in world pixels — the setter to `map size`.
 *
 * A world built from a `.map` file learns its size from the document. A world
 * that arranges its own actors (`create ⟨kind⟩ in map`) has no document, so
 * nothing ever tells it that the level is four screens wide — and every rule
 * that asks goes on answering "one screen" without complaining. That is a
 * camera that will not scroll, a "Stays in the Map" that clamps to the wrong
 * rectangle, and a `random place` that only ever picks the first screen; all
 * three fail by doing nothing, which is the worst way for a size to be wrong.
 *
 * TILES, and the block says so, although `map size` answers in pixels. A map
 * is AUTHORED in tiles — it is what the map editor's Width and Height are, and
 * what a `.map` file's `size` holds — while everything that READS a size is
 * doing arithmetic against positions, which are pixels. Each end speaks the
 * unit its own side works in, and the block is labeled rather than leaving a
 * reader to find out which.
 *
 * The placement grid reads it, so widening the map widens the editor the
 * arrangement is drawn on (fields/mapGridSize).
 */
const worldSetMapSize = defineBlock({
  type: 'world_set_map_size',
  message0: 'set size of map to x %1  y %2  tiles',
  args0: [
    {type: 'input_value', name: 'X', check: 'Number'},
    {type: 'input_value', name: 'Y', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // `worldContext`, not `builderWorld`: the live World answers this too, so
  // saying it mid-game is a legitimate thing to write rather than a mistake to
  // warn about.
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'setup_blocks',
  tooltip:
    'How big this world is, in tiles — the same Width and Height a map file ' +
    'carries. Bigger than the view means the camera has somewhere to go. A ' +
    'map loaded afterwards may still make it bigger.',
  generator: {
    javascript(block, generator) {
      const x =
        generator.valueToCode(block, 'X', Order.NONE) || String(VIEWPORT_TILES);
      const y =
        generator.valueToCode(block, 'Y', Order.NONE) || String(VIEWPORT_TILES);
      return `world.setMapSize(${x}, ${y});\n`;
    },
  },
});
registerValueShadows('world_set_map_size', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: VIEWPORT_TILES}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: VIEWPORT_TILES}}},
]);

/**
 * Say how much of the world is on screen at once — the setter to `view size`.
 *
 * The view was a constant: ten tiles square, the size the first levels were
 * built at, and the size every camera rule was written against. What it could
 * not say was the other kind of level — a room 26 by 16 meant to be taken in
 * at a glance, where a camera panning over it hides the puzzle instead of
 * following the action.
 *
 * IT IS THE NATIVE RESOLUTION, not a zoom: the driver sizes its canvas to this
 * and the pane scales that up, so a bigger view is MORE WORLD at the same tile
 * size rather than the same world drawn smaller.
 *
 * A camera still resting where it was declared moves to the middle of the new
 * view, so a world that says this and nothing else is framed exactly as a
 * smaller one was (`World.setViewSize`).
 */
const worldSetViewSize = defineBlock({
  type: 'world_set_view_size',
  message0: 'set size of view to x %1  y %2  tiles',
  args0: [
    {type: 'input_value', name: 'X', check: 'Number'},
    {type: 'input_value', name: 'Y', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // `worldContext` like the map's setter beside it: the live World answers
  // this too, so a game that changes what it shows mid-play is a thing to
  // write rather than a mistake to warn about.
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'setup_blocks',
  tooltip:
    'How much of the world is on screen at once, in tiles. Bigger shows more ' +
    'of the level at the same tile size; the map may still be bigger than ' +
    'this, which is what gives a camera somewhere to go.',
  generator: {
    javascript(block, generator) {
      const x =
        generator.valueToCode(block, 'X', Order.NONE) || String(VIEWPORT_TILES);
      const y =
        generator.valueToCode(block, 'Y', Order.NONE) || String(VIEWPORT_TILES);
      return `world.setViewSize(${x}, ${y});\n`;
    },
  },
});
registerValueShadows('world_set_view_size', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: VIEWPORT_TILES}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: VIEWPORT_TILES}}},
]);

/**
 * How big the VIEW is, in world pixels — the window onto the world.
 *
 * The standard ten tiles square until a world says otherwise with `set size of
 * view`, and a block rather than a number a learner types for two reasons: the
 * number is no longer a constant they could look up, and the one thing that
 * needs it needs half of it — a camera's position is the middle of the view, so
 * keeping the view inside the map means keeping the position half a screen in
 * from each edge.
 */
/**
 * Somewhere in the map, at random — a whole location in one block.
 *
 * Shorthand for what a learner would otherwise assemble from two randoms, a
 * `map size`, two components, two multiplies and a `vector of`: about eight
 * blocks to say "anywhere". Scattering things about is common enough — an
 * asteroid field, a coin drop, a spawn point — to be worth a word of its own.
 *
 * It reads the map's size itself, which is the part worth having. A learner
 * building this by hand has to know that "the map" is a thing you can ask
 * about, and has to keep the numbers honest when the map is later resized.
 *
 * `world.randomPlace()` rather than the arithmetic inlined here, so the
 * builder answers it too: scattering asteroids while describing a world reads
 * the same as spawning one mid-game.
 *
 * Feeding `set position`, which takes an x and a y rather than a vector, means
 * two of these under two `x of`/`y of` — two draws, not one. That is still a
 * uniformly random point (the axes are independent), just more arithmetic than
 * it looks like; nothing is subtly wrong with the result.
 */
const worldRandomPlace = defineBlock({
  type: 'world_random_place',
  message0: 'a random place in the map',
  output: 'Vector',
  extensions: [worldContextExtension],
  // Location-colored, like `map size` and `vector of`. It is listed under
  // Math beside the random number so the two are found together, but it is a
  // place, and looking like one matters more than matching its category.
  style: 'location_blocks',
  tooltip:
    'A random spot somewhere in the map — anywhere from one corner to the ' +
    'other. Different every time it runs.',
  generator: {
    javascript() {
      return ['world.randomPlace()', Order.MEMBER] as [string, number];
    },
  },
});

/**
 * The world's clock, in seconds — what "two seconds later" is measured against.
 *
 * A plain number rather than any kind of timer block, because a timer is three
 * decisions (when it starts, what it does, whether it repeats) and a clock is
 * none. `time − when it started > 2` says the same thing out of parts a learner
 * already has, and it composes: a fire-rate cooldown, a respawn delay and an
 * invulnerability window are all that comparison with different numbers.
 *
 * See {@link World.time} for why it counts ticks rather than reading a clock.
 * The short version is that a paused game does not age and that this agrees
 * exactly with anything integrated from `delta`.
 */
const worldTime = defineBlock({
  type: 'world_time',
  message0: 'time',
  output: 'Number',
  extensions: [worldContextExtension],
  // With `delta`, which is the other ambient reading of the clock and the block
  // a learner will have met first.
  style: 'variable_blocks',
  tooltip:
    'Seconds since the game started. Every block in one frame sees the same ' +
    'value, and it stops counting while the game is paused.',
  generator: {
    javascript() {
      return ['world.time()', Order.MEMBER] as [string, number];
    },
  },
});

/**
 * How long an actor has been in the world.
 *
 * The half of time that a spawned thing needs about ITSELF. A bullet cannot ask
 * the world's clock what to compare against without also being told when it was
 * fired, which means somewhere to keep that — a property, on a trait, on a rule.
 * Its own age needs none of that: `remove actor ⟨this actor⟩ if age of ⟨this
 * actor⟩ > 2` is the whole of a bullet's lifetime.
 *
 * Read from the world's clock rather than counted up in a step, so it costs
 * nothing per frame and is right for an actor with no steps at all.
 */
const worldActorAge = defineBlock({
  type: 'world_actor_age',
  message0: 'age of %1',
  args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
  inputsInline: true,
  output: 'Number',
  extensions: [subjectInputExtension('actor')],
  style: valueStyle('number'),
  tooltip:
    'Seconds since this actor was added to the world. Zero for one that is ' +
    'not in a world.',
  generator: {
    javascript(block, generator) {
      const subject = oneActor(actorTarget(block, generator, Order.MEMBER));
      return [`${subject}.age()`, Order.MEMBER] as [string, number];
    },
  },
});

const worldViewSize = defineBlock({
  type: 'world_view_size',
  message0: 'view size',
  output: 'Vector',
  extensions: [worldContextExtension],
  style: 'location_blocks',
  tooltip: 'How big the window onto the world is, in pixels.',
  generator: {
    javascript() {
      return ['world.viewSize()', Order.MEMBER] as [string, number];
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
 * How many of one KIND a value holds — `how many ⟨Coin⟩ in ⟨…⟩`.
 *
 * `how many actors in ⟨…⟩` counts everything, and the question a game asks is
 * almost never that: it is how many coins the player has, how many bricks are
 * left, how many lives. The general form of the narrowing is a filter block
 * that does not exist yet, and it would read
 *
 *     how many actors in ⟨every actor ⟨it⟩ in ⟨…⟩ where ⟨⟨it⟩ is a ⟨Coin⟩⟩⟩
 *
 * which is four blocks and a bound variable to ask one short question. So the
 * short question gets a block. `is a` is where the kind dropdown comes from and
 * what the generated code compares, so the two cannot disagree about what a
 * kind is.
 *
 * The socket is a LIST — it seeds `all actors`, not `this actor`, since `how
 * many ⟨Coin⟩ in ⟨this actor⟩` is a sentence with one possible answer.
 */
const worldCountOfKind = defineBlock({
  type: 'world_count_of_kind',
  message0: 'how many %1 in %2',
  args0: [
    {type: 'field_dropdown', name: 'TYPE', options: actorFieldOptions},
    {type: 'input_value', name: 'LIST', check: 'Actor'},
  ],
  inputsInline: true,
  output: 'Number',
  extensions: [
    actorTypeOptionsExtension,
    valueShadowExtension,
    openSourceButtonExtension,
  ],
  style: 'math_blocks',
  tooltip:
    'How many actors of one kind a value holds — the collected things, the ' +
    'actors touching, whatever list it is asked of.',
  generator: {
    javascript(block, generator) {
      const list = actorTarget(block, generator, Order.NONE, 'LIST');
      const chosen = block.getFieldValue('TYPE');
      // The same resolution `world_is_a` does: a world's own `define actor` is
      // stamped with its id, a project template with its module path.
      const modulePath = localActorFor(block, chosen)?.type ?? chosen;
      return [
        `WorldLab.all(${list.code}).filter(each => each.type === ${str(
          modulePath,
        )}).length`,
        Order.MEMBER,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_count_of_kind', [
  {name: 'LIST', shadow: {type: 'world_all_actors'}},
]);

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

/**
 * `for each actor ⟨each⟩ in ⟨…⟩` — walk a list, run a body.
 *
 * It USED TO TEST as it went (`… where ⟨…⟩`), and the test was welded on
 * because there was nowhere else to put it. Now there is: filtering is a value
 * (`world_filter_actors`), so a loop that wants only some of a list walks a
 * list that is only some of it, and a loop that wants all of it is not carrying
 * a socket saying `true` (specs/ACTOR_LISTS.md).
 */
const worldForEach = defineBlock({
  type: 'world_for_each',
  message0: 'for each actor %1 in %2',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // Iterates a source, so warn where `world` is unbound (the default source is
  // the world's own actors); the SOURCE socket seeds `all actors`, so a loop
  // dragged out walks the world.
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'loop_blocks',
  tooltip:
    'Run the blocks once for each actor in a list. Bind the loop variable to ' +
    'read the current actor. Only valid where a world is known.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const body = generator.statementToCode(block, 'DO');
      return `for (const ${variable} of ${actorSource(block, generator)}) {\n${body}}\n`;
    },
  },
});
registerValueShadows('world_for_each', [
  {name: 'SOURCE', shadow: actorListShadow},
]);

/**
 * `count with ⟨i⟩ from ⟨0⟩ to ⟨8⟩ by ⟨1⟩` — the loop that knows which time it is.
 *
 * `for each` walks actors and `repeat` walks nothing: neither hands the body a
 * number, so "nine coins, each spinning a little faster than the last" could
 * only be written as nine blocks — or, as it was, as nine placements carrying
 * values no editor can set (specs/MAPS.md, and the `create in map` popup, which
 * places prefabs and has no inspector).
 *
 * OURS RATHER THAN BLOCKLY'S `controls_for`, for the reason `for each` is ours:
 * the counter is a NUMBER and this lab's variables are typed, so it binds the
 * Number flavour and the body reads it with `variables_get_Number` — which fits
 * a number socket and nothing else. Blockly's would mint an untyped variable
 * that no getter in this toolbox can read.
 */
const worldCountWith = defineBlock({
  type: 'world_count_with',
  message0: 'count with %1 from %2 to %3 by %4',
  args0: [
    paramFlavour('number').field('VAR'),
    {type: 'input_value', name: 'FROM', check: 'Number'},
    {type: 'input_value', name: 'TO', check: 'Number'},
    {type: 'input_value', name: 'BY', check: 'Number'},
  ],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [valueShadowExtension],
  style: 'loop_blocks',
  tooltip:
    'Run the body once for each number from the first to the last, counting ' +
    'by the step. The counter is a number the body can read.',
  generator: {
    javascript(block, generator) {
      const name = generator.getVariableName(block.getFieldValue('VAR'));
      const from = generator.valueToCode(block, 'FROM', Order.NONE) || '0';
      const to = generator.valueToCode(block, 'TO', Order.NONE) || '0';
      const by = generator.valueToCode(block, 'BY', Order.NONE) || '1';
      const body = generator.statementToCode(block, 'DO');
      // Counting DOWN is as reasonable as counting up, and a learner who types
      // a negative step means it — so the test follows the step's sign rather
      // than assuming the first number is the smaller one.
      const step = generator.getVariableName(`${block.id}_step`);
      return (
        `const ${step} = ${by} || 1;\n` +
        `for (let ${name} = ${from}; ${step} > 0 ? ${name} <= ${to} : ` +
        `${name} >= ${to}; ${name} += ${step}) {\n${body}}\n`
      );
    },
  },
});
registerValueShadows('world_count_with', [
  {name: 'FROM', shadow: {type: 'math_number', fields: {NUM: 1}}},
  {name: 'TO', shadow: {type: 'math_number', fields: {NUM: 10}}},
  {name: 'BY', shadow: {type: 'math_number', fields: {NUM: 1}}},
]);

/**
 * `the actors ⟨c⟩ in ⟨…⟩ where ⟨…⟩` — a filtered list, as a value.
 *
 * The loop's three parts with the loop taken off: a variable to call the actor
 * being considered, a source to look through, a test to apply. What the loop
 * did with each match, this hands back.
 *
 * It is what let `for each` drop its `where` and `first actor … where` be
 * deleted (specs/ACTOR_LISTS.md). Both were this block with something welded
 * onto the end of it, and the welding is why neither could be reused for
 * `ordered by` or `take`.
 *
 * LAZY: the source is read as this is built, the test as the result is walked.
 * So `first actor in ⟨the actors … where …⟩` stops at the first match, which is
 * the short-circuit the deleted block promised.
 */
/**
 * `play sound ⟨pop ▾⟩` — a noise, once, now.
 *
 * A MOMENT, and the first thing this language has been able to say happened
 * (specs/SOUND.md). It queues on the world; the driver drains the queue after
 * the tick and plays what it finds.
 *
 * NO SUBJECT. A sound has no position in this lab — there is no listener, so
 * there is nothing for a position to mean — and an actor socket would be
 * promising panning that does not exist. `set position of` takes a subject
 * because a position is a fact about an actor; this is a fact about the moment.
 */
const worldPlaySound = defineBlock({
  type: 'world_play_sound',
  message0: 'play sound %1',
  args0: [{type: 'field_dropdown', name: 'SOUND', options: soundImportOptions}],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  // `world.playSound` is the world's, so the block warns where no world is
  // bound — the same guard `all actors` carries. The import extension goes
  // LAST: it wraps whatever validator the options extension installed.
  extensions: [
    soundOptionsExtension,
    worldContextExtension,
    soundImportFieldExtension,
  ],
  style: 'default',
  tooltip: 'Play a sound once. Choose one the project holds, or import one.',
  generator: {
    javascript(block) {
      const sound = block.getFieldValue('SOUND');
      // Nothing chosen — the project holds no sounds, or the file this named
      // has been deleted. Nothing rather than `world.playSound()`, which would play
      // silence loudly by throwing (the bargain every unfinished dropdown here
      // makes).
      if (!sound || sound === IMPORT_SOUND_VALUE) {
        return '';
      }
      return `world.playSound(${str(sound)});\n`;
    },
  },
});

/**
 * `set music to ⟨theme ▾⟩` — the track this world plays.
 *
 * STATE, where `play sound` is a moment, and the difference is the whole of the
 * sound design: this is in the world's snapshot and patches on hot reload the
 * way the sky does, so swapping the track while the game runs swaps the track
 * rather than restarting the game around a learner who was listening to it.
 *
 * SILENCE IS A BLOCK, not a row in this menu. It was `(none)` here, on the
 * argument that a world either has music or it does not — and the row only
 * ever appeared when the project had no sounds at all (`orNone`'s fallback),
 * so in a project with one track there was no way to say "stop" and this
 * block's tooltip named a row nobody could pick. `stop music` says it, where
 * a sentence beginning "set music to" was never going to be where somebody
 * looked for it anyway.
 *
 * So an empty value here is an UNFINISHED BLOCK, as it is everywhere else in
 * the palette: it generates nothing rather than silencing a world by accident
 * — which is what a saved block whose track was deleted would otherwise do.
 */
const worldSetMusic = defineBlock({
  type: 'world_set_music',
  message0: 'set music to %1',
  args0: [{type: 'field_dropdown', name: 'SOUND', options: soundImportOptions}],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [
    soundOptionsExtension,
    worldContextExtension,
    soundImportFieldExtension,
  ],
  style: 'default',
  tooltip:
    'Play a track over and over, replacing whatever was playing. “stop music” ' +
    'is how it stops.',
  generator: {
    javascript(block) {
      const sound = block.getFieldValue('SOUND');
      // Nothing chosen, or the import row still in the field: unfinished
      // either way.
      if (!sound || sound === IMPORT_SOUND_VALUE) {
        return '';
      }
      return `world.setMusic(${str(sound)});\n`;
    },
  },
});

/**
 * `stop music` — silence, deliberately said.
 *
 * The other half of `set music to`, and a block rather than a row in its menu
 * for the reason that block's header gives. It takes no argument: a world has
 * one track, so there is nothing to name.
 */
const worldStopMusic = defineBlock({
  type: 'world_stop_music',
  message0: 'stop music',
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'default',
  tooltip: 'Stop the track that is playing. Sounds already playing carry on.',
  generator: {
    javascript() {
      return 'world.setMusic(undefined);\n';
    },
  },
});

/**
 * `stop all sounds` — silence, everything, now.
 *
 * NOT `stop music` twice over: that one ends the track and leaves the effects
 * alone, and this ends both. What makes it a separate block rather than a
 * flag on the other is that they are wanted at different moments — a scene
 * changing its music, against a game being paused or lost.
 *
 * A MOMENT, like `play sound`, and raised through the same queue so that the
 * order inside one tick is kept: `play sound ⟨pop⟩` after this one still pops
 * (`World.stopSounds`).
 */
const worldStopAllSounds = defineBlock({
  type: 'world_stop_all_sounds',
  message0: 'stop all sounds',
  previousStatement: true,
  nextStatement: true,
  extensions: [worldContextExtension],
  style: 'default',
  tooltip:
    'Stop everything that is making a noise, the music included. Sounds ' +
    'played after this one still play.',
  generator: {
    javascript() {
      return 'world.stopSounds();\n';
    },
  },
});

const worldFilterActors = defineBlock({
  type: 'world_filter_actors',
  message0: 'the actors %1 in %2 where %3',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {type: 'input_value', name: 'WHERE', check: 'Boolean'},
  ],
  output: 'Actor',
  // The default source is the world's own actors, so `world` has to be bound.
  extensions: [worldContextExtension, valueShadowExtension],
  // Actor values share the sprite color — what a block hands over is what its
  // color says, and this one hands over actors.
  style: 'sprite_blocks',
  tooltip:
    'The actors the “where” test accepts. Bind the variable to read the actor ' +
    'being considered. When none of them match it answers with no actors.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const where = generator.valueToCode(block, 'WHERE', Order.NONE) || 'true';
      return [
        `WorldLab.filtered(${actorSource(block, generator)}, ${variable} => ${where})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_filter_actors', [
  {name: 'SOURCE', shadow: actorListShadow},
  {name: 'WHERE', shadow: {type: 'logic_boolean', fields: {BOOL: 'TRUE'}}},
]);

/**
 * `the actors in ⟨…⟩ within ⟨100⟩ of ⟨this actor⟩` — the neighborhood.
 *
 * The filter every flock, swarm and crowd is written with, and the one shape of
 * `filter actors` worth a block of its own: said with the general filter it is
 * a distance formula spelled out in arithmetic — a square root and two
 * subtractions — in front of a lesson that is about none of it.
 *
 * Middles, not edges, and never the actor measured from; near ANY of several,
 * when several are given. `WorldLab.within` holds those three decisions and
 * says why (`engine/rules/spatial`).
 */
const worldActorsWithin = defineBlock({
  type: 'world_actors_within',
  message0: 'the actors in %1 within %2 of %3',
  args0: [
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {type: 'input_value', name: 'DISTANCE', check: 'Number'},
    {type: 'input_value', name: 'OF', check: 'Actor'},
  ],
  inputsInline: true,
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'The actors near something: the ones whose middle is within so many ' +
    'pixels of it. What it is measured from is never in the answer — a thing ' +
    'is not near itself — and when several are given it means near any of them.',
  generator: {
    javascript(block, generator) {
      const distance =
        generator.valueToCode(block, 'DISTANCE', Order.NONE) || '0';
      const of = generator.valueToCode(block, 'OF', Order.NONE) || '[]';
      return [
        `WorldLab.within(${actorSource(block, generator)}, ${of}, ${distance})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
/**
 * `the ⟨any Coin⟩ within ⟨80⟩ of ⟨place⟩` — near a PLACE, out of the whole world.
 *
 * The sibling of `the actors in ⟨…⟩ within ⟨…⟩ of ⟨…⟩`, and the difference is
 * the two ends. That one filters a list you already have, measured from an
 * ACTOR; this one asks the world, measured from a POINT — which is the form
 * every question about somewhere you are not takes: is this square clear, what
 * is near where I am going, what would I hit if I stood here.
 *
 * IT IS AN INDEXED QUESTION (`core/spatialIndex`). Written with `filter` over
 * `all actors` the same sentence is a scan, and a search asking it four hundred
 * times in a row is the difference between a path and a frozen frame.
 *
 * Middles, not edges, as `within` measures — and unlike `within` it does NOT
 * leave out what it measures from, because there is nothing there to leave out:
 * a point is not an actor, and a search asking whether a square is taken wants
 * to be told about the thing standing on it.
 */
const worldNearPlaceOfKind = defineBlock({
  type: 'world_near_place_kind',
  message0: 'the %1 within %2 of %3',
  args0: [
    {type: 'field_dropdown', name: 'ACTOR', options: actorFieldOptions},
    {type: 'input_value', name: 'DISTANCE', check: 'Number'},
    {type: 'input_value', name: 'PLACE', check: 'Vector'},
  ],
  inputsInline: true,
  output: 'Actor',
  extensions: [
    actorOptionsExtension,
    worldContextExtension,
    valueShadowExtension,
    openSourceButtonExtension,
  ],
  style: 'sprite_blocks',
  tooltip:
    'The actors of a kind whose middle is within so many pixels of a place. ' +
    'Asked of the whole world, and answered without looking at all of it.',
  generator: {
    javascript(block, generator) {
      const distance =
        generator.valueToCode(block, 'DISTANCE', Order.NONE) || '0';
      const place = generator.valueToCode(block, 'PLACE', Order.NONE) || '0';
      // Nothing chosen at all is `(any)`, and asking the resolver about it
      // would be asking whether the empty string names a local actor.
      const actor = block.getFieldValue('ACTOR');
      const local = actor ? localActorFor(block, actor) : undefined;
      // A definition since deleted names nothing, and finds nothing — the
      // bargain every unfinished dropdown here makes.
      if (actor && localActorBlockId(actor) && !local) {
        return ['[]', Order.ATOMIC] as [string, number];
      }
      // Nothing chosen is `(any)`: every kind, which is what the word says.
      const type = actor ? (local?.type ?? actor) : undefined;
      const only = type ? `, {type: ${str(type)}}` : '';
      return [
        `world.actorsNear(${place}, ${distance}${only})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_near_place_kind', [
  {name: 'DISTANCE', shadow: {type: 'math_number', fields: {NUM: 80}}},
  {name: 'PLACE', shadow: {type: 'world_vector'}},
]);

/**
 * `the actors with ⟨Solid⟩ within ⟨80⟩ of ⟨place⟩` — the same, asked by ability.
 *
 * Two blocks rather than one with both dropdowns, because one would read `the
 * ⟨any⟩ ⟨any⟩ within ⟨80⟩ of ⟨…⟩` in the common case and a learner reaching for
 * "the coins near here" should not have to read past a socket they do not want.
 * They share the index and the sentence; only the noun differs.
 */
const worldNearPlaceWithTrait = defineBlock({
  type: 'world_near_place_trait',
  message0: 'the actors with %1 within %2 of %3',
  args0: [
    {type: 'field_dropdown', name: 'TRAIT', options: anyTraitOptions},
    {type: 'input_value', name: 'DISTANCE', check: 'Number'},
    {type: 'input_value', name: 'PLACE', check: 'Vector'},
  ],
  inputsInline: true,
  output: 'Actor',
  extensions: [
    worldContextExtension,
    anyTraitOptionsExtension,
    valueShadowExtension,
  ],
  style: 'sprite_blocks',
  tooltip:
    'The actors with a given ability whose middle is within so many pixels ' +
    'of a place — the walls near a step, the solid things around a spawn.',
  generator: {
    javascript(block, generator) {
      const distance =
        generator.valueToCode(block, 'DISTANCE', Order.NONE) || '0';
      const place = generator.valueToCode(block, 'PLACE', Order.NONE) || '0';
      const trait = block.getFieldValue('TRAIT');
      const ref = trait ? refFromValue(trait) : undefined;
      if (!ref || !refResolves(ref)) {
        return ['[]', Order.ATOMIC] as [string, number];
      }
      return [
        `world.actorsNear(${place}, ${distance}, {trait: ${refCode(ref, generator)}})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});

registerValueShadows('world_near_place_trait', [
  {name: 'DISTANCE', shadow: {type: 'math_number', fields: {NUM: 80}}},
  {name: 'PLACE', shadow: {type: 'world_vector'}},
]);

registerValueShadows('world_actors_within', [
  {name: 'SOURCE', shadow: actorListShadow},
  {name: 'DISTANCE', shadow: {type: 'math_number', fields: {NUM: 100}}},
  {name: 'OF', shadow: {type: 'world_this_actor'}},
]);

/**
 * `first actor in ⟨…⟩` — one actor, by position.
 *
 * What every value socket already does silently. `ACTOR_LISTS.md` calls that
 * the one place the design is quieter than it should be — "a learner who asks a
 * question of many actors gets an answer about one of them and is not told" —
 * and this is how a program says it on purpose.
 *
 * Not an index block: there is no number in it, so there is no off-by-one to
 * get wrong, which is what kept `item ⟨3⟩ of` out.
 */
const worldFirstActor = defineBlock({
  type: 'world_first_actor',
  message0: 'first actor in %1',
  args0: [{type: 'input_value', name: 'SOURCE', check: 'Actor'}],
  inputsInline: true,
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'The first actor a value holds. When it holds none it answers with no ' +
    'actors, so a statement using it does nothing rather than failing.',
  generator: {
    javascript(block, generator) {
      return [
        `WorldLab.firstOf(${actorSource(block, generator)})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_first_actor', [
  {name: 'SOURCE', shadow: {type: 'world_all_actors'}},
]);

/**
 * `⟨a⟩ is ⟨b⟩` — whether two actor values are the same actor.
 *
 * The language could compare two numbers, two words, two places and two
 * colors, and could not compare two ACTORS. Nothing noticed until something
 * had to say "another one" — a pad choosing a different pad, an enemy picking
 * a target that is not itself — and until this block those were all written as
 * "not at the same x", which is true right up until two of them are stacked.
 */
const worldSameActor = defineBlock({
  type: 'world_same_actor',
  message0: '%1 is %2',
  args0: [
    {type: 'input_value', name: 'A', check: 'Actor'},
    {type: 'input_value', name: 'B', check: 'Actor'},
  ],
  inputsInline: true,
  output: 'Boolean',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'logic_blocks',
  tooltip:
    'Whether these are the same actor. Two actors with everything in common ' +
    'are still two actors, and a value holding no actors is not the same as ' +
    'anything, including itself.',
  generator: {
    javascript(block, generator) {
      const a = generator.valueToCode(block, 'A', Order.NONE) || '[]';
      const b = generator.valueToCode(block, 'B', Order.NONE) || '[]';
      return [`WorldLab.isSameActor(${a}, ${b})`, Order.FUNCTION_CALL] as [
        string,
        number,
      ];
    },
  },
});

/**
 * `any actor in ⟨…⟩` — one of them, chosen afresh each time it is asked.
 *
 * The sibling of `first actor in`, and the one a game usually wants: "the
 * first" is a decision most programs did not mean to make. A teleport pad
 * picking another pad, a spawner picking a spawn point, a quiz picking a
 * question — all three read the same list every time and, with `first`, get
 * the same answer every time.
 *
 * It answers with a LIST of one or of none, exactly as `first` does, so an
 * empty source is the ordinary "no actors" outcome.
 */
const worldAnyActor = defineBlock({
  type: 'world_any_actor',
  message0: 'any actor in %1',
  args0: [{type: 'input_value', name: 'SOURCE', check: 'Actor'}],
  inputsInline: true,
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'One of the actors a value holds, picked at random each time it is ' +
    'asked. When it holds none it answers with no actors, so a statement ' +
    'using it does nothing rather than failing.',
  generator: {
    javascript(block, generator) {
      return [
        `WorldLab.anyOf(${actorSource(block, generator)})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_any_actor', [
  {name: 'SOURCE', shadow: {type: 'world_all_actors'}},
]);

/**
 * `all actors with trait ⟨T⟩` — the filter that is written more than all the
 * others together.
 *
 * Ten of the eighteen filtered loops in the stock rules test exactly this, and
 * the engine has answered it since before there were lists
 * (`ActorCollection.with`). Said with the general filter it costs a nesting and
 * a second variable field showing the same name; said with this it costs a
 * dropdown, and the loop that walks it is SHORTER than the `for each … where`
 * it replaces.
 *
 * Every trait, not only an actor's, for the reason `has trait` gives: a
 * camera's value is Actor-typed on purpose, so a loop over cameras is
 * indistinguishable from one over actors and narrowing the list would hide the
 * camera traits from it.
 */
const worldActorsWithTrait = defineBlock({
  type: 'world_actors_with_trait',
  message0: 'all actors with trait %1',
  args0: [{type: 'field_dropdown', name: 'TRAIT', options: anyTraitOptions}],
  output: 'Actor',
  extensions: [worldContextExtension, anyTraitOptionsExtension],
  style: 'sprite_blocks',
  tooltip: 'Every actor in the world that has a given trait.',
  generator: {
    javascript(block, generator) {
      const trait = block.getFieldValue('TRAIT');
      // "(none)" — no rule in play declares a trait. An unfinished block emits
      // no actors rather than `world.actors.with()`, which throws.
      if (!trait) {
        return ['[]', Order.ATOMIC] as [string, number];
      }
      const ref = refFromValue(trait);
      if (!refResolves(ref)) {
        return ['[]', Order.ATOMIC] as [string, number];
      }
      return [
        `world.actors.with(${refCode(ref, generator)})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});

/**
 * `the actor ⟨c⟩ in ⟨…⟩ with the ⟨least ▾⟩ ⟨…⟩` — the closest, the biggest.
 *
 * NOT sugar for `first actor in ⟨… ordered by …⟩`. That spelling sorts n actors
 * to answer a question about one; this is a single pass with no allocation. And
 * since "the nearest enemy" and "the biggest asteroid" are most of what a game
 * asks of an ordering, this is the block that gets used and the sort is the
 * rarer one.
 *
 * The key is an EXPRESSION over the bound variable rather than a dropdown of
 * built-in orderings, so closest, furthest, biggest, weakest and oldest are one
 * block with different keys instead of five blocks. `least`/`most` is a field
 * because reversing an order is not a different question.
 */
const worldExtremeActor = defineBlock({
  type: 'world_extreme_actor',
  message0: 'the actor %1 in %2 with the %3 %4',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {
      type: 'field_dropdown',
      name: 'END',
      options: [
        ['least', 'least'],
        ['most', 'most'],
      ],
    },
    {type: 'input_value', name: 'KEY', check: 'Number'},
  ],
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'The one actor whose value is the smallest (or the largest). Bind the ' +
    'variable to read the actor being measured. When there are none to choose ' +
    'between it answers with no actors.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const key = generator.valueToCode(block, 'KEY', Order.NONE) || '0';
      const most = block.getFieldValue('END') === 'most';
      return [
        `WorldLab.extreme(${actorSource(block, generator)}, ${variable} => ${key}, ${most})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_extreme_actor', [
  {name: 'SOURCE', shadow: actorListShadow},
  {name: 'KEY', shadow: {type: 'math_number', fields: {NUM: 0}}},
]);

/**
 * `the actors ⟨c⟩ in ⟨…⟩ ordered by ⟨…⟩ ⟨least first ▾⟩`.
 *
 * STRICT, and it cannot be otherwise: the first item of an ordering is not
 * knowable without seeing all of it. Which is the second reason `with the
 * least` is a block rather than sugar for the first of one of these.
 *
 * Ties keep the world's order — the source is snapshotted and the sort is
 * stable — so two actors the key cannot tell apart come out in the order they
 * were added, which is what everything else here yields.
 *
 * Worth having only because `take ⟨n⟩ of` is beside it: an ordering nobody
 * takes the front of is a list in a different order, and no game asked for one.
 */
const worldOrderedActors = defineBlock({
  type: 'world_ordered_actors',
  message0: 'the actors %1 in %2 ordered by %3 %4',
  args0: [
    ActorVariable.field('VAR'),
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
    {type: 'input_value', name: 'KEY', check: 'Number'},
    {
      type: 'field_dropdown',
      name: 'END',
      options: [
        ['least first', 'least'],
        ['most first', 'most'],
      ],
    },
  ],
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'The actors in order of what the value says about each. Bind the variable ' +
    'to read the actor being measured. Actors it cannot tell apart keep the ' +
    'order they were added in.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const key = generator.valueToCode(block, 'KEY', Order.NONE) || '0';
      const descending = block.getFieldValue('END') === 'most';
      return [
        `WorldLab.ordered(${actorSource(block, generator)}, ${variable} => ${key}, ${descending})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_ordered_actors', [
  {name: 'SOURCE', shadow: actorListShadow},
  {name: 'KEY', shadow: {type: 'math_number', fields: {NUM: 0}}},
]);

/**
 * `take ⟨3⟩ of ⟨…⟩` — the front of a list.
 *
 * What makes `ordered by` worth having: "the three nearest" is the reason to
 * order at all. Lazy, so taking three of a filter tests until it has three
 * rather than testing everything and dropping most of it.
 *
 * A count of zero or less is no actors, which is ordinary here — `for each`
 * over it runs nothing and `how many actors in` is 0.
 */
const worldTakeActors = defineBlock({
  type: 'world_take_actors',
  message0: 'take %1 of %2',
  args0: [
    {type: 'input_value', name: 'COUNT', check: 'Number'},
    {type: 'input_value', name: 'SOURCE', check: 'Actor'},
  ],
  inputsInline: true,
  output: 'Actor',
  extensions: [worldContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'The first few actors of a list. Asking for more than there are ' +
    'gives all of them.',
  generator: {
    javascript(block, generator) {
      const count = generator.valueToCode(block, 'COUNT', Order.NONE) || '0';
      return [
        `WorldLab.taken(${actorSource(block, generator)}, ${count})`,
        Order.FUNCTION_CALL,
      ] as [string, number];
    },
  },
});
registerValueShadows('world_take_actors', [
  {name: 'COUNT', shadow: {type: 'math_number', fields: {NUM: 3}}},
  {name: 'SOURCE', shadow: {type: 'world_all_actors'}},
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
  extensions: [
    actorInputExtension,
    actorTypeOptionsExtension,
    openSourceButtonExtension,
  ],
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
      // `?.` because a value may hold NO actors, which every other value
      // socket in the language treats as the ordinary outcome — `first actor
      // in ⟨an empty list⟩` answers with none rather than failing. This block
      // read `.type` off it and threw, which made "is the thing in this hole a
      // Pilot" a question that could not be asked of an empty hole. No actor
      // is not a Pilot, so the answer is false.
      return [
        `${oneActor(target)}?.type === ${str(modulePath)}`,
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
const importVar = (path: string): string =>
  // THE WHOLE PATH, not the file name. It was the last segment, and a project
  // holding `actors/healthBar` and `rules/healthBar` — which is exactly what
  // importing the stock Health Bar gives you — emitted two different imports
  // under one name and would not compile: "The symbol HealthBar has already
  // been declared". Any actor and rule sharing a name did it; the stock shelf
  // is just where it finally happened.
  //
  // `pathSlug` is the same folder-and-file name the property and action block
  // types are minted from, so a module's import reads like its blocks do.
  pathSlug(path.replace(/\.[^./]+$/, '')) || 'Module';

/** Register a hoisted top-level import; Blockly's `finish()` emits it, deduped. */
const addImport = (generator: unknown, key: string, code: string): void => {
  (generator as {definitions_: Record<string, string>}).definitions_[key] =
    code;
};

const worldAddActor = defineBlock({
  type: 'world_add_actor',
  message0: 'add actor %1',
  // No `as …` in the JSON: the choice is built only where there is another
  // actor to shadow, so a world placing its level reads `add actor ⟨Coin⟩` and
  // nothing more (extensions/addActorName).
  args0: [{type: 'field_dropdown', name: 'ACTOR', options: actorFieldOptions}],
  message1: 'do %1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  // Placed while describing a world, and SPAWNED while one runs: a bullet, a
  // split asteroid, an enemy on a timer. Both, because the live World takes the
  // same arguments the builder does (`World.addActor`) — so no context guard,
  // and the block reads the same wherever it sits.
  extensions: [
    actorImportOptionsExtension,
    addActorNameExtension,
    // After the options extension, so it wraps that validator rather than
    // being wrapped by it (see `actorImportField`).
    actorImportFieldExtension,
    openSourceButtonExtension,
    // …and the way back to the lesson it was met in
    // (extensions/lessonButton).
    lessonButtonExtension,
  ],
  // Optional `as ⟨…⟩`, which is what lets a body reach the actor that DID the
  // placing: unticked the new actor is `this actor` as it always was, ticked it
  // is a variable and `this actor` keeps meaning the enclosing one.
  mutator: addActorNameMutator,
  style: 'behavior_blocks',
  tooltip:
    'Place an instance of an actor and set its per-instance properties. ' +
    'Tick “as” to name it, so “this actor” still means the actor placing it.',
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
      // (e.g. set position) target it. The block id is the stable instance id
      // — unique per WORLD, which is what a placement needs, and not unique per
      // CALL, so a spawn running every frame gets an ordinal after the first
      // (`World.resolveInstanceId`). The block id is
      // the module path is the actor's kind (its `type`), so "for each … I'm
      // touching" matches it regardless of the template's authored name.
      // Which layer it lands in — its nearest layer ancestor, or the default
      // (blockly/layers). Resolved lexically, so no layer context exists at
      // runtime and nothing has to track one.
      // Named, so the placed actor is a variable and `actor` is left alone —
      // the body's `this actor` goes on meaning whatever encloses this block.
      // Unnamed, `const actor` shadows as it always has, which is the reading
      // a `.world` file needs and every saved project already relies on.
      const binding = namesPlacedActor(block)
        ? generator.getVariableName(block.getFieldValue('VAR'))
        : 'actor';
      return (
        `{\nconst ${binding} = world.addActor(${template}, ${str(
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
  // Was `builderWorld`, on the grounds that the live world had no `define` or
  // `loadMap`. It has both now (`World.loadMap`), and this block generates the
  // same two calls wherever it lands — so what is left to check is the ordinary
  // question of whether `world` is bound to anything.
  extensions: [
    actorImportOptionsExtension,
    worldContextExtension,
    actorImportFieldExtension,
    openSourceButtonExtension,
  ],
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
  // NOT builder-only, though it was: `define` and `loadMap` are the live
  // World's as well now, so this block means the same thing in a handler as
  // under `define world` — which is what a door to a second room is made of
  // (`clear world`, then this).
  extensions: [
    mapOptionsExtension,
    worldContextExtension,
    openSourceButtonExtension,
  ],
  style: 'setup_blocks',
  tooltip:
    'Place all the actors a map file describes into the world. In a handler ' +
    'it loads a map while the game runs — with "clear world" first, that is ' +
    'how a game goes from one room to another.',
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
  // The `with` is a word waiting for a field: the rules button is appended
  // after it by the extension below, so the block reads `define world named
  // ⟨Platform World⟩ with ⟨8 rules⟩`. A JSON `args0` entry could not do it —
  // the button carries an `onClick`, which no block definition can express.
  message0: 'define world named %1 with',
  args0: [{type: 'field_input', name: 'NAME', text: 'World'}],
  // A definition root: no previous connection, a NEXT connection — the body
  // (`load map`, `create in map`, the cameras) chains below it rather than
  // nesting in a `do` input.
  nextStatement: true,
  // …and after the name, how many rules are in play and the way to see them.
  // The world runs every rule the project holds, so the block would otherwise
  // say nothing at all about the thing it is most made of.
  // The count of rules in play, and a wand: what this world could be given
  // (extensions/enhanceButton). A camera that follows an actor is the world's
  // rather than the actor's — nothing it writes lands in an actor's file.
  extensions: [rulesButtonExtension, enhanceButtonExtension],
  style: 'setup_blocks',
  tooltip:
    'Define a world: the actors that live in it, and what it looks like.',
  generator: {
    javascript(block, generator) {
      const name = block.getFieldValue('NAME');
      addImport(
        generator,
        'world_lab',
        `import * as WorldLab from 'world-lab';`,
      );
      const body = nextChainCode(block, generator);
      // EVERY `.rule` THE PROJECT HOLDS, in play. Exactly the argument the
      // animations below have always made — a file is not a thing a world opts
      // into, it is a thing the project HAS — and it took a while to see that
      // rules are the same. This was the foundational ones only; the rest had
      // to be named in a `use rule`.
      //
      // What makes it safe is that a rule with no elected trait does nothing.
      // Every one of them either steps per actor holding its trait or filters
      // a rule step on `hasTrait`; the two input rules raise world events
      // nobody is obliged to hear, and Shooting has no step at all. So gravity
      // in a world with nothing falling is inert, and "which rules does this
      // world run" stopped being a question worth making a learner answer.
      //
      // What it buys is the thing that confused everyone: a trait is offered
      // when the rule providing it is in play, so importing Gravity and then
      // failing to find "Affected by Gravity" in `use trait` — because the
      // WORLD had not also been told — was the shape of the language's worst
      // half-hour. Holding the file is now the whole of it.
      //
      // Delete the file and nothing is emitted. Name it in a `use rule` as
      // well and it is the same module, so the world has it once — which is
      // what keeps the rows in projects saved before this harmless.
      const rules = ruleModuleOptions()
        .map(([, modulePath]) => modulePath)
        .filter(modulePath => modulePath)
        .map(modulePath => {
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
      // How big each of the project's images is, stated for the same reason
      // the animations above are and by the same argument: a picture's size is
      // not something a world opts into, it is a fact about what the project
      // holds. The engine cannot measure a PNG — no decoder, no browser — but
      // the editor already has, so it simply says.
      //
      // What reads it: `intrinsic size`, and through it `collision size of`.
      // Without it those were only ever written for a SPRITESHEET, whose cells
      // state their own size, so every actor drawing one whole image was a 32
      // by 32 square to anything that asked — a paddle collided as a cube.
      //
      // Keys sorted so the same project compiles to the same text.
      const measured = measuredImages();
      const sizes = Object.fromEntries(
        Object.keys(measured)
          .sort()
          .map(name => [name, measured[name]]),
      );
      const imageSizes = Object.keys(sizes).length
        ? `world.useImageSizes(${JSON.stringify(sizes)});\n`
        : '';
      const layers = plan.some(entry => entry.id !== DEFAULT_LAYER_ID)
        ? plan
            .map(entry => `world.defineLayer({id: ${str(entry.id)}});\n`)
            .join('')
        : '';
      // The world's OWN state, hoisted for the same reason the layers above
      // are: a declaration cannot be emitted where its block sits when the body
      // around it reads the const it makes. `add actor … set text to ⟨score⟩`
      // written above the `define property` compiled to a use before the
      // declaration — which esbuild rewrites, so it threw as "Cannot read
      // properties of undefined" rather than as the temporal-dead-zone error it
      // was (specs/WORLD_STATE.md).
      //
      // Passed on the generator rather than read off the block, so there is ONE
      // parse of a world's declarations (`parseWorldOwnMeta`) instead of a
      // second walk over live blocks that could drift from it — the same
      // bargain `__ruleModule` makes two lines below the same seam.
      const own = (generator as {__worldOwn?: string}).__worldOwn ?? '';
      return (
        `const world = new WorldLab.WorldBuilder({id: ${str(id_from_name(name))}, name: ${str(
          name,
        )}});\n` +
        own +
        rules +
        animations +
        imageSizes +
        layers +
        body
      );
    },
  },
});

// The `use rule` dropdown offers the project's own rule modules (under
// `rules/`), valued by module path — the generator branches on the `/` a path
// carries, importing the module rather than reading `WorldLab`.
//
// WHAT THIS BLOCK IS FOR, now that a world runs every rule the project holds:
// a RULE's dependency. "Drives with Arrow Keys" requires Physics, and that is a
// statement about the rule, true wherever it is used and false to leave out. It
// is offered under Rule and nowhere else; a world with one still loads and the
// row still resolves to the same module, so the world has it once.
//
// THE ENGINE'S OWN TWO ARE NOT OFFERED. `WorldBuilder` seeds Space and
// Appearance into every world it builds (`rulesInPlay`), so requiring either is
// a tautology. A project rule DECLARING one is offered, and the eject case is
// why: naming it is what makes `rulesInPlay` prefer the learner's version over
// the built-in it shadows, so taking the row away would mean the shadow could
// never come into play.
//
// Labelled by the rule's ABILITY, not its name: "requires Has Gravity" is the
// sentence. The category in the toolbox says the other half — "Gravity", the
// thing you open and edit.
/**
 * The rules this one may require, plus a way to get more.
 *
 * `(import…)` is listed last and copies a stock rule into the project — the
 * same affordance the effect dropdown has, and the only way to reach gravity
 * now that it is not built in. Offered even when the project already has rules:
 * wanting a second one is the normal case.
 *
 * And never as the ONLY row, which is what `orNone` is doing here: with the
 * built-ins gone this list can be empty, a fresh block takes the first option
 * as its value, and a block that silently became "open the import dialog" is
 * not a block.
 */
const useRuleOptions = (field?: FieldDropdown): Array<[string, string]> => {
  const identities = projectRuleIdentities();
  // Not the rule this workspace IS: a rule that uses itself generates a module
  // that imports its own default export, and the project stops before it starts.
  const own = editingRuleFor(field);
  return [
    ...orNone(
      ruleModuleOptions()
        .filter(([, modulePath]) => modulePath !== own)
        .map(([fileLabel, modulePath]): [string, string] => {
          // A parsed `.rule` says what it is and what it gives, and is referred
          // to by that name from then on, wherever its file ends up. A `.js`
          // rule declares neither, so it is named by its module — as is a
          // `.rule` the editor could not parse, which still has to be pickable
          // mid-edit.
          const identity = identities.get(modulePath);
          return identity
            ? [identity.ability, identity.name]
            : [fileLabel, modulePath];
        }),
    ),
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
    // …and the way back to the lesson it was met in
    // (extensions/lessonButton).
    lessonButtonExtension,
  ],
  style: 'behavior_blocks',
  tooltip:
    'Say that this rule needs another one. A world does not need this: it ' +
    'runs every rule the project holds.',
  generator: {
    javascript(block, generator) {
      const rule = block.getFieldValue('RULE');
      // "(none)" — a project with no rules yet. An unfinished block emits
      // nothing, rather than the `WorldLab.` below with no name after it, which
      // does not parse and would take the whole module down with it.
      if (!rule) {
        return '';
      }
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
// to draw behind everything, a color behind that, and effects of its own. It is
// not an actor, so these are world blocks with no subject socket — the world is
// the subject, as it is for `add effect … to the world`.
//
// Every one of them means backdrop layer 0. The engine's methods take an
// optional layer index, so parallax later adds blocks that name a layer and
// changes nothing a learner has already built.

// The backdrops a `set background to` block may name: the project's own
// (populated live by the extension), and `(import…)` to copy one in.
const backgroundFieldOptions = (): DropdownOptions => backgroundImportOptions();

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
export const GENERATED_WORLD_CALLS: string[] = [
  // A world ACTION, declared here because `defineActionBlock` writes
  // `${subject}.act(…)` and the scan looks for the literal `world.act(`. The
  // same blind spot the slot factories below have — and the one that let every
  // rule's world actions be offered under `define world` for as long as
  // `WorldBuilder` had no `act` for them to land on.
  'act',
];

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

  /**
   * `remove ⟨background⟩` — take the image away again.
   *
   * A BLOCK and not a row in `set ⟨…⟩ to`'s menu, for the reason `stop music`
   * is a block: a menu of the project's images is where you go to choose one,
   * not where you go to have none, and the row that would have said so only
   * ever appeared in a project holding no images at all. Until this existed a
   * sky, once set, could not be taken down.
   *
   * The same engine method with nothing to draw (`World.setBackground`), so
   * there is one method and two sentences — as there is for music.
   */
  const clearImage = defineBlock({
    type: `world_clear_${slot.id}`,
    message0: `remove ${slot.label}`,
    previousStatement: true,
    nextStatement: true,
    extensions: [worldContextExtension],
    style: 'sprite_blocks',
    tooltip:
      `Take the ${slot.label} image away, leaving the backdrop color. The ` +
      'offset and the tiling stay as they were, for the next image.',
    generator: {
      javascript(block) {
        return `world.set${slot.method}(undefined, ${str(layerOf(block))});\n`;
      },
    },
  });

  return [setImage, clearImage, setOffset, setRepeat];
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
      const define = `world.defineCamera({${settings.join(', ')}});\n`;
      // Everything in the mouth that is NOT a `use trait` — `set actor to
      // follow …`, a `log`, anything. The walk above reads the declarations and
      // used to drop the rest on the floor: the blocks sat there looking right
      // and generated nothing at all, which is the worst way for a mouth to
      // fail. (`use trait` emits nothing here itself, so this is only the rest.)
      //
      // Made AFTER the camera, and with it bound, so `this camera` means the one
      // being defined — writing `set … of ⟨camera ⟨Chase⟩⟩` inside the
      // definition of Chase is a name a learner should not have to repeat.
      const setup = generator.statementToCode(block, 'DO');
      if (!setup.trim()) {
        return define;
      }
      return (
        `${define}{\n` +
        `const camera = world.camera(${str(cameraId(block.id))});\n` +
        `${setup}}\n`
      );
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
    // The color a world starts with, so the swatch opens on what is on screen
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
  ['color', 'color'],
  ['vector', 'vector'],
  ['point', 'point'],
  // Actors — what a rule works out about who is where: a contact set, a group.
  // Read-only in practice (the rule that fills it owns it) and never carried
  // across a hot reload (specs/COLLISION.md).
  // ONE actor: a camera's actor to follow. Before the list, because it is the
  // simpler thing and the one a learner reaches for more often.
  ['actor', 'actor'],
  ['actors', 'actors'],
  // Lists of plain values, which the actor list above is not: these are
  // carried across a hot reload and patched live, because a number has no
  // world inside it (specs/LISTS.md).
  ['numbers', 'numbers'],
  ['words', 'words'],
  ['vectors', 'vectors'],
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
  // The phrasing, as blocks — drawn only on the event's own surface, which the
  // pencil opens. An event has no implementation to put under it, so that
  // surface holds this and nothing else; `bodySurfaces.hasSurface` is where
  // "there is something to open" parts company with "there is a body".
  message1: 'arguments %1',
  args1: [{type: 'input_statement', name: ARGUMENTS_INPUT}],
  previousStatement: true,
  nextStatement: true,
  // Kept for `saveExtraState`/`loadExtraState`, which is what carries the
  // parts. With no `compose`/`decompose` on it there is no gear: Blockly draws
  // one only when a mutator can open a bubble.
  mutator: eventDesignerMutator,
  extensions: [
    blockDesignerInitExtension,
    bodyButtonExtension,
    bodySurfaceExtension,
  ],
  // A DEFINITION, colored like the other definitions — `define rule`,
  // `define trait`, `define block`. The event color belongs to the hat this
  // makes, which the preview row below draws.
  style: 'setup_blocks',
  tooltip:
    'Define an event a rule can raise, or — in an actor file — something that ' +
    'happens to that kind of actor. The row below is the "when …" block it ' +
    'makes; the pencil opens what it is made of. A choice in it is what a ' +
    'handler filters on.',
  generator: {
    javascript(block) {
      // WHERE IT SITS DECIDES WHO WRITES IT, the same bargain `define block`
      // beside it makes (`worldRuleBlock`). In a `.rule` the module is
      // assembled from the file's metadata, so writing anything here would
      // declare the event twice; in an `.actor` file there is no metadata pass
      // and this is the whole declaration.
      if (!definesActorFile(block)) {
        return '';
      }
      const parts = (
        block as unknown as {
          saveExtraState?: () => {
            parts?: Array<{kind?: string; text?: string; var?: string}>;
          };
        }
      ).saveExtraState?.()?.parts;
      const name = designedName(parts);
      if (!name) {
        return ''; // an event with no words on it names nothing
      }
      // NO PARAMETERS IN THE CALL. What an event carries is a fact about the
      // `emit` that raises it and the hat that hears it, both of which read
      // the designed parts from the palette (`ownProperties.designedEvent`);
      // the engine's event is an identity and a name and nothing else
      // (`ActorBuilder.defineEvent`).
      return (
        `export const ${pascal(name)}Event = actor.defineEvent(` +
        `${str(slug(name))}, {name: ${str(name)}});\n`
      );
    },
  },
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

// ── The blocks a signature is written in ─────────────────────────────────────
// A stack of these IS the signature, read left-to-right as top-to-bottom: a
// `text` adds wording, an `argument` adds an input, reordering the statements
// reorders the block. They live in the `arguments` row on a definition's own
// surface, and are offered in a toolbox drawer only there (`surfaceToolbox`).
//
// `define block` writes its arguments as `argument`, which carries a type;
// `define event` writes them as `choice`, because an event's parameter is a
// filter and a filter over "any number" is a comparison rather than a hat.

/** One item block per parameter type, plus the label. */
const SIGNATURE_ITEMS: Array<{type: string; label: string; param?: string}> = [
  {type: 'world_signature_text', label: 'text'},
  ...PARAM_TYPE_OPTIONS.map(([label, value]) => ({
    type: `world_signature_${value}`,
    label,
    param: value,
  })),
];

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

/**
 * `argument ⟨number⟩ ⟨amount⟩` — one input a `define block` takes.
 *
 * The TYPE is a field rather than the block's identity, so changing an
 * argument's type is a dropdown instead of deleting one block and hunting for
 * another. The list carries the enums as well, which is what let `define
 * block` stop needing a separate `choice` item: an enum-typed argument is one
 * whose type happens to be a named set of words.
 *
 * Its name is the name of the VARIABLE the body reads, so typing here renames
 * it everywhere the implementation already uses it.
 */
const argumentTypeOptions = (): Array<[string, string]> => [
  // A MIXED LIST, and the halves are translated differently. `number`, `text`,
  // `actor` are the lab's words for its own types; the enums after them are
  // whatever the learner called them, and a name is not translated in any
  // language. So this cannot be `{words: true}` on the extension — that would
  // take both halves.
  ...PARAM_TYPE_OPTIONS.map(
    ([label, value]) => [localizeText(label), value] as [string, string],
  ),
  // Stored as the PARAMETER TYPE an enum stands for, not as the bare ref, so
  // the field's value is the part's type verbatim and nothing has to work out
  // which kind it is.
  ...allEnums().map(
    meta =>
      [`${meta.name} (${meta.owner})`, enumParamType(enumRef(meta))] as [
        string,
        string,
      ],
  ),
];

const signatureArgument = defineBlock({
  type: SIGNATURE_ARGUMENT,
  message0: 'argument %1 %2',
  args0: [
    {type: 'field_dropdown', name: 'TYPE', options: argumentTypeOptions()},
    {type: 'field_input', name: 'TEXT', text: 'value'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [
    // Live, for the same reason the choice item's is: a `define choices`
    // written a minute ago should be offered without a reload.
    liveDropdown('world_signature_argument_types', 'TYPE', argumentTypeOptions),
    // …and the default's widget follows the type it is a default for.
    argumentDefaultExtension,
  ],
  style: 'variable_blocks',
  tooltip:
    'An input the block takes. Its name is the variable the implementation ' +
    'reads; drag that name out of the block below to use it.',
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
  // The name of the thing, and nothing else: the pencil that opens the
  // implementation goes on this row (`bodyButton`), and everything that
  // describes the block is asked below it or on its own surface.
  message0: 'define block',
  args0: [],
  // The tooltip of the block being DEFINED — the sentence someone reads when
  // they hover it in the toolbox months later, having forgotten what "rest
  // height of" meant. On its own row because it is a sentence: sharing a line
  // with the returns dropdown made both hard to read.
  //
  // Drawn only on a body surface, like `returns` and `arguments`: what a block
  // is FOR is written where it is written, and the interface shows the block
  // itself. Hidden there rather than removed — a field taken off a block is a
  // field Blockly does not save, and the interface is what writes the file.
  message1: 'description %1 %2',
  args1: [
    {type: 'field_input', name: 'DESCRIPTION', text: '', spellcheck: true},
    {type: 'input_dummy', name: DESCRIPTION_ROW},
  ],
  // Whether it does something or reports something, on a row of its own so
  // that row can be hidden whole. Only a body surface draws it: the answer is
  // a fact about the implementation, which either has a `return` in it or does
  // not. HIDDEN there, never removed — a field taken off a block is a field
  // Blockly does not save.
  message2: 'returns %1 %2',
  args2: [
    {type: 'field_dropdown', name: 'RETURNS', options: BLOCK_RETURNS_OPTIONS},
    {type: 'input_dummy', name: RETURNS_ROW},
  ],
  // The signature, as blocks. Drawn only on a body surface, where the stack
  // in it IS what the block will look like — `blockDesignerMutator` writes it
  // out of `extraState.parts` and reads it back. The FILE is still the parts;
  // these blocks are never saved into it.
  message3: 'arguments %1',
  args3: [{type: 'input_statement', name: ARGUMENTS_INPUT}],
  // The body's socket. It is NOT drawn in the editor — `bodySurfaceExtension`
  // takes the row off, because with the split on it is always empty and the
  // pencil above is the way in. It stays in the definition because the file
  // still holds the body here, and the generator loads the file whole.
  message4: 'do %1',
  args4: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  mutator: blockDesignerMutator,
  extensions: [
    blockDesignerInitExtension,
    wideTextExtension('DESCRIPTION'),
    // …and the one that says an actor's own block cannot report a value yet.
    // In a `.rule` it never fires (`actorBlockReports`).
    actorBlockReportsExtension,
    bodyButtonExtension,
    bodySurfaceExtension,
  ],
  style: 'setup_blocks',
  tooltip:
    'Define a block this rule adds, or — in an actor file — a thing that kind ' +
    'of actor does. The bottom row is the block itself, drawn as you will see ' +
    'it when you use it; the pencil opens what it does.',
  generator: {
    javascript(block, generator) {
      // WHERE IT SITS DECIDES WHO WRITES IT, the same bargain `each frame`
      // makes in its three homes (`worldTraitStep`).
      //
      // In a `.rule` this is a DECLARATION and nothing more:
      // the module is assembled from the file's metadata and the body is
      // pulled out by a pass of its own (`extractRuleBodies`), so generating
      // anything here would write it twice.
      //
      // In an `.actor` file there is no metadata pass to write it, so this is
      // the whole declaration. `defineAction` is the third of the same bargain
      // `defineProperty` and `defineStep` make: state a kind carries, work it
      // does every frame, and a named thing it does (ActorBuilder).
      if (!definesActorFile(block)) {
        return '';
      }
      // The statement form only. A block that says it REPORTS something wants
      // `defineQuery` and a `return`, which is the next piece of work; the
      // block says so on its own face rather than quietly doing nothing
      // (`actorBlockStatementOnly`).
      const returns = block.getFieldValue('RETURNS');
      if (returns && returns !== 'none') {
        return '';
      }
      const parts = (
        block as unknown as {
          saveExtraState?: () => {
            parts?: Array<{kind?: string; text?: string; var?: string}>;
          };
        }
      ).saveExtraState?.()?.parts;
      const name = designedName(parts);
      if (!name) {
        return ''; // a block with no words on it names nothing
      }
      // The mutator stores each parameter's VARIABLE ID; the body's getters
      // resolve those to safe identifiers, so the closure's signature has to
      // resolve them the same way or the two disagree.
      const params = (parts ?? [])
        .filter(part => part.kind === 'param')
        .map(part => generator.getVariableName(part.var ?? ''));
      const body = generator.statementToCode(block, 'DO');
      // The closure's `actor` SHADOWS the module's builder, as a step's does:
      // a body written in an actor file says `this actor` and means this one,
      // and `this actor` compiles to `actor` wherever it is written.
      //
      // `world` is bound from the actor because a body may well ask the world
      // something, and the engine hands an action `(actor, …args)` — the same
      // preamble a rule's actor-scoped action gets (`ruleMetaToModule`).
      return (
        `export const ${pascal(name)}Action = actor.defineAction(` +
        `${str(slug(name))}, (${['actor', ...params].join(', ')}) => {\n` +
        `  const world = actor.world;\n${body}}, {name: ${str(name)}});\n`
      );
    },
  },
});

/**
 * Whether this block is being written in an `.actor` FILE.
 *
 * Two questions in one, and both matter. Is the top of its chain a `define
 * actor` — a `define block` chained under anything else belongs to whoever
 * owns that root. And is this file a WORLD — a world's own `define actor` is a
 * `world_actor` root too, and its body generates into a block scope where the
 * `export const` this emits is not legal. The palette does not offer the block
 * there (`ROOT_HOMES`), and this is what makes a pasted one harmless.
 */
const definesActorFile = (
  block: Pick<Block, 'workspace'> & {
    getParent?: () => unknown;
    type?: string;
  },
): boolean => {
  let at = block as {getParent?: () => unknown; type?: string};
  for (
    let up = at.getParent?.() as typeof at | null;
    up;
    at = up, up = at.getParent?.() as typeof at | null
  ) {
    // walk to the top of the chain
  }
  return at.type === 'world_actor' && !definesWorld(block.workspace);
};

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
// behavior happens, and a dropdown that changes whether a second dropdown is
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
    // The body's socket, drawn on the step's own surface and nowhere else
    // (`bodySurfaceExtension`). A MOUTH rather than the chain below, which is
    // what it used to be: a step was a definition ROOT because its body was
    // hundreds of blocks long and chaining it under `define rule` would have
    // made one enormous column. The body lives on its own surface now, so a
    // step is one row like every other member — and a member chains through
    // `next`, which leaves the body needing somewhere else to be. `define
    // block` and `each frame` have the same shape for the same reason.
    message1: 'do %1',
    args1: [{type: 'input_statement', name: 'DO'}],
    previousStatement: true,
    nextStatement: true,
    extensions: [...extensions, bodySurfaceExtension],
    style: 'event_blocks',
    tooltip,
    generator: noGenerator,
  });

const nameArg: BlockArgDefinition = {
  type: 'field_input',
  name: 'NAME',
  text: 'each tick',
};
// Naming the MOMENT rather than a neighbor. What the other three cannot say:
// gravity is a force, and saying so should not require knowing that Physics
// exists (engine/core/phases). Rule-level, so it is offered every moment —
// the work that fits no single actor lives here.
const worldRuleStepIn = stepBlock(
  'world_rule_step_in',
  'during %1 do %2',
  [{type: 'field_dropdown', name: 'PHASE', options: phaseOptions}, nameArg],
  'Run this every tick, in a named part of the frame — “this is a force”, ' +
    'rather than “this runs before that other rule’s step”.',
  [phaseOptionsExtension, bodyButtonExtension],
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
/**
 * `each frame` — a ROW, in all three of its homes.
 *
 * Under a `define trait` it is one of that trait's members; inside a world's
 * own `define actor` it is one of that actor's; and in an `.actor` file it is
 * one of THAT actor's, chained under the `define actor` at the top of the file
 * beside its `use trait`s. Same block, same shape, same reading everywhere:
 * work this thing does every frame, written where the thing is written.
 *
 * IT USED TO STAND ALONE in an `.actor`, and that cost more than it was worth.
 * A definition root must not have a previous connection —
 * `DisableOrphansPlugin` reads a top-level block with one as an orphan and
 * grays it out — so the block was minted in two shapes and swapped by file
 * kind. Blockly holds ONE definition per type for the whole process, so an
 * open `.actor` left every other file believing `each frame` could not chain
 * (`generatorRegistration.test`); a body surface could not hang a body off a
 * head with no `next` (`extensions/bodyOwner`); and an enhancement adding a
 * step had to know which file it was writing into or the step would be
 * accepted and never run (`actors/enhance/climbArrows`). Three separate
 * silences, all of them the one difference.
 */
const worldTraitStep = defineBlock({
  type: 'world_trait_step',
  message0: 'each frame during %1 do %2',
  args0: [
    {type: 'field_dropdown', name: 'PHASE', options: phaseOptions},
    {type: 'field_input', name: 'NAME', text: 'do something'},
  ],
  message1: '%1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [
    phaseOptionsExtension,
    bodyButtonExtension,
    bodySurfaceExtension,
  ],
  style: 'event_blocks',
  tooltip:
    'Run this every tick for each thing that has this trait — or, under a ' +
    '`define actor`, for each actor of that kind. The thing itself is what ' +
    'the blocks inside act on.',
  generator: {
    javascript(block, generator) {
      // WHAT IT IS CHAINED UNDER DECIDES WHAT IT IS, which is the same
      // bargain `world_rule_property` makes in its three homes.
      //
      // Under a `define trait`, this is a DECLARATION and nothing more: the
      // rule's module is assembled from its metadata and the body is pulled
      // out by a pass of its own (ruleMeta), so generating anything here
      // would be writing it twice.
      //
      // Under a `define actor`, there is no metadata pass and nothing else to
      // write it — so it is the whole declaration, and this is it.
      // `defineStep` is the behavior half of `defineProperty`: work a KIND of
      // actor does every frame without a rule to do it in (ActorBuilder).
      //
      // WHICH `define actor` still matters, and that is the two tests. An
      // `.actor` file's is the module being written, so the step goes straight
      // on `actor`. A world's is a block scope with its own `actor` bound
      // inside it, and a step written outside every such scope has no `actor`
      // to be about — `hasActorInScope` is what keeps that from compiling to a
      // reference to nothing.
      //
      // NOT "does it have a parent", which is what this asked until `each
      // frame` became a row in an `.actor` too. That question had the right
      // answer in two files out of three by coincidence.
      const inWorldActor = definesWorld(block.workspace);
      if (inWorldActor ? !hasActorInScope(block) : !definesActorFile(block)) {
        return '';
      }
      const name = block.getFieldValue('NAME') || 'do something';
      const phase = block.getFieldValue('PHASE') || 'decide';
      const body = generator.statementToCode(block, 'DO');
      // The closure's `actor` SHADOWS the module's builder, deliberately: a
      // body written in an actor file says `this actor` and means this one, and
      // `this actor` compiles to `actor` wherever it is written.
      return (
        `actor.defineStep(${str(slug(name))}, ${str(phase)}, ` +
        `(actor, world, delta) => {\n${body}});\n`
      );
    },
  },
});

/**
 * `show as ⟨text⟩` — the symbol a picker draws this actor with.
 *
 * The third of three tiers (specs/UI_ACTORS.md): the picture where there is
 * room for it, this where there is not, and the actor's name when there is no
 * picture at all. Declaring nothing keeps what a project already does, so this
 * is a thing to reach for rather than a thing to know.
 *
 * WHAT IT IS FOR is an actor whose appearance is CONTENT-DEPENDENT — a Label
 * looks like whatever this one happens to say, so at 24 pixels every Label in
 * the project is the same smudge and none of them is identifiable. A symbol
 * says what the kind IS, which is the question a picker asks.
 *
 * It generates nothing. Where an actor is shown is the editor's business, and
 * the running game has no pickers in it.
 */
const worldShowAs = defineBlock({
  type: SHOW_AS,
  message0: 'show as %1',
  args0: [{type: 'field_dropdown', name: 'ICON', options: ACTOR_ICON_OPTIONS}],
  previousStatement: true,
  nextStatement: true,
  extensions: [actorContextExtension],
  style: 'sprite_blocks',
  tooltip:
    'Pick the symbol that stands for this kind of actor where it is too ' +
    'small to draw — a dropdown of actors, for one. Leave it off and the ' +
    'picture is used.',
  generator: noGenerator,
});

// ── Drawing (specs/DRAWING.md) ───────────────────────────────────────────────
// A kind that describes its own picture. `each frame`'s sibling and its
// opposite: a step is handed the world and may change it, a drawing is handed a
// pen and may not. That purity is what lets a picture be identified by what it
// describes, which is what makes nine actors cost one texture.

/** The color a shape is painted, as a socket that takes any color block. */
const paintArg = (name: string) => ({
  type: 'input_value' as const,
  name,
  // Every color block reports `Colour` — the picker, `world_rgba`, a blend —
  // and so now does a `color` property's getter, which is what a Label's
  // per-instance color is. This was briefly widened to admit a plain string,
  // when a color could only BE one; the type says it instead.
  check: COLOUR_CHECK,
});

/**
 * `define drawing` — and it needs TWO SHAPES, exactly as `each frame` does.
 *
 * Standing on its own in an `.actor` file it is a definition root, and a root
 * MUST NOT have a previous connection: `DisableOrphansPlugin` reads a
 * top-level block with one as an orphan and disables it, along with everything
 * chained after it.
 *
 * Chained inside a world's own `define actor` it is one of that actor's rows,
 * so it has a previous and a next like `use trait` beside it. That is what
 * lets a world-defined actor draw itself — and it needed no new field to say
 * WHICH actor, because a local actor's body already generates inside a block
 * where `actor` is that builder (`world_actor`'s generator). The drawing is
 * inside the actor it belongs to, which is the only place it could mean
 * anything.
 *
 * It used to be root-only, and the note here said a drawing "needs only the
 * root shape". That was true of the `.actor` file it was written for and made
 * a whole class of actor unsayable in a world: one with a picture. The
 * single-world platformer scenario shipped a scoreboard drawn as a plain box
 * because of it.
 */
/**
 * `define drawing 32 by 32` — what this kind of actor looks like.
 *
 * A ROW under `define actor`, and its body on a surface of its own: the same
 * shape `define block` and `each frame` have, reached the same way, by the
 * pencil. It was a definition ROOT with the pen blocks chained inside it,
 * which cost the two things two shapes always cost here.
 *
 * Blockly holds one definition per type for the whole process, so an open
 * `.actor` file left every other file believing a drawing could not chain —
 * the hazard `generatorRegistration.test` was written for. And the pen blocks
 * had to be offered in the file's own toolbox, because that is where the
 * drawing was: twelve blocks that mean nothing outside one, in the drawer of
 * every actor whether it drew anything or not. They live on the drawing's
 * surface now (`surfaceToolbox`), which is the only place they can be used.
 */
const worldDefineDrawing = defineBlock({
  type: 'world_define_drawing',
  message0: 'define drawing %1 by %2',
  args0: [
    {type: 'field_number', name: 'WIDTH', value: 32, min: 1, max: 512},
    {type: 'field_number', name: 'HEIGHT', value: 32, min: 1, max: 512},
  ],
  message1: '%1',
  args1: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [bodyButtonExtension, bodySurfaceExtension],
  style: 'sprite_blocks',
  tooltip:
    'Describe what this kind of actor looks like. The size is the picture, ' +
    'and it is also how big the actor is for clicks and collisions.',
  generator: {
    javascript(block, generator) {
      // WHAT IT IS CHAINED UNDER DECIDES WHETHER IT IS ANYTHING, the same
      // test `each frame` makes (`worldTraitStep`). A drawing belongs to a
      // `define actor`; one chained under `define world`, or left unattached
      // at the top of a file, would emit a call on an `actor` that is not
      // bound and the module would throw as it loaded.
      const inWorldActor = definesWorld(block.workspace);
      if (inWorldActor ? !hasActorInScope(block) : !definesActorFile(block)) {
        return '';
      }
      const width = Number(block.getFieldValue('WIDTH')) || 1;
      const height = Number(block.getFieldValue('HEIGHT')) || 1;
      const body = generator.statementToCode(block, 'DO');
      // `actor` SHADOWS the module's builder inside the closure, exactly as a
      // step's body does, so `this actor` written here means this one. `pen` is
      // bound only here — the one place `drawingContext` knows about.
      //
      // `world` is bound too, so a drawing may ASK. `first actor with trait
      // ⟨Has Health⟩` inside one is what makes a health bar a drawing and
      // nothing else: without it a bar had to be HANDED the actor it watches,
      // which meant a property to hold it and a step to fill it, for a
      // picture that only ever wanted to read.
      return (
        `actor.defineDrawing(${width}, ${height}, ` +
        `(actor, pen, world) => {\n${body}});\n`
      );
    },
  },
});

const worldPenFill = defineBlock({
  type: 'world_pen_fill',
  message0: 'set fill %1',
  args0: [paintArg('COLOR')],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip: 'Paint the inside of every shape drawn after this.',
  generator: {
    javascript(block, generator) {
      const color = generator.valueToCode(block, 'COLOR', Order.NONE);
      return color ? `pen.fill(${color});\n` : '';
    },
  },
});
registerValueShadows('world_pen_fill', [
  {
    name: 'COLOR',
    shadow: {type: 'colour_picker', fields: {COLOUR: '#ffffff'}},
  },
]);

const worldPenOutline = defineBlock({
  type: 'world_pen_outline',
  message0: 'set outline %1 width %2',
  args0: [
    paintArg('COLOR'),
    {type: 'input_value', name: 'WIDTH', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip: 'Draw an edge around every shape drawn after this.',
  generator: {
    javascript(block, generator) {
      const color = generator.valueToCode(block, 'COLOR', Order.NONE);
      const width = generator.valueToCode(block, 'WIDTH', Order.NONE) || '1';
      return color ? `pen.outline(${color}, ${width});\n` : '';
    },
  },
});
registerValueShadows('world_pen_outline', [
  {
    name: 'COLOR',
    shadow: {type: 'colour_picker', fields: {COLOUR: '#000000'}},
  },
  {name: 'WIDTH', shadow: {type: 'math_number', fields: {NUM: 1}}},
]);

// The two absences. A socket left empty would say the same thing, and say it
// invisibly — "no fill" is a sentence a learner writes and can read back.
const worldPenNoFill = defineBlock({
  type: 'world_pen_no_fill',
  message0: 'no fill',
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension],
  style: 'sprite_blocks',
  tooltip: 'Stop painting the inside of shapes — draw only their edges.',
  generator: {
    javascript() {
      return 'pen.noFill();\n';
    },
  },
});

const worldPenNoOutline = defineBlock({
  type: 'world_pen_no_outline',
  message0: 'no outline',
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension],
  style: 'sprite_blocks',
  tooltip: 'Stop drawing edges around shapes.',
  generator: {
    javascript() {
      return 'pen.noOutline();\n';
    },
  },
});

/** A shape block: statement, drawing-only, and seeded with numbers. */
const drawBlock = (
  type: string,
  message0: string,
  args0: object[],
  tooltip: string,
  code: (read: (name: string) => string) => string,
) =>
  defineBlock({
    type,
    message0,
    args0: args0 as never,
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    extensions: [drawingContextExtension, valueShadowExtension],
    style: 'sprite_blocks',
    tooltip,
    generator: {
      javascript(block, generator) {
        return code(
          name => generator.valueToCode(block, name, Order.NONE) || '0',
        );
      },
    },
  });

const numberArg = (name: string) => ({
  type: 'input_value' as const,
  name,
  check: 'Number',
});

const worldDrawRectangle = drawBlock(
  'world_draw_rectangle',
  'draw rectangle at x %1 y %2 size %3 by %4',
  [numberArg('X'), numberArg('Y'), numberArg('WIDTH'), numberArg('HEIGHT')],
  'Draw a rectangle. The corner is the point; x and y are measured from the ' +
    'top-left of the picture.',
  read =>
    `pen.rectangle(${read('X')}, ${read('Y')}, ${read('WIDTH')}, ${read('HEIGHT')});\n`,
);
registerValueShadows(
  'world_draw_rectangle',
  ['X', 'Y', 'WIDTH', 'HEIGHT'].map(name => ({
    name,
    shadow: {
      type: 'math_number',
      fields: {NUM: name === 'WIDTH' || name === 'HEIGHT' ? 16 : 0},
    },
  })),
);

const worldDrawCircle = drawBlock(
  'world_draw_circle',
  'draw circle at x %1 y %2 radius %3',
  [numberArg('X'), numberArg('Y'), numberArg('RADIUS')],
  'Draw a circle around a point.',
  read => `pen.circle(${read('X')}, ${read('Y')}, ${read('RADIUS')});\n`,
);
registerValueShadows('world_draw_circle', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 16}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 16}}},
  {name: 'RADIUS', shadow: {type: 'math_number', fields: {NUM: 8}}},
]);

const worldDrawLine = drawBlock(
  'world_draw_line',
  'draw line from x %1 y %2 to x %3 y %4',
  [numberArg('X1'), numberArg('Y1'), numberArg('X2'), numberArg('Y2')],
  'Draw a line. It is drawn in the outline color, or the fill color when ' +
    'there is no outline.',
  read =>
    `pen.line(${read('X1')}, ${read('Y1')}, ${read('X2')}, ${read('Y2')});\n`,
);
registerValueShadows(
  'world_draw_line',
  ['X1', 'Y1', 'X2', 'Y2'].map(name => ({
    name,
    shadow: {
      type: 'math_number',
      fields: {NUM: name.endsWith('2') ? 16 : 0},
    },
  })),
);

const worldDrawText = defineBlock({
  type: 'world_draw_text',
  message0: 'draw text %1 at x %2 y %3 size %4 anchored %5',
  args0: [
    {type: 'input_value', name: 'TEXT'},
    numberArg('X'),
    numberArg('Y'),
    numberArg('SIZE'),
    {type: 'input_value', name: 'ANCHOR', check: 'String'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'Draw a word. The anchor says which part of the text sits at the point, ' +
    'so a number that grows can stay where it was put.',
  generator: {
    javascript(block, generator) {
      const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      const size = generator.valueToCode(block, 'SIZE', Order.NONE) || '12';
      const anchor =
        generator.valueToCode(block, 'ANCHOR', Order.NONE) || str('center');
      // `String(…)` because the commonest thing to draw is a NUMBER — a score,
      // a countdown — and the socket takes any value. Coercing here means the
      // learner never meets the difference, and the command list stays a list
      // of strings so two equal scores hash the same.
      return `pen.text(String(${text}), ${x}, ${y}, ${size}, ${anchor});\n`;
    },
  },
});
/**
 * `draw paragraph …` — several lines of it, broken to fit a column.
 *
 * A block of its own rather than a sixth socket on `draw text`. What differs
 * is not a setting, it is the kind of thing being drawn: a score is a word and
 * a line of dialogue is a paragraph, and the block that draws a score should
 * not grow a socket for the one that does not.
 *
 * WHERE THE BREAKS FALL IS THE DRIVER'S. This says how wide; the half holding
 * the font works out what fits, because the engine has no canvas to measure
 * with (`engine/core/drawing`).
 */
const worldDrawParagraph = defineBlock({
  type: 'world_draw_paragraph',
  message0:
    'draw paragraph %1 in a column %2 wide at x %3 y %4 size %5 anchored %6',
  args0: [
    {type: 'input_value', name: 'TEXT'},
    numberArg('WIDTH'),
    numberArg('X'),
    numberArg('Y'),
    numberArg('SIZE'),
    {type: 'input_value', name: 'ANCHOR', check: 'String'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [drawingContextExtension, valueShadowExtension],
  style: 'sprite_blocks',
  tooltip:
    'Draw several lines of text, broken between words to fit a column. A ' +
    'word wider than the column stays whole and overhangs — this lab has no ' +
    'dictionary to hyphenate with.',
  generator: {
    javascript(block, generator) {
      const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
      const width = generator.valueToCode(block, 'WIDTH', Order.NONE) || '0';
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      const size = generator.valueToCode(block, 'SIZE', Order.NONE) || '12';
      const anchor =
        generator.valueToCode(block, 'ANCHOR', Order.NONE) || str('center');
      // `String(…)` for the reason `draw text` gives: the socket takes any
      // value and the commonest thing drawn is a number.
      return `pen.text(String(${text}), ${x}, ${y}, ${size}, ${anchor}, ${width});\n`;
    },
  },
});
registerValueShadows('world_draw_paragraph', [
  {name: 'TEXT', shadow: {type: 'text', fields: {TEXT: 'hello'}}},
  {name: 'WIDTH', shadow: {type: 'math_number', fields: {NUM: 120}}},
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 0}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 0}}},
  {name: 'SIZE', shadow: {type: 'math_number', fields: {NUM: 12}}},
]);

registerValueShadows('world_draw_text', [
  {name: 'TEXT', shadow: {type: 'text', fields: {TEXT: 'hello'}}},
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 16}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 16}}},
  {name: 'SIZE', shadow: {type: 'math_number', fields: {NUM: 12}}},
  {name: 'ANCHOR', shadow: {type: 'world_text_anchor'}},
]);

// `anchor ⟨center⟩` — an anchor's name as a value, the same shape `key` and
// `mouse button` have. A FIELD would have read the same in the common case and
// made a per-instance anchor unsayable: a Label's anchor is state the map
// editor sets, and state arrives through a socket (specs/UI_ACTORS.md).
const worldTextAnchor = defineBlock({
  type: 'world_text_anchor',
  message0: 'anchor %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'ANCHOR',
      options: TEXT_ANCHORS.map(anchor => [anchor, anchor] as [string, string]),
    },
  ],
  output: 'String',
  style: 'text_blocks',
  tooltip:
    'Which part of the text sits at the point it is drawn at — so a number ' +
    'that grows can stay where it was put.',
  generator: {
    javascript(block) {
      return [str(block.getFieldValue('ANCHOR')), Order.ATOMIC] as [
        string,
        number,
      ];
    },
  },
});

const worldDrawImage = defineBlock({
  type: 'world_draw_image',
  message0: 'draw image %1 at x %2 y %3',
  args0: [
    {type: 'field_dropdown', name: 'SPRITE', options: spriteFieldOptions},
    numberArg('X'),
    numberArg('Y'),
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [
    drawingContextExtension,
    spriteOptionsExtension,
    spritePickExtension,
    spriteImportFieldExtension,
    valueShadowExtension,
  ],
  style: 'sprite_blocks',
  tooltip:
    'Draw one of the project’s pictures into this one — a button’s face, an ' +
    'icon beside a word.',
  generator: {
    javascript(block, generator) {
      const value = block.getFieldValue('SPRITE');
      if (!value) {
        return '';
      }
      // A cell is resolved HERE, where the project's `.sheet` files are known,
      // exactly as `set sprite` resolves one — the engine is only ever told
      // rectangles (spriteCells).
      const {sprite} = parseSpriteRef(value);
      const cell = spriteCell(value);
      const x = generator.valueToCode(block, 'X', Order.NONE) || '0';
      const y = generator.valueToCode(block, 'Y', Order.NONE) || '0';
      const rect = cell
        ? `, {x: ${cell.x}, y: ${cell.y}, ` +
          `width: ${cell.width}, height: ${cell.height}}`
        : '';
      return `pen.image(${str(sprite)}, ${x}, ${y}${rect});\n`;
    },
  },
});
registerValueShadows('world_draw_image', [
  {name: 'X', shadow: {type: 'math_number', fields: {NUM: 0}}},
  {name: 'Y', shadow: {type: 'math_number', fields: {NUM: 0}}},
]);

const worldRuleStepTick = stepBlock(
  'world_rule_step_tick',
  'when tick do %1',
  [nameArg],
  'Run this every tick, in no particular order relative to other rules.',
  [bodyButtonExtension],
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

// `mouse button <button>` — the same, for the mouse. A button's name as a
// value, so a comparison against `event value` reads as a button.
const worldMouseButton = defineBlock({
  type: 'world_mouse_button',
  message0: 'mouse button %1',
  args0: [{type: 'field_dropdown', name: 'BUTTON', options: buttonOptions()}],
  output: 'String',
  style: 'text_blocks',
  tooltip: 'The name of a mouse button.',
  generator: {
    javascript(block) {
      return [str(block.getFieldValue('BUTTON')), Order.ATOMIC] as [
        string,
        number,
      ];
    },
  },
});

// `mouse position` — where the pointer is, as a place in the WORLD.
//
// A value block rather than an event's argument, because the mouse is somewhere
// whether or not it has just moved: aiming at it, walking toward it and asking
// whether it is over something all want the current answer, and a rule that had
// to remember the last "moved" event would be storing what the World already
// knows. The conversion from where it is on the SCREEN is the World's
// (`mousePosition`), because it needs the camera.
const worldMousePosition = defineBlock({
  type: 'world_mouse_position',
  message0: 'mouse position',
  output: 'Vector',
  extensions: [worldContextExtension],
  style: 'location_blocks',
  tooltip:
    'Where the mouse is in the world, in pixels — the point it is over, ' +
    'which moves with the camera.',
  generator: {
    javascript() {
      return ['world.mousePosition()', Order.FUNCTION_CALL] as [string, number];
    },
  },
});

// `mouse button <button> is down` — the polling side, exactly as `key … is
// down` is: "while held", which is what dragging and aiming are.
const worldIsButtonDown = defineBlock({
  type: 'world_is_button_down',
  message0: 'mouse button %1 is down',
  args0: [{type: 'field_dropdown', name: 'BUTTON', options: buttonOptions()}],
  output: 'Boolean',
  extensions: [worldContextExtension],
  style: 'logic_blocks',
  tooltip:
    'True while the button is held (and the game has focus). For a one-shot ' +
    'reaction to a click, use the “presses mouse button” event instead.',
  generator: {
    javascript(block) {
      const button = block.getFieldValue('BUTTON');
      return [`world.isButtonDown(${str(button)})`, Order.FUNCTION_CALL] as [
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

// The same loop for the mouse's buttons. A block of its own rather than a
// source dropdown on the key one: the two read as different sentences, the
// variable each binds is a different KIND of name (a key against a button), and
// a learner reaching for the mouse should not have to notice that the keyboard
// block can be talked into it.
const BUTTON_EDGE_METHODS: Record<string, string> = {
  PRESSED: 'newlyPressedButtons',
  RELEASED: 'newlyReleasedButtons',
};
const worldForEachButton = defineBlock({
  type: 'world_for_each_button',
  message0: 'for each %1 mouse button %2',
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
    'Run the blocks once for each mouse button that went down (or came up) ' +
    'since the last frame. Bind the loop variable to read which button it was.',
  generator: {
    javascript(block, generator) {
      const variable = generator.getVariableName(block.getFieldValue('VAR'));
      const edge =
        BUTTON_EDGE_METHODS[block.getFieldValue('EDGE') ?? 'PRESSED'];
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
/**
 * `world_doc` — a page of prose in the workspace.
 *
 * A `note` says one line and says it as typed. This says a paragraph, a list,
 * a heading: the documentation that lives beside a rule in the codebase and
 * never reached the person reading the rule. It changes nothing about what
 * runs, and it is drawn as markdown — `FieldMarkdown` puts the HTML inside the
 * block's SVG and measures what the browser made of it.
 *
 * No label on it. The prose IS the block, the way a page is its words, and a
 * word in front of it would be a caption on every paragraph in the project.
 */
export const MARKDOWN_FIELD = 'DOC';

const docFieldExtension = defineExtension('world_doc_field', {
  extension() {
    const block = this as unknown as Block;
    // Appended rather than declared: a field class of our own is not one of
    // the `args0` kinds, and this is how `blockDesigner` attaches its preview
    // too.
    if (!block.getField(MARKDOWN_FIELD)) {
      block.inputList[0]?.appendField(
        new FieldMarkdown('') as unknown as Parameters<
          NonNullable<Block['inputList'][number]>['appendField']
        >[0],
        MARKDOWN_FIELD,
      );
    }
  },
});

const worldDoc = defineBlock({
  type: 'world_doc',
  message0: '%1',
  args0: [{type: 'input_dummy', name: 'PROSE'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [docFieldExtension],
  style: 'comment_blocks',
  tooltip:
    'Documentation for whoever reads this next — headings, lists and all. ' +
    'Click it to write. It changes nothing about what runs.',
  generator: {
    javascript(block) {
      // One `//` per line. A block comment would end at the first `*/` in the
      // prose, and prose is exactly where one turns up.
      const text = String(block.getFieldValue(MARKDOWN_FIELD) ?? '');
      return text
        .split('\n')
        .map(line => `// ${line}`.trimEnd())
        .join('\n')
        .concat('\n');
    },
  },
});

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

// `add trait <trait> to <actor>` / `remove trait <trait> from <actor>` — the
// runtime pair beside `has trait`, which is how you ask.
//
// `use trait` is the declaration and takes no subject: it says what an actor IS
// as it is built. These say what it is doing NOW — stop this camera following,
// give the player a shield for ten seconds — so they take a subject, exactly as
// `add effect` and `remove effect` do.
//
// A dropped trait keeps the properties it declared (core/Traited), so putting
// it back resumes rather than resets. Removing a trait the subject only holds
// because something else requires it does nothing at all, and says nothing:
// the reference count is what decides, and it is no more an error than removing
// a trait that was never there.
const traitMutation = (opts: {
  type: string;
  message0: string;
  method: 'addTrait' | 'removeTrait';
  /**
   * Whose traits this one offers.
   *
   * TWO BLOCKS, one sentence. A single block offering every trait put the
   * camera ones in front of somebody wiring up an actor, and a camera trait
   * elected on an actor reads correctly and does nothing at all — the failure
   * says nothing, because nothing is wrong with the sentence. Narrowing each
   * list is what stops the mistake being available.
   *
   * They read alike on purpose: the sentence IS the same sentence, and what
   * differs is what it is about, which the socket's own shadow says — `this
   * actor` against `camera ⟨the main camera⟩`.
   */
  subject: 'actor' | 'camera';
  tooltip: string;
}) =>
  defineBlock({
    type: opts.type,
    message0: opts.message0,
    args0: [
      {
        type: 'field_dropdown',
        name: 'TRAIT',
        options:
          opts.subject === 'camera' ? cameraTraitOptions : actorTraitOptions,
      },
      {type: 'input_value', name: 'ACTOR', check: 'Actor'},
    ],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    extensions:
      opts.subject === 'camera'
        ? [cameraInputExtension, cameraTraitOptionsExtension]
        : [actorInputExtension, actorTraitOptionsExtension],
    style: 'setup_blocks',
    tooltip: opts.tooltip,
    generator: {
      javascript(block, generator) {
        const target = actorTarget(block, generator, Order.MEMBER);
        const ref = refFromValue(block.getFieldValue('TRAIT'));
        return `${oneActor(target)}.${opts.method}(${refCode(ref, generator)});\n`;
      },
    },
  });

const RUNTIME_TRAIT_NOTE =
  'Its steps start on the next frame, and a trait it had before keeps the ' +
  'values it had then.';

/**
 * `define tween ⟨name⟩` — a movement of one property, named and reusable.
 *
 * A DEFINITION ROOT, like `define actor` and `define drawing`: it declares
 * something and generates a `const`, and playing it is a separate block. The
 * alternative — one block that both describes and starts the movement — cannot
 * be reused, and a game fades a dozen things the same way.
 *
 * NO `from`. A tween starts wherever the property already is, captured when it
 * is played (`engine/core/tween`): "fade out" means from however visible you
 * are now, and a definition that fixed the start would snap before it moved.
 */
const worldDefineTween = defineBlock({
  type: DEFINE_TWEEN,
  message0: 'define tween %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'fade out'}],
  message1: 'over %1 seconds, %2',
  args1: [
    {type: 'input_value', name: 'SECONDS', check: 'Number'},
    {
      type: 'field_dropdown',
      name: 'CURVE',
      options: [
        ['steadily', 'linear'],
        ['starting slowly', 'ease-in'],
        ['ending slowly', 'ease-out'],
        ['slow at both ends', 'ease-in-out'],
      ],
    },
  ],
  message2: 'move %1',
  args2: [{type: 'input_statement', name: 'DO'}],
  // A ROOT, with no connections — the shape `define drawing` has and for the
  // same two reasons. It declares something rather than doing something, so
  // there is no moment for it to happen AT; and a top-level block that has a
  // previous connection is disabled as an orphan by `DisableOrphansPlugin`,
  // along with everything below it.
  extensions: [valueShadowExtension],
  style: 'setup_blocks',
  tooltip:
    'Describe a movement over time. Put ordinary `set` blocks inside it — ' +
    'each one is a destination rather than a write. Nothing happens until ' +
    'something plays it.',
  generator: {
    javascript(block, generator) {
      const name = String(block.getFieldValue('NAME') ?? 'tween');
      const seconds =
        generator.valueToCode(block, 'SECONDS', Order.NONE) || '0';
      // A FUNCTION OF THE ACTOR, not a record.
      //
      // This is what lets an ordinary `set` block live inside: the body can
      // then say `this actor`, read another property off it, or compute a
      // destination from where it is now — none of which a `const` evaluated
      // once at module scope could do. `play tween` calls it with whoever the
      // tween is played on.
      const destinations = generator.statementToCode(block, 'DO') || '';
      return (
        `const ${tweenVar(name, block.id)} = (actor) => ({` +
        `id: ${str(name)}, duration: ${seconds}, ` +
        `curve: ${str(String(block.getFieldValue('CURVE') ?? 'linear'))}, ` +
        `steps: [\n${destinations}]});\n`
      );
    },
  },
});

// A second, not nothing. An empty socket generates `0`, and a tween of no
// length lands on its destinations the frame it starts — which looks exactly
// like a tween that did not run, and is the first thing anybody dragging this
// block out would see.
registerValueShadows(DEFINE_TWEEN, [
  {name: 'SECONDS', shadow: {type: 'math_number', fields: {NUM: 1}}},
]);

/**
 * `play a tween on ⟨…⟩` — a tween with no name, written where it is used.
 *
 * The named pair — `define tween` and `play tween` — is what a movement several
 * things share wants: describe it once, play it wherever. Most tweens are not
 * that. A door that slides open once, a title that fades on the way to the
 * menu: putting each in a definition somewhere else, to name it and then name
 * it again, is ceremony for a thing used in one place.
 *
 * WHAT IS GIVEN UP IS THE END. `a tween finishes` carries the tween's name, so
 * a handler waiting for one of these cannot tell it from any other unnamed
 * tween. Anything that needs to hear about its own ending should be defined and
 * named; that is the trade, and it is the reason both blocks exist rather than
 * one.
 */
const worldPlayTweenHere = defineBlock({
  type: PLAY_TWEEN_HERE,
  message0: 'play a tween on %1',
  args0: [{type: 'input_value', name: 'ACTOR', check: 'Actor'}],
  message1: 'over %1 seconds, %2',
  args1: [
    {type: 'input_value', name: 'SECONDS', check: 'Number'},
    {
      type: 'field_dropdown',
      name: 'CURVE',
      options: [
        ['steadily', 'linear'],
        ['starting slowly', 'ease-in'],
        ['ending slowly', 'ease-out'],
        ['slow at both ends', 'ease-in-out'],
      ],
    },
  ],
  message2: 'move %1',
  args2: [{type: 'input_statement', name: 'DO'}],
  previousStatement: true,
  nextStatement: true,
  extensions: [actorInputExtension, valueShadowExtension],
  style: 'behavior_blocks',
  tooltip:
    'Move some properties over time, described right here. Use `define ' +
    'tween` instead when several things play the same movement, or when ' +
    'something has to hear that it finished.',
  generator: {
    javascript(block, generator) {
      const seconds =
        generator.valueToCode(block, 'SECONDS', Order.NONE) || '0';
      const destinations = generator.statementToCode(block, 'DO') || '';
      const plan =
        `{id: "an unnamed tween", duration: ${seconds}, ` +
        `curve: ${str(String(block.getFieldValue('CURVE') ?? 'linear'))}, ` +
        `steps: [\n${destinations}]}`;
      return forEachActor(
        actorTarget(block, generator),
        who =>
          // Bound as `actor` around the destinations, exactly as a named
          // tween's definition is — so `this actor` inside the mouth means the
          // actor being tweened in both blocks, and not the enclosing handler's
          // in one of them and the played one in the other.
          `${who}.startTween(` +
          `WorldLab.beginTween(((actor) => (${plan}))(${who}), ${who}), ` +
          `WorldLab.tweenDisplaced)`,
      );
    },
  },
});
registerValueShadows(PLAY_TWEEN_HERE, [
  {name: 'SECONDS', shadow: {type: 'math_number', fields: {NUM: 1}}},
]);

/**
 * `play tween ⟨…⟩ on ⟨…⟩` — start one running.
 *
 * The definition says what the movement IS; this says when and to whom. It
 * returns at once and the movement continues on its own, which is the whole
 * reason a tween is runtime state (`engine/core/tween`).
 */
const worldPlayTween = defineBlock({
  type: 'world_play_tween',
  message0: 'play tween %1 on %2',
  args0: [
    {type: 'field_dropdown', name: 'TWEEN', options: tweenOptions},
    {type: 'input_value', name: 'ACTOR', check: 'Actor'},
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  extensions: [actorInputExtension, tweenOptionsExtension],
  style: 'behavior_blocks',
  tooltip:
    'Start a movement this file describes. It carries on by itself; a ' +
    '“tween finishes” handler is how to hear about the end.',
  generator: {
    javascript(block, generator) {
      const chosen = String(block.getFieldValue('TWEEN') ?? '');
      if (!chosen) {
        // No tween defined yet, so nothing to play — the bargain `use trait`
        // makes with "(none)", and for the same reason: half a block should
        // generate nothing rather than a name with nothing behind it.
        return '';
      }
      const defined = tweensIn(block.workspace).find(
        held => held.blockId === chosen,
      );
      if (!defined) {
        // The definition was deleted and this still names it.
        return '';
      }
      const held = tweenVar(defined.name, defined.blockId);
      // CALLED with the actor, because the definition is a function of one —
      // that is what lets a `set` block inside it say `this actor`.
      //
      // `from` is read HERE, not in the definition: a destination is a fact
      // about where to go, and where you started is a fact about the moment
      // you set off.
      return forEachActor(
        actorTarget(block, generator),
        who =>
          `${who}.startTween(WorldLab.beginTween(${held}(${who}), ${who}), ` +
          `WorldLab.tweenDisplaced)`,
      );
    },
  },
});

const worldAddTrait = traitMutation({
  type: 'world_add_trait',
  message0: 'add trait %1 to %2',
  method: 'addTrait',
  subject: 'actor',
  tooltip: `Give an actor a trait while the game runs. ${RUNTIME_TRAIT_NOTE}`,
});

const worldAddCameraTrait = traitMutation({
  type: 'world_add_camera_trait',
  message0: 'add trait %1 to %2',
  method: 'addTrait',
  subject: 'camera',
  tooltip:
    'Give a camera a trait while the game runs — which is how a camera rule ' +
    `reaches the camera every world already has. ${RUNTIME_TRAIT_NOTE}`,
});

const REMOVE_TRAIT_NOTE =
  'What it remembers is kept, so adding it back picks up where it left off. ' +
  'A trait that is only there because another trait needs it stays.';

const worldRemoveTrait = traitMutation({
  type: 'world_remove_trait',
  message0: 'remove trait %1 from %2',
  method: 'removeTrait',
  subject: 'actor',
  tooltip: `Take a trait away from an actor while the game runs, so its steps stop. ${REMOVE_TRAIT_NOTE}`,
});

const worldRemoveCameraTrait = traitMutation({
  type: 'world_remove_camera_trait',
  message0: 'remove trait %1 from %2',
  method: 'removeTrait',
  subject: 'camera',
  tooltip: `Take a trait away from a camera while the game runs, so its steps stop. ${REMOVE_TRAIT_NOTE}`,
});

export const DOMAIN_BLOCKS = [
  ...GENERAL_PROPERTY_BLOCKS,
  worldActor,
  worldUseTrait,
  worldActsLike,
  worldDefineTween,
  worldPlayTween,
  worldPlayTweenHere,
  worldAddTrait,
  worldAddCameraTrait,
  worldRemoveTrait,
  worldRemoveCameraTrait,
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
  worldEventActor,
  worldEventValue,
  worldKindOf,
  worldListAdd,
  worldListAddFront,
  worldListTakeFirst,
  worldListEmpty,
  worldListLast,
  worldListHas,
  worldForEachNumber,
  worldForEachWord,
  worldForEachPlace,
  worldVector,
  worldVectorMath,
  worldVectorRotate,
  worldVectorOf,
  worldSlider,
  worldRgba,
  worldVectorLength,
  worldVectorDirection,
  worldVectorFromAngle,
  worldVectorComponent,
  worldThisActor,
  worldActorKind,
  ActorVariable.getterBlock,
  worldAllActors,
  worldCameraValue,
  worldAllCameras,
  worldThisCamera,
  worldMapSize,
  worldSetMapSize,
  worldSetViewSize,
  worldActorAge,
  worldRandomPlace,
  worldTime,
  worldViewSize,
  worldPushActor,
  worldClearActors,
  worldCountActors,
  worldCountOfKind,
  worldAnyActors,
  worldAllActorsInLayer,
  worldIsInLayer,
  worldIsInActors,
  worldForEach,
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
  ...signatureItems,
  signatureChoice,
  signatureArgument,
  worldDoc,
  worldReturn,
  worldRuleStepIn,
  worldTraitStep,
  worldShowAs,
  worldCountWith,
  // Actor lists as values: filtering, ordering, and taking from one
  // (specs/ACTOR_LISTS.md).
  worldPlaySound,
  worldSetMusic,
  worldStopMusic,
  worldStopAllSounds,
  worldFilterActors,
  worldActorsWithin,
  worldNearPlaceOfKind,
  worldNearPlaceWithTrait,
  worldFirstActor,
  worldAnyActor,
  worldSameActor,
  worldActorsWithTrait,
  worldExtremeActor,
  worldOrderedActors,
  worldTakeActors,
  // Drawing: the root, the pen, and the five commands (specs/DRAWING.md).
  worldDefineDrawing,
  worldPenFill,
  worldPenOutline,
  worldPenNoFill,
  worldPenNoOutline,
  worldDrawRectangle,
  worldDrawCircle,
  worldDrawLine,
  worldDrawText,
  worldDrawParagraph,
  worldTextAnchor,
  worldDrawImage,
  worldRuleStepTick,
  worldKey,
  worldForEachKey,
  worldComment,
  worldPixelsPerUnit,
  worldStepDelta,
  worldIsKeyDown,
  worldMouseButton,
  worldMousePosition,
  worldIsButtonDown,
  worldForEachButton,
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
// WHAT A DRAWING IS MADE OF, and nothing that makes one. `define drawing`
// is a declaration and sits with the others in Actor; these are the pen and
// the shapes, which mean nothing outside a drawing's body and are offered
// only on a drawing's own surface (`surfaceToolbox`). In the file's toolbox
// they were twelve blocks with nowhere to go, in the drawer of every actor
// whether it drew anything or not.
export const DRAWING_CATEGORY: ToolboxCategory = {
  name: 'Drawing',
  blocks: [
    // The pen, which every shape after it is painted with.
    'world_pen_fill',
    'world_pen_outline',
    'world_pen_no_fill',
    'world_pen_no_outline',
    // …and the five things there are to draw.
    'world_draw_rectangle',
    'world_draw_circle',
    'world_draw_line',
    'world_draw_text',
    // …and several lines of it, broken to fit a column.
    'world_draw_paragraph',
    'world_text_anchor',
    'world_draw_image',
  ],
};

const TOOLBOX_HEAD: ToolboxCategory[] = [
  {
    name: 'Actor',
    blocks: [
      'world_actor',
      'world_use_trait',
      // Any property of any actor, by name — a rule's or one an actor's own
      // file declares. The per-rule categories still list a rule's properties
      // one by one, which is how they are DISCOVERED; these are how they are
      // reached when you already know what you want, and they are the only way
      // an actor's own is reachable at all (blockly/propertyOptions).
      ...GENERAL_PROPERTY_TYPES,
      // …and the runtime pair beside it: what an actor IS as it is built,
      // against what it is doing now. `has trait` asks, and sits with Logic.
      'world_add_trait',
      'world_remove_trait',
      // One block plays an effect on an actor, in a template or at runtime;
      // `remove` is runtime-only (there is nothing to un-declare).
      'world_add_effect',
      'world_remove_effect',
      // What a picker draws this kind with, when it is too small for the
      // picture (specs/UI_ACTORS.md).
      SHOW_AS,
      'world_this_actor',
      // The 'any of this kind' counterpart, for a world file naming several.
      'world_actor_kind',
      'world_all_actors',
      // …and the one filter written more often than every other put together
      // (specs/ACTOR_LISTS.md).
      'world_actors_with_trait',
      // Making a list out of a list: filtered, ordered, shortened, and the two
      // ways of taking one actor out of one.
      'world_filter_actors',
      // …and the one shape of it worth its own block: what is near something
      // (specs/PROGRESSION.md, `simulation/neighbors`).
      'world_actors_within',
      // …and the same question asked of a PLACE, out of the whole world rather
      // than out of a list — which is the form a search takes, and the one
      // that goes through the index rather than measuring everything
      // (`core/spatialIndex`).
      'world_near_place_kind',
      'world_near_place_trait',
      'world_ordered_actors',
      'world_take_actors',
      'world_first_actor',
      'world_any_actor',
      'world_same_actor',
      'world_extreme_actor',
      // Building a group up, and asking about one.
      'world_push_actor',
      'world_clear_actors',
      'world_count_actors',
      // The same count, narrowed to a kind — how many coins, how many bricks.
      'world_count_of_kind',
      'world_any_actors',
      'world_is_in_actors',
      // Narrowing to a layer: the list, and the question (specs/VIEWPORT.md).
      'world_all_actors_in_layer',
      'world_is_in_layer',
      ActorVariable.getterType,
      'world_is_a',
      // …and the kind as a VALUE, which is the half `is a` cannot be: its
      // dropdown names the project's kinds, and a rule has never seen them.
      'world_kind_of',
      // How long it has been here — what a bullet, a spark or a lapsing shield
      // compares against to know it is done.
      'world_actor_age',
      // The actor an event was about, inside a handler for one that carries it.
      'world_event_actor',
      // …and the other half of what a hat hands over: what the event CARRIED —
      // the key that was pressed, the frame an animation reached. It was in
      // Console, which it had nothing to do with: it landed there because
      // printing it was the only way anybody had seen one, and a learner
      // looking for it had no reason to open that drawer. It belongs beside the
      // block that answers the other question a handler asks.
      'world_event_value',
      // Being everything another kind of actor is, and going on being this
      // one. The traits, the slots, the per-frame work and the picture come
      // across; the KIND does not, so `any ⟨that one⟩` still means that one
      // (`ActorBuilder.actsLike`).
      'world_acts_like',
      // Declaring state this KIND of actor carries. The same block a rule and a
      // trait declare with: it already takes its meaning from where it sits, so
      // a third site is what it was built for, and a separate near-identical
      // block would invite trying the familiar one here and finding it inert.
      'world_rule_property',
      // …and the behavior half of the same idea: work this KIND of actor does
      // every frame. A rule is still the answer when the work is shared between
      // kinds, elected, or answerable by `has trait`; this is for when it is
      // none of those (ActorBuilder.defineStep).
      'world_trait_step',
      // …and the third: a NAMED thing this kind does, which is what a learner
      // reaches for on finding they have written the same six blocks twice.
      // The same block a rule designs its own with — where it sits decides
      // whose it is (`ActorBuilder.defineAction`).
      'world_rule_block',
      // …and the fourth: something that HAPPENS to this kind, which is how it
      // tells the rest of the project about a moment without a rule in
      // between. It raises the event with `emit` and anything may hear it with
      // the hat — the same block a rule declares its events with
      // (`ActorBuilder.defineEvent`).
      'world_rule_event',
      // …and the fourth: what this kind LOOKS like. A declaration like the
      // three above it and reached the same way — the pencil opens the pen and
      // the shapes on a surface of its own, which is why the Drawing drawer is
      // not in this toolbox (specs/DRAWING.md).
      'world_define_drawing',
    ],
  },
  {
    name: 'World',
    blocks: [
      'world_world',
      // State this WORLD carries — a score, a level, a flag. The same block a
      // rule and an actor declare with, in a fourth home, because it already
      // takes its meaning from where it sits (specs/WORLD_STATE.md).
      'world_rule_property',
      // NO `use rule`. A world runs the rules the project holds, so the block
      // says nothing here (blockly/projectModules) — it stays registered so
      // that projects saved with one keep loading and keep meaning what they
      // meant, and stays offered under Rule, where it is a rule's `requires`
      // and still a real statement. It goes entirely once nothing holds one.
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
      // Movement over time: described once, played wherever. Beside the
      // camera blocks because both are about how a thing gets somewhere
      // rather than where it is.
      'world_define_tween',
      'world_play_tween',
      // …and the same movement written where it is used, for the one that is
      // not shared and has nobody waiting to hear it end.
      'world_play_tween_here',
      // How a camera rule reaches the camera every world already has. Listed
      // HERE, beside the camera blocks, because that is where somebody wiring
      // one up is looking — the actor pair stays with the runtime blocks.
      'world_add_camera_trait',
      'world_remove_camera_trait',
      // The one a camera-scoped step is running for — `this actor`'s
      // counterpart, and the only way such a step names its own subject.
      'world_this_camera',
      // How big the level is, for anything that keeps a view inside it — and
      // how a world without a `.map` file says so in the first place.
      'world_set_map_size',
      'world_map_size',
      // …and how much of it is on screen at once, which is the world's to say
      // as well: a room meant to be taken in at a glance says so here.
      'world_set_view_size',
      'world_view_size',
      // …and how long it has been going, which is what every delay, cooldown
      // and lifetime is measured against.
      'world_time',
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
      // What is behind everything: an image, a color, and effects on that
      // image alone (BACKGROUNDS.md).
      'world_set_background',
      'world_clear_background',
      'world_set_background_offset',
      'world_set_background_repeat',
      'world_set_foreground',
      'world_clear_foreground',
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
      // Per-tick behavior, one block per kind of ordering.
      'world_rule_step_tick',
      'world_rule_step_in',
      'world_trait_step',
      'world_step_delta', // the frame time, inside a step
      // Reading and writing a variable lives in Variables (below), not here: a
      // rule's parameters are variables like any other, and a body wanting a
      // local is not a fact about rules.
    ],
  },
  {
    // What a definition's own block is made of, offered only where one is
    // being written: these go in the `arguments` row on a surface's head, and
    // there is no such row anywhere else. Which of them a given surface
    // offers is `surfaceToolbox`'s business — a `define block` takes
    // `argument`, a `define event` takes `choice`.
    name: 'Block',
    blocks: [SIGNATURE_ARGUMENT, SIGNATURE_CHOICE, 'world_signature_text'],
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
    // The mouse, on the same three terms, plus the one the keyboard has no
    // counterpart for: a pointer is somewhere, and a key is not.
    'world_is_button_down',
    'world_for_each_button',
    'world_mouse_button',
    'world_mouse_position',
    'world_pixels_per_unit', // the scale between a speed and a distance
  ],
};

const TOOLBOX_TAIL: ToolboxCategory[] = [
  // The loop, and the same question asked for one answer instead of a body.
  {
    name: 'Loops',
    blocks: [
      // The loop. What it walks is a list, and the blocks that make one out of
      // another — filtered, ordered, shortened — live with the actors
      // (specs/ACTOR_LISTS.md), because what they hand back is actors.
      'world_for_each',
      // …and the two that count rather than walk. `repeat` is Blockly's own,
      // for the reason `random integer` is: a learner may already have met it,
      // and its generator ships with the JavaScript one. Spelled out as a
      // flyout item so its socket arrives filled — a core block carries none of
      // our shadows, and `repeat ⟨⟩ times` generates a loop that never runs.
      {
        kind: 'block',
        type: 'controls_repeat_ext',
        inputs: {TIMES: {shadow: {type: 'math_number', fields: {NUM: 10}}}},
      },
      'world_count_with',
      // …and the way out of one. Blockly's own, with its own warning when it is
      // dropped outside a loop, and a generator that ships with the JavaScript
      // one — the same bargain `repeat` and `random integer` take.
      //
      // IT LEAVES THE INNERMOST LOOP, which is what "stop" reads as and is
      // exactly what a search wants: one loop, and a reason to stop walking it
      // the moment the answer turns up. A learner who nests two and expects the
      // outer one to end has written the one mistake this block can make, and
      // it is the mistake every language with `break` in it allows.
      'controls_flow_statements',
    ],
  },
  // A noise, and a track. Its own category rather than tucked under Appearance:
  // what a game sounds like is not what it looks like, and a learner looking
  // for "play sound" looks for a word, not for a drawer (specs/SOUND.md).
  {
    name: 'Sound',
    blocks: [
      'world_play_sound',
      'world_set_music',
      // …and the two ways to stop, which are two because they stop different
      // amounts (`world_stop_all_sounds`).
      'world_stop_music',
      'world_stop_all_sounds',
    ],
  },
  // Lists of values — the drawer that lets a project keep two numbers
  // (specs/LISTS.md). Its literal and its count are Blockly's own, reworded;
  // the rest is this lab's, in the voice the actor lists speak.
  {
    name: 'Lists',
    blocks: [
      {
        kind: 'block',
        type: 'lists_create_with',
        // Three sockets, as Blockly's own toolbox seeds it: a list of one is
        // rarely what anybody means, and the mutator adds more.
        extraState: {itemCount: 3},
      },
      'lists_create_empty',
      'world_list_add',
      'world_list_add_front',
      'world_list_take_first',
      'world_list_empty',
      'lists_length',
      'world_list_has',
      // The end a stack is read from. No `item ⟨n⟩ of` yet: an index is a
      // decision about what "past the end" means, and it waits for a use that
      // argues for one (specs/LISTS.md).
      'world_list_last',
      // …and a loop per kind of thing, beside the one that walks actors.
      'world_for_each_number',
      'world_for_each_word',
      'world_for_each_place',
      ListVariable.getterType,
      ListVariable.setterType,
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
      // …and the trigonometric ones, which are a SEPARATE core block: SIN is
      // not an option on `math_single`, and a saved block that says it is
      // loads with whatever the dropdown's first option happens to be.
      //
      // Blockly's `math_trig` works in DEGREES, which is the unit everything
      // else here measures an angle in (`Vector.fromAngle`, `Vector.angle`), so
      // the block a learner reaches for and the blocks it feeds agree without
      // anybody converting anything.
      'math_trig',
      // Blockly's own random, rather than one of ours: it is a block a learner
      // may already have met, and its generator ships with the JavaScript one.
      //
      // Spelled out as a flyout item rather than a bare type so its sockets
      // arrive filled, as they do in Blockly's stock toolbox. Our own blocks
      // get their shadows from `valueShadowExtension`, which a core block does
      // not carry — and an empty `random integer from ⟨⟩ to ⟨⟩` generates
      // `mathRandomInt(0, 0)`, which is a block that silently always answers 0.
      {
        kind: 'block',
        type: 'math_random_int',
        inputs: {
          FROM: {shadow: {type: 'math_number', fields: {NUM: 1}}},
          TO: {shadow: {type: 'math_number', fields: {NUM: 100}}},
        },
      },
      // …and the whole-location shorthand, which is the form a game actually
      // wants — scatter an asteroid, drop a coin.
      'world_random_place',
      'world_vector',
      'world_vector_of',
      'world_vector_math',
      'world_vector_rotate',
      'world_vector_component',
      // A vector and its polar halves: how long it is, which way it points,
      // and one made from those two. Nothing turned a direction into an angle
      // before these, so "face the way you are going" was not sayable.
      'world_vector_length',
      'world_vector_direction',
      'world_vector_from_angle',
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
  {
    name: 'Text',
    blocks: [
      'text',
      // JOINING, which is what a score needs: a Label draws one value, and
      // "Score: 5" is a word and a number until something puts them together.
      // Without this the first scoreboard anybody writes is a bare numeral.
      'text_join',
      // …and how long a word is, the one question about a string a world made
      // of actors has a use for: a name that has to fit the box it is drawn in.
      'text_length',
      // …and a piece of one, which is the day the comment below anticipated:
      // revealing a line a few letters at a time is a substring per letter,
      // and the Speech Box is written in terms of it.
      'text_getSubstring',
      // DELIBERATELY NOT the rest of Blockly's text category. `text_append`
      // writes to a variable that outlives nothing here; `text_prompt` asks the
      // browser for input the game cannot see; and `indexOf`, `charAt`,
      // `changeCase`, `trim`, `count`, `replace` and `reverse` are string
      // surgery with no reading in a world yet. Each is one line to add the day
      // something wants it.
      'world_comment',
      // …and the long form of the same idea: a page of prose rather than a
      // line, drawn as markdown.
      'world_doc',
      // …and saying one out loud. THE CONSOLE CATEGORY WAS THIS BLOCK, and a
      // drawer holding one thing is a drawer to look in once and never again.
      // What it writes is a value — usually a word, and the shadow it wears is
      // a word — so it sits with the words.
      'world_print',
    ],
  },
  // Variables last, as Blockly's own toolboxes have them. A rule's parameters
  // are declared in `define block`'s signature, so there is no block for
  // declaring one — these read and write whatever is in scope, whether that is a
  // parameter, a `for each` loop's variable, or a local a body made for itself.
  {name: 'Variables', blocks: [...PARAM_VARIABLE_TYPES]},
];

/** The toolbox as a `.rule` sees it: everything, plus the Engine category. */
/**
 * `Engine` goes with the fixed categories, not after the rules.
 *
 * It is one of the language's own — the primitives a rule needs to do what the
 * engine used to do for it — so it belongs above the heading with the rest of
 * them. Placed after `Variables`, which is where it already sat before the
 * rules moved down.
 */
const withEngine = (categories: ToolboxCategory[]): ToolboxCategory[] => {
  const at = categories.findIndex(
    category => (category as {kind?: string}).kind === TOOLBOX_HEADING,
  );
  return at < 0
    ? [...categories, ENGINE_CATEGORY]
    : [...categories.slice(0, at), ENGINE_CATEGORY, ...categories.slice(at)];
};

/**
 * The structural categories as one kind of file sees them.
 *
 * The whole `Rule` category goes when the file is not a `.rule`: every block in
 * it declares part of a rule, and the two it shares with elsewhere
 * (`use rule`, `use trait`) are listed in World and Actor as well, so dropping
 * it costs nothing. That the Engine category was already gated this way and
 * Rule was not is the inconsistency being closed.
 *
 * No file kind — the headless generator, which has no one file — sees all of
 * it, the same direction taken everywhere else here: its palette is never
 * shown, and what it fails to offer it may still have to define.
 */
const structuralCategories = (fileKind?: FileKind): ToolboxCategory[] => {
  if (!fileKind) {
    return TOOLBOX_HEAD;
  }
  const kept: ToolboxCategory[] = [];
  for (const category of TOOLBOX_HEAD) {
    if (category.name === 'Rule' && fileKind !== 'rule') {
      continue;
    }
    // Drawing belongs to a DRAWING's own surface and to no file
    // (`surfaceToolbox`). The pen and the shapes can only be used inside one,
    // so anywhere else they are blocks that can only ever wear a warning
    // saying there is nothing to draw on (specs/DRAWING.md,
    // `extensions/drawingContext`).
    if (category.name === 'Drawing') {
      continue;
    }
    // An entry is usually a block type, but the type allows a whole flyout item
    // (a labeled button, a preset block with fields); those name no type and
    // are never a definition root, so they pass through.
    const blocks = category.blocks ?? [];
    const filtered = blocks.filter(
      item =>
        typeof item !== 'string' ||
        (ROOT_HOMES.get(item)?.has(fileKind) ?? true),
    );
    // Identity when nothing was dropped, so the common case does not hand the
    // toolbox a fresh object every time it is rebuilt.
    kept.push(
      filtered.length === blocks.length
        ? category
        : {...category, blocks: filtered},
    );
  }
  return kept;
};

/**
 * The toolbox in two halves, with a heading between them.
 *
 * ALWAYS THERE FIRST, THIS PROJECT'S AFTER. Above the heading is everything a
 * learner has in every project whatever they have imported: the definition
 * roots, the loop, the list, the arithmetic — and `Space` and `Appearance`,
 * which are rule categories by construction and always-available ones by
 * nature. A position is not something a rule can invent (`builtinMeta`), so
 * they are no more optional than `Math` is. Below the heading is what THIS
 * project imported, which is a different list per project and grows as one is
 * built.
 *
 * Interleaving them, as this did, meant the general blocks moved down the
 * strip every time a rule was imported: `Math` sat somewhere different in each
 * of two lessons, and somewhere different again after a learner added a
 * mechanic. A menu you have to re-find is a menu you stop reading.
 *
 * The heading is a toolbox item rather than a separator, so the break says
 * what it is dividing (`blockly/toolboxStyle`).
 */
const RULES_HEADING = toolboxHeading(
  'Rules',
  FILE_ICONS.rule.iconName,
) as unknown as ToolboxCategory;

/** …and the actors', under the rules, for the drawers a project's actors mint. */
const ACTORS_HEADING = toolboxHeading(
  'Actors',
  FILE_ICONS.actor.iconName,
) as unknown as ToolboxCategory;

/** Everything above the heading: the same rows, in the same order, always. */
const FIXED_CATEGORIES: ToolboxCategory[] = [
  ...TOOLBOX_HEAD,
  ...BUILTIN_RULE_CATEGORIES,
  ...TOOLBOX_TAIL,
];

// NO HEADING WITH NOTHING UNDER IT. A project holding no rules of its own has
// no second half, and a heading over an empty one is a label for a list that
// is not there.
const DOMAIN_CATEGORIES: ToolboxCategory[] = FIXED_CATEGORIES;

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

/**
 * Engine blocks a rule's drawer LISTS, though the rule does not declare them.
 *
 * The Engine category belongs to a `.rule` file alone (`withEngine`), so a
 * block listed only there is a block an `.actor` cannot find. That is how
 * `mouse position` came to be a true sentence a learner could not act on: the
 * Mouse rule's own header says where the pointer is is not an event but a
 * block you ask, and `input/mouse` was written to teach both halves of the
 * pointer — the click that lands on you, and the place you can ask for — while
 * an actor file offered only the first.
 *
 * A LISTING AND NOT A SECOND BLOCK. The type is defined for every file
 * already; the Engine category lists it rather than owning it. So this puts
 * one block in a second drawer, where a rule-declared `where the pointer is`
 * would be the same question with different words on it.
 *
 * By rule NAME, which is what the category is titled with and what a rule is
 * referred to by wherever a module path is not (`useRuleOptions`).
 */
const ALSO_LISTED: Record<string, readonly string[]> = {
  Mouse: ['world_mouse_position'],
};

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
  /**
   * Which event hats to LIST, which is a question about what the file the
   * palette is for BINDS at the top of the module it generates.
   *
   * - `all`: a `.world`. It binds `world` (it is the builder) and can reach any
   *   actor through it, so both kinds of hat run.
   * - `actorOnly`: an `.actor`. The module is `const actor = …` and nothing
   *   else, so a WORLD event's hat — which generates `world.on(…)` — is a
   *   ReferenceError the moment the file is imported, and the whole project
   *   stops running over one block a learner dragged out of a category that
   *   offered it. A hat declared under a TRAIT is fine: it takes an actor
   *   socket and registers on that, which is exactly what an `.actor` can do.
   * - `none`: a `.rule`. It binds neither — a rule module is
   *   `const rule = new RuleBuilder(…)` — and `extractRuleBodies` matches a hat
   *   against none of its three roots, so the hat and everything under it is
   *   dropped without a word. A rule says when it acts with `during <phase>`.
   *
   * Only about the TOOLBOX, like `offerEmits`. The blocks stay defined, so a
   * file that already holds one still loads and still generates.
   */
  eventHats: 'all' | 'actorOnly' | 'none' = 'all',
): {
  blocks: DomainBlock[];
  categories: ToolboxCategory[];
  eventTypes: string[];
  worldEventTypes: string[];
} {
  const blocks: DomainBlock[] = [];
  const categories: ToolboxCategory[] = [];
  const eventTypes: string[] = [];
  // The hats of events with no actor. `assembleWorldModule` needs them apart
  // from the rest: a world handler registers on the `world` binding and so must
  // be emitted after it, where an actor's must come before (see that file).
  const worldEventTypes: string[] = [];
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
      const writable =
        isSettable(property) ||
        (ownProperty && !isSettable(property) && property.readonly);
      if (writable) {
        const setBlock = defineSetPropertyBlock(property);
        blocks.push(setBlock);
        propTypes.push(setBlock.type);
      }
      if (writable && isList(property)) {
        for (const block of defineListPropertyBlocks(property)) {
          blocks.push(block);
          propTypes.push(block.type);
        }
      }
      if (writable && isValueList(property)) {
        for (const block of defineValueListPropertyBlocks(property)) {
          blocks.push(block);
          propTypes.push(block.type);
        }
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
      if (
        eventHats === 'all' ||
        (eventHats === 'actorOnly' && event.scope !== 'world')
      ) {
        ruleEventTypes.push(block.type);
      }
      // A root either way: `rootTypes` is about how a block GENERATES, and one
      // already in a file generates the same wherever the palette offered it.
      eventTypes.push(block.type);
      if (event.scope === 'world') {
        worldEventTypes.push(block.type);
      }
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
      ...(ALSO_LISTED[rule.name] ?? []),
    ];
    if (categoryBlocks.length > 0) {
      // …and, at the top, the way back to the lesson this rule was met in
      // (lessonFlyoutButton). Nothing for a rule the learner wrote, and nothing
      // when there is no progression mounted to open.
      const lesson = lessonFlyoutButton(rule.name);
      categories.push({
        name: rule.name,
        blocks: lesson ? [lesson, ...categoryBlocks] : categoryBlocks,
      });
    }
  }
  return {blocks, categories, eventTypes, worldEventTypes};
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
    /**
     * What kind of file is being edited, where that changes what may be placed.
     *
     * It decides which event hats are offered (`eventHats`) and which
     * definition roots and structural categories are (`ROOT_HOMES`,
     * `structuralCategories`). Absent — the headless generator, which has no
     * one file — offers everything, which is the safe direction: its palette is
     * never shown, and a block it fails to define is a project that will not
     * compile.
     */
    fileKind?: FileKind;
    /**
     * Actors whose own declared properties need blocks.
     *
     * The editor passes ONE — the `.actor` being edited — because that is the
     * whole of their scope (see `actorMeta`): nothing imports them and no other
     * file's palette offers them.
     *
     * The headless generator passes EVERY actor, for the reason
     * `allRuleModules` exists. It turns all of a project's files into code with
     * one palette and cannot scope per file, its palette is never shown so a
     * spare block costs nothing, and the absence of one is fatal: a `.actor`
     * reading a property it legitimately declared fails with "Invalid block
     * definition for type: world_get_…" and the whole project stops compiling.
     */
    ownProperties?: readonly OwnMeta[];
    /**
     * The `.actor` module being edited, when one is — `actors/beacon`.
     *
     * Only one thing asks: whether to LIST an actor's `emit` blocks. Every
     * actor's drawer is offered in every file, because an event declared in an
     * `.actor` exists to be heard somewhere else; raising one is the opposite,
     * and belongs to the file that declared it. See the loop below.
     */
    ownActorModule?: string;
  } = {},
): {
  blocks: DomainBlock[];
  toolbox: Toolbox;
  rootTypes: ReadonlySet<string>;
  /** Hats of events with no actor — `assembleWorldModule` orders by this. */
  worldEventTypes: ReadonlySet<string>;
} {
  // Here rather than at module scope: `Blockly.Msg` is not safe to write until
  // Blockly's own locale has loaded, and touching it during module evaluation
  // takes the workspace down with "Cannot read properties of undefined". This
  // runs once per editor mount, before the palette reaches a workspace.
  installColorMessages();
  installColorBlocks();
  const editingRule = options.ownRuleModule !== undefined;
  const structural = structuralCategories(options.fileKind);

  // What the general get/set blocks offer: every ACTOR-scoped property in the
  // project, a rule's and an actor's own alike, keyed by the same member key
  // the per-property block types are minted from.
  //
  // Set here because this is the one place that has both lists at once, and it
  // runs whenever either changes — a rule imported, an actor's `define
  // property` renamed.
  setKnownProperties(
    [
      ...projectRules.flatMap(rule =>
        rule.properties.map(property => ({rule: rule.name, property})),
      ),
      ...(options.ownProperties ?? []).flatMap(actor =>
        actor.properties.map(property => ({rule: actor.name, property})),
      ),
    ]
      .filter(({property}) => property.scope === 'actor')
      .map(({rule, property}) => ({
        key: memberKey(property.ref),
        // Where it came from, because two rules may both call something
        // `fraction` and a bare name would offer one word twice.
        label: `${rule} \u25b8 ${property.name}`,
        property,
      })),
  );
  // NOTHING VARIES BY FILE KIND ANY MORE. `each frame` and `define drawing`
  // were each minted in two shapes and swapped here — a definition root in an
  // `.actor` file, a chained row everywhere else — and both are rows now.
  // Blockly holds one definition per type for the whole process, so a shape
  // that varied by file was never local to the file that wanted it
  // (`generatorRegistration.test`).
  const shaped = DOMAIN_BLOCKS;
  const ownBlocks: DomainBlock[] = [];
  /**
   * A drawer per actor, holding what that actor declared.
   *
   * ONE CATEGORY EACH, and the reason is the same one every rule has a
   * category: a block is discovered in the drawer named after the thing that
   * declared it. An actor's own get, set and `define block` used to be spliced
   * into the general Actor drawer, where they sat among forty blocks about
   * actors in general with nothing saying which actor they came from — and
   * where a second actor's `subject` was a second block of the same name.
   *
   * WHAT STAYS IN ACTOR is the general pair per kind, whose dropdown lists
   * every actor-scoped property in play (`propertyOptions`). That is how a
   * property is reached when you already know what you want; this is how it is
   * found when you do not, which is the same division a rule's category makes.
   *
   * An actor that declares nothing gets no drawer. Every actor having one
   * regardless is a list of empty rooms, and a project's actors mostly declare
   * nothing at all.
   */
  const actorCategories: ToolboxCategory[] = [];
  /** Hats of the actors' own events — roots, exactly as a rule's hats are. */
  const ownEventTypes: string[] = [];
  /**
   * What each kind declares, in two readings: what its OWN file may do with
   * those declarations, and what everybody else may.
   *
   * Two lists rather than one because two of the entries are narrower than the
   * rest — a read-only property's setter and an event's `emit` belong to the
   * file that declared them. Which list a drawer gets is decided a pass later,
   * once `acts like` is known, because a SUBCLASS is at home in what it
   * inherits: a Health Bar that acts like a Progress Bar is the Progress Bar's
   * code extended, not a bystander to it, so it may fill the bar and raise its
   * events (`ActorBuilder.actsLike`).
   */
  const declared = new Map<string, {atHome: string[]; away: string[]}>();
  for (const actor of options.ownProperties ?? []) {
    const types: string[] = [];
    /** …and the same list as somebody else's file may use it. */
    const away: string[] = [];
    // …the things this kind DOES, by name. The same call site a rule's action
    // gets, from the same factory: what differs is the ref, which names the
    // file that declared it rather than a rule (`ownProperties`).
    for (const action of actor.actions) {
      const block = defineActionBlock(action);
      ownBlocks.push(block);
      types.push(block.type);
      away.push(block.type);
    }
    // …and the things that HAPPEN to it: the hat that hears one and the block
    // that raises it, from the same two factories a rule's events go through.
    //
    // THE HAT EVERYWHERE, THE `emit` ONLY AT HOME, which is the same division
    // a rule's events already make and for the same reason. An event exists to
    // be HEARD somewhere else — a world that wants to know the speech box has
    // finished is the whole point of declaring one — so the hat belongs in
    // every file's copy of this drawer. Raising it is the opposite: the kind
    // that declared the event is the only thing that knows when it happened,
    // and an `emit` in somebody else's file is that file forging the actor's
    // own notifications.
    //
    // Defined either way, listed or not: a file that already holds one still
    // has to load and generate, and a block type nothing defines fails the
    // whole project rather than the one block (`standInBlocks`).
    for (const event of actor.events) {
      const hat = defineEventBlock(event);
      ownBlocks.push(hat);
      types.push(hat.type);
      ownEventTypes.push(hat.type);
      away.push(hat.type);
      const emit = defineEmitBlock(event);
      ownBlocks.push(emit);
      types.push(emit.type);
    }
    // …and the state it keeps, as the pair every property gets.
    for (const property of actor.properties) {
      // A READ-ONLY OWN PROPERTY IS SETTABLE AT HOME, exactly as a rule's is
      // inside its own `.rule` (`generateRulePalette`). Read-only means the
      // declarer owns the value, not that nothing writes it: the Speech Box's
      // `letters shown` is the box's own count and its own timer handler is
      // what advances it. Outside the declaring file the setter stays absent,
      // which is the guarantee the flag is for.
      //
      // It used to be absent everywhere, under a note saying an actor's
      // declaring scope is "a DECLARATION, not a body — there is nowhere in it
      // to run a `set`". That was true of a file holding properties and a
      // picture, and stopped being true when `each frame`, `define block` and
      // `define event` arrived: an `.actor` has bodies now, and a read-only
      // own property was a value nothing in the language could write.
      //
      // DEFINED EITHER WAY, which is the half that bites. The headless
      // generator compiles every file with one palette and is at home in none
      // of them, so a setter it had not minted would leave the declaring
      // `.actor` holding a block nothing defines — `standInBlocks` mints a
      // placeholder that generates NOTHING, and the write silently does not
      // happen.
      const setBlock = defineSetPropertyBlock(property);
      ownBlocks.push(setBlock);
      types.push(setBlock.type);
      if (!property.readonly) {
        away.push(setBlock.type);
      }
      const getBlock = defineGetPropertyBlock(property);
      ownBlocks.push(getBlock);
      types.push(getBlock.type);
      away.push(getBlock.type);
    }
    declared.set(actor.modulePath, {atHome: types, away});
  }

  /**
   * A drawer per actor: what it declared, and then what it ACTS LIKE declared.
   *
   * The blocks are the same blocks — a type carries the file that minted it,
   * so nothing is minted twice and this is a second reference to one drawer's
   * worth of them. What it buys is that a learner looking in the Health Bar's
   * drawer for the thing that fills a bar finds it there, rather than having
   * to know it came from the Progress Bar.
   *
   * `seen` because a cycle is a project that will not load rather than a thing
   * to render forever: the dropdown will not offer one and the generator will
   * not write one, but a file saved before either could still hold it, and a
   * palette that hangs is a worse way to find out.
   */
  const parents = new Map(
    (options.ownProperties ?? []).flatMap(actor =>
      actor.actsLike ? [[actor.modulePath, actor.actsLike] as const] : [],
    ),
  );
  for (const actor of options.ownProperties ?? []) {
    // AT HOME IN WHAT IT INHERITS as well as in what it declared, which is
    // what makes a subclass an extension of its parent rather than a reader of
    // it (see `declared`).
    const home = actor.modulePath === options.ownActorModule;
    const blocks: string[] = [];
    const seen = new Set<string>();
    for (
      let at: string | undefined = actor.modulePath;
      at;
      at = parents.get(at)
    ) {
      if (seen.has(at)) {
        break;
      }
      seen.add(at);
      const rows = declared.get(at);
      if (rows) {
        blocks.push(...(home ? rows.atHome : rows.away));
      }
    }
    if (blocks.length > 0) {
      actorCategories.push({name: actor.name, blocks});
    }
  }

  /**
   * The actors' drawers, under a heading of their own.
   *
   * BELOW THE RULES, and the same shape: what a project has is under a word
   * saying what kind of thing it is, and what the language has is above both
   * (`toolboxStyle`, `RULES_HEADING`). Nothing at all when no actor declared
   * anything, because a heading over an empty list is a label for something
   * that is not there.
   */
  const withActors = (categories: ToolboxCategory[]): ToolboxCategory[] =>
    actorCategories.length === 0
      ? categories
      : [...categories, ACTORS_HEADING, ...actorCategories];

  if (projectRules.length === 0) {
    // `DOMAIN_CATEGORIES` when nothing was filtered, so the no-file-kind case
    // keeps handing back the one shared constant rather than a copy of it.
    const categories =
      structural === TOOLBOX_HEAD
        ? DOMAIN_CATEGORIES
        : [...structural, ...BUILTIN_RULE_CATEGORIES, ...TOOLBOX_TAIL];
    const shown = withActors(categories);
    return {
      // The shared constant itself when this actor declares nothing, keeping
      // the identity the no-project-rules path has always handed back rather
      // than a fresh copy per rebuild.
      blocks: ownBlocks.length === 0 ? shaped : [...shaped, ...ownBlocks],
      toolbox: editingRule ? withEngine(shown) : shown,
      // The actors' own hats are roots like any other event's — a hat is
      // top-level wherever it was declared, and the generator has to know not
      // to chain the block after it into the handler.
      rootTypes:
        ownEventTypes.length === 0
          ? ROOT_BLOCK_TYPES
          : new Set([...ROOT_BLOCK_TYPES, ...ownEventTypes]),
      // The built-in rules declare no events, so there are none to order.
      worldEventTypes: new Set<string>(),
    };
  }
  const palette = generateRulePalette(
    projectRules,
    options.allRuleModules ? ALL_RULE_MODULES : options.ownRuleModule,
    // `emit` is offered while writing a rule, and to the headless generator,
    // whose palette is never shown and is deliberately everything.
    editingRule || Boolean(options.allRuleModules),
    options.fileKind === 'actor'
      ? 'actorOnly'
      : options.fileKind === 'rule'
        ? 'none'
        : 'all',
  );
  const toolbox: ToolboxCategory[] = withActors([
    ...structural,
    ...BUILTIN_RULE_CATEGORIES,
    ...TOOLBOX_TAIL,
    RULES_HEADING,
    ...palette.categories,
  ]);
  return {
    blocks: [...shaped, ...palette.blocks, ...ownBlocks],
    toolbox: editingRule ? withEngine(toolbox) : toolbox,
    rootTypes: new Set([
      ...ROOT_BLOCK_TYPES,
      ...palette.eventTypes,
      ...ownEventTypes,
    ]),
    worldEventTypes: new Set(palette.worldEventTypes),
  };
}
