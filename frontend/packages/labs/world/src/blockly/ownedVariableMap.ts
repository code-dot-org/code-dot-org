// A workspace's variables, where two may share a name.
//
// A name in this language belongs to the binding that gives it — a `let`, a
// loop, an event hat, a member's head — and two bindings may give the same
// one (specs/VARIABLE_OWNERSHIP_PLAN.md). Blockly's own store holds one
// variable per name and type: it refuses a second, and renaming one to a
// name another holds merges the two. This keeps everything else Blockly's.

import * as Blockly from 'blockly/core';

type Variable = Blockly.IVariableModel<Blockly.IVariableState>;

export class OwnedVariableMap extends Blockly.VariableMap {
  /** A new variable, whatever names the others have. */
  override createVariable(name: string, type?: string, id?: string): Variable {
    const held = id ? this.getVariableById(id) : null;
    if (held) {
      if (held.getName() !== name || held.getType() !== (type ?? '')) {
        throw new Error(`Variable id "${id}" is already in use.`);
      }
      return held;
    }
    const Model = Blockly.registry.getClassFromOptions(
      Blockly.registry.Type.VARIABLE_MODEL,
      this.workspace.options,
      true,
    );
    if (!Model) {
      throw new Error('No variable model is registered.');
    }
    const variable = new Model(
      this.workspace,
      name,
      type ?? '',
      id ?? Blockly.utils.idGenerator.genUid(),
    );
    this.addVariable(variable);
    if (!this.potentialMap) {
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.VAR_CREATE))(variable),
      );
    }
    return variable;
  }

  /** This one variable renamed, and only its own uses redrawn. Never a merge. */
  override renameVariable(variable: Variable, name: string): Variable {
    if (variable.getName() === name) {
      return variable;
    }
    const blocks = this.workspace.getAllBlocks(false);
    const group = this.potentialMap ? '' : Blockly.Events.getGroup();
    if (!this.potentialMap && !group) {
      Blockly.Events.setGroup(true);
    }
    try {
      if (!this.potentialMap) {
        Blockly.Events.fire(
          new (Blockly.Events.get(Blockly.Events.VAR_RENAME))(variable, name),
        );
      }
      variable.setName(name);
      for (const block of blocks) {
        block.updateVarName(variable);
      }
    } finally {
      if (!this.potentialMap) {
        Blockly.Events.setGroup(group);
      }
    }
    return variable;
  }
}

let registered = false;

/** Make it every workspace's store. Overwrites, since the class is the same class. */
export function registerOwnedVariableMap(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.registry.register(
    Blockly.registry.Type.VARIABLE_MAP,
    Blockly.registry.DEFAULT,
    OwnedVariableMap,
    true,
  );
}
