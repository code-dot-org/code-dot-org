/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

// todo - have this be used by the levelTests also?

var path = require('path');
var fs = require('fs');
var jsdomRoot = require('jsdom');
var jsdom = jsdomRoot.jsdom;
var xmldom = require('xmldom');

var BLOCKLY_CODE = fs.readFileSync(path.join(__dirname, '../../build/package/js/blockly.js'));
var BLOCKLY_LOCALE_CODE = fs.readFileSync(path.join(__dirname, '../../build/package/js/en_us/blockly_locale.js'));

function initBlockly () {
  /* jshint -W054 */
  var fn = new Function(BLOCKLY_CODE + ';' + BLOCKLY_LOCALE_CODE + '; return Blockly;');
  return fn.call(window);
}

function setGlobals () {
  // Initialize virtual browser environment.
  var html = '<html><head></head><body><div id="app"></div></body></html>';
  global.document = jsdom(html);
  global.window = global.document.parentWindow;
  global.DOMParser = xmldom.DOMParser;
  global.XMLSerializer = xmldom.XMLSerializer;
  global.Blockly = initBlockly(window);
  //global.Image = canvas.Image;
  jsdomRoot.dom.level3.html.HTMLElement.prototype.getBBox = function () {
    return {
      height: 0,
      width: 0,
      x: 0,
      y: 0
    };
  };
}

setGlobals();
