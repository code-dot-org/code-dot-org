#!/usr/bin/env node

var path = require('path');
var convertScssToJs = require(path.resolve('../shared/scripts/convertScssToJs.js'));

convertScssToJs(path.resolve('../shared/css/color.scss'), path.resolve('./src/js/color.js'));
