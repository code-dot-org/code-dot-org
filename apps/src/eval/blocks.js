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

var msg = require('./locale');
var commonMsg = require('../locale');

var evalUtils = require('./evalUtils');
var sharedFunctionalBlocks = require('../sharedFunctionalBlocks');

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

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_display',
    blockTitle: msg.displayBlockTitle(),
    apiName: 'display',
    returnType: blockly.BlockValueType.NONE,
    args: [
      {name: 'ARG1', type: blockly.BlockValueType.NONE},
    ]
  });

  // shapes
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_circle',
    blockTitle: msg.circleBlockTitle(),
    apiName: 'circle',
    args: [
      {name: 'SIZE', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_triangle',
    blockTitle: msg.triangleBlockTitle(),
    apiName: 'triangle',
    args: [
      {name: 'SIZE', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_square',
    blockTitle: msg.squareBlockTitle(),
    apiName: 'square',
    args: [
      {name: 'SIZE', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_rectangle',
    blockTitle: msg.rectangleBlockTitle(),
    apiName: 'rectangle',
    args: [
      {name: 'WIDTH', type: blockly.BlockValueType.NUMBER},
      {name: 'HEIGHT', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_ellipse',
    blockTitle: msg.ellipseBlockTitle(),
    apiName: 'ellipse',
    args: [
      {name: 'WIDTH', type: blockly.BlockValueType.NUMBER},
      {name: 'HEIGHT', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_star',
    blockTitle: msg.starBlockTitle(),
    apiName: 'star',
    args: [
      {name: 'SIZE', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_radial_star',
    blockTitle: msg.radialStarBlockTitle(),
    apiName: 'radialStar',
    args: [
      {name: 'POINTS', type: blockly.BlockValueType.NUMBER},
      {name: 'INNER', type: blockly.BlockValueType.NUMBER},
      {name: 'OUTER', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_polygon',
    blockTitle: msg.polygonBlockTitle(),
    apiName: 'polygon',
    args: [
      {name: 'SIDES', type: blockly.BlockValueType.NUMBER},
      {name: 'LENGTH', type: blockly.BlockValueType.NUMBER},
      {name: 'STYLE', type: blockly.BlockValueType.STRING},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'functional_text',
    blockTitle: msg.textBlockTitle(),
    apiName: 'text',
    args: [
      {name: 'TEXT', type: blockly.BlockValueType.STRING},
      {name: 'SIZE', type: blockly.BlockValueType.NUMBER},
      {name: 'COLOR', type: blockly.BlockValueType.STRING}
    ]
  });

  // image manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'overlay',
    blockTitle: msg.overlayBlockTitle(),
    apiName: 'overlay',
    args: [
      {name: 'TOP', type: blockly.BlockValueType.IMAGE},
      {name: 'BOTTOM', type: blockly.BlockValueType.IMAGE},
    ],
    verticallyStackInputs: true
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'underlay',
    blockTitle: msg.underlayBlockTitle(),
    apiName: 'underlay',
    args: [
      {name: 'BOTTOM', type: blockly.BlockValueType.IMAGE},
      {name: 'TOP', type: blockly.BlockValueType.IMAGE}
    ],
    verticallyStackInputs: true
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'place_image',
    blockTitle: msg.placeImageBlockTitle(),
    apiName: 'placeImage',
    args: [
      {name: 'X', type: blockly.BlockValueType.NUMBER},
      {name: 'Y', type: blockly.BlockValueType.NUMBER},
      {name: 'IMAGE', type: blockly.BlockValueType.IMAGE}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'offset',
    blockTitle: msg.offsetBlockTitle(),
    apiName: 'offset',
    args: [
      {name: 'X', type: blockly.BlockValueType.NUMBER},
      {name: 'Y', type: blockly.BlockValueType.NUMBER},
      {name: 'IMAGE', type: blockly.BlockValueType.IMAGE}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'rotate',
    blockTitle: msg.rotateImageBlockTitle(),
    apiName: 'rotateImage',
    args: [
      {name: 'DEGREES', type: blockly.BlockValueType.NUMBER},
      {name: 'IMAGE', type: blockly.BlockValueType.IMAGE}
    ]
  });

  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'scale',
    blockTitle: msg.scaleImageBlockTitle(),
    apiName: 'scaleImage',
    args: [
      {name: 'FACTOR', type: blockly.BlockValueType.NUMBER},
      {name: 'IMAGE', type: blockly.BlockValueType.IMAGE}
    ]
  });

  // string manipulation
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_append',
    blockTitle: msg.stringAppendBlockTitle(),
    apiName: 'stringAppend',
    returnType: blockly.BlockValueType.STRING,
    args: [
      {name: 'FIRST', type: blockly.BlockValueType.STRING},
      {name: 'SECOND', type: blockly.BlockValueType.STRING}
    ]
  });

  // polling for values
  installFunctionalBlock(blockly, generator, gensym, {
    blockName: 'string_length',
    blockTitle: msg.stringLengthBlockTitle(),
    apiName: 'stringLength',
    returnType: blockly.BlockValueType.NUMBER,
    args: [
      {name: 'STR', type: blockly.BlockValueType.STRING}
    ]
  });

  blockly.FunctionalBlockUtils.installStringPicker(blockly, generator, {
    blockName: 'functional_style',
    values: [
      [msg.solid(), 'solid'],
      ['75%', '75%'],
      ['50%', '50%'],
      ['25%', '25%'],
      [msg.outline(), 'outline']
    ]
  });
};


function installFunctionalBlock(blockly, generator, gensym, options) {
  var blockName = options.blockName;
  var blockTitle = options.blockTitle;
  var apiName = options.apiName;
  var args = options.args;
  var returnType = options.returnType || blockly.BlockValueType.IMAGE;

  blockly.Blocks[blockName] = {
    init: function () {
      blockly.FunctionalBlockUtils.initTitledFunctionalBlock(this, blockTitle, returnType, args, {
        verticallyStackInputs: options.verticallyStackInputs
      });
    }
  };

  generator[blockName] = function() {
    var apiArgs = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      var apiArg = Blockly.JavaScript.statementToCode(this, arg.name, false);
      // Provide defaults
      if (!apiArg) {
        if (arg.type === blockly.BlockValueType.NUMBER) {
          apiArg = '0';
        } else if (arg.name === 'STYLE') {
          apiArg = blockly.JavaScript.quote_('solid');
        } else if (arg.name === 'COLOR') {
          apiArg = blockly.JavaScript.quote_('black');
        }
      }
      apiArgs.push(apiArg);
    }

    return "Eval." + apiName + "(" + apiArgs.join(", ") + ")";
  };
}
