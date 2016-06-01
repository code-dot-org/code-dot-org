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
goog.require('Blockly.FieldIcon');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldImageDropdown');
goog.require('Blockly.FieldRectangularDropdown');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.FieldParameter');
goog.require('Blockly.FunctionEditor');
goog.require('Blockly.ContractEditor');
goog.require('Blockly.TypeDropdown');
goog.require('Blockly.DomainEditor');
goog.require('Blockly.DomainNameInput');
goog.require('Blockly.Generator');
goog.require('Blockly.ImageDimensionCache');
goog.require('Blockly.FunctionalBlockUtils');
goog.require('Blockly.BlockValueType');
goog.require('Blockly.FunctionalTypeColors');
goog.require('Blockly.Msg');
goog.require('Blockly.Procedures');
goog.require('Blockly.Toolbox');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.BlockSpace');
goog.require('Blockly.Blocks');
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

/** CONNECTION INPUT TYPES */
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
 * Whether or not 'unused' blocks (non-top-blocks without a parent)
 * should be rendered differently.
 * @const
 */
Blockly.showUnusedBlocks = false;

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
 * Attempt to play a sound
 * @param {string} name ID of sound
 */
Blockly.playAudio = function(name) {
  if (Blockly.audioPlayer) {
    Blockly.audioPlayer.play(name);
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
