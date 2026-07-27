// Discovers a project's actor and world modules by directory convention — actor
// templates live under `actors/`, worlds under `worlds/` (the lab's directory
// layout, GLOSSARY.md). The `world_add_actor` / `world_scene` dropdowns list
// these as `[label, path]`: the label is the module's *authored* name (an
// ActorBuilder/WorldBuilder `name`, or a Blockly actor's NAME field) so a
// learner sees "Platform World", not the file stem "platform"; the value is the
// extension-less module path the generated scene imports (`worlds/platform`).

import {label} from './label';

// Code files that define a module: a Blockly actor, or plain JS/TS.
const CODE_EXT = /\.(actor|ts|js)$/;

/** Best-effort authored name: a Blockly actor's NAME field, else a builder's `name`. */
function authoredName(contents: string): string | undefined {
  const trimmed = contents.trim();
  if (trimmed.startsWith('{')) {
    try {
      const blocks = (JSON.parse(trimmed) as {blocks?: {blocks?: unknown[]}})
        .blocks?.blocks;
      const actor = Array.isArray(blocks)
        ? (blocks.find(b => (b as {type?: string})?.type === 'world_actor') as
            | {fields?: {NAME?: string}}
            | undefined)
        : undefined;
      if (actor?.fields?.NAME) {
        return actor.fields.NAME;
      }
    } catch {
      // Not Blockly JSON — fall through to the source scan.
    }
  }
  // `new WorldBuilder({id: 'platform', name: 'Platform World'})` and friends.
  const match = contents.match(
    /\b(?:World|Actor)Builder\s*\(\s*\{[^}]*?\bname:\s*['"]([^'"]+)['"]/,
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
