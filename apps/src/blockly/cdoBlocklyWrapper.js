import {BlocklyVersion} from '@cdo/apps/constants';

const INFINITE_LOOP_TRAP =
  '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

const LOOP_HIGHLIGHT = 'loopHighlight();\n';
const LOOP_HIGHLIGHT_RE = new RegExp(
  LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)') + '\\s*',
  'g'
);

/**
 * Wrapper class for https://github.com/code-dot-org/blockly
 * This wrapper will facilitate migrating from CDO Blockly to Google Blockly
 * by allowing us to unify the APIs so that we can switch out the underlying Blockly
 * object without affecting apps code.
 * See also ./googleBlocklyWrapper.js
 */
const BlocklyWrapper = function(blocklyInstance) {
  this.version = BlocklyVersion.CDO;
  this.blockly_ = blocklyInstance;
  this.wrapReadOnlyProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      }
    });
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
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
function strip(code) {
  return (
    code
      // Strip out serial numbers.
      .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
      // Remove timeouts.
      .replace(new RegExp(escapeRegExp(INFINITE_LOOP_TRAP), 'g'), '')
      // Strip out loop highlight
      .replace(LOOP_HIGHLIGHT_RE, '')
      // Strip out class namespaces.
      .replace(/(StudioApp|Maze|Turtle)\./g, '')
      // Strip out particular helper functions.
      .replace(/^function (colour_random)[\s\S]*?^}/gm, '')
      // Collapse consecutive blank lines.
      .replace(/\n\n+/gm, '\n\n')
      // Trim.
      .replace(/^\s+|\s+$/g, '')
  );
}

function initializeBlocklyWrapper(blocklyInstance) {
  const blocklyWrapper = new BlocklyWrapper(blocklyInstance);

  blocklyWrapper.wrapReadOnlyProperty('ALIGN_CENTRE');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_LEFT');
  blocklyWrapper.wrapReadOnlyProperty('ALIGN_RIGHT');
  blocklyWrapper.wrapReadOnlyProperty('applab_locale');
  blocklyWrapper.wrapReadOnlyProperty('bindEvent_');
  blocklyWrapper.wrapReadOnlyProperty('Block');
  blocklyWrapper.wrapReadOnlyProperty('BlockFieldHelper');
  blocklyWrapper.wrapReadOnlyProperty('Blocks');
  blocklyWrapper.wrapReadOnlyProperty('BlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('BlockSvg');
  blocklyWrapper.wrapReadOnlyProperty('BlockValueType');
  blocklyWrapper.wrapReadOnlyProperty('common_locale');
  blocklyWrapper.wrapReadOnlyProperty('Connection');
  blocklyWrapper.wrapReadOnlyProperty('contractEditor');
  blocklyWrapper.wrapReadOnlyProperty('createSvgElement');
  blocklyWrapper.wrapReadOnlyProperty('Css');
  blocklyWrapper.wrapReadOnlyProperty('disableVariableEditing');
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
  blocklyWrapper.wrapReadOnlyProperty('FieldParameter');
  blocklyWrapper.wrapReadOnlyProperty('FieldRectangularDropdown');
  blocklyWrapper.wrapReadOnlyProperty('FieldTextInput');
  blocklyWrapper.wrapReadOnlyProperty('FieldVariable');
  blocklyWrapper.wrapReadOnlyProperty('findEmptyContainerBlock');
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
  blocklyWrapper.wrapReadOnlyProperty('mainBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('mainBlockSpaceEditor');
  blocklyWrapper.wrapReadOnlyProperty('modalBlockSpace');
  blocklyWrapper.wrapReadOnlyProperty('Msg');
  blocklyWrapper.wrapReadOnlyProperty('Names');
  blocklyWrapper.wrapReadOnlyProperty('netsim_locale');
  blocklyWrapper.wrapReadOnlyProperty('Procedures');
  blocklyWrapper.wrapReadOnlyProperty('removeChangeListener');
  blocklyWrapper.wrapReadOnlyProperty('RTL');
  blocklyWrapper.wrapReadOnlyProperty('selected');
  blocklyWrapper.wrapReadOnlyProperty('SVG_NS');
  blocklyWrapper.wrapReadOnlyProperty('tutorialExplorer_locale');
  blocklyWrapper.wrapReadOnlyProperty('useContractEditor');
  blocklyWrapper.wrapReadOnlyProperty('useModalFunctionEditor');
  blocklyWrapper.wrapReadOnlyProperty('Variables');
  blocklyWrapper.wrapReadOnlyProperty('WidgetDiv');
  blocklyWrapper.wrapReadOnlyProperty('weblab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Xml');

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

  blocklyWrapper.BlockSpace.prototype.registerGlobalVariables = function() {}; // Not implemented.

  blocklyWrapper.BlockSpace.prototype.getContainer = function() {
    return this.blockSpaceEditor.getSVGElement().parentNode;
  };

  blocklyWrapper.getFieldForInputType = function(type) {
    return blocklyWrapper.FieldTextInput;
  };

  blocklyWrapper.getGenerator = function() {
    return blocklyWrapper.Generator.get('JavaScript');
  };

  blocklyWrapper.addChangeListener = function(blockspace, handler) {
    if (!blockspace) {
      return;
    }
    blockspace.getCanvas().addEventListener('blocklyBlockSpaceChange', handler);
  };

  blocklyWrapper.setInfiniteLoopTrap = function() {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.clearInfiniteLoopTrap = function() {
    Blockly.JavaScript.INFINITE_LOOP_TRAP = '';
  };

  blocklyWrapper.getInfiniteLoopTrap = function() {
    return Blockly.JavaScript.INFINITE_LOOP_TRAP;
  };

  blocklyWrapper.loopHighlight = function(apiName, blockId) {
    var args = "'block_id_" + blockId + "'";
    if (blockId === undefined) {
      args = '%1';
    }
    return (
      '  ' + apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')')
    );
  };

  blocklyWrapper.getWorkspaceCode = function(opt_showHidden) {
    const code = Blockly.Generator.blockSpaceToCode(
      'JavaScript',
      null,
      !!opt_showHidden
    );
    return strip(code);
  };

  // The second argument to Google Blockly's blockToCode specifies whether to
  // generate code for the whole block stack or just the single block. The
  // second argument to Cdo Blockly's blockToCode specifies whether to generate
  // code for hidden blocks. However, across all apps code, opt_showHidden is
  // always true. So we can just ignore the second argument and pass true to Cdo
  // Blockly, which allows us to change the usage across apps code to treat the
  // second argument as opt_thisOnly rather than opt_showHidden.
  const originalBlockToCode = blocklyWrapper.JavaScript.blockToCode;
  blocklyWrapper.JavaScript.blockToCode = function(block, opt_thisOnly) {
    return originalBlockToCode.call(this, block, true /* opt_showHidden */);
  };

  blocklyWrapper.Input.prototype.getFieldRow = function() {
    return this.titleRow;
  };

  // Code.org's old Blockly fork uses title in place of all field tags.
  blocklyWrapper.Input.prototype.appendField =
    blocklyWrapper.Input.prototype.appendTitle;
  blocklyWrapper.Block.prototype.getFieldValue =
    blocklyWrapper.Block.prototype.getTitleValue;

  blocklyWrapper.cdoUtils = {
    blockLimitExceeded: function(blockType) {
      const blockLimits = Blockly.mainBlockSpace.blockSpaceEditor.blockLimits;
      return blockLimits.blockLimitExceeded && blockLimits.blockLimitExceeded();
    },
    getBlockFields: function(block) {
      return block.getTitles();
    },
    getToolboxWidth: function() {
      return Blockly.mainBlockSpaceEditor.getToolboxWidth();
    },
    getBlockLimit: function(blockType) {
      return Blockly.mainBlockSpace.blockSpaceEditor.blockLimits.getLimit(
        blockType
      );
    },
    isWorkspaceReadOnly: function(workspace) {
      return workspace.isReadOnly();
    },
    setHSV: function(block, h, s, v) {
      block.setHSV(h, s, v);
    },
    workspaceSvgResize: function(workspace) {
      return workspace.blockSpaceEditor.svgResize();
    }
  };
  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
