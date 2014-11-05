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
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.inject');

goog.require('Blockly.Css');
goog.require('Blockly.BlockSpaceEditor');
goog.require('goog.dom');


/**
 * Initialize the SVG document with various handlers.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 */
Blockly.inject = function(container, opt_options) {
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  if (opt_options) {
    // TODO(scr): don't mix this in to global variables.
    goog.mixin(Blockly, Blockly.parseOptions_(opt_options));
  }

  // Closure can be trusted to create HTML widgets with the proper direction.
  goog.ui.Component.setDefaultRightToLeft(Blockly.RTL);

  // Load CSS
  Blockly.Css.inject();

  // Load sounds
  Blockly.initUISounds_();

  /**
   * @type {Blockly.BlockSpaceEditor}
   */
  Blockly.mainBlockSpaceEditor = new Blockly.BlockSpaceEditor(container);
  /**
   * @type {Blockly.BlockSpace}
   */
  Blockly.mainBlockSpace = Blockly.mainBlockSpaceEditor.blockSpace;

  if (Blockly.useModalFunctionEditor) {
    /** @type {Blockly.FunctionEditor} */
    Blockly.functionEditor = new Blockly.FunctionEditor();
  } else if (Blockly.useContractEditor) {
    Blockly.functionEditor = new Blockly.ContractEditor();
    /** @type {Blockly.ContractEditor} */
    Blockly.contractEditor = Blockly.functionEditor;
  }
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.
 * @return {Object} Parsed options.
 * @private
 */
Blockly.parseOptions_ = function(options) {
  var readOnly = !!options['readOnly'];
  if (readOnly) {
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var hasConcreteBlocks = false;
    var grayOutUndeletableBlocks = false;
    var tree = null;
  } else {
    var tree = options['toolbox'];
    if (tree) {
      if (typeof tree != 'string' && typeof XSLTProcessor == 'undefined') {
        // In this case the tree will not have been properly built by the
        // browser. The HTML will be contained in the element, but it will
        // not have the proper DOM structure since the browser doesn't support
        // XSLTProcessor (XML -> HTML). This is the case in IE 9+.
        tree = tree.outerHTML;
      }
      if (typeof tree == 'string') {
        tree = Blockly.Xml.textToDom(tree);
      }
      var hasCategories = !!tree.getElementsByTagName('category').length;
    } else {
      tree = null;
      var hasCategories = false;
    }
    var hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    var hasCollapse = options['collapse'];
    if (hasCollapse === undefined) {
      hasCollapse = hasCategories;
    }
    var grayOutUndeletableBlocks = options['grayOutUndeletableBlocks'];
    if (grayOutUndeletableBlocks === undefined) {
      grayOutUndeletableBlocks = false;
    }
  }
  var varsInGlobals = !!options['varsInGlobals'];
  if (tree && !hasCategories) {
    // Scrollbars are not compatible with a non-flyout toolbox.
    var hasScrollbars = false;
    var hasConcreteBlocks = options['concreteBlocks'];
    if (hasConcreteBlocks === undefined) {
      hasConcreteBlocks = false;
    }
  } else {
    var hasScrollbars = options['scrollbars'];
    if (hasScrollbars === undefined) {
      hasScrollbars = false;
    }
    // concrete blocks are not compatible with category toolbox
    var hasConcreteBlocks = false;
  }
  return {
    RTL: !!options['rtl'],
    collapse: hasCollapse,
    readOnly: readOnly,
    maxBlocks: options['maxBlocks'] || Infinity,
    assetUrl: options['assetUrl'] || function(path) {
      return './' + path;
    },
    hasCategories: hasCategories,
    hasScrollbars: hasScrollbars,
    hasConcreteBlocks: hasConcreteBlocks,
    hasTrashcan: hasTrashcan,
    varsInGlobals: varsInGlobals,
    languageTree: tree,
    disableParamEditing: options['disableParamEditing'] || false,
    disableVariableEditing: options['disableVariableEditing'] || false,
    useModalFunctionEditor: options['useModalFunctionEditor'] || false,
    useContractEditor: options['useContractEditor'] || false,
    grayOutUndeletableBlocks: grayOutUndeletableBlocks
  };
};

/**
 * Initialize some core blockly sounds
 * @private
 */
Blockly.initUISounds_ = function() {
  // Load the sounds.
  Blockly.loadAudio_(
      [Blockly.assetUrl('media/click.mp3'),
       Blockly.assetUrl('media/click.wav'),
       Blockly.assetUrl('media/click.ogg')],
       'click');
  Blockly.loadAudio_(
      [Blockly.assetUrl('media/delete.mp3'),
       Blockly.assetUrl('media/delete.ogg'),
       Blockly.assetUrl('media/delete.wav')],
       'delete');
};
