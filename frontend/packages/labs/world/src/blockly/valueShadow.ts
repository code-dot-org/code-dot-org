// Seed a block's value inputs with default "shadow" blocks — the greyed-out
// placeholder a learner can type over or replace by dropping in another block
// (a getter, a math expression). Set-property blocks use this so their value is
// a real socket, not a bare field: `set world strength to (900)` where the 900
// is a `math_number` shadow that a `get world strength` or `(_ + 10)` can
// replace. Attached as an extension — like `actorInput`'s `this actor` shadow —
// because the simplified toolbox lists blocks by type only and can't carry
// per-input shadow specs; the per-block defaults live in a registry keyed by
// block type, populated as each block is generated.

import {defineExtension, type Extension} from '@code-dot-org/blockly';

export const VALUE_SHADOW_EXTENSION = 'world_value_shadow';

/** A shadow block spec: the block type and its field values (e.g. math_number NUM). */
export interface ShadowSpec {
  type: string;
  fields?: Record<string, string | number | boolean>;
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
