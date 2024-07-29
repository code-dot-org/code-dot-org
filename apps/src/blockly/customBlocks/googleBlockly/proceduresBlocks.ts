import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';
import * as GoogleBlockly from 'blockly/core';
import {IProcedureModel} from 'blockly/core/procedures';
import {FlyoutItemInfoArray} from 'blockly/core/utils/toolbox';

import BlockSvgFrame from '@cdo/apps/blockly/addons/blockSvgFrame';
import CdoFieldButton from '@cdo/apps/blockly/addons/cdoFieldButton';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import {ExtendedWorkspaceSvg, ProcedureBlock} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {nameComparator} from '@cdo/apps/util/sort';

import procedureCallerOnChangeMixin from './mixins/procedureCallerOnChangeMixin';
import procedureCallerMutator from './mutators/procedureCallerMutator';
import {procedureDefMutator} from './mutators/procedureDefMutator';

const PARAMETERS_LABEL = 'PARAMETERS_LABEL';
/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
    // Block for defining a function (aka procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: BLOCK_TYPES.procedureDefinition,
    message0: '%1 %2 %3 %4',
    message1: '%1',
    args0: [
      {
        type: 'field_label',
        text: ' ',
      },
      {
        type: 'field_input',
        name: 'NAME',
        text: '',
        spellcheck: false,
      },
      {
        type: 'field_label',
        name: 'PARAMS',
        text: '',
      },
      {
        type: 'input_end_row',
        name: 'TOP',
      },
    ],
    args1: [
      {
        type: 'input_statement',
        name: 'STACK',
      },
    ],
    style: 'procedure_blocks',
    helpUrl: '/docs/spritelab/codestudio_definingFunction',
    extensions: [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_def_set_no_return_helper',
      'procedures_block_frame',
      'procedure_def_mini_toolbox',
      'modal_procedures_no_destroy',
      'procedure_def_no_gray_out',
      'procedure_def_get_info',
    ],
    mutator: 'procedure_def_mutator',
  },
  {
    // Block for calling a procedure with no return value.
    type: BLOCK_TYPES.procedureCall,
    message0: '%1 %2',
    args0: [
      {type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}'},
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    nextStatement: null,
    previousStatement: null,
    style: 'procedure_blocks',
    helpUrl: '/docs/spritelab/codestudio_callingFunction',
    extensions: [
      'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'procedure_callernoreturn_get_def_block_mixin',
      'procedure_call_do_update',
    ],
    mutator: 'procedure_caller_mutator',
  },
  {
    type: 'parameters_get',
    message0: '%1',
    args0: [
      {
        type: 'field_parameter',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
      },
    ],
    output: null,
    style: 'sprite_blocks',
    extensions: ['contextMenu_variableSetterGetter'],
  },
]);

// Respond to the click of a call block's edit button
export const editButtonHandler = function (this: CdoFieldButton) {
  const procedure = (
    this.getSourceBlock() as ProcedureBlock
  )?.getProcedureModel();
  if (procedure) {
    Blockly.functionEditor.showForFunction(
      procedure as ObservableProcedureModel
    );
  }
};

// This extension adds an edit button to the end of a procedure call block.
GoogleBlockly.Extensions.register(
  'procedures_edit_button',
  function (this: ProcedureBlock) {
    // Edit buttons are used to open the modal editor. The button is appended to the last input.
    // If we are in the modal function editor, don't add the button, due to an issue with Blockly
    // not being able to handle us clearing the block right after it has been clicked.
    if (
      Blockly.useModalFunctionEditor &&
      this.inputList.length &&
      !this.workspace.isFlyout &&
      toolboxConfigurationSupportsEditButton(this) &&
      !Blockly.isEmbeddedWorkspace(this.workspace)
    ) {
      const button = new Blockly.FieldButton({
        value: commonI18n.edit(),
        onClick: editButtonHandler,
        colorOverrides: {button: 'blue', text: 'white'},
        allowReadOnlyClick: true, // We support showing the editor even if viewing in read only mode.
      });
      button.EDITABLE = false;
      button.SERIALIZABLE = false;
      this.inputList[this.inputList.length - 1].appendField(button, 'EDIT');
    }
  }
);

// This extension renders function and behavior definitions as mini toolboxes
// The only toolbox blocks are a comment (for functions) or a comment + "this sprite" block (for behaviors)
GoogleBlockly.Extensions.register(
  'procedure_def_mini_toolbox',
  function (this: ProcedureBlock) {
    const miniToolboxBlocks = [];
    switch (this.type) {
      case BLOCK_TYPES.behaviorDefinition:
        miniToolboxBlocks.push(BLOCK_TYPES.spriteParameterGet);
        break;
      case BLOCK_TYPES.procedureDefinition:
        if (Blockly.enableParamEditing) {
          miniToolboxBlocks.push(BLOCK_TYPES.parametersGet);
        }
        break;
    }

    if (!miniToolboxBlocks.length) {
      return;
    }

    const renderToolboxBeforeStack = true;
    const flyoutToggleButton = Blockly.customBlocks.initializeMiniToolbox.bind(
      this
    )(undefined, renderToolboxBeforeStack);
    const renderingInFunctionEditor = true;
    Blockly.customBlocks.appendMiniToolboxToggle.bind(this)(
      miniToolboxBlocks,
      flyoutToggleButton,
      renderingInFunctionEditor
    );
    // Open mini-toolbox by default
    flyoutToggleButton.setIcon(false);
    // If we added a flyout, place a 'Parameters' label before it.
    const flyoutInput = this.getInput('flyout_input');
    if (flyoutInput) {
      flyoutInput.insertFieldAt(
        0,
        new Blockly.FieldLabel(commonI18n.parameters(), PARAMETERS_LABEL)
      );
    }
  }
);

// Adds an SVG frame to procedure definition blocks when they're on the main workspace.
// Not used in Music Lab, the editor workspace, or embedded workspaces.
// Note: The workspace frame used in the modal function editor is added there.
GoogleBlockly.Extensions.register(
  'procedures_block_frame',
  function (this: ProcedureBlock) {
    if (
      this.workspace === Blockly.getMainWorkspace() &&
      !(this.workspace as ExtendedWorkspaceSvg).noFunctionBlockFrame
    ) {
      const getColor = () => {
        return Blockly.cdoUtils.getBlockColor(this);
      };
      this.functionalSvg_ = new BlockSvgFrame(
        this,
        commonI18n.function(),
        'blocklyFunctionalFrame',
        getColor
      );

      this.setOnChange(function (this: ProcedureBlock) {
        if (!this.isInFlyout) {
          this.functionalSvg_?.render();
        }
      });
    }
  }
);

// Override the destroy function to not destroy the procedure if we're using the
// modal function editor. We need to do this so that when we clear its workspace
// we don't remove the procedure from the procedure map. Insertion markers also
// get this destroy function and they should not cause us to delete a procedure
// either.
GoogleBlockly.Extensions.register(
  'modal_procedures_no_destroy',
  function (this: ProcedureBlock) {
    const originalDestroy = this.destroy?.bind(this);
    const mixin = {
      destroy: function (this: ProcedureBlock) {
        if (!Blockly.useModalFunctionEditor && !this.isInsertionMarker()) {
          originalDestroy?.();
        }
      },
    };
    // We can't register this as a mixin since we're overwriting existing methods
    Object.assign(this, mixin);
  }
);

// Override the doProcedureUpdate function to heal the stack. Without this,
// any child blocks connected to a call block would also get deleted.
// Copied directly from
// https://github.com/BeksOmega/blockly-samples/blob/7954a8fff50e41fa7c0f891e957bf9ed616361d6/plugins/block-shareable-procedures/src/blocks.ts#L1068
GoogleBlockly.Extensions.register(
  'procedure_call_do_update',
  function (this: ProcedureBlock) {
    const mixin = {
      /**
       * Adds or removes the parameter label to match the state of the data model.
       * No-op to avoid adding "with:" label to the block.
       */
      addParametersLabel__: function () {},

      /**
       * Updates the shape of this block to reflect the state of the data model.
       */
      doProcedureUpdate: function (this: ProcedureBlock) {
        if (!this.getProcedureModel()) return;
        const id = this.getProcedureModel().getId();
        if (!this.getTargetWorkspace_().getProcedureMap().has(id)) {
          this.dispose(/* Begin Customization*/ true /* End Customization*/);
          return;
        }
        this.updateName_();
        this.updateEnabled_();
        this.updateParameters_();
      },
      /**
       * Returns the data model for this procedure block, or finds it if it has not been set.
       *
       * @returns The data model for this procedure block.
       */
      getProcedureModel: function (
        this: ProcedureBlock
      ): IProcedureModel | null {
        if (!this.model_) {
          this.model_ = this.findProcedureModel_(
            this.getFieldValue('NAME'),
            this.paramsFromSerializedState_
          );
        }
        return this.model_;
      },

      /**
       * Makes sure that if we are updating the parameters before any move events
       * have happened, the args map records the current state of the block. Does
       * not remove entries from the array, since blocks can be disconnected
       * temporarily during mutation (which triggers this method).
       */
      syncArgsMap_: function (this: ProcedureBlock) {
        // If we haven't yet stored the previous parameters, do so now. This would
        // normally happen when we or initialize the procedure block with a model
        // or update its parameters.
        if (!this.prevParams_.length) {
          this.prevParams_ = [
            ...(this.getProcedureModel().getParameters() || []),
          ];
        }
        // Original code from shareable procedures plugin follows unmodified:
        for (const [i, p] of this.prevParams_.entries()) {
          const target = this.getInputTargetBlock(`ARG${i}`);
          if (target) this.argsMap_.set(p.getId(), target);
        }
      },
    };
    // We can't register this as a mixin since we're overwriting existing methods
    Object.assign(this, mixin);
  }
);

// TODO: After updating to Blockly v10, remove this local copy of
// procedureDefMutator and instead modify the imported mutator directly.
// Our local copy has the compose() and decompose() methods removed.
GoogleBlockly.Extensions.unregister('procedure_def_mutator');
GoogleBlockly.Extensions.registerMutator(
  'procedure_def_mutator',
  procedureDefMutator
);

// TODO: After updating to Blockly v10, use the original
// procedure_caller_mutator and procedure_caller_on_change_mixin.
// https://codedotorg.atlassian.net/browse/CT-148
GoogleBlockly.Extensions.unregister('procedure_caller_mutator');
GoogleBlockly.Extensions.registerMutator(
  'procedure_caller_mutator',
  procedureCallerMutator
);

GoogleBlockly.Extensions.unregister('procedure_caller_onchange_mixin');
GoogleBlockly.Extensions.registerMixin(
  'procedure_caller_onchange_mixin',
  procedureCallerOnChangeMixin
);

// Labs like Maze and Artist turn undeletable blocks gray. This is not
// done for special blocks like "when run" or procedure definitions.
GoogleBlockly.Extensions.registerMixin('procedure_def_no_gray_out', {
  shouldBeGrayedOut: function () {
    return false;
  },
});

// Used for giving feedback about empty function definition blocks.
GoogleBlockly.Extensions.registerMixin('procedure_def_get_info', {
  getProcedureInfo: function () {
    return {
      name: this.getFieldValue('NAME'),
      callType: this.callType_,
    };
  },
});

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of block objects representing the flyout blocks
 */
export function flyoutCategory(
  workspace: GoogleBlockly.WorkspaceSvg,
  functionEditorOpen = false
) {
  const blockList: FlyoutItemInfoArray = [];

  // Note: Blockly.Msg was undefined when this code was extracted into global scope
  const functionDefinitionBlock = {
    kind: 'block',
    type: BLOCK_TYPES.procedureDefinition,
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
    extraState: {
      userCreated: true,
    },
  };

  if (functionEditorOpen) {
    // No-op - cannot create new functions while the modal editor is open
  } else if (Blockly.useModalFunctionEditor) {
    const newFunctionButton = getNewFunctionButtonWithCallback(workspace);
    blockList.push(newFunctionButton);
  } else {
    blockList.push(functionDefinitionBlock);
  }

  // Workspaces to populate functions flyout category from
  const workspaces = [
    Blockly.getMainWorkspace(),
    Blockly.getHiddenDefinitionWorkspace(),
  ];

  const allFunctions: GoogleBlockly.serialization.procedures.State[] = [];
  workspaces.forEach(workspace => {
    const procedureBlocks = (
      workspace.getTopBlocks() as ProcedureBlock[]
    ).filter(block => block.type === BLOCK_TYPES.procedureDefinition);

    procedureBlocks.forEach(block => {
      allFunctions.push(
        Blockly.serialization.procedures.saveProcedure(
          block.getProcedureModel()
        )
      );
    });
  });

  allFunctions.sort(nameComparator).forEach(({name, id, parameters}) => {
    blockList.push({
      kind: 'block',
      type: BLOCK_TYPES.procedureCall,
      extraState: {
        name: name,
        id: id,
        params: parameters?.map(param => param.name),
      },
    });
  });

  return blockList;
}

const getNewFunctionButtonWithCallback = (
  workspace: GoogleBlockly.WorkspaceSvg
) => {
  const callbackKey = 'newProcedureCallback';
  const callback = () => {
    workspace.hideChaff();
    Blockly.functionEditor.newProcedureCallback(
      BLOCK_TYPES.procedureDefinition
    );
  };

  workspace.registerButtonCallback(callbackKey, callback);

  return {
    kind: 'button',
    text: commonI18n.createBlocklyFunction(),
    callbackKey,
  };
};

/**
 * We always show the edit button for function callers, but
 * conditionally show it for behavior callers and pickers.
 * For behavior callers and pickers we only show the edit button
 * if there is a categorized toolbox or no toolbox.
 * The reason for this is renaming behaviors without the behavior
 * category (which can be repopulated after renaming) causes
 * confusing behavior.
 * @param {Block} block Block to check
 * @returns boolean
 */
export const toolboxConfigurationSupportsEditButton = (
  block: GoogleBlockly.Block
) => {
  if (block.type === BLOCK_TYPES.procedureCall) {
    return true;
  } else {
    // block is a behavior caller or picker.
    const workspace = block.workspace as ExtendedWorkspaceSvg;
    // A non-svg workspace does not have getToolbox() and getFlyout() methods.
    const hasCategorizedToolbox =
      workspace.getToolbox !== undefined && !!workspace.getToolbox();
    const hasUncategorizedToolbox =
      workspace.getFlyout !== undefined && !!workspace.getFlyout();
    // We show the edit button for levels with a categorized toolbox or no toolbox.
    // We do not show it for uncategorized toolboxes because renaming behaviors
    // without the behavior category causes confusing behavior.
    return (
      hasCategorizedToolbox ||
      (!hasCategorizedToolbox && !hasUncategorizedToolbox)
    );
  }
};
