/**
 * Blockly Apps: Puzzle
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
 * @fileoverview JavaScript for Blockly's Puzzle application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Puzzle = {};

// Supported languages.
BlocklyApps.LANGUAGES = {
  // Format: ['Language name', 'direction', 'XX_compressed.js']
  af: ['Afrikaans', 'ltr', 'msg/js/en.js'],
  ar: ['العربية', 'rtl', 'msg/js/en.js'],
  cs: ['Česky', 'ltr', 'msg/js/en.js'],
  'be-tarask': ['Taraškievica', 'ltr', 'msg/js/en.js'],
  br: ['Brezhoneg', 'ltr', 'msg/js/en.js'],
  ca: ['Català', 'ltr', 'msg/js/en.js'],
  cdo: ['閩東語', 'ltr', 'msg/js/zh_tw.js'],
  da: ['Dansk', 'ltr', 'msg/js/en.js'],
  de: ['Deutsch', 'ltr', 'msg/js/de.js'],
  el: ['Ελληνικά', 'ltr', 'msg/js/en.js'],
  en: ['English', 'ltr', 'msg/js/en.js'],
  es: ['Español', 'ltr', 'msg/js/en.js'],
  eu: ['Euskara', 'ltr', 'msg/js/en.js'],
  fa: ['یسراف', 'rtl', 'msg/js/en.js'],
  fi: ['Suomi', 'ltr', 'msg/js/en.js'],
  fo: ['Føroyskt', 'ltr', 'msg/js/en.js'],
  fr: ['Français', 'ltr', 'msg/js/en.js'],
  frr: ['Frasch', 'ltr', 'msg/js/de.js'],
  gl: ['Galego', 'ltr', 'msg/js/en.js'],
  hak: ['客家話', 'ltr', 'msg/js/en.js'],
  he: ['עברית', 'rtl', 'msg/js/en.js'],
  hu: ['Magyar', 'ltr', 'msg/js/en.js'],
  ia: ['Interlingua', 'ltr', 'msg/js/en.js'],
  it: ['Italiano', 'ltr', 'msg/js/en.js'],
  ja: ['日本語', 'ltr', 'msg/js/en.js'],
  ka: ['ქართული', 'ltr', 'msg/js/en.js'],
  km: ['ភាសាខ្មែរ', 'ltr', 'msg/js/en.js'],
  ko: ['한국어', 'ltr', 'msg/js/en.js'],
  ksh: ['Ripoarėsch', 'ltr', 'msg/js/de.js'],
  ky: ['Кыргызча', 'ltr', 'msg/js/en.js'],
  la: ['Latine', 'ltr', 'msg/js/en.js'],
  lb: ['Lëtzebuergesch', 'ltr', 'msg/js/de.js'],
  lt: ['Lietuvių', 'ltr', 'msg/js/en.js'],
  lv: ['Latviešu', 'ltr', 'msg/js/en.js'],
  ml: ['മലയാളം', 'ltr', 'msg/js/en.js'],
  mk: ['Македонски', 'ltr', 'msg/js/en.js'],
  mr: ['मराठी', 'ltr', 'msg/js/en.js'],
  ms: ['Bahasa Melayu', 'ltr', 'msg/js/en.js'],
  mzn: ['مازِرونی', 'rtl', 'msg/js/en.js'],
  nb: ['Norsk Bokmål', 'ltr', 'msg/js/en.js'],
  nl: ['Nederlands, Vlaams', 'ltr', 'msg/js/en.js'],
  oc: ['Lenga d\'òc', 'ltr', 'msg/js/en.js'],
  pa: ['पंजाबी', 'ltr', 'msg/js/en.js'],
  pl: ['Polski', 'ltr', 'msg/js/en.js'],
  pms: ['Piemontèis', 'ltr', 'msg/js/en.js'],
  ps: ['پښتو', 'rtl', 'msg/js/en.js'],
  'pt-br': ['Português', 'ltr', 'msg/js/pt_br.js'],
  ru: ['Русский', 'ltr', 'msg/js/en.js'],
  sk: ['Slovenčina', 'ltr', 'msg/js/en.js'],
  sv: ['Svenska', 'ltr', 'msg/js/en.js'],
  sw: ['Kishwahili', 'ltr', 'msg/js/en.js'],
  tr: ['Türkçe', 'ltr', 'msg/js/en.js'],
  uk: ['Українська', 'ltr', 'msg/js/en.js'],
  vi: ['Tiếng Việt', 'ltr', 'msg/js/vi.js'],
  'zh-hans': ['简体字', 'ltr', 'msg/js/zh_tw.js'],
  'zh-hant': ['中文', 'ltr', 'msg/js/zh_tw.js']
};
BlocklyApps.LANG = BlocklyApps.getLang();
Puzzle.RTL = BlocklyApps.LANGUAGES[BlocklyApps.LANG][1] == 'rtl';

document.write('<script type="text/javascript" src="generated/' +
               BlocklyApps.LANG + '.js"></script>\n');

/**
 * Initialize Blockly and the puzzle.  Called on page load.
 */
Puzzle.init = function() {
  BlocklyApps.init();

  Blockly.inject(document.getElementById('blockly'),
      {path: '../../',
       rtl: Puzzle.RTL,
       scrollbars: false,
       trashcan: false});

  var blocklyDiv = document.getElementById('blockly');
  var onresize = function(e) {
    blocklyDiv.style.width = (window.innerWidth - 20) + 'px';
    blocklyDiv.style.height =
        (window.innerHeight - blocklyDiv.offsetTop - 15) + 'px';
  };
  onresize();
  window.addEventListener('resize', onresize);
  Blockly.fireUiEvent(window, 'resize');

  // Add the blocks.
  if (window.sessionStorage.loadOnceBlocks) {
    var text = window.sessionStorage.loadOnceBlocks;
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(text);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  } else {
    // Create one of every block.
    var blocksCountries = [];
    var blocksFlags = [];
    var blocksCities = [];
    var i = 1;
    while (BlocklyApps.getMsgOrNull('Puzzle_country' + i)) {
      var block = new Blockly.Block(Blockly.mainWorkspace, 'country');
      block.populate(i);
      blocksCountries.push(block);
      var block = new Blockly.Block(Blockly.mainWorkspace, 'flag');
      block.populate(i);
      blocksFlags.push(block);
      var j = 1;
      while (BlocklyApps.getMsgOrNull('Puzzle_country' + i + 'City' + j)) {
        var block = new Blockly.Block(Blockly.mainWorkspace, 'city');
        block.populate(i, j);
        blocksCities.push(block);
        j++;
      }
      i++;
    }
    Puzzle.shuffle(blocksCountries);
    Puzzle.shuffle(blocksFlags);
    Puzzle.shuffle(blocksCities);
    var blocks = [].concat(blocksCountries, blocksFlags, blocksCities);
    if (Puzzle.RTL) {
      blocks.reverse();
    }
    // Initialize all the blocks.
    for (var i = 0, block; block = blocks[i]; i++) {
      block.setDeletable(false);
      block.initSvg();
      block.render();
    }
    var totalArea = 0;
    // Measure the surface area of each block.
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.svg_.getRootElement().getBBox();
      block.cached_width_ = blockBox.width;
      block.cached_height_ = blockBox.height;
      block.cached_area_ = blockBox.width * blockBox.height;
      totalArea += block.cached_area_;
    }
    // Position the blocks randomly.
    var MARGIN = 50;
    Blockly.svgResize();
    var workspaceBox = Blockly.svgSize();
    workspaceBox.width -= MARGIN;
    workspaceBox.height -= MARGIN;
    var countedArea = 0;
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockBox = block.svg_.getRootElement().getBBox();
      // Spread the blocks horizontally, grouped by type.
      // Spacing is proportional to block's area.
      if (Puzzle.RTL) {
        var dx = blockBox.width +
                 (countedArea / totalArea) * workspaceBox.width;
      } else {
        var dx = (countedArea / totalArea) *
                 (workspaceBox.width - blockBox.width);
      }
      dx = Math.round(dx + Math.random() * MARGIN);
      var dy = Math.round(Math.random() *
                          (workspaceBox.height - blockBox.height));
      block.moveBy(dx, dy);
      countedArea += block.cached_area_;
    }
    Puzzle.showHelp(false);
    /**
     * HACK:
     * Chrome (v28) displays a broken image tag on any image that is also
     * shown in the help dialog.  Selecting the block fixes the problem.
     * If Chrome stops corrupting the Australian flag, delete this entire hack.
     */
    if (goog.userAgent.WEBKIT) {
      var blocks = Blockly.mainWorkspace.getAllBlocks();
      for (var i = 0, block; block = blocks[i]; i++) {
        block.select();
      }
      Blockly.selected.unselect();
    }
  }
};

if (window.location.pathname.match(/readonly.html$/)) {
  window.addEventListener('load', BlocklyApps.initReadonly);
} else {
  window.addEventListener('load', Puzzle.init);
}

/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle).
 * Runtime: O(n)
 * Based on Closure's goog.array.shuffle.
 * @param {!Array} arr The array to be shuffled.
 */
Puzzle.shuffle = function(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

/**
 * Return a list of all languages.
 * @return {!Array<!Array<string>>} Array of human-readable and
 *   language-neutral tuples.
 */
Puzzle.languages = function() {
  var list = [[BlocklyApps.getMsg('Puzzle_languageChoose'), '0']];
  var i = 1;
  var lang;
  while (lang = BlocklyApps.getMsgOrNull('Puzzle_country' + i + 'Language')) {
    list[i] = [lang, String(i)];
    i++;
  }
  return list;
};

/**
 * Count and highlight the errors.
 */
Puzzle.checkAnswers = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  var errors = 0;
  for (var b = 0, block; block = blocks[b]; b++) {
    if (!block.isCorrect()) {
      errors++;
      // Bring the offending block to the front.
      block.select();
    }
  }

  var graphValue = document.getElementById('graphValue');
  window.setTimeout(function() {
      graphValue.style.width =
          (100 * (blocks.length - errors) / blocks.length) + 'px';
  }, 500);

  var messages;
  if (errors == 1) {
    messages = [BlocklyApps.getMsg('Puzzle_error1'),
                BlocklyApps.getMsg('Puzzle_tryAgain')];
  } else if (errors) {
    messages = [BlocklyApps.getMsg('Puzzle_error2').replace('%1', errors),
                BlocklyApps.getMsg('Puzzle_tryAgain')];
  } else {
    messages = [BlocklyApps.getMsg('Puzzle_error0').replace(
        '%1', blocks.length)];
  }
  var textDiv = document.getElementById('answerMessage');
  textDiv.textContent = '';
  for (var i = 0; i < messages.length; i++) {
    var line = document.createElement('div');
    line.appendChild(document.createTextNode(messages[i]));
    textDiv.appendChild(line);
  }

  var content = document.getElementById('answers');
  var button = document.getElementById('checkButton');
  var style = {
    width: '25%',
    left: Puzzle.RTL ? '5%' : '70%',
    top: '5em'
  };
  BlocklyApps.showDialog(content, button, true, true, style,
      BlocklyApps.stopDialogKeyDown);
  BlocklyApps.startDialogKeyDown();
};

/**
 * Show the help pop-up.
 * @param {boolean} animate Animate the pop-up opening.
 */
Puzzle.showHelp = function(animate) {
  var help = document.getElementById('help');
  var button = document.getElementById('helpButton');
  var style = {
    width: '50%',
    left: '25%',
    top: '5em'
  };
  BlocklyApps.showDialog(help, button, animate, true, style,
      BlocklyApps.stopDialogKeyDown);
  BlocklyApps.startDialogKeyDown();
};
