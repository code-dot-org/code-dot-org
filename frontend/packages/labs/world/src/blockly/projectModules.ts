// Discovers a project's actor and world modules by directory convention — actor
// templates live under `actors/`, worlds under `worlds/` (the lab's directory
// layout, GLOSSARY.md). The `world_add_actor` / `world_scene` dropdowns list
// these as `[label, path]`: the label is the module's *authored* name (an
// ActorBuilder/WorldBuilder `name`, or a Blockly actor's NAME field) so a
// learner sees "Platform World", not the file stem "platform"; the value is the
// extension-less module path the generated scene imports (`worlds/platform`).

import {label} from './label';

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
 * Actor module paths referenced by each map file (JSON under `maps/`), keyed by
 * the map's extension-less path. The `world_load_map` block reads this to emit
 * an import + `scene.define` for each actor a map places, then `scene.populate`.
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

// A world's `use rule` names either a built-in (its `world-lab` export) or a
// project rule module (a path). The trait dropdown needs the built-in export
// name; a project rule that RE-EXPORTS a built-in (a shim, e.g.
// `export {GravityRule as default} from 'world-lab'`) is resolved to it here, by
// reading the shim. A genuinely project-defined rule can't be introspected
// statically, so it contributes no traits until block generation reads rule
// metadata from the built modules — STOPGAP, removed then.
const RULE_SHIM_RE =
  /export\s*\{\s*(\w+)\s+as\s+default\s*\}\s*from\s*['"]world-lab['"]/;
const RULE_MODULE_EXTS = ['.js', '.ts', '.rule'];

function resolveRuleExport(
  rule: string,
  files: Record<string, string>,
): string | undefined {
  if (!rule.includes('/')) {
    return rule; // already a built-in export name
  }
  for (const ext of RULE_MODULE_EXTS) {
    const contents = files[rule + ext];
    if (contents !== undefined) {
      return contents.match(RULE_SHIM_RE)?.[1];
    }
  }
  return undefined;
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
      const resolved = resolveRuleExport(block.fields.RULE, files);
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
