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

// This class is a work in progress. It is used for the modal function editor,
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

  setProcedureWorkspace = workspace => {
    this.procedureWorkspace = workspace;
  };

  init(mainWorkspace, procedureWorkspace, options) {
    this.setMainWorkspace(mainWorkspace);
    this.setProcedureWorkspace(procedureWorkspace);

    // The workspace we'll show to users for editing
    const modalEditor = document.getElementById(MODAL_EDITOR_ID);
    this.dom = modalEditor;

    // Customize auto-populated Functions toolbox category.
    this.editorWorkspace = Blockly.blockly_.inject(modalEditor, {
      toolbox: options.toolbox,
      theme: Blockly.cdoUtils.getUserTheme(options.theme),
    });

    // Close handler
    document
      .getElementById(MODAL_EDITOR_CLOSE_ID)
      .addEventListener('click', () => this.hide());

    // Rename handler
    this.nameInput = document.getElementById(MODAL_EDITOR_NAME_INPUT_ID);
    this.nameInput.addEventListener('input', e => {
      this.block.getProcedureModel().setName(e.target.value);
    });

    // Description handler
    this.functionDescriptionInput = document.getElementById(
      'functionDescriptionText'
    );
    this.functionDescriptionInput.addEventListener('input', () => {
      // TODO: Save the description to the procedure model
    });

    // Delete handler
    document
      .getElementById(MODAL_EDITOR_DELETE_ID)
      .addEventListener('click', this.handleDelete.bind(this));

    // Main workspace toolbox procedure category callback
    this.mainWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      this.flyoutCategory(this.mainWorkspace, true)
    );

    // Editor workspace toolbox procedure category callback
    // we have to pass the main ws so that the correct procedures are populated
    // false to not show the new function button inside the modal editor
    this.editorWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      this.flyoutCategory(this.mainWorkspace, false)
    );

    // Set up the "new procedure" button in the toolbox
    this.mainWorkspace.registerButtonCallback('newProcedureCallback', () => {
      this.newProcedureCallback(this.mainWorkspace);
      // refresh the flyout after the new procedure is created
      this.mainWorkspace.getToolbox().refreshSelection();
    });

    this.setUpEditorWorkspaceChangeListeners();
  }

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

  /**
   * Show the given procedure in the function editor. Either load from
   * the procedure workspace if it already exists, or create a new block.
   * @param {Procedure} procedure The procedure to show.
   */
  showForFunction(procedure) {
    Blockly.Events.disable();
    this.editorWorkspace.clear();
    Blockly.Events.enable();

    this.nameInput.value = procedure.getName();
    // TODO: populate description

    this.dom.style.display = '';
    Blockly.common.svgResize(this.editorWorkspace);

    const existingProcedureBlock = Blockly.Procedures.getDefinition(
      procedure.getName(),
      this.procedureWorkspace
    );

    if (existingProcedureBlock) {
      // If we already have stored data about the procedure, use that.
      const existingData = Blockly.serialization.blocks.save(
        existingProcedureBlock
      );
      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(existingData),
        this.editorWorkspace
      );
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
      };
      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(newDefinitionBlock),
        this.editorWorkspace
      );
    }
  }

  /**
   * Gets a legal name for a brand new function definition.
   * @returns a legal name for a new function definition.
   */
  getNameForNewFunction() {
    let name = 'do something';
    // Copied logic from blockly core because findLegalName requires us to
    // have a block first.
    while (Blockly.Procedures.isNameUsed(name, this.procedureWorkspace)) {
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
    const hiddenProcedure = new ObservableProcedureModel(
      this.procedureWorkspace,
      name
    );
    const mainProcedure = new ObservableProcedureModel(
      this.mainWorkspace,
      hiddenProcedure.getName(),
      hiddenProcedure.getId()
    );

    // Add the model to the procedure and main workspaces so we know
    // all procedures available there.
    this.procedureWorkspace.getProcedureMap().add(hiddenProcedure);
    this.mainWorkspace.getProcedureMap().add(mainProcedure);

    // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird.
    // Models were not intended to be added to multiple
    // workspaces, so make a new one with the same data.

    // We disable events during this operation because we mirror
    // events from the editor workspace to the other workspaces, but
    // we don't need to mirror this event as we set up the procedure
    // in the other workspaces above.
    Blockly.Events.disable();
    const editorProcedureModel = new ObservableProcedureModel(
      this.editorWorkspace,
      hiddenProcedure.getName(),
      hiddenProcedure.getId()
    );
    this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    Blockly.Events.enable();

    this.showForFunction(hiddenProcedure);
  }

  handleDelete() {
    // delete all caller blocks from the procedure workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      this.procedureWorkspace
    ).forEach(block => {
      block.dispose();
    });

    // delete all caller blocks from the main workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      this.mainWorkspace
    ).forEach(block => {
      block.dispose();
    });

    // delete the block from the editor workspace's procedure map
    // this will also cause it to be deleted from the main and procedure
    // workspaces' map
    this.editorWorkspace
      .getProcedureMap()
      .delete(this.block.getProcedureModel().getId());

    // delete the block from the editor workspace and hide the modal
    this.block.dispose();
    this.hide();
  }

  setUpEditorWorkspaceChangeListeners() {
    // Mirror procedure events from editor workspace to main workspace.
    // This allows updates for things like procedure name to propogate to the main
    // workspace.
    this.editorWorkspace.addChangeListener(e => {
      // If the main workspace hasn't been initialized yet, don't do anything
      if (!this.mainWorkspace) return;
      if (e instanceof ProcedureBase) {
        let event;
        try {
          event = Blockly.Events.fromJson(e.toJson(), this.mainWorkspace);
        } catch (err) {
          // Could not deserialize event. This is expected to happen. E.g. When
          // round-tripping parameter deletes, the delete in the secondary workspace
          // cannot be deserialized into the original workspace.
          return;
        }
        event.run(true);

        // Update the toolbox in case this change is happening
        // while the flyout is open.
        this.mainWorkspace.getToolbox().refreshSelection();
      }
    });

    // Mirror all non-ui events from editor workspace to procedure workspace.
    // This allows us to propogate edits to functions to the procedure workspace
    // (the source of truth for function definitions).
    this.editorWorkspace.addChangeListener(e => {
      if (e.isUiEvent || !this.procedureWorkspace) return;
      var json = e.toJson();
      // Convert JSON back into an event, then execute it.
      var secondaryEvent = Blockly.Events.fromJson(
        json,
        this.procedureWorkspace
      );
      secondaryEvent.run(true);
    });
  }

  /**
   * Add x and y coordinates to the block configuration so it shows up
   * correctly in the editor workspace. When we copy the block between workspaces
   * the x and y coordinates don't persist, so we need to add this to both new and
   * existing function definitions.
   * @param blockConfig: Block json configuration
   * @returns Block configuration with x and y coordinates
   */
  addEditorWorkspaceBlockConfig(blockConfig) {
    const returnValue = {
      ...blockConfig,
      x: 50,
      y: 210,
    };
    return returnValue;
  }

  /**
   * Constructs the blocks required by the flyout for the procedure category.
   * Modeled after core Blockly procedures flyout category, but excludes unwanted blocks.
   * Derived from core Google Blockly:
   * https://github.com/google/blockly/blob/5a23c84e6ef9c0b2bbd503ad9f58fa86db1232a8/core/procedures.ts#L202-L287
   * @param {WorkspaceSvg} workspace The workspace containing procedures.
   * @returns an array of XML block elements
   */
  // Equivalent to blockly-samples registerToolboxCategoryCallback->modalProceduresToolboxCallback
  flyoutCategory(workspace, includeNewButton = true) {
    const blockList = [];
    if (includeNewButton) {
      blockList.push({
        kind: 'button',
        text: 'Create a Function',
        callbackKey: 'newProcedureCallback',
      });
    }

    // Get all the procedures from the workspace and create call blocks for them
    workspace
      .getProcedureMap()
      .getProcedures()
      .forEach(procedure => blockList.push(this.createCallBlock(procedure)));
    return blockList;
  }

  createCallBlock(procedure) {
    const name = procedure.getName();
    return {
      kind: 'block',
      type: 'procedures_callnoreturn',
      extraState: {
        name: name,
        id: procedure.getId(),
      },
    };
  }
}
