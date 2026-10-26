// The name in a `let`, typed rather than picked.
//
// A declaration is where a name COMES FROM, so the block that declares one
// should be the block you write it in. Blockly's `field_variable` is a
// dropdown of names that already exist, which is right for a getter and
// backwards for a `let`: making a second name meant opening a menu whose only
// entries were the names you were trying not to reuse.
//
// SO THE FIELD IS A TEXT BOX OVER A REAL VARIABLE. What it stores is the
// variable's id, exactly as `field_variable` does, so everything downstream is
// unchanged — the getters list it, the generator maps it to one identifier,
// and the workspace serialises it. What it shows and edits is the NAME: type
// one that exists and the block points at it, type one that does not and it is
// made.
//
// WHICH IS WHY RENAMING STILL WORKS FROM THE OTHER END. A getter's menu
// renames the variable, and this field draws the variable's current name — so
// the `let` follows, because there was only ever one name and both blocks were
// showing it.

import * as Blockly from 'blockly/core';

/** What a field with nothing usable in it draws. */
const UNNAMED = '?';

export class VariableNameField extends Blockly.FieldTextInput {
  /** The flavour a name typed here is created with — `Number`, `Actor`, … */
  private variableType = '';

  /**
   * Blockly builds a field from JSON through this.
   *
   * The config is a `field_variable`'s — `variable`, `variableTypes`,
   * `defaultType` — because a `let` says the same three things a getter does
   * and the flavour has to come from somewhere. Typed loosely for the same
   * reason: Blockly's own signature describes a text field's options, and this
   * is a text field over a variable.
   */
  static override fromJson(options: object): VariableNameField {
    const config = options as {
      variable?: string;
      variableTypes?: string[];
      defaultType?: string;
    };
    const field = new VariableNameField('');
    field.variableType = config.defaultType ?? config.variableTypes?.[0] ?? '';
    // The name a fresh block arrives carrying. Resolved to a variable the
    // first time the field is on a workspace, since there is none yet.
    field.pending = config.variable ?? '';
    return field;
  }

  /** A name given in JSON, held until there is a workspace to make it on. */
  private pending = '';

  /** The variable this field points at, if it still exists. */
  private variable(): Blockly.IVariableModel<Blockly.IVariableState> | null {
    const workspace = this.getSourceBlock()?.workspace;
    const id = this.getValue();
    return workspace && typeof id === 'string' && id
      ? workspace.getVariableMap().getVariableById(id)
      : null;
  }

  /**
   * The variable of this name and flavour, made if there is not one.
   *
   * By NAME, so typing a name that is already declared points at the same
   * variable rather than at a second one wearing the same word — which is what
   * a reader means by typing it, and is what lets a `let` and the getters
   * below it agree without anybody choosing from a menu.
   */
  private resolve(name: string): string {
    const block = this.getSourceBlock();
    const workspace = block?.workspace;
    // NOT FROM THE FLYOUT. A block in the toolbox carries a default name, and
    // making the variable for it would put that name on the workspace before
    // anybody had dragged anything out — where every getter's dropdown would
    // then offer it (`variableScope`). The flyout draws the name it was given
    // and makes nothing.
    if (!workspace || block?.isInFlyout) {
      return '';
    }
    const map = workspace.getVariableMap();
    const existing = map.getVariable(name, this.variableType);
    if (existing) {
      return existing.getId();
    }
    // A NEW NAME FOR THE ONE IT ALREADY DECLARES, rather than a second
    // variable. This field only ever sits on a block that DECLARES — a `let`,
    // a loop — so editing it is renaming the thing declared, and the readers
    // below go on reading it: Blockly tells every field showing that variable,
    // and they redraw themselves.
    //
    // Making a fresh variable instead would leave those readers pointing at
    // the old one, which nothing declares any more — so they would quietly
    // become out-of-scope reads of a name that had merely been spelled
    // differently.
    const held = this.variable();
    if (held) {
      map.renameVariable(held, name);
      return held.getId();
    }
    return map.createVariable(name, this.variableType).getId();
  }

  /** Shown and edited: the NAME, where the value is the id. */
  getText(): string {
    return this.variable()?.getName() ?? (this.pending || UNNAMED);
  }

  protected override doValueUpdate_(newValue: string): void {
    super.doValueUpdate_(newValue);
    // The text the editor shows follows the variable rather than the value,
    // which is an id and would be a wall of characters nobody typed.
    this.isDirty_ = true;
  }

  /**
   * Called with what was typed; answered with the id it names.
   *
   * THREE SHAPES ARRIVE HERE, and only one of them is typing. Blocks in this
   * repo are AUTHORED as JSON — the rule DSL and every hand-written stock
   * actor say `fields: {VAR: {id, name}}`, which is a variable field's
   * serialised form; Blockly re-validates the STORED value on load, which is
   * an id; and a person types a name. All three have to end at the same
   * place, which is an id this workspace knows.
   */
  protected override doClassValidation_(newValue?: unknown): string | null {
    const workspace = this.getSourceBlock()?.workspace;
    if (!workspace) {
      return typeof newValue === 'string' ? newValue : null;
    }
    const map = workspace.getVariableMap();
    // A variable field's serialised form. Made with the id it names, so the
    // getters in the same file that carry that id find this one.
    if (newValue && typeof newValue === 'object') {
      const saved = newValue as {id?: string; name?: string; type?: string};
      if (typeof saved.id === 'string' && saved.id) {
        if (!map.getVariableById(saved.id)) {
          map.createVariable(
            saved.name ?? saved.id,
            saved.type ?? this.variableType,
            saved.id,
          );
        }
        return saved.id;
      }
      return typeof saved.name === 'string' ? this.resolve(saved.name) : null;
    }
    if (typeof newValue !== 'string') {
      return null;
    }
    // An id already, which is what the stored value is on every load after
    // the first.
    if (map.getVariableById(newValue)) {
      return newValue;
    }
    const name = newValue.trim();
    return name ? this.resolve(name) || null : null;
  }

  /**
   * Resolve the name JSON gave us, once the block is on a workspace.
   *
   * A field built from JSON has no workspace yet, so the name it was given
   * cannot be made into a variable until the block is initialised.
   */
  override initModel(): void {
    if (!this.getValue() && this.pending) {
      const id = this.resolve(this.pending);
      if (id) {
        this.setValue(id);
      }
    }
  }

  /** The editor opens on the NAME, not on the id behind it. */
  protected override getEditorText_(): string {
    return this.getText();
  }
}

/** The name a block's JSON asks for this field by. */
export const VARIABLE_NAME_FIELD = 'field_variable_name';

let registered = false;

/** Register the field, once — see `fields/scopedVariable` for why here. */
export function registerVariableNameField(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.fieldRegistry.register(
    VARIABLE_NAME_FIELD,
    VariableNameField as never,
  );
}
