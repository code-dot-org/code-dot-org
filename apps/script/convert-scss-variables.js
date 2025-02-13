#!/usr/bin/env node

var path = require('path');
var convertScssToJs = require(path.resolve(
  '../tools/scripts/convertScssToJs.js'
));

convertScssToJs(
  path.resolve('../shared/css/color.scss'),
  path.resolve('./src/util/color.js')
);
convertScssToJs(
  path.resolve('../shared/css/style-constants.scss'),
  path.resolve('./src/styleConstants.js')
);
convertScssToJs(
  path.resolve('node_modules/@code-dot-org/component-library-styles/font.scss'),
  path.resolve('./src/fontConstants.js')
);
