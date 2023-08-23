/**
 * Most of this logic is copied from `procedureDefMutator` from @blockly/block-shareable-procedures.
 * As in our local copy of `procedureDefMutator`, the compose() and decompose() methods
 * have been removed to avoid rendering a gear icon that we do not want. In addition,
 * the domToMutation(), saveExtraState(), and loadExtraState() methods have been customized
 * to handle the behaviorId attribute. A future version of the shareable-procedures plugin will
 * export the `procedureDefMutator` (and other extensions), but using it will require bumping to Blockly v10.
 * TODO: Once we are on Blockly v10, we can remove our local `procedureDefMutator`, but our
 * `behaviorDefMutator` file might need to stick around.
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

export const behaviorDefMutator = {
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
   * Parse XML to set static behavior id, used for shared behaviors.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.behaviorId = xmlElement.nextElementSibling.getAttribute('id');
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of this block, eg the parameters and statements.
   */
  saveExtraState: function () {
    const state = Object.create(null);
    state['procedureId'] = this.getProcedureModel().getId();
    state['behaviorId'] = this.behaviorId;

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
    this.behaviorId = state['behaviorId'];
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
          new ObservableParameterModel(this.workspace, name, paramId, id), //, type),
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
