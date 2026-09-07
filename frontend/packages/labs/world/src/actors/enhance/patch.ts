// Editing a file a learner owns.
//
// Every other library act in this lab is ADDITIVE: an import writes a new file
// and touches nothing that was there. An enhancement is the first that reaches
// into a file somebody made, so the rules it works by are worth stating.
//
// IT WRITES BLOCKS THEY COULD HAVE WRITTEN. Everything here appends ordinary
// rows to the chain under a `define actor` or a `define world` — the same
// blocks the toolbox offers, in the same order a learner would have dragged
// them. Nothing is marked, hidden or owned by the library afterwards: what an
// enhancement leaves behind is a project, and deleting the rows undoes it.
//
// IT APPENDS AT THE END. A row inserted into the middle of somebody's chain
// moves their blocks about, and a world's wiring has to come after its
// placements anyway — `set subject of ⟨any Health Bar⟩` acts on the bars there
// ARE, so it must run once one has been added.
//
// IT IS IDEMPOTENT. Enhancing twice is a thing that will happen: a learner who
// cannot see what changed will do it again. Each of these asks whether the row
// is already there and does nothing if it is, so the second time is a no-op
// rather than a duplicate trait and a second bar.

/** A Blockly workspace as it is stored: `{variables?, blocks: {blocks: []}}`. */
interface Workspace {
  variables?: unknown[];
  blocks?: {blocks?: BlockJson[]};
}

/** One block, as much of it as an edit needs to see. */
export interface BlockJson {
  type: string;
  /** A root's own id, which is how a world names the actor it defines. */
  id?: string;
  fields?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  next?: {block: BlockJson};
  [key: string]: unknown;
}

const parse = (contents: string): Workspace =>
  (JSON.parse(contents || '{}') as Workspace) ?? {};

const roots = (workspace: Workspace): BlockJson[] =>
  workspace.blocks?.blocks ?? [];

/** Every block in a chain, from a root down its `next`s. */
export function* down(block: BlockJson | undefined): Generator<BlockJson> {
  for (let at = block; at; at = at.next?.block) {
    yield at;
  }
}

/**
 * Which root a patch is about.
 *
 * A `.actor` file has one `define actor` and there is nothing to choose. A
 * `.world` file has one per actor it defines for itself, so an enhancement
 * given one of THOSE has to say which — by the block's id, which is what names
 * a world-local actor everywhere else (`blockly/localActors`).
 */
export interface RootPick {
  type: string;
  /** The defining block, when the file holds more than one. */
  id?: string;
}

/** The root a pick names, if the file has it. */
const rootOf = (workspace: Workspace, pick: RootPick): BlockJson | undefined =>
  roots(workspace).find(
    block =>
      block.type === pick.type &&
      (pick.id === undefined || block.id === pick.id),
  );

/** Whether any TOP-LEVEL block in the file matches — a hat, a drawing. */
export function hasRoot(
  contents: string,
  matches: (block: BlockJson) => boolean,
): boolean {
  return roots(parse(contents)).some(root => [...down(root)].some(matches));
}

/**
 * Add a top-level block, below everything already in the file.
 *
 * A hat is a ROOT, not a row: it takes no previous connection, and
 * `DisableOrphansPlugin` disables a top-level block that HAS one along with
 * everything under it (`actors/stock/workspace` says the same thing about a
 * drawing). So an event handler sits beside the definition, which is where an
 * actor file's handlers already are.
 *
 * FOR HATS AND DRAWINGS, and no longer for steps: `each frame` chains under
 * `define actor` now, so an enhancement adding one uses `append` instead.
 *
 * Below, because a file is read downwards and what was there was written
 * first.
 */
export function addRoot(contents: string, block: BlockJson): string {
  const workspace = parse(contents);
  const lowest = roots(workspace).reduce(
    (bottom, root) => Math.max(bottom, Number(root.y ?? 0)),
    0,
  );
  return JSON.stringify(
    {
      ...workspace,
      blocks: {
        ...workspace.blocks,
        blocks: [...roots(workspace), {...block, x: 20, y: lowest + 220}],
      },
    },
    null,
    2,
  );
}

/**
 * Declare a variable the file's blocks refer to.
 *
 * A workspace stores its variables beside its blocks, and a `VAR` field is an
 * id and a name pointing INTO that list: written without the declaration, the
 * block loads with a variable Blockly has never heard of.
 */
export function withVariable(contents: string, variable: object): string {
  const workspace = parse(contents);
  const id = (variable as {id?: string}).id;
  const already = (workspace.variables ?? []).some(
    one => (one as {id?: string}).id === id,
  );
  return already
    ? contents
    : JSON.stringify(
        {...workspace, variables: [...(workspace.variables ?? []), variable]},
        null,
        2,
      );
}

/** The file's top-level blocks, for a caller that wants to look at all of them. */
export function rootsOf(contents: string): BlockJson[] {
  return roots(parse(contents));
}

/** The rows in the chain under the picked root, in the order they are in. */
export function rowsUnder(contents: string, pick: RootPick): BlockJson[] {
  return [...down(rootOf(parse(contents), pick))];
}

/** Whether the chain under the picked root already holds a matching row. */
export function holds(
  contents: string,
  pick: RootPick,
  matches: (block: BlockJson) => boolean,
): boolean {
  const root = rootOf(parse(contents), pick);
  return [...down(root)].some(matches);
}

/**
 * Append `rows` to the end of the chain under the picked root.
 *
 * Returns the contents unchanged when the file has no such root: a `.world`
 * with its `define world` deleted is a project that does not compile, and an
 * enhancement is not the thing to notice it. Likewise an actor a world defined
 * and has since deleted, which is a block id naming nothing.
 */
export function append(
  contents: string,
  pick: RootPick,
  rows: readonly BlockJson[],
  variables: readonly unknown[] = [],
): string {
  if (rows.length === 0) {
    return contents;
  }
  const workspace = parse(contents);
  const root = rootOf(workspace, pick);
  if (!root) {
    return contents;
  }
  let last = root;
  for (const block of down(root)) {
    last = block;
  }
  last.next = {
    block: rows
      .slice(0, -1)
      .reduceRight<BlockJson>(
        (next, block) => ({...block, next: {block: next}}),
        rows[rows.length - 1],
      ),
  };

  return JSON.stringify(
    {
      ...workspace,
      ...(variables.length
        ? {variables: [...(workspace.variables ?? []), ...variables]}
        : {}),
    },
    null,
    2,
  );
}
