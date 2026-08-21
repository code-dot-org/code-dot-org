// Discovers a project's actor and world modules by directory convention — actor
// templates live under `actors/`, worlds under `worlds/` (the lab's directory
// layout, GLOSSARY.md). The `world_add_actor` dropdown lists these as
// `[label, path]`: the label is the module's *authored* name (an
// ActorBuilder/WorldBuilder `name`, or a Blockly actor's NAME field) so a
// learner sees "Coin", not the file stem "coin"; the value is the
// extension-less module path the generated world imports (`actors/coin`).

import {isBackgroundPath} from '../appearance/backgroundsFolder';
import type {EffectParameter} from '../effect/model/types';
import {soundLabel} from '../sound/soundFiles';

import {BUILTIN_RULE_META} from './builtinMeta';
import {FOUNDATION_RULE_NAMES} from './foundation';
import {label} from './label';
import {
  parseActorOwnMeta,
  parseWorldActorOwnMetas,
  parseWorldOwnMeta,
  type OwnMeta,
} from './ownProperties';
import {parseRuleMeta, type RuleMeta} from './ruleMeta';
import {cellCount} from './spriteCells';

// Code files that define a module: a Blockly rule/actor/world, or plain JS/TS.
// `.behavior` among them: a behavior IS a rule in play, so every scan that asks
// what the project holds has to find one (specs/BEHAVIORS.md).
const CODE_EXT = /\.(rule|actor|world|behavior|ts|js)$/;

// The root blocks whose NAME field names a Blockly-authored module.
const NAMED_ROOTS = ['world_actor', 'world_world'];

/** Best-effort authored name: a Blockly root's NAME field, else a builder's `name`. */
function authoredName(contents: string): string | undefined {
  const trimmed = contents.trim();
  if (trimmed.startsWith('{')) {
    try {
      const blocks = (JSON.parse(trimmed) as {blocks?: {blocks?: unknown[]}})
        .blocks?.blocks;
      const root = Array.isArray(blocks)
        ? (blocks.find(b =>
            NAMED_ROOTS.includes((b as {type?: string})?.type ?? ''),
          ) as {fields?: {NAME?: string}} | undefined)
        : undefined;
      if (root?.fields?.NAME) {
        return root.fields.NAME;
      }
    } catch {
      // Not Blockly JSON — fall through to the source scan.
    }
  }
  // `new WorldBuilder({id: 'platform', name: 'Platform World'})` and friends
  // (RuleBuilder too, so a project rule shows its authored name).
  const match = contents.match(
    /\b(?:World|Actor|Rule)Builder\s*\(\s*\{[^}]*?\bname:\s*['"]([^'"]+)['"]/,
  );
  return match?.[1];
}

function modulesUnder(
  files: Record<string, string>,
  prefix: string,
): Array<[string, string]> {
  const options: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const [path, contents] of Object.entries(files)) {
    if (!path.startsWith(prefix) || !CODE_EXT.test(path)) {
      continue;
    }
    const modulePath = path.replace(CODE_EXT, '');
    if (seen.has(modulePath)) {
      continue;
    }
    seen.add(modulePath);
    const name =
      authoredName(contents) ??
      label(modulePath.split('/').pop() ?? modulePath);
    options.push([name, modulePath]);
  }
  return options;
}

/** `[name, path]` options for the project's actor templates. */
export function projectActorOptions(
  files: Record<string, string>,
): Array<[string, string]> {
  return modulesUnder(files, 'actors/');
}

/** `[name, path]` options for the project's worlds. */
export function projectWorldOptions(
  files: Record<string, string>,
): Array<[string, string]> {
  return modulesUnder(files, 'worlds/');
}

/**
 * `[name, path]` options for the project's own rule modules under `rules/` — the
 * `world_use_rule` dropdown offers these alongside the built-in rules. The value
 * is the extension-less path the generated world imports (`rules/gravity`).
 */
export function projectRuleOptions(
  files: Record<string, string>,
): Array<[string, string]> {
  return modulesUnder(files, 'rules/');
}

/**
 * `[label, path]` options for the project's animation files (`.anim` under
 * `animations/`) — the `world_use_animations` dropdown. The value is the
 * extension-less path the world imports (`animations/game`).
 */
export function projectAnimationFileOptions(
  files: Record<string, string>,
): Array<[string, string]> {
  const options: Array<[string, string]> = [];
  for (const path of Object.keys(files)) {
    if (path.startsWith('animations/') && path.endsWith('.anim')) {
      const modulePath = path.replace(/\.anim$/, '');
      options.push([
        label(modulePath.split('/').pop() ?? modulePath),
        modulePath,
      ]);
    }
  }
  return options;
}

/**
 * `[name, path]` options for the project's effect files (`.effect` under
 * `effects/`) — the `world_add_effect` dropdown. The value is the
 * extension-less path the actor imports (`effects/ripple`).
 *
 * The label is the effect's *authored* name, so a learner picks "Ripple" rather
 * than the file stem — the same courtesy actors and worlds get, and the reason
 * the effect editor holds a name to being non-empty.
 */
export function projectEffectFileOptions(
  files: Record<string, string>,
): Array<[string, string]> {
  const options: Array<[string, string]> = [];
  for (const [path, contents] of Object.entries(files)) {
    if (!path.startsWith('effects/') || !path.endsWith('.effect')) {
      continue;
    }
    const modulePath = path.replace(/\.effect$/, '');
    const stem = modulePath.split('/').pop() ?? modulePath;
    let name: string | undefined;
    try {
      const parsed = JSON.parse(contents) as {name?: unknown};
      if (typeof parsed.name === 'string' && parsed.name.trim()) {
        name = parsed.name;
      }
    } catch {
      // Not valid JSON yet (mid-edit); fall back to the file name.
    }
    options.push([name ?? label(stem), modulePath]);
  }
  return options;
}

/**
 * The parameters each effect declares, keyed by its extension-less module path.
 *
 * Read straight off the `.effect` document rather than from `compileEffect`.
 * The compiler would also report which parameters the graph actually *reads*
 * (`used`), but it costs a full compile per dropdown refresh and refuses a graph
 * that does not yet build — and a learner wiring an effect up should still see
 * its knobs. Declared parameters are what the block offers.
 */
export function projectEffectParameters(
  files: Record<string, string>,
): Record<string, EffectParameter[]> {
  const parameters: Record<string, EffectParameter[]> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!path.startsWith('effects/') || !path.endsWith('.effect')) {
      continue;
    }
    let declared: EffectParameter[] = [];
    try {
      const parsed = JSON.parse(contents) as {parameters?: unknown};
      if (Array.isArray(parsed.parameters)) {
        // Keep only entries shaped like a parameter: the file is learner-owned
        // and may be mid-edit, and a malformed entry would build a broken row.
        declared = parsed.parameters.filter(
          (entry): entry is EffectParameter =>
            !!entry &&
            typeof (entry as EffectParameter).id === 'string' &&
            typeof (entry as EffectParameter).type === 'string',
        );
      }
    } catch {
      // Not valid JSON yet (mid-edit); this effect offers no parameters.
    }
    parameters[path.replace(/\.effect$/, '')] = declared;
  }
  return parameters;
}

/**
 * Actor module paths referenced by each map file (JSON under `maps/`), keyed by
 * the map's extension-less path. The `world_load_map` block reads this to emit
 * an import + `world.define` for each actor a map places, then `world.loadMap`.
 */
export function projectMapActorTypes(
  files: Record<string, string>,
): Record<string, string[]> {
  const maps: Record<string, string[]> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!path.startsWith('maps/') || !path.endsWith('.map')) {
      continue;
    }
    let types: string[] = [];
    try {
      const actors = (
        JSON.parse(contents) as {actors?: Array<{type?: unknown}>}
      ).actors;
      if (Array.isArray(actors)) {
        types = [
          ...new Set(
            actors
              .map(actor => actor?.type)
              .filter((type): type is string => typeof type === 'string'),
          ),
        ];
      }
    } catch {
      // Not valid JSON yet (mid-edit); leave this map with no types.
    }
    maps[path.replace(/\.map$/, '')] = types;
  }
  return maps;
}

// A rule module is named by what it declares — except when it declares
// nothing, because it is a hand-written `.js` module referred to by its path.
// Everything downstream (which traits are in play, which categories the toolbox
// shows) is keyed on names, so a path is resolved to one here:
//   - a declarative `.rule` module → the name its `define rule` block carries;
//   - a `.js`/`.ts` shim re-exporting a built-in → that built-in rule's name;
//   - a genuinely project-defined `.js` rule → undefined (nothing static to
//     read a name out of until it is authored as a `.rule`).
const RULE_SHIM_RE =
  /export\s*\{\s*(\w+)\s+as\s+default\s*\}\s*from\s*['"]world-lab['"]/;

function resolveRuleRef(
  rule: string,
  files: Record<string, string>,
): string | undefined {
  if (!rule.includes('/')) {
    return rule; // already a rule name
  }
  const declarative = files[`${rule}.rule`];
  if (declarative !== undefined) {
    return parseRuleMeta(rule, declarative)?.name;
  }
  for (const ext of ['.js', '.ts']) {
    const contents = files[`${rule}${ext}`];
    if (contents !== undefined) {
      const exportName = contents.match(RULE_SHIM_RE)?.[1];
      return BUILTIN_RULE_META.find(meta => meta.ref.exportName === exportName)
        ?.name;
    }
  }
  return undefined;
}

/** Parse the project's declarative `.rule` files (under `rules/`) into RuleMeta. */
/**
 * Every actor's own declared properties, by file.
 *
 * The counterpart to {@link projectRuleMetas}, and it exists for the headless
 * generator rather than for any editor: one palette compiles every file, so a
 * property declared in `player.actor` must have its blocks DEFINED even while
 * `coin.actor` is being generated. An editor asks for one actor instead —
 * their scope is the declaring file (see `actorMeta`).
 */
export function projectOwnMetas(files: Record<string, string>): OwnMeta[] {
  const metas: OwnMeta[] = [];
  for (const [path, contents] of Object.entries(files)) {
    if (path.startsWith('actors/') && path.endsWith('.actor')) {
      const meta = parseActorOwnMeta(path.replace(/\.actor$/, ''), contents);
      if (meta) {
        metas.push(meta);
      }
    }
    // …and every WORLD's own state (specs/WORLD_STATE.md). Missing here, a
    // world's `set score to …` was a block the generator's palette did not
    // define, so `standInBlocks` minted a placeholder that generated NOTHING —
    // the handler ran, took the coin, and quietly failed to count it.
    if (path.startsWith('worlds/') && path.endsWith('.world')) {
      const world = path.replace(/\.world$/, '');
      const meta = parseWorldOwnMeta(world, contents);
      if (meta) {
        metas.push(meta);
      }
      // …and every actor the world defines for ITSELF, each keyed by the
      // block that defines it. A world-defined actor is an actor, and one
      // that keeps a number of its own had to be a file until this.
      metas.push(...parseWorldActorOwnMetas(world, contents));
    }
  }
  return metas;
}

export function projectRuleMetas(files: Record<string, string>): RuleMeta[] {
  const metas: RuleMeta[] = [];
  for (const [path, contents] of Object.entries(files)) {
    // `.behavior` too: it parses into a `RuleMeta` with one trait, which is
    // what makes everything downstream work unchanged (specs/BEHAVIORS.md).
    if (path.startsWith('rules/') && /\.(rule|behavior)$/.test(path)) {
      const meta = parseRuleMeta(
        path.replace(/\.(rule|behavior)$/, ''),
        contents,
      );
      if (meta) {
        metas.push(meta);
      }
    }
  }
  return metas;
}

/**
 * The rules in play — which is EVERY RULE THE PROJECT HOLDS, plus the engine's.
 *
 * It used to be the `RULE` field of each `world_use_rule` block, deduped across
 * every world, and that phrasing is the tell: the list was already project-wide
 * rather than per-world, because the trait dropdown is one dropdown and cannot
 * ask which world you might eventually be in. So a learner who imported Gravity
 * and went straight to their actor found "Affected by Gravity" missing from
 * `use trait` until they went back and told the WORLD as well. That was the
 * language's worst half-hour, and it existed to maintain a distinction only the
 * generated code made.
 *
 * Now holding the file is the whole of it, on the terms the `.anim` files have
 * always had, and the world generator emits what this reports. It is safe
 * because a rule with no elected trait does nothing — see the note on
 * `world_world`'s generator.
 *
 * By NAME, which is what a reference resolves by, so a rule that moves between
 * files is still the same rule. A `.js` rule declares no name and is known by
 * its module, exactly as it is everywhere else.
 *
 * The ENGINE's own two are always in the list. They have no file to hold, and
 * `WorldBuilder` seeds them into every world it builds.
 */
export function projectWorldRules(files: Record<string, string>): string[] {
  const names = new Set<string>(FOUNDATION_RULE_NAMES);
  for (const [, modulePath] of projectRuleOptions(files)) {
    // A file answers to the name it declares (`resolveRuleRef`, which also
    // reads a `.js` shim's built-in). One that declares nothing answers to its
    // module, which is what every other reference to such a rule does.
    names.add(resolveRuleRef(modulePath, files) ?? modulePath);
  }
  return [...names];
}

const IMAGE_FILE = /\.(png|jpg|jpeg|gif|webp)$/i;

/**
 * The sounds the project holds, as `[label, fileName]` for a SOUND dropdown.
 *
 * The VALUE is the file name — what a block stores and what the driver keys the
 * audio cache by — and the label drops the extension, because "coin" is what
 * the sentence on the block wants to read. The same bargain
 * `projectSpriteOptions` makes about images.
 *
 * Paths in, names out: which pool a file belongs to is decided by its extension
 * here rather than by its folder (`runtime/projectFiles.projectSoundPaths`), so
 * a sound a learner dragged out of `sounds/` is still a sound.
 */
export function projectSoundOptions(
  sounds: readonly string[],
): Array<[string, string]> {
  const names = [...new Set(sounds.map(baseName))].sort((a, b) =>
    a.localeCompare(b),
  );
  return names.map(name => [soundLabel(name), name]);
}

/** Every image path the project holds, from both places they can come from. */
const imagePaths = (
  files: Record<string, string>,
  images: readonly string[],
): string[] => [
  ...Object.keys(files).filter(path => IMAGE_FILE.test(path)),
  ...images,
];

const baseName = (path: string): string => path.split('/').pop() as string;

/** `cave.png` → `cave`, which is what the sentence on a block wants to read. */
const imageLabel = (path: string): string =>
  baseName(path).replace(/\.[^.]+$/, '');

/**
 * The images the project holds, as `[label, fileName]` for the SPRITE dropdown.
 *
 * The VALUE is the file name — what a frame references and what the driver keys
 * a texture by — and the label drops the extension, because "player" is what the
 * sentence on the block wants to read.
 *
 * Backdrops are NOT here. They are a pool of their own, told apart by their
 * folder (BACKGROUNDS.md §5): a sky is not something to dress an actor in, and
 * an actor's costume is not something to stretch across the viewport.
 */
export function projectSpriteOptions(
  files: Record<string, string>,
  images: readonly string[] = [],
): Array<[string, string]> {
  const names = imagePaths(files, images)
    .filter(path => !isBackgroundPath(path))
    .map(baseName);
  // A spritesheet is offered a cell at a time: drawing a whole strip is almost
  // never what `set sprite` means for one. `cellCount` knows the project's
  // grids and image sizes (blockly/spriteCells); an image it cannot measure is
  // offered whole, which is the honest answer.
  const options: Array<[string, string]> = [];
  for (const name of [...new Set(names)].sort((a, b) => a.localeCompare(b))) {
    const label = imageLabel(name);
    const cells = cellCount(name);
    if (cells <= 1) {
      options.push([label, name]);
      continue;
    }
    for (let index = 0; index < cells; index++) {
      // `name#index`, resolved to a rectangle when the block generates code.
      options.push([`${label} ${index + 1}`, `${name}#${index}`]);
    }
  }
  return options;
}

/**
 * The project's backdrops, as `[label, fileName]` for the BACKGROUND dropdown.
 *
 * The pool is the folder and nothing else: an image under `backgrounds/` is a
 * backdrop, and moving one there is a reasonable way to say so.
 *
 * Whole images only — no cells. A backdrop is stretched over the viewport, so
 * there is nothing a grid of it would mean, and `.sheet` is never written beside
 * one (BACKGROUNDS.md §5).
 */
export function projectBackgroundOptions(
  files: Record<string, string>,
  images: readonly string[] = [],
): Array<[string, string]> {
  const names = imagePaths(files, images)
    .filter(isBackgroundPath)
    .map(baseName);
  return [...new Set(names)]
    .sort((a, b) => a.localeCompare(b))
    .map(name => [imageLabel(name), name] as [string, string]);
}
