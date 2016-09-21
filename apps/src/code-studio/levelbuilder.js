/**
 * @file Main entry point for scripts used on all level editing pages.
 */
import _ from 'lodash';
import codemirror from 'codemirror';
import marked from 'marked';
import stylelessRenderer from '../StylelessRenderer';

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeCodeMirror: require('./initializeCodeMirror'),
  initializeBlockPreview: require('./initializeBlockPreview'),
  jsonEditor: require('./jsonEditor'),
  acapela: require('./acapela'),
  ajaxSubmit: require('./ajaxSubmit')
});

window.levelbuilder.installBlocks = function (app, blockly, options) {
  var appBlocks = require('@cdo/apps/' + app + '/blocks');
  var commonBlocks = require('@cdo/apps/blocksCommon');

  commonBlocks.install(blockly, options);
  appBlocks.install(blockly, options);
};

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = codemirror;
// TODO: Remove when global `marked` is no longer required.
window.marked = marked;
window.stylelessRenderer = stylelessRenderer;
