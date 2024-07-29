/**
 * This is a modified version of `procedureDefMutator` from @blockly/block-shareable-procedures.
 * We removed compose() and decompose() methods. These methods automatically
 * add a gear icon UI that we do not want. A future version of the plugin will
 * export this mutator (and other extensions), but this will require bumping to
 * Blockly v10. We also updated the mutation and extra state methods to save the function's
 * description.
 * TODO: Once we are on Blockly v10, we can simplify this by importing `procedureDefMutator`
 * from @blockly/block-shareable-procedures and calling the duplicated methods inside our versions of them.
 * This will allow us to get rid of duplicated code.
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

export const procedureDefMutator = {
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

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    if (this.invisible) {
      container.setAttribute('invisible', 'true');
    }
    return container;
  },

  /**
   * Parse XML to restore the argument inputs.
   * Backwards compatible serialization implementation.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (this: ProcedureBlock, xmlElement: Element) {
    for (let i = 0; i < xmlElement.childNodes.length; i++) {
      const node = xmlElement.childNodes[i];
      const nodeName = node.nodeName.toLowerCase();
      if (nodeName === 'arg') {
        const varId = (node as Element).getAttribute('varid');
        this.getProcedureModel().insertParameter(
          new ObservableParameterModel(
            this.workspace,
            (node as Element).getAttribute('name') || '',
            undefined,
            varId || ''
          ),
          i
        );
      } else if (nodeName === 'description') {
        // CDO Blockly projects stored descriptions in a separate tag within the mutation.
        this.description = node.textContent;
      }
    }

    this.userCreated = readBooleanAttribute(
      xmlElement,
      'userCreated',
      FALSEY_DEFAULT
    );
    this.invisible = readBooleanAttribute(
      xmlElement,
      'invisible',
      FALSEY_DEFAULT
    );
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
    if (!this.description) {
      // Google Blockly projects store descriptions in a separate field.
      setBlockDescription(this, this.getFieldValue('DESCRIPTION'));
    }
  },

  /**
   * Returns a JSON serializable value which represents the extra state of the block.
   * @returns The state of this block, e.g. the parameters and statements.
   */
  saveExtraState: function (this: ProcedureBlock) {
    const state = Object.create(null);
    state['description'] = getBlockDescription(this);
    state['procedureId'] = this.getProcedureModel().getId();
    state['initialDeleteConfig'] = this.isDeletable();
    state['initialEditConfig'] = this.isEditable();
    state['initialMoveConfig'] = this.isMovable();
    state['userCreated'] = this.userCreated;
    state['invisible'] = this.invisible;

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
   * Accepts a JSON serializable state value and applies it to the block.
   * @param state The state to apply to this block (see saveExtraState above).
   */
  // TODO: define a better type for state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loadExtraState: function (this: ProcedureBlock, state: Record<string, any>) {
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
    if (!Blockly.useModalFunctionEditor) {
      this.setDeletable(state['initialDeleteConfig'] === false ? false : true);
      this.setEditable(state['initialEditConfig'] === false ? false : true);
      this.setMovable(state['initialMoveConfig'] === false ? false : true);
    }
    this.setStatements_(state['hasStatements'] === false ? false : true);
    this.userCreated = state['userCreated'];
    this.invisible = state['invisible'];
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
