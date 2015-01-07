// Globals:
//   Blockly

var parseXmlElement = require('./xml').parseElement;
var utils = require('./utils');
var _ = utils.getLodash();
var dom = require('./dom');
var constants = require('./constants.js');
var builder = require('./builder');

/**
* The minimum width of a playable whole blockly game.
*/
var MIN_WIDTH = 900;
var MIN_MOBILE_SHARE_WIDTH = 450;
var MOBILE_NO_PADDING_SHARE_WIDTH = 400;
var WORKSPACE_PLAYSPACE_GAP = 15;

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

  this.enableShowCode = true;
  this.editCode = false;
  this.usingBlockly = true;
  this.cdoSounds = null;
  this.Dialog = null;
  this.editor = null;

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

  // The following properties get their non-default values set by the application.

  /**
  * Whether to alert user to empty blocks, short-circuiting all other tests.
  */
  this.CHECK_FOR_EMPTY_BLOCKS = undefined;

  /**
  * The ideal number of blocks to solve this level.  Users only get 2
  * stars if they use more than this number.
  * @type {!number=}
  */
  this.IDEAL_BLOCK_NUM = undefined;

  /**
  * An array of dictionaries representing required blocks.  Keys are:
  * - test (required): A test whether the block is present, either:
  *   - A string, in which case the string is searched for in the generated code.
  *   - A single-argument function is called on each user-added block
  *     individually.  If any call returns true, the block is deemed present.
  *     "User-added" blocks are ones that are neither disabled or undeletable.
  * - type (required): The type of block to be produced for display to the user
  *   if the test failed.
  * - titles (optional): A dictionary, where, for each KEY-VALUE pair, this is
  *   added to the block definition: <title name="KEY">VALUE</title>.
  * - value (optional): A dictionary, where, for each KEY-VALUE pair, this is
  *   added to the block definition: <value name="KEY">VALUE</value>
  * - extra (optional): A string that should be blacked between the "block"
  *   start and end tags.
  * @type {!Array=}
  */
  this.REQUIRED_BLOCKS = undefined;

  /**
  * The number of required blocks to give hints about at any one time.
  * Set this to Infinity to show all.
  * @type {!number=}
  */
  this.NUM_REQUIRED_BLOCKS_TO_FLAG = undefined;

  /**
  * The number of attempts (how many times the run button has been pressed)
  * @type {?number}
  */
  this.attempts = 0;

  /**
  * Stores the time at init. The delta to current time is used for logging
  * and reporting to capture how long it took to arrive at an attempt.
  * @type {?number}
  */
  this.initTime = undefined;

  /**
  * Enumeration of user program execution outcomes.
  */
  // TODO (br-pair) : this should be this.resultType not ResultType
  this.ResultType = constants.ResultType;

  /**
  * Enumeration of test results.
  */
  // TODO (br-pair) : TestResults shouldn't really live on StudioApp. Places
  // that want this should just require constants themselves.
  this.TestResults = constants.TestResults;

  /**
   * If true, we don't show blockspace. Used when viewing shared levels
   */
  this.hideSource = false;

  /**
   * If true, we're viewing a shared level.
   */
  this.share = false;

  this.onAttempt = undefined;
  this.onContinue = undefined;
  this.onResetPressed = undefined;
  this.backToPreviousLevel = undefined;
  this.sendToPhone = undefined;

  // TODO (br-pair) : should callers instead be the ones binding the context?
  this.onResize = _.bind(this.onResize, this);
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

  // TODO (br-pair) : should callers instead be the ones binding the context?
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

/**
*  Resizes the blockly workspace.
*/
StudioAppClass.prototype.onResize = function() {
  var visualizationColumn = document.getElementById('visualizationColumn');
  var gameWidth = visualizationColumn.getBoundingClientRect().width;

  var blocklyDiv = document.getElementById('blockly');
  var codeWorkspace = document.getElementById('codeWorkspace');

  // resize either blockly or codeWorkspace
  var div = this.editCode ? codeWorkspace : blocklyDiv;

  var divParent = div.parentNode;
  var parentStyle = window.getComputedStyle(divParent);

  var parentWidth = parseInt(parentStyle.width, 10);
  var parentHeight = parseInt(parentStyle.height, 10);

  var headers = document.getElementById('headers');
  var headersHeight = parseInt(window.getComputedStyle(headers).height, 10);

  div.style.top = divParent.offsetTop + 'px';
  var fullWorkspaceWidth = parentWidth - (gameWidth + WORKSPACE_PLAYSPACE_GAP);
  var oldWidth = parseInt(div.style.width, 10) || div.getBoundingClientRect().width;
  div.style.width = fullWorkspaceWidth + 'px';

  // Keep blocks static relative to the right edge in RTL mode
  if (this.usingBlockly && Blockly.RTL && (fullWorkspaceWidth - oldWidth !== 0)) {
    Blockly.mainBlockSpace.getTopBlocks().forEach(function(topBlock) {
      topBlock.moveBy(fullWorkspaceWidth - oldWidth, 0);
    });
  }

  if (this.isRtl()) {
    div.style.marginRight = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  else {
    div.style.marginLeft = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  if (this.editCode) {
    // Position the inner codeTextbox element below the headers
    var codeTextbox = document.getElementById('codeTextbox');
    codeTextbox.style.height = (parentHeight - headersHeight) + 'px';
    codeTextbox.style.width = fullWorkspaceWidth + 'px';
    codeTextbox.style.top = headersHeight + 'px';

    // The outer codeWorkspace element height should match its parent:
    div.style.height = parentHeight + 'px';
  } else {
    // reduce height by headers height because blockly isn't aware of headers
    // and will size its svg element to be too tall
    div.style.height = (parentHeight - headersHeight) + 'px';
  }

  this.resizeHeaders(fullWorkspaceWidth);
};

// |          toolbox-header          | workspace-header  | show-code-header |
// |
// |           toolboxWidth           |
// |                 |         <--------- workspaceWidth ---------->         |
// |         <---------------- fullWorkspaceWidth ----------------->         |
StudioAppClass.prototype.resizeHeaders = function (fullWorkspaceWidth) {
  var minWorkspaceWidthForShowCode = this.editCode ? 250 : 450;
  var toolboxWidth = 0;
  if (this.editCode) {
    // If in the droplet editor, but not using blocks, keep categoryWidth at 0
    if (!this.editCode || this.editor.currentlyUsingBlocks) {
      // Set toolboxWidth based on the block palette width:
      var categories = document.querySelector('.droplet-palette-wrapper');
      toolboxWidth = parseInt(window.getComputedStyle(categories).width, 10);
    }
  } else if (this.usingBlockly) {
    toolboxWidth = Blockly.mainBlockSpaceEditor.getToolboxWidth();
  }

  var showCodeHeader = document.getElementById('show-code-header');
  var showCodeWidth = 0;
  if (this.enableShowCode &&
      (fullWorkspaceWidth - toolboxWidth > minWorkspaceWidthForShowCode)) {
    showCodeWidth = parseInt(window.getComputedStyle(showCodeHeader).width, 10);
    showCodeHeader.style.display = "";
  } else {
    showCodeHeader.style.display = "none";
  }

  document.getElementById('headers').style.width = fullWorkspaceWidth + 'px';
  document.getElementById('toolbox-header').style.width = toolboxWidth + 'px';
  document.getElementById('workspace-header').style.width =
    (fullWorkspaceWidth - toolboxWidth - showCodeWidth) + 'px';
};

/**
* Highlight the block (or clear highlighting).
* @param {?string} id ID of block that triggered this action.
* @param {boolean} spotlight Optional.  Highlight entire block if true
*/
StudioAppClass.prototype.highlight = function(id, spotlight) {
  if (this.usingBlockly) {
    if (id) {
      var m = id.match(/^block_id_(\d+)$/);
      if (m) {
        id = m[1];
      }
    }

    Blockly.mainBlockSpace.highlightBlock(id, spotlight);
  }
};

/**
* Remove highlighting from all blocks
*/
StudioAppClass.prototype.clearHighlighting = function () {
  this.highlight(null);
};

/**
* Display feedback based on test results.  The test results must be
* explicitly provided.
* @param {{feedbackType: number}} Test results (a constant property of
*     StudioApp.TestResults).
*/
StudioAppClass.prototype.displayFeedback = function(options) {
  options.Dialog = this.Dialog;
  options.onContinue = this.onContinue;
  options.backToPreviousLevel = this.backToPreviousLevel;
  options.sendToPhone = this.sendToPhone;

  // Special test code for edit blocks.
  if (options.level.edit_blocks) {
    options.feedbackType = this.TestResults.EDIT_BLOCKS;
  }

  this.feedback_.displayFeedback(options);
};

/**
 *
 */
StudioAppClass.prototype.getTestResults = function(levelComplete, options) {
  return this.feedback_.getTestResults(levelComplete, options);
};

/**
* Report back to the server, if available.
* @param {object} options - parameter block which includes:
* {string} app The name of the application.
* {number} id A unique identifier generated when the page was loaded.
* {string} level The ID of the current level.
* {number} result An indicator of the success of the code.
* {number} testResult More specific data on success or failure of code.
* {string} program The user program, which will get URL-encoded.
* {function} onComplete Function to be called upon completion.
*/
StudioAppClass.prototype.report = function(options) {
  // copy from options: app, level, result, testResult, program, onComplete
  var report = options;
  report.pass = this.feedback_.canContinueToNextLevel(options.testResult);
  report.time = ((new Date().getTime()) - this.initTime);
  report.attempt = this.attempts;
  report.lines = this.feedback_.getNumBlocksUsed();

  // If hideSource is enabled, the user is looking at a shared level that
  // they cannot have modified. In that case, don't report it to the service
  // or call the onComplete() callback expected. The app will just sit
  // there with the Reset button as the only option.
  var self = this;
  if (!(this.hideSource && this.share)) {
    var onAttemptCallback = (function() {
      return function(builderDetails) {
        for (var option in builderDetails) {
          report[option] = builderDetails[option];
        }
        self.onAttempt(report);
      };
    })();

    // If this is the level builder, go to builderForm to get more info from
    // the level builder.
    if (options.builder) {
      builder.builderForm(onAttemptCallback);
    } else {
      onAttemptCallback();
    }
  }
};

/**
* Click the reset button.  Reset the application.
*/
StudioAppClass.prototype.resetButtonClick = function() {
  this.onResetPressed();
  this.toggleRunReset('run');
  this.clearHighlighting();
  if (this.usingBlockly) {
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    Blockly.mainBlockSpace.traceOn(false);
  }
  this.reset(false);
};

/**
* Add count of blocks used.
*/
StudioAppClass.prototype.updateBlockCount = function() {
  // If the number of block used is bigger than the ideal number of blocks,
  // set it to be yellow, otherwise, keep it as black.
  var element = document.getElementById('blockUsed');
  if (this.IDEAL_BLOCK_NUM < this.feedback_.getNumCountableBlocks()) {
    element.className = "block-counter-overflow";
  } else {
    element.className = "block-counter-default";
  }

  // Update number of blocks used.
  if (element) {
    element.innerHTML = '';  // Remove existing children or text.
    element.appendChild(document.createTextNode(
      this.feedback_.getNumCountableBlocks()));
  }
};
