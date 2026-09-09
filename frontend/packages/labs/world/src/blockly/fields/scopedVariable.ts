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

/** What a field with no name in it draws, and the value that means it. */
export const UNNAMED = '???';
export const NO_VARIABLE = '';

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
   * …and what it SAVES, which is the other place holding no variable shows.
   *
   * Blockly serialises a block the moment it is created, and the base class
   * reaches straight through to `this.variable.getId()`. One override, not the
   * whole chain: validation and the id-to-variable lookup are still the base
   * class's, and taking those over as well is what broke every rule that reads
   * a parameter.
   */
  override saveState(): unknown {
    return this.getValue() ? super.saveState() : NO_VARIABLE;
  }

  override loadState(state: unknown): void {
    if (state === NO_VARIABLE || state === null || state === undefined) {
      return;
    }
    super.loadState(state);
  }

  /** What it draws when it names nothing, which is now a state it can be in. */
  override getText(): string {
    return super.getText() || UNNAMED;
  }

  /**
   * The names this block can see, and nothing else.
   *
   * BUILT FROM SCOPE rather than filtered out of the base list, because the
   * base list is every variable of this flavour on the workspace and the point
   * is that most of them are not this block's to read.
   *
   * `???` WHERE THERE ARE NONE — in the flyout, above every `let` in the file,
   * or in a body that has no names at all. A dropdown must offer something,
   * and what there is to offer is the absence itself: a block that says `???`
   * is a block a reader can see is unfinished, which is the honest end of the
   * same argument that took the default name away.
   */
  static dropdownCreate(this: Blockly.FieldVariable): Blockly.MenuOption[] {
    const block = this.getSourceBlock();
    const workspace = block?.workspace;
    const flavours = this.variableTypes;
    const visible: ReadonlySet<string> =
      block && workspace && !block.isInFlyout
        ? idsInScope(block)
        : new Set<string>();
    const named: Blockly.MenuOption[] = [];
    for (const id of visible) {
      const variable = workspace?.getVariableMap().getVariableById(id);
      if (variable && (!flavours || flavours.includes(variable.getType()))) {
        named.push([variable.getName(), id]);
      }
    }
    named.sort(([one], [other]) => String(one).localeCompare(String(other)));
    return named.length ? named : [[UNNAMED, NO_VARIABLE]];
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
