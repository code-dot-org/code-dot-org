import {
  ObservableParameterModel,
  ObservableProcedureModel,
  ProcedureBase,
} from '@blockly/block-shareable-procedures';
import {
  ScrollBlockDragger,
  ScrollOptions,
} from '@blockly/plugin-scroll-options';
import {Block, WorkspaceSvg} from 'blockly';
import {IProcedureModel} from 'blockly/core/procedures';
import {State} from 'blockly/core/serialization/blocks';

import {flyoutCategory as behaviorsFlyoutCategory} from '@cdo/apps/blockly/customBlocks/googleBlockly/behaviorBlocks';
import {flyoutCategory as functionsFlyoutCategory} from '@cdo/apps/blockly/customBlocks/googleBlockly/proceduresBlocks';
import {flyoutCategory as variablesFlyoutCategory} from '@cdo/apps/blockly/customBlocks/googleBlockly/variableBlocks';
import {disableOrphans} from '@cdo/apps/blockly/eventHandlers';
import {commonI18n} from '@cdo/apps/types/locale';
import {getAlphanumericId} from '@cdo/apps/utils';

import {BLOCK_TYPES} from '../constants';
import {
  EditorWorkspaceSvg,
  ExtendedBlocklyOptions,
  ProcedureBlock,
  ProcedureBlockConfiguration,
  ProcedureType,
} from '../types';

import CdoConnectionChecker from './cdoConnectionChecker';
import {frameSizes} from './cdoConstants';
import CdoMetricsManager from './cdoMetricsManager';
import {initializeScrollbarPair} from './cdoScrollbar';
import CdoTrashcan from './cdoTrashcan';
import {
  MODAL_EDITOR_ID,
  MODAL_EDITOR_CLOSE_ID,
  MODAL_EDITOR_DELETE_ID,
} from './functionEditorConstants';
import {registerCloseModalEditorShortcut} from './shortcutItems';
import WorkspaceSvgFrame from './workspaceSvgFrame';

// This class creates the modal function editor, which is used by Sprite Lab and Artist.
export default class FunctionEditor {
  private isReadOnly: boolean;
  private dom: HTMLElement | undefined;
  private primaryWorkspace: WorkspaceSvg | undefined;
  private editorWorkspace: EditorWorkspaceSvg | undefined;
  private block: ProcedureBlock | undefined;

  constructor() {
    this.isReadOnly = false;
  }

  init(options: ExtendedBlocklyOptions) {
    // The workspace we'll show to users for editing
    const modalEditor = document.getElementById(MODAL_EDITOR_ID);
    if (!modalEditor) {
      // If the modal editor component has not been created, we cannot init.
      return;
    }

    this.dom = modalEditor;
    this.isReadOnly = options.readOnly || false;

    // Remove the block ids from the toolbox. Otherwise, it would be possible
    // to add a block with the same id to multiple different procedure definitions.
    // Because we mirror block creation onto the hidden workspace, we need to avoid
    // trying to create blocks with ids that are already used in other definitions.
    const toolbox = Blockly.cdoUtils.toolboxWithoutIds(options.toolbox);
    this.primaryWorkspace = Blockly.getMainWorkspace() as WorkspaceSvg;
    // Customize auto-populated Functions toolbox category.
    this.editorWorkspace = Blockly.blockly_.inject(modalEditor, {
      comments: false, // Disables Blockly's built-in comment functionality.
      media: options.media,
      move: {
        drag: false,
        scrollbars: {
          horizontal: true,
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
      toolbox,
      trashcan: false, // Don't use default trashcan.
      modalInputs: false,
    }) as EditorWorkspaceSvg;
    this.editorWorkspace.registerToolboxCategoryCallback(
      'VARIABLE',
      variablesFlyoutCategory
    );
    const scrollOptionsPlugin = new ScrollOptions(this.editorWorkspace);
    scrollOptionsPlugin.init();
    initializeScrollbarPair(this.editorWorkspace);
    // Disable blocks that aren't attached. We don't want these to generate
    // code in the hidden workspace.
    this.editorWorkspace.addChangeListener(disableOrphans);
    Blockly.navigationController.addWorkspace(this.editorWorkspace);
    // Close handler
    document
      .getElementById(MODAL_EDITOR_CLOSE_ID)
      ?.addEventListener('click', () => this.hide());
    // Adds an ESC key shortcut to Blockly's shortcut registry.
    registerCloseModalEditorShortcut(this.hide.bind(this));
    // Handler for delete button. We only enable the delete button for writeable workspaces.
    if (!this.isReadOnly) {
      document
        .getElementById(MODAL_EDITOR_DELETE_ID)
        ?.addEventListener('click', this.onDeletePressed.bind(this));
    }

    // Editor workspace toolbox procedure category callback
    const functionEditorOpen = true;
    this.editorWorkspace.registerToolboxCategoryCallback('PROCEDURE', () =>
      functionsFlyoutCategory(this.editorWorkspace!, functionEditorOpen)
    );
    this.editorWorkspace.registerToolboxCategoryCallback('Behavior', () =>
      behaviorsFlyoutCategory(this.editorWorkspace!, functionEditorOpen)
    );

    // Set up the "new procedure" button in the toolbox
    Blockly.mainBlockSpace.registerButtonCallback(
      'newProcedureCallback',
      () => {
        this.newProcedureCallback();
        // refresh the flyout after the new procedure is created
        Blockly.mainBlockSpace?.getToolbox()?.refreshSelection();
      }
    );

    this.setUpEditorWorkspaceChangeListeners();

    const functionEditorTrashcan = new CdoTrashcan(this.editorWorkspace);
    functionEditorTrashcan.init();
    // Set primary workspace to be active (until a function is shown).
    Blockly.common.setMainWorkspace(this.primaryWorkspace);
    if (this.primaryWorkspace.keyboardAccessibilityMode) {
      this.primaryWorkspace
        .getMarkerManager()
        .setCursor(
          Blockly.getNewCursor(Blockly.navigationController.cursorType)
        );
      Blockly.navigationController.navigation.focusWorkspace(
        this.primaryWorkspace
      );
    }
  }

  hide() {
    // If keyboard navigation was on, enable it on the primary workspace
    if (this.editorWorkspace?.keyboardAccessibilityMode) {
      // Disable it on the current workspace so there's no chance of
      // controlling it accidentally while it is hidden.
      Blockly.navigationController.disable(this.editorWorkspace);
      Blockly.navigationController.enable(this.primaryWorkspace);
    }
    if (this.dom) {
      this.dom.style.display = 'none';
      this.editorWorkspace?.hideChaff();
    }
    if (this.primaryWorkspace) {
      Blockly.common.setMainWorkspace(this.primaryWorkspace);
    }
    // This method is also used as a callback for the Blockly shortcut registry.
    // The registry expects callbacks to return a boolean. We return false
    // explicitly so that other shortcuts assigned to the same key code still run.
    // This includes 'escape' (hide chaff, from Core) and 'exit' (from keyboard navigation).
    return false;
  }

  // We kept this around for backwards compatibility with the CDO
  // function editor, but its logic is the same as hide.
  hideIfOpen() {
    this.hide();
  }

  getWorkspaceId() {
    return this.editorWorkspace?.id;
  }

  getWorkspace() {
    return this.editorWorkspace;
  }

  // Leaving these two functions as placeholders for when we implement parameters.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  renameParameter(_oldName: string, _newName: string) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshParamsEverywhere() {}

  autoOpenFunction(functionName: string) {
    const existingProcedureBlock = Blockly.Procedures.getDefinition(
      functionName,
      Blockly.getHiddenDefinitionWorkspace()
    );
    this.showForFunctionHelper(existingProcedureBlock);
  }

  /**
   * Show the given procedure in the function editor. Either load from
   * the procedure workspace if it already exists, or create a new block.
   * @param {Procedure} procedure The procedure to show.
   * @param {string} procedureType The type of procedure to show. Only used if the
   * procedure does not already exist.
   */
  showForFunction(
    procedure: ObservableProcedureModel,
    procedureType?: ProcedureType
  ) {
    const existingProcedureBlock = Blockly.Procedures.getDefinition(
      procedure.getName(),
      Blockly.getHiddenDefinitionWorkspace()
    );
    this.showForFunctionHelper(
      existingProcedureBlock,
      procedure,
      procedureType
    );
  }

  showForFunctionHelper(
    existingProcedureBlock: Block | null,
    newProcedure?: IProcedureModel,
    procedureType?: ProcedureType
  ) {
    if (
      (!existingProcedureBlock && !newProcedure) ||
      !this.editorWorkspace ||
      !this.dom
    ) {
      // We can't show the function editor if we don't have an existing or new procedure.
      // We also can't show without an editor workspace or dom.
      return;
    }

    this.clearEditorWorkspace();
    this.dom.style.display = 'block';
    Blockly.common.svgResize(this.editorWorkspace);

    let type;
    if (existingProcedureBlock) {
      type = existingProcedureBlock.type;
      // If we already have stored data about the procedure, use that.
      const existingData = Blockly.serialization.blocks.save(
        existingProcedureBlock
      ) || {type}; // Fall back to serialization that is just the type.

      // Disable events here so we don't copy an existing block into the hidden definition
      // workspace.
      Blockly.Events.disable();
      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(existingData),
        this.editorWorkspace
      ) as ProcedureBlock;
      Blockly.Events.enable();
    } else if (newProcedure) {
      type = procedureType || BLOCK_TYPES.procedureDefinition;
      const name = newProcedure.getName();
      // Otherwise, we need to create a new block from scratch.
      const newDefinitionBlock: ProcedureBlockConfiguration = {
        kind: 'block',
        type,
        extraState: {
          procedureId: newProcedure.getId(),
          userCreated: !Blockly.isStartMode, // Start mode procedures are not user created.
        },
        fields: {
          NAME: name,
        },
      };

      if (procedureType === BLOCK_TYPES.behaviorDefinition) {
        // In start mode, the behavior id is the same as the name (and if the
        // behavior is renamed, we update the behavior id to match the name).
        // Since the behavior id is the function name in generated code, this
        // allows us to support levelbuilder validation code. Levelbuilders can just
        // use the name of the behavior and know that it will be the generated
        // function name.
        if (Blockly.isStartMode) {
          newDefinitionBlock.extraState.behaviorId = name;
        } else {
          // Otherwise, this is a user created behavior, and we can give it a random
          // id.
          newDefinitionBlock.extraState.behaviorId = getAlphanumericId();
        }
      }

      this.block = Blockly.serialization.blocks.append(
        this.addEditorWorkspaceBlockConfig(newDefinitionBlock),
        this.editorWorkspace
      ) as ProcedureBlock;
    }
    this.block?.setDeletable(false);

    // If keyboard navigation was on, enable it on the editor workspace.
    if (
      this.editorWorkspace.keyboardAccessibilityMode ||
      this.primaryWorkspace?.keyboardAccessibilityMode
    ) {
      // Disable it on the primary workspace so there's no chance of
      // controlling it accidentally while the function editor is open.
      Blockly.navigationController.disable(this.primaryWorkspace);
      Blockly.navigationController.enable(this.editorWorkspace);

      this.editorWorkspace
        .getMarkerManager()
        .setCursor(
          Blockly.getNewCursor(Blockly.navigationController.cursorType)
        );
      // If this editor was already open (e.g. changing from one function to another)
      // we need to re-focus so the cursor highlights the correct block.
      Blockly.navigationController.navigation.focusWorkspace(
        this.editorWorkspace
      );
    }
    // We only want to be able to delete things that are user-created (functions and behaviors)
    // and not things that are being previewed from a read-only workspace.
    // We allow deleting non-user created behaviors in start mode.
    const hideDeleteButton =
      this.isReadOnly || (!Blockly.isStartMode && !this.block?.userCreated);
    const modalEditorDeleteButton = document.getElementById(
      MODAL_EDITOR_DELETE_ID
    );
    if (modalEditorDeleteButton) {
      modalEditorDeleteButton.style.visibility = hideDeleteButton
        ? 'hidden'
        : 'visible';
    }

    // Used to create and render an SVG frame instance.
    const getDefinitionBlockColor = () => {
      return Blockly.cdoUtils.getBlockColor(this.block);
    };

    this.editorWorkspace.svgFrame_ = new WorkspaceSvgFrame(
      this.editorWorkspace,
      type === BLOCK_TYPES.behaviorDefinition
        ? commonI18n.behaviorEditorHeader()
        : commonI18n.function(),
      'blocklyWorkspaceSvgFrame',
      getDefinitionBlockColor
    );
    this.editorWorkspace.svgFrame_.render();

    // Make the function editor workspace the active/focused workspace.
    Blockly.common.setMainWorkspace(this.editorWorkspace);
  }

  /**
   * Gets a legal name for a brand new function definition.
   * @returns a legal name for a new function definition.
   */
  getNameForNewFunction() {
    let name = commonI18n.doSomething();
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

  newProcedureCallback = (procedureType?: ProcedureType) => {
    if (!this.editorWorkspace) {
      return;
    }
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

    this.editorWorkspace?.getProcedureMap().add(editorProcedureModel);
    Blockly.Events.enable();

    this.showForFunction(hiddenProcedure, procedureType);
  };

  onDeletePressed() {
    if (!this.block) {
      return;
    }
    /// We use "delete" for cancel and "keep" for confirm so that the
    // delete button is red and the keep button is purple.
    Blockly.customSimpleDialog({
      bodyText: commonI18n.confirmDeleteFunctionWarning({
        functionName: this.block.getProcedureModel().getName(),
      }),
      cancelText: commonI18n.delete(),
      isDangerCancel: true, // gives us a red button
      confirmText: commonI18n.keep(),
      onConfirm: null, // No-op
      onCancel: this.onDeleteConfirmed.bind(this),
    });
  }

  onDeleteConfirmed() {
    if (!this.block) {
      return;
    }
    // delete all caller blocks from the procedure workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      Blockly.getHiddenDefinitionWorkspace()
    ).forEach(block => {
      block.dispose(true /* healStack */);
    });

    // delete all caller blocks from the main workspace
    Blockly.Procedures.getCallers(
      this.block.getProcedureModel().getName(),
      Blockly.mainBlockSpace
    ).forEach(block => {
      block.dispose(true /* healStack */);
    });

    // delete the block from the editor workspace's procedure map
    // this will also cause it to be deleted from the main and procedure
    // workspaces' map
    this.editorWorkspace
      ?.getProcedureMap()
      .delete(this.block.getProcedureModel().getId());

    // Delete the block from the editor workspace and hide the modal.
    // We don't need to heal the stack here because we always clear the editor workspace.
    this.block.dispose(false /* healStack */);
    this.hide();
  }

  setUpEditorWorkspaceChangeListeners() {
    // Mirror procedure and variable events from editor workspace to main workspace.
    // This allows updates for things like procedure name to propogate to the main
    // workspace, as well as variables being created/renamed/deleted.
    this.editorWorkspace?.addChangeListener(e => {
      // If the main workspace hasn't been initialized yet, don't do anything
      if (!Blockly.mainBlockSpace) return;
      if (e instanceof ProcedureBase || e instanceof Blockly.Events.VarBase) {
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
        Blockly.mainBlockSpace?.getToolbox()?.refreshSelection();
      }
    });

    // Mirror variable events from main workspace to the hidden workspace.
    // This is allows newly created/renamed/deleted variables to propogate
    // to the other workspaces.
    this.primaryWorkspace?.addChangeListener(e => {
      if (!this.editorWorkspace) {
        return;
      }
      if (e instanceof Blockly.Events.VarBase) {
        let newHiddenWorkspaceEvent;
        try {
          newHiddenWorkspaceEvent = Blockly.Events.fromJson(
            e.toJson(),
            Blockly.getHiddenDefinitionWorkspace()
          );
        } catch (err) {
          // Could not deserialize event. This is expected to happen. E.g. When
          // round-tripping parameter deletes, the delete in the secondary workspace
          // cannot be deserialized into the original workspace.
          return;
        }
        newHiddenWorkspaceEvent.run(true);

        // Update the toolbox in case this change is happening
        // while the flyout is open.
        this.editorWorkspace?.getToolbox()?.refreshSelection();
      }
    });

    // Mirror all non-ui events from editor workspace to procedure workspace.
    // This allows us to propogate edits to functions to the procedure workspace
    // (the source of truth for function definitions).
    this.editorWorkspace?.addChangeListener(e => {
      if (e.isUiEvent || !Blockly.getHiddenDefinitionWorkspace()) return;
      const json = e.toJson();
      // Convert JSON back into an event, then execute it.
      const secondaryEvent = Blockly.Events.fromJson(
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
  addEditorWorkspaceBlockConfig(blockConfig: State) {
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
    if (!this.editorWorkspace) {
      return;
    }
    Blockly.Events.disable();
    const editorProcedureMap = this.editorWorkspace.getProcedureMap();
    const hiddenProcedureDefinitions = Blockly.getHiddenDefinitionWorkspace()
      .getProcedureMap()
      .getProcedures();
    hiddenProcedureDefinitions.forEach(procedure => {
      const procedureId = procedure.getId();
      if (!editorProcedureMap.has(procedureId) && this.editorWorkspace) {
        const procedureModel = this.createProcedureModelForWorkspace(
          this.editorWorkspace,
          procedure
        );
        this.editorWorkspace?.getProcedureMap().add(procedureModel);
      }
    });
    Blockly.Events.enable();
  }

  createProcedureModelForWorkspace(
    workspace: WorkspaceSvg,
    procedure: IProcedureModel
  ) {
    const newProcedure = new ObservableProcedureModel(
      workspace,
      procedure.getName(),
      procedure.getId()
    );

    // Copy parameters from the old procedure to the new one
    procedure.getParameters().forEach((param, index) => {
      // Type assertion to ensure we can get the variable model.
      const observableParam = param as ObservableParameterModel;

      const newParam = new ObservableParameterModel(
        workspace,
        observableParam.getName(),
        observableParam.getId(),
        observableParam.getVariableModel().getId()
      );

      newProcedure.insertParameter(newParam, index);
    });

    return newProcedure;
  }

  // Clear the editor workspace to prepare for a new function definition.
  clearEditorWorkspace() {
    if (!this.editorWorkspace) {
      return;
    }
    if (this.block) {
      const topBlocks = this.editorWorkspace.getTopBlocks();
      // Find all blocks that are not attached to the procedure definition.
      const orphanedBlocks = topBlocks.filter(
        block => block.id !== this.block?.id
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
    // The previous line also clears the variable map. We need to manually rebuild it
    // so that student variables continue to be defined on the editor workspace.
    const primaryWorkspaceVariableMap = this.primaryWorkspace?.getVariableMap();
    const functionEditorVariableMap = this.editorWorkspace.getVariableMap();
    if (primaryWorkspaceVariableMap) {
      const variables = primaryWorkspaceVariableMap.getAllVariables();

      variables.forEach(variable => {
        functionEditorVariableMap.createVariable(
          variable.name,
          variable.type,
          variable.getId()
        );
      });
    }
    Blockly.Events.enable();
  }
}
