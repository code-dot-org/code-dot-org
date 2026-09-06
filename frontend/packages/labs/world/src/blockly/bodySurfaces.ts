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

/**
 * Blocks with a surface of their own but NOTHING to take off them.
 *
 * `define event` is a declaration: it makes a hat, and the blocks that run for
 * it live under that hat in whatever file cares. So there is no body to split
 * out — and it must never be treated as if there were, because an event's
 * `next` is the member chain, and reading that as a body would move the rest
 * of the rule into it.
 *
 * What it does have is a signature, which is edited exactly the way a `define
 * block`'s is. So it earns a pencil and a surface; the surface simply holds
 * the head and no body.
 */
const SURFACE_WITHOUT_BODY = new Set(['world_rule_event']);

/**
 * Whether a pencil opens something for this block.
 *
 * Wider than `hasBody`, and deliberately a different question: `split` asks
 * what to take OUT of the document, and this asks what a learner can open.
 */
export const hasSurface = (type: string): boolean =>
  hasBody(type) || SURFACE_WITHOUT_BODY.has(type);

/**
 * The id the owner block wears while its own body is the surface.
 *
 * NOT the block's real id, and that is the point. The editor tells which
 * surface the workspace is showing by asking whether the member's block is in
 * it — a member lives on the interface and never inside its own body — and a
 * head that kept the real id would answer yes on both, so every rebuild of the
 * palette would reload the body over the learner's edits.
 */
export const BODY_OWNER_ID = 'body-owner';

/**
 * What a body surface's head owns, by the id of the block it stands in for.
 *
 * The head draws `returns` and the `arguments` stack — the interface draws
 * neither — so what the learner does there exists nowhere else until the file
 * is written. This is where it waits.
 *
 * `extraState` is the signature: a `define block` is saved with its parts, not
 * with the blocks that edit them, so the stack on the head is read back into
 * parts and it is the parts that travel.
 */
export interface HeadState {
  fields?: Record<string, unknown>;
  extraState?: unknown;
}

export type Heads = Record<string, HeadState>;

/** The bodies a document was carrying, by the id of the block that owns each. */
export type Bodies = Record<string, SavedBlock>;

export interface Split {
  /** What the editor renders: every declaration, no implementation. */
  shown: BlocklySerialization;
  bodies: Bodies;
}

/**
 * Where a root block sits in a workspace, by this lab's own convention.
 *
 * Every starter file puts its root here (`constants.ts`), so a body surface
 * that put its head anywhere else would be the one workspace in the lab whose
 * top block is jammed into the corner.
 */
const ROOT_X = 20;
const ROOT_Y = 20;

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

const mergeBlock = (
  block: SavedBlock,
  bodies: Bodies,
  heads: Heads,
): SavedBlock => {
  const out: SavedBlock = {...block};
  const body = block.id ? bodies[block.id] : undefined;

  // What the head of this member's own surface is showing. It wins, because
  // the fields it draws are drawn nowhere else — the interface stopped
  // offering them, so it has nothing newer to say about them.
  const head = block.id ? heads[block.id] : undefined;
  if (head?.fields) {
    out.fields = {...(block.fields as object), ...head.fields};
  }
  if (head?.extraState !== undefined) {
    out.extraState = head.extraState;
  }

  if (block.inputs) {
    const inputs: SavedBlock['inputs'] = {};
    for (const [name, socket] of Object.entries(block.inputs)) {
      inputs[name] = socket.block
        ? {...socket, block: mergeBlock(socket.block, bodies, heads)}
        : socket;
    }
    out.inputs = inputs;
  }
  if (body && BODY_IN_DO.has(block.type)) {
    out.inputs = {...out.inputs, DO: {block: body}};
  }

  if (block.next?.block) {
    out.next = {block: mergeBlock(block.next.block, bodies, heads)};
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
  heads: Heads = {},
): BlocklySerialization {
  const roots = (shown.blocks?.blocks ?? []) as SavedBlock[];
  return {
    ...shown,
    blocks: {
      ...shown.blocks,
      blocks: roots.map(root => mergeBlock(root, bodies, heads)),
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

/** The block with this id, wherever it sits in the document. */
function findById(
  document: BlocklySerialization,
  id: string,
): SavedBlock | undefined {
  const walk = (block: SavedBlock): SavedBlock | undefined => {
    if (block.id === id) {
      return block;
    }
    for (const socket of Object.values(block.inputs ?? {})) {
      const hit = socket.block && walk(socket.block);
      if (hit) {
        return hit;
      }
    }
    return block.next?.block ? walk(block.next.block) : undefined;
  };
  for (const root of (document.blocks?.blocks ?? []) as SavedBlock[]) {
    const hit = walk(root);
    if (hit) {
      return hit;
    }
  }
  return undefined;
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
  /**
   * One member's implementation, as a workspace could load it: the member's
   * own block at the head, with the body attached under it.
   *
   * `shown` is the interface the editor is holding, which is where the head
   * is copied from — so the head reads as whatever the learner has just named
   * and designed, not as whatever the file said when it was opened.
   */
  bodyOf(id: string, shown: BlocklySerialization): BlocklySerialization;
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
  let heads: Heads = {};
  return {
    show(document) {
      const next = split(document);
      bodies = next.bodies;
      // A new document says everything about itself, including the fields a
      // head was holding. Keeping them would put an old surface's answer over
      // a file the learner has moved on to.
      heads = {};
      return next.shown;
    },
    read(saved) {
      // Reaped on the way out: a body whose block has been deleted must not
      // outlive it, or the file grows one orphan per deleted step forever.
      bodies = reap(saved, bodies);
      heads = reap(saved, heads as Bodies) as Heads;
      return merge(saved, bodies, heads);
    },
    bodyOf(id, shown) {
      // The member's own block heads the surface, the way `define rule` heads
      // a rule file: something to attach to, and a statement of what is being
      // implemented. A chain floating in an empty workspace said neither, and
      // an empty body said nothing at all.
      //
      // Its `next` is the BODY here. On the interface that same `next` is the
      // member chain — what the rule declares after this one — so it is
      // dropped first; the interface keeps it, and `merge` puts the body back
      // wherever the file format holds it.
      const body = bodies[id];
      const owner = findById(shown, id);
      // THE FILE'S VARIABLES COME TOO. A parameter is a variable, and the body
      // reads it with an ordinary getter — so a surface loaded without them
      // makes its own, and the head then binds its parameters against a
      // workspace where the body's variables are strangers. What that looks
      // like is a rename to `amount2`: the name was taken, by the same
      // variable under a different identity.
      const carried = (shown as {variables?: unknown}).variables;
      const surface = (blocks: SavedBlock[]): BlocklySerialization =>
        ({
          ...(carried === undefined ? {} : {variables: carried}),
          blocks: {languageVersion: 0, blocks},
        }) as BlocklySerialization;
      if (!owner) {
        return surface(body ? [body] : []);
      }
      const held = heads[id];
      const head: SavedBlock = {
        ...owner,
        id: BODY_OWNER_ID,
        // What this surface last said about its own fields, over what the
        // interface remembers: the interface is a snapshot from when the body
        // was opened, and it does not draw these any more.
        ...(held?.fields
          ? {fields: {...(owner.fields as object), ...held.fields}}
          : {}),
        ...(held?.extraState !== undefined
          ? {extraState: held.extraState}
          : {}),
      };
      delete head.next;
      // Where it sat on the interface means nothing here — it is the only
      // root on this surface. Carried over, it put the head wherever that
      // member happened to be in a long rule, which on `solid` is off the
      // side of the screen. Dropped outright it landed in the corner, so it
      // is placed where every other workspace in the lab puts its root.
      head.x = ROOT_X;
      head.y = ROOT_Y;
      if (body) {
        head.next = {block: body};
      }
      return surface([head]);
    },
    setBody(id, saved) {
      // Found by the head, not by taking the first root: a learner who
      // detaches a chain to rearrange it leaves an orphan behind, and which
      // root comes first is then a question about drag order.
      const roots = (saved.blocks?.blocks ?? []) as SavedBlock[];
      const head = roots.find(block => block.id === BODY_OWNER_ID);
      if (!head) {
        // NOTHING ARRIVED — the surface is not up, or is not this member's.
        // Reading that as "the learner emptied it" is how the first attempt
        // deleted bodies and saved the result, so it is read as nothing.
        return;
      }
      // The head's own fields come back with it: `RETURNS` is drawn here and
      // nowhere else, so if this did not carry it, picking one would change
      // the block on screen and nothing in the file.
      if (head.fields || head.extraState !== undefined) {
        heads[id] = {
          ...(head.fields
            ? {fields: head.fields as Record<string, unknown>}
            : {}),
          ...(head.extraState !== undefined
            ? {extraState: head.extraState}
            : {}),
        };
      }
      if (head.next?.block) {
        bodies[id] = head.next.block;
      } else {
        // Emptied on purpose: the member keeps existing and does nothing,
        // which is what a step with no rows means everywhere else.
        delete bodies[id];
      }
    },
  };
}
