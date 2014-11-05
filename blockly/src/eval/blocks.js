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
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');
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

  sharedFunctionalBlocks.install(blockly, generator, gensym);

  installString(blockly, generator, gensym);

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_display',
    blockTitle: msg.displayBlockTitle(),
    apiName: 'display',
    returnType: 'none',
    args: [
      { name: 'ARG1', type: 'none' },
    ]
  });

  // shapes
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_circle',
    blockTitle: msg.circleBlockTitle(),
    apiName: 'circle',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_triangle',
    blockTitle: msg.triangleBlockTitle(),
    apiName: 'triangle',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_square',
    blockTitle: msg.squareBlockTitle(),
    apiName: 'square',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_rectangle',
    blockTitle: msg.rectangleBlockTitle(),
    apiName: 'rectangle',
    args: [
      { name: 'WIDTH', type: 'Number' },
      { name: 'HEIGHT', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_ellipse',
    blockTitle: msg.ellipseBlockTitle(),
    apiName: 'ellipse',
    args: [
      { name: 'WIDTH', type: 'Number' },
      { name: 'HEIGHT', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_star',
    blockTitle: msg.starBlockTitle(),
    apiName: 'star',
    args: [
      { name: 'SIZE', type: 'Number' },
      { name: 'STYLE', type: 'string' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_text',
    blockTitle: msg.textBlockTitle(),
    apiName: 'text',
    args: [
      { name: 'TEXT', type: 'string' },
      { name: 'SIZE', type: 'Number' },
      { name: 'COLOR', type: 'string' }
    ]
  });

  // image manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'overlay',
    blockTitle: msg.overlayBlockTitle(),
    apiName: 'overlay',
    args: [
      { name: 'TOP', type: 'image' },
      { name: 'BOTTOM', type: 'image' },
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'underlay',
    blockTitle: msg.underlayBlockTitle(),
    apiName: 'underlay',
    args: [
      { name: 'BOTTOM', type: 'image' },
      { name: 'TOP', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'place_image',
    blockTitle: msg.placeImageBlockTitle(),
    apiName: 'placeImage',
    args: [
      { name: 'X', type: 'Number' },
      { name: 'Y', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'rotate',
    blockTitle: msg.rotateImageBlockTitle(),
    apiName: 'rotateImage',
    args: [
      { name: 'DEGREES', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'scale',
    blockTitle: msg.scaleImageBlockTitle(),
    apiName: 'scaleImage',
    args: [
      { name: 'FACTOR', type: 'Number' },
      { name: 'IMAGE', type: 'image' }
    ]
  });

  // string manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_append',
    blockTitle: msg.stringAppendBlockTitle(),
    apiName: 'stringAppend',
    returnType: 'string',
    args: [
      { name: 'FIRST', type: 'string' },
      { name: 'SECOND', type: 'string' }
    ]
  });

  // polling for values
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_length',
    blockTitle: msg.stringLengthBlockTitle(),
    apiName: 'stringLength',
    returnType: 'Number',
    args: [
      { name: 'STR', type: 'string' }
    ]
  });

  installStyle(blockly, generator, gensym);
};


function installFunctionalBlock (blockly, generator, gensym, options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;
  var returnType = options.returnType || 'image';

  blockly.Blocks[blockName] = {
    init: function () {
      initTitledFunctionalBlock(this, blockTitle, returnType, args);
    }
  };

  generator[blockName] = function() {
    var apiArgs = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var apiArg = Blockly.JavaScript.statementToCode(this, arg.name, false);
      // Provide defaults
      if (!apiArg) {
        if (arg.type === 'Number') {
          apiArg = '0';
        } else if (arg.name === 'STYLE') {
          apiArg = "Eval.string('solid')";
        } else if (arg.name === 'COLOR') {
          apiArg = "Eval.string('black')";
        }
      }
      apiArgs.push(apiArg);
    }

    return "Eval." + apiName + "(" + apiArgs.join(", ") + ")";
  };
}

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
          .appendTitle(new Blockly.FieldTextInput(msg.string()), 'VAL')
          .appendTitle(new Blockly.FieldLabel('"'))
          .setAlign(Blockly.ALIGN_CENTRE);
      this.setFunctionalOutput(true, 'string');
    }
  };

  generator.functional_string = function() {
    return "Eval.string(" +
        blockly.JavaScript.quote_(this.getTitleValue('VAL')) + ")";
  };
}

/**
 * functional_style
 */
function installStyle(blockly, generator, gensym) {
  blockly.Blocks.functional_style = {
    init: function () {
      var VALUES = [
        [msg.solid(), 'solid'],
        ['75%', '75%'],
        ['50%', '50%'],
        ['25%', '25%'],
        [msg.outline(), 'outline']
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
