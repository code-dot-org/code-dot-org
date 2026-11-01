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
// and the workspace serialises it. What it shows and edits is the NAME, and
// the variable is this binding's own (`resolve`).

import * as Blockly from 'blockly/core';

import {isLet, moveReaders} from '../letBinding';
import {bindingCount, isRedeclaration, visibleNamed} from '../variableScope';

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
   * The variable a name typed here gives.
   *
   * A binding owns its variable (specs/VARIABLE_OWNERSHIP_PLAN.md). A `let`
   * naming one already visible joins it, and the readers below follow; any
   * other name renames this binding's own variable, or makes it one if it
   * shares its variable with another binding.
   */
  private resolve(name: string): string {
    const block = this.getSourceBlock();
    const workspace = block?.workspace;
    // Nothing from the flyout: a toolbox block's default name would otherwise
    // be made on the workspace before anything was dragged out.
    if (!block || !workspace || block.isInFlyout) {
      return '';
    }
    const map = workspace.getVariableMap();
    const held = this.variable();
    const heldId = held?.getId();
    if (isLet(block)) {
      const joined = visibleNamed(block, name, this.variableType);
      if (joined) {
        if (heldId && heldId !== joined) {
          moveReaders(block, heldId, joined);
        }
        return joined;
      }
    }
    if (
      held &&
      held.getType() === this.variableType &&
      bindingCount(workspace, held.getId()) <= 1 &&
      !(isLet(block) && isRedeclaration(block))
    ) {
      map.renameVariable(held, name);
      return held.getId();
    }
    return map.createVariable(name, this.variableType).getId();
  }

  /** The name and flavour too, when asked, so a paste elsewhere can make it. */
  override saveState(doFullSerialization?: boolean): unknown {
    const variable = this.variable();
    if (!doFullSerialization || !variable) {
      return super.saveState(doFullSerialization);
    }
    return {
      id: variable.getId(),
      name: variable.getName(),
      type: variable.getType(),
    };
  }

  override loadState(state: unknown): void {
    if (state && typeof state === 'object') {
      this.setValue(state as never);
      return;
    }
    super.loadState(state);
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
