export default function initializeBlocklyXml(blocklyWrapper) {
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
    const metrics = blockSpace.getMetrics();
    const width = metrics ? metrics.viewWidth : 0;
    const padding = 16;
    const verticalSpaceBetweenBlocks = 10;

    // Block positioning rules:
    // If the block XML has X/Y coordinates, use them to set the block
    // position. Note that RTL languages position from the left.
    // Otherwise, position the block in line with other blocks,
    // flowing from top to bottom. Blocks with absolute Y positions
    // do not influence the placement of other blocks.
    let cursor = {
      x: blockSpace.RTL ? width - padding : padding,
      y: padding
    };

    const positionBlock = function(block) {
      const heightWidth = block.blockly_block.getHeightWidth();

      if (isNaN(block.x)) {
        block.x = cursor.x;
      } else {
        block.x = blockSpace.RTL ? width - block.x : block.x;
      }

      if (isNaN(block.y)) {
        block.y = cursor.y;
        cursor.y += heightWidth.height + verticalSpaceBetweenBlocks;
      }
      block.blockly_block.moveTo(
        new Blockly.utils.Coordinate(block.x, block.y)
      );
    };

    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them in two passes.
    //  In the first pass, we position the visible blocks. In the second
    //  pass, we position the invisible blocks. We do this so that
    //  invisible blocks don't cause the visible blocks to flow
    //  differently, which could leave gaps between the visible blocks.
    const blocks = [];
    /**
     * NodeList.forEach() is not supported on IE. Use Array.prototype.forEach.call() as a workaround.
     * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
     */
    Array.prototype.forEach.call(xml.childNodes, function(xmlChild) {
      const blockly_block = Blockly.Xml.domToBlock(xmlChild, blockSpace);
      const x = parseInt(xmlChild.getAttribute('x'), 10);
      const y = parseInt(xmlChild.getAttribute('y'), 10);
      blocks.push({
        blockly_block: blockly_block,
        x: x,
        y: y
      });
    });

    blocks
      .filter(function(block) {
        return block.blockly_block.isVisible();
      })
      .forEach(positionBlock);

    blocks
      .filter(function(block) {
        return !block.blockly_block.isVisible();
      })
      .forEach(positionBlock);

    blockSpace.render();
    return blocks;
  };

  blocklyWrapper.Xml.blockSpaceToDom = blocklyWrapper.Xml.workspaceToDom;

  // We don't want to save absolute position in the block XML
  blocklyWrapper.Xml.blockToDomWithXY = blocklyWrapper.Xml.blockToDom;
}
