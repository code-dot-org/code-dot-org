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
var AppView = require('../templates/AppView.jsx');
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

  var renderCodeApp = function renderCodeApp() {
    return page({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl }),
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default'
      }
    });
  };

  var onMount = function onMount() {
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

  React.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    requireLandscape: !(config.share || config.embed),
    renderCodeApp: renderCodeApp,
    onMount: onMount
  }), document.getElementById(config.containerId));
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/page.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/page.html.ejs","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs"}],"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9qaWdzYXcvbWFpbi5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9za2lucy5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9qaWdzYXcuanMiLCJidWlsZC9qcy9qaWdzYXcvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9qaWdzYXcvYmxvY2tzLmpzIiwiYnVpbGQvanMvamlnc2F3L2xvY2FsZS5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9sZXZlbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2ZBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7O0FBRVosUUFBTSxFQUFFLEVBQ1A7O0NBRUYsQ0FBQzs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxNQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUc5QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUxQyxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEMsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUMsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3RDLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdEMsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRTlDLE1BQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN4QyxNQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7O0FBR3BDLE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVsRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7QUNoQ0YsWUFBWSxDQUFDOztBQUViLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDbEQsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2xELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBQ2pELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7QUFLNUIsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFNUIsSUFBSSxLQUFLLENBQUM7QUFDVixJQUFJLElBQUksQ0FBQzs7QUFFVCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDO0FBQ3RDLElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7O0FBRXhDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR3ZDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7O0FBRWpDLFNBQVMsZUFBZSxHQUFHO0FBQ3pCLE1BQUksV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsTUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixTQUFPLENBQUMsUUFBUSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ2xFLFNBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFbEMsTUFBSSxhQUFhLEdBQUcsSUFBSSxHQUN0QixXQUFXLEdBQUcsR0FBRyxHQUFHLFdBQVcsR0FBRyxHQUFHLEdBQ3JDLFdBQVcsR0FBRyxLQUFLLEdBQ25CLFdBQVcsR0FBRyxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQ25DLE1BQUksY0FBYyxHQUFHLElBQUksR0FDdkIsR0FBRyxHQUFHLFdBQVcsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLEdBQUcsR0FDM0MsR0FBRyxHQUFHLFdBQVcsR0FBRyxLQUFLLEdBQ3pCLEdBQUcsR0FBRyxXQUFXLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQzs7OztBQUl6QyxNQUFJLG9CQUFvQixHQUFHLFdBQVcsQ0FBQztBQUN2QyxNQUFJLG9CQUFvQixHQUFHLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDN0MsTUFBSSxvQkFBb0IsR0FBRyxXQUFXLEdBQUcsQ0FBQyxDQUFDOztBQUUzQyxNQUFJLHNCQUFzQixHQUFHLElBQUksR0FDL0Isb0JBQW9CLEdBQUcsR0FBRyxHQUFHLG9CQUFvQixHQUFHLEdBQUcsR0FDdkQsb0JBQW9CLEdBQUcsS0FBSyxHQUM1QixvQkFBb0IsR0FBRyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7OztBQUdyRCxTQUFPLENBQUMsVUFBVSxDQUFDLG9CQUFvQixHQUFHO0FBQ3hDLFFBQUksRUFBRSxhQUFhO0FBQ25CLGlCQUFhLEVBQUUsc0JBQXNCO0FBQ3JDLFNBQUssRUFBRSxjQUFjO0dBQ3RCLENBQUM7Q0FFSDs7O0FBSUQsTUFBTSxDQUFDLEtBQUssR0FBRztBQUNiLGNBQVksRUFBRSxDQUFDO0FBQ2YsYUFBVyxFQUFFLEVBQUU7Q0FDaEIsQ0FBQzs7QUFFRixJQUFJLFNBQVMsR0FBRyxTQUFaLFNBQVMsR0FBYzs7O0FBR3pCLE9BQUssSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtBQUMzQixVQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDdEM7O0FBRUQsUUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDdEIsUUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7O0FBRXZCLFFBQU0sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0NBQzlCLENBQUM7O0FBRUYsSUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQWM7O0FBRXZCLE1BQUksbUJBQW1CLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3pFLHFCQUFtQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQzNDLE1BQUksc0JBQXNCLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQy9FLHdCQUFzQixDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUU5QyxNQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7QUFDZixRQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3JELFdBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDL0IsVUFBSSxFQUFFLFdBQVcsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUk7QUFDbkMsb0JBQWMsRUFBRSxLQUFLO0FBQ3JCLFdBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDeEIsWUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUMxQixlQUFTLEVBQUUsWUFBWSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksR0FDNUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRztLQUN0QixFQUFFLFdBQVcsRUFBRTtBQUNkLG9CQUFjLEVBQUUsSUFBSTtLQUNyQixDQUFDLENBQUM7R0FDSjtDQUNGLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLElBQUksR0FBRyxVQUFTLE1BQU0sRUFBRTs7QUFFN0IsTUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbkIsT0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDckIsV0FBUyxFQUFFLENBQUM7O0FBRVosTUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO0FBQ3RCLG1CQUFlLEVBQUUsQ0FBQztHQUNuQjtBQUNELFNBQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7OztBQUc3QyxRQUFNLENBQUMsU0FBUyxHQUFHLFlBQVc7QUFDNUIsYUFBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzFDLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5QyxhQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDbkQsQ0FBQzs7QUFFRixRQUFNLENBQUMsV0FBVyxHQUFHLFlBQVc7Ozs7Ozs7QUFPOUIsV0FBTyxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUM7O0FBRTdCLFdBQU8sRUFBRSxDQUFDO0dBQ1gsQ0FBQzs7O0FBR0YsUUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUNsQyxRQUFNLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzs7QUFFMUIsUUFBTSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDOUIsUUFBTSxDQUFDLG9CQUFvQixHQUFHLEtBQUssQ0FBQzs7QUFFcEMsTUFBSSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxHQUFlO0FBQzlCLFdBQU8sSUFBSSxDQUFDO0FBQ1YsY0FBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO0FBQzVCLFVBQUksRUFBRTtBQUNKLHVCQUFlLEVBQUUsU0FBUyxDQUFDLGVBQWUsRUFBRTtBQUM1QyxnQkFBUSxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEVBQUMsQ0FBQztBQUN4RSxnQkFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO0FBQ3hCLHlCQUFpQixFQUFFLHVCQUF1QjtPQUMzQztLQUNGLENBQUMsQ0FBQztHQUNKLENBQUM7O0FBRUYsTUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQWU7QUFDeEIsYUFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkIsWUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUM1RCxVQUFNLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNwRixxQkFBZSxFQUFFLENBQUM7S0FDbkIsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxRQUFJLE1BQU0sRUFBRTtBQUNWLFNBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsWUFBWTtBQUM3QyxjQUFNLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUM3QixDQUFDLENBQUM7S0FDSjtHQUNGLENBQUM7O0FBRUYsT0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRTtBQUN4QyxZQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7QUFDNUIsb0JBQWdCLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUEsQUFBQztBQUNqRCxpQkFBYSxFQUFFLGFBQWE7QUFDNUIsV0FBTyxFQUFFLE9BQU87R0FDakIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Q0FDbEQsQ0FBQzs7QUFFRixTQUFTLGVBQWUsR0FBRztBQUN6QixNQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDNUMsTUFBSSxPQUFPLEVBQUU7QUFDWCxXQUFPLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUVyRCxVQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7QUFDbkMsVUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDM0I7Q0FDRjs7Ozs7O0FBTUQsSUFBSSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxHQUFjO0FBQy9CLE1BQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUIsYUFBUyxDQUFDLGVBQWUsQ0FBQztBQUN4QixTQUFHLEVBQUUsUUFBUTtBQUNiLFVBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNiLGtCQUFZLEVBQUUsTUFBTSxDQUFDLFdBQVc7QUFDaEMsY0FBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO0FBQ3pCLFdBQUssRUFBRSxLQUFLO0tBQ2IsQ0FBQyxDQUFDO0dBQ0o7Q0FDRixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxRQUFRLEVBQUU7QUFDM0MsUUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDM0IsUUFBTSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztBQUNoQyxXQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsaUJBQWUsRUFBRSxDQUFDO0NBQ25CLENBQUM7Ozs7O0FBS0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFXOztDQUUzQixDQUFDOztBQUVGLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxZQUFXOzs7O0FBSW5DLE1BQUksYUFBYSxHQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLE9BQU8sQUFBQyxDQUFDOztBQUUxRCxRQUFNLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFO0FBQzNELGtCQUFjLEVBQUUsSUFBSTtHQUNyQixDQUFDLENBQUM7O0FBRUgsTUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxTQUFTLEVBQUU7QUFDL0MsYUFBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUM1QixNQUFNO0FBQ0wsYUFBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNoQzs7QUFFRCxNQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUQsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTVDLFFBQU0sQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7OztBQUcvQixXQUFTLENBQUMsTUFBTSxDQUFDO0FBQ2QsT0FBRyxFQUFFLFFBQVE7QUFDYixTQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDZixVQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsT0FBTztBQUM1QyxjQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVc7QUFDOUIsV0FBTyxFQUFFLGtCQUFrQixDQUFDLFVBQVUsQ0FBQztBQUN2QyxjQUFVLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtHQUNyQyxDQUFDLENBQUM7Q0FDSixDQUFDOzs7QUNyUUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNiQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWpDLElBQUksWUFBWSxHQUFHO0FBQ2pCLFFBQU0sRUFBRSxFQUFFO0FBQ1YsU0FBTyxFQUFFLEVBQUU7Ozs7O0FBS1gsWUFBVSxFQUFFLG9CQUFVLFdBQVcsRUFBRTtBQUNqQyxRQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvQjs7Ozs7QUFLRCxtQkFBaUIsRUFBRSw2QkFBWTtBQUM3QixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRTtBQUNyQyxnQkFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQ3JFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3JDLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0dBQ2xCOzs7Ozs7QUFNRCxZQUFVLEVBQUUsb0JBQVUsV0FBVyxFQUFFO0FBQ2pDLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxQyxRQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsYUFBTyxLQUFLLENBQUM7S0FDZDs7QUFFRCxVQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtBQUM5QyxVQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEMsYUFBSyxHQUFHLEtBQUssQ0FBQztPQUNmO0tBQ0YsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLEtBQUssRUFBRTtBQUNWLFlBQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztLQUM3RTtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2I7Ozs7O0FBS0QsYUFBVyxFQUFFLHFCQUFVLFdBQVcsRUFBRTtBQUNsQyxRQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2hDLFlBQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3hFO0FBQ0QsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDO0dBQzVDOztDQUVGLENBQUM7O0FBRUYsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7OztBQWF6QixJQUFJLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRTtBQUN6RSxNQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQztBQUNoQyxNQUFJLFdBQVcsR0FBRztBQUNoQixNQUFFLEVBQUUsRUFBRTtBQUNOLGFBQVMsRUFBRSxTQUFTO0FBQ3BCLFNBQUssRUFBRSxLQUFLO0FBQ1osVUFBTSxFQUFFLE1BQU07QUFDZCxXQUFPLEVBQUUsT0FBTztBQUNoQixXQUFPLEVBQUUsT0FBTztHQUNqQixDQUFDOzs7QUFHRixNQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEQsTUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGdCQUFZLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ3RDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7O0FBRWhELEtBQUMsR0FBRyxPQUFPLE9BQU8sQUFBQyxLQUFLLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDO0FBQzNELEtBQUMsR0FBRyxPQUFPLE9BQU8sQUFBQyxLQUFLLFVBQVUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDO0FBQzNELFdBQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO0FBQzVDLFFBQUUsRUFBRSxFQUFFO0FBQ04sa0JBQVksRUFBRSxnQkFBZ0I7QUFDOUIsV0FBSyxFQUFFLE1BQU07QUFDYixZQUFNLEVBQUUsTUFBTTtBQUNkLE9BQUMsRUFBRSxDQUFDO0FBQ0osT0FBQyxFQUFFLENBQUM7S0FDTCxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ1osZ0JBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO0FBQy9DLFdBQUssRUFBRSxLQUFLO0FBQ1osWUFBTSxFQUFFLE1BQU07S0FDZixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ1osZ0JBQVksQ0FBQyxjQUFjLENBQUMsOEJBQThCLEVBQUUsWUFBWSxFQUN0RSxTQUFTLENBQUMsQ0FBQzs7QUFFYixnQkFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUN2QztBQUNELFNBQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQzs7Ozs7OztBQU9GLElBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFhLElBQUksRUFBRTtBQUNoQyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ25ELE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7QUFDM0IsYUFBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7R0FDRjtBQUNELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7OztBQU9GLElBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFhLElBQUksRUFBRTtBQUMvQixTQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUM7Q0FDakQsQ0FBQzs7QUFFRixTQUFTLGtCQUFrQixHQUFHO0FBQzVCLE1BQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7QUFDOUMsY0FBVSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLFdBQU87R0FDUjtBQUNELGNBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0NBQ2xDOzs7QUFJRCxPQUFPLENBQUMsT0FBTyxHQUFHLFVBQVMsT0FBTyxFQUFFLG1CQUFtQixFQUFFO0FBQ3ZELE1BQUksSUFBSSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQzs7QUFFcEMsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUUxQixNQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFakQsUUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxHQUFHLEVBQUU7QUFDeEMsUUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLGdDQUE0QixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDMUMsV0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUM3QixTQUFHLEVBQUUsS0FBSyxDQUFDLGFBQWEsSUFBSSxHQUFHO0FBQy9CLFdBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDeEIsWUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUMxQixlQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7QUFDMUIsaUJBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztBQUM5QixXQUFLLEVBQUUsR0FBRztLQUNYLENBQUMsQ0FBQzs7QUFFSCxRQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFOztBQUV6QixVQUFJLFdBQVcsR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDMUMsZ0JBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQy9ELEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM3QjtHQUNGLENBQUMsQ0FBQzs7QUFFSCxvQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pGLG9CQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6RSxvQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDeEUsb0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOzs7O0FBSTFFLE1BQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFNBQU8sQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQy9CLFFBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssRUFBRTtBQUNuRCxRQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDN0QsZUFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFlBQVk7QUFDN0IsZUFBTyxJQUFJLENBQUM7T0FDYixDQUFDO0tBQ0g7R0FDRixDQUFDLENBQUM7O0FBRUgsb0JBQWtCLEVBQUUsQ0FBQzs7QUFFckIsU0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0FBQzNDLFNBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztDQUMzQyxDQUFDOztBQUVGLFNBQVMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7QUFDdEUsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRztBQUNyQixXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxnQkFBWTtBQUNoQixVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5RCxVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsVUFBSSxTQUFTLEVBQUU7QUFDYixZQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDcEM7QUFDRCxVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDN0I7R0FDRixDQUFDO0NBQ0g7O0FBRUQsU0FBUyw0QkFBNEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUM1RCxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQzFCLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsTUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUM1QixNQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7QUFFdEIsTUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQzs7QUFFdEMsTUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUNyQyxNQUFJLFVBQVUsR0FBRyxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQzVCLE1BQUksV0FBVyxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRW5DLE1BQUksT0FBTyxHQUFHLDZCQUE2QixDQUFDOztBQUU1QyxXQUFTLGFBQWEsQ0FBQyxRQUFRLEVBQUU7QUFDL0IsUUFBSSxTQUFTLEdBQUcsU0FBUyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEQsUUFBSSxXQUFXLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckQsV0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRztBQUMxQixhQUFPLEVBQUUsRUFBRTtBQUNYLFVBQUksRUFBRSxnQkFBWTtBQUNoQixZQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsWUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUM1RSxZQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxLQUFLLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQztBQUN6RCxZQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsQ0FBQztBQUM3RCxZQUFJLENBQUMsY0FBYyxDQUNqQixVQUFVLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFDN0MsV0FBVyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUMsQ0FBQztPQUNwQztLQUNGLENBQUM7R0FDSDs7QUFFRCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25DLGlCQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEI7Q0FDRjs7Ozs7OztBQ2hRRCxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDOzs7Ozs7O0FDQTlDLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGFBQWEsQ0FBQzs7QUFFNUQsSUFBSSxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQWEsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtBQUN4RCxTQUFPLDRCQUE0QixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDekUsQ0FBQzs7QUFFRixJQUFJLHNCQUFzQixHQUFHLFNBQXpCLHNCQUFzQixDQUFhLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7QUFDbkUsU0FBTyw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzFFLENBQUM7O0FBRUYsSUFBSSw0QkFBNEIsR0FBRyxTQUEvQiw0QkFBNEIsQ0FBYSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUNwRixNQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsR0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDWCxHQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNYLFdBQVMsR0FBRyxTQUFTLElBQUksTUFBTSxDQUFDO0FBQ2hDLE1BQUksU0FBUyxLQUFLLFdBQVcsRUFBRTtBQUM3QixhQUFTLEdBQUcsZUFBZSxDQUFDO0dBQzdCO0FBQ0QsU0FBTyxlQUFlLEdBQUcsSUFBSSxHQUFHLGVBQWUsR0FBRyxTQUFTLEdBQUcsR0FBRyxHQUMvRCxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FDaEIsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLElBQ2hCLEtBQUssR0FBRyxHQUFHLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxTQUFTLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQ2pGLFVBQVUsQ0FBQztDQUNkLENBQUM7Ozs7Ozs7OztBQVNGLElBQUksb0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CLENBQWEsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUNuRCxNQUFJLFNBQVMsQ0FBQztBQUNkLE1BQUksS0FBSyxFQUFFO0FBQ1QsYUFBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7R0FDMUIsTUFBTTtBQUNMLFFBQUksT0FBTyxHQUFHLDZCQUE2QixDQUFDO0FBQzVDLFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDMUIsYUFBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7O0FBRTlCLFNBQUssR0FBRyxFQUFFLENBQUM7QUFDWCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25DLFdBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QztHQUNGOztBQUVELE1BQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDbEQsTUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN0QixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELE1BQUksS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNkLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQixTQUFPLEtBQUssR0FBRyxTQUFTLEVBQUU7QUFDeEIsUUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN6QyxhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25DLFFBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDdkIsYUFBTyxLQUFLLENBQUM7S0FDZDtBQUNELFNBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsU0FBSyxFQUFFLENBQUM7R0FDVDs7O0FBR0QsTUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQ3ZCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7QUFNRixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsS0FBRyxFQUFFO0FBQ0gsb0JBQWdCLEVBQUUsT0FBTztBQUN6QixhQUFTLEVBQUUsNERBQTREO0FBQ3ZFLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLE9BQU87QUFDYixXQUFLLEVBQUUsR0FBRztBQUNWLFlBQU0sRUFBRSxHQUFHO0tBQ1o7QUFDRCxpQkFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7QUFDaEMsYUFBUyxFQUFFLENBQUM7QUFDWixrQkFBYyxFQUFFLEVBQUU7QUFDbEIsWUFBUSxFQUFFLEtBQUs7QUFDZixnQkFBWSxFQUFFLElBQUk7QUFDbEIsUUFBSSxFQUFFO0FBQ0osc0JBQWdCLEVBQUUsNEJBQVk7QUFDNUIsZUFBTyxNQUFNLENBQUMsYUFBYSxDQUFDO09BQzdCO0tBQ0Y7QUFDRCxlQUFXLEVBQ1Qsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7R0FDOUM7QUFDRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxRQUFRO0FBQzFCLGFBQVMsRUFBRSwwREFBMEQ7QUFDckUsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELGlCQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztBQUNqQyxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTs7QUFFNUIsWUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRTtBQUNuQyxpQkFBTyxLQUFLLENBQUM7U0FDZDtBQUNELFlBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7QUFFNUUsWUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixlQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO09BQ3JCO0tBQ0Y7QUFDRCxlQUFXLEVBQ1Qsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7R0FDOUM7QUFDRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxPQUFPO0FBQ3pCLGFBQVMsRUFBRSw2REFBNkQ7QUFDeEUsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsT0FBTztBQUNiLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELGlCQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztBQUNoQyxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixlQUFPLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7T0FDN0Q7S0FDRjtBQUNELGVBQVcsRUFDVCxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUM3QyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztHQUNoRDs7QUFFRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxVQUFVO0FBQzVCLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFVBQVU7QUFDaEIsV0FBSyxFQUFFLEdBQUc7QUFDVixZQUFNLEVBQUUsR0FBRztLQUNaO0FBQ0QsaUJBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0FBQ2pDLFNBQUssRUFBRTtBQUNMLE9BQUMsRUFBRSxHQUFHO0FBQ04sT0FBQyxFQUFFLEdBQUc7S0FDUDtBQUNELGFBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZ0JBQVksRUFBRSxJQUFJO0FBQ2xCLFFBQUksRUFBRTtBQUNKLHNCQUFnQixFQUFFLDRCQUFZO0FBQzVCLGVBQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUM3RDtLQUNGO0FBQ0QsZUFBVyxFQUNULHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQzdDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0dBQ2hEOztBQUVELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLE1BQU07QUFDeEIsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsTUFBTTtBQUNaLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELGlCQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztBQUNqQyxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixlQUFXLEVBQUUsSUFBSTtBQUNqQixRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixlQUFPLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7T0FDN0Q7S0FDRjtBQUNELGVBQVcsRUFDVCxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUM1QyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUM3QyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztHQUNoRDs7QUFFRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxRQUFRO0FBQzFCLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUsR0FBRztBQUNWLFlBQU0sRUFBRSxHQUFHO0tBQ1o7QUFDRCxpQkFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7QUFDaEMsU0FBSyxFQUFFO0FBQ0wsT0FBQyxFQUFFLEdBQUc7QUFDTixPQUFDLEVBQUUsR0FBRztLQUNQO0FBQ0QsYUFBUyxFQUFFLENBQUM7QUFDWixrQkFBYyxFQUFFLEVBQUU7QUFDbEIsWUFBUSxFQUFFLEtBQUs7QUFDZixnQkFBWSxFQUFFLElBQUk7QUFDbEIsZUFBVyxFQUFFLElBQUk7QUFDakIsUUFBSSxFQUFFO0FBQ0osc0JBQWdCLEVBQUUsNEJBQVk7QUFDNUIsZUFBTyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO09BQzdEO0tBQ0Y7QUFDRCxlQUFXLEVBQ1Qsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FDNUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FDN0Msc0JBQXNCLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7R0FDaEQ7O0FBRUQsS0FBRyxFQUFFO0FBQ0gsb0JBQWdCLEVBQUUsTUFBTTtBQUN4QixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRTtBQUNMLFVBQUksRUFBRSxNQUFNO0FBQ1osV0FBSyxFQUFFLEdBQUc7QUFDVixZQUFNLEVBQUUsR0FBRztLQUNaO0FBQ0QsaUJBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0FBQ2pDLFNBQUssRUFBRTtBQUNMLE9BQUMsRUFBRSxHQUFHO0FBQ04sT0FBQyxFQUFFLEdBQUc7S0FDUDtBQUNELGFBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZ0JBQVksRUFBRSxJQUFJO0FBQ2xCLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLFFBQUksRUFBRTtBQUNKLHNCQUFnQixFQUFFLDRCQUFZO0FBQzVCLGVBQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUM3RDtLQUNGO0FBQ0QsZUFBVyxFQUNULHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQzVDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQzdDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0dBQ2hEOztBQUVELEtBQUcsRUFBRTtBQUNILG9CQUFnQixFQUFFLFFBQVE7QUFDMUIsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELGlCQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztBQUNoQyxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixlQUFXLEVBQUUsSUFBSTtBQUNqQixRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixlQUFPLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7T0FDN0Q7S0FDRjtBQUNELGVBQVcsRUFDVCxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUM1QyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUM3QyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztHQUNoRDs7QUFFRCxLQUFHLEVBQUU7QUFDSCxvQkFBZ0IsRUFBRSxPQUFPO0FBQ3pCLGFBQVMsRUFBRSxnRUFBZ0U7QUFDM0UsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsT0FBTztBQUNiLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELGlCQUFhLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztBQUNoQyxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGtCQUFjLEVBQUUsRUFBRTtBQUNsQixZQUFRLEVBQUUsS0FBSztBQUNmLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGdCQUFZLEVBQUUsSUFBSTtBQUNsQixRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixlQUFPLG9CQUFvQixDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7T0FDN0Q7S0FDRjtBQUNELGVBQVcsRUFDVCxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFDekMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQ3RDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNsRDs7QUFFRCxNQUFJLEVBQUU7QUFDSixvQkFBZ0IsRUFBRSxVQUFVO0FBQzVCLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFVBQVU7QUFDaEIsV0FBSyxFQUFFLEdBQUc7QUFDVixZQUFNLEVBQUUsR0FBRztLQUNaO0FBQ0QsaUJBQWEsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0FBQ2hDLFNBQUssRUFBRTtBQUNMLE9BQUMsRUFBRSxHQUFHO0FBQ04sT0FBQyxFQUFFLEdBQUc7S0FDUDtBQUNELGFBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZUFBVyxFQUFFLElBQUk7QUFDakIsZ0JBQVksRUFBRSxJQUFJO0FBQ2xCLFFBQUksRUFBRTtBQUNKLHNCQUFnQixFQUFFLDRCQUFZO0FBQzVCLGVBQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUM5RDtLQUNGO0FBQ0QsZUFBVyxFQUNULHNCQUFzQixDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUMxQyxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFDdkMsc0JBQXNCLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ25EOztBQUVELE1BQUksRUFBRTtBQUNKLG9CQUFnQixFQUFFLFFBQVE7QUFDMUIsUUFBSSxFQUFFLElBQUk7QUFDVixTQUFLLEVBQUU7QUFDTCxVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxHQUFHO0FBQ1YsWUFBTSxFQUFFLEdBQUc7S0FDWjtBQUNELFNBQUssRUFBRTtBQUNMLE9BQUMsRUFBRSxHQUFHO0FBQ04sT0FBQyxFQUFFLEVBQUU7S0FDTjtBQUNELGFBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZUFBVyxFQUFFLElBQUk7QUFDakIsZ0JBQVksRUFBRSxLQUFLO0FBQ25CLGNBQVUsRUFBRSxFQUFFO0FBQ2QsUUFBSSxFQUFFO0FBQ0osc0JBQWdCLEVBQUUsNEJBQVk7QUFDNUIsZUFBTyxvQkFBb0IsQ0FBQyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQzNELGFBQWEsRUFBRSxjQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN2QztLQUNGO0FBQ0QsZUFBVyxFQUFFLHNCQUFzQixDQUFDLGVBQWUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUN6RCxzQkFBc0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQztBQUNwRyxXQUFPLEVBQUUsYUFBYSxDQUNwQixXQUFXLENBQUMsY0FBYyxDQUFDLENBQzVCO0dBQ0Y7O0FBRUQsTUFBSSxFQUFFO0FBQ0osb0JBQWdCLEVBQUUsUUFBUTtBQUMxQixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRTtBQUNMLFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLEdBQUc7QUFDVixZQUFNLEVBQUUsR0FBRztLQUNaO0FBQ0QsU0FBSyxFQUFFO0FBQ0wsT0FBQyxFQUFFLEdBQUc7QUFDTixPQUFDLEVBQUUsRUFBRTtLQUNOO0FBQ0QsYUFBUyxFQUFFLENBQUM7QUFDWixrQkFBYyxFQUFFLEVBQUU7QUFDbEIsWUFBUSxFQUFFLEtBQUs7QUFDZixlQUFXLEVBQUUsSUFBSTtBQUNqQixnQkFBWSxFQUFFLEtBQUs7QUFDbkIsY0FBVSxFQUFFLEVBQUU7QUFDZCxRQUFJLEVBQUU7QUFDSixzQkFBZ0IsRUFBRSw0QkFBWTtBQUM1QixlQUFPLG9CQUFvQixDQUFDLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFDM0QsYUFBYSxFQUFFLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQ3ZDO0tBQ0Y7QUFDRCxlQUFXLEVBQUUsc0JBQXNCLENBQUMsZUFBZSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDNUQsV0FBTyxFQUFFLGFBQWEsQ0FDcEIsV0FBVyxDQUFDLGNBQWMsQ0FBQyxHQUMzQixXQUFXLENBQUMsZUFBZSxDQUFDLEdBQzVCLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FDM0I7R0FDRjs7O0FBR0QsTUFBSSxFQUFFO0FBQ0osb0JBQWdCLEVBQUUsUUFBUTtBQUMxQixRQUFJLEVBQUUsSUFBSTtBQUNWLFNBQUssRUFBRTtBQUNMLFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLEdBQUc7QUFDVixZQUFNLEVBQUUsR0FBRztLQUNaO0FBQ0QsU0FBSyxFQUFFO0FBQ0wsT0FBQyxFQUFFLEdBQUc7QUFDTixPQUFDLEVBQUUsR0FBRztLQUNQO0FBQ0QsaUJBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO0FBQ2hDLGFBQVMsRUFBRSxDQUFDO0FBQ1osa0JBQWMsRUFBRSxFQUFFO0FBQ2xCLFlBQVEsRUFBRSxLQUFLO0FBQ2YsZ0JBQVksRUFBRSxJQUFJO0FBQ2xCLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLFFBQUksRUFBRTtBQUNKLHNCQUFnQixFQUFFLDRCQUFZO0FBQzVCLGVBQU8sb0JBQW9CLENBQUMsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztPQUM5RDtLQUNGO0FBQ0QsZUFBVyxFQUNULFdBQVcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUN2RztDQUNGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXBwTWFpbiA9IHJlcXVpcmUoJy4uL2FwcE1haW4nKTtcbndpbmRvdy5KaWdzYXcgPSByZXF1aXJlKCcuL2ppZ3NhdycpO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIGdsb2JhbC5KaWdzYXcgPSB3aW5kb3cuSmlnc2F3O1xufVxudmFyIGJsb2NrcyA9IHJlcXVpcmUoJy4vYmxvY2tzJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4vc2tpbnMnKTtcblxud2luZG93LmppZ3Nhd01haW4gPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBvcHRpb25zLnNraW5zTW9kdWxlID0gc2tpbnM7XG4gIG9wdGlvbnMuYmxvY2tzTW9kdWxlID0gYmxvY2tzO1xuICBhcHBNYWluKHdpbmRvdy5KaWdzYXcsIGxldmVscywgb3B0aW9ucyk7XG59O1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltSjFhV3hrTDJwekwycHBaM05oZHk5dFlXbHVMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3T3p0QlFVRkJMRWxCUVVrc1QwRkJUeXhIUVVGSExFOUJRVThzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0QlFVTndReXhOUVVGTkxFTkJRVU1zVFVGQlRTeEhRVUZITEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJRenRCUVVOd1F5eEpRVUZKTEU5QlFVOHNUVUZCVFN4TFFVRkxMRmRCUVZjc1JVRkJSVHRCUVVOcVF5eFJRVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU03UTBGREwwSTdRVUZEUkN4SlFVRkpMRTFCUVUwc1IwRkJSeXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTTdRVUZEYWtNc1NVRkJTU3hOUVVGTkxFZEJRVWNzVDBGQlR5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMEZCUTJwRExFbEJRVWtzUzBGQlN5eEhRVUZITEU5QlFVOHNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenM3UVVGRkwwSXNUVUZCVFN4RFFVRkRMRlZCUVZVc1IwRkJSeXhWUVVGVExFOUJRVThzUlVGQlJUdEJRVU53UXl4VFFVRlBMRU5CUVVNc1YwRkJWeXhIUVVGSExFdEJRVXNzUTBGQlF6dEJRVU0xUWl4VFFVRlBMRU5CUVVNc1dVRkJXU3hIUVVGSExFMUJRVTBzUTBGQlF6dEJRVU01UWl4VFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1EwRkRla01zUTBGQlF5SXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpZG1GeUlHRndjRTFoYVc0Z1BTQnlaWEYxYVhKbEtDY3VMaTloY0hCTllXbHVKeWs3WEc1M2FXNWtiM2N1U21sbmMyRjNJRDBnY21WeGRXbHlaU2duTGk5cWFXZHpZWGNuS1R0Y2JtbG1JQ2gwZVhCbGIyWWdaMnh2WW1Gc0lDRTlQU0FuZFc1a1pXWnBibVZrSnlrZ2UxeHVJQ0JuYkc5aVlXd3VTbWxuYzJGM0lEMGdkMmx1Wkc5M0xrcHBaM05oZHp0Y2JuMWNiblpoY2lCaWJHOWphM01nUFNCeVpYRjFhWEpsS0NjdUwySnNiMk5yY3ljcE8xeHVkbUZ5SUd4bGRtVnNjeUE5SUhKbGNYVnBjbVVvSnk0dmJHVjJaV3h6SnlrN1hHNTJZWElnYzJ0cGJuTWdQU0J5WlhGMWFYSmxLQ2N1TDNOcmFXNXpKeWs3WEc1Y2JuZHBibVJ2ZHk1cWFXZHpZWGROWVdsdUlEMGdablZ1WTNScGIyNG9iM0IwYVc5dWN5a2dlMXh1SUNCdmNIUnBiMjV6TG5OcmFXNXpUVzlrZFd4bElEMGdjMnRwYm5NN1hHNGdJRzl3ZEdsdmJuTXVZbXh2WTJ0elRXOWtkV3hsSUQwZ1lteHZZMnR6TzF4dUlDQmhjSEJOWVdsdUtIZHBibVJ2ZHk1S2FXZHpZWGNzSUd4bGRtVnNjeXdnYjNCMGFXOXVjeWs3WEc1OU8xeHVJbDE5IiwiLyoqXG4gKiBMb2FkIFNraW4gZm9yIEppZ3Nhdy5cbiAqL1xuXG52YXIgc2tpbnNCYXNlID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcblxudmFyIENPTkZJR1MgPSB7XG5cbiAgamlnc2F3OiB7XG4gIH1cblxufTtcblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oYXNzZXRVcmwsIGlkKSB7XG4gIHZhciBza2luID0gc2tpbnNCYXNlLmxvYWQoYXNzZXRVcmwsIGlkKTtcbiAgdmFyIGNvbmZpZyA9IENPTkZJR1Nbc2tpbi5pZF07XG5cblxuICBza2luLmFydGlzdCA9IHNraW4uYXNzZXRVcmwoJ2FydGlzdC5wbmcnKTtcbiAgc2tpbi5ibG9ja3MgPSBza2luLmFzc2V0VXJsKCdibG9ja3MucG5nJyk7XG5cbiAgc2tpbi5hcHBsZSA9IHNraW4uYXNzZXRVcmwoJ2FwcGxlLnBuZycpO1xuICBza2luLnNtaWxleSA9IHNraW4uYXNzZXRVcmwoJ3NtaWxleS5wbmcnKTtcbiAgc2tpbi5zbmFpbCA9IHNraW4uYXNzZXRVcmwoJ3NuYWlsLnBuZycpO1xuICBza2luLmVsZXBoYW50ID0gc2tpbi5hc3NldFVybCgnZWxlcGhhbnQucG5nJyk7XG4gIHNraW4uZmlzaCA9IHNraW4uYXNzZXRVcmwoJ2Zpc2gucG5nJyk7XG4gIHNraW4uZG9nZ2llID0gc2tpbi5hc3NldFVybCgnZG9nZ2llLnBuZycpO1xuICBza2luLnRyZWUgPSBza2luLmFzc2V0VXJsKCd0cmVlLnBuZycpO1xuICBza2luLmZsb3dlciA9IHNraW4uYXNzZXRVcmwoJ2Zsb3dlci5wbmcnKTtcbiAgc2tpbi5ob3VzZSA9IHNraW4uYXNzZXRVcmwoJ2hvdXNlLnBuZycpO1xuICBza2luLmNvbXB1dGVyID0gc2tpbi5hc3NldFVybCgnY29tcHV0ZXIucG5nJyk7XG5cbiAgc2tpbi5ibGFuayA9IHNraW4uYXNzZXRVcmwoJ2JsYW5rLnBuZycpO1xuICBza2luLnNtYWxsU3RhdGljQXZhdGFyID0gc2tpbi5ibGFuaztcblxuICAvLyBTZXR0aW5nc1xuICBza2luLmJhY2tncm91bmQgPSBza2luLmFzc2V0VXJsKCdiYWNrZ3JvdW5kLnBuZycpO1xuXG4gIHJldHVybiBza2luO1xufTtcbiIsIi8qKlxuICogQmxvY2tseSBBcHA6IEppZ3Nhd1xuICpcbiAqIENvcHlyaWdodCAyMDEzIENvZGUub3JnXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0dWRpb0FwcCA9IHJlcXVpcmUoJy4uL1N0dWRpb0FwcCcpLnNpbmdsZXRvbjtcbnZhciBza2lucyA9IHJlcXVpcmUoJy4uL3NraW5zJyk7XG52YXIgQXBwVmlldyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9BcHBWaWV3LmpzeCcpO1xudmFyIHBhZ2UgPSByZXF1aXJlKCcuLi90ZW1wbGF0ZXMvcGFnZS5odG1sLmVqcycpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5hbWVzcGFjZSBmb3IgdGhlIGFwcGxpY2F0aW9uLlxuICovXG52YXIgSmlnc2F3ID0gbW9kdWxlLmV4cG9ydHM7XG5cbnZhciBsZXZlbDtcbnZhciBza2luO1xuXG52YXIgUmVzdWx0VHlwZSA9IHN0dWRpb0FwcC5SZXN1bHRUeXBlO1xudmFyIFRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLlRlc3RSZXN1bHRzO1xuXG5zdHVkaW9BcHAuc2V0Q2hlY2tGb3JFbXB0eUJsb2Nrcyh0cnVlKTtcblxuLy8gTmV2ZXIgYnVtcCBuZWlnaGJvcnMgZm9yIEppZ3Nhd1xuQmxvY2tseS5CVU1QX1VOQ09OTkVDVEVEID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHVzZUxhcmdlTm90Y2hlcygpIHtcbiAgdmFyIG5vdGNoSGVpZ2h0ID0gODtcbiAgdmFyIG5vdGNoV2lkdGhBID0gNjtcbiAgdmFyIG5vdGNoV2lkdGhCID0gMTA7XG5cbiAgQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX1dJRFRIID0gbm90Y2hXaWR0aEEgKiAyICsgbm90Y2hXaWR0aEI7XG4gIEJsb2NrbHkuQmxvY2tTdmcuTk9UQ0hfV0lEVEggPSA1MDtcblxuICB2YXIgbm90Y2hQYXRoTGVmdCA9ICdsICcgK1xuICAgIG5vdGNoV2lkdGhBICsgJywnICsgbm90Y2hIZWlnaHQgKyAnICcgK1xuICAgIG5vdGNoV2lkdGhCICsgJywwICcgK1xuICAgIG5vdGNoV2lkdGhBICsgJywtJyArIG5vdGNoSGVpZ2h0O1xuICB2YXIgbm90Y2hQYXRoUmlnaHQgPSAnbCAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQSArICcsJyArIG5vdGNoSGVpZ2h0ICsgJyAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQiArICcsMCAnICtcbiAgICAnLScgKyBub3RjaFdpZHRoQSArICcsLScgKyBub3RjaEhlaWdodDtcbiAgLy8gQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX0xFRlQgPSAnbCA2LDQgMywwIDYsLTQnO1xuICAvLyBCbG9ja2x5LkJsb2NrU3ZnLk5PVENIX1BBVEhfUklHSFQgPSAnbCAtNiw0IC0zLDAgLTYsLTQnO1xuXG4gIHZhciBub3RjaEhpZ2hsaWdodEhlaWdodCA9IG5vdGNoSGVpZ2h0OyAvLzQ7XG4gIHZhciBub3RjaEhpZ2hsaWdodFdpZHRoQSA9IG5vdGNoV2lkdGhBICsgMC41OyAvLzYuNTtcbiAgdmFyIG5vdGNoSGlnaGxpZ2h0V2lkdGhCID0gbm90Y2hXaWR0aEIgLSAxOyAvLzI7XG5cbiAgdmFyIG5vdGNoUGF0aExlZnRIaWdobGlnaHQgPSAnbCAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQSArICcsJyArIG5vdGNoSGlnaGxpZ2h0SGVpZ2h0ICsgJyAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQiArICcsMCAnICtcbiAgICBub3RjaEhpZ2hsaWdodFdpZHRoQSArICcsLScgKyBub3RjaEhpZ2hsaWdodEhlaWdodDtcbiAgLy8gQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9QQVRIX0xFRlRfSElHSExJR0hUID0gJ2wgNi41LDQgMiwwIDYuNSwtNCc7XG5cbiAgQmxvY2tseS5Db25uZWN0aW9uLk5PVENIX1BBVEhTX09WRVJSSURFID0ge1xuICAgIGxlZnQ6IG5vdGNoUGF0aExlZnQsXG4gICAgbGVmdEhpZ2hsaWdodDogbm90Y2hQYXRoTGVmdEhpZ2hsaWdodCxcbiAgICByaWdodDogbm90Y2hQYXRoUmlnaHRcbiAgfTtcblxufVxuXG5cbi8vIERlZmF1bHQgU2NhbGluZ3NcbkppZ3Nhdy5zY2FsZSA9IHtcbiAgJ3NuYXBSYWRpdXMnOiAxLFxuICAnc3RlcFNwZWVkJzogMzNcbn07XG5cbnZhciBsb2FkTGV2ZWwgPSBmdW5jdGlvbigpIHtcbiAgLy8gTG9hZCBtYXBzLlxuICAvLyBPdmVycmlkZSBzY2FsYXJzLlxuICBmb3IgKHZhciBrZXkgaW4gbGV2ZWwuc2NhbGUpIHtcbiAgICBKaWdzYXcuc2NhbGVba2V5XSA9IGxldmVsLnNjYWxlW2tleV07XG4gIH1cblxuICBKaWdzYXcuTUFaRV9XSURUSCA9IDA7XG4gIEppZ3Nhdy5NQVpFX0hFSUdIVCA9IDA7XG5cbiAgSmlnc2F3LmJsb2NrMUNsaWNrZWQgPSBmYWxzZTtcbn07XG5cbnZhciBkcmF3TWFwID0gZnVuY3Rpb24oKSB7XG4gIC8vIEhpZGUgdGhlIGxlZnQgY29sdW1uIGFuZCB0aGUgcmVzaXplIGJhci5cbiAgdmFyIHZpc3VhbGl6YXRpb25Db2x1bW4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvbkNvbHVtbicpO1xuICB2aXN1YWxpemF0aW9uQ29sdW1uLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHZhciB2aXN1YWxpemF0aW9uUmVzaXplQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Zpc3VhbGl6YXRpb25SZXNpemVCYXInKTtcbiAgdmlzdWFsaXphdGlvblJlc2l6ZUJhci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gIGlmIChsZXZlbC5naG9zdCkge1xuICAgIHZhciBibG9ja0NhbnZhcyA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0Q2FudmFzKCk7XG4gICAgQmxvY2tseS5jcmVhdGVTdmdFbGVtZW50KCdyZWN0Jywge1xuICAgICAgZmlsbDogXCJ1cmwoI3BhdF9cIiArIGxldmVsLmlkICsgXCJBKVwiLFxuICAgICAgXCJmaWxsLW9wYWNpdHlcIjogXCIwLjJcIixcbiAgICAgIHdpZHRoOiBsZXZlbC5pbWFnZS53aWR0aCxcbiAgICAgIGhlaWdodDogbGV2ZWwuaW1hZ2UuaGVpZ2h0LFxuICAgICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZShcIiArIGxldmVsLmdob3N0LnggKyBcIiwgXCIgK1xuICAgICAgICBsZXZlbC5naG9zdC55ICsgXCIpXCJcbiAgICB9LCBibG9ja0NhbnZhcywge1xuICAgICAgYmVmb3JlRXhpc3Rpbmc6IHRydWVcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIEJsb2NrbHkgYW5kIHRoZSBKaWdzYXcgYXBwLiAgQ2FsbGVkIG9uIHBhZ2UgbG9hZC5cbiAqL1xuSmlnc2F3LmluaXQgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgLy8gSmlnc2F3LmNsZWFyRXZlbnRIYW5kbGVyc0tpbGxUaWNrTG9vcCgpO1xuICBza2luID0gY29uZmlnLnNraW47XG4gIGxldmVsID0gY29uZmlnLmxldmVsO1xuICBsb2FkTGV2ZWwoKTtcblxuICBpZiAobGV2ZWwubGFyZ2VOb3RjaGVzKSB7XG4gICAgdXNlTGFyZ2VOb3RjaGVzKCk7XG4gIH1cbiAgQmxvY2tseS5TTkFQX1JBRElVUyA9IGxldmVsLnNuYXBSYWRpdXMgfHwgOTA7XG5cbiAgLy8gVE9ETyAoYnItcGFpcikgOiBJIHRoaW5rIHRoaXMgaXMgc29tZXRoaW5nIHRoYXQncyBoYXBwZW5pbmcgaW4gYWxsIGFwcHM/XG4gIGNvbmZpZy5sb2FkQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4ud2luU291bmQsICd3aW4nKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uc3RhcnRTb3VuZCwgJ3N0YXJ0Jyk7XG4gICAgc3R1ZGlvQXBwLmxvYWRBdWRpbyhza2luLmZhaWx1cmVTb3VuZCwgJ2ZhaWx1cmUnKTtcbiAgfTtcblxuICBjb25maWcuYWZ0ZXJJbmplY3QgPSBmdW5jdGlvbigpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgcmljaG5lc3Mgb2YgYmxvY2sgY29sb3VycywgcmVnYXJkbGVzcyBvZiB0aGUgaHVlLlxuICAgICAqIE1PT0MgYmxvY2tzIHNob3VsZCBiZSBicmlnaHRlciAodGFyZ2V0IGF1ZGllbmNlIGlzIHlvdW5nZXIpLlxuICAgICAqIE11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIDAgKGluY2x1c2l2ZSkgdG8gMSAoZXhjbHVzaXZlKS5cbiAgICAgKiBCbG9ja2x5J3MgZGVmYXVsdCBpcyAwLjQ1LlxuICAgICAqL1xuICAgIEJsb2NrbHkuSFNWX1NBVFVSQVRJT04gPSAwLjY7XG5cbiAgICBkcmF3TWFwKCk7XG4gIH07XG5cbiAgLy8gb25seSBoYXZlIHRyYXNoY2FuIGZvciBsZXZlbHMgd2l0aCB0b29sYm94XG4gIGNvbmZpZy50cmFzaGNhbiA9ICEhbGV2ZWwudG9vbGJveDtcbiAgY29uZmlnLnNjcm9sbGJhcnMgPSBmYWxzZTtcblxuICBjb25maWcuZW5hYmxlU2hvd0NvZGUgPSBmYWxzZTtcbiAgY29uZmlnLmVuYWJsZVNob3dCbG9ja0NvdW50ID0gZmFsc2U7XG5cbiAgdmFyIHJlbmRlckNvZGVBcHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHBhZ2Uoe1xuICAgICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbG9jYWxlRGlyZWN0aW9uOiBzdHVkaW9BcHAubG9jYWxlRGlyZWN0aW9uKCksXG4gICAgICAgIGNvbnRyb2xzOiByZXF1aXJlKCcuL2NvbnRyb2xzLmh0bWwuZWpzJykoe2Fzc2V0VXJsOiBzdHVkaW9BcHAuYXNzZXRVcmx9KSxcbiAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzczogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgb25Nb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgSmlnc2F3LnN1Y2Nlc3NMaXN0ZW5lciA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3IuYWRkQ2hhbmdlTGlzdGVuZXIoZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBjaGVja0ZvclN1Y2Nlc3MoKTtcbiAgICB9KTtcblxuICAgIC8vIE9ubHkgdXNlZCBieSBsZXZlbDEsIGluIHdoaWNoIHRoZSBzdWNjZXNzIGNyaXRlcmlhIGlzIGNsaWNraW5nIG9uIHRoZSBibG9ja1xuICAgIHZhciBibG9jazEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2Jsb2NrLWlkPScxJ11cIilbMF07XG4gICAgaWYgKGJsb2NrMSkge1xuICAgICAgZG9tLmFkZE1vdXNlRG93blRvdWNoRXZlbnQoYmxvY2sxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEppZ3Nhdy5ibG9jazFDbGlja2VkID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBSZWFjdC5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICByZXF1aXJlTGFuZHNjYXBlOiAhKGNvbmZpZy5zaGFyZSB8fCBjb25maWcuZW1iZWQpLFxuICAgIHJlbmRlckNvZGVBcHA6IHJlbmRlckNvZGVBcHAsXG4gICAgb25Nb3VudDogb25Nb3VudFxuICB9KSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmNvbnRhaW5lcklkKSk7XG59O1xuXG5mdW5jdGlvbiBjaGVja0ZvclN1Y2Nlc3MoKSB7XG4gIHZhciBzdWNjZXNzID0gbGV2ZWwuZ29hbC5zdWNjZXNzQ29uZGl0aW9uKCk7XG4gIGlmIChzdWNjZXNzKSB7XG4gICAgQmxvY2tseS5yZW1vdmVDaGFuZ2VMaXN0ZW5lcihKaWdzYXcuc3VjY2Vzc0xpc3RlbmVyKTtcblxuICAgIEppZ3Nhdy5yZXN1bHQgPSBSZXN1bHRUeXBlLlNVQ0NFU1M7XG4gICAgSmlnc2F3Lm9uUHV6emxlQ29tcGxldGUoKTtcbiAgfVxufVxuXG4vKipcbiAqIEFwcCBzcGVjaWZpYyBkaXNwbGF5RmVlZGJhY2sgZnVuY3Rpb24gdGhhdCBjYWxscyBpbnRvXG4gKiBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xudmFyIGRpc3BsYXlGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIUppZ3Nhdy53YWl0aW5nRm9yUmVwb3J0KSB7XG4gICAgc3R1ZGlvQXBwLmRpc3BsYXlGZWVkYmFjayh7XG4gICAgICBhcHA6ICdKaWdzYXcnLFxuICAgICAgc2tpbjogc2tpbi5pZCxcbiAgICAgIGZlZWRiYWNrVHlwZTogSmlnc2F3LnRlc3RSZXN1bHRzLFxuICAgICAgcmVzcG9uc2U6IEppZ3Nhdy5yZXNwb25zZSxcbiAgICAgIGxldmVsOiBsZXZlbFxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBzZXJ2aWNlIHJlcG9ydCBjYWxsIGlzIGNvbXBsZXRlXG4gKiBAcGFyYW0ge29iamVjdH0gSlNPTiByZXNwb25zZSAoaWYgYXZhaWxhYmxlKVxuICovXG5KaWdzYXcub25SZXBvcnRDb21wbGV0ZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gIEppZ3Nhdy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBKaWdzYXcud2FpdGluZ0ZvclJlcG9ydCA9IGZhbHNlO1xuICBzdHVkaW9BcHAub25SZXBvcnRDb21wbGV0ZShyZXNwb25zZSk7XG4gIGRpc3BsYXlGZWVkYmFjaygpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIHRoZSB1c2VyJ3MgY29kZS4gIEhlYXZlbiBoZWxwIHVzLi4uXG4gKi9cbkppZ3Nhdy5leGVjdXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGV4ZWN1dGUgaXMgYSBuby1vcCBmb3Igamlnc2F3XG59O1xuXG5KaWdzYXcub25QdXp6bGVDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIElmIHdlIGtub3cgdGhleSBzdWNjZWVkZWQsIG1hcmsgbGV2ZWxDb21wbGV0ZSB0cnVlXG4gIC8vIE5vdGUgdGhhdCB3ZSBoYXZlIG5vdCB5ZXQgYW5pbWF0ZWQgdGhlIHN1Y2Nlc2Z1bCBydW5cbiAgdmFyIGxldmVsQ29tcGxldGUgPSAoSmlnc2F3LnJlc3VsdCA9PSBSZXN1bHRUeXBlLlNVQ0NFU1MpO1xuXG4gIEppZ3Nhdy50ZXN0UmVzdWx0cyA9IHN0dWRpb0FwcC5nZXRUZXN0UmVzdWx0cyhsZXZlbENvbXBsZXRlLCB7XG4gICAgYWxsb3dUb3BCbG9ja3M6IHRydWVcbiAgfSk7XG5cbiAgaWYgKEppZ3Nhdy50ZXN0UmVzdWx0cyA+PSBUZXN0UmVzdWx0cy5GUkVFX1BMQVkpIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCd3aW4nKTtcbiAgfSBlbHNlIHtcbiAgICBzdHVkaW9BcHAucGxheUF1ZGlvKCdmYWlsdXJlJyk7XG4gIH1cblxuICB2YXIgeG1sID0gQmxvY2tseS5YbWwuYmxvY2tTcGFjZVRvRG9tKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UpO1xuICB2YXIgdGV4dEJsb2NrcyA9IEJsb2NrbHkuWG1sLmRvbVRvVGV4dCh4bWwpO1xuXG4gIEppZ3Nhdy53YWl0aW5nRm9yUmVwb3J0ID0gdHJ1ZTtcblxuICAvLyBSZXBvcnQgcmVzdWx0IHRvIHNlcnZlci5cbiAgc3R1ZGlvQXBwLnJlcG9ydCh7XG4gICAgIGFwcDogJ0ppZ3NhdycsXG4gICAgIGxldmVsOiBsZXZlbC5pZCxcbiAgICAgcmVzdWx0OiBKaWdzYXcucmVzdWx0ID09PSBSZXN1bHRUeXBlLlNVQ0NFU1MsXG4gICAgIHRlc3RSZXN1bHQ6IEppZ3Nhdy50ZXN0UmVzdWx0cyxcbiAgICAgcHJvZ3JhbTogZW5jb2RlVVJJQ29tcG9uZW50KHRleHRCbG9ja3MpLFxuICAgICBvbkNvbXBsZXRlOiBKaWdzYXcub25SZXBvcnRDb21wbGV0ZVxuICB9KTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cz0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdCA9IGZ1bmN0aW9uIGFub255bW91cyhsb2NhbHMsIGZpbHRlcnMsIGVzY2FwZVxuLyoqLykge1xuZXNjYXBlID0gZXNjYXBlIHx8IGZ1bmN0aW9uIChodG1sKXtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mKD8hXFx3KzspL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpO1xufTtcbnZhciBidWYgPSBbXTtcbndpdGggKGxvY2FscyB8fCB7fSkgeyAoZnVuY3Rpb24oKXsgXG4gYnVmLnB1c2goJycpOzE7IHZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpIDsgYnVmLnB1c2goJ1xcbicpOyB9KSgpO1xufSBcbnJldHVybiBidWYuam9pbignJyk7XG59O1xuICByZXR1cm4gZnVuY3Rpb24obG9jYWxzKSB7XG4gICAgcmV0dXJuIHQobG9jYWxzLCByZXF1aXJlKFwiZWpzXCIpLmZpbHRlcnMpO1xuICB9XG59KCkpOyIsIi8qKlxuICogQmxvY2tseSBBcHA6IEppZ3Nhd1xuICpcbiAqIENvcHlyaWdodCAyMDEzIENvZGUub3JnXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtc2cgPSByZXF1aXJlKCcuL2xvY2FsZScpO1xudmFyIGRvbSA9IHJlcXVpcmUoJy4uL2RvbScpO1xudmFyIGxldmVscyA9IHJlcXVpcmUoJy4vbGV2ZWxzJyk7XG5cbnZhciBwYXR0ZXJuQ2FjaGUgPSB7XG4gIHF1ZXVlZDogW10sXG4gIGNyZWF0ZWQ6IHt9LFxuXG4gIC8qKlxuICAgKiBTdGljayBhbiBpdGVtIGluIG91ciBxdWV1ZVxuICAgKi9cbiAgYWRkVG9RdWV1ZTogZnVuY3Rpb24gKHBhdHRlcm5JbmZvKSB7XG4gICAgdGhpcy5xdWV1ZWQucHVzaChwYXR0ZXJuSW5mbyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZCBhbGwgdGhlIHN2ZyBwYXR0ZXJucyB3ZSd2ZSBxdWV1ZWQgdXAuXG4gICAqL1xuICBhZGRRdWV1ZWRQYXR0ZXJuczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucXVldWVkLmZvckVhY2goZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICAgIGFkZFBhdHRlcm4ocGF0dGVybi5pZCwgcGF0dGVybi5pbWFnZVBhdGgsIHBhdHRlcm4ud2lkdGgsIHBhdHRlcm4uaGVpZ2h0LFxuICAgICAgICBwYXR0ZXJuLm9mZnNldFgsIHBhdHRlcm4ub2Zmc2V0WSk7XG4gICAgfSk7XG4gICAgdGhpcy5xdWV1ZWQgPSBbXTtcbiAgfSxcblxuICAvKipcbiAgICogSGF2ZSB3ZSBhbHJlYWR5IGNyZWF0ZWQgYW4gc3ZnIGVsZW1lbnQgZm9yIHRoaXMgcGF0dGVybkluZm8/ICBUaHJvd3MgaWZcbiAgICogd2UgYXNrIHdpdGggYSBwYXR0ZXJuSW5mbyB0aGF0IGhhcyB0aGUgc2FtZSBpZCBidXQgZGlmZmVyZW50IGF0dHJpYnV0ZXMuXG4gICAqL1xuICB3YXNDcmVhdGVkOiBmdW5jdGlvbiAocGF0dGVybkluZm8pIHtcbiAgICB2YXIgZXF1YWwgPSB0cnVlO1xuICAgIHZhciBjYWNoZWQgPSB0aGlzLmNyZWF0ZWRbcGF0dGVybkluZm8uaWRdO1xuICAgIGlmICghY2FjaGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMocGF0dGVybkluZm8pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHBhdHRlcm5JbmZvW2tleV0gIT09IGNhY2hlZFtrZXldKSB7XG4gICAgICAgIGVxdWFsID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFlcXVhbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgYWRkIGF0dHJpYnV0ZSBvZiBzYW1lIGlkIHdpdGggZGlmZmVyZW50IGF0dHJpYnV0ZXNcIik7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBNYXJrIHRoYXQgd2UndmUgY3JlYXRlZCBhbiBzdmcgcGF0dGVyblxuICAgKi9cbiAgbWFya0NyZWF0ZWQ6IGZ1bmN0aW9uIChwYXR0ZXJuSW5mbykge1xuICAgIGlmICh0aGlzLmNyZWF0ZWRbcGF0dGVybkluZm8uaWRdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FscmVhZHkgaGF2ZSBjYWNoZWQgaXRlbSB3aXRoIGlkOiAnICsgcGF0dGVybkluZm8uaWQpO1xuICAgIH1cbiAgICB0aGlzLmNyZWF0ZWRbcGF0dGVybkluZm8uaWRdID0gcGF0dGVybkluZm87XG4gIH1cblxufTtcblxudmFyIHBhdHRlcm5zID0gW107XG52YXIgY3JlYXRlZFBhdHRlcm5zID0ge307XG5cbi8qKlxuICogQWRkIGFuIHN2ZyBwYXR0ZXJuIGZvciB0aGUgZ2l2ZW4gaW1hZ2UuIElmIGRvY3VtZW50IGlzIG5vdCB5ZXQgZnVsbHkgbG9hZGVkLFxuICogaXQgd2lsbCBhZGQgdGhlIHBhdHRlcm4gdG8gYSBsaXN0IGZvciBsYXRlci5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgUGF0dGVybiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaW1hZ2VQYXRoIFVybCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB0aGUgaW1hZ2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIHtudW1iZXJ8ZnVuY3Rpb259IG9mZnNldFggT2Zmc2V0IG9mIHRoZSBpbWFnZSB0byBzdGFydCBwYXR0ZXJuXG4gKiBAcGFyYW0ge251bWJlcnxmdW5jdGlvbn0gb2Zmc2V0WSBPZmZzZXQgb2YgdGhlIGltYWdlIHRvIHN0YXJ0IHBhdHRlcm5cbiAqL1xudmFyIGFkZFBhdHRlcm4gPSBmdW5jdGlvbiAoaWQsIGltYWdlUGF0aCwgd2lkdGgsIGhlaWdodCwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICB2YXIgeCwgeSwgcGF0dGVybiwgcGF0dGVybkltYWdlO1xuICB2YXIgcGF0dGVybkluZm8gPSB7XG4gICAgaWQ6IGlkLFxuICAgIGltYWdlUGF0aDogaW1hZ2VQYXRoLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICBvZmZzZXRYOiBvZmZzZXRYLFxuICAgIG9mZnNldFk6IG9mZnNldFlcbiAgfTtcblxuICAvLyBJZiB3ZSBkb24ndCB5ZXQgaGF2ZSBhbiBzdmdEZWZzLCBxdWV1ZSB0aGUgcGF0dGVybiBhbmQgd2FpdCB1bnRpbCB3ZSBkb1xuICB2YXIgc3ZnRGVmcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2x5U3ZnRGVmcycpO1xuICBpZiAoIXN2Z0RlZnMpIHtcbiAgICBwYXR0ZXJuQ2FjaGUuYWRkVG9RdWV1ZShwYXR0ZXJuSW5mbyk7XG4gIH0gZWxzZSBpZiAoIXBhdHRlcm5DYWNoZS53YXNDcmVhdGVkKHBhdHRlcm5JbmZvKSkge1xuICAgIC8vIGFkZCB0aGUgcGF0dGVyblxuICAgIHggPSB0eXBlb2Yob2Zmc2V0WCkgPT09IFwiZnVuY3Rpb25cIiA/IC1vZmZzZXRYKCkgOiAtb2Zmc2V0WDtcbiAgICB5ID0gdHlwZW9mKG9mZnNldFkpID09PSBcImZ1bmN0aW9uXCIgPyAtb2Zmc2V0WSgpIDogLW9mZnNldFk7XG4gICAgcGF0dGVybiA9IEJsb2NrbHkuY3JlYXRlU3ZnRWxlbWVudCgncGF0dGVybicsIHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHBhdHRlcm5Vbml0czogJ3VzZXJTcGFjZU9uVXNlJyxcbiAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgeDogeCxcbiAgICAgIHk6IHlcbiAgICB9LCBzdmdEZWZzKTtcbiAgICBwYXR0ZXJuSW1hZ2UgPSBCbG9ja2x5LmNyZWF0ZVN2Z0VsZW1lbnQoJ2ltYWdlJywge1xuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9LCBwYXR0ZXJuKTtcbiAgICBwYXR0ZXJuSW1hZ2Uuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAneGxpbms6aHJlZicsXG4gICAgICBpbWFnZVBhdGgpO1xuXG4gICAgcGF0dGVybkNhY2hlLm1hcmtDcmVhdGVkKHBhdHRlcm5JbmZvKTtcbiAgfVxuICByZXR1cm4gaWQ7XG59O1xuXG4vKipcbiAqIFNlYXJjaCB0aGUgd29ya3NwYWNlIGZvciBhIGJsb2NrIG9mIHRoZSBnaXZlbiB0eXBlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGUgVGhlIHR5cGUgb2YgdGhlIGJsb2NrIHRvIHNlYXJjaCBmb3JcbiAqL1xudmFyIGJsb2NrT2ZUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdmFyIGJsb2NrcyA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0QWxsQmxvY2tzKCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGJsb2Nrc1tpXS50eXBlID09PSB0eXBlKSB7XG4gICAgICByZXR1cm4gYmxvY2tzW2ldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB3aWR0aCBvZiB0aGUgYmxvY2sgb2YgdGhlIGdpdmVuIHR5cGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgYmxvY2sgdG8gc2VhcmNoIGZvclxuICovXG52YXIgYmxvY2tXaWR0aCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiBibG9ja09mVHlwZSh0eXBlKS5nZXRIZWlnaHRXaWR0aCgpLndpZHRoO1xufTtcblxuZnVuY3Rpb24gYWRkUXVldWVkV2hlblJlYWR5KCkge1xuICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibG9ja2x5U3ZnRGVmcycpKSB7XG4gICAgc2V0VGltZW91dChhZGRRdWV1ZWRXaGVuUmVhZHksIDEwMCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHBhdHRlcm5DYWNoZS5hZGRRdWV1ZWRQYXR0ZXJucygpO1xufVxuXG5cbi8vIEluc3RhbGwgZXh0ZW5zaW9ucyB0byBCbG9ja2x5J3MgbGFuZ3VhZ2UgYW5kIEphdmFTY3JpcHQgZ2VuZXJhdG9yLlxuZXhwb3J0cy5pbnN0YWxsID0gZnVuY3Rpb24oYmxvY2tseSwgYmxvY2tJbnN0YWxsT3B0aW9ucykge1xuICB2YXIgc2tpbiA9IGJsb2NrSW5zdGFsbE9wdGlvbnMuc2tpbjtcbiAgLy8gY291bGQgbWFrZSB0aGlzIHNldHRhYmxlIG9uIHRoZSBsZXZlbCBpZiBJIG5lZWRcbiAgdmFyIEhTViA9IFswLCAxLjAwLCAwLjk4XTtcblxuICB2YXIgZXhpc3RpbmdCbG9ja3MgPSBPYmplY3Qua2V5cyhibG9ja2x5LkJsb2Nrcyk7XG5cbiAgT2JqZWN0LmtleXMobGV2ZWxzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBsZXZlbCA9IGxldmVsc1trZXldO1xuICAgIGdlbmVyYXRlSmlnc2F3QmxvY2tzRm9yTGV2ZWwoYmxvY2tseSwgc2tpbiwge1xuICAgICAgaW1hZ2U6IHNraW5bbGV2ZWwuaW1hZ2UubmFtZV0sXG4gICAgICBIU1Y6IGxldmVsLmJhY2tncm91bmRIU1YgfHwgSFNWLFxuICAgICAgd2lkdGg6IGxldmVsLmltYWdlLndpZHRoLFxuICAgICAgaGVpZ2h0OiBsZXZlbC5pbWFnZS5oZWlnaHQsXG4gICAgICBudW1CbG9ja3M6IGxldmVsLm51bUJsb2NrcyxcbiAgICAgIG5vdGNoZWRFbmRzOiBsZXZlbC5ub3RjaGVkRW5kcyxcbiAgICAgIGxldmVsOiBrZXlcbiAgICB9KTtcblxuICAgIGlmIChsZXZlbC5udW1CbG9ja3MgPT09IDApIHtcbiAgICAgIC8vIHN0aWxsIHdhbnQgdGhlIHBhdHRlcm4gZm9yIHRoZSBnaG9zdFxuICAgICAgdmFyIHBhdHRlcm5OYW1lID0gJ3BhdF8nICsgbGV2ZWwuaWQgKyAnQSc7XG4gICAgICBhZGRQYXR0ZXJuKHBhdHRlcm5OYW1lLCBza2luW2xldmVsLmltYWdlLm5hbWVdLCBsZXZlbC5pbWFnZS53aWR0aCxcbiAgICAgICAgbGV2ZWwuaW1hZ2UuaGVpZ2h0LCAwLCAwKTtcbiAgICB9XG4gIH0pO1xuXG4gIGdlbmVyYXRlQmxhbmtCbG9jayhibG9ja2x5LCBza2luLCAnamlnc2F3X3JlcGVhdCcsIFszMjIsIDAuOTAsIDAuOTVdLCAxMDAsIHRydWUpO1xuICBnZW5lcmF0ZUJsYW5rQmxvY2soYmxvY2tseSwgc2tpbiwgJ2ppZ3Nhd19ncmVlbicsIFsxNDAsIDEuMDAsIDAuNzRdLCA4MCk7XG4gIGdlbmVyYXRlQmxhbmtCbG9jayhibG9ja2x5LCBza2luLCAnamlnc2F3X2JsdWUnLCBbMTg0LCAxLjAwLCAwLjc0XSwgODApO1xuICBnZW5lcmF0ZUJsYW5rQmxvY2soYmxvY2tseSwgc2tpbiwgJ2ppZ3Nhd19wdXJwbGUnLCBbMzEyLCAwLjMyLCAwLjYyXSwgODApO1xuXG4gIC8vIEdvIHRocm91Z2ggYWxsIGFkZGVkIGJsb2NrcywgYW5kIGFkZCBlbXB0eSBnZW5lcmF0b3JzIGZvciB0aG9zZSB0aGF0XG4gIC8vIHdlcmVuJ3QgYWxyZWFkeSBnaXZlbiBnZW5lcmF0b3JzXG4gIHZhciBnZW5lcmF0b3IgPSBibG9ja2x5LkdlbmVyYXRvci5nZXQoJ0phdmFTY3JpcHQnKTtcbiAgYmxvY2tseS5KYXZhU2NyaXB0ID0gZ2VuZXJhdG9yO1xuICBPYmplY3Qua2V5cyhibG9ja2x5LkJsb2NrcykuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2spIHtcbiAgICBpZiAoZXhpc3RpbmdCbG9ja3MuaW5kZXhPZihibG9jaykgPT09IC0xICYmICFnZW5lcmF0b3JbYmxvY2tdKSB7XG4gICAgICBnZW5lcmF0b3JbYmxvY2tdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ1xcbic7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG5cbiAgYWRkUXVldWVkV2hlblJlYWR5KCk7XG5cbiAgZGVsZXRlIGJsb2NrbHkuQmxvY2tzLnByb2NlZHVyZXNfZGVmcmV0dXJuO1xuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19pZnJldHVybjtcbn07XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQmxhbmtCbG9jayhibG9ja2x5LCBza2luLCBuYW1lLCBoc3YsIHdpZHRoLCBoYXNBcHBlbmQpIHtcbiAgYmxvY2tseS5CbG9ja3NbbmFtZV0gPSB7XG4gICAgaGVscFVybDogJycsXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRIU1YuYXBwbHkodGhpcywgaHN2KTtcbiAgICAgIHRoaXMuYXBwZW5kRHVtbXlJbnB1dCgpXG4gICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uYmxhbmssIHdpZHRoLCA1NCkpO1xuICAgICAgdGhpcy5zZXRQcmV2aW91c1N0YXRlbWVudCh0cnVlKTtcbiAgICAgIGlmIChoYXNBcHBlbmQpIHtcbiAgICAgICAgdGhpcy5hcHBlbmRTdGF0ZW1lbnRJbnB1dCgnY2hpbGQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0TmV4dFN0YXRlbWVudCh0cnVlKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlSmlnc2F3QmxvY2tzRm9yTGV2ZWwoYmxvY2tseSwgc2tpbiwgb3B0aW9ucykge1xuICB2YXIgaW1hZ2UgPSBvcHRpb25zLmltYWdlO1xuICB2YXIgd2lkdGggPSBvcHRpb25zLndpZHRoO1xuICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gIHZhciBudW1CbG9ja3MgPSBvcHRpb25zLm51bUJsb2NrcztcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5sZXZlbDtcbiAgdmFyIEhTViA9IG9wdGlvbnMuSFNWO1xuICAvLyBpZiB0cnVlLCBmaXJzdC9sYXN0IGJsb2NrIHdpbGwgc3RpbGwgaGF2ZSBwcmV2aW91cy9uZXh0IG5vdGNoZXNcbiAgdmFyIG5vdGNoZWRFbmRzID0gb3B0aW9ucy5ub3RjaGVkRW5kcztcblxuICB2YXIgYmxvY2tIZWlnaHQgPSBoZWlnaHQgLyBudW1CbG9ja3M7XG4gIHZhciB0aXRsZVdpZHRoID0gd2lkdGggLSAyMDtcbiAgdmFyIHRpdGxlSGVpZ2h0ID0gYmxvY2tIZWlnaHQgLSAxMDtcblxuICB2YXIgbGV0dGVycyA9ICctQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlQmxvY2soYmxvY2tOdW0pIHtcbiAgICB2YXIgYmxvY2tOYW1lID0gJ2ppZ3Nhd18nICsgbGV2ZWwgKyBsZXR0ZXJzW2Jsb2NrTnVtXTtcbiAgICB2YXIgcGF0dGVybk5hbWUgPSAncGF0XycgKyBsZXZlbCArIGxldHRlcnNbYmxvY2tOdW1dO1xuICAgIGJsb2NrbHkuQmxvY2tzW2Jsb2NrTmFtZV0gPSB7XG4gICAgICBoZWxwVXJsOiAnJyxcbiAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRIU1YuYXBwbHkodGhpcywgSFNWKTtcbiAgICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgICAuYXBwZW5kVGl0bGUobmV3IGJsb2NrbHkuRmllbGRJbWFnZShza2luLmJsYW5rLCB0aXRsZVdpZHRoLCB0aXRsZUhlaWdodCkpO1xuICAgICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KGJsb2NrTnVtICE9PSAxIHx8IG5vdGNoZWRFbmRzKTtcbiAgICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KGJsb2NrTnVtICE9PSBudW1CbG9ja3MgfHwgbm90Y2hlZEVuZHMpO1xuICAgICAgICB0aGlzLnNldEZpbGxQYXR0ZXJuKFxuICAgICAgICAgIGFkZFBhdHRlcm4ocGF0dGVybk5hbWUsIGltYWdlLCB3aWR0aCwgaGVpZ2h0LCAwLFxuICAgICAgICAgICAgYmxvY2tIZWlnaHQgKiAoYmxvY2tOdW0gLSAxKSkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmb3IgKHZhciBpID0gMTsgaSA8PSBudW1CbG9ja3M7IGkrKykge1xuICAgIGdlbmVyYXRlQmxvY2soaSk7XG4gIH1cbn1cbiIsIi8vIGxvY2FsZSBmb3Igamlnc2F3XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmJsb2NrbHkuamlnc2F3X2xvY2FsZTtcbiIsIi8qanNoaW50IG11bHRpc3RyOiB0cnVlICovXG5cbnZhciBjcmVhdGVUb29sYm94ID0gcmVxdWlyZSgnLi4vYmxvY2tfdXRpbHMnKS5jcmVhdGVUb29sYm94O1xuXG52YXIgamlnc2F3QmxvY2sgPSBmdW5jdGlvbiAodHlwZSwgeCwgeSwgY2hpbGQsIGNoaWxkVHlwZSkge1xuICByZXR1cm4gamlnc2F3QmxvY2tXaXRoRGVsZXRhYmxlQXR0cih0eXBlLCB4LCB5LCBjaGlsZCwgY2hpbGRUeXBlLCB0cnVlKTtcbn07XG5cbnZhciB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrID0gZnVuY3Rpb24gKHR5cGUsIHgsIHksIGNoaWxkLCBjaGlsZFR5cGUpIHtcbiAgcmV0dXJuIGppZ3Nhd0Jsb2NrV2l0aERlbGV0YWJsZUF0dHIodHlwZSwgeCwgeSwgY2hpbGQsIGNoaWxkVHlwZSwgZmFsc2UpO1xufTtcblxudmFyIGppZ3Nhd0Jsb2NrV2l0aERlbGV0YWJsZUF0dHIgPSBmdW5jdGlvbiAodHlwZSwgeCwgeSwgY2hpbGQsIGNoaWxkVHlwZSwgZGVsZXRhYmxlKSB7XG4gIHZhciBjaGlsZEF0dHIgPSAnJztcbiAgeCA9IHggfHwgMDtcbiAgeSA9IHkgfHwgMDtcbiAgY2hpbGRUeXBlID0gY2hpbGRUeXBlIHx8IFwibmV4dFwiO1xuICBpZiAoY2hpbGRUeXBlID09PSAnc3RhdGVtZW50Jykge1xuICAgIGNoaWxkQXR0ciA9IFwiIG5hbWU9J2NoaWxkJ1wiO1xuICB9XG4gIHJldHVybiAnPGJsb2NrIHR5cGU9XCInICsgdHlwZSArICdcIiBkZWxldGFibGU9XCInICsgZGVsZXRhYmxlICsgJ1wiJyArXG4gICAgJyB4PVwiJyArIHggKyAnXCInICtcbiAgICAnIHk9XCInICsgeSArICdcIj4nICtcbiAgICAoY2hpbGQgPyAnPCcgKyBjaGlsZFR5cGUgKyBjaGlsZEF0dHIgKyAnPicgKyBjaGlsZCArICc8LycgKyBjaGlsZFR5cGUgKyAnPicgOiAnJykgK1xuICAgICc8L2Jsb2NrPic7XG59O1xuXG4vKipcbiAqIFZhbGlkYXRlcyB3aGV0aGVyIHB1enpsZSBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcHV0IHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nW119IGxpc3Qgb2YgdHlwZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLmxldmVsIExldmVsIG51bWJlclxuICogQFBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubnVtQmxvY2tzIEhvdyBtYW55IGJsb2NrcyB0aGVyZSBhcmUgaW4gdGhlIGxldmVsXG4gKi9cbnZhciB2YWxpZGF0ZVNpbXBsZVB1enpsZSA9IGZ1bmN0aW9uICh0eXBlcywgb3B0aW9ucykge1xuICB2YXIgbnVtQmxvY2tzO1xuICBpZiAodHlwZXMpIHtcbiAgICBudW1CbG9ja3MgPSB0eXBlcy5sZW5ndGg7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxldHRlcnMgPSAnLUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJztcbiAgICB2YXIgbGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuICAgIG51bUJsb2NrcyA9IG9wdGlvbnMubnVtQmxvY2tzO1xuXG4gICAgdHlwZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBudW1CbG9ja3M7IGkrKykge1xuICAgICAgdHlwZXMucHVzaCgnamlnc2F3XycgKyBsZXZlbCArIGxldHRlcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciByb290cyA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0VG9wQmxvY2tzKCk7XG4gIGlmIChyb290cy5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgZGVwdGggPSAwO1xuICB2YXIgYmxvY2sgPSByb290c1swXTtcbiAgd2hpbGUgKGRlcHRoIDwgbnVtQmxvY2tzKSB7XG4gICAgaWYgKCFibG9jayB8fCBibG9jay50eXBlICE9PSB0eXBlc1tkZXB0aF0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGNoaWxkcmVuID0gYmxvY2suZ2V0Q2hpbGRyZW4oKTtcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBibG9jayA9IGNoaWxkcmVuWzBdO1xuICAgIGRlcHRoKys7XG4gIH1cblxuICAvLyBsYXN0IGJsb2NrIHNob3VsZG50IGhhdmUgY2hpbGRyZW5cbiAgaWYgKGJsb2NrICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qXG4gKiBDb25maWd1cmF0aW9uIGZvciBhbGwgbGV2ZWxzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAnMSc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnYXBwbGUnLFxuICAgIGFuaUdpZlVSTDogJy9zY3JpcHRfYXNzZXRzL2tfMV9pbWFnZXMvaW5zdHJ1Y3Rpb25fZ2lmcy9jbGljay1ibG9jay5naWYnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdhcHBsZScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFs0MSwgMS4wMCwgMC45NjldLFxuICAgIG51bUJsb2NrczogMSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBKaWdzYXcuYmxvY2sxQ2xpY2tlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzFBJywgMjAsIDIwKVxuICB9LFxuICAnMic6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnc21pbGV5JyxcbiAgICBhbmlHaWZVUkw6ICcvc2NyaXB0X2Fzc2V0cy9rXzFfaW1hZ2VzL2luc3RydWN0aW9uX2dpZnMvZHJhZy1kcm9wLmdpZicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ3NtaWxleScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsxODQsIDEuMDAsIDAuNzMzXSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDEsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBuZWVkIHRvIGJlIGZpbmlzaGVkIGRyYWdcbiAgICAgICAgaWYgKEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZHJhZ01vZGUpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBvcyA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2UuZ2V0QWxsQmxvY2tzKClbMF0uZ2V0UmVsYXRpdmVUb1N1cmZhY2VYWSgpO1xuICAgICAgICAvLyBob3cgY2xvc2UgdG8gZ2hvc3Q/XG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKDQwMCAtIHBvcy54KTtcbiAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnMoMTAwIC0gcG9zLnkpO1xuICAgICAgICByZXR1cm4gZHggKyBkeSA8IDgwO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfMkEnLCAyMCwgMjApXG4gIH0sXG4gICczJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdzbmFpbCcsXG4gICAgYW5pR2lmVVJMOiAnL3NjcmlwdF9hc3NldHMva18xX2ltYWdlcy9pbnN0cnVjdGlvbl9naWZzL2RyYWctY29ubmVjdC5naWYnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdzbmFpbCcsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFszNiwgMS4wMCwgMC45OTldLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMixcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDMsIG51bUJsb2NrczogMn0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfM0EnLCA0MDAsIDEwMCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzNCJywgMTAwLCAyMjApXG4gIH0sXG5cbiAgJzQnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2VsZXBoYW50JyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnZWxlcGhhbnQnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMzIwLCAwLjYwLCAwLjk5OV0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAyLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogNCwgbnVtQmxvY2tzOiAyfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd180QScsIDEwMCwgMTQwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNEInLCA0MDAsIDIwMClcbiAgfSxcblxuICAnNSc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnZmlzaCcsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2Zpc2gnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMjA5LCAwLjU3LCAwLjYwMF0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogNSwgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd181QScsIDEwMCwgMjApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd181QicsIDEwMCwgMTQwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNUMnLCAxMDAsIDI4MClcbiAgfSxcblxuICAnNic6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnZG9nZ2llJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnZG9nZ2llJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzI1LCAwLjU3LCAwLjk2MF0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogNiwgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd182QicsIDEwMCwgMjApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd182QScsIDEwMCwgMTQwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfNkMnLCAxMDAsIDI4MClcbiAgfSxcblxuICAnNyc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAndHJlZScsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ3RyZWUnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMjM4LCAwLjUxLCAwLjk5OV0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogNywgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd183QicsIDEwMCwgMjApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd183QScsIDEwMCwgMTQwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfN0MnLCAxMDAsIDI4MClcbiAgfSxcblxuICAnOCc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnZmxvd2VyJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnZmxvd2VyJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzc1LCAwLjgwLCAwLjk5OV0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogOCwgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd184QycsIDEwMCwgMjApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd184QicsIDEwMCwgMTQwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOEEnLCAxMDAsIDI4MClcbiAgfSxcblxuICAnOSc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnaG91c2UnLFxuICAgIGFuaUdpZlVSTDogJy9zY3JpcHRfYXNzZXRzL2tfMV9pbWFnZXMvaW5zdHJ1Y3Rpb25fZ2lmcy9kcmFnLWRpc29yZGVyZWQuZ2lmJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnaG91c2UnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMTEwLCAwLjU2LCAwLjYwXSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA5LCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzlCJywgMTAwLCAyMCxcbiAgICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzlDJywgMCwgMCxcbiAgICAgICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOUEnLCAwLCAwKSkpXG4gIH0sXG5cbiAgJzEwJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdjb21wdXRlcicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2NvbXB1dGVyJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzMwMCwgMC4yNSwgMC44MF0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogMTAsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTBBJywgMTAwLCAyMCxcbiAgICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzEwQycsIDAsIDAsXG4gICAgICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzEwQicsIDAsIDApKSlcbiAgfSxcblxuICAnMTEnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2Jsb2NrcycsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2Jsb2NrcycsXG4gICAgICB3aWR0aDogMTMxLFxuICAgICAgaGVpZ2h0OiAyODZcbiAgICB9LFxuICAgIGdob3N0OiB7XG4gICAgICB4OiAyMDAsXG4gICAgICB5OiAxMlxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAwLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgbGFyZ2VOb3RjaGVzOiBmYWxzZSxcbiAgICBzbmFwUmFkaXVzOiAzMCxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShbJ2ppZ3Nhd19yZXBlYXQnLCAnamlnc2F3X3B1cnBsZScsXG4gICAgICAgICAgJ2ppZ3Nhd19ibHVlJywgJ2ppZ3Nhd19ncmVlbiddLCB7fSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczogdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3X3JlcGVhdCcsIDIwLCAyMCxcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd19wdXJwbGUnLCAwLCAwLCB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfYmx1ZScpKSwgJ3N0YXRlbWVudCcpLFxuICAgIHRvb2xib3g6IGNyZWF0ZVRvb2xib3goXG4gICAgICBqaWdzYXdCbG9jaygnamlnc2F3X2dyZWVuJylcbiAgICApXG4gIH0sXG5cbiAgJzEyJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdibG9ja3MnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdibG9ja3MnLFxuICAgICAgd2lkdGg6IDEzMSxcbiAgICAgIGhlaWdodDogMjg2XG4gICAgfSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogMjAwLFxuICAgICAgeTogMTJcbiAgICB9LFxuICAgIG51bUJsb2NrczogMCxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGxhcmdlTm90Y2hlczogZmFsc2UsXG4gICAgc25hcFJhZGl1czogMzAsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUoWydqaWdzYXdfcmVwZWF0JywgJ2ppZ3Nhd19wdXJwbGUnLFxuICAgICAgICAgICdqaWdzYXdfYmx1ZScsICdqaWdzYXdfZ3JlZW4nXSwge30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6IHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd19yZXBlYXQnLCAyMCwgMjApLFxuICAgIHRvb2xib3g6IGNyZWF0ZVRvb2xib3goXG4gICAgICBqaWdzYXdCbG9jaygnamlnc2F3X2dyZWVuJykgK1xuICAgICAgamlnc2F3QmxvY2soJ2ppZ3Nhd19wdXJwbGUnKSArXG4gICAgICBqaWdzYXdCbG9jaygnamlnc2F3X2JsdWUnKVxuICAgIClcbiAgfSxcblxuICAvLyBhc3Nlc3NtZW50XG4gICcxMyc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnZG9nZ2llJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnZG9nZ2llJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzI1LCAwLjU3LCAwLjk2MF0sXG4gICAgbnVtQmxvY2tzOiAzLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogMTMsIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICBqaWdzYXdCbG9jaygnamlnc2F3XzEzQycsIDEwMCwgMjAsIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTNCJywgMCwgMCwgamlnc2F3QmxvY2soJ2ppZ3Nhd18xM0EnLCAwLCAwKSkpXG4gIH1cbn07XG4iXX0=
