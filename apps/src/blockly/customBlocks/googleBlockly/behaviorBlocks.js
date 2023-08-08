import * as GoogleBlockly from 'blockly/core';
import BlockSvgFrame from '../../addons/blockSvgFrame';
import msg from '@cdo/locale';
import {CdoParameterModel} from './mutators/parameterModel';
import {
  createAndCenterNewDefBlock,
  sortProceduresByName,
} from './proceduresBlocks';
import {convertXmlToJson} from '../../addons/cdoSerializationHelpers';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;
/**
 * A dictionary of our custom procedure block definitions, used across labs.
 * Replaces blocks that are part of core Blockly.
 * @type {!Object<string, Object>}
 */
export const blocks = GoogleBlockly.common.createBlockDefinitionsFromJsonArray([
  {
    // Block for defining a behavior (a type of procedure) with no return value.
    // When using the modal function editor, the name field is an uneditable label.
    type: 'behavior_definition',
    message0: '%1 %2 %3 %4',
    message1: '%1',
    args0: [
      {
        type: 'field_label',
        text: ' ',
      },
      {
        type: useModalFunctionEditor ? 'field_label' : 'field_input',
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
        type: 'input_dummy',
        name: 'TOP',
      },
    ],
    args1: [
      {
        type: 'input_statement',
        name: 'STACK',
      },
    ],
    style: 'behavior_blocks',
    helpUrl: '%{BKY_PROCEDURES_DEFNORETURN_HELPURL}',
    tooltip: '%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}',
    extensions: [
      'procedure_def_get_def_mixin',
      'procedure_def_var_mixin',
      'procedure_def_update_shape_mixin',
      'procedure_def_context_menu_mixin',
      'procedure_def_onchange_mixin',
      'procedure_def_validator_helper',
      'procedure_defnoreturn_get_caller_block_mixin',
      'procedure_defnoreturn_set_comment_helper',
      'procedure_def_set_no_return_helper',
      'behaviors_block_frame',
      'behavior_add_this_sprite_param',
    ],
    mutator: 'procedure_def_mutator',
  },
  {
    type: 'gamelab_behavior_get',
    message0: '%1 %2',
    args0: [
      {type: 'field_label', name: 'NAME', text: '%{BKY_UNNAMED_KEY}'},
      {
        type: 'input_dummy',
        name: 'TOPROW',
      },
    ],
    output: 'Behavior',
    style: 'behavior_blocks',
    helpUrl: '%{BKY_PROCEDURES_CALLNORETURN_HELPURL}',
    extensions: [
      'procedures_edit_button',
      'procedure_caller_get_def_mixin',
      'procedure_caller_var_mixin',
      'procedure_caller_update_shape_mixin',
      'procedure_caller_context_menu_mixin',
      'procedure_caller_onchange_mixin',
      'procedure_callernoreturn_get_def_block_mixin',
      'behavior_update_params_mixin',
    ],
    mutator: 'behavior_get_mutator',
  },
  {
    type: 'sprite_parameter_get',
    message0: '%1',
    args0: [
      {
        type: 'field_label',
        name: 'VAR',
        variable: '%{BKY_VARIABLES_DEFAULT_NAME}',
        text: msg.thisSprite(),
      },
    ],
    output: 'Sprite',
    style: 'sprite_blocks',
    helpUrl: '%{BKY_VARIABLES_GET_HELPURL}',
    tooltip: '%{BKY_VARIABLES_GET_TOOLTIP}',
    extensions: ['contextMenu_variableSetterGetter'],
  },
]);

// This extension adds an SVG frame around behavior definition blocks.
// Not used when the modal function is enabled.
GoogleBlockly.Extensions.register('behaviors_block_frame', function () {
  if (!useModalFunctionEditor && !this.workspace.noFunctionBlockFrame) {
    this.functionalSvg_ = new BlockSvgFrame(
      this,
      msg.behaviorEditorHeader(),
      'blocklyFunctionalFrame'
    );

    this.setOnChange(function () {
      if (!this.isInFlyout) {
        this.functionalSvg_.render(this.svgGroup_, this.RTL);
      }
    });
  }
});

const behaviorGetMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Returns the state of this block as a JSON serializable object.
   * @returns The state of
   *     this block, ie the params and procedure name.
   */
  saveExtraState: function () {
    const state = Object.create(null);
    const model = this.getProcedureModel();
    if (!model) return state;
    state['name'] = model.getName();
    if (model.getParameters().length) {
      state['params'] = model.getParameters().map(p => p.getName());
    }
    return state;
  },
  /**
   * Applies the given state to this block.
   * @param state The state to apply to this block, ie the params and
   *     procedure name.
   */
  loadExtraState: function (state) {
    this.deserialize_(state['name'], state['params'] || []);
  },
  /**
   * Applies the given name and params from the serialized state to the block.
   * @param name The name to apply to the block.
   * @param params The parameters to apply to the block.
   */
  deserialize_: function (name, params) {
    this.setFieldValue(name, 'NAME');
    if (!this.model_) this.model_ = this.findProcedureModel_(name, params);
    if (this.getProcedureModel()) {
      this.initBlockWithProcedureModel_();
    } else {
      // Create inputs based on the mutation so that children can be connected.
      this.createArgInputs_(params);
    }
    this.paramsFromSerializedState_ = params;
  },
};

GoogleBlockly.Extensions.registerMutator(
  'behavior_get_mutator',
  behaviorGetMutator
);

const behaviorAddThisSpriteParam = function () {
  if (this.workspace.rendered && !this.workspace.isFlyout) {
    if (!this.getProcedureModel().getParameters().length) {
      this.getProcedureModel().insertParameter(
        new CdoParameterModel(
          this.workspace,
          msg.thisSprite(),
          undefined,
          undefined,
          'Sprite'
        ),
        0
      );
    }
  }

  this.doProcedureUpdate();
};

GoogleBlockly.Extensions.register(
  'behavior_add_this_sprite_param',
  behaviorAddThisSpriteParam
);

const behaviorUpdateParamsMixin = {
  /**
   * No-ops updateParameters_ so that behavior_get blocks do not have argument inputs.
   * @override
   */
  updateParameters_: function () {},
};

GoogleBlockly.Extensions.registerMixin(
  'behavior_update_params_mixin',
  behaviorUpdateParamsMixin
);

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of XML block elements
 */
export function flyoutCategory(workspace) {
  const blockList = [];

  const newBehaviorButton = {
    kind: 'button',
    text: msg.createBlocklyBehavior(),
    callbackKey: 'createNewBehavior',
  };

  const behaviorDefinitionBlock = {
    kind: 'block',
    type: 'behavior_definition',
    fields: {
      NAME: Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE,
    },
  };

  const createNewBehavior = function () {
    // Everything here is place-holder code that should be replaced with a
    // call to open the behavior editor with a new defintion block.
    // Until then, we just create a block under all existing blocks on the
    // main workspace.

    createAndCenterNewDefBlock(behaviorDefinitionBlock);
  };
  if (useModalFunctionEditor) {
    workspace.registerButtonCallback('createNewBehavior', createNewBehavior);
    blockList.push(newBehaviorButton);
  } else {
    blockList.push(behaviorDefinitionBlock);
  }
  blockList.push(...getCustomCategoryBlocksForFlyout('Behavior'));
  const allWorkspaceProcedures = Blockly.procedureSerializer.save(
    Blockly.getMainWorkspace()
  );
  let allWorkspaceBehaviors = [];
  if (allWorkspaceProcedures) {
    allWorkspaceBehaviors = allWorkspaceProcedures.filter(procedure =>
      procedureIsBehavior(procedure)
    );
  }

  allWorkspaceBehaviors.sort(sortProceduresByName).forEach(procedure => {
    blockList.push({
      kind: 'block',
      type: 'gamelab_behavior_get',
      extraState: {
        name: procedure.name,
        params: [msg.thisSprite()],
      },
      fields: {
        NAME: procedure.name,
      },
    });
  });

  return blockList;
}

// Helper function to check if a procedure is a behavior.
// Currently, this just looks for a "this sprite" parameter.
function procedureIsBehavior(procedure) {
  return (
    procedure.parameters &&
    procedure.parameters.some(param => param.name === msg.thisSprite())
  );
}

function getCustomCategoryBlocksForFlyout(category) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(Blockly.toolboxBlocks, 'text/xml');

  const categoryNodes = xmlDoc.getElementsByTagName('category');
  for (const categoryNode of categoryNodes) {
    const categoryCustom = categoryNode.getAttribute('custom');

    if (categoryCustom === category) {
      const xmlRootElement = xmlDoc.createElement('xml'); // Create a new <xml> root element

      const blockNodes = categoryNode.getElementsByTagName('block');
      for (const blockNode of blockNodes) {
        if (blockNode.parentElement === categoryNode) {
          xmlRootElement.appendChild(blockNode.cloneNode(true)); // Append cloned block nodes
        }
      }

      const jsonBlocks = convertXmlToJson(xmlRootElement);

      const flyoutBlocks = jsonBlocks.blocks.blocks.map(block =>
        simplifyBlockStateForFlyout(block)
      );
      return flyoutBlocks; // Return the new <xml> root element with block children
    }
  }

  return null; // Return null if the desired category is not found
}

// Used to simplify block state for inclusion in the Behaviors category flyout.
function simplifyBlockStateForFlyout(block) {
  // Clone the original block object to avoid modifying it directly
  const modifiedBlock = {...block};

  // Remove id, x, and y properties
  delete modifiedBlock.id;
  delete modifiedBlock.x;
  delete modifiedBlock.y;

  // Add kind property with value 'block'
  modifiedBlock.kind = 'block';

  return modifiedBlock;
}
