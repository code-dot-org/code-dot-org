// Seed a block's value inputs with default "shadow" blocks — the greyed-out
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
        if (connection && !connection.targetBlock()) {
          connection.setShadowState(shadowFor(shadow, this));
        }
      }
    },
  },
);
