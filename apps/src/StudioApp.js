// Globals:
//   Blockly

var parseXmlElement = require('./xml').parseElement;
var utils = require('./utils');
var _ = utils.getLodash();
var dom = require('./dom');

var StudioAppClass = function () {
  this.feedback_ = null;

  /**
  * The parent directory of the apps. Contains common.js.
  */
  this.BASE_URL = undefined;

  /**
  * If truthy, a version number to be appended to asset urls.
  */
  this.CACHE_BUST = undefined;

  /**
  * The current locale code.
  */
  this.LOCALE = 'en_us';

  this.editCode = false;
  this.usingBlockly = true;
  this.cdoSounds = null;
  this.Dialog = null;

  // TODO (br-pair) : Make these look like variables, not constants.
  this.BLOCK_X_COORDINATE = 70;
  this.BLOCK_Y_COORDINATE = 30;
  this.BLOCK_Y_COORDINATE_INTERVAL = 200;

  // TODO (br-pair) : Make these look like variables, not constants.
  // @type {string} for all of these
  this.ICON = undefined;
  this.SMALL_ICON = undefined;
  this.WIN_ICON = undefined;
  this.FAILURE_ICON = undefined;
};

module.exports = StudioAppClass;

/**
 * Configure StudioAppClass options
 */
StudioAppClass.prototype.configure = function (options) {
  this.BASE_URL = options.baseUrl;
  this.CACHE_BUST = options.cacheBust;
  this.LOCALE = options.locale || this.LOCALE;
  // NOTE: editCode (which currently implies droplet) and usingBlockly are
  // currently mutually exclusive.
  this.editCode = options.level && options.level.editCode;
  this.usingBlockly = !this.editCode;
  this.cdoSounds = options.cdoSounds;
  this.Dialog = options.Dialog;

  this.assetUrl = _.bind(this.assetUrl_, this);
};

/**
 * Get the url of path appended to BASE_URL
 */
StudioAppClass.prototype.assetUrl_ = function (path) {
  if (this.BASE_URL === undefined) {
    throw new Error('StudioAppClass BASE_URL has not been set. ' +
      'Call configure() first');
  }
  return this.BASE_URL + path;
};

/**
 * Reset the playing field to the start position and kill any pending
 * animation tasks.  This will typically be replaced by an application.
 * @param {boolean} shouldPlayOpeningAnimation True if an opening animation is
 *   to be played.
 */
StudioAppClass.prototype.reset = function (shouldPlayOpeningAnimation) {
  // TODO (bbuchanan): Look for comon reset logic we can pull here
  // Override in app subclass
};


/**
 * Override to change run behavior.
 */
StudioAppClass.prototype.runButtonClick = function() {};

/**
 * Toggle whether run button or reset button is shown
 * @param {string} button Button to show, either "run" or "reset"
 */
StudioAppClass.prototype.toggleRunReset = function(button) {
  var showRun = (button === 'run');
  if (button !== 'run' && button !== 'reset') {
    throw "Unexpected input";
  }

  var run = document.getElementById('runButton');
  var reset = document.getElementById('resetButton');
  run.style.display = showRun ? 'inline-block' : 'none';
  run.disabled = !showRun;
  reset.style.display = !showRun ? 'inline-block' : 'none';
  reset.disabled = showRun;
};

/**
 *
 */
StudioAppClass.prototype.loadAudio = function(filenames, name) {
  if (this.usingBlockly) {
    Blockly.loadAudio_(filenames, name);
  } else if (this.cdoSounds) {
    var regOpts = { id: name };
    for (var i = 0; i < filenames.length; i++) {
      var filename = filenames[i];
      var ext = filename.match(/\.(\w+)(\?.*)?$/);
      if (ext) {
        // Extend regOpts so regOpts.mp3 = 'file.mp3'
        regOpts[ext[1]] = filename;
      }
    }
    this.cdoSounds.register(regOpts);
  }
};

/**
 *
 */
StudioAppClass.prototype.playAudio = function(name, options) {
  options = options || {};
  var defaultOptions = {volume: 0.5};
  var newOptions = utils.extend(defaultOptions, options);
  if (this.usingBlockly) {
    Blockly.playAudio(name, newOptions);
  } else if (this.cdoSounds) {
    this.cdoSounds.play(name, newOptions);
  }
};

/**
 *
 */
StudioAppClass.prototype.stopLoopingAudio = function(name) {
  if (this.usingBlockly) {
    Blockly.stopLoopingAudio(name);
  } else if (this.cdoSounds) {
    this.cdoSounds.stopLoopingAudio(name);
  }
};

/**
* @param {Object} options Configuration parameters for Blockly. Parameters are
* optional and include:
*  - {string} path The root path to the /apps directory, defaults to the
*    the directory in which this script is located.
*  - {boolean} rtl True if the current language right to left.
*  - {DomElement} toolbox The element in which to insert the toolbox,
*    defaults to the element with 'toolbox'.
*  - {boolean} trashcan True if the trashcan should be displayed, defaults to
*    true.
* @param {DomElement} div The parent div in which to insert Blockly.
*/
StudioAppClass.prototype.inject = function(div, options) {
  var defaults = {
    assetUrl: this.assetUrl,
    rtl: this.isRtl(),
    toolbox: document.getElementById('toolbox'),
    trashcan: true
  };
  Blockly.inject(div, utils.extend(defaults, options));
};

/**
 * Returns true if the current HTML page is in right-to-left language mode.
 */
StudioAppClass.prototype.isRtl = function() {
  var head = document.getElementsByTagName('head')[0];
  if (head && head.parentElement) {
    var dir = head.parentElement.getAttribute('dir');
    return (dir && dir.toLowerCase() === 'rtl');
  } else {
    return false;
  }
};

/**
 * @return {string} Locale direction string based on app direction.
 */
StudioAppClass.prototype.localeDirection = function() {
  return (this.isRtl() ? 'rtl' : 'ltr');
};

/**
* Initialize Blockly for a readonly iframe.  Called on page load.
* XML argument may be generated from the console with:
* Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)).slice(5, -6)
*/
StudioAppClass.prototype.initReadonly = function(options) {
  Blockly.inject(document.getElementById('blockly'), {
    assetUrl: this.assetUrl,
    readOnly: true,
    rtl: this.isRtl(),
    scrollbars: false
  });
  this.loadBlocks(options.blocks);
};

/**
* Load the editor with blocks.
* @param {string} blocksXml Text representation of blocks.
*/
StudioAppClass.prototype.loadBlocks = function(blocksXml) {
  var xml = parseXmlElement(blocksXml);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
};

/**
* Spreading out the top blocks in workspace if it is not already set.
* @param {string} startBlocks String representation of start blocks xml.
* @param {Object.<Object>} arrangement A map from block type to position.
* @return {string} String representation of start blocks xml, including
*    block position.
*/
StudioAppClass.prototype.arrangeBlockPosition = function(startBlocks, arrangement) {
  var type, arrangeX, arrangeY;
  var xml = parseXmlElement(startBlocks);
  var xmlChildNodes = this.sortBlocksByVisibility(xml.childNodes);
  var numberOfPlacedBlocks = 0;
  for (var x = 0, xmlChild; xmlChildNodes && x < xmlChildNodes.length; x++) {
    xmlChild = xmlChildNodes[x];

    // Only look at element nodes
    if (xmlChild.nodeType === 1) {
      // look to see if we have a predefined arrangement for this type
      type = xmlChild.getAttribute('type');
      arrangeX = arrangement && arrangement[type] ? arrangement[type].x : null;
      arrangeY = arrangement && arrangement[type] ? arrangement[type].y : null;

      xmlChild.setAttribute('x', xmlChild.getAttribute('x') || arrangeX ||
        this.BLOCK_X_COORDINATE);
      xmlChild.setAttribute('y', xmlChild.getAttribute('y') || arrangeY ||
        this.BLOCK_Y_COORDINATE +
      this.BLOCK_Y_COORDINATE_INTERVAL * numberOfPlacedBlocks);
      numberOfPlacedBlocks += 1;
    }
  }
  return Blockly.Xml.domToText(xml);
};

/**
* Sorts the array of xml blocks, moving visible blocks to the front.
* @param {Array.<Element>} xmlBlocks An array of xml blocks.
* @return {Array.<Element>} A sorted array of xml blocks, with all
*     visible blocks preceding all hidden blocks.
*/
StudioAppClass.prototype.sortBlocksByVisibility = function(xmlBlocks) {
  var visibleXmlBlocks = [];
  var hiddenXmlBlocks = [];
  for (var x = 0, xmlBlock; xmlBlocks && x < xmlBlocks.length; x++) {
    xmlBlock = xmlBlocks[x];
    if (xmlBlock.getAttribute &&
        xmlBlock.getAttribute('uservisible') === 'false') {
      hiddenXmlBlocks.push(xmlBlock);
    } else {
      visibleXmlBlocks.push(xmlBlock);
    }
  }
  return visibleXmlBlocks.concat(hiddenXmlBlocks);
};


StudioAppClass.prototype.showInstructions_ = function(level, autoClose) {
  var instructionsDiv = document.createElement('div');
  instructionsDiv.innerHTML = require('./templates/instructions.html')(level);

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      ok: true
    }
  });

  instructionsDiv.appendChild(buttons);

  var dialog = this.feedback_.createModalDialogWithIcon({
    Dialog: this.Dialog,
    contentDiv: instructionsDiv,
    icon: this.ICON,
    defaultBtnSelector: '#ok-button'
  });

  if (autoClose) {
    setTimeout(function() {
      dialog.hide();
    }, 32000);
  }

  var okayButton = buttons.querySelector('#ok-button');
  if (okayButton) {
    dom.addClickTouchEvent(okayButton, function() {
      if (dialog) {
        dialog.hide();
      }
    });
  }

  dialog.show();
};
