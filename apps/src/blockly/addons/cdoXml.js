export default function initializeBlocklyXml(blocklyWrapper) {
  // Clear xml namespace
  blocklyWrapper.utils.xml.NAME_SPACE = '';

  // Aliasing Google's domToBlock() so that we can override it, but still be able
  // to call Google's domToBlock() in the override function.
  blocklyWrapper.Xml.originalDomToBlock = blocklyWrapper.Xml.domToBlock;
  // Override domToBlock so that we can gracefully handle unknown blocks.
  blocklyWrapper.Xml.domToBlock = function(
    xmlBlock,
    workspace,
    parentConnection,
    connectedToParentNext
  ) {
    let block;
    try {
      block = blocklyWrapper.Xml.originalDomToBlock(
        xmlBlock,
        workspace,
        parentConnection,
        connectedToParentNext
      );
    } catch (e) {
      block = blocklyWrapper.Xml.originalDomToBlock(
        blocklyWrapper.Xml.textToDom('<block type="unknown" />'),
        workspace,
        parentConnection,
        connectedToParentNext
      );
      block
        .getField('NAME')
        .setValue(`unknown block: ${xmlBlock.getAttribute('type')}`);
    }
    return block;
  };

  blocklyWrapper.Xml.domToBlockSpace = function(blockSpace, xml) {
    // To position the blocks, we first render them all to the Block Space
    //  and parse any X or Y coordinates set in the XML. Then, we store
    //  the rendered blocks and the coordinates in an array so that we can
    //  position them in two passes.
    //  In the first pass, we position the visible blocks. In the second
    //  pass, we position the invisible blocks. We do this so that
    //  invisible blocks don't cause the visible blocks to flow
    //  differently, which could leave gaps between the visible blocks.
    const blocks = [];
    xml.childNodes.forEach(xmlChild => {
      if (xmlChild.nodeName.toLowerCase() !== 'block') {
        // skip non-block xml elements
        return;
      }
      const blockly_block = Blockly.Xml.domToBlock(xmlChild, blockSpace);
      const x = parseInt(xmlChild.getAttribute('x'), 10);
      const y = parseInt(xmlChild.getAttribute('y'), 10);
      blocks.push({
        blockly_block: blockly_block,
        x: x,
        y: y
      });
    });

    // Note that RTL languages position blocks from the left within a
    // blockSpace. For instructions and embedded hints, there is no viewWidth,
    // so we determine the starting point based on the width of the block.
    const metrics = blockSpace.getMetrics();
    const viewWidth = metrics ? metrics.viewWidth : 0;
    const blockWidth = blocks[0]
      ? blocks[0].blockly_block.getHeightWidth().width
      : 0;
    // Add padding if we are in a workspace.
    const padding = viewWidth ? 16 : 0;
    const verticalSpaceBetweenBlocks = 10;

    // The cursor is used to position blocks that don't have explicit x/y coordinates
    let cursor = {
      x: padding,
      y: padding
    };
    if (blockSpace.RTL && viewWidth) {
      // Position the cursor from the right of the workspace.
      cursor.x = viewWidth - padding;
    } else if (blockSpace.RTL && !viewWidth) {
      // Position the cursor from the right of the block.
      cursor.x = blockWidth - padding;
    }

    const positionBlock = function(block) {
      const heightWidth = block.blockly_block.getHeightWidth();
      const hasFrameSvg = !!block.blockly_block.functionalSvg_;
      const frameSvgSize = hasFrameSvg ? 40 : 0;
      const frameSvgTop = hasFrameSvg ? 35 : 0;
      const frameSvgMargin = hasFrameSvg ? 16 : 0;

      // If the block doesn't already have coordinates, use the cursor.
      if (isNaN(block.x)) {
        block.x = cursor.x;
      } else if (blockSpace.RTL) {
        // Position RTLs with coordinates from the left.
        block.x = viewWidth - block.x;
      }
      // Adjust for Svg Frames for function definition blocks
      if (!blockSpace.RTL) {
        block.x += frameSvgMargin;
      } else {
        block.x -= frameSvgMargin;
      }

      if (isNaN(block.y)) {
        block.y = cursor.y + frameSvgTop;
        cursor.y +=
          heightWidth.height + verticalSpaceBetweenBlocks + frameSvgSize;
      }

      block.blockly_block.moveTo(
        new Blockly.utils.Coordinate(block.x, block.y)
      );
    };

    blocks.sort(reorderBlocks);

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

// Compare function - Moves functional definitions to the end of a block list.
function reorderBlocks(a, b) {
  if (
    a.blockly_block.type === 'procedures_defnoreturn' &&
    b.blockly_block.type !== 'procedures_defnoreturn'
  ) {
    return 1; // Sort a after b.
  } else if (
    b.blockly_block.type === 'procedures_defnoreturn' &&
    a.blockly_block.type !== 'procedures_defnoreturn'
  ) {
    return -1; // Sort a before b.
  } else {
    return 0; // Keep original order.
  }
}
