/**
 * @file Main entry point for scripts used on all level editing pages.
 */
import _ from 'lodash';
import codemirror from 'codemirror';
import marked from 'marked';
import renderer from '@cdo/apps/util/StylelessRenderer';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeCodeMirror: require('@cdo/apps/code-studio/initializeCodeMirror'),
  initializeBlockPreview: require('@cdo/apps/code-studio/initializeBlockPreview'),
  jsonEditor: require('@cdo/apps/code-studio/jsonEditor'),
  acapela: require('@cdo/apps/code-studio/acapela'),
  ajaxSubmit: require('@cdo/apps/code-studio/ajaxSubmit')
});

window.levelbuilder.installBlocks = function (app, blockly, options) {
  var appBlocks = require('@cdo/apps/' + app + '/blocks');
  var commonBlocks = require('@cdo/apps/blocksCommon');

  commonBlocks.install(blockly, options);
  appBlocks.install(blockly, options);
};

window.levelbuilder.copyWorkspaceToClipboard = function () {
  const str = Blockly.Xml.domToPrettyText(Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace));
  copyToClipboard(str);
};

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = codemirror;
// TODO: Remove when global `marked` is no longer required.
window.marked = marked;
window.renderer = renderer;
