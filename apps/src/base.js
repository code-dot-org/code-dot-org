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
var StudioApp = module.exports;
var msg = require('../locale/current/common');
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
StudioApp.BASE_URL = undefined;

/**
 * If truthy, a version number to be appended to asset urls.
 */
StudioApp.CACHE_BUST = undefined;

/**
 * The current locale code.
 */
StudioApp.LOCALE = 'en_us';

/**
 * The minimum width of a playable whole blockly game.
 */
StudioApp.MIN_WIDTH = 900;
StudioApp.MIN_MOBILE_SHARE_WIDTH = 450;
StudioApp.MOBILE_NO_PADDING_SHARE_WIDTH = 400;
var WORKSPACE_PLAYSPACE_GAP = 15;

/**
 * Treat mobile devices with screen.width less than the value below as phones.
 */
StudioApp.MAX_PHONE_WIDTH = 500;

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

StudioApp.toggleRunReset = function(button) {
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
      (usingBlocks && StudioApp.enableShowBlockCount) ? 'inline-block' : 'none';
  }

  // Resize (including headers), so the category header will appear/disappear:
  StudioApp.onResize();
}

/**
 * Common startup tasks for all apps.
 */
StudioApp.init = function(config) {
  if (!config) {
    config = {};
  }

  StudioApp.share = config.share;

  // if true, dont provide links to share on fb/twitter
  StudioApp.disableSocialShare = config.disableSocialShare;
  StudioApp.sendToPhone = config.sendToPhone;
  StudioApp.noPadding = config.noPadding;

  StudioApp.IDEAL_BLOCK_NUM = config.level.ideal || Infinity;
  StudioApp.MIN_WORKSPACE_HEIGHT = config.level.minWorkspaceHeight || 800;
  StudioApp.REQUIRED_BLOCKS = config.level.requiredBlocks || [];

  // enableShowCode defaults to true if not defined
  StudioApp.enableShowCode = (config.enableShowCode === false);

  // If the level has no ideal block count, don't show a block count. If it does
  // have an ideal, show block count unless explicitly configured not to.
  if (config.level && (config.level.ideal === undefined || config.level.ideal === Infinity)) {
    StudioApp.enableShowBlockCount = false;
  } else {
    StudioApp.enableShowBlockCount = config.enableShowBlockCount !== false;
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
  var throttledRunClick = _.debounce(StudioApp.runButtonClick, 250, true);
  dom.addClickTouchEvent(runButton, throttledRunClick);
  dom.addClickTouchEvent(resetButton, StudioApp.resetButtonClick);

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

  if (StudioApp.usingBlockly && config.level.edit_blocks) {
    // Set a class on the main blockly div so CSS can style blocks differently
    Blockly.addClass_(container.querySelector('#blockly'), 'edit');
    // If in level builder editing blocks, make workspace extra tall
    visualizationColumn.style.height = "3000px";
    // Modify the arrangement of toolbox blocks so categories align left
    if (config.level.edit_blocks == "toolbox_blocks") {
      StudioApp.BLOCK_Y_COORDINATE_INTERVAL = 80;
      config.blockArrangement = { category : { x: 20 } };
    }
    // Enable param & var editing in levelbuilder, regardless of level setting
    config.level.disableParamEditing = false;
    config.level.disableVariableEditing = false;
  } else if (!config.hideSource) {
    visualizationColumn.style.minHeight =
        StudioApp.MIN_WORKSPACE_HEIGHT + 'px';
  }

  if (!config.embed && !StudioApp.share) {
    // Make the visualization responsive to screen size, except on share page.
    visualization.className += " responsive";
    visualizationColumn.className += " responsive";
  }

  if (config.hideSource) {
    StudioApp.hideSource = true;
    var workspaceDiv = StudioApp.editCode ?
                        document.getElementById('codeWorkspace') :
                        container.querySelector('#blockly');
    if(!config.embed || config.level.skipInstructionsPopup) {
      container.className = 'hide-source';
    }
    workspaceDiv.style.display = 'none';
    // For share page on mobile, do not show this part.
    if ((!config.embed) && (!StudioApp.share || !dom.isMobile())) {
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
  if (StudioApp.share && dom.isMobile()) {
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
        if (StudioApp.noPadding) {
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
  if (StudioApp.share) {
    var upSale = document.createElement('div');
    if (config.makeYourOwn) {
      upSale.innerHTML = require('./templates/makeYourOwn.html')({
        data: {
          makeUrl: config.makeUrl,
          makeString: config.makeString,
          makeImage: config.makeImage
        }
      });
      if (StudioApp.noPadding) {
        upSale.style.marginLeft = '10px';
      }
      belowViz.appendChild(upSale);
    } else if (typeof config.makeYourOwn === 'undefined') {
      upSale.innerHTML = require('./templates/learn.html')();
      belowViz.appendChild(upSale);
    }
  }

  // Record time at initialization.
  StudioApp.initTime = new Date().getTime();

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    var deviceWidth;
    var desiredWidth;
    var minWidth;
    if (StudioApp.share && dom.isMobile()) {
      // for mobile sharing, don't assume landscape mode, use screen.width
      deviceWidth = desiredWidth = screen.width;
      if (StudioApp.noPadding && screen.width < StudioApp.MAX_PHONE_WIDTH) {
        desiredWidth = Math.min(desiredWidth,
                                StudioApp.MOBILE_NO_PADDING_SHARE_WIDTH);
      }
      minWidth = StudioApp.noPadding ?
                    StudioApp.MOBILE_NO_PADDING_SHARE_WIDTH :
                    StudioApp.MIN_MOBILE_SHARE_WIDTH;
    }
    else {
      // assume we are in landscape mode, so width is the longer of the two
      deviceWidth = desiredWidth = Math.max(screen.width, screen.height);
      minWidth = StudioApp.MIN_WIDTH;
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

  StudioApp.Dialog = config.Dialog;

  var showCode = document.getElementById('show-code-header');
  if (showCode && StudioApp.enableShowCode) {
    dom.addClickTouchEvent(showCode, function() {
      if (StudioApp.editCode) {
        StudioApp.editor.toggleBlocks();
        updateHeadersAfterDropletToggle(StudioApp.editor.currentlyUsingBlocks);
        if (!StudioApp.editor.currentlyUsingBlocks) {
          StudioApp.editor.aceEditor.focus();
        }
      } else {
        feedback.showGeneratedCode(StudioApp.Dialog);
      }
    });
  }

  var blockCount = document.getElementById('blockCounter');
  if (blockCount && !StudioApp.enableShowBlockCount) {
    blockCount.style.display = 'none';
  }

  StudioApp.ICON = config.skin.staticAvatar;
  StudioApp.SMALL_ICON = config.skin.smallStaticAvatar;
  StudioApp.WIN_ICON = config.skin.winAvatar;
  StudioApp.FAILURE_ICON = config.skin.failureAvatar;

  if (config.level.instructionsIcon) {
    StudioApp.ICON = config.skin[config.level.instructionsIcon];
    StudioApp.WIN_ICON = config.skin[config.level.instructionsIcon];
  }

  if (config.showInstructionsWrapper) {
    config.showInstructionsWrapper(function () {
      var shouldAutoClose = !!config.level.aniGifURL;
      showInstructions(config.level, shouldAutoClose);
    });
  }

  // The share and embed pages do not show the rotateContainer.
  if (StudioApp.share || config.embed) {
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
      var displayWidth = StudioApp.MOBILE_NO_PADDING_SHARE_WIDTH;
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
    promptIcon.src = StudioApp.SMALL_ICON;
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

  if (StudioApp.editCode) {
    // using window.require forces us to use requirejs version of require
    window.require(['droplet'], function(droplet) {
      var displayMessage, examplePrograms, messageElement, onChange, startingText;
      StudioApp.editor = new droplet.Editor(document.getElementById('codeTextbox'), {
        mode: 'javascript',
        modeOptions: utils.generateDropletModeOptions(config.level.codeFunctions),
        palette: utils.generateDropletPalette(config.level.codeFunctions,
                                              config.level.categoryInfo)
      });

      StudioApp.editor.aceEditor.setShowPrintMargin(false);

      // Add an ace completer for the API functions exposed for this level
      if (config.level.codeFunctions) {
        var langTools = window.ace.require("ace/ext/language_tools");
        langTools.addCompleter(
            utils.generateAceApiCompleter(config.level.codeFunctions));
      }

      StudioApp.editor.aceEditor.setOptions({
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true
      });

      if (config.afterInject) {
        config.afterInject();
      }

      if (config.level.startBlocks) {
        StudioApp.editor.setValue(config.level.startBlocks);
      }
    });
  }

  if (StudioApp.usingBlockly) {
    // Allow empty blocks if editing blocks.
    if (config.level.edit_blocks) {
      StudioApp.CHECK_FOR_EMPTY_BLOCKS = false;
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
    StudioApp.inject(div, options);

    if (config.afterInject) {
      config.afterInject();
    }

    // Add the starting block(s).
    var startBlocks = config.level.startBlocks || '';
    if (config.forceInsertTopBlock) {
      startBlocks = blockUtils.forceInsertTopBlock(startBlocks, config.forceInsertTopBlock);
    }
    startBlocks = StudioApp.arrangeBlockPosition(startBlocks, config.blockArrangement);
    StudioApp.loadBlocks(startBlocks);
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
    StudioApp.onResize();
    var event = document.createEvent('UIEvents');
    event.initEvent('resize', true, true);  // event type, bubbling, cancelable
    window.dispatchEvent(event);
  });
  window.addEventListener('resize', StudioApp.onResize);

  // Call initial onResize() asynchronously - need 10ms delay to work around
  // relayout which changes height on the left side to the proper value
  window.setTimeout(function() {
    StudioApp.onResize();
    var event = document.createEvent('UIEvents');
    event.initEvent('resize', true, true);  // event type, bubbling, cancelable
    window.dispatchEvent(event);
  }, 10);

  StudioApp.reset(true);

  // Add display of blocks used.
  setIdealBlockNumber();

  // TODO (cpirich): implement block count for droplet (for now, blockly only)
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpaceEditor.addChangeListener(function() {
      StudioApp.updateBlockCount();
    });

    if (config.level.openFunctionDefinition) {
      Blockly.functionEditor.openAndEditFunction(config.level.openFunctionDefinition);
    }
  }
};

exports.loadAudio = function(filenames, name) {
  if (StudioApp.usingBlockly) {
    Blockly.loadAudio_(filenames, name);
  } else if (StudioApp.cdoSounds) {
    var regOpts = { id: name };
    for (var i = 0; i < filenames.length; i++) {
      var filename = filenames[i];
      var ext = filename.match(/\.(\w+)(\?.*)?$/);
      if (ext) {
        // Extend regOpts so regOpts.mp3 = 'file.mp3'
        regOpts[ext[1]] = filename;
      }
    }
    StudioApp.cdoSounds.register(regOpts);
  }
};

exports.playAudio = function(name, options) {
  options = options || {};
  var defaultOptions = {volume: 0.5};
  var newOptions = utils.extend(defaultOptions, options);
  if (StudioApp.usingBlockly) {
    Blockly.playAudio(name, newOptions);
  } else if (StudioApp.cdoSounds) {
    StudioApp.cdoSounds.play(name, newOptions);
  }
};

exports.stopLoopingAudio = function(name) {
  if (StudioApp.usingBlockly) {
    Blockly.stopLoopingAudio(name);
  } else if (StudioApp.cdoSounds) {
    StudioApp.cdoSounds.stopLoopingAudio(name);
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
exports.inject = function(div, options) {
  var defaults = {
    assetUrl: StudioApp.assetUrl,
    rtl: StudioApp.isRtl(),
    toolbox: document.getElementById('toolbox'),
    trashcan: true
  };
  Blockly.inject(div, utils.extend(defaults, options));
};

/**
 * Returns true if the current HTML page is in right-to-left language mode.
 */
StudioApp.isRtl = function() {
  var head = document.getElementsByTagName('head')[0];
  if (head && head.parentElement) {
    var dir = head.parentElement.getAttribute('dir');
    return (dir && dir.toLowerCase() == 'rtl');
  } else {
    return false;
  }
};

StudioApp.localeDirection = function() {
  return (StudioApp.isRtl() ? 'rtl' : 'ltr');
};

/**
 * Initialize Blockly for a readonly iframe.  Called on page load.
 * XML argument may be generated from the console with:
 * Blockly.Xml.domToText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)).slice(5, -6)
 */
StudioApp.initReadonly = function(options) {
  Blockly.inject(document.getElementById('blockly'), {
    assetUrl: StudioApp.assetUrl,
    readOnly: true,
    rtl: StudioApp.isRtl(),
    scrollbars: false
  });
  StudioApp.loadBlocks(options.blocks);
};

/**
 * Load the editor with blocks.
 * @param {string} blocksXml Text representation of blocks.
 */
StudioApp.loadBlocks = function(blocksXml) {
  var xml = parseXmlElement(blocksXml);
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
};

StudioApp.BLOCK_X_COORDINATE = 70;
StudioApp.BLOCK_Y_COORDINATE = 30;
StudioApp.BLOCK_Y_COORDINATE_INTERVAL = 200;

/**
 * Spreading out the top blocks in workspace if it is not already set.
 * @param {string} startBlocks String representation of start blocks xml.
 * @param {Object.<Object>} arrangement A map from block type to position.
 * @return {string} String representation of start blocks xml, including
 *    block position.
 */
StudioApp.arrangeBlockPosition = function(startBlocks, arrangement) {
  var type, arrangeX, arrangeY;
  var xml = parseXmlElement(startBlocks);
  var xmlChildNodes = StudioApp.sortBlocksByVisibility(xml.childNodes);
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
                            StudioApp.BLOCK_X_COORDINATE);
      xmlChild.setAttribute('y', xmlChild.getAttribute('y') || arrangeY ||
                            StudioApp.BLOCK_Y_COORDINATE +
                            StudioApp.BLOCK_Y_COORDINATE_INTERVAL * numberOfPlacedBlocks);
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
StudioApp.sortBlocksByVisibility = function(xmlBlocks) {
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
      Dialog: StudioApp.Dialog,
      contentDiv: instructionsDiv,
      icon: StudioApp.ICON,
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
StudioApp.onResize = function() {
  var visualizationColumn = document.getElementById('visualizationColumn');
  var gameWidth = visualizationColumn.getBoundingClientRect().width;

  var blocklyDiv = document.getElementById('blockly');
  var codeWorkspace = document.getElementById('codeWorkspace');

  // resize either blockly or codeWorkspace
  var div = StudioApp.editCode ? codeWorkspace : blocklyDiv;

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
  if (StudioApp.usingBlockly && Blockly.RTL && (fullWorkspaceWidth - oldWidth !== 0)) {
    Blockly.mainBlockSpace.getTopBlocks().forEach(function(topBlock) {
      topBlock.moveBy(fullWorkspaceWidth - oldWidth, 0);
    });
  }

  if (StudioApp.isRtl()) {
    div.style.marginRight = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  else {
    div.style.marginLeft = (gameWidth + WORKSPACE_PLAYSPACE_GAP) + 'px';
  }
  if (StudioApp.editCode) {
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

  StudioApp.resizeHeaders(fullWorkspaceWidth);
};

// |          toolbox-header          | workspace-header  | show-code-header |
// |
// |           toolboxWidth           |
// |                 |         <--------- workspaceWidth ---------->         |
// |         <---------------- fullWorkspaceWidth ----------------->         |
StudioApp.resizeHeaders = function (fullWorkspaceWidth) {
  var minWorkspaceWidthForShowCode = StudioApp.editCode ? 250 : 450;
  var toolboxWidth = 0;
  if (StudioApp.editCode) {
    // If in the droplet editor, but not using blocks, keep categoryWidth at 0
    if (!StudioApp.editCode || StudioApp.editor.currentlyUsingBlocks) {
      // Set toolboxWidth based on the block palette width:
      var categories = document.querySelector('.droplet-palette-wrapper');
      toolboxWidth = parseInt(window.getComputedStyle(categories).width, 10);
    }
  } else if (StudioApp.usingBlockly) {
    toolboxWidth = Blockly.mainBlockSpaceEditor.getToolboxWidth();
  }

  var showCodeHeader = document.getElementById('show-code-header');
  var showCodeWidth = 0;
  if (StudioApp.enableShowCode &&
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
StudioApp.highlight = function(id, spotlight) {
  if (StudioApp.usingBlockly) {
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
StudioApp.clearHighlighting = function () {
  StudioApp.highlight(null);
};

// The following properties get their non-default values set by the application.

/**
 * Whether to alert user to empty blocks, short-circuiting all other tests.
 */
StudioApp.CHECK_FOR_EMPTY_BLOCKS = undefined;

/**
 * The ideal number of blocks to solve this level.  Users only get 2
 * stars if they use more than this number.
 * @type {!number=}
 */
StudioApp.IDEAL_BLOCK_NUM = undefined;

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
StudioApp.REQUIRED_BLOCKS = undefined;

/**
 * The number of required blocks to give hints about at any one time.
 * Set this to Infinity to show all.
 * @type {!number=}
 */
StudioApp.NUM_REQUIRED_BLOCKS_TO_FLAG = undefined;

/**
 * The number of attempts (how many times the run button has been pressed)
 * @type {?number}
 */
StudioApp.attempts = 0;

/**
 * Stores the time at init. The delta to current time is used for logging
 * and reporting to capture how long it took to arrive at an attempt.
 * @type {?number}
 */
StudioApp.initTime = undefined;

/**
 * Reset the playing field to the start position and kill any pending
 * animation tasks.  This will typically be replaced by an application.
 * @param {boolean} first True if an opening animation is to be played.
 */
StudioApp.reset = function(first) {};

// Override to change run behavior.
StudioApp.runButtonClick = function() {};

/**
 * Enumeration of user program execution outcomes.
 */
StudioApp.ResultType = constants.ResultType;

/**
 * Enumeration of test results.
 */
StudioApp.TestResults = constants.TestResults;

// Methods for determining and displaying feedback.

/**
 * Display feedback based on test results.  The test results must be
 * explicitly provided.
 * @param {{feedbackType: number}} Test results (a constant property of
 *     StudioApp.TestResults).
 */
StudioApp.displayFeedback = function(options) {
  options.Dialog = StudioApp.Dialog;
  options.onContinue = onContinue;
  options.backToPreviousLevel = backToPreviousLevel;
  options.sendToPhone = StudioApp.sendToPhone;

  // Special test code for edit blocks.
  if (options.level.edit_blocks) {
    options.feedbackType = StudioApp.TestResults.EDIT_BLOCKS;
  }

  feedback.displayFeedback(options);
};

StudioApp.getTestResults = function(levelComplete, options) {
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
StudioApp.report = function(options) {
  // copy from options: app, level, result, testResult, program, onComplete
  var report = options;
  report.pass = feedback.canContinueToNextLevel(options.testResult);
  report.time = ((new Date().getTime()) - StudioApp.initTime);
  report.attempt = StudioApp.attempts;
  report.lines = feedback.getNumBlocksUsed();

  // If hideSource is enabled, the user is looking at a shared level that
  // they cannot have modified. In that case, don't report it to the service
  // or call the onComplete() callback expected. The app will just sit
  // there with the Reset button as the only option.
  if (!(StudioApp.hideSource && StudioApp.share)) {
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
StudioApp.resetButtonClick = function() {
  onResetPressed();
  StudioApp.toggleRunReset('run');
  StudioApp.clearHighlighting();
  if (StudioApp.usingBlockly) {
    Blockly.mainBlockSpaceEditor.setEnableToolbox(true);
    Blockly.mainBlockSpace.traceOn(false);
  }
  StudioApp.reset(false);
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
  if (StudioApp.IDEAL_BLOCK_NUM < feedback.getNumCountableBlocks()) {
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
  return StudioApp.IDEAL_BLOCK_NUM === Infinity ?
      msg.infinity() : StudioApp.IDEAL_BLOCK_NUM;
};
