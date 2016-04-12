/**
 * @file Main entry point for scripts used on all level editing pages.
 */
'use strict';
var _ = require('lodash');

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeCodeMirror: require('./initializeCodeMirror'),
  jsonEditor: require('./jsonEditor'),
  ajaxSubmit: require('./ajaxSubmit')
});

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = require('codemirror');
// TODO: Remove when global `marked` is no longer required.
window.marked = require('marked');
