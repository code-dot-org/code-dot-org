/**
 * This is a direct copy of `procedureDefMutator` from @blockly/block-shareable-procedures
 * with the compose() and decompose() methods removed. These methods automatically
 * add a gear icon UI that we do not want. A future version of the plugin will
 * export this mutator (and other extensions), but this will require bumping to
 * Blockly v10.
 * TODO: Once we are on Blockly v10, remove this file.
 */

import {ObservableParameterModel} from '@blockly/block-shareable-procedures';

/**
 * A type guard which checks if the given block is a procedure block.
 * @param block The block to check for procedure-y-ness.
 * @returns Whether this block is a procedure block or not.
 */
function isProcedureBlock(block) {
  return (
    block.getProcedureModel !== undefined &&
    block.doProcedureUpdate !== undefined &&
    block.isProcedureDef !== undefined
  );
}

export const procedureDefMutator = {
  hasStatements_: true,

  /**
   * Create XML to represent the argument inputs.
   * Backwards compatible serialization implementation.
   * @returns XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement('mutation');
    const params = this.getProcedureModel().getParameters();
    for (let i = 0; i < params.length; i++) {
      const parameter = Blockly.utils.xml.createElement('arg');
      const varModel = params[i].getVariableModel();
      parameter.setAttribute('name', varModel.name);
      parameter.setAttribute('varid', varModel.getId());
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },

  /**
   * Parse XML to restore the argument inputs.
   * Backwards compatible serialization implementation.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    for (let i = 0; i < xmlElement.childNodes.length; i++) {
      const node = xmlElement.childNodes[i];
      if (node.nodeName.toLowerCase() !== 'arg') continue;
      const varId = node.getAttribute('varid');
      this.getProcedureModel().insertParameter(
        new ObservableParameterModel(
          this.workspace,
          node.getAttribute('name'),
          undefined,
          varId
        ),
        i
      );
    }
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of this block, eg the parameters and statements.
   */
  saveExtraState: function () {
    const state = Object.create(null);
    state['procedureId'] = this.getProcedureModel().getId();

    const params = this.getProcedureModel().getParameters();
    if (!params.length && this.hasStatements_) return state;

    if (params.length) {
      state['params'] = params.map(p => {
        return {
          name: p.getName(),
          id: p.getVariableModel().getId(),
          // Ideally this would be id, and the other would be varId,
          // but backwards compatibility :/
          paramId: p.getId(),
        };
      });
    }
    if (!this.hasStatements_) {
      state['hasStatements'] = false;
    }
    return state;
  },

  /**
   * Applies the given state to this block.
   * @param state The state to apply to this block, eg the parameters and
   *     statements.
   */
  loadExtraState: function (state) {
    const map = this.workspace.getProcedureMap();
    const procedureId = state['procedureId'];
    if (
      procedureId &&
      procedureId !== this.model_.getId() &&
      map.has(procedureId) &&
      (this.isInsertionMarker() || this.noBlockHasClaimedModel_(procedureId))
    ) {
      if (map.has(this.model_.getId())) {
        map.delete(this.model_.getId());
      }
      this.model_ = map.get(procedureId);
    }

    if (state['params'] && !this.getProcedureModel().getParameters().length) {
      for (let i = 0; i < state['params'].length; i++) {
        const {name, id, paramId} = state['params'][i];
        this.getProcedureModel().insertParameter(
          new ObservableParameterModel(this.workspace, name, paramId, id),
          i
        );
      }
    }

    this.doProcedureUpdate();
    this.setStatements_(state['hasStatements'] === false ? false : true);
  },

  /**
   * Returns true if there is no definition block currently associated with the
   * given procedure ID. False otherwise.
   * @param procedureId The ID of the procedure to check for a claiming
   *     block.
   * @returns True if there is no definition block currently associated
   *     with the given procedure ID. False otherwise.
   */
  noBlockHasClaimedModel_(procedureId) {
    const model = this.workspace.getProcedureMap().get(procedureId);
    return this.workspace
      .getAllBlocks(false)
      .every(
        b =>
          !isProcedureBlock(b) ||
          !b.isProcedureDef() ||
          b.getProcedureModel() !== model
      );
  },

  /**
   * Deletes any parameters from the procedure model that do not have associated
   * parameter blocks in the mutator.
   * @param containerBlock Root block in the mutator.
   */
  deleteParamsFromModel_: function (containerBlock) {
    const ids = new Set(containerBlock.getDescendants().map(b => b.id));
    const model = this.getProcedureModel();
    const count = model.getParameters().length;
    for (let i = count - 1; i >= 0; i--) {
      if (!ids.has(model.getParameter(i).getId())) {
        model.deleteParameter(i);
      }
    }
  },

  /**
   * Renames any parameters in the procedure model whose associated parameter
   * blocks have been renamed.
   * @param containerBlock Root block in the mutator.
   */
  renameParamsInModel_: function (containerBlock) {
    const model = this.getProcedureModel();

    let i = 0;
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      const param = model.getParameter(i);
      if (
        param &&
        param.getId() === paramBlock.id &&
        param.getName() !== paramBlock.getFieldValue('NAME')
      ) {
        param.setName(paramBlock.getFieldValue('NAME'));
      }
      paramBlock =
        paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
      i++;
    }
  },

  /**
   * Adds new parameters to the procedure model for any new procedure parameter
   * blocks.
   * @param containerBlock Root block in the mutator.
   */
  addParamsToModel_: function (containerBlock) {
    const model = this.getProcedureModel();

    let i = 0;
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock && !paramBlock.isInsertionMarker()) {
      if (
        !model.getParameter(i) ||
        model.getParameter(i).getId() !== paramBlock.id
      ) {
        model.insertParameter(
          new ObservableParameterModel(
            this.workspace,
            paramBlock.getFieldValue('NAME'),
            paramBlock.id
          ),
          i
        );
      }
      paramBlock =
        paramBlock.nextConnection && paramBlock.nextConnection.targetBlock();
      i++;
    }
  },
};
