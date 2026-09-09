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

  /**
   * What it draws: the name, or `???` when that name is not this block's.
   *
   * NOT MERELY WHEN IT HOLDS NOTHING. A getter dragged out of the drawer holds
   * Blockly's default for its flavour — the field invents one the moment it
   * has none — so it drew `flag` while its own menu offered only `???`. The
   * two have to agree, and the menu is right: a name the block cannot see is
   * not a name it can be showing.
   */
  override getText(): string {
    const block = this.getSourceBlock();
    const id = this.getValue();
    if (!block || typeof id !== 'string' || !id) {
      return UNNAMED;
    }
    // In the flyout there is no scope to be in, and the block is a sample
    // rather than part of a program — so it draws what it holds.
    return this.namesSomething() ? super.getText() || UNNAMED : UNNAMED;
  }

  /**
   * Picking `???` really does clear the name.
   *
   * Blockly's own validation looks the id up and answers null when it finds
   * nothing, which leaves the old value in place — so choosing the empty entry
   * did nothing at all. Only the empty case is handled here; everything else
   * is the base class's, including the lookup that turns an id into a variable
   * and the one that makes a missing one, which every rule that reads a
   * parameter depends on.
   */
  protected override doClassValidation_(newValue?: unknown): string | null {
    if (newValue === NO_VARIABLE) {
      return NO_VARIABLE;
    }
    return super.doClassValidation_(newValue as never) ?? null;
  }

  /** …and holding nothing is a state the base class does not expect. */
  protected override doValueUpdate_(newValue: string): void {
    if (newValue === NO_VARIABLE) {
      // Straight to `Field`, skipping the variable lookup in between: there
      // is no id to look up, and the base class would answer null and then
      // read a name off it.
      const base = Blockly.Field.prototype as unknown as {
        doValueUpdate_: (value: string) => void;
      };
      (this as unknown as {variable: unknown}).variable = null;
      base.doValueUpdate_.call(this, newValue);
      return;
    }
    super.doValueUpdate_(newValue);
  }

  /** Whether it holds a name this block can actually see. */
  namesSomething(): boolean {
    const block = this.getSourceBlock();
    const id = this.getValue();
    if (!block || typeof id !== 'string' || id === NO_VARIABLE) {
      return false;
    }
    return block.isInFlyout || idsInScope(block).has(id);
  }

  /**
   * Never the cached list.
   *
   * `FieldDropdown` remembers what a generator last returned, and the menu and
   * the checkmark are both drawn from that memory. For a list that depends on
   * where the block SITS, the memory is wrong the moment it is dragged: a
   * field built in the flyout cached an empty scope, and one built beside a
   * name it could see goes on offering that name after it is carried away.
   *
   * Regenerating every time is what a scoped list means, and it costs nothing
   * now that the walk behind it is remembered per workspace instead
   * (`variableScope`).
   */
  override getOptions(): Blockly.MenuOption[] {
    return super.getOptions(false);
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
