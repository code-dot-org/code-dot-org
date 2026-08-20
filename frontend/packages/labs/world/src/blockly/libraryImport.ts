// One import seam, five kinds.
//
// Picking `(import…)` on a dropdown has to open a React dialog, write a file
// into the project, and come back with what the field should now hold — none
// of which a Blockly field can do. A field has no access to React context, and
// the registries it CAN read are plain module state by design. So the React
// layer registers a handler while the editor is mounted and the field asks
// through it; the alternative, reaching into a React context from inside a
// field validator, is what this exists to avoid.
//
// FIVE COPIES OF THIS existed before it was one — rule, effect, actor,
// appearance and sound — and the argument against collapsing them was that a
// shared "import something" channel would need a discriminator standing in for
// the functions it replaced. That argument was about the CHANNEL and it still
// holds: there are five channels here, each with its own handler slot, its own
// sentinel and its own dialog. What is shared is only the mechanism, which had
// no business being written down five times: two of the copies had grown a
// `field.getOptions(false)` comment that stopped being true when
// `bindLiveOptions` took the cache away, and it was copied to a third before
// anyone checked.

/** What a dialog hands back — a name, an id, or a module path. */
export type ImportHandler<Arguments extends unknown[] = []> = (
  ...args: Arguments
) => Promise<string | undefined>;

/** A registered opener, and the way a field asks it. */
export interface ImportSeam<Arguments extends unknown[]> {
  /**
   * Register the opener. Called by the Blockly editor while it is mounted, and
   * with `null` on unmount so a stale closure over a dead workspace cannot be
   * invoked later.
   */
  register(next: ImportHandler<Arguments> | null): void;
  /**
   * Ask for an import. Resolves undefined when nothing was imported —
   * INCLUDING when no handler is registered, which is the case in the headless
   * generator and in tests. That is the whole reason this is a resolved
   * promise rather than a throw: a field asking with nobody listening is
   * ordinary, not an error.
   */
  request: ImportHandler<Arguments>;
}

/** A fresh seam. One per kind: they do not share a handler slot. */
export function importSeam<
  Arguments extends unknown[] = [],
>(): ImportSeam<Arguments> {
  let handler: ImportHandler<Arguments> | null = null;
  return {
    register(next) {
      handler = next;
    },
    request: (...args) =>
      handler ? handler(...args) : Promise.resolve(undefined),
  };
}
