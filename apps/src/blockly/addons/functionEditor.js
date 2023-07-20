import xml from '@cdo/apps/xml';
import {
  ObservableProcedureModel,
  // ProcedureBase,
} from '@blockly/block-shareable-procedures';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_CLOSE_ID,
  MODAL_EDITOR_DELETE_ID,
  MODAL_EDITOR_NAME_INPUT_ID,
} from './functionEditorConstants';

// This class is not yet implemented. It is used for the modal function editor,
// which is used by Sprite Lab and Artist.
export default class FunctionEditor {
  // TODO: Confirm we are limited in what we can do in the constructor because
  // we don't have access to the main workspace when we instantiate this class.
  constructor(
    opt_msgOverrides,
    opt_definitionBlockType,
    opt_parameterBlockTypes,
    opt_disableParamEditing,
    opt_paramTypes
  ) {}

  setMainWorkspace = workspace => {
    this.mainWorkspace = workspace;
  };

  init(workspace, toolbox) {
    this.setMainWorkspace(workspace);

    // The workspace we'll show to users for editing
    const modalEditor = document.getElementById(MODAL_EDITOR_ID);
    this.dom = modalEditor;

    // Customize auto-populated Functions toolbox category.
    this.editorWorkspace = Blockly.inject(modalEditor, {
      toolbox,
      trashcan: false,
    });

    document
      .getElementById(MODAL_EDITOR_CLOSE_ID)
      .addEventListener('click', () => this.hide());

    this.nameInput = document.getElementById(MODAL_EDITOR_NAME_INPUT_ID);
    this.nameInput.addEventListener('input', e => {
      this.block.getProcedureModel().setName(e.target.value);
    });

    // Set up the delete function button
    document
      .getElementById(MODAL_EDITOR_DELETE_ID)
      .addEventListener('click', e => {
        console.log('This is complicated and we do not support it yet!');
      });

    this.mainWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      flyoutCategory(this.mainWorkspace, true)
    );
    // we have to pass the main ws so that the correct procedures are populated
    // false to not show the new function button inside the modal editor
    this.editorWorkspace.registerToolboxCategoryCallback(
      'PROCEDURE',
      () => {}
      // modalProceduresToolboxCallback(this.mainWorkspace, false)
    );

    // Set up the "new procedure" button in the toolbox
    this.mainWorkspace.registerButtonCallback('newProcedureCallback', () => {
      this.newProcedureCallback(this.mainWorkspace);
      // refresh the flyout after the new procedure is created
      this.mainWorkspace.getToolbox().refreshSelection();
    });

    // TODO: Maribeth's code uses local storage for these
    this.allFunctions = {};
  }

  // TODO
  isOpen() {
    return false;
  }

  hide() {
    this.dom.style.visibility = 'hidden';
  }

  // TODO
  renameParameter(oldName, newName) {}

  // TODO
  refreshParamsEverywhere() {}

  // TODO: Use the name openWithFunction (or openWithNewFunction vs. openEditorForFunction here)?
  // Ex. openEditorForFunction(procedureBlock, functionName) {}
  showForFunction(procedure) {
    this.editorWorkspace.clear();
    this.nameInput.value = procedure.getName();

    this.dom.style.visibility = 'visible';
    Blockly.common.svgResize(this.editorWorkspace);

    const VERTICAL_OFFSET = 250;
    const overrides = {y: VERTICAL_OFFSET, deletable: false, movable: false};
    const entry = this.allFunctions[procedure.getId()];
    if (entry) {
      const data = {...entry, ...overrides};
      // If we already have stored data about the procedure, use that
      this.block = Blockly.serialization.blocks.append(
        data,
        this.editorWorkspace
      );
    } else {
      // Otherwise, we need to create a new block from scratch.
      const baseData = {
        // TODO: Was 'modal_procedures_defnoreturn'; confirm that this is the appropriate switch
        type: 'procedures_defnoreturn',
        x: 20,
        y: 20,
        extraState: {
          procedureId: procedure.getId(),
        },
        icons: {
          comment: {
            text: 'Describe this function...',
            pinned: false,
            height: 80,
            width: 160,
          },
        },
        fields: {
          NAME: procedure.getName(),
        },
      };
      const newBlockData = {...baseData, ...overrides};
      this.block = Blockly.serialization.blocks.append(
        newBlockData,
        this.editorWorkspace
      );
    }
  }

  /**
   * Gets a legal name for a brand new function definition.
   * @param mainWorkspace main workspace, to check for name collisions
   * @returns a legal name for a new function definition.
   */
  getNameForNewFunction() {
    let name = 'do something';

    // Copied logic from blockly core because findLegalName requires us to
    // have a block first.
    while (Blockly.Procedures.isNameUsed(name, this.mainWorkspace)) {
      // Collision with another procedure.
      const r = name.match(/^(.*?)(\d+)$/);
      if (!r) {
        name += '2';
      } else {
        name = r[1] + (parseInt(r[2]) + 1);
      }
    }
    return name;
  }

  newProcedureCallback() {
    const name = this.getNameForNewFunction();
    const procedure = new ObservableProcedureModel(this.mainWorkspace, name);

    // add the model to the main workspace so we know all procedures available there
    // const allProcedures = Blockly.Procedures.allProcedures(workspace)[0];
    this.mainWorkspace.getProcedureMap().add(procedure);

    // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird. Models were not intended to be added to multiple
    // workspaces, so make a new one with the same data.
    const editorProcedureModel = new ObservableProcedureModel(
      this.editorWorkspace,
      procedure.getName(),
      procedure.getId()
    );
    this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    this.showForFunction(procedure);
  }
}

const createCallBlock = function (procedure) {
  return {
    kind: 'block',
    // TODO: Previous logic only seemed to use procedures_callnoreturn vs. modal_procedures_callreturn/modal_procedures_callnoreturn
    type: procedure.getReturnTypes()
      ? 'procedures_callreturn'
      : 'procedures_callnoreturn',
    extraState: {
      name: procedure.getName(),
      // TODO: Do we support functions with parameters?
      params: procedure.getParameters().map(param => param.getName()),
    },
  };
};

/**
 * Constructs the blocks required by the flyout for the procedure category.
 * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
 * Derived from core Google Blockly:
 * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
 * @param {WorkspaceSvg} workspace The workspace containing procedures.
 * @returns an array of XML block elements
 */
// Equivalent to blockly-samples registerToolboxCategoryCallback->modalProceduresToolboxCallback
export function flyoutCategory(workspace, includeNewButton = true) {
  console.warn(
    'The modal function editor is very much a work in progress! Safety goggles on...'
  );
  const blockList = [];
  if (includeNewButton) {
    console.log(
      "includeNewButton is true, so we're adding a new procedure button"
    );
    blockList.push({
      kind: 'button',
      text: 'Create a Function',
      callbackKey: 'newProcedureCallback',
    });
  } else {
    // TODO: Is there another case to be handled here?
  }

  // Get all the procedures from the workspace and create call blocks for them
  workspace
    .getProcedureMap()
    .getProcedures()
    .forEach(procedure => blockList.push(createCallBlock(procedure)));
  return blockList;
}

export function allCallBlocks(procedures) {
  let blockElements = [];
  for (let i = 0; i < procedures.length; i++) {
    const name = procedures[i][0];
    const args = procedures[i][1];

    const block = xml.parseElement('<block></block>', true);
    block.setAttribute('type', 'procedures_callnoreturn');
    block.setAttribute('gap', 16);

    const mutation = xml.parseElement('<mutation></mutation>', true);
    mutation.setAttribute('name', name);
    block.appendChild(mutation);

    // The argument list is likely empty as we don't currently support
    // functions with parameters. This loop is needed if that changes.
    for (let j = 0; j < args.length; j++) {
      const arg = xml.parseElement(`<arg name="${args[j]}"></arg>`, true);
      mutation.appendChild(arg);
    }
    blockElements.push(block);
  }
  return blockElements;
}

export function newDefinitionBlock(localizedNewFunctionString) {
  // Create a block with the following XML:
  // <block type="procedures_defnoreturn" gap="24">
  //     <field name="NAME">do something</field>
  // </block>
  const blockElement = xml.parseElement('<block></block>', true);
  blockElement.setAttribute('type', 'procedures_defnoreturn');
  // Add slightly larger gap between system blocks and user calls.
  blockElement.setAttribute('gap', 24);

  const nameField = xml.parseElement(
    `<field>${localizedNewFunctionString}</field>`,
    true
  );
  nameField.setAttribute('name', 'NAME');
  blockElement.appendChild(nameField);

  return blockElement;
}
