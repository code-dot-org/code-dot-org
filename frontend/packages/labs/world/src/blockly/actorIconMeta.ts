// Which symbol each actor elected, read out of the files (specs/UI_ACTORS.md).
//
// ONE WALK OVER EVERY `define actor` ROOT, which covers both homes an actor has
// without a case for either: an `.actor` file's own root, and the `define actor`
// blocks a world defines for itself (`localActors`). They differ only in the key
// a dropdown stores — a module path for the file, a name-derived id for the
// world's own — and that difference is already `pictured`'s to know.
//
// Read from the FILES rather than from the live workspace, and synchronously, so
// unlike a thumbnail an icon is there the first time a dropdown is drawn. It is
// text in a file; nothing has to render it.

import {actorIdFromName} from './localActors';

/** A block as it appears in a serialized workspace — only what is read here. */
interface Block {
  type?: string;
  fields?: Record<string, unknown>;
  next?: {block?: Block};
}

const field = (block: Block, name: string): string =>
  typeof block.fields?.[name] === 'string'
    ? (block.fields[name] as string)
    : '';

/** The `show as` row in a `define actor`'s body, if it has one. */
function electedIcon(root: Block): string {
  for (let at = root.next?.block; at; at = at.next?.block) {
    if (at.type === SHOW_AS) {
      return field(at, 'ICON');
    }
  }
  return '';
}

export const SHOW_AS = 'world_show_as';

/**
 * `{key: icon}` for every actor in the project that elected one.
 *
 * The key is what an ACTOR dropdown stores, so this is looked up by the same
 * string `pictured` already has in hand.
 */
export function projectActorIcons(
  files: Record<string, string>,
): Record<string, string> {
  const icons: Record<string, string> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (!/\.(actor|world)$/.test(path)) {
      continue;
    }
    let roots: Block[];
    try {
      const parsed = JSON.parse(contents) as {blocks?: {blocks?: Block[]}};
      roots = (parsed.blocks?.blocks ?? []).filter(
        b => b?.type === 'world_actor',
      );
    } catch {
      continue; // mid-edit / not JSON, as everywhere else
    }
    const own = path.endsWith('.actor');
    for (const root of roots) {
      const icon = electedIcon(root);
      if (!icon) {
        continue;
      }
      // An `.actor` file IS one actor, and its dropdown value is the module
      // path. A world's own are keyed by the id derived from their name, which
      // is the key `pictured` looks their picture up by.
      icons[
        own
          ? path.replace(/\.actor$/, '')
          : actorIdFromName(field(root, 'NAME'))
      ] = icon;
    }
  }
  return icons;
}
