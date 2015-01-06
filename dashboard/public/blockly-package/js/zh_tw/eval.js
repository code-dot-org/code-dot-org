(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */

    /**
     * Class for dimension change detection.
     *
     * @param {Element|Element[]|Elements|jQuery} element
     * @param {Function} callback
     *
     * @constructor
     */
    module.exports = function(element, callback) {
        /**
         *
         * @constructor
         */
        function EventQueue() {
            this.q = [];
            this.add = function(ev) {
                this.q.push(ev);
            };

            var i, j;
            this.call = function() {
                for (i = 0, j = this.q.length; i < j; i++) {
                    this.q[i].call();
                }
            };
        }

        /**
         * @param {HTMLElement} element
         * @param {String}      prop
         * @returns {String|Number}
         */
        function getComputedStyle(element, prop) {
            if (element.currentStyle) {
                return element.currentStyle[prop];
            } else if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(prop);
            } else {
                return element.style[prop];
            }
        }

        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
            if (!element.resizedAttached) {
                element.resizedAttached = new EventQueue();
                element.resizedAttached.add(resized);
            } else if (element.resizedAttached) {
                element.resizedAttached.add(resized);
                return;
            }

            element.resizeSensor = document.createElement('div');
            element.resizeSensor.className = 'resize-sensor';
            var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: scroll; z-index: -1; visibility: hidden;';
            var styleChild = 'position: absolute; left: 0; top: 0;';

            element.resizeSensor.style.cssText = style;
            element.resizeSensor.innerHTML =
                '<div class="resize-sensor-expand" style="' + style + '">' +
                    '<div style="' + styleChild + '"></div>' +
                '</div>' +
                '<div class="resize-sensor-shrink" style="' + style + '">' +
                    '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
                '</div>';
            element.appendChild(element.resizeSensor);

            if ('absolute' !== getComputedStyle(element, 'position')) {
                element.style.position = 'relative';
            }

            var expand = element.resizeSensor.childNodes[0];
            var expandChild = expand.childNodes[0];
            var shrink = element.resizeSensor.childNodes[1];
            var shrinkChild = shrink.childNodes[0];

            var lastWidth, lastHeight;

            var reset = function() {
                expandChild.style.width = expand.offsetWidth + 10 + 'px';
                expandChild.style.height = expand.offsetHeight + 10 + 'px';
                expand.scrollLeft = expand.scrollWidth;
                expand.scrollTop = expand.scrollHeight;
                shrink.scrollLeft = shrink.scrollWidth;
                shrink.scrollTop = shrink.scrollHeight;
                lastWidth = element.offsetWidth;
                lastHeight = element.offsetHeight;
            };

            reset();

            var changed = function() {
                element.resizedAttached.call();
            };

            var addEvent = function(el, name, cb) {
                if (el.attachEvent) {
                    el.attachEvent('on' + name, cb);
                } else {
                    el.addEventListener(name, cb);
                }
            };

            addEvent(expand, 'scroll', function() {
                if (element.offsetWidth > lastWidth || element.offsetHeight > lastHeight) {
                    changed();
                }
                reset();
            });

            addEvent(shrink, 'scroll',function() {
                if (element.offsetWidth < lastWidth || element.offsetHeight < lastHeight) {
                    changed();
                }
                reset();
            });
        }

        if ('array' === typeof element ||
          ('undefined' !== typeof jQuery && element instanceof jQuery) || //jquery
          ('undefined' !== typeof Elements && element instanceof Elements) //mootools
        ) {
            var i = 0, j = element.length;
            for (; i < j; i++) {
                attachResizeEvent(element[i], callback);
            }
        } else {
            attachResizeEvent(element, callback);
        }
    };

},{}],2:[function(require,module,exports){
(function (global){
var utils = require('./utils');
var requiredBlockUtils = require('./required_block_utils');
window.BlocklyApps = require('./base');

if (typeof global !== 'undefined') {
  global.BlocklyApps = window.BlocklyApps;
}

var addReadyListener = require('./dom').addReadyListener;
var blocksCommon = require('./blocksCommon');

function StubDialog() {
  for (var argument in arguments) {
    console.log(argument);
  }
}
StubDialog.prototype.show = function() {
  console.log("Showing Dialog");
  console.log(this);
};
StubDialog.prototype.hide = function() {
  console.log("Hiding Dialog");
  console.log(this);
};

module.exports = function(app, levels, options) {

  // If a levelId is not provided, then options.level is specified in full.
  // Otherwise, options.level overrides resolved level on a per-property basis.
  if (options.levelId) {
    var level = levels[options.levelId];
    options.level = options.level || {};
    options.level.id = options.levelId;
    for (var prop in options.level) {
      level[prop] = options.level[prop];
    }

    if (options.level.levelBuilderRequiredBlocks) {
      level.requiredBlocks = requiredBlockUtils.makeTestsFromBuilderRequiredBlocks(
          options.level.levelBuilderRequiredBlocks);
    }

    options.level = level;
  }

  options.Dialog = options.Dialog || StubDialog;

  BlocklyApps.BASE_URL = options.baseUrl;
  BlocklyApps.CACHE_BUST = options.cacheBust;
  BlocklyApps.LOCALE = options.locale || BlocklyApps.LOCALE;
  // NOTE: editCode (which currently implies droplet) and usingBlockly are
  // currently mutually exclusive.
  BlocklyApps.editCode = options.level && options.level.editCode;
  BlocklyApps.usingBlockly = !BlocklyApps.editCode;
  BlocklyApps.cdoSounds = options.cdoSounds;

  BlocklyApps.assetUrl = function(path) {
    var url = options.baseUrl + path;
    /*if (BlocklyApps.CACHE_BUST) {
      return url + '?v=' + options.cacheBust;
    } else {*/
      return url;
    /*}*/
  };

  options.skin = options.skinsModule.load(BlocklyApps.assetUrl, options.skinId);

  if (BlocklyApps.usingBlockly) {
    var blockInstallOptions = {
      skin: options.skin,
      isK1: options.level && options.level.isK1
    };

    if (options.level && options.level.edit_blocks) {
      utils.wrapNumberValidatorsForLevelBuilder();
    }

    blocksCommon.install(Blockly, blockInstallOptions);
    options.blocksModule.install(Blockly, blockInstallOptions);
  }

  addReadyListener(function() {
    if (options.readonly) {
      if (app.initReadonly) {
        app.initReadonly(options);
      } else {
        BlocklyApps.initReadonly(options);
      }
    } else {
      app.init(options);
      if (options.onInitialize) {
        options.onInitialize();
      }
    }
  });
};

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./base":3,"./blocksCommon":5,"./dom":10,"./required_block_utils":32,"./utils":48}],3:[function(require,module,exports){
/**
 * Blockly Apps: Common code
 *
 * Copyright 2013 Google Inc.
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

/**
 * @fileoverview Common support code for Blockly apps.
 * @author fraser@google.com (Neil Fraser)
 */
"use strict";
var BlocklyApps = module.exports;
var msg = require('../locale/zh_tw/common');
var parseXmlElement = require('./xml').parseElement;
var feedback = require('./feedback.js');
var dom = require('./dom');
var utils = require('./utils');
var blockUtils = require('./block_utils');
var builder = require('./builder');
var Slider = require('./slider');
var _ = utils.getLodash();
var constants = require('./constants.js');

//TODO: These should be members of a BlocklyApp instance.
var onAttempt;
var onContinue;
var onResetPressed;
var backToPreviousLevel;

/**
 * The parent directory of the apps. Contains common.js.
 */
BlocklyApps.BASE_URL = undefined;

/**
 * If truthy, a version number to be appended to asset urls.
 */
BlocklyApps.CACHE_BUST = undefined;

/**
 * The current locale code.
 */
BlocklyApps.LOCALE = 'en_us';

/**
 * The minimum width of a playable whole blockly game.
 */
BlocklyApps.MIN_WIDTH = 900;
BlocklyApps.MIN_MOBILE_SHARE_WIDTH = 450;
BlocklyApps.MOBILE_NO_PADDING_SHARE_WIDTH = 400;
var WORKSPACE_PLAYSPACE_GAP = 15;

/**
 * Treat mobile devices with screen.width less than the value below as phones.
 */
BlocklyApps.MAX_PHONE_WIDTH = 500;

/**
 * If the user presses backspace, stop propagation - this prevents blockly
 * from eating the backspace key
 * @param {!Event} e Keyboard event.
 */
var codeKeyDown = function(e) {
  if (e.keyCode == 8) {
    e.stopPropagation();
  }
};

BlocklyApps.toggleRunReset = function(button) {
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
 * Modify the workspace header after a droplet blocks/code toggle
 */
function updateHeadersAfterDropletToggle(usingBlocks) {
  // Update header titles:
  var showCodeHeader = document.getElementById('show-code-header');
  var newButtonTitle = usingBlocks ? msg.showCodeHeader() :
                                     msg.showBlocksHeader();
  showCodeHeader.firstChild.innerText = newButtonTitle;

  var workspaceHeaderSpan = document.getElementById('workspace-header-span');
  newButtonTitle = usingBlocks ? msg.workspaceHeader() :
                                 msg.workspaceHeaderJavaScript();
  workspaceHeaderSpan.innerText = newButtonTitle;

  var blockCount = document.getElementById('blockCounter');
  if (blockCount) {
    blockCount.style.display =
      (usingBlocks && BlocklyApps.enableShowBlockCount) ? 'inline-block' : 'none';
  }

  // Resize (including headers), so the category header will appear/disappear:
  BlocklyApps.onResize();
}

/**
 * Common startup tasks for all apps.
 */
BlocklyApps.init = function(config) {
  if (!config) {
    config = {};
  }

  BlocklyApps.share = config.share;

  // if true, dont provide links to share on fb/twitter
  BlocklyApps.disableSocialShare = config.disableSocialShare;
  BlocklyApps.sendToPhone = config.sendToPhone;
  BlocklyApps.noPadding = config.no_padding;

  BlocklyApps.IDEAL_BLOCK_NUM = config.level.ideal || Infinity;
  BlocklyApps.MIN_WORKSPACE_HEIGHT = config.level.minWorkspaceHeight || 800;
  BlocklyApps.REQUIRED_BLOCKS = config.level.requiredBlocks || [];

  // enableShowCode defaults to true if not defined
  BlocklyApps.enableShowCode = (config.enableShowCode === false) ? false : true;

  // If the level has no ideal block count, don't show a block count. If it does
  // have an ideal, show block count unless explicitly configured not to.
  if (config.level && (config.level.ideal === undefined || config.level.ideal === Infinity)) {
    BlocklyApps.enableShowBlockCount = false;
  } else {
    BlocklyApps.enableShowBlockCount = config.enableShowBlockCount !== false;
  }

  // Store configuration.
  onAttempt = config.onAttempt || function(report) {
    console.log('Attempt!');
    console.log(report);
    if (report.onComplete) {
      report.onComplete();
    }
  };
  onContinue = config.onContinue || function() {
    console.log('Continue!');
  };
  onResetPressed = config.onResetPressed || function() {
    console.log('Reset!');
  };
  backToPreviousLevel = config.backToPreviousLevel || function() {};

  var container = document.getElementById(config.containerId);
  container.innerHTML = config.html;
  var runButton = container.querySelector('#runButton');
  var resetButton = container.querySelector('#resetButton');
  var throttledRunClick = _.debounce(BlocklyApps.runButtonClick, 250, true);
  dom.addClickTouchEvent(runButton, throttledRunClick);
  dom.addClickTouchEvent(resetButton, BlocklyApps.resetButtonClick);

  var belowViz = document.getElementById('belowVisualization');
  var referenceArea = document.getElementById('reference_area');
  if (referenceArea) {
    belowViz.appendChild(referenceArea);
  }

  var visualizationColumn = document.getElementById('visualizationColumn');
  var visualization = document.getElementById('visualization');

  // center game screen in embed mode
  if(config.embed) {
    visualizationColumn.style.margin = "0 auto";
  }

  if (BlocklyApps.usingBlockly && config.level.edit_blocks) {
    // Set a class on the main blockly div so CSS can style blocks differently
    Blockly.addClass_(container.querySelector('#blockly'), 'edit');
    // If in level builder editing blocks, make workspace extra tall
    visualizationColumn.style.height = "3000px";
    // Modify the arrangement of toolbox blocks so categories align left
    if (config.level.edit_blocks == "toolbox_blocks") {
      BlocklyApps.BLOCK_Y_COORDINATE_INTERVAL = 80;
      config.blockArrangement = { category : { x: 20 } };
    }
    // Enable param & var editing in levelbuilder, regardless of level setting
    config.level.disableParamEditing = false;
    config.level.disableVariableEditing = false;
  } else if (!config.hide_source) {
    visualizationColumn.style.minHeight =
        BlocklyApps.MIN_WORKSPACE_HEIGHT + 'px';
  }

  if (!config.embed && !BlocklyApps.share) {
    // Make the visualization responsive to screen size, except on share page.
    visualization.className += " responsive";
    visualizationColumn.className += " responsive";
  }

  if (config.hide_source) {
    BlocklyApps.hideSource = true;
    var workspaceDiv = BlocklyApps.editCode ?
                        document.getElementById('codeWorkspace') :
                        container.querySelector('#blockly');
    if(!config.embed || config.level.skipInstructionsPopup) {
      container.className = 'hide-source';
    }
    workspaceDiv.style.display = 'none';
    // For share page on mobile, do not show this part.
    if ((!config.embed) && (!BlocklyApps.share || !dom.isMobile())) {
      var buttonRow = runButton.parentElement;
      var openWorkspace = document.createElement('button');
      openWorkspace.setAttribute('id', 'open-workspace');
      openWorkspace.appendChild(document.createTextNode(msg.openWorkspace()));

      belowViz.appendChild(feedback.createSharingDiv({
        response: {
          level_source: window.location,
          level_source_id: config.level_source_id,
          phone_share_url: config.send_to_phone_url
        },
        sendToPhone: config.sendToPhone,
        level: config.level,
        twitter: config.twitter,
        onMainPage: true
      }));

      dom.addClickTouchEvent(openWorkspace, function() {
        // Redirect user to /edit version of this page. It would be better
        // to just turn on the workspace but there are rendering issues
        // with that.
        window.location.href = window.location.href + '/edit';
      });

      buttonRow.appendChild(openWorkspace);
    }
  }

  // 1. Move the buttons, 2. Hide the slider in the share page for mobile.
  if (BlocklyApps.share && dom.isMobile()) {
    var sliderCell = document.getElementById('slider-cell');
    if (sliderCell) {
      sliderCell.style.display = 'none';
    }
    var belowVisualization = document.getElementById('belowVisualization');
    if (belowVisualization) {
      if (config.noButtonsBelowOnMobileShare) {
        belowVisualization.style.display = 'none';
        visualization.style.marginBottom = '0px';
      } else {
        belowVisualization.style.display = 'block';
        belowVisualization.style.marginLeft = '0px';
        if (BlocklyApps.noPadding) {
          // Shift run and reset buttons off the left edge if we have no padding
          if (runButton) {
            runButton.style.marginLeft = '10px';
          }
          if (resetButton) {
            resetButton.style.marginLeft = '10px';
          }
          var shareCell = document.getElementById('share-cell') ||
              document.getElementById('right-button-cell');
          if (shareCell) {
            shareCell.style.marginLeft = '10px';
            shareCell.style.marginRight = '10px';
          }
          var softButtons = document.getElementById('soft-buttons');
          if (softButtons) {
            softButtons.style.marginLeft = '10px';
            softButtons.style.marginRight = '10px';
          }
        }
      }
    }
  }

  // Show flappy upsale on desktop and mobile.  Show learn upsale only on desktop
  if (BlocklyApps.share) {
    var upSale = document.createElement('div');
    if (config.makeYourOwn) {
      upSale.innerHTML = require('./templates/makeYourOwn.html')({
        data: {
          makeUrl: config.makeUrl,
          makeString: config.makeString,
          makeImage: config.makeImage
        }
      });
      if (BlocklyApps.noPadding) {
        upSale.style.marginLeft = '10px';
      }
      belowViz.appendChild(upSale);
    } else if (typeof config.makeYourOwn === 'undefined') {
      upSale.innerHTML = require('./templates/learn.html')();
      belowViz.appendChild(upSale);
    }
  }

  // Record time at initialization.
  BlocklyApps.initTime = new Date().getTime();

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    var deviceWidth;
    var desiredWidth;
    var minWidth;
    if (BlocklyApps.share && dom.isMobile()) {
      // for mobile sharing, don't assume landscape mode, use screen.width
      deviceWidth = desiredWidth = screen.width;
      if (BlocklyApps.noPadding && screen.width < BlocklyApps.MAX_PHONE_WIDTH) {
        desiredWidth = Math.min(desiredWidth,
                                BlocklyApps.MOBILE_NO_PADDING_SHARE_WIDTH);
      }
      minWidth = BlocklyApps.noPadding ?
                    BlocklyApps.MOBILE_NO_PADDING_SHARE_WIDTH :
                    BlocklyApps.MIN_MOBILE_SHARE_WIDTH;
    }
    else {
      // assume we are in landscape mode, so width is the longer of the two
      deviceWidth = desiredWidth = Math.max(screen.width, screen.height);
      minWidth = BlocklyApps.MIN_WIDTH;
    }
    var width = Math.max(minWidth, desiredWidth);
    var scale = deviceWidth / width;
    var content = ['width=' + width,
                   'minimal-ui',
                   'initial-scale=' + scale,
                   'maximum-scale=' + scale,
                   'minimum-scale=' + scale,
                   'target-densityDpi=device-dpi',
                   'user-scalable=no'];
    viewport.setAttribute('content', content.join(', '));
  }

  BlocklyApps.Dialog = config.Dialog;

  var showCode = document.getElementById('show-code-header');
  if (showCode && BlocklyApps.enableShowCode) {
    dom.addClickTouchEvent(showCode, function() {
      if (BlocklyApps.editCode) {
        BlocklyApps.editor.toggleBlocks();
        updateHeadersAfterDropletToggle(BlocklyApps.editor.currentlyUsingBlocks);
        if (!BlocklyApps.editor.currentlyUsingBlocks) {
          BlocklyApps.editor.aceEditor.focus();
        }
      } else {
        feedback.showGeneratedCode(BlocklyApps.Dialog);
      }
    });
  }

  var blockCount = document.getElementById('blockCounter');
  if (blockCount && !BlocklyApps.enableShowBlockCount) {
    blockCount.style.display = 'none';
  }

  BlocklyApps.ICON = config.skin.staticAvatar;
  BlocklyApps.SMALL_ICON = config.skin.smallStaticAvatar;
  BlocklyApps.WIN_ICON = config.skin.winAvatar;
  BlocklyApps.FAILURE_ICON = config.skin.failureAvatar;

  if (config.level.instructionsIcon) {
    BlocklyApps.ICON = config.skin[config.level.instructionsIcon];
    BlocklyApps.WIN_ICON = config.skin[config.level.instructionsIcon];
  }

  if (config.showInstructionsWrapper) {
    config.showInstructionsWrapper(function () {
      var shouldAutoClose = !!config.level.aniGifURL;
      showInstructions(config.level, shouldAutoClose);
    });
  }

  // The share and embed pages do not show the rotateContainer.
  if (BlocklyApps.share || config.embed) {
    var rotateContainer = document.getElementById('rotateContainer');
    if (rotateContainer) {
      rotateContainer.style.display = 'none';
    }
  }

  // In embed mode, the display scales down when the width of the visualizationColumn goes below the min width
  if(config.embed) {
    var resized = false;
    var resize = function() {
      var vizCol = document.getElementById('visualizationColumn');
      var width = vizCol.offsetWidth;
      var height = vizCol.offsetHeight;
      var displayWidth = BlocklyApps.MOBILE_NO_PADDING_SHARE_WIDTH;
      var scale = Math.min(width / displayWidth, height / displayWidth);
      var viz = document.getElementById('visualization');
      viz.style['transform-origin'] = 'left top';
      viz.style['-webkit-transform'] = 'scale(' + scale + ')';
      viz.style['max-height'] = (displayWidth * scale) + 'px';
      viz.style.display = 'block';
      vizCol.style.width = '';
      document.getElementById('visualizationColumn').style['max-width'] = displayWidth + 'px';
      // Needs to run twice on initialization
      if(!resized) {
        resized = true;
        resize();
      }
    };
    // Depends on ResizeSensor.js
    var ResizeSensor = require('./ResizeSensor');
    new ResizeSensor(document.getElementById('visualizationColumn'), resize);
  }

  var orientationHandler = function() {
    window.scrollTo(0, 0);  // Browsers like to mess with scroll on rotate.
    var rotateContainer = document.getElementById('rotateContainer');
    rotateContainer.style.width = window.innerWidth + 'px';
    rotateContainer.style.height = window.innerHeight + 'px';
  };
  window.addEventListener('orientationchange', orientationHandler);
  orientationHandler();

  if (config.loadAudio) {
    config.loadAudio();
  }

  var promptDiv = document.getElementById('prompt');
  if (config.level.instructions) {
    dom.setText(promptDiv, config.level.instructions);
  }

  if (config.level.instructions || config.level.aniGifURL) {
    var promptIcon = document.getElementById('prompt-icon');
    promptIcon.src = BlocklyApps.SMALL_ICON;
  }

  var aniGifPreview = document.getElementById('ani-gif-preview');
  if (config.level.aniGifURL) {
    aniGifPreview.style.backgroundImage = "url('" + config.level.aniGifURL + "')";
    aniGifPreview.onclick = function() {
      showInstructions(config.level, false);
    };
    var promptTable = document.getElementById('prompt-table');
    promptTable.className += " with-ani-gif";
  } else {
    var wrapper = document.getElementById('ani-gif-preview-wrapper');
    wrapper.style.display = 'none';
  }

  if (BlocklyApps.editCode) {
    // using window.require forces us to use requirejs version of require
    window.require(['droplet'], function(droplet) {
      var displayMessage, examplePrograms, messageElement, onChange, startingText;
      BlocklyApps.editor = new droplet.Editor(document.getElementById('codeTextbox'), {
        mode: 'javascript',
        modeOptions: utils.generateDropletModeOptions(config.level.codeFunctions),
        palette: utils.generateDropletPalette(config.level.codeFunctions,
                                              config.level.categoryInfo)
      });

      BlocklyApps.editor.aceEditor.setShowPrintMargin(false);

      // Add an ace completer for the API functions exposed for this level
      if (config.level.codeFunctions) {
        var langTools = window.ace.require("ace/ext/language_tools");
        langTools.addCompleter(
            utils.generateAceApiCompleter(config.level.codeFunctions));
      }

      BlocklyApps.editor.aceEditor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      if (config.afterInject) {
        config.afterInject();
      }

      if (config.level.startBlocks) {
        BlocklyApps.editor.setValue(config.level.startBlocks);
      }
    });
  }

  if (BlocklyApps.usingBlockly) {
    // Allow empty blocks if editing blocks.
    if (config.level.edit_blocks) {
      BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
      if (config.level.edit_blocks === 'required_blocks' ||
        config.level.edit_blocks === 'toolbox_blocks') {
        // Don't show when run block for toolbox/required block editing
        config.forceInsertTopBlock = null;
      }
    }

    // If levelbuilder provides an empty toolbox, some apps (like artist)
    // replace it with a full toolbox. I think some levels may depend on this
    // behavior. We want a way to specify no toolbox, which is <xml></xml>
    if (config.level.toolbox) {
      var toolboxWithoutWhitespace = config.level.toolbox.replace(/\s/g, '');
      if (toolboxWithoutWhitespace === '<xml></xml>' ||
          toolboxWithoutWhitespace === '<xml/>') {
        config.level.toolbox = undefined;
      }
    }

    var div = document.getElementById('blockly');
    var options = {
      toolbox: config.level.toolbox,
      disableParamEditing: config.level.disableParamEditing === undefined ?
          true : config.level.disableParamEditing,
      disableVariableEditing: config.level.disableVariableEditing === undefined ?
          false : config.level.disableVariableEditing,
      useModalFunctionEditor: config.level.useModalFunctionEditor === undefined ?
          false : config.level.useModalFunctionEditor,
      useContractEditor: config.level.useContractEditor === undefined ?
          false : config.level.useContractEditor,
      defaultNumExampleBlocks: config.level.defaultNumExampleBlocks === undefined ?
          0 : config.level.defaultNumExampleBlocks,
      scrollbars: config.level.scrollbars,
      editBlocks: config.level.edit_blocks === undefined ?
          false : config.level.edit_blocks
    };
    ['trashcan', 'concreteBlocks', 'varsInGlobals',
      'grayOutUndeletableBlocks', 'disableParamEditing'].forEach(
      function (prop) {
        if (config[prop] !== undefined) {
          options[prop] = config[prop];
        }
      });
    BlocklyApps.inject(div, options);

    if (config.afterInject) {
      config.afterInject();
    }

    // Add the starting block(s).
    var startBlocks = config.level.startBlocks || '';
    if (config.forceInsertTopBlock) {
      startBlocks = blockUtils.forceInsertTopBlock(startBlocks, config.forceInsertTopBlock);
    }
    startBlocks = BlocklyApps.arrangeBlockPosition(startBlocks, config.blockArrangement);
    BlocklyApps.loadBlocks(startBlocks);
  }

  // Initialize the slider.
  var slider = document.getElementById('slider');
  if (slider) {
    // TODO (noted by cpirich): remove Turtle specific code here:
    Turtle.speedSlider = new Slider(10, 35, 130, slider);

    // Change default speed (eg Speed up levels that have lots of steps).
    if (config.level.sliderSpeed) {
      Turtle.speedSlider.setValue(config.level.sliderSpeed);
    }
  }

  // listen for scroll and resize to ensure onResize() is called
  window.addEventListener('scroll', function() {
    BlocklyApps.onResize();
    var event = document.createEvent('UIEvents');
    event.initEvent('resize', true, true);  // event type, bubbling, cancelable
    window.dispatchEvent(event);
  });
  window.addEventListener('resize', BlocklyApps.onResize);

  // Call initial onResize() asynchronously - need 10ms delay to work around
  // relayout which changes height on the left side to the proper value
  window.setTimeout(function() {
    BlocklyApps.onResize();
    var event = document.createEvent('UIEvents');
    event.initEvent('resize', true, true);  // event type, bubbling, cancelable
    window.dispatchEvent(event);
  }, 10);

  BlocklyApps.reset(true);

  // Add display of blocks used.
  setIdealBlockNumber();

  // TODO (cpirich): implement block count for droplet (for now, blockly only)
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpaceEditor.addChangeListener(function() {
      BlocklyApps.updateBlockCount();
    });

    if (config.level.openFunctionDefinition) {
      Blockly.functionEditor.openAndEditFunction(config.level.openFunctionDefinition);
    }
  }
};

exports.loadAudio = function(filenames, name) {
  if (BlocklyApps.usingBlockly) {
    Blockly.loadAudio_(filenames, name);
  } else if (BlocklyApps.cdoSounds) {
    var regOpts = { id: name };
    for (var i = 0; i < filenames.length; i++) {
      var filename = filenames[i];
      var ext = filename.match(/\.(\w+)(\?.*)?$/);
      if (ext) {
        // Extend regOpts so regOpts.mp3 = 'file.mp3'
        regOpts[ext[1]] = filename;
      }
    }
    BlocklyApps.cdoSounds.register(regOpts);
  }
};

exports.playAudio = function(name, options) {
  options = options || {};
  var defaultOptions = {volume: 0.5};
  var newOptions = utils.extend(defaultOptions, options);
  if (BlocklyApps.usingBlockly) {
    Blockly.playAudio(name, newOptions);
  } else if (BlocklyApps.cdoSounds) {
    BlocklyApps.cdoSounds.play(name, newOptions);
  }
};

exports.stopLoopingAudio = function(name) {
  if (BlocklyApps.usingBlockly) {
    Blockly.stopLoopingAudio(name);
  } else if (BlocklyApps.cdoSounds) {
    BlocklyApps.cdoSounds.stopLoopingAudio(name);
  }
};

/**
 * @param {Object} options Configuration parameters for Blockly. Parameters are
 * optional and include:
 *  - {string} path The root path to the /blockly directory, defaults to the
 *    the directory in which this script is located.
 *  - {boolean} rtl True if the current language right to left.
 *  - {DomElement} toolbox The element in which to insert the toolbox,
 *    defaults to the element with 'toolbox'.
 *  - {boolean} trashcan True if the trashcan should be displayed, defaults to
 *    true.
 * @param {DomElement} div The parent div in which to insert Blockly.
 */
exports.inject = function(div, options) {
  var defaults = {
    assetUrl: BlocklyApps.assetUrl,
    rtl: BlocklyApps.isRtl(),
    toolbox: document.getElementById('toolbox'),
    trashcan: true
  };
  Blockly.inject(div, utils.extend(defaults, options));
};

/**
 * Returns true if the current HTML page is in right-to-left language mode.
 */
BlocklyApps.isRtl = function() {
  var head = document.getElementsByTagName('head')[0];
  if (head && head.parentElement) {
    var dir = head.parentElement.getAttribute('dir');
    return (dir && dir.toLowerCase() == 'rtl');
  } else {
    return false;
  }
};

BlocklyApps.localeDirection = function() {
  return (BlocklyApps.isRtl() ? 'rtl' : 'ltr');
};

/**
 * Initialize Blockly for a readonly iframe.  Called on page load.
 * XML argument may be generated from the console with:
 * Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)).slice(5, -6)
 */
BlocklyApps.initReadonly = function(options) {
  Blockly.inject(document.getElementById('blockly'), {
    assetUrl: BlocklyApps.assetUrl,
    readOnly: true,
    rtl: BlocklyApps.isRtl(),
    scrollbars: false
  });
  BlocklyApps.loadBlocks(options.blocks);
};

/**
 * Load the editor with blocks.
 * @param {string} blocksXml Text representation of blocks.
 */
BlocklyApps.loadBlocks = function(blocksXml) {
  var xml = parseXmlElement(blocksXml);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
};

BlocklyApps.BLOCK_X_COORDINATE = 70;
BlocklyApps.BLOCK_Y_COORDINATE = 30;
BlocklyApps.BLOCK_Y_COORDINATE_INTERVAL = 200;

/**
 * Spreading out the top blocks in workspace if it is not already set.
 * @param {string} startBlocks String representation of start blocks xml.
 * @param {Object.<Object>} arrangement A map from block type to position.
 * @return {string} String representation of start blocks xml, including
 *    block position.
 */
BlocklyApps.arrangeBlockPosition = function(startBlocks, arrangement) {
  var type, arrangeX, arrangeY;
  var xml = parseXmlElement(startBlocks);
  var xmlChildNodes = BlocklyApps.sortBlocksByVisibility(xml.childNodes);
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
                            BlocklyApps.BLOCK_X_COORDINATE);
      xmlChild.setAttribute('y', xmlChild.getAttribute('y') || arrangeY ||
                            BlocklyApps.BLOCK_Y_COORDINATE +
                            BlocklyApps.BLOCK_Y_COORDINATE_INTERVAL * numberOfPlacedBlocks);
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
BlocklyApps.sortBlocksByVisibility = function(xmlBlocks) {
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

var showInstructions = function(level, autoClose) {
  var instructionsDiv = document.createElement('div');
  instructionsDiv.innerHTML = require('./templates/instructions.html')(level);

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      ok: true
    }
  });

  instructionsDiv.appendChild(buttons);

  var dialog = feedback.createModalDialogWithIcon({
      Dialog: BlocklyApps.Dialog,
      contentDiv: instructionsDiv,
      icon: BlocklyApps.ICON,
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
BlocklyApps.onResize = function() {
  var visualizationColumn = document.getElementById('visualizationColumn');
  var gameWidth = visualizationColumn.getBoundingClientRect().width;

  var blocklyDiv = document.getElementById('blockly');
  var codeWorkspace = document.getElementById('codeWorkspace');

  // resize either blockly or codeWorkspace
  var div = BlocklyApps.editCode ? codeWorkspace : blocklyDiv;

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
  if (BlocklyApps.usingBlockly && Blockly.RTL && (fullWorkspaceWidth - oldWidth !== 0)) {
    Blockly.mainBlockSpace.getTopBlocks().forEach(function(topBlock) {
      topBlock.moveBy(fullWorkspaceWidth - oldWidth, 0);
    });
  }

  if (BlocklyApps.isRtl()) {
    div.style.marginRight = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  else {
    div.style.marginLeft = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  if (BlocklyApps.editCode) {
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

  BlocklyApps.resizeHeaders(fullWorkspaceWidth);
};

// |          toolbox-header          | workspace-header  | show-code-header |
// |
// |           toolboxWidth           |
// |                 |         <--------- workspaceWidth ---------->         |
// |         <---------------- fullWorkspaceWidth ----------------->         |
BlocklyApps.resizeHeaders = function (fullWorkspaceWidth) {
  var minWorkspaceWidthForShowCode = BlocklyApps.editCode ? 250 : 450;
  var toolboxWidth = 0;
  if (BlocklyApps.editCode) {
    // If in the droplet editor, but not using blocks, keep categoryWidth at 0
    if (!BlocklyApps.editCode || BlocklyApps.editor.currentlyUsingBlocks) {
      // Set toolboxWidth based on the block palette width:
      var categories = document.querySelector('.droplet-palette-wrapper');
      toolboxWidth = parseInt(window.getComputedStyle(categories).width, 10);
    }
  } else if (BlocklyApps.usingBlockly) {
    toolboxWidth = Blockly.mainBlockSpaceEditor.getToolboxWidth();
  }

  var showCodeHeader = document.getElementById('show-code-header');
  var showCodeWidth = 0;
  if (BlocklyApps.enableShowCode &&
      (fullWorkspaceWidth - toolboxWidth > minWorkspaceWidthForShowCode)) {
    showCodeWidth = parseInt(window.getComputedStyle(showCodeHeader).width, 10);
    showCodeHeader.style.display = "";
  }
  else {
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
BlocklyApps.highlight = function(id, spotlight) {
  if (BlocklyApps.usingBlockly) {
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
BlocklyApps.clearHighlighting = function () {
  BlocklyApps.highlight(null);
};

// The following properties get their non-default values set by the application.

/**
 * Whether to alert user to empty blocks, short-circuiting all other tests.
 */
BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = undefined;

/**
 * The ideal number of blocks to solve this level.  Users only get 2
 * stars if they use more than this number.
 * @type {!number=}
 */
BlocklyApps.IDEAL_BLOCK_NUM = undefined;

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
BlocklyApps.REQUIRED_BLOCKS = undefined;

/**
 * The number of required blocks to give hints about at any one time.
 * Set this to Infinity to show all.
 * @type {!number=}
 */
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = undefined;

/**
 * The number of attempts (how many times the run button has been pressed)
 * @type {?number}
 */
BlocklyApps.attempts = 0;

/**
 * Stores the time at init. The delta to current time is used for logging
 * and reporting to capture how long it took to arrive at an attempt.
 * @type {?number}
 */
BlocklyApps.initTime = undefined;

/**
 * Reset the playing field to the start position and kill any pending
 * animation tasks.  This will typically be replaced by an application.
 * @param {boolean} first True if an opening animation is to be played.
 */
BlocklyApps.reset = function(first) {};

// Override to change run behavior.
BlocklyApps.runButtonClick = function() {};

/**
 * Enumeration of user program execution outcomes.
 */
BlocklyApps.ResultType = constants.ResultType;

/**
 * Enumeration of test results.
 */
BlocklyApps.TestResults = constants.TestResults;

// Methods for determining and displaying feedback.

/**
 * Display feedback based on test results.  The test results must be
 * explicitly provided.
 * @param {{feedbackType: number}} Test results (a constant property of
 *     BlocklyApps.TestResults).
 */
BlocklyApps.displayFeedback = function(options) {
  options.Dialog = BlocklyApps.Dialog;
  options.onContinue = onContinue;
  options.backToPreviousLevel = backToPreviousLevel;
  options.sendToPhone = BlocklyApps.sendToPhone;

  // Special test code for edit blocks.
  if (options.level.edit_blocks) {
    options.feedbackType = BlocklyApps.TestResults.EDIT_BLOCKS;
  }

  feedback.displayFeedback(options);
};

BlocklyApps.getTestResults = function(levelComplete, options) {
  return feedback.getTestResults(levelComplete, options);
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
BlocklyApps.report = function(options) {
  // copy from options: app, level, result, testResult, program, onComplete
  var report = options;
  report.pass = feedback.canContinueToNextLevel(options.testResult);
  report.time = ((new Date().getTime()) - BlocklyApps.initTime);
  report.attempt = BlocklyApps.attempts;
  report.lines = feedback.getNumBlocksUsed();

  // If hideSource is enabled, the user is looking at a shared level that
  // they cannot have modified. In that case, don't report it to the service
  // or call the onComplete() callback expected. The app will just sit
  // there with the Reset button as the only option.
  if (!(BlocklyApps.hideSource && BlocklyApps.share)) {
    var onAttemptCallback = (function() {
      return function(builderDetails) {
        for (var option in builderDetails) {
          report[option] = builderDetails[option];
        }
        onAttempt(report);
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
BlocklyApps.resetButtonClick = function() {
  onResetPressed();
  BlocklyApps.toggleRunReset('run');
  BlocklyApps.clearHighlighting();
  if (BlocklyApps.usingBlockly) {
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    Blockly.mainBlockSpace.traceOn(false);
  }
  BlocklyApps.reset(false);
};

/**
 * Set the ideal Number of blocks.
 */
var setIdealBlockNumber = function() {
  var element = document.getElementById('idealBlockNumber');
  if (element) {
    element.innerHTML = '';  // Remove existing children or text.
    element.appendChild(document.createTextNode(
        getIdealBlockNumberMsg()));
  }
};

/**
 * Add count of blocks used.
 */
exports.updateBlockCount = function() {
  // If the number of block used is bigger than the ideal number of blocks,
  // set it to be yellow, otherwise, keep it as black.
  var element = document.getElementById('blockUsed');
  if (BlocklyApps.IDEAL_BLOCK_NUM < feedback.getNumCountableBlocks()) {
    element.className = "block-counter-overflow";
  } else {
    element.className = "block-counter-default";
  }

  // Update number of blocks used.
  if (element) {
    element.innerHTML = '';  // Remove existing children or text.
    element.appendChild(document.createTextNode(
        feedback.getNumCountableBlocks()));
  }
};

var getIdealBlockNumberMsg = function() {
  return BlocklyApps.IDEAL_BLOCK_NUM === Infinity ?
      msg.infinity() : BlocklyApps.IDEAL_BLOCK_NUM;
};

},{"../locale/zh_tw/common":50,"./ResizeSensor":1,"./block_utils":4,"./builder":6,"./constants.js":9,"./dom":10,"./feedback.js":28,"./slider":35,"./templates/buttons.html":37,"./templates/instructions.html":39,"./templates/learn.html":40,"./templates/makeYourOwn.html":41,"./utils":48,"./xml":49}],4:[function(require,module,exports){
var xml = require('./xml');

exports.createToolbox = function(blocks) {
  return '<xml id="toolbox" style="display: none;">' + blocks + '</xml>';
};

exports.blockOfType = function(type, titles) {
  var titleText = '';
  if (titles) {
    for (var key in titles) {
      titleText += '<title name="' + key + '">' + titles[key] + '</title>';
    }
  }
  return '<block type="' + type + '">' + titleText +'</block>';
};

exports.blockWithNext = function (type, titles, child) {
  var titleText = '';
  if (titles) {
    for (var key in titles) {
      titleText += '<title name="' + key + '">' + titles[key] + '</title>';
    }
  }
  return '<block type="' + type + '">' + titleText + '<next>' + child + '</next></block>';
};

/**
 * Give a list of types, returns the xml assuming each block is a child of
 * the previous block.
 */
exports.blocksFromList = function (types) {
  if (types.length === 1) {
    return this.blockOfType(types[0]);
  }

  return this.blockWithNext(types[0], {}, this.blocksFromList(types.slice(1)));
};

exports.createCategory = function(name, blocks, custom) {
  return '<category name="' + name + '"' +
          (custom ? ' custom="' + custom + '"' : '') +
          '>' + blocks + '</category>';
};

/**
 * Generate a simple block with a plain title and next/previous connectors.
 */
exports.generateSimpleBlock = function (blockly, generator, options) {
  ['name', 'title', 'tooltip', 'functionName'].forEach(function (param) {
    if (!options[param]) {
      throw new Error('generateSimpleBlock requires param "' + param + '"');
    }
  });

  var name = options.name;
  var helpUrl = options.helpUrl || ""; // optional param
  var title = options.title;
  var titleImage = options.titleImage;
  var tooltip = options.tooltip;
  var functionName = options.functionName;

  blockly.Blocks[name] = {
    helpUrl: helpUrl,
    init: function() {
      // Note: has a fixed HSV.  Could make this customizable if need be
      this.setHSV(184, 1.00, 0.74);
      var input = this.appendDummyInput();
      if (title) {
        input.appendTitle(title);
      }
      if (titleImage) {
        input.appendTitle(new blockly.FieldImage(titleImage));
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(tooltip);
    }
  };

  generator[name] = function() {
    // Generate JavaScript for putting dirt on to a tile.
    return functionName + '(\'block_id_' + this.id + '\');\n';
  };
};

/**
 * Generates a single block from a <block/> DOM element, adding it to the main workspace
 * @param blockDOM {Element}
 * @returns {*}
 */
exports.domToBlock = function(blockDOM) {
  return Blockly.Xml.domToBlock_(Blockly.mainBlockSpace, blockDOM);
};

/**
 * Generates a single block from a block XML string—e.g., <block type="testBlock"></block>,
 * and adds it to the main workspace
 * @param blockDOMString
 * @returns {*}
 */
exports.domStringToBlock = function(blockDOMString) {
  return exports.domToBlock(xml.parseElement(blockDOMString).firstChild);
};

/**
 * Takes a set of start blocks, and returns them with a particular top level
 * block inserted in front of the first non-function block.  If we already have
 * this block, does nothing.
 */
exports.forceInsertTopBlock = function (input, blockType) {
  input = input || '';

  if (blockType === null || input.indexOf(blockType) !== -1) {
    return input;
  }

  var root = xml.parseElement(input);

  // Extract the document from the root. The reason I do this instead of just
  // using document.createElement elsewhere is
  var doc = root.parentNode;

  var topBlock = doc.createElement('block');
  topBlock.setAttribute('type', blockType);
  topBlock.setAttribute('movable', 'false');
  topBlock.setAttribute('deletable', 'false');

  var numChildren = root.childNodes ? root.childNodes.length : 0;

  // find the first non-function definition block and extract it
  var firstBlock = null, i = 0;
  while (i < numChildren && firstBlock === null) {
    var child = root.childNodes[i];
    // only look at element nodes
    if (child.nodeType === 1) {
      var type = child.getAttribute('type');
      if (type !== 'procedures_defnoreturn' && type !== 'procedures_defreturn') {
        firstBlock = root.removeChild(child);
        numChildren--;
      }
    }
    i++;
  }

  if (firstBlock !== null) {
    // when run -> next -> firstBlock
    var next;
    if (/^functional/.test(blockType)) {
      next = doc.createElement('functional_input');
      next.setAttribute('name', 'ARG1');
    } else {
      next = doc.createElement('next');
    }
    next.appendChild(firstBlock);
    topBlock.appendChild(next);
  }

  if (numChildren > 0) {
    root.insertBefore(topBlock, root.childNodes[0]);
  } else {
    root.appendChild(topBlock);
  }
  return xml.serialize(root);
};

/**
 * Generate the xml for a block for the calc app.
 */
exports.calcBlockXml = function (type, args) {
  var str = '<block type="' + type + '" inline="false">';
  for (var i = 1; i <= args.length; i++) {
    str += '<functional_input name="ARG' + i + '">';
    var arg = args[i - 1];
    if (typeof(arg) === "number") {
      arg = '<block type="functional_math_number"><title name="NUM">' + arg +
        '</title></block>';
    }
    str += arg;
    str += '</functional_input>';
  }
  str += '</block>';

  return str;
};

exports.mathBlockXml = function (type, inputs, titles) {
  var str = '<block type="' + type + '" inline="false">';
  for (var title in titles) {
    str += '<title name="' + title + '">' + titles[title] + '</title>';
  }

  for (var input in inputs) {
    str += '<functional_input name="' + input + '">' + inputs[input] + '</functional_input>';
  }

  str += '</block>';

  return str;
};

},{"./xml":49}],5:[function(require,module,exports){
/**
 * Defines blocks useful in multiple blockly apps
 */
'use strict';

var commonMsg = require('../locale/zh_tw/common');

/**
 * Install extensions to Blockly's language and JavaScript generator
 * @param blockly instance of Blockly
 */
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;
  var isK1 = blockInstallOptions.isK1;

  installControlsRepeatSimplified(blockly, skin);
  installControlsRepeatDropdown(blockly);
  installNumberDropdown(blockly);
  installPickOne(blockly);
  installCategory(blockly);
  installWhenRun(blockly, skin, isK1);
};

function installControlsRepeatSimplified(blockly, skin) {
  // Re-uses the repeat block generator from core
  blockly.JavaScript.controls_repeat_simplified = blockly.JavaScript.controls_repeat;
  blockly.JavaScript.controls_repeat_simplified_dropdown = blockly.JavaScript.controls_repeat;

  blockly.Blocks.controls_repeat_simplified = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldTextInput('10', blockly.FieldTextInput.nonnegativeIntegerValidator), 'TIMES');
      this.appendStatementInput('DO')
        .appendTitle(new blockly.FieldImage(skin.repeatImage));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };

  blockly.Blocks.controls_repeat_simplified_dropdown = {
    // Repeat n times (internal number) with simplified UI
    init: function () {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldDropdown(), 'TIMES');
      this.appendStatementInput('DO')
        .appendTitle(new blockly.FieldImage(skin.repeatImage));
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };
}

function installControlsRepeatDropdown(blockly) {
  blockly.JavaScript.controls_repeat_dropdown = blockly.JavaScript.controls_repeat;

  blockly.Blocks.controls_repeat_dropdown = {
    // Repeat n times (internal number) with a customizable dropdown of # choices.
    init: function() {
      this.setHelpUrl(blockly.Msg.CONTROLS_REPEAT_HELPURL);
      this.setHSV(322, 0.90, 0.95);
      this.appendDummyInput()
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_REPEAT)
        .appendTitle(new blockly.FieldDropdown(), 'TIMES')
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_TITLE_TIMES);
      this.appendStatementInput('DO')
        .appendTitle(blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(blockly.Msg.CONTROLS_REPEAT_TOOLTIP);
    }
  };
}

function installNumberDropdown(blockly) {
  blockly.JavaScript.math_number_dropdown = blockly.JavaScript.math_number;

  blockly.Blocks.math_number_dropdown = {
    // Numeric value with a customizable dropdown.
    init: function() {
      this.setHelpUrl(blockly.Msg.MATH_NUMBER_HELPURL);
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
        .appendTitle(new blockly.FieldDropdown(), 'NUM');
      this.setOutput(true, 'Number');
      this.setTooltip(blockly.Msg.MATH_NUMBER_TOOLTIP);
    }
  };
}

// A "Pick 1" block for level editing, where you want to require that one of a
// set of blocks is used.
function installPickOne(blockly) {
  blockly.Blocks.pick_one = {
    // Repeat n times (internal number).
    init: function() {
      this.setHSV(322, 0.90, 0.95);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
          .appendTitle('Pick one (Use only in required blocks)');
      this.appendStatementInput('PICK');
    }
  };

  blockly.JavaScript.pick_one = function () {
    return '\n';
  };
}

// A "Category" block for level editing, for delineating category groups.
function installCategory(blockly) {
  blockly.Blocks.category = {
    // Repeat n times (internal number).
    init: function() {
      this.setHSV(322, 0.90, 0.95);
      this.setInputsInline(true);

      // Not localized as this is only used by level builders
      this.appendDummyInput()
        .appendTitle('Category')
        .appendTitle(new blockly.FieldTextInput('Name'), 'CATEGORY');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
    }
  };

  blockly.JavaScript.category = function () {
    return '\n';
  };
}

function installWhenRun(blockly, skin, isK1) {
  blockly.Blocks.when_run = {
    // Block to handle event where mouse is clicked
    helpUrl: '',
    init: function () {
      this.setHSV(39, 1.00, 0.99);
      if (isK1) {
        this.appendDummyInput()
          .appendTitle(commonMsg.whenRun())
          .appendTitle(new blockly.FieldImage(skin.runArrow));
      } else {
        this.appendDummyInput().appendTitle(commonMsg.whenRun());
      }
      this.setPreviousStatement(false);
      this.setNextStatement(true);
    }
  };

  blockly.JavaScript.when_run = function () {
    // Generate JavaScript for handling click event.
    return '\n';
  };
}

},{"../locale/zh_tw/common":50}],6:[function(require,module,exports){
var feedback = require('./feedback.js');
var dom = require('./dom.js');
var utils = require('./utils.js');
var url = require('url');
// Builds the dom to get more info from the user. After user enters info
// and click "create level" onAttemptCallback is called to deliver the info
// to the server.
exports.builderForm = function(onAttemptCallback) {
  var builderDetails = document.createElement('div');
  builderDetails.innerHTML = require('./templates/builder.html')();
  var dialog = feedback.createModalDialogWithIcon({
    Dialog: BlocklyApps.Dialog,
    contentDiv: builderDetails,
    icon: BlocklyApps.ICON
  });
  var createLevelButton = document.getElementById('create-level-button');
  dom.addClickTouchEvent(createLevelButton, function() {
    var instructions = builderDetails.querySelector('[name="instructions"]').value;
    var name = builderDetails.querySelector('[name="level_name"]').value;
    var query = url.parse(window.location.href, true).query;
    onAttemptCallback(utils.extend({
      "instructions": instructions,
      "name": name
    }, query));
  });

  dialog.show({ backdrop: 'static' });
};

},{"./dom.js":10,"./feedback.js":28,"./templates/builder.html":36,"./utils.js":48,"url":62}],7:[function(require,module,exports){
/*
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed 
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
(function(){
	// canvg(target, s)
	// empty parameters: replace all 'svg' elements on page with 'canvas' elements
	// target: canvas element or the id of a canvas element
	// s: svg string, url to svg file, or xml document
	// opts: optional hash of options
	//		 ignoreMouse: true => ignore mouse events
	//		 ignoreAnimation: true => ignore animations
	//		 ignoreDimensions: true => does not try to resize canvas
	//		 ignoreClear: true => does not clear canvas
	//		 offsetX: int => draws at a x offset
	//		 offsetY: int => draws at a y offset
	//		 scaleWidth: int => scales horizontally to width
	//		 scaleHeight: int => scales vertically to height
	//		 renderCallback: function => will call the function after the first render is completed
	//		 forceRedraw: function => will call the function on every frame, if it returns true, will redraw
	this.canvg = function (target, s, opts) {
		// no parameters
		if (target == null && s == null && opts == null) {
			var svgTags = document.querySelectorAll('svg');
			for (var i=0; i<svgTags.length; i++) {
				var svgTag = svgTags[i];
				var c = document.createElement('canvas');
				c.width = svgTag.clientWidth;
				c.height = svgTag.clientHeight;
				svgTag.parentNode.insertBefore(c, svgTag);
				svgTag.parentNode.removeChild(svgTag);
				var div = document.createElement('div');
				div.appendChild(svgTag);
				canvg(c, div.innerHTML);
			}
			return;
		}
	
		if (typeof target == 'string') {
			target = document.getElementById(target);
		}
		
		// store class on canvas
		if (target.svg != null) target.svg.stop();
		var svg = build(opts || {});
		// on i.e. 8 for flash canvas, we can't assign the property so check for it
		if (!(target.childNodes.length == 1 && target.childNodes[0].nodeName == 'OBJECT')) target.svg = svg;
		
		var ctx = target.getContext('2d');
		if (typeof(s.documentElement) != 'undefined') {
			// load from xml doc
			svg.loadXmlDoc(ctx, s);
		}
		else if (s.substr(0,1) == '<') {
			// load from xml string
			svg.loadXml(ctx, s);
		}
		else {
			// load from url
			svg.load(ctx, s);
		}
	}

	function build(opts) {
		var svg = { opts: opts };
		
		svg.FRAMERATE = 30;
		svg.MAX_VIRTUAL_PIXELS = 30000;
		
		svg.log = function(msg) {};
		if (svg.opts['log'] == true && typeof(console) != 'undefined') {
			svg.log = function(msg) { console.log(msg); };
		};
		
		// globals
		svg.init = function(ctx) {
			var uniqueId = 0;
			svg.UniqueId = function () { uniqueId++; return 'canvg' + uniqueId;	};
			svg.Definitions = {};
			svg.Styles = {};
			svg.Animations = [];
			svg.Images = [];
			svg.ctx = ctx;
			svg.ViewPort = new (function () {
				this.viewPorts = [];
				this.Clear = function() { this.viewPorts = []; }
				this.SetCurrent = function(width, height) { this.viewPorts.push({ width: width, height: height }); }
				this.RemoveCurrent = function() { this.viewPorts.pop(); }
				this.Current = function() { return this.viewPorts[this.viewPorts.length - 1]; }
				this.width = function() { return this.Current().width; }
				this.height = function() { return this.Current().height; }
				this.ComputeSize = function(d) {
					if (d != null && typeof(d) == 'number') return d;
					if (d == 'x') return this.width();
					if (d == 'y') return this.height();
					return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);			
				}
			});
		}
		svg.init();
		
		// images loaded
		svg.ImagesLoaded = function() { 
			for (var i=0; i<svg.Images.length; i++) {
				if (!svg.Images[i].loaded) return false;
			}
			return true;
		}

		// trim
		svg.trim = function(s) { return s.replace(/^\s+|\s+$/g, ''); }
		
		// compress spaces
		svg.compressSpaces = function(s) { return s.replace(/[\s\r\t\n]+/gm,' '); }
		
		// ajax
		svg.ajax = function(url) {
			var AJAX;
			if(window.XMLHttpRequest){AJAX=new XMLHttpRequest();}
			else{AJAX=new ActiveXObject('Microsoft.XMLHTTP');}
			if(AJAX){
			   AJAX.open('GET',url,false);
			   AJAX.send(null);
			   return AJAX.responseText;
			}
			return null;
		} 
		
		// parse xml
		svg.parseXml = function(xml) {
      // add the xmlns:xlink
      xml = xml.replace(/<svg/,
                        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');

			if (typeof(Windows) != 'undefined' && typeof(Windows.Data) != 'undefined' && typeof(Windows.Data.Xml) != 'undefined') {
				var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
				var settings = new Windows.Data.Xml.Dom.XmlLoadSettings();
				settings.prohibitDtd = false;
				xmlDoc.loadXml(xml, settings);
				return xmlDoc;
			}
			else if (window.DOMParser)
			{
				var parser = new DOMParser();
        // IE (or some other library?) puts a bunch of NS1 stuff in
        // the <svg> element which window.DOMParser (the ie native
        // parser) can't parse
        xml = xml.replace(/xmlns:NS1="" NS1:xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/,
                          'xmlns:xlink="http://www.w3.org/1999/xlink"');
				return parser.parseFromString(xml, 'text/xml');
			}
			else 
			{
				xml = xml.replace(/<!DOCTYPE svg[^>]*>/, '');
				var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
				xmlDoc.async = 'false';
				xmlDoc.loadXML(xml); 
				return xmlDoc;
			}		
		}
		
		svg.Property = function(name, value) {
			this.name = name;
			this.value = value;
		}	
			svg.Property.prototype.getValue = function() {
				return this.value;
			}
		
			svg.Property.prototype.hasValue = function() {
				return (this.value != null && this.value !== '');
			}
							
			// return the numerical value of the property
			svg.Property.prototype.numValue = function() {
				if (!this.hasValue()) return 0;
				
				var n = parseFloat(this.value);
				if ((this.value + '').match(/%$/)) {
					n = n / 100.0;
				}
				return n;
			}
			
			svg.Property.prototype.valueOrDefault = function(def) {
				if (this.hasValue()) return this.value;
				return def;
			}
			
			svg.Property.prototype.numValueOrDefault = function(def) {
				if (this.hasValue()) return this.numValue();
				return def;
			}
			
			// color extensions
				// augment the current color value with the opacity
				svg.Property.prototype.addOpacity = function(opacityProp) {
					var newValue = this.value;
					if (opacityProp.value != null && opacityProp.value != '' && typeof(this.value)=='string') { // can only add opacity to colors, not patterns
						var color = new RGBColor(this.value);
						if (color.ok) {
							newValue = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + opacityProp.numValue() + ')';
						}
					}
					return new svg.Property(this.name, newValue);
				}
			
			// definition extensions
				// get the definition from the definitions table
				svg.Property.prototype.getDefinition = function() {
					var name = this.value.match(/#([^\)'"]+)/);
					if (name) { name = name[1]; }
					if (!name) { name = this.value; }
					return svg.Definitions[name];
				}
				
				svg.Property.prototype.isUrlDefinition = function() {
					return this.value.indexOf('url(') == 0
				}
				
				svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp) {
					var def = this.getDefinition();
					
					// gradient
					if (def != null && def.createGradient) {
						return def.createGradient(svg.ctx, e, opacityProp);
					}
					
					// pattern
					if (def != null && def.createPattern) {
						if (def.getHrefAttribute().hasValue()) {
							var pt = def.attribute('patternTransform');
							def = def.getHrefAttribute().getDefinition();
							if (pt.hasValue()) { def.attribute('patternTransform', true).value = pt.value; }
						}
						return def.createPattern(svg.ctx, e);
					}
					
					return null;
				}
			
			// length extensions
				svg.Property.prototype.getDPI = function(viewPort) {
					return 96.0; // TODO: compute?
				}
				
				svg.Property.prototype.getEM = function(viewPort) {
					var em = 12;
					
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);
					
					return em;
				}
				
				svg.Property.prototype.getUnits = function() {
					var s = this.value+'';
					return s.replace(/[0-9\.\-]/g,'');
				}
			
				// get the length as pixels
				svg.Property.prototype.toPixels = function(viewPort, processPercent) {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
					if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2.0;
					if (s.match(/px$/)) return this.numValue();
					if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1.0 / 72.0);
					if (s.match(/pc$/)) return this.numValue() * 15;
					if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
					if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
					if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
					if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
					var n = this.numValue();
					if (processPercent && n < 1.0) return n * svg.ViewPort.ComputeSize(viewPort);
					return n;
				}

			// time extensions
				// get the time as milliseconds
				svg.Property.prototype.toMilliseconds = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/s$/)) return this.numValue() * 1000;
					if (s.match(/ms$/)) return this.numValue();
					return this.numValue();
				}
			
			// angle extensions
				// get the angle as radians
				svg.Property.prototype.toRadians = function() {
					if (!this.hasValue()) return 0;
					var s = this.value+'';
					if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180.0);
					if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200.0);
					if (s.match(/rad$/)) return this.numValue();
					return this.numValue() * (Math.PI / 180.0);
				}
		
			// text extensions
				// get the text baseline
				var textBaselineMapping = {
					'baseline': 'alphabetic',
					'before-edge': 'top',
					'text-before-edge': 'top',
					'middle': 'middle',
					'central': 'middle',
					'after-edge': 'bottom',
					'text-after-edge': 'bottom',
					'ideographic': 'ideographic',
					'alphabetic': 'alphabetic',
					'hanging': 'hanging',
					'mathematical': 'alphabetic'
				};
				svg.Property.prototype.toTextBaseline = function () {
					if (!this.hasValue()) return null;
					return textBaselineMapping[this.value];
				}
				
		// fonts
		svg.Font = new (function() {
			this.Styles = 'normal|italic|oblique|inherit';
			this.Variants = 'normal|small-caps|inherit';
			this.Weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';
			
			this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
				var f = inherit != null ? this.Parse(inherit) : this.CreateFont('', '', '', '', '', svg.ctx.font);
				return { 
					fontFamily: fontFamily || f.fontFamily, 
					fontSize: fontSize || f.fontSize, 
					fontStyle: fontStyle || f.fontStyle, 
					fontWeight: fontWeight || f.fontWeight, 
					fontVariant: fontVariant || f.fontVariant,
					toString: function () { return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(' ') } 
				} 
			}
			
			var that = this;
			this.Parse = function(s) {
				var f = {};
				var d = svg.trim(svg.compressSpaces(s || '')).split(' ');
				var set = { fontSize: false, fontStyle: false, fontWeight: false, fontVariant: false }
				var ff = '';
				for (var i=0; i<d.length; i++) {
					if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontStyle = d[i]; set.fontStyle = true; }
					else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) { if (d[i] != 'inherit') f.fontVariant = d[i]; set.fontStyle = set.fontVariant = true;	}
					else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {	if (d[i] != 'inherit') f.fontWeight = d[i]; set.fontStyle = set.fontVariant = set.fontWeight = true; }
					else if (!set.fontSize) { if (d[i] != 'inherit') f.fontSize = d[i].split('/')[0]; set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true; }
					else { if (d[i] != 'inherit') ff += d[i]; }
				} if (ff != '') f.fontFamily = ff;
				return f;
			}
		});
		
		// points and paths
		svg.ToNumberArray = function(s) {
			var a = svg.trim(svg.compressSpaces((s || '').replace(/,/g, ' '))).split(' ');
			for (var i=0; i<a.length; i++) {
				a[i] = parseFloat(a[i]);
			}
			return a;
		}		
		svg.Point = function(x, y) {
			this.x = x;
			this.y = y;
		}	
			svg.Point.prototype.angleTo = function(p) {
				return Math.atan2(p.y - this.y, p.x - this.x);
			}
			
			svg.Point.prototype.applyTransform = function(v) {
				var xp = this.x * v[0] + this.y * v[2] + v[4];
				var yp = this.x * v[1] + this.y * v[3] + v[5];
				this.x = xp;
				this.y = yp;
			}

		svg.CreatePoint = function(s) {
			var a = svg.ToNumberArray(s);
			return new svg.Point(a[0], a[1]);
		}
		svg.CreatePath = function(s) {
			var a = svg.ToNumberArray(s);
			var path = [];
			for (var i=0; i<a.length; i+=2) {
				path.push(new svg.Point(a[i], a[i+1]));
			}
			return path;
		}
		
		// bounding box
		svg.BoundingBox = function(x1, y1, x2, y2) { // pass in initial points if you want
			this.x1 = Number.NaN;
			this.y1 = Number.NaN;
			this.x2 = Number.NaN;
			this.y2 = Number.NaN;
			
			this.x = function() { return this.x1; }
			this.y = function() { return this.y1; }
			this.width = function() { return this.x2 - this.x1; }
			this.height = function() { return this.y2 - this.y1; }
			
			this.addPoint = function(x, y) {	
				if (x != null) {
					if (isNaN(this.x1) || isNaN(this.x2)) {
						this.x1 = x;
						this.x2 = x;
					}
					if (x < this.x1) this.x1 = x;
					if (x > this.x2) this.x2 = x;
				}
			
				if (y != null) {
					if (isNaN(this.y1) || isNaN(this.y2)) {
						this.y1 = y;
						this.y2 = y;
					}
					if (y < this.y1) this.y1 = y;
					if (y > this.y2) this.y2 = y;
				}
			}			
			this.addX = function(x) { this.addPoint(x, null); }
			this.addY = function(y) { this.addPoint(null, y); }
			
			this.addBoundingBox = function(bb) {
				this.addPoint(bb.x1, bb.y1);
				this.addPoint(bb.x2, bb.y2);
			}
			
			this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
				var cp1x = p0x + 2/3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp1y = p0y + 2/3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
				var cp2x = cp1x + 1/3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
				var cp2y = cp1y + 1/3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
				this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y,	cp2y, p2x, p2y);
			}
			
			this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
				// from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
				var p0 = [p0x, p0y], p1 = [p1x, p1y], p2 = [p2x, p2y], p3 = [p3x, p3y];
				this.addPoint(p0[0], p0[1]);
				this.addPoint(p3[0], p3[1]);
				
				for (i=0; i<=1; i++) {
					var f = function(t) { 
						return Math.pow(1-t, 3) * p0[i]
						+ 3 * Math.pow(1-t, 2) * t * p1[i]
						+ 3 * (1-t) * Math.pow(t, 2) * p2[i]
						+ Math.pow(t, 3) * p3[i];
					}
					
					var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
					var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
					var c = 3 * p1[i] - 3 * p0[i];
					
					if (a == 0) {
						if (b == 0) continue;
						var t = -c / b;
						if (0 < t && t < 1) {
							if (i == 0) this.addX(f(t));
							if (i == 1) this.addY(f(t));
						}
						continue;
					}
					
					var b2ac = Math.pow(b, 2) - 4 * c * a;
					if (b2ac < 0) continue;
					var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
					if (0 < t1 && t1 < 1) {
						if (i == 0) this.addX(f(t1));
						if (i == 1) this.addY(f(t1));
					}
					var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
					if (0 < t2 && t2 < 1) {
						if (i == 0) this.addX(f(t2));
						if (i == 1) this.addY(f(t2));
					}
				}
			}
			
			this.isPointInBox = function(x, y) {
				return (this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2);
			}
			
			this.addPoint(x1, y1);
			this.addPoint(x2, y2);
		}
		
		// transforms
		svg.Transform = function(v) {	
			var that = this;
			this.Type = {}
		
			// translate
			this.Type.translate = function(s) {
				this.p = svg.CreatePoint(s);			
				this.apply = function(ctx) {
					ctx.translate(this.p.x || 0.0, this.p.y || 0.0);
				}
				this.unapply = function(ctx) {
					ctx.translate(-1.0 * this.p.x || 0.0, -1.0 * this.p.y || 0.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
				}
			}
			
			// rotate
			this.Type.rotate = function(s) {
				var a = svg.ToNumberArray(s);
				this.angle = new svg.Property('angle', a[0]);
				this.cx = a[1] || 0;
				this.cy = a[2] || 0;
				this.apply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.unapply = function(ctx) {
					ctx.translate(this.cx, this.cy);
					ctx.rotate(-1.0 * this.angle.toRadians());
					ctx.translate(-this.cx, -this.cy);
				}
				this.applyToPoint = function(p) {
					var a = this.angle.toRadians();
					p.applyTransform([1, 0, 0, 1, this.p.x || 0.0, this.p.y || 0.0]);
					p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
					p.applyTransform([1, 0, 0, 1, -this.p.x || 0.0, -this.p.y || 0.0]);
				}			
			}
			
			this.Type.scale = function(s) {
				this.p = svg.CreatePoint(s);
				this.apply = function(ctx) {
					ctx.scale(this.p.x || 1.0, this.p.y || this.p.x || 1.0);
				}
				this.unapply = function(ctx) {
					ctx.scale(1.0 / this.p.x || 1.0, 1.0 / this.p.y || this.p.x || 1.0);
				}
				this.applyToPoint = function(p) {
					p.applyTransform([this.p.x || 0.0, 0, 0, this.p.y || 0.0, 0, 0]);
				}				
			}
			
			this.Type.matrix = function(s) {
				this.m = svg.ToNumberArray(s);
				this.apply = function(ctx) {
					ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
				}
				this.unapply = function(ctx) {
					var a = this.m[0];
					var b = this.m[2];
					var c = this.m[4];
					var d = this.m[1];
					var e = this.m[3];
					var f = this.m[5];
					var g = 0.0;
					var h = 0.0;
					var i = 1.0;
					var det = 1 / (a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g));
					ctx.transform(
						det*(e*i-f*h),
						det*(f*g-d*i),
						det*(c*h-b*i),
						det*(a*i-c*g),
						det*(b*f-c*e),
						det*(c*d-a*f)
					);
				}
				this.applyToPoint = function(p) {
					p.applyTransform(this.m);
				}					
			}
			
			this.Type.SkewBase = function(s) {
				this.base = that.Type.matrix;
				this.base(s);
				this.angle = new svg.Property('angle', s);
			}
			this.Type.SkewBase.prototype = new this.Type.matrix;
			
			this.Type.skewX = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0];
			}
			this.Type.skewX.prototype = new this.Type.SkewBase;
			
			this.Type.skewY = function(s) {
				this.base = that.Type.SkewBase;
				this.base(s);
				this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0];
			}
			this.Type.skewY.prototype = new this.Type.SkewBase;
		
			this.transforms = [];
			
			this.apply = function(ctx) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].apply(ctx);
				}
			}
			
			this.unapply = function(ctx) {
				for (var i=this.transforms.length-1; i>=0; i--) {
					this.transforms[i].unapply(ctx);
				}
			}
			
			this.applyToPoint = function(p) {
				for (var i=0; i<this.transforms.length; i++) {
					this.transforms[i].applyToPoint(p);
				}
			}
			
			var data = svg.trim(svg.compressSpaces(v)).replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g,') ').split(/\s(?=[a-z])/);
			for (var i=0; i<data.length; i++) {
				var type = svg.trim(data[i].split('(')[0]);
				var s = data[i].split('(')[1].replace(')','');
				var transform = new this.Type[type](s);
				transform.type = type;
				this.transforms.push(transform);
			}
		}
		
		// aspect ratio
		svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
			// aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
			aspectRatio = svg.compressSpaces(aspectRatio);
			aspectRatio = aspectRatio.replace(/^defer\s/,''); // ignore defer
			var align = aspectRatio.split(' ')[0] || 'xMidYMid';
			var meetOrSlice = aspectRatio.split(' ')[1] || 'meet';					
	
			// calculate scale
			var scaleX = width / desiredWidth;
			var scaleY = height / desiredHeight;
			var scaleMin = Math.min(scaleX, scaleY);
			var scaleMax = Math.max(scaleX, scaleY);
			if (meetOrSlice == 'meet') { desiredWidth *= scaleMin; desiredHeight *= scaleMin; }
			if (meetOrSlice == 'slice') { desiredWidth *= scaleMax; desiredHeight *= scaleMax; }	
			
			refX = new svg.Property('refX', refX);
			refY = new svg.Property('refY', refY);
			if (refX.hasValue() && refY.hasValue()) {				
				ctx.translate(-scaleMin * refX.toPixels('x'), -scaleMin * refY.toPixels('y'));
			} 
			else {					
				// align
				if (align.match(/^xMid/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width / 2.0 - desiredWidth / 2.0, 0); 
				if (align.match(/YMid$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height / 2.0 - desiredHeight / 2.0); 
				if (align.match(/^xMax/) && ((meetOrSlice == 'meet' && scaleMin == scaleY) || (meetOrSlice == 'slice' && scaleMax == scaleY))) ctx.translate(width - desiredWidth, 0); 
				if (align.match(/YMax$/) && ((meetOrSlice == 'meet' && scaleMin == scaleX) || (meetOrSlice == 'slice' && scaleMax == scaleX))) ctx.translate(0, height - desiredHeight); 
			}
			
			// scale
			if (align == 'none') ctx.scale(scaleX, scaleY);
			else if (meetOrSlice == 'meet') ctx.scale(scaleMin, scaleMin); 
			else if (meetOrSlice == 'slice') ctx.scale(scaleMax, scaleMax); 	
			
			// translate
			ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);			
		}
		
		// elements
		svg.Element = {}
		
		svg.EmptyProperty = new svg.Property('EMPTY', '');
		
		svg.Element.ElementBase = function(node) {	
			this.attributes = {};
			this.styles = {};
			this.children = [];
			
			// get or create attribute
			this.attribute = function(name, createIfNotExists) {
				var a = this.attributes[name];
				if (a != null) return a;
							
				if (createIfNotExists == true) { a = new svg.Property(name, ''); this.attributes[name] = a; }
				return a || svg.EmptyProperty;
			}
			
			this.getHrefAttribute = function() {
				for (var a in this.attributes) { 
					if (a.match(/:href$/)) { 
						return this.attributes[a]; 
					} 
				}
				return svg.EmptyProperty;
			}
			
			// get or create style, crawls up node tree
			this.style = function(name, createIfNotExists, skipAncestors) {
				var s = this.styles[name];
				if (s != null) return s;
				
				var a = this.attribute(name);
				if (a != null && a.hasValue()) {
					this.styles[name] = a; // move up to me to cache
					return a;
				}
				
				if (skipAncestors != true) {
					var p = this.parent;
					if (p != null) {
						var ps = p.style(name);
						if (ps != null && ps.hasValue()) {
							return ps;
						}
					}
				}
					
				if (createIfNotExists == true) { s = new svg.Property(name, ''); this.styles[name] = s; }
				return s || svg.EmptyProperty;
			}
			
			// base render
			this.render = function(ctx) {
				// don't render display=none
				if (this.style('display').value == 'none') return;
				
				// don't render visibility=hidden
				if (this.style('visibility').value == 'hidden') return;
			
				ctx.save();
				if (this.attribute('mask').hasValue()) { // mask
					var mask = this.attribute('mask').getDefinition();
					if (mask != null) mask.apply(ctx, this);
				}
				else if (this.style('filter').hasValue()) { // filter
					var filter = this.style('filter').getDefinition();
					if (filter != null) filter.apply(ctx, this);
				}
				else {	
					this.setContext(ctx);
					this.renderChildren(ctx);	
					this.clearContext(ctx);							
				}
				ctx.restore();
			}
			
			// base set context
			this.setContext = function(ctx) {
				// OVERRIDE ME!
			}
			
			// base clear context
			this.clearContext = function(ctx) {
				// OVERRIDE ME!
			}			
			
			// base render children
			this.renderChildren = function(ctx) {
				for (var i=0; i<this.children.length; i++) {
					this.children[i].render(ctx);
				}
			}
			
			this.addChild = function(childNode, create) {
				var child = childNode;
				if (create) child = svg.CreateElement(childNode);
				child.parent = this;
				if (child.type != 'title') { this.children.push(child);	}
			}
				
			if (node != null && node.nodeType == 1) { //ELEMENT_NODE
				// add attributes
				for (var i=0; i<node.attributes.length; i++) {
					var attribute = node.attributes[i];
					this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
				}
										
				// add tag styles
				var styles = svg.Styles[node.nodeName];
				if (styles != null) {
					for (var name in styles) {
						this.styles[name] = styles[name];
					}
				}					
				
				// add class styles
				if (this.attribute('class').hasValue()) {
					var classes = svg.compressSpaces(this.attribute('class').value).split(' ');
					for (var j=0; j<classes.length; j++) {
						styles = svg.Styles['.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
						styles = svg.Styles[node.nodeName+'.'+classes[j]];
						if (styles != null) {
							for (var name in styles) {
								this.styles[name] = styles[name];
							}
						}
					}
				}
				
				// add id styles
				if (this.attribute('id').hasValue()) {
					var styles = svg.Styles['#' + this.attribute('id').value];
					if (styles != null) {
						for (var name in styles) {
							this.styles[name] = styles[name];
						}
					}
				}
				
				// add inline styles
				if (this.attribute('style').hasValue()) {
					var styles = this.attribute('style').value.split(';');
					for (var i=0; i<styles.length; i++) {
						if (svg.trim(styles[i]) != '') {
							var style = styles[i].split(':');
							var name = svg.trim(style[0]);
							var value = svg.trim(style[1]);
							this.styles[name] = new svg.Property(name, value);
						}
					}
				}	

				// add id
				if (this.attribute('id').hasValue()) {
					if (svg.Definitions[this.attribute('id').value] == null) {
						svg.Definitions[this.attribute('id').value] = this;
					}
				}
				
				// add children
				for (var i=0; i<node.childNodes.length; i++) {
					var childNode = node.childNodes[i];
					if (childNode.nodeType == 1) this.addChild(childNode, true); //ELEMENT_NODE
					if (this.captureTextNodes && (childNode.nodeType == 3 || childNode.nodeType == 4)) {
						var text = childNode.nodeValue || childNode.text || '';
						if (svg.trim(svg.compressSpaces(text)) != '') {
							this.addChild(new svg.Element.tspan(childNode), false); // TEXT_NODE
						}
					}
				}
			}
		}
		
		svg.Element.RenderedElementBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.setContext = function(ctx) {
				// fill
				if (this.style('fill').isUrlDefinition()) {
					var fs = this.style('fill').getFillStyleDefinition(this, this.style('fill-opacity'));
					if (fs != null) ctx.fillStyle = fs;
				}
				else if (this.style('fill').hasValue()) {
					var fillStyle = this.style('fill');
					if (fillStyle.value == 'currentColor') fillStyle.value = this.style('color').value;
					ctx.fillStyle = (fillStyle.value == 'none' ? 'rgba(0,0,0,0)' : fillStyle.value);
				}
				if (this.style('fill-opacity').hasValue()) {
					var fillStyle = new svg.Property('fill', ctx.fillStyle);
					fillStyle = fillStyle.addOpacity(this.style('fill-opacity'));
					ctx.fillStyle = fillStyle.value;
				}
									
				// stroke
				if (this.style('stroke').isUrlDefinition()) {
					var fs = this.style('stroke').getFillStyleDefinition(this, this.style('stroke-opacity'));
					if (fs != null) ctx.strokeStyle = fs;
				}
				else if (this.style('stroke').hasValue()) {
					var strokeStyle = this.style('stroke');
					if (strokeStyle.value == 'currentColor') strokeStyle.value = this.style('color').value;
					ctx.strokeStyle = (strokeStyle.value == 'none' ? 'rgba(0,0,0,0)' : strokeStyle.value);
				}
				if (this.style('stroke-opacity').hasValue()) {
					var strokeStyle = new svg.Property('stroke', ctx.strokeStyle);
					strokeStyle = strokeStyle.addOpacity(this.style('stroke-opacity'));
					ctx.strokeStyle = strokeStyle.value;
				}
				if (this.style('stroke-width').hasValue()) {
					var newLineWidth = this.style('stroke-width').toPixels();
					ctx.lineWidth = newLineWidth == 0 ? 0.001 : newLineWidth; // browsers don't respect 0
			    }
				if (this.style('stroke-linecap').hasValue()) ctx.lineCap = this.style('stroke-linecap').value;
				if (this.style('stroke-linejoin').hasValue()) ctx.lineJoin = this.style('stroke-linejoin').value;
				if (this.style('stroke-miterlimit').hasValue()) ctx.miterLimit = this.style('stroke-miterlimit').value;
				if (this.style('stroke-dasharray').hasValue() && this.style('stroke-dasharray').value != 'none') {
					var gaps = svg.ToNumberArray(this.style('stroke-dasharray').value);
					if (typeof(ctx.setLineDash) != 'undefined') { ctx.setLineDash(gaps); }
					else if (typeof(ctx.webkitLineDash) != 'undefined') { ctx.webkitLineDash = gaps; }
					else if (typeof(ctx.mozDash) != 'undefined' && !(gaps.length==1 && gaps[0]==0)) { ctx.mozDash = gaps; }
					
					var offset = this.style('stroke-dashoffset').numValueOrDefault(1);
					if (typeof(ctx.lineDashOffset) != 'undefined') { ctx.lineDashOffset = offset; }
					else if (typeof(ctx.webkitLineDashOffset) != 'undefined') { ctx.webkitLineDashOffset = offset; }
					else if (typeof(ctx.mozDashOffset) != 'undefined') { ctx.mozDashOffset = offset; }
				}

				// font
				if (typeof(ctx.font) != 'undefined') {
					ctx.font = svg.Font.CreateFont( 
						this.style('font-style').value, 
						this.style('font-variant').value, 
						this.style('font-weight').value, 
						this.style('font-size').hasValue() ? this.style('font-size').toPixels() + 'px' : '', 
						this.style('font-family').value).toString();
				}
				
				// transform
				if (this.attribute('transform').hasValue()) { 
					var transform = new svg.Transform(this.attribute('transform').value);
					transform.apply(ctx);
				}
				
				// clip
				if (this.style('clip-path', false, true).hasValue()) {
					var clip = this.style('clip-path', false, true).getDefinition();
					if (clip != null) clip.apply(ctx);
				}
				
				// opacity
				if (this.style('opacity').hasValue()) {
					ctx.globalAlpha = this.style('opacity').numValue();
				}
			}		
		}
		svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase;
		
		svg.Element.PathElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				if (ctx != null) ctx.beginPath();
				return new svg.BoundingBox();
			}
			
			this.renderChildren = function(ctx) {
				this.path(ctx);
				svg.Mouse.checkPath(this, ctx);
				if (ctx.fillStyle != '') {
					if (this.style('fill-rule').valueOrDefault('inherit') != 'inherit') { ctx.fill(this.style('fill-rule').value); }
					else { ctx.fill(); }
				}
				if (ctx.strokeStyle != '') ctx.stroke();
				
				var markers = this.getMarkers();
				if (markers != null) {
					if (this.style('marker-start').isUrlDefinition()) {
						var marker = this.style('marker-start').getDefinition();
						marker.render(ctx, markers[0][0], markers[0][1]);
					}
					if (this.style('marker-mid').isUrlDefinition()) {
						var marker = this.style('marker-mid').getDefinition();
						for (var i=1;i<markers.length-1;i++) {
							marker.render(ctx, markers[i][0], markers[i][1]);
						}
					}
					if (this.style('marker-end').isUrlDefinition()) {
						var marker = this.style('marker-end').getDefinition();
						marker.render(ctx, markers[markers.length-1][0], markers[markers.length-1][1]);
					}
				}					
			}
			
			this.getBoundingBox = function() {
				return this.path();
			}
			
			this.getMarkers = function() {
				return null;
			}
		}
		svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase;
		
		// svg element
		svg.Element.svg = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.baseClearContext = this.clearContext;
			this.clearContext = function(ctx) {
				this.baseClearContext(ctx);
				svg.ViewPort.RemoveCurrent();
			}
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				// initial values and defaults
				ctx.strokeStyle = 'rgba(0,0,0,0)';
				ctx.lineCap = 'butt';
				ctx.lineJoin = 'miter';
				ctx.miterLimit = 4;	
				if (typeof(ctx.font) != 'undefined' && typeof(window.getComputedStyle) != 'undefined') {
					ctx.font = window.getComputedStyle(ctx.canvas).getPropertyValue('font');
				}
			
				this.baseSetContext(ctx);
				
				// create new view port
				if (!this.attribute('x').hasValue()) this.attribute('x', true).value = 0;
				if (!this.attribute('y').hasValue()) this.attribute('y', true).value = 0;
				ctx.translate(this.attribute('x').toPixels('x'), this.attribute('y').toPixels('y'));
				
				var width = svg.ViewPort.width();
				var height = svg.ViewPort.height();
				
				if (!this.attribute('width').hasValue()) this.attribute('width', true).value = '100%';
				if (!this.attribute('height').hasValue()) this.attribute('height', true).value = '100%';
				if (typeof(this.root) == 'undefined') {
					width = this.attribute('width').toPixels('x');
					height = this.attribute('height').toPixels('y');
					
					var x = 0;
					var y = 0;
					if (this.attribute('refX').hasValue() && this.attribute('refY').hasValue()) {
						x = -this.attribute('refX').toPixels('x');
						y = -this.attribute('refY').toPixels('y');
					}
					
					if (this.attribute('overflow').valueOrDefault('hidden') != 'visible') {
						ctx.beginPath();
						ctx.moveTo(x, y);
						ctx.lineTo(width, y);
						ctx.lineTo(width, height);
						ctx.lineTo(x, height);
						ctx.closePath();
						ctx.clip();
					}
				}
				svg.ViewPort.SetCurrent(width, height);	
						
				// viewbox
				if (this.attribute('viewBox').hasValue()) {				
					var viewBox = svg.ToNumberArray(this.attribute('viewBox').value);
					var minX = viewBox[0];
					var minY = viewBox[1];
					width = viewBox[2];
					height = viewBox[3];
					
					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value, 
									svg.ViewPort.width(), 
									width,
									svg.ViewPort.height(),
									height,
									minX,
									minY,
									this.attribute('refX').value,
									this.attribute('refY').value);
					
					svg.ViewPort.RemoveCurrent();
					svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
				}				
			}
		}
		svg.Element.svg.prototype = new svg.Element.RenderedElementBase;

		// rect element
		svg.Element.rect = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				if (this.attribute('rx').hasValue() && !this.attribute('ry').hasValue()) ry = rx;
				if (this.attribute('ry').hasValue() && !this.attribute('rx').hasValue()) rx = ry;
				rx = Math.min(rx, width / 2.0);
				ry = Math.min(ry, height / 2.0);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(x + rx, y);
					ctx.lineTo(x + width - rx, y);
					ctx.quadraticCurveTo(x + width, y, x + width, y + ry)
					ctx.lineTo(x + width, y + height - ry);
					ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height)
					ctx.lineTo(x + rx, y + height);
					ctx.quadraticCurveTo(x, y + height, x, y + height - ry)
					ctx.lineTo(x, y + ry);
					ctx.quadraticCurveTo(x, y, x + rx, y)
					ctx.closePath();
				}
				
				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.rect.prototype = new svg.Element.PathElementBase;
		
		// circle element
		svg.Element.circle = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');
				var r = this.attribute('r').toPixels();
			
				if (ctx != null) {
					ctx.beginPath();
					ctx.arc(cx, cy, r, 0, Math.PI * 2, true); 
					ctx.closePath();
				}
				
				return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
			}
		}
		svg.Element.circle.prototype = new svg.Element.PathElementBase;	

		// ellipse element
		svg.Element.ellipse = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.path = function(ctx) {
				var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
				var rx = this.attribute('rx').toPixels('x');
				var ry = this.attribute('ry').toPixels('y');
				var cx = this.attribute('cx').toPixels('x');
				var cy = this.attribute('cy').toPixels('y');
				
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(cx, cy - ry);
					ctx.bezierCurveTo(cx + (KAPPA * rx), cy - ry,  cx + rx, cy - (KAPPA * ry), cx + rx, cy);
					ctx.bezierCurveTo(cx + rx, cy + (KAPPA * ry), cx + (KAPPA * rx), cy + ry, cx, cy + ry);
					ctx.bezierCurveTo(cx - (KAPPA * rx), cy + ry, cx - rx, cy + (KAPPA * ry), cx - rx, cy);
					ctx.bezierCurveTo(cx - rx, cy - (KAPPA * ry), cx - (KAPPA * rx), cy - ry, cx, cy - ry);
					ctx.closePath();
				}
				
				return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
			}
		}
		svg.Element.ellipse.prototype = new svg.Element.PathElementBase;			
		
		// line element
		svg.Element.line = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.getPoints = function() {
				return [
					new svg.Point(this.attribute('x1').toPixels('x'), this.attribute('y1').toPixels('y')),
					new svg.Point(this.attribute('x2').toPixels('x'), this.attribute('y2').toPixels('y'))];
			}
								
			this.path = function(ctx) {
				var points = this.getPoints();
				
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
				}
				
				return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
			}
			
			this.getMarkers = function() {
				var points = this.getPoints();	
				var a = points[0].angleTo(points[1]);
				return [[points[0], a], [points[1], a]];
			}
		}
		svg.Element.line.prototype = new svg.Element.PathElementBase;		
				
		// polyline element
		svg.Element.polyline = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
			
			this.points = svg.CreatePath(this.attribute('points').value);
			this.path = function(ctx) {
				var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
				if (ctx != null) {
					ctx.beginPath();
					ctx.moveTo(this.points[0].x, this.points[0].y);
				}
				for (var i=1; i<this.points.length; i++) {
					bb.addPoint(this.points[i].x, this.points[i].y);
					if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
				}
				return bb;
			}
			
			this.getMarkers = function() {
				var markers = [];
				for (var i=0; i<this.points.length - 1; i++) {
					markers.push([this.points[i], this.points[i].angleTo(this.points[i+1])]);
				}
				markers.push([this.points[this.points.length-1], markers[markers.length-1][1]]);
				return markers;
			}			
		}
		svg.Element.polyline.prototype = new svg.Element.PathElementBase;				
				
		// polygon element
		svg.Element.polygon = function(node) {
			this.base = svg.Element.polyline;
			this.base(node);
			
			this.basePath = this.path;
			this.path = function(ctx) {
				var bb = this.basePath(ctx);
				if (ctx != null) {
					ctx.lineTo(this.points[0].x, this.points[0].y);
					ctx.closePath();
				}
				return bb;
			}
		}
		svg.Element.polygon.prototype = new svg.Element.polyline;

		// path element
		svg.Element.path = function(node) {
			this.base = svg.Element.PathElementBase;
			this.base(node);
					
			var d = this.attribute('d').value;
			// TODO: convert to real lexer based on http://www.w3.org/TR/SVG11/paths.html#PathDataBNF
			d = d.replace(/,/gm,' '); // get rid of all commas
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from commands
			d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm,'$1 $2'); // separate commands from points
			d = d.replace(/([0-9])([+\-])/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/(\.[0-9]*)(\.)/gm,'$1 $2'); // separate digits when no comma
			d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm,'$1 $3 $4 '); // shorthand elliptical arc path syntax
			d = svg.compressSpaces(d); // compress multiple spaces
			d = svg.trim(d);
			this.PathParser = new (function(d) {
				this.tokens = d.split(' ');
				
				this.reset = function() {
					this.i = -1;
					this.command = '';
					this.previousCommand = '';
					this.start = new svg.Point(0, 0);
					this.control = new svg.Point(0, 0);
					this.current = new svg.Point(0, 0);
					this.points = [];
					this.angles = [];
				}
								
				this.isEnd = function() {
					return this.i >= this.tokens.length - 1;
				}
				
				this.isCommandOrEnd = function() {
					if (this.isEnd()) return true;
					return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
				}
				
				this.isRelativeCommand = function() {
					switch(this.command)
					{
						case 'm':
						case 'l':
						case 'h':
						case 'v':
						case 'c':
						case 's':
						case 'q':
						case 't':
						case 'a':
						case 'z':
							return true;
							break;
					}
					return false;
				}
							
				this.getToken = function() {
					this.i++;
					return this.tokens[this.i];
				}
				
				this.getScalar = function() {
					return parseFloat(this.getToken());
				}
				
				this.nextCommand = function() {
					this.previousCommand = this.command;
					this.command = this.getToken();
				}				
				
				this.getPoint = function() {
					var p = new svg.Point(this.getScalar(), this.getScalar());
					return this.makeAbsolute(p);
				}
				
				this.getAsControlPoint = function() {
					var p = this.getPoint();
					this.control = p;
					return p;
				}
				
				this.getAsCurrentPoint = function() {
					var p = this.getPoint();
					this.current = p;
					return p;	
				}
				
				this.getReflectedControlPoint = function() {
					if (this.previousCommand.toLowerCase() != 'c' && 
					    this.previousCommand.toLowerCase() != 's' &&
						this.previousCommand.toLowerCase() != 'q' && 
						this.previousCommand.toLowerCase() != 't' ){
						return this.current;
					}
					
					// reflect point
					var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);					
					return p;
				}
				
				this.makeAbsolute = function(p) {
					if (this.isRelativeCommand()) {
						p.x += this.current.x;
						p.y += this.current.y;
					}
					return p;
				}
				
				this.addMarker = function(p, from, priorTo) {
					// if the last angle isn't filled in because we didn't have this point yet ...
					if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length-1] == null) {
						this.angles[this.angles.length-1] = this.points[this.points.length-1].angleTo(priorTo);
					}
					this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
				}
				
				this.addMarkerAngle = function(p, a) {
					this.points.push(p);
					this.angles.push(a);
				}				
				
				this.getMarkerPoints = function() { return this.points; }
				this.getMarkerAngles = function() {
					for (var i=0; i<this.angles.length; i++) {
						if (this.angles[i] == null) {
							for (var j=i+1; j<this.angles.length; j++) {
								if (this.angles[j] != null) {
									this.angles[i] = this.angles[j];
									break;
								}
							}
						}
					}
					return this.angles;
				}
			})(d);

			this.path = function(ctx) {
				var pp = this.PathParser;
				pp.reset();

				var bb = new svg.BoundingBox();
				if (ctx != null) ctx.beginPath();
				while (!pp.isEnd()) {
					pp.nextCommand();
					switch (pp.command) {
					case 'M':
					case 'm':
						var p = pp.getAsCurrentPoint();
						pp.addMarker(p);
						bb.addPoint(p.x, p.y);
						if (ctx != null) ctx.moveTo(p.x, p.y);
						pp.start = pp.current;
						while (!pp.isCommandOrEnd()) {
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, pp.start);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'L':
					case 'l':
						while (!pp.isCommandOrEnd()) {
							var c = pp.current;
							var p = pp.getAsCurrentPoint();
							pp.addMarker(p, c);
							bb.addPoint(p.x, p.y);
							if (ctx != null) ctx.lineTo(p.x, p.y);
						}
						break;
					case 'H':
					case 'h':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'V':
					case 'v':
						while (!pp.isCommandOrEnd()) {
							var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
							pp.addMarker(newP, pp.current);
							pp.current = newP;
							bb.addPoint(pp.current.x, pp.current.y);
							if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
						}
						break;
					case 'C':
					case 'c':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'S':
					case 's':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var p1 = pp.getReflectedControlPoint();
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, p1);
							bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'Q':
					case 'q':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getAsControlPoint();
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'T':
					case 't':
						while (!pp.isCommandOrEnd()) {
							var curr = pp.current;
							var cntrl = pp.getReflectedControlPoint();
							pp.control = cntrl;
							var cp = pp.getAsCurrentPoint();
							pp.addMarker(cp, cntrl, cntrl);
							bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
							if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
						}
						break;
					case 'A':
					case 'a':
						while (!pp.isCommandOrEnd()) {
						    var curr = pp.current;
							var rx = pp.getScalar();
							var ry = pp.getScalar();
							var xAxisRotation = pp.getScalar() * (Math.PI / 180.0);
							var largeArcFlag = pp.getScalar();
							var sweepFlag = pp.getScalar();
							var cp = pp.getAsCurrentPoint();

							// Conversion from endpoint to center parameterization
							// http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
							// x1', y1'
							var currp = new svg.Point(
								Math.cos(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2.0,
								-Math.sin(xAxisRotation) * (curr.x - cp.x) / 2.0 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2.0
							);
							// adjust radii
							var l = Math.pow(currp.x,2)/Math.pow(rx,2)+Math.pow(currp.y,2)/Math.pow(ry,2);
							if (l > 1) {
								rx *= Math.sqrt(l);
								ry *= Math.sqrt(l);
							}
							// cx', cy'
							var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt(
								((Math.pow(rx,2)*Math.pow(ry,2))-(Math.pow(rx,2)*Math.pow(currp.y,2))-(Math.pow(ry,2)*Math.pow(currp.x,2))) /
								(Math.pow(rx,2)*Math.pow(currp.y,2)+Math.pow(ry,2)*Math.pow(currp.x,2))
							);
							if (isNaN(s)) s = 0;
							var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
							// cx, cy
							var centp = new svg.Point(
								(curr.x + cp.x) / 2.0 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y,
								(curr.y + cp.y) / 2.0 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y
							);
							// vector magnitude
							var m = function(v) { return Math.sqrt(Math.pow(v[0],2) + Math.pow(v[1],2)); }
							// ratio between two vectors
							var r = function(u, v) { return (u[0]*v[0]+u[1]*v[1]) / (m(u)*m(v)) }
							// angle between two vectors
							var a = function(u, v) { return (u[0]*v[1] < u[1]*v[0] ? -1 : 1) * Math.acos(r(u,v)); }
							// initial angle
							var a1 = a([1,0], [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry]);
							// angle delta
							var u = [(currp.x-cpp.x)/rx,(currp.y-cpp.y)/ry];
							var v = [(-currp.x-cpp.x)/rx,(-currp.y-cpp.y)/ry];
							var ad = a(u, v);
							if (r(u,v) <= -1) ad = Math.PI;
							if (r(u,v) >= 1) ad = 0;

							// for markers
							var dir = 1 - sweepFlag ? 1.0 : -1.0;
							var ah = a1 + dir * (ad / 2.0);
							var halfWay = new svg.Point(
								centp.x + rx * Math.cos(ah),
								centp.y + ry * Math.sin(ah)
							);
							pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
							pp.addMarkerAngle(cp, ah - dir * Math.PI);

							bb.addPoint(cp.x, cp.y); // TODO: this is too naive, make it better
							if (ctx != null) {
								var r = rx > ry ? rx : ry;
								var sx = rx > ry ? 1 : rx / ry;
								var sy = rx > ry ? ry / rx : 1;

								ctx.translate(centp.x, centp.y);
								ctx.rotate(xAxisRotation);
								ctx.scale(sx, sy);
								ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
								ctx.scale(1/sx, 1/sy);
								ctx.rotate(-xAxisRotation);
								ctx.translate(-centp.x, -centp.y);
							}
						}
						break;
					case 'Z':
					case 'z':
						if (ctx != null) ctx.closePath();
						pp.current = pp.start;
					}
				}

				return bb;
			}

			this.getMarkers = function() {
				var points = this.PathParser.getMarkerPoints();
				var angles = this.PathParser.getMarkerAngles();
				
				var markers = [];
				for (var i=0; i<points.length; i++) {
					markers.push([points[i], angles[i]]);
				}
				return markers;
			}
		}
		svg.Element.path.prototype = new svg.Element.PathElementBase;
		
		// pattern element
		svg.Element.pattern = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.createPattern = function(ctx, element) {
				var width = this.attribute('width').toPixels('x', true);
				var height = this.attribute('height').toPixels('y', true);
			
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['width'] = new svg.Property('width', width + 'px');
				tempSvg.attributes['height'] = new svg.Property('height', height + 'px');
				tempSvg.attributes['transform'] = new svg.Property('transform', this.attribute('patternTransform').value);
				tempSvg.children = this.children;
				
				var c = document.createElement('canvas');
				c.width = width;
				c.height = height;
				var cctx = c.getContext('2d');
				if (this.attribute('x').hasValue() && this.attribute('y').hasValue()) {
					cctx.translate(this.attribute('x').toPixels('x', true), this.attribute('y').toPixels('y', true));
				}
				// render 3x3 grid so when we transform there's no white space on edges
				for (var x=-1; x<=1; x++) {
					for (var y=-1; y<=1; y++) {
						cctx.save();
						cctx.translate(x * c.width, y * c.height);
						tempSvg.render(cctx);
						cctx.restore();
					}
				}
				var pattern = ctx.createPattern(c, 'repeat');
				return pattern;
			}
		}
		svg.Element.pattern.prototype = new svg.Element.ElementBase;
		
		// marker element
		svg.Element.marker = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.baseRender = this.render;
			this.render = function(ctx, point, angle) {
				ctx.translate(point.x, point.y);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(angle);
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(ctx.lineWidth, ctx.lineWidth);
				ctx.save();
							
				// render me using a temporary svg element
				var tempSvg = new svg.Element.svg();
				tempSvg.attributes['viewBox'] = new svg.Property('viewBox', this.attribute('viewBox').value);
				tempSvg.attributes['refX'] = new svg.Property('refX', this.attribute('refX').value);
				tempSvg.attributes['refY'] = new svg.Property('refY', this.attribute('refY').value);
				tempSvg.attributes['width'] = new svg.Property('width', this.attribute('markerWidth').value);
				tempSvg.attributes['height'] = new svg.Property('height', this.attribute('markerHeight').value);
				tempSvg.attributes['fill'] = new svg.Property('fill', this.attribute('fill').valueOrDefault('black'));
				tempSvg.attributes['stroke'] = new svg.Property('stroke', this.attribute('stroke').valueOrDefault('none'));
				tempSvg.children = this.children;
				tempSvg.render(ctx);
				
				ctx.restore();
				if (this.attribute('markerUnits').valueOrDefault('strokeWidth') == 'strokeWidth') ctx.scale(1/ctx.lineWidth, 1/ctx.lineWidth);
				if (this.attribute('orient').valueOrDefault('auto') == 'auto') ctx.rotate(-angle);
				ctx.translate(-point.x, -point.y);
			}
		}
		svg.Element.marker.prototype = new svg.Element.ElementBase;
		
		// definitions element
		svg.Element.defs = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);	
			
			this.render = function(ctx) {
				// NOOP
			}
		}
		svg.Element.defs.prototype = new svg.Element.ElementBase;
		
		// base for gradients
		svg.Element.GradientBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.gradientUnits = this.attribute('gradientUnits').valueOrDefault('objectBoundingBox');
			
			this.stops = [];			
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'stop') this.stops.push(child);
			}	
			
			this.getGradient = function() {
				// OVERRIDE ME!
			}			

			this.createGradient = function(ctx, element, parentOpacityProp) {
				var stopsContainer = this;
				if (this.getHrefAttribute().hasValue()) {
					stopsContainer = this.getHrefAttribute().getDefinition();
				}
				
				var addParentOpacity = function (color) {
					if (parentOpacityProp.hasValue()) {
						var p = new svg.Property('color', color);
						return p.addOpacity(parentOpacityProp).value;
					}
					return color;
				};
			
				var g = this.getGradient(ctx, element);
				if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
				for (var i=0; i<stopsContainer.stops.length; i++) {
					g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
				}
				
				if (this.attribute('gradientTransform').hasValue()) {
					// render as transformed pattern on temporary canvas
					var rootView = svg.ViewPort.viewPorts[0];
					
					var rect = new svg.Element.rect();
					rect.attributes['x'] = new svg.Property('x', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['y'] = new svg.Property('y', -svg.MAX_VIRTUAL_PIXELS/3.0);
					rect.attributes['width'] = new svg.Property('width', svg.MAX_VIRTUAL_PIXELS);
					rect.attributes['height'] = new svg.Property('height', svg.MAX_VIRTUAL_PIXELS);
					
					var group = new svg.Element.g();
					group.attributes['transform'] = new svg.Property('transform', this.attribute('gradientTransform').value);
					group.children = [ rect ];
					
					var tempSvg = new svg.Element.svg();
					tempSvg.attributes['x'] = new svg.Property('x', 0);
					tempSvg.attributes['y'] = new svg.Property('y', 0);
					tempSvg.attributes['width'] = new svg.Property('width', rootView.width);
					tempSvg.attributes['height'] = new svg.Property('height', rootView.height);
					tempSvg.children = [ group ];
					
					var c = document.createElement('canvas');
					c.width = rootView.width;
					c.height = rootView.height;
					var tempCtx = c.getContext('2d');
					tempCtx.fillStyle = g;
					tempSvg.render(tempCtx);		
					return tempCtx.createPattern(c, 'no-repeat');
				}
				
				return g;				
			}
		}
		svg.Element.GradientBase.prototype = new svg.Element.ElementBase;
		
		// linear gradient element
		svg.Element.linearGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);
			
			this.getGradient = function(ctx, element) {
				var bb = this.gradientUnits == 'objectBoundingBox' ? element.getBoundingBox() : null;
				
				if (!this.attribute('x1').hasValue()
				 && !this.attribute('y1').hasValue()
				 && !this.attribute('x2').hasValue()
				 && !this.attribute('y2').hasValue()) {
					this.attribute('x1', true).value = 0;
					this.attribute('y1', true).value = 0;
					this.attribute('x2', true).value = 1;
					this.attribute('y2', true).value = 0;
				 }
				
				var x1 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('x1').numValue() 
					: this.attribute('x1').toPixels('x'));
				var y1 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('y1').numValue()
					: this.attribute('y1').toPixels('y'));
				var x2 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('x2').numValue()
					: this.attribute('x2').toPixels('x'));
				var y2 = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('y2').numValue()
					: this.attribute('y2').toPixels('y'));

				if (x1 == x2 && y1 == y2) return null;
				return ctx.createLinearGradient(x1, y1, x2, y2);
			}
		}
		svg.Element.linearGradient.prototype = new svg.Element.GradientBase;
		
		// radial gradient element
		svg.Element.radialGradient = function(node) {
			this.base = svg.Element.GradientBase;
			this.base(node);
			
			this.getGradient = function(ctx, element) {
				var bb = element.getBoundingBox();
				
				if (!this.attribute('cx').hasValue()) this.attribute('cx', true).value = '50%';
				if (!this.attribute('cy').hasValue()) this.attribute('cy', true).value = '50%';
				if (!this.attribute('r').hasValue()) this.attribute('r', true).value = '50%';
				
				var cx = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('cx').numValue() 
					: this.attribute('cx').toPixels('x'));
				var cy = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('cy').numValue() 
					: this.attribute('cy').toPixels('y'));
				
				var fx = cx;
				var fy = cy;
				if (this.attribute('fx').hasValue()) {
					fx = (this.gradientUnits == 'objectBoundingBox' 
					? bb.x() + bb.width() * this.attribute('fx').numValue() 
					: this.attribute('fx').toPixels('x'));
				}
				if (this.attribute('fy').hasValue()) {
					fy = (this.gradientUnits == 'objectBoundingBox' 
					? bb.y() + bb.height() * this.attribute('fy').numValue() 
					: this.attribute('fy').toPixels('y'));
				}
				
				var r = (this.gradientUnits == 'objectBoundingBox' 
					? (bb.width() + bb.height()) / 2.0 * this.attribute('r').numValue()
					: this.attribute('r').toPixels());
				
				return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
			}
		}
		svg.Element.radialGradient.prototype = new svg.Element.GradientBase;
		
		// gradient stop element
		svg.Element.stop = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.offset = this.attribute('offset').numValue();
			if (this.offset < 0) this.offset = 0;
			if (this.offset > 1) this.offset = 1;
			
			var stopColor = this.style('stop-color');
			if (this.style('stop-opacity').hasValue()) stopColor = stopColor.addOpacity(this.style('stop-opacity'));
			this.color = stopColor.value;
		}
		svg.Element.stop.prototype = new svg.Element.ElementBase;
		
		// animation base element
		svg.Element.AnimateBase = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			svg.Animations.push(this);
			
			this.duration = 0.0;
			this.begin = this.attribute('begin').toMilliseconds();
			this.maxDuration = this.begin + this.attribute('dur').toMilliseconds();
			
			this.getProperty = function() {
				var attributeType = this.attribute('attributeType').value;
				var attributeName = this.attribute('attributeName').value;
				
				if (attributeType == 'CSS') {
					return this.parent.style(attributeName, true);
				}
				return this.parent.attribute(attributeName, true);			
			};
			
			this.initialValue = null;
			this.initialUnits = '';
			this.removed = false;		

			this.calcValue = function() {
				// OVERRIDE ME!
				return '';
			}
					
			this.update = function(delta) {	
				// set initial value
				if (this.initialValue == null) {
					this.initialValue = this.getProperty().value;
					this.initialUnits = this.getProperty().getUnits();
				}
			
				// if we're past the end time
				if (this.duration > this.maxDuration) {
					// loop for indefinitely repeating animations
					if (this.attribute('repeatCount').value == 'indefinite'
					 || this.attribute('repeatDur').value == 'indefinite') {
						this.duration = 0.0
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'freeze' && !this.frozen) {
						this.frozen = true;
						this.parent.animationFrozen = true;
						this.parent.animationFrozenValue = this.getProperty().value;
					}
					else if (this.attribute('fill').valueOrDefault('remove') == 'remove' && !this.removed) {
						this.removed = true;
						this.getProperty().value = this.parent.animationFrozen ? this.parent.animationFrozenValue : this.initialValue;
						return true;
					}
					return false;
				}			
				this.duration = this.duration + delta;
			
				// if we're past the begin time
				var updated = false;
				if (this.begin < this.duration) {
					var newValue = this.calcValue(); // tween
					
					if (this.attribute('type').hasValue()) {
						// for transform, etc.
						var type = this.attribute('type').value;
						newValue = type + '(' + newValue + ')';
					}
					
					this.getProperty().value = newValue;
					updated = true;
				}
				
				return updated;
			}
			
			this.from = this.attribute('from');
			this.to = this.attribute('to');
			this.values = this.attribute('values');
			if (this.values.hasValue()) this.values.value = this.values.value.split(';');
			
			// fraction of duration we've covered
			this.progress = function() {
				var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
				if (this.values.hasValue()) {
					var p = ret.progress * (this.values.value.length - 1);
					var lb = Math.floor(p), ub = Math.ceil(p);
					ret.from = new svg.Property('from', parseFloat(this.values.value[lb]));
					ret.to = new svg.Property('to', parseFloat(this.values.value[ub]));
					ret.progress = (p - lb) / (ub - lb);
				}
				else {
					ret.from = this.from;
					ret.to = this.to;
				}
				return ret;
			}			
		}
		svg.Element.AnimateBase.prototype = new svg.Element.ElementBase;
		
		// animate element
		svg.Element.animate = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);
			
			this.calcValue = function() {
				var p = this.progress();
				
				// tween value linearly
				var newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress; 
				return newValue + this.initialUnits;
			};
		}
		svg.Element.animate.prototype = new svg.Element.AnimateBase;
			
		// animate color element
		svg.Element.animateColor = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);

			this.calcValue = function() {
				var p = this.progress();
				var from = new RGBColor(p.from.value);
				var to = new RGBColor(p.to.value);
				
				if (from.ok && to.ok) {
					// tween color linearly
					var r = from.r + (to.r - from.r) * p.progress;
					var g = from.g + (to.g - from.g) * p.progress;
					var b = from.b + (to.b - from.b) * p.progress;
					return 'rgb('+parseInt(r,10)+','+parseInt(g,10)+','+parseInt(b,10)+')';
				}
				return this.attribute('from').value;
			};
		}
		svg.Element.animateColor.prototype = new svg.Element.AnimateBase;
		
		// animate transform element
		svg.Element.animateTransform = function(node) {
			this.base = svg.Element.AnimateBase;
			this.base(node);
			
			this.calcValue = function() {
				var p = this.progress();
				
				// tween value linearly
				var from = svg.ToNumberArray(p.from.value);
				var to = svg.ToNumberArray(p.to.value);
				var newValue = '';
				for (var i=0; i<from.length; i++) {
					newValue += from[i] + (to[i] - from[i]) * p.progress + ' ';
				}
				return newValue;
			};
		}
		svg.Element.animateTransform.prototype = new svg.Element.animate;
		
		// font element
		svg.Element.font = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.horizAdvX = this.attribute('horiz-adv-x').numValue();			
			
			this.isRTL = false;
			this.isArabic = false;
			this.fontFace = null;
			this.missingGlyph = null;
			this.glyphs = [];			
			for (var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				if (child.type == 'font-face') {
					this.fontFace = child;
					if (child.style('font-family').hasValue()) {
						svg.Definitions[child.style('font-family').value] = this;
					}
				}
				else if (child.type == 'missing-glyph') this.missingGlyph = child;
				else if (child.type == 'glyph') {
					if (child.arabicForm != '') {
						this.isRTL = true;
						this.isArabic = true;
						if (typeof(this.glyphs[child.unicode]) == 'undefined') this.glyphs[child.unicode] = [];
						this.glyphs[child.unicode][child.arabicForm] = child;
					}
					else {
						this.glyphs[child.unicode] = child;
					}
				}
			}	
		}
		svg.Element.font.prototype = new svg.Element.ElementBase;
		
		// font-face element
		svg.Element.fontface = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);	
			
			this.ascent = this.attribute('ascent').value;
			this.descent = this.attribute('descent').value;
			this.unitsPerEm = this.attribute('units-per-em').numValue();				
		}
		svg.Element.fontface.prototype = new svg.Element.ElementBase;
		
		// missing-glyph element
		svg.Element.missingglyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);	
			
			this.horizAdvX = 0;
		}
		svg.Element.missingglyph.prototype = new svg.Element.path;
		
		// glyph element
		svg.Element.glyph = function(node) {
			this.base = svg.Element.path;
			this.base(node);	
			
			this.horizAdvX = this.attribute('horiz-adv-x').numValue();
			this.unicode = this.attribute('unicode').value;
			this.arabicForm = this.attribute('arabic-form').value;
		}
		svg.Element.glyph.prototype = new svg.Element.path;
		
		// text element
		svg.Element.text = function(node) {
			this.captureTextNodes = true;
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				
				var textBaseline = this.style('dominant-baseline').toTextBaseline();
				if (textBaseline == null) textBaseline = this.style('alignment-baseline').toTextBaseline();
				if (textBaseline != null) ctx.textBaseline = textBaseline;
			}
			
			this.getBoundingBox = function () {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
				return new svg.BoundingBox(x, y - fontSize, x + Math.floor(fontSize * 2.0 / 3.0) * this.children[0].getText().length, y);
			}
			
			this.renderChildren = function(ctx) {
				this.x = this.attribute('x').toPixels('x');
				this.y = this.attribute('y').toPixels('y');
				this.x += this.getAnchorDelta(ctx, this, 0);
				for (var i=0; i<this.children.length; i++) {
					this.renderChild(ctx, this, i);
				}
			}
			
			this.getAnchorDelta = function (ctx, parent, startI) {
				var textAnchor = this.style('text-anchor').valueOrDefault('start');
				if (textAnchor != 'start') {
					var width = 0;
					for (var i=startI; i<parent.children.length; i++) {
						var child = parent.children[i];
						if (i > startI && child.attribute('x').hasValue()) break; // new group
						width += child.measureTextRecursive(ctx);
					}
					return -1 * (textAnchor == 'end' ? width : width / 2.0);
				}
				return 0;
			}
			
			this.renderChild = function(ctx, parent, i) {
				var child = parent.children[i];
				if (child.attribute('x').hasValue()) {
					child.x = child.attribute('x').toPixels('x') + this.getAnchorDelta(ctx, parent, i);
					if (child.attribute('dx').hasValue()) child.x += child.attribute('dx').toPixels('x');
				}
				else {
					if (this.attribute('dx').hasValue()) this.x += this.attribute('dx').toPixels('x');
					if (child.attribute('dx').hasValue()) this.x += child.attribute('dx').toPixels('x');
					child.x = this.x;
				}
				this.x = child.x + child.measureText(ctx);
				
				if (child.attribute('y').hasValue()) {
					child.y = child.attribute('y').toPixels('y');
					if (child.attribute('dy').hasValue()) child.y += child.attribute('dy').toPixels('y');
				}
				else {
					if (this.attribute('dy').hasValue()) this.y += this.attribute('dy').toPixels('y');
					if (child.attribute('dy').hasValue()) this.y += child.attribute('dy').toPixels('y');
					child.y = this.y;
				}
				this.y = child.y;
				
				child.render(ctx);
				
				for (var i=0; i<child.children.length; i++) {
					this.renderChild(ctx, child, i);
				}
			}
		}
		svg.Element.text.prototype = new svg.Element.RenderedElementBase;
		
		// text base
		svg.Element.TextElementBase = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.getGlyph = function(font, text, i) {
				var c = text[i];
				var glyph = null;
				if (font.isArabic) {
					var arabicForm = 'isolated';
					if ((i==0 || text[i-1]==' ') && i<text.length-2 && text[i+1]!=' ') arabicForm = 'terminal'; 
					if (i>0 && text[i-1]!=' ' && i<text.length-2 && text[i+1]!=' ') arabicForm = 'medial';
					if (i>0 && text[i-1]!=' ' && (i == text.length-1 || text[i+1]==' ')) arabicForm = 'initial';
					if (typeof(font.glyphs[c]) != 'undefined') {
						glyph = font.glyphs[c][arabicForm];
						if (glyph == null && font.glyphs[c].type == 'glyph') glyph = font.glyphs[c];
					}
				}
				else {
					glyph = font.glyphs[c];
				}
				if (glyph == null) glyph = font.missingGlyph;
				return glyph;
			}
			
			this.renderChildren = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var fontStyle = this.parent.style('font-style').valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");
					
					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						var scale = fontSize / customFont.fontFace.unitsPerEm;
						ctx.translate(this.x, this.y);
						ctx.scale(scale, -scale);
						var lw = ctx.lineWidth;
						ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
						if (fontStyle == 'italic') ctx.transform(1, 0, .4, 1, 0, 0);
						glyph.render(ctx);
						if (fontStyle == 'italic') ctx.transform(1, 0, -.4, 1, 0, 0);
						ctx.lineWidth = lw;
						ctx.scale(1/scale, -1/scale);
						ctx.translate(-this.x, -this.y);	
						
						this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							this.x += dx[i];
						}
					}
					return;
				}
			
				if (ctx.fillStyle != '') ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
				if (ctx.strokeStyle != '') ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
			}
			
			this.getText = function() {
				// OVERRIDE ME
			}
			
			this.measureTextRecursive = function(ctx) {
				var width = this.measureText(ctx);
				for (var i=0; i<this.children.length; i++) {
					width += this.children[i].measureTextRecursive(ctx);
				}
				return width;
			}
			
			this.measureText = function(ctx) {
				var customFont = this.parent.style('font-family').getDefinition();
				if (customFont != null) {
					var fontSize = this.parent.style('font-size').numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
					var measure = 0;
					var text = this.getText();
					if (customFont.isRTL) text = text.split("").reverse().join("");
					var dx = svg.ToNumberArray(this.parent.attribute('dx').value);
					for (var i=0; i<text.length; i++) {
						var glyph = this.getGlyph(customFont, text, i);
						measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
						if (typeof(dx[i]) != 'undefined' && !isNaN(dx[i])) {
							measure += dx[i];
						}
					}
					return measure;
				}
			
				var textToMeasure = svg.compressSpaces(this.getText());
				if (!ctx.measureText) return textToMeasure.length * 10;
				
				ctx.save();
				this.setContext(ctx);
				var width = ctx.measureText(textToMeasure).width;
				ctx.restore();
				return width;
			}
		}
		svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase;
		
		// tspan 
		svg.Element.tspan = function(node) {
			this.captureTextNodes = true;
			this.base = svg.Element.TextElementBase;
			this.base(node);
			
			this.text = node.nodeValue || node.text || '';
			this.getText = function() {
				return this.text;
			}
		}
		svg.Element.tspan.prototype = new svg.Element.TextElementBase;
		
		// tref
		svg.Element.tref = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);
			
			this.getText = function() {
				var element = this.getHrefAttribute().getDefinition();
				if (element != null) return element.children[0].getText();
			}
		}
		svg.Element.tref.prototype = new svg.Element.TextElementBase;		
		
		// a element
		svg.Element.a = function(node) {
			this.base = svg.Element.TextElementBase;
			this.base(node);
			
			this.hasText = true;
			for (var i=0; i<node.childNodes.length; i++) {
				if (node.childNodes[i].nodeType != 3) this.hasText = false;
			}
			
			// this might contain text
			this.text = this.hasText ? node.childNodes[0].nodeValue : '';
			this.getText = function() {
				return this.text;
			}		

			this.baseRenderChildren = this.renderChildren;
			this.renderChildren = function(ctx) {
				if (this.hasText) {
					// render as text element
					this.baseRenderChildren(ctx);
					var fontSize = new svg.Property('fontSize', svg.Font.Parse(svg.ctx.font).fontSize);
					svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels('y'), this.x + this.measureText(ctx), this.y));					
				}
				else {
					// render as temporary group
					var g = new svg.Element.g();
					g.children = this.children;
					g.parent = this;
					g.render(ctx);
				}
			}
			
			this.onclick = function() {
				window.open(this.getHrefAttribute().value);
			}
			
			this.onmousemove = function() {
				svg.ctx.canvas.style.cursor = 'pointer';
			}
		}
		svg.Element.a.prototype = new svg.Element.TextElementBase;		
		
		// image element
		svg.Element.image = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			var href = this.getHrefAttribute().value;
			if (href == '') { return; }
			var isSvg = href.match(/\.svg$/)
			
			svg.Images.push(this);
			this.loaded = false;
			if (!isSvg) {
				this.img = document.createElement('img');
				if (svg.opts['useCORS'] == true) { this.img.crossOrigin = 'Anonymous'; }
				var self = this;
				this.img.onload = function() { self.loaded = true; }
				this.img.onerror = function() { svg.log('ERROR: image "' + href + '" not found'); self.loaded = true; }
				this.img.src = href;
			}
			else {
				this.img = svg.ajax(href);
				this.loaded = true;
			}
			
			this.renderChildren = function(ctx) {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');			
				if (width == 0 || height == 0) return;
			
				ctx.save();
				if (isSvg) {
					ctx.drawSvg(this.img, x, y, width, height);
				}
				else {
					ctx.translate(x, y);
					svg.AspectRatio(ctx,
									this.attribute('preserveAspectRatio').value,
									width,
									this.img.width,
									height,
									this.img.height,
									0,
									0);	
					ctx.drawImage(this.img, 0, 0);		
				}
				ctx.restore();
			}
			
			this.getBoundingBox = function() {
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				return new svg.BoundingBox(x, y, x + width, y + height);
			}
		}
		svg.Element.image.prototype = new svg.Element.RenderedElementBase;
		
		// group element
		svg.Element.g = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.getBoundingBox = function() {
				var bb = new svg.BoundingBox();
				for (var i=0; i<this.children.length; i++) {
					bb.addBoundingBox(this.children[i].getBoundingBox());
				}
				return bb;
			};
		}
		svg.Element.g.prototype = new svg.Element.RenderedElementBase;

		// symbol element
		svg.Element.symbol = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);

			this.render = function(ctx) {
				// NO RENDER
			};
		}
		svg.Element.symbol.prototype = new svg.Element.RenderedElementBase;		
			
		// style element
		svg.Element.style = function(node) { 
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			// text, or spaces then CDATA
			var css = ''
			for (var i=0; i<node.childNodes.length; i++) {
			  css += node.childNodes[i].nodeValue;
			}
			css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ''); // remove comments
			css = svg.compressSpaces(css); // replace whitespace
			var cssDefs = css.split('}');
			for (var i=0; i<cssDefs.length; i++) {
				if (svg.trim(cssDefs[i]) != '') {
					var cssDef = cssDefs[i].split('{');
					var cssClasses = cssDef[0].split(',');
					var cssProps = cssDef[1].split(';');
					for (var j=0; j<cssClasses.length; j++) {
						var cssClass = svg.trim(cssClasses[j]);
						if (cssClass != '') {
							var props = {};
							for (var k=0; k<cssProps.length; k++) {
								var prop = cssProps[k].indexOf(':');
								var name = cssProps[k].substr(0, prop);
								var value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
								if (name != null && value != null) {
									props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
								}
							}
							svg.Styles[cssClass] = props;
							if (cssClass == '@font-face') {
								var fontFamily = props['font-family'].value.replace(/"/g,'');
								var srcs = props['src'].value.split(',');
								for (var s=0; s<srcs.length; s++) {
									if (srcs[s].indexOf('format("svg")') > 0) {
										var urlStart = srcs[s].indexOf('url');
										var urlEnd = srcs[s].indexOf(')', urlStart);
										var url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
										var doc = svg.parseXml(svg.ajax(url));
										var fonts = doc.getElementsByTagName('font');
										for (var f=0; f<fonts.length; f++) {
											var font = svg.CreateElement(fonts[f]);
											svg.Definitions[fontFamily] = font;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		svg.Element.style.prototype = new svg.Element.ElementBase;
		
		// use element 
		svg.Element.use = function(node) {
			this.base = svg.Element.RenderedElementBase;
			this.base(node);
			
			this.baseSetContext = this.setContext;
			this.setContext = function(ctx) {
				this.baseSetContext(ctx);
				if (this.attribute('x').hasValue()) ctx.translate(this.attribute('x').toPixels('x'), 0);
				if (this.attribute('y').hasValue()) ctx.translate(0, this.attribute('y').toPixels('y'));
			}
			
			var element = this.getHrefAttribute().getDefinition();
			
			this.path = function(ctx) {
				if (element != null) element.path(ctx);
			}
			
			this.getBoundingBox = function() {
				if (element != null) return element.getBoundingBox();
			}
			
			this.renderChildren = function(ctx) {
				if (element != null) {
					var tempSvg = element;
					if (element.type == 'symbol') {
						// render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
						tempSvg = new svg.Element.svg();
						tempSvg.type = 'svg';
						tempSvg.attributes['viewBox'] = new svg.Property('viewBox', element.attribute('viewBox').value);
						tempSvg.attributes['preserveAspectRatio'] = new svg.Property('preserveAspectRatio', element.attribute('preserveAspectRatio').value);
						tempSvg.attributes['overflow'] = new svg.Property('overflow', element.attribute('overflow').value);
						tempSvg.children = element.children;
					}
					if (tempSvg.type == 'svg') {
						// if symbol or svg, inherit width/height from me
						if (this.attribute('width').hasValue()) tempSvg.attributes['width'] = new svg.Property('width', this.attribute('width').value);
						if (this.attribute('height').hasValue()) tempSvg.attributes['height'] = new svg.Property('height', this.attribute('height').value);
					}
					var oldParent = tempSvg.parent;
					tempSvg.parent = null;
					tempSvg.render(ctx);
					tempSvg.parent = oldParent;
				}
			}
		}
		svg.Element.use.prototype = new svg.Element.RenderedElementBase;
		
		// mask element
		svg.Element.mask = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
						
			this.apply = function(ctx, element) {
				// render as temp svg	
				var x = this.attribute('x').toPixels('x');
				var y = this.attribute('y').toPixels('y');
				var width = this.attribute('width').toPixels('x');
				var height = this.attribute('height').toPixels('y');
				
				if (width == 0 && height == 0) {
					var bb = new svg.BoundingBox();
					for (var i=0; i<this.children.length; i++) {
						bb.addBoundingBox(this.children[i].getBoundingBox());
					}
					var x = Math.floor(bb.x1);
					var y = Math.floor(bb.y1);
					var width = Math.floor(bb.width());
					var	height = Math.floor(bb.height());
				}
				
				// temporarily remove mask to avoid recursion
				var mask = element.attribute('mask').value;
				element.attribute('mask').value = '';
				
					var cMask = document.createElement('canvas');
					cMask.width = x + width;
					cMask.height = y + height;
					var maskCtx = cMask.getContext('2d');
					this.renderChildren(maskCtx);
				
					var c = document.createElement('canvas');
					c.width = x + width;
					c.height = y + height;
					var tempCtx = c.getContext('2d');
					element.render(tempCtx);
					tempCtx.globalCompositeOperation = 'destination-in';
					tempCtx.fillStyle = maskCtx.createPattern(cMask, 'no-repeat');
					tempCtx.fillRect(0, 0, x + width, y + height);
					
					ctx.fillStyle = tempCtx.createPattern(c, 'no-repeat');
					ctx.fillRect(0, 0, x + width, y + height);
					
				// reassign mask
				element.attribute('mask').value = mask;	
			}
			
			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.mask.prototype = new svg.Element.ElementBase;
		
		// clip element
		svg.Element.clipPath = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.apply = function(ctx) {
				var oldBeginPath = CanvasRenderingContext2D.prototype.beginPath;
				CanvasRenderingContext2D.prototype.beginPath = function () { };
				
				var oldClosePath = CanvasRenderingContext2D.prototype.closePath;
				CanvasRenderingContext2D.prototype.closePath = function () { };
			
				oldBeginPath.call(ctx);
				for (var i=0; i<this.children.length; i++) {
					var child = this.children[i];
					if (typeof(child.path) != 'undefined') {
						var transform = null;
						if (child.attribute('transform').hasValue()) { 
							transform = new svg.Transform(child.attribute('transform').value);
							transform.apply(ctx);
						}
						child.path(ctx);
						CanvasRenderingContext2D.prototype.closePath = oldClosePath;
						if (transform) { transform.unapply(ctx); }
					}
				}
				oldClosePath.call(ctx);
				ctx.clip();
				
				CanvasRenderingContext2D.prototype.beginPath = oldBeginPath;
				CanvasRenderingContext2D.prototype.closePath = oldClosePath;
			}
			
			this.render = function(ctx) {
				// NO RENDER
			}
		}
		svg.Element.clipPath.prototype = new svg.Element.ElementBase;

		// filters
		svg.Element.filter = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
						
			this.apply = function(ctx, element) {
				// render as temp svg	
				var bb = element.getBoundingBox();
				var x = Math.floor(bb.x1);
				var y = Math.floor(bb.y1);
				var width = Math.floor(bb.width());
				var	height = Math.floor(bb.height());

				// temporarily remove filter to avoid recursion
				var filter = element.style('filter').value;
				element.style('filter').value = '';
				
				var px = 0, py = 0;
				for (var i=0; i<this.children.length; i++) {
					var efd = this.children[i].extraFilterDistance || 0;
					px = Math.max(px, efd);
					py = Math.max(py, efd);
				}
				
				var c = document.createElement('canvas');
				c.width = width + 2*px;
				c.height = height + 2*py;
				var tempCtx = c.getContext('2d');
				tempCtx.translate(-x + px, -y + py);
				element.render(tempCtx);
			
				// apply filters
				for (var i=0; i<this.children.length; i++) {
					this.children[i].apply(tempCtx, 0, 0, width + 2*px, height + 2*py);
				}
				
				// render on me
				ctx.drawImage(c, 0, 0, width + 2*px, height + 2*py, x - px, y - py, width + 2*px, height + 2*py);
				
				// reassign filter
				element.style('filter', true).value = filter;	
			}
			
			this.render = function(ctx) {
				// NO RENDER
			}		
		}
		svg.Element.filter.prototype = new svg.Element.ElementBase;
		
		svg.Element.feMorphology = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.apply = function(ctx, x, y, width, height) {
				// TODO: implement
			}
		}
		svg.Element.feMorphology.prototype = new svg.Element.ElementBase;
		
		svg.Element.feComposite = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			this.apply = function(ctx, x, y, width, height) {
				// TODO: implement
			}
		}
		svg.Element.feComposite.prototype = new svg.Element.ElementBase;
		
		svg.Element.feColorMatrix = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);
			
			var matrix = svg.ToNumberArray(this.attribute('values').value);
			switch (this.attribute('type').valueOrDefault('matrix')) { // http://www.w3.org/TR/SVG/filters.html#feColorMatrixElement
				case 'saturate':
					var s = matrix[0];
					matrix = [0.213+0.787*s,0.715-0.715*s,0.072-0.072*s,0,0,
							  0.213-0.213*s,0.715+0.285*s,0.072-0.072*s,0,0,
							  0.213-0.213*s,0.715-0.715*s,0.072+0.928*s,0,0,
							  0,0,0,1,0,
							  0,0,0,0,1];
					break;
				case 'hueRotate':
					var a = matrix[0] * Math.PI / 180.0;
					var c = function (m1,m2,m3) { return m1 + Math.cos(a)*m2 + Math.sin(a)*m3; };
					matrix = [c(0.213,0.787,-0.213),c(0.715,-0.715,-0.715),c(0.072,-0.072,0.928),0,0,
							  c(0.213,-0.213,0.143),c(0.715,0.285,0.140),c(0.072,-0.072,-0.283),0,0,
							  c(0.213,-0.213,-0.787),c(0.715,-0.715,0.715),c(0.072,0.928,0.072),0,0,
							  0,0,0,1,0,
							  0,0,0,0,1];
					break;
				case 'luminanceToAlpha':
					matrix = [0,0,0,0,0,
							  0,0,0,0,0,
							  0,0,0,0,0,
							  0.2125,0.7154,0.0721,0,0,
							  0,0,0,0,1];
					break;
			}
			
			function imGet(img, x, y, width, height, rgba) {
				return img[y*width*4 + x*4 + rgba];
			}
			
			function imSet(img, x, y, width, height, rgba, val) {
				img[y*width*4 + x*4 + rgba] = val;
			}
			
			function m(i, v) {
				var mi = matrix[i];
				return mi * (mi < 0 ? v - 255 : v);
			}
						
			this.apply = function(ctx, x, y, width, height) {
				// assuming x==0 && y==0 for now
				var srcData = ctx.getImageData(0, 0, width, height);
				for (var y = 0; y < height; y++) {
					for (var x = 0; x < width; x++) {
						var r = imGet(srcData.data, x, y, width, height, 0);
						var g = imGet(srcData.data, x, y, width, height, 1);
						var b = imGet(srcData.data, x, y, width, height, 2);
						var a = imGet(srcData.data, x, y, width, height, 3);
						imSet(srcData.data, x, y, width, height, 0, m(0,r)+m(1,g)+m(2,b)+m(3,a)+m(4,1));
						imSet(srcData.data, x, y, width, height, 1, m(5,r)+m(6,g)+m(7,b)+m(8,a)+m(9,1));
						imSet(srcData.data, x, y, width, height, 2, m(10,r)+m(11,g)+m(12,b)+m(13,a)+m(14,1));
						imSet(srcData.data, x, y, width, height, 3, m(15,r)+m(16,g)+m(17,b)+m(18,a)+m(19,1));
					}
				}
				ctx.clearRect(0, 0, width, height);
				ctx.putImageData(srcData, 0, 0);
			}
		}
		svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase;
		
		svg.Element.feGaussianBlur = function(node) {
			this.base = svg.Element.ElementBase;
			this.base(node);

			this.blurRadius = Math.floor(this.attribute('stdDeviation').numValue());
			this.extraFilterDistance = this.blurRadius;
			
			this.apply = function(ctx, x, y, width, height) {
				if (typeof(stackBlurCanvasRGBA) == 'undefined') {
					svg.log('ERROR: StackBlur.js must be included for blur to work');
					return;
				}
				
				// StackBlur requires canvas be on document
				ctx.canvas.id = svg.UniqueId();
				ctx.canvas.style.display = 'none';
				document.body.appendChild(ctx.canvas);
				stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);
				document.body.removeChild(ctx.canvas);
			}
		}
		svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase;
		
		// title element, do nothing
		svg.Element.title = function(node) {
		}
		svg.Element.title.prototype = new svg.Element.ElementBase;

		// desc element, do nothing
		svg.Element.desc = function(node) {
		}
		svg.Element.desc.prototype = new svg.Element.ElementBase;		
		
		svg.Element.MISSING = function(node) {
			svg.log('ERROR: Element \'' + node.nodeName + '\' not yet implemented.');
		}
		svg.Element.MISSING.prototype = new svg.Element.ElementBase;
		
		// element factory
		svg.CreateElement = function(node) {	
			var className = node.nodeName.replace(/^[^:]+:/,''); // remove namespace
			className = className.replace(/\-/g,''); // remove dashes
			var e = null;
			if (typeof(svg.Element[className]) != 'undefined') {
				e = new svg.Element[className](node);
			}
			else {
				e = new svg.Element.MISSING(node);
			}

			e.type = node.nodeName;
			return e;
		}
				
		// load from url
		svg.load = function(ctx, url) {
			svg.loadXml(ctx, svg.ajax(url));
		}
		
		// load from xml
		svg.loadXml = function(ctx, xml) {
			svg.loadXmlDoc(ctx, svg.parseXml(xml));
		}
		
		svg.loadXmlDoc = function(ctx, dom) {
			svg.init(ctx);
			
			var mapXY = function(p) {
				var e = ctx.canvas;
				while (e) {
					p.x -= e.offsetLeft;
					p.y -= e.offsetTop;
					e = e.offsetParent;
				}
				if (window.scrollX) p.x += window.scrollX;
				if (window.scrollY) p.y += window.scrollY;
				return p;
			}
			
			// bind mouse
			if (svg.opts['ignoreMouse'] != true) {
				ctx.canvas.onclick = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onclick(p.x, p.y);
				};
				ctx.canvas.onmousemove = function(e) {
					var p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
					svg.Mouse.onmousemove(p.x, p.y);
				};
			}
		
			var e = svg.CreateElement(dom.documentElement);
			e.root = true;
					
			// render loop
			var isFirstRender = true;
			var draw = function() {
				svg.ViewPort.Clear();
				if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);
			
				if (svg.opts['ignoreDimensions'] != true) {
					// set canvas size
					if (e.style('width').hasValue()) {
						ctx.canvas.width = e.style('width').toPixels('x');
						ctx.canvas.style.width = ctx.canvas.width + 'px';
					}
					if (e.style('height').hasValue()) {
						ctx.canvas.height = e.style('height').toPixels('y');
						ctx.canvas.style.height = ctx.canvas.height + 'px';
					}
				}
				var cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
				var cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
				if (svg.opts['ignoreDimensions'] == true && e.style('width').hasValue() && e.style('height').hasValue()) {
					cWidth = e.style('width').toPixels('x');
					cHeight = e.style('height').toPixels('y');
				}
				svg.ViewPort.SetCurrent(cWidth, cHeight);		
				
				if (svg.opts['offsetX'] != null) e.attribute('x', true).value = svg.opts['offsetX'];
				if (svg.opts['offsetY'] != null) e.attribute('y', true).value = svg.opts['offsetY'];
				if (svg.opts['scaleWidth'] != null || svg.opts['scaleHeight'] != null) {
					var xRatio = null, yRatio = null, viewBox = svg.ToNumberArray(e.attribute('viewBox').value);
					
					if (svg.opts['scaleWidth'] != null) {
						if (e.attribute('width').hasValue()) xRatio = e.attribute('width').toPixels('x') / svg.opts['scaleWidth'];
						else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts['scaleWidth'];
					}
					
					if (svg.opts['scaleHeight'] != null) {
						if (e.attribute('height').hasValue()) yRatio = e.attribute('height').toPixels('y') / svg.opts['scaleHeight'];
						else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts['scaleHeight'];
					}

					if (xRatio == null) { xRatio = yRatio; }
					if (yRatio == null) { yRatio = xRatio; }
					
					e.attribute('width', true).value = svg.opts['scaleWidth'];
					e.attribute('height', true).value = svg.opts['scaleHeight'];
					e.attribute('transform', true).value += ' scale('+(1.0/xRatio)+','+(1.0/yRatio)+')';
				}
			
				// clear and render
				if (svg.opts['ignoreClear'] != true) {
					ctx.clearRect(0, 0, cWidth, cHeight);
				}
				e.render(ctx);
				if (isFirstRender) {
					isFirstRender = false;
					if (typeof(svg.opts['renderCallback']) == 'function') svg.opts['renderCallback'](dom);
				}			
			}
			
			var waitingForImages = true;
			if (svg.ImagesLoaded()) {
				waitingForImages = false;
				draw();
			}
			svg.intervalID = setInterval(function() { 
				var needUpdate = false;
				
				if (waitingForImages && svg.ImagesLoaded()) {
					waitingForImages = false;
					needUpdate = true;
				}
			
				// need update from mouse events?
				if (svg.opts['ignoreMouse'] != true) {
					needUpdate = needUpdate | svg.Mouse.hasEvents();
				}
			
				// need update from animations?
				if (svg.opts['ignoreAnimation'] != true) {
					for (var i=0; i<svg.Animations.length; i++) {
						needUpdate = needUpdate | svg.Animations[i].update(1000 / svg.FRAMERATE);
					}
				}
				
				// need update from redraw?
				if (typeof(svg.opts['forceRedraw']) == 'function') {
					if (svg.opts['forceRedraw']() == true) needUpdate = true;
				}
				
				// render if needed
				if (needUpdate) {
					draw();				
					svg.Mouse.runEvents(); // run and clear our events
				}
			}, 1000 / svg.FRAMERATE);
		}
		
		svg.stop = function() {
			if (svg.intervalID) {
				clearInterval(svg.intervalID);
			}
		}
		
		svg.Mouse = new (function() {
			this.events = [];
			this.hasEvents = function() { return this.events.length != 0; }
		
			this.onclick = function(x, y) {
				this.events.push({ type: 'onclick', x: x, y: y, 
					run: function(e) { if (e.onclick) e.onclick(); }
				});
			}
			
			this.onmousemove = function(x, y) {
				this.events.push({ type: 'onmousemove', x: x, y: y,
					run: function(e) { if (e.onmousemove) e.onmousemove(); }
				});
			}			
			
			this.eventElements = [];
			
			this.checkPath = function(element, ctx) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i] = element;
				}
			}
			
			this.checkBoundingBox = function(element, bb) {
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					if (bb.isPointInBox(e.x, e.y)) this.eventElements[i] = element;
				}			
			}
			
			this.runEvents = function() {
				svg.ctx.canvas.style.cursor = '';
				
				for (var i=0; i<this.events.length; i++) {
					var e = this.events[i];
					var element = this.eventElements[i];
					while (element) {
						e.run(element);
						element = element.parent;
					}
				}		
			
				// done running, clear
				this.events = []; 
				this.eventElements = [];
			}
		});
		
		return svg;
	}
})();

if (typeof(CanvasRenderingContext2D) != 'undefined') {
	CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
		canvg(this.canvas, s, { 
			ignoreMouse: true, 
			ignoreAnimation: true, 
			ignoreDimensions: true, 
			ignoreClear: true, 
			offsetX: dx, 
			offsetY: dy, 
			scaleWidth: dw, 
			scaleHeight: dh
		});
	}
}

},{}],8:[function(require,module,exports){
var INFINITE_LOOP_TRAP = '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

var LOOP_HIGHLIGHT = 'loopHighlight();\n';
var LOOP_HIGHLIGHT_RE =
    new RegExp(LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)'), 'g');

/**
 * Returns javascript code to call a timeout check
 */
exports.loopTrap = function() {
  return INFINITE_LOOP_TRAP;
};

exports.loopHighlight = function (apiName, blockId) {
  var args = "'block_id_" + blockId + "'";
  if (blockId === undefined) {
    args = "%1";
  }
  return apiName + '.' + LOOP_HIGHLIGHT.replace('()', '(' + args + ')');
};

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
exports.strip = function(code) {
  return (code
    // Strip out serial numbers.
    .replace(/(,\s*)?'block_id_\d+'\)/g, ')')
    // Remove timeouts.
    .replace(INFINITE_LOOP_TRAP, '')
    // Strip out loop highlight
    .replace(LOOP_HIGHLIGHT_RE, '')
    // Strip out class namespaces.
    .replace(/(BlocklyApps|Maze|Turtle)\./g, '')
    // Strip out particular helper functions.
    .replace(/^function (colour_random)[\s\S]*?^}/gm, '')
    // Collapse consecutive blank lines.
    .replace(/\n\n+/gm, '\n\n')
    // Trim.
    .replace(/^\s+|\s+$/g, '')
  );
};

/**
 * Extract the user's code as raw JavaScript.
 */
exports.workspaceCode = function(blockly) {
  var code = blockly.Generator.blockSpaceToCode('JavaScript');
  return exports.strip(code);
};

exports.marshalNativeToInterpreter = function (interpreter, nativeVar, nativeParentObj, maxDepth) {
  var retVal;
  if (typeof maxDepth === "undefined") {
    maxDepth = Infinity; // default to inifinite levels of depth
  }
  if (maxDepth === 0) {
    return interpreter.createPrimitive(undefined);
  }
  if (nativeVar instanceof Array) {
    retVal = interpreter.createObject(interpreter.ARRAY);
    for (var i = 0; i < nativeVar.length; i++) {
      retVal.properties[i] = exports.marshalNativeToInterpreter(interpreter,
                                                                nativeVar[i],
                                                                null,
                                                                maxDepth - 1);
    }
    retVal.length = nativeVar.length;
  } else if (nativeVar instanceof Function) {
    wrapper = exports.makeNativeMemberFunction(interpreter, nativeVar, nativeParentObj);
    retVal = interpreter.createNativeFunction(wrapper);
  } else if (nativeVar instanceof Object) {
    // note Object must be checked after Function and Array (since they are also Objects)
    if (interpreter.isa(nativeVar, interpreter.FUNCTION)) {
      // Special case to see if we are trying to marshal an interpreter object
      // (this currently happens when we store interpreter function objects in native
      //  and return them back in nativeGetCallback)

      // NOTE: this check could be expanded to check for other interpreter object types
      // if we have reason to believe that we may be passing those back

      retVal = nativeVar;
    } else {
      retVal = interpreter.createObject(interpreter.OBJECT);
      for (var prop in nativeVar) {
        var value;
        try {
          value = nativeVar[prop];
        } catch (e) { }
        interpreter.setProperty(retVal,
                                prop,
                                exports.marshalNativeToInterpreter(interpreter,
                                                                   value,
                                                                   nativeVar,
                                                                   maxDepth - 1));
      }
    }
  } else {
    retVal = interpreter.createPrimitive(nativeVar);
  }
  return retVal;
};

exports.marshalInterpreterToNative = function (interpreterVar) {
  if (interpreterVar.isPrimitive) {
    return interpreterVar.data;
  } else if (Webapp.interpreter.isa(interpreterVar, Webapp.interpreter.ARRAY)) {
    var nativeArray = [];
    nativeArray.length = interpreterVar.length;
    for (var i = 0; i < nativeArray.length; i++) {
      nativeArray[i] = exports.marshalInterpreterToNative(interpreterVar.properties[i]);
    }
    return nativeArray;
  } else if (Webapp.interpreter.isa(interpreterVar, Webapp.interpreter.OBJECT)) {
    var nativeObject = {};
    for (var prop in interpreterVar.properties) {
      nativeObject[prop] = exports.marshalInterpreterToNative(interpreterVar.properties[prop]);
    }
    return nativeObject;
  } else {
    // Just return the interpreter object if we can't convert it. This is needed
    // for passing interpreter callback functions into native.
    return interpreterVar;
  }
};

/**
 * Generate a native function wrapper for use with the JS interpreter.
 */
exports.makeNativeMemberFunction = function (interpreter, nativeFunc, nativeParentObj, maxDepth) {
  return function() {
    // Call the native function:
    var nativeArgs = [];
    for (var i = 0; i < arguments.length; i++) {
      nativeArgs[i] = exports.marshalInterpreterToNative(arguments[i]);
    }
    var nativeRetVal = nativeFunc.apply(nativeParentObj, nativeArgs);
    return exports.marshalNativeToInterpreter(interpreter, nativeRetVal, null, maxDepth);
  };
};

/**
 * Initialize a JS interpreter.
 */
exports.initJSInterpreter = function (interpreter, scope, options) {
  for (var optsObj in options) {
    var func, wrapper;
    // The options object contains objects that will be referenced
    // by the code we plan to execute. Since these objects exist in the native
    // world, we need to create associated objects in the interpreter's world
    // so the interpreted code can call out to these native objects

    // Create global objects in the interpreter for everything in options
    var obj = interpreter.createObject(interpreter.OBJECT);
    interpreter.setProperty(scope, optsObj.toString(), obj);
    for (var prop in options[optsObj]) {
      func = options[optsObj][prop];
      if (func instanceof Function) {
        // Populate each of the global objects with native functions
        // NOTE: other properties are not currently passed to the interpreter
        wrapper = exports.makeNativeMemberFunction(interpreter, func, options[optsObj]);
        interpreter.setProperty(obj,
                                prop,
                                interpreter.createNativeFunction(wrapper));
      }
    }
  }
};

/**
 * Check to see if it is safe to step the interpreter while we are unwinding.
 * (Called repeatedly after completing a step where the node was marked 'done')
 */
exports.isNextStepSafeWhileUnwinding = function (interpreter) {
  var state = interpreter.stateStack[0];
  if (state.done) {
    return true;
  }
  switch (state.node.type) {
    case "VariableDeclaration":
    case "BlockStatement":
    case "ForStatement": // check for state.mode ?
    case "UpdateExpression":
    case "BinaryExpression":
    case "CallExpression":
    case "Identifier":
    case "Literal":
    case "Program":
      return true;
  }
  return false;
};

// session is an instance of Ace editSession
// Usage
// var lengthArray = aceCalculateCumulativeLength(editor.getSession());
// Need to call this only if the document is updated after the last call.
exports.aceCalculateCumulativeLength = function (session) {
  var cumulativeLength = [];
  var cnt = session.getLength();
  var cuml = 0, nlLength = session.getDocument().getNewLineCharacter().length;
  cumulativeLength.push(cuml);
  var text = session.getLines(0, cnt);
  for (var i = 0; i < cnt; i++) {
    cuml += text[i].length + nlLength;
    cumulativeLength.push(cuml);
  }
  return cumulativeLength;
};

// Fast binary search implementation
// Pass the cumulative length array here.
// Usage
// var row = aceFindRow(lengthArray, 0, lengthArray.length, 2512);
// tries to find 2512th character lies in which row.
function aceFindRow(cumulativeLength, rows, rowe, pos) {
  if (rows > rowe) {
    return null;
  }
  if (rows + 1 === rowe) {
    return rows;
  }

  var mid = Math.floor((rows + rowe) / 2);
  
  if (pos < cumulativeLength[mid]) {
    return aceFindRow(cumulativeLength, rows, mid, pos);
  } else if(pos > cumulativeLength[mid]) {
    return aceFindRow(cumulativeLength, mid, rowe, pos);
  }
  return mid;
}

exports.isAceBreakpointRow = function (session, userCodeRow) {
  var bps = session.getBreakpoints();
  return Boolean(bps[userCodeRow]);
};

function createSelection (selection, cumulativeLength, start, end) {
  var range = selection.getRange();

  range.start.row = aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
  range.start.col = start - cumulativeLength[range.start.row];
  range.end.row = aceFindRow(cumulativeLength, 0, cumulativeLength.length, end);
  range.end.col = end - cumulativeLength[range.end.row];

  selection.setSelectionRange(range);
}

/**
 * Selects code in droplet/ace editor.
 *
 * Returns the row (line) of code highlighted. If nothing is highlighted
 * because it is outside of the userCode area, the return value is -1
 */
exports.selectCurrentCode = function (interpreter, editor, cumulativeLength,
                                      userCodeStartOffset, userCodeLength) {
  var userCodeRow = -1;
  if (interpreter.stateStack[0]) {
    var node = interpreter.stateStack[0].node;
    // Adjust start/end by Webapp.userCodeStartOffset since the code running
    // has been expanded vs. what the user sees in the editor window:
    var start = node.start - userCodeStartOffset;
    var end = node.end - userCodeStartOffset;

    // Only show selection if the node being executed is inside the user's
    // code (not inside code we inserted before or after their code that is
    // not visible in the editor):
    if (start >= 0 && start < userCodeLength) {
      userCodeRow = aceFindRow(cumulativeLength, 0, cumulativeLength.length, start);
      // Highlight the code being executed in each step:
      if (editor.currentlyUsingBlocks) {
        var style = {color: '#FFFF22'};
        editor.clearLineMarks();
        // NOTE: replace markLine with this new mark() call once we have a new
        // version of droplet
        
        // editor.mark(userCodeRow, start - cumulativeLength[userCodeRow], style);
        editor.markLine(userCodeRow, style);
      } else {
        var selection = editor.aceEditor.getSelection();
        createSelection(selection, cumulativeLength, start, end);
      }
    }
  } else {
    if (editor.currentlyUsingBlocks) {
      editor.clearLineMarks();
    } else {
      editor.aceEditor.getSelection().clearSelection();
    }
  }
  return userCodeRow;
};

/**
 * Evaluates a string of code parameterized with a dictionary.
 */
exports.evalWith = function(code, options) {
  if (options.BlocklyApps && options.BlocklyApps.editCode) {
    // Use JS interpreter on editCode levels
    var initFunc = function(interpreter, scope) {
      exports.initJSInterpreter(interpreter, scope, options);
    };
    var myInterpreter = new Interpreter(code, initFunc);
    // interpret the JS program all at once:
    myInterpreter.run();
  } else {
    // execute JS code "natively"
    var params = [];
    var args = [];
    for (var k in options) {
      params.push(k);
      args.push(options[k]);
    }
    params.push(code);
    var ctor = function() {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor().apply(null, args);
  }
};

/**
 * Returns a function based on a string of code parameterized with a dictionary.
 */
exports.functionFromCode = function(code, options) {
  if (options.BlocklyApps && options.BlocklyApps.editCode) {
    // Since this returns a new native function, it doesn't make sense in the
    // editCode case (we assume that the app will be using JSInterpreter)
    throw "Unexpected";
  } else {
    var params = [];
    var args = [];
    for (var k in options) {
      params.push(k);
      args.push(options[k]);
    }
    params.push(code);
    var ctor = function() {
      return Function.apply(this, params);
    };
    ctor.prototype = Function.prototype;
    return new ctor();
  }
};

},{}],9:[function(require,module,exports){
/**
 * @fileoverview Constants used in production code and tests.
 */

/**
 * Enumeration of user program execution outcomes.
 * These are determined by each app.
 */
exports.ResultType = {
  UNSET: 0,       // The result has not yet been computed.
  SUCCESS: 1,     // The program completed successfully, achieving the goal.
  FAILURE: -1,    // The program ran without error but did not achieve goal.
  TIMEOUT: 2,     // The program did not complete (likely infinite loop).
  ERROR: -2       // The program generated an error.
};

/**
 * Enumeration of test results.
 * EMPTY_BLOCK_FAIL and EMPTY_FUNCTION_BLOCK_FAIL can only occur if
 * BlocklyApps.CHECK_FOR_EMPTY_BLOCKS is true.
 */
exports.TestResults = {
  // Default value before any tests are run.
  NO_TESTS_RUN: -1,

  // The level was not solved.
  EMPTY_BLOCK_FAIL: 1,           // An "if" or "repeat" block was empty.
  TOO_FEW_BLOCKS_FAIL: 2,        // Fewer than the ideal number of blocks used.
  LEVEL_INCOMPLETE_FAIL: 3,      // Default failure to complete a level.
  MISSING_BLOCK_UNFINISHED: 4,   // A required block was not used.
  EXTRA_TOP_BLOCKS_FAIL: 5,      // There was more than one top-level block.
  MISSING_BLOCK_FINISHED: 10,    // The level was solved without required block.
  APP_SPECIFIC_FAIL: 11,         // Application-specific failure.
  EMPTY_FUNCTION_BLOCK_FAIL: 12, // A "function" block was empty
  UNUSED_PARAM: 13,              // Param declared but not used in function.
  UNUSED_FUNCTION: 14,           // Function declared but not used in workspace.
  PARAM_INPUT_UNATTACHED: 15,    // Function not called with enough params.
  INCOMPLETE_BLOCK_IN_FUNCTION: 16, // Incomplete block inside a function.
  QUESTION_MARKS_IN_NUMBER_FIELD: 17, // Block has ??? instead of a value.

  // The level was solved in a non-optimal way.  User may advance or retry.
  TOO_MANY_BLOCKS_FAIL: 20,   // More than the ideal number of blocks were used.
  APP_SPECIFIC_ACCEPTABLE_FAIL: 21,  // Application-specific acceptable failure.

  // Other.
  FREE_PLAY: 30,              // The user is in free-play mode.
  EDIT_BLOCKS: 70,            // The user is creating/editing a new level.

  // The level was solved in the ideal manner.
  ALL_PASS: 100
};

exports.BeeTerminationValue = {
  FAILURE: false,
  SUCCESS: true,
  INFINITE_LOOP: Infinity,
  NOT_AT_FLOWER: 1,     // Tried to get nectar when not at flower.
  FLOWER_EMPTY: 2,      // Tried to get nectar when flower empty.
  NOT_AT_HONEYCOMB: 3,  // Tried to make honey when not at honeycomb.
  HONEYCOMB_FULL: 4,    // Tried to make honey, but no room at honeycomb.
  UNCHECKED_CLOUD: 5,    // Finished puzzle, but didn't check every clouded item
  UNCHECKED_PURPLE: 6,   // Finished puzzle, but didn't check every purple flower
  INSUFFICIENT_NECTAR: 7,// Didn't collect all nectar by finish
  INSUFFICIENT_HONEY: 8  // Didn't make all honey by finish
};

},{}],10:[function(require,module,exports){
exports.addReadyListener = function(callback) {
  if (document.readyState === "complete") {
    setTimeout(callback, 1);
  } else {
    window.addEventListener('load', callback, false);
  }
};

exports.getText = function(node) {
  return node.innerText || node.textContent;
};

exports.setText = function(node, string) {
  if (node.innerText) {
    node.innerText = string;
  } else {
    node.textContent = string;
  }
};


var addEvent = function(element, eventName, handler) {
  element.addEventListener(eventName, handler, false);

  var isIE11Touch = window.navigator.pointerEnabled;
  var isIE10Touch = window.navigator.msPointerEnabled;
  var isStandardTouch = 'ontouchend' in document.documentElement;

  var key;
  if (isIE11Touch) {
    key = "ie11";
  } else if (isIE10Touch) {
    key = "ie10";
  } else if (isStandardTouch) {
    key = "standard";
  }
  if (key) {
    var touchEvent = TOUCH_MAP[eventName][key];
    element.addEventListener(touchEvent, function(e) {
      e.preventDefault();  // Stop mouse events.
      handler(e);
    }, false);
  }
};

exports.addMouseDownTouchEvent = function(element, handler) {
  addEvent(element, 'mousedown', handler);
};

exports.addMouseUpTouchEvent = function(element, handler) {
  addEvent(element, 'mouseup', handler);
};

exports.addMouseMoveTouchEvent = function(element, handler) {
  addEvent(element, 'mousemove', handler);
};

exports.addClickTouchEvent = function(element, handler) {
  addEvent(element, 'click', handler);
};

// A map from standard touch events to various aliases.
var TOUCH_MAP = {
  //  Incomplete list, add as needed.
  click: {
    standard: 'touchend',
    ie10: 'MSPointerUp',
    ie11: 'pointerup'
  },
  mousedown: {
    standard: 'touchstart',
    ie10: 'MSPointerDown',
    ie11: 'pointerdown'
  },
  mouseup: {
    standard: 'touchend',
    ie10: 'MSPointerUp',
    ie11: 'pointerup'
  },
  mousemove: {
    standard: 'touchmove',
    ie10: 'MSPointerMove',
    ie11: 'pointermove'
  }
};

exports.isMobile = function() {
  var reg = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/;
  return reg.test(window.navigator.userAgent);
};

exports.isWindowsTouch = function() {
  var reg = /MSIE.*Touch/;
  return reg.test(window.navigator.userAgent);
};

exports.isAndroid = function() {
  var reg = /Android/;
  return reg.test(window.navigator.userAgent);
};

exports.isIOS = function() {
  var reg = /iP(hone|od|ad)/;
  return reg.test(window.navigator.userAgent);
};

},{}],11:[function(require,module,exports){
var evalUtils = require('./evalUtils');
var EvalImage = require('./evalImage');
var EvalText = require('./evalText');
var EvalCircle = require('./evalCircle');
var EvalTriangle = require('./evalTriangle');
var EvalMulti = require('./evalMulti');
var EvalRect = require('./evalRect');
var EvalEllipse = require('./evalEllipse');
var EvalText = require('./evalText');
var EvalStar = require('./evalStar');
var EvalPolygon = require('./evalPolygon');

// We don't use blockId at all in Eval since everything is evaluated at once.

exports.display = function (object) {
  if (object === undefined) {
    object = "";
  }
  if (!object.draw) {
    object = new EvalText(object.toString(), 12, 'black');
  }
  Eval.displayedObject = object;
};

exports.circle = function (size, style, color) {
  return new EvalCircle(size, style, color);
};

exports.triangle = function (size, style, color) {
  return new EvalTriangle(size, style, color);
};

exports.overlay = function (top, bottom) {
  return new EvalMulti(top, bottom);
};

exports.underlay = function (bottom, top) {
  return new EvalMulti(top, bottom);
};

exports.square = function (size, style, color) {
  return new EvalRect(size, size, style, color);
};

exports.rectangle = function (width, height, style, color) {
  return new EvalRect(width, height, style, color);
};

exports.ellipse = function (width, height, style, color) {
  return new EvalEllipse(width, height, style, color);
};

exports.text = function (text, fontSize, color) {
  return new EvalText(text, fontSize, color);
};

exports.star = function (radius, style, color) {
  var innerRadius = (3 - Math.sqrt(5)) / 2 * radius;
  return new EvalStar(5, innerRadius, radius, style, color);
};

exports.radialStar = function (points, inner, outer, style, color) {
  return new EvalStar(points, inner, outer, style, color);
};

exports.polygon = function (points, length, style, color) {
  return new EvalPolygon(points, length, style, color);
};

exports.placeImage = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);

  // User inputs why in cartesian space. Convert to pixel space before sending
  // to our EvalImage.
  y = evalUtils.cartesianToPixel(y);

  image.place(x, y);
  return image;
};

exports.offset = function (x, y, image) {
  evalUtils.ensureNumber(x);
  evalUtils.ensureNumber(y);
  evalUtils.ensureType(image, EvalImage);
    
  x = image.x_ + x;
  y = image.y_ - y;
    
  image.place(x, y);
  return image;
};

exports.rotateImage = function (degrees, image) {
  evalUtils.ensureNumber(degrees);

  image.rotate(degrees);
  return image;
};

exports.scaleImage = function (factor, image) {
  image.scale(factor, factor);
  return image;
};

exports.stringAppend = function (first, second) {
  evalUtils.ensureString(first);
  evalUtils.ensureString(second);

  return first + second;
};

// polling for values
exports.stringLength = function (str) {
  evalUtils.ensureString(str);

  return str.length;
};

},{"./evalCircle":15,"./evalEllipse":16,"./evalImage":17,"./evalMulti":18,"./evalPolygon":19,"./evalRect":20,"./evalStar":21,"./evalText":22,"./evalTriangle":23,"./evalUtils":24}],12:[function(require,module,exports){
/**
 * Blockly Demo: Eval Graphics
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

/**
 * @fileoverview Demonstration of Blockly: Eval Graphics.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var msg = require('../../locale/zh_tw/eval');
var commonMsg = require('../../locale/zh_tw/common');

var evalUtils = require('./evalUtils');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
var functionalBlockUtils = require('../functionalBlockUtils');
var colors = functionalBlockUtils.colors;
var initTitledFunctionalBlock = functionalBlockUtils.initTitledFunctionalBlock;

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_display',
    blockTitle: msg.displayBlockTitle(),
    apiName: 'display',
    returnType: 'none',
    args: [
      { name: 'ARG1', type: 'none' },
    ]
  });

  // shapes
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_circle',
    blockTitle: msg.circleBlockTitle(),
    apiName: 'circle',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_triangle',
    blockTitle: msg.triangleBlockTitle(),
    apiName: 'triangle',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_square',
    blockTitle: msg.squareBlockTitle(),
    apiName: 'square',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_rectangle',
    blockTitle: msg.rectangleBlockTitle(),
    apiName: 'rectangle',
    args: [
      { name: 'WIDTH', type: 'Number' },
      { name: 'HEIGHT', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_ellipse',
    blockTitle: msg.ellipseBlockTitle(),
    apiName: 'ellipse',
    args: [
      { name: 'WIDTH', type: 'Number' },
      { name: 'HEIGHT', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_star',
    blockTitle: msg.starBlockTitle(),
    apiName: 'star',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_radial_star',
    blockTitle: msg.radialStarBlockTitle(),
    apiName: 'radialStar',
    args: [
      { name: 'POINTS', type: 'Number' },
      { name: 'INNER', type: 'Number' },
      { name: 'OUTER', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_polygon',
    blockTitle: msg.polygonBlockTitle(),
    apiName: 'polygon',
    args: [
      { name: 'SIDES', type: 'Number' },
      { name: 'LENGTH', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_text',
    blockTitle: msg.textBlockTitle(),
    apiName: 'text',
    args: [
      { name: 'TEXT', type: 'string' },
      { name: 'SIZE', type: 'Number' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  // image manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'overlay',
    blockTitle: msg.overlayBlockTitle(),
    apiName: 'overlay',
    args: [
      { name: 'TOP', type: 'image' },
      { name: 'BOTTOM', type: 'image' },
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'underlay',
    blockTitle: msg.underlayBlockTitle(),
    apiName: 'underlay',
    args: [
      { name: 'BOTTOM', type: 'image' },
      { name: 'TOP', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'place_image',
    blockTitle: msg.placeImageBlockTitle(),
    apiName: 'placeImage',
    args: [
      { name: 'X', type: 'Number' },
      { name: 'Y', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'offset',
    blockTitle: msg.offsetBlockTitle(),
    apiName: 'offset',
    args: [
      { name: 'X', type: 'Number' },
      { name: 'Y', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'rotate',
    blockTitle: msg.rotateImageBlockTitle(),
    apiName: 'rotateImage',
    args: [
      { name: 'DEGREES', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'scale',
    blockTitle: msg.scaleImageBlockTitle(),
    apiName: 'scaleImage',
    args: [
      { name: 'FACTOR', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  // string manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_append',
    blockTitle: msg.stringAppendBlockTitle(),
    apiName: 'stringAppend',
    returnType: 'string',
    args: [
      { name: 'FIRST', type: 'string' },
      { name: 'SECOND', type: 'string' }
    ]
  });

  // polling for values
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_length',
    blockTitle: msg.stringLengthBlockTitle(),
    apiName: 'stringLength',
    returnType: 'Number',
    args: [
      { name: 'STR', type: 'string' }
    ]
  });

  functionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_style',
    values: [
      [msg.solid(), 'solid'],
      ['75%', '75%'],
      ['50%', '50%'],
      ['25%', '25%'],
      [msg.outline(), 'outline']
    ]
  });
};


function installFunctionalBlock (blockly, generator, gensym, options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;
  var returnType = options.returnType || 'image';

  blockly.Blocks[blockName] = {
    init: function () {
      initTitledFunctionalBlock(this, blockTitle, returnType, args);
    }
  };

  generator[blockName] = function() {
    var apiArgs = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var apiArg = Blockly.JavaScript.statementToCode(this, arg.name, false);
      // Provide defaults
      if (!apiArg) {
        if (arg.type === 'Number') {
          apiArg = '0';
        } else if (arg.name === 'STYLE') {
          apiArg = blockly.JavaScript.quote_('solid');
        } else if (arg.name === 'COLOR') {
          apiArg = blockly.JavaScript.quote_('black');
        }
      }
      apiArgs.push(apiArg);
    }

    return "Eval." + apiName + "(" + apiArgs.join(", ") + ")";
  };
}

},{"../../locale/zh_tw/common":50,"../../locale/zh_tw/eval":51,"../functionalBlockUtils":29,"../sharedFunctionalBlocks":33,"./evalUtils":24}],13:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../../locale/zh_tw/eval');
  var commonMsg = require('../../locale/zh_tw/common');
; buf.push('\n\n<button id="continueButton" class="launch hide float-right">\n  <img src="', escape((7,  assetUrl('media/1x1.gif') )), '">', escape((7,  commonMsg.continue() )), '\n</button>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"../../locale/zh_tw/eval":51,"ejs":52}],14:[function(require,module,exports){
(function (global){
/**
 * Blockly Demo: Eval Graphics
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

'use strict';

var Eval = module.exports;

/**
 * Create a namespace for the application.
 */
var BlocklyApps = require('../base');
var Eval = module.exports;
var commonMsg = require('../../locale/zh_tw/common');
var evalMsg = require('../../locale/zh_tw/eval');
var skins = require('../skins');
var levels = require('./levels');
var codegen = require('../codegen');
var api = require('./api');
var page = require('../templates/page.html');
var feedback = require('../feedback.js');
var dom = require('../dom');
var blockUtils = require('../block_utils');

// requiring this loads canvg into the global namespace
require('../canvg/canvg.js');
var canvg = window.canvg || global.canvg;

var TestResults = require('../constants').TestResults;

var level;
var skin;

BlocklyApps.CHECK_FOR_EMPTY_BLOCKS = false;
BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG = 1;

var CANVAS_HEIGHT = 400;
var CANVAS_WIDTH = 400;

// This property is set in the api call to draw, and extracted in
// getDrawableFromBlocks
Eval.displayedObject = null;

/**
 * Initialize Blockly and the Eval.  Called on page load.
 */
Eval.init = function(config) {

  skin = config.skin;
  level = config.level;

  config.grayOutUndeletableBlocks = true;
  config.forceInsertTopBlock = 'functional_display';
  config.enableShowCode = false;

  config.html = page({
    assetUrl: BlocklyApps.assetUrl,
    data: {
      localeDirection: BlocklyApps.localeDirection(),
      visualization: require('./visualization.html')(),
      controls: require('./controls.html')({
        assetUrl: BlocklyApps.assetUrl
      }),
      blockUsed : undefined,
      idealBlockNumber : undefined,
      editCode: level.editCode,
      blockCounterClass : 'block-counter-default'
    }
  });

  config.loadAudio = function() {
    BlocklyApps.loadAudio(skin.winSound, 'win');
    BlocklyApps.loadAudio(skin.startSound, 'start');
    BlocklyApps.loadAudio(skin.failureSound, 'failure');
  };

  config.afterInject = function() {
    var svg = document.getElementById('svgEval');
    if (!svg) {
      throw "something bad happened";
    }
    svg.setAttribute('width', CANVAS_WIDTH);
    svg.setAttribute('height', CANVAS_HEIGHT);

    // This is hack that I haven't been able to fully understand. Furthermore,
    // it seems to break the functional blocks in some browsers. As such, I'm
    // just going to disable the hack for this app.
    Blockly.BROKEN_CONTROL_POINTS = false;

    // Add to reserved word list: API, local variables in execution environment
    // (execute) and the infinite loop detection function.
    Blockly.JavaScript.addReservedWords('Eval,code');

    if (level.solutionBlocks) {
      var solutionBlocks = blockUtils.forceInsertTopBlock(level.solutionBlocks,
        config.forceInsertTopBlock);

      var answerObject = getDrawableFromBlocks(solutionBlocks);
      if (answerObject) {
        answerObject.draw(document.getElementById('answer'));
      }
    }

    // Adjust visualizationColumn width.
    var visualizationColumn = document.getElementById('visualizationColumn');
    visualizationColumn.style.width = '400px';

    // base's BlocklyApps.resetButtonClick will be called first
    var resetButton = document.getElementById('resetButton');
    dom.addClickTouchEvent(resetButton, Eval.resetButtonClick);
  };

  BlocklyApps.init(config);
};

/**
 * Click the run button.  Start the program.
 */
BlocklyApps.runButtonClick = function() {
  BlocklyApps.toggleRunReset('reset');
  Blockly.mainBlockSpace.traceOn(true);
  BlocklyApps.attempts++;
  Eval.execute();
};

/**
 * App specific reset button click logic.  BlocklyApps.resetButtonClick will be
 * called first.
 */
Eval.resetButtonClick = function () {
  var user = document.getElementById('user');
  while (user.firstChild) {
    user.removeChild(user.firstChild);
  }

};


function evalCode (code) {
  try {
    codegen.evalWith(code, {
      BlocklyApps: BlocklyApps,
      Eval: api
    });
  } catch (e) {
    // Infinity is thrown if we detect an infinite loop. In that case we'll
    // stop further execution, animate what occured before the infinite loop,
    // and analyze success/failure based on what was drawn.
    // Otherwise, abnormal termination is a user error.
    if (e !== Infinity) {
      // call window.onerror so that we get new relic collection.  prepend with
      // UserCode so that it's clear this is in eval'ed code.
      if (window.onerror) {
        window.onerror("UserCode:" + e.message, document.URL, 0);
      }
      if (console && console.log) {
        console.log(e);
      }
    }
  }
}

/**
 * Generates a drawable evalImage from the blocks in the workspace. If blockXml
 * is provided, temporarily sticks those blocks into the workspace to generate
 * the evalImage, then deletes blocks.
 */
function getDrawableFromBlocks(blockXml) {
  if (blockXml) {
    if (Blockly.mainBlockSpace.getTopBlocks().length !== 0) {
      throw new Error("getDrawableFromBlocks shouldn't be called with blocks if " +
        "we already have blocks in the workspace");
    }
    // Temporarily put the blocks into the workspace so that we can generate code
    BlocklyApps.loadBlocks(blockXml);
  }

  var code = Blockly.Generator.blockSpaceToCode('JavaScript', ['functional_display', 'functional_definition']);
  evalCode(code);
  var object = Eval.displayedObject;
  Eval.displayedObject = null;

  if (blockXml) {
    // Remove the blocks
    Blockly.mainBlockSpace.getTopBlocks().forEach(function (b) { b.dispose(); });
  }

  return object;
}

/**
 * Execute the user's code.  Heaven help us...
 */
Eval.execute = function() {
  Eval.result = BlocklyApps.ResultType.UNSET;
  Eval.testResults = BlocklyApps.TestResults.NO_TESTS_RUN;
  Eval.message = undefined;

  var userObject = getDrawableFromBlocks(null);
  if (userObject) {
    userObject.draw(document.getElementById("user"));
  }

  Eval.result = evaluateAnswer();
  Eval.testResults = BlocklyApps.getTestResults(Eval.result);

  if (level.freePlay) {
    Eval.testResults = BlocklyApps.TestResults.FREE_PLAY;
  }

  var xml = Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace);
  var textBlocks = Blockly.Xml.domToText(xml);

  var reportData = {
    app: 'eval',
    level: level.id,
    builder: level.builder,
    result: Eval.result,
    testResult: Eval.testResults,
    program: encodeURIComponent(textBlocks),
    onComplete: onReportComplete
  };

  BlocklyApps.report(reportData);
};

/**
 * Calling outerHTML on svg elements in safari does not work. Instead we stick
 * it inside a div and get that div's inner html.
 */
function outerHTML (element) {
  var div = document.createElement('div');
  div.appendChild(element.cloneNode(true));
  return div.innerHTML;
}

function imageDataForSvg(elementId) {
  var canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvg(canvas, outerHTML(document.getElementById(elementId)));

  // canvg attaches an svg object to the canvas, and attaches a setInterval.
  // We don't need this, and that blocks our node process from exitting in
  // tests, so stop it.
  canvas.svg.stop();

  var ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function evaluateAnswer() {
  // Compare the solution and user canvas
  var userImageData = imageDataForSvg('user');
  var solutionImageData = imageDataForSvg('answer');

  for (var i = 0; i < userImageData.data.length; i++) {
    if (0 !== Math.abs(userImageData.data[i] - solutionImageData.data[i])) {
      return false;
    }
  }
  return true;
}

/**
 * App specific displayFeedback function that calls into
 * BlocklyApps.displayFeedback when appropriate
 */
var displayFeedback = function(response) {
  // override extra top blocks message
  level.extraTopBlocks = evalMsg.extraTopBlocks();

  BlocklyApps.displayFeedback({
    app: 'Eval',
    skin: skin.id,
    feedbackType: Eval.testResults,
    response: response,
    level: level,
    appStrings: {
      reinfFeedbackMsg: evalMsg.reinfFeedbackMsg()
    },
  });
};

/**
 * Function to be called when the service report call is complete
 * @param {object} JSON response (if available)
 */
function onReportComplete(response) {
  // Disable the run button until onReportComplete is called.
  var runButton = document.getElementById('runButton');
  runButton.disabled = false;
  displayFeedback(response);
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../locale/zh_tw/common":50,"../../locale/zh_tw/eval":51,"../base":3,"../block_utils":4,"../canvg/canvg.js":7,"../codegen":8,"../constants":9,"../dom":10,"../feedback.js":28,"../skins":34,"../templates/page.html":42,"./api":11,"./controls.html":13,"./levels":25,"./visualization.html":27}],15:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalCircle = function (radius, style, color) {
  evalUtils.ensureNumber(radius);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = radius;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('r', this.radius_);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalCircle.prototype.rotate = function () {
  // No-op. Rotating the circle svg gives us some problems when we convert to
  // a bitmap.
};

},{"./evalImage":17,"./evalUtils":24}],16:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalCircle = function (width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'ellipse');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('rx', this.width_ / 2);
  this.element_.setAttribute('ry', this.height_ / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],17:[function(require,module,exports){
var evalUtils = require('./evalUtils');

var EvalImage = function (style, color) {
  // x/y location in pixel space of object's center
  this.x_ = 200;
  this.y_ = 200;

  this.rotation_ = 0;
  this.scaleX_ = 1.0;
  this.scaleY = 1.0;

  this.style_ = style;
  this.color_ = color;
};
module.exports = EvalImage;

EvalImage.prototype.updatePosition = function (x, y) {
  this.x_ = x;
  this.y_ = y;
};

EvalImage.prototype.draw = function (parentElement) {
  if (this.style_ && this.color_) {
    this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
    this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
    this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
  }

  var transform = "";
  transform += " translate(" + this.x_ + " " + this.y_ + ")";

  if (this.scaleX_ !== 1.0 || this.scaleY !== 1.0) {
    transform += " scale(" + this.scaleX_ + " " + this.scaleY_ + ")";
  }

  if (this.rotation_ !== 0) {
    transform += " rotate(" + this.rotation_ + ")";
  }

  if (transform === "") {
    this.element_.removeAttribute("transform");
  } else {
    this.element_.setAttribute("transform", transform);
  }
};

EvalImage.prototype.place = function (x, y) {
  this.x_ = x;
  this.y_ = y;
};

EvalImage.prototype.rotate = function (degrees) {
  this.rotation_ += degrees;
};

EvalImage.prototype.scale = function (scaleX, scaleY) {
  this.scaleX_ = scaleX;
  this.scaleY_ = scaleY;
};

},{"./evalUtils":24}],18:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalMulti = function (image1, image2) {
  evalUtils.ensureType(image1, EvalImage);
  evalUtils.ensureType(image2, EvalImage);

  EvalImage.apply(this);

  this.image1_ = image1;
  this.image2_ = image2;

  // we want an object centered at 0, 0 that we can then apply transforms to.
  // to accomplish this, we need to adjust the children's x/y's to be relative
  // to us
  var deltaX, deltaY;
  deltaX = this.image1_.x_ - this.x_;
  deltaY = this.image1_.y_ - this.y_;
  this.image1_.updatePosition(deltaX, deltaY);
  deltaX = this.image2_.x_ - this.x_;
  deltaY = this.image2_.y_ - this.y_;
  this.image2_.updatePosition(deltaX, deltaY);

  this.element_ = null;
};
EvalMulti.inherits(EvalImage);
module.exports = EvalMulti;

EvalMulti.prototype.draw = function (parent) {
  if (!this.element_) {
    var deltaX, deltaY;

    this.element_ = document.createElementNS(Blockly.SVG_NS, 'g');
    parent.appendChild(this.element_);
  }

  this.image2_.draw(this.element_);
  this.image1_.draw(this.element_);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],19:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalPolygon = function (sideCount, length, style, color) {
  evalUtils.ensureNumber(sideCount);
  evalUtils.ensureNumber(length);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = length / (2 * Math.sin(Math.PI / sideCount));
  this.pointCount_ = sideCount;

  this.element_ = null;
};
EvalPolygon.inherits(EvalImage);
module.exports = EvalPolygon;

EvalPolygon.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  var points = [];
  var radius = this.radius_;

  var angle = 2 * Math.PI / this.pointCount_;
  for (var i = 1; i <= this.pointCount_; i++) {
    points.push(radius * Math.cos(i * angle) + "," + radius * Math.sin(i * angle));
  }

  this.element_.setAttribute('points', points.join(' '));

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],20:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalRect = function (width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalRect.inherits(EvalImage);
module.exports = EvalRect;

EvalRect.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'rect');
    parent.appendChild(this.element_);
  }

  // center rect at 0, 0. we'll use transforms to move it.
  this.element_.setAttribute('x', -this.width_ / 2);
  this.element_.setAttribute('y', -this.height_ / 2);
  this.element_.setAttribute('width', this.width_);
  this.element_.setAttribute('height', this.height_);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],21:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalStar = function (pointCount, inner, outer, style, color) {
  evalUtils.ensureNumber(pointCount);
  evalUtils.ensureNumber(inner);
  evalUtils.ensureNumber(outer);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.outer_ = outer;
  this.inner_ = inner;
  this.pointCount_ = pointCount;

  this.element_ = null;
};
EvalStar.inherits(EvalImage);
module.exports = EvalStar;

EvalStar.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  var points = [];
  var outerRadius = this.outer_;
  var innerRadius = this.inner_;

  var angleDelta = 2 * Math.PI / this.pointCount_;
  for (var angle = 0; angle < 2 * Math.PI; angle += angleDelta) {
    points.push(outerRadius * Math.cos(angle) + "," + outerRadius * Math.sin(angle));
    points.push(innerRadius * Math.cos(angle + angleDelta / 2) + "," +
      innerRadius * Math.sin(angle + angleDelta / 2));
  }

  this.element_.setAttribute('points', points.join(' '));
  if (this.pointCount_ % 2 == 1) {
    this.rotate(-90 / this.pointCount_);
  }

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],22:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalText = function (text, fontSize, color) {
  evalUtils.ensureString(text);
  evalUtils.ensureNumber(fontSize);
  evalUtils.ensureString(color);

  EvalImage.apply(this, ['solid', color]);

  this.text_ = text;
  this.fontSize_ = fontSize;

  this.element_ = null;
};
EvalText.inherits(EvalImage);
module.exports = EvalText;

EvalText.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'text');
    parent.appendChild(this.element_);
  }
  this.element_.textContent = this.text_;
  this.element_.setAttribute('style', 'font-size: ' + this.fontSize_ + 'pt');

  var bbox = this.element_.getBBox();
  // center at origin
  this.element_.setAttribute('x', -bbox.width / 2);
  this.element_.setAttribute('y', -bbox.height / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],23:[function(require,module,exports){
var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalTriangle = function (edge, style, color) {
  evalUtils.ensureNumber(edge);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.edge_ = edge;

  this.element_ = null;
};
EvalTriangle.inherits(EvalImage);
module.exports = EvalTriangle;

EvalTriangle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  // center at 0, 0 (allowing transforms to move it around)
  // the center is halfway between width, and a third of the way up the height
  var height = Math.sqrt(3) / 2 * this.edge_;

  var bottomLeft = {
    x: -this.edge_ / 2,
    y: height / 3
  };

  var bottomRight = {
    x: this.edge_ / 2,
    y: height / 3
  };

  var top = {
    x: 0,
    y: -height * 2 / 3
  };

  this.element_.setAttribute('points',
    bottomLeft.x +',' + bottomLeft.y + ' ' +
    bottomRight.x + ',' + bottomRight.y + ' ' +
    top.x + ',' + top.y);

  EvalImage.prototype.draw.apply(this, arguments);
};

},{"./evalImage":17,"./evalUtils":24}],24:[function(require,module,exports){
/**
 * Throws an expection if val is not of the expected type. Type is either a
 * string (like "number" or "string") or an object (Like EvalImage).
 */
module.exports.ensureString = function (val) {
  return module.exports.ensureType(val, "string");
};

module.exports.ensureNumber = function (val) {
  return module.exports.ensureType(val, "number");
};

module.exports.ensureType = function (val, type) {
  if (typeof(type) === "string") {
    if (typeof(val) !== type) {
      throw new Error("expected type: " + type + "\ngot type: " + typeof(val));
    }
  } else if (!(val instanceof type)) {
    throw new Error("unexpected object");
  }
};

module.exports.getFill = function (style, color) {
  if (style === 'outline') {
    return "none";
  }
  // for now, we treat anything we don't recognize as solid.
  return color;
};

module.exports.getStroke = function (style, color) {
  if (style === "outline") {
    return color;
  }
  return "none";
};

/**
 * Get the opacity from the style. Style is a string that is either a word or
 * percentage (i.e. 25%).
 */
module.exports.getOpacity = function (style, color) {
  var alpha = 1.0;
  if (style.slice(-1) === "%") {
    alpha = parseInt(style.slice(0, -1), 10) / 100;
  }
  return alpha;
};

/**
 * Users specify pixels in a coordinate system where the origin is at the bottom
 * left, and x and y increase as you move right/up. I'm referring to this as
 * the cartesian coordinate system.
 * The pixel coordinate system instead has origin at the top left, and x and y
 * increase as you move right/down.
 */
module.exports.cartesianToPixel = function (cartesianY) {
  return 400 - cartesianY;
};

},{}],25:[function(require,module,exports){
var msg = require('../../locale/zh_tw/eval');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'eval1': {
    solutionBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'green' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 200 } )
    }),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('functional_plus') +
      blockUtils.blockOfType('functional_minus') +
      blockUtils.blockOfType('functional_times') +
      blockUtils.blockOfType('functional_dividedby') +
      blockUtils.blockOfType('functional_math_number') +
      blockUtils.blockOfType('functional_string') +
      blockUtils.blockOfType('functional_style') +
      blockUtils.blockOfType('functional_circle') +
      blockUtils.blockOfType('functional_triangle') +
      blockUtils.blockOfType('functional_square') +
      blockUtils.blockOfType('functional_rectangle') +
      blockUtils.blockOfType('functional_ellipse') +
      blockUtils.blockOfType('functional_star') +
      blockUtils.blockOfType('functional_radial_star') +
      blockUtils.blockOfType('functional_polygon') +
      blockUtils.blockOfType('place_image') +
      blockUtils.blockOfType('offset') +
      blockUtils.blockOfType('overlay') +
      blockUtils.blockOfType('underlay') +
      blockUtils.blockOfType('rotate') +
      blockUtils.blockOfType('scale') +
      blockUtils.blockOfType('functional_text') +
      blockUtils.blockOfType('string_append') +
      blockUtils.blockOfType('string_length') +
      blockUtils.blockOfType('functional_greater_than') +
      blockUtils.blockOfType('functional_less_than') +
      blockUtils.blockOfType('functional_number_equals') +
      blockUtils.blockOfType('functional_string_equals') +
      blockUtils.blockOfType('functional_logical_and') +
      blockUtils.blockOfType('functional_logical_or') +
      blockUtils.blockOfType('functional_logical_not') +
      blockUtils.blockOfType('functional_boolean')
    ),
    startBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'black' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 200 } )
    }),
    requiredBlocks: '',
    freePlay: false
  },

  'custom': {
    answer: '',
    ideal: Infinity,
    toolbox: '',
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  }
};

},{"../../locale/zh_tw/eval":51,"../block_utils":4}],26:[function(require,module,exports){
var appMain = require('../appMain');
window.Eval = require('./eval');
var blocks = require('./blocks');
var skins = require('../skins');
var levels = require('./levels');

window.evalMain = function(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  appMain(window.Eval, levels, options);
};

},{"../appMain":2,"../skins":34,"./blocks":12,"./eval":14,"./levels":25}],27:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgEval">\n  <g id="answer">\n  </g>\n  <g id="user">\n  </g>\n</svg>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],28:[function(require,module,exports){
var trophy = require('./templates/trophy.html');
var utils = require('./utils');
var readonly = require('./templates/readonly.html');
var codegen = require('./codegen');
var msg = require('../locale/zh_tw/common');
var dom = require('./dom');
var xml = require('./xml');
var _ = utils.getLodash();

var TestResults = require('./constants').TestResults;

exports.HintRequestPlacement = {
  NONE: 0,  // This value must not be changed.
  LEFT: 1,  // Hint request button is on left.
  RIGHT: 2  // Hint request button is on right.
};

exports.displayFeedback = function(options) {
  options.hintRequestExperiment = options.response &&
      options.response.hint_request_placement;
  options.level = options.level || {};
  options.numTrophies = numTrophiesEarned(options);

  // Tracking event for level newly completed
  if (options.response && options.response.new_level_completed) {
    trackEvent('Puzzle', 'Completed', options.response.level_path, options.response.level_attempts);
  }

  var hadShareFailure = (options.response && options.response.share_failure);
  var showingSharing = options.showingSharing && !hadShareFailure;

  var canContinue = exports.canContinueToNextLevel(options.feedbackType);
  var displayShowCode = BlocklyApps.enableShowCode && canContinue && !showingSharing;
  var feedback = document.createElement('div');
  var sharingDiv = (canContinue && showingSharing) ? exports.createSharingDiv(options) : null;
  var showCode = displayShowCode ? getShowCodeElement(options) : null;
  var shareFailureDiv = hadShareFailure ? getShareFailure(options) : null;
  if (hadShareFailure) {
    trackEvent('Share', 'Failure', options.response.share_failure.type);
  }
  var feedbackBlocks = new FeedbackBlocks(options);
  // feedbackMessage must be initialized after feedbackBlocks
  // because FeedbackBlocks can mutate options.response.hint.
  var feedbackMessage = getFeedbackMessage(options);

  if (feedbackMessage) {
    feedback.appendChild(feedbackMessage);
  }
  if (options.numTrophies) {
    // Tracking event for new trophy earned
    if (options.numTrophies > 0) {
      for (var i = 0; i < options.numTrophies; i++) {
        var concept_name = options.response.trophy_updates[i][0];
        var trophy_name = options.response.trophy_updates[i][1];
        trackEvent('Trophy', concept_name, trophy_name);
      }
    }
    var trophies = getTrophiesElement(options);
    feedback.appendChild(trophies);
  }
  if (feedbackBlocks.div) {
    if (feedbackMessage && useSpecialFeedbackDesign(options)) {
      // put the blocks iframe inside the feedbackMessage for this special case:
      feedbackMessage.appendChild(feedbackBlocks.div);
    } else {
      feedback.appendChild(feedbackBlocks.div);
    }
  }
  if (sharingDiv) {
    feedback.appendChild(sharingDiv);
  }
  if (showingSharing) {
    var shareCodeSpacer = document.createElement('div');
    shareCodeSpacer.className = "share-code-spacer";
    feedback.appendChild(shareCodeSpacer);
  }
  if (shareFailureDiv) {
    feedback.appendChild(shareFailureDiv);
  }
  if (showCode) {
    feedback.appendChild(showCode);
  }
  if (options.level.isK1) {
    feedback.className += " k1";
  }
  if (options.appDiv) {
    feedback.appendChild(options.appDiv);
  }

  feedback.appendChild(
    getFeedbackButtons({
      feedbackType: options.feedbackType,
      showPreviousButton: options.level.showPreviousLevelButton,
      isK1: options.level.isK1,
      hintRequestExperiment: options.hintRequestExperiment,
      freePlay: options.level.freePlay
    })
  );

  var againButton = feedback.querySelector('#again-button');
  var hintRequestButton = feedback.querySelector('#hint-request-button');
  var previousLevelButton = feedback.querySelector('#back-button');
  var continueButton = feedback.querySelector('#continue-button');

  var onlyContinue = continueButton && !againButton && !previousLevelButton;

  var onHidden = onlyContinue ? options.onContinue : null;
  var icon = canContinue ? BlocklyApps.WIN_ICON : BlocklyApps.FAILURE_ICON;
  var defaultBtnSelector = onlyContinue ? '#continue-button' : '#again-button';

  var feedbackDialog = exports.createModalDialogWithIcon({
    Dialog: options.Dialog,
    contentDiv: feedback,
    icon: icon,
    defaultBtnSelector: defaultBtnSelector,
    onHidden: onHidden,
    id: 'feedback-dialog'
  });

  // Update the background color if it is set to be in special design.
  if (useSpecialFeedbackDesign(options)) {
    if (options.response.design == "white_background") {
      document.getElementById('feedback-dialog')
          .className += " white-background";
      document.getElementById('feedback-content')
          .className += " light-yellow-background";
    }
  }

  if (againButton) {
    dom.addClickTouchEvent(againButton, function() {
      feedbackDialog.hide();
    });
  }

  if (previousLevelButton) {
    dom.addClickTouchEvent(previousLevelButton, function() {
      feedbackDialog.hide();
      options.backToPreviousLevel();
    });
  }

  // If there is a hint request button, hide the hint that would ordinarily
  // be shown (including any feedback blocks), and add code to restore the
  // hint if the button gets pressed.
  if (hintRequestButton) {
    // Swap out the specific feedback message with a generic one.
    var genericFeedback = getFeedbackMessage({message: msg.genericFeedback()});
    var parentNode = feedbackMessage.parentNode;
    parentNode.replaceChild(genericFeedback, feedbackMessage);

    // If there are feedback blocks, temporarily remove them.
    // Get pointers to the parent and next sibling so we can re-insert
    // the feedback blocks into the correct location if needed.
    var feedbackBlocksParent = null;
    var feedbackBlocksNextSib = null;
    if (feedbackBlocks.div) {
      feedbackBlocksParent = feedbackBlocks.div.parentNode;
      feedbackBlocksNextSib = feedbackBlocks.div.nextSibling;
      feedbackBlocksParent.removeChild(feedbackBlocks.div);
    }

    // If the user requests the hint...
    dom.addClickTouchEvent(hintRequestButton, function() {
      // Swap the specific feedback message back in.
      parentNode.replaceChild(feedbackMessage, genericFeedback);

      // Remove "Show hint" button.  Making it invisible isn't enough,
      // because it will still take up space.
      hintRequestButton.parentNode.removeChild(hintRequestButton);

      // Restore feedback blocks, if present.
      if (feedbackBlocks.div && feedbackBlocksParent) {
        feedbackBlocksParent.insertBefore(feedbackBlocks.div, feedbackBlocksNextSib);
        feedbackBlocks.show();
      }

      // Report hint request to server.
      if (options.response.hint_requested_url) {
        $.ajax({url: options.response.hint_requested_url, type: 'PUT'});
      }
    });
  }

  if (continueButton) {
    dom.addClickTouchEvent(continueButton, function() {
      feedbackDialog.hide();
      // onContinue will fire already if there was only a continue button
      if (!onlyContinue) {
        options.onContinue();
      }
    });
  }

  // set up the Save To Gallery button if necessary
  var saveToGalleryButton = feedback.querySelector('#save-to-gallery-button');
  if (saveToGalleryButton && options.response && options.response.save_to_gallery_url) {
    dom.addClickTouchEvent(saveToGalleryButton, function() {
      $.post(options.response.save_to_gallery_url,
             function() { $('#save-to-gallery-button').prop('disabled', true).text("Saved!"); });
    });
  }

  function createHiddenPrintWindow(src) {
    var iframe = $('<iframe id="print_frame" style="display: none"></iframe>'); // Created a hidden iframe with just the desired image as its contents
    iframe.appendTo("body");
    iframe[0].contentWindow.document.write("<img src='" + src + "'/>");
    iframe[0].contentWindow.document.write("<script>if (document.execCommand('print', false, null)) {  } else { window.print();  } </script>");
    $("#print_frame").remove(); // Remove the iframe when the print dialogue has been launched
  }

  var printButton = feedback.querySelector('#print-button');
  if (printButton) {
    dom.addClickTouchEvent(printButton, function() {
      createHiddenPrintWindow(options.feedbackImage);
    });
  }

  feedbackDialog.show({
    backdrop: (options.app === 'flappy' ? 'static' : true)
  });

  if (feedbackBlocks.div) {
    feedbackBlocks.show();
  }
};

/**
 * Counts the number of blocks used.  Blocks are only counted if they are
 * not disabled, are deletable.
 * @return {number} Number of blocks used.
 */
exports.getNumBlocksUsed = function() {
  var i;
  if (BlocklyApps.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = getGeneratedCodeString().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return getUserBlocks().length;
};

/**
 * Counts the total number of blocks. Blocks are only counted if they are
 * not disabled.
 * @return {number} Total number of blocks.
 */
exports.getNumCountableBlocks = function() {
  var i;
  if (BlocklyApps.editCode) {
    var codeLines = 0;
    // quick and dirty method to count non-blank lines that don't start with //
    var lines = getGeneratedCodeString().split("\n");
    for (i = 0; i < lines.length; i++) {
      if ((lines[i].length > 1) && (lines[i][0] != '/' || lines[i][1] != '/')) {
        codeLines++;
      }
    }
    return codeLines;
  }
  return getCountableBlocks().length;
};

var getFeedbackButtons = function(options) {
  var buttons = document.createElement('div');
  buttons.id = 'feedbackButtons';
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      previousLevel:
        !exports.canContinueToNextLevel(options.feedbackType) &&
        options.showPreviousButton,
      tryAgain: options.feedbackType !== TestResults.ALL_PASS,
      nextLevel: exports.canContinueToNextLevel(options.feedbackType),
      isK1: options.isK1,
      hintRequestExperiment: options.hintRequestExperiment &&
          (options.hintRequestExperiment === exports.HintRequestPlacement.LEFT ?
              'left' : 'right'),
      assetUrl: BlocklyApps.assetUrl,
      freePlay: options.freePlay
    }
  });

  return buttons;
};

var getShareFailure = function(options) {
  var shareFailure = options.response.share_failure;
  var shareFailureDiv = document.createElement('div');
  shareFailureDiv.innerHTML = require('./templates/shareFailure.html')({shareFailure: shareFailure});
  return shareFailureDiv;
};

var useSpecialFeedbackDesign = function (options) {
 return options.response &&
        options.response.design &&
        options.response.hint;
};

// This returns a document element with the appropriate feedback message.
// The message will be one of the following, from highest to lowest precedence:
// 1. Message passed in by caller (options.message).
// 2. Message from dashboard database (options.response.hint).
// 3. Header message due to dashboard text check fail (options.response.share_failure).
// 4. Level-specific message (e.g., options.level.emptyBlocksErrorMsg) for
//    specific result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
// 5. System-wide message (e.g., msg.emptyBlocksErrorMsg()) for specific
//    result type (e.g., TestResults.EMPTY_BLOCK_FAIL).
var getFeedbackMessage = function(options) {
  var feedback = document.createElement('p');
  feedback.className = 'congrats';
  var message;

  // If a message was explicitly passed in, use that.
  if (options.message) {
    message = options.message;
  } else if (options.response && options.response.share_failure) {
    message = msg.shareFailure();
  } else if (options.response && options.response.hint) {
    // Otherwise, if there's a dashboard database hint, use that.
    message = options.response.hint;
  } else {
    // Otherwise, the message will depend on the test result.
    switch (options.feedbackType) {
      case TestResults.EMPTY_BLOCK_FAIL:
        message = options.level.emptyBlocksErrorMsg ||
            msg.emptyBlocksErrorMsg();
        break;
      case TestResults.EMPTY_FUNCTION_BLOCK_FAIL:
        if (options.level.emptyFunctionBlocksErrorMsg) {
          message = options.level.emptyFunctionBlocksErrorMsg;
        } else if (Blockly.useContractEditor || Blockly.useModalFunctionEditor) {
          message = msg.errorEmptyFunctionBlockModal();
        } else {
          message = msg.emptyFunctionBlocksErrorMsg();
        }
        break;
      case TestResults.TOO_FEW_BLOCKS_FAIL:
        message = options.level.tooFewBlocksMsg || msg.tooFewBlocksMsg();
        break;
      case TestResults.LEVEL_INCOMPLETE_FAIL:
        message = options.level.levelIncompleteError ||
            msg.levelIncompleteError();
        break;
      case TestResults.EXTRA_TOP_BLOCKS_FAIL:
        message = options.level.extraTopBlocks || msg.extraTopBlocks();
        break;
      case TestResults.APP_SPECIFIC_FAIL:
        message = options.level.appSpecificFailError;
        break;
      case TestResults.UNUSED_PARAM:
        message = msg.errorUnusedParam();
        break;
      case TestResults.UNUSED_FUNCTION:
        message = msg.errorUnusedFunction();
        break;
      case TestResults.PARAM_INPUT_UNATTACHED:
        message = msg.errorParamInputUnattached();
        break;
      case TestResults.INCOMPLETE_BLOCK_IN_FUNCTION:
        message = msg.errorIncompleteBlockInFunction();
        break;
      case TestResults.QUESTION_MARKS_IN_NUMBER_FIELD:
        message = msg.errorQuestionMarksInNumberField();
        break;
      case TestResults.TOO_MANY_BLOCKS_FAIL:
        message = msg.numBlocksNeeded({
          numBlocks: BlocklyApps.IDEAL_BLOCK_NUM,
          puzzleNumber: options.level.puzzle_number || 0
        });
        break;
      case TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL:
        message = options.level.appSpecificAcceptableFailError;
        break;
      case TestResults.EDIT_BLOCKS:
        message = options.level.edit_blocks_success;
        break;
      case TestResults.MISSING_BLOCK_UNFINISHED:
        /* fallthrough */
      case TestResults.MISSING_BLOCK_FINISHED:
        message = options.level.missingBlocksErrorMsg ||
            msg.missingBlocksErrorMsg();
        break;

      // Success.
      case TestResults.ALL_PASS:
      case TestResults.FREE_PLAY:
        var finalLevel = (options.response &&
            (options.response.message == "no more levels"));
        var stageCompleted = null;
        if (options.response && options.response.stage_changing) {
          stageCompleted = options.response.stage_changing.previous.name;
        }
        var msgParams = {
          numTrophies: options.numTrophies,
          stageNumber: 0, // TODO: remove once localized strings have been fixed
          stageName: stageCompleted,
          puzzleNumber: options.level.puzzle_number || 0
        };
        if (options.feedbackType === TestResults.FREE_PLAY && !options.level.disableSharing) {
          message = options.appStrings.reinfFeedbackMsg;
        } else if (options.numTrophies > 0) {
          message = finalLevel ? msg.finalStageTrophies(msgParams) :
                                 stageCompleted ?
                                    msg.nextStageTrophies(msgParams) :
                                    msg.nextLevelTrophies(msgParams);
        } else {
          message = finalLevel ? msg.finalStage(msgParams) :
                                 stageCompleted ?
                                     msg.nextStage(msgParams) :
                                     msg.nextLevel(msgParams);
        }
        break;
    }
  }

  dom.setText(feedback, message);

  // Update the feedback box design, if the hint message came from server.
  if (useSpecialFeedbackDesign(options)) {
    // Setup a new div
    var feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-callout';
    feedbackDiv.id = 'feedback-content';

    // Insert an image
    var imageDiv = document.createElement('img');
    imageDiv.className = "hint-image";
    imageDiv.src = BlocklyApps.assetUrl(
      'media/lightbulb_for_' + options.response.design + '.png');
    feedbackDiv.appendChild(imageDiv);
    // Add new text
    var hintHeader = document.createElement('p');
    dom.setText(hintHeader, msg.hintHeader());
    feedbackDiv.appendChild(hintHeader);
    hintHeader.className = 'hint-header';
    // Append the original text
    feedbackDiv.appendChild(feedback);
    return feedbackDiv;
  }
  return feedback;
};

exports.createSharingDiv = function(options) {
  if (!options.response || !options.response.level_source) {
    // don't even try if our caller didn't give us something that can be shared
    // options.response.level_source is the url that we are sharing
    return null;
  }

  if (BlocklyApps.disableSocialShare) {
    // Clear out our urls so that we don't display any of our social share links
    options.twitterUrl = undefined;
    options.facebookUrl = undefined;
    options.sendToPhone = false;
  } else {

    // set up the twitter share url
    var twitterUrl = "https://twitter.com/intent/tweet?url=" +
                     options.response.level_source;

    if (options.twitter && options.twitter.text !== undefined) {
      twitterUrl += "&text=" + encodeURI(options.twitter.text);
    }
    else {
      twitterUrl += "&text=" + encodeURI(msg.defaultTwitterText() + " @codeorg");
    }

    if (options.twitter  && options.twitter.hashtag !== undefined) {
      twitterUrl += "&hashtags=" + options.twitter.hashtag;
    }
    else {
      twitterUrl += "&hashtags=" + 'HourOfCode';
    }

    if (options.twitter && options.twitter.related !== undefined) {
      twitterUrl += "&related=" + options.twitter.related;
    }
    else {
      twitterUrl += "&related=codeorg";
    }

    options.twitterUrl = twitterUrl;

    // set up the facebook share url
    var facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" +
                      options.response.level_source;
    options.facebookUrl = facebookUrl;
  }

  var sharingDiv = document.createElement('div');
  sharingDiv.setAttribute('style', 'display:inline-block');
  sharingDiv.innerHTML = require('./templates/sharing.html')({
    options: options
  });

  var sharingInput = sharingDiv.querySelector('#sharing-input');
  if (sharingInput) {
    dom.addClickTouchEvent(sharingInput, function() {
      sharingInput.focus();
      sharingInput.select();
    });
  }

  var sharingShapeways = sharingDiv.querySelector('#sharing-shapeways');
  if (sharingShapeways) {
    dom.addClickTouchEvent(sharingShapeways, function() {
      $('#send-to-phone').hide();
      $('#shapeways-message').show();
    });
  }

  //  SMS-to-phone feature
  var sharingPhone = sharingDiv.querySelector('#sharing-phone');
  if (sharingPhone && options.sendToPhone) {
    dom.addClickTouchEvent(sharingPhone, function() {
      var sendToPhone = sharingDiv.querySelector('#send-to-phone');
      if ($(sendToPhone).is(':hidden')) {
        $('#shapeways-message').hide();
        sendToPhone.setAttribute('style', 'display:inline-block');
        var phone = $(sharingDiv.querySelector("#phone"));
        var submitted = false;
        var submitButton = sharingDiv.querySelector('#phone-submit');
        submitButton.disabled = true;
        phone.mask('(000) 000-0000',{
            onComplete:function(){if(!submitted) submitButton.disabled=false;},
            onChange: function(){submitButton.disabled=true;}
        });
        phone.focus();
        dom.addClickTouchEvent(submitButton, function() {
          var phone = $(sharingDiv.querySelector("#phone"));
          var params = jQuery.param({
            level_source: options.response.level_source_id,
            phone: phone.val()
          });
          $(submitButton).val("Sending..");
          phone.prop('readonly', true);
          submitButton.disabled = true;
          submitted = true;
          jQuery.post(options.response.phone_share_url, params)
            .done(function (response) {
              $(submitButton).text("Sent!");
              trackEvent("SendToPhone", "success");
            })
            .fail(function (xhr) {
              $(submitButton).text("Error!");
              trackEvent("SendToPhone", "error");
            });
        });
      }
    });
  }

  return sharingDiv;
};


var numTrophiesEarned = function(options) {
  if (options.response && options.response.trophy_updates) {
    return options.response.trophy_updates.length;
  } else {
    return 0;
  }
};

var getTrophiesElement = function(options) {
  var html = "";
  for (var i = 0; i < options.numTrophies; i++) {
    html += trophy({
      img_url: options.response.trophy_updates[i][2],
      concept_name: options.response.trophy_updates[i][0]
    });
  }
  var trophies = document.createElement('div');
  trophies.innerHTML = html;
  return trophies;
};

var getShowCodeElement = function(options) {
  var showCodeDiv = document.createElement('div');
  showCodeDiv.setAttribute('id', 'show-code');

  var numLinesWritten = exports.getNumBlocksUsed();
  var shouldShowTotalLines =
    (options.response &&
      options.response.total_lines &&
      (options.response.total_lines !== numLinesWritten));
  var totalNumLinesWritten = shouldShowTotalLines ? options.response.total_lines : 0;

  showCodeDiv.innerHTML = require('./templates/showCode.html')({
    numLinesWritten: numLinesWritten,
    totalNumLinesWritten: totalNumLinesWritten
  });

  var showCodeButton = showCodeDiv.querySelector('#show-code-button');
  showCodeButton.addEventListener('click', function () {
    showCodeDiv.appendChild(getGeneratedCodeElement());
    showCodeButton.style.display = 'none';
  });

  return showCodeDiv;
};

/**
 * Determines whether the user can proceed to the next level, based on the level feedback
 * @param {number} feedbackType A constant property of TestResults,
 *     typically produced by BlocklyApps.getTestResults().
 */
exports.canContinueToNextLevel = function(feedbackType) {
  return (feedbackType === TestResults.ALL_PASS ||
    feedbackType === TestResults.TOO_MANY_BLOCKS_FAIL ||
    feedbackType ===  TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL ||
    feedbackType ===  TestResults.FREE_PLAY);
};

/**
 * Retrieve a string containing the user's generated Javascript code.
 */
var getGeneratedCodeString = function() {
  if (BlocklyApps.editCode) {
    return BlocklyApps.editor ? BlocklyApps.editor.getValue() : '';
  }
  else {
    return codegen.workspaceCode(Blockly);
  }
};

var FeedbackBlocks = function(options) {
  // Check whether blocks are embedded in the hint returned from dashboard.
  // See below comment for format.
  var embeddedBlocks = options.response && options.response.hint &&
      options.response.hint.indexOf("[{") !== 0;
  if (!embeddedBlocks &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_UNFINISHED &&
      options.feedbackType !==
      TestResults.MISSING_BLOCK_FINISHED) {
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
  } else {
    var missingRequiredBlocks = getMissingRequiredBlocks();
    blocksToDisplay = missingRequiredBlocks.blocksToDisplay;
    if (missingRequiredBlocks.message) {
      options.message = missingRequiredBlocks.message;
    }
  }

  if (blocksToDisplay.length === 0) {
    return;
  }

  this.div = document.createElement('div');
  this.html = readonly({
    app: options.app,
    assetUrl: BlocklyApps.assetUrl,
    options: {
      readonly: true,
      locale: BlocklyApps.LOCALE,
      localeDirection: BlocklyApps.localeDirection(),
      baseUrl: BlocklyApps.BASE_URL,
      cacheBust: BlocklyApps.CACHE_BUST,
      skinId: options.skin,
      level: options.level,
      blocks: generateXMLForBlocks(blocksToDisplay)
    }
  });
  this.iframe = document.createElement('iframe');
  this.iframe.setAttribute('id', 'feedbackBlocks');
  this.iframe.setAttribute('allowtransparency', 'true');
  this.div.appendChild(this.iframe);
};

FeedbackBlocks.prototype.show = function() {
  var iframe = document.getElementById('feedbackBlocks');
  if (iframe) {
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(this.html);
    doc.close();
  }
};

var getGeneratedCodeElement = function() {
  var codeInfoMsgParams = {
    berkeleyLink: "<a href='http://bjc.berkeley.edu/' target='_blank'>Berkeley</a>",
    harvardLink: "<a href='https://cs50.harvard.edu/' target='_blank'>Harvard</a>"
  };

  var infoMessage = BlocklyApps.editCode ?  "" : msg.generatedCodeInfo(codeInfoMsgParams);
  var code = getGeneratedCodeString();

  var codeDiv = document.createElement('div');
  codeDiv.innerHTML = require('./templates/code.html')({
    message: infoMessage,
    code: code
  });

  return codeDiv;
};

exports.showGeneratedCode = function(Dialog) {
  var codeDiv = getGeneratedCodeElement();

  var buttons = document.createElement('div');
  buttons.innerHTML = require('./templates/buttons.html')({
    data: {
      ok: true
    }
  });
  codeDiv.appendChild(buttons);

  var dialog = exports.createModalDialogWithIcon({
      Dialog: Dialog,
      contentDiv: codeDiv,
      icon: BlocklyApps.ICON,
      defaultBtnSelector: '#ok-button'
      });

  var okayButton = buttons.querySelector('#ok-button');
  if (okayButton) {
    dom.addClickTouchEvent(okayButton, function() {
      dialog.hide();
    });
  }

  dialog.show();
};

/**
 * Check user's code for empty container blocks, such as "repeat".
 * @return {boolean} true if a block is empty (no blocks are nested inside).
 */
var hasEmptyContainerBlocks = function() {
  var code = codegen.workspaceCode(Blockly);
  return (/\{\s*\}/).test(code);
};

/**
 * Get an empty container block, if any are present.
 * @return {Blockly.Block} an empty container block, or null if none exist.
 */
var getEmptyContainerBlock = function() {
  var blocks = Blockly.mainBlockSpace.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    for (var j = 0; j < block.inputList.length; j++) {
      var input = block.inputList[j];
      if (input.type == Blockly.NEXT_STATEMENT &&
          !input.connection.targetConnection) {
        return block;
      }
    }
  }
  return null;
};

/**
 * Check whether the user code has all the blocks required for the level.
 * @return {boolean} true if all blocks are present, false otherwise.
 */
var hasAllRequiredBlocks = function() {
  return getMissingRequiredBlocks().blocksToDisplay.length === 0;
};

/**
 * Get blocks that the user intends in the program. These are the blocks that
 * are used when checking for required blocks and when determining lines of code
 * written.
 * @return {Array<Object>} The blocks.
 */
var getUserBlocks = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled && block.isEditable() && block.type !== 'when_run';
  });
  return blocks;
};

/**
 * Get countable blocks in the program, namely any that are not disabled.
 * These are used when determined the number of blocks relative to the ideal
 * block count.
 * @return {Array<Object>} The blocks.
 */
var getCountableBlocks = function() {
  var allBlocks = Blockly.mainBlockSpace.getAllBlocks();
  var blocks = allBlocks.filter(function(block) {
    return !block.disabled;
  });
  return blocks;
};

/**
 * Check to see if the user's code contains the required blocks for a level.
 * This never returns more than BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG.
 * @return {{blocksToDisplay:!Array, message:?string}} 'missingBlocks' is an
 * array of array of strings where each array of strings is a set of blocks that
 * at least one of them should be used. Each block is represented as the prefix
 * of an id in the corresponding template.soy. 'message' is an optional message
 * to override the default error text.
 */
var getMissingRequiredBlocks = function () {
  var missingBlocks = [];
  var customMessage = null;
  var code = null;  // JavaScript code, which is initialized lazily.
  if (BlocklyApps.REQUIRED_BLOCKS && BlocklyApps.REQUIRED_BLOCKS.length) {
    var userBlocks = getUserBlocks();
    // For each list of required blocks
    // Keep track of the number of the missing block lists. It should not be
    // bigger than BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG
    var missingBlockNum = 0;
    for (var i = 0;
         i < BlocklyApps.REQUIRED_BLOCKS.length &&
             missingBlockNum < BlocklyApps.NUM_REQUIRED_BLOCKS_TO_FLAG;
         i++) {
      var requiredBlock = BlocklyApps.REQUIRED_BLOCKS[i];
      // For each of the test
      // If at least one of the tests succeeded, we consider the required block
      // is used
      var usedRequiredBlock = false;
      for (var testId = 0; testId < requiredBlock.length; testId++) {
        var test = requiredBlock[testId].test;
        if (typeof test === 'string') {
          code = code || Blockly.Generator.blockSpaceToCode('JavaScript');
          if (code.indexOf(test) !== -1) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          }
        } else if (typeof test === 'function') {
          if (userBlocks.some(test)) {
            // Succeeded, moving to the next list of tests
            usedRequiredBlock = true;
            break;
          } else {
            customMessage = requiredBlock[testId].message || customMessage;
          }
        } else {
          throw new Error('Bad test: ' + test);
        }
      }
      if (!usedRequiredBlock) {
        missingBlockNum++;
        missingBlocks = missingBlocks.concat(BlocklyApps.REQUIRED_BLOCKS[i][0]);
      }
    }
  }
  return {
    blocksToDisplay: missingBlocks,
    message: customMessage
  };
};

/**
 * Do we have any floating blocks not attached to an event block or function block?
 */
exports.hasExtraTopBlocks = function () {
  if (BlocklyApps.editCode) {
    return false;
  }
  var topBlocks = Blockly.mainBlockSpace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    // ignore disabled top blocks. we have a level turtle:2_7 that depends on
    // having disabled top level blocks
    if (topBlocks[i].disabled) {
      continue;
    }
    // Ignore top blocks which are functional definitions.
    if (topBlocks[i].type === 'functional_definition') {
      continue;
    }
    // None of our top level blocks should have a previous connection.
    if (topBlocks[i].previousConnection) {
      return true;
    }
  }
  return false;
};

/**
 * Runs the tests and returns results.
 * @param  Did the user successfully complete the level
 * @return {number} The appropriate property of TestResults.
 */
exports.getTestResults = function(levelComplete, options) {
  options = options || {};
  if (BlocklyApps.editCode) {
    // TODO (cpirich): implement better test results for editCode
    return levelComplete ?
      BlocklyApps.TestResults.ALL_PASS :
      BlocklyApps.TestResults.TOO_FEW_BLOCKS_FAIL;
  }
  if (BlocklyApps.CHECK_FOR_EMPTY_BLOCKS && hasEmptyContainerBlocks()) {
    var type = getEmptyContainerBlock().type;
    if (type === 'procedures_defnoreturn' || type === 'procedures_defreturn') {
      return TestResults.EMPTY_FUNCTION_BLOCK_FAIL;
    }
    // Block is assumed to be "if" or "repeat" if we reach here.
    // This is where to add checks if you want a different TestResult
    // for "controls_for_counter" blocks, for example.
    return TestResults.EMPTY_BLOCK_FAIL;
  }
  if (!options.allowTopBlocks && exports.hasExtraTopBlocks()) {
    return TestResults.EXTRA_TOP_BLOCKS_FAIL;
  }
  if (Blockly.useContractEditor || Blockly.useModalFunctionEditor) {
    if (hasUnusedParam()) {
      return TestResults.UNUSED_PARAM;
    }
    if (hasUnusedFunction()) {
      return TestResults.UNUSED_FUNCTION;
    }
    if (hasParamInputUnattached()) {
      return TestResults.PARAM_INPUT_UNATTACHED;
    }
    if (hasIncompleteBlockInFunction()) {
      return TestResults.INCOMPLETE_BLOCK_IN_FUNCTION;
    }
  }
  if (hasQuestionMarksInNumberField()) {
    return TestResults.QUESTION_MARKS_IN_NUMBER_FIELD;
  }
  if (!hasAllRequiredBlocks()) {
    return levelComplete ? TestResults.MISSING_BLOCK_FINISHED :
      TestResults.MISSING_BLOCK_UNFINISHED;
  }
  var numEnabledBlocks = exports.getNumCountableBlocks();
  if (!levelComplete) {
    if (BlocklyApps.IDEAL_BLOCK_NUM && BlocklyApps.IDEAL_BLOCK_NUM !== Infinity &&
        numEnabledBlocks < BlocklyApps.IDEAL_BLOCK_NUM) {
      return TestResults.TOO_FEW_BLOCKS_FAIL;
    }
    return TestResults.LEVEL_INCOMPLETE_FAIL;
  }
  if (BlocklyApps.IDEAL_BLOCK_NUM &&
      numEnabledBlocks > BlocklyApps.IDEAL_BLOCK_NUM) {
    return TestResults.TOO_MANY_BLOCKS_FAIL;
  } else {
    return TestResults.ALL_PASS;
  }
};

var Keycodes = {
  ENTER: 13,
  SPACE: 32
};

exports.createModalDialogWithIcon = function(options) {
  var imageDiv = document.createElement('img');
  imageDiv.className = "modal-image";
  imageDiv.src = options.icon;

  var modalBody = document.createElement('div');
  modalBody.appendChild(imageDiv);
  options.contentDiv.className += ' modal-content';
  modalBody.appendChild(options.contentDiv);

  var btn = options.contentDiv.querySelector(options.defaultBtnSelector);
  var keydownHandler = function(e) {
    if (e.keyCode == Keycodes.ENTER || e.keyCode == Keycodes.SPACE) {
      // Simulate a 'click':
      var event = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
      });
      btn.dispatchEvent(event);

      e.stopPropagation();
      e.preventDefault();
    }
  };

  return new options.Dialog({
    body: modalBody,
    onHidden: options.onHidden,
    onKeydown: btn ? keydownHandler : undefined,
    id: options.id
  });
};

/**
 * Creates the XML for blocks to be displayed in a read-only frame.
 * @param {Array} blocks An array of blocks to display (with optional args).
 * @return {string} The generated string of XML.
 */
var generateXMLForBlocks = function(blocks) {
  var blockXMLStrings = [];
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
  return blockXMLStrings.join('');
};

/**
 * Check for '???' instead of a value in block fields.
 */
function hasQuestionMarksInNumberField() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(block) {
    return block.getTitles().some(function(title) {
      return title.value_ === '???';
    });
  });
}

/**
 * Ensure that all procedure definitions actually use the parameters they define
 * inside the procedure.
 */
function hasUnusedParam() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    var params = userBlock.parameterNames_;
    // Only search procedure definitions
    return params && params.some(function(paramName) {
      // Unused param if there's no parameters_get descendant with the same name
      return !hasMatchingDescendant(userBlock, function(block) {
        return (block.type === 'parameters_get' ||
            block.type === 'functional_parameters_get' ||
            block.type === 'variables_get') &&
            block.getTitleValue('VAR') === paramName;
      });
    });
  });
}

/**
 * Ensure that all procedure calls have each parameter input connected.
 */
function hasParamInputUnattached() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only check procedure_call* blocks
    if (!/^procedures_call/.test(userBlock.type)) {
      return false;
    }
    return userBlock.inputList.filter(function(input) {
      return (/^ARG/.test(input.name));
    }).some(function(argInput) {
      // Unattached param input if any ARG* connection target is null
      return !argInput.connection.targetConnection;
    });
  });
}

/**
 * Ensure that all user-declared procedures have associated call blocks.
 */
function hasUnusedFunction() {
  var userDefs = [];
  var callBlocks = {};
  Blockly.mainBlockSpace.getAllBlocks().forEach(function (block) {
    var name = block.getTitleValue('NAME');
    if (/^procedures_def/.test(block.type) && block.userCreated) {
      userDefs.push(name);
    } else if (/^procedures_call/.test(block.type)) {
      callBlocks[name] = true;
    }
  });
  // Unused function if some user def doesn't have a matching call
  return userDefs.some(function(name) { return !callBlocks[name]; });
}

/**
 * Ensure there are no incomplete blocks inside any function definitions.
 */
function hasIncompleteBlockInFunction() {
  return Blockly.mainBlockSpace.getAllBlocks().some(function(userBlock) {
    // Only search procedure definitions
    if (!userBlock.parameterNames_) {
      return false;
    }
    return hasMatchingDescendant(userBlock, function(block) {
      // Incomplete block if any input connection target is null
      return block.inputList.some(function(input) {
        return input.type === Blockly.INPUT_VALUE &&
            !input.connection.targetConnection;
      });
    });
  });
}

/**
 * Returns true if any descendant (inclusive) of the given node matches the
 * given filter.
 */
function hasMatchingDescendant(node, filter) {
  if (filter(node)) {
    return true;
  }
  return node.childBlocks_.some(function (child) {
    return hasMatchingDescendant(child, filter);
  });
}


},{"../locale/zh_tw/common":50,"./codegen":8,"./constants":9,"./dom":10,"./templates/buttons.html":37,"./templates/code.html":38,"./templates/readonly.html":43,"./templates/shareFailure.html":44,"./templates/sharing.html":45,"./templates/showCode.html":46,"./templates/trophy.html":47,"./utils":48,"./xml":49}],29:[function(require,module,exports){
var utils = require('./utils');
var _ = utils.getLodash();

var colors = {
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4], // 336600
  'none': [0, 0, 0.6]
};
module.exports.colors = colors;

/**
 * Helper function to create the init section for a functional block.
 * @param {Blockly.block} block The block to initialize.
 * @param {string} title Localized block title to display.
 * @param {string} type Block type which appears in xml.
 * @param {Array} args Arguments to this block.
 * @param {number=} wrapWidth Optional number of arguments after which
 *     to wrap the next argument onto a new line when rendering the
 *     block.
 */
module.exports.initTitledFunctionalBlock = function (block, title, type, args, wrapWidth) {
  block.setFunctional(true, {
    headerHeight: 30
  });
  block.setHSV.apply(block, colors[type]);

  var options = {
    fixedSize: { height: 35 }
  };

  block.appendDummyInput()
    .appendTitle(new Blockly.FieldLabel(title, options))
    .setAlign(Blockly.ALIGN_CENTRE);

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var input = block.appendFunctionalInput(arg.name);
    var wrapNextArg = wrapWidth && (i % wrapWidth) === 0;
    input.setInline(i > 0 && !wrapNextArg);
    if (arg.type === 'none') {
      input.setHSV(0, 0, 0.99);
    } else {
      input.setHSV.apply(input, colors[arg.type]);
      input.setCheck(arg.type);
    }
    input.setAlign(Blockly.ALIGN_CENTRE);
  }

  if (type === 'none') {
    block.setFunctionalOutput(false);
  } else {
    block.setFunctionalOutput(true, type);
  }
};

/**
 * Installs a block which generates code that makes an API call, which
 * looks roughly like:
 *
 *     apiName(block_id, arg1 [,arg2 ...])
 *
 * where args with "constantValue" defined are pre-specified arguments,
 * and other args are read from functional inputs. For example:
 *
 *     options = {
 *       blockName: 'functional_setSpriteZeroSpeed',
 *       blockTitle: 'set sprite zero speed',
 *       apiName: 'Studio.setSpriteSpeed',
 *       args: [{constantValue: '0'}, // spriteIndex
 *              {name: 'SPEED', type: 'Number', default:'7'}]
 *     }
 *
 * creates a block which, with an id of '43' and an input of '12', would
 * generate the following code:
 *
 *     'Studio.setSpriteSpeed(block_id_43, 0, 12)'
 *
 * if no apiName is specified, a "dummy" block is generated which
 * accepts arguments but generates no code.
 */
module.exports.installFunctionalApiCallBlock = function(blockly, generator,
    options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;

  var blockArgs = args.filter(function(arg) {
    return arg.constantValue === undefined;
  });
  var blockType = 'none';
  blockly.Blocks[blockName] = {
    init: function () {
      module.exports.initTitledFunctionalBlock(this, blockTitle, blockType,
          blockArgs);
    }
  };

  // The generator function depends on "this" being the block object.
  generator[blockName] = function() {
    if (!apiName) {
      return '';
    }
    var apiArgs = [];
    apiArgs.push('\'block_id_' + this.id + '\'');
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var value = arg.constantValue !== undefined ?
            arg.constantValue :
            Blockly.JavaScript.statementToCode(this, arg.name, false) ||
                arg.default;
      apiArgs.push(value);
    }
    return apiName + '(' + apiArgs.join(',') + ');\n';
  };
};

module.exports.installStringPicker = function(blockly, generator, options) {
  var values = options.values;
  var blockName = options.blockName;
  blockly.Blocks[blockName] = {
    init: function () {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, colors.string);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldLabel('"'))
          .appendTitle(new blockly.FieldDropdown(values), 'VAL')
          .appendTitle(new Blockly.FieldLabel('"'))
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator[blockName] = function() {
    return blockly.JavaScript.quote_(this.getTitleValue('VAL'));
  };
};

},{"./utils":48}],30:[function(require,module,exports){
/*! Hammer.JS - v1.1.3 - 2014-05-22
 * http://eightmedia.github.io/hammer.js
 *
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
  'use strict';

/**
 * @main
 * @module hammer
 *
 * @class Hammer
 * @static
 */

/**
 * Hammer, use this to create instances
 * ````
 * var hammertime = new Hammer(myElement);
 * ````
 *
 * @method Hammer
 * @param {HTMLElement} element
 * @param {Object} [options={}]
 * @return {Hammer.Instance}
 */
var Hammer = function Hammer(element, options) {
    return new Hammer.Instance(element, options || {});
};

/**
 * version, as defined in package.json
 * the value will be set at each build
 * @property VERSION
 * @final
 * @type {String}
 */
Hammer.VERSION = '1.1.3';

/**
 * default settings.
 * more settings are defined per gesture at `/gestures`. Each gesture can be disabled/enabled
 * by setting it's name (like `swipe`) to false.
 * You can set the defaults for all instances by changing this object before creating an instance.
 * @example
 * ````
 *  Hammer.defaults.drag = false;
 *  Hammer.defaults.behavior.touchAction = 'pan-y';
 *  delete Hammer.defaults.behavior.userSelect;
 * ````
 * @property defaults
 * @type {Object}
 */
Hammer.defaults = {
    /**
     * this setting object adds styles and attributes to the element to prevent the browser from doing
     * its native behavior. The css properties are auto prefixed for the browsers when needed.
     * @property defaults.behavior
     * @type {Object}
     */
    behavior: {
        /**
         * Disables text selection to improve the dragging gesture. When the value is `none` it also sets
         * `onselectstart=false` for IE on the element. Mainly for desktop browsers.
         * @property defaults.behavior.userSelect
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Specifies whether and how a given region can be manipulated by the user (for instance, by panning or zooming).
         * Used by Chrome 35> and IE10>. By default this makes the element blocking any touch event.
         * @property defaults.behavior.touchAction
         * @type {String}
         * @default: 'pan-y'
         */
        touchAction: 'pan-y',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @property defaults.behavior.touchCallout
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @property defaults.behavior.contentZooming
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents.
         * Mainly for desktop browsers.
         * @property defaults.behavior.userDrag
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in Safari on iPhone. This property obeys the alpha value, if specified.
         *
         * If you don't specify an alpha value, Safari on iPhone applies a default alpha value
         * to the color. To disable tap highlighting, set the alpha value to 0 (invisible).
         * If you set the alpha value to 1.0 (opaque), the element is not visible when tapped.
         * @property defaults.behavior.tapHighlightColor
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

/**
 * hammer document where the base events are added at
 * @property DOCUMENT
 * @type {HTMLElement}
 * @default window.document
 */
Hammer.DOCUMENT = document;

/**
 * detect support for pointer events
 * @property HAS_POINTEREVENTS
 * @type {Boolean}
 */
Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;

/**
 * detect support for touch events
 * @property HAS_TOUCHEVENTS
 * @type {Boolean}
 */
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

/**
 * detect mobile browsers
 * @property IS_MOBILE
 * @type {Boolean}
 */
Hammer.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);

/**
 * detect if we want to support mouseevents at all
 * @property NO_MOUSEEVENTS
 * @type {Boolean}
 */
Hammer.NO_MOUSEEVENTS = (Hammer.HAS_TOUCHEVENTS && Hammer.IS_MOBILE) || Hammer.HAS_POINTEREVENTS;

/**
 * interval in which Hammer recalculates current velocity/direction/angle in ms
 * @property CALCULATE_INTERVAL
 * @type {Number}
 * @default 25
 */
Hammer.CALCULATE_INTERVAL = 25;

/**
 * eventtypes per touchevent (start, move, end) are filled by `Event.determineEventTypes` on `setup`
 * the object contains the DOM event names per type (`EVENT_START`, `EVENT_MOVE`, `EVENT_END`)
 * @property EVENT_TYPES
 * @private
 * @writeOnce
 * @type {Object}
 */
var EVENT_TYPES = {};

/**
 * direction strings, for safe comparisons
 * @property DIRECTION_DOWN|LEFT|UP|RIGHT
 * @final
 * @type {String}
 * @default 'down' 'left' 'up' 'right'
 */
var DIRECTION_DOWN = Hammer.DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = Hammer.DIRECTION_LEFT = 'left';
var DIRECTION_UP = Hammer.DIRECTION_UP = 'up';
var DIRECTION_RIGHT = Hammer.DIRECTION_RIGHT = 'right';

/**
 * pointertype strings, for safe comparisons
 * @property POINTER_MOUSE|TOUCH|PEN
 * @final
 * @type {String}
 * @default 'mouse' 'touch' 'pen'
 */
var POINTER_MOUSE = Hammer.POINTER_MOUSE = 'mouse';
var POINTER_TOUCH = Hammer.POINTER_TOUCH = 'touch';
var POINTER_PEN = Hammer.POINTER_PEN = 'pen';

/**
 * eventtypes
 * @property EVENT_START|MOVE|END|RELEASE|TOUCH
 * @final
 * @type {String}
 * @default 'start' 'change' 'move' 'end' 'release' 'touch'
 */
var EVENT_START = Hammer.EVENT_START = 'start';
var EVENT_MOVE = Hammer.EVENT_MOVE = 'move';
var EVENT_END = Hammer.EVENT_END = 'end';
var EVENT_RELEASE = Hammer.EVENT_RELEASE = 'release';
var EVENT_TOUCH = Hammer.EVENT_TOUCH = 'touch';

/**
 * if the window events are set...
 * @property READY
 * @writeOnce
 * @type {Boolean}
 * @default false
 */
Hammer.READY = false;

/**
 * plugins namespace
 * @property plugins
 * @type {Object}
 */
Hammer.plugins = Hammer.plugins || {};

/**
 * gestures namespace
 * see `/gestures` for the definitions
 * @property gestures
 * @type {Object}
 */
Hammer.gestures = Hammer.gestures || {};

/**
 * setup events to detect gestures on the document
 * this function is called when creating an new instance
 * @private
 */
function setup() {
    if(Hammer.READY) {
        return;
    }

    // find what eventtypes we add listeners to
    Event.determineEventTypes();

    // Register all gestures inside Hammer.gestures
    Utils.each(Hammer.gestures, function(gesture) {
        Detection.register(gesture);
    });

    // Add touch events on the document
    Event.onTouch(Hammer.DOCUMENT, EVENT_MOVE, Detection.detect);
    Event.onTouch(Hammer.DOCUMENT, EVENT_END, Detection.detect);

    // Hammer is ready...!
    Hammer.READY = true;
}

/**
 * @module hammer
 *
 * @class Utils
 * @static
 */
var Utils = Hammer.utils = {
    /**
     * extend method, could also be used for cloning when `dest` is an empty object.
     * changes the dest object
     * @method extend
     * @param {Object} dest
     * @param {Object} src
     * @param {Boolean} [merge=false]  do a merge
     * @return {Object} dest
     */
    extend: function extend(dest, src, merge) {
        for(var key in src) {
            if(!src.hasOwnProperty(key) || (dest[key] !== undefined && merge)) {
                continue;
            }
            dest[key] = src[key];
        }
        return dest;
    },

    /**
     * simple addEventListener wrapper
     * @method on
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     */
    on: function on(element, type, handler) {
        element.addEventListener(type, handler, false);
    },

    /**
     * simple removeEventListener wrapper
     * @method off
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     */
    off: function off(element, type, handler) {
        element.removeEventListener(type, handler, false);
    },

    /**
     * forEach over arrays and objects
     * @method each
     * @param {Object|Array} obj
     * @param {Function} iterator
     * @param {any} iterator.item
     * @param {Number} iterator.index
     * @param {Object|Array} iterator.obj the source object
     * @param {Object} context value to use as `this` in the iterator
     */
    each: function each(obj, iterator, context) {
        var i, len;

        // native forEach on arrays
        if('forEach' in obj) {
            obj.forEach(iterator, context);
        // arrays
        } else if(obj.length !== undefined) {
            for(i = 0, len = obj.length; i < len; i++) {
                if(iterator.call(context, obj[i], i, obj) === false) {
                    return;
                }
            }
        // objects
        } else {
            for(i in obj) {
                if(obj.hasOwnProperty(i) &&
                    iterator.call(context, obj[i], i, obj) === false) {
                    return;
                }
            }
        }
    },

    /**
     * find if a string contains the string using indexOf
     * @method inStr
     * @param {String} src
     * @param {String} find
     * @return {Boolean} found
     */
    inStr: function inStr(src, find) {
        return src.indexOf(find) > -1;
    },

    /**
     * find if a array contains the object using indexOf or a simple polyfill
     * @method inArray
     * @param {String} src
     * @param {String} find
     * @return {Boolean|Number} false when not found, or the index
     */
    inArray: function inArray(src, find) {
        if(src.indexOf) {
            var index = src.indexOf(find);
            return (index === -1) ? false : index;
        } else {
            for(var i = 0, len = src.length; i < len; i++) {
                if(src[i] === find) {
                    return i;
                }
            }
            return false;
        }
    },

    /**
     * convert an array-like object (`arguments`, `touchlist`) to an array
     * @method toArray
     * @param {Object} obj
     * @return {Array}
     */
    toArray: function toArray(obj) {
        return Array.prototype.slice.call(obj, 0);
    },

    /**
     * find if a node is in the given parent
     * @method hasParent
     * @param {HTMLElement} node
     * @param {HTMLElement} parent
     * @return {Boolean} found
     */
    hasParent: function hasParent(node, parent) {
        while(node) {
            if(node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },

    /**
     * get the center of all the touches
     * @method getCenter
     * @param {Array} touches
     * @return {Object} center contains `pageX`, `pageY`, `clientX` and `clientY` properties
     */
    getCenter: function getCenter(touches) {
        var pageX = [],
            pageY = [],
            clientX = [],
            clientY = [],
            min = Math.min,
            max = Math.max;

        // no need to loop when only one touch
        if(touches.length === 1) {
            return {
                pageX: touches[0].pageX,
                pageY: touches[0].pageY,
                clientX: touches[0].clientX,
                clientY: touches[0].clientY
            };
        }

        Utils.each(touches, function(touch) {
            pageX.push(touch.pageX);
            pageY.push(touch.pageY);
            clientX.push(touch.clientX);
            clientY.push(touch.clientY);
        });

        return {
            pageX: (min.apply(Math, pageX) + max.apply(Math, pageX)) / 2,
            pageY: (min.apply(Math, pageY) + max.apply(Math, pageY)) / 2,
            clientX: (min.apply(Math, clientX) + max.apply(Math, clientX)) / 2,
            clientY: (min.apply(Math, clientY) + max.apply(Math, clientY)) / 2
        };
    },

    /**
     * calculate the velocity between two points. unit is in px per ms.
     * @method getVelocity
     * @param {Number} deltaTime
     * @param {Number} deltaX
     * @param {Number} deltaY
     * @return {Object} velocity `x` and `y`
     */
    getVelocity: function getVelocity(deltaTime, deltaX, deltaY) {
        return {
            x: Math.abs(deltaX / deltaTime) || 0,
            y: Math.abs(deltaY / deltaTime) || 0
        };
    },

    /**
     * calculate the angle between two coordinates
     * @method getAngle
     * @param {Touch} touch1
     * @param {Touch} touch2
     * @return {Number} angle
     */
    getAngle: function getAngle(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX,
            y = touch2.clientY - touch1.clientY;

        return Math.atan2(y, x) * 180 / Math.PI;
    },

    /**
     * do a small comparision to get the direction between two touches.
     * @method getDirection
     * @param {Touch} touch1
     * @param {Touch} touch2
     * @return {String} direction matches `DIRECTION_LEFT|RIGHT|UP|DOWN`
     */
    getDirection: function getDirection(touch1, touch2) {
        var x = Math.abs(touch1.clientX - touch2.clientX),
            y = Math.abs(touch1.clientY - touch2.clientY);

        if(x >= y) {
            return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
        return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
    },

    /**
     * calculate the distance between two touches
     * @method getDistance
     * @param {Touch}touch1
     * @param {Touch} touch2
     * @return {Number} distance
     */
    getDistance: function getDistance(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX,
            y = touch2.clientY - touch1.clientY;

        return Math.sqrt((x * x) + (y * y));
    },

    /**
     * calculate the scale factor between two touchLists
     * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
     * @method getScale
     * @param {Array} start array of touches
     * @param {Array} end array of touches
     * @return {Number} scale
     */
    getScale: function getScale(start, end) {
        // need two fingers...
        if(start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
        }
        return 1;
    },

    /**
     * calculate the rotation degrees between two touchLists
     * @method getRotation
     * @param {Array} start array of touches
     * @param {Array} end array of touches
     * @return {Number} rotation
     */
    getRotation: function getRotation(start, end) {
        // need two fingers
        if(start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
        }
        return 0;
    },

    /**
     * find out if the direction is vertical   *
     * @method isVertical
     * @param {String} direction matches `DIRECTION_UP|DOWN`
     * @return {Boolean} is_vertical
     */
    isVertical: function isVertical(direction) {
        return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
    },

    /**
     * set css properties with their prefixes
     * @param {HTMLElement} element
     * @param {String} prop
     * @param {String} value
     * @param {Boolean} [toggle=true]
     * @return {Boolean}
     */
    setPrefixedCss: function setPrefixedCss(element, prop, value, toggle) {
        var prefixes = ['', 'Webkit', 'Moz', 'O', 'ms'];
        prop = Utils.toCamelCase(prop);

        for(var i = 0; i < prefixes.length; i++) {
            var p = prop;
            // prefixes
            if(prefixes[i]) {
                p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
            }

            // test the style
            if(p in element.style) {
                element.style[p] = (toggle == null || toggle) && value || '';
                break;
            }
        }
    },

    /**
     * toggle browser default behavior by setting css properties.
     * `userSelect='none'` also sets `element.onselectstart` to false
     * `userDrag='none'` also sets `element.ondragstart` to false
     *
     * @method toggleBehavior
     * @param {HtmlElement} element
     * @param {Object} props
     * @param {Boolean} [toggle=true]
     */
    toggleBehavior: function toggleBehavior(element, props, toggle) {
        if(!props || !element || !element.style) {
            return;
        }

        // set the css properties
        Utils.each(props, function(value, prop) {
            Utils.setPrefixedCss(element, prop, value, toggle);
        });

        var falseFn = toggle && function() {
            return false;
        };

        // also the disable onselectstart
        if(props.userSelect == 'none') {
            element.onselectstart = falseFn;
        }
        // and disable ondragstart
        if(props.userDrag == 'none') {
            element.ondragstart = falseFn;
        }
    },

    /**
     * convert a string with underscores to camelCase
     * so prevent_default becomes preventDefault
     * @param {String} str
     * @return {String} camelCaseStr
     */
    toCamelCase: function toCamelCase(str) {
        return str.replace(/[_-]([a-z])/g, function(s) {
            return s[1].toUpperCase();
        });
    }
};


/**
 * @module hammer
 */
/**
 * @class Event
 * @static
 */
var Event = Hammer.event = {
    /**
     * when touch events have been fired, this is true
     * this is used to stop mouse events
     * @property prevent_mouseevents
     * @private
     * @type {Boolean}
     */
    preventMouseEvents: false,

    /**
     * if EVENT_START has been fired
     * @property started
     * @private
     * @type {Boolean}
     */
    started: false,

    /**
     * when the mouse is hold down, this is true
     * @property should_detect
     * @private
     * @type {Boolean}
     */
    shouldDetect: false,

    /**
     * simple event binder with a hook and support for multiple types
     * @method on
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     * @param {Function} [hook]
     * @param {Object} hook.type
     */
    on: function on(element, type, handler, hook) {
        var types = type.split(' ');
        Utils.each(types, function(type) {
            Utils.on(element, type, handler);
            hook && hook(type);
        });
    },

    /**
     * simple event unbinder with a hook and support for multiple types
     * @method off
     * @param {HTMLElement} element
     * @param {String} type
     * @param {Function} handler
     * @param {Function} [hook]
     * @param {Object} hook.type
     */
    off: function off(element, type, handler, hook) {
        var types = type.split(' ');
        Utils.each(types, function(type) {
            Utils.off(element, type, handler);
            hook && hook(type);
        });
    },

    /**
     * the core touch event handler.
     * this finds out if we should to detect gestures
     * @method onTouch
     * @param {HTMLElement} element
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Function} handler
     * @return onTouchHandler {Function} the core event handler
     */
    onTouch: function onTouch(element, eventType, handler) {
        var self = this;

        var onTouchHandler = function onTouchHandler(ev) {
            var srcType = ev.type.toLowerCase(),
                isPointer = Hammer.HAS_POINTEREVENTS,
                isMouse = Utils.inStr(srcType, 'mouse'),
                triggerType;

            // if we are in a mouseevent, but there has been a touchevent triggered in this session
            // we want to do nothing. simply break out of the event.
            if(isMouse && self.preventMouseEvents) {
                return;

            // mousebutton must be down
            } else if(isMouse && eventType == EVENT_START && ev.button === 0) {
                self.preventMouseEvents = false;
                self.shouldDetect = true;
            } else if(isPointer && eventType == EVENT_START) {
                self.shouldDetect = (ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev));
            // just a valid start event, but no mouse
            } else if(!isMouse && eventType == EVENT_START) {
                self.preventMouseEvents = true;
                self.shouldDetect = true;
            }

            // update the pointer event before entering the detection
            if(isPointer && eventType != EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }

            // we are in a touch/down state, so allowed detection of gestures
            if(self.shouldDetect) {
                triggerType = self.doDetect.call(self, ev, eventType, element, handler);
            }

            // ...and we are done with the detection
            // so reset everything to start each detection totally fresh
            if(triggerType == EVENT_END) {
                self.preventMouseEvents = false;
                self.shouldDetect = false;
                PointerEvent.reset();
            // update the pointerevent object after the detection
            }

            if(isPointer && eventType == EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }
        };

        this.on(element, EVENT_TYPES[eventType], onTouchHandler);
        return onTouchHandler;
    },

    /**
     * the core detection method
     * this finds out what hammer-touch-events to trigger
     * @method doDetect
     * @param {Object} ev
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {HTMLElement} element
     * @param {Function} handler
     * @return {String} triggerType matches `EVENT_START|MOVE|END`
     */
    doDetect: function doDetect(ev, eventType, element, handler) {
        var touchList = this.getTouchList(ev, eventType);
        var touchListLength = touchList.length;
        var triggerType = eventType;
        var triggerChange = touchList.trigger; // used by fakeMultitouch plugin
        var changedLength = touchListLength;

        // at each touchstart-like event we want also want to trigger a TOUCH event...
        if(eventType == EVENT_START) {
            triggerChange = EVENT_TOUCH;
        // ...the same for a touchend-like event
        } else if(eventType == EVENT_END) {
            triggerChange = EVENT_RELEASE;

            // keep track of how many touches have been removed
            changedLength = touchList.length - ((ev.changedTouches) ? ev.changedTouches.length : 1);
        }

        // after there are still touches on the screen,
        // we just want to trigger a MOVE event. so change the START or END to a MOVE
        // but only after detection has been started, the first time we actualy want a START
        if(changedLength > 0 && this.started) {
            triggerType = EVENT_MOVE;
        }

        // detection has been started, we keep track of this, see above
        this.started = true;

        // generate some event data, some basic information
        var evData = this.collectEventData(element, triggerType, touchList, ev);

        // trigger the triggerType event before the change (TOUCH, RELEASE) events
        // but the END event should be at last
        if(eventType != EVENT_END) {
            handler.call(Detection, evData);
        }

        // trigger a change (TOUCH, RELEASE) event, this means the length of the touches changed
        if(triggerChange) {
            evData.changedLength = changedLength;
            evData.eventType = triggerChange;

            handler.call(Detection, evData);

            evData.eventType = triggerType;
            delete evData.changedLength;
        }

        // trigger the END event
        if(triggerType == EVENT_END) {
            handler.call(Detection, evData);

            // ...and we are done with the detection
            // so reset everything to start each detection totally fresh
            this.started = false;
        }

        return triggerType;
    },

    /**
     * we have different events for each device/browser
     * determine what we need and set them in the EVENT_TYPES constant
     * the `onTouch` method is bind to these properties.
     * @method determineEventTypes
     * @return {Object} events
     */
    determineEventTypes: function determineEventTypes() {
        var types;
        if(Hammer.HAS_POINTEREVENTS) {
            if(window.PointerEvent) {
                types = [
                    'pointerdown',
                    'pointermove',
                    'pointerup pointercancel lostpointercapture'
                ];
            } else {
                types = [
                    'MSPointerDown',
                    'MSPointerMove',
                    'MSPointerUp MSPointerCancel MSLostPointerCapture'
                ];
            }
        } else if(Hammer.NO_MOUSEEVENTS) {
            types = [
                'touchstart',
                'touchmove',
                'touchend touchcancel'
            ];
        } else {
            types = [
                'touchstart mousedown',
                'touchmove mousemove',
                'touchend touchcancel mouseup'
            ];
        }

        EVENT_TYPES[EVENT_START] = types[0];
        EVENT_TYPES[EVENT_MOVE] = types[1];
        EVENT_TYPES[EVENT_END] = types[2];
        return EVENT_TYPES;
    },

    /**
     * create touchList depending on the event
     * @method getTouchList
     * @param {Object} ev
     * @param {String} eventType
     * @return {Array} touches
     */
    getTouchList: function getTouchList(ev, eventType) {
        // get the fake pointerEvent touchlist
        if(Hammer.HAS_POINTEREVENTS) {
            return PointerEvent.getTouchList();
        }

        // get the touchlist
        if(ev.touches) {
            if(eventType == EVENT_MOVE) {
                return ev.touches;
            }

            var identifiers = [];
            var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
            var touchList = [];

            Utils.each(concat, function(touch) {
                if(Utils.inArray(identifiers, touch.identifier) === false) {
                    touchList.push(touch);
                }
                identifiers.push(touch.identifier);
            });

            return touchList;
        }

        // make fake touchList from mouse position
        ev.identifier = 1;
        return [ev];
    },

    /**
     * collect basic event data
     * @method collectEventData
     * @param {HTMLElement} element
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Array} touches
     * @param {Object} ev
     * @return {Object} ev
     */
    collectEventData: function collectEventData(element, eventType, touches, ev) {
        // find out pointerType
        var pointerType = POINTER_TOUCH;
        if(Utils.inStr(ev.type, 'mouse') || PointerEvent.matchType(POINTER_MOUSE, ev)) {
            pointerType = POINTER_MOUSE;
        } else if(PointerEvent.matchType(POINTER_PEN, ev)) {
            pointerType = POINTER_PEN;
        }

        return {
            center: Utils.getCenter(touches),
            timeStamp: Date.now(),
            target: ev.target,
            touches: touches,
            eventType: eventType,
            pointerType: pointerType,
            srcEvent: ev,

            /**
             * prevent the browser default actions
             * mostly used to disable scrolling of the browser
             */
            preventDefault: function() {
                var srcEvent = this.srcEvent;
                srcEvent.preventManipulation && srcEvent.preventManipulation();
                srcEvent.preventDefault && srcEvent.preventDefault();
            },

            /**
             * stop bubbling the event up to its parents
             */
            stopPropagation: function() {
                this.srcEvent.stopPropagation();
            },

            /**
             * immediately stop gesture detection
             * might be useful after a swipe was detected
             * @return {*}
             */
            stopDetect: function() {
                return Detection.stopDetect();
            }
        };
    }
};


/**
 * @module hammer
 *
 * @class PointerEvent
 * @static
 */
var PointerEvent = Hammer.PointerEvent = {
    /**
     * holds all pointers, by `identifier`
     * @property pointers
     * @type {Object}
     */
    pointers: {},

    /**
     * get the pointers as an array
     * @method getTouchList
     * @return {Array} touchlist
     */
    getTouchList: function getTouchList() {
        var touchlist = [];
        // we can use forEach since pointerEvents only is in IE10
        Utils.each(this.pointers, function(pointer) {
            touchlist.push(pointer);
        });

        return touchlist;
    },

    /**
     * update the position of a pointer
     * @method updatePointer
     * @param {String} eventType matches `EVENT_START|MOVE|END`
     * @param {Object} pointerEvent
     */
    updatePointer: function updatePointer(eventType, pointerEvent) {
        if(eventType == EVENT_END) {
            delete this.pointers[pointerEvent.pointerId];
        } else {
            pointerEvent.identifier = pointerEvent.pointerId;
            this.pointers[pointerEvent.pointerId] = pointerEvent;
        }
    },

    /**
     * check if ev matches pointertype
     * @method matchType
     * @param {String} pointerType matches `POINTER_MOUSE|TOUCH|PEN`
     * @param {PointerEvent} ev
     */
    matchType: function matchType(pointerType, ev) {
        if(!ev.pointerType) {
            return false;
        }

        var pt = ev.pointerType,
            types = {};

        types[POINTER_MOUSE] = (pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE));
        types[POINTER_TOUCH] = (pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH));
        types[POINTER_PEN] = (pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN));
        return types[pointerType];
    },

    /**
     * reset the stored pointers
     * @method reset
     */
    reset: function resetList() {
        this.pointers = {};
    }
};


/**
 * @module hammer
 *
 * @class Detection
 * @static
 */
var Detection = Hammer.detection = {
    // contains all registred Hammer.gestures in the correct order
    gestures: [],

    // data of the current Hammer.gesture detection session
    current: null,

    // the previous Hammer.gesture session data
    // is a full clone of the previous gesture.current object
    previous: null,

    // when this becomes true, no gestures are fired
    stopped: false,

    /**
     * start Hammer.gesture detection
     * @method startDetect
     * @param {Hammer.Instance} inst
     * @param {Object} eventData
     */
    startDetect: function startDetect(inst, eventData) {
        // already busy with a Hammer.gesture detection on an element
        if(this.current) {
            return;
        }

        this.stopped = false;

        // holds current session
        this.current = {
            inst: inst, // reference to HammerInstance we're working for
            startEvent: Utils.extend({}, eventData), // start eventData for distances, timing etc
            lastEvent: false, // last eventData
            lastCalcEvent: false, // last eventData for calculations.
            futureCalcEvent: false, // last eventData for calculations.
            lastCalcData: {}, // last lastCalcData
            name: '' // current gesture we're in/detected, can be 'tap', 'hold' etc
        };

        this.detect(eventData);
    },

    /**
     * Hammer.gesture detection
     * @method detect
     * @param {Object} eventData
     * @return {any}
     */
    detect: function detect(eventData) {
        if(!this.current || this.stopped) {
            return;
        }

        // extend event data with calculations about scale, distance etc
        eventData = this.extendEventData(eventData);

        // hammer instance and instance options
        var inst = this.current.inst,
            instOptions = inst.options;

        // call Hammer.gesture handlers
        Utils.each(this.gestures, function triggerGesture(gesture) {
            // only when the instance options have enabled this gesture
            if(!this.stopped && inst.enabled && instOptions[gesture.name]) {
                gesture.handler.call(gesture, eventData, inst);
            }
        }, this);

        // store as previous event event
        if(this.current) {
            this.current.lastEvent = eventData;
        }

        if(eventData.eventType == EVENT_END) {
            this.stopDetect();
        }

        return eventData;
    },

    /**
     * clear the Hammer.gesture vars
     * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
     * to stop other Hammer.gestures from being fired
     * @method stopDetect
     */
    stopDetect: function stopDetect() {
        // clone current data to the store as the previous gesture
        // used for the double tap gesture, since this is an other gesture detect session
        this.previous = Utils.extend({}, this.current);

        // reset the current
        this.current = null;
        this.stopped = true;
    },

    /**
     * calculate velocity, angle and direction
     * @method getVelocityData
     * @param {Object} ev
     * @param {Object} center
     * @param {Number} deltaTime
     * @param {Number} deltaX
     * @param {Number} deltaY
     */
    getCalculatedData: function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
        var cur = this.current,
            recalc = false,
            calcEv = cur.lastCalcEvent,
            calcData = cur.lastCalcData;

        if(calcEv && ev.timeStamp - calcEv.timeStamp > Hammer.CALCULATE_INTERVAL) {
            center = calcEv.center;
            deltaTime = ev.timeStamp - calcEv.timeStamp;
            deltaX = ev.center.clientX - calcEv.center.clientX;
            deltaY = ev.center.clientY - calcEv.center.clientY;
            recalc = true;
        }

        if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            cur.futureCalcEvent = ev;
        }

        if(!cur.lastCalcEvent || recalc) {
            calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
            calcData.angle = Utils.getAngle(center, ev.center);
            calcData.direction = Utils.getDirection(center, ev.center);

            cur.lastCalcEvent = cur.futureCalcEvent || ev;
            cur.futureCalcEvent = ev;
        }

        ev.velocityX = calcData.velocity.x;
        ev.velocityY = calcData.velocity.y;
        ev.interimAngle = calcData.angle;
        ev.interimDirection = calcData.direction;
    },

    /**
     * extend eventData for Hammer.gestures
     * @method extendEventData
     * @param {Object} ev
     * @return {Object} ev
     */
    extendEventData: function extendEventData(ev) {
        var cur = this.current,
            startEv = cur.startEvent,
            lastEv = cur.lastEvent || startEv;

        // update the start touchlist to calculate the scale/rotation
        if(ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            startEv.touches = [];
            Utils.each(ev.touches, function(touch) {
                startEv.touches.push({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            });
        }

        var deltaTime = ev.timeStamp - startEv.timeStamp,
            deltaX = ev.center.clientX - startEv.center.clientX,
            deltaY = ev.center.clientY - startEv.center.clientY;

        this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);

        Utils.extend(ev, {
            startEvent: startEv,

            deltaTime: deltaTime,
            deltaX: deltaX,
            deltaY: deltaY,

            distance: Utils.getDistance(startEv.center, ev.center),
            angle: Utils.getAngle(startEv.center, ev.center),
            direction: Utils.getDirection(startEv.center, ev.center),
            scale: Utils.getScale(startEv.touches, ev.touches),
            rotation: Utils.getRotation(startEv.touches, ev.touches)
        });

        return ev;
    },

    /**
     * register new gesture
     * @method register
     * @param {Object} gesture object, see `gestures/` for documentation
     * @return {Array} gestures
     */
    register: function register(gesture) {
        // add an enable gesture options if there is no given
        var options = gesture.defaults || {};
        if(options[gesture.name] === undefined) {
            options[gesture.name] = true;
        }

        // extend Hammer default options with the Hammer.gesture options
        Utils.extend(Hammer.defaults, options, true);

        // set its index
        gesture.index = gesture.index || 1000;

        // add Hammer.gesture to the list
        this.gestures.push(gesture);

        // sort the list by index
        this.gestures.sort(function(a, b) {
            if(a.index < b.index) {
                return -1;
            }
            if(a.index > b.index) {
                return 1;
            }
            return 0;
        });

        return this.gestures;
    }
};


/**
 * @module hammer
 */

/**
 * create new hammer instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} element
 * @param {Object} [options={}] options are merged with `Hammer.defaults`
 * @return {Hammer.Instance}
 */
Hammer.Instance = function(element, options) {
    var self = this;

    // setup HammerJS window events and register all gestures
    // this also sets up the default options
    setup();

    /**
     * @property element
     * @type {HTMLElement}
     */
    this.element = element;

    /**
     * @property enabled
     * @type {Boolean}
     * @protected
     */
    this.enabled = true;

    /**
     * options, merged with the defaults
     * options with an _ are converted to camelCase
     * @property options
     * @type {Object}
     */
    Utils.each(options, function(value, name) {
        delete options[name];
        options[Utils.toCamelCase(name)] = value;
    });

    this.options = Utils.extend(Utils.extend({}, Hammer.defaults), options || {});

    // add some css to the element to prevent the browser from doing its native behavoir
    if(this.options.behavior) {
        Utils.toggleBehavior(this.element, this.options.behavior, true);
    }

    /**
     * event start handler on the element to start the detection
     * @property eventStartHandler
     * @type {Object}
     */
    this.eventStartHandler = Event.onTouch(element, EVENT_START, function(ev) {
        if(self.enabled && ev.eventType == EVENT_START) {
            Detection.startDetect(self, ev);
        } else if(ev.eventType == EVENT_TOUCH) {
            Detection.detect(ev);
        }
    });

    /**
     * keep a list of user event handlers which needs to be removed when calling 'dispose'
     * @property eventHandlers
     * @type {Array}
     */
    this.eventHandlers = [];
};

Hammer.Instance.prototype = {
    /**
     * bind events to the instance
     * @method on
     * @chainable
     * @param {String} gestures multiple gestures by splitting with a space
     * @param {Function} handler
     * @param {Object} handler.ev event object
     */
    on: function onEvent(gestures, handler) {
        var self = this;
        Event.on(self.element, gestures, handler, function(type) {
            self.eventHandlers.push({ gesture: type, handler: handler });
        });
        return self;
    },

    /**
     * unbind events to the instance
     * @method off
     * @chainable
     * @param {String} gestures
     * @param {Function} handler
     */
    off: function offEvent(gestures, handler) {
        var self = this;

        Event.off(self.element, gestures, handler, function(type) {
            var index = Utils.inArray({ gesture: type, handler: handler });
            if(index !== false) {
                self.eventHandlers.splice(index, 1);
            }
        });
        return self;
    },

    /**
     * trigger gesture event
     * @method trigger
     * @chainable
     * @param {String} gesture
     * @param {Object} [eventData]
     */
    trigger: function triggerEvent(gesture, eventData) {
        // optional
        if(!eventData) {
            eventData = {};
        }

        // create DOM event
        var event = Hammer.DOCUMENT.createEvent('Event');
        event.initEvent(gesture, true, true);
        event.gesture = eventData;

        // trigger on the target if it is in the instance element,
        // this is for event delegation tricks
        var element = this.element;
        if(Utils.hasParent(eventData.target, element)) {
            element = eventData.target;
        }

        element.dispatchEvent(event);
        return this;
    },

    /**
     * enable of disable hammer.js detection
     * @method enable
     * @chainable
     * @param {Boolean} state
     */
    enable: function enable(state) {
        this.enabled = state;
        return this;
    },

    /**
     * dispose this hammer instance
     * @method dispose
     * @return {Null}
     */
    dispose: function dispose() {
        var i, eh;

        // undo all changes made by stop_browser_behavior
        Utils.toggleBehavior(this.element, this.options.behavior, false);

        // unbind all custom event handlers
        for(i = -1; (eh = this.eventHandlers[++i]);) {
            Utils.off(this.element, eh.gesture, eh.handler);
        }

        this.eventHandlers = [];

        // unbind the start event listener
        Event.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);

        return null;
    }
};


/**
 * @module gestures
 */
/**
 * Move with x fingers (default 1) around on the page.
 * Preventing the default browser behavior is a good way to improve feel and working.
 * ````
 *  hammertime.on("drag", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Drag
 * @static
 */
/**
 * @event drag
 * @param {Object} ev
 */
/**
 * @event dragstart
 * @param {Object} ev
 */
/**
 * @event dragend
 * @param {Object} ev
 */
/**
 * @event drapleft
 * @param {Object} ev
 */
/**
 * @event dragright
 * @param {Object} ev
 */
/**
 * @event dragup
 * @param {Object} ev
 */
/**
 * @event dragdown
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var triggered = false;

    function dragGesture(ev, inst) {
        var cur = Detection.current;

        // max touches
        if(inst.options.dragMaxTouches > 0 &&
            ev.touches.length > inst.options.dragMaxTouches) {
            return;
        }

        switch(ev.eventType) {
            case EVENT_START:
                triggered = false;
                break;

            case EVENT_MOVE:
                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(ev.distance < inst.options.dragMinDistance &&
                    cur.name != name) {
                    return;
                }

                var startCenter = cur.startEvent.center;

                // we are dragging!
                if(cur.name != name) {
                    cur.name = name;
                    if(inst.options.dragDistanceCorrection && ev.distance > 0) {
                        // When a drag is triggered, set the event center to dragMinDistance pixels from the original event center.
                        // Without this correction, the dragged distance would jumpstart at dragMinDistance pixels instead of at 0.
                        // It might be useful to save the original start point somewhere
                        var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
                        startCenter.pageX += ev.deltaX * factor;
                        startCenter.pageY += ev.deltaY * factor;
                        startCenter.clientX += ev.deltaX * factor;
                        startCenter.clientY += ev.deltaY * factor;

                        // recalculate event data using new start point
                        ev = Detection.extendEventData(ev);
                    }
                }

                // lock drag to axis?
                if(cur.lastEvent.dragLockToAxis ||
                    ( inst.options.dragLockToAxis &&
                        inst.options.dragLockMinDistance <= ev.distance
                        )) {
                    ev.dragLockToAxis = true;
                }

                // keep direction on the axis that the drag gesture started on
                var lastDirection = cur.lastEvent.direction;
                if(ev.dragLockToAxis && lastDirection !== ev.direction) {
                    if(Utils.isVertical(lastDirection)) {
                        ev.direction = (ev.deltaY < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                    } else {
                        ev.direction = (ev.deltaX < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                    }
                }

                // first time, trigger dragstart event
                if(!triggered) {
                    inst.trigger(name + 'start', ev);
                    triggered = true;
                }

                // trigger events
                inst.trigger(name, ev);
                inst.trigger(name + ev.direction, ev);

                var isVertical = Utils.isVertical(ev.direction);

                // block the browser events
                if((inst.options.dragBlockVertical && isVertical) ||
                    (inst.options.dragBlockHorizontal && !isVertical)) {
                    ev.preventDefault();
                }
                break;

            case EVENT_RELEASE:
                if(triggered && ev.changedLength <= inst.options.dragMaxTouches) {
                    inst.trigger(name + 'end', ev);
                    triggered = false;
                }
                break;

            case EVENT_END:
                triggered = false;
                break;
        }
    }

    Hammer.gestures.Drag = {
        name: name,
        index: 50,
        handler: dragGesture,
        defaults: {
            /**
             * minimal movement that have to be made before the drag event gets triggered
             * @property dragMinDistance
             * @type {Number}
             * @default 10
             */
            dragMinDistance: 10,

            /**
             * Set dragDistanceCorrection to true to make the starting point of the drag
             * be calculated from where the drag was triggered, not from where the touch started.
             * Useful to avoid a jerk-starting drag, which can make fine-adjustments
             * through dragging difficult, and be visually unappealing.
             * @property dragDistanceCorrection
             * @type {Boolean}
             * @default true
             */
            dragDistanceCorrection: true,

            /**
             * set 0 for unlimited, but this can conflict with transform
             * @property dragMaxTouches
             * @type {Number}
             * @default 1
             */
            dragMaxTouches: 1,

            /**
             * prevent default browser behavior when dragging occurs
             * be careful with it, it makes the element a blocking element
             * when you are using the drag gesture, it is a good practice to set this true
             * @property dragBlockHorizontal
             * @type {Boolean}
             * @default false
             */
            dragBlockHorizontal: false,

            /**
             * same as `dragBlockHorizontal`, but for vertical movement
             * @property dragBlockVertical
             * @type {Boolean}
             * @default false
             */
            dragBlockVertical: false,

            /**
             * dragLockToAxis keeps the drag gesture on the axis that it started on,
             * It disallows vertical directions if the initial direction was horizontal, and vice versa.
             * @property dragLockToAxis
             * @type {Boolean}
             * @default false
             */
            dragLockToAxis: false,

            /**
             * drag lock only kicks in when distance > dragLockMinDistance
             * This way, locking occurs only when the distance has become large enough to reliably determine the direction
             * @property dragLockMinDistance
             * @type {Number}
             * @default 25
             */
            dragLockMinDistance: 25
        }
    };
})('drag');

/**
 * @module gestures
 */
/**
 * trigger a simple gesture event, so you can do anything in your handler.
 * only usable if you know what your doing...
 *
 * @class Gesture
 * @static
 */
/**
 * @event gesture
 * @param {Object} ev
 */
Hammer.gestures.Gesture = {
    name: 'gesture',
    index: 1337,
    handler: function releaseGesture(ev, inst) {
        inst.trigger(this.name, ev);
    }
};

/**
 * @module gestures
 */
/**
 * Touch stays at the same place for x time
 *
 * @class Hold
 * @static
 */
/**
 * @event hold
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var timer;

    function holdGesture(ev, inst) {
        var options = inst.options,
            current = Detection.current;

        switch(ev.eventType) {
            case EVENT_START:
                clearTimeout(timer);

                // set the gesture so we can check in the timeout if it still is
                current.name = name;

                // set timer and if after the timeout it still is hold,
                // we trigger the hold event
                timer = setTimeout(function() {
                    if(current && current.name == name) {
                        inst.trigger(name, ev);
                    }
                }, options.holdTimeout);
                break;

            case EVENT_MOVE:
                if(ev.distance > options.holdThreshold) {
                    clearTimeout(timer);
                }
                break;

            case EVENT_RELEASE:
                clearTimeout(timer);
                break;
        }
    }

    Hammer.gestures.Hold = {
        name: name,
        index: 10,
        defaults: {
            /**
             * @property holdTimeout
             * @type {Number}
             * @default 500
             */
            holdTimeout: 500,

            /**
             * movement allowed while holding
             * @property holdThreshold
             * @type {Number}
             * @default 2
             */
            holdThreshold: 2
        },
        handler: holdGesture
    };
})('hold');

/**
 * @module gestures
 */
/**
 * when a touch is being released from the page
 *
 * @class Release
 * @static
 */
/**
 * @event release
 * @param {Object} ev
 */
Hammer.gestures.Release = {
    name: 'release',
    index: Infinity,
    handler: function releaseGesture(ev, inst) {
        if(ev.eventType == EVENT_RELEASE) {
            inst.trigger(this.name, ev);
        }
    }
};

/**
 * @module gestures
 */
/**
 * triggers swipe events when the end velocity is above the threshold
 * for best usage, set `preventDefault` (on the drag gesture) to `true`
 * ````
 *  hammertime.on("dragleft swipeleft", function(ev) {
 *    console.log(ev);
 *    ev.gesture.preventDefault();
 *  });
 * ````
 *
 * @class Swipe
 * @static
 */
/**
 * @event swipe
 * @param {Object} ev
 */
/**
 * @event swipeleft
 * @param {Object} ev
 */
/**
 * @event swiperight
 * @param {Object} ev
 */
/**
 * @event swipeup
 * @param {Object} ev
 */
/**
 * @event swipedown
 * @param {Object} ev
 */
Hammer.gestures.Swipe = {
    name: 'swipe',
    index: 40,
    defaults: {
        /**
         * @property swipeMinTouches
         * @type {Number}
         * @default 1
         */
        swipeMinTouches: 1,

        /**
         * @property swipeMaxTouches
         * @type {Number}
         * @default 1
         */
        swipeMaxTouches: 1,

        /**
         * horizontal swipe velocity
         * @property swipeVelocityX
         * @type {Number}
         * @default 0.6
         */
        swipeVelocityX: 0.6,

        /**
         * vertical swipe velocity
         * @property swipeVelocityY
         * @type {Number}
         * @default 0.6
         */
        swipeVelocityY: 0.6
    },

    handler: function swipeGesture(ev, inst) {
        if(ev.eventType == EVENT_RELEASE) {
            var touches = ev.touches.length,
                options = inst.options;

            // max touches
            if(touches < options.swipeMinTouches ||
                touches > options.swipeMaxTouches) {
                return;
            }

            // when the distance we moved is too small we skip this gesture
            // or we can be already in dragging
            if(ev.velocityX > options.swipeVelocityX ||
                ev.velocityY > options.swipeVelocityY) {
                // trigger swipe events
                inst.trigger(this.name, ev);
                inst.trigger(this.name + ev.direction, ev);
            }
        }
    }
};

/**
 * @module gestures
 */
/**
 * Single tap and a double tap on a place
 *
 * @class Tap
 * @static
 */
/**
 * @event tap
 * @param {Object} ev
 */
/**
 * @event doubletap
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var hasMoved = false;

    function tapGesture(ev, inst) {
        var options = inst.options,
            current = Detection.current,
            prev = Detection.previous,
            sincePrev,
            didDoubleTap;

        switch(ev.eventType) {
            case EVENT_START:
                hasMoved = false;
                break;

            case EVENT_MOVE:
                hasMoved = hasMoved || (ev.distance > options.tapMaxDistance);
                break;

            case EVENT_END:
                if(!Utils.inStr(ev.srcEvent.type, 'cancel') && ev.deltaTime < options.tapMaxTime && !hasMoved) {
                    // previous gesture, for the double tap since these are two different gesture detections
                    sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
                    didDoubleTap = false;

                    // check if double tap
                    if(prev && prev.name == name &&
                        (sincePrev && sincePrev < options.doubleTapInterval) &&
                        ev.distance < options.doubleTapDistance) {
                        inst.trigger('doubletap', ev);
                        didDoubleTap = true;
                    }

                    // do a single tap
                    if(!didDoubleTap || options.tapAlways) {
                        current.name = name;
                        inst.trigger(current.name, ev);
                    }
                }
                break;
        }
    }

    Hammer.gestures.Tap = {
        name: name,
        index: 100,
        handler: tapGesture,
        defaults: {
            /**
             * max time of a tap, this is for the slow tappers
             * @property tapMaxTime
             * @type {Number}
             * @default 250
             */
            tapMaxTime: 250,

            /**
             * max distance of movement of a tap, this is for the slow tappers
             * @property tapMaxDistance
             * @type {Number}
             * @default 10
             */
            tapMaxDistance: 10,

            /**
             * always trigger the `tap` event, even while double-tapping
             * @property tapAlways
             * @type {Boolean}
             * @default true
             */
            tapAlways: true,

            /**
             * max distance between two taps
             * @property doubleTapDistance
             * @type {Number}
             * @default 20
             */
            doubleTapDistance: 20,

            /**
             * max time between two taps
             * @property doubleTapInterval
             * @type {Number}
             * @default 300
             */
            doubleTapInterval: 300
        }
    };
})('tap');

/**
 * @module gestures
 */
/**
 * when a touch is being touched at the page
 *
 * @class Touch
 * @static
 */
/**
 * @event touch
 * @param {Object} ev
 */
Hammer.gestures.Touch = {
    name: 'touch',
    index: -Infinity,
    defaults: {
        /**
         * call preventDefault at touchstart, and makes the element blocking by disabling the scrolling of the page,
         * but it improves gestures like transforming and dragging.
         * be careful with using this, it can be very annoying for users to be stuck on the page
         * @property preventDefault
         * @type {Boolean}
         * @default false
         */
        preventDefault: false,

        /**
         * disable mouse events, so only touch (or pen!) input triggers events
         * @property preventMouse
         * @type {Boolean}
         * @default false
         */
        preventMouse: false
    },
    handler: function touchGesture(ev, inst) {
        if(inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
            ev.stopDetect();
            return;
        }

        if(inst.options.preventDefault) {
            ev.preventDefault();
        }

        if(ev.eventType == EVENT_TOUCH) {
            inst.trigger('touch', ev);
        }
    }
};

/**
 * @module gestures
 */
/**
 * User want to scale or rotate with 2 fingers
 * Preventing the default browser behavior is a good way to improve feel and working. This can be done with the
 * `preventDefault` option.
 *
 * @class Transform
 * @static
 */
/**
 * @event transform
 * @param {Object} ev
 */
/**
 * @event transformstart
 * @param {Object} ev
 */
/**
 * @event transformend
 * @param {Object} ev
 */
/**
 * @event pinchin
 * @param {Object} ev
 */
/**
 * @event pinchout
 * @param {Object} ev
 */
/**
 * @event rotate
 * @param {Object} ev
 */

/**
 * @param {String} name
 */
(function(name) {
    var triggered = false;

    function transformGesture(ev, inst) {
        switch(ev.eventType) {
            case EVENT_START:
                triggered = false;
                break;

            case EVENT_MOVE:
                // at least multitouch
                if(ev.touches.length < 2) {
                    return;
                }

                var scaleThreshold = Math.abs(1 - ev.scale);
                var rotationThreshold = Math.abs(ev.rotation);

                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(scaleThreshold < inst.options.transformMinScale &&
                    rotationThreshold < inst.options.transformMinRotation) {
                    return;
                }

                // we are transforming!
                Detection.current.name = name;

                // first time, trigger dragstart event
                if(!triggered) {
                    inst.trigger(name + 'start', ev);
                    triggered = true;
                }

                inst.trigger(name, ev); // basic transform event

                // trigger rotate event
                if(rotationThreshold > inst.options.transformMinRotation) {
                    inst.trigger('rotate', ev);
                }

                // trigger pinch event
                if(scaleThreshold > inst.options.transformMinScale) {
                    inst.trigger('pinch', ev);
                    inst.trigger('pinch' + (ev.scale < 1 ? 'in' : 'out'), ev);
                }
                break;

            case EVENT_RELEASE:
                if(triggered && ev.changedLength < 2) {
                    inst.trigger(name + 'end', ev);
                    triggered = false;
                }
                break;
        }
    }

    Hammer.gestures.Transform = {
        name: name,
        index: 45,
        defaults: {
            /**
             * minimal scale factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
             * @property transformMinScale
             * @type {Number}
             * @default 0.01
             */
            transformMinScale: 0.01,

            /**
             * rotation in degrees
             * @property transformMinRotation
             * @type {Number}
             * @default 1
             */
            transformMinRotation: 1
        },

        handler: transformGesture
    };
})('transform');

/**
 * @module hammer
 */

// AMD export
if(typeof define == 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
// commonjs export
} else if(typeof module !== 'undefined' && module.exports) {
    module.exports = Hammer;
// browser export
} else {
    window.Hammer = Hammer;
}

})(window);
},{}],31:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash include="debounce,reject,map,value,range,without,sample,create,flatten,isEmpty,wrap,size" --output src/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      errorClass = '[object Error]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used as the data object for `iteratorTemplate` */
  var iteratorData = {
    'args': '',
    'array': null,
    'bottom': '',
    'firstArg': '',
    'init': '',
    'keys': null,
    'loop': '',
    'shadowedProps': null,
    'support': null,
    'top': '',
    'useHas': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'false': false,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false
    };
  }

  /**
   * Checks if `value` is a DOM node in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
   */
  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache =object.object = object.number = object.string =null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Used for native method references */
  var errorProto = Error.prototype,
      objectProto = Object.prototype,
      stringProto = String.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /** Native method shortcuts */
  var ceil = Math.ceil,
      floor = Math.floor,
      fnToString = Function.prototype.toString,
      hasOwnProperty = objectProto.hasOwnProperty,
      push = arrayRef.push,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      unshift = arrayRef.unshift;

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
      nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
      nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeRandom = Math.random;

  /** Used to avoid iterating non-enumerable properties in IE < 9 */
  var nonEnumProps = {};
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
  nonEnumProps[objectClass] = { 'constructor': true };

  (function() {
    var length = shadowedProps.length;
    while (length--) {
      var key = shadowedProps[length];
      for (var className in nonEnumProps) {
        if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
          nonEnumProps[className][key] = false;
        }
      }
    }
  }());

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps the given value to enable intuitive
   * method chaining.
   *
   * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
   * and `unshift`
   *
   * Chaining is supported in custom builds as long as the `value` method is
   * implicitly or explicitly included in the build.
   *
   * The chainable wrapper functions are:
   * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
   * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
   * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
   * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
   * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
   * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
   * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
   * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
   * and `zip`
   *
   * The non-chainable wrapper functions are:
   * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
   * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
   * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
   * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
   * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
   * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
   * `template`, `unescape`, `uniqueId`, and `value`
   *
   * The wrapper functions `first` and `last` return wrapped values when `n` is
   * provided, otherwise they return unwrapped values.
   *
   * Explicit chaining can be enabled by using the `_.chain` method.
   *
   * @name _
   * @constructor
   * @category Chaining
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns a `lodash` instance.
   * @example
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(function(sum, num) {
   *   return sum + num;
   * });
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(function(num) {
   *   return num * num;
   * });
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash(value) {
    // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
    return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
     ? value
     : new lodashWrapper(value);
  }

  /**
   * A fast path for creating `lodash` wrapper objects.
   *
   * @private
   * @param {*} value The value to wrap in a `lodash` instance.
   * @param {boolean} chainAll A flag to enable chaining for all methods
   * @returns {Object} Returns a `lodash` instance.
   */
  function lodashWrapper(value, chainAll) {
    this.__chain__ = !!chainAll;
    this.__wrapped__ = value;
  }
  // ensure `new lodashWrapper` is an instance of `lodash`
  lodashWrapper.prototype = lodash.prototype;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = lodash.support = {};

  (function() {
    var ctor = function() { this.x = 1; },
        object = { '0': 1, 'length': 1 },
        props = [];

    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var key in new ctor) { props.push(key); }
    for (key in arguments) { }

    /**
     * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.argsClass = toString.call(arguments) == argsClass;

    /**
     * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

    /**
     * Detect if `name` or `message` properties of `Error.prototype` are
     * enumerable by default. (IE < 9, Safari < 5.1)
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

    /**
     * Detect if `prototype` properties are enumerable by default.
     *
     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
     * (if the prototype or a property on the prototype has been set)
     * incorrectly sets a function's `prototype` property [[Enumerable]]
     * value to `true`.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(root.WinRTError) && reThis.test(function() { return this; });

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * Detect if `arguments` object indexes are non-enumerable
     * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.nonEnumArgs = key != 0;

    /**
     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
     *
     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
     * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.nonEnumShadows = !/valueOf/.test(props);

    /**
     * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
     *
     * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
     * and `splice()` functions that fail to remove the last element, `value[0]`,
     * of array-like objects even though the `length` property is set to `0`.
     * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
     * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

    /**
     * Detect lack of support for accessing string characters by index.
     *
     * IE < 8 can't access characters by index and IE 8 can only access
     * characters by index on string literals.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';
  }(1));

  /*--------------------------------------------------------------------------*/

  /**
   * The template used to create iterator functions.
   *
   * @private
   * @param {Object} data The data object used to populate the text.
   * @returns {string} Returns the interpolated text.
   */
  var iteratorTemplate = function(obj) {

    var __p = 'var index, iterable = ' +
    (obj.firstArg) +
    ', result = ' +
    (obj.init) +
    ';\nif (!iterable) return result;\n' +
    (obj.top) +
    ';';
     if (obj.array) {
    __p += '\nvar length = iterable.length; index = -1;\nif (' +
    (obj.array) +
    ') {  ';
     if (support.unindexedChars) {
    __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
     }
    __p += '\n  while (++index < length) {\n    ' +
    (obj.loop) +
    ';\n  }\n}\nelse {  ';
     } else if (support.nonEnumArgs) {
    __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
    (obj.loop) +
    ';\n    }\n  } else {  ';
     }

     if (support.enumPrototypes) {
    __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
     }

     if (support.enumErrorProps) {
    __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
     }

        var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

     if (obj.useHas && obj.keys) {
    __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
        if (conditions.length) {
    __p += '    if (' +
    (conditions.join(' && ')) +
    ') {\n  ';
     }
    __p +=
    (obj.loop) +
    ';    ';
     if (conditions.length) {
    __p += '\n    }';
     }
    __p += '\n  }  ';
     } else {
    __p += '\n  for (index in iterable) {\n';
        if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
    __p += '    if (' +
    (conditions.join(' && ')) +
    ') {\n  ';
     }
    __p +=
    (obj.loop) +
    ';    ';
     if (conditions.length) {
    __p += '\n    }';
     }
    __p += '\n  }    ';
     if (support.nonEnumShadows) {
    __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
     for (k = 0; k < 7; k++) {
    __p += '\n    index = \'' +
    (obj.shadowedProps[k]) +
    '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
            if (!obj.useHas) {
    __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
     }
    __p += ') {\n      ' +
    (obj.loop) +
    ';\n    }      ';
     }
    __p += '\n  }    ';
     }

     }

     if (obj.array || support.nonEnumArgs) {
    __p += '\n}';
     }
    __p +=
    (obj.bottom) +
    ';\nreturn result';

    return __p
  };

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || root.Object();
      };
    }());
  }

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  /**
   * The base implementation of `_.difference` that accepts a single array
   * of values to exclude.
   *
   * @private
   * @param {Array} array The array to process.
   * @param {Array} [values] The array of values to exclude.
   * @returns {Array} Returns a new array of filtered values.
   */
  function baseDifference(array, values) {
    var index = -1,
        indexOf = getIndexOf(),
        length = array ? array.length : 0,
        isLarge = length >= largeArraySize && indexOf === baseIndexOf,
        result = [];

    if (isLarge) {
      var cache = createCache(values);
      if (cache) {
        indexOf = cacheIndexOf;
        values = cache;
      } else {
        isLarge = false;
      }
    }
    while (++index < length) {
      var value = array[index];
      if (indexOf(values, value) < 0) {
        result.push(value);
      }
    }
    if (isLarge) {
      releaseObject(values);
    }
    return result;
  }

  /**
   * The base implementation of `_.flatten` without support for callback
   * shorthands or `thisArg` binding.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
   * @param {number} [fromIndex=0] The index to start from.
   * @returns {Array} Returns a new flattened array.
   */
  function baseFlatten(array, isShallow, isStrict, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
      var value = array[index];

      if (value && typeof value == 'object' && typeof value.length == 'number'
          && (isArray(value) || isArguments(value))) {
        // recursively flatten arrays (susceptible to call stack limits)
        if (!isShallow) {
          value = baseFlatten(value, isShallow, isStrict);
        }
        var valIndex = -1,
            valLength = value.length,
            resIndex = result.length;

        result.length += valLength;
        while (++valIndex < valLength) {
          result[resIndex++] = value[valIndex];
        }
      } else if (!isStrict) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.isEqual`, without support for `thisArg` binding,
   * that allows partial "_.where" style comparisons.
   *
   * @private
   * @param {*} a The value to compare.
   * @param {*} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
   * @param {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    if (callback) {
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        !(a && objectTypes[type]) &&
        !(b && objectTypes[otherType])) {
      return false;
    }
    // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
    // http://es5.github.io/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
          bWrapped = hasOwnProperty.call(b, '__wrapped__');

      if (aWrapped || bWrapped) {
        return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result || isWhere) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (isWhere) {
            while (index--) {
              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
        }
      });

      if (result && !isWhere) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  /**
   * The base implementation of `_.random` without argument juggling or support
   * for returning floating-point numbers.
   *
   * @private
   * @param {number} min The minimum possible value.
   * @param {number} max The maximum possible value.
   * @returns {number} Returns a random number.
   */
  function baseRandom(min, max) {
    return min + floor(nativeRandom() * (max - min + 1));
  }

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  /**
   * Creates compiled iteration functions.
   *
   * @private
   * @param {...Object} [options] The compile options object(s).
   * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
   * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
   * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
   * @param {string} [options.args] A comma separated string of iteration function arguments.
   * @param {string} [options.top] Code to execute before the iteration branches.
   * @param {string} [options.loop] Code to execute in the object loop.
   * @param {string} [options.bottom] Code to execute after the iteration branches.
   * @returns {Function} Returns the compiled function.
   */
  function createIterator() {
    // data properties
    iteratorData.shadowedProps = shadowedProps;

    // iterator options
    iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
    iteratorData.init = 'iterable';
    iteratorData.useHas = true;

    // merge options into a template data object
    for (var object, index = 0; object = arguments[index]; index++) {
      for (var key in object) {
        iteratorData[key] = object[key];
      }
    }
    var args = iteratorData.args;
    iteratorData.firstArg = /^[^,]+/.exec(args)[0];

    // create the function factory
    var factory = Function(
        'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
        'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
        'objectTypes, nonEnumProps, stringClass, stringProto, toString',
      'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
    );

    // return the compiled function
    return factory(
      baseCreateCallback, errorClass, errorProto, hasOwnProperty,
      indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
      objectTypes, nonEnumProps, stringClass, stringProto, toString
    );
  }

  /**
   * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
   * customized, this method returns the custom method, otherwise it returns
   * the `baseIndexOf` function.
   *
   * @private
   * @returns {Function} Returns the "indexOf" function.
   */
  function getIndexOf() {
    var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
    return result;
  }

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  /*--------------------------------------------------------------------------*/

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == argsClass || false;
  }
  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!support.argsClass) {
    isArguments = function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
    };
  }

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == arrayClass || false;
  };

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = createIterator({
    'args': 'object',
    'init': '[]',
    'top': 'if (!(objectTypes[typeof object])) return result',
    'loop': 'result.push(index)'
  });

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    if ((support.enumPrototypes && typeof object == 'function') ||
        (support.nonEnumArgs && object.length && isArguments(object))) {
      return shimKeys(object);
    }
    return nativeKeys(object);
  };

  /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
  var eachIteratorOptions = {
    'args': 'collection, callback, thisArg',
    'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
    'array': "typeof length == 'number'",
    'keys': keys,
    'loop': 'if (callback(iterable[index], index, collection) === false) return result'
  };

  /** Reusable iterator options for `assign` and `defaults` */
  var defaultsIteratorOptions = {
    'args': 'object, source, guard',
    'top':
      'var args = arguments,\n' +
      '    argsIndex = 0,\n' +
      "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
      'while (++argsIndex < argsLength) {\n' +
      '  iterable = args[argsIndex];\n' +
      '  if (iterable && objectTypes[typeof iterable]) {',
    'keys': keys,
    'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
    'bottom': '  }\n}'
  };

  /** Reusable iterator options for `forIn` and `forOwn` */
  var forOwnIteratorOptions = {
    'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
    'array': false
  };

  /**
   * A function compiled to iterate `arguments` objects, arrays, objects, and
   * strings consistenly across environments, executing the callback for each
   * element in the collection. The callback is bound to `thisArg` and invoked
   * with three arguments; (value, index|key, collection). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @private
   * @type Function
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|string} Returns `collection`.
   */
  var baseEach = createIterator(eachIteratorOptions);

  /*--------------------------------------------------------------------------*/

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a callback is provided it will be executed to produce the
   * assigned values. The callback is bound to `thisArg` and invoked with two
   * arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
   * // => { 'name': 'fred', 'employer': 'slate' }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var object = { 'name': 'barney' };
   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var assign = createIterator(defaultsIteratorOptions, {
    'top':
      defaultsIteratorOptions.top.replace(';',
        ';\n' +
        "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
        '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
        "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
        '  callback = args[--argsLength];\n' +
        '}'
      ),
    'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
  });

  /**
   * Creates an object that inherits from the given `prototype` object. If a
   * `properties` object is provided its own enumerable properties are assigned
   * to the created object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} prototype The object to inherit from.
   * @param {Object} [properties] The properties to assign to the object.
   * @returns {Object} Returns the new object.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * function Circle() {
   *   Shape.call(this);
   * }
   *
   * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
   *
   * var circle = new Circle;
   * circle instanceof Circle;
   * // => true
   *
   * circle instanceof Shape;
   * // => true
   */
  function create(prototype, properties) {
    var result = baseCreate(prototype);
    return properties ? assign(result, properties) : result;
  }

  /**
   * Iterates over own and inherited enumerable properties of an object,
   * executing the callback for each property. The callback is bound to `thisArg`
   * and invoked with three arguments; (value, key, object). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * Shape.prototype.move = function(x, y) {
   *   this.x += x;
   *   this.y += y;
   * };
   *
   * _.forIn(new Shape, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
   */
  var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
    'useHas': false
  });

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

  /**
   * Creates a sorted array of property names of all enumerable properties,
   * own and inherited, of `object` that have function values.
   *
   * @static
   * @memberOf _
   * @alias methods
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names that have function values.
   * @example
   *
   * _.functions(_);
   * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
   */
  function functions(object) {
    var result = [];
    forIn(object, function(value, key) {
      if (isFunction(value)) {
        result.push(key);
      }
    });
    return result.sort();
  }

  /**
   * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
   * length of `0` and objects with no own enumerable properties are considered
   * "empty".
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Array|Object|string} value The value to inspect.
   * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({});
   * // => true
   *
   * _.isEmpty('');
   * // => true
   */
  function isEmpty(value) {
    var result = true;
    if (!value) {
      return result;
    }
    var className = toString.call(value),
        length = value.length;

    if ((className == arrayClass || className == stringClass ||
        (support.argsClass ? className == argsClass : isArguments(value))) ||
        (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
      return !length;
    }
    forOwn(value, function() {
      return (result = false);
    });
    return result;
  }

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value == 'function' && toString.call(value) == funcClass;
    };
  }

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('fred');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' ||
      value && typeof value == 'object' && toString.call(value) == stringClass || false;
  }

  /**
   * Creates an array composed of the own enumerable property values of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property values.
   * @example
   *
   * _.values({ 'one': 1, 'two': 2, 'three': 3 });
   * // => [1, 2, 3] (property order is not guaranteed across environments)
   */
  function values(object) {
    var index = -1,
        props = keys(object),
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Iterates over elements of a collection, returning an array of all elements
   * the callback returns truey for. The callback is bound to `thisArg` and
   * invoked with three arguments; (value, index|key, collection).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @alias select
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of elements that passed the callback check.
   * @example
   *
   * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
   * // => [2, 4, 6]
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36, 'blocked': false },
   *   { 'name': 'fred',   'age': 40, 'blocked': true }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.filter(characters, 'blocked');
   * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
   *
   * // using "_.where" callback shorthand
   * _.filter(characters, { 'age': 36 });
   * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
   */
  function filter(collection, callback, thisArg) {
    var result = [];
    callback = lodash.createCallback(callback, thisArg, 3);

    if (isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        var value = collection[index];
        if (callback(value, index, collection)) {
          result.push(value);
        }
      }
    } else {
      baseEach(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result.push(value);
        }
      });
    }
    return result;
  }

  /**
   * Iterates over elements of a collection, executing the callback for each
   * element. The callback is bound to `thisArg` and invoked with three arguments;
   * (value, index|key, collection). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * Note: As with other "Collections" methods, objects with a `length` property
   * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
   * may be used for object iteration.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|string} Returns `collection`.
   * @example
   *
   * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
   * // => logs each number and returns '1,2,3'
   *
   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
   * // => logs each number and returns the object (property order is not guaranteed across environments)
   */
  function forEach(collection, callback, thisArg) {
    if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
      var index = -1,
          length = collection.length;

      while (++index < length) {
        if (callback(collection[index], index, collection) === false) {
          break;
        }
      }
    } else {
      baseEach(collection, callback, thisArg);
    }
    return collection;
  }

  /**
   * Creates an array of values by running each element in the collection
   * through the callback. The callback is bound to `thisArg` and invoked with
   * three arguments; (value, index|key, collection).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @alias collect
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of the results of each `callback` execution.
   * @example
   *
   * _.map([1, 2, 3], function(num) { return num * 3; });
   * // => [3, 6, 9]
   *
   * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
   * // => [3, 6, 9] (property order is not guaranteed across environments)
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.map(characters, 'name');
   * // => ['barney', 'fred']
   */
  function map(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0,
        result = Array(typeof length == 'number' ? length : 0);

    callback = lodash.createCallback(callback, thisArg, 3);
    if (isArray(collection)) {
      while (++index < length) {
        result[index] = callback(collection[index], index, collection);
      }
    } else {
      baseEach(collection, function(value, key, collection) {
        result[++index] = callback(value, key, collection);
      });
    }
    return result;
  }

  /**
   * The opposite of `_.filter` this method returns the elements of a
   * collection that the callback does **not** return truey for.
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of elements that failed the callback check.
   * @example
   *
   * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
   * // => [1, 3, 5]
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36, 'blocked': false },
   *   { 'name': 'fred',   'age': 40, 'blocked': true }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.reject(characters, 'blocked');
   * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
   *
   * // using "_.where" callback shorthand
   * _.reject(characters, { 'age': 36 });
   * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
   */
  function reject(collection, callback, thisArg) {
    callback = lodash.createCallback(callback, thisArg, 3);
    return filter(collection, function(value, index, collection) {
      return !callback(value, index, collection);
    });
  }

  /**
   * Retrieves a random element or `n` random elements from a collection.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to sample.
   * @param {number} [n] The number of elements to sample.
   * @param- {Object} [guard] Allows working with functions like `_.map`
   *  without using their `index` arguments as `n`.
   * @returns {Array} Returns the random sample(s) of `collection`.
   * @example
   *
   * _.sample([1, 2, 3, 4]);
   * // => 2
   *
   * _.sample([1, 2, 3, 4], 2);
   * // => [3, 1]
   */
  function sample(collection, n, guard) {
    if (collection && typeof collection.length != 'number') {
      collection = values(collection);
    } else if (support.unindexedChars && isString(collection)) {
      collection = collection.split('');
    }
    if (n == null || guard) {
      return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
    }
    var result = shuffle(collection);
    result.length = nativeMin(nativeMax(0, n), result.length);
    return result;
  }

  /**
   * Creates an array of shuffled values, using a version of the Fisher-Yates
   * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to shuffle.
   * @returns {Array} Returns a new shuffled collection.
   * @example
   *
   * _.shuffle([1, 2, 3, 4, 5, 6]);
   * // => [4, 1, 6, 3, 5, 2]
   */
  function shuffle(collection) {
    var index = -1,
        length = collection ? collection.length : 0,
        result = Array(typeof length == 'number' ? length : 0);

    forEach(collection, function(value) {
      var rand = baseRandom(0, ++index);
      result[index] = result[rand];
      result[rand] = value;
    });
    return result;
  }

  /**
   * Gets the size of the `collection` by returning `collection.length` for arrays
   * and array-like objects or the number of own enumerable properties for objects.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to inspect.
   * @returns {number} Returns `collection.length` or number of own enumerable properties.
   * @example
   *
   * _.size([1, 2]);
   * // => 2
   *
   * _.size({ 'one': 1, 'two': 2, 'three': 3 });
   * // => 3
   *
   * _.size('pebbles');
   * // => 7
   */
  function size(collection) {
    var length = collection ? collection.length : 0;
    return typeof length == 'number' ? length : keys(collection).length;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Flattens a nested array (the nesting can be to any depth). If `isShallow`
   * is truey, the array will only be flattened a single level. If a callback
   * is provided each element of the array is passed through the callback before
   * flattening. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, index, array).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new flattened array.
   * @example
   *
   * _.flatten([1, [2], [3, [[4]]]]);
   * // => [1, 2, 3, 4];
   *
   * _.flatten([1, [2], [3, [[4]]]], true);
   * // => [1, 2, 3, [[4]]];
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
   *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.flatten(characters, 'pets');
   * // => ['hoppy', 'baby puss', 'dino']
   */
  function flatten(array, isShallow, callback, thisArg) {
    // juggle arguments
    if (typeof isShallow != 'boolean' && isShallow != null) {
      thisArg = callback;
      callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
      isShallow = false;
    }
    if (callback != null) {
      array = map(array, callback, thisArg);
    }
    return baseFlatten(array, isShallow);
  }

  /**
   * Gets the index at which the first occurrence of `value` is found using
   * strict equality for comparisons, i.e. `===`. If the array is already sorted
   * providing `true` for `fromIndex` will run a faster binary search.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {boolean|number} [fromIndex=0] The index to search from or `true`
   *  to perform a binary search on a sorted array.
   * @returns {number} Returns the index of the matched value or `-1`.
   * @example
   *
   * _.indexOf([1, 2, 3, 1, 2, 3], 2);
   * // => 1
   *
   * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
   * // => 4
   *
   * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
   * // => 2
   */
  function indexOf(array, value, fromIndex) {
    if (typeof fromIndex == 'number') {
      var length = array ? array.length : 0;
      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
    } else if (fromIndex) {
      var index = sortedIndex(array, value);
      return array[index] === value ? index : -1;
    }
    return baseIndexOf(array, value, fromIndex);
  }

  /**
   * Creates an array of numbers (positive and/or negative) progressing from
   * `start` up to but not including `end`. If `start` is less than `stop` a
   * zero-length range is created unless a negative `step` is specified.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {number} [start=0] The start of the range.
   * @param {number} end The end of the range.
   * @param {number} [step=1] The value to increment or decrement by.
   * @returns {Array} Returns a new range array.
   * @example
   *
   * _.range(4);
   * // => [0, 1, 2, 3]
   *
   * _.range(1, 5);
   * // => [1, 2, 3, 4]
   *
   * _.range(0, 20, 5);
   * // => [0, 5, 10, 15]
   *
   * _.range(0, -4, -1);
   * // => [0, -1, -2, -3]
   *
   * _.range(1, 4, 0);
   * // => [1, 1, 1]
   *
   * _.range(0);
   * // => []
   */
  function range(start, end, step) {
    start = +start || 0;
    step = typeof step == 'number' ? step : (+step || 1);

    if (end == null) {
      end = start;
      start = 0;
    }
    // use `Array(length)` so engines like Chakra and V8 avoid slower modes
    // http://youtu.be/XAqIpGU8ZZk#t=17m25s
    var index = -1,
        length = nativeMax(0, ceil((end - start) / (step || 1))),
        result = Array(length);

    while (++index < length) {
      result[index] = start;
      start += step;
    }
    return result;
  }

  /**
   * Uses a binary search to determine the smallest index at which a value
   * should be inserted into a given sorted array in order to maintain the sort
   * order of the array. If a callback is provided it will be executed for
   * `value` and each element of `array` to compute their sort ranking. The
   * callback is bound to `thisArg` and invoked with one argument; (value).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to inspect.
   * @param {*} value The value to evaluate.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {number} Returns the index at which `value` should be inserted
   *  into `array`.
   * @example
   *
   * _.sortedIndex([20, 30, 50], 40);
   * // => 2
   *
   * // using "_.pluck" callback shorthand
   * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
   * // => 2
   *
   * var dict = {
   *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
   * };
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return dict.wordToNumber[word];
   * });
   * // => 2
   *
   * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
   *   return this.wordToNumber[word];
   * }, dict);
   * // => 2
   */
  function sortedIndex(array, value, callback, thisArg) {
    var low = 0,
        high = array ? array.length : low;

    // explicitly reference `identity` for better inlining in Firefox
    callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
    value = callback(value);

    while (low < high) {
      var mid = (low + high) >>> 1;
      (callback(array[mid]) < value)
        ? low = mid + 1
        : high = mid;
    }
    return low;
  }

  /**
   * Creates an array excluding all provided values using strict equality for
   * comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to filter.
   * @param {...*} [value] The values to exclude.
   * @returns {Array} Returns a new array of filtered values.
   * @example
   *
   * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
   * // => [2, 3, 4]
   */
  function without(array) {
    return baseDifference(array, slice(arguments, 1));
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  /**
   * Creates a function that will delay the execution of `func` until after
   * `wait` milliseconds have elapsed since the last time it was invoked.
   * Provide an options object to indicate that `func` should be invoked on
   * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
   * to the debounced function will return the result of the last `func` call.
   *
   * Note: If `leading` and `trailing` options are `true` `func` will be called
   * on the trailing edge of the timeout only if the the debounced function is
   * invoked more than once during the `wait` timeout.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to debounce.
   * @param {number} wait The number of milliseconds to delay.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
   * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
   * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // avoid costly calculations while the window size is in flux
   * var lazyLayout = _.debounce(calculateLayout, 150);
   * jQuery(window).on('resize', lazyLayout);
   *
   * // execute `sendMail` when the click event is fired, debouncing subsequent calls
   * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * });
   *
   * // ensure `batchLog` is executed once after 1 second of debounced calls
   * var source = new EventSource('/stream');
   * source.addEventListener('message', _.debounce(batchLog, 250, {
   *   'maxWait': 1000
   * }, false);
   */
  function debounce(func, wait, options) {
    var args,
        maxTimeoutId,
        result,
        stamp,
        thisArg,
        timeoutId,
        trailingCall,
        lastCalled = 0,
        maxWait = false,
        trailing = true;

    if (!isFunction(func)) {
      throw new TypeError;
    }
    wait = nativeMax(0, wait) || 0;
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = options.leading;
      maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
      trailing = 'trailing' in options ? options.trailing : trailing;
    }
    var delayed = function() {
      var remaining = wait - (now() - stamp);
      if (remaining <= 0) {
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
        }
        var isCalled = trailingCall;
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (isCalled) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    };

    var maxDelayed = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (trailing || (maxWait !== wait)) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    };

    return function() {
      args = arguments;
      stamp = now();
      thisArg = this;
      trailingCall = trailing && (timeoutId || !leading);

      if (maxWait === false) {
        var leadingCall = leading && !timeoutId;
      } else {
        if (!maxTimeoutId && !leading) {
          lastCalled = stamp;
        }
        var remaining = maxWait - (stamp - lastCalled),
            isCalled = remaining <= 0;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
      return result;
    };
  }

  /**
   * Creates a function that provides `value` to the wrapper function as its
   * first argument. Additional arguments provided to the function are appended
   * to those provided to the wrapper function. The wrapper is executed with
   * the `this` binding of the created function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {*} value The value to wrap.
   * @param {Function} wrapper The wrapper function.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var p = _.wrap(_.escape, function(func, text) {
   *   return '<p>' + func(text) + '</p>';
   * });
   *
   * p('Fred, Wilma, & Pebbles');
   * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
   */
  function wrap(value, wrapper) {
    return createWrapper(wrapper, 16, [value]);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name the created callback will return the property value for a given element.
   * If `func` is an object the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(characters, 'age__gt38');
   * // => [{ 'name': 'fred', 'age': 40 }]
   */
  function createCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (func == null || type == 'function') {
      return baseCreateCallback(func, thisArg, argCount);
    }
    // handle "_.pluck" style callback shorthands
    if (type != 'object') {
      return property(func);
    }
    var props = keys(func),
        key = props[0],
        a = func[key];

    // handle "_.where" style callback shorthands
    if (props.length == 1 && a === a && !isObject(a)) {
      // fast path the common case of providing an object with a single
      // property containing a primitive value
      return function(object) {
        var b = object[key];
        return a === b && (a !== 0 || (1 / a == 1 / b));
      };
    }
    return function(object) {
      var length = props.length,
          result = false;

      while (length--) {
        if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
          break;
        }
      }
      return result;
    };
  }

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * Adds function properties of a source object to the destination object.
   * If `object` is a function methods will be added to its prototype as well.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Function|Object} [object=lodash] object The destination object.
   * @param {Object} source The object of functions to add.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
   * @example
   *
   * function capitalize(string) {
   *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
   * }
   *
   * _.mixin({ 'capitalize': capitalize });
   * _.capitalize('fred');
   * // => 'Fred'
   *
   * _('fred').capitalize().value();
   * // => 'Fred'
   *
   * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
   * _('fred').capitalize();
   * // => 'Fred'
   */
  function mixin(object, source, options) {
    var chain = true,
        methodNames = source && functions(source);

    if (!source || (!options && !methodNames.length)) {
      if (options == null) {
        options = source;
      }
      ctor = lodashWrapper;
      source = object;
      object = lodash;
      methodNames = functions(source);
    }
    if (options === false) {
      chain = false;
    } else if (isObject(options) && 'chain' in options) {
      chain = options.chain;
    }
    var ctor = object,
        isFunc = isFunction(ctor);

    forEach(methodNames, function(methodName) {
      var func = object[methodName] = source[methodName];
      if (isFunc) {
        ctor.prototype[methodName] = function() {
          var chainAll = this.__chain__,
              value = this.__wrapped__,
              args = [value];

          push.apply(args, arguments);
          var result = func.apply(object, args);
          if (chain || chainAll) {
            if (value === result && isObject(result)) {
              return this;
            }
            result = new ctor(result);
            result.__chain__ = chainAll;
          }
          return result;
        };
      }
    });
  }

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  /**
   * Gets the number of milliseconds that have elapsed since the Unix epoch
   * (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var stamp = _.now();
   * _.defer(function() { console.log(_.now() - stamp); });
   * // => logs the number of milliseconds it took for the deferred function to be called
   */
  var now = isNative(now = Date.now) && now || function() {
    return new Date().getTime();
  };

  /**
   * Creates a "_.pluck" style function, which returns the `key` value of a
   * given object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} key The name of the property to retrieve.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var characters = [
   *   { 'name': 'fred',   'age': 40 },
   *   { 'name': 'barney', 'age': 36 }
   * ];
   *
   * var getName = _.property('name');
   *
   * _.map(characters, getName);
   * // => ['barney', 'fred']
   *
   * _.sortBy(characters, getName);
   * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
   */
  function property(key) {
    return function(object) {
      return object[key];
    };
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object that wraps the given value with explicit
   * method chaining enabled.
   *
   * @static
   * @memberOf _
   * @category Chaining
   * @param {*} value The value to wrap.
   * @returns {Object} Returns the wrapper object.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney',  'age': 36 },
   *   { 'name': 'fred',    'age': 40 },
   *   { 'name': 'pebbles', 'age': 1 }
   * ];
   *
   * var youngest = _.chain(characters)
   *     .sortBy('age')
   *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
   *     .first()
   *     .value();
   * // => 'pebbles is 1'
   */
  function chain(value) {
    value = new lodashWrapper(value);
    value.__chain__ = true;
    return value;
  }

  /**
   * Enables explicit method chaining on the wrapper object.
   *
   * @name chain
   * @memberOf _
   * @category Chaining
   * @returns {*} Returns the wrapper object.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // without explicit chaining
   * _(characters).first();
   * // => { 'name': 'barney', 'age': 36 }
   *
   * // with explicit chaining
   * _(characters).chain()
   *   .first()
   *   .pick('age')
   *   .value();
   * // => { 'age': 36 }
   */
  function wrapperChain() {
    this.__chain__ = true;
    return this;
  }

  /**
   * Produces the `toString` result of the wrapped value.
   *
   * @name toString
   * @memberOf _
   * @category Chaining
   * @returns {string} Returns the string result.
   * @example
   *
   * _([1, 2, 3]).toString();
   * // => '1,2,3'
   */
  function wrapperToString() {
    return String(this.__wrapped__);
  }

  /**
   * Extracts the wrapped value.
   *
   * @name valueOf
   * @memberOf _
   * @alias value
   * @category Chaining
   * @returns {*} Returns the wrapped value.
   * @example
   *
   * _([1, 2, 3]).valueOf();
   * // => [1, 2, 3]
   */
  function wrapperValueOf() {
    return this.__wrapped__;
  }

  /*--------------------------------------------------------------------------*/

  lodash.assign = assign;
  lodash.bind = bind;
  lodash.chain = chain;
  lodash.create = create;
  lodash.createCallback = createCallback;
  lodash.debounce = debounce;
  lodash.filter = filter;
  lodash.flatten = flatten;
  lodash.forEach = forEach;
  lodash.forIn = forIn;
  lodash.forOwn = forOwn;
  lodash.functions = functions;
  lodash.keys = keys;
  lodash.map = map;
  lodash.property = property;
  lodash.range = range;
  lodash.reject = reject;
  lodash.shuffle = shuffle;
  lodash.values = values;
  lodash.without = without;
  lodash.wrap = wrap;

  // add aliases
  lodash.collect = map;
  lodash.each = forEach;
  lodash.extend = assign;
  lodash.methods = functions;
  lodash.select = filter;

  // add functions to `lodash.prototype`
  mixin(lodash);

  /*--------------------------------------------------------------------------*/

  lodash.identity = identity;
  lodash.indexOf = indexOf;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEmpty = isEmpty;
  lodash.isFunction = isFunction;
  lodash.isObject = isObject;
  lodash.isString = isString;
  lodash.mixin = mixin;
  lodash.noop = noop;
  lodash.now = now;
  lodash.size = size;
  lodash.sortedIndex = sortedIndex;

  mixin(function() {
    var source = {}
    forOwn(lodash, function(func, methodName) {
      if (!lodash.prototype[methodName]) {
        source[methodName] = func;
      }
    });
    return source;
  }(), false);

  /*--------------------------------------------------------------------------*/

  lodash.sample = sample;

  forOwn(lodash, function(func, methodName) {
    var callbackable = methodName !== 'sample';
    if (!lodash.prototype[methodName]) {
      lodash.prototype[methodName]= function(n, guard) {
        var chainAll = this.__chain__,
            result = func(this.__wrapped__, n, guard);

        return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
          ? result
          : new lodashWrapper(result, chainAll);
      };
    }
  });

  /*--------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type string
   */
  lodash.VERSION = '2.4.1';

  // add "Chaining" functions to the wrapper
  lodash.prototype.chain = wrapperChain;
  lodash.prototype.toString = wrapperToString;
  lodash.prototype.value = wrapperValueOf;
  lodash.prototype.valueOf = wrapperValueOf;

  // add `Array` functions that return unwrapped values
  baseEach(['join', 'pop', 'shift'], function(methodName) {
    var func = arrayRef[methodName];
    lodash.prototype[methodName] = function() {
      var chainAll = this.__chain__,
          result = func.apply(this.__wrapped__, arguments);

      return chainAll
        ? new lodashWrapper(result, chainAll)
        : result;
    };
  });

  // add `Array` functions that return the existing wrapped value
  baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
    var func = arrayRef[methodName];
    lodash.prototype[methodName] = function() {
      func.apply(this.__wrapped__, arguments);
      return this;
    };
  });

  // add `Array` functions that return new wrapped values
  baseEach(['concat', 'slice', 'splice'], function(methodName) {
    var func = arrayRef[methodName];
    lodash.prototype[methodName] = function() {
      return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
    };
  });

  // avoid array-like object bugs with `Array#shift` and `Array#splice`
  // in IE < 9, Firefox < 10, Narwhal, and RingoJS
  if (!support.spliceObjects) {
    baseEach(['pop', 'shift', 'splice'], function(methodName) {
      var func = arrayRef[methodName],
          isSplice = methodName == 'splice';

      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            value = this.__wrapped__,
            result = func.apply(value, arguments);

        if (value.length === 0) {
          delete value[0];
        }
        return (chainAll || isSplice)
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });
  }

  /*--------------------------------------------------------------------------*/

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = lodash;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return lodash;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = lodash)._ = lodash;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = lodash;
    }
  }
  else {
    // in a browser or Rhino
    root._ = lodash;
  }
}.call(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],32:[function(require,module,exports){
var xml = require('./xml');
var blockUtils = require('./block_utils');
var utils = require('./utils');
var msg = require('../locale/zh_tw/common');
var _ = utils.getLodash();

/**
 * Create the textual XML for a math_number block.
 * @param {number|string} number The numeric amount, expressed as a
 *     number or string.  Non-numeric strings may also be specified,
 *     such as '???'.
 * @return {string} The textual representation of a math_number block.
 */
exports.makeMathNumber = function(number) {
  return '<block type="math_number"><title name="NUM">' +
    number + '</title></block>';
};

/**
 * Generate a required blocks dictionary for a simple block that does not
 * have any parameters or values.
 * @param {string} block_type The block type.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.simpleBlock = function(block_type) {
  return {test: function(block) {return block.type == block_type; },
    type: block_type};
};

/**
 * Generate a required blocks dictionary for a repeat loop.  This does not
 * test for the specified repeat count but includes it in the suggested block.
 * @param {number|string} count The suggested repeat count.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.repeat = function(count) {
  // This checks for a controls_repeat block rather than looking for 'for',
  // since the latter may be generated by Turtle 2's draw_a_square.
  return {test: function(block) {return block.type == 'controls_repeat';},
    type: 'controls_repeat', titles: {'TIMES': count}};
};

/**
 * Generate a required blocks dictionary for a simple repeat loop.  This does not
 * test for the specified repeat count but includes it in the suggested block.
 * @param {number|string} count The suggested repeat count.
 * @return {Object} A required blocks dictionary able to check for and
 *     generate the specified block.
 */
exports.repeatSimpleBlock = function(count) {
  return {test: function(block) {return block.type == 'controls_repeat_simplified';},
    type: 'controls_repeat_simplified', titles: {'TIMES': count}};
};

/**
 * Returns an array of required blocks by comparing a list of blocks with
 * a list of app specific block tests (defined in <app>/requiredBlocks.js)
 */
exports.makeTestsFromBuilderRequiredBlocks = function (customRequiredBlocks) {
  var blocksXml = xml.parseElement(customRequiredBlocks);

  var requiredBlocksTests = [];
  Array.prototype.forEach.call(blocksXml.childNodes, function(childNode) {
    // Only look at element nodes
    if (childNode.nodeType !== 1) {
      return;
    }
    switch (childNode.getAttribute('type')) {
      case 'pick_one':
        requiredBlocksTests.push(testsFromPickOne(childNode));
        break;
      case 'procedures_defnoreturn':
      case 'procedures_defreturn':
        requiredBlocksTests.push(testsFromProcedure(childNode));
        break;
      default:
        requiredBlocksTests.push([testFromBlock(childNode)]);
    }
  });

  return requiredBlocksTests;
};

/**
 * Given xml for a single block generates a block test
 */
function testFromBlock (node) {
  return {
    test: function(userBlock) {
      // Encode userBlock while ignoring child statements
      var userElement = Blockly.Xml.blockToDom_(userBlock, true);
      return elementsEquivalent(node, userElement);
    },
    blockDisplayXML: xml.serialize(node)
  };
}

/**
 * Given xml for a pick_one block, generates a test that checks that at least
 * one of the child blocks is used.  If none are used, the first option will be
 * displayed as feedback
 */
function testsFromPickOne(node) {
  var tests = [];
  // child of pick_one is a statement block.  we want first child of that
  var statement = node.getElementsByTagName('statement')[0];
  var block = statement.getElementsByTagName('block')[0];
  var next;
  do {
    // if we have a next block, we want to generate our test without that
    next = block.getElementsByTagName('next')[0];
    if (next) {
      block.removeChild(next);
    }
    tests.push(testFromBlock(block));
    if (next) {
      block = next.getElementsByTagName('block')[0];
    }
  } while (next);
  return tests;
}

/**
 * Given xml for a procedure block, generates tests that check for required
 * number of params not declared
 */
function testsFromProcedure(node) {
  var paramCount = node.querySelectorAll('mutation > arg').length;
  var emptyBlock = node.cloneNode(true);
  emptyBlock.removeChild(emptyBlock.lastChild);
  return [{
    // Ensure that all required blocks match a block with the same number of
    // params. There's no guarantee users will name their function the same as
    // the required block, so only match on number of params.
    test: function(userBlock) {
      if (userBlock.type === node.getAttribute('type')) {
        return paramCount === userBlock.parameterNames_.length;
      }
      // Block isn't the same type, return false to keep searching.
      return false;
    },
    message: msg.errorRequiredParamsMissing(),
    blockDisplayXML: '<xml></xml>'
  }];
}

/**
 * Checks two DOM elements to see whether or not they are equivalent
 * We consider them equivalent if they have the same tagName, attributes,
 * and children
 */
function elementsEquivalent(expected, given) {
  if (!(expected instanceof Element && given instanceof Element)) {
    // if we expect ???, allow match with anything
    if (expected instanceof Text && expected.textContent === '???') {
      return true;
    }
    return expected.isEqualNode(given);
  }
  // Not fully clear to me why, but blockToDom_ seems to return us an element
  // with a tagName in all caps
  if (expected.tagName.toLowerCase() !== given.tagName.toLowerCase()) {
    return false;
  }

  if (!attributesEquivalent(expected, given)) {
    return false;
  }

  if (!childrenEquivalent(expected, given)) {
    return false;
  }

  return true;
}

/**
 * A list of attributes we want to ignore when comparing attributes, and a
 * function for easily determining whether an attribute is in the list.
 */
var ignorableAttributes = [
  'deletable',
  'movable',
  'editable',
  'inline',
  'uservisible',
  'usercreated',
  'id'
];

ignorableAttributes.contains = function (attr) {
  return ignorableAttributes.indexOf(attr.name) !== -1;
};

/**
 * Checks whether the attributes for two different elements are equivalent
 */
function attributesEquivalent(expected, given) {
  var attributes1 = _.reject(expected.attributes, ignorableAttributes.contains);
  var attributes2 = _.reject(given.attributes, ignorableAttributes.contains);
  if (attributes1.length !== attributes2.length) {
    return false;
  }
  for (var i = 0; i < attributes1.length; i++) {
    var attr1 = attributes1[i];
    var attr2 = attributes2[i];
    if (attr1.name !== attr2.name) {
      return false;
    }
    if (attr1.value !== attr2.value) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether the children of two different elements are equivalent
 */
function childrenEquivalent(expected, given) {
  var children1 = expected.childNodes;
  var children2 = given.childNodes;
  if (children1.length !== children2.length) {
    return false;
  }
  for (var i = 0; i < children1.length; i++) {
    if (!elementsEquivalent(children1[i], children2[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if two blocks are "equivalent"
 * Currently means their type and all of their titles match exactly
 * @param blockA
 * @param blockB
 */
exports.blocksMatch = function(blockA, blockB) {
  var typesMatch = blockA.type === blockB.type;
  var titlesMatch = exports.blockTitlesMatch(blockA, blockB);
  return typesMatch && titlesMatch;
};

/**
 * Compares two blocks' titles, returns true if they all match
 * @returns {boolean}
 * @param blockA
 * @param blockB
 */
exports.blockTitlesMatch = function(blockA, blockB) {
  var blockATitles = blockA.getTitles();
  var blockBTitles = blockB.getTitles();

  var nameCompare = function(a,b) { return a.name < b.name; };
  blockATitles.sort(nameCompare);
  blockBTitles.sort(nameCompare);

  for (var i = 0; i < blockATitles.length || i < blockBTitles.length; i++) {
    var blockATitle = blockATitles[i];
    var blockBTitle = blockBTitles[i];
    if (!blockATitle || !blockBTitle ||
      !titlesMatch(blockATitle, blockBTitle)) {
      return false;
    }
  }
  return true;
};

var titlesMatch = function(titleA, titleB) {
  return titleB.name === titleA.name &&
    titleB.getValue() === titleA.getValue();
};

},{"../locale/zh_tw/common":50,"./block_utils":4,"./utils":48,"./xml":49}],33:[function(require,module,exports){
/**
 * A set of functional blocks
 */

var msg = require('../locale/zh_tw/common');
var functionalBlockUtils = require('./functionalBlockUtils');
var initTitledFunctionalBlock = functionalBlockUtils.initTitledFunctionalBlock;

exports.install = function(blockly, generator, gensym) {
  installPlus(blockly, generator, gensym);
  installMinus(blockly, generator, gensym);
  installTimes(blockly, generator, gensym);
  installDividedBy(blockly, generator, gensym);
  installGreaterThan(blockly, generator, gensym);
  installLessThan(blockly, generator, gensym);
  installNumberEquals(blockly, generator, gensym);
  installStringEquals(blockly, generator, gensym);
  installLogicalAnd(blockly, generator, gensym);
  installLogicalOr(blockly, generator, gensym);
  installLogicalNot(blockly, generator, gensym);
  installBoolean(blockly, generator, gensym);
  installMathNumber(blockly, generator, gensym);
  installString(blockly, generator, gensym);
  installCond(blockly, generator, 1);
  installCond(blockly, generator, 2);
  installCond(blockly, generator, 3);
  installCond(blockly, generator, 4);
};

function installPlus(blockly, generator, gensym) {
  blockly.Blocks.functional_plus = {

    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '+', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_plus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " + " + arg2;
  };
}

function installMinus(blockly, generator, gensym) {
  blockly.Blocks.functional_minus = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '-', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_minus = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " - " + arg2;
  };
}

function installTimes(blockly, generator, gensym) {
  blockly.Blocks.functional_times = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '*', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_times = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " * " + arg2;
  };
}

function installDividedBy(blockly, generator, gensym) {
  blockly.Blocks.functional_dividedby = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '/', 'Number', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_dividedby = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return arg1 + " / " + arg2;
  };
}

// Install comparators

function installGreaterThan(blockly, generator, gensym) {
  blockly.Blocks.functional_greater_than = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '>', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_greater_than = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " > " + arg2 + ')';
  };
}

function installLessThan(blockly, generator, gensym) {
  blockly.Blocks.functional_less_than = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '<', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_less_than = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " < " + arg2 + ')';
  };
}

function installNumberEquals(blockly, generator, gensym) {
  blockly.Blocks.functional_number_equals = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, '=', 'boolean', [
        { name: 'ARG1', type: 'Number' },
        { name: 'ARG2', type: 'Number' }
      ]);
    }
  };

  generator.functional_number_equals = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " == " + arg2 + ')';
  };
}

function installStringEquals(blockly, generator, gensym) {
  blockly.Blocks.functional_string_equals = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, msg.stringEquals(), 'boolean', [
        { name: 'ARG1', type: 'string' },
        { name: 'ARG2', type: 'string' }
      ]);
    }
  };

  generator.functional_string_equals = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || '';
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || '';
    return '(' + arg1 + " == " + arg2 + ')';
  };
}

// Install boolean operators

function installLogicalAnd(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_and = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'and', 'boolean', [
        { name: 'ARG1', type: 'boolean' },
        { name: 'ARG2', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_and = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " && " + arg2 + ')';
  };
}

function installLogicalOr(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_or = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'or', 'boolean', [
        { name: 'ARG1', type: 'boolean' },
        { name: 'ARG2', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_or = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    var arg2 = Blockly.JavaScript.statementToCode(this, 'ARG2', false) || 0;
    return '(' + arg1 + " || " + arg2 + ')';
  };
}

function installLogicalNot(blockly, generator, gensym) {
  blockly.Blocks.functional_logical_not = {
    helpUrl: '',
    init: function() {
      initTitledFunctionalBlock(this, 'not', 'boolean', [
        { name: 'ARG1', type: 'boolean' }
      ]);
    }
  };

  generator.functional_logical_not = function() {
    var arg1 = Blockly.JavaScript.statementToCode(this, 'ARG1', false) || 0;
    return '!(' + arg1 + ')';
  };
}

function installBoolean(blockly, generator, gensym) {
  blockly.Blocks.functional_boolean = {
    // Boolean value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.boolean);
      var values = blockly.Blocks.functional_boolean.VALUES;
      this.appendDummyInput()
          .appendTitle(new blockly.FieldDropdown(values), 'VAL')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'boolean');
    }
  };

  blockly.Blocks.functional_boolean.VALUES = [
        [msg.booleanTrue(), 'true'],
        [msg.booleanFalse(), 'false']];

  generator.functional_boolean = function() {
    return this.getTitleValue('VAL');
  };
}

function installMathNumber(blockly, generator, gensym) {
  blockly.Blocks.functional_math_number = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.Number);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldTextInput('0',
            Blockly.FieldTextInput.numberValidator), 'NUM')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number = function() {
    return this.getTitleValue('NUM');
  };

  blockly.Blocks.functional_math_number_dropdown = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.Number);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldDropdown(), 'NUM')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'Number');
    }
  };

  generator.functional_math_number_dropdown = generator.functional_math_number;
}

function installString(blockly, generator) {
  blockly.Blocks.functional_string = {
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, functionalBlockUtils.colors.string);
      this.appendDummyInput()
        .appendTitle(new Blockly.FieldLabel('"'))
        .appendTitle(new Blockly.FieldTextInput(''), 'VAL')
        .appendTitle(new Blockly.FieldLabel('"'))
        .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator.functional_string = function() {
    return blockly.JavaScript.quote_(this.getTitleValue('VAL'));
  };
}

/**
 * Implements the cond block. numPairs represents the number of
 * condition-value pairs before the default value.
 */
function installCond(blockly, generator, numPairs) {
  var blockName = 'functional_cond_' + numPairs;
  blockly.Blocks[blockName] = {
    helpUrl: '',
    init: function() {
      var args = [];
      for (var i = 0; i < numPairs; i++) {
        args.push({name: 'COND' + i, type: 'boolean', default: 'false'});
        args.push({name: 'VALUE' + i, type: 'none', default: ''});
      }
      args.push({name: 'DEFAULT', type: 'none', default: ''});
      var blockTitle = 'cond';
      var wrapWidth = 2;
      initTitledFunctionalBlock(this, blockTitle, undefined, args, wrapWidth);
    }
  };

  /**
   * // generates code like:
   * function() {
   *   if (cond1) { return value1; }
   *   else if (cond2) {return value2; }
   *   ...
   *   else { return default; }
   * }()
   */
  generator[blockName] = function() {
    var cond, value, defaultValue;
    var code = 'function() {\n  ';
    for (var i = 0; i < numPairs; i++) {
      if (i > 0) {
        code += 'else ';
      }
      cond = Blockly.JavaScript.statementToCode(this, 'COND' + i, false) ||
          false;
      value = Blockly.JavaScript.statementToCode(this, 'VALUE' + i, false) ||
          '';
      code += 'if (' + cond + ') { return ' + value + '; }\n  ';
    }
    defaultValue = Blockly.JavaScript.statementToCode(this, 'DEFAULT', false) ||
        '';
    code += 'else { return ' + defaultValue + '; }\n';
    code += '}()';
    return code;
  };
}

},{"../locale/zh_tw/common":50,"./functionalBlockUtils":29}],34:[function(require,module,exports){
// avatar: A 1029x51 set of 21 avatar images.

exports.load = function(assetUrl, id) {
  var skinUrl = function(path) {
    if (path !== undefined) {
      return assetUrl('media/skins/' + id + '/' + path);
    } else {
      return null;
    }
  };
  var skin = {
    id: id,
    assetUrl: skinUrl,
    // Images
    avatar: skinUrl('avatar.png'),
    avatar_2x: skinUrl('avatar_2x.png'),
    tiles: skinUrl('tiles.png'),
    goal: skinUrl('goal.png'),
    obstacle: skinUrl('obstacle.png'),
    smallStaticAvatar: skinUrl('small_static_avatar.png'),
    staticAvatar: skinUrl('static_avatar.png'),
    winAvatar: skinUrl('win_avatar.png'),
    failureAvatar: skinUrl('failure_avatar.png'),
    decorationAnimation: skinUrl('decoration_animation.png'),
    decorationAnimation_2x: skinUrl('decoration_animation_2x.png'),
    repeatImage: assetUrl('media/common_images/repeat-arrows.png'),
    leftArrow: assetUrl('media/common_images/moveleft.png'),
    downArrow: assetUrl('media/common_images/movedown.png'),
    upArrow: assetUrl('media/common_images/moveup.png'),
    rightArrow: assetUrl('media/common_images/moveright.png'),
    leftJumpArrow: assetUrl('media/common_images/jumpleft.png'),
    downJumpArrow: assetUrl('media/common_images/jumpdown.png'),
    upJumpArrow: assetUrl('media/common_images/jumpup.png'),
    rightJumpArrow: assetUrl('media/common_images/jumpright.png'),
    northLineDraw: assetUrl('media/common_images/draw-north.png'),
    southLineDraw: assetUrl('media/common_images/draw-south.png'),
    eastLineDraw: assetUrl('media/common_images/draw-east.png'),
    westLineDraw: assetUrl('media/common_images/draw-west.png'),
    shortLineDraw: assetUrl('media/common_images/draw-short.png'),
    longLineDraw: assetUrl('media/common_images/draw-long.png'),
    shortLineDrawRight: assetUrl('media/common_images/draw-short-right.png'),
    longLineDrawRight: assetUrl('media/common_images/draw-long-right.png'),
    longLine: assetUrl('media/common_images/move-long.png'),
    shortLine: assetUrl('media/common_images/move-short.png'),
    soundIcon: assetUrl('media/common_images/play-sound.png'),
    clickIcon: assetUrl('media/common_images/when-click-hand.png'),
    startIcon: assetUrl('media/common_images/when-run.png'),
    runArrow: assetUrl('media/common_images/run-arrow.png'),
    endIcon: assetUrl('media/common_images/end-icon.png'),
    speedFast: assetUrl('media/common_images/speed-fast.png'),
    speedMedium: assetUrl('media/common_images/speed-medium.png'),
    speedSlow: assetUrl('media/common_images/speed-slow.png'),
    scoreCard: assetUrl('media/common_images/increment-score-75percent.png'),
    rainbowMenu: assetUrl('media/common_images/rainbow-menuicon.png'),
    ropeMenu: assetUrl('media/common_images/rope-menuicon.png'),
    squigglyMenu: assetUrl('media/common_images/squiggly-menuicon.png'),
    swirlyMenu: assetUrl('media/common_images/swirlyline-menuicon.png'),
    patternDefault: assetUrl('media/common_images/defaultline-menuicon.png'),
    rainbowLine: assetUrl('media/common_images/rainbow.png'),
    ropeLine: assetUrl('media/common_images/rope.png'),
    squigglyLine: assetUrl('media/common_images/squiggly.png'),
    swirlyLine: assetUrl('media/common_images/swirlyline.png'),
    randomPurpleIcon: assetUrl('media/common_images/random-purple.png'),

    // Sounds
    startSound: [skinUrl('start.mp3'), skinUrl('start.ogg')],
    winSound: [skinUrl('win.mp3'), skinUrl('win.ogg')],
    failureSound: [skinUrl('failure.mp3'), skinUrl('failure.ogg')]
  };

  return skin;
};

},{}],35:[function(require,module,exports){
/**
 * Blockly Apps: SVG Slider
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

/**
 * @fileoverview A slider control in SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';
var dom = require('./dom');

/**
 * Object representing a horizontal slider widget.
 * @param {number} x The horizontal offset of the slider.
 * @param {number} y The vertical offset of the slider.
 * @param {number} width The total width of the slider.
 * @param {!Element} svgParent The SVG element to append the slider to.
 * @param {Function} opt_changeFunc Optional callback function that will be
 *     called when the slider is moved.  The current value is passed.
 * @constructor
 */
var Slider = function(x, y, width, svgParent, opt_changeFunc) {
  this.KNOB_Y_ = y - 12;
  this.KNOB_MIN_X_ = x + 8;
  this.KNOB_MAX_X_ = x + width - 8;
  this.value_ = 0.5;
  this.changeFunc_ = opt_changeFunc;
  this.isAndroid_ = dom.isAndroid();
  this.isIOS_ = dom.isIOS();
  this.isWindowsTouch_ = dom.isWindowsTouch();

  // Draw the slider.
  /*
  <line class="sliderTrack" x1="10" y1="35" x2="140" y2="35" />
  <path id="knob"
      transform="translate(67, 23)"
      d="m 8,0 l -8,8 v 12 h 16 v -12 z" />
  */
  var track = document.createElementNS(Slider.SVG_NS_, 'line');
  track.setAttribute('class', 'sliderTrack');
  track.setAttribute('x1', x);
  track.setAttribute('y1', y);
  track.setAttribute('x2', x + width);
  track.setAttribute('y2', y);
  svgParent.appendChild(track);
  this.track_ = track;
  var knob = document.createElementNS(Slider.SVG_NS_, 'path');
  knob.setAttribute('class', 'sliderKnob');
  knob.setAttribute('d', 'm 0,0 l -8,8 v 12 h 16 v -12 z');
  svgParent.appendChild(knob);
  this.knob_ = knob;
  this.setValue(0.5);

  // Find the root SVG object.
  while (svgParent && svgParent.nodeName.toLowerCase() != 'svg') {
    svgParent = svgParent.parentNode;
  }
  this.SVG_ = svgParent;

  // Bind the events to this slider.
  var thisSlider = this;
  dom.addMouseDownTouchEvent(this.knob_, function(e) {
    return thisSlider.knobMouseDown_(e);
  });
  dom.addMouseDownTouchEvent(this.track_, function(e) {
    return thisSlider.trackMouseDown_(e);
  });
  dom.addMouseUpTouchEvent(this.SVG_, Slider.knobMouseUp_);
  dom.addMouseMoveTouchEvent(this.SVG_, Slider.knobMouseMove_);
  // Don't add touch events for mouseover. The UX is better on Android
  // and iOS if the drag action is allowed to continue when the
  // touchmove target moves above or below the SVG element.
  Slider.bindEvent_(document, 'mouseover', Slider.mouseOver_);
};

Slider.SVG_NS_ = 'http://www.w3.org/2000/svg';

Slider.activeSlider_ = null;
Slider.startMouseX_ = 0;
Slider.startKnobX_ = 0;

/**
 * Start a drag when clicking down on the knob.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.knobMouseDown_ = function(e) {
  this.beginDrag_(this.mouseToSvg_(e));

  // Stop browser from attempting to drag the knob.
  e.preventDefault();
  return false;
};

/**
 * Snap the knob to the mouse location and start a drag
 * when clicking on the track (but not on the knob).
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.trackMouseDown_ = function(e) {
  var mouseSVGPosition = this.mouseToSvg_(e);
  this.snapToPosition_(mouseSVGPosition.x);
  this.beginDrag_(mouseSVGPosition);

  // Stop browser from attempting to drag the track.
  e.preventDefault();
  return false;
};

/**
 * Start dragging the slider knob.
 * @param {!Object} mouseStartSVG Mouse start position in SVG space
 * @private
 */
Slider.prototype.beginDrag_ = function(startMouseSVG) {
  Slider.activeSlider_ = this;
  Slider.startMouseX_ = startMouseSVG.x;
  Slider.startKnobX_ = 0;
  var transform = this.knob_.getAttribute('transform');
  if (transform) {
    var r = transform.match(/translate\(\s*([-\d.]+)/);
    if (r) {
      Slider.startKnobX_ = Number(r[1]);
    }
  }
};

/**
 * Snap the slider knob to the clicked position.
 * @param {number} xPosition SVG x-coordinate
 * @private
 */
Slider.prototype.snapToPosition_ = function(xPosition) {
  var x = Math.min(Math.max(xPosition, 
        this.KNOB_MIN_X_), this.KNOB_MAX_X_);
  this.knob_.setAttribute('transform',
      'translate(' + x + ',' + this.KNOB_Y_ + ')');

  this.value_ = (x - this.KNOB_MIN_X_) /
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_);
  if (this.changeFunc_) {
    this.changeFunc_(this.value_);
  }
};

/**
 * Stop a drag when clicking up anywhere.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.knobMouseUp_ = function(e) {
  Slider.activeSlider_ = null;
};

/**
 * Stop a drag when the mouse enters a node not part of the SVG.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.mouseOver_ = function(e) {
  if (!Slider.activeSlider_) {
    return;
  }
  // Find the root SVG object.
  for (var node = e.target; node; node = node.parentNode) {
    if (node == Slider.activeSlider_.SVG_) {
      return;
    }
  }
  Slider.knobMouseUp_(e);
};

/**
 * Drag the knob to follow the mouse.
 * @param {!Event} e Mouse-move event.
 * @private
 */
Slider.knobMouseMove_ = function(e) {
  var thisSlider = Slider.activeSlider_;
  if (!thisSlider) {
    return;
  }
  var x = thisSlider.mouseToSvg_(e).x - Slider.startMouseX_ +
      Slider.startKnobX_;
  thisSlider.snapToPosition_(x);
};

/**
 * Returns the slider's value (0.0 - 1.0).
 * @return {number} Current value.
 */
Slider.prototype.getValue = function() {
  return this.value_;
};

/**
 * Sets the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Slider.prototype.setValue = function(value) {
  this.value_ = Math.min(Math.max(value, 0), 1);
  var x = this.KNOB_MIN_X_ +
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_) * this.value_;
  this.knob_.setAttribute('transform',
      'translate(' + x + ',' + this.KNOB_Y_ + ')');
};

/**
 * Convert the mouse coordinates into SVG coordinates.
 * @param {!Object} e Object with x and y mouse coordinates.
 * @return {!Object} Object with x and y properties in SVG coordinates.
 * @private
 */
Slider.prototype.mouseToSvg_ = function(e) {
  var svgPoint = this.SVG_.createSVGPoint();
  // Most browsers provide clientX/Y. iOS only provides pageX/Y.
  // Android Chrome only provides coordinates within e.changedTouches.
  if (this.isWindowsTouch_) {
    // Only screenX/Y properly accounts for zooming in on windows touch.
    svgPoint.x = e.screenX;
    svgPoint.y = e.screenY;
  } else if (this.isAndroid_) {
    svgPoint.x = e.changedTouches[0].pageX;
    svgPoint.y = e.changedTouches[0].pageY;
  } else if (this.isIOS_) {
    svgPoint.x = e.pageX;
    svgPoint.y = e.pageY;
  } else {
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
  }
  var matrix = this.SVG_.getScreenCTM().inverse();
  return svgPoint.matrixTransform(matrix);
};

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 * @private
 */
Slider.bindEvent_ = function(element, name, func) {
  element.addEventListener(name, func, false);
};

module.exports = Slider;

},{"./dom":10}],36:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div><span>Instructions: </span><textarea type="text" name="instructions"></textarea></div>\n<div><span>Level Name: </span><textarea type="text" name="level_name"></textarea></div>\n<button id="create-level-button" class="launch">\n  Create Level\n</button>\n<div id="builder-error"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],37:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common'); ; buf.push('\n\n');3; if (data.ok) {; buf.push('  <div class="farSide" style="padding: 1ex 3ex 0">\n    <button id="ok-button" class="secondary">\n      ', escape((5,  msg.dialogOK() )), '\n    </button>\n  </div>\n');8; }; buf.push('\n');9; if (data.previousLevel) {; buf.push('  <button id="back-button" class="launch">\n    ', escape((10,  msg.backToPreviousLevel() )), '\n  </button>\n');12; }; buf.push('\n');13; if (data.tryAgain) {; buf.push('  ');13; if (data.isK1 && !data.freePlay) {; buf.push('    <div id="again-button" class="launch arrow-container arrow-left">\n      <div class="arrow-head"><img src="', escape((14,  data.assetUrl('media/tryagain-arrow-head.png') )), '" alt="Arrowhead" width="67" height="130"/></div>\n      <div class="arrow-text">', escape((15,  msg.tryAgain() )), '</div>\n    </div>\n  ');17; } else {; buf.push('    ');17; if (data.hintRequestExperiment === "left") {; buf.push('      <button id="hint-request-button" class="launch">\n        ', escape((18,  msg.hintRequest() )), '\n      </button>\n      <button id="again-button" class="launch">\n        ', escape((21,  msg.tryAgain() )), '\n      </button>\n    ');23; } else if (data.hintRequestExperiment == "right") {; buf.push('      <button id="again-button" class="launch">\n        ', escape((24,  msg.tryAgain() )), '\n      </button>\n      <button id="hint-request-button" class="launch">\n        ', escape((27,  msg.hintRequest() )), '\n      </button>\n    ');29; } else {; buf.push('      <button id="again-button" class="launch">\n        ', escape((30,  msg.tryAgain() )), '\n      </button>\n    ');32; }; buf.push('  ');32; }; buf.push('');32; }; buf.push('\n');33; if (data.nextLevel) {; buf.push('  ');33; if (data.isK1 && !data.freePlay) {; buf.push('    <div id="continue-button" class="launch arrow-container arrow-right">\n      <div class="arrow-head"><img src="', escape((34,  data.assetUrl('media/next-arrow-head.png') )), '" alt="Arrowhead" width="66" height="130"/></div>\n      <div class="arrow-text">', escape((35,  msg.continue() )), '</div>\n    </div>\n  ');37; } else {; buf.push('    <button id="continue-button" class="launch" style="float: right">\n      ', escape((38,  msg.continue() )), '\n    </button>\n  ');40; }; buf.push('');40; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],38:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div class="generated-code-container">\n  <p class="generatedCodeMessage">', (2,  message ), '</p>\n  <pre class="generatedCode">', escape((3,  code )), '</pre>\n</div>\n\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],39:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common'); ; buf.push('\n\n<p class=\'dialog-title\'>', escape((3,  msg.puzzleTitle(locals) )), '</p>\n');4; if (locals.instructions) {; buf.push('  <p>', escape((4,  locals.instructions )), '</p>\n');5; };; buf.push('');5; if (locals.aniGifURL) {; buf.push('  <img class="aniGif example-image" src=\'', escape((5,  locals.aniGifURL )), '\'/>\n');6; };; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],40:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common') ; buf.push('\n\n');3; var root = location.protocol + '//' + location.host.replace('learn\.', '').replace('studio\.', ''); 
; buf.push('\n\n<div id="learn">\n\n  <h1><a href="', escape((7,  root )), '">', escape((7,  msg.wantToLearn() )), '</a></h1>\n  <a href="', escape((8,  root )), '"><img id="learn-to-code" src="', escape((8,  BlocklyApps.assetUrl('media/promo.png') )), '"></a>\n  <a href="', escape((9,  root )), '">', escape((9,  msg.watchVideo() )), '</a>\n  <a href="', escape((10,  root )), '">', escape((10,  msg.tryHOC() )), '</a>\n  <a href="', escape((11,  location.protocol + '//' + location.host 
)), '">', escape((11,  msg.signup() )), '</a>\n\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],41:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common') ; buf.push('\n\n<div id="make-your-own">\n\n  <h1><a href=', escape((5,  data.makeUrl )), '>', escape((5,  data.makeString )), '</a></h1>\n  <a href=', escape((6,  data.makeUrl )), '><img src=', escape((6,  data.makeImage )), '></a>\n\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],42:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../../locale/zh_tw/common');
  var hideRunButton = locals.hideRunButton || false;
; buf.push('\n\n<div id="rotateContainer" style="background-image: url(', escape((6,  assetUrl('media/mobile_tutorial_turnphone.png') )), ')">\n  <div id="rotateText">\n    <p>', escape((8,  msg.rotateText() )), '<br>', escape((8,  msg.orientationLock() )), '</p>\n  </div>\n</div>\n\n');12; var instructions = function() {; buf.push('  <div id="bubble" class="clearfix">\n    <table id="prompt-table">\n      <tr>\n        <td id="prompt-icon-cell">\n          <img id="prompt-icon"/>\n        </td>\n        <td id="prompt-cell">\n          <p id="prompt">\n          </p>\n        </td>\n      </tr>\n    </table>\n    <div id="ani-gif-preview-wrapper">\n      <div id="ani-gif-preview">\n        <img id="play-button" src="', escape((26,  assetUrl('media/play-circle.png') )), '"/>\n      </div>\n    </div>\n  </div>\n');30; };; buf.push('\n');31; // A spot for the server to inject some HTML for help content.
var helpArea = function(html) {; buf.push('  ');32; if (html) {; buf.push('    <div id="helpArea">\n      ', (33,  html ), '\n    </div>\n  ');35; }; buf.push('');35; };; buf.push('\n<div id="visualizationColumn">\n  <div id="visualization">\n    ', (38,  data.visualization ), '\n  </div>\n\n  <div id="belowVisualization">\n\n    <div id="gameButtons">\n      <button id="runButton" class="launch blocklyLaunch ', escape((44,  hideRunButton ? 'invisible' : '')), '">\n        <div>', escape((45,  msg.runProgram() )), '</div>\n        <img src="', escape((46,  assetUrl('media/1x1.gif') )), '" class="run26"/>\n      </button>\n      <button id="resetButton" class="launch blocklyLaunch" style="display: none">\n        <div>', escape((49,  msg.resetProgram() )), '</div>\n        <img src="', escape((50,  assetUrl('media/1x1.gif') )), '" class="reset26"/>\n      </button>\n      ');52; if (data.controls) { ; buf.push('\n      ', (53,  data.controls ), '\n      ');54; } ; buf.push('\n      ');55; if (data.extraControlRows) { ; buf.push('\n      ', (56,  data.extraControlRows ), '\n      ');57; } ; buf.push('\n    </div>\n\n    ');60; instructions() ; buf.push('\n    ');61; helpArea(data.helpHtml) ; buf.push('\n\n  </div>\n</div>\n\n');66; if (data.editCode) { ; buf.push('\n  <div id="codeWorkspace">\n');68; } else { ; buf.push('\n  <div id="blockly">\n');70; } ; buf.push('\n  <div id="headers" dir="', escape((71,  data.localeDirection )), '">\n    <div id="toolbox-header" class="blockly-header"><span>', escape((72,  msg.toolboxHeader() )), '</span></div>\n    <div id="workspace-header" class="blockly-header">\n      <span id="workspace-header-span">', escape((74,  msg.workspaceHeader())), ' </span>\n      <div id="blockCounter">\n        <div id="blockUsed" class=', escape((76,  data.blockCounterClass )), '>\n          ', escape((77,  data.blockUsed )), '\n        </div>\n        <span>&nbsp;/</span>\n        <span id="idealBlockNumber">', escape((80,  data.idealBlockNumber )), '</span>\n      </div>\n    </div>\n    <div id="show-code-header" class="blockly-header"><span>', escape((83,  msg.showCodeHeader() )), '</span></div>\n  </div>\n  ');85; if (data.editCode) { ; buf.push('\n    <div id="codeTextbox"></div>\n  ');87; } ; buf.push('\n</div>\n\n<div class="clear"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],43:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<!DOCTYPE html>\n<html dir="', escape((2,  options.localeDirection )), '">\n<head>\n  <meta charset="utf-8">\n  <title>Blockly</title>\n  <script type="text/javascript" src="', escape((6,  assetUrl('js/' + options.locale + '/vendor.js') )), '"></script>\n  <script type="text/javascript" src="', escape((7,  assetUrl('js/' + options.locale + '/' + app + '.js') )), '"></script>\n  <script type="text/javascript">\n    ');9; // delay to onload to fix IE9. 
; buf.push('\n    window.onload = function() {\n      ', escape((11,  app )), 'Main(', (11, filters. json ( options )), ');\n    };\n  </script>\n</head>\n<body>\n  <div id="blockly" class="readonly"></div>\n  <style>\n    html, body {\n      background-color: transparent;\n      margin: 0;\n      padding:0;\n      overflow: hidden;\n      height: 100%;\n      font-family: \'Gotham A\', \'Gotham B\', sans-serif;\n    }\n    .blocklyText, .blocklyMenuText, .blocklyTreeLabel, .blocklyHtmlInput,\n        .blocklyIconMark, .blocklyTooltipText, .goog-menuitem-content {\n      font-family: \'Gotham A\', \'Gotham B\', sans-serif;\n    }\n    #blockly>svg {\n      background-color: transparent;\n      border: none;\n    }\n    #blockly {\n      position: absolute;\n      top: 0;\n      left: 0;\n      overflow: hidden;\n      height: 100%;\n      width: 100%;\n    }\n  </style>\n</body>\n</html>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],44:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<p id="share-fail-explanation">', escape((1,  shareFailure.message )), '</p>\n\n');3; if (shareFailure.contents) { ; buf.push('\n  <div class="share-fail-excerpt">\n    <pre class="generatedCode">', escape((5,  shareFailure.contents )), '</pre>\n  </div>\n');7; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],45:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common'); ; buf.push('\n');2; if (options.feedbackImage) { ; buf.push('\n  <div class="sharing">\n    <img class="feedback-image" src="', escape((4,  options.feedbackImage )), '">\n  </div>\n');6; } ; buf.push('\n\n<div class="sharing">\n  <div class="social-buttons">\n  ');10; if (!options.onMainPage) { ; buf.push('\n    <button id="print-button">\n      ', escape((12,  msg.print() )), '\n    </button>\n  ');14; } ; buf.push('\n');15; if (options.alreadySaved) { ; buf.push('\n  <button class="saved-to-gallery" disabled>\n    ', escape((17,  msg.savedToGallery() )), '\n  </button>\n');19; } else if (options.saveToGalleryUrl) { ; buf.push('\n  <button id="save-to-gallery-button" class="launch">\n    ', escape((21,  msg.saveToGallery() )), '\n  </button>\n');23; } ; buf.push('\n  </div>\n\n');26; if (options.response && options.response.level_source) { ; buf.push('\n  ');27; if (options.appStrings && options.appStrings.sharingText) { ; buf.push('\n    <div>', escape((28,  options.appStrings.sharingText )), '</div>\n  ');29; } ; buf.push('\n\n  <div>\n    <input type="text" id="sharing-input" value=', escape((32,  options.response.level_source )), ' readonly>\n  </div>\n\n  <div class=\'social-buttons\'>\n    ');36; if (options.facebookUrl) {; buf.push('      <a href=\'', escape((36,  options.facebookUrl )), '\' target="_blank" class="popup-window">\n        <img src=\'', escape((37,  BlocklyApps.assetUrl("media/facebook_purple.png") )), '\' />\n      </a>\n    ');39; }; buf.push('\n    ');40; if (options.twitterUrl) {; buf.push('      <a href=\'', escape((40,  options.twitterUrl )), '\' target="_blank" class="popup-window">\n        <img src=\'', escape((41,  BlocklyApps.assetUrl("media/twitter_purple.png") )), '\' />\n      </a>\n    ');43; }; buf.push('    ');43; if (options.sendToPhone) {; buf.push('      <a id="sharing-phone" href="" onClick="return false;">\n        <img src=\'', escape((44,  BlocklyApps.assetUrl("media/phone_purple.png") )), '\' />\n      </a>\n    ');46; }; buf.push('    ');46; if (options.level.shapewaysUrl && !options.onMainPage && options.sendToPhone) {; buf.push('      <a id="sharing-shapeways" href="" onClick="return false;">\n        <img src=\'', escape((47,  BlocklyApps.assetUrl("media/shapeways_purple.png") )), '\' />\n      </a>\n    ');49; }; buf.push('  </div>\n');50; } ; buf.push('\n</div>\n<div id="send-to-phone" class="sharing" style="display: none">\n  <label for="phone">Enter a US phone number:</label>\n  <input type="text" id="phone" name="phone" />\n  <button id="phone-submit" onClick="return false;">Send</button>\n  <div id="phone-charges">A text message will be sent via <a href="http://twilio.com">Twilio</a>. Charges may apply to the recipient.</div>\n</div>\n');58; if (options.response && options.response.level_source && options.level.shapewaysUrl) {; buf.push('  <div id="shapeways-message" class="sharing" style="display: none">\n    <div id="shapeways-message-body">You\'ll be redirected to Shapeways.com to order and purchase a 3D print.</div>\n    <button id="shapeways-print-go-button" onclick="window.open(\'', escape((60,  options.level.shapewaysUrl )), '\', \'_blank\')">Go to Shapeways</button>\n    <div id="shapeways-message-body-disclaimer">Students under 13 years need a parent or guardian to do 3D printing.</div>\n  </div>\n');63; }; buf.push(''); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],46:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1; var msg = require('../../locale/zh_tw/common'); ; buf.push('\n\n<p id="num-lines-of-code" class="lines-of-code-message">\n  ', escape((4,  msg.numLinesOfCodeWritten({ numLines: numLinesWritten }) )), '\n  <button id="show-code-button" href="#">\n    ', escape((6,  msg.showGeneratedCode() )), '\n  </button>\n</p>\n\n');10; if (totalNumLinesWritten !== 0) { ; buf.push('\n  <p id="total-num-lines-of-code" class="lines-of-code-message">\n    ', escape((12,  msg.totalNumLinesOfCodeWritten({ numLines: totalNumLinesWritten }) )), '\n  </p>\n');14; } ; buf.push('\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/zh_tw/common":50,"ejs":52}],47:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape, rethrow) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div class=\'trophy\'><img class=\'trophyimg\' src=\'', escape((1,  img_url )), '\'><br>', escape((1,  concept_name )), '</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":52}],48:[function(require,module,exports){
var xml = require('./xml');
var savedAmd;

// Do some hackery to make it so that lodash doesn't think it's being loaded
// via require js
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
  savedAmd = define.amd;
  define.amd = false;
}

// get lodash
var _ = require('./lodash');
var Hammer = require('./hammer');

// undo hackery
if (typeof define == 'function' && savedAmd) {
  define.amd = savedAmd;
  savedAmd = null;
}

exports.getLodash = function () {
  return _;
};

exports.getHammer = function () {
  return Hammer;
};

exports.shallowCopy = function(source) {
  var result = {};
  for (var prop in source) {
    result[prop] = source[prop];
  }

  return result;
};

/**
 * Returns a clone of the object, stripping any functions on it.
 */
exports.cloneWithoutFunctions = function(object) {
  return JSON.parse(JSON.stringify(object));
};

/**
 * Returns a new object with the properties from defaults overriden by any
 * properties in options. Leaves defaults and options unchanged.
 */
exports.extend = function(defaults, options) {
  var finalOptions = exports.shallowCopy(defaults);
  for (var prop in options) {
    finalOptions[prop] = options[prop];
  }

  return finalOptions;
};

exports.escapeHtml = function(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Version of modulo which, unlike javascript's `%` operator,
 * will always return a positive remainder.
 * @param number
 * @param mod
 */
exports.mod = function(number, mod) {
  return ((number % mod) + mod) % mod;
};

/**
 * Generates an array of integers from start to end inclusive
 */
exports.range = function(start, end) {
  var ints = [];
  for (var i = start; i <= end; i++) {
    ints.push(i);
  }
  return ints;
};

/**
 * Given two functions, generates a function that returns the result of the
 * second function if and only if the first function returns true
 */
exports.executeIfConditional = function (conditional, fn) {
  return function () {
    if (conditional()) {
      return fn.apply(this, arguments);
    }
  };
};

/**
 * Removes all single and double quotes from a string
 * @param inputString
 * @returns {string} string without quotes
 */
exports.stripQuotes = function(inputString) {
  return inputString.replace(/["']/g, "");
};

/**
 * Defines an inheritance relationship between parent class and this class.
 */
Function.prototype.inherits = function (parent) {
  this.prototype = _.create(parent.prototype, { constructor: parent });
};

/**
 * Wrap a couple of our Blockly number validators to allow for ???.  This is
 * done so that level builders can specify required blocks with wildcard fields.
 */
exports.wrapNumberValidatorsForLevelBuilder = function () {
  var nonNeg = Blockly.FieldTextInput.nonnegativeIntegerValidator;
  var numVal = Blockly.FieldTextInput.numberValidator;

  Blockly.FieldTextInput.nonnegativeIntegerValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return nonNeg(text);
  };

  Blockly.FieldTextInput.numberValidator = function (text) {
    if (text === '???') {
      return text;
    }
    return numVal(text);
  };
};

/**
 * Generate code aliases in Javascript based on some level data.
 */
exports.generateCodeAliases = function (codeFunctions, parentObjName) {
  var code = '';
  // Insert aliases from level codeBlocks into code
  if (codeFunctions) {
    for (var i = 0; i < codeFunctions.length; i++) {
      var cf = codeFunctions[i];
      code += "var " + cf.func + " = function() { ";
      if (cf.idArgNone) {
        code += "return " + parentObjName + "." + cf.func + ".apply(" +
                parentObjName + ", arguments); };\n";
      } else {
        code += "var newArgs = " +
          (cf.idArgLast ? "arguments.concat(['']);" : "[''].concat(arguments);") +
          " return " + parentObjName + "." + cf.func +
          ".apply(" + parentObjName + ", newArgs); };\n";
      }
    }
  }
  return code;
};

/**
 * Generate a palette for the droplet editor based on some level data.
 */
exports.generateDropletPalette = function (codeFunctions, categoryInfo) {
  // TODO: figure out localization for droplet scenario
  var stdPalette = [
    {
      name: 'Control',
      color: 'orange',
      blocks: [
        {
          block: 'for (var i = 0; i < 4; i++) {\n  __;\n}',
          title: 'Do something multiple times'
        }, {
          block: 'if (__) {\n  __;\n}',
          title: 'Do something only if a condition is true'
        }, {
          block: 'if (__) {\n  __;\n} else {\n  __;\n}',
          title: 'Do something if a condition is true, otherwise do something else'
        }, {
          block: 'while (__) {\n  __;\n}',
          title: 'Repeat something while a condition is true'
        }
      ]
    }, {
      name: 'Math',
      color: 'green',
      blocks: [
        {
          block: 'var x = __;',
          title: 'Create a variable for the first time'
        }, {
          block: 'x = __;',
          title: 'Reassign a variable'
        }, {
          block: '__ + __',
          title: 'Add two numbers'
        }, {
          block: '__ - __',
          title: 'Subtract two numbers'
        }, {
          block: '__ * __',
          title: 'Multiply two numbers'
        }, {
          block: '__ / __',
          title: 'Divide two numbers'
        }, {
          block: '__ === __',
          title: 'Compare two numbers'
        }, {
          block: '__ > __',
          title: 'Compare two numbers'
        }, {
          block: '__ < __',
          title: 'Compare two numbers'
        }, {
          block: 'random()',
          title: 'Get a random number between 0 and 1'
        }, {
          block: 'round(__)',
          title: 'Round to the nearest integer'
        }, {
          block: 'abs(__)',
          title: 'Absolute value'
        }, {
          block: 'max(__, __)',
          title: 'Maximum value'
        }, {
          block: 'min(__, __)',
          title: 'Minimum value'
        }
      ]
    }, {
      name: 'Functions',
      color: 'violet',
      blocks: [
        {
          block: 'function myFunction() {\n  __;\n}',
          title: 'Create a function without an argument'
        }, {
          block: 'function myFunction(n) {\n  __;\n}',
          title: 'Create a function with an argument'
        }, {
          block: 'myFunction()',
          title: 'Use a function without an argument'
        }, {
          block: 'myFunction(n)',
          title: 'Use a function with argument'
        }
      ]
    }
  ];

  var defCategoryInfo = {
    'Actions': {
      'color': 'blue',
      'blocks': []
    }
  };
  categoryInfo = categoryInfo || defCategoryInfo;

  if (codeFunctions) {
    for (var i = 0; i < codeFunctions.length; i++) {
      var cf = codeFunctions[i];
      if (cf.category === 'hidden') {
        continue;
      }
      var block = cf.func + "(";
      if (cf.params) {
        for (var j = 0; j < cf.params.length; j++) {
          if (j !== 0) {
            block += ", ";
          }
          block += cf.params[j];
        }
      }
      block += ")";
      var blockPair = {
        block: block,
        title: cf.func
      };
      categoryInfo[cf.category || 'Actions'].blocks.push(blockPair);
    }
  }

  var addedPalette = [];
  for (var category in categoryInfo) {
    categoryInfo[category].name = category;
    addedPalette.push(categoryInfo[category]);
  }

  return addedPalette.concat(stdPalette);
};

/**
 * Generate an Ace editor completer for a set of APIs based on some level data.
 */
exports.generateAceApiCompleter = function (codeFunctions) {
  var apis = [];

  for (var i = 0; i < codeFunctions.length; i++) {
    var cf = codeFunctions[i];
    if (cf.category === 'hidden') {
      continue;
    }
    apis.push({
      name: 'api',
      value: cf.func,
      meta: 'local'
    });
  }

  return {
    getCompletions: function(editor, session, pos, prefix, callback) {
      if (prefix.length === 0) {
        callback(null, []);
        return;
      }
      callback(null, apis);
    }
  };
};

/**
 * Generate modeOptions for the droplet editor based on some level data.
 */
exports.generateDropletModeOptions = function (codeFunctions) {
  var modeOptions = {
    blockFunctions: [],
    valueFunctions: ['random', 'round', 'abs', 'max', 'min'],
    eitherFunctions: [],
  };

  // BLOCK, VALUE, and EITHER functions that are normally used in droplet
  // are included here in comments for reference. When we return our own
  // modeOptions from this function, it overrides and replaces the list below.
/*
  BLOCK_FUNCTIONS = ['fd', 'bk', 'rt', 'lt', 'slide', 'movexy', 'moveto', 'jump', 'jumpto', 'turnto', 'home', 'pen', 'fill', 'dot', 'box', 'mirror', 'twist', 'scale', 'pause', 'st', 'ht', 'cs', 'cg', 'ct', 'pu', 'pd', 'pe', 'pf', 'play', 'tone', 'silence', 'speed', 'wear', 'write', 'drawon', 'label', 'reload', 'see', 'sync', 'send', 'recv', 'click', 'mousemove', 'mouseup', 'mousedown', 'keyup', 'keydown', 'keypress', 'alert'];
  VALUE_FUNCTIONS = ['abs', 'acos', 'asin', 'atan', 'atan2', 'cos', 'sin', 'tan', 'ceil', 'floor', 'round', 'exp', 'ln', 'log10', 'pow', 'sqrt', 'max', 'min', 'random', 'pagexy', 'getxy', 'direction', 'distance', 'shown', 'hidden', 'inside', 'touches', 'within', 'notwithin', 'nearest', 'pressed', 'canvas', 'hsl', 'hsla', 'rgb', 'rgba', 'cell'];
  EITHER_FUNCTIONS = ['button', 'read', 'readstr', 'readnum', 'table', 'append', 'finish', 'loadscript'];
*/

  if (codeFunctions) {
    for (var i = 0; i < codeFunctions.length; i++) {
      if (codeFunctions[i].type === 'value') {
        modeOptions.valueFunctions.push(codeFunctions[i].func);
      }
      else if (codeFunctions[i].type === 'either') {
        modeOptions.eitherFunctions.push(codeFunctions[i].func);
      }
      else if (codeFunctions[i].type !== 'hidden') {
        modeOptions.blockFunctions.push(codeFunctions[i].func);
      }
    }
  }

  return modeOptions;
};

},{"./hammer":30,"./lodash":31,"./xml":49}],49:[function(require,module,exports){
// Serializes an XML DOM node to a string.
exports.serialize = function(node) {
  var serializer = new XMLSerializer();
  return serializer.serializeToString(node);
};

// Parses a single root element string, wrapping it in an <xml/> element
exports.parseElement = function(text) {
  var parser = new DOMParser();
  text = text.trim();
  var dom = text.indexOf('<xml') === 0 ?
      parser.parseFromString(text, 'text/xml') :
      parser.parseFromString('<xml>' + text + '</xml>', 'text/xml');
  var errors = dom.getElementsByTagName("parsererror");
  var element = dom.firstChild;
  if (!element) {
    throw new Error('Nothing parsed');
  }
  if (errors.length > 0) {
    throw new Error(exports.serialize(errors[0]));
  }
  if (element !== dom.lastChild) {
    throw new Error('Parsed multiple elements');
  }
  return element;
};

},{}],50:[function(require,module,exports){
var MessageFormat = require("messageformat");MessageFormat.locale.zh=function(n){return "other"}
exports.and = function(d){return "且"};

exports.booleanTrue = function(d){return "真"};

exports.booleanFalse = function(d){return "否"};

exports.blocklyMessage = function(d){return "模組化"};

exports.catActions = function(d){return "動作類別"};

exports.catColour = function(d){return "顏色"};

exports.catLogic = function(d){return "邏輯類別"};

exports.catLists = function(d){return "清單/陣列類"};

exports.catLoops = function(d){return "迴圈類別"};

exports.catMath = function(d){return "運算類別"};

exports.catProcedures = function(d){return "函數類別"};

exports.catText = function(d){return "本文"};

exports.catVariables = function(d){return "變數類別"};

exports.codeTooltip = function(d){return "觀看產生的 JavaScript 程式碼。"};

exports.continue = function(d){return "繼續 "};

exports.dialogCancel = function(d){return "取消"};

exports.dialogOK = function(d){return "確定"};

exports.directionNorthLetter = function(d){return "北"};

exports.directionSouthLetter = function(d){return "南"};

exports.directionEastLetter = function(d){return "東"};

exports.directionWestLetter = function(d){return "西"};

exports.end = function(d){return "結束"};

exports.emptyBlocksErrorMsg = function(d){return "\"重複\"和\"如果\"程式積木需要包含其它積木在裏面才能正常運作, 請檢查裏面是否有安排適當的程式積木."};

exports.emptyFunctionBlocksErrorMsg = function(d){return "\"函式\"積木裡面需要放其他程式積木才能運作"};

exports.errorEmptyFunctionBlockModal = function(d){return "在此需要定義您的函式區塊。按一下\"編輯\"並在綠色區塊內部拖曳區塊。"};

exports.errorIncompleteBlockInFunction = function(d){return "按一下\"編輯\"來確保你的函式定義中沒有缺少任何區塊。"};

exports.errorParamInputUnattached = function(d){return "在你的工作區，記得附加一區塊到每個函數區塊輸入的參數。"};

exports.errorUnusedParam = function(d){return "你加入一個參數區塊，但是定義中沒有使用它。請點按\"編輯\"，並且在綠色區塊裏放入參數區塊，以確認使用你的參數。"};

exports.errorRequiredParamsMissing = function(d){return "點按\"編輯\"和加入必要的參數值，為你的函數建立一個參數。拖曳新參數區塊到你的函數定義中。"};

exports.errorUnusedFunction = function(d){return "你建立一個函數，但從未在工作區上使用它 ！在工具箱中點按\"函數\"，並確認在你的程式中有使用它。"};

exports.errorQuestionMarksInNumberField = function(d){return "試把 \"???\" 更換為一個值。"};

exports.extraTopBlocks = function(d){return "你有一些程式積木沒連接上. 你是要把它們接在\"當按下執行時\"的積木後面嗎?"};

exports.finalStage = function(d){return "恭喜你 ！你已完成最後關卡的挑戰。"};

exports.finalStageTrophies = function(d){return "恭喜! 你已完成最後關卡並且贏得 "+p(d,"numTrophies",0,"zh",{"one":"一個獎盃","other":n(d,"numTrophies")+" 獎盃"})+"."};

exports.finish = function(d){return "完成 "};

exports.generatedCodeInfo = function(d){return "就連頂尖大學也使用\"程式積木\"來進行程式教學。(例如 :  "+v(d,"berkeleyLink")+", "+v(d,"harvardLink")+")。但是藏在底下的是，你所組裝的每個程式積木都可以用JavaScript 語法（世界上使用最廣的程式語言之一）來表示。"};

exports.hashError = function(d){return "對不起，'%1' 無法對應任何已儲存的程式。"};

exports.help = function(d){return "說明"};

exports.hintTitle = function(d){return "提示："};

exports.jump = function(d){return "跳"};

exports.levelIncompleteError = function(d){return "您已使用了所有必要類型的程式積木，但方式不太正確。"};

exports.listVariable = function(d){return "列表變數"};

exports.makeYourOwnFlappy = function(d){return "做出自己的 Flappy 遊戲"};

exports.missingBlocksErrorMsg = function(d){return "請嘗試組合底下的程式積木來解決這一個關卡。"};

exports.nextLevel = function(d){return "恭喜你 ！你已完成第"+v(d,"puzzleNumber")+"關。"};

exports.nextLevelTrophies = function(d){return "恭喜!你已經完成第"+v(d,"puzzleNumber")+"關，並且贏得"+p(d,"numTrophies",0,"zh",{"one":"1個獎盃","other":n(d,"numTrophies")+" 獎盃"})+"."};

exports.nextStage = function(d){return " 恭喜你！你已經完成 "+v(d,"stageName")+"。"};

exports.nextStageTrophies = function(d){return "恭喜您!你已經完成\""+v(d,"stageName")+"\"階段，並贏得"+p(d,"numTrophies",0,"zh",{"one":"1個獎盃","other":n(d,"numTrophies")+"個獎盃"})+"."};

exports.numBlocksNeeded = function(d){return "恭喜！你已經完成第 "+v(d,"puzzleNumber")+" 關。 (但是，你可以只使用 "+p(d,"numBlocks",0,"zh",{"one":"一個程式積木","other":n(d,"numBlocks")+" 程式積木"})+".來完成挑戰哦！)"};

exports.numLinesOfCodeWritten = function(d){return "你已經撰寫了 "+p(d,"numLines",0,"zh",{"one":"一行","other":n(d,"numLines")+" 行"})+" 的程式碼！"};

exports.play = function(d){return "玩"};

exports.print = function(d){return "列印"};

exports.puzzleTitle = function(d){return "階段 "+v(d,"stage_total")+" 的第"+v(d,"puzzle_number")+" 關"};

exports.repeat = function(d){return "重複"};

exports.resetProgram = function(d){return "再試一次"};

exports.runProgram = function(d){return "執行"};

exports.runTooltip = function(d){return "執行工作區中程式積木所定義的程式碼。"};

exports.score = function(d){return "分數"};

exports.showCodeHeader = function(d){return "顯示程式碼"};

exports.showBlocksHeader = function(d){return "顯示積木"};

exports.showGeneratedCode = function(d){return "顯示程式碼"};

exports.stringEquals = function(d){return "字串=？"};

exports.subtitle = function(d){return "一個視覺化的程式設計環境\n\n"};

exports.textVariable = function(d){return "文本"};

exports.tooFewBlocksMsg = function(d){return "你已使用所有必要類型的程式積木，但請嘗試使用更多同類型的程式積木來完成這個關卡。"};

exports.tooManyBlocksMsg = function(d){return "這個關卡可以用 < x id = 'START_SPAN' / > < x id = 'END_SPAN' / > 個程式積木解決。"};

exports.tooMuchWork = function(d){return "你讓我做太多工作了! 可以試著減少一些重複次數嗎?"};

exports.toolboxHeader = function(d){return "程式模塊"};

exports.openWorkspace = function(d){return "它如何運作的"};

exports.totalNumLinesOfCodeWritten = function(d){return "到目前為止共撰寫了："+p(d,"numLines",0,"zh",{"one":"1 行","other":n(d,"numLines")+" 行"})+" 的程式碼。"};

exports.tryAgain = function(d){return "再試一次"};

exports.hintRequest = function(d){return "查看提示"};

exports.backToPreviousLevel = function(d){return "返回上一階段"};

exports.saveToGallery = function(d){return "保存到作品集"};

exports.savedToGallery = function(d){return "已經保存到作品集了！"};

exports.shareFailure = function(d){return "抱歉, 我們無法分享這個程式"};

exports.workspaceHeader = function(d){return "在這裡組合你的程式積木："};

exports.workspaceHeaderJavaScript = function(d){return "在此輸入您的 JavaScript 代碼"};

exports.infinity = function(d){return "無窮"};

exports.rotateText = function(d){return "旋轉你的設備。"};

exports.orientationLock = function(d){return "在設備設置中關閉旋轉鎖定。"};

exports.wantToLearn = function(d){return "想要學習寫程式嗎?"};

exports.watchVideo = function(d){return "觀看影片"};

exports.when = function(d){return "當"};

exports.whenRun = function(d){return "當按下\"執行\"時"};

exports.tryHOC = function(d){return "試試一小時的程式設計課程"};

exports.signup = function(d){return "報名參加簡介課程"};

exports.hintHeader = function(d){return "提示："};

exports.genericFeedback = function(d){return "看看你的成果如何, 並試著修正你的程式"};

exports.defaultTwitterText = function(d){return "Check out what I made"};


},{"messageformat":63}],51:[function(require,module,exports){
var MessageFormat = require("messageformat");MessageFormat.locale.zh=function(n){return "other"}
exports.circleBlockTitle = function(d){return "圓(半徑、 樣式、 顏色)"};

exports.displayBlockTitle = function(d){return "顯示"};

exports.ellipseBlockTitle = function(d){return "橢圓(寬度,高度,樣式, 顏色)"};

exports.extraTopBlocks = function(d){return "你有未連接的區塊，難道你要將它們附加到\"顯示\"區塊嗎?"};

exports.overlayBlockTitle = function(d){return "覆蓋 (頂部, 底部)"};

exports.placeImageBlockTitle = function(d){return "放置圖片(x,y,圖片)"};

exports.offsetBlockTitle = function(d){return "偏移量 (x,y,圖片)"};

exports.rectangleBlockTitle = function(d){return "矩形 (寬度, 高度,樣式 , 顏色)"};

exports.reinfFeedbackMsg = function(d){return "你可以按\"重試\"按鈕，就可以編輯你的圖畫。"};

exports.rotateImageBlockTitle = function(d){return "旋轉(度數,圖片)"};

exports.scaleImageBlockTitle = function(d){return "比例(因數)"};

exports.squareBlockTitle = function(d){return "正方形(大小,樣式,顏色)"};

exports.starBlockTitle = function(d){return "星形(半徑,樣式, 顏色)"};

exports.radialStarBlockTitle = function(d){return "放射狀星形 (點, 內, 外,樣式, 顏色)"};

exports.polygonBlockTitle = function(d){return "polygon (sides, length, style, color)"};

exports.stringAppendBlockTitle = function(d){return "字串合併 (第一,第二)"};

exports.stringLengthBlockTitle = function(d){return "字串長度(字串)"};

exports.textBlockTitle = function(d){return "文字(字串, 大小, 顏色)"};

exports.triangleBlockTitle = function(d){return "三角形 (大小,樣式, 顏色)"};

exports.underlayBlockTitle = function(d){return "襯底(底部, 頂部)"};

exports.outline = function(d){return "輪廓"};

exports.solid = function(d){return "實心"};

exports.string = function(d){return "字串"};


},{"messageformat":63}],52:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , path = require('path')
  , dirname = path.dirname
  , extname = path.extname
  , join = path.join
  , fs = require('fs')
  , read = fs.readFileSync;

/**
 * Filters.
 *
 * @type Object
 */

var filters = exports.filters = require('./filters');

/**
 * Intermediate js cache.
 *
 * @type Object
 */

var cache = {};

/**
 * Clear intermediate js cache.
 *
 * @api public
 */

exports.clearCache = function(){
  cache = {};
};

/**
 * Translate filtered code into function calls.
 *
 * @param {String} js
 * @return {String}
 * @api private
 */

function filtered(js) {
  return js.substr(1).split('|').reduce(function(js, filter){
    var parts = filter.split(':')
      , name = parts.shift()
      , args = parts.join(':') || '';
    if (args) args = ', ' + args;
    return 'filters.' + name + '(' + js + args + ')';
  });
};

/**
 * Re-throw the given `err` in context to the
 * `str` of ejs, `filename`, and `lineno`.
 *
 * @param {Error} err
 * @param {String} str
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

function rethrow(err, str, filename, lineno){
  var lines = str.split('\n')
    , start = Math.max(lineno - 3, 0)
    , end = Math.min(lines.length, lineno + 3);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;
  
  throw err;
}

/**
 * Parse the given `str` of ejs, returning the function body.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

var parse = exports.parse = function(str, options){
  var options = options || {}
    , open = options.open || exports.open || '<%'
    , close = options.close || exports.close || '%>'
    , filename = options.filename
    , compileDebug = options.compileDebug !== false
    , buf = "";

  buf += 'var buf = [];';
  if (false !== options._with) buf += '\nwith (locals || {}) { (function(){ ';
  buf += '\n buf.push(\'';

  var lineno = 1;

  var consumeEOL = false;
  for (var i = 0, len = str.length; i < len; ++i) {
    var stri = str[i];
    if (str.slice(i, open.length + i) == open) {
      i += open.length
  
      var prefix, postfix, line = (compileDebug ? '__stack.lineno=' : '') + lineno;
      switch (str[i]) {
        case '=':
          prefix = "', escape((" + line + ', ';
          postfix = ")), '";
          ++i;
          break;
        case '-':
          prefix = "', (" + line + ', ';
          postfix = "), '";
          ++i;
          break;
        default:
          prefix = "');" + line + ';';
          postfix = "; buf.push('";
      }

      var end = str.indexOf(close, i)
        , js = str.substring(i, end)
        , start = i
        , include = null
        , n = 0;

      if ('-' == js[js.length-1]){
        js = js.substring(0, js.length - 2);
        consumeEOL = true;
      }

      if (0 == js.trim().indexOf('include')) {
        var name = js.trim().slice(7).trim();
        if (!filename) throw new Error('filename option is required for includes');
        var path = resolveInclude(name, filename);
        include = read(path, 'utf8');
        include = exports.parse(include, { filename: path, _with: false, open: open, close: close, compileDebug: compileDebug });
        buf += "' + (function(){" + include + "})() + '";
        js = '';
      }

      while (~(n = js.indexOf("\n", n))) n++, lineno++;
      if (js.substr(0, 1) == ':') js = filtered(js);
      if (js) {
        if (js.lastIndexOf('//') > js.lastIndexOf('\n')) js += '\n';
        buf += prefix;
        buf += js;
        buf += postfix;
      }
      i += end - start + close.length - 1;

    } else if (stri == "\\") {
      buf += "\\\\";
    } else if (stri == "'") {
      buf += "\\'";
    } else if (stri == "\r") {
      // ignore
    } else if (stri == "\n") {
      if (consumeEOL) {
        consumeEOL = false;
      } else {
        buf += "\\n";
        lineno++;
      }
    } else {
      buf += stri;
    }
  }

  if (false !== options._with) buf += "'); })();\n} \nreturn buf.join('');";
  else buf += "');\nreturn buf.join('');";
  return buf;
};

/**
 * Compile the given `str` of ejs into a `Function`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Function}
 * @api public
 */

var compile = exports.compile = function(str, options){
  options = options || {};
  var escape = options.escape || utils.escape;
  
  var input = JSON.stringify(str)
    , compileDebug = options.compileDebug !== false
    , client = options.client
    , filename = options.filename
        ? JSON.stringify(options.filename)
        : 'undefined';
  
  if (compileDebug) {
    // Adds the fancy stack trace meta info
    str = [
      'var __stack = { lineno: 1, input: ' + input + ', filename: ' + filename + ' };',
      rethrow.toString(),
      'try {',
      exports.parse(str, options),
      '} catch (err) {',
      '  rethrow(err, __stack.input, __stack.filename, __stack.lineno);',
      '}'
    ].join("\n");
  } else {
    str = exports.parse(str, options);
  }
  
  if (options.debug) console.log(str);
  if (client) str = 'escape = escape || ' + escape.toString() + ';\n' + str;

  try {
    var fn = new Function('locals, filters, escape, rethrow', str);
  } catch (err) {
    if ('SyntaxError' == err.name) {
      err.message += options.filename
        ? ' in ' + filename
        : ' while compiling ejs';
    }
    throw err;
  }

  if (client) return fn;

  return function(locals){
    return fn.call(this, locals, filters, escape, rethrow);
  }
};

/**
 * Render the given `str` of ejs.
 *
 * Options:
 *
 *   - `locals`          Local variables object
 *   - `cache`           Compiled functions are cached, requires `filename`
 *   - `filename`        Used by `cache` to key caches
 *   - `scope`           Function execution context
 *   - `debug`           Output generated function body
 *   - `open`            Open tag, defaulting to "<%"
 *   - `close`           Closing tag, defaulting to "%>"
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api public
 */

exports.render = function(str, options){
  var fn
    , options = options || {};

  if (options.cache) {
    if (options.filename) {
      fn = cache[options.filename] || (cache[options.filename] = compile(str, options));
    } else {
      throw new Error('"cache" option requires "filename".');
    }
  } else {
    fn = compile(str, options);
  }

  options.__proto__ = options.locals;
  return fn.call(options.scope, options);
};

/**
 * Render an EJS file at the given `path` and callback `fn(err, str)`.
 *
 * @param {String} path
 * @param {Object|Function} options or callback
 * @param {Function} fn
 * @api public
 */

exports.renderFile = function(path, options, fn){
  var key = path + ':string';

  if ('function' == typeof options) {
    fn = options, options = {};
  }

  options.filename = path;

  var str;
  try {
    str = options.cache
      ? cache[key] || (cache[key] = read(path, 'utf8'))
      : read(path, 'utf8');
  } catch (err) {
    fn(err);
    return;
  }
  fn(null, exports.render(str, options));
};

/**
 * Resolve include `name` relative to `filename`.
 *
 * @param {String} name
 * @param {String} filename
 * @return {String}
 * @api private
 */

function resolveInclude(name, filename) {
  var path = join(dirname(filename), name);
  var ext = extname(name);
  if (!ext) path += '.ejs';
  return path;
}

// express support

exports.__express = exports.renderFile;

/**
 * Expose to require().
 */

if (require.extensions) {
  require.extensions['.ejs'] = function (module, filename) {
    filename = filename || module.filename;
    var options = { filename: filename, client: true }
      , template = fs.readFileSync(filename).toString()
      , fn = compile(template, options);
    module._compile('module.exports = ' + fn.toString() + ';', filename);
  };
} else if (require.registerExtension) {
  require.registerExtension('.ejs', function(src) {
    return compile(src, {});
  });
}

},{"./filters":53,"./utils":54,"fs":55,"path":56}],53:[function(require,module,exports){
/*!
 * EJS - Filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * First element of the target `obj`.
 */

exports.first = function(obj) {
  return obj[0];
};

/**
 * Last element of the target `obj`.
 */

exports.last = function(obj) {
  return obj[obj.length - 1];
};

/**
 * Capitalize the first letter of the target `str`.
 */

exports.capitalize = function(str){
  str = String(str);
  return str[0].toUpperCase() + str.substr(1, str.length);
};

/**
 * Downcase the target `str`.
 */

exports.downcase = function(str){
  return String(str).toLowerCase();
};

/**
 * Uppercase the target `str`.
 */

exports.upcase = function(str){
  return String(str).toUpperCase();
};

/**
 * Sort the target `obj`.
 */

exports.sort = function(obj){
  return Object.create(obj).sort();
};

/**
 * Sort the target `obj` by the given `prop` ascending.
 */

exports.sort_by = function(obj, prop){
  return Object.create(obj).sort(function(a, b){
    a = a[prop], b = b[prop];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
};

/**
 * Size or length of the target `obj`.
 */

exports.size = exports.length = function(obj) {
  return obj.length;
};

/**
 * Add `a` and `b`.
 */

exports.plus = function(a, b){
  return Number(a) + Number(b);
};

/**
 * Subtract `b` from `a`.
 */

exports.minus = function(a, b){
  return Number(a) - Number(b);
};

/**
 * Multiply `a` by `b`.
 */

exports.times = function(a, b){
  return Number(a) * Number(b);
};

/**
 * Divide `a` by `b`.
 */

exports.divided_by = function(a, b){
  return Number(a) / Number(b);
};

/**
 * Join `obj` with the given `str`.
 */

exports.join = function(obj, str){
  return obj.join(str || ', ');
};

/**
 * Truncate `str` to `len`.
 */

exports.truncate = function(str, len, append){
  str = String(str);
  if (str.length > len) {
    str = str.slice(0, len);
    if (append) str += append;
  }
  return str;
};

/**
 * Truncate `str` to `n` words.
 */

exports.truncate_words = function(str, n){
  var str = String(str)
    , words = str.split(/ +/);
  return words.slice(0, n).join(' ');
};

/**
 * Replace `pattern` with `substitution` in `str`.
 */

exports.replace = function(str, pattern, substitution){
  return String(str).replace(pattern, substitution || '');
};

/**
 * Prepend `val` to `obj`.
 */

exports.prepend = function(obj, val){
  return Array.isArray(obj)
    ? [val].concat(obj)
    : val + obj;
};

/**
 * Append `val` to `obj`.
 */

exports.append = function(obj, val){
  return Array.isArray(obj)
    ? obj.concat(val)
    : obj + val;
};

/**
 * Map the given `prop`.
 */

exports.map = function(arr, prop){
  return arr.map(function(obj){
    return obj[prop];
  });
};

/**
 * Reverse the given `obj`.
 */

exports.reverse = function(obj){
  return Array.isArray(obj)
    ? obj.reverse()
    : String(obj).split('').reverse().join('');
};

/**
 * Get `prop` of the given `obj`.
 */

exports.get = function(obj, prop){
  return obj[prop];
};

/**
 * Packs the given `obj` into json string
 */
exports.json = function(obj){
  return JSON.stringify(obj);
};

},{}],54:[function(require,module,exports){

/*!
 * EJS
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html){
  return String(html)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};
 

},{}],55:[function(require,module,exports){

},{}],56:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("JkpR2F"))
},{"JkpR2F":57}],57:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],58:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],59:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],60:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],61:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":59,"./encode":60}],62:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":58,"querystring":61}],63:[function(require,module,exports){
/**
 * messageformat.js
 *
 * ICU PluralFormat + SelectFormat for JavaScript
 *
 * @author Alex Sexton - @SlexAxton
 * @version 0.1.7
 * @license WTFPL
 * @contributor_license Dojo CLA
*/
(function ( root ) {

  // Create the contructor function
  function MessageFormat ( locale, pluralFunc ) {
    var fallbackLocale;

    if ( locale && pluralFunc ) {
      MessageFormat.locale[ locale ] = pluralFunc;
    }

    // Defaults
    fallbackLocale = locale = locale || "en";
    pluralFunc = pluralFunc || MessageFormat.locale[ fallbackLocale = MessageFormat.Utils.getFallbackLocale( locale ) ];

    if ( ! pluralFunc ) {
      throw new Error( "Plural Function not found for locale: " + locale );
    }

    // Own Properties
    this.pluralFunc = pluralFunc;
    this.locale = locale;
    this.fallbackLocale = fallbackLocale;
  }

  // methods in common with the generated MessageFormat
  // check d
  c=function(d){
    if(!d){throw new Error("MessageFormat: No data passed to function.")}
  }
  // require number
  n=function(d,k,o){
    if(isNaN(d[k])){throw new Error("MessageFormat: `"+k+"` isnt a number.")}
    return d[k] - (o || 0);
  }
  // value
  v=function(d,k){
    c(d);
    return d[k];
  }
  // plural
  p=function(d,k,o,l,p){
    c(d);
    return d[k] in p ? p[d[k]] : (k = MessageFormat.locale[l](d[k]-o), k in p ? p[k] : p.other);
  }
  // select
  s=function(d,k,p){
    c(d);
    return d[k] in p ? p[d[k]] : p.other;
  }

  // Set up the locales object. Add in english by default
  MessageFormat.locale = {
    "en" : function ( n ) {
      if ( n === 1 ) {
        return "one";
      }
      return "other";
    }
  };

  // Build out our basic SafeString type
  // more or less stolen from Handlebars by @wycats
  MessageFormat.SafeString = function( string ) {
    this.string = string;
  };

  MessageFormat.SafeString.prototype.toString = function () {
    return this.string.toString();
  };

  MessageFormat.Utils = {
    numSub : function ( string, d, key, offset ) {
      // make sure that it's not an escaped octothorpe
      var s = string.replace( /(^|[^\\])#/g, '$1"+n(' + d + ',' + key + (offset ? ',' + offset : '') + ')+"' );
      return s.replace( /^""\+/, '' ).replace( /\+""$/, '' );
    },
    escapeExpression : function (string) {
      var escape = {
            "\n": "\\n",
            "\"": '\\"'
          },
          badChars = /[\n"]/g,
          possible = /[\n"]/,
          escapeChar = function(chr) {
            return escape[chr] || "&amp;";
          };

      // Don't escape SafeStrings, since they're already safe
      if ( string instanceof MessageFormat.SafeString ) {
        return string.toString();
      }
      else if ( string === null || string === false ) {
        return "";
      }

      if ( ! possible.test( string ) ) {
        return string;
      }
      return string.replace( badChars, escapeChar );
    },
    getFallbackLocale: function( locale ) {
      var tagSeparator = locale.indexOf("-") >= 0 ? "-" : "_";

      // Lets just be friends, fallback through the language tags
      while ( ! MessageFormat.locale.hasOwnProperty( locale ) ) {
        locale = locale.substring(0, locale.lastIndexOf( tagSeparator ));
        if (locale.length === 0) {
          return null;
        }
      }

      return locale;
    }
  };

  // This is generated and pulled in for browsers.
  var mparser = (function(){
    /*
     * Generated by PEG.js 0.7.0.
     *
     * http://pegjs.majda.cz/
     */
    
    function quote(s) {
      /*
       * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
       * string literal except for the closing quote character, backslash,
       * carriage return, line separator, paragraph separator, and line feed.
       * Any character may appear in the form of an escape sequence.
       *
       * For portability, we also escape escape all control and non-ASCII
       * characters. Note that "\0" and "\v" escape sequences are not used
       * because JSHint does not like the first and IE the second.
       */
       return '"' + s
        .replace(/\\/g, '\\\\')  // backslash
        .replace(/"/g, '\\"')    // closing quote character
        .replace(/\x08/g, '\\b') // backspace
        .replace(/\t/g, '\\t')   // horizontal tab
        .replace(/\n/g, '\\n')   // line feed
        .replace(/\f/g, '\\f')   // form feed
        .replace(/\r/g, '\\r')   // carriage return
        .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
        + '"';
    }
    
    var result = {
      /*
       * Parses the input with a generated parser. If the parsing is successfull,
       * returns a value explicitly or implicitly specified by the grammar from
       * which the parser was generated (see |PEG.buildParser|). If the parsing is
       * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
       */
      parse: function(input, startRule) {
        var parseFunctions = {
          "start": parse_start,
          "messageFormatPattern": parse_messageFormatPattern,
          "messageFormatPatternRight": parse_messageFormatPatternRight,
          "messageFormatElement": parse_messageFormatElement,
          "elementFormat": parse_elementFormat,
          "pluralStyle": parse_pluralStyle,
          "selectStyle": parse_selectStyle,
          "pluralFormatPattern": parse_pluralFormatPattern,
          "offsetPattern": parse_offsetPattern,
          "selectFormatPattern": parse_selectFormatPattern,
          "pluralForms": parse_pluralForms,
          "stringKey": parse_stringKey,
          "string": parse_string,
          "id": parse_id,
          "chars": parse_chars,
          "char": parse_char,
          "digits": parse_digits,
          "hexDigit": parse_hexDigit,
          "_": parse__,
          "whitespace": parse_whitespace
        };
        
        if (startRule !== undefined) {
          if (parseFunctions[startRule] === undefined) {
            throw new Error("Invalid rule name: " + quote(startRule) + ".");
          }
        } else {
          startRule = "start";
        }
        
        var pos = 0;
        var reportFailures = 0;
        var rightmostFailuresPos = 0;
        var rightmostFailuresExpected = [];
        
        function padLeft(input, padding, length) {
          var result = input;
          
          var padLength = length - input.length;
          for (var i = 0; i < padLength; i++) {
            result = padding + result;
          }
          
          return result;
        }
        
        function escape(ch) {
          var charCode = ch.charCodeAt(0);
          var escapeChar;
          var length;
          
          if (charCode <= 0xFF) {
            escapeChar = 'x';
            length = 2;
          } else {
            escapeChar = 'u';
            length = 4;
          }
          
          return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
        }
        
        function matchFailed(failure) {
          if (pos < rightmostFailuresPos) {
            return;
          }
          
          if (pos > rightmostFailuresPos) {
            rightmostFailuresPos = pos;
            rightmostFailuresExpected = [];
          }
          
          rightmostFailuresExpected.push(failure);
        }
        
        function parse_start() {
          var result0;
          var pos0;
          
          pos0 = pos;
          result0 = parse_messageFormatPattern();
          if (result0 !== null) {
            result0 = (function(offset, messageFormatPattern) { return { type: "program", program: messageFormatPattern }; })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_messageFormatPattern() {
          var result0, result1, result2;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse_string();
          if (result0 !== null) {
            result1 = [];
            result2 = parse_messageFormatPatternRight();
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_messageFormatPatternRight();
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, s1, inner) {
              var st = [];
              if ( s1 && s1.val ) {
                st.push( s1 );
              }
              for( var i in inner ){
                if ( inner.hasOwnProperty( i ) ) {
                  st.push( inner[ i ] );
                }
              }
              return { type: 'messageFormatPattern', statements: st };
            })(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_messageFormatPatternRight() {
          var result0, result1, result2, result3, result4, result5;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 123) {
            result0 = "{";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"{\"");
            }
          }
          if (result0 !== null) {
            result1 = parse__();
            if (result1 !== null) {
              result2 = parse_messageFormatElement();
              if (result2 !== null) {
                result3 = parse__();
                if (result3 !== null) {
                  if (input.charCodeAt(pos) === 125) {
                    result4 = "}";
                    pos++;
                  } else {
                    result4 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"}\"");
                    }
                  }
                  if (result4 !== null) {
                    result5 = parse_string();
                    if (result5 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, mfe, s1) {
              var res = [];
              if ( mfe ) {
                res.push(mfe);
              }
              if ( s1 && s1.val ) {
                res.push( s1 );
              }
              return { type: "messageFormatPatternRight", statements : res };
            })(pos0, result0[2], result0[5]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_messageFormatElement() {
          var result0, result1, result2;
          var pos0, pos1, pos2;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse_id();
          if (result0 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 44) {
              result1 = ",";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\",\"");
              }
            }
            if (result1 !== null) {
              result2 = parse_elementFormat();
              if (result2 !== null) {
                result1 = [result1, result2];
              } else {
                result1 = null;
                pos = pos2;
              }
            } else {
              result1 = null;
              pos = pos2;
            }
            result1 = result1 !== null ? result1 : "";
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, argIdx, efmt) {
              var res = { 
                type: "messageFormatElement",
                argumentIndex: argIdx
              };
              if ( efmt && efmt.length ) {
                res.elementFormat = efmt[1];
              }
              else {
                res.output = true;
              }
              return res;
            })(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_elementFormat() {
          var result0, result1, result2, result3, result4, result5, result6;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            if (input.substr(pos, 6) === "plural") {
              result1 = "plural";
              pos += 6;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"plural\"");
              }
            }
            if (result1 !== null) {
              result2 = parse__();
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 44) {
                  result3 = ",";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\",\"");
                  }
                }
                if (result3 !== null) {
                  result4 = parse__();
                  if (result4 !== null) {
                    result5 = parse_pluralStyle();
                    if (result5 !== null) {
                      result6 = parse__();
                      if (result6 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5, result6];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, t, s) {
              return {
                type : "elementFormat",
                key  : t,
                val  : s.val
              };
            })(pos0, result0[1], result0[5]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse__();
            if (result0 !== null) {
              if (input.substr(pos, 6) === "select") {
                result1 = "select";
                pos += 6;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"select\"");
                }
              }
              if (result1 !== null) {
                result2 = parse__();
                if (result2 !== null) {
                  if (input.charCodeAt(pos) === 44) {
                    result3 = ",";
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("\",\"");
                    }
                  }
                  if (result3 !== null) {
                    result4 = parse__();
                    if (result4 !== null) {
                      result5 = parse_selectStyle();
                      if (result5 !== null) {
                        result6 = parse__();
                        if (result6 !== null) {
                          result0 = [result0, result1, result2, result3, result4, result5, result6];
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, t, s) {
                return {
                  type : "elementFormat",
                  key  : t,
                  val  : s.val
                };
              })(pos0, result0[1], result0[5]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
          return result0;
        }
        
        function parse_pluralStyle() {
          var result0;
          var pos0;
          
          pos0 = pos;
          result0 = parse_pluralFormatPattern();
          if (result0 !== null) {
            result0 = (function(offset, pfp) {
              return { type: "pluralStyle", val: pfp };
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_selectStyle() {
          var result0;
          var pos0;
          
          pos0 = pos;
          result0 = parse_selectFormatPattern();
          if (result0 !== null) {
            result0 = (function(offset, sfp) {
              return { type: "selectStyle", val: sfp };
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_pluralFormatPattern() {
          var result0, result1, result2;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse_offsetPattern();
          result0 = result0 !== null ? result0 : "";
          if (result0 !== null) {
            result1 = [];
            result2 = parse_pluralForms();
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_pluralForms();
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, op, pf) {
              var res = {
                type: "pluralFormatPattern",
                pluralForms: pf
              };
              if ( op ) {
                res.offset = op;
              }
              else {
                res.offset = 0;
              }
              return res;
            })(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_offsetPattern() {
          var result0, result1, result2, result3, result4, result5, result6;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            if (input.substr(pos, 6) === "offset") {
              result1 = "offset";
              pos += 6;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"offset\"");
              }
            }
            if (result1 !== null) {
              result2 = parse__();
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 58) {
                  result3 = ":";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\":\"");
                  }
                }
                if (result3 !== null) {
                  result4 = parse__();
                  if (result4 !== null) {
                    result5 = parse_digits();
                    if (result5 !== null) {
                      result6 = parse__();
                      if (result6 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5, result6];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, d) {
              return d;
            })(pos0, result0[5]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_selectFormatPattern() {
          var result0, result1;
          var pos0;
          
          pos0 = pos;
          result0 = [];
          result1 = parse_pluralForms();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_pluralForms();
          }
          if (result0 !== null) {
            result0 = (function(offset, pf) {
              return {
                type: "selectFormatPattern",
                pluralForms: pf
              };
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_pluralForms() {
          var result0, result1, result2, result3, result4, result5, result6, result7;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            result1 = parse_stringKey();
            if (result1 !== null) {
              result2 = parse__();
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 123) {
                  result3 = "{";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"{\"");
                  }
                }
                if (result3 !== null) {
                  result4 = parse__();
                  if (result4 !== null) {
                    result5 = parse_messageFormatPattern();
                    if (result5 !== null) {
                      result6 = parse__();
                      if (result6 !== null) {
                        if (input.charCodeAt(pos) === 125) {
                          result7 = "}";
                          pos++;
                        } else {
                          result7 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"}\"");
                          }
                        }
                        if (result7 !== null) {
                          result0 = [result0, result1, result2, result3, result4, result5, result6, result7];
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, k, mfp) {
              return {
                type: "pluralForms",
                key: k,
                val: mfp
              };
            })(pos0, result0[1], result0[5]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_stringKey() {
          var result0, result1;
          var pos0, pos1;
          
          pos0 = pos;
          result0 = parse_id();
          if (result0 !== null) {
            result0 = (function(offset, i) {
              return i;
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            if (input.charCodeAt(pos) === 61) {
              result0 = "=";
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result0 !== null) {
              result1 = parse_digits();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, d) {
                return d;
              })(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
          return result0;
        }
        
        function parse_string() {
          var result0, result1, result2, result3, result4;
          var pos0, pos1, pos2;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            result1 = [];
            pos2 = pos;
            result2 = parse__();
            if (result2 !== null) {
              result3 = parse_chars();
              if (result3 !== null) {
                result4 = parse__();
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            while (result2 !== null) {
              result1.push(result2);
              pos2 = pos;
              result2 = parse__();
              if (result2 !== null) {
                result3 = parse_chars();
                if (result3 !== null) {
                  result4 = parse__();
                  if (result4 !== null) {
                    result2 = [result2, result3, result4];
                  } else {
                    result2 = null;
                    pos = pos2;
                  }
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, ws, s) {
              var tmp = [];
              for( var i = 0; i < s.length; ++i ) {
                for( var j = 0; j < s[ i ].length; ++j ) {
                  tmp.push(s[i][j]);
                }
              }
              return {
                type: "string",
                val: ws + tmp.join('')
              };
            })(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_id() {
          var result0, result1, result2, result3;
          var pos0, pos1;
          
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            if (/^[0-9a-zA-Z$_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9a-zA-Z$_]");
              }
            }
            if (result1 !== null) {
              result2 = [];
              if (/^[^ \t\n\r,.+={}]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[^ \\t\\n\\r,.+={}]");
                }
              }
              while (result3 !== null) {
                result2.push(result3);
                if (/^[^ \t\n\r,.+={}]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[^ \\t\\n\\r,.+={}]");
                  }
                }
              }
              if (result2 !== null) {
                result3 = parse__();
                if (result3 !== null) {
                  result0 = [result0, result1, result2, result3];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, s1, s2) {
              return s1 + (s2 ? s2.join('') : '');
            })(pos0, result0[1], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_chars() {
          var result0, result1;
          var pos0;
          
          pos0 = pos;
          result1 = parse_char();
          if (result1 !== null) {
            result0 = [];
            while (result1 !== null) {
              result0.push(result1);
              result1 = parse_char();
            }
          } else {
            result0 = null;
          }
          if (result0 !== null) {
            result0 = (function(offset, chars) { return chars.join(''); })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_char() {
          var result0, result1, result2, result3, result4;
          var pos0, pos1;
          
          pos0 = pos;
          if (/^[^{}\\\0-\x1F \t\n\r]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^{}\\\\\\0-\\x1F \\t\\n\\r]");
            }
          }
          if (result0 !== null) {
            result0 = (function(offset, x) {
              return x;
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            if (input.substr(pos, 2) === "\\#") {
              result0 = "\\#";
              pos += 2;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\\#\"");
              }
            }
            if (result0 !== null) {
              result0 = (function(offset) {
                return "\\#";
              })(pos0);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              if (input.substr(pos, 2) === "\\{") {
                result0 = "\\{";
                pos += 2;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\\{\"");
                }
              }
              if (result0 !== null) {
                result0 = (function(offset) {
                  return "\u007B";
                })(pos0);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                if (input.substr(pos, 2) === "\\}") {
                  result0 = "\\}";
                  pos += 2;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"\\\\}\"");
                  }
                }
                if (result0 !== null) {
                  result0 = (function(offset) {
                    return "\u007D";
                  })(pos0);
                }
                if (result0 === null) {
                  pos = pos0;
                }
                if (result0 === null) {
                  pos0 = pos;
                  pos1 = pos;
                  if (input.substr(pos, 2) === "\\u") {
                    result0 = "\\u";
                    pos += 2;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"\\\\u\"");
                    }
                  }
                  if (result0 !== null) {
                    result1 = parse_hexDigit();
                    if (result1 !== null) {
                      result2 = parse_hexDigit();
                      if (result2 !== null) {
                        result3 = parse_hexDigit();
                        if (result3 !== null) {
                          result4 = parse_hexDigit();
                          if (result4 !== null) {
                            result0 = [result0, result1, result2, result3, result4];
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                  if (result0 !== null) {
                    result0 = (function(offset, h1, h2, h3, h4) {
                        return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
                    })(pos0, result0[1], result0[2], result0[3], result0[4]);
                  }
                  if (result0 === null) {
                    pos = pos0;
                  }
                }
              }
            }
          }
          return result0;
        }
        
        function parse_digits() {
          var result0, result1;
          var pos0;
          
          pos0 = pos;
          if (/^[0-9]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          if (result1 !== null) {
            result0 = [];
            while (result1 !== null) {
              result0.push(result1);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result1 = input.charAt(pos);
                pos++;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            result0 = null;
          }
          if (result0 !== null) {
            result0 = (function(offset, ds) {
              return parseInt((ds.join('')), 10);
            })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          return result0;
        }
        
        function parse_hexDigit() {
          var result0;
          
          if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9a-fA-F]");
            }
          }
          return result0;
        }
        
        function parse__() {
          var result0, result1;
          var pos0;
          
          reportFailures++;
          pos0 = pos;
          result0 = [];
          result1 = parse_whitespace();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_whitespace();
          }
          if (result0 !== null) {
            result0 = (function(offset, w) { return w.join(''); })(pos0, result0);
          }
          if (result0 === null) {
            pos = pos0;
          }
          reportFailures--;
          if (reportFailures === 0 && result0 === null) {
            matchFailed("whitespace");
          }
          return result0;
        }
        
        function parse_whitespace() {
          var result0;
          
          if (/^[ \t\n\r]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[ \\t\\n\\r]");
            }
          }
          return result0;
        }
        
        
        function cleanupExpected(expected) {
          expected.sort();
          
          var lastExpected = null;
          var cleanExpected = [];
          for (var i = 0; i < expected.length; i++) {
            if (expected[i] !== lastExpected) {
              cleanExpected.push(expected[i]);
              lastExpected = expected[i];
            }
          }
          return cleanExpected;
        }
        
        function computeErrorPosition() {
          /*
           * The first idea was to use |String.split| to break the input up to the
           * error position along newlines and derive the line and column from
           * there. However IE's |split| implementation is so broken that it was
           * enough to prevent it.
           */
          
          var line = 1;
          var column = 1;
          var seenCR = false;
          
          for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
            var ch = input.charAt(i);
            if (ch === "\n") {
              if (!seenCR) { line++; }
              column = 1;
              seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              line++;
              column = 1;
              seenCR = true;
            } else {
              column++;
              seenCR = false;
            }
          }
          
          return { line: line, column: column };
        }
        
        
        var result = parseFunctions[startRule]();
        
        /*
         * The parser is now in one of the following three states:
         *
         * 1. The parser successfully parsed the whole input.
         *
         *    - |result !== null|
         *    - |pos === input.length|
         *    - |rightmostFailuresExpected| may or may not contain something
         *
         * 2. The parser successfully parsed only a part of the input.
         *
         *    - |result !== null|
         *    - |pos < input.length|
         *    - |rightmostFailuresExpected| may or may not contain something
         *
         * 3. The parser did not successfully parse any part of the input.
         *
         *   - |result === null|
         *   - |pos === 0|
         *   - |rightmostFailuresExpected| contains at least one failure
         *
         * All code following this comment (including called functions) must
         * handle these states.
         */
        if (result === null || pos !== input.length) {
          var offset = Math.max(pos, rightmostFailuresPos);
          var found = offset < input.length ? input.charAt(offset) : null;
          var errorPosition = computeErrorPosition();
          
          throw new this.SyntaxError(
            cleanupExpected(rightmostFailuresExpected),
            found,
            offset,
            errorPosition.line,
            errorPosition.column
          );
        }
        
        return result;
      },
      
      /* Returns the parser source code. */
      toSource: function() { return this._source; }
    };
    
    /* Thrown when a parser encounters a syntax error. */
    
    result.SyntaxError = function(expected, found, offset, line, column) {
      function buildMessage(expected, found) {
        var expectedHumanized, foundHumanized;
        
        switch (expected.length) {
          case 0:
            expectedHumanized = "end of input";
            break;
          case 1:
            expectedHumanized = expected[0];
            break;
          default:
            expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
              + " or "
              + expected[expected.length - 1];
        }
        
        foundHumanized = found ? quote(found) : "end of input";
        
        return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
      }
      
      this.name = "SyntaxError";
      this.expected = expected;
      this.found = found;
      this.message = buildMessage(expected, found);
      this.offset = offset;
      this.line = line;
      this.column = column;
    };
    
    result.SyntaxError.prototype = Error.prototype;
    
    return result;
  })();

  MessageFormat.prototype.parse = function () {
    // Bind to itself so error handling works
    return mparser.parse.apply( mparser, arguments );
  };

  MessageFormat.prototype.precompile = function ( ast ) {
    var self = this,
        needOther = false;

    function _next ( data ) {
      var res = JSON.parse( JSON.stringify( data ) );
      res.pf_count++;
      return res;
    }
    function interpMFP ( ast, data ) {
      // Set some default data
      data = data || { keys: {}, offset: {} };
      var r = [], i, tmp;

      switch ( ast.type ) {
        case 'program':
          return interpMFP( ast.program );
        case 'messageFormatPattern':
          for ( i = 0; i < ast.statements.length; ++i ) {
            r.push(interpMFP( ast.statements[i], data ));
          }
          tmp = r.join('+') || '""';
          return data.pf_count ? tmp : 'function(d){return ' + tmp + '}';
        case 'messageFormatPatternRight':
          for ( i = 0; i < ast.statements.length; ++i ) {
            r.push(interpMFP( ast.statements[i], data ));
          }
          return r.join('+');
        case 'messageFormatElement':
          data.pf_count = data.pf_count || 0;
          if ( ast.output ) {
            return 'v(d,"' + ast.argumentIndex + '")';
          }
          else {
            data.keys[data.pf_count] = '"' + ast.argumentIndex + '"';
            return interpMFP( ast.elementFormat, data );
          }
          return '';
        case 'elementFormat':
          if ( ast.key === 'select' ) {
            return 's(d,' + data.keys[data.pf_count] + ',' + interpMFP( ast.val, data ) + ')';
          }
          else if ( ast.key === 'plural' ) {
            data.offset[data.pf_count || 0] = ast.val.offset || 0;
            return 'p(d,' + data.keys[data.pf_count] + ',' + (data.offset[data.pf_count] || 0)
              + ',"' + self.fallbackLocale + '",' + interpMFP( ast.val, data ) + ')';
          }
          return '';
        /* // Unreachable cases.
        case 'pluralStyle':
        case 'selectStyle':*/
        case 'pluralFormatPattern':
          data.pf_count = data.pf_count || 0;
          needOther = true;
          // We're going to simultaneously check to make sure we hit the required 'other' option.

          for ( i = 0; i < ast.pluralForms.length; ++i ) {
            if ( ast.pluralForms[ i ].key === 'other' ) {
              needOther = false;
            }
            r.push('"' + ast.pluralForms[ i ].key + '":' + interpMFP( ast.pluralForms[ i ].val, _next(data) ));
          }
          if ( needOther ) {
            throw new Error("No 'other' form found in pluralFormatPattern " + data.pf_count);
          }
          return '{' + r.join(',') + '}';
        case 'selectFormatPattern':

          data.pf_count = data.pf_count || 0;
          data.offset[data.pf_count] = 0;
          needOther = true;

          for ( i = 0; i < ast.pluralForms.length; ++i ) {
            if ( ast.pluralForms[ i ].key === 'other' ) {
              needOther = false;
            }
            r.push('"' + ast.pluralForms[ i ].key + '":' + interpMFP( ast.pluralForms[ i ].val, _next(data) ));
          }
          if ( needOther ) {
            throw new Error("No 'other' form found in selectFormatPattern " + data.pf_count);
          }
          return '{' + r.join(',') + '}';
        /* // Unreachable
        case 'pluralForms':
        */
        case 'string':
          tmp = '"' + MessageFormat.Utils.escapeExpression( ast.val ) + '"';
          if ( data.pf_count ) {
            tmp = MessageFormat.Utils.numSub( tmp, 'd', data.keys[data.pf_count-1], data.offset[data.pf_count-1]);
          }
          return tmp;
        default:
          throw new Error( 'Bad AST type: ' + ast.type );
      }
    }
    return interpMFP( ast );
  };

  MessageFormat.prototype.compile = function ( message ) {
    return (new Function( 'MessageFormat',
      'return ' +
        this.precompile(
          this.parse( message )
        )
    ))(MessageFormat);
  };


  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = MessageFormat;
    }
    exports.MessageFormat = MessageFormat;
  }
  else if (typeof define === 'function' && define.amd) {
    define(function() {
      return MessageFormat;
    });
  }
  else {
    root['MessageFormat'] = MessageFormat;
  }

})( this );

},{}]},{},[26])