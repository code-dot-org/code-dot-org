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
var EvalString = require('./evalString');

var functionalBlocks = require('./functionalBlocks');

var colors = {
  number: { hue: 184, saturation: 1.00, value: 0.74 },
  string: { hue: 258, saturation: 0.35, value: 0.62 },
  image: { hue: 39, saturation: 1.00, value: 0.99},
  boolean: {}
};

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
  functionalBlocks.install(blockly, generator, gensym);

  installString(blockly, generator, gensym);
  installCircle(blockly, generator, gensym);
  installPlaceImage(blockly, generator, gensym);
};

function installString(blockly, generator, gensym) {
  blockly.Blocks.functional_string = {
    // Numeric value.
    init: function() {
      this.setFunctional(true, {
        headerHeight: 0,
        rowBuffer: 3
      });
      this.setHSV(258, 0.35, 0.62);
      this.appendDummyInput()
          .appendTitle(new Blockly.FieldTextInput('string'), 'VAL')
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator.functional_string = function() {
    return "Eval.string('" + this.getTitleValue('VAL') + "')";
  };
}

function installCircle(blockly, generator, gensym) {
  blockly.Blocks.functional_circle = {
    init: function () {
      this.setHSV(39, 1.00, 0.99);
      this.setFunctional(true, {
        headerHeight: 30,
      });

      var options = {
        fixedSize: { height: 35 }
      };

      this.appendDummyInput()
          .appendTitle(new Blockly.FieldLabel('circle', options))
          .setAlign(Blockly.ALIGN_CENTRE);

      this.appendFunctionalInput('SIZE')
          .setColour(colors.number)
          .setCheck('Number');
      this.appendFunctionalInput('STYLE')
          .setInline(true)
          .setColour(colors.string)
          .setCheck('string');
      this.appendFunctionalInput('COLOR')
          .setInline(true)
          .setColour(colors.string)
          .setCheck('string');


      this.setFunctionalOutput(true, 'image');
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

function installPlaceImage(blockly, generator, gensym) {
  blockly.Blocks.place_image = {
    init: function () {
      this.setHSV(39, 1.00, 0.99);
      this.setFunctional(true, {
        headerHeight: 30,
      });

      var options = {
        fixedSize: { height: 35 }
      };

      this.appendDummyInput()
          .appendTitle(new Blockly.FieldLabel('place-image', options))
          .setAlign(Blockly.ALIGN_CENTRE);

      // todo (brent) - more strictly link colour and check so that we can't accidentally
      // have them mismatched?
      this.appendFunctionalInput('IMAGE')
          .setColour(colors.image)
          .setCheck('image');
      this.appendFunctionalInput('X')
          .setInline(true)
          .setColour(colors.number)
          .setCheck('Number');
      this.appendFunctionalInput('Y')
          .setInline(true)
          .setColour(colors.number)
          .setCheck('Number');

      this.setFunctionalOutput(true, 'image');
    }
  };

  generator.place_image = function() {
    var image = Blockly.JavaScript.statementToCode(this, 'IMAGE', false);
    var x = Blockly.JavaScript.statementToCode(this, 'X', false) || '0';
    var y = Blockly.JavaScript.statementToCode(this, 'Y', false) || '0';

    return "Eval.placeImage(" + [image, x, y].join(", ") + ");";
  };
}
