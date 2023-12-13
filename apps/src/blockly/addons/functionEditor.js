import {
  ObservableProcedureModel,
  ProcedureBase,
} from '@blockly/block-shareable-procedures';
import {
  ScrollBlockDragger,
  ScrollOptions,
} from '@blockly/plugin-scroll-options';
import {flyoutCategory as functionsFlyoutCategory} from '@cdo/apps/blockly/customBlocks/googleBlockly/proceduresBlocks';
import {flyoutCategory as behaviorsFlyoutCategory} from '@cdo/apps/blockly/customBlocks/googleBlockly/behaviorBlocks';
import msg from '@cdo/locale';
import {disableOrphans} from '@cdo/apps/blockly/eventHandlers';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_CLOSE_ID,
  MODAL_EDITOR_DELETE_ID,
} from './functionEditorConstants';
import CdoConnectionChecker from './cdoConnectionChecker';
import CdoMetricsManager from './cdoMetricsManager';
import WorkspaceSvgFrame from './workspaceSvgFrame';
import {BLOCK_TYPES} from '../constants';
import {frameSizes} from './cdoConstants';
import CdoTrashcan from './cdoTrashcan';

// This class creates the modal function editor, which is used by Sprite Lab and Artist.
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
    this.isReadOnly = false;
  }

  init(options) {
    // The workspace we'll show to users for editing
    const modalEditor = document.getElementById(MODAL_EDITOR_ID);
    if (!modalEditor) {
      // If the modal editor component has not been created, we cannot init.
      return;
    }

    this.dom = modalEditor;
    this.isReadOnly = options.readOnly;

    // Customize auto-populated Functions toolbox category.
    this.editorWorkspace = Blockly.blockly_.inject(modalEditor, {
      comments: false, // Disables Blockly's built-in comment functionality.
      media: options.media,
      move: {
        drag: false,
        scrollbars: {
          horizontal: false,
          vertical: true,
        },
        wheel: true,
      },
      plugins: {
        metricsManager: CdoMetricsManager,
        blockDragger: ScrollBlockDragger,
        connectionChecker: CdoConnectionChecker,
      },
      readOnly: options.readOnly,
      renderer: options.renderer,
      rtl: options.rtl,
      theme: Blockly.cdoUtils.getUserTheme(options.theme),
      toolbox: options.toolbox,
      trashcan: false, // Don't use default trashcan.
    });
    const scrollOptionsPlugin = new ScrollOptions(this.editorWorkspace);
    scrollOptionsPlugin.init();

    // Disable blocks that aren't attached. We don't want these to generate
    // code in the hidden workspace.
    this.editorWorkspace.addChangeListener(disableOrphans);

    // Close handler
    document
      .getElementById(MODAL_EDITOR_CLOSE_ID)
      .addEventListener('click', () => this.hide());

    // Handler for delete button. We only enable the delete button for writeable workspaces.
    if (!this.isReadOnly) {
      document
        .getElementById(MODAL_EDITOR_DELETE_ID)
        .addEventListener('click', this.onDeletePressed.bind(this));
    }

    // Editor workspace toolbox procedure category callback
    // we have to pass the main ws so that the correct procedures are populated
    // false to not show the new function button inside the modal editor
    this.editorWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      functionsFlyoutCategory(Blockly.mainBlockSpace, true)
    );
    this.editorWorkspace.registerToolboxCategoryCallback('Behavior', () =>
      behaviorsFlyoutCategory(Blockly.mainBlockSpace, true)
    );

    // Set up the "new procedure" button in the toolbox
    Blockly.mainBlockSpace.registerButtonCallback(
      'newProcedureCallback',
      () => {
        this.newProcedureCallback(Blockly.mainBlockSpace);
        // refresh the flyout after the new procedure is created
        Blockly.mainBlockSpace.getToolbox().refreshSelection();
      }
    );

    this.setUpEditorWorkspaceChangeListeners();

    const functionEditorTrashcan = new CdoTrashcan(this.editorWorkspace);
    functionEditorTrashcan.init();
  }

  hide() {
    if (this.dom) {
      this.dom.style.display = 'none';
      this.editorWorkspace.hideChaff();
    }
  }

  // We kept this around for backwards compatibility with the CDO
  // function editor, but its logic is the same as hide.
  hideIfOpen() {
    this.hide();
  }

  getWorkspaceId() {
    return this.editorWorkspace.id;
  }

  getWorkspace() {
    return this.editorWorkspace;
  }

  // TODO
  renameParameter(oldName, newName) {}

  // TODO
  refreshParamsEverywhere() {}

  /**
   * Show the given procedure in the function editor. Either load from
   * the procedure workspace if it already exists, or create a new block.
   * @param {Procedure} procedure The procedure to show.
   * @param {string} procedureType The type of procedure to show. Only used if the
   * procedure does not already exist.
   */
  showForFunction(procedure, procedureType) {
    this.clearEditorWorkspace();

    this.dom.style.display = 'block';
    Blockly.common.svgResize(this.editorWorkspace);

    const existingProcedureBlock = Blockly.Procedures.getDefinition(
      procedure.getName(),
      Blockly.getHiddenDefinitionWorkspace()
    );

    let type;
    if (existingProcedureBlock) {
      type = existingProcedureBlock.type;
      // If we already have stored data about the procedure, use that.
      const existingData = Blockly.serialization.blocks.save(
        existingProcedureBlock
      );

      // Disable events here so we don't copy an existing block into the hidden definition
      // workspace.
      Blockly.Events.disable();
      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(existingData),
        this.editorWorkspace
      );
      Blockly.Events.enable();
    } else {
      type = procedureType;
      // Otherwise, we need to create a new block from scratch.
      const newDefinitionBlock = {
        kind: 'block',
        type,
        extraState: {
          procedureId: procedure.getId(),
          userCreated: true,
        },
        fields: {
          NAME: procedure.getName(),
        },
        deletable: false,
      };

      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(newDefinitionBlock),
        this.editorWorkspace
      );
    }

    const isBehavior = type === BLOCK_TYPES.behaviorDefinition;
    // We do not want to show the delete button for behaviors that are not user-created
    // or are in read only workspaces.
    const hideDeleteButton =
      this.isReadOnly || (isBehavior && !this.block.userCreated);
    const modalEditorDeleteButton = document.getElementById(
      MODAL_EDITOR_DELETE_ID
    );
    modalEditorDeleteButton.style.visibility = hideDeleteButton
      ? 'hidden'
      : 'visible';

    // Used to create and render an SVG frame instance.
    const getDefinitionBlockColor = () => {
      return Blockly.cdoUtils.getBlockColor(this.block);
    };

    this.editorWorkspace.svgFrame_ = new WorkspaceSvgFrame(
      this.editorWorkspace,
      isBehavior ? msg.behaviorEditorHeader() : msg.function(),
      'blocklyWorkspaceSvgFrame',
      getDefinitionBlockColor
    );
    this.editorWorkspace.svgFrame_.render();
  }

  /**
   * Gets a legal name for a brand new function definition.
   * @returns a legal name for a new function definition.
   */
  getNameForNewFunction() {
    let name = msg.doSomething();
    // Copied logic from blockly core because findLegalName requires us to
    // have a block first.
    while (
      Blockly.Procedures.isNameUsed(
        name,
        Blockly.getHiddenDefinitionWorkspace()
      )
    ) {
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

  newProcedureCallback = procedureType => {
    const name = this.getNameForNewFunction();
    const hiddenProcedure = new ObservableProcedureModel(
      Blockly.getHiddenDefinitionWorkspace(),
      name
    );
    const mainProcedure = this.createProcedureModelForWorkspace(
      Blockly.mainBlockSpace,
      hiddenProcedure
    );

    // Add the model to the procedure and main workspaces so we know
    // all procedures available there.
    Blockly.getHiddenDefinitionWorkspace()
      .getProcedureMap()
      .add(hiddenProcedure);
    Blockly.mainBlockSpace.getProcedureMap().add(mainProcedure);

    // Add the procedure model to the editor's map as well
    // Can't use the same underlying model or events get weird.
    // Models were not intended to be added to multiple
    // workspaces, so make a new one with the same data.

    // We disable events during this operation because we mirror
    // events from the editor workspace to the other workspaces, but
    // we don't need to mirror this event as we set up the procedure
    // in the other workspaces above.
    Blockly.Events.disable();
    const editorProcedureModel = this.createProcedureModelForWorkspace(
      this.editorWorkspace,
      hiddenProcedure
    );

    this.editorWorkspace.getProcedureMap().add(editorProcedureModel);
    Blockly.Events.enable();

    this.showForFunction(hiddenProcedure, procedureType);
  };

  onDeletePressed() {
    /// We use "delete" for cancel and "keep" for confirm so that the
    // delete button is red and the keep button is purple.
    Blockly.customSimpleDialog({
      bodyText: msg.confirmDeleteFunctionWarning({
        functionName: this.block.getProcedureModel().getName(),
      }),
      cancelText: msg.delete(),
      isDangerCancel: true, // gives us a red button
      confirmText: msg.keep(),
      onConfirm: null, // No-op
      onCancel: this.onDeleteConfirmed.bind(this),
    });
  }

  onDeleteConfirmed() {
    // delete all caller blocks from the procedure workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      Blockly.getHiddenDefinitionWorkspace()
    ).forEach(block => {
      block.dispose();
    });

    // delete all caller blocks from the main workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      Blockly.mainBlockSpace
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
      if (!Blockly.mainBlockSpace) return;
      if (e instanceof ProcedureBase) {
        let event;
        try {
          event = Blockly.Events.fromJson(e.toJson(), Blockly.mainBlockSpace);
        } catch (err) {
          // Could not deserialize event. This is expected to happen. E.g. When
          // round-tripping parameter deletes, the delete in the secondary workspace
          // cannot be deserialized into the original workspace.
          return;
        }
        event.run(true);

        // Update the toolbox in case this change is happening
        // while the flyout is open.
        Blockly.mainBlockSpace.getToolbox().refreshSelection();
      }
    });

    // Mirror all non-ui events from editor workspace to procedure workspace.
    // This allows us to propogate edits to functions to the procedure workspace
    // (the source of truth for function definitions).
    this.editorWorkspace.addChangeListener(e => {
      if (e.isUiEvent || !Blockly.getHiddenDefinitionWorkspace()) return;
      var json = e.toJson();
      // Convert JSON back into an event, then execute it.
      var secondaryEvent = Blockly.Events.fromJson(
        json,
        Blockly.getHiddenDefinitionWorkspace()
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
    // Position the blocks within the workspace svg frame.
    const x = frameSizes.MARGIN_SIDE + 5;
    const y = frameSizes.MARGIN_TOP + frameSizes.WORKSPACE_HEADER_HEIGHT + 15;

    return {
      ...blockConfig,
      movable: false,
      x,
      y,
    };
  }

  // Copy all procedure models from the hidden definition workspace to the editor workspace,
  // if they are not already present in the editor workspace.
  // This is needed when the hidden definition workspace is initialized with at least one
  // procedure, so that the editor workspace knows about those procedures.
  setUpEditorWorkspaceProcedures() {
    Blockly.Events.disable();
    const editorProcedureMap = this.editorWorkspace.getProcedureMap();
    const hiddenProcedureDefinitions = Blockly.getHiddenDefinitionWorkspace()
      .getProcedureMap()
      .getProcedures();
    hiddenProcedureDefinitions.forEach(procedure => {
      const procedureId = procedure.getId();
      if (!editorProcedureMap.has(procedureId)) {
        const procedureModel = this.createProcedureModelForWorkspace(
          this.editorWorkspace,
          procedure
        );
        this.editorWorkspace.getProcedureMap().add(procedureModel);
      }
    });
    Blockly.Events.enable();
  }

  createProcedureModelForWorkspace(workspace, procedure) {
    return new ObservableProcedureModel(
      workspace,
      procedure.getName(),
      procedure.getId()
    );
  }

  // Clear the editor workspace to prepare for a new function definition.
  clearEditorWorkspace() {
    if (this.block) {
      const topBlocks = this.editorWorkspace.getTopBlocks();
      // Find all blocks that are not attached to the procedure definition.
      const orphanedBlocks = topBlocks.filter(
        block => block.id !== this.block.id
      );

      // Dispose of all non-procedure-definition top blocks (aka orphaned blocks)
      // and propagate the delete event to the hidden workspace.
      orphanedBlocks.forEach(block => block.dispose(false));
    }
    const workspaceSvgFrame = this.editorWorkspace.svgFrame_;
    if (workspaceSvgFrame) {
      workspaceSvgFrame.dispose();
    }

    // Now call clear() to have Blockly handle the rest of the workspace clearing.
    // Also disable events here to ensure we don't delete the procedure model or the
    // procedure definition.
    Blockly.Events.disable();
    this.editorWorkspace.clear();
    Blockly.Events.enable();
  }
}
