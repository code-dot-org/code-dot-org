require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({111:[function(require,module,exports){
var appMain = require('../appMain');
var studioApp = require('../StudioApp').singleton;
var NetSim = require('./netsim');

var levels = require('./levels');
var skins = require('./skins');

window.netsimMain = function(options) {
  options.skinsModule = skins;
  options.isEditorless = true;

  var netSim = new NetSim();
  netSim.injectStudioApp(studioApp);
  appMain(netSim, levels, options);
};

},{"../StudioApp":2,"../appMain":3,"./levels":110,"./netsim":112,"./skins":114}],114:[function(require,module,exports){
var skinBase = require('../skins');

exports.load = function (assetUrl, id) {
  var skin = skinBase.load(assetUrl, id);
  return skin;
};

},{"../skins":117}],112:[function(require,module,exports){
/**
 * Internet Simulator
 *
 * Copyright 2015 Code.org
 * http://code.org/
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
 * @fileoverview Internet Simulator app for Code.org.
 */

/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
*/
/* global -Blockly */
'use strict';

var dom = require('../dom');
var page = require('./page.html');
var utils = require('../utils');
var _ = utils.getLodash();

/**
 * The top-level Internet Simulator controller.
 * @param {StudioApp} studioApp The studioApp instance to build upon.
 */
var NetSim = function () {
  this.skin = null;
  this.level = null;
  this.heading = 0;
};

module.exports = NetSim;


/**
 *
 */
NetSim.prototype.injectStudioApp = function (studioApp) {
  this.studioApp_ = studioApp;
};

/**
 * Handler for clicking on the send button in the middle of the screen.
 * This is a temporary handler for a temporary UI element - may get
 * torn out.
 * @private
 */
NetSim.prototype.onSendButtonClick_ = function () {
  // TODO (bbuchanan) : This is super hacky "hello world" stuff.  remove it.
  var now = new Date();
  var fromBox = document.getElementById('netsim_inputbox');
  var toBox = document.getElementById('netsim_recievelog');
  toBox.value += '[' + now.toTimeString() + '] ' + fromBox.value + '\n';
  toBox.scrollTop = toBox.scrollHeight;
};

/**
 * Hook up input handlers to controls on the netsim page
 * @private
 */
NetSim.prototype.attachHandlers_ = function () {
  dom.addClickTouchEvent(
      document.getElementById('netsim_sendbutton'),
      _.bind(this.onSendButtonClick_, this)
  );
};

/**
 * Called on page load.
 * @param {Object} config Requires the following members:
 *   skin: ???
 *   level: ???
 */
NetSim.prototype.init = function(config) {
  if (!this.studioApp_) {
    throw new Error("NetSim requires a StudioApp");
  }

  this.skin = config.skin;
  this.level = config.level;

  config.html = page({
    assetUrl: this.studioApp_.assetUrl,
    data: {
      visualization: '',
      localeDirection: this.studioApp_.localeDirection(),
      controls: require('./controls.html')({assetUrl: this.studioApp_.assetUrl})
    },
    hideRunButton: true
  });

  config.enableShowCode = false;
  config.loadAudio = _.bind(this.loadAudio_, this);

  // Override certain StudioApp methods - netsim does a lot of configuration
  // itself, because of its nonstandard layout.
  this.studioApp_.configureDom = _.bind(this.configureDomOverride_,
      this.studioApp_);
  this.studioApp_.onResize = _.bind(this.onResizeOverride_, this.studioApp_);

  this.studioApp_.init(config);

  this.attachHandlers_();
};

/**
 * Load audio assets for this app
 * TODO (bbuchanan): Ought to pull this into an audio management module
 * @private
 */
NetSim.prototype.loadAudio_ = function () {
  this.studioApp_.loadAudio(this.skin.winSound, 'win');
  this.studioApp_.loadAudio(this.skin.startSound, 'start');
  this.studioApp_.loadAudio(this.skin.failureSound, 'failure');
};

/**
 * Replaces StudioApp.configureDom.
 * Should be bound against StudioApp instance.
 * @param {Object} config Should at least contain
 *   containerId: ID of a parent DOM element for app content
 *   html: Content to put inside #containerId
 * @private
 */
NetSim.prototype.configureDomOverride_ = function (config) {
  var container = document.getElementById(config.containerId);
  container.innerHTML = config.html;
};

/**
 * Replaces StudioApp.onResize
 * Should be bound against StudioApp instance.
 * @private
 */
NetSim.prototype.onResizeOverride_ = function() {
  var div = document.getElementById('appcontainer');
  var divParent = div.parentNode;
  var parentStyle = window.getComputedStyle(divParent);
  var parentWidth = parseInt(parentStyle.width, 10);
  div.style.top = divParent.offsetTop + 'px';
  div.style.width = parentWidth + 'px';
  this.resizeHeaders(parentWidth);
};
},{"../dom":43,"../utils":157,"./controls.html":109,"./page.html":113}],113:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('');1;
  var msg = require('../../locale/current/common');
  var netsimMsg = require('../../locale/current/netsim');
; buf.push('\n\n<div id="rotateContainer" style="background-image: url(', escape((6,  assetUrl('media/mobile_tutorial_turnphone.png') )), ')">\n  <div id="rotateText">\n    <p>', escape((8,  msg.rotateText() )), '<br>', escape((8,  msg.orientationLock() )), '</p>\n  </div>\n</div>\n\n');12; var instructions = function() {; buf.push('  <div id="bubble" class="clearfix">\n    <table id="prompt-table">\n      <tr>\n        <td id="prompt-icon-cell">\n          <img id="prompt-icon"/>\n        </td>\n        <td id="prompt-cell">\n          <p id="prompt">\n          </p>\n        </td>\n      </tr>\n    </table>\n    <div id="ani-gif-preview-wrapper">\n      <div id="ani-gif-preview">\n        <img id="play-button" src="', escape((26,  assetUrl('media/play-circle.png') )), '"/>\n      </div>\n    </div>\n  </div>\n');30; };; buf.push('\n');31; // A spot for the server to inject some HTML for help content.
var helpArea = function(html) {; buf.push('  ');32; if (html) {; buf.push('    <div id="helpArea">\n      ', (33,  html ), '\n    </div>\n  ');35; }; buf.push('');35; };; buf.push('\n<div id="appcontainer">\n  <div id="headers" dir="', escape((37,  data.localeDirection )), '">\n    <div id="workspace-header" class="blockly-header">\n      <span id="workspace-header-span">', escape((39,  netsimMsg.workspaceHeader())), ' </span>\n    </div>\n  </div>\n  <div id="footers" dir="', escape((42,  data.localeDirection )), '">\n    ');43; instructions() ; buf.push('\n    ');44; helpArea(data.helpHtml) ; buf.push('\n  </div>\n  <div id="netsim">\n    <textarea id="netsim_inputbox"></textarea>\n    <input id="netsim_sendbutton" type="button" value="Send" />\n    <textarea id="netsim_recievelog"></textarea>\n  </div>\n</div>\n\n<div class="clear"></div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"../../locale/current/common":162,"../../locale/current/netsim":167,"ejs":178}],110:[function(require,module,exports){
/*jshint multistr: true */

var msg = require('../../locale/current/netsim');

/*
 * Configuration for all levels.
 */
var levels = module.exports = {};

levels.netsim_demo = {
  'freePlay': true
};

},{"../../locale/current/netsim":167}],167:[function(require,module,exports){
/*netsim*/ module.exports = window.blockly.appLocale;
},{}],109:[function(require,module,exports){
module.exports= (function() {
  var t = function anonymous(locals, filters, escape) {
escape = escape || function (html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
var buf = [];
with (locals || {}) { (function(){ 
 buf.push('<div id="slider-cell">\n  <img id="spinner" style="visibility: hidden;" src="', escape((2,  assetUrl('media/turtle/loading.gif') )), '" height=15 width=15>\n</div>\n'); })();
} 
return buf.join('');
};
  return function(locals) {
    return t(locals, require("ejs").filters);
  }
}());
},{"ejs":178}]},{},[111]);
