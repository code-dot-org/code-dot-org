import {BlocklyVersion} from '@cdo/apps/constants';
import CdoBlockDragger from '@cdo/apps/blocklyAddons/cdoBlockDragger';
import CdoBlockSvg from '@cdo/apps/blocklyAddons/cdoBlockSvg';
import CdoFieldDropdown from '@cdo/apps/blocklyAddons/cdoFieldDropdown';
import CdoInput from '@cdo/apps/blocklyAddons/cdoInput';
import CdoPathObject from '@cdo/apps/blocklyAddons/cdoPathObject';
import CdoTheme from '@cdo/apps/blocklyAddons/cdoTheme';
import CdoTrashcan from '@cdo/apps/blocklyAddons/cdoTrashcan';
import CdoWorkspaceSvg from '@cdo/apps/blocklyAddons/cdoWorkspaceSvg';

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
  blocklyWrapper.wrapReadOnlyProperty('ContextMenu');
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
  blocklyWrapper.wrapReadOnlyProperty('FieldDropdown');
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
  blocklyWrapper.wrapReadOnlyProperty('geras');
  blocklyWrapper.wrapReadOnlyProperty('getRelativeXY');
  blocklyWrapper.wrapReadOnlyProperty('googlecode');
  blocklyWrapper.wrapReadOnlyProperty('hasCategories');
  blocklyWrapper.wrapReadOnlyProperty('html');
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
  blocklyWrapper.wrapReadOnlyProperty('Trashcan');
  blocklyWrapper.wrapReadOnlyProperty('Variables');
  blocklyWrapper.wrapReadOnlyProperty('weblab_locale');
  blocklyWrapper.wrapReadOnlyProperty('Workspace');
  blocklyWrapper.wrapReadOnlyProperty('WorkspaceSvg');
  blocklyWrapper.wrapReadOnlyProperty('Xml');

  blocklyWrapper.blockly_.BlockDragger = CdoBlockDragger;
  blocklyWrapper.blockly_.BlockSvg = CdoBlockSvg;
  blocklyWrapper.blockly_.FieldDropdown = CdoFieldDropdown;
  blocklyWrapper.blockly_.Input = CdoInput;
  blocklyWrapper.geras.PathObject = CdoPathObject;
  blocklyWrapper.blockly_.Trashcan = CdoTrashcan;
  blocklyWrapper.blockly_.WorkspaceSvg = CdoWorkspaceSvg;

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

  blocklyWrapper.inject = function(container, opt_options, opt_audioPlayer) {
    const options = {
      ...opt_options,
      theme: CdoTheme,
      trashcan: true
    };
    blocklyWrapper.editBlocks = opt_options.editBlocks;
    return blocklyWrapper.blockly_.inject(container, options);
  };

  // Aliasing Google's blockToDom() so that we can override it, but still be able
  // to call Google's blockToDom() in the override function.
  blocklyWrapper.Xml.originalBlockToDom = blocklyWrapper.Xml.blockToDom;
  blocklyWrapper.Xml.blockToDom = function(block, ignoreChildBlocks) {
    const blockXml = blocklyWrapper.Xml.originalBlockToDom(block);
    if (!block.canDisconnectFromParent_) {
      blockXml.setAttribute('can_disconnect_from_parent', false);
    }
    if (ignoreChildBlocks) {
      Blockly.Xml.deleteNext(blockXml);
    }
    return blockXml;
  };

  // Aliasing Google's domToBlock() so that we can override it, but still be able
  // to call Google's domToBlock() in the override function.
  blocklyWrapper.Xml.originalDomToBlock = blocklyWrapper.Xml.domToBlock;
  blocklyWrapper.Xml.domToBlock = function(xmlBlock, workspace) {
    const block = blocklyWrapper.Xml.originalDomToBlock(xmlBlock, workspace);
    const can_disconnect_from_parent = xmlBlock.getAttribute(
      'can_disconnect_from_parent'
    );
    if (can_disconnect_from_parent) {
      block.canDisconnectFromParent_ = can_disconnect_from_parent === 'true';
    }
    return block;
  };

  blocklyWrapper.Xml.fieldToDom_ = function(field) {
    if (field.isSerializable()) {
      // Titles were renamed to fields in 2013, but CDO Blockly and
      // all existing student code uses titles, so to keep everything
      // consistent, we should continue using titles here.
      var container = Blockly.utils.xml.createElement('title');
      container.setAttribute('name', field.name || '');
      return field.toXml(container);
    }
    return null;
  };

  blocklyWrapper.Xml.domToBlockSpace = function(blockSpace, xml) {
    // Switch argument order
    return blocklyWrapper.Xml.domToWorkspace(xml, blockSpace);
  };
  blocklyWrapper.Xml.blockSpaceToDom = blocklyWrapper.Xml.workspaceToDom;

  return blocklyWrapper;
}

module.exports = initializeBlocklyWrapper;
