var constants = require('./constants');
var parseXmlElement = require('./xml').parseElement;

var TestResults = constants.TestResults;

// TODO (br-pair): can we not pass in the studioApp
var FeedbackBlocks = function(options, missingRequiredBlocks, missingRecommendedBlocks, studioApp) {
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
    options.response.hint = parts[1].trim();  // Remove blocks from hint.
    try {
      blocksToDisplay = JSON.parse(parts[2]);
    } catch(err) {
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
  var div = document.getElementById("feedbackBlocks");
  if (div !== this.div) {
    return;
  }

  // This is sort of a nasty hack. Throughout the blockly code,
  // constructors look at Blockly.readOnly to determine if they're
  // supposed to be readonly. Because we want this BlockSpace to be
  // readonly regardless of the global setting, we temporarily override
  // the value while we build what we want, then restore it at the end.
  // Similarly for languageTree, which is supposed to define the toolbox
  var readOnly = Blockly.readOnly;
  var languageTree = Blockly.languageTree;

  Blockly.readOnly = true;
  Blockly.languageTree = false;

  this.blockSpaceEditor = new Blockly.BlockSpaceEditor(this.div, function () {
    var metrics = Blockly.BlockSpaceEditor.prototype.getBlockSpaceMetrics_.call(this);
    if (!metrics) {
      return null;
    }
    // Expand the view so we don't see scrollbars
    metrics.viewHeight += Blockly.BlockSpace.SCROLLABLE_MARGIN_BELOW_BOTTOM;
    return metrics;
  }, function (xyRatio) {
    Blockly.BlockSpaceEditor.prototype.setBlockSpaceMetrics_.call(this, xyRatio);
  }, true);

  var blockSpace = this.blockSpaceEditor.blockSpace;
  var parsedXml = parseXmlElement(this.xml);
  Blockly.Xml.domToBlockSpace(blockSpace, parsedXml);

  Blockly.readOnly = readOnly;
  Blockly.languageTree = languageTree;
};

FeedbackBlocks.prototype.show = function () {
  this.div.style.visibility = '';
  this.div.style.height = '';
  if (this.blockSpaceEditor) {
    this.blockSpaceEditor.svgResize();
  }
};

FeedbackBlocks.prototype.hide = function() {
  this.div.style.visibility = 'hidden';
  this.div.style.height = '0px';
};

/**
 * Creates the XML for blocks to be displayed in a read-only frame.
 * @param {Array} blocks An array of blocks to display (with optional args).
 * @return {string} The generated string of XML.
 */
FeedbackBlocks.prototype.generateXMLForBlocks_ = function(blocks) {
  var blockXMLStrings = ['<xml>'];
  var blockX = 10;  // Prevent left output plugs from being cut off.
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
