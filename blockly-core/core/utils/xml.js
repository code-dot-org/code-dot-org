/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global Blockly, goog */

/**
 * @fileoverview XML reader and writer.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Xml');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');


/**
 * Encode a block tree as XML.
 * @param {!Object} blockSpace The SVG blockSpace.
 * @return {!Element} XML document.
 */
Blockly.Xml.blockSpaceToDom = function(blockSpace) {
  var xml = Blockly.isMsie() ? document.createElementNS(null, 'xml') :
                               document.createElement("xml");
  var blocks = blockSpace.getTopBlocks(true);
  for (var i = 0, block; i < blocks.length; i++) {
    block = blocks[i];
    var element = Blockly.Xml.blockToDom(block);
    xml.appendChild(element);
  }
  return xml;
};

/**
 * Encode a block subtree as XML.
 * @param {!Blockly.Block} block The root block to encode.
 * @param {boolean} ignoreChildBlocks If true, will not encode any child
 *  statements or connected blocks.  Will still encode value blocks
 * @return {!Element} Tree of XML elements.
 */
Blockly.Xml.blockToDom = function(block, ignoreChildBlocks) {
  var element = goog.dom.createDom('block');

  var container;
  var x, y, i, input, title;

  element.setAttribute('type', block.type);
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    var mutation = block.mutationToDom();
    if (mutation) {
      element.appendChild(mutation);
    }
  }
  function titleToDom(title) {
    if (title.name && title.EDITABLE) {
      var container = goog.dom.createDom('title', null, title.getValue());
      container.setAttribute('name', title.name);
      if (title.config) {
        container.setAttribute('config', title.config);
      }
      element.appendChild(container);
    }
  }
  for (x = 0; x < block.inputList.length; x++) {
    input = block.inputList[x];
    for (y = 0; y < input.titleRow.length; y++) {
      title = input.titleRow[y];
      titleToDom(title);
    }
  }

  if (block.comment) {
    var commentElement = goog.dom.createDom('comment', null,
        block.comment.getText());
    commentElement.setAttribute('pinned', block.comment.isVisible());
    var hw = block.comment.getBubbleSize();
    commentElement.setAttribute('h', hw.height);
    commentElement.setAttribute('w', hw.width);
    element.appendChild(commentElement);
  }

  var setInlineAttribute = false;
  for (i = 0; i < block.inputList.length; i++) {
    input = block.inputList[i];
    var empty = true;
    if (input.type == Blockly.DUMMY_INPUT) {
      continue;
    } else {
      var ignoreChild = false;
      var childBlock = input.connection.targetBlock();
      if (input.type === Blockly.INPUT_VALUE) {
        container = goog.dom.createDom('value');
        setInlineAttribute = true;
      } else if (input.type === Blockly.NEXT_STATEMENT) {
        container = goog.dom.createDom('statement');
        ignoreChild = ignoreChildBlocks;
      } else if (input.type === Blockly.FUNCTIONAL_INPUT) {
        container = goog.dom.createDom('functional_input');
        ignoreChild = ignoreChildBlocks;
        setInlineAttribute = true;
      }
      if (childBlock && !ignoreChild) {
        container.appendChild(Blockly.Xml.blockToDom(childBlock));
        empty = false;
      }
    }
    container.setAttribute('name', input.name);
    if (!empty) {
      element.appendChild(container);
    }
  }
  if (setInlineAttribute) {
    element.setAttribute('inline', block.inputsInline);
  }
  if (block.isCollapsed()) {
    element.setAttribute('collapsed', true);
  }
  if (block.disabled) {
    element.setAttribute('disabled', true);
  }
  if (!block.isDeletable()) {
    element.setAttribute('deletable', false);
  }
  if (!block.isMovable()) {
    element.setAttribute('movable', false);
  }
  if (!block.isEditable()) {
    element.setAttribute('editable', false);
  }
  if (!block.isUserVisible()) {
    element.setAttribute('uservisible', false);
  }
  if (block.isNextConnectionDisabled()) {
    element.setAttribute('next_connection_disabled', true);
  }
  if (/^procedures_def/.test(block.type) && block.userCreated) {
    element.setAttribute('usercreated', true);
  }
  if (block.htmlId) {
    element.setAttribute('id', block.htmlId);
  }

  // Don't follow connections if we're ignoring child blocks
  if (block.nextConnection && !ignoreChildBlocks) {
    var nextBlock = block.nextConnection.targetBlock();
    if (nextBlock) {
      container = goog.dom.createDom('next', null,
          Blockly.Xml.blockToDom(nextBlock));
      element.appendChild(container);
    }
  }

  return element;
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToText = function(dom) {
  var oSerializer = new XMLSerializer();
  var text = oSerializer.serializeToString(dom);
  var re = new RegExp(" xmlns=\"http://www.w3.org/1999/xhtml\"", 'g');
  return text.replace(re, '');
};

/**
 * Converts a DOM structure into properly indented text.
 * @param {!Element} dom A tree of XML elements.
 * @return {string} Text representation.
 */
Blockly.Xml.domToPrettyText = function(dom) {
  // This function is not guaranteed to be correct for all XML.
  // But it handles the XML that Blockly generates.
  var blob = Blockly.Xml.domToText(dom);
  // Place every open and close tag on its own line.
  var lines = blob.split('<');
  // Indent every line.
  var indent = '';
  for (var x = 1; x < lines.length; x++) {
    var line = lines[x];
    if (line[0] == '/') {
      indent = indent.substring(2);
    }
    lines[x] = indent + '<' + line;
    if (line[0] != '/' && line.slice(-2) != '/>') {
      indent += '  ';
    }
  }
  // Pull simple tags back together.
  // E.g. <foo></foo>
  var text = lines.join('\n');
  text = text.replace(/(<(\w+)\b[^>]*>[^\n]*)\n *<\/\2>/g, '$1</$2>');
  // Trim leading blank line.
  return text.replace(/^\n/, '');
};

/**
 * Converts plain text into a DOM structure.
 * Throws an error if XML doesn't parse.
 * @param {string} text Text representation.
 * @return {!Element} A tree of XML elements.
 */
Blockly.Xml.textToDom = function(text) {
  var oParser = new DOMParser();
  var dom = oParser.parseFromString(text, 'text/xml');
  // The DOM should have one and only one top-level node, an XML tag.
  if (!dom || !dom.firstChild ||
      dom.firstChild.nodeName.toLowerCase() != 'xml') {
    // Whatever we got back from the parser is not XML.
    throw 'Blockly.Xml.textToDom did not obtain a valid XML tree.';
  }
  return dom.firstChild;
};

/**
 * Decode an XML DOM and create blocks on the blockSpace.
 * @param {!Blockly.BlockSpace} blockSpace The SVG blockSpace.
 * @param {!Element} xml XML DOM.
 */
Blockly.Xml.domToBlockSpace = function(blockSpace, xml) {
  var metrics = blockSpace.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;

  // Block positioning rules are simple:
  //  if the block has been given an absolute X coordinate, use it
  //  (taking into account that RTL languages position from the left)
  //  if the block has been given an absolute Y coordinate, use it
  //  otherwise, the block "flows" with the other blocks from top to
  //  bottom. Any block positioned absolutely with Y does not influence
  //  the flow of the other blocks.
  var cursor = {
    x: Blockly.RTL ?
        width - Blockly.BlockSpace.AUTO_LAYOUT_PADDING_LEFT :
        Blockly.BlockSpace.AUTO_LAYOUT_PADDING_LEFT,
    y: Blockly.BlockSpace.AUTO_LAYOUT_PADDING_TOP
  };

  var positionBlock = function (block) {
    var padding = block.blockly_block.getSvgPadding() ||
        {top: 0, right: 0, bottom: 0, left: 0};

    var heightWidth = block.blockly_block.getHeightWidth();

    if (isNaN(block.x)) {
      block.x = cursor.x;
      block.x += Blockly.RTL ? -padding.right : padding.left;
    } else {
      block.x = Blockly.RTL ? width - block.x : block.x;
    }

    if (isNaN(block.y)) {
      block.y = cursor.y + padding.top;
      cursor.y += heightWidth.height +
          Blockly.BlockSvg.SEP_SPACE_Y +
          padding.bottom +
          padding.top;
    }

    block.blockly_block.moveTo(block.x, block.y);
  };

  // To position the blocks, we first render them all to the Block Space
  //  and parse any X or Y coordinates set in the XML. Then, we store
  //  the rendered blocks and the coordinates in an array so that we can
  //  position them in two passes.
  //  In the first pass, we position the visible blocks. In the second
  //  pass, we position the invisible blocks. We do this so that
  //  invisible blocks don't cause the visible blocks to flow
  //  differently, which could leave gaps between the visible blocks.
  var blocks = [];
  for (var i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
    if (xmlChild.nodeName.toLowerCase() === 'block') {
      var blockly_block = Blockly.Xml.domToBlock(blockSpace, xmlChild);
      var x = parseInt(xmlChild.getAttribute('x'), 10);
      var y = parseInt(xmlChild.getAttribute('y'), 10);
      blocks.push({
        blockly_block: blockly_block,
        x: x,
        y: y
      });
    }
  }

  blocks.filter(function (block) {
    return block.blockly_block.isVisible();
  }).forEach(positionBlock);

  blocks.filter(function (block) {
    return !block.blockly_block.isVisible();
  }).forEach(positionBlock);

  blockSpace.events.dispatchEvent(Blockly.BlockSpace.EVENTS.EVENT_BLOCKS_IMPORTED);
};

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * blockSpace.
 * @param {!Blockly.BlockSpace} blockSpace The blockSpace.
 * @param {!Element} xmlBlock XML block element.
 * @return {!Blockly.Block} The root block created.
 */
Blockly.Xml.domToBlock = function(blockSpace, xmlBlock) {
  var prototypeName = xmlBlock.getAttribute('type');
  var id = xmlBlock.getAttribute('id');
  var block = new Blockly.Block(blockSpace, prototypeName, id);
  block.initSvg();

  var inline = xmlBlock.getAttribute('inline');
  if (inline) {
    block.setInputsInline(inline === 'true');
  }
  var collapsed = xmlBlock.getAttribute('collapsed');
  if (collapsed) {
    block.setCollapsed(collapsed === 'true');
  }
  var disabled = xmlBlock.getAttribute('disabled');
  if (disabled) {
    block.setDisabled(disabled === 'true');
  }
  var deletable = xmlBlock.getAttribute('deletable');
  if (deletable) {
    block.setDeletable(deletable === 'true');
  }
  var movable = xmlBlock.getAttribute('movable');
  if (movable) {
    block.setMovable(movable === 'true');
  }
  var editable = xmlBlock.getAttribute('editable');
  if (editable) {
    block.setEditable(editable === 'true');
  }
  var next_connection_disabled = xmlBlock.getAttribute('next_connection_disabled');
  if (next_connection_disabled) {
    block.setNextConnectionDisabled(next_connection_disabled === 'true');
  }
  var userVisible = xmlBlock.getAttribute('uservisible');
  if (userVisible) {
    block.setUserVisible(userVisible === 'true');
  }
  var userCreated = xmlBlock.getAttribute('usercreated');
  if (userCreated) {
    block.userCreated = (userCreated === 'true');
  }

  var blockChild = null;
  for (var x = 0, xmlChild; x < xmlBlock.childNodes.length; x++) {
    xmlChild = xmlBlock.childNodes[x];
    if (xmlChild.nodeType == 3 && xmlChild.data.match(/^\s*$/)) {
      // Extra whitespace between tags does not concern us.
      continue;
    }
    var input;

    // Find the first 'real' grandchild node (that isn't whitespace).
    var firstRealGrandchild = null;
    for (var y = 0, grandchildNode; y < xmlChild.childNodes.length; y++) {
      grandchildNode = xmlChild.childNodes[y];
      if (grandchildNode.nodeType != 3 || !grandchildNode.data.match(/^\s*$/)) {
        firstRealGrandchild = grandchildNode;
      }
    }

    var name = xmlChild.getAttribute('name');
    switch (xmlChild.nodeName.toLowerCase()) {
      case 'mutation':
        // Custom data for an advanced block.
        if (block.domToMutation) {
          block.domToMutation(xmlChild);
        }
        break;
      case 'comment':
        block.setCommentText(xmlChild.textContent);
        var visible = xmlChild.getAttribute('pinned');
        if (visible) {
          block.comment.setVisible(visible == 'true');
        }
        var bubbleW = parseInt(xmlChild.getAttribute('w'), 10);
        var bubbleH = parseInt(xmlChild.getAttribute('h'), 10);
        if (!isNaN(bubbleW) && !isNaN(bubbleH)) {
          block.comment.setBubbleSize(bubbleW, bubbleH);
        }
        break;
      case 'title':
        /**
         * XML example:
         * <block type="draw_move_by_constant">
         *   <title name="DIR">moveForward</title>
         *   <title name="VALUE" config="1,3,5-10">10</title>
         * </block>
         */
        var config = xmlChild.getAttribute('config');
        if (config) {
          block.setFieldConfig(name, config);
        }
        block.setTitleValue(xmlChild.textContent, name);
        break;
      case 'value':
      case 'statement':
      case 'functional_input':
        input = block.getInput(name);
        if (!input) {
          throw 'Input does not exist: ' + name;
        }
        if (firstRealGrandchild &&
            firstRealGrandchild.nodeName.toLowerCase() == 'block') {
          blockChild = Blockly.Xml.domToBlock(blockSpace, firstRealGrandchild);
          if (blockChild.outputConnection) {
            input.connection.connect(blockChild.outputConnection);
          } else if (blockChild.previousConnection) {
            input.connection.connect(blockChild.previousConnection);
          } else {
            throw 'Child block does not have output or previous statement.';
          }
        }
        break;
      case 'next':
        if (firstRealGrandchild &&
            firstRealGrandchild.nodeName.toLowerCase() == 'block') {
          if (!block.nextConnection) {
            throw 'Next statement does not exist.';
          } else if (block.nextConnection.targetConnection) {
            // This could happen if there is more than one XML 'next' tag.
            throw 'Next statement is already connected.';
          }
          blockChild = Blockly.Xml.domToBlock(blockSpace, firstRealGrandchild);
          if (!blockChild.previousConnection) {
            throw 'Next block does not have previous statement.';
          }
          block.nextConnection.connect(blockChild.previousConnection);
        }
        break;
      default:
        // Unknown tag; ignore.  Same principle as HTML parsers.
    }
  }

  var next = block.nextConnection && block.nextConnection.targetBlock();
  if (next) {
    // Next block in a stack needs to square off its corners.
    // Rendering a child will render its parent.
    next.render();
  } else {
    block.render();
  }
  return block;
};

/**
 * Remove any 'next' block (statements in a stack).
 * @param {!Element} xmlBlock XML block element.
 */
Blockly.Xml.deleteNext = function(xmlBlock) {
  for (var x = 0, child; x < xmlBlock.childNodes.length; x++) {
    child = xmlBlock.childNodes[x];
    if (child.nodeName.toLowerCase() == 'next') {
      xmlBlock.removeChild(child);
      break;
    }
  }
};
