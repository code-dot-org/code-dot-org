/**
 * @file Main entry point for scripts used on all level editing pages.
 */
import _ from 'lodash';
import codemirror from 'codemirror';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {convertXmlToBlockly} from '@cdo/apps/templates/instructions/utils';
import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  function make_selection_handler(flag) {
    return function (e) {
      e.preventDefault();
      const options = $(this).parent().siblings('select').children('option');
      options[flag ? 'attr' : 'removeAttr']('selected', true);
    };
  }

  $('.select_all').click(make_selection_handler(true));
  $('.select_none').click(make_selection_handler(false));
}

window.levelbuilder = window.levelbuilder || {};
_.extend(window.levelbuilder, {
  initializeCodeMirror: require('@cdo/apps/code-studio/initializeCodeMirror'),
  initializeBlockPreview: require('@cdo/apps/code-studio/initializeBlockPreview'),
  jsonEditor: require('@cdo/apps/code-studio/jsonEditor'),
  acapela: require('@cdo/apps/code-studio/acapela'),
  ajaxSubmit: require('@cdo/apps/code-studio/ajaxSubmit'),
});

window.levelbuilder.installBlocks = function (app, blockly, options) {
  var appBlocks = require('@cdo/apps/' + app + '/blocks');
  var commonBlocks = require('@cdo/apps/blocksCommon');

  commonBlocks.install(blockly, options);
  appBlocks.install(blockly, options);
};

window.levelbuilder.copyWorkspaceToClipboard = function () {
  const str = Blockly.Xml.domToPrettyText(
    Blockly.Xml.blockSpaceToDom(Blockly.mainBlockSpace)
  );
  copyToClipboard(str);
  localStorage.setItem('blockXml', str);
};

window.levelbuilder.copySelectedBlockToClipboard = function () {
  if (Blockly.selected) {
    const str = Blockly.Xml.domToPrettyText(
      Blockly.Xml.blockToDom(Blockly.selected)
    );
    copyToClipboard(str);
    localStorage.setItem('blockXml', str);
  }
};

window.levelbuilder.pasteBlocksToWorkspace = function () {
  let str = localStorage.getItem('blockXml');

  if (str.startsWith('<xml') && str.endsWith('</xml>')) {
    // If an entire workspace has been copied, clear the current workspace.
    Blockly.mainBlockSpace.clear();
  } else if (str.startsWith('<block') && str.endsWith('</block>')) {
    // If a single block has been copied, wrap it in <xml></xml>
    str = `<xml>${str}</xml>`;
  } else {
    // str is not valid block xml.
    return;
  }

  Blockly.Xml.domToBlockSpace(
    Blockly.mainBlockSpace,
    Blockly.Xml.textToDom(str)
  );
};

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = codemirror;

// TODO: Extract .js from _authored_hints.haml and _instructions.haml, then remove this
window.convertXmlToBlockly = convertXmlToBlockly;
