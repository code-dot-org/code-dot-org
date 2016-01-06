require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/ubuntu/staging/apps/build/js/jigsaw/main.js":[function(require,module,exports){
(function (global){
'use strict';

var appMain = require('../appMain');
window.Jigsaw = require('./jigsaw');
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.jigsawMain = function (options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Jigsaw, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkL2pzL2ppZ3Nhdy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwQyxNQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUNqQyxRQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7Q0FDL0I7QUFDRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2pDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFL0IsTUFBTSxDQUFDLFVBQVUsR0FBRyxVQUFTLE9BQU8sRUFBRTtBQUNwQyxTQUFPLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUM1QixTQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM5QixTQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDekMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuSmlnc2F3ID0gcmVxdWlyZSgnLi9qaWdzYXcnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuSmlnc2F3ID0gd2luZG93LkppZ3Nhdztcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5qaWdzYXdNYWluID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5KaWdzYXcsIGxldmVscywgb3B0aW9ucyk7XG59O1xuIl19
},{"../appMain":"/home/ubuntu/staging/apps/build/js/appMain.js","./blocks":"/home/ubuntu/staging/apps/build/js/jigsaw/blocks.js","./jigsaw":"/home/ubuntu/staging/apps/build/js/jigsaw/jigsaw.js","./levels":"/home/ubuntu/staging/apps/build/js/jigsaw/levels.js","./skins":"/home/ubuntu/staging/apps/build/js/jigsaw/skins.js"}],"/home/ubuntu/staging/apps/build/js/jigsaw/skins.js":[function(require,module,exports){
/**
 * Load Skin for Jigsaw.
 */

'use strict';

var skinsBase = require('../skins');

var CONFIGS = {

  jigsaw: {}

};

exports.load = function (assetUrl, id) {
  var skin = skinsBase.load(assetUrl, id);
  var config = CONFIGS[skin.id];

  skin.artist = skin.assetUrl('artist.png');
  skin.blocks = skin.assetUrl('blocks.png');

  skin.apple = skin.assetUrl('apple.png');
  skin.smiley = skin.assetUrl('smiley.png');
  skin.snail = skin.assetUrl('snail.png');
  skin.elephant = skin.assetUrl('elephant.png');
  skin.fish = skin.assetUrl('fish.png');
  skin.doggie = skin.assetUrl('doggie.png');
  skin.tree = skin.assetUrl('tree.png');
  skin.flower = skin.assetUrl('flower.png');
  skin.house = skin.assetUrl('house.png');
  skin.computer = skin.assetUrl('computer.png');

  skin.blank = skin.assetUrl('blank.png');
  skin.smallStaticAvatar = skin.blank;

  // Settings
  skin.background = skin.assetUrl('background.png');

  return skin;
};

},{"../skins":"/home/ubuntu/staging/apps/build/js/skins.js"}],"/home/ubuntu/staging/apps/build/js/jigsaw/jigsaw.js":[function(require,module,exports){
/**
 * Blockly App: Jigsaw
 *
 * Copyright 2013 Code.org
 *
 */

'use strict';

var studioApp = require('../StudioApp').singleton;
var skins = require('../skins');
var page = require('../templates/page.html.ejs');
var dom = require('../dom');

/**
 * Create a namespace for the application.
 */
var Jigsaw = module.exports;

var level;
var skin;

var ResultType = studioApp.ResultType;
var TestResults = studioApp.TestResults;

studioApp.setCheckForEmptyBlocks(true);

// Never bump neighbors for Jigsaw
Blockly.BUMP_UNCONNECTED = false;

function useLargeNotches() {
  var notchHeight = 8;
  var notchWidthA = 6;
  var notchWidthB = 10;

  Blockly.BlockSvg.NOTCH_PATH_WIDTH = notchWidthA * 2 + notchWidthB;
  Blockly.BlockSvg.NOTCH_WIDTH = 50;

  var notchPathLeft = 'l ' + notchWidthA + ',' + notchHeight + ' ' + notchWidthB + ',0 ' + notchWidthA + ',-' + notchHeight;
  var notchPathRight = 'l ' + '-' + notchWidthA + ',' + notchHeight + ' ' + '-' + notchWidthB + ',0 ' + '-' + notchWidthA + ',-' + notchHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
  // Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

  var notchHighlightHeight = notchHeight; //4;
  var notchHighlightWidthA = notchWidthA + 0.5; //6.5;
  var notchHighlightWidthB = notchWidthB - 1; //2;

  var notchPathLeftHighlight = 'l ' + notchHighlightWidthA + ',' + notchHighlightHeight + ' ' + notchHighlightWidthB + ',0 ' + notchHighlightWidthA + ',-' + notchHighlightHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';

  Blockly.Connection.NOTCH_PATHS_OVERRIDE = {
    left: notchPathLeft,
    leftHighlight: notchPathLeftHighlight,
    right: notchPathRight
  };
}

// Default Scalings
Jigsaw.scale = {
  'snapRadius': 1,
  'stepSpeed': 33
};

var loadLevel = function loadLevel() {
  // Load maps.
  // Override scalars.
  for (var key in level.scale) {
    Jigsaw.scale[key] = level.scale[key];
  }

  Jigsaw.MAZE_WIDTH = 0;
  Jigsaw.MAZE_HEIGHT = 0;

  Jigsaw.block1Clicked = false;
};

var drawMap = function drawMap() {
  // Hide the left column and the resize bar.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.display = 'none';
  var visualizationResizeBar = document.getElementById('visualizationResizeBar');
  visualizationResizeBar.style.display = 'none';

  if (level.ghost) {
    var blockCanvas = Blockly.mainBlockSpace.getCanvas();
    Blockly.createSvgElement('rect', {
      fill: "url(#pat_" + level.id + "A)",
      "fill-opacity": "0.2",
      width: level.image.width,
      height: level.image.height,
      transform: "translate(" + level.ghost.x + ", " + level.ghost.y + ")"
    }, blockCanvas, {
      beforeExisting: true
    });
  }
};

/**
 * Initialize Blockly and the Jigsaw app.  Called on page load.
 */
Jigsaw.init = function (config) {
  // Jigsaw.clearEventHandlersKillTickLoop();
  skin = config.skin;
  level = config.level;
  loadLevel();

  if (level.largeNotches) {
    useLargeNotches();
  }
  Blockly.SNAP_RADIUS = level.snapRadius || 90;

  config.html = page({
    assetUrl: studioApp.assetUrl,
    data: {
      localeDirection: studioApp.localeDirection(),
      controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl }),
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
    }
  });

  // TODO (br-pair) : I think this is something that's happening in all apps?
  config.loadAudio = function () {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function () {
    /**
     * The richness of block colours, regardless of the hue.
     * MOOC blocks should be brighter (target audience is younger).
     * Must be in the range of 0 (inclusive) to 1 (exclusive).
     * Blockly's default is 0.45.
     */
    Blockly.HSV_SATURATION = 0.6;

    drawMap();
  };

  // only have trashcan for levels with toolbox
  config.trashcan = !!level.toolbox;
  config.scrollbars = false;

  config.enableShowCode = false;
  config.enableShowBlockCount = false;

  studioApp.init(config);

  document.getElementById('runButton').style.display = 'none';
  Jigsaw.successListener = Blockly.mainBlockSpaceEditor.addChangeListener(function (evt) {
    checkForSuccess();
  });

  // Only used by level1, in which the success criteria is clicking on the block
  var block1 = document.querySelectorAll("[block-id='1']")[0];
  if (block1) {
    dom.addMouseDownTouchEvent(block1, function () {
      Jigsaw.block1Clicked = true;
    });
  }
};

function checkForSuccess() {
  var success = level.goal.successCondition();
  if (success) {
    Blockly.removeChangeListener(Jigsaw.successListener);

    Jigsaw.result = ResultType.SUCCESS;
    Jigsaw.onPuzzleComplete();
  }
}

/**
 * App specific displayFeedback function that calls into
 * studioApp.displayFeedback when appropriate
 */
var displayFeedback = function displayFeedback() {
  if (!Jigsaw.waitingForReport) {
    studioApp.displayFeedback({
      app: 'Jigsaw',
      skin: skin.id,
      feedbackType: Jigsaw.testResults,
      response: Jigsaw.response,
      level: level
    });
  }
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
Jigsaw.onReportComplete = function (response) {
  Jigsaw.response = response;
  Jigsaw.waitingForReport = false;
  studioApp.onReportComplete(response);
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Jigsaw.execute = function () {
  // execute is a no-op for jigsaw
};

Jigsaw.onPuzzleComplete = function () {

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = Jigsaw.result == ResultType.SUCCESS;

  Jigsaw.testResults = studioApp.getTestResults(levelComplete, {
    allowTopBlocks: true
  });

  if (Jigsaw.testResults >= TestResults.FREE_PLAY) {
    studioApp.playAudio('win');
  } else {
    studioApp.playAudio('failure');
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  Jigsaw.waitingForReport = true;

  // Report result to server.
  studioApp.report({
    app: 'Jigsaw',
    level: level.id,
    result: Jigsaw.result === ResultType.SUCCESS,
    testResult: Jigsaw.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: Jigsaw.onReportComplete
  });
};

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs"}],"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs":[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape
/**/) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('./locale') ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"./locale":"/home/ubuntu/staging/apps/build/js/jigsaw/locale.js","ejs":"/home/ubuntu/staging/apps/node_modules/ejs/lib/ejs.js"}],"/home/ubuntu/staging/apps/build/js/jigsaw/blocks.js":[function(require,module,exports){
/**
 * Blockly App: Jigsaw
 *
 * Copyright 2013 Code.org
 *
 */
'use strict';

var msg = require('./locale');
var dom = require('../dom');
var levels = require('./levels');

var patternCache = {
  queued: [],
  created: {},

  /**
   * Stick an item in our queue
   */
  addToQueue: function addToQueue(patternInfo) {
    this.queued.push(patternInfo);
  },

  /**
   * Add all the svg patterns we've queued up.
   */
  addQueuedPatterns: function addQueuedPatterns() {
    this.queued.forEach(function (pattern) {
      addPattern(pattern.id, pattern.imagePath, pattern.width, pattern.height, pattern.offsetX, pattern.offsetY);
    });
    this.queued = [];
  },

  /**
   * Have we already created an svg element for this patternInfo?  Throws if
   * we ask with a patternInfo that has the same id but different attributes.
   */
  wasCreated: function wasCreated(patternInfo) {
    var equal = true;
    var cached = this.created[patternInfo.id];
    if (!cached) {
      return false;
    }

    Object.keys(patternInfo).forEach(function (key) {
      if (patternInfo[key] !== cached[key]) {
        equal = false;
      }
    });
    if (!equal) {
      throw new Error("Can't add attribute of same id with different attributes");
    }
    return true;
  },

  /**
   * Mark that we've created an svg pattern
   */
  markCreated: function markCreated(patternInfo) {
    if (this.created[patternInfo.id]) {
      throw new Error('Already have cached item with id: ' + patternInfo.id);
    }
    this.created[patternInfo.id] = patternInfo;
  }

};

var patterns = [];
var createdPatterns = {};

/**
 * Add an svg pattern for the given image. If document is not yet fully loaded,
 * it will add the pattern to a list for later.
 *
 * @param {string} id Pattern name
 * @param {string} imagePath Url of the image
 * @param {number} width Width of the image
 * @param {number} height Height of the image
 * @param {number|function} offsetX Offset of the image to start pattern
 * @param {number|function} offsetY Offset of the image to start pattern
 */
var addPattern = function addPattern(id, imagePath, width, height, offsetX, offsetY) {
  var x, y, pattern, patternImage;
  var patternInfo = {
    id: id,
    imagePath: imagePath,
    width: width,
    height: height,
    offsetX: offsetX,
    offsetY: offsetY
  };

  // If we don't yet have an svgDefs, queue the pattern and wait until we do
  var svgDefs = document.getElementById('blocklySvgDefs');
  if (!svgDefs) {
    patternCache.addToQueue(patternInfo);
  } else if (!patternCache.wasCreated(patternInfo)) {
    // add the pattern
    x = typeof offsetX === "function" ? -offsetX() : -offsetX;
    y = typeof offsetY === "function" ? -offsetY() : -offsetY;
    pattern = Blockly.createSvgElement('pattern', {
      id: id,
      patternUnits: 'userSpaceOnUse',
      width: "100%",
      height: height,
      x: x,
      y: y
    }, svgDefs);
    patternImage = Blockly.createSvgElement('image', {
      width: width,
      height: height
    }, pattern);
    patternImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imagePath);

    patternCache.markCreated(patternInfo);
  }
  return id;
};

/**
 * Search the workspace for a block of the given type
 *
 * @param {string} type The type of the block to search for
 */
var blockOfType = function blockOfType(type) {
  var blocks = Blockly.mainBlockSpace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === type) {
      return blocks[i];
    }
  }
  return null;
};

/**
 * Get the width of the block of the given type
 *
 * @param {string} type The type of the block to search for
 */
var blockWidth = function blockWidth(type) {
  return blockOfType(type).getHeightWidth().width;
};

function addQueuedWhenReady() {
  if (!document.getElementById('blocklySvgDefs')) {
    setTimeout(addQueuedWhenReady, 100);
    return;
  }
  patternCache.addQueuedPatterns();
}

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function (blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  // could make this settable on the level if I need
  var HSV = [0, 1.00, 0.98];

  var existingBlocks = Object.keys(blockly.Blocks);

  Object.keys(levels).forEach(function (key) {
    var level = levels[key];
    generateJigsawBlocksForLevel(blockly, skin, {
      image: skin[level.image.name],
      HSV: level.backgroundHSV || HSV,
      width: level.image.width,
      height: level.image.height,
      numBlocks: level.numBlocks,
      notchedEnds: level.notchedEnds,
      level: key
    });

    if (level.numBlocks === 0) {
      // still want the pattern for the ghost
      var patternName = 'pat_' + level.id + 'A';
      addPattern(patternName, skin[level.image.name], level.image.width, level.image.height, 0, 0);
    }
  });

  generateBlankBlock(blockly, skin, 'jigsaw_repeat', [322, 0.90, 0.95], 100, true);
  generateBlankBlock(blockly, skin, 'jigsaw_green', [140, 1.00, 0.74], 80);
  generateBlankBlock(blockly, skin, 'jigsaw_blue', [184, 1.00, 0.74], 80);
  generateBlankBlock(blockly, skin, 'jigsaw_purple', [312, 0.32, 0.62], 80);

  // Go through all added blocks, and add empty generators for those that
  // weren't already given generators
  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;
  Object.keys(blockly.Blocks).forEach(function (block) {
    if (existingBlocks.indexOf(block) === -1 && !generator[block]) {
      generator[block] = function () {
        return '\n';
      };
    }
  });

  addQueuedWhenReady();

  delete blockly.Blocks.procedures_defreturn;
  delete blockly.Blocks.procedures_ifreturn;
};

function generateBlankBlock(blockly, skin, name, hsv, width, hasAppend) {
  blockly.Blocks[name] = {
    helpUrl: '',
    init: function init() {
      this.setHSV.apply(this, hsv);
      this.appendDummyInput().appendTitle(new blockly.FieldImage(skin.blank, width, 54));
      this.setPreviousStatement(true);
      if (hasAppend) {
        this.appendStatementInput('child');
      }
      this.setNextStatement(true);
    }
  };
}

function generateJigsawBlocksForLevel(blockly, skin, options) {
  var image = options.image;
  var width = options.width;
  var height = options.height;
  var numBlocks = options.numBlocks;
  var level = options.level;
  var HSV = options.HSV;
  // if true, first/last block will still have previous/next notches
  var notchedEnds = options.notchedEnds;

  var blockHeight = height / numBlocks;
  var titleWidth = width - 20;
  var titleHeight = blockHeight - 10;

  var letters = '-ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function generateBlock(blockNum) {
    var blockName = 'jigsaw_' + level + letters[blockNum];
    var patternName = 'pat_' + level + letters[blockNum];
    blockly.Blocks[blockName] = {
      helpUrl: '',
      init: function init() {
        this.setHSV.apply(this, HSV);
        this.appendDummyInput().appendTitle(new blockly.FieldImage(skin.blank, titleWidth, titleHeight));
        this.setPreviousStatement(blockNum !== 1 || notchedEnds);
        this.setNextStatement(blockNum !== numBlocks || notchedEnds);
        this.setFillPattern(addPattern(patternName, image, width, height, 0, blockHeight * (blockNum - 1)));
      }
    };
  }

  for (var i = 1; i <= numBlocks; i++) {
    generateBlock(i);
  }
}

},{"../dom":"/home/ubuntu/staging/apps/build/js/dom.js","./levels":"/home/ubuntu/staging/apps/build/js/jigsaw/levels.js","./locale":"/home/ubuntu/staging/apps/build/js/jigsaw/locale.js"}],"/home/ubuntu/staging/apps/build/js/jigsaw/locale.js":[function(require,module,exports){
// locale for jigsaw

"use strict";

module.exports = window.blockly.jigsaw_locale;

},{}],"/home/ubuntu/staging/apps/build/js/jigsaw/levels.js":[function(require,module,exports){
/*jshint multistr: true */

'use strict';

var createToolbox = require('../block_utils').createToolbox;

var jigsawBlock = function jigsawBlock(type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, true);
};

var undeletableJigsawBlock = function undeletableJigsawBlock(type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, false);
};

var jigsawBlockWithDeletableAttr = function jigsawBlockWithDeletableAttr(type, x, y, child, childType, deletable) {
  var childAttr = '';
  x = x || 0;
  y = y || 0;
  childType = childType || "next";
  if (childType === 'statement') {
    childAttr = " name='child'";
  }
  return '<block type="' + type + '" deletable="' + deletable + '"' + ' x="' + x + '"' + ' y="' + y + '">' + (child ? '<' + childType + childAttr + '>' + child + '</' + childType + '>' : '') + '</block>';
};

/**
 * Validates whether puzzle has been successfully put together.
 *
 * @param {string[]} list of types
 * @param {number} options.level Level number
 * @Param {number} options.numBlocks How many blocks there are in the level
 */
var validateSimplePuzzle = function validateSimplePuzzle(types, options) {
  var numBlocks;
  if (types) {
    numBlocks = types.length;
  } else {
    var letters = '-ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var level = options.level;
    numBlocks = options.numBlocks;

    types = [];
    for (var i = 1; i <= numBlocks; i++) {
      types.push('jigsaw_' + level + letters[i]);
    }
  }

  var roots = Blockly.mainBlockSpace.getTopBlocks();
  if (roots.length !== 1) {
    return false;
  }

  var depth = 0;
  var block = roots[0];
  while (depth < numBlocks) {
    if (!block || block.type !== types[depth]) {
      return false;
    }
    var children = block.getChildren();
    if (children.length > 1) {
      return false;
    }
    block = children[0];
    depth++;
  }

  // last block shouldnt have children
  if (block !== undefined) {
    return false;
  }

  return true;
};

/*
 * Configuration for all levels.
 */

module.exports = {
  '1': {
    instructionsIcon: 'apple',
    aniGifURL: '/script_assets/k_1_images/instruction_gifs/click-block.gif',
    isK1: true,
    image: {
      name: 'apple',
      width: 200,
      height: 200
    },
    backgroundHSV: [41, 1.00, 0.969],
    numBlocks: 1,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        return Jigsaw.block1Clicked;
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_1A', 20, 20)
  },
  '2': {
    instructionsIcon: 'smiley',
    aniGifURL: '/script_assets/k_1_images/instruction_gifs/drag-drop.gif',
    isK1: true,
    image: {
      name: 'smiley',
      width: 200,
      height: 200
    },
    backgroundHSV: [184, 1.00, 0.733],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 1,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        // need to be finished drag
        if (Blockly.mainBlockSpace.dragMode) {
          return false;
        }
        var pos = Blockly.mainBlockSpace.getAllBlocks()[0].getRelativeToSurfaceXY();
        // how close to ghost?
        var dx = Math.abs(400 - pos.x);
        var dy = Math.abs(100 - pos.y);
        return dx + dy < 80;
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_2A', 20, 20)
  },
  '3': {
    instructionsIcon: 'snail',
    aniGifURL: '/script_assets/k_1_images/instruction_gifs/drag-connect.gif',
    isK1: true,
    image: {
      name: 'snail',
      width: 200,
      height: 200
    },
    backgroundHSV: [36, 1.00, 0.999],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 2,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 3, numBlocks: 2 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_3A', 400, 100) + undeletableJigsawBlock('jigsaw_3B', 100, 220)
  },

  '4': {
    instructionsIcon: 'elephant',
    isK1: true,
    image: {
      name: 'elephant',
      width: 200,
      height: 200
    },
    backgroundHSV: [320, 0.60, 0.999],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 2,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 4, numBlocks: 2 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_4A', 100, 140) + undeletableJigsawBlock('jigsaw_4B', 400, 200)
  },

  '5': {
    instructionsIcon: 'fish',
    isK1: true,
    image: {
      name: 'fish',
      width: 200,
      height: 200
    },
    backgroundHSV: [209, 0.57, 0.600],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 5, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_5A', 100, 20) + undeletableJigsawBlock('jigsaw_5B', 100, 140) + undeletableJigsawBlock('jigsaw_5C', 100, 280)
  },

  '6': {
    instructionsIcon: 'doggie',
    isK1: true,
    image: {
      name: 'doggie',
      width: 200,
      height: 200
    },
    backgroundHSV: [25, 0.57, 0.960],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 6, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_6B', 100, 20) + undeletableJigsawBlock('jigsaw_6A', 100, 140) + undeletableJigsawBlock('jigsaw_6C', 100, 280)
  },

  '7': {
    instructionsIcon: 'tree',
    isK1: true,
    image: {
      name: 'tree',
      width: 200,
      height: 200
    },
    backgroundHSV: [238, 0.51, 0.999],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 7, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_7B', 100, 20) + undeletableJigsawBlock('jigsaw_7A', 100, 140) + undeletableJigsawBlock('jigsaw_7C', 100, 280)
  },

  '8': {
    instructionsIcon: 'flower',
    isK1: true,
    image: {
      name: 'flower',
      width: 200,
      height: 200
    },
    backgroundHSV: [75, 0.80, 0.999],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 8, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_8C', 100, 20) + undeletableJigsawBlock('jigsaw_8B', 100, 140) + undeletableJigsawBlock('jigsaw_8A', 100, 280)
  },

  '9': {
    instructionsIcon: 'house',
    aniGifURL: '/script_assets/k_1_images/instruction_gifs/drag-disordered.gif',
    isK1: true,
    image: {
      name: 'house',
      width: 200,
      height: 200
    },
    backgroundHSV: [110, 0.56, 0.60],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 9, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_9B', 100, 20, undeletableJigsawBlock('jigsaw_9C', 0, 0, undeletableJigsawBlock('jigsaw_9A', 0, 0)))
  },

  '10': {
    instructionsIcon: 'computer',
    isK1: true,
    image: {
      name: 'computer',
      width: 200,
      height: 200
    },
    backgroundHSV: [300, 0.25, 0.80],
    ghost: {
      x: 400,
      y: 100
    },
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 10, numBlocks: 3 });
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_10A', 100, 20, undeletableJigsawBlock('jigsaw_10C', 0, 0, undeletableJigsawBlock('jigsaw_10B', 0, 0)))
  },

  '11': {
    instructionsIcon: 'blocks',
    isK1: true,
    image: {
      name: 'blocks',
      width: 131,
      height: 286
    },
    ghost: {
      x: 200,
      y: 12
    },
    numBlocks: 0,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: false,
    snapRadius: 30,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(['jigsaw_repeat', 'jigsaw_purple', 'jigsaw_blue', 'jigsaw_green'], {});
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_repeat', 20, 20, undeletableJigsawBlock('jigsaw_purple', 0, 0, undeletableJigsawBlock('jigsaw_blue')), 'statement'),
    toolbox: createToolbox(jigsawBlock('jigsaw_green'))
  },

  '12': {
    instructionsIcon: 'blocks',
    isK1: true,
    image: {
      name: 'blocks',
      width: 131,
      height: 286
    },
    ghost: {
      x: 200,
      y: 12
    },
    numBlocks: 0,
    requiredBlocks: [],
    freePlay: false,
    notchedEnds: true,
    largeNotches: false,
    snapRadius: 30,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(['jigsaw_repeat', 'jigsaw_purple', 'jigsaw_blue', 'jigsaw_green'], {});
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_repeat', 20, 20),
    toolbox: createToolbox(jigsawBlock('jigsaw_green') + jigsawBlock('jigsaw_purple') + jigsawBlock('jigsaw_blue'))
  },

  // assessment
  '13': {
    instructionsIcon: 'doggie',
    isK1: true,
    image: {
      name: 'doggie',
      width: 200,
      height: 200
    },
    ghost: {
      x: 400,
      y: 100
    },
    backgroundHSV: [25, 0.57, 0.960],
    numBlocks: 3,
    requiredBlocks: [],
    freePlay: false,
    largeNotches: true,
    notchedEnds: true,
    goal: {
      successCondition: function successCondition() {
        return validateSimplePuzzle(null, { level: 13, numBlocks: 3 });
      }
    },
    startBlocks: jigsawBlock('jigsaw_13C', 100, 20, jigsawBlock('jigsaw_13B', 0, 0, jigsawBlock('jigsaw_13A', 0, 0)))
  }
};

},{"../block_utils":"/home/ubuntu/staging/apps/build/js/block_utils.js"}]},{},["/home/ubuntu/staging/apps/build/js/jigsaw/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9qaWdzYXcvbWFpbi5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9za2lucy5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9qaWdzYXcuanMiLCJidWlsZC9qcy9qaWdzYXcvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9qaWdzYXcvYmxvY2tzLmpzIiwiYnVpbGQvanMvamlnc2F3L2xvY2FsZS5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9sZXZlbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2ZBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7O0FBRVosUUFBTSxFQUFFLEVBQ1A7O0NBRUYsQ0FBQzs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxNQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUc5QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUxQyxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEMsTUFBSSxDQUFD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VyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDdkc7Q0FDRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGFwcE1haW4gPSByZXF1aXJlKCcuLi9hcHBNYWluJyk7XG53aW5kb3cuSmlnc2F3ID0gcmVxdWlyZSgnLi9qaWdzYXcnKTtcbmlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICBnbG9iYWwuSmlnc2F3ID0gd2luZG93LkppZ3Nhdztcbn1cbnZhciBibG9ja3MgPSByZXF1aXJlKCcuL2Jsb2NrcycpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuL3NraW5zJyk7XG5cbndpbmRvdy5qaWdzYXdNYWluID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5za2luc01vZHVsZSA9IHNraW5zO1xuICBvcHRpb25zLmJsb2Nrc01vZHVsZSA9IGJsb2NrcztcbiAgYXBwTWFpbih3aW5kb3cuSmlnc2F3LCBsZXZlbHMsIG9wdGlvbnMpO1xufTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbUoxYVd4a0wycHpMMnBwWjNOaGR5OXRZV2x1TG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZCTEVsQlFVa3NUMEZCVHl4SFFVRkhMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTndReXhKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZkQlFWY3NSVUZCUlR0QlFVTnFReXhSUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN1EwRkRMMEk3UVVGRFJDeEpRVUZKTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRGFrTXNTVUZCU1N4TlFVRk5MRWRCUVVjc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzBGQlEycERMRWxCUVVrc1MwRkJTeXhIUVVGSExFOUJRVThzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZMMElzVFVGQlRTeERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlRMRTlCUVU4c1JVRkJSVHRCUVVOd1F5eFRRVUZQTEVOQlFVTXNWMEZCVnl4SFFVRkhMRXRCUVVzc1EwRkJRenRCUVVNMVFpeFRRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRTFCUVUwc1EwRkJRenRCUVVNNVFpeFRRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hOUVVGTkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdRMEZEZWtNc1EwRkJReUlzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaWRtRnlJR0Z3Y0UxaGFXNGdQU0J5WlhGMWFYSmxLQ2N1TGk5aGNIQk5ZV2x1SnlrN1hHNTNhVzVrYjNjdVNtbG5jMkYzSUQwZ2NtVnhkV2x5WlNnbkxpOXFhV2R6WVhjbktUdGNibWxtSUNoMGVYQmxiMllnWjJ4dlltRnNJQ0U5UFNBbmRXNWtaV1pwYm1Wa0p5a2dlMXh1SUNCbmJHOWlZV3d1U21sbmMyRjNJRDBnZDJsdVpHOTNMa3BwWjNOaGR6dGNibjFjYm5aaGNpQmliRzlqYTNNZ1BTQnlaWEYxYVhKbEtDY3VMMkpzYjJOcmN5Y3BPMXh1ZG1GeUlHeGxkbVZzY3lBOUlISmxjWFZwY21Vb0p5NHZiR1YyWld4ekp5azdYRzUyWVhJZ2MydHBibk1nUFNCeVpYRjFhWEpsS0NjdUwzTnJhVzV6SnlrN1hHNWNibmRwYm1SdmR5NXFhV2R6WVhkTllXbHVJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjeWtnZTF4dUlDQnZjSFJwYjI1ekxuTnJhVzV6VFc5a2RXeGxJRDBnYzJ0cGJuTTdYRzRnSUc5d2RHbHZibk11WW14dlkydHpUVzlrZFd4bElEMGdZbXh2WTJ0ek8xeHVJQ0JoY0hCTllXbHVLSGRwYm1SdmR5NUthV2R6WVhjc0lHeGxkbVZzY3l3Z2IzQjBhVzl1Y3lrN1hHNTlPMXh1SWwxOSIsIi8qKlxuICogTG9hZCBTa2luIGZvciBKaWdzYXcuXG4gKi9cblxudmFyIHNraW5zQmFzZSA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG5cbnZhciBDT05GSUdTID0ge1xuXG4gIGppZ3Nhdzoge1xuICB9XG5cbn07XG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGFzc2V0VXJsLCBpZCkge1xuICB2YXIgc2tpbiA9IHNraW5zQmFzZS5sb2FkKGFzc2V0VXJsLCBpZCk7XG4gIHZhciBjb25maWcgPSBDT05GSUdTW3NraW4uaWRdO1xuXG5cbiAgc2tpbi5hcnRpc3QgPSBza2luLmFzc2V0VXJsKCdhcnRpc3QucG5nJyk7XG4gIHNraW4uYmxvY2tzID0gc2tpbi5hc3NldFVybCgnYmxvY2tzLnBuZycpO1xuXG4gIHNraW4uYXBwbGUgPSBza2luLmFzc2V0VXJsKCdhcHBsZS5wbmcnKTtcbiAgc2tpbi5zbWlsZXkgPSBza2luLmFzc2V0VXJsKCdzbWlsZXkucG5nJyk7XG4gIHNraW4uc25haWwgPSBza2luLmFzc2V0VXJsKCdzbmFpbC5wbmcnKTtcbiAgc2tpbi5lbGVwaGFudCA9IHNraW4uYXNzZXRVcmwoJ2VsZXBoYW50LnBuZycpO1xuICBza2luLmZpc2ggPSBza2luLmFzc2V0VXJsKCdmaXNoLnBuZycpO1xuICBza2luLmRvZ2dpZSA9IHNraW4uYXNzZXRVcmwoJ2RvZ2dpZS5wbmcnKTtcbiAgc2tpbi50cmVlID0gc2tpbi5hc3NldFVybCgndHJlZS5wbmcnKTtcbiAgc2tpbi5mbG93ZXIgPSBza2luLmFzc2V0VXJsKCdmbG93ZXIucG5nJyk7XG4gIHNraW4uaG91c2UgPSBza2luLmFzc2V0VXJsKCdob3VzZS5wbmcnKTtcbiAgc2tpbi5jb21wdXRlciA9IHNraW4uYXNzZXRVcmwoJ2NvbXB1dGVyLnBuZycpO1xuXG4gIHNraW4uYmxhbmsgPSBza2luLmFzc2V0VXJsKCdibGFuay5wbmcnKTtcbiAgc2tpbi5zbWFsbFN0YXRpY0F2YXRhciA9IHNraW4uYmxhbms7XG5cbiAgLy8gU2V0dGluZ3NcbiAgc2tpbi5iYWNrZ3JvdW5kID0gc2tpbi5hc3NldFVybCgnYmFja2dyb3VuZC5wbmcnKTtcblxuICByZXR1cm4gc2tpbjtcbn07XG4iLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBKaWdzYXdcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdHVkaW9BcHAgPSByZXF1aXJlKCcuLi9TdHVkaW9BcHAnKS5zaW5nbGV0b247XG52YXIgc2tpbnMgPSByZXF1aXJlKCcuLi9za2lucycpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgSmlnc2F3ID0gbW9kdWxlLmV4cG9ydHM7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcblxuLy8gTmV2ZXIgYnVtcCBuZWlnaGJvcnMgZm9yIEppZ3Nhd1xuQmxvY2tseS5CVU1QX1VOQ09OTkVDVEVEID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHVzZUxhcmdlTm90Y2hlcygpIHtcbiAgdmFyIG5vdGNoSGVpZ2h0ID0gODtcbiAgdmFyIG5vdGNoV2lkdGhBID0gNjtcbiAgdmFyIG5vdGNoV2lkdGhCID0gMTA7XG5cbiAgQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX1dJRFRIID0gbm90Y2hXaWR0aEEgKiAyICsgbm90Y2hXaWR0aEI7XG4gIEJsb2NrbHkuQmxvY2tTdmcuTk9UQ0hfV0lEVEggPSA1MDtcblxuICB2YXIgbm90Y2hQYXRoTGVmdCA9ICdsICcgK1xuICAgIG5vdGNoV2lkdGhBICsgJywnICsgbm90Y2hIZWlnaHQgKyAnICcgK1xuICAgIG5vdGNoV2lkdGhCICsgJywwICcgK1xuICAgIG5vdGNoV2lkdGhBICsgJywtJyArIG5vdGNoSGVpZ2h0O1xuICB2YXIgbm90Y2hQYXRoUmlnaHQgPSAnbCAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQSArICcsJyArIG5vdGNoSGVpZ2h0ICsgJyAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQiArICcsMCAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQSArICcsLScgKyBub3RjaEhlaWdodDtcbiAgLy8gQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX0xFRlQgPSAnbCA2LDQgMywwIDYsLTQnO1xuICAvLyBCbG9ja2x5LkJsb2NrU3ZnLk5PVENIX1BBVEhfUklHSFQgPSAnbCAtNiw0IC0zLDAgLTYsLTQnO1xuXG4gIHZhciBub3RjaEhpZ2hsaWdodEhlaWdodCA9IG5vdGNoSGVpZ2h0OyAvLzQ7XG4gIHZhciBub3RjaEhpZ2hsaWdodFdpZHRoQSA9IG5vdGNoV2lkdGhBICsgMC41OyAvLzYuNTtcbiAgdmFyIG5vdGNoSGlnaGxpZ2h0V2lkdGhCID0gbm90Y2hXaWR0aEIgLSAxOyAvLzI7XG5cbiAgdmFyIG5vdGNoUGF0aExlZnRIaWdobGlnaHQgPSAnbCAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQSArICcsJyArIG5vdGNoSGlnaGxpZ2h0SGVpZ2h0ICsgJyAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQiArICcsMCAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQSArICcsLScgKyBub3RjaEhpZ2hsaWdodEhlaWdodDtcbiAgLy8gQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX0xFRlRfSElHSExJR0hUID0gJ2wgNi41LDQgMiwwIDYuNSwtNCc7XG5cbiAgQmxvY2tseS5Db25uZWN0aW9uLk5PVENIX1BBVEhTX09WRVJSSURFID0ge1xuICAgIGxlZnQ6IG5vdGNoUGF0aExlZnQsXG4gICAgbGVmdEhpZ2hsaWdodDogbm90Y2hQYXRoTGVmdEhpZ2hsaWdodCxcbiAgICByaWdodDogbm90Y2hQYXRoUmlnaHRcbiAgfTtcblxufVxuXG5cbi8vIERlZmF1bHQgU2NhbGluZ3NcbkppZ3Nhdy5zY2FsZSA9IHtcbiAgJ3NuYXBSYWRpdXMnOiAxLFxuICAnc3RlcFNwZWVkJzogMzNcbn07XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbigpIHtcbiAgLy8gTG9hZCBtYXBzLlxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBKaWdzYXcuc2NhbGVba2V5XSA9IGxldmVsLnNjYWxlW2tleV07XG4gIH1cblxuICBKaWdzYXcuTUFaRV9XSURUSCA9IDA7XG4gIEppZ3Nhdy5NQVpFX0hFSUdIVCA9IDA7XG5cbiAgSmlnc2F3LmJsb2NrMUNsaWNrZWQgPSBmYWxzZTtcbn07XG5cbnZhciBkcmF3TWFwID0gZnVuY3Rpb24oKSB7XG4gIC8vIEhpZGUgdGhlIGxlZnQgY29sdW1uIGFuZCB0aGUgcmVzaXplIGJhci5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHZhciB2aXN1YWxpemF0aW9uUmVzaXplQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25SZXNpemVCYXInKTtcbiAgdmlzdWFsaXphdGlvblJlc2l6ZUJhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gIGlmIChsZXZlbC5naG9zdCkge1xuICAgIHZhciBibG9ja0NhbnZhcyA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0Q2FudmFzKCk7XG4gICAgQmxvY2tseS5jcmVhdGVTdmdFbGVtZW50KCdyZWN0Jywge1xuICAgICAgZmlsbDogXCJ1cmwoI3BhdF9cIiArIGxldmVsLmlkICsgXCJBKVwiLFxuICAgICAgXCJmaWxsLW9wYWNpdHlcIjogXCIwLjJcIixcbiAgICAgIHdpZHRoOiBsZXZlbC5pbWFnZS53aWR0aCxcbiAgICAgIGhlaWdodDogbGV2ZWwuaW1hZ2UuaGVpZ2h0LFxuICAgICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZShcIiArIGxldmVsLmdob3N0LnggKyBcIiwgXCIgK1xuICAgICAgICBsZXZlbC5naG9zdC55ICsgXCIpXCJcbiAgICB9LCBibG9ja0NhbnZhcywge1xuICAgICAgYmVmb3JlRXhpc3Rpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBKaWdzYXcgYXBwLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuSmlnc2F3LmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gSmlnc2F3LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuICBsb2FkTGV2ZWwoKTtcblxuICBpZiAobGV2ZWwubGFyZ2VOb3RjaGVzKSB7XG4gICAgdXNlTGFyZ2VOb3RjaGVzKCk7XG4gIH1cbiAgQmxvY2tseS5TTkFQX1JBRElVUyA9IGxldmVsLnNuYXBSYWRpdXMgfHwgOTA7XG5cbiAgY29uZmlnLmh0bWwgPSBwYWdlKHtcbiAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgIGRhdGE6IHtcbiAgICAgIGxvY2FsZURpcmVjdGlvbjogc3R1ZGlvQXBwLmxvY2FsZURpcmVjdGlvbigpLFxuICAgICAgY29udHJvbHM6IHJlcXVpcmUoJy4vY29udHJvbHMuaHRtbC5lanMnKSh7YXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybH0pLFxuICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgYmxvY2tDb3VudGVyQ2xhc3M6ICdibG9jay1jb3VudGVyLWRlZmF1bHQnXG4gICAgfVxuICB9KTtcblxuICAvLyBUT0RPIChici1wYWlyKSA6IEkgdGhpbmsgdGhpcyBpcyBzb21ldGhpbmcgdGhhdCdzIGhhcHBlbmluZyBpbiBhbGwgYXBwcz9cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByaWNobmVzcyBvZiBibG9jayBjb2xvdXJzLCByZWdhcmRsZXNzIG9mIHRoZSBodWUuXG4gICAgICogTU9PQyBibG9ja3Mgc2hvdWxkIGJlIGJyaWdodGVyICh0YXJnZXQgYXVkaWVuY2UgaXMgeW91bmdlcikuXG4gICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAqIEJsb2NrbHkncyBkZWZhdWx0IGlzIDAuNDUuXG4gICAgICovXG4gICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgIGRyYXdNYXAoKTtcbiAgfTtcblxuICAvLyBvbmx5IGhhdmUgdHJhc2hjYW4gZm9yIGxldmVscyB3aXRoIHRvb2xib3hcbiAgY29uZmlnLnRyYXNoY2FuID0gISFsZXZlbC50b29sYm94O1xuICBjb25maWcuc2Nyb2xsYmFycyA9IGZhbHNlO1xuXG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuICBjb25maWcuZW5hYmxlU2hvd0Jsb2NrQ291bnQgPSBmYWxzZTtcblxuICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdydW5CdXR0b24nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBKaWdzYXcuc3VjY2Vzc0xpc3RlbmVyID0gQmxvY2tseS5tYWluQmxvY2tTcGFjZUVkaXRvci5hZGRDaGFuZ2VMaXN0ZW5lcihmdW5jdGlvbihldnQpIHtcbiAgICBjaGVja0ZvclN1Y2Nlc3MoKTtcbiAgfSk7XG5cbiAgLy8gT25seSB1c2VkIGJ5IGxldmVsMSwgaW4gd2hpY2ggdGhlIHN1Y2Nlc3MgY3JpdGVyaWEgaXMgY2xpY2tpbmcgb24gdGhlIGJsb2NrXG4gIHZhciBibG9jazEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2Jsb2NrLWlkPScxJ11cIilbMF07XG4gIGlmIChibG9jazEpIHtcbiAgICBkb20uYWRkTW91c2VEb3duVG91Y2hFdmVudChibG9jazEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIEppZ3Nhdy5ibG9jazFDbGlja2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2hlY2tGb3JTdWNjZXNzKCkge1xuICB2YXIgc3VjY2VzcyA9IGxldmVsLmdvYWwuc3VjY2Vzc0NvbmRpdGlvbigpO1xuICBpZiAoc3VjY2Vzcykge1xuICAgIEJsb2NrbHkucmVtb3ZlQ2hhbmdlTGlzdGVuZXIoSmlnc2F3LnN1Y2Nlc3NMaXN0ZW5lcik7XG5cbiAgICBKaWdzYXcucmVzdWx0ID0gUmVzdWx0VHlwZS5TVUNDRVNTO1xuICAgIEppZ3Nhdy5vblB1enpsZUNvbXBsZXRlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBcHAgc3BlY2lmaWMgZGlzcGxheUZlZWRiYWNrIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaW50b1xuICogc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayB3aGVuIGFwcHJvcHJpYXRlXG4gKi9cbnZhciBkaXNwbGF5RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFKaWdzYXcud2FpdGluZ0ZvclJlcG9ydCkge1xuICAgIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2soe1xuICAgICAgYXBwOiAnSmlnc2F3JyxcbiAgICAgIHNraW46IHNraW4uaWQsXG4gICAgICBmZWVkYmFja1R5cGU6IEppZ3Nhdy50ZXN0UmVzdWx0cyxcbiAgICAgIHJlc3BvbnNlOiBKaWdzYXcucmVzcG9uc2UsXG4gICAgICBsZXZlbDogbGV2ZWxcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgc2VydmljZSByZXBvcnQgY2FsbCBpcyBjb21wbGV0ZVxuICogQHBhcmFtIHtvYmplY3R9IEpTT04gcmVzcG9uc2UgKGlmIGF2YWlsYWJsZSlcbiAqL1xuSmlnc2F3Lm9uUmVwb3J0Q29tcGxldGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICBKaWdzYXcucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgSmlnc2F3LndhaXRpbmdGb3JSZXBvcnQgPSBmYWxzZTtcbiAgc3R1ZGlvQXBwLm9uUmVwb3J0Q29tcGxldGUocmVzcG9uc2UpO1xuICBkaXNwbGF5RmVlZGJhY2soKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSB0aGUgdXNlcidzIGNvZGUuICBIZWF2ZW4gaGVscCB1cy4uLlxuICovXG5KaWdzYXcuZXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBleGVjdXRlIGlzIGEgbm8tb3AgZm9yIGppZ3Nhd1xufTtcblxuSmlnc2F3Lm9uUHV6emxlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcblxuICAvLyBJZiB3ZSBrbm93IHRoZXkgc3VjY2VlZGVkLCBtYXJrIGxldmVsQ29tcGxldGUgdHJ1ZVxuICAvLyBOb3RlIHRoYXQgd2UgaGF2ZSBub3QgeWV0IGFuaW1hdGVkIHRoZSBzdWNjZXNmdWwgcnVuXG4gIHZhciBsZXZlbENvbXBsZXRlID0gKEppZ3Nhdy5yZXN1bHQgPT0gUmVzdWx0VHlwZS5TVUNDRVNTKTtcblxuICBKaWdzYXcudGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuZ2V0VGVzdFJlc3VsdHMobGV2ZWxDb21wbGV0ZSwge1xuICAgIGFsbG93VG9wQmxvY2tzOiB0cnVlXG4gIH0pO1xuXG4gIGlmIChKaWdzYXcudGVzdFJlc3VsdHMgPj0gVGVzdFJlc3VsdHMuRlJFRV9QTEFZKSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnd2luJyk7XG4gIH0gZWxzZSB7XG4gICAgc3R1ZGlvQXBwLnBsYXlBdWRpbygnZmFpbHVyZScpO1xuICB9XG5cbiAgdmFyIHhtbCA9IEJsb2NrbHkuWG1sLmJsb2NrU3BhY2VUb0RvbShCbG9ja2x5Lm1haW5CbG9ja1NwYWNlKTtcbiAgdmFyIHRleHRCbG9ja3MgPSBCbG9ja2x5LlhtbC5kb21Ub1RleHQoeG1sKTtcblxuICBKaWdzYXcud2FpdGluZ0ZvclJlcG9ydCA9IHRydWU7XG5cbiAgLy8gUmVwb3J0IHJlc3VsdCB0byBzZXJ2ZXIuXG4gIHN0dWRpb0FwcC5yZXBvcnQoe1xuICAgICBhcHA6ICdKaWdzYXcnLFxuICAgICBsZXZlbDogbGV2ZWwuaWQsXG4gICAgIHJlc3VsdDogSmlnc2F3LnJlc3VsdCA9PT0gUmVzdWx0VHlwZS5TVUNDRVNTLFxuICAgICB0ZXN0UmVzdWx0OiBKaWdzYXcudGVzdFJlc3VsdHMsXG4gICAgIHByb2dyYW06IGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0QmxvY2tzKSxcbiAgICAgb25Db21wbGV0ZTogSmlnc2F3Lm9uUmVwb3J0Q29tcGxldGVcbiAgfSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHM9IChmdW5jdGlvbigpIHtcbiAgdmFyIHQgPSBmdW5jdGlvbiBhbm9ueW1vdXMobG9jYWxzLCBmaWx0ZXJzLCBlc2NhcGVcbi8qKi8pIHtcbmVzY2FwZSA9IGVzY2FwZSB8fCBmdW5jdGlvbiAoaHRtbCl7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJig/IVxcdys7KS9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKTtcbn07XG52YXIgYnVmID0gW107XG53aXRoIChsb2NhbHMgfHwge30pIHsgKGZ1bmN0aW9uKCl7IFxuIGJ1Zi5wdXNoKCcnKTsxOyB2YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKSA7IGJ1Zi5wdXNoKCdcXG4nKTsgfSkoKTtcbn0gXG5yZXR1cm4gYnVmLmpvaW4oJycpO1xufTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGxvY2Fscykge1xuICAgIHJldHVybiB0KGxvY2FscywgcmVxdWlyZShcImVqc1wiKS5maWx0ZXJzKTtcbiAgfVxufSgpKTsiLCIvKipcbiAqIEJsb2NrbHkgQXBwOiBKaWdzYXdcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMyBDb2RlLm9yZ1xuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbXNnID0gcmVxdWlyZSgnLi9sb2NhbGUnKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi9kb20nKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xuXG52YXIgcGF0dGVybkNhY2hlID0ge1xuICBxdWV1ZWQ6IFtdLFxuICBjcmVhdGVkOiB7fSxcblxuICAvKipcbiAgICogU3RpY2sgYW4gaXRlbSBpbiBvdXIgcXVldWVcbiAgICovXG4gIGFkZFRvUXVldWU6IGZ1bmN0aW9uIChwYXR0ZXJuSW5mbykge1xuICAgIHRoaXMucXVldWVkLnB1c2gocGF0dGVybkluZm8pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBZGQgYWxsIHRoZSBzdmcgcGF0dGVybnMgd2UndmUgcXVldWVkIHVwLlxuICAgKi9cbiAgYWRkUXVldWVkUGF0dGVybnM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnF1ZXVlZC5mb3JFYWNoKGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgICBhZGRQYXR0ZXJuKHBhdHRlcm4uaWQsIHBhdHRlcm4uaW1hZ2VQYXRoLCBwYXR0ZXJuLndpZHRoLCBwYXR0ZXJuLmhlaWdodCxcbiAgICAgICAgcGF0dGVybi5vZmZzZXRYLCBwYXR0ZXJuLm9mZnNldFkpO1xuICAgIH0pO1xuICAgIHRoaXMucXVldWVkID0gW107XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhdmUgd2UgYWxyZWFkeSBjcmVhdGVkIGFuIHN2ZyBlbGVtZW50IGZvciB0aGlzIHBhdHRlcm5JbmZvPyAgVGhyb3dzIGlmXG4gICAqIHdlIGFzayB3aXRoIGEgcGF0dGVybkluZm8gdGhhdCBoYXMgdGhlIHNhbWUgaWQgYnV0IGRpZmZlcmVudCBhdHRyaWJ1dGVzLlxuICAgKi9cbiAgd2FzQ3JlYXRlZDogZnVuY3Rpb24gKHBhdHRlcm5JbmZvKSB7XG4gICAgdmFyIGVxdWFsID0gdHJ1ZTtcbiAgICB2YXIgY2FjaGVkID0gdGhpcy5jcmVhdGVkW3BhdHRlcm5JbmZvLmlkXTtcbiAgICBpZiAoIWNhY2hlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHBhdHRlcm5JbmZvKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmIChwYXR0ZXJuSW5mb1trZXldICE9PSBjYWNoZWRba2V5XSkge1xuICAgICAgICBlcXVhbCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghZXF1YWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGFkZCBhdHRyaWJ1dGUgb2Ygc2FtZSBpZCB3aXRoIGRpZmZlcmVudCBhdHRyaWJ1dGVzXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogTWFyayB0aGF0IHdlJ3ZlIGNyZWF0ZWQgYW4gc3ZnIHBhdHRlcm5cbiAgICovXG4gIG1hcmtDcmVhdGVkOiBmdW5jdGlvbiAocGF0dGVybkluZm8pIHtcbiAgICBpZiAodGhpcy5jcmVhdGVkW3BhdHRlcm5JbmZvLmlkXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbHJlYWR5IGhhdmUgY2FjaGVkIGl0ZW0gd2l0aCBpZDogJyArIHBhdHRlcm5JbmZvLmlkKTtcbiAgICB9XG4gICAgdGhpcy5jcmVhdGVkW3BhdHRlcm5JbmZvLmlkXSA9IHBhdHRlcm5JbmZvO1xuICB9XG5cbn07XG5cbnZhciBwYXR0ZXJucyA9IFtdO1xudmFyIGNyZWF0ZWRQYXR0ZXJucyA9IHt9O1xuXG4vKipcbiAqIEFkZCBhbiBzdmcgcGF0dGVybiBmb3IgdGhlIGdpdmVuIGltYWdlLiBJZiBkb2N1bWVudCBpcyBub3QgeWV0IGZ1bGx5IGxvYWRlZCxcbiAqIGl0IHdpbGwgYWRkIHRoZSBwYXR0ZXJuIHRvIGEgbGlzdCBmb3IgbGF0ZXIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlkIFBhdHRlcm4gbmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGltYWdlUGF0aCBVcmwgb2YgdGhlIGltYWdlXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggb2YgdGhlIGltYWdlXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfGZ1bmN0aW9ufSBvZmZzZXRYIE9mZnNldCBvZiB0aGUgaW1hZ2UgdG8gc3RhcnQgcGF0dGVyblxuICogQHBhcmFtIHtudW1iZXJ8ZnVuY3Rpb259IG9mZnNldFkgT2Zmc2V0IG9mIHRoZSBpbWFnZSB0byBzdGFydCBwYXR0ZXJuXG4gKi9cbnZhciBhZGRQYXR0ZXJuID0gZnVuY3Rpb24gKGlkLCBpbWFnZVBhdGgsIHdpZHRoLCBoZWlnaHQsIG9mZnNldFgsIG9mZnNldFkpIHtcbiAgdmFyIHgsIHksIHBhdHRlcm4sIHBhdHRlcm5JbWFnZTtcbiAgdmFyIHBhdHRlcm5JbmZvID0ge1xuICAgIGlkOiBpZCxcbiAgICBpbWFnZVBhdGg6IGltYWdlUGF0aCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgb2Zmc2V0WDogb2Zmc2V0WCxcbiAgICBvZmZzZXRZOiBvZmZzZXRZXG4gIH07XG5cbiAgLy8gSWYgd2UgZG9uJ3QgeWV0IGhhdmUgYW4gc3ZnRGVmcywgcXVldWUgdGhlIHBhdHRlcm4gYW5kIHdhaXQgdW50aWwgd2UgZG9cbiAgdmFyIHN2Z0RlZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tseVN2Z0RlZnMnKTtcbiAgaWYgKCFzdmdEZWZzKSB7XG4gICAgcGF0dGVybkNhY2hlLmFkZFRvUXVldWUocGF0dGVybkluZm8pO1xuICB9IGVsc2UgaWYgKCFwYXR0ZXJuQ2FjaGUud2FzQ3JlYXRlZChwYXR0ZXJuSW5mbykpIHtcbiAgICAvLyBhZGQgdGhlIHBhdHRlcm5cbiAgICB4ID0gdHlwZW9mKG9mZnNldFgpID09PSBcImZ1bmN0aW9uXCIgPyAtb2Zmc2V0WCgpIDogLW9mZnNldFg7XG4gICAgeSA9IHR5cGVvZihvZmZzZXRZKSA9PT0gXCJmdW5jdGlvblwiID8gLW9mZnNldFkoKSA6IC1vZmZzZXRZO1xuICAgIHBhdHRlcm4gPSBCbG9ja2x5LmNyZWF0ZVN2Z0VsZW1lbnQoJ3BhdHRlcm4nLCB7XG4gICAgICBpZDogaWQsXG4gICAgICBwYXR0ZXJuVW5pdHM6ICd1c2VyU3BhY2VPblVzZScsXG4gICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSwgc3ZnRGVmcyk7XG4gICAgcGF0dGVybkltYWdlID0gQmxvY2tseS5jcmVhdGVTdmdFbGVtZW50KCdpbWFnZScsIHtcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0XG4gICAgfSwgcGF0dGVybik7XG4gICAgcGF0dGVybkltYWdlLnNldEF0dHJpYnV0ZU5TKCdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3hsaW5rOmhyZWYnLFxuICAgICAgaW1hZ2VQYXRoKTtcblxuICAgIHBhdHRlcm5DYWNoZS5tYXJrQ3JlYXRlZChwYXR0ZXJuSW5mbyk7XG4gIH1cbiAgcmV0dXJuIGlkO1xufTtcblxuLyoqXG4gKiBTZWFyY2ggdGhlIHdvcmtzcGFjZSBmb3IgYSBibG9jayBvZiB0aGUgZ2l2ZW4gdHlwZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBibG9jayB0byBzZWFyY2ggZm9yXG4gKi9cbnZhciBibG9ja09mVHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHZhciBibG9ja3MgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldEFsbEJsb2NrcygpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChibG9ja3NbaV0udHlwZSA9PT0gdHlwZSkge1xuICAgICAgcmV0dXJuIGJsb2Nrc1tpXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgd2lkdGggb2YgdGhlIGJsb2NrIG9mIHRoZSBnaXZlbiB0eXBlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIGJsb2NrIHRvIHNlYXJjaCBmb3JcbiAqL1xudmFyIGJsb2NrV2lkdGggPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gYmxvY2tPZlR5cGUodHlwZSkuZ2V0SGVpZ2h0V2lkdGgoKS53aWR0aDtcbn07XG5cbmZ1bmN0aW9uIGFkZFF1ZXVlZFdoZW5SZWFkeSgpIHtcbiAgaWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmxvY2tseVN2Z0RlZnMnKSkge1xuICAgIHNldFRpbWVvdXQoYWRkUXVldWVkV2hlblJlYWR5LCAxMDApO1xuICAgIHJldHVybjtcbiAgfVxuICBwYXR0ZXJuQ2FjaGUuYWRkUXVldWVkUGF0dGVybnMoKTtcbn1cblxuXG4vLyBJbnN0YWxsIGV4dGVuc2lvbnMgdG8gQmxvY2tseSdzIGxhbmd1YWdlIGFuZCBKYXZhU2NyaXB0IGdlbmVyYXRvci5cbmV4cG9ydHMuaW5zdGFsbCA9IGZ1bmN0aW9uKGJsb2NrbHksIGJsb2NrSW5zdGFsbE9wdGlvbnMpIHtcbiAgdmFyIHNraW4gPSBibG9ja0luc3RhbGxPcHRpb25zLnNraW47XG4gIC8vIGNvdWxkIG1ha2UgdGhpcyBzZXR0YWJsZSBvbiB0aGUgbGV2ZWwgaWYgSSBuZWVkXG4gIHZhciBIU1YgPSBbMCwgMS4wMCwgMC45OF07XG5cbiAgdmFyIGV4aXN0aW5nQmxvY2tzID0gT2JqZWN0LmtleXMoYmxvY2tseS5CbG9ja3MpO1xuXG4gIE9iamVjdC5rZXlzKGxldmVscykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgbGV2ZWwgPSBsZXZlbHNba2V5XTtcbiAgICBnZW5lcmF0ZUppZ3Nhd0Jsb2Nrc0ZvckxldmVsKGJsb2NrbHksIHNraW4sIHtcbiAgICAgIGltYWdlOiBza2luW2xldmVsLmltYWdlLm5hbWVdLFxuICAgICAgSFNWOiBsZXZlbC5iYWNrZ3JvdW5kSFNWIHx8IEhTVixcbiAgICAgIHdpZHRoOiBsZXZlbC5pbWFnZS53aWR0aCxcbiAgICAgIGhlaWdodDogbGV2ZWwuaW1hZ2UuaGVpZ2h0LFxuICAgICAgbnVtQmxvY2tzOiBsZXZlbC5udW1CbG9ja3MsXG4gICAgICBub3RjaGVkRW5kczogbGV2ZWwubm90Y2hlZEVuZHMsXG4gICAgICBsZXZlbDoga2V5XG4gICAgfSk7XG5cbiAgICBpZiAobGV2ZWwubnVtQmxvY2tzID09PSAwKSB7XG4gICAgICAvLyBzdGlsbCB3YW50IHRoZSBwYXR0ZXJuIGZvciB0aGUgZ2hvc3RcbiAgICAgIHZhciBwYXR0ZXJuTmFtZSA9ICdwYXRfJyArIGxldmVsLmlkICsgJ0EnO1xuICAgICAgYWRkUGF0dGVybihwYXR0ZXJuTmFtZSwgc2tpbltsZXZlbC5pbWFnZS5uYW1lXSwgbGV2ZWwuaW1hZ2Uud2lkdGgsXG4gICAgICAgIGxldmVsLmltYWdlLmhlaWdodCwgMCwgMCk7XG4gICAgfVxuICB9KTtcblxuICBnZW5lcmF0ZUJsYW5rQmxvY2soYmxvY2tseSwgc2tpbiwgJ2ppZ3Nhd19yZXBlYXQnLCBbMzIyLCAwLjkwLCAwLjk1XSwgMTAwLCB0cnVlKTtcbiAgZ2VuZXJhdGVCbGFua0Jsb2NrKGJsb2NrbHksIHNraW4sICdqaWdzYXdfZ3JlZW4nLCBbMTQwLCAxLjAwLCAwLjc0XSwgODApO1xuICBnZW5lcmF0ZUJsYW5rQmxvY2soYmxvY2tseSwgc2tpbiwgJ2ppZ3Nhd19ibHVlJywgWzE4NCwgMS4wMCwgMC43NF0sIDgwKTtcbiAgZ2VuZXJhdGVCbGFua0Jsb2NrKGJsb2NrbHksIHNraW4sICdqaWdzYXdfcHVycGxlJywgWzMxMiwgMC4zMiwgMC42Ml0sIDgwKTtcblxuICAvLyBHbyB0aHJvdWdoIGFsbCBhZGRlZCBibG9ja3MsIGFuZCBhZGQgZW1wdHkgZ2VuZXJhdG9ycyBmb3IgdGhvc2UgdGhhdFxuICAvLyB3ZXJlbid0IGFscmVhZHkgZ2l2ZW4gZ2VuZXJhdG9yc1xuICB2YXIgZ2VuZXJhdG9yID0gYmxvY2tseS5HZW5lcmF0b3IuZ2V0KCdKYXZhU2NyaXB0Jyk7XG4gIGJsb2NrbHkuSmF2YVNjcmlwdCA9IGdlbmVyYXRvcjtcbiAgT2JqZWN0LmtleXMoYmxvY2tseS5CbG9ja3MpLmZvckVhY2goZnVuY3Rpb24gKGJsb2NrKSB7XG4gICAgaWYgKGV4aXN0aW5nQmxvY2tzLmluZGV4T2YoYmxvY2spID09PSAtMSAmJiAhZ2VuZXJhdG9yW2Jsb2NrXSkge1xuICAgICAgZ2VuZXJhdG9yW2Jsb2NrXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdcXG4nO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuXG4gIGFkZFF1ZXVlZFdoZW5SZWFkeSgpO1xuXG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2RlZnJldHVybjtcbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfaWZyZXR1cm47XG59O1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUJsYW5rQmxvY2soYmxvY2tseSwgc2tpbiwgbmFtZSwgaHN2LCB3aWR0aCwgaGFzQXBwZW5kKSB7XG4gIGJsb2NrbHkuQmxvY2tzW25hbWVdID0ge1xuICAgIGhlbHBVcmw6ICcnLFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0SFNWLmFwcGx5KHRoaXMsIGhzdik7XG4gICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmJsYW5rLCB3aWR0aCwgNTQpKTtcbiAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgICBpZiAoaGFzQXBwZW5kKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kU3RhdGVtZW50SW5wdXQoJ2NoaWxkJyk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQodHJ1ZSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUppZ3Nhd0Jsb2Nrc0ZvckxldmVsKGJsb2NrbHksIHNraW4sIG9wdGlvbnMpIHtcbiAgdmFyIGltYWdlID0gb3B0aW9ucy5pbWFnZTtcbiAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgdmFyIGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuICB2YXIgbnVtQmxvY2tzID0gb3B0aW9ucy5udW1CbG9ja3M7XG4gIHZhciBsZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG4gIHZhciBIU1YgPSBvcHRpb25zLkhTVjtcbiAgLy8gaWYgdHJ1ZSwgZmlyc3QvbGFzdCBibG9jayB3aWxsIHN0aWxsIGhhdmUgcHJldmlvdXMvbmV4dCBub3RjaGVzXG4gIHZhciBub3RjaGVkRW5kcyA9IG9wdGlvbnMubm90Y2hlZEVuZHM7XG5cbiAgdmFyIGJsb2NrSGVpZ2h0ID0gaGVpZ2h0IC8gbnVtQmxvY2tzO1xuICB2YXIgdGl0bGVXaWR0aCA9IHdpZHRoIC0gMjA7XG4gIHZhciB0aXRsZUhlaWdodCA9IGJsb2NrSGVpZ2h0IC0gMTA7XG5cbiAgdmFyIGxldHRlcnMgPSAnLUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcblxuICBmdW5jdGlvbiBnZW5lcmF0ZUJsb2NrKGJsb2NrTnVtKSB7XG4gICAgdmFyIGJsb2NrTmFtZSA9ICdqaWdzYXdfJyArIGxldmVsICsgbGV0dGVyc1tibG9ja051bV07XG4gICAgdmFyIHBhdHRlcm5OYW1lID0gJ3BhdF8nICsgbGV2ZWwgKyBsZXR0ZXJzW2Jsb2NrTnVtXTtcbiAgICBibG9ja2x5LkJsb2Nrc1tibG9ja05hbWVdID0ge1xuICAgICAgaGVscFVybDogJycsXG4gICAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0SFNWLmFwcGx5KHRoaXMsIEhTVik7XG4gICAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5ibGFuaywgdGl0bGVXaWR0aCwgdGl0bGVIZWlnaHQpKTtcbiAgICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudChibG9ja051bSAhPT0gMSB8fCBub3RjaGVkRW5kcyk7XG4gICAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudChibG9ja051bSAhPT0gbnVtQmxvY2tzIHx8IG5vdGNoZWRFbmRzKTtcbiAgICAgICAgdGhpcy5zZXRGaWxsUGF0dGVybihcbiAgICAgICAgICBhZGRQYXR0ZXJuKHBhdHRlcm5OYW1lLCBpbWFnZSwgd2lkdGgsIGhlaWdodCwgMCxcbiAgICAgICAgICAgIGJsb2NrSGVpZ2h0ICogKGJsb2NrTnVtIC0gMSkpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbnVtQmxvY2tzOyBpKyspIHtcbiAgICBnZW5lcmF0ZUJsb2NrKGkpO1xuICB9XG59XG4iLCIvLyBsb2NhbGUgZm9yIGppZ3Nhd1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5ibG9ja2x5LmppZ3Nhd19sb2NhbGU7XG4iLCIvKmpzaGludCBtdWx0aXN0cjogdHJ1ZSAqL1xuXG52YXIgY3JlYXRlVG9vbGJveCA9IHJlcXVpcmUoJy4uL2Jsb2NrX3V0aWxzJykuY3JlYXRlVG9vbGJveDtcblxudmFyIGppZ3Nhd0Jsb2NrID0gZnVuY3Rpb24gKHR5cGUsIHgsIHksIGNoaWxkLCBjaGlsZFR5cGUpIHtcbiAgcmV0dXJuIGppZ3Nhd0Jsb2NrV2l0aERlbGV0YWJsZUF0dHIodHlwZSwgeCwgeSwgY2hpbGQsIGNoaWxkVHlwZSwgdHJ1ZSk7XG59O1xuXG52YXIgdW5kZWxldGFibGVKaWdzYXdCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCB4LCB5LCBjaGlsZCwgY2hpbGRUeXBlKSB7XG4gIHJldHVybiBqaWdzYXdCbG9ja1dpdGhEZWxldGFibGVBdHRyKHR5cGUsIHgsIHksIGNoaWxkLCBjaGlsZFR5cGUsIGZhbHNlKTtcbn07XG5cbnZhciBqaWdzYXdCbG9ja1dpdGhEZWxldGFibGVBdHRyID0gZnVuY3Rpb24gKHR5cGUsIHgsIHksIGNoaWxkLCBjaGlsZFR5cGUsIGRlbGV0YWJsZSkge1xuICB2YXIgY2hpbGRBdHRyID0gJyc7XG4gIHggPSB4IHx8IDA7XG4gIHkgPSB5IHx8IDA7XG4gIGNoaWxkVHlwZSA9IGNoaWxkVHlwZSB8fCBcIm5leHRcIjtcbiAgaWYgKGNoaWxkVHlwZSA9PT0gJ3N0YXRlbWVudCcpIHtcbiAgICBjaGlsZEF0dHIgPSBcIiBuYW1lPSdjaGlsZCdcIjtcbiAgfVxuICByZXR1cm4gJzxibG9jayB0eXBlPVwiJyArIHR5cGUgKyAnXCIgZGVsZXRhYmxlPVwiJyArIGRlbGV0YWJsZSArICdcIicgK1xuICAgICcgeD1cIicgKyB4ICsgJ1wiJyArXG4gICAgJyB5PVwiJyArIHkgKyAnXCI+JyArXG4gICAgKGNoaWxkID8gJzwnICsgY2hpbGRUeXBlICsgY2hpbGRBdHRyICsgJz4nICsgY2hpbGQgKyAnPC8nICsgY2hpbGRUeXBlICsgJz4nIDogJycpICtcbiAgICAnPC9ibG9jaz4nO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZXMgd2hldGhlciBwdXp6bGUgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHB1dCB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBsaXN0IG9mIHR5cGVzXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5sZXZlbCBMZXZlbCBudW1iZXJcbiAqIEBQYXJhbSB7bnVtYmVyfSBvcHRpb25zLm51bUJsb2NrcyBIb3cgbWFueSBibG9ja3MgdGhlcmUgYXJlIGluIHRoZSBsZXZlbFxuICovXG52YXIgdmFsaWRhdGVTaW1wbGVQdXp6bGUgPSBmdW5jdGlvbiAodHlwZXMsIG9wdGlvbnMpIHtcbiAgdmFyIG51bUJsb2NrcztcbiAgaWYgKHR5cGVzKSB7XG4gICAgbnVtQmxvY2tzID0gdHlwZXMubGVuZ3RoO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZXR0ZXJzID0gJy1BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG4gICAgdmFyIGxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgICBudW1CbG9ja3MgPSBvcHRpb25zLm51bUJsb2NrcztcblxuICAgIHR5cGVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbnVtQmxvY2tzOyBpKyspIHtcbiAgICAgIHR5cGVzLnB1c2goJ2ppZ3Nhd18nICsgbGV2ZWwgKyBsZXR0ZXJzW2ldKTtcbiAgICB9XG4gIH1cblxuICB2YXIgcm9vdHMgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldFRvcEJsb2NrcygpO1xuICBpZiAocm9vdHMubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGRlcHRoID0gMDtcbiAgdmFyIGJsb2NrID0gcm9vdHNbMF07XG4gIHdoaWxlIChkZXB0aCA8IG51bUJsb2Nrcykge1xuICAgIGlmICghYmxvY2sgfHwgYmxvY2sudHlwZSAhPT0gdHlwZXNbZGVwdGhdKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBjaGlsZHJlbiA9IGJsb2NrLmdldENoaWxkcmVuKCk7XG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYmxvY2sgPSBjaGlsZHJlblswXTtcbiAgICBkZXB0aCsrO1xuICB9XG5cbiAgLy8gbGFzdCBibG9jayBzaG91bGRudCBoYXZlIGNoaWxkcmVuXG4gIGlmIChibG9jayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKlxuICogQ29uZmlndXJhdGlvbiBmb3IgYWxsIGxldmVscy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgJzEnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2FwcGxlJyxcbiAgICBhbmlHaWZVUkw6ICcvc2NyaXB0X2Fzc2V0cy9rXzFfaW1hZ2VzL2luc3RydWN0aW9uX2dpZnMvY2xpY2stYmxvY2suZ2lmJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnYXBwbGUnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbNDEsIDEuMDAsIDAuOTY5XSxcbiAgICBudW1CbG9ja3M6IDEsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gSmlnc2F3LmJsb2NrMUNsaWNrZWQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18xQScsIDIwLCAyMClcbiAgfSxcbiAgJzInOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ3NtaWxleScsXG4gICAgYW5pR2lmVVJMOiAnL3NjcmlwdF9hc3NldHMva18xX2ltYWdlcy9pbnN0cnVjdGlvbl9naWZzL2RyYWctZHJvcC5naWYnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdzbWlsZXknLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMTg0LCAxLjAwLCAwLjczM10sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAxLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gbmVlZCB0byBiZSBmaW5pc2hlZCBkcmFnXG4gICAgICAgIGlmIChCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmRyYWdNb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb3MgPSBCbG9ja2x5Lm1haW5CbG9ja1NwYWNlLmdldEFsbEJsb2NrcygpWzBdLmdldFJlbGF0aXZlVG9TdXJmYWNlWFkoKTtcbiAgICAgICAgLy8gaG93IGNsb3NlIHRvIGdob3N0P1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyg0MDAgLSBwb3MueCk7XG4gICAgICAgIHZhciBkeSA9IE1hdGguYWJzKDEwMCAtIHBvcy55KTtcbiAgICAgICAgcmV0dXJuIGR4ICsgZHkgPCA4MDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzJBJywgMjAsIDIwKVxuICB9LFxuICAnMyc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnc25haWwnLFxuICAgIGFuaUdpZlVSTDogJy9zY3JpcHRfYXNzZXRzL2tfMV9pbWFnZXMvaW5zdHJ1Y3Rpb25fZ2lmcy9kcmFnLWNvbm5lY3QuZ2lmJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnc25haWwnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMzYsIDEuMDAsIDAuOTk5XSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDIsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiAzLCBudW1CbG9ja3M6IDJ9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzNBJywgNDAwLCAxMDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18zQicsIDEwMCwgMjIwKVxuICB9LFxuXG4gICc0Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdlbGVwaGFudCcsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2VsZXBoYW50JyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzMyMCwgMC42MCwgMC45OTldLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMixcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDQsIG51bUJsb2NrczogMn0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNEEnLCAxMDAsIDE0MCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzRCJywgNDAwLCAyMDApXG4gIH0sXG5cbiAgJzUnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2Zpc2gnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdmaXNoJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzIwOSwgMC41NywgMC42MDBdLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDUsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNUEnLCAxMDAsIDIwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNUInLCAxMDAsIDE0MCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzVDJywgMTAwLCAyODApXG4gIH0sXG5cbiAgJzYnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2RvZ2dpZScsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2RvZ2dpZScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsyNSwgMC41NywgMC45NjBdLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDYsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNkInLCAxMDAsIDIwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNkEnLCAxMDAsIDE0MCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzZDJywgMTAwLCAyODApXG4gIH0sXG5cbiAgJzcnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ3RyZWUnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICd0cmVlJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzIzOCwgMC41MSwgMC45OTldLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDcsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfN0InLCAxMDAsIDIwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfN0EnLCAxMDAsIDE0MCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzdDJywgMTAwLCAyODApXG4gIH0sXG5cbiAgJzgnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2Zsb3dlcicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2Zsb3dlcicsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFs3NSwgMC44MCwgMC45OTldLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDgsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOEMnLCAxMDAsIDIwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOEInLCAxMDAsIDE0MCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzhBJywgMTAwLCAyODApXG4gIH0sXG5cbiAgJzknOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2hvdXNlJyxcbiAgICBhbmlHaWZVUkw6ICcvc2NyaXB0X2Fzc2V0cy9rXzFfaW1hZ2VzL2luc3RydWN0aW9uX2dpZnMvZHJhZy1kaXNvcmRlcmVkLmdpZicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2hvdXNlJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzExMCwgMC41NiwgMC42MF0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogOSwgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd185QicsIDEwMCwgMjAsXG4gICAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd185QycsIDAsIDAsXG4gICAgICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzlBJywgMCwgMCkpKVxuICB9LFxuXG4gICcxMCc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnY29tcHV0ZXInLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdjb21wdXRlcicsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFszMDAsIDAuMjUsIDAuODBdLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDEwLCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzEwQScsIDEwMCwgMjAsXG4gICAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18xMEMnLCAwLCAwLFxuICAgICAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18xMEInLCAwLCAwKSkpXG4gIH0sXG5cbiAgJzExJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdibG9ja3MnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdibG9ja3MnLFxuICAgICAgd2lkdGg6IDEzMSxcbiAgICAgIGhlaWdodDogMjg2XG4gICAgfSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogMjAwLFxuICAgICAgeTogMTJcbiAgICB9LFxuICAgIG51bUJsb2NrczogMCxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGxhcmdlTm90Y2hlczogZmFsc2UsXG4gICAgc25hcFJhZGl1czogMzAsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUoWydqaWdzYXdfcmVwZWF0JywgJ2ppZ3Nhd19wdXJwbGUnLFxuICAgICAgICAgICdqaWdzYXdfYmx1ZScsICdqaWdzYXdfZ3JlZW4nXSwge30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6IHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd19yZXBlYXQnLCAyMCwgMjAsXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfcHVycGxlJywgMCwgMCwgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3X2JsdWUnKSksICdzdGF0ZW1lbnQnKSxcbiAgICB0b29sYm94OiBjcmVhdGVUb29sYm94KFxuICAgICAgamlnc2F3QmxvY2soJ2ppZ3Nhd19ncmVlbicpXG4gICAgKVxuICB9LFxuXG4gICcxMic6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnYmxvY2tzJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnYmxvY2tzJyxcbiAgICAgIHdpZHRoOiAxMzEsXG4gICAgICBoZWlnaHQ6IDI4NlxuICAgIH0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDIwMCxcbiAgICAgIHk6IDEyXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDAsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBsYXJnZU5vdGNoZXM6IGZhbHNlLFxuICAgIHNuYXBSYWRpdXM6IDMwLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKFsnamlnc2F3X3JlcGVhdCcsICdqaWdzYXdfcHVycGxlJyxcbiAgICAgICAgICAnamlnc2F3X2JsdWUnLCAnamlnc2F3X2dyZWVuJ10sIHt9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOiB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfcmVwZWF0JywgMjAsIDIwKSxcbiAgICB0b29sYm94OiBjcmVhdGVUb29sYm94KFxuICAgICAgamlnc2F3QmxvY2soJ2ppZ3Nhd19ncmVlbicpICtcbiAgICAgIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfcHVycGxlJykgK1xuICAgICAgamlnc2F3QmxvY2soJ2ppZ3Nhd19ibHVlJylcbiAgICApXG4gIH0sXG5cbiAgLy8gYXNzZXNzbWVudFxuICAnMTMnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2RvZ2dpZScsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2RvZ2dpZScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsyNSwgMC41NywgMC45NjBdLFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDEzLCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgamlnc2F3QmxvY2soJ2ppZ3Nhd18xM0MnLCAxMDAsIDIwLCBqaWdzYXdCbG9jaygnamlnc2F3XzEzQicsIDAsIDAsIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTNBJywgMCwgMCkpKVxuICB9XG59O1xuIl19
