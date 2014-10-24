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
goog.require('Blockly.FunctionEditor');
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
goog.require('Blockly.BlockSpace');
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
 * The main blockSpace (defined by inject.js).
 * @type {Blockly.BlockSpace}
 */
Blockly.mainBlockSpace = null;

/**
 * The main editor blockSpace (defined by inject.js).
 * @type {Blockly.BlockSpaceEditor}
 */
Blockly.mainBlockSpaceEditor = null;

/**
 * Contents of the local clipboard.
 * @type {Element}
 * @private
 */
Blockly.clipboard_ = null;

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
