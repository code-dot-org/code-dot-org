// Discovers a project's actor and world modules by directory convention — actor
// templates live under `actors/`, worlds under `worlds/` (the lab's directory
// layout, GLOSSARY.md). The `world_add_actor` dropdown lists these as
// `[label, path]`: the label is the module's *authored* name (an
// ActorBuilder/WorldBuilder `name`, or a Blockly actor's NAME field) so a
// learner sees "Coin", not the file stem "coin"; the value is the
// extension-less module path the generated world imports (`actors/coin`).

import type {EffectParameter} from '../effect/model/types';

import {label} from './label';
import {parseRuleMeta, type RuleMeta} from './ruleMeta';

// Code files that define a module: a Blockly rule/actor/world, or plain JS/TS.
const CODE_EXT = /\.(rule|actor|world|ts|js)$/;

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

// A world's `use rule` names either a built-in (its `world-lab` export name) or a
// project rule module (a path). `traitOptions` resolves a ref to its `RuleMeta`;
// this maps a project reference to the key it resolves under:
//   - a declarative `.rule` module → its path (parsed to project `RuleMeta`);
//   - a `.js`/`.ts` shim re-exporting a built-in → that built-in's export name;
//   - a genuinely project-defined `.js` rule → undefined (no static metadata
//     until it is authored as a `.rule`).
const RULE_SHIM_RE =
  /export\s*\{\s*(\w+)\s+as\s+default\s*\}\s*from\s*['"]world-lab['"]/;

function resolveRuleRef(
  rule: string,
  files: Record<string, string>,
): string | undefined {
  if (!rule.includes('/')) {
    return rule; // already a built-in export name
  }
  // A declarative `.rule` module: keep the path — `traitOptions` resolves it to
  // the parsed project rule.
  if (files[`${rule}.rule`] !== undefined) {
    return rule;
  }
  // A `.js`/`.ts` shim re-exporting a built-in → that built-in's export name.
  for (const ext of ['.js', '.ts']) {
    const contents = files[`${rule}${ext}`];
    if (contents !== undefined) {
      return contents.match(RULE_SHIM_RE)?.[1];
    }
  }
  return undefined;
}

/** Parse the project's declarative `.rule` files (under `rules/`) into RuleMeta. */
export function projectRuleMetas(files: Record<string, string>): RuleMeta[] {
  const metas: RuleMeta[] = [];
  for (const [path, contents] of Object.entries(files)) {
    if (path.startsWith('rules/') && path.endsWith('.rule')) {
      const meta = parseRuleMeta(path.replace(/\.rule$/, ''), contents);
      if (meta) {
        metas.push(meta);
      }
    }
  }
  return metas;
}

/**
 * The built-in rule names every `.world` file puts in play — the `RULE` field of
 * each `world_use_rule` block, deduped across all worlds, resolved to `world-lab`
 * export names (a project rule that shims a built-in resolves through
 * {@link resolveRuleExport}). The trait dropdown resolves these against the
 * engine to list the traits in play.
 */
export function projectWorldRules(files: Record<string, string>): string[] {
  const names = new Set<string>();
  interface Block {
    type?: string;
    fields?: {RULE?: string};
    inputs?: Record<string, {block?: Block}>;
    next?: {block?: Block};
  }
  const visit = (block: Block | undefined): void => {
    if (!block) {
      return;
    }
    if (block.type === 'world_use_rule' && block.fields?.RULE) {
      const resolved = resolveRuleRef(block.fields.RULE, files);
      if (resolved) {
        names.add(resolved);
      }
    }
    for (const input of Object.values(block.inputs ?? {})) {
      visit(input?.block);
    }
    visit(block.next?.block);
  };
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.world')) {
      continue;
    }
    try {
      const roots = (JSON.parse(contents) as {blocks?: {blocks?: Block[]}})
        .blocks?.blocks;
      for (const root of roots ?? []) {
        visit(root);
      }
    } catch {
      // Not valid JSON yet (mid-edit); skip this world.
    }
  }
  return [...names];
}
