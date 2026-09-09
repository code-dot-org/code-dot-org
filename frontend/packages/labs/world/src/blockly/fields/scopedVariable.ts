// A variable dropdown that offers only the names the block can see.
//
// Blockly's `FieldVariable` lists every variable of its flavour on the
// workspace, because a Blockly variable belongs to the workspace and there was
// never anything else for it to belong to. `with ⟨number n⟩ as ⟨0⟩ do` makes
// that wrong: its name exists inside one mouth, and offering it outside offers
// a name that reads a different variable — the module-level `var` Blockly
// writes for the same id (`domainBlocks.scopedLocal`, `variableScope`).
//
// WHAT IS OVERRIDDEN IS THE MENU AND NOTHING ELSE. Creating, renaming and
// deleting a variable, restoring one on load, and the type checking that keeps
// a Number getter out of an Actor socket are all the base field's, and all
// still work. This filters the list it offers and leaves the rest alone.
//
// AND IT NEVER OFFERS NOTHING. A dropdown with no options is a field Blockly
// cannot draw, and a getter that has been dragged out of the mouth that named
// it is exactly the case that would produce one — so what it holds is always
// offered, whether or not it is in scope. What that block IS wrong about is a
// job for a warning rather than for an empty menu.

import * as Blockly from 'blockly/core';

import {idsInScope} from '../variableScope';

/** The two entries Blockly appends, which are commands rather than names. */
const COMMANDS: ReadonlySet<string> = new Set([
  Blockly.RENAME_VARIABLE_ID,
  Blockly.DELETE_VARIABLE_ID,
]);

export class ScopedFieldVariable extends Blockly.FieldVariable {
  constructor(...args: ConstructorParameters<typeof Blockly.FieldVariable>) {
    super(...args);
    // The base class points the menu at its own static in the constructor, so
    // this has to be re-pointed after `super` rather than declared.
    (this as unknown as {menuGenerator_: unknown}).menuGenerator_ =
      ScopedFieldVariable.dropdownCreate;
  }

  /** Blockly builds a field from JSON through this. */
  static fromJson(
    options: Parameters<typeof Blockly.FieldVariable.fromJson>[0],
  ): ScopedFieldVariable {
    const config = options as {
      variable?: string;
      variableTypes?: string[];
      defaultType?: string;
    };
    return new ScopedFieldVariable(
      config.variable ?? null,
      undefined,
      config.variableTypes,
      config.defaultType,
    );
  }

  /**
   * The base menu, less the names this block cannot see.
   *
   * Built from the base list rather than from the variable map, so whatever
   * Blockly decides belongs in the menu — the flavour filtering, the ordering,
   * the two commands at the end — keeps deciding it.
   */
  static dropdownCreate(this: Blockly.FieldVariable): Blockly.MenuOption[] {
    const all = Blockly.FieldVariable.dropdownCreate.call(this);
    const block = this.getSourceBlock();
    if (!block || block.isInFlyout) {
      return all;
    }
    const visible = idsInScope(block);
    const held = this.getValue();
    return all.filter(([, id]) => {
      const value = String(id);
      return COMMANDS.has(value) || value === held || visible.has(value);
    });
  }
}

/** The name a block's JSON asks for this field by. */
export const SCOPED_VARIABLE_FIELD = 'field_scoped_variable';

let registered = false;

/**
 * Register the field, once.
 *
 * Called from the module that defines the typed variables, because a block
 * naming a field type Blockly has not been told about fails to build at all —
 * and the flavours are defined at module load, before anything else runs.
 */
export function registerScopedVariableField(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.fieldRegistry.register(
    SCOPED_VARIABLE_FIELD,
    ScopedFieldVariable as never,
  );
}
