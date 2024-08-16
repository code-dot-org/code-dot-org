/* eslint-disable @typescript-eslint/no-empty-function */
import {
  ObservableProcedureModel,
  ObservableParameterModel,
} from '@blockly/block-shareable-procedures';
import {LineCursor, NavigationController} from '@blockly/keyboard-navigation';
import {CrossTabCopyPaste} from '@blockly/plugin-cross-tab-copy-paste';
import {
  ScrollBlockDragger,
  ScrollOptions,
} from '@blockly/plugin-scroll-options';
import {Options, Theme, Workspace} from 'blockly';
import {FieldProto} from 'blockly/core/field';
import {javascriptGenerator} from 'blockly/javascript';

import {
  BlockColors,
  BlocklyVersion,
  READ_ONLY_PROPERTIES,
  SETTABLE_PROPERTIES,
  WORKSPACE_EVENTS,
} from '@cdo/apps/blockly/constants';
import DCDO from '@cdo/apps/dcdo';
import {MetricEvent} from '@cdo/apps/lib/metrics/events';
import {getStore} from '@cdo/apps/redux';
import {setFailedToGenerateCode} from '@cdo/apps/redux/blockly';
import styleConstants from '@cdo/apps/styleConstants';
import * as utils from '@cdo/apps/utils';

import CdoAngleHelper from './addons/cdoAngleHelper';
import CdoBlockSerializer from './addons/cdoBlockSerializer';
import CdoConnectionChecker from './addons/cdoConnectionChecker';
import initializeCdoConstants from './addons/cdoConstants';
import initializeCss from './addons/cdoCss';
import CdoFieldAngleDropdown from './addons/cdoFieldAngleDropdown';
import CdoFieldAngleTextInput from './addons/cdoFieldAngleTextInput';
import CdoFieldAnimationDropdown from './addons/cdoFieldAnimationDropdown';
import CdoFieldBehaviorPicker from './addons/cdoFieldBehaviorPicker';
import {CdoFieldBitmap} from './addons/cdoFieldBitmap';
import CdoFieldButton from './addons/cdoFieldButton';
import CdoFieldColour from './addons/cdoFieldColour';
import CdoFieldDropdown from './addons/cdoFieldDropdown';
import CdoFieldFlyout from './addons/cdoFieldFlyout';
import CdoFieldImage from './addons/cdoFieldImage';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldLabel from './addons/cdoFieldLabel';
import CdoFieldNumber from './addons/cdoFieldNumber';
import CdoFieldParameter from './addons/cdoFieldParameter';
import CdoFieldToggle from './addons/cdoFieldToggle';
import CdoFieldVariable from './addons/cdoFieldVariable';
import initializeGenerator from './addons/cdoGenerator';
import {overrideHandleTouchMove} from './addons/cdoGesture';
import CdoMetricsManager from './addons/cdoMetricsManager';
import CdoRendererGeras from './addons/cdoRendererGeras';
import CdoRendererThrasos from './addons/cdoRendererThrasos';
import CdoRendererZelos from './addons/cdoRendererZelos';
import {initializeScrollbarPair} from './addons/cdoScrollbar';
import {getPointerBlockImageUrl} from './addons/cdoSpritePointer';
import CdoTrashcan from './addons/cdoTrashcan';
import * as cdoUtils from './addons/cdoUtils';
import initializeVariables from './addons/cdoVariables';
import CdoVerticalFlyout from './addons/cdoVerticalFlyout';
import initializeBlocklyXml, {removeInvisibleBlocks} from './addons/cdoXml';
import {registerAllContextMenuItems} from './addons/contextMenu';
import registerLogicCompareMutator from './addons/extensions/logic_compare';
import FunctionEditor from './addons/functionEditor';
import registerIfMutator from './addons/plusMinusBlocks/if';
import registerTextJoinMutator from './addons/plusMinusBlocks/text_join';
import {UNKNOWN_BLOCK} from './addons/unknownBlock';
import {Themes, Renderers} from './constants';
import {flyoutCategory as behaviorsFlyoutCategory} from './customBlocks/googleBlockly/behaviorBlocks';
import customBlocks from './customBlocks/googleBlockly/index';
import {flyoutCategory as functionsFlyoutCategory} from './customBlocks/googleBlockly/proceduresBlocks';
import {flyoutCategory as variablesFlyoutCategory} from './customBlocks/googleBlockly/variableBlocks';
import {
  adjustCalloutsOnViewportChange,
  disableOrphans,
  reflowToolbox,
  updateBlockLimits,
} from './eventHandlers';
import {
  CdoProtanopiaDarkTheme,
  CdoDeuteranopiaDarkTheme,
  CdoTritanopiaDarkTheme,
} from './themes/cdoAccessibleDarkThemes';
import {
  CdoProtanopiaTheme,
  CdoDeuteranopiaTheme,
  CdoTritanopiaTheme,
} from './themes/cdoAccessibleThemes';
import CdoDarkTheme from './themes/cdoDark';
import CdoHighContrastTheme from './themes/cdoHighContrast';
import CdoHighContrastDarkTheme from './themes/cdoHighContrastDark';
import CdoTheme from './themes/cdoTheme';
import {
  BlocklyWrapperType,
  ExtendedBlock,
  ExtendedBlockSvg,
  ExtendedBlocklyOptions,
  ExtendedConnection,
  ExtendedInput,
  ExtendedVariableMap,
  ExtendedWorkspace,
  ExtendedWorkspaceSvg,
  FieldHelperOptions,
  GoogleBlocklyInstance,
} from './types';
import {
  INFINITE_LOOP_TRAP,
  LOOP_HIGHLIGHT,
  handleCodeGenerationFailure,
  strip,
  interpolateMsg,
} from './utils';

const options = {
  contextMenu: true,
  shortcut: true,
};

const plugin = new CrossTabCopyPaste();
plugin.init(options);

const MAX_GET_CODE_RETRIES = 2;
const RETRY_GET_CODE_INTERVAL_MS = 500;

/**
 * Wrapper class for https://github.com/google/blockly
 * This wrapper will facilitate migrating from CDO Blockly to Google Blockly
 * by allowing us to unify the APIs so that we can switch out the underlying Blockly
 * object without affecting apps code.
 * This wrapper will contain all of our customizations to Google Blockly.
 * See also ./cdoBlocklyWrapper.js
 */
const BlocklyWrapper = function (
  this: BlocklyWrapperType,
  blocklyInstance: GoogleBlocklyInstance
) {
  this.version = BlocklyVersion.GOOGLE;
  this.blockly_ = blocklyInstance;
  this.mainWorkspace = undefined;
  this.embeddedWorkspaces = [];

  this.wrapReadOnlyProperty = function (propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function () {
        return this.blockly_[propertyName];
      },
    });
  };

  this.wrapSettableProperty = function (propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function () {
        return this.blockly_[propertyName];
      },
      set: function (newValue) {
        this.blockly_[propertyName] = newValue;
      },
    });
  };

  /**
   * Override core Blockly fields with Code.org customized versions,
   * and sets the field on our wrapper for use by our code.
   * @param {array} overrides (elements are arrays of shape [fieldRegistryName, fieldClassName, fieldClass])
   */
  this.overrideFields = function (overrides) {
    overrides.forEach(override => {
      const fieldRegistryName = override[0];
      const fieldClassName = override[1];
      const fieldClass = override[2];

      // Force Google Blockly to use our custom versions of fields
      this.blockly_.fieldRegistry.unregister(fieldRegistryName);
      this.blockly_.fieldRegistry.register(fieldRegistryName, fieldClass);

      // Add each field for when our wrapper is accessed in /apps code
      // This method helps us avoid duplicated boilerplate, but we would
      // need the type of fieldClass to align with fieldClassName
      // in order to avoid using any here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[fieldClassName] = fieldClass;
    });
  };
};

/**
 * Note that this can only be called once per page load, as this initializes
 * the navigation controller, and multiple calls to navigationController.init()
 * will throw an error.
 *
 * If this needs to be called multiple times (for example, in tests), call
 * Blockly.navigationController.dispose() before calling this function again.
 */
function initializeBlocklyWrapper(blocklyInstance: GoogleBlocklyInstance) {
  registerIfMutator();
  registerLogicCompareMutator();
  registerTextJoinMutator();
  // TODO: can we avoid using any here by converting BlocklyWrapper to a class?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocklyWrapper = new (BlocklyWrapper as any)(
    blocklyInstance
  ) as BlocklyWrapperType;

  blocklyWrapper.setInfiniteLoopTrap = function () {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.clearInfiniteLoopTrap = function () {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '';
  };

  blocklyWrapper.getInfiniteLoopTrap = function () {
    return Blockly.JavaScript.INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.loopHighlight = function (apiName, blockId) {
    let args = "'block_id_" + blockId + "'";
    if (blockId === undefined) {
      args = '%1';
    }
    return (
      '  ' + apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')')
    );
  };

  blocklyWrapper.getWorkspaceCode = function () {
    return getWorkspaceCodeHelper(0, this.getHiddenDefinitionWorkspace());
  };

  const getWorkspaceCodeHelper = (
    retryCount: number,
    hiddenWorkspace: Workspace | undefined
  ): string => {
    let workspaceCode = '';
    try {
      workspaceCode = Blockly.JavaScript.workspaceToCode(
        Blockly.mainBlockSpace
      );
      if (hiddenWorkspace) {
        workspaceCode += Blockly.JavaScript.workspaceToCode(hiddenWorkspace);
      }
      workspaceCode = strip(workspaceCode);
      getStore().dispatch(setFailedToGenerateCode(false));
    } catch (e) {
      if (retryCount < MAX_GET_CODE_RETRIES) {
        // Sometimes we need to wait for Google Blockly change handlers to complete
        // before the code will generate correctly. Retry after a short delay.
        setTimeout(() => {
          return getWorkspaceCodeHelper(retryCount + 1, hiddenWorkspace);
        }, RETRY_GET_CODE_INTERVAL_MS);
      } else {
        handleCodeGenerationFailure(
          MetricEvent.GOOGLE_BLOCKLY_GET_CODE_ERROR,
          e as Error
        );
      }
    }
    return workspaceCode;
  };

  READ_ONLY_PROPERTIES.forEach(prop => {
    blocklyWrapper.wrapReadOnlyProperty(prop);
  });

  // elements in this list should be structured as follows:
  // [field registry name for field, class name of field being overridden, class to use as override]
  const fieldOverrides: [string, string, FieldProto][] = [
    ['field_variable', 'FieldVariable', CdoFieldVariable],
    ['field_dropdown', 'FieldDropdown', CdoFieldDropdown],
    ['field_colour', 'FieldColour', CdoFieldColour],
    ['field_number', 'FieldNumber', CdoFieldNumber],
    // CdoFieldBitmap extends from a JavaScript class without typing.
    // We know it's a field, so it's safe to cast as unknown.
    ['field_bitmap', 'FieldBitmap', CdoFieldBitmap as unknown as FieldProto],
    ['field_label', 'FieldLabel', CdoFieldLabel],
    ['field_parameter', 'FieldParameter', CdoFieldParameter],
  ];
  blocklyWrapper.overrideFields(fieldOverrides);

  // Overrides applied directly to core blockly
  // TODO: Can we remove this assignment?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (blocklyWrapper.blockly_ as any).FunctionEditor = FunctionEditor;
  // TODO: Can/should we make CdoTrashcan have the same type as Trashcan?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocklyWrapper.blockly_.Trashcan = CdoTrashcan as any;

  // Code.org custom fields
  blocklyWrapper.AngleHelper = CdoAngleHelper;
  blocklyWrapper.FieldButton = CdoFieldButton;
  blocklyWrapper.FieldImage = CdoFieldImage;
  blocklyWrapper.FieldImageDropdown = CdoFieldImageDropdown;
  blocklyWrapper.FieldToggle = CdoFieldToggle;
  blocklyWrapper.FieldFlyout = CdoFieldFlyout;
  blocklyWrapper.FieldBehaviorPicker = CdoFieldBehaviorPicker;
  blocklyWrapper.FieldAnimationDropdown = CdoFieldAnimationDropdown;
  blocklyWrapper.FieldAngleDropdown = CdoFieldAngleDropdown;
  blocklyWrapper.FieldAngleTextInput = CdoFieldAngleTextInput;

  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    blocklyWrapper.blockly_.registry.DEFAULT,
    CdoVerticalFlyout,
    true /* opt_allowOverrides */
  );

  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.RENDERER,
    Renderers.GERAS,
    CdoRendererGeras,
    true /* opt_allowOverrides */
  );
  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.RENDERER,
    Renderers.THRASOS,
    CdoRendererThrasos,
    true /* opt_allowOverrides */
  );
  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.RENDERER,
    Renderers.ZELOS,
    CdoRendererZelos,
    true /* opt_allowOverrides */
  );
  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.CONNECTION_CHECKER,
    'cdo_connection_checker',
    CdoConnectionChecker,
    true /* opt_allowOverrides */
  );
  blocklyWrapper.blockly_.serialization.registry.unregister('blocks');
  blocklyWrapper.blockly_.serialization.registry.register(
    'blocks',
    new CdoBlockSerializer()
  );

  const procedureSerializer =
    new blocklyWrapper.blockly_.serialization.procedures.ProcedureSerializer(
      ObservableProcedureModel,
      ObservableParameterModel
    );

  blocklyWrapper.procedureSerializer = procedureSerializer;
  // Register the shareable procedures serializer, used for the modal function editor.
  blocklyWrapper.blockly_.serialization.registry.unregister('procedures');
  blocklyWrapper.blockly_.serialization.registry.register(
    'procedures',
    procedureSerializer
  );

  registerAllContextMenuItems();

  // These are also wrapping read only properties, but can't use wrapReadOnlyProperty
  // because the alias name is not the same as the underlying property name.
  Object.defineProperty(blocklyWrapper, 'mainBlockSpace', {
    get: function () {
      return this.mainWorkspace || this.blockly_.getMainWorkspace();
    },
  });
  Object.defineProperty(blocklyWrapper, 'mainBlockSpaceEditor', {
    get: function () {
      return this.mainWorkspace || this.blockly_.getMainWorkspace();
    },
  });
  Object.defineProperty(blocklyWrapper, 'SVG_NS', {
    get: function () {
      return this.blockly_.utils.dom.SVG_NS;
    },
  });
  Object.defineProperty(blocklyWrapper, 'selected', {
    get: function () {
      return this.blockly_.getSelected();
    },
  });
  Object.defineProperty(blocklyWrapper, 'BlockFieldHelper', {
    get: function () {
      return {
        ANGLE_HELPER: 'Angle Helper',
      };
    },
  });

  // Properties cannot be modified until wrapSettableProperty has been called
  SETTABLE_PROPERTIES.forEach(property =>
    blocklyWrapper.wrapSettableProperty(property)
  );

  // Allows for dynamically setting the workspace theme with workspace.setTheme()
  blocklyWrapper.themes = {
    [Themes.MODERN]: CdoTheme,
    [Themes.DARK]: CdoDarkTheme,
    [Themes.HIGH_CONTRAST]: CdoHighContrastTheme,
    [Themes.HIGH_CONTRAST_DARK]: CdoHighContrastDarkTheme,
    [Themes.PROTANOPIA]: CdoProtanopiaTheme,
    [Themes.PROTANOPIA_DARK]: CdoProtanopiaDarkTheme,
    [Themes.DEUTERANOPIA]: CdoDeuteranopiaTheme,
    [Themes.DEUTERANOPIA_DARK]: CdoDeuteranopiaDarkTheme,
    [Themes.TRITANOPIA]: CdoTritanopiaTheme,
    [Themes.TRITANOPIA_DARK]: CdoTritanopiaDarkTheme,
  };

  // Assign all of the properties of the javascript generator to the forBlock array
  // Prevents deprecation warnings related to https://github.com/google/blockly/pull/7150
  Object.setPrototypeOf(javascriptGenerator.forBlock, javascriptGenerator);

  blocklyWrapper.JavaScript = javascriptGenerator;
  blocklyWrapper.LineCursor = LineCursor;
  blocklyWrapper.navigationController = new NavigationController();
  // Initialize plugin.
  blocklyWrapper.navigationController.init();
  blocklyWrapper.navigationController.cursorType = cdoUtils.getUserCursorType();

  // Wrap SNAP_RADIUS property, and in the setter make sure we keep SNAP_RADIUS and CONNECTING_SNAP_RADIUS in sync.
  // See https://github.com/google/blockly/issues/2217
  Object.defineProperty(blocklyWrapper, 'SNAP_RADIUS', {
    get: function () {
      return this.blockly_.SNAP_RADIUS;
    },
    set: function (snapRadius) {
      this.blockly_.SNAP_RADIUS = snapRadius;
      this.blockly_.CONNECTING_SNAP_RADIUS = snapRadius;
    },
  });

  blocklyWrapper.addChangeListener = function (blockspace, handler) {
    blockspace.addChangeListener(handler);
  };

  const googleBlocklyMixin = blocklyWrapper.BlockSvg.prototype.mixin;
  blocklyWrapper.BlockSvg.prototype.mixin = function (mixinObj) {
    googleBlocklyMixin.call(this, mixinObj, true);
  };

  const extendedBlockSvg = blocklyWrapper.BlockSvg
    .prototype as ExtendedBlockSvg;

  extendedBlockSvg.isVisible = function () {
    // TODO (eventually) - All Google Blockly blocks are currently visible.
    // This shouldn't be a problem until we convert other labs.
    return true;
  };

  extendedBlockSvg.isUserVisible = function () {
    // Used for EXTRA_TOP_BLOCKS_FAIL feedback
    // Mainline Blockly doesn't support invisible blocks. If a block should be
    // invisible, we instead load it to the hidden workspace. We use custom
    // serialization hooks to manage this block state.
    // Any block on the main workspace is visible.
    return this.workspace === Blockly.getMainWorkspace();
  };

  // Labs like Maze and Artist turn undeletable blocks gray.
  extendedBlockSvg.shouldBeGrayedOut = function () {
    return (
      blocklyWrapper.grayOutUndeletableBlocks &&
      !this.workspace.isReadOnly() &&
      !this.isDeletable()
    );
  };

  const originalSetDeletable = blocklyWrapper.Block.prototype.setDeletable;
  // Replace the original setDeletable with a version that will also re-color
  // blocks if they are meant to be gray.
  extendedBlockSvg.setDeletable = function (deletable) {
    originalSetDeletable.call(this, deletable);
    if (this.shouldBeGrayedOut()) {
      Blockly.cdoUtils.setHSV(this, ...BlockColors.DISABLED);
    }
  };

  const extendedInput = blocklyWrapper.Input.prototype as ExtendedInput;
  const extendedConnection = blocklyWrapper.Connection
    .prototype as ExtendedConnection;

  extendedInput.setStrictCheck = function (check) {
    return this.setCheck(check);
  };

  // We use fieldRow because it is public.
  extendedInput.getFieldRow = function () {
    return this.fieldRow;
  };

  /**
   * Enable the specified field helper with the specified options for this
   * input's connection
   * @param {string} fieldHelper the field helper to retrieve. One of
   *        Blockly.BlockFieldHelper
   * @param {*} options for this helper
   * @return {!Blockly.Input} The input being modified (to allow chaining).
   */
  extendedInput.addFieldHelper = function (
    fieldHelper: string,
    options: FieldHelperOptions
  ) {
    (this.connection as ExtendedConnection).addFieldHelper(
      fieldHelper,
      options
    );
    return this;
  };

  extendedConnection.addFieldHelper = function (
    fieldHelper: string,
    options: FieldHelperOptions
  ) {
    if (!this.fieldHelpers_) {
      this.fieldHelpers_ = {};
    }
    this.fieldHelpers_[fieldHelper] = options;
  };
  extendedConnection.getFieldHelperOptions = function (fieldHelper: string) {
    return this.fieldHelpers_ && this.fieldHelpers_[fieldHelper];
  };
  const extendedBlock = blocklyWrapper.Block.prototype as ExtendedBlock;

  extendedBlock.interpolateMsg = interpolateMsg;
  extendedBlock.setStrictOutput = function (isOutput, check) {
    return this.setOutput(isOutput, check);
  };

  const originalSetOutput = blocklyWrapper.Block.prototype.setOutput;
  // Replaces the original setOutput method with a custom version that will handle the case when "None" is passed appropriately
  // See: https://github.com/code-dot-org/code-dot-org/blob/9d63cbcbfd84b8179ae2519adbb5869cbc319643/apps/src/blocklyAddons/cdoConstants.js#L9
  extendedBlock.setOutput = function (isOutput, check) {
    if (check === 'None') {
      return originalSetOutput.call(this, isOutput, null);
    } else {
      return originalSetOutput.call(this, isOutput, check);
    }
  };

  // Block fields are referred to as titles in CDO Blockly.
  extendedBlock.setTitleValue = function (newValue, name) {
    return this.setFieldValue(newValue, name);
  };

  const extendedWorkspaceSvg = blocklyWrapper.WorkspaceSvg
    .prototype as ExtendedWorkspaceSvg;

  // Called by StudioApp, but only implemented for CDO Blockly.
  extendedWorkspaceSvg.addUnusedBlocksHelpListener = function () {};

  extendedWorkspaceSvg.getAllUsedBlocks = function () {
    return this.getAllBlocks().filter(
      block => block.isEnabled() && block.getRootBlock().isEnabled()
    );
  };

  extendedWorkspaceSvg.isReadOnly = function () {
    return blocklyWrapper.readOnly || this.options.readOnly;
  };

  // Used in levels when starting over or resetting Version History
  const googleBlocklyBlocklyClear = blocklyWrapper.WorkspaceSvg.prototype.clear;
  extendedWorkspaceSvg.clear = function () {
    googleBlocklyBlocklyClear.call(this);
    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.getVariableMap().addVariables(this.globalVariables);
    }
  };

  // Used in levels with pre-defined "Blockly Variables"
  extendedWorkspaceSvg.registerGlobalVariables = function (variableList) {
    this.globalVariables = variableList;
    this.getVariableMap().addVariables(variableList);
  };

  extendedWorkspaceSvg.getContainer = function () {
    return this.svgGroup_.parentNode;
  };

  extendedWorkspaceSvg.events = {
    dispatchEvent: () => {}, // TODO
  };

  // TODO - called by StudioApp, not sure whether they're still needed.
  extendedWorkspaceSvg.setEnableToolbox = function () {};
  extendedWorkspaceSvg.traceOn = function () {};

  const extendedVariableMap = blocklyWrapper.VariableMap
    .prototype as ExtendedVariableMap;

  extendedVariableMap.addVariables = function (variableList) {
    variableList.forEach(varName => this.createVariable(varName));
  };

  if (DCDO.get('blockly-move', true)) {
    overrideHandleTouchMove(blocklyWrapper);
  }

  // Used for spritelab behavior blocks.
  // We can remove this once we are ready to no longer support sprite lab on CDO Blockly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (blocklyWrapper.Block as any).createProcedureDefinitionBlock = function () {};

  // In cdo this is used to add "create a behavior" button to the toolbox
  // Once we have fully moved to Google Blockly we can remove this.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (blocklyWrapper.Flyout as any).configure = function () {};

  blocklyWrapper.getGenerator = function () {
    return this.JavaScript;
  };

  blocklyWrapper.addEmbeddedWorkspace = function (workspace) {
    this.embeddedWorkspaces.push(workspace.id);
  };

  blocklyWrapper.isEmbeddedWorkspace = function (workspace) {
    return this.embeddedWorkspaces.includes(workspace.id);
  };

  blocklyWrapper.findEmptyContainerBlock = function (blocks) {
    for (const block of blocks) {
      const emptyInput = block.inputList.find(
        input =>
          input.type === blocklyWrapper.inputTypes.STATEMENT &&
          input.connection?.targetConnection === null
      );
      if (emptyInput) {
        return block;
      }
    }
    return null;
  };

  blocklyWrapper.BlockSpace = {
    EVENTS: WORKSPACE_EVENTS,
    onMainBlockSpaceCreated: callback => {
      if (Blockly.mainBlockSpace) {
        callback();
      } else {
        document.addEventListener(
          Blockly.BlockSpace.EVENTS.MAIN_BLOCK_SPACE_CREATED,
          callback
        );
      }
    },
  };

  // An embedded workspace is one that only displays blocks, but never
  // runs them. It is used for things like hint blocks, blocks in instructions,
  // and previewing blocks for levelbuilders.
  // We used to refer to these as "readOnlyBlockSpaces", which was confusing with normal,
  // read only workspaces.
  blocklyWrapper.createEmbeddedWorkspace = function (
    container,
    xml,
    options = {}
  ) {
    const theme = cdoUtils.getUserTheme(options.theme as Theme);
    const workspace = new Blockly.WorkspaceSvg({
      readOnly: true,
      theme: theme,
      plugins: {},
      RTL: options.rtl,
      renderer: options.renderer || Renderers.DEFAULT,
    } as Options);
    // Track that this is and embedded workspace to avoid trying
    // to run logic on it to ensure things run properly (such as procedures).
    blocklyWrapper.addEmbeddedWorkspace(workspace);
    const svg = Blockly.utils.dom.createSvgElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:html': 'http://www.w3.org/1999/xhtml',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        version: '1.1',
        class: `${Renderers.DEFAULT}-renderer modern-theme readOnlyBlockSpace injectionDiv`,
      },
      null
    );

    // Core Blockly requires a container div to be LTR, regardless of page direction.
    container.setAttribute('dir', 'LTR');
    container.style.display = 'inline-block';
    container.appendChild(svg);
    svg.appendChild(workspace.createDom());
    // We do not include hidden definitions in embedded workspaces
    // because embedded workspaces are only used for displaying blocks.
    const includeHiddenDefinitions = false;
    Blockly.cdoUtils.loadBlocksToWorkspace(
      workspace,
      Blockly.Xml.domToText(xml),
      includeHiddenDefinitions
    );

    // Loop through all the parent blocks and remove vertical translation value
    // This makes the output more condensed and readable, while preserving
    // horizontal translation values for RTL rendering.
    const blocksInWorkspace = workspace.getAllBlocks();
    blocksInWorkspace
      .filter(block => block.getParent() === null)
      .forEach(block => {
        const svgTransformList = block.getSvgRoot().transform.baseVal;
        const svgTransform = svgTransformList.getItem(0);
        const svgTranslationX = svgTransform.matrix.e;
        svgTransform.setTranslate(svgTranslationX, 0);
      });

    // Shrink SVG to size of the block
    const bbox = (svg as SVGGraphicsElement).getBBox();
    svg.setAttribute('height', `${bbox.height + bbox.y}`);
    svg.setAttribute('width', `${bbox.width + bbox.x}`);
    workspace.setTheme(theme);
    return workspace;
  };

  blocklyWrapper.inject = function (container, opt_options) {
    // Set the default value for hasLoadedBlocks to false.
    blocklyWrapper.hasLoadedBlocks = false;
    if (!opt_options) {
      opt_options = {};
    }
    // We override inject and have extra options we pass in, so we cast to utilize those options here.
    const optOptionsExtended = opt_options as ExtendedBlocklyOptions;
    const options = {
      ...optOptionsExtended,
      theme: cdoUtils.getUserTheme(optOptionsExtended.theme as Theme),
      trashcan: false, // Don't use default trashcan.
      move: {
        wheel: true,
        drag: true,
        scrollbars: {
          horizontal: true,
          vertical: true,
        },
      },
      plugins: {
        blockDragger: ScrollBlockDragger,
        metricsManager: CdoMetricsManager,
        connectionChecker: CdoConnectionChecker,
      },
      renderer: optOptionsExtended.renderer || Renderers.DEFAULT,
      comments: false,
      media: '/blockly/media/google_blockly',
      modalInputs: false, // Prevents pop-up editor on mobile
    };
    // Google Blockly doesn't support invisible blocks, so we want to prevent
    // them from showing up in the toolbox.
    if (typeof options.toolbox === 'string') {
      options.toolbox = Blockly.Xml.domToText(
        removeInvisibleBlocks(Blockly.Xml.textToDom(options.toolbox))
      );
    }
    // CDO Blockly takes assetUrl as an inject option, and it's used throughout
    // apps, so we should also set it here.
    blocklyWrapper.assetUrl =
      optOptionsExtended.assetUrl || ((path: string) => `./${path}`);

    // CDO Blockly takes customSimpleDialog as an inject option and uses it
    // instead of the default prompt dialogs, so we should also set it here.
    blocklyWrapper.customSimpleDialog = optOptionsExtended.customSimpleDialog;

    // In order to prevent writing duplicate solution entries to the level_sources table,
    // we strip block ids from XML when saving. An exception is made for block ids that
    // are explicitly set in the level's toolbox or start blocks.
    blocklyWrapper.levelBlockIds =
      optOptionsExtended.levelBlockIds || new Set<string>();

    // Shrink container to make room for the workspace header
    if (!optOptionsExtended.isBlockEditMode) {
      (
        container as HTMLElement
      ).style.height = `calc(100% - ${styleConstants['workspace-headers-height']}px)`;
    }
    blocklyWrapper.isStartMode = !!optOptionsExtended.editBlocks;
    blocklyWrapper.isToolboxMode =
      optOptionsExtended.editBlocks === 'toolbox_blocks';
    blocklyWrapper.toolboxBlocks = options.toolbox;
    blocklyWrapper.showUnusedBlocks = options.showUnusedBlocks;
    blocklyWrapper.blockLimitMap = cdoUtils.createBlockLimitMap();
    const workspace = blocklyWrapper.blockly_.inject(
      container,
      options
    ) as ExtendedWorkspaceSvg;

    blocklyWrapper.grayOutUndeletableBlocks =
      !!options.grayOutUndeletableBlocks;
    blocklyWrapper.topLevelProcedureAutopopulate =
      !!options.topLevelProcedureAutopopulate;
    blocklyWrapper.readOnly = !!opt_options.readOnly;

    if (options.noFunctionBlockFrame) {
      workspace.noFunctionBlockFrame = options.noFunctionBlockFrame;
    }

    blocklyWrapper.navigationController.addWorkspace(workspace);

    blocklyWrapper.getNewCursor = function (type) {
      switch (type) {
        case 'basic':
          return new blocklyWrapper.BasicCursor();
        case 'line':
          return new blocklyWrapper.LineCursor();
        case 'default':
        default:
          return new blocklyWrapper.Cursor();
      }
    };

    if (!blocklyWrapper.isStartMode && !optOptionsExtended.isBlockEditMode) {
      workspace.addChangeListener(disableOrphans);
    }
    if (blocklyWrapper.blockLimitMap && blocklyWrapper.blockLimitMap.size > 0) {
      workspace.addChangeListener(updateBlockLimits);
    }

    // When either the main workspace or the toolbox workspace viewport
    // changes, adjust any callouts so they stay pointing to the appropriate
    // location.
    workspace.addChangeListener(adjustCalloutsOnViewportChange);
    workspace
      .getFlyout()
      ?.getWorkspace()
      ?.addChangeListener(adjustCalloutsOnViewportChange);

    initializeScrollbarPair(workspace);

    window.addEventListener('resize', reflowToolbox);

    document.dispatchEvent(
      utils.createEvent(Blockly.BlockSpace.EVENTS.MAIN_BLOCK_SPACE_CREATED)
    );

    const scrollOptionsPlugin = new ScrollOptions(workspace);
    scrollOptionsPlugin.init();

    const trashcan = new CdoTrashcan(workspace);
    trashcan.init();

    blocklyWrapper.setMainWorkspace(workspace);

    if (!optOptionsExtended.useBlocklyDynamicCategories) {
      // Same flyout callbacks are used for both main workspace categories
      // and categories when modal function editor is enabled.
      workspace.registerToolboxCategoryCallback(
        'PROCEDURE',
        functionsFlyoutCategory
      );
      workspace.registerToolboxCategoryCallback(
        'VARIABLE',
        variablesFlyoutCategory
      );
    }

    workspace.registerToolboxCategoryCallback(
      'Behavior',
      behaviorsFlyoutCategory
    );

    // Hidden workspace where we can put function definitions.
    const hiddenDefinitionWorkspace =
      new Blockly.Workspace() as ExtendedWorkspace;
    hiddenDefinitionWorkspace.addChangeListener(disableOrphans);
    // The hidden definition workspace is not rendered, so do not try to add
    // svg frames around the definitions.
    hiddenDefinitionWorkspace.noFunctionBlockFrame = true;
    blocklyWrapper.setHiddenDefinitionWorkspace(hiddenDefinitionWorkspace);
    blocklyWrapper.useModalFunctionEditor = options.useModalFunctionEditor;
    // Disable parameter editing by default (e.g. Lab2)
    blocklyWrapper.enableParamEditing = options.disableParamEditing === false;

    if (options.useModalFunctionEditor) {
      // If the modal function editor is enabled for this level,
      // initialize the modal function editor.
      blocklyWrapper.functionEditor = new FunctionEditor();
      blocklyWrapper.functionEditor.init(options);
    }

    return workspace;
  };

  // Used by StudioApp to tell Blockly to resize for Mobile Safari.
  blocklyWrapper.fireUiEvent = function (element, eventName) {
    if (eventName === 'resize') {
      blocklyWrapper.svgResize(blocklyWrapper.mainBlockSpace);
    }
  };

  blocklyWrapper.setMainWorkspace = function (mainWorkspace) {
    this.mainWorkspace = mainWorkspace;
  };

  blocklyWrapper.setHiddenDefinitionWorkspace = function (
    hiddenDefinitionWorkspace
  ) {
    this.hiddenDefinitionWorkspace = hiddenDefinitionWorkspace;
  };

  blocklyWrapper.getHiddenDefinitionWorkspace = function () {
    return this.hiddenDefinitionWorkspace;
  };

  blocklyWrapper.getMainWorkspace = function () {
    return blocklyWrapper.mainBlockSpace;
  };

  blocklyWrapper.getFunctionEditorWorkspace = function () {
    return blocklyWrapper.functionEditor?.getWorkspace();
  };

  // Google Blockly labs also need to clear separate workspaces for the function editor.
  blocklyWrapper.clearAllStudentWorkspaces = function () {
    // Disable Blockly events to prevent unnecessary event mirroring
    Blockly.Events.disable();

    const studentWorkspaces = [
      Blockly.getMainWorkspace(),
      Blockly.getFunctionEditorWorkspace(),
      Blockly.getHiddenDefinitionWorkspace(),
    ];

    studentWorkspaces.forEach(workspace => {
      if (workspace) {
        workspace.clear();
        workspace.getProcedureMap().clear();
      }
    });

    Blockly.Events.enable();
  };

  blocklyWrapper.customBlocks = customBlocks;

  initializeBlocklyXml(blocklyWrapper);
  initializeGenerator(blocklyWrapper);
  initializeVariables(blocklyWrapper);
  initializeCdoConstants(blocklyWrapper);
  initializeCss(blocklyWrapper);

  blocklyWrapper.Blocks.unknown = UNKNOWN_BLOCK;
  blocklyWrapper.JavaScript.unknown = () => '/* unknown block */\n';

  blocklyWrapper.cdoUtils = cdoUtils;
  blocklyWrapper.getPointerBlockImageUrl = getPointerBlockImageUrl;

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
