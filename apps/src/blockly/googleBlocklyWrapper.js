import {javascriptGenerator} from 'blockly/javascript';
import {
  ScrollBlockDragger,
  ScrollOptions,
} from '@blockly/plugin-scroll-options';
import {NavigationController} from '@blockly/keyboard-navigation';
import {CrossTabCopyPaste} from '@blockly/plugin-cross-tab-copy-paste';
import {BlocklyVersion} from '@cdo/apps/blockly/constants';
import styleConstants from '@cdo/apps/styleConstants';
import * as utils from '@cdo/apps/utils';
import initializeCdoConstants from './addons/cdoConstants';
import CdoFieldAngle from './addons/cdoFieldAngle';
import CdoFieldButton from './addons/cdoFieldButton';
import CdoFieldDropdown from './addons/cdoFieldDropdown';
import CdoFieldToggle from './addons/cdoFieldToggle';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldFlyout from './addons/cdoFieldFlyout';
import CdoFieldMultilineInput from './addons/cdoFieldMultilineInput';
import CdoFieldNumber from './addons/cdoFieldNumber';
import CdoFieldTextInput from './addons/cdoFieldTextInput';
import CdoFieldVariable from './addons/cdoFieldVariable';
import FunctionEditor from './addons/functionEditor';
import initializeGenerator from './addons/cdoGenerator';
import CdoMetricsManager from './addons/cdoMetricsManager';
import CdoRendererGeras from './addons/cdoRendererGeras';
import {CdoRendererThrasos} from './addons/cdoRendererThrasos';
import CdoRendererZelos from './addons/cdoRendererZelos';
import CdoTheme from './themes/cdoTheme';
import CdoDarkTheme from './themes/cdoDark';
import CdoHighContrastTheme from './themes/cdoHighContrast';
import CdoHighContrastDarkTheme from './themes/cdoHighContrastDark';
import {
  CdoProtanopiaTheme,
  CdoDeuteranopiaTheme,
  CdoTritanopiaTheme,
} from './themes/cdoAccessibleThemes';
import {
  CdoProtanopiaDarkTheme,
  CdoDeuteranopiaDarkTheme,
  CdoTritanopiaDarkTheme,
} from './themes/cdoAccessibleDarkThemes';
import initializeTouch from './addons/cdoTouch';
import CdoTrashcan from './addons/cdoTrashcan';
import * as cdoUtils from './addons/cdoUtils';
import initializeVariables from './addons/cdoVariables';
import CdoVerticalFlyout from './addons/cdoVerticalFlyout';
import initializeBlocklyXml from './addons/cdoXml';
import initializeCss from './addons/cdoCss';
import CdoConnectionChecker from './addons/cdoConnectionChecker';
import {UNKNOWN_BLOCK} from './addons/unknownBlock';
import {registerAllContextMenuItems} from './addons/contextMenu';
import BlockSvgUnused, {onBlockClickDragDelete} from './addons/blockSvgUnused';
import {ToolboxType, Themes, Renderers} from './constants';
import {flyoutCategory as functionsFlyoutCategory} from './customBlocks/googleBlockly/proceduresBlocks';
import {flyoutCategory as behaviorsFlyoutCategory} from './customBlocks/googleBlockly/behaviorBlocks';
import CdoBlockSerializer from './addons/cdoBlockSerializer.js';
import customBlocks from './customBlocks/googleBlockly/index.js';
import CdoFieldImage from './addons/cdoFieldImage';
import {getPointerBlockImageUrl} from './addons/cdoSpritePointer';
import {ObservableProcedureModel} from '@blockly/block-shareable-procedures';
import {CdoParameterModel} from './customBlocks/googleBlockly/mutators/parameterModel';
const options = {
  contextMenu: true,
  shortcut: true,
};

const plugin = new CrossTabCopyPaste();
plugin.init(options);

const BLOCK_PADDING = 7; // Calculated from difference between block height and text height

const INFINITE_LOOP_TRAP =
  '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

/**
 * Wrapper class for https://github.com/google/blockly
 * This wrapper will facilitate migrating from CDO Blockly to Google Blockly
 * by allowing us to unify the APIs so that we can switch out the underlying Blockly
 * object without affecting apps code.
 * This wrapper will contain all of our customizations to Google Blockly.
 * See also ./cdoBlocklyWrapper.js
 */
const BlocklyWrapper = function (blocklyInstance) {
  this.version = BlocklyVersion.GOOGLE;
  this.blockly_ = blocklyInstance;

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
      this[fieldClassName] = fieldClass;
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
function initializeBlocklyWrapper(blocklyInstance) {
  const blocklyWrapper = new BlocklyWrapper(blocklyInstance);

  blocklyWrapper.setInfiniteLoopTrap = function () {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.clearInfiniteLoopTrap = function () {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '';
  };

  blocklyWrapper.getInfiniteLoopTrap = function () {
    return Blockly.JavaScript.INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.loopHighlight = function () {}; // TODO
  blocklyWrapper.getWorkspaceCode = function () {
    return Blockly.JavaScript.workspaceToCode(Blockly.mainBlockSpace);
  };

  blocklyWrapper.wrapReadOnlyProperty('ALIGN_CENTRE');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_LEFT');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_RIGHT');
  blocklyWrapper.wrapReadOnlyProperty('applab_locale');
  blocklyWrapper.wrapReadOnlyProperty('blockRendering');
  blocklyWrapper.wrapReadOnlyProperty('Block');
  blocklyWrapper.wrapReadOnlyProperty('BlockFieldHelper');
  blocklyWrapper.wrapReadOnlyProperty('Blocks');
  blocklyWrapper.wrapReadOnlyProperty('BlockSvg');
  blocklyWrapper.wrapReadOnlyProperty('browserEvents');
  blocklyWrapper.wrapReadOnlyProperty('blockRendering.ConstantProvider');
  blocklyWrapper.wrapReadOnlyProperty('common');
  blocklyWrapper.wrapReadOnlyProperty('common_locale');
  blocklyWrapper.wrapReadOnlyProperty('ComponentManager');
  blocklyWrapper.wrapReadOnlyProperty('Connection');
  blocklyWrapper.wrapReadOnlyProperty('ConnectionType');
  blocklyWrapper.wrapReadOnlyProperty('ContextMenu');
  blocklyWrapper.wrapReadOnlyProperty('contractEditor');
  blocklyWrapper.wrapReadOnlyProperty('createBlockDefinitionsFromJsonArray');
  blocklyWrapper.wrapReadOnlyProperty('createSvgElement');
  blocklyWrapper.wrapReadOnlyProperty('Css');
  blocklyWrapper.wrapReadOnlyProperty('DropDownDiv');
  blocklyWrapper.wrapReadOnlyProperty('disableVariableEditing');
  blocklyWrapper.wrapReadOnlyProperty('Events');
  blocklyWrapper.wrapReadOnlyProperty('Extensions');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldColour');
  blocklyWrapper.wrapReadOnlyProperty('FieldColourDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldIcon');
  blocklyWrapper.wrapReadOnlyProperty('FieldLabel');
  blocklyWrapper.wrapReadOnlyProperty('FieldParameter');
  blocklyWrapper.wrapReadOnlyProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapReadOnlyProperty('fieldRegistry');
  blocklyWrapper.wrapReadOnlyProperty('fish_locale');
  blocklyWrapper.wrapReadOnlyProperty('Flyout');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalBlockUtils');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalTypeColors');
  blocklyWrapper.wrapReadOnlyProperty('FunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('functionEditor');
  blocklyWrapper.wrapReadOnlyProperty('gamelab_locale');
  blocklyWrapper.wrapReadOnlyProperty('getMainWorkspace');
  blocklyWrapper.wrapReadOnlyProperty('Generator');
  blocklyWrapper.wrapReadOnlyProperty('geras');
  blocklyWrapper.wrapReadOnlyProperty('thrasos');
  blocklyWrapper.wrapReadOnlyProperty('zelos');
  blocklyWrapper.wrapReadOnlyProperty('getRelativeXY');
  blocklyWrapper.wrapReadOnlyProperty('googlecode');
  blocklyWrapper.wrapReadOnlyProperty('hasCategories');
  blocklyWrapper.wrapReadOnlyProperty('html');
  blocklyWrapper.wrapReadOnlyProperty('Input');
  blocklyWrapper.wrapReadOnlyProperty('inputTypes');
  blocklyWrapper.wrapReadOnlyProperty('INPUT_VALUE');
  blocklyWrapper.wrapReadOnlyProperty('js');
  blocklyWrapper.wrapReadOnlyProperty('MenuItem');
  blocklyWrapper.wrapReadOnlyProperty('MetricsManager');
  blocklyWrapper.wrapReadOnlyProperty('modalBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('Msg');
  blocklyWrapper.wrapReadOnlyProperty('Names');
  blocklyWrapper.wrapReadOnlyProperty('netsim_locale');
  blocklyWrapper.wrapReadOnlyProperty('Procedures');
  blocklyWrapper.wrapReadOnlyProperty('registry');
  blocklyWrapper.wrapReadOnlyProperty('removeChangeListener');
  blocklyWrapper.wrapReadOnlyProperty('RTL');
  blocklyWrapper.wrapReadOnlyProperty('Scrollbar');
  blocklyWrapper.wrapReadOnlyProperty('selected');
  blocklyWrapper.wrapReadOnlyProperty('serialization');
  blocklyWrapper.wrapReadOnlyProperty('SPRITE');
  blocklyWrapper.wrapReadOnlyProperty('svgResize');
  blocklyWrapper.wrapReadOnlyProperty('tutorialExplorer_locale');
  blocklyWrapper.wrapReadOnlyProperty('useContractEditor');
  blocklyWrapper.wrapReadOnlyProperty('useModalFunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('utils');
  blocklyWrapper.wrapReadOnlyProperty('Toolbox');
  blocklyWrapper.wrapReadOnlyProperty('Touch');
  blocklyWrapper.wrapReadOnlyProperty('Trashcan');
  blocklyWrapper.wrapReadOnlyProperty('VARIABLE_CATEGORY_NAME');
  blocklyWrapper.wrapReadOnlyProperty('Variables');
  blocklyWrapper.wrapReadOnlyProperty('VariableMap');
  blocklyWrapper.wrapReadOnlyProperty('VariableModel');
  blocklyWrapper.wrapReadOnlyProperty('weblab_locale');
  blocklyWrapper.wrapReadOnlyProperty('WidgetDiv');
  blocklyWrapper.wrapReadOnlyProperty('Workspace');
  blocklyWrapper.wrapReadOnlyProperty('WorkspaceSvg');
  blocklyWrapper.wrapReadOnlyProperty('Xml');

  // elements in this list should be structured as follows:
  // [field registry name for field, class name of field being overridden, class to use as override]
  const fieldOverrides = [
    ['field_variable', 'FieldVariable', CdoFieldVariable],
    ['field_dropdown', 'FieldDropdown', CdoFieldDropdown],
    // Overrides required for a customization of FieldTextInput
    // and its child classes.
    ['field_input', 'FieldTextInput', CdoFieldTextInput],
    ['field_number', 'FieldNumber', CdoFieldNumber],
    ['field_angle', 'FieldAngle', CdoFieldAngle],
    ['field_multilinetext', 'FieldMultilineInput', CdoFieldMultilineInput],
  ];
  blocklyWrapper.overrideFields(fieldOverrides);

  // Overrides applied directly to core blockly
  blocklyWrapper.blockly_.FunctionEditor = FunctionEditor;
  blocklyWrapper.blockly_.Trashcan = CdoTrashcan;

  // Code.org custom fields
  blocklyWrapper.FieldButton = CdoFieldButton;
  blocklyWrapper.FieldImage = CdoFieldImage;
  blocklyWrapper.FieldImageDropdown = CdoFieldImageDropdown;
  blocklyWrapper.FieldToggle = CdoFieldToggle;
  blocklyWrapper.FieldFlyout = CdoFieldFlyout;

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
    new CdoBlockSerializer(),
    true /* opt_allowOverrides */
  );

  const procedureSerializer =
    new blocklyWrapper.blockly_.serialization.procedures.ProcedureSerializer(
      ObservableProcedureModel,
      CdoParameterModel
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
      return this.blockly_.getMainWorkspace();
    },
  });
  Object.defineProperty(blocklyWrapper, 'mainBlockSpaceEditor', {
    get: function () {
      return this.blockly_.getMainWorkspace();
    },
  });
  Object.defineProperty(blocklyWrapper, 'SVG_NS', {
    get: function () {
      return this.blockly_.utils.dom.SVG_NS;
    },
  });

  // Properties cannot be modified until wrapSettableProperty has been called
  blocklyWrapper.wrapSettableProperty('assetUrl');
  blocklyWrapper.wrapSettableProperty('behaviorEditor');
  blocklyWrapper.wrapSettableProperty('customSimpleDialog');
  blocklyWrapper.wrapSettableProperty('BROKEN_CONTROL_POINTS');
  blocklyWrapper.wrapSettableProperty('BUMP_UNCONNECTED');
  blocklyWrapper.wrapSettableProperty('HSV_SATURATION');
  blocklyWrapper.wrapSettableProperty('JavaScript');
  blocklyWrapper.wrapSettableProperty('readOnly');
  blocklyWrapper.wrapSettableProperty('showUnusedBlocks');
  blocklyWrapper.wrapSettableProperty('typeHints');
  blocklyWrapper.wrapSettableProperty('valueTypeTabShapeMap');

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
  blocklyWrapper.JavaScript = javascriptGenerator;
  blocklyWrapper.navigationController = new NavigationController();
  // Initialize plugin.
  blocklyWrapper.navigationController.init();

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
  blocklyWrapper.BlockSvg.prototype.mixin = function (
    mixinObj,
    opt_disableCheck
  ) {
    googleBlocklyMixin.call(this, mixinObj, true);
  };

  blocklyWrapper.BlockSvg.prototype.addUnusedBlockFrame = function () {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this);
      this.unusedSvg_.render(this.svgGroup_, this.RTL);
    }
  };

  blocklyWrapper.BlockSvg.prototype.isUnused = function () {
    return this.disabled;
  };

  blocklyWrapper.BlockSvg.prototype.removeUnusedBlockFrame = function () {
    if (this.unusedSvg_) {
      this.unusedSvg_.dispose();
      this.unusedSvg_ = null;
    }
  };

  blocklyWrapper.BlockSvg.prototype.getHexColour = function () {
    // In cdo Blockly labs, getColour() returns a numerical hue value, while
    // in newer Google Blockly it returns a hexademical color value string.
    // This is only used for locationPicker blocks and can likely be deprecated
    // once Sprite Lab is using Google Blockly.
    return this.getColour();
  };

  blocklyWrapper.BlockSvg.prototype.isVisible = function () {
    // TODO (eventually) - All Google Blockly blocks are currently visible.
    // This shouldn't be a problem until we convert other labs.
    return true;
  };

  blocklyWrapper.BlockSvg.prototype.isUserVisible = function () {
    // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
    return false;
  };

  blocklyWrapper.Input.prototype.setStrictCheck = function (check) {
    return this.setCheck(check);
  };
  blocklyWrapper.Block.prototype.setStrictOutput = function (isOutput, check) {
    return this.setOutput(isOutput, check);
  };

  const originalSetOutput = blocklyWrapper.Block.prototype.setOutput;
  blocklyWrapper.Block.prototype.setOutput = function (isOutput, check) {
    if (check === 'None') {
      return originalSetOutput.call(this, isOutput, null);
    } else {
      return originalSetOutput.call(this, isOutput, check);
    }
  };

  // Block fields are referred to as titles in CDO Blockly.
  blocklyWrapper.Block.prototype.setTitleValue = function (newValue, name) {
    return this.setFieldValue(newValue, name);
  };

  // We use fieldRow because it is public.
  blocklyWrapper.Input.prototype.getFieldRow = function () {
    return this.fieldRow;
  };

  blocklyWrapper.WorkspaceSvg.prototype.addUnusedBlocksHelpListener =
    function () {
      blocklyWrapper.browserEvents.bind(
        blocklyWrapper.mainBlockSpace.getCanvas(),
        blocklyWrapper.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
        blocklyWrapper.mainBlockSpace,
        function () {
          this.getTopBlocks().forEach(block => {
            if (block.disabled) {
              block.addUnusedBlockFrame();
            }
          });
        }
      );
    };

  blocklyWrapper.WorkspaceSvg.prototype.getAllUsedBlocks = function () {
    return this.getAllBlocks().filter(block => !block.disabled);
  };

  // Used in levels when starting over or resetting Version History
  const googleBlocklyBlocklyClear = blocklyWrapper.WorkspaceSvg.prototype.clear;
  blocklyWrapper.WorkspaceSvg.prototype.clear = function () {
    googleBlocklyBlocklyClear.call(this);
    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.getVariableMap().addVariables(this.globalVariables);
    }
  };

  // Used in levels with pre-defined "Blockly Variables"
  blocklyWrapper.WorkspaceSvg.prototype.registerGlobalVariables = function (
    variableList
  ) {
    this.globalVariables = variableList;
    this.getVariableMap().addVariables(variableList);
  };

  blocklyWrapper.WorkspaceSvg.prototype.getContainer = function () {
    return this.svgGroup_.parentNode;
  };

  const googleBlocklyBlocklyResize =
    blocklyWrapper.WorkspaceSvg.prototype.resize;
  blocklyWrapper.WorkspaceSvg.prototype.resize = function () {
    googleBlocklyBlocklyResize.call(this);
    if (cdoUtils.getToolboxType() === ToolboxType.UNCATEGORIZED) {
      this.flyout_?.resize();
    }
  };

  blocklyWrapper.WorkspaceSvg.prototype.events = {
    dispatchEvent: () => {}, // TODO
  };

  // TODO - called by StudioApp, not sure whether they're still needed.
  blocklyWrapper.WorkspaceSvg.prototype.setEnableToolbox = function (
    enabled
  ) {};
  blocklyWrapper.WorkspaceSvg.prototype.traceOn = function (armed) {};

  blocklyWrapper.VariableMap.prototype.addVariables = function (variableList) {
    variableList.forEach(varName => this.createVariable(varName));
  };

  // TODO - used for spritelab behavior blocks
  blocklyWrapper.Block.createProcedureDefinitionBlock = function (config) {};

  // TODO - used to add "create a behavior" button to the toolbox
  blocklyWrapper.Flyout.configure = function (type, config) {};

  blocklyWrapper.getGenerator = function () {
    return this.JavaScript;
  };

  // TODO - used for validation in CS in Algebra.
  blocklyWrapper.findEmptyContainerBlock = function () {};
  blocklyWrapper.BlockSpace = {
    EVENTS: {
      MAIN_BLOCK_SPACE_CREATED: 'mainBlockSpaceCreated',
      EVENT_BLOCKS_IMPORTED: 'blocksImported',
      BLOCK_SPACE_CHANGE: 'blockSpaceChange',
      BLOCK_SPACE_SCROLLED: 'blockSpaceScrolled',
      RUN_BUTTON_CLICKED: 'runButtonClicked',
    },
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

    createReadOnlyBlockSpace: (container, xml, options) => {
      const theme = cdoUtils.getUserTheme(options.theme);
      const workspace = new Blockly.WorkspaceSvg({
        readOnly: true,
        theme: theme,
        plugins: {},
        RTL: options.rtl,
        renderer: options.renderer || Renderers.DEFAULT,
      });
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
      Blockly.cdoUtils.loadBlocksToWorkspace(
        workspace,
        Blockly.Xml.domToText(xml)
      );

      // Loop through all the parent blocks and remove vertical translation value
      // This makes the output more condensed and readable, while preserving
      // horizontal translation values for RTL rendering.
      const blocksInWorkspace = workspace.getAllBlocks();
      blocksInWorkspace
        .filter(block => block.getParent() === null)
        .forEach(block => {
          const svgTransformList = block.svgGroup_.transform.baseVal;
          const svgTransform = svgTransformList.getItem(0);
          const svgTranslationX = svgTransform.matrix.e;
          svgTransform.setTranslate(svgTranslationX, 0);
        });

      // Shrink SVG to size of the block
      const bbox = svg.getBBox();
      svg.setAttribute('height', bbox.height + bbox.y);
      svg.setAttribute('width', bbox.width + bbox.x);
      // Add a transform to center read-only blocks on their line
      const notchHeight = workspace.getRenderer().getConstants().NOTCH_HEIGHT;
      svg.setAttribute(
        'style',
        `transform: translate(0px, ${notchHeight + BLOCK_PADDING}px)`
      );
      workspace.setTheme(theme);
      return workspace;
    },
  };

  blocklyWrapper.inject = function (container, opt_options, opt_audioPlayer) {
    const options = {
      ...opt_options,
      theme: cdoUtils.getUserTheme(opt_options.theme),
      trashcan: false, // Don't use default trashcan.
      move: {
        wheel: true,
        drag: true,
        scrollbars: {
          vertical: true,
          horizontal: false,
        },
      },
      plugins: {
        blockDragger: ScrollBlockDragger,
        metricsManager: CdoMetricsManager,
        connectionChecker: CdoConnectionChecker,
      },
      renderer: opt_options.renderer || Renderers.DEFAULT,
      comments: false,
      media: '/blockly/media/google_blockly',
    };
    // CDO Blockly takes assetUrl as an inject option, and it's used throughout
    // apps, so we should also set it here.
    blocklyWrapper.assetUrl = opt_options.assetUrl || (path => `./${path}`);

    // CDO Blockly takes customSimpleDialog as an inject option and uses it
    // instead of the default prompt dialogs, so we should also set it here.
    blocklyWrapper.customSimpleDialog = opt_options.customSimpleDialog;

    // Shrink container to make room for the workspace header
    if (!opt_options.isBlockEditMode) {
      container.style.height = `calc(100% - ${styleConstants['workspace-headers-height']}px)`;
    }
    blocklyWrapper.isStartMode = !!opt_options.editBlocks;
    blocklyWrapper.toolboxBlocks = options.toolbox;
    const workspace = blocklyWrapper.blockly_.inject(container, options);

    if (options.noFunctionBlockFrame) {
      workspace.noFunctionBlockFrame = options.noFunctionBlockFrame;
    }
    workspace.addChangeListener(onBlockClickDragDelete);

    blocklyWrapper.navigationController.addWorkspace(workspace);

    if (!blocklyWrapper.isStartMode && !opt_options.isBlockEditMode) {
      workspace.addChangeListener(Blockly.Events.disableOrphans);
    }

    document.dispatchEvent(
      utils.createEvent(Blockly.BlockSpace.EVENTS.MAIN_BLOCK_SPACE_CREATED)
    );

    const scrollOptionsPlugin = new ScrollOptions(workspace);
    scrollOptionsPlugin.init();

    const trashcan = new CdoTrashcan(workspace);
    trashcan.init();

    // Customize auto-populated Functions toolbox category.
    workspace.registerToolboxCategoryCallback(
      'PROCEDURE',
      functionsFlyoutCategory
    );

    // Customize auto-populated Behaviors toolbox category.
    workspace.registerToolboxCategoryCallback(
      'Behavior',
      behaviorsFlyoutCategory
    );

    return workspace;
  };

  // Used by StudioApp to tell Blockly to resize for Mobile Safari.
  blocklyWrapper.fireUiEvent = function (element, eventName, opt_properties) {
    if (eventName === 'resize') {
      blocklyWrapper.svgResize(blocklyWrapper.getMainWorkspace());
    }
  };

  initializeBlocklyXml(blocklyWrapper);
  initializeGenerator(blocklyWrapper);
  initializeTouch(blocklyWrapper);
  initializeVariables(blocklyWrapper);
  initializeCdoConstants(blocklyWrapper);
  initializeCss(blocklyWrapper);

  blocklyWrapper.Blocks.unknown = UNKNOWN_BLOCK;
  blocklyWrapper.JavaScript.unknown = () => '/* unknown block */\n';

  blocklyWrapper.cdoUtils = cdoUtils;
  blocklyWrapper.customBlocks = customBlocks;
  blocklyWrapper.getPointerBlockImageUrl = getPointerBlockImageUrl;

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
