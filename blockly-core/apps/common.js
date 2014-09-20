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
'use strict';

var BlocklyApps = {};

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
BlocklyApps.getStringParamFromUrl = function(name, defaultValue) {
  var val =
      window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
BlocklyApps.getNumberParamFromUrl = function(name, minValue, maxValue) {
  var val = Number(BlocklyApps.getStringParamFromUrl(name, 'NaN'));
  return isNaN(val) ? minValue : Math.min(Math.max(minValue, val), maxValue);
};

/**
 * Use a series of heuristics that determine the likely language of this user.
 * Use a session cookie to load/save the language preference.
 * @return {string} User's language.
 * @throws {string} If no languages exist in this app.
 */
BlocklyApps.getLang = function() {
  // First choice: The URL specified language.
  var lang = BlocklyApps.getStringParamFromUrl('lang', '');
  if (BlocklyApps.LANGUAGES[lang]) {
    // Save this explicit choice as cookie.
    // Use of a session cookie for saving language is explicitly permitted
    // in the EU's Cookie Consent Exemption policy.  Section 3.6:
    // http://ec.europa.eu/justice/data-protection/article-29/documentation/
    //   opinion-recommendation/files/2012/wp194_en.pdf
    document.cookie = 'lang=' + escape(lang) + '; path=/';
    return lang;
  }
  // Second choice: Language cookie.
  var cookie = document.cookie.match(/(^|;)\s*lang=(\w+)/);
  if (cookie) {
    lang = unescape(cookie[2]);
    if (BlocklyApps.LANGUAGES[lang]) {
      return lang;
    }
  }
  // Third choice: The browser's language.
  lang = navigator.language;
  if (BlocklyApps.LANGUAGES[lang]) {
    return lang;
  }
  // Fourth choice: English.
  lang = 'en';
  if (BlocklyApps.LANGUAGES[lang]) {
    return lang;
  }
  // Fifth choice: I'm feeling lucky.
  for (var lang in BlocklyApps.LANGUAGES) {
    return lang;
  }
  // Sixth choice: Die.
  throw 'No languages available.';
};

/**
 * User's language (e.g. "en").
 * @type string=
 */
BlocklyApps.LANG = undefined;

/**
 * List of languages supported by this app.  Keys should be in ISO 639 format.
 * @type !Object=
 */
BlocklyApps.LANGUAGES = undefined;

/**
 * Common startup tasks for all apps.
 */
BlocklyApps.init = function() {
  // Set the page title with the content of the H1 title.
  document.title = document.getElementById('title').textContent;

  // Set the HTML's language and direction.
  // document.dir fails in Mozilla, use document.body.parentNode.dir instead.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=151407
  var rtl = BlocklyApps.LANGUAGES[BlocklyApps.LANG][1] == 'rtl';
  document.head.parentElement.setAttribute('dir',
      BlocklyApps.LANGUAGES[BlocklyApps.LANG][1]);
  document.head.parentElement.setAttribute('lang', BlocklyApps.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in BlocklyApps.LANGUAGES) {
    languages.push(BlocklyApps.LANGUAGES[lang].concat(lang));
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == BlocklyApps.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }

  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if ('BlocklyStorage' in window) {
    BlocklyStorage.HTTPREQUEST_ERROR = BlocklyApps.getMsg('httpRequestError');
    BlocklyStorage.LINK_ALERT = BlocklyApps.getMsg('linkAlert');
    BlocklyStorage.HASH_ERROR = BlocklyApps.getMsg('hashError');
    BlocklyStorage.XML_ERROR = BlocklyApps.getMsg('xmlError');
    // Swap out the BlocklyStorage's alert() for a nicer dialog.
    BlocklyStorage.alert = BlocklyApps.storageAlert;
  } else if (linkButton) {
    linkButton.className = 'disabled';
  }

  // Fixes viewport for small screens.
  var viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && screen.availWidth < 725) {
    viewport.setAttribute('content',
        'width=725, initial-scale=.35, user-scalable=no');
  }
};

/**
 * Initialize Blockly for a readonly iframe.  Called on page load.
 * XML argument may be generated from the console with:
 * encodeURIComponent(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)).slice(5, -6))
 */
BlocklyApps.initReadonly = function() {
  var rtl = BlocklyApps.LANGUAGES[BlocklyApps.LANG][1] == 'rtl';
  Blockly.inject(document.getElementById('blockly'),
      {path: '../../',
       readOnly: true,
       rtl: rtl,
       scrollbars: false});

  // Add the blocks.
  var xml = BlocklyApps.getStringParamFromUrl('xml', '');
  xml = Blockly.Xml.textToDom('<xml>' + xml + '</xml>');
  Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
BlocklyApps.loadBlocks = function(defaultXml) {
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  }
  else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
};

/**
 * Save the blocks and reload with a different language.
 */
BlocklyApps.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var text = Blockly.Xml.domToText(xml);
  window.sessionStorage.loadOnceBlocks = text;

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Highlight the block (or clear highlighting).
 * @param {?string} id ID of block that triggered this action.
 */
BlocklyApps.highlight = function(id) {
  if (id) {
    var m = id.match(/^block_id_(\d+)$/);
    if (m) {
      id = m[1];
    }
  }
  Blockly.mainWorkspace.highlightBlock(id);
};

/**
 * If the user has executed too many actions, we're probably in an infinite
 * loop.  Sadly I wasn't able to solve the Halting Problem.
 * @param {?string} opt_id ID of loop block to highlight.
 * @throws {Infinity} Throws an error to terminate the user's program.
 */
BlocklyApps.checkTimeout = function(opt_id) {
  if (opt_id) {
    BlocklyApps.log.push([null, opt_id]);
  }
  if (BlocklyApps.ticks-- < 0) {
    throw Infinity;
  }
};

/**
 * Is the dialog currently onscreen?
 * @private
 */
BlocklyApps.isDialogVisible_ = false;

/**
 * A closing dialog should animate towards this element.
 * @type Element
 * @private
 */
BlocklyApps.dialogOrigin_ = null;

/**
 * A function to call when a dialog closes.
 * @type Function
 * @private
 */
BlocklyApps.dialogDispose_ = null;

/**
 * Show the dialog pop-up.
 * @param {!Element} content DOM element to display in the dialog.
 * @param {Element} origin Animate the dialog opening/closing from/to this
 *     DOM element.  If null, don't show any animations for opening or closing.
 * @param {boolean} animate Animate the dialog opening (if origin not null).
 * @param {boolean} modal If true, grey out background and prevent interaction.
 * @param {!Object} style A dictionary of style rules for the dialog.
 * @param {Function} disposeFunc An optional function to call when the dialog
 *     closes.  Normally used for unhooking events.
 */
BlocklyApps.showDialog = function(content, origin, animate, modal, style,
                                  disposeFunc) {
  if (BlocklyApps.isDialogVisible_) {
    BlocklyApps.hideDialog(false);
  }
  BlocklyApps.isDialogVisible_ = true;
  BlocklyApps.dialogOrigin_ = origin;
  BlocklyApps.dialogDispose_ = disposeFunc;
  var dialog = document.getElementById('dialog');
  var shadow = document.getElementById('dialogShadow');
  var border = document.getElementById('dialogBorder');

  // Copy all the specified styles to the dialog.
  for (var name in style) {
    dialog.style[name] = style[name];
  }
  if (modal) {
    shadow.style.visibility = 'visible';
    shadow.style.opacity = 0.3;
    var header = document.createElement('div');
    header.id = 'dialogHeader';
    dialog.appendChild(header);
    BlocklyApps.dialogMouseDownWrapper_ =
        Blockly.bindEvent_(header, 'mousedown', this,
                           BlocklyApps.dialogMouseDown_);
  }
  dialog.appendChild(content);
  content.className = content.className.replace('dialogHiddenContent', '');

  function endResult() {
    dialog.style.visibility = 'visible';
    dialog.style.zIndex = 1;
    border.style.visibility = 'hidden';
  }
  if (animate && origin) {
    BlocklyApps.matchBorder_(origin, false, 0.2);
    BlocklyApps.matchBorder_(dialog, true, 0.8);
    // In 175ms show the dialog and hide the animated border.
    window.setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
};

/**
 * Horizontal start coordinate of dialog drag.
 */
BlocklyApps.dialogStartX_ = 0;

/**
 * Vertical start coordinate of dialog drag.
 */
BlocklyApps.dialogStartY_ = 0;

/**
 * Handle start of drag of dialog.
 * @param {!Event} e Mouse down event.
 * @private
 */
BlocklyApps.dialogMouseDown_ = function(e) {
  BlocklyApps.dialogUnbindDragEvents_();
  if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  }
  // Left click (or middle click).
  // Record the starting offset between the current location and the mouse.
  var dialog = document.getElementById('dialog');
  BlocklyApps.dialogStartX_ = dialog.offsetLeft - e.clientX;
  BlocklyApps.dialogStartY_ = dialog.offsetTop - e.clientY;

  BlocklyApps.dialogMouseUpWrapper_ = Blockly.bindEvent_(document,
      'mouseup', this, BlocklyApps.dialogUnbindDragEvents_);
  BlocklyApps.dialogMouseMoveWrapper_ = Blockly.bindEvent_(document,
      'mousemove', this, BlocklyApps.dialogMouseMove_);
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Drag the dialog to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
BlocklyApps.dialogMouseMove_ = function(e) {
  var dialog = document.getElementById('dialog');
  var dialogLeft = BlocklyApps.dialogStartX_ + e.clientX;
  var dialogTop = BlocklyApps.dialogStartY_ + e.clientY;
  dialogTop = Math.max(dialogTop, 0);
  dialogTop = Math.min(dialogTop, window.innerHeight - dialog.offsetHeight);
  dialogLeft = Math.max(dialogLeft, 0);
  dialogLeft = Math.min(dialogLeft, window.innerWidth - dialog.offsetWidth);
  dialog.style.left = dialogLeft + 'px';
  dialog.style.top = dialogTop + 'px';
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
BlocklyApps.dialogUnbindDragEvents_ = function() {
  if (BlocklyApps.dialogMouseUpWrapper_) {
    Blockly.unbindEvent_(BlocklyApps.dialogMouseUpWrapper_);
    BlocklyApps.dialogMouseUpWrapper_ = null;
  }
  if (BlocklyApps.dialogMouseMoveWrapper_) {
    Blockly.unbindEvent_(BlocklyApps.dialogMouseMoveWrapper_);
    BlocklyApps.dialogMouseMoveWrapper_ = null;
  }
};

/**
 * Hide the dialog pop-up.
 * @param {boolean} opt_animate Animate the dialog closing.  Defaults to true.
 *     Requires that origin was not null when dialog was opened.
 */
BlocklyApps.hideDialog = function(opt_animate) {
  if (!BlocklyApps.isDialogVisible_) {
    return;
  }
  BlocklyApps.dialogUnbindDragEvents_();
  if (BlocklyApps.dialogMouseDownWrapper_) {
    Blockly.unbindEvent_(BlocklyApps.dialogMouseDownWrapper_);
    BlocklyApps.dialogMouseDownWrapper_ = null;
  }

  BlocklyApps.isDialogVisible_ = false;
  BlocklyApps.dialogDispose_ && BlocklyApps.dialogDispose_();
  BlocklyApps.dialogDispose_ = null;
  var origin = (opt_animate === false) ? null : BlocklyApps.dialogOrigin_;
  var dialog = document.getElementById('dialog');
  var shadow = document.getElementById('dialogShadow');
  var border = document.getElementById('dialogBorder');

  shadow.style.opacity = 0;

  function endResult() {
    shadow.style.visibility = 'hidden';
    border.style.visibility = 'hidden';
  }
  if (origin) {
    BlocklyApps.matchBorder_(dialog, false, 0.8);
    BlocklyApps.matchBorder_(origin, true, 0.2);
    // In 175ms hide both the shadow and the animated border.
    window.setTimeout(endResult, 175);
  } else {
    // No animation.  Just set the final state.
    endResult();
  }
  dialog.style.visibility = 'hidden';
  dialog.style.zIndex = -1;
  var header = document.getElementById('dialogHeader');
  if (header) {
    header.parentNode.removeChild(header);
  }
  while (dialog.firstChild) {
    var content = dialog.firstChild;
    content.className += ' dialogHiddenContent';
    document.body.appendChild(content);
  }
};

/**
 * Match the animated border to the a element's size and location.
 * @param {!Element} element Element to match.
 * @param {boolean} animate Animate to the new location.
 * @param {number} opacity Opacity of border.
 * @private
 */
BlocklyApps.matchBorder_ = function(element, animate, opacity) {
  if (!element) {
    return;
  }
  var border = document.getElementById('dialogBorder');
  var bBox = BlocklyApps.getBBox_(element);
  function change() {
    border.style.width = bBox.width + 'px';
    border.style.height = bBox.height + 'px';
    border.style.left = bBox.x + 'px';
    border.style.top = bBox.y + 'px';
    border.style.opacity = opacity;
  }
  if (animate) {
    border.className = 'dialogAnimate';
    window.setTimeout(change, 1);
  } else {
    border.className = '';
    change();
  }
  border.style.visibility = 'visible';
};

/**
 * Compute the absolute coordinates and dimensions of an HTML or SVG element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
BlocklyApps.getBBox_ = function(element) {
  if (element.getBBox) {
    // SVG element.
    var bBox = element.getBBox();
    var height = bBox.height;
    var width = bBox.width;
    var xy = Blockly.getAbsoluteXY_(element);
    var x = xy.x;
    var y = xy.y;
  } else {
    // HTML element.
    var height = element.offsetHeight;
    var width = element.offsetWidth;
    var x = 0;
    var y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
  }
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * Display a storage-related modal dialog.
 * @param {string} message Text to alert.
 */
BlocklyApps.storageAlert = function(message) {
  var container = document.getElementById('containerStorage');
  container.textContent = '';
  var lines = message.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(lines[i]));
    container.appendChild(p);
  }

  var content = document.getElementById('dialogStorage');
  var origin = document.getElementById('linkButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  function disposeFunc() {
    content.parentNode.removeChild(content);
    BlocklyApps.stopDialogKeyDown();
  }
  BlocklyApps.showDialog(content, origin, true, true, style, disposeFunc);
  BlocklyApps.startDialogKeyDown();
};

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
BlocklyApps.stripCode = function(code) {
  // Strip out serial numbers.
  code = code.replace(/(,\s*)?'block_id_\d+'\)/g, ')');
  // Remove timeouts.
  var regex = new RegExp(Blockly.JavaScript.INFINITE_LOOP_TRAP
      .replace('(%1)', '\\((\'\\d+\')?\\)'), 'g');
  return code.replace(regex, '');
};

/**
 * Show the user's code in raw JavaScript.
 * @param {Element} origin Animate the dialog opening/closing from/to this
 *     DOM element.  If null, don't show any animations for opening or closing.
 */
BlocklyApps.showCode = function(origin) {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  code = BlocklyApps.stripCode(code);
  var pre = document.getElementById('containerCode');
  pre.textContent = code;
  if (typeof prettyPrintOne == 'function') {
    code = pre.innerHTML;
    code = prettyPrintOne(code, 'js');
    pre.innerHTML = code;
  }

  var content = document.getElementById('dialogCode');
  var style = {
    width: '40%',
    left: '30%',
    top: '5em'
  };
  BlocklyApps.showDialog(content, origin, true, true, style,
      BlocklyApps.stopDialogKeyDown);
  BlocklyApps.startDialogKeyDown();
};

/**
 * If the user preses enter, escape, or space, hide the dialog.
 * @param {!Event} e Keyboard event.
 * @private
 */
BlocklyApps.dialogKeyDown_ = function(e) {
  if (BlocklyApps.isDialogVisible_) {
    if (e.keyCode == 13 ||
        e.keyCode == 27 ||
        e.keyCode == 32) {
      BlocklyApps.hideDialog(true);
      e.stopPropagation();
      e.preventDefault();
    }
  }
};

/**
 * Start listening for BlocklyApps.dialogKeyDown_.
 */
BlocklyApps.startDialogKeyDown = function() {
  document.body.addEventListener('keydown',
      BlocklyApps.dialogKeyDown_, true);
};

/**
 * Stop listening for BlocklyApps.dialogKeyDown_.
 */
BlocklyApps.stopDialogKeyDown = function() {
  document.body.removeEventListener('keydown',
      BlocklyApps.dialogKeyDown_, true);
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or an error message if the element was not found.
 */
BlocklyApps.getMsg = function(key) {
  var msg = BlocklyApps.getMsgOrNull(key);
  return msg === null ? '[Unknown message: ' + key + ']' : msg;
};

/**
 * Gets the message with the given key from the document.
 * @param {string} key The key of the document element.
 * @return {string} The textContent of the specified element,
 *     or null if the element was not found.
 */
BlocklyApps.getMsgOrNull = function(key) {
  var element = document.getElementById(key);
  if (element) {
    var text = element.textContent;
    // Convert newline sequences.
    text = text.replace(/\\n/g, '\n');
    return text;
  } else {
    return null;
  }
};

/**
 * On touch enabled browsers, add touch-friendly variants of event handlers
 * for elements such as buttons whose event handlers are specified in the
 * markup. For example, ontouchend is treated as equivalent to onclick.
 */
BlocklyApps.addTouchEvents = function() {
  // Do nothing if the browser doesn't support touch.
    if (!('ontouchstart' in document.documentElement) && window.navigator.msMaxTouchPoints <= 1) {
    return;
  }
  // Treat ontouchend as equivalent to onclick for buttons.
  var buttons = document.getElementsByTagName('button');
  for (var i = 0, button; button = buttons[i]; i++) {
      if (window.navigator.msPointerEnabled && !button.onmspointerup) {  // IE 10 support
          button.onmspointerup = button.onclick;
      }
      else if (window.navigator.pointerEnabled && !button.onpointerup) {  // IE 11+ support
          button.onpointerup = button.onclick;
      }
      else if (!button.ontouchend) {
          button.ontouchend = button.onclick;
      }
  }
};

// Add events for touch devices when the window is done loading.
window.addEventListener('load', BlocklyApps.addTouchEvents, false);

/**
 * Load the Prettify CSS and JavaScript.
 */
BlocklyApps.importPrettify = function() {
  //<link rel="stylesheet" type="text/css" href="../prettify.css">
  //<script type="text/javascript" src="../prettify.js"></script>
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '../prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', '../prettify.js');
  document.head.appendChild(script);
};
