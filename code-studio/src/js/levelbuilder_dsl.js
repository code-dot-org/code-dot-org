/**
 * @file Main entry point for scripts used only in levelbuilder when editing
 *       DSL-defined levels.
 */
'use strict';
var _ = require('lodash');

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeEmbeddedMarkdownEditor: require('./initializeEmbeddedMarkdownEditor')
});
