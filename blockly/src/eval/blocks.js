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

var msg = require('../../locale/current/eval');
var commonMsg = require('../../locale/current/common');

var evalUtils = require('./evalUtils');
var mathBlocks = require('../mathBlocks');
var colors = require('../functionalBlockUtils').colors;
var initTitledFunctionalBlock = require('../functionalBlockUtils').initTitledFunctionalBlock;

// Install extensions to Blockly's language and JavaScript generator.
exports.install = function(blockly, blockInstallOptions) {
  var skin = blockInstallOptions.skin;

  var generator = blockly.Generator.get('JavaScript');
  blockly.JavaScript = generator;

  var gensym = function(name) {
    var NAME_TYPE = blockly.Variables.NAME_TYPE;
    return generator.variableDB_.getDistinctName(name, NAME_TYPE);
  };

  // todo (brent) - rationalize what's in functionalBlocks vs. here and if we
  // can share code between calc and evals functionalBlocks
  mathBlocks.install(blockly, generator, gensym);

  installString(blockly, generator, gensym);
  installCircle(blockly, generator, gensym);
  installPlaceImage(blockly, generator, gensym);
  installOverlay(blockly, generator, gensym);
  installStyle(blockly, generator, gensym);
};

/**
 * functional_string
 */
function installString(blockly, generator, gensym) {
  blockly.Blocks.functional_string = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, colors.string);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldLabel('"'))
          .appendTitle(new Blockly.FieldTextInput('string'), 'VAL')
          .appendTitle(new Blockly.FieldLabel('"'))
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator.functional_string = function() {
    return "Eval.string('" + this.getTitleValue('VAL') + "')";
  };
}

/**
 * functional_circle
 */
function installCircle(blockly, generator, gensym) {
  blockly.Blocks.functional_circle = {
    init: function () {
      // todo - i18n
      initTitledFunctionalBlock(this, 'circle (radius, style, color)', 'image', [
        { name: 'SIZE', type: 'Number' },
        { name: 'STYLE', type: 'string' },
        { name: 'COLOR', type: 'string' }
      ]);
    }
  };

  generator.functional_circle = function() {
    var color = Blockly.JavaScript.statementToCode(this, 'COLOR', false) ||
      "Eval.string('black')";
    var style = Blockly.JavaScript.statementToCode(this, 'STYLE', false) ||
      "Eval.string('solid')";
    var size = Blockly.JavaScript.statementToCode(this, 'SIZE', false) || '0';

    return "Eval.circle(" + [size, style, color].join(", ") + ")";
  };
}

/**
 * place_image
 */
function installPlaceImage(blockly, generator, gensym) {
  blockly.Blocks.place_image = {
    init: function () {
      initTitledFunctionalBlock(this, 'place-image (image, x, y)', 'image', [
        { name: 'IMAGE', type: 'image' },
        { name: 'X', type: 'Number' },
        { name: 'Y', type: 'Number' }
      ]);
    }
  };

  generator.place_image = function() {
    var image = Blockly.JavaScript.statementToCode(this, 'IMAGE', false);
    var x = Blockly.JavaScript.statementToCode(this, 'X', false) || '0';
    var y = Blockly.JavaScript.statementToCode(this, 'Y', false) || '0';

    y = evalUtils.cartesianToPixel(y);

    return "Eval.placeImage(" + [image, x, y].join(", ") + ")";
  };
}


/**
 * overlay
 */
function installOverlay(blockly, generator, gensym) {
  blockly.Blocks.overlay = {
    init: function () {
      initTitledFunctionalBlock(this, 'overlay (top, bottom)', 'image', [
        { name: 'TOP', type: 'image' },
        { name: 'BOTTOM', type: 'image' },
      ]);
    }
  };

  generator.overlay = function() {
    var top = Blockly.JavaScript.statementToCode(this, 'TOP', false);
    var bottom = Blockly.JavaScript.statementToCode(this, 'BOTTOM', false);

    return "Eval.overlay(" + [top, bottom].join(", ") + ")";
  };
}

/**
 * functional_style
 */
function installStyle(blockly, generator, gensym) {
  blockly.Blocks.functional_style = {
    init: function () {
      var VALUES = [
        ['solid', 'solid'],
        ['outline', 'outline'],
        ['25%', '25%'],
        ['50%', '50%'],
        ['75%', '75%']
      ];

      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV.apply(this, colors.string);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldLabel('"'))
          .appendTitle(new blockly.FieldDropdown(VALUES), 'VAL')
          .appendTitle(new Blockly.FieldLabel('"'))
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');

    }
  };

  generator.functional_style = function() {
    return "Eval.string('" + this.getTitleValue('VAL') + "')";
  };
}
