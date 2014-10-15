/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Core JavaScript library for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

// Top level object for Blockly.
goog.provide('Blockly');

// Blockly core dependencies.
goog.require('Blockly.Block');
goog.require('Blockly.Connection');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldColourDropdown');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldImageDropdown');
goog.require('Blockly.FieldRectangularDropdown');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Generator');
goog.require('Blockly.ImageDimensionCache');
goog.require('Blockly.Msg');
goog.require('Blockly.Procedures');
goog.require('Blockly.Toolbox');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.Workspace');
goog.require('Blockly.inject');
goog.require('Blockly.utils');

// Closure dependencies.
goog.require('goog.dom');
goog.require('goog.color');
goog.require('goog.events');
goog.require('goog.string');
goog.require('goog.ui.ColorPicker');
goog.require('goog.ui.tree.TreeControl');
goog.require('goog.userAgent');


/**
 * Returns an absolute URL to an asset in Blockly's directory.
 * Used for loading additional resources.
 * @param path Relative path to be resolved.
 */
Blockly.assetUrl = undefined;

/**
 * Required name space for SVG elements.
 * @const
 */
Blockly.SVG_NS = 'http://www.w3.org/2000/svg';
/**
 * Required name space for HTML elements.
 * @const
 */
Blockly.HTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * The richness of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_SATURATION = 0.45;
/**
 * The intensity of block colours, regardless of the hue.
 * Must be in the range of 0 (inclusive) to 1 (exclusive).
 */
Blockly.HSV_VALUE = 0.65;

/**
 * Convert an HSV model into an RGB hex triplet.
 * @param {number} hue Hue on a colour wheel (0-360).
 * @param {number} saturation The richness of block colours (0-1).
 * @param {number} value The intensity of block colours (0-1).
 * @return {string} RGB code, e.g. '#5ba65b'.
 */
Blockly.makeColour = function(hue, saturation, value) {
  return goog.color.hsvToHex(hue, saturation, value * 256);
};

/**
 * ENUM for a right-facing value input.  E.g. 'test' or 'return'.
 * @const
 */
Blockly.INPUT_VALUE = 1;
/**
 * ENUM for a left-facing value output.  E.g. 'call random'.
 * @const
 */
Blockly.OUTPUT_VALUE = 2;
/**
 * ENUM for a down-facing block stack.  E.g. 'then-do' or 'else-do'.
 * @const
 */
Blockly.NEXT_STATEMENT = 3;
/**
 * ENUM for an up-facing block stack.  E.g. 'close screen'.
 * @const
 */
Blockly.PREVIOUS_STATEMENT = 4;
/**
 * ENUM for an dummy input.  Used to add title(s) with no input.
 * @const
 */
Blockly.DUMMY_INPUT = 5;


Blockly.FUNCTIONAL_INPUT = 6;
Blockly.FUNCTIONAL_OUTPUT = 7;


/**
 * ENUM for left alignment.
 * @const
 */
Blockly.ALIGN_LEFT = -1;
/**
 * ENUM for centre alignment.
 * @const
 */
Blockly.ALIGN_CENTRE = 0;
/**
 * ENUM for right alignment.
 * @const
 */
Blockly.ALIGN_RIGHT = 1;

/**
 * Lookup table for determining the opposite type of a connection.
 * @const
 */
Blockly.OPPOSITE_TYPE = [];
Blockly.OPPOSITE_TYPE[Blockly.INPUT_VALUE] = Blockly.OUTPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.OUTPUT_VALUE] = Blockly.INPUT_VALUE;
Blockly.OPPOSITE_TYPE[Blockly.NEXT_STATEMENT] = Blockly.PREVIOUS_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.PREVIOUS_STATEMENT] = Blockly.NEXT_STATEMENT;
Blockly.OPPOSITE_TYPE[Blockly.FUNCTIONAL_INPUT] = Blockly.FUNCTIONAL_OUTPUT;
Blockly.OPPOSITE_TYPE[Blockly.FUNCTIONAL_OUTPUT] = Blockly.FUNCTIONAL_INPUT;

/**
 * Database of pre-loaded sounds.
 * @private
 * @const
 */
Blockly.SOUNDS_ = {};

/**
 * Handle vendor prefix.
 */
window.AudioContext = window.AudioContext || window.webkitAudioContext;

if (window.AudioContext) {
  Blockly.CONTEXT = new AudioContext();
}

/**
 * Currently selected block.
 * @type {Blockly.Block}
 */
Blockly.selected = null;

/**
 * Is Blockly in a read-only, non-editable mode?
 * Note that this property may only be set before init is called.
 * It can't be used to dynamically toggle editability on and off.
 */
Blockly.readOnly = false;

/**
 * Currently highlighted connection (during a drag).
 * @type {Blockly.Connection}
 * @private
 */
Blockly.highlightedConnection_ = null;

/**
 * Connection on dragged block that matches the highlighted connection.
 * @type {Blockly.Connection}
 * @private
 */
Blockly.localConnection_ = null;

/**
 * Number of pixels the mouse must move before a drag starts.
 * @const
 */
Blockly.DRAG_RADIUS = 5;

/**
 * Maximum misalignment between connections for them to snap together.
 * @const
 */
Blockly.SNAP_RADIUS = 15;

/**
 * Whether unconnected neighors should be explicitly bumped out of alignment
 * @const
 */
Blockly.BUMP_UNCONNECTED = true;

/**
 * Delay in ms between trigger and bumping unconnected block out of alignment.
 * @const
 */
Blockly.BUMP_DELAY = 250;

/**
 * Number of characters to truncate a collapsed block to.
 * @const
 */
Blockly.COLLAPSE_CHARS = 30;

/**
 * The main workspace (defined by inject.js).
 * @type {Blockly.Workspace}
 */
Blockly.mainWorkspace = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboard_ = null;

/**
 * Returns the dimensions of the current SVG image.
 * @return {!Object} Contains width, height, top and left properties.
 */
Blockly.svgSize = function() {
  return {width: Blockly.svg.cachedWidth_,
          height: Blockly.svg.cachedHeight_};
};

/**
 * Size the SVG image to completely fill its container.  Record both
 * the height/width and the absolute position of the SVG image.
 */
Blockly.svgResize = function() {
  var svg = Blockly.svg;
  var style = window.getComputedStyle(svg);
  var borderWidth = 0;
  if (style) {
    borderWidth = parseInt(style.borderLeftWidth, 10) +
                  parseInt(style.borderRightWidth, 10);
  }
  var div = svg.parentNode;
  var width = div.offsetWidth - borderWidth;
  var height = div.offsetHeight;
  if (svg.cachedWidth_ != width) {
    svg.setAttribute('width', width + 'px');
    svg.cachedWidth_ = width;
  }
  if (svg.cachedHeight_ != height) {
    svg.setAttribute('height', height + 'px');
    svg.cachedHeight_ = height;
  }
  // Update the scrollbars (if they exist).
  if (Blockly.mainWorkspace.scrollbar) {
    Blockly.mainWorkspace.scrollbar.resize();
  } else if (Blockly.hasCategories) {
    Blockly.setMainWorkspaceMetricsNoScroll_();
  }
};

/**
 * @return {number} Return the width, in pixels, of the workspace.
 */
Blockly.getWorkspaceWidth = function() {
  var metrics = Blockly.mainWorkspace.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;
  return width;
};

/**
 * @return {number} Return the width, in pixels, of the toolbox. Note, this
 * only includes the 'flyout' part, not the categories tree.
 */
Blockly.getToolboxWidth = function() {
  var flyout = Blockly.mainWorkspace.flyout_ || Blockly.Toolbox.flyout_;
  var metrics = flyout.workspace_.getMetrics();
  var width = metrics ? metrics.viewWidth : 0;
  return width;
};

/**
 * Handle a mouse-down on SVG drawing surface.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onMouseDown_ = function(e) {
  Blockly.terminateDrag_(); // In case mouse-up event was lost.
  Blockly.hideChaff();
  var isTargetSvg = e.target && e.target.nodeName &&
      e.target.nodeName.toLowerCase() == 'svg';
  if (!Blockly.readOnly && Blockly.selected && isTargetSvg) {
    // Clicking on the document clears the selection.
    Blockly.selected.unselect();
  }
  if (Blockly.isRightButton(e)) {
    // Right-click.
    // Unlike google Blockly, we don't want to show a context menu
    // Blockly.showContextMenu_(e);
  } else if ((Blockly.readOnly || isTargetSvg) &&
             Blockly.mainWorkspace.scrollbar) {
    // If the workspace is editable, only allow dragging when gripping empty
    // space.  Otherwise, allow dragging when gripping anywhere.
    Blockly.mainWorkspace.dragMode = true;
    // Record the current mouse position.
    Blockly.mainWorkspace.startDragMouseX = e.clientX;
    Blockly.mainWorkspace.startDragMouseY = e.clientY;
    Blockly.mainWorkspace.startDragMetrics =
        Blockly.mainWorkspace.getMetrics();
    Blockly.mainWorkspace.startScrollX = Blockly.mainWorkspace.pageXOffset;
    Blockly.mainWorkspace.startScrollY = Blockly.mainWorkspace.pageYOffset;

    // Stop the browser from scrolling/zooming the page
    e.preventDefault();
  }
};

/**
 * Handle a mouse-up on SVG drawing surface.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.onMouseUp_ = function(e) {
  Blockly.setCursorHand_(false);
  Blockly.mainWorkspace.dragMode = false;
};

/**
 * Handle a mouse-move on SVG drawing surface.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.onMouseMove_ = function(e) {
  if (Blockly.mainWorkspace.dragMode) {
    Blockly.removeAllRanges();
    var dx = e.clientX - Blockly.mainWorkspace.startDragMouseX;
    var dy = e.clientY - Blockly.mainWorkspace.startDragMouseY;
    var metrics = Blockly.mainWorkspace.startDragMetrics;
    var x = Blockly.mainWorkspace.startScrollX + dx;
    var y = Blockly.mainWorkspace.startScrollY + dy;
    x = Math.min(x, -metrics.contentLeft);
    y = Math.min(y, -metrics.contentTop);
    x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
                 metrics.contentWidth);
    y = Math.max(y, metrics.viewHeight - metrics.contentTop -
                 metrics.contentHeight);

    // Move the scrollbars and the page will scroll automatically.
    Blockly.mainWorkspace.scrollbar.set(-x - metrics.contentLeft,
                                        -y - metrics.contentTop);
  }
};

/**
 * Handle a key-down on SVG drawing surface.
 * @param {!Event} e Key down event.
 * @private
 */
Blockly.onKeyDown_ = function(e) {
  if (Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }
  // TODO: Add keyboard support for cursoring around the context menu.
  if (e.keyCode == 27) {
    // Pressing esc closes the context menu.
    Blockly.hideChaff();
  } else if (e.keyCode == 8 || e.keyCode == 46) {
    // Delete or backspace.
    try {
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        Blockly.hideChaff();
        Blockly.selected.dispose(true, true);
      }
    } finally {
      // Stop the browser from going back to the previous page.
      // Use a finally so that any error in delete code above doesn't disappear
      // from the console when the page rolls back.
      e.preventDefault();
    }
  } else if (e.altKey || e.ctrlKey || e.metaKey) {
    if (Blockly.selected && Blockly.selected.isDeletable() &&
        Blockly.selected.workspace == Blockly.mainWorkspace) {
      Blockly.hideChaff();
      if (e.keyCode == 67) {
        // 'c' for copy.
        Blockly.copy_(Blockly.selected);
      } else if (e.keyCode == 88) {
        // 'x' for cut.
        Blockly.copy_(Blockly.selected);
        Blockly.selected.dispose(true, true);
      }
    }
    if (e.keyCode == 86) {
      // 'v' for paste.
      if (Blockly.clipboard_) {
        Blockly.mainWorkspace.paste(Blockly.clipboard_);
      }
    }
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.terminateDrag_ = function() {
  Blockly.Block.terminateDrag_();
  Blockly.Flyout.terminateDrag_();
};

/**
 * Copy a block onto the local clipboard.
 * @param {!Blockly.Block} block Block to be copied.
 * @private
 */
Blockly.copy_ = function(block) {
  var xmlBlock = Blockly.Xml.blockToDom_(block);
  Blockly.Xml.deleteNext(xmlBlock);
  // Encode start position in XML.
  var xy = block.getRelativeToSurfaceXY();
  xmlBlock.setAttribute('x', Blockly.RTL ? -xy.x : xy.x);
  xmlBlock.setAttribute('y', xy.y);
  Blockly.clipboard_ = xmlBlock;
};

/**
 * Show the context menu for the workspace.
 * @param {!Event} e Mouse event
 * @private
 */
Blockly.showContextMenu_ = function(e) {
  if (Blockly.readOnly) {
    return;
  }
  var options = [];

  if (Blockly.collapse) {
    var hasCollapsedBlocks = false;
    var hasExpandedBlocks = false;
    var topBlocks = Blockly.mainWorkspace.getTopBlocks(false);
    for (var i = 0; i < topBlocks.length; i++) {
      if (topBlocks[i].isCollapsed()) {
        hasCollapsedBlocks = true;
      } else {
        hasExpandedBlocks = true;
      }
    }

    // Option to collapse top blocks.
    var collapseOption = {enabled: hasExpandedBlocks};
    collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
    collapseOption.callback = function() {
      for (var i = 0; i < topBlocks.length; i++) {
        topBlocks[i].setCollapsed(true);
      }
    };
    options.push(collapseOption);

    // Option to expand top blocks.
    var expandOption = {enabled: hasCollapsedBlocks};
    expandOption.text = Blockly.Msg.EXPAND_ALL;
    expandOption.callback = function() {
      for (var i = 0; i < topBlocks.length; i++) {
        topBlocks[i].setCollapsed(false);
      }
    };
    options.push(expandOption);
  }

  // Option to get help.
  var helpOption = {enabled: false};
  helpOption.text = Blockly.Msg.HELP;
  helpOption.callback = function() {};
  options.push(helpOption);

  Blockly.ContextMenu.show(e, options);
};

/**
 * Cancel the native context menu, unless the focus is on an HTML input widget.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.onContextMenu_ = function(e) {
  if (!Blockly.isTargetInput_(e)) {
    // When focused on an HTML text input widget, don't cancel the context menu.
    e.preventDefault();
  }
};

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if (!opt_allowToolbox &&
      Blockly.Toolbox.flyout_ && Blockly.Toolbox.flyout_.autoClose) {
    Blockly.Toolbox.clearSelection();
  }
};

/**
 * Deselect any selections on the webpage.
 * Chrome will select text outside the SVG when double-clicking.
 * Deselect this text, so that it doesn't mess up any subsequent drag.
 */
Blockly.removeAllRanges = function() {
  function removeAllSafe() {
    try {
      window.getSelection().removeAllRanges();
    } catch (e) {
      // MSIE throws 'error 800a025e' here.
    }
  }

  if (window.getSelection) {  // W3
    var sel = window.getSelection();
    if (sel && sel.removeAllRanges) {
      removeAllSafe();
      window.setTimeout(function() {
        removeAllSafe();
      }, 0);
    }
  }
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function(e) {
  return e.target.type == 'textarea' || e.target.type == 'text';
};

/**
 * Create an AJAX onload function scoped to request and name params.
 * @param {!XMLHttpRequest} request The requst to listen on.
 * @param {string} name The name of the sound so we can reference it later.
 * @return {function} The onload function.
 */
Blockly.onSoundLoad_ = function(request, name) {
  var onload = function() {
    Blockly.CONTEXT.decodeAudioData(request.response, function(buffer) {
      // Create an initial dummy sound.
      Blockly.SOUNDS_[name] = Blockly.createSoundFromBuffer_({buffer: buffer});
    });
  };
  return onload;
};

/**
 * Create a web audio buffer source from an array buffer.
 * @param {!Object} options A set of options which must include the array
 *   buffer from which to create the sound and may optionally include a loop
 *   option.
 * @return {AudioBufferSourceNode} The sound.
 */
Blockly.createSoundFromBuffer_ = function(options) {
  var source = Blockly.CONTEXT.createBufferSource();
  source.buffer = options.buffer;
  source.loop = options.loop;

  // Older version of chrome call this createGainNode instead of createGain
  var gainNode;
  if (Blockly.CONTEXT.createGain) {
    gainNode = Blockly.CONTEXT.createGain();
  } else if (Blockly.CONTEXT.createGainNode) {
    gainNode = Blockly.CONTEXT.createGainNode();
  } else {
    return null;
  }

  source.connect(gainNode);
  gainNode.connect(Blockly.CONTEXT.destination);
  gainNode.gain.value = options.volume || 1;
  return source;
};

/**
 * Load an audio file using the web audio api.
 * @param {string} filename The filename to load.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.loadWebAudio_ = function(filename, name) {
  var request = new XMLHttpRequest();
  request.open('GET', filename, true);
  request.responseType = 'arraybuffer';
  request.onload = Blockly.onSoundLoad_(request, name);
  request.send();
};

/**
 * Load an audio file.  Cache it, ready for instantaneous playing.
 * @param {!Array.<string>} filenames List of file types in decreasing order of
 *   preference (i.e. increasing size).  E.g. ['media/go.mp3', 'media/go.wav']
 *   Filenames do NOT include path from Blockly's root.  File extensions matter.
 * @param {string} name Name of sound.
 * @private
 */
Blockly.loadAudio_ = function(filenames, name) {
  // Use html5 for audio test even if we use web audio to play.
  if (window.Audio && filenames.length) {
    var audioTest = new window.Audio();
    for (var i = 0, filename; filename = filenames[i]; i++) {
      var ext = filename.match(/\.(\w+)(\?.*)?$/);
      if (ext && audioTest.canPlayType('audio/' + ext[1])) {
        break;
      }
    }
    // We have a playable filename or undefined.
    if (filename) {
      if (window.AudioContext) {
        Blockly.loadWebAudio_(filename, name);
      } else {
        var sound = new window.Audio(filename);
        if (sound && sound.play) {
          // Precache audio except for IE9.
          if (!goog.userAgent.isDocumentMode(9)) {
            sound.play();
            sound.pause();
          }
          Blockly.SOUNDS_[name] = sound;
        }
      }
    }
  }
};

/**
 * Play an audio file at specified value.  If volume is not specified,
 * use full volume (1).
 * @param {string} name Name of sound.
 * @param options A table of audio options.
 */
Blockly.playAudio = function(name, options) {
  var sound = Blockly.SOUNDS_[name];
  var options = options || {};
  if (sound) {
    if (window.AudioContext) {
      options.buffer = sound.buffer;
      var newSound = Blockly.createSoundFromBuffer_(options);
      // Play sound, older versions of the Web Audio API used noteOn(Off).
      newSound.start ? newSound.start(0) : newSound.noteOn(0);
      Blockly.SOUNDS_[name] = newSound;
    } else if (!goog.userAgent.MOBILE) {  // HTML 5 audio on mobile is bad.
      // Update the sound hash with the looping sound, and stop the original sound
      // This is to prevent when there are multiple sounds of the same name being
      // played, which should not happen.
      sound.volume = (options.volume !== undefined) ? options.volume : 1;
      sound.loop = options.loop;
      sound.play();
    }
  }
};

/**
 * Stop looping the audio file.
 * @param {string} name Name of sound.
 */
Blockly.stopLoopingAudio = function(name) {
  var sound = Blockly.SOUNDS_[name];
  try {
    if (sound) {
      if (sound.stop) {  // Newest web audio pseudo-standard.
        sound.stop(0);
      } else if (sound.noteOff) {  // Older web audio.
        sound.noteOff(0);
      } else {  // html 5 audio.
        sound.pause();
      }
    }
  } catch (e) {
    if (e.name === 'InvalidStateError') {
      // Stopping a sound that hasn't been played.
    } else {
      throw e;
    }
  }
};

/**
 * Set the mouse cursor to be either a closed hand or the default.
 * @param {boolean} closed True for closed hand.
 * @private
 */
Blockly.setCursorHand_ = function(closed) {
  if (Blockly.readOnly) {
    return;
  }
  /* Hotspot coordinates are baked into the CUR file, but they are still
     required due to a Chrome bug.
     http://code.google.com/p/chromium/issues/detail?id=1446 */
  var cursor = '';
  if (closed) {
    cursor = 'url(' + Blockly.assetUrl('media/handclosed.cur') + ') 7 3, auto';
  }
  if (Blockly.selected) {
    Blockly.selected.getSvgRoot().style.cursor = cursor;
  }
  // Set cursor on the SVG surface as well as block so that rapid movements
  // don't result in cursor changing to an arrow momentarily.
  Blockly.svg.style.cursor = cursor;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * main workspace.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of main workspace.
 * @private
 */
Blockly.getMainWorkspaceMetrics_ = function() {
  var svgSize = Blockly.svgSize();
  svgSize.width -= Blockly.Toolbox.width;  // Zero if no Toolbox.
  var viewWidth = svgSize.width - Blockly.Scrollbar.scrollbarThickness;
  var viewHeight = svgSize.height - Blockly.Scrollbar.scrollbarThickness;
  try {
        if (Blockly.isMsie() || Blockly.isTrident()) {
            Blockly.mainWorkspace.getCanvas().style.display = "inline";   /* reqd for IE */
            var blockBox = {
                x: Blockly.mainWorkspace.getCanvas().getBBox().x,
                y: Blockly.mainWorkspace.getCanvas().getBBox().y,
                width: Blockly.mainWorkspace.getCanvas().scrollWidth,
                height: Blockly.mainWorkspace.getCanvas().scrollHeight
            };
        }
        else {
            var blockBox = Blockly.mainWorkspace.getCanvas().getBBox();
        }
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    return null;
  }
  if (Blockly.mainWorkspace.scrollbar) {
    // add some buffer space to the right/below existing contents
    var leftEdge = 0;
    var rightEdge = Math.max(blockBox.x + blockBox.width + viewWidth, viewWidth * 1.5);
    var topEdge = 0;
    var bottomEdge = Math.max(blockBox.y + blockBox.height + viewHeight, viewHeight * 1.5);

  } else {
    var leftEdge = blockBox.x;
    var rightEdge = leftEdge + blockBox.width;
    var topEdge = blockBox.y;
    var bottomEdge = topEdge + blockBox.height;
  }
  var absoluteLeft = Blockly.RTL ? 0 : Blockly.Toolbox.width;
  return {
    viewHeight: svgSize.height,
    viewWidth: svgSize.width,
    contentHeight: bottomEdge - topEdge,
    contentWidth: rightEdge - leftEdge,
    viewTop: -Blockly.mainWorkspace.pageYOffset,
    viewLeft: -Blockly.mainWorkspace.pageXOffset,
    contentTop: topEdge,
    contentLeft: leftEdge,
    absoluteTop: 0,
    absoluteLeft: absoluteLeft
  };
};

/**
 * Sets the X/Y translations of the main workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @private
 */
Blockly.setMainWorkspaceMetrics_ = function(xyRatio) {
  if (!Blockly.mainWorkspace.scrollbar) {
    throw 'Attempt to set main workspace scroll without scrollbars.';
  }
  var metrics = Blockly.getMainWorkspaceMetrics_();
  if (goog.isNumber(xyRatio.x)) {
      Blockly.mainWorkspace.pageXOffset = -metrics.contentWidth * xyRatio.x -
        metrics.contentLeft;
  }
  if (goog.isNumber(xyRatio.y)) {
      Blockly.mainWorkspace.pageYOffset = -metrics.contentHeight * xyRatio.y -
        metrics.contentTop;
  }
  var translation = 'translate(' +
      (Blockly.mainWorkspace.pageXOffset + metrics.absoluteLeft) + ',' +
      (Blockly.mainWorkspace.pageYOffset + metrics.absoluteTop) + ')';
  Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
  Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
                                                       translation);
};

/**
 * Sets the X/Y translations of the main workspace when scrollbars are
 * disabled.
 * @private
 */
Blockly.setMainWorkspaceMetricsNoScroll_ = function() {
  var metrics = Blockly.getMainWorkspaceMetrics_();
  if (metrics) {
    var translation = 'translate(' + (metrics.absoluteLeft) + ',' +
        (metrics.absoluteTop) + ')';
    Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
    Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
                                                         translation);
  }
};

/**
 * When something in Blockly's workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Array.<!Array>} Opaque data that can be passed to
 *     removeChangeListener.
 */
Blockly.addChangeListener = function(func) {
  return Blockly.bindEvent_(Blockly.mainWorkspace.getCanvas(),
                            'blocklyWorkspaceChange', null, func);
};

/**
 * Stop listening for Blockly's workspace changes.
 * @param {!Array.<!Array>} bindData Opaque data from addChangeListener.
 */
Blockly.removeChangeListener = function(bindData) {
  Blockly.unbindEvent_(bindData);
};

/**
 * Handful of terrible, just-barely-work-ish hacks to open a function editor dialog
 */

Blockly.functionEditorOpen = true;

Blockly.createNewFunction = function() {
  Blockly.openFunctionEditor(this.newBlockXML('my new function'));
};

Blockly.newBlockXML = function (name) {
  return '<xml><block type="procedures_defnoreturn"><mutation></mutation><title name="NAME">' + name + '</title></block></xml>';
};

Blockly.openFunctionEditor = function(functionDefinitionXML) {
  var blocklyTopLeftDiv = document.getElementById('blocklyApp');

  // Handle toggling
  {
    if (Blockly.functionEditorOpen) {
      Blockly.functionEditorOpen = false;
      goog.dom.removeNode(goog.dom.getElementByClass('newFunctionDiv'));
      return;
    }
    Blockly.functionEditorOpen = true;
  }

  var workspace = new Blockly.Workspace(Blockly.mainWorkspace.getMetrics, Blockly.mainWorkspace.setMetrics);

  // Initialize workspace and construct DOM elements
  {
    var functionDefinitionDiv = goog.dom.createDom("div", "newFunctionDiv");
    var svgWorkspaceContainer = Blockly.createSvgElement('svg', {width: 1200, height: 700, x: 0, y: 0}, null);
    Blockly.createSvgElement('rect', {'class': 'blocklyMutatorBackground', 'height': '100%', 'width': '100%'}, svgWorkspaceContainer);

    workspace.flyout_ = new Blockly.Flyout();
    workspace.flyout_.autoClose = false;
    svgWorkspaceContainer.appendChild(workspace.flyout_.createDom());
    svgWorkspaceContainer.appendChild(workspace.createDom());
    functionDefinitionDiv.appendChild(svgWorkspaceContainer);
    blocklyTopLeftDiv.appendChild(functionDefinitionDiv);
  }

  // Override top block methods to make new functions available to main workspace during domToWorkspace
  {
    workspace.addTopBlock = function (block) {
      Blockly.mainWorkspace.addTopBlock(block);

      // vvv begin existing code vvv
      workspace.topBlocks_.push(block);
      workspace.fireChangeEvent();
      // ^^^ end existing code ^^^
    };
    workspace.removeTopBlock = function (block) {
      Blockly.mainWorkspace.removeTopBlock(block);

      // vvv begin existing code vvv
      var found = false;
      for (var child, x = 0; child = workspace.topBlocks_[x]; x++) {
        if (child == block) {
          workspace.topBlocks_.splice(x, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        throw 'Block not present in workspace\'s list of top-most blocks.';
      }
      workspace.fireChangeEvent();
      // ^^^ end existing code ^^^
    };
  }

  // Initialize workspace with specified function definition block
  {
    var xml = Blockly.Xml.textToDom(functionDefinitionXML);
    Blockly.Xml.domToWorkspace(workspace, xml);
  }

  // Initialize flyout with a couple of studio blocks
  {
    workspace.flyout_.init(workspace, true);
    var flyoutBlocks = Blockly.Xml.textToDom('<xml><block type="studio_showTitleScreenParams" inline="false"><value name="TITLE"><block type="text"><title name="TEXT"></title></block></value><value name="TEXT"><block type="text"><title name="TEXT"></title></block></value></block><block type="studio_moveDistanceParams" inline="true"><title name="SPRITE">0</title><title name="DIR">1</title><value name="DISTANCE"><block type="math_number"><title name="NUM">25</title></block></value></block><block type="studio_playSound"><title name="SOUND">hit</title></block></xml>');
    workspace.flyout_.show(flyoutBlocks.childNodes);
  }

  // Flyout boilerplate: translate the workspace to be next to flyout
  {
    workspace.pageXOffset = workspace.flyout_.width_;
    var translation = 'translate(' + workspace.pageXOffset + ', 0)';
    workspace.getCanvas().setAttribute('transform', translation);
    workspace.getBubbleCanvas().setAttribute('transform', translation);
  }

};
