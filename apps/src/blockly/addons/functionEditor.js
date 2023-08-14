import {
  ObservableProcedureModel,
  ProcedureBase,
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
  constructor(
    opt_msgOverrides,
    opt_definitionBlockType,
    opt_parameterBlockTypes,
    opt_disableParamEditing,
    opt_paramTypes
  ) {
    // TODO: Are these options from the fork still relevant?
    this.msgOverrides_ = opt_msgOverrides || {};
    if (opt_definitionBlockType) {
      this.definitionBlockType = opt_definitionBlockType;
    }
    this.parameterBlockTypes = opt_parameterBlockTypes || {};
    this.disableParamEditing = opt_disableParamEditing || false;
    this.paramTypes = opt_paramTypes || [];
  }

  setMainWorkspace = workspace => {
    this.mainWorkspace = workspace;
  };

  init(workspace, options) {
    this.setMainWorkspace(workspace);

    // The workspace we'll show to users for editing
    const modalEditor = document.getElementById(MODAL_EDITOR_ID);
    this.dom = modalEditor;

    // Customize auto-populated Functions toolbox category.
    this.editorWorkspace = Blockly.blockly_.inject(modalEditor, {
      toolbox: options.toolbox,
    });

    document
      .getElementById(MODAL_EDITOR_CLOSE_ID)
      .addEventListener('click', () => this.hide());

    this.nameInput = document.getElementById(MODAL_EDITOR_NAME_INPUT_ID);
    this.nameInput.addEventListener('input', e => {
      this.block.getProcedureModel().setName(e.target.value);
    });

    this.functionDescriptionInput = document.getElementById(
      'functionDescriptionText'
    );
    this.functionDescriptionInput.addEventListener('input', () => {
      // TODO: Save the description to the procedure model
    });

    // Set up the delete function button
    document
      .getElementById(MODAL_EDITOR_DELETE_ID)
      .addEventListener('click', () => {
        // TODO: Handle deletion
      });

    this.mainWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      flyoutCategory(this.mainWorkspace, true)
    );
    // we have to pass the main ws so that the correct procedures are populated
    // false to not show the new function button inside the modal editor
    this.editorWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      flyoutCategory(this.mainWorkspace, false)
    );

    // Set up the "new procedure" button in the toolbox
    this.mainWorkspace.registerButtonCallback('newProcedureCallback', () => {
      this.newProcedureCallback(this.mainWorkspace);
      // refresh the flyout after the new procedure is created
      this.mainWorkspace.getToolbox().refreshSelection();
    });

    // Serialized data from all procedures
    this.allFunctions = {};

    // Add an event listener that saves the data for the given procedure whenever the procedure is saved
    this.editorWorkspace.addChangeListener(e => {
      if (e.isUiEvent) return;
      // save the procedure block only, ignore other blocks
      if (!this.block) return;
      const id = this.block.getProcedureModel().getId();
      const blockState = Blockly.serialization.blocks.save(this.block);
      this.allFunctions[id] = blockState;
      console.log('block state to append: ', blockState);
      //Blockly.serialization.blocks.append(blockState, this.mainWorkspace);
      console.log({new_function_def: this.allFunctions[id]});
    });

    // TODO: I think this is firing too often. How can we fix it?
    this.editorWorkspace.addChangeListener(e => {
      // If the main workspace hasn't been initialized yet, don't do anything
      if (!this.mainWorkspace) return;
      if (e instanceof ProcedureBase && e.type !== 'procedure_create') {
        let event;
        try {
          console.log('e.toJson()', e.toJson());
          event = Blockly.Events.fromJson(e.toJson(), this.mainWorkspace);
        } catch (err) {
          // Could not deserialize event. This is expected to happen. E.g. When round-tripping parameter deletes,
          // the delete in the secondary workspace cannot be deserialized into the original workspace.
          console.log(err);
          return;
        }
        event.run(true);

        // Update the toolbox in case this change is happening while the flyout is open
        this.mainWorkspace.getToolbox().refreshSelection();
      }
    });
    console.log(
      'this.editorWorkspace.procedureModel in init',
      this.editorWorkspace.getProcedureMap()
    );
  }

  // TODO: Address areas in codebase where hideIfOpen is used
  hide() {
    this.dom.style.display = 'none';
  }

  hideIfOpen() {
    // TODO: Implement
  }

  // TODO
  renameParameter(oldName, newName) {}

  // TODO
  refreshParamsEverywhere() {}

  // TODO: Rename
  showForFunction(procedure) {
    this.editorWorkspace.clear();
    console.log('in showForFunction, procedure: ', procedure);
    console.log({allFunctions: this.allFunctions});
    this.nameInput.value = procedure.getName();
    // TODO: procedure.getDescription() is not a thing -- this will be on extra state, I think
    // this.functionDescriptionInput.value = procedure.getDescription();

    this.dom.style.display = '';
    Blockly.common.svgResize(this.editorWorkspace);

    const existingData = this.allFunctions[procedure.getId()];
    if (existingData) {
      // If we already have stored data about the procedure, use that
      this.block = Blockly.serialization.blocks.append(
        existingData,
        this.editorWorkspace
      );
      console.log(`existing block found`, this.block);
    } else {
      // Otherwise, we need to create a new block from scratch.
      const newDefinitionBlock = {
        kind: 'block',
        type: 'procedures_defnoreturn',
        extraState: {
          procedureId: procedure.getId(),
        },
        fields: {
          NAME: procedure.getName(),
        },
        deletable: false,
        movable: false,
        x: 50,
        y: 200, // TODO: This is a magic number
      };
      console.log();
      this.block = Blockly.serialization.blocks.append(
        newDefinitionBlock,
        this.editorWorkspace
      );
      console.log('new block: ', this.block);
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
    console.log(
      'this.editorWorkspace.getProcedureMap() before new procedure is added',
      this.editorWorkspace.getProcedureMap()
    );
    const name = this.getNameForNewFunction();
    const procedure = new ObservableProcedureModel(this.mainWorkspace, name);

    // add the model to the main workspace so we know all procedures available there
    // const allProcedures = Blockly.Procedures.allProcedures(workspace)[0];
    this.mainWorkspace.getProcedureMap().add(procedure);
    console.log(
      `procedure added to main workspace is ${procedure.getId()} with name ${procedure.getName()}`
    );

    // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird. Models were not intended to be added to multiple
    // workspaces, so make a new one with the same data.
    const editorProcedureModel = new ObservableProcedureModel(
      this.editorWorkspace,
      procedure.getName(),
      procedure.getId()
    );
    this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    console.log(
      `procedure added to editor workspace is ${editorProcedureModel.getId()} with name ${editorProcedureModel.getName()}`
    );
    this.showForFunction(procedure);
  }
}

const createCallBlock = function (procedure) {
  const name = procedure.getName();
  return {
    kind: 'block',
    type: 'procedures_callnoreturn',
    fields: {
      NAME: name,
    },
    mutation: {
      name: name,
    },
    extraState: {
      name: name,
      id: procedure.getId(),
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
  console.log({blockList: blockList});
  return blockList;
}
