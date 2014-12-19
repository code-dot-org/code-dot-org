/**
 * Visual Blocks Editor
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
 * @fileoverview Inject Blockly's CSS synchronously.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Css');

goog.require('goog.cssom');

/**
 * List of cursors.
 * @enum {string}
 */
Blockly.Css.Cursor = {
  OPEN: 'handopen',
  CLOSED: 'handclosed',
  DELETE: 'handdelete'
};

/**
* Current cursor (cached value).
* @type string
*/
Blockly.Css.currentCursor_ = '';

/**
 * Large stylesheet added by Blockly.Css.inject.
 * @type Element
 * @private
 */
Blockly.Css.styleSheet_ = null;

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 */
Blockly.Css.inject = function() {
  var text = Blockly.Css.CONTENT.join('\n');

  // Expand paths.
  text = text
    .replace('%HAND_OPEN_PATH%', Blockly.assetUrl('media/handopen.cur'))
    .replace('%HAND_CLOSED_PATH%', Blockly.assetUrl('media/handclosed.cur'))
    .replace('%HAND_DELETE_PATH%', Blockly.assetUrl('media/handdelete.cur'))
    .replace('%TREE_PATH%', Blockly.assetUrl('media/tree.png'))
    .replace('%SPRITES_PATH%', Blockly.assetUrl('media/sprites.png'));
  Blockly.Css.styleSheet_ = goog.cssom.addCssText(text).sheet;
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
};

/**
 * Set the cursor to be displayed when over something draggable.
 * In most cases, it may be easier to call the setCursor helper on
 * BlockSpaceEditor than to use this method directly.
 * @param {Blockly.Cursor} cursor Enum.
 * @param {?SVGElement} opt_svg The blockSpace svg object to also set the cursor on.
 */
Blockly.Css.setCursor = function(cursor, opt_svg) {
  if (Blockly.readOnly) {
    return;
  }

  if (Blockly.Css.currentCursor_ != cursor) {
    Blockly.Css.currentCursor_ = cursor;

    /*
    Hotspot coordinates are baked into the CUR file, but they are still
    required in the CSS due to a Chrome bug.
    https://code.google.com/p/chromium/issues/detail?id=1446
    */
    if (cursor == Blockly.Css.Cursor.OPEN) {
      var xy = '8 5';
    } else {
      var xy = '7 3';
    }
    var cursorRuleRHS = 'url(' +
    Blockly.assetUrl('media/' + cursor + '.cur') +
    ') ' + xy + ', auto';
    var rule = '.blocklyDraggable {\ncursor: ' + cursorRuleRHS + ';\n}\n';
    var ruleIndex = 0;
    // Guard against empty stylesheet for tests.
    if (Blockly.Css.styleSheet_ && Blockly.Css.styleSheet_.cssRules.length > ruleIndex) {
      // There are potentially hundreds of draggable objects.  Changing their style
      // properties individually is too slow, so change the CSS rule instead.
      goog.cssom.replaceCssRule('', rule, Blockly.Css.styleSheet_, ruleIndex);
    }
  }

  var setCursorOnBackgroundElement = function(element) {
    if (cursor == Blockly.Css.Cursor.OPEN) {
      element.style.cursor = '';
    } else {
      element.style.cursor = cursorRuleRHS;
    }
  };

  // There is probably only one toolbox, so just change its style property.
  var toolboxen = document.getElementsByClassName('blocklyToolboxDiv');
  for (var i = 0, toolbox; toolbox = toolboxen[i]; i++) {
    setCursorOnBackgroundElement(toolbox);
  }

  // Set cursor on the SVG surface as well, so that rapid movements
  // don't result in cursor changing to an arrow momentarily.
  if (opt_svg) {
    setCursorOnBackgroundElement(opt_svg);
  }
};

/**
 * Array making up the CSS content for Blockly.
 */
Blockly.Css.CONTENT = [
  '.blocklyDraggable {',
    // Placeholder for cursor rule. Must be first rule (index 0).
  '}',
  '#blockly {',
  '  border: 1px solid #ddd;',
  '}',
  '#blockly .userHidden {',
  '  display: none;',
  '}',
  '#blockly.readonly .userHidden {',
  '  display: inline;',
  '}',
  '#blockly.readonly {',
  '  border: 0;',
  '}',
  '#blockly.edit .userHidden {',
  '  display: inline;',
  '  fill-opacity: 0.5;',
  '}',
  '#blockly.edit .userHidden .blocklyPath {',
  '  fill-opacity: 0.5;',
  '}',
  '#blockly.edit .userHidden .blocklyPathDark, #blockly.edit .userHidden .blocklyPathLight {',
  '  display: none;',
  '}',
  '.blocklySvg {',
  '  cursor: pointer;',
  '  background-color: #fff;',
  '  overflow: hidden;',
  '}',
  'g.blocklyDraggable {',
  '  -ms-touch-action: none;',
  '  touch-action: none;',
  '}',
  '.blocklyWidgetDiv {',
  '  position: absolute;',
  '  display: none;',
  '  z-index: 999;',
  '}',
  '.blocklyResizeSE {',
  '  fill: #aaa;',
  '  cursor: se-resize;',
  '}',
  '.blocklyResizeSW {',
  '  fill: #aaa;',
  '  cursor: sw-resize;',
  '}',
  '.blocklyResizeLine {',
  '  stroke-width: 1;',
  '  stroke: #888;',
  '}',
  '.blocklyHighlightedConnectionPath {',
  '  stroke-width: 4px;',
  '  stroke: #fc3;',
  '  fill: none;',
  '}',
  '.blocklyPathLight {',
  '  fill: none;',
  '  stroke-width: 2;',
  '  stroke-linecap: round;',
  '}',
  '.blocklySpotlight>.blocklyPath {',
  '  fill: #fc3;',
  '}',
  '.blocklySelected:not(.blocklyUndeletable)>.blocklyPath {',
  '  stroke-width: 3px;',
  '  stroke: #fc3;',
  '}',
  '.blocklySelected:not(.blocklyUndeletable)>.blocklyPathLight {',
  '  display: none;',
  '}',
  '.blocklyUndeletable>.blocklyEditableText>rect {',
  '  fill-opacity: 1.0;',
  '  fill: #ffdb74;',
  '}',
  '.blocklyDragging>.blocklyPath,',
  '.blocklyDragging>.blocklyPathLight {',
  '  fill-opacity: 0.8;',
  '  stroke-opacity: 0.8;',
  '}',
  '.blocklyDragging>.blocklyPathDark {',
  '  display: none;',
  '}',
  '.blocklyDisabled>.blocklyPath {',
  '  fill-opacity: 0.50;',
  '  stroke-opacity: 0.50;',
  '}',
  '.blocklyDisabled>.blocklyPathLight,',
  '.blocklyDisabled>.blocklyPathDark {',
  '  display: none;',
  '}',
  '.blocklyText {',
  '  cursor: default;',
  '  font-family: sans-serif;',
  '  font-size: 11pt;',
  '  fill: #fff;',
  '}',
  '.blackBlocklyText {',
  '  cursor: default;',
  '  font-family: sans-serif;',
  '  font-size: 11pt;',
  '  fill: #333;',
  '}',
  '.blocklyNonEditableText>text {',
  '  pointer-events: none;',
  '}',
  '.blocklyNonEditableText>rect,',
  '.blocklyEditableText>rect {',
  '  fill: #fff;',
  '  fill-opacity: 0.6;',
  '}',
  '.blocklyNonEditableText>text,',
  '.blocklyEditableText>text {',
  '  fill: #000;',
  '}',
  '.blocklyEditableText:hover>rect {',
  '  stroke-width: 2;',
  '  stroke: #fff;',
  '}',
  '/*',
  ' * Don\'t allow users to select text.  It gets annoying when trying to',
  ' * drag a block and selected text moves instead.',
  ' */',
  '.blocklySvg text {',
  '  -moz-user-select: none;',
  '  -webkit-user-select: none;',
  '  user-select: none;',
  '  cursor: inherit;',
  '}',

  '.blocklyHidden {',
  '  display: none;',
  '}',
  '.blocklyFieldDropdown:not(.blocklyHidden) {',
  '  display: block;',
  '}',
  '.blocklyTooltipBackground {',
  '  fill: #ffffc7;',
  '  stroke-width: 1px;',
  '  stroke: #d8d8d8;',
  '}',
  '.blocklyTooltipShadow,',
  '.blocklyContextMenuShadow,',
  '.blocklyDropdownMenuShadow {',
  '  fill: #bbb;',
  '  filter: url(#blocklyShadowFilter);',
  '}',
  '.blocklyTooltipText {',
  '  font-family: sans-serif;',
  '  font-size: 9pt;',
  '  fill: #000;',
  '}',
  '#modalEditorClose:hover>rect {',
  '  fill: #0094ca;',
  '}',
  '.blocklyIconShield {',
  '  cursor: default;',
  '  fill: #00c;',
  '  stroke-width: 1px;',
  '  stroke: #ccc;',
  '}',
  '.blocklyIconGroup:hover>.blocklyIconShield {',
  '  fill: #00f;',
  '  stroke: #fff;',
  '}',
  '.blocklyIconGroup:hover>.blocklyIconMark {',
  '  fill: #fff;',
  '}',
  '.blocklyIconMark {',
  '  cursor: default !important;',
  '  font-family: sans-serif;',
  '  font-size: 9pt;',
  '  font-weight: bold;',
  '  fill: #ccc;',
  '  text-anchor: middle;',
  '}',
  '.blocklyWarningBody {',
  '}',
  '.blocklyMinimalBody {',
  '  margin: 0;',
  '  padding: 0;',
  '}',
  '.blocklyCommentTextarea {',
  '  margin: 0;',
  '  padding: 2px;',
  '  border: 0;',
  '  resize: none;',
  '  background-color: #ffc;',
  '}',
  '.blocklyHtmlInput {',
  '  font-family: sans-serif;',
  '  font-size: 11pt;',
  '  border: none;',
  '  outline: none;',
  '  width: 100%',
  '}',
  '.blocklyContextMenuBackground,',
  '.blocklyMutatorBackground {',
  '  fill: #fff;',
  '  stroke-width: 1;',
  '  stroke: #ddd;',
  '}',
  '.newFunctionDiv {',
  '  position: absolute;',
  '  top: 120px;',
  '  left: 600px;',
  '}',
  '.blocklyContextMenuOptions>.blocklyMenuDiv,',
  '.blocklyContextMenuOptions>.blocklyMenuDivDisabled,',
  '.blocklyDropdownMenuOptions>.blocklyMenuDiv {',
  '  fill: #fff;',
  '}',
  '.blocklyContextMenuOptions>.blocklyMenuDiv:hover>rect,',
  '.blocklyDropdownMenuOptions>.blocklyMenuDiv:hover>rect {',
  '  fill: #57e;',
  '}',
  '.blocklyMenuSelected>rect {',
  '  fill: #57e;',
  '}',
  '.blocklyMenuText {',
  '  cursor: default !important;',
  '  font-family: sans-serif;',
  '  font-size: 15px; /* All context menu sizes are based on pixels. */',
  '  fill: #000;',
  '}',
  '.blocklyContextMenuOptions>.blocklyMenuDiv:hover>.blocklyMenuText,',
  '.blocklyDropdownMenuOptions>.blocklyMenuDiv:hover>.blocklyMenuText {',
  '  fill: #fff;',
  '}',
  '.blocklyMenuSelected>.blocklyMenuText {',
  '  fill: #fff;',
  '}',
  '.blocklyMenuDivDisabled>.blocklyMenuText {',
  '  fill: #ccc;',
  '}',
  '.blocklyFlyoutBackground {',
  '  fill: #ddd;',
  '  fill-opacity: 0.8;',
  '}',
  '.blocklyBackground {',
  '  fill: #666;',
  '}',
  '.blocklyScrollbarBackground {',
  '  fill: #fff;',
  '  stroke-width: 1;',
  '  stroke: #e4e4e4;',
  '}',
  '.blocklyScrollbarKnob {',
  '  fill: #ccc;',
  '}',
  '.blocklyScrollbarBackground:hover+.blocklyScrollbarKnob,',
  '.blocklyScrollbarKnob:hover {',
  '  fill: #bbb;',
  '}',
  '.blocklyInvalidInput {',
  '  background: #faa;',
  '}',
  '.blocklyAngleCircle {',
  '  stroke: #444;',
  '  stroke-width: 1;',
  '  fill: #ddd;',
  '  fill-opacity: 0.8;',
  '}',
  '.blocklyAngleMarks {',
  '  stroke: #444;',
  '  stroke-width: 1;',
  '}',
  '.blocklyAngleGuage {',
  '  fill: #d00;',
  '  fill-opacity: 0.8;  ',
  '}',
  '.blocklyContextMenu {',
  '  border-radius: 4px;',
  '}',
  '.blocklyDropdownMenu {',
  '  padding: 0 !important;',
  '  position: relative !important;',
  '}',
  '.blocklyRectangularDropdownMenu .goog-menuitem {',
  '  height: 100%;',
  '  padding: 0 !important;',
  '  border-radius: 5px;',
  '  margin-bottom: 4px !important;',
  '}',
  '.fieldRectangularDropdownBackdrop {',
  '  fill: #fff;',
  '  fill-opacity: 0.6;',
  '}',
  '.blocklyRectangularDropdownArrow {',
  '  fill: #7965a1;',
  '  font-size: 20px !important;',
  '}',
  '.blocklyRectangularDropdownMenu .goog-menuitem-highlight, .goog-menuitem-hover {',
  '  border-color: #7965a1 !important;',
  '  border-style: dotted !important;',
  '  border-width: 0px !important;',
  '  margin: -4px -4px 0 !important;',
  '  border-width: 4px !important;',
  '  border-style: solid !important;',
  '  padding-bottom: 0px !important;',
  '  padding-top: 0px !important;',
  '}',
  '.blocklyRectangularDropdownMenu img {',
  '  -webkit-border-radius: 5px;',
  '  -moz-border-radius: 5px;',
  '  border-radius: 5px;',
  '}',
  '.blocklyRectangularDropdownMenu {',
  '  border-radius: 5px;',
  '  box-shadow: none !important;',
  '}',
  /* Override the default Closure URL. */
  '.goog-option-selected .goog-menuitem-checkbox,',
  '.goog-option-selected .goog-menuitem-icon {',
  /* disabling background as we want to use a text checkmark instead*/
  //'  background: url(%SPRITES_PATH%) no-repeat 0 0 !important;',
  '}',
  '/* Category tree in Toolbox. */',
  '.blocklyToolboxDiv {',
  '  background-color: #ddd;',
  '  display: none;',
  '  overflow-x: visible;',
  '  overflow-y: auto;',
  '  position: absolute;',
  '}',
  '.blocklyTreeRoot {',
  '  padding: 4px 0;',
  '}',
  '.blocklyTreeRoot:focus {',
  '  outline: none;',
  '}',
  '.blocklyTreeRow {',
  '  line-height: 22px;',
  '  height: 22px;',
  '  padding-right: 1em;',
  '  white-space: nowrap;',
  '}',
  '.blocklyToolboxDiv[dir="RTL"] .blocklyTreeRow {',
  '  padding-right: 0;',
  '  padding-left: 1em !important;',
  '}',
  '.blocklyTreeRow:hover {',
  '  background-color: #e4e4e4;',
  '}',
  '.blocklyTreeIcon {',
  '  height: 16px;',
  '  width: 16px;',
  '  vertical-align: middle;',
  '  background-image: url(%TREE_PATH%);',
  '}',
  '.blocklyTreeIconClosedLtr {',
  '  background-position: -32px -1px;',
  '}',
  '.blocklyTreeIconClosedRtl {',
  '  background-position: 0px -1px;',
  '}',
  '.blocklyTreeIconOpen {',
  '  background-position: -16px -1px;',
  '}',
  '.blocklyTreeIconNone {',
  '  background-position: -48px -1px;',
  '}',
  '.blocklyTreeSelected>.blocklyTreeIconClosedLtr {',
  '  background-position: -32px -17px;',
  '}',
  '.blocklyTreeSelected>.blocklyTreeIconClosedRtl {',
  '  background-position: 0px -17px;',
  '}',
  '.blocklyTreeSelected>.blocklyTreeIconOpen {',
  '  background-position: -16px -17px;',
  '}',
  '.blocklyTreeSelected>.blocklyTreeIconNone {',
  '  background-position: -48px -17px;',
  '}',
  '.blocklyTreeLabel {',
  '  cursor: default;',
  '  font-family: sans-serif;',
  '  font-size: 16px;',
  '  padding: 0 3px;',
  '  vertical-align: middle;',
  '}',
  '.blocklyTreeSelected {',
  '  background-color: #57e !important;',
  '}',
  '.blocklyTreeSelected .blocklyTreeLabel {',
  '  color: #fff;',
  '}',
  '.blocklyArrow {',
  '  font-size: 80%;',
  '}',
  '.paramToolbox {',
  '  padding: 0 0 5px 0;',
  '}',
  '.paramToolbox input, .paramToolbox textarea {',
  '  box-sizing: border-box;',
  '  width: 100%;',
  '  margin: 0;',
  '  resize: none;',
  '}',
  '.paramToolbox input, .paramToolbox button {',
  '  height: 30px;',
  '  margin: 0;',
  '}',
  '.paramToolbox div {',
  '  margin: 4px 10px;',
  '}',
  '#modalContainer {',
  '  position: absolute;',
  '  top: 40px;',
  '  width: 100%;',
  '  height: 100%;',
  '}',
  '#modalContainer > svg {',
  '  position: absolute;',
  '  top: 0;',
  '  left: 0;',
  '  background: transparent;',
  '  pointer-events: none;',
  '}',
  '#modalContainer > svg * {',
  '  pointer-events: visiblePainted;',
  '}',

  '/*',
  ' * Copyright 2007 The Closure Library Authors. All Rights Reserved.',
  ' *',
  ' * Use of this source code is governed by the Apache License, Version 2.0.',
  ' * See the COPYING file for details.',
  ' */',

  '/* Author: pupius@google.com (Daniel Pupius) */',

  '/*',
  ' Styles to make the colorpicker look like the old gmail color picker',
  ' NOTE: without CSS scoping this will override styles defined in palette.css',
  '*/',
  '.goog-palette {',
  '  outline: none;',
  '  cursor: default;',
  '}',

  '.goog-palette-table {',
  '  border: 1px solid #666;',
  '  border-collapse: collapse;',
  '}',

  '.goog-palette-cell {',
  '  height: 25px;',
  '  width: 25px;',
  '  margin: 0;',
  '  border: 0;',
  '  text-align: center;',
  '  vertical-align: middle;',
  '  border-right: 1px solid #666;',
  '  font-size: 1px;',
  '}',

  '.goog-palette-colorswatch {',
  '  position: relative;',
  '  height: 25px;',
  '  width: 25px;',
  '  border: 1px solid #666;',
  '}',

  '.goog-palette-cell-hover .goog-palette-colorswatch {',
  '  border: 1px solid #FFF;',
  '}',

  '.goog-palette-cell-selected .goog-palette-colorswatch {',
  '  border: 1px solid #000;',
  '  color: #fff;',
  '}',
  /* Copied from: goog/css/menu.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  '.goog-menu {',
  '  background: #fff;',
  '  border-color: #ccc #666 #666 #ccc;',
  '  border-style: solid;',
  '  border-width: 1px;',
  '  cursor: default;',
  '  font: normal 13px Arial, sans-serif;',
  '  margin: 0;',
  '  outline: none;',
  '  padding: 4px 0;',
  '  position: absolute;',
  '  z-index: 20000;',  /* Arbitrary, but some apps depend on it... */
  '}',

  /* Copied from: goog/css/menuitem.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuItemRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  /**
   * State: resting.
   *
   * NOTE(mleibman,chrishenry):
   * The RTL support in Closure is provided via two mechanisms -- "rtl" CSS
   * classes and BiDi flipping done by the CSS compiler.  Closure supports RTL
   * with or without the use of the CSS compiler.  In order for them not
   * to conflict with each other, the "rtl" CSS classes need to have the #noflip
   * annotation.  The non-rtl counterparts should ideally have them as well, but,
   * since .goog-menuitem existed without .goog-menuitem-rtl for so long before
   * being added, there is a risk of people having templates where they are not
   * rendering the .goog-menuitem-rtl class when in RTL and instead rely solely
   * on the BiDi flipping by the CSS compiler.  That's why we're not adding the
   * #noflip to .goog-menuitem.
   */
  '.goog-menuitem {',
  '  color: #000;',
  '  font: normal 13px Arial, sans-serif;',
  '  list-style: none;',
  '  margin: 0;',
     /* 28px on the left for icon or checkbox; 7em on the right for shortcut. */
  '  padding: 4px 7em 4px 28px;',
  '  white-space: nowrap;',
  '}',

  /* BiDi override for the resting state. */
  /* #noflip */
  '.goog-menuitem.goog-menuitem-rtl {',
     /* Flip left/right padding for BiDi. */
  '  padding-left: 7em;',
  '  padding-right: 28px;',
  '}',

  /* If a menu doesn't have checkable items or items with icons, remove padding. */
  '.goog-menu-nocheckbox .goog-menuitem,',
  '.goog-menu-noicon .goog-menuitem {',
  '  padding-left: 12px;',
  '}',

  /*
   * If a menu doesn't have items with shortcuts, leave just enough room for
   * submenu arrows, if they are rendered.
   */
  '.goog-menu-noaccel .goog-menuitem {',
  '  padding-right: 20px;',
  '}',

  '.goog-menuitem-content {',
  '  color: #000;',
  '  font-size: 15px;',
  '}',

  /* State: disabled. */
  '.goog-menuitem-disabled .goog-menuitem-accel,',
  '.goog-menuitem-disabled .goog-menuitem-content {',
  '  color: #ccc !important;',
  '}',

  '.goog-menuitem-disabled .goog-menuitem-icon {',
  '  opacity: 0.3;',
  '  -moz-opacity: 0.3;',
  '  filter: alpha(opacity=30);',
  '}',

  /* State: hover. */
  '.goog-menuitem-highlight,',
  '.goog-menuitem-hover {',
  '  background-color: #d6e9f8;',
     /* Use an explicit top and bottom border so that the selection is visible',
      * in high contrast mode. */
  '  border-color: #d6e9f8;',
  '  border-style: dotted;',
  '  border-width: 1px 0;',
  '  padding-bottom: 3px;',
  '  padding-top: 3px;',
  '}',

  /* State: selected/checked. */
  '.goog-menuitem-checkbox,',
  '.goog-menuitem-icon {',
  '  background-repeat: no-repeat;',
  '  height: 16px;',
  '  left: 6px;',
  '  position: absolute;',
  '  right: auto;',
  '  vertical-align: middle;',
  '  width: 16px;',
  '}',

  /* BiDi override for the selected/checked state. */
  /* #noflip */
  '.goog-menuitem-rtl .goog-menuitem-checkbox,',
  '.goog-menuitem-rtl .goog-menuitem-icon {',
     /* Flip left/right positioning. */
  '  left: auto;',
  '  right: 6px;',
  '}',

  '.goog-option-selected .goog-menuitem-checkbox,',
  '.goog-option-selected .goog-menuitem-icon {',
     /* Client apps may override the URL at which they serve the sprite. */
     /* disable, because we want to use text instead*/
  //'  background: url(//ssl.gstatic.com/editor/editortoolbar.png) no-repeat -512px 0;',
  '}',

  /* Keyboard shortcut ("accelerator") style. */
  '.goog-menuitem-accel {',
  '  color: #999;',
     /* Keyboard shortcuts are untranslated; always left-to-right. */
     /* #noflip */
  '  direction: ltr;',
  '  left: auto;',
  '  padding: 0 6px;',
  '  position: absolute;',
  '  right: 0;',
  '  text-align: right;',
  '}',

  /* BiDi override for shortcut style. */
  /* #noflip */
  '.goog-menuitem-rtl .goog-menuitem-accel {',
     /* Flip left/right positioning and text alignment. */
  '  left: 0;',
  '  right: auto;',
  '  text-align: left;',
  '}',

  /* Mnemonic styles. */
  '.goog-menuitem-mnemonic-hint {',
  '  text-decoration: underline;',
  '}',

  '.goog-menuitem-mnemonic-separator {',
  '  color: #999;',
  '  font-size: 12px;',
  '  padding-left: 4px;',
  '}',

  /* Copied from: goog/css/menuseparator.css */
  /*
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for menus created by goog.ui.MenuSeparatorRenderer.
   *
   * @author attila@google.com (Attila Bodis)
   */

  '.goog-menuseparator {',
  '  border-top: 1px solid #ccc;',
  '  margin: 4px 0;',
  '  padding: 0;',
  '}',

  /**
   * Standard styling for select menus
   */
  '.goog-flat-menu-button {',
  '  background-color: #fff;',
  '  border: 1px solid #c9c9c9;',
  '  color: #333;',
  '  cursor: pointer;',
  '  font: normal 95%;',
  '  list-style: none;',
  '  margin: 0 2px;',
  '  outline: none;',
  '  padding: 1px 4px;',
  '  position: relative;',
  '  text-decoration: none;',
  '  vertical-align: middle;',
  '}',

  '.goog-flat-menu-button-disabled * {',
  '  border-color: #ccc;',
  '  color: #999;',
  '  cursor: default;',
  '}',

  '.goog-flat-menu-button-hover {',
  '  border-color: #9cf #69e #69e #7af !important; /* Hover border wins. */',
  '}',

  '.goog-flat-menu-button-active {',
  '  background-color: #bbb;',
  '  background-position: bottom left;',
  '}',

  '.goog-flat-menu-button-focused {',
  '  border-color: #bbb;',
  '}',

  '.goog-flat-menu-button-caption {',
  '  padding-right: 10px;',
  '  vertical-align: top;',
  '}',

  '.goog-flat-menu-button-dropdown {',
  '  /* Client apps may override the URL at which they serve the sprite. */',
  '  background: url(https://ssl.gstatic.com/editor/editortoolbar.png) no-repeat -388px 0;',
  '  position: absolute;',
  '  right: 2px;',
  '  top: 0;',
  '  vertical-align: top;',
  '  width: 7px;',
  '}',

  '.goog-inline-block {',
  '  position: relative;',
  '  display: -moz-inline-box; /* Ignored by FF3 and later. */',
  '  display: inline-block;',
  '}',

  ''
];
