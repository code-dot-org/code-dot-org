import {BlocklyVersion} from '@cdo/apps/constants';
import {BlockSvgUnused} from '@cdo/apps/blockly/blockSvgUnused';
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
  blocklyWrapper.wrapReadOnlyProperty('BlockValueType');
  blocklyWrapper.wrapReadOnlyProperty('common_locale');
  blocklyWrapper.wrapReadOnlyProperty('Connection');
  blocklyWrapper.wrapReadOnlyProperty('contractEditor');
  blocklyWrapper.wrapReadOnlyProperty('createSvgElement');
  blocklyWrapper.wrapReadOnlyProperty('Css');
  blocklyWrapper.wrapReadOnlyProperty('disableVariableEditing');
  blocklyWrapper.wrapReadOnlyProperty('Events');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldAngleTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldButton');
  blocklyWrapper.wrapReadOnlyProperty('FieldColour');
  blocklyWrapper.wrapReadOnlyProperty('FieldColourDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldIcon');
  blocklyWrapper.wrapReadOnlyProperty('FieldImage');
  blocklyWrapper.wrapReadOnlyProperty('FieldImageDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldLabel');
  blocklyWrapper.wrapReadOnlyProperty('FieldParameter');
  blocklyWrapper.wrapReadOnlyProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldVariable');
  blocklyWrapper.wrapReadOnlyProperty('fireUiEvent');
  blocklyWrapper.wrapReadOnlyProperty('fish_locale');
  blocklyWrapper.wrapReadOnlyProperty('Flyout');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalBlockUtils');
  blocklyWrapper.wrapReadOnlyProperty('FunctionalTypeColors');
  blocklyWrapper.wrapReadOnlyProperty('FunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('functionEditor');
  blocklyWrapper.wrapReadOnlyProperty('gamelab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Generator');
  blocklyWrapper.wrapReadOnlyProperty('getRelativeXY');
  blocklyWrapper.wrapReadOnlyProperty('googlecode');
  blocklyWrapper.wrapReadOnlyProperty('hasCategories');
  blocklyWrapper.wrapReadOnlyProperty('html');
  blocklyWrapper.wrapReadOnlyProperty('inject');
  blocklyWrapper.wrapReadOnlyProperty('Input');
  blocklyWrapper.wrapReadOnlyProperty('INPUT_VALUE');
  blocklyWrapper.wrapReadOnlyProperty('js');
  blocklyWrapper.wrapReadOnlyProperty('modalBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('Msg');
  blocklyWrapper.wrapReadOnlyProperty('Names');
  blocklyWrapper.wrapReadOnlyProperty('netsim_locale');
  blocklyWrapper.wrapReadOnlyProperty('Procedures');
  blocklyWrapper.wrapReadOnlyProperty('removeChangeListener');
  blocklyWrapper.wrapReadOnlyProperty('RTL');
  blocklyWrapper.wrapReadOnlyProperty('selected');
  blocklyWrapper.wrapReadOnlyProperty('tutorialExplorer_locale');
  blocklyWrapper.wrapReadOnlyProperty('useContractEditor');
  blocklyWrapper.wrapReadOnlyProperty('useModalFunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('utils');
  blocklyWrapper.wrapReadOnlyProperty('Variables');
  blocklyWrapper.wrapReadOnlyProperty('weblab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Workspace');

  blocklyWrapper.FieldDropdown = function(
    menuGenerator,
    opt_changeHandler,
    opt_alwaysCallChangeHandler
  ) {
    let validator;
    if (opt_changeHandler) {
      validator = function(val) {
        if (
          this.getSourceBlock() &&
          !this.getSourceBlock().isInsertionMarker_ &&
          this.value_ !== val
        ) {
          opt_changeHandler(val);
        }
      };
    }
    return new blocklyWrapper.blockly_.FieldDropdown(menuGenerator, validator);
  };

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
  blocklyWrapper.wrapSettableProperty('BROKEN_CONTROL_POINTS');
  blocklyWrapper.wrapSettableProperty('BUMP_UNCONNECTED');
  blocklyWrapper.wrapSettableProperty('HSV_SATURATION');
  blocklyWrapper.wrapSettableProperty('JavaScript');
  blocklyWrapper.wrapSettableProperty('readOnly');
  blocklyWrapper.wrapSettableProperty('showUnusedBlocks');
  blocklyWrapper.wrapSettableProperty('SNAP_RADIUS');
  blocklyWrapper.wrapSettableProperty('typeHints');
  blocklyWrapper.wrapSettableProperty('valueTypeTabShapeMap');
  blocklyWrapper.wrapSettableProperty('Xml');

  blocklyWrapper.ieVersion = () => false; // TODO

  blocklyWrapper.isRightButton = function(e) {
    // Control-clicking in WebKit on Mac OS X fails to change button to 2.
    return e.button === 2 || e.ctrlKey;
  };

  blocklyWrapper.getGenerator = function() {
    return this.JavaScript;
  };
  blocklyWrapper.findEmptyContainerBlock = function() {}; // TODO
  blocklyWrapper.BlockSpace = {
    EVENTS: {
      MAIN_BLOCK_SPACE_CREATED: 'mainBlockSpaceCreated',
      EVENT_BLOCKS_IMPORTED: 'blocksImported',
      BLOCK_SPACE_CHANGE: 'blockSpaceChange',
      BLOCK_SPACE_SCROLLED: 'blockSpaceScrolled',
      RUN_BUTTON_CLICKED: 'runButtonClicked'
    },
    onMainBlockSpaceCreated: () => {}, // TODO
    createReadOnlyBlockSpace: () => {} // TODO
  };

  // CDO Blockly titles are equivalent to Google Blockly fields.
  blocklyWrapper.Block.prototype.getTitles = function() {
    let fields = [];
    this.inputList.forEach(input => {
      input.fieldRow.forEach(field => {
        fields.push(field);
      });
    });
    return fields;
  };
  blocklyWrapper.Block.prototype.getTitleValue =
    blocklyWrapper.Block.prototype.getFieldValue;
  blocklyWrapper.Block.prototype.isUserVisible = () => false; // TODO
  // Google Blockly only allows you to set the hue, not saturation or value.
  // However, they also allow you to specify the color in #RRGGBB format, so we can
  // just map our HSV value to hex using their util function.
  blocklyWrapper.Block.prototype.setHSV = function(h, s, v) {
    return this.setColour(Blockly.utils.colour.hsvToHex(h, s, v * 255));
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.blockSpaceToCode = function(name, opt_typeFilter) {
    let blocksToGenerate = blocklyWrapper.mainBlockSpace.getTopBlocks(
      true /* ordered */
    );
    if (opt_typeFilter) {
      if (typeof opt_typeFilter === 'string') {
        opt_typeFilter = [opt_typeFilter];
      }
      blocksToGenerate = blocksToGenerate.filter(block =>
        opt_typeFilter.includes(block.type)
      );
    }
    let code = [];
    blocksToGenerate.forEach(block => {
      code.push(blocklyWrapper.JavaScript.blockToCode(block));
    });
    return code.join('\n');
  };

  blocklyWrapper.Input.prototype.appendTitle = function(a, b) {
    return this.appendField(a, b);
  };

  blocklyWrapper.Workspace.prototype.getToolboxWidth = function() {
    return blocklyWrapper.mainBlockSpace.getMetrics().toolboxWidth;
  };

  blocklyWrapper.BlockSvg.prototype.addUnusedFrame = function(callback) {
    if (!this.unusedSvg_) {
      this.unusedSvg_ = new BlockSvgUnused(this, callback);
    }
    this.unusedSvg_.render(this.svgGroup_);
  };

  blocklyWrapper.BlockSvg.prototype.removeUnusedFrame = function() {
    if (this.unusedSvg_) {
      this.unusedSvg_.dispose();
      this.unusedSvg_ = null;
    }
  };
  blocklyWrapper.BlockSvg.prototype.originalRender =
    blocklyWrapper.BlockSvg.prototype.render;
  blocklyWrapper.BlockSvg.prototype.render = function() {
    this.originalRender();
    this.removeUnusedFrame();
  };
  blocklyWrapper.BlockSvg.prototype.originalDispose =
    blocklyWrapper.BlockSvg.prototype.dispose;
  blocklyWrapper.BlockSvg.prototype.dispose = function() {
    this.originalDispose();
    this.removeUnusedFrame();
  };

  blocklyWrapper.blockRendering.PathObject.prototype.updateDisabled_ = function(
    disabled
  ) {
    this.setClass_('blocklyDisabled', disabled);
  };
  blocklyWrapper.Workspace.prototype.addUnusedBlocksHelpListener = callback => {
    Blockly.mainBlockSpace.addChangeListener(Blockly.Events.disableOrphans);
    Blockly.bindEvent_(
      Blockly.mainBlockSpace.getCanvas(),
      Blockly.BlockSpace.EVENTS.RUN_BUTTON_CLICKED,
      Blockly.mainBlockSpace,
      function() {
        this.getTopBlocks().forEach(function(block) {
          if (block.disabled) {
            block.addUnusedFrame(callback);
          }
        });
      }
    );
  };
  blocklyWrapper.Workspace.prototype.getAllUsedBlocks =
    blocklyWrapper.Workspace.prototype.getAllBlocks; // TODO
  blocklyWrapper.Workspace.prototype.isReadOnly = () => false; // TODO
  blocklyWrapper.Workspace.prototype.setEnableToolbox = () => {}; // TODO
  blocklyWrapper.Workspace.prototype.blockSpaceEditor = {
    blockLimits: {
      blockLimitExceeded: () => false, // TODO
      getLimit: () => {} // TODO
    }
  };

  // Aliasing Google's blockToDom() so that we can override it, but still be able
  // to call Google's blockToDom() in the override function.
  blocklyWrapper.Xml.originalBlockToDom = blocklyWrapper.Xml.blockToDom;
  blocklyWrapper.Xml.blockToDom = function(block, ignoreChildBlocks) {
    const blockXml = blocklyWrapper.Xml.originalBlockToDom(block);
    if (ignoreChildBlocks) {
      Blockly.Xml.deleteNext(blockXml);
    }
    return blockXml;
  };

  blocklyWrapper.Xml = {
    ...blocklyWrapper.Xml,
    domToBlockSpace: blocklyWrapper.Xml.domToWorkspace,
    blockSpaceToDom: blocklyWrapper.Xml.workspaceToDom
  };

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
