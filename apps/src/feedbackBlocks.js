var constants = require('./constants');
var parseXmlElement = require('./xml').parseElement;

var TestResults = constants.TestResults;

// TODO (br-pair): can we not pass in the studioApp
var FeedbackBlocks = function (options, missingRequiredBlocks, missingRecommendedBlocks, studioApp) {
  // Check whether blocks are embedded in the hint returned from dashboard.
  // See below comment for format.
  var embeddedBlocks = options.response && options.response.hint &&
      options.response.hint.indexOf("[{") !== 0;
  if (!embeddedBlocks &&
      options.feedbackType !== TestResults.MISSING_BLOCK_UNFINISHED &&
      options.feedbackType !== TestResults.MISSING_BLOCK_FINISHED &&
      options.feedbackType !== TestResults.MISSING_RECOMMENDED_BLOCK_UNFINISHED &&
      options.feedbackType !== TestResults.MISSING_RECOMMENDED_BLOCK_FINISHED) {
    return;
  }

  var blocksToDisplay = [];
  if (embeddedBlocks) {
    // Hint should be of the form: SOME TEXT [{..}, {..}, ..] IGNORED.
    // Example: 'Try the following block: [{"type": "maze_moveForward"}]'
    // Note that double quotes are required by the JSON parser.
    var parts = options.response.hint.match(/(.*)(\[.*\])/);
    if (!parts) {
      return;
    }
    options.response.hint = parts[1].trim(); // Remove blocks from hint.
    try {
      blocksToDisplay = JSON.parse(parts[2]);
    } catch (err) {
      // The blocks could not be parsed.  Ignore them.
      return;
    }
  } else if (missingRequiredBlocks.blocksToDisplay.length) {
    handleMissingBlocks(missingRequiredBlocks);
  } else {
    handleMissingBlocks(missingRecommendedBlocks);
  }

  function handleMissingBlocks(blocks) {
    blocksToDisplay = blocks.blocksToDisplay;
    if (blocks.message) {
      options.message = blocks.message;
    }
  }

  if (blocksToDisplay.length === 0) {
    return;
  }

  this.xml = this.generateXMLForBlocks_(blocksToDisplay);

  this.div = document.createElement('div');
  this.div.setAttribute('id', 'feedbackBlocks');

  // Will be set by this.render()
  this.blockSpaceEditor = undefined;
};

module.exports = FeedbackBlocks;

FeedbackBlocks.prototype.render = function () {
  // Only render if this.div exists in the DOM
  if (!document.body.contains(this.div)) {
    return;
  }

  var parsedXml = parseXmlElement(this.xml);
  var blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(this.div, parsedXml);
  this.blockSpaceEditor = blockSpace.blockSpaceEditor;
};

FeedbackBlocks.prototype.show = function () {
  this.div.style.visibility = '';
  this.div.style.height = '';
  if (this.blockSpaceEditor) {
    this.blockSpaceEditor.svgResize();
  }
};

FeedbackBlocks.prototype.hide = function () {
  this.div.style.visibility = 'hidden';
  this.div.style.height = '0px';
};

/**
 * Creates the XML for blocks to be displayed in a read-only frame.
 * @param {Array} blocks An array of blocks to display (with optional args).
 * @return {string} The generated string of XML.
 */
FeedbackBlocks.prototype.generateXMLForBlocks_ = function (blocks) {
  var blockXMLStrings = ['<xml>'];
  var blockX = 10; // Prevent left output plugs from being cut off.
  var blockY = 0;
  var blockXPadding = 200;
  var blockYPadding = 120;
  var blocksPerLine = 2;
  var k, name;
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.blockDisplayXML) {
      blockXMLStrings.push(block.blockDisplayXML);
      continue;
    }
    blockXMLStrings.push('<block', ' type="', block.type, '" x="',
        blockX.toString(), '" y="', blockY, '">');
    if (block.titles) {
      var titleNames = Object.keys(block.titles);
      for (k = 0; k < titleNames.length; k++) {
        name = titleNames[k];
        blockXMLStrings.push('<title name="', name, '">',
            block.titles[name], '</title>');
      }
    }
    if (block.values) {
      var valueNames = Object.keys(block.values);
      for (k = 0; k < valueNames.length; k++) {
        name = valueNames[k];
        blockXMLStrings.push('<value name="', name, '">',
            block.values[name], '</value>');
      }
    }
    if (block.extra) {
      blockXMLStrings.push(block.extra);
    }
    blockXMLStrings.push('</block>');
    if ((i + 1) % blocksPerLine === 0) {
      blockY += blockYPadding;
      blockX = 0;
    } else {
      blockX += blockXPadding;
    }
  }
  blockXMLStrings.push('</xml>');
  return blockXMLStrings.join('');
};
