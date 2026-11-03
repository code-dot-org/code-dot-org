// What a Blockly-authored file holds BESIDE its workspace.
//
// An `.actor` carries its data next to `blocks` (`actors/actorPurpose`).
// Blockly's workspace loader reads only the keys it has a serializer for and
// leaves the rest, so the data costs the workspace nothing on the way in; on
// the way out `workspaces.save` writes only what Blockly owns, and a save that
// forgot the rest would lose it on the first edit to a hat. So the file editor
// keeps the other keys and puts them back on every save.

/** The keys Blockly's own serializers own; everything else is the file's. */
export const WORKSPACE_KEYS: ReadonlySet<string> = new Set([
  'blocks',
  'variables',
  'procedures',
  'workspaceComments',
]);

/** The keys of `contents` that are not the workspace's, with their values. */
export function documentExtras(contents: string): Record<string, unknown> {
  if (!contents.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(contents) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(([key]) => !WORKSPACE_KEYS.has(key)),
    );
  } catch {
    return {};
  }
}

/** A saved workspace with the file's other keys put back beside it. */
export const withDocumentExtras = <T extends object>(
  state: T,
  extras: Record<string, unknown>,
): T => ({...extras, ...state});
