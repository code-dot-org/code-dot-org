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
 * @param {Object} [opt_options] Optional dictionary of options.
 * @param {AudioPlayer} [opt_audioPlayer]
 *
 */
Blockly.inject = function(container, opt_options, opt_audioPlayer) {
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
  Blockly.Css.inject(container);

  // Load sounds
  if (opt_audioPlayer) {
    Blockly.audioPlayer = opt_audioPlayer;
    Blockly.registerUISounds_(Blockly.audioPlayer);
  }

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
    Blockly.functionEditor = new Blockly.ContractEditor({
      disableExamples: opt_options && opt_options.disableExamples
    });
    /** @type {Blockly.ContractEditor} */
    Blockly.contractEditor = Blockly.functionEditor;
  }

  /**
   * @type {Blockly.BlockSpace}
   */
  Blockly.focusedBlockSpace = Blockly.mainBlockSpace;
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.
 * @return {Object} Parsed options.
 * @private
 */
Blockly.parseOptions_ = function(options) {
  var hasCategories, hasTrashcan, hasCollapse, grayOutUndeletableBlocks, tree,
    hasScrollbars;

  var readOnly = !!options['readOnly'];
  var showUnusedBlocks = !!options['showUnusedBlocks'];

  if (readOnly) {
    hasCategories = false;
    hasTrashcan = false;
    hasCollapse = false;
    grayOutUndeletableBlocks = false;
    tree = null;
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
      hasCategories = !!tree.getElementsByTagName('category').length;
    } else {
      tree = null;
      hasCategories = false;
    }
    hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    hasCollapse = options['collapse'];
    if (hasCollapse === undefined) {
      hasCollapse = hasCategories;
    }
    grayOutUndeletableBlocks = options['grayOutUndeletableBlocks'];
    if (grayOutUndeletableBlocks === undefined) {
      grayOutUndeletableBlocks = false;
    }
  }
  if (options['scrollbars']) {
    options['hasVerticalScrollbars'] = true;
    options['hasHorizontalScrollbars'] = true;
  }
  return {
    RTL: !!options['rtl'],
    collapse: hasCollapse,
    readOnly: readOnly,
    showUnusedBlocks: showUnusedBlocks,
    maxBlocks: options['maxBlocks'] || Infinity,
    assetUrl: options['assetUrl'] || function(path) {
      return './' + path;
    },
    hasCategories: hasCategories,
    hasHorizontalScrollbars: options['hasHorizontalScrollbars'],
    hasVerticalScrollbars: options['hasVerticalScrollbars'],
    customSimpleDialog: options['customSimpleDialog'],
    hasTrashcan: hasTrashcan,
    varsInGlobals: options['varsInGlobals'] || false,
    languageTree: tree,
    disableParamEditing: options['disableParamEditing'] || false,
    disableVariableEditing: options['disableVariableEditing'] || false,
    useModalFunctionEditor: options['useModalFunctionEditor'] || false,
    useContractEditor: options['useContractEditor'] || false,
    disableExamples: options['disableExamples'] || false,
    defaultNumExampleBlocks: options['defaultNumExampleBlocks'] || 0,
    grayOutUndeletableBlocks: grayOutUndeletableBlocks,
    editBlocks: options['editBlocks'] || false,
    showExampleTestButtons: options['showExampleTestButtons'] || false
  };
};

/**
 * Initialize some core blockly sounds
 * @param {AudioPlayer} audioPlayer
 * @private
 */
Blockly.registerUISounds_ = function(audioPlayer) {
  // Load the sounds.
  audioPlayer.register({
    id: 'click',
    mp3: Blockly.assetUrl('media/click.mp3'),
    wav: Blockly.assetUrl('media/click.wav'),
    ogg: Blockly.assetUrl('media/click.ogg')
  });
  audioPlayer.register({
    id: 'delete',
    mp3: Blockly.assetUrl('media/delete.mp3'),
    wav: Blockly.assetUrl('media/delete.wav'),
    ogg: Blockly.assetUrl('media/delete.ogg')
  });
};
