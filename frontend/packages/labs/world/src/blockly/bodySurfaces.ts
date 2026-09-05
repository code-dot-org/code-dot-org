// A workspace holds an interface; its bodies are kept beside it.
//
// specs/NEXT.md §8. A rule arrives as one workspace of everything it is —
// `solid` is 473 blocks — and nine tenths of that is implementation nobody
// opened. Splitting the document lets the editor build the twenty-odd blocks
// that say what the rule OFFERS and build a body only when somebody asks for
// it, which is 147ms against 8.6ms for `solid` in a real browser
// (`spikes/rule-surfaces/FINDINGS.md`).
//
// THE FILE DOES NOT CHANGE. What splits is what the editor renders: `split`
// takes a saved document and hands back an interface plus a table of bodies,
// and `merge` puts them back. The file on disk is what `merge` produces, so
// nothing downstream — the generator, the compiler, a diff — knows this
// happened.
//
// A BODY HANGS OFF TWO DIFFERENT PLACES and the difference is not cosmetic. A
// hat's body is the chain that FOLLOWS it (`next`); a member's is the `DO`
// input it holds. The same `next` on `define rule` and `define trait` is
// their member list, which is interface and stays. Reading `next` as "body"
// everywhere empties the file; reading only `DO` as "body" leaves every
// rule-level step behind. The spike's first draft did the second and hid
// almost nothing in the rules that needed it most.
//
// KEYED BY BLOCK ID, which is safe because Blockly emits an id for every
// block it saves and keeps it across a reload — measured, not assumed. The
// generated stock rules carry none, so `split` mints them; from the first
// save onwards they are the file's own.

import {type BlocklySerialization} from '@code-dot-org/blockly';

/** A saved block, as Blockly writes one. */
interface SavedBlock {
  type: string;
  id?: string;
  inputs?: Record<string, {block?: SavedBlock; shadow?: SavedBlock}>;
  next?: {block: SavedBlock};
  [key: string]: unknown;
}

/**
 * Roots whose `next` chain is what they run.
 *
 * A hat: what follows it is its body. Not `world_rule` or `world_rule_trait`,
 * whose `next` is the list of what they declare.
 */
const BODY_IN_NEXT = new Set(['world_rule_step_in', 'world_rule_step_tick']);

/**
 * Members whose `DO` input is what they run.
 *
 * `world_trait_step` is `each frame` in all three of its homes — a trait's
 * member, an `.actor` file's own per-frame work, and the same inside a
 * world's `define actor` — so an actor file splits on the same rule a rule
 * file does, which is the point (§8, "Not only rules").
 */
const BODY_IN_DO = new Set(['world_rule_block', 'world_trait_step']);

/** Whether this block keeps an implementation somewhere. */
export const hasBody = (type: string): boolean =>
  BODY_IN_NEXT.has(type) || BODY_IN_DO.has(type);

/** The bodies a document was carrying, by the id of the block that owns each. */
export type Bodies = Record<string, SavedBlock>;

export interface Split {
  /** What the editor renders: every declaration, no implementation. */
  shown: BlocklySerialization;
  bodies: Bodies;
}

/** Ids the split had to invent, so a caller can tell a mint from a reload. */
const mintId = (): string => `body-${Math.random().toString(36).slice(2, 10)}`;

const splitBlock = (block: SavedBlock, bodies: Bodies): SavedBlock => {
  const id = block.id ?? mintId();
  const out: SavedBlock = {...block, id};

  if (block.inputs) {
    const inputs: SavedBlock['inputs'] = {};
    for (const [name, socket] of Object.entries(block.inputs)) {
      if (name === 'DO' && BODY_IN_DO.has(block.type) && socket.block) {
        bodies[id] = socket.block;
        continue;
      }
      inputs[name] = socket.block
        ? {...socket, block: splitBlock(socket.block, bodies)}
        : socket;
    }
    out.inputs = inputs;
  }

  if (block.next?.block) {
    if (BODY_IN_NEXT.has(block.type)) {
      bodies[id] = block.next.block;
      delete out.next;
    } else {
      out.next = {block: splitBlock(block.next.block, bodies)};
    }
  }
  return out;
};

/** A document as an interface, and the bodies taken out of it. */
export function split(document: BlocklySerialization): Split {
  const roots = (document.blocks?.blocks ?? []) as SavedBlock[];
  const bodies: Bodies = {};
  const shown = {
    ...document,
    blocks: {
      ...document.blocks,
      blocks: roots.map(root => splitBlock(root, bodies)),
    },
  } as BlocklySerialization;
  return {shown, bodies};
}

const mergeBlock = (block: SavedBlock, bodies: Bodies): SavedBlock => {
  const out: SavedBlock = {...block};
  const body = block.id ? bodies[block.id] : undefined;

  if (block.inputs) {
    const inputs: SavedBlock['inputs'] = {};
    for (const [name, socket] of Object.entries(block.inputs)) {
      inputs[name] = socket.block
        ? {...socket, block: mergeBlock(socket.block, bodies)}
        : socket;
    }
    out.inputs = inputs;
  }
  if (body && BODY_IN_DO.has(block.type)) {
    out.inputs = {...out.inputs, DO: {block: body}};
  }

  if (block.next?.block) {
    out.next = {block: mergeBlock(block.next.block, bodies)};
  }
  if (body && BODY_IN_NEXT.has(block.type)) {
    out.next = {block: body};
  }
  return out;
};

/**
 * The file: what the editor is showing, with its bodies put back.
 *
 * Every path that writes the file goes through this. A save that skipped it
 * would not throw — it would write a rule whose steps are empty, which is why
 * the editor should have no other way to serialize.
 */
export function merge(
  shown: BlocklySerialization,
  bodies: Bodies,
): BlocklySerialization {
  const roots = (shown.blocks?.blocks ?? []) as SavedBlock[];
  return {
    ...shown,
    blocks: {
      ...shown.blocks,
      blocks: roots.map(root => mergeBlock(root, bodies)),
    },
  } as BlocklySerialization;
}

/**
 * Bodies still owned by a block on the surface.
 *
 * A deleted step leaves its body behind, and a file that never forgets one
 * grows for the life of the project. A duplicated step is the other half of
 * the same fact: the copy has an id of its own and no body, so it arrives
 * empty rather than sharing.
 */
export function reap(shown: BlocklySerialization, bodies: Bodies): Bodies {
  const live = new Set<string>();
  const walk = (block: SavedBlock): void => {
    if (block.id) {
      live.add(block.id);
    }
    for (const socket of Object.values(block.inputs ?? {})) {
      if (socket.block) {
        walk(socket.block);
      }
    }
    if (block.next?.block) {
      walk(block.next.block);
    }
  };
  for (const root of (shown.blocks?.blocks ?? []) as SavedBlock[]) {
    walk(root);
  }
  return Object.fromEntries(
    Object.entries(bodies).filter(([id]) => live.has(id)),
  );
}

/**
 * One file's split, held.
 *
 * The editor is where a body would be lost: every save is a fresh
 * `workspaces.save`, and the workspace has not held a body since it was
 * loaded. So the editor keeps one of these and never touches the workspace's
 * serialization directly — `read` is the only way to get the file, `show` the
 * only way to put one on screen.
 */
export interface BodySeam {
  /** What to load: the document handed in, minus its bodies. */
  show(document: BlocklySerialization): BlocklySerialization;
  /** The file: a workspace's own save, with the bodies put back. */
  read(saved: BlocklySerialization): BlocklySerialization;
  /** One member's implementation, as a workspace could load it. */
  bodyOf(id: string): BlocklySerialization;
  /** …and back, when the surface that was editing it closes or changes. */
  setBody(id: string, saved: BlocklySerialization): void;
}

/**
 * Whether the EDITOR hides a body, as opposed to whether it can.
 *
 * ON: `solid.rule` opens with fourteen blocks rather than four hundred and
 * seventy-three, and the pencil on each `define …` opens the rest. The first
 * attempt turned this on before the pencil existed, which left a `define
 * block` whose `do` was empty and had no door — a broken-looking rule, worse
 * than a long workspace. The button is what earns the flag.
 *
 * Read by `BlocklyFileEditor` and by nothing here: a seam that sometimes did
 * not split would be a seam whose `read` puts stale bodies back over live
 * ones. Off, the editor bypasses it entirely; on, it is one line. It stays a
 * flag because the surfaces are new and turning them off is a one-word
 * revert.
 */
export const HIDE_BODIES = true;

export function createBodySeam(): BodySeam {
  let bodies: Bodies = {};
  return {
    show(document) {
      const next = split(document);
      bodies = next.bodies;
      return next.shown;
    },
    read(saved) {
      // Reaped on the way out: a body whose block has been deleted must not
      // outlive it, or the file grows one orphan per deleted step forever.
      bodies = reap(saved, bodies);
      return merge(saved, bodies);
    },
    bodyOf(id) {
      // A body is one chain of statements, and a workspace holds a list of
      // roots — so opening one is the chain as the only root, and an empty
      // body is an empty workspace rather than an error.
      const body = bodies[id];
      return {blocks: {languageVersion: 0, blocks: body ? [body] : []}};
    },
    setBody(id, saved) {
      const [root] = ((saved.blocks?.blocks ?? []) as SavedBlock[]).filter(
        block => block.type !== undefined,
      );
      if (root) {
        bodies[id] = root;
      } else {
        // Emptied on purpose: the member keeps existing and does nothing,
        // which is what a step with no rows means everywhere else.
        delete bodies[id];
      }
    },
  };
}
