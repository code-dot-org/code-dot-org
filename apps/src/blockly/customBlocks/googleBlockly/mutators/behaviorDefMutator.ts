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

import {
  ObservableParameterModel,
  isProcedureBlock,
} from '@blockly/block-shareable-procedures';
import {Block} from 'blockly';

import {ProcedureBlock} from '@cdo/apps/blockly/types';
import {FALSEY_DEFAULT, readBooleanAttribute} from '@cdo/apps/blockly/utils';

import {
  getBlockDescription,
  setBlockDescription,
} from './functionMutatorHelpers';

export const behaviorDefMutator = {
  hasStatements_: true,

  /**
   * Create XML to represent the argument inputs.
   * Backwards compatible serialization implementation.
   * @returns XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function (this: ProcedureBlock) {
    const container = Blockly.utils.xml.createElement('mutation');
    const params =
      this.getProcedureModel().getParameters() as ObservableParameterModel[];
    for (let i = 0; i < params.length; i++) {
      const parameter = Blockly.utils.xml.createElement('arg');
      const varModel = params[i].getVariableModel();
      parameter.setAttribute('name', varModel.name);
      parameter.setAttribute('varid', varModel.getId());
      container.appendChild(parameter);
    }

    if (this.behaviorId) {
      container.setAttribute('behaviorId', this.behaviorId);
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
  domToMutation: function (this: ProcedureBlock, xmlElement: Element) {
    // We do not copy parameters because behavior parameters are a special case.
    // We manually create the "this sprite" parameter for each behavior,
    // (and don't want to treat it as a Blockly parameter).
    // We also know all behaviors have the same single parameter,
    // so we don't need to copy the parameter over.
    for (let i = 0; i < xmlElement.childNodes.length; i++) {
      const node = xmlElement.childNodes[i];
      const nodeName = node.nodeName.toLowerCase();
      if (nodeName === 'description') {
        // CDO Blockly projects stored descriptions in a separate tag within the mutation.
        this.description = node.textContent;
      }
    }
    this.behaviorId =
      xmlElement.getAttribute('behaviorId') ||
      xmlElement.nextElementSibling?.getAttribute('id');
    this.userCreated = readBooleanAttribute(
      xmlElement,
      'userCreated',
      FALSEY_DEFAULT
    );
    if (!this.description) {
      // Google Blockly projects store descriptions in a separate field.
      setBlockDescription(this, this.getFieldValue('DESCRIPTION'));
    }
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of this block, eg the parameters and statements.
   */
  saveExtraState: function (this: ProcedureBlock) {
    const state = Object.create(null);
    state['procedureId'] = this.getProcedureModel().getId();
    state['behaviorId'] = this.behaviorId;
    state['userCreated'] = this.userCreated;
    state['description'] = getBlockDescription(this);

    const params =
      this.getProcedureModel().getParameters() as ObservableParameterModel[];
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
  // TODO: define a better type for state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadExtraState: function (this: ProcedureBlock, state: Record<string, any>) {
    this.behaviorId = state['behaviorId'];
    this.userCreated = state['userCreated'];
    const map = this.workspace.getProcedureMap();
    const procedureId = state['procedureId'];
    const procedureFromMap = map.get(procedureId);
    if (
      procedureId &&
      procedureId !== this.model_.getId() &&
      procedureFromMap &&
      (this.isInsertionMarker() || this.noBlockHasClaimedModel_(procedureId))
    ) {
      if (map.has(this.model_.getId())) {
        map.delete(this.model_.getId());
      }
      this.model_ = procedureFromMap;
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

    setBlockDescription(this, state['description']);
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
  noBlockHasClaimedModel_(this: ProcedureBlock, procedureId: string) {
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
  deleteParamsFromModel_: function (
    this: ProcedureBlock,
    containerBlock: Block
  ) {
    const ids = new Set(
      containerBlock.getDescendants(/*ordered*/ false).map(b => b.id)
    );
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
  renameParamsInModel_: function (this: ProcedureBlock, containerBlock: Block) {
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
  addParamsToModel_: function (this: ProcedureBlock, containerBlock: Block) {
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
