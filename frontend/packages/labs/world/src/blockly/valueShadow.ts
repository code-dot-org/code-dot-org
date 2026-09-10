// Seed a block's value inputs with default "shadow" blocks — the grayed-out
// placeholder a learner can type over or replace by dropping in another block
// (a getter, a math expression). Set-property blocks use this so their value is
// a real socket, not a bare field: `set amount of gravity to (9)` where the 9
// is a `math_number` shadow that a `get amount of gravity` or `(_ + 1)` can
// replace. Attached as an extension — like `actorInput`'s `this actor` shadow —
// because the simplified toolbox lists blocks by type only and can't carry
// per-input shadow specs; the per-block defaults live in a registry keyed by
// block type, populated as each block is generated.
//
// A shadow may also be a FUNCTION of the block it is being attached to, because
// the right default is not always a fact about the block type alone. An actor
// list's source wants `any ⟨Coin ▾⟩` in a world or an actor file — one dropdown
// click from what the learner meant — and `all actors` in a `.rule`, which is
// generic over actors and must not name a kind (specs/ACTOR_LISTS.md).

import {
  defineExtension,
  type Blockly,
  type Extension,
} from '@code-dot-org/blockly';

export const VALUE_SHADOW_EXTENSION = 'world_value_shadow';

/** A shadow block spec: the block type and its field values (e.g. math_number NUM). */
export interface ShadowSpec {
  type: string;
  // A field's serialized state — usually a scalar, but a custom field (e.g. the
  // vector field) saves a structured value like `{x, y}`.
  fields?: Record<string, unknown>;
  /**
   * Shadows on the shadow's OWN sockets, as Blockly's block state writes them:
   * `{X: {shadow: {type: 'math_number', fields: {NUM: 3}}}}`.
   *
   * A shadow is seeded with `setShadowState`, which takes a whole serialized
   * block and has always been able to nest; this is the spec catching up with
   * it. What wanted it is a socket that should be EDITED one way and FILLED
   * another — a position argument is edited as an x and a y and accepts any
   * vector, which is one `world_vector_of` shadow with a number in each of its
   * sockets, and was not sayable while a spec was one block deep.
   */
  inputs?: Blockly.serialization.blocks.State['inputs'];
}

/**
 * A shadow, or a way of choosing one when the block is attached.
 *
 * The block is passed rather than the workspace because that is what the
 * extension has, and because a chooser may want to look up as well as around —
 * a flyout's block reaches its target workspace through it.
 */
export type ShadowChoice = ShadowSpec | ((block: Blockly.Block) => ShadowSpec);

/** A registered entry: which input, and what it wears. */
export interface ShadowEntry {
  name: string;
  shadow: ShadowChoice;
}

// block type -> the input names to seed and the shadow to seed each with.
const SHADOWS = new Map<string, ShadowEntry[]>();

/** Register the default shadows a block's value inputs should carry. */
export function registerValueShadows(
  blockType: string,
  shadows: ShadowEntry[],
): void {
  SHADOWS.set(blockType, shadows);
}

/** The spec a choice comes to, for a block that is being given one. */
export const shadowFor = (
  shadow: ShadowChoice,
  block: Blockly.Block,
): ShadowSpec => (typeof shadow === 'function' ? shadow(block) : shadow);

/**
 * The shadows registered for a block type — what its value inputs will wear.
 *
 * For tests, which have no workspace to attach a shadow to and so cannot see
 * the extension do its work.
 */
export function shadowsFor(blockType: string): ShadowEntry[] | undefined {
  return SHADOWS.get(blockType);
}

/** Seed each registered value input with its default shadow (if still empty). */
export const valueShadowExtension: Extension = defineExtension(
  VALUE_SHADOW_EXTENSION,
  {
    extension() {
      for (const {name, shadow} of SHADOWS.get(this.type) ?? []) {
        const connection = this.getInput(name)?.connection;
        // Only seed a fresh input; a saved/real block keeps whatever it holds.
        if (!connection || connection.targetBlock()) {
          continue;
        }
        // ONE SOCKET AT A TIME, and a failure costs only that socket.
        //
        // A shadow can be unmakeable — a block type this build does not define,
        // a dropdown whose saved choice the project no longer offers — and
        // `setShadowState` throws when it is. Unguarded, that throw leaves the
        // extension, and an extension that throws takes the whole BLOCK with
        // it: `newBlock` propagates, so the sockets already seeded are lost
        // along with the ones not reached. A block that came out with an empty
        // socket was the visible half of that.
        //
        // Since an author may now build a default out of any blocks they like
        // (`blockDesigner.letShadow`), the set of things that can fail to be
        // remade is no longer a closed list — so it is caught per socket
        // rather than trusted.
        try {
          connection.setShadowState(shadowFor(shadow, this));
        } catch (error) {
          // Said out loud. An empty socket where a default was meant is worth
          // one line in the console rather than a silence somebody has to
          // reverse-engineer from a screenshot.
          console.warn(
            `world: could not seed the ${name} socket of ${this.type}`,
            error,
          );
        }
      }
    },
  },
);
