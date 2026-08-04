// Seed a block's value inputs with default "shadow" blocks — the greyed-out
// placeholder a learner can type over or replace by dropping in another block
// (a getter, a math expression). Set-property blocks use this so their value is
// a real socket, not a bare field: `set world strength to (9)` where the 9
// is a `math_number` shadow that a `get world strength` or `(_ + 1)` can
// replace. Attached as an extension — like `actorInput`'s `this actor` shadow —
// because the simplified toolbox lists blocks by type only and can't carry
// per-input shadow specs; the per-block defaults live in a registry keyed by
// block type, populated as each block is generated.

import {defineExtension, type Extension} from '@code-dot-org/blockly';

export const VALUE_SHADOW_EXTENSION = 'world_value_shadow';

/** A shadow block spec: the block type and its field values (e.g. math_number NUM). */
export interface ShadowSpec {
  type: string;
  // A field's serialized state — usually a scalar, but a custom field (e.g. the
  // vector field) saves a structured value like `{x, y}`.
  fields?: Record<string, unknown>;
}

// block type -> the input names to seed and the shadow to seed each with.
const SHADOWS = new Map<string, Array<{name: string; shadow: ShadowSpec}>>();

/** Register the default shadows a block's value inputs should carry. */
export function registerValueShadows(
  blockType: string,
  shadows: Array<{name: string; shadow: ShadowSpec}>,
): void {
  SHADOWS.set(blockType, shadows);
}

/**
 * The shadows registered for a block type — what its value inputs will wear.
 *
 * For tests, which have no workspace to attach a shadow to and so cannot see
 * the extension do its work.
 */
export function shadowsFor(
  blockType: string,
): Array<{name: string; shadow: ShadowSpec}> | undefined {
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
          connection.setShadowState(shadow);
        }
      }
    },
  },
);
