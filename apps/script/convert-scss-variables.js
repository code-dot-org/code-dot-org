#!/usr/bin/env node

var path = require('path');
var convertScssToJs = require(path.resolve('../tools/scripts/convertScssToJs.js'));

convertScssToJs(path.resolve('../shared/css/color.scss'), path.resolve('./src/util/color.js'));
convertScssToJs(path.resolve('../shared/css/style-constants.scss'), path.resolve('./src/styleConstants.js'));
