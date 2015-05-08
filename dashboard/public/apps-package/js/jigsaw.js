require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({99:[function(require,module,exports){
(function (global){
var appMain = require('../appMain');
window.Jigsaw = require('./jigsaw');
if (typeof global !== 'undefined') {
  global.Jigsaw = window.Jigsaw;
}
var blocks = require('./blocks');
var levels = require('./levels');
var skins = require('./skins');

window.jigsawMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Jigsaw, levels, options);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../appMain":5,"./blocks":95,"./jigsaw":97,"./levels":98,"./skins":100}],100:[function(require,module,exports){
/**
 * Load Skin for Jigsaw.
 */

var skinsBase = require('../skins');

var CONFIGS = {

  jigsaw: {
  }

};

exports.load = function(assetUrl, id) {
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

},{"../skins":212}],97:[function(require,module,exports){
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

  var notchPathLeft = 'l ' +
    notchWidthA + ',' + notchHeight + ' ' +
    notchWidthB + ',0 ' +
    notchWidthA + ',-' + notchHeight;
  var notchPathRight = 'l ' +
    '-' + notchWidthA + ',' + notchHeight + ' ' +
    '-' + notchWidthB + ',0 ' +
    '-' + notchWidthA + ',-' + notchHeight;
  // Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
  // Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

  var notchHighlightHeight = notchHeight; //4;
  var notchHighlightWidthA = notchWidthA + 0.5; //6.5;
  var notchHighlightWidthB = notchWidthB - 1; //2;

  var notchPathLeftHighlight = 'l ' +
    notchHighlightWidthA + ',' + notchHighlightHeight + ' ' +
    notchHighlightWidthB + ',0 ' +
    notchHighlightWidthA + ',-' + notchHighlightHeight;
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

var loadLevel = function() {
  // Load maps.
  // Override scalars.
  for (var key in level.scale) {
    Jigsaw.scale[key] = level.scale[key];
  }

  Jigsaw.MAZE_WIDTH = 0;
  Jigsaw.MAZE_HEIGHT = 0;

  Jigsaw.block1Clicked = false;
};

var drawMap = function() {
  var i, x, y, k, tile;

  // Hide the left column and the resize bar.
  var visualizationColumn = document.getElementById('visualizationColumn');
  visualizationColumn.style.display = 'none';
  var visualizationResizeBar = document.getElementById('visualizationResizeBar');
  visualizationResizeBar.style.display = 'none';

  // account for toolbox if there
  var toolboxWidth = -Blockly.mainBlockSpace.getMetrics().viewLeft;

  if (level.ghost) {
    var svg = document.querySelectorAll(".blocklySvg")[0];
    var image = Blockly.createSvgElement('rect', {
      fill: "url(#pat_" + level.id + "A)",
      "fill-opacity": "0.2",
      width: level.image.width,
      height: level.image.height,
      transform: "translate(" + (toolboxWidth + level.ghost.x) + ", " +
        level.ghost.y + ")"
    });
    // we want it to be first, so it's behind everything
    svg.insertBefore(image, svg.childNodes[0]);
  }
};

/**
 * Initialize Blockly and the Jigsaw app.  Called on page load.
 */
Jigsaw.init = function(config) {
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
      controls: require('./controls.html.ejs')({assetUrl: studioApp.assetUrl}),
      editCode: level.editCode,
      blockCounterClass: 'block-counter-default'
    }
  });

  // TODO (br-pair) : I think this is something that's happening in all apps?
  config.loadAudio = function() {
    studioApp.loadAudio(skin.winSound, 'win');
    studioApp.loadAudio(skin.startSound, 'start');
    studioApp.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
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
  Jigsaw.successListener = Blockly.mainBlockSpaceEditor.addChangeListener(function(evt) {
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
var displayFeedback = function() {
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
Jigsaw.onReportComplete = function(response) {
  Jigsaw.response = response;
  Jigsaw.waitingForReport = false;
  displayFeedback();
};

/**
 * Execute the user's code.  Heaven help us...
 */
Jigsaw.execute = function() {
  // execute is a no-op for jigsaw
};

Jigsaw.onPuzzleComplete = function() {

  // If we know they succeeded, mark levelComplete true
  // Note that we have not yet animated the succesful run
  var levelComplete = (Jigsaw.result == ResultType.SUCCESS);

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

},{"../StudioApp":4,"../dom":63,"../skins":212,"../templates/page.html.ejs":237,"./controls.html.ejs":96}],96:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/current/jigsaw') ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/jigsaw":266,"ejs":279}],95:[function(require,module,exports){
/**
 * Blockly App: Jigsaw
 *
 * Copyright 2013 Code.org
 *
 */
'use strict';

var msg = require('../../locale/current/jigsaw');
var dom = require('../dom');
var levels = require('./levels');

var patternCache = {
  queued: [],
  created: {},

  /**
   * Stick an item in our queue
   */
  addToQueue: function (patternInfo) {
    this.queued.push(patternInfo);
  },

  /**
   * Add all the svg patterns we've queued up.
   */
  addQueuedPatterns: function () {
    this.queued.forEach(function (pattern) {
      addPattern(pattern.id, pattern.imagePath, pattern.width, pattern.height,
        pattern.offsetX, pattern.offsetY);
    });
    this.queued = [];
  },

  /**
   * Have we already created an svg element for this patternInfo?  Throws if
   * we ask with a patternInfo that has the same id but different attributes.
   */
  wasCreated: function (patternInfo) {
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
  markCreated: function (patternInfo) {
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
var addPattern = function (id, imagePath, width, height, offsetX, offsetY) {
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
    x = typeof(offsetX) === "function" ? -offsetX() : -offsetX;
    y = typeof(offsetY) === "function" ? -offsetY() : -offsetY;
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
    patternImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      imagePath);

    patternCache.markCreated(patternInfo);
  }
  return id;
};

/**
 * Search the workspace for a block of the given type
 *
 * @param {string} type The type of the block to search for
 */
var blockOfType = function (type) {
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
var blockWidth = function (type) {
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
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  // could make this settable on the level if I need
  var HSV = [0, 1.00, 0.98];

  var existingBlocks = Object.keys(blockly.Blocks);

  Object.keys(levels).forEach(function(key) {
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
      addPattern(patternName, skin[level.image.name], level.image.width,
        level.image.height, 0, 0);
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
    init: function () {
      this.setHSV.apply(this, hsv);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldImage(skin.blank, width, 54));
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
      init: function () {
        this.setHSV.apply(this, HSV);
        this.appendDummyInput()
          .appendTitle(new blockly.FieldImage(skin.blank, titleWidth, titleHeight));
        this.setPreviousStatement(blockNum !== 1 || notchedEnds);
        this.setNextStatement(blockNum !== numBlocks || notchedEnds);
        this.setFillPattern(
          addPattern(patternName, image, width, height, 0,
            blockHeight * (blockNum - 1)));
      }
    };
  }

  for (var i = 1; i <= numBlocks; i++) {
    generateBlock(i);
  }
}

},{"../../locale/current/jigsaw":266,"../dom":63,"./levels":98}],266:[function(require,module,exports){
/*jigsaw*/ module.exports = window.blockly.appLocale;
},{}],98:[function(require,module,exports){
/*jshint multistr: true */

var createToolbox = require('../block_utils').createToolbox;

var jigsawBlock = function (type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, true);
};

var undeletableJigsawBlock = function (type, x, y, child, childType) {
  return jigsawBlockWithDeletableAttr(type, x, y, child, childType, false);
};

var jigsawBlockWithDeletableAttr = function (type, x, y, child, childType, deletable) {
  var childAttr = '';
  x = x || 0;
  y = y || 0;
  childType = childType || "next";
  if (childType === 'statement') {
    childAttr = " name='child'";
  }
  return '<block type="' + type + '" deletable="' + deletable + '"' +
    ' x="' + x + '"' +
    ' y="' + y + '">' +
    (child ? '<' + childType + childAttr + '>' + child + '</' + childType + '>' : '') +
    '</block>';
};

/**
 * Validates whether puzzle has been successfully put together.
 *
 * @param {string[]} list of types
 * @param {number} options.level Level number
 * @Param {number} options.numBlocks How many blocks there are in the level
 */
var validateSimplePuzzle = function (types, options) {
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
      successCondition: function () {
        return Jigsaw.block1Clicked;
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_1A', 20, 20)
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
      successCondition: function () {
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
    startBlocks:
      undeletableJigsawBlock('jigsaw_2A', 20, 20)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 3, numBlocks: 2});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_3A', 400, 100) +
      undeletableJigsawBlock('jigsaw_3B', 100, 220)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 4, numBlocks: 2});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_4A', 100, 140) +
      undeletableJigsawBlock('jigsaw_4B', 400, 200)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 5, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_5A', 100, 20) +
      undeletableJigsawBlock('jigsaw_5B', 100, 140) +
      undeletableJigsawBlock('jigsaw_5C', 100, 280)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 6, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_6B', 100, 20) +
      undeletableJigsawBlock('jigsaw_6A', 100, 140) +
      undeletableJigsawBlock('jigsaw_6C', 100, 280)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 7, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_7B', 100, 20) +
      undeletableJigsawBlock('jigsaw_7A', 100, 140) +
      undeletableJigsawBlock('jigsaw_7C', 100, 280)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 8, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_8C', 100, 20) +
      undeletableJigsawBlock('jigsaw_8B', 100, 140) +
      undeletableJigsawBlock('jigsaw_8A', 100, 280)
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 9, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_9B', 100, 20,
        undeletableJigsawBlock('jigsaw_9C', 0, 0,
          undeletableJigsawBlock('jigsaw_9A', 0, 0)))
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 10, numBlocks: 3});
      }
    },
    startBlocks:
      undeletableJigsawBlock('jigsaw_10A', 100, 20,
        undeletableJigsawBlock('jigsaw_10C', 0, 0,
          undeletableJigsawBlock('jigsaw_10B', 0, 0)))
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
      successCondition: function () {
        return validateSimplePuzzle(['jigsaw_repeat', 'jigsaw_purple',
          'jigsaw_blue', 'jigsaw_green'], {});
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_repeat', 20, 20,
      undeletableJigsawBlock('jigsaw_purple', 0, 0, undeletableJigsawBlock('jigsaw_blue')), 'statement'),
    toolbox: createToolbox(
      jigsawBlock('jigsaw_green')
    )
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
      successCondition: function () {
        return validateSimplePuzzle(['jigsaw_repeat', 'jigsaw_purple',
          'jigsaw_blue', 'jigsaw_green'], {});
      }
    },
    startBlocks: undeletableJigsawBlock('jigsaw_repeat', 20, 20),
    toolbox: createToolbox(
      jigsawBlock('jigsaw_green') +
      jigsawBlock('jigsaw_purple') +
      jigsawBlock('jigsaw_blue')
    )
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
      successCondition: function () {
        return validateSimplePuzzle(null, {level: 13, numBlocks: 3});
      }
    },
    startBlocks:
      jigsawBlock('jigsaw_13C', 100, 20, jigsawBlock('jigsaw_13B', 0, 0, jigsawBlock('jigsaw_13A', 0, 0)))
  }
};

},{"../block_utils":32}]},{},[99]);
