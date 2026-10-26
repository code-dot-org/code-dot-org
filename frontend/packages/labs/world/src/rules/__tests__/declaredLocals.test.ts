// Every working value a stock rule keeps is DECLARED, by a `let`.
//
// A `set ⟨n⟩ to ⟨…⟩` does not make a name. Blockly hoists an undeclared one to
// module scope, so a rule's scratch value was a `var` shared by every body in
// the file — which had not gone wrong, because a body runs to completion and
// nothing re-enters, but which was never a thing a learner could BUILD. A
// getter offers only the names in scope (`blockly/variableScope`), and nothing
// put a `set`-only name there: the shipped rules were reading names their own
// dropdowns would not have offered.
//
// Sixty-five of them were migrated at once. This is what stops the sixty-sixth
// arriving: a new rule that reaches for a working value has to say `let`, and
// the DSL has one (`scripts/rules/dsl.mjs`, `local().let`).
//
// AND A DECLARATION HAS TO COVER ITS READERS, which is the half that is easy to
// get wrong and impossible to see. A `let` binds the rows BELOW it in its own
// stack; one written inside an `if` whose readers are outside it declares a
// name nothing can see, and the reads fall back to the module `var` — silently,
// and only at run time. Both halves are checked here, on the JSON that ships.

import {describe, expect, it} from 'vitest';

import {STOCK_RULES} from '../stock';

/** A variable id, however the block that names it spells the field. */
const idOf = (
  fields: Record<string, unknown> | undefined,
): string | undefined => {
  const raw = fields?.VAR;
  if (raw === null || raw === undefined) {
    return undefined;
  }
  return typeof raw === 'object' ? (raw as {id?: string}).id : String(raw);
};

/** The loops, which have always bound a name (`blockly/variableScope`). */
const LOOPS = new Set([
  'world_for_each',
  'world_for_each_number',
  'world_for_each_word',
  'world_for_each_place',
  'world_for_each_key',
  'world_for_each_typed',
  'world_for_each_button',
  'world_count_with',
  'world_filter_actors',
  'world_ordered_actors',
  'world_extreme_actor',
]);

interface Saved {
  type: string;
  fields?: Record<string, unknown>;
  extraState?: {parts?: Array<{var?: string}>};
  inputs?: Record<string, {block?: Saved; shadow?: Saved}>;
  next?: {block?: Saved};
}

interface Where {
  /** The stack a block sits in, as a path of the mouths entered to reach it. */
  path: string;
  /** Its row within that stack. */
  index: number;
}

/**
 * Every declaration and every use in one rule's workspace, with where it sits.
 *
 * A `let`'s scope is "the rows after it in this stack, and anything inside
 * them", so a path plus a row number is the whole of what a comparison needs.
 */
function survey(workspace: {
  blocks?: {blocks?: Saved[]};
  variables?: Array<{id: string; name: string}>;
}) {
  const lets = new Map<string, Where[]>();
  const bound = new Set<string>();
  const uses = new Map<string, Where[]>();
  /**
   * …and the WRITES on their own.
   *
   * A name that is only ever read is somebody else's — an event's parameter, a
   * trait's binding — and not a working value at all. What this file is about
   * is the name a body makes for itself, and a body makes one by writing it.
   */
  const writes = new Map<string, Where[]>();
  const add = (map: Map<string, Where[]>, id: string, at: Where) => {
    if (!map.has(id)) {
      map.set(id, []);
    }
    map.get(id)!.push(at);
  };
  const walkStack = (
    block: Saved | undefined,
    path: string[],
    from: number,
  ) => {
    let at = block;
    let index = from;
    while (at) {
      visit(at, path, index);
      at = at.next?.block;
      index += 1;
    }
  };
  const visit = (block: Saved, path: string[], index: number) => {
    const key = path.join('>');
    const id = idOf(block.fields);
    if (block.type.startsWith('world_let_') && id) {
      add(lets, id, {path: key, index});
    }
    if (LOOPS.has(block.type) && id) {
      bound.add(id);
    }
    for (const part of block.extraState?.parts ?? []) {
      if (part.var) {
        bound.add(part.var);
      }
    }
    if (/^variables_(get|set)_/.test(block.type) && id) {
      add(uses, id, {path: key, index});
      if (block.type.startsWith('variables_set_')) {
        add(writes, id, {path: key, index});
      }
    }
    for (const [name, socket] of Object.entries(block.inputs ?? {})) {
      const child = socket.block ?? socket.shadow;
      if (child) {
        walkStack(child, [...path, `${index}:${name}`], 0);
      }
    }
  };
  for (const root of workspace.blocks?.blocks ?? []) {
    walkStack(root, ['root'], 0);
  }
  return {lets, bound, uses, writes};
}

/** Whether `use` sits under `decl` — a later row, or inside one. */
const covers = (decl: Where, use: Where): boolean => {
  if (use.path === decl.path) {
    return use.index > decl.index;
  }
  if (!use.path.startsWith(`${decl.path}>`)) {
    return false;
  }
  const row = Number(use.path.slice(decl.path.length + 1).split(':')[0]);
  return row > decl.index;
};

describe('a stock rule’s working values', () => {
  for (const rule of STOCK_RULES) {
    const workspace = JSON.parse(rule.contents) as Parameters<typeof survey>[0];
    const names = new Map(
      (workspace.variables ?? []).map(one => [one.id, one.name]),
    );
    const {lets, bound, uses, writes} = survey(workspace);

    it(`${rule.id}: names every one of them with a \`let\``, () => {
      const free = [...writes.keys()]
        .filter(id => !lets.has(id) && !bound.has(id))
        .map(id => names.get(id) ?? id);

      expect(free).toEqual([]);
    });

    it(`${rule.id}: declares each where its readers can see it`, () => {
      const stray: string[] = [];
      for (const [id, where] of lets) {
        const outside = (uses.get(id) ?? []).filter(
          use => !where.some(decl => covers(decl, use)),
        );
        if (outside.length > 0) {
          stray.push(`${names.get(id) ?? id} (${outside.length} use(s))`);
        }
      }

      expect(stray).toEqual([]);
    });
  }
});
