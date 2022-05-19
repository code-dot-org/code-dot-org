import {
  ScrollBlockDragger,
  ScrollOptions
} from '@blockly/plugin-scroll-options';
import {BlocklyVersion} from '@cdo/apps/constants';
import styleConstants from '@cdo/apps/styleConstants';
import * as utils from '@cdo/apps/utils';
import initializeCdoConstants from './addons/cdoConstants';
import CdoFieldButton from './addons/cdoFieldButton';
import CdoFieldDropdown from './addons/cdoFieldDropdown';
import {CdoFieldImageDropdown} from './addons/cdoFieldImageDropdown';
import CdoFieldVariable from './addons/cdoFieldVariable';
import FunctionEditor from './addons/functionEditor';
import initializeGenerator from './addons/cdoGenerator';
import CdoMetricsManager from './addons/cdoMetricsManager';
import CdoRenderer from './addons/cdoRenderer';
import CdoTheme from './addons/cdoTheme';
import initializeTouch from './addons/cdoTouch';
import CdoTrashcan from './addons/cdoTrashcan';
import * as cdoUtils from './addons/cdoUtils';
import initializeVariables from './addons/cdoVariables';
import CdoVerticalFlyout from './addons/cdoVerticalFlyout';
import initializeBlocklyXml from './addons/cdoXml';
import initializeCss from './addons/cdoCss';
import {UNKNOWN_BLOCK} from './addons/unknownBlock';
import {registerAllContextMenuItems} from './addons/contextMenu';
import {registerAllShortcutItems} from './addons/shortcut';
import BlockSvgUnused from './addons/blockSvgUnused';
import {ToolboxType} from './constants';

/**
 * Wrapper class for https://github.com/google/blockly
 * This wrapper will facilitate migrating from CDO Blockly to Google Blockly
 * by allowing us to unify the APIs so that we can switch out the underlying Blockly
 * object without affecting apps code.
 * This wrapper will contain all of our customizations to Google Blockly.
 * See also ./cdoBlocklyWrapper.js
 */
const BlocklyWrapper = function(blocklyInstance) {
  this.version = BlocklyVersion.GOOGLE;
  this.blockly_ = blocklyInstance;

  this.wrapReadOnlyProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      }
    });
  };
  this.wrapSettableProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      },
      set: function(newValue) {
        this.blockly_[propertyName] = newValue;
      }
    });
  };
};

function initializeBlocklyWrapper(blocklyInstance) {
  const blocklyWrapper = new BlocklyWrapper(blocklyInstance);

  blocklyWrapper.setInfiniteLoopTrap = function() {}; // TODO
  blocklyWrapper.clearInfiniteLoopTrap = function() {}; // TODO
  blocklyWrapper.getInfiniteLoopTrap = function() {}; // TODO
  blocklyWrapper.loopHighlight = function() {}; // TODO
  blocklyWrapper.getWorkspaceCode = function() {
    return Blockly.JavaScript.workspaceToCode(Blockly.mainBlockSpace);
  };

  blocklyWrapper.wrapReadOnlyProperty('ALIGN_CENTRE');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_LEFT');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_RIGHT');
  blocklyWrapper.wrapReadOnlyProperty('applab_locale');
  blocklyWrapper.wrapReadOnlyProperty('bindEvent_');
  blocklyWrapper.wrapReadOnlyProperty('blockRendering');
  blocklyWrapper.wrapReadOnlyProperty('Block');
  blocklyWrapper.wrapReadOnlyProperty('BlockFieldHelper');
  blocklyWrapper.wrapReadOnlyProperty('Blocks');
  blocklyWrapper.wrapReadOnlyProperty('BlockSvg');
  blocklyWrapper.wrapReadOnlyProperty('common_locale');
  blocklyWrapper.wrapReadOnlyProperty('ComponentManager');
  blocklyWrapper.wrapReadOnlyProperty('Connection');
  blocklyWrapper.wrapReadOnlyProperty('ContextMenu');
  blocklyWrapper.wrapReadOnlyProperty('contractEditor');
  blocklyWrapper.wrapReadOnlyProperty('createSvgElement');
  blocklyWrapper.wrapReadOnlyProperty('Css');
  blocklyWrapper.wrapReadOnlyProperty('DropDownDiv');
  blocklyWrapper.wrapReadOnlyProperty('disableVariableEditing');
  blocklyWrapper.wrapReadOnlyProperty('Events');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldButton');
  blocklyWrapper.wrapReadOnlyProperty('FieldColour');
  blocklyWrapper.wrapReadOnlyProperty('FieldColourDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldIcon');
  blocklyWrapper.wrapReadOnlyProperty('FieldImage');
  blocklyWrapper.wrapReadOnlyProperty('FieldImageDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldLabel');
  blocklyWrapper.wrapReadOnlyProperty('FieldNumber');
  blocklyWrapper.wrapReadOnlyProperty('FieldParameter');
  blocklyWrapper.wrapReadOnlyProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldVariable');
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
  blocklyWrapper.wrapReadOnlyProperty('getRelativeXY');
  blocklyWrapper.wrapReadOnlyProperty('googlecode');
  blocklyWrapper.wrapReadOnlyProperty('hasCategories');
  blocklyWrapper.wrapReadOnlyProperty('html');
  blocklyWrapper.wrapReadOnlyProperty('Input');
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

  blocklyWrapper.blockly_.FieldButton = CdoFieldButton;
  blocklyWrapper.blockly_.FieldDropdown = CdoFieldDropdown;
  blocklyWrapper.blockly_.FieldImageDropdown = CdoFieldImageDropdown;
  blocklyWrapper.blockly_.FieldVariable = CdoFieldVariable;
  blocklyWrapper.blockly_.FunctionEditor = FunctionEditor;
  blocklyWrapper.blockly_.Trashcan = CdoTrashcan;

  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
    blocklyWrapper.blockly_.registry.DEFAULT,
    CdoVerticalFlyout,
    true /* opt_allowOverrides */
  );

  blocklyWrapper.blockly_.registry.register(
    blocklyWrapper.blockly_.registry.Type.RENDERER,
    'cdo_renderer',
    CdoRenderer,
    true /* opt_allowOverrides */
  );
  registerAllContextMenuItems();
  registerAllShortcutItems();
  // These are also wrapping read only properties, but can't use wrapReadOnlyProperty
  // because the alias name is not the same as the underlying property name.
  Object.defineProperty(blocklyWrapper, 'mainBlockSpace', {
    get: function() {
      return this.blockly_.mainWorkspace;
    }
  });
  Object.defineProperty(blocklyWrapper, 'mainBlockSpaceEditor', {
    get: function() {
      return this.blockly_.mainWorkspace;
    }
  });
  Object.defineProperty(blocklyWrapper, 'SVG_NS', {
    get: function() {
      return this.blockly_.utils.dom.SVG_NS;
    }
  });

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

  // Wrap SNAP_RADIUS property, and in the setter make sure we keep SNAP_RADIUS and CONNECTING_SNAP_RADIUS in sync.
  // See https://github.com/google/blockly/issues/2217
  Object.defineProperty(blocklyWrapper, 'SNAP_RADIUS', {
    get: function() {
      return this.blockly_.SNAP_RADIUS;
    },
    set: function(snapRadius) {
      this.blockly_.SNAP_RADIUS = snapRadius;
      this.blockly_.CONNECTING_SNAP_RADIUS = snapRadius;
    }
  });

  blocklyWrapper.addChangeListener = function(blockspace, handler) {
    blockspace.addChangeListener(handler);
  };

  blocklyWrapper.getWorkspaceCode = function() {
    return Blockly.JavaScript.workspaceToCode(Blockly.mainBlockSpace);
  };

  blocklyWrapper.getFieldForInputType = function(type) {
    if (type === 'Number') {
      return blocklyWrapper.FieldNumber;
    }
    return blocklyWrapper.FieldTextInput;
  };

  const googleBlocklyMixin = blocklyWrapper.BlockSvg.prototype.mixin;
  blocklyWrapper.BlockSvg.prototype.mixin = function(
    mixinObj,
    opt_disableCheck
  ) {
    googleBlocklyMixin.call(this, mixinObj, true);
  };

  blocklyWrapper.BlockSvg.prototype.addUnusedBlockFrame = function(
    helpClickFunc
  ) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, helpClickFunc);
    }
    this.unusedSvg_.render(this.svgGroup_);
  };

  const googleBlocklyRender = blocklyWrapper.BlockSvg.prototype.render;
  blocklyWrapper.BlockSvg.prototype.render = function(opt_bubble) {
    googleBlocklyRender.call(this, opt_bubble);
    this.removeUnusedBlockFrame();
  };

  const googleBlocklyDispose = blocklyWrapper.BlockSvg.prototype.dispose;
  blocklyWrapper.BlockSvg.prototype.dispose = function() {
    googleBlocklyDispose.call(this);
    this.removeUnusedBlockFrame();
  };

  blocklyWrapper.BlockSvg.prototype.isUnused = function() {
    const isTopBlock = this.previousConnection === null;
    const hasParentBlock = !!this.parentBlock_;
    return !(isTopBlock || hasParentBlock);
  };

  blocklyWrapper.BlockSvg.prototype.removeUnusedBlockFrame = function() {
    if (this.unusedSvg_) {
      this.unusedSvg_.dispose();
      this.unusedSvg_ = null;
    }
  };

  blocklyWrapper.BlockSvg.prototype.getHexColour = function() {
    // In cdo Blockly labs, getColour() returns a numerical hue value, while
    // in newer Google Blockly it returns a hexademical color value string.
    // This is only used for locationPicker blocks and can likely be deprecated
    // once Sprite Lab is using Google Blockly.
    return this.getColour();
  };

  blocklyWrapper.BlockSvg.prototype.isVisible = function() {
    // TODO (eventually) - All Google Blockly blocks are currently visible.
    // This shouldn't be a problem until we convert other labs.
    return true;
  };

  blocklyWrapper.BlockSvg.prototype.isUserVisible = function() {
    // TODO - used for EXTRA_TOP_BLOCKS_FAIL feedback
    return false;
  };

  blocklyWrapper.Input.prototype.setStrictCheck = function(check) {
    return this.setCheck(check);
  };
  // We use fieldRow because it is public.
  blocklyWrapper.Input.prototype.getFieldRow = function() {
    return this.fieldRow;
  };

  blocklyWrapper.WorkspaceSvg.prototype.addUnusedBlocksHelpListener = function(
    helpClickFunc
  ) {
    blocklyWrapper.bindEvent_(
      blocklyWrapper.mainBlockSpace.getCanvas(),
      blocklyWrapper.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
      blocklyWrapper.mainBlockSpace,
      function() {
        this.getTopBlocks().forEach(block => {
          if (block.disabled) {
            block.addUnusedBlockFrame(helpClickFunc);
          }
        });
      }
    );
  };

  blocklyWrapper.WorkspaceSvg.prototype.getAllUsedBlocks = function() {
    return this.getAllBlocks().filter(block => !block.disabled);
  };

  // Used in levels when starting over or resetting Version History
  const googleBlocklyBlocklyClear = blocklyWrapper.WorkspaceSvg.prototype.clear;
  blocklyWrapper.WorkspaceSvg.prototype.clear = function() {
    googleBlocklyBlocklyClear.call(this);
    // After clearing the workspace, we need to reinitialize global variables
    // if there are any.
    if (this.globalVariables) {
      this.getVariableMap().addVariables(this.globalVariables);
    }
  };

  // Used in levels with pre-defined "Blockly Variables"
  blocklyWrapper.WorkspaceSvg.prototype.registerGlobalVariables = function(
    variableList
  ) {
    this.globalVariables = variableList;
    this.getVariableMap().addVariables(variableList);
  };

  blocklyWrapper.WorkspaceSvg.prototype.getContainer = function() {
    return this.svgGroup_.parentNode;
  };

  const googleBlocklyBlocklyResize =
    blocklyWrapper.WorkspaceSvg.prototype.resize;
  blocklyWrapper.WorkspaceSvg.prototype.resize = function() {
    googleBlocklyBlocklyResize.call(this);
    if (cdoUtils.getToolboxType() === ToolboxType.UNCATEGORIZED) {
      this.flyout_?.resize();
    }
  };

  blocklyWrapper.WorkspaceSvg.prototype.events = {
    dispatchEvent: () => {} // TODO
  };

  // TODO - called by StudioApp, not sure whether they're still needed.
  blocklyWrapper.WorkspaceSvg.prototype.setEnableToolbox = function(enabled) {};
  blocklyWrapper.WorkspaceSvg.prototype.traceOn = function(armed) {};

  blocklyWrapper.VariableMap.prototype.addVariables = function(variableList) {
    variableList.forEach(varName => this.createVariable(varName));
  };

  // TODO - used for spritelab behavior blocks
  blocklyWrapper.Block.createProcedureDefinitionBlock = function(config) {};

  // TODO - used to add "create a behavior" button to the toolbox
  blocklyWrapper.Flyout.configure = function(type, config) {};

  blocklyWrapper.getGenerator = function() {
    return this.JavaScript;
  };

  // TODO - used for validation in CS in Algebra.
  blocklyWrapper.findEmptyContainerBlock = function() {};
  blocklyWrapper.BlockSpace = {
    EVENTS: {
      MAIN_BLOCK_SPACE_CREATED: 'mainBlockSpaceCreated',
      EVENT_BLOCKS_IMPORTED: 'blocksImported',
      BLOCK_SPACE_CHANGE: 'blockSpaceChange',
      BLOCK_SPACE_SCROLLED: 'blockSpaceScrolled',
      RUN_BUTTON_CLICKED: 'runButtonClicked'
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
      const workspace = new Blockly.WorkspaceSvg({
        readOnly: true,
        theme: CdoTheme,
        plugins: {}
      });
      const svg = Blockly.utils.dom.createSvgElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:html': 'http://www.w3.org/1999/xhtml',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          version: '1.1',
          class: 'geras-renderer modern-theme readOnlyBlockSpace'
        },
        null
      );
      container.appendChild(svg);
      svg.appendChild(workspace.createDom());
      Blockly.Xml.domToBlockSpace(workspace, xml);
      // Shrink SVG to size of the block
      const bbox = svg.getBBox();
      svg.setAttribute('height', bbox.height + bbox.y);
      svg.setAttribute('width', bbox.width + bbox.x);
      return workspace;
    }
  };

  blocklyWrapper.inject = function(container, opt_options, opt_audioPlayer) {
    const options = {
      ...opt_options,
      theme: CdoTheme,
      trashcan: false, // Don't use default trashcan.
      move: {
        wheel: true,
        drag: true,
        scrollbars: {
          vertical: true,
          horizontal: false
        }
      },
      plugins: {
        blockDragger: ScrollBlockDragger,
        metricsManager: CdoMetricsManager
      },
      renderer: 'cdo_renderer'
    };

    // CDO Blockly takes assetUrl as an inject option, and it's used throughout
    // apps, so we should also set it here.
    blocklyWrapper.assetUrl = opt_options.assetUrl || (path => `./${path}`);

    // CDO Blockly takes customSimpleDialog as an inject option and uses it
    // instead of the default prompt dialogs, so we should also set it here.
    blocklyWrapper.customSimpleDialog = opt_options.customSimpleDialog;

    // Shrink container to make room for the workspace header
    container.style.height = `calc(100% - ${
      styleConstants['workspace-headers-height']
    }px)`;
    blocklyWrapper.isStartMode = !!opt_options.editBlocks;
    const workspace = blocklyWrapper.blockly_.inject(container, options);

    if (!blocklyWrapper.isStartMode) {
      workspace.addChangeListener(Blockly.Events.disableOrphans);
    }

    document.dispatchEvent(
      utils.createEvent(Blockly.BlockSpace.EVENTS.MAIN_BLOCK_SPACE_CREATED)
    );

    const scrollOptionsPlugin = new ScrollOptions(workspace);
    scrollOptionsPlugin.init();

    const trashcan = new CdoTrashcan(workspace);
    trashcan.init();
  };

  // Used by StudioApp to tell Blockly to resize for Mobile Safari.
  blocklyWrapper.fireUiEvent = function(element, eventName, opt_properties) {
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

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
