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
var codeWorkspaceEjs = require('../templates/codeWorkspace.html.ejs');
var visualizationColumnEjs = require('../templates/visualizationColumn.html.ejs');
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

  var renderCodeWorkspace = function renderCodeWorkspace() {
    return codeWorkspaceEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        localeDirection: studioApp.localeDirection(),
        editCode: level.editCode,
        blockCounterClass: 'block-counter-default'
      }
    });
  };

  var renderVisualizationColumn = function renderVisualizationColumn() {
    return visualizationColumnEjs({
      assetUrl: studioApp.assetUrl,
      data: {
        controls: require('./controls.html.ejs')({ assetUrl: studioApp.assetUrl })
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

  ReactDOM.render(React.createElement(AppView, {
    assetUrl: studioApp.assetUrl,
    isEmbedView: !!config.embed,
    isShareView: !!config.share,
    renderCodeWorkspace: renderCodeWorkspace,
    renderVisualizationColumn: renderVisualizationColumn,
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

},{"../StudioApp":"/home/ubuntu/staging/apps/build/js/StudioApp.js","../dom":"/home/ubuntu/staging/apps/build/js/dom.js","../skins":"/home/ubuntu/staging/apps/build/js/skins.js","../templates/AppView.jsx":"/home/ubuntu/staging/apps/build/js/templates/AppView.jsx","../templates/codeWorkspace.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/codeWorkspace.html.ejs","../templates/visualizationColumn.html.ejs":"/home/ubuntu/staging/apps/build/js/templates/visualizationColumn.html.ejs","./controls.html.ejs":"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs"}],"/home/ubuntu/staging/apps/build/js/jigsaw/controls.html.ejs":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9qcy9qaWdzYXcvbWFpbi5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9za2lucy5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9qaWdzYXcuanMiLCJidWlsZC9qcy9qaWdzYXcvY29udHJvbHMuaHRtbC5lanMiLCJidWlsZC9qcy9qaWdzYXcvYmxvY2tzLmpzIiwiYnVpbGQvanMvamlnc2F3L2xvY2FsZS5qcyIsImJ1aWxkL2pzL2ppZ3Nhdy9sZXZlbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2ZBLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFcEMsSUFBSSxPQUFPLEdBQUc7O0FBRVosUUFBTSxFQUFFLEVBQ1A7O0NBRUYsQ0FBQzs7QUFFRixPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVMsUUFBUSxFQUFFLEVBQUUsRUFBRTtBQUNwQyxNQUFJLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN4QyxNQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUc5QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDMUMsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUxQyxNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDeEMsTUFBSSxDQUFD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QUFXLENBQUMsY0FBYyxDQUFDLEdBQzNCLFdBQVcsQ0FBQyxlQUFlLENBQUMsR0FDNUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUMzQjtHQUNGOzs7QUFHRCxNQUFJLEVBQUU7QUFDSixvQkFBZ0IsRUFBRSxRQUFRO0FBQzFCLFFBQUksRUFBRSxJQUFJO0FBQ1YsU0FBSyxFQUFFO0FBQ0wsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUsR0FBRztBQUNWLFlBQU0sRUFBRSxHQUFHO0tBQ1o7QUFDRCxTQUFLLEVBQUU7QUFDTCxPQUFDLEVBQUUsR0FBRztBQUNOLE9BQUMsRUFBRSxHQUFHO0tBQ1A7QUFDRCxpQkFBYSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7QUFDaEMsYUFBUyxFQUFFLENBQUM7QUFDWixrQkFBYyxFQUFFLEVBQUU7QUFDbEIsWUFBUSxFQUFFLEtBQUs7QUFDZixnQkFBWSxFQUFFLElBQUk7QUFDbEIsZUFBVyxFQUFFLElBQUk7QUFDakIsUUFBSSxFQUFFO0FBQ0osc0JBQWdCLEVBQUUsNEJBQVk7QUFDNUIsZUFBTyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO09BQzlEO0tBQ0Y7QUFDRCxlQUFXLEVBQ1QsV0FBVyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3ZHO0NBQ0YsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBhcHBNYWluID0gcmVxdWlyZSgnLi4vYXBwTWFpbicpO1xud2luZG93LkppZ3NhdyA9IHJlcXVpcmUoJy4vamlnc2F3Jyk7XG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsLkppZ3NhdyA9IHdpbmRvdy5KaWdzYXc7XG59XG52YXIgYmxvY2tzID0gcmVxdWlyZSgnLi9ibG9ja3MnKTtcbnZhciBsZXZlbHMgPSByZXF1aXJlKCcuL2xldmVscycpO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi9za2lucycpO1xuXG53aW5kb3cuamlnc2F3TWFpbiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIG9wdGlvbnMuc2tpbnNNb2R1bGUgPSBza2lucztcbiAgb3B0aW9ucy5ibG9ja3NNb2R1bGUgPSBibG9ja3M7XG4gIGFwcE1haW4od2luZG93LkppZ3NhdywgbGV2ZWxzLCBvcHRpb25zKTtcbn07XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW1KMWFXeGtMMnB6TDJwcFozTmhkeTl0WVdsdUxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenRCUVVGQkxFbEJRVWtzVDBGQlR5eEhRVUZITEU5QlFVOHNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJRenRCUVVOd1F5eE5RVUZOTEVOQlFVTXNUVUZCVFN4SFFVRkhMRTlCUVU4c1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF6dEJRVU53UXl4SlFVRkpMRTlCUVU4c1RVRkJUU3hMUVVGTExGZEJRVmNzUlVGQlJUdEJRVU5xUXl4UlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTTdRMEZETDBJN1FVRkRSQ3hKUVVGSkxFMUJRVTBzUjBGQlJ5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1FVRkRha01zU1VGQlNTeE5RVUZOTEVkQlFVY3NUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRE8wRkJRMnBETEVsQlFVa3NTMEZCU3l4SFFVRkhMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6czdRVUZGTDBJc1RVRkJUU3hEUVVGRExGVkJRVlVzUjBGQlJ5eFZRVUZUTEU5QlFVOHNSVUZCUlR0QlFVTndReXhUUVVGUExFTkJRVU1zVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXp0QlFVTTFRaXhUUVVGUExFTkJRVU1zV1VGQldTeEhRVUZITEUxQlFVMHNRMEZCUXp0QlFVTTVRaXhUUVVGUExFTkJRVU1zVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03UTBGRGVrTXNRMEZCUXlJc0ltWnBiR1VpT2lKblpXNWxjbUYwWldRdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGMwTnZiblJsYm5RaU9sc2lkbUZ5SUdGd2NFMWhhVzRnUFNCeVpYRjFhWEpsS0NjdUxpOWhjSEJOWVdsdUp5azdYRzUzYVc1a2IzY3VTbWxuYzJGM0lEMGdjbVZ4ZFdseVpTZ25MaTlxYVdkellYY25LVHRjYm1sbUlDaDBlWEJsYjJZZ1oyeHZZbUZzSUNFOVBTQW5kVzVrWldacGJtVmtKeWtnZTF4dUlDQm5iRzlpWVd3dVNtbG5jMkYzSUQwZ2QybHVaRzkzTGtwcFozTmhkenRjYm4xY2JuWmhjaUJpYkc5amEzTWdQU0J5WlhGMWFYSmxLQ2N1TDJKc2IyTnJjeWNwTzF4dWRtRnlJR3hsZG1Wc2N5QTlJSEpsY1hWcGNtVW9KeTR2YkdWMlpXeHpKeWs3WEc1MllYSWdjMnRwYm5NZ1BTQnlaWEYxYVhKbEtDY3VMM05yYVc1ekp5azdYRzVjYm5kcGJtUnZkeTVxYVdkellYZE5ZV2x1SUQwZ1puVnVZM1JwYjI0b2IzQjBhVzl1Y3lrZ2UxeHVJQ0J2Y0hScGIyNXpMbk5yYVc1elRXOWtkV3hsSUQwZ2MydHBibk03WEc0Z0lHOXdkR2x2Ym5NdVlteHZZMnR6VFc5a2RXeGxJRDBnWW14dlkydHpPMXh1SUNCaGNIQk5ZV2x1S0hkcGJtUnZkeTVLYVdkellYY3NJR3hsZG1Wc2N5d2diM0IwYVc5dWN5azdYRzU5TzF4dUlsMTkiLCIvKipcbiAqIExvYWQgU2tpbiBmb3IgSmlnc2F3LlxuICovXG5cbnZhciBza2luc0Jhc2UgPSByZXF1aXJlKCcuLi9za2lucycpO1xuXG52YXIgQ09ORklHUyA9IHtcblxuICBqaWdzYXc6IHtcbiAgfVxuXG59O1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihhc3NldFVybCwgaWQpIHtcbiAgdmFyIHNraW4gPSBza2luc0Jhc2UubG9hZChhc3NldFVybCwgaWQpO1xuICB2YXIgY29uZmlnID0gQ09ORklHU1tza2luLmlkXTtcblxuXG4gIHNraW4uYXJ0aXN0ID0gc2tpbi5hc3NldFVybCgnYXJ0aXN0LnBuZycpO1xuICBza2luLmJsb2NrcyA9IHNraW4uYXNzZXRVcmwoJ2Jsb2Nrcy5wbmcnKTtcblxuICBza2luLmFwcGxlID0gc2tpbi5hc3NldFVybCgnYXBwbGUucG5nJyk7XG4gIHNraW4uc21pbGV5ID0gc2tpbi5hc3NldFVybCgnc21pbGV5LnBuZycpO1xuICBza2luLnNuYWlsID0gc2tpbi5hc3NldFVybCgnc25haWwucG5nJyk7XG4gIHNraW4uZWxlcGhhbnQgPSBza2luLmFzc2V0VXJsKCdlbGVwaGFudC5wbmcnKTtcbiAgc2tpbi5maXNoID0gc2tpbi5hc3NldFVybCgnZmlzaC5wbmcnKTtcbiAgc2tpbi5kb2dnaWUgPSBza2luLmFzc2V0VXJsKCdkb2dnaWUucG5nJyk7XG4gIHNraW4udHJlZSA9IHNraW4uYXNzZXRVcmwoJ3RyZWUucG5nJyk7XG4gIHNraW4uZmxvd2VyID0gc2tpbi5hc3NldFVybCgnZmxvd2VyLnBuZycpO1xuICBza2luLmhvdXNlID0gc2tpbi5hc3NldFVybCgnaG91c2UucG5nJyk7XG4gIHNraW4uY29tcHV0ZXIgPSBza2luLmFzc2V0VXJsKCdjb21wdXRlci5wbmcnKTtcblxuICBza2luLmJsYW5rID0gc2tpbi5hc3NldFVybCgnYmxhbmsucG5nJyk7XG4gIHNraW4uc21hbGxTdGF0aWNBdmF0YXIgPSBza2luLmJsYW5rO1xuXG4gIC8vIFNldHRpbmdzXG4gIHNraW4uYmFja2dyb3VuZCA9IHNraW4uYXNzZXRVcmwoJ2JhY2tncm91bmQucG5nJyk7XG5cbiAgcmV0dXJuIHNraW47XG59O1xuIiwiLyoqXG4gKiBCbG9ja2x5IEFwcDogSmlnc2F3XG4gKlxuICogQ29weXJpZ2h0IDIwMTMgQ29kZS5vcmdcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3R1ZGlvQXBwID0gcmVxdWlyZSgnLi4vU3R1ZGlvQXBwJykuc2luZ2xldG9uO1xudmFyIHNraW5zID0gcmVxdWlyZSgnLi4vc2tpbnMnKTtcbnZhciBBcHBWaWV3ID0gcmVxdWlyZSgnLi4vdGVtcGxhdGVzL0FwcFZpZXcuanN4Jyk7XG52YXIgY29kZVdvcmtzcGFjZUVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy9jb2RlV29ya3NwYWNlLmh0bWwuZWpzJyk7XG52YXIgdmlzdWFsaXphdGlvbkNvbHVtbkVqcyA9IHJlcXVpcmUoJy4uL3RlbXBsYXRlcy92aXN1YWxpemF0aW9uQ29sdW1uLmh0bWwuZWpzJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmFtZXNwYWNlIGZvciB0aGUgYXBwbGljYXRpb24uXG4gKi9cbnZhciBKaWdzYXcgPSBtb2R1bGUuZXhwb3J0cztcblxudmFyIGxldmVsO1xudmFyIHNraW47XG5cbnZhciBSZXN1bHRUeXBlID0gc3R1ZGlvQXBwLlJlc3VsdFR5cGU7XG52YXIgVGVzdFJlc3VsdHMgPSBzdHVkaW9BcHAuVGVzdFJlc3VsdHM7XG5cbnN0dWRpb0FwcC5zZXRDaGVja0ZvckVtcHR5QmxvY2tzKHRydWUpO1xuXG4vLyBOZXZlciBidW1wIG5laWdoYm9ycyBmb3IgSmlnc2F3XG5CbG9ja2x5LkJVTVBfVU5DT05ORUNURUQgPSBmYWxzZTtcblxuZnVuY3Rpb24gdXNlTGFyZ2VOb3RjaGVzKCkge1xuICB2YXIgbm90Y2hIZWlnaHQgPSA4O1xuICB2YXIgbm90Y2hXaWR0aEEgPSA2O1xuICB2YXIgbm90Y2hXaWR0aEIgPSAxMDtcblxuICBCbG9ja2x5LkJsb2NrU3ZnLk5PVENIX1BBVEhfV0lEVEggPSBub3RjaFdpZHRoQSAqIDIgKyBub3RjaFdpZHRoQjtcbiAgQmxvY2tseS5CbG9ja1N2Zy5OT1RDSF9XSURUSCA9IDUwO1xuXG4gIHZhciBub3RjaFBhdGhMZWZ0ID0gJ2wgJyArXG4gICAgbm90Y2hXaWR0aEEgKyAnLCcgKyBub3RjaEhlaWdodCArICcgJyArXG4gICAgbm90Y2hXaWR0aEIgKyAnLDAgJyArXG4gICAgbm90Y2hXaWR0aEEgKyAnLC0nICsgbm90Y2hIZWlnaHQ7XG4gIHZhciBub3RjaFBhdGhSaWdodCA9ICdsICcgK1xuICAgICctJyArIG5vdGNoV2lkdGhBICsgJywnICsgbm90Y2hIZWlnaHQgKyAnICcgK1xuICAgICctJyArIG5vdGNoV2lkdGhCICsgJywwICcgK1xuICAgICctJyArIG5vdGNoV2lkdGhBICsgJywtJyArIG5vdGNoSGVpZ2h0O1xuICAvLyBCbG9ja2x5LkJsb2NrU3ZnLk5PVENIX1BBVEhfTEVGVCA9ICdsIDYsNCAzLDAgNiwtNCc7XG4gIC8vIEJsb2NrbHkuQmxvY2tTdmcuTk9UQ0hfUEFUSF9SSUdIVCA9ICdsIC02LDQgLTMsMCAtNiwtNCc7XG5cbiAgdmFyIG5vdGNoSGlnaGxpZ2h0SGVpZ2h0ID0gbm90Y2hIZWlnaHQ7IC8vNDtcbiAgdmFyIG5vdGNoSGlnaGxpZ2h0V2lkdGhBID0gbm90Y2hXaWR0aEEgKyAwLjU7IC8vNi41O1xuICB2YXIgbm90Y2hIaWdobGlnaHRXaWR0aEIgPSBub3RjaFdpZHRoQiAtIDE7IC8vMjtcblxuICB2YXIgbm90Y2hQYXRoTGVmdEhpZ2hsaWdodCA9ICdsICcgK1xuICAgIG5vdGNoSGlnaGxpZ2h0V2lkdGhBICsgJywnICsgbm90Y2hIaWdobGlnaHRIZWlnaHQgKyAnICcgK1xuICAgIG5vdGNoSGlnaGxpZ2h0V2lkdGhCICsgJywwICcgK1xuICAgIG5vdGNoSGlnaGxpZ2h0V2lkdGhBICsgJywtJyArIG5vdGNoSGlnaGxpZ2h0SGVpZ2h0O1xuICAvLyBCbG9ja2x5LkJsb2NrU3ZnLk5PVENIX1BBVEhfTEVGVF9ISUdITElHSFQgPSAnbCA2LjUsNCAyLDAgNi41LC00JztcblxuICBCbG9ja2x5LkNvbm5lY3Rpb24uTk9UQ0hfUEFUSFNfT1ZFUlJJREUgPSB7XG4gICAgbGVmdDogbm90Y2hQYXRoTGVmdCxcbiAgICBsZWZ0SGlnaGxpZ2h0OiBub3RjaFBhdGhMZWZ0SGlnaGxpZ2h0LFxuICAgIHJpZ2h0OiBub3RjaFBhdGhSaWdodFxuICB9O1xuXG59XG5cblxuLy8gRGVmYXVsdCBTY2FsaW5nc1xuSmlnc2F3LnNjYWxlID0ge1xuICAnc25hcFJhZGl1cyc6IDEsXG4gICdzdGVwU3BlZWQnOiAzM1xufTtcblxudmFyIGxvYWRMZXZlbCA9IGZ1bmN0aW9uKCkge1xuICAvLyBMb2FkIG1hcHMuXG4gIC8vIE92ZXJyaWRlIHNjYWxhcnMuXG4gIGZvciAodmFyIGtleSBpbiBsZXZlbC5zY2FsZSkge1xuICAgIEppZ3Nhdy5zY2FsZVtrZXldID0gbGV2ZWwuc2NhbGVba2V5XTtcbiAgfVxuXG4gIEppZ3Nhdy5NQVpFX1dJRFRIID0gMDtcbiAgSmlnc2F3Lk1BWkVfSEVJR0hUID0gMDtcblxuICBKaWdzYXcuYmxvY2sxQ2xpY2tlZCA9IGZhbHNlO1xufTtcblxudmFyIGRyYXdNYXAgPSBmdW5jdGlvbigpIHtcbiAgLy8gSGlkZSB0aGUgbGVmdCBjb2x1bW4gYW5kIHRoZSByZXNpemUgYmFyLlxuICB2YXIgdmlzdWFsaXphdGlvbkNvbHVtbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2aXN1YWxpemF0aW9uQ29sdW1uJyk7XG4gIHZpc3VhbGl6YXRpb25Db2x1bW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgdmFyIHZpc3VhbGl6YXRpb25SZXNpemVCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlzdWFsaXphdGlvblJlc2l6ZUJhcicpO1xuICB2aXN1YWxpemF0aW9uUmVzaXplQmFyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgaWYgKGxldmVsLmdob3N0KSB7XG4gICAgdmFyIGJsb2NrQ2FudmFzID0gQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRDYW52YXMoKTtcbiAgICBCbG9ja2x5LmNyZWF0ZVN2Z0VsZW1lbnQoJ3JlY3QnLCB7XG4gICAgICBmaWxsOiBcInVybCgjcGF0X1wiICsgbGV2ZWwuaWQgKyBcIkEpXCIsXG4gICAgICBcImZpbGwtb3BhY2l0eVwiOiBcIjAuMlwiLFxuICAgICAgd2lkdGg6IGxldmVsLmltYWdlLndpZHRoLFxuICAgICAgaGVpZ2h0OiBsZXZlbC5pbWFnZS5oZWlnaHQsXG4gICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlKFwiICsgbGV2ZWwuZ2hvc3QueCArIFwiLCBcIiArXG4gICAgICAgIGxldmVsLmdob3N0LnkgKyBcIilcIlxuICAgIH0sIGJsb2NrQ2FudmFzLCB7XG4gICAgICBiZWZvcmVFeGlzdGluZzogdHJ1ZVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgQmxvY2tseSBhbmQgdGhlIEppZ3NhdyBhcHAuICBDYWxsZWQgb24gcGFnZSBsb2FkLlxuICovXG5KaWdzYXcuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAvLyBKaWdzYXcuY2xlYXJFdmVudEhhbmRsZXJzS2lsbFRpY2tMb29wKCk7XG4gIHNraW4gPSBjb25maWcuc2tpbjtcbiAgbGV2ZWwgPSBjb25maWcubGV2ZWw7XG4gIGxvYWRMZXZlbCgpO1xuXG4gIGlmIChsZXZlbC5sYXJnZU5vdGNoZXMpIHtcbiAgICB1c2VMYXJnZU5vdGNoZXMoKTtcbiAgfVxuICBCbG9ja2x5LlNOQVBfUkFESVVTID0gbGV2ZWwuc25hcFJhZGl1cyB8fCA5MDtcblxuICAvLyBUT0RPIChici1wYWlyKSA6IEkgdGhpbmsgdGhpcyBpcyBzb21ldGhpbmcgdGhhdCdzIGhhcHBlbmluZyBpbiBhbGwgYXBwcz9cbiAgY29uZmlnLmxvYWRBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi53aW5Tb3VuZCwgJ3dpbicpO1xuICAgIHN0dWRpb0FwcC5sb2FkQXVkaW8oc2tpbi5zdGFydFNvdW5kLCAnc3RhcnQnKTtcbiAgICBzdHVkaW9BcHAubG9hZEF1ZGlvKHNraW4uZmFpbHVyZVNvdW5kLCAnZmFpbHVyZScpO1xuICB9O1xuXG4gIGNvbmZpZy5hZnRlckluamVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSByaWNobmVzcyBvZiBibG9jayBjb2xvdXJzLCByZWdhcmRsZXNzIG9mIHRoZSBodWUuXG4gICAgICogTU9PQyBibG9ja3Mgc2hvdWxkIGJlIGJyaWdodGVyICh0YXJnZXQgYXVkaWVuY2UgaXMgeW91bmdlcikuXG4gICAgICogTXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCAoaW5jbHVzaXZlKSB0byAxIChleGNsdXNpdmUpLlxuICAgICAqIEJsb2NrbHkncyBkZWZhdWx0IGlzIDAuNDUuXG4gICAgICovXG4gICAgQmxvY2tseS5IU1ZfU0FUVVJBVElPTiA9IDAuNjtcblxuICAgIGRyYXdNYXAoKTtcbiAgfTtcblxuICAvLyBvbmx5IGhhdmUgdHJhc2hjYW4gZm9yIGxldmVscyB3aXRoIHRvb2xib3hcbiAgY29uZmlnLnRyYXNoY2FuID0gISFsZXZlbC50b29sYm94O1xuICBjb25maWcuc2Nyb2xsYmFycyA9IGZhbHNlO1xuXG4gIGNvbmZpZy5lbmFibGVTaG93Q29kZSA9IGZhbHNlO1xuICBjb25maWcuZW5hYmxlU2hvd0Jsb2NrQ291bnQgPSBmYWxzZTtcblxuICB2YXIgcmVuZGVyQ29kZVdvcmtzcGFjZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gY29kZVdvcmtzcGFjZUVqcyh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBsb2NhbGVEaXJlY3Rpb246IHN0dWRpb0FwcC5sb2NhbGVEaXJlY3Rpb24oKSxcbiAgICAgICAgZWRpdENvZGU6IGxldmVsLmVkaXRDb2RlLFxuICAgICAgICBibG9ja0NvdW50ZXJDbGFzczogJ2Jsb2NrLWNvdW50ZXItZGVmYXVsdCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdmlzdWFsaXphdGlvbkNvbHVtbkVqcyh7XG4gICAgICBhc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsLFxuICAgICAgZGF0YToge1xuICAgICAgICBjb250cm9sczogcmVxdWlyZSgnLi9jb250cm9scy5odG1sLmVqcycpKHthc3NldFVybDogc3R1ZGlvQXBwLmFzc2V0VXJsfSlcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICB2YXIgb25Nb3VudCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdHVkaW9BcHAuaW5pdChjb25maWcpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3J1bkJ1dHRvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgSmlnc2F3LnN1Y2Nlc3NMaXN0ZW5lciA9IEJsb2NrbHkubWFpbkJsb2NrU3BhY2VFZGl0b3IuYWRkQ2hhbmdlTGlzdGVuZXIoZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBjaGVja0ZvclN1Y2Nlc3MoKTtcbiAgICB9KTtcblxuICAgIC8vIE9ubHkgdXNlZCBieSBsZXZlbDEsIGluIHdoaWNoIHRoZSBzdWNjZXNzIGNyaXRlcmlhIGlzIGNsaWNraW5nIG9uIHRoZSBibG9ja1xuICAgIHZhciBibG9jazEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2Jsb2NrLWlkPScxJ11cIilbMF07XG4gICAgaWYgKGJsb2NrMSkge1xuICAgICAgZG9tLmFkZE1vdXNlRG93blRvdWNoRXZlbnQoYmxvY2sxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEppZ3Nhdy5ibG9jazFDbGlja2VkID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBSZWFjdERPTS5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChBcHBWaWV3LCB7XG4gICAgYXNzZXRVcmw6IHN0dWRpb0FwcC5hc3NldFVybCxcbiAgICBpc0VtYmVkVmlldzogISFjb25maWcuZW1iZWQsXG4gICAgaXNTaGFyZVZpZXc6ICEhY29uZmlnLnNoYXJlLFxuICAgIHJlbmRlckNvZGVXb3Jrc3BhY2U6IHJlbmRlckNvZGVXb3Jrc3BhY2UsXG4gICAgcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbjogcmVuZGVyVmlzdWFsaXphdGlvbkNvbHVtbixcbiAgICBvbk1vdW50OiBvbk1vdW50XG4gIH0pLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb25maWcuY29udGFpbmVySWQpKTtcbn07XG5cbmZ1bmN0aW9uIGNoZWNrRm9yU3VjY2VzcygpIHtcbiAgdmFyIHN1Y2Nlc3MgPSBsZXZlbC5nb2FsLnN1Y2Nlc3NDb25kaXRpb24oKTtcbiAgaWYgKHN1Y2Nlc3MpIHtcbiAgICBCbG9ja2x5LnJlbW92ZUNoYW5nZUxpc3RlbmVyKEppZ3Nhdy5zdWNjZXNzTGlzdGVuZXIpO1xuXG4gICAgSmlnc2F3LnJlc3VsdCA9IFJlc3VsdFR5cGUuU1VDQ0VTUztcbiAgICBKaWdzYXcub25QdXp6bGVDb21wbGV0ZSgpO1xuICB9XG59XG5cbi8qKlxuICogQXBwIHNwZWNpZmljIGRpc3BsYXlGZWVkYmFjayBmdW5jdGlvbiB0aGF0IGNhbGxzIGludG9cbiAqIHN0dWRpb0FwcC5kaXNwbGF5RmVlZGJhY2sgd2hlbiBhcHByb3ByaWF0ZVxuICovXG52YXIgZGlzcGxheUZlZWRiYWNrID0gZnVuY3Rpb24oKSB7XG4gIGlmICghSmlnc2F3LndhaXRpbmdGb3JSZXBvcnQpIHtcbiAgICBzdHVkaW9BcHAuZGlzcGxheUZlZWRiYWNrKHtcbiAgICAgIGFwcDogJ0ppZ3NhdycsXG4gICAgICBza2luOiBza2luLmlkLFxuICAgICAgZmVlZGJhY2tUeXBlOiBKaWdzYXcudGVzdFJlc3VsdHMsXG4gICAgICByZXNwb25zZTogSmlnc2F3LnJlc3BvbnNlLFxuICAgICAgbGV2ZWw6IGxldmVsXG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHNlcnZpY2UgcmVwb3J0IGNhbGwgaXMgY29tcGxldGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBKU09OIHJlc3BvbnNlIChpZiBhdmFpbGFibGUpXG4gKi9cbkppZ3Nhdy5vblJlcG9ydENvbXBsZXRlID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgSmlnc2F3LnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIEppZ3Nhdy53YWl0aW5nRm9yUmVwb3J0ID0gZmFsc2U7XG4gIHN0dWRpb0FwcC5vblJlcG9ydENvbXBsZXRlKHJlc3BvbnNlKTtcbiAgZGlzcGxheUZlZWRiYWNrKCk7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgdGhlIHVzZXIncyBjb2RlLiAgSGVhdmVuIGhlbHAgdXMuLi5cbiAqL1xuSmlnc2F3LmV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gZXhlY3V0ZSBpcyBhIG5vLW9wIGZvciBqaWdzYXdcbn07XG5cbkppZ3Nhdy5vblB1enpsZUNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gSWYgd2Uga25vdyB0aGV5IHN1Y2NlZWRlZCwgbWFyayBsZXZlbENvbXBsZXRlIHRydWVcbiAgLy8gTm90ZSB0aGF0IHdlIGhhdmUgbm90IHlldCBhbmltYXRlZCB0aGUgc3VjY2VzZnVsIHJ1blxuICB2YXIgbGV2ZWxDb21wbGV0ZSA9IChKaWdzYXcucmVzdWx0ID09IFJlc3VsdFR5cGUuU1VDQ0VTUyk7XG5cbiAgSmlnc2F3LnRlc3RSZXN1bHRzID0gc3R1ZGlvQXBwLmdldFRlc3RSZXN1bHRzKGxldmVsQ29tcGxldGUsIHtcbiAgICBhbGxvd1RvcEJsb2NrczogdHJ1ZVxuICB9KTtcblxuICBpZiAoSmlnc2F3LnRlc3RSZXN1bHRzID49IFRlc3RSZXN1bHRzLkZSRUVfUExBWSkge1xuICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ3dpbicpO1xuICB9IGVsc2Uge1xuICAgIHN0dWRpb0FwcC5wbGF5QXVkaW8oJ2ZhaWx1cmUnKTtcbiAgfVxuXG4gIHZhciB4bWwgPSBCbG9ja2x5LlhtbC5ibG9ja1NwYWNlVG9Eb20oQmxvY2tseS5tYWluQmxvY2tTcGFjZSk7XG4gIHZhciB0ZXh0QmxvY2tzID0gQmxvY2tseS5YbWwuZG9tVG9UZXh0KHhtbCk7XG5cbiAgSmlnc2F3LndhaXRpbmdGb3JSZXBvcnQgPSB0cnVlO1xuXG4gIC8vIFJlcG9ydCByZXN1bHQgdG8gc2VydmVyLlxuICBzdHVkaW9BcHAucmVwb3J0KHtcbiAgICAgYXBwOiAnSmlnc2F3JyxcbiAgICAgbGV2ZWw6IGxldmVsLmlkLFxuICAgICByZXN1bHQ6IEppZ3Nhdy5yZXN1bHQgPT09IFJlc3VsdFR5cGUuU1VDQ0VTUyxcbiAgICAgdGVzdFJlc3VsdDogSmlnc2F3LnRlc3RSZXN1bHRzLFxuICAgICBwcm9ncmFtOiBlbmNvZGVVUklDb21wb25lbnQodGV4dEJsb2NrcyksXG4gICAgIG9uQ29tcGxldGU6IEppZ3Nhdy5vblJlcG9ydENvbXBsZXRlXG4gIH0pO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB0ID0gZnVuY3Rpb24gYW5vbnltb3VzKGxvY2FscywgZmlsdGVycywgZXNjYXBlXG4vKiovKSB7XG5lc2NhcGUgPSBlc2NhcGUgfHwgZnVuY3Rpb24gKGh0bWwpe1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYoPyFcXHcrOykvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG59O1xudmFyIGJ1ZiA9IFtdO1xud2l0aCAobG9jYWxzIHx8IHt9KSB7IChmdW5jdGlvbigpeyBcbiBidWYucHVzaCgnJyk7MTsgdmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJykgOyBidWYucHVzaCgnXFxuJyk7IH0pKCk7XG59IFxucmV0dXJuIGJ1Zi5qb2luKCcnKTtcbn07XG4gIHJldHVybiBmdW5jdGlvbihsb2NhbHMpIHtcbiAgICByZXR1cm4gdChsb2NhbHMsIHJlcXVpcmUoXCJlanNcIikuZmlsdGVycyk7XG4gIH1cbn0oKSk7IiwiLyoqXG4gKiBCbG9ja2x5IEFwcDogSmlnc2F3XG4gKlxuICogQ29weXJpZ2h0IDIwMTMgQ29kZS5vcmdcbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1zZyA9IHJlcXVpcmUoJy4vbG9jYWxlJyk7XG52YXIgZG9tID0gcmVxdWlyZSgnLi4vZG9tJyk7XG52YXIgbGV2ZWxzID0gcmVxdWlyZSgnLi9sZXZlbHMnKTtcblxudmFyIHBhdHRlcm5DYWNoZSA9IHtcbiAgcXVldWVkOiBbXSxcbiAgY3JlYXRlZDoge30sXG5cbiAgLyoqXG4gICAqIFN0aWNrIGFuIGl0ZW0gaW4gb3VyIHF1ZXVlXG4gICAqL1xuICBhZGRUb1F1ZXVlOiBmdW5jdGlvbiAocGF0dGVybkluZm8pIHtcbiAgICB0aGlzLnF1ZXVlZC5wdXNoKHBhdHRlcm5JbmZvKTtcbiAgfSxcblxuICAvKipcbiAgICogQWRkIGFsbCB0aGUgc3ZnIHBhdHRlcm5zIHdlJ3ZlIHF1ZXVlZCB1cC5cbiAgICovXG4gIGFkZFF1ZXVlZFBhdHRlcm5zOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5xdWV1ZWQuZm9yRWFjaChmdW5jdGlvbiAocGF0dGVybikge1xuICAgICAgYWRkUGF0dGVybihwYXR0ZXJuLmlkLCBwYXR0ZXJuLmltYWdlUGF0aCwgcGF0dGVybi53aWR0aCwgcGF0dGVybi5oZWlnaHQsXG4gICAgICAgIHBhdHRlcm4ub2Zmc2V0WCwgcGF0dGVybi5vZmZzZXRZKTtcbiAgICB9KTtcbiAgICB0aGlzLnF1ZXVlZCA9IFtdO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYXZlIHdlIGFscmVhZHkgY3JlYXRlZCBhbiBzdmcgZWxlbWVudCBmb3IgdGhpcyBwYXR0ZXJuSW5mbz8gIFRocm93cyBpZlxuICAgKiB3ZSBhc2sgd2l0aCBhIHBhdHRlcm5JbmZvIHRoYXQgaGFzIHRoZSBzYW1lIGlkIGJ1dCBkaWZmZXJlbnQgYXR0cmlidXRlcy5cbiAgICovXG4gIHdhc0NyZWF0ZWQ6IGZ1bmN0aW9uIChwYXR0ZXJuSW5mbykge1xuICAgIHZhciBlcXVhbCA9IHRydWU7XG4gICAgdmFyIGNhY2hlZCA9IHRoaXMuY3JlYXRlZFtwYXR0ZXJuSW5mby5pZF07XG4gICAgaWYgKCFjYWNoZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhwYXR0ZXJuSW5mbykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAocGF0dGVybkluZm9ba2V5XSAhPT0gY2FjaGVkW2tleV0pIHtcbiAgICAgICAgZXF1YWwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWVxdWFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBhZGQgYXR0cmlidXRlIG9mIHNhbWUgaWQgd2l0aCBkaWZmZXJlbnQgYXR0cmlidXRlc1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1hcmsgdGhhdCB3ZSd2ZSBjcmVhdGVkIGFuIHN2ZyBwYXR0ZXJuXG4gICAqL1xuICBtYXJrQ3JlYXRlZDogZnVuY3Rpb24gKHBhdHRlcm5JbmZvKSB7XG4gICAgaWYgKHRoaXMuY3JlYXRlZFtwYXR0ZXJuSW5mby5pZF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWxyZWFkeSBoYXZlIGNhY2hlZCBpdGVtIHdpdGggaWQ6ICcgKyBwYXR0ZXJuSW5mby5pZCk7XG4gICAgfVxuICAgIHRoaXMuY3JlYXRlZFtwYXR0ZXJuSW5mby5pZF0gPSBwYXR0ZXJuSW5mbztcbiAgfVxuXG59O1xuXG52YXIgcGF0dGVybnMgPSBbXTtcbnZhciBjcmVhdGVkUGF0dGVybnMgPSB7fTtcblxuLyoqXG4gKiBBZGQgYW4gc3ZnIHBhdHRlcm4gZm9yIHRoZSBnaXZlbiBpbWFnZS4gSWYgZG9jdW1lbnQgaXMgbm90IHlldCBmdWxseSBsb2FkZWQsXG4gKiBpdCB3aWxsIGFkZCB0aGUgcGF0dGVybiB0byBhIGxpc3QgZm9yIGxhdGVyLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBQYXR0ZXJuIG5hbWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbWFnZVBhdGggVXJsIG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHRoZSBpbWFnZVxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgdGhlIGltYWdlXG4gKiBAcGFyYW0ge251bWJlcnxmdW5jdGlvbn0gb2Zmc2V0WCBPZmZzZXQgb2YgdGhlIGltYWdlIHRvIHN0YXJ0IHBhdHRlcm5cbiAqIEBwYXJhbSB7bnVtYmVyfGZ1bmN0aW9ufSBvZmZzZXRZIE9mZnNldCBvZiB0aGUgaW1hZ2UgdG8gc3RhcnQgcGF0dGVyblxuICovXG52YXIgYWRkUGF0dGVybiA9IGZ1bmN0aW9uIChpZCwgaW1hZ2VQYXRoLCB3aWR0aCwgaGVpZ2h0LCBvZmZzZXRYLCBvZmZzZXRZKSB7XG4gIHZhciB4LCB5LCBwYXR0ZXJuLCBwYXR0ZXJuSW1hZ2U7XG4gIHZhciBwYXR0ZXJuSW5mbyA9IHtcbiAgICBpZDogaWQsXG4gICAgaW1hZ2VQYXRoOiBpbWFnZVBhdGgsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIG9mZnNldFg6IG9mZnNldFgsXG4gICAgb2Zmc2V0WTogb2Zmc2V0WVxuICB9O1xuXG4gIC8vIElmIHdlIGRvbid0IHlldCBoYXZlIGFuIHN2Z0RlZnMsIHF1ZXVlIHRoZSBwYXR0ZXJuIGFuZCB3YWl0IHVudGlsIHdlIGRvXG4gIHZhciBzdmdEZWZzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jsb2NrbHlTdmdEZWZzJyk7XG4gIGlmICghc3ZnRGVmcykge1xuICAgIHBhdHRlcm5DYWNoZS5hZGRUb1F1ZXVlKHBhdHRlcm5JbmZvKTtcbiAgfSBlbHNlIGlmICghcGF0dGVybkNhY2hlLndhc0NyZWF0ZWQocGF0dGVybkluZm8pKSB7XG4gICAgLy8gYWRkIHRoZSBwYXR0ZXJuXG4gICAgeCA9IHR5cGVvZihvZmZzZXRYKSA9PT0gXCJmdW5jdGlvblwiID8gLW9mZnNldFgoKSA6IC1vZmZzZXRYO1xuICAgIHkgPSB0eXBlb2Yob2Zmc2V0WSkgPT09IFwiZnVuY3Rpb25cIiA/IC1vZmZzZXRZKCkgOiAtb2Zmc2V0WTtcbiAgICBwYXR0ZXJuID0gQmxvY2tseS5jcmVhdGVTdmdFbGVtZW50KCdwYXR0ZXJuJywge1xuICAgICAgaWQ6IGlkLFxuICAgICAgcGF0dGVyblVuaXRzOiAndXNlclNwYWNlT25Vc2UnLFxuICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICB4OiB4LFxuICAgICAgeTogeVxuICAgIH0sIHN2Z0RlZnMpO1xuICAgIHBhdHRlcm5JbWFnZSA9IEJsb2NrbHkuY3JlYXRlU3ZnRWxlbWVudCgnaW1hZ2UnLCB7XG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodFxuICAgIH0sIHBhdHRlcm4pO1xuICAgIHBhdHRlcm5JbWFnZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICd4bGluazpocmVmJyxcbiAgICAgIGltYWdlUGF0aCk7XG5cbiAgICBwYXR0ZXJuQ2FjaGUubWFya0NyZWF0ZWQocGF0dGVybkluZm8pO1xuICB9XG4gIHJldHVybiBpZDtcbn07XG5cbi8qKlxuICogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGEgYmxvY2sgb2YgdGhlIGdpdmVuIHR5cGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgYmxvY2sgdG8gc2VhcmNoIGZvclxuICovXG52YXIgYmxvY2tPZlR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuICB2YXIgYmxvY2tzID0gQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRBbGxCbG9ja3MoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYmxvY2tzW2ldLnR5cGUgPT09IHR5cGUpIHtcbiAgICAgIHJldHVybiBibG9ja3NbaV07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHdpZHRoIG9mIHRoZSBibG9jayBvZiB0aGUgZ2l2ZW4gdHlwZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBibG9jayB0byBzZWFyY2ggZm9yXG4gKi9cbnZhciBibG9ja1dpZHRoID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIGJsb2NrT2ZUeXBlKHR5cGUpLmdldEhlaWdodFdpZHRoKCkud2lkdGg7XG59O1xuXG5mdW5jdGlvbiBhZGRRdWV1ZWRXaGVuUmVhZHkoKSB7XG4gIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jsb2NrbHlTdmdEZWZzJykpIHtcbiAgICBzZXRUaW1lb3V0KGFkZFF1ZXVlZFdoZW5SZWFkeSwgMTAwKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcGF0dGVybkNhY2hlLmFkZFF1ZXVlZFBhdHRlcm5zKCk7XG59XG5cblxuLy8gSW5zdGFsbCBleHRlbnNpb25zIHRvIEJsb2NrbHkncyBsYW5ndWFnZSBhbmQgSmF2YVNjcmlwdCBnZW5lcmF0b3IuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbihibG9ja2x5LCBibG9ja0luc3RhbGxPcHRpb25zKSB7XG4gIHZhciBza2luID0gYmxvY2tJbnN0YWxsT3B0aW9ucy5za2luO1xuICAvLyBjb3VsZCBtYWtlIHRoaXMgc2V0dGFibGUgb24gdGhlIGxldmVsIGlmIEkgbmVlZFxuICB2YXIgSFNWID0gWzAsIDEuMDAsIDAuOThdO1xuXG4gIHZhciBleGlzdGluZ0Jsb2NrcyA9IE9iamVjdC5rZXlzKGJsb2NrbHkuQmxvY2tzKTtcblxuICBPYmplY3Qua2V5cyhsZXZlbHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGxldmVsID0gbGV2ZWxzW2tleV07XG4gICAgZ2VuZXJhdGVKaWdzYXdCbG9ja3NGb3JMZXZlbChibG9ja2x5LCBza2luLCB7XG4gICAgICBpbWFnZTogc2tpbltsZXZlbC5pbWFnZS5uYW1lXSxcbiAgICAgIEhTVjogbGV2ZWwuYmFja2dyb3VuZEhTViB8fCBIU1YsXG4gICAgICB3aWR0aDogbGV2ZWwuaW1hZ2Uud2lkdGgsXG4gICAgICBoZWlnaHQ6IGxldmVsLmltYWdlLmhlaWdodCxcbiAgICAgIG51bUJsb2NrczogbGV2ZWwubnVtQmxvY2tzLFxuICAgICAgbm90Y2hlZEVuZHM6IGxldmVsLm5vdGNoZWRFbmRzLFxuICAgICAgbGV2ZWw6IGtleVxuICAgIH0pO1xuXG4gICAgaWYgKGxldmVsLm51bUJsb2NrcyA9PT0gMCkge1xuICAgICAgLy8gc3RpbGwgd2FudCB0aGUgcGF0dGVybiBmb3IgdGhlIGdob3N0XG4gICAgICB2YXIgcGF0dGVybk5hbWUgPSAncGF0XycgKyBsZXZlbC5pZCArICdBJztcbiAgICAgIGFkZFBhdHRlcm4ocGF0dGVybk5hbWUsIHNraW5bbGV2ZWwuaW1hZ2UubmFtZV0sIGxldmVsLmltYWdlLndpZHRoLFxuICAgICAgICBsZXZlbC5pbWFnZS5oZWlnaHQsIDAsIDApO1xuICAgIH1cbiAgfSk7XG5cbiAgZ2VuZXJhdGVCbGFua0Jsb2NrKGJsb2NrbHksIHNraW4sICdqaWdzYXdfcmVwZWF0JywgWzMyMiwgMC45MCwgMC45NV0sIDEwMCwgdHJ1ZSk7XG4gIGdlbmVyYXRlQmxhbmtCbG9jayhibG9ja2x5LCBza2luLCAnamlnc2F3X2dyZWVuJywgWzE0MCwgMS4wMCwgMC43NF0sIDgwKTtcbiAgZ2VuZXJhdGVCbGFua0Jsb2NrKGJsb2NrbHksIHNraW4sICdqaWdzYXdfYmx1ZScsIFsxODQsIDEuMDAsIDAuNzRdLCA4MCk7XG4gIGdlbmVyYXRlQmxhbmtCbG9jayhibG9ja2x5LCBza2luLCAnamlnc2F3X3B1cnBsZScsIFszMTIsIDAuMzIsIDAuNjJdLCA4MCk7XG5cbiAgLy8gR28gdGhyb3VnaCBhbGwgYWRkZWQgYmxvY2tzLCBhbmQgYWRkIGVtcHR5IGdlbmVyYXRvcnMgZm9yIHRob3NlIHRoYXRcbiAgLy8gd2VyZW4ndCBhbHJlYWR5IGdpdmVuIGdlbmVyYXRvcnNcbiAgdmFyIGdlbmVyYXRvciA9IGJsb2NrbHkuR2VuZXJhdG9yLmdldCgnSmF2YVNjcmlwdCcpO1xuICBibG9ja2x5LkphdmFTY3JpcHQgPSBnZW5lcmF0b3I7XG4gIE9iamVjdC5rZXlzKGJsb2NrbHkuQmxvY2tzKS5mb3JFYWNoKGZ1bmN0aW9uIChibG9jaykge1xuICAgIGlmIChleGlzdGluZ0Jsb2Nrcy5pbmRleE9mKGJsb2NrKSA9PT0gLTEgJiYgIWdlbmVyYXRvcltibG9ja10pIHtcbiAgICAgIGdlbmVyYXRvcltibG9ja10gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnXFxuJztcbiAgICAgIH07XG4gICAgfVxuICB9KTtcblxuICBhZGRRdWV1ZWRXaGVuUmVhZHkoKTtcblxuICBkZWxldGUgYmxvY2tseS5CbG9ja3MucHJvY2VkdXJlc19kZWZyZXR1cm47XG4gIGRlbGV0ZSBibG9ja2x5LkJsb2Nrcy5wcm9jZWR1cmVzX2lmcmV0dXJuO1xufTtcblxuZnVuY3Rpb24gZ2VuZXJhdGVCbGFua0Jsb2NrKGJsb2NrbHksIHNraW4sIG5hbWUsIGhzdiwgd2lkdGgsIGhhc0FwcGVuZCkge1xuICBibG9ja2x5LkJsb2Nrc1tuYW1lXSA9IHtcbiAgICBoZWxwVXJsOiAnJyxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldEhTVi5hcHBseSh0aGlzLCBoc3YpO1xuICAgICAgdGhpcy5hcHBlbmREdW1teUlucHV0KClcbiAgICAgICAgLmFwcGVuZFRpdGxlKG5ldyBibG9ja2x5LkZpZWxkSW1hZ2Uoc2tpbi5ibGFuaywgd2lkdGgsIDU0KSk7XG4gICAgICB0aGlzLnNldFByZXZpb3VzU3RhdGVtZW50KHRydWUpO1xuICAgICAgaWYgKGhhc0FwcGVuZCkge1xuICAgICAgICB0aGlzLmFwcGVuZFN0YXRlbWVudElucHV0KCdjaGlsZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXROZXh0U3RhdGVtZW50KHRydWUpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVKaWdzYXdCbG9ja3NGb3JMZXZlbChibG9ja2x5LCBza2luLCBvcHRpb25zKSB7XG4gIHZhciBpbWFnZSA9IG9wdGlvbnMuaW1hZ2U7XG4gIHZhciB3aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gIHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgdmFyIG51bUJsb2NrcyA9IG9wdGlvbnMubnVtQmxvY2tzO1xuICB2YXIgbGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuICB2YXIgSFNWID0gb3B0aW9ucy5IU1Y7XG4gIC8vIGlmIHRydWUsIGZpcnN0L2xhc3QgYmxvY2sgd2lsbCBzdGlsbCBoYXZlIHByZXZpb3VzL25leHQgbm90Y2hlc1xuICB2YXIgbm90Y2hlZEVuZHMgPSBvcHRpb25zLm5vdGNoZWRFbmRzO1xuXG4gIHZhciBibG9ja0hlaWdodCA9IGhlaWdodCAvIG51bUJsb2NrcztcbiAgdmFyIHRpdGxlV2lkdGggPSB3aWR0aCAtIDIwO1xuICB2YXIgdGl0bGVIZWlnaHQgPSBibG9ja0hlaWdodCAtIDEwO1xuXG4gIHZhciBsZXR0ZXJzID0gJy1BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWic7XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVCbG9jayhibG9ja051bSkge1xuICAgIHZhciBibG9ja05hbWUgPSAnamlnc2F3XycgKyBsZXZlbCArIGxldHRlcnNbYmxvY2tOdW1dO1xuICAgIHZhciBwYXR0ZXJuTmFtZSA9ICdwYXRfJyArIGxldmVsICsgbGV0dGVyc1tibG9ja051bV07XG4gICAgYmxvY2tseS5CbG9ja3NbYmxvY2tOYW1lXSA9IHtcbiAgICAgIGhlbHBVcmw6ICcnLFxuICAgICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldEhTVi5hcHBseSh0aGlzLCBIU1YpO1xuICAgICAgICB0aGlzLmFwcGVuZER1bW15SW5wdXQoKVxuICAgICAgICAgIC5hcHBlbmRUaXRsZShuZXcgYmxvY2tseS5GaWVsZEltYWdlKHNraW4uYmxhbmssIHRpdGxlV2lkdGgsIHRpdGxlSGVpZ2h0KSk7XG4gICAgICAgIHRoaXMuc2V0UHJldmlvdXNTdGF0ZW1lbnQoYmxvY2tOdW0gIT09IDEgfHwgbm90Y2hlZEVuZHMpO1xuICAgICAgICB0aGlzLnNldE5leHRTdGF0ZW1lbnQoYmxvY2tOdW0gIT09IG51bUJsb2NrcyB8fCBub3RjaGVkRW5kcyk7XG4gICAgICAgIHRoaXMuc2V0RmlsbFBhdHRlcm4oXG4gICAgICAgICAgYWRkUGF0dGVybihwYXR0ZXJuTmFtZSwgaW1hZ2UsIHdpZHRoLCBoZWlnaHQsIDAsXG4gICAgICAgICAgICBibG9ja0hlaWdodCAqIChibG9ja051bSAtIDEpKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAxOyBpIDw9IG51bUJsb2NrczsgaSsrKSB7XG4gICAgZ2VuZXJhdGVCbG9jayhpKTtcbiAgfVxufVxuIiwiLy8gbG9jYWxlIGZvciBqaWdzYXdcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuYmxvY2tseS5qaWdzYXdfbG9jYWxlO1xuIiwiLypqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblxudmFyIGNyZWF0ZVRvb2xib3ggPSByZXF1aXJlKCcuLi9ibG9ja191dGlscycpLmNyZWF0ZVRvb2xib3g7XG5cbnZhciBqaWdzYXdCbG9jayA9IGZ1bmN0aW9uICh0eXBlLCB4LCB5LCBjaGlsZCwgY2hpbGRUeXBlKSB7XG4gIHJldHVybiBqaWdzYXdCbG9ja1dpdGhEZWxldGFibGVBdHRyKHR5cGUsIHgsIHksIGNoaWxkLCBjaGlsZFR5cGUsIHRydWUpO1xufTtcblxudmFyIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2sgPSBmdW5jdGlvbiAodHlwZSwgeCwgeSwgY2hpbGQsIGNoaWxkVHlwZSkge1xuICByZXR1cm4gamlnc2F3QmxvY2tXaXRoRGVsZXRhYmxlQXR0cih0eXBlLCB4LCB5LCBjaGlsZCwgY2hpbGRUeXBlLCBmYWxzZSk7XG59O1xuXG52YXIgamlnc2F3QmxvY2tXaXRoRGVsZXRhYmxlQXR0ciA9IGZ1bmN0aW9uICh0eXBlLCB4LCB5LCBjaGlsZCwgY2hpbGRUeXBlLCBkZWxldGFibGUpIHtcbiAgdmFyIGNoaWxkQXR0ciA9ICcnO1xuICB4ID0geCB8fCAwO1xuICB5ID0geSB8fCAwO1xuICBjaGlsZFR5cGUgPSBjaGlsZFR5cGUgfHwgXCJuZXh0XCI7XG4gIGlmIChjaGlsZFR5cGUgPT09ICdzdGF0ZW1lbnQnKSB7XG4gICAgY2hpbGRBdHRyID0gXCIgbmFtZT0nY2hpbGQnXCI7XG4gIH1cbiAgcmV0dXJuICc8YmxvY2sgdHlwZT1cIicgKyB0eXBlICsgJ1wiIGRlbGV0YWJsZT1cIicgKyBkZWxldGFibGUgKyAnXCInICtcbiAgICAnIHg9XCInICsgeCArICdcIicgK1xuICAgICcgeT1cIicgKyB5ICsgJ1wiPicgK1xuICAgIChjaGlsZCA/ICc8JyArIGNoaWxkVHlwZSArIGNoaWxkQXR0ciArICc+JyArIGNoaWxkICsgJzwvJyArIGNoaWxkVHlwZSArICc+JyA6ICcnKSArXG4gICAgJzwvYmxvY2s+Jztcbn07XG5cbi8qKlxuICogVmFsaWRhdGVzIHdoZXRoZXIgcHV6emxlIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBwdXQgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtzdHJpbmdbXX0gbGlzdCBvZiB0eXBlc1xuICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMubGV2ZWwgTGV2ZWwgbnVtYmVyXG4gKiBAUGFyYW0ge251bWJlcn0gb3B0aW9ucy5udW1CbG9ja3MgSG93IG1hbnkgYmxvY2tzIHRoZXJlIGFyZSBpbiB0aGUgbGV2ZWxcbiAqL1xudmFyIHZhbGlkYXRlU2ltcGxlUHV6emxlID0gZnVuY3Rpb24gKHR5cGVzLCBvcHRpb25zKSB7XG4gIHZhciBudW1CbG9ja3M7XG4gIGlmICh0eXBlcykge1xuICAgIG51bUJsb2NrcyA9IHR5cGVzLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGV0dGVycyA9ICctQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonO1xuICAgIHZhciBsZXZlbCA9IG9wdGlvbnMubGV2ZWw7XG4gICAgbnVtQmxvY2tzID0gb3B0aW9ucy5udW1CbG9ja3M7XG5cbiAgICB0eXBlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG51bUJsb2NrczsgaSsrKSB7XG4gICAgICB0eXBlcy5wdXNoKCdqaWdzYXdfJyArIGxldmVsICsgbGV0dGVyc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIHJvb3RzID0gQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRUb3BCbG9ja3MoKTtcbiAgaWYgKHJvb3RzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBkZXB0aCA9IDA7XG4gIHZhciBibG9jayA9IHJvb3RzWzBdO1xuICB3aGlsZSAoZGVwdGggPCBudW1CbG9ja3MpIHtcbiAgICBpZiAoIWJsb2NrIHx8IGJsb2NrLnR5cGUgIT09IHR5cGVzW2RlcHRoXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgY2hpbGRyZW4gPSBibG9jay5nZXRDaGlsZHJlbigpO1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGJsb2NrID0gY2hpbGRyZW5bMF07XG4gICAgZGVwdGgrKztcbiAgfVxuXG4gIC8vIGxhc3QgYmxvY2sgc2hvdWxkbnQgaGF2ZSBjaGlsZHJlblxuICBpZiAoYmxvY2sgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLypcbiAqIENvbmZpZ3VyYXRpb24gZm9yIGFsbCBsZXZlbHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICcxJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdhcHBsZScsXG4gICAgYW5pR2lmVVJMOiAnL3NjcmlwdF9hc3NldHMva18xX2ltYWdlcy9pbnN0cnVjdGlvbl9naWZzL2NsaWNrLWJsb2NrLmdpZicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2FwcGxlJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzQxLCAxLjAwLCAwLjk2OV0sXG4gICAgbnVtQmxvY2tzOiAxLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEppZ3Nhdy5ibG9jazFDbGlja2VkO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfMUEnLCAyMCwgMjApXG4gIH0sXG4gICcyJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdzbWlsZXknLFxuICAgIGFuaUdpZlVSTDogJy9zY3JpcHRfYXNzZXRzL2tfMV9pbWFnZXMvaW5zdHJ1Y3Rpb25fZ2lmcy9kcmFnLWRyb3AuZ2lmJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnc21pbGV5JyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzE4NCwgMS4wMCwgMC43MzNdLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMSxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gYmUgZmluaXNoZWQgZHJhZ1xuICAgICAgICBpZiAoQmxvY2tseS5tYWluQmxvY2tTcGFjZS5kcmFnTW9kZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcG9zID0gQmxvY2tseS5tYWluQmxvY2tTcGFjZS5nZXRBbGxCbG9ja3MoKVswXS5nZXRSZWxhdGl2ZVRvU3VyZmFjZVhZKCk7XG4gICAgICAgIC8vIGhvdyBjbG9zZSB0byBnaG9zdD9cbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMoNDAwIC0gcG9zLngpO1xuICAgICAgICB2YXIgZHkgPSBNYXRoLmFicygxMDAgLSBwb3MueSk7XG4gICAgICAgIHJldHVybiBkeCArIGR5IDwgODA7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18yQScsIDIwLCAyMClcbiAgfSxcbiAgJzMnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ3NuYWlsJyxcbiAgICBhbmlHaWZVUkw6ICcvc2NyaXB0X2Fzc2V0cy9rXzFfaW1hZ2VzL2luc3RydWN0aW9uX2dpZnMvZHJhZy1jb25uZWN0LmdpZicsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ3NuYWlsJyxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDIwMFxuICAgIH0sXG4gICAgYmFja2dyb3VuZEhTVjogWzM2LCAxLjAwLCAwLjk5OV0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDQwMCxcbiAgICAgIHk6IDEwMFxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAyLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbGFyZ2VOb3RjaGVzOiB0cnVlLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKG51bGwsIHtsZXZlbDogMywgbnVtQmxvY2tzOiAyfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18zQScsIDQwMCwgMTAwKSArXG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfM0InLCAxMDAsIDIyMClcbiAgfSxcblxuICAnNCc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnZWxlcGhhbnQnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdlbGVwaGFudCcsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFszMjAsIDAuNjAsIDAuOTk5XSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDIsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA0LCBudW1CbG9ja3M6IDJ9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzRBJywgMTAwLCAxNDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd180QicsIDQwMCwgMjAwKVxuICB9LFxuXG4gICc1Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdmaXNoJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnZmlzaCcsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsyMDksIDAuNTcsIDAuNjAwXSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA1LCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzVBJywgMTAwLCAyMCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzVCJywgMTAwLCAxNDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd181QycsIDEwMCwgMjgwKVxuICB9LFxuXG4gICc2Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdkb2dnaWUnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdkb2dnaWUnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMjUsIDAuNTcsIDAuOTYwXSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA2LCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzZCJywgMTAwLCAyMCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzZBJywgMTAwLCAxNDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd182QycsIDEwMCwgMjgwKVxuICB9LFxuXG4gICc3Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICd0cmVlJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAndHJlZScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsyMzgsIDAuNTEsIDAuOTk5XSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA3LCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzdCJywgMTAwLCAyMCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzdBJywgMTAwLCAxNDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd183QycsIDEwMCwgMjgwKVxuICB9LFxuXG4gICc4Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdmbG93ZXInLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdmbG93ZXInLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbNzUsIDAuODAsIDAuOTk5XSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiA4LCBudW1CbG9ja3M6IDN9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOlxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzhDJywgMTAwLCAyMCkgK1xuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3XzhCJywgMTAwLCAxNDApICtcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd184QScsIDEwMCwgMjgwKVxuICB9LFxuXG4gICc5Jzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdob3VzZScsXG4gICAgYW5pR2lmVVJMOiAnL3NjcmlwdF9hc3NldHMva18xX2ltYWdlcy9pbnN0cnVjdGlvbl9naWZzL2RyYWctZGlzb3JkZXJlZC5naWYnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdob3VzZScsXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAyMDBcbiAgICB9LFxuICAgIGJhY2tncm91bmRIU1Y6IFsxMTAsIDAuNTYsIDAuNjBdLFxuICAgIGdob3N0OiB7XG4gICAgICB4OiA0MDAsXG4gICAgICB5OiAxMDBcbiAgICB9LFxuICAgIG51bUJsb2NrczogMyxcbiAgICByZXF1aXJlZEJsb2NrczogW10sXG4gICAgZnJlZVBsYXk6IGZhbHNlLFxuICAgIG5vdGNoZWRFbmRzOiB0cnVlLFxuICAgIGxhcmdlTm90Y2hlczogdHJ1ZSxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShudWxsLCB7bGV2ZWw6IDksIG51bUJsb2NrczogM30pO1xuICAgICAgfVxuICAgIH0sXG4gICAgc3RhcnRCbG9ja3M6XG4gICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOUInLCAxMDAsIDIwLFxuICAgICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfOUMnLCAwLCAwLFxuICAgICAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd185QScsIDAsIDApKSlcbiAgfSxcblxuICAnMTAnOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2NvbXB1dGVyJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnY29tcHV0ZXInLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMzAwLCAwLjI1LCAwLjgwXSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiAxMCwgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd18xMEEnLCAxMDAsIDIwLFxuICAgICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTBDJywgMCwgMCxcbiAgICAgICAgICB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTBCJywgMCwgMCkpKVxuICB9LFxuXG4gICcxMSc6IHtcbiAgICBpbnN0cnVjdGlvbnNJY29uOiAnYmxvY2tzJyxcbiAgICBpc0sxOiB0cnVlLFxuICAgIGltYWdlOiB7XG4gICAgICBuYW1lOiAnYmxvY2tzJyxcbiAgICAgIHdpZHRoOiAxMzEsXG4gICAgICBoZWlnaHQ6IDI4NlxuICAgIH0sXG4gICAgZ2hvc3Q6IHtcbiAgICAgIHg6IDIwMCxcbiAgICAgIHk6IDEyXG4gICAgfSxcbiAgICBudW1CbG9ja3M6IDAsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBub3RjaGVkRW5kczogdHJ1ZSxcbiAgICBsYXJnZU5vdGNoZXM6IGZhbHNlLFxuICAgIHNuYXBSYWRpdXM6IDMwLFxuICAgIGdvYWw6IHtcbiAgICAgIHN1Y2Nlc3NDb25kaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlU2ltcGxlUHV6emxlKFsnamlnc2F3X3JlcGVhdCcsICdqaWdzYXdfcHVycGxlJyxcbiAgICAgICAgICAnamlnc2F3X2JsdWUnLCAnamlnc2F3X2dyZWVuJ10sIHt9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHN0YXJ0QmxvY2tzOiB1bmRlbGV0YWJsZUppZ3Nhd0Jsb2NrKCdqaWdzYXdfcmVwZWF0JywgMjAsIDIwLFxuICAgICAgdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3X3B1cnBsZScsIDAsIDAsIHVuZGVsZXRhYmxlSmlnc2F3QmxvY2soJ2ppZ3Nhd19ibHVlJykpLCAnc3RhdGVtZW50JyksXG4gICAgdG9vbGJveDogY3JlYXRlVG9vbGJveChcbiAgICAgIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfZ3JlZW4nKVxuICAgIClcbiAgfSxcblxuICAnMTInOiB7XG4gICAgaW5zdHJ1Y3Rpb25zSWNvbjogJ2Jsb2NrcycsXG4gICAgaXNLMTogdHJ1ZSxcbiAgICBpbWFnZToge1xuICAgICAgbmFtZTogJ2Jsb2NrcycsXG4gICAgICB3aWR0aDogMTMxLFxuICAgICAgaGVpZ2h0OiAyODZcbiAgICB9LFxuICAgIGdob3N0OiB7XG4gICAgICB4OiAyMDAsXG4gICAgICB5OiAxMlxuICAgIH0sXG4gICAgbnVtQmxvY2tzOiAwLFxuICAgIHJlcXVpcmVkQmxvY2tzOiBbXSxcbiAgICBmcmVlUGxheTogZmFsc2UsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgbGFyZ2VOb3RjaGVzOiBmYWxzZSxcbiAgICBzbmFwUmFkaXVzOiAzMCxcbiAgICBnb2FsOiB7XG4gICAgICBzdWNjZXNzQ29uZGl0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZVNpbXBsZVB1enpsZShbJ2ppZ3Nhd19yZXBlYXQnLCAnamlnc2F3X3B1cnBsZScsXG4gICAgICAgICAgJ2ppZ3Nhd19ibHVlJywgJ2ppZ3Nhd19ncmVlbiddLCB7fSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczogdW5kZWxldGFibGVKaWdzYXdCbG9jaygnamlnc2F3X3JlcGVhdCcsIDIwLCAyMCksXG4gICAgdG9vbGJveDogY3JlYXRlVG9vbGJveChcbiAgICAgIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfZ3JlZW4nKSArXG4gICAgICBqaWdzYXdCbG9jaygnamlnc2F3X3B1cnBsZScpICtcbiAgICAgIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfYmx1ZScpXG4gICAgKVxuICB9LFxuXG4gIC8vIGFzc2Vzc21lbnRcbiAgJzEzJzoge1xuICAgIGluc3RydWN0aW9uc0ljb246ICdkb2dnaWUnLFxuICAgIGlzSzE6IHRydWUsXG4gICAgaW1hZ2U6IHtcbiAgICAgIG5hbWU6ICdkb2dnaWUnLFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMjAwXG4gICAgfSxcbiAgICBnaG9zdDoge1xuICAgICAgeDogNDAwLFxuICAgICAgeTogMTAwXG4gICAgfSxcbiAgICBiYWNrZ3JvdW5kSFNWOiBbMjUsIDAuNTcsIDAuOTYwXSxcbiAgICBudW1CbG9ja3M6IDMsXG4gICAgcmVxdWlyZWRCbG9ja3M6IFtdLFxuICAgIGZyZWVQbGF5OiBmYWxzZSxcbiAgICBsYXJnZU5vdGNoZXM6IHRydWUsXG4gICAgbm90Y2hlZEVuZHM6IHRydWUsXG4gICAgZ29hbDoge1xuICAgICAgc3VjY2Vzc0NvbmRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGVTaW1wbGVQdXp6bGUobnVsbCwge2xldmVsOiAxMywgbnVtQmxvY2tzOiAzfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGFydEJsb2NrczpcbiAgICAgIGppZ3Nhd0Jsb2NrKCdqaWdzYXdfMTNDJywgMTAwLCAyMCwgamlnc2F3QmxvY2soJ2ppZ3Nhd18xM0InLCAwLCAwLCBqaWdzYXdCbG9jaygnamlnc2F3XzEzQScsIDAsIDApKSlcbiAgfVxufTtcbiJdfQ==
