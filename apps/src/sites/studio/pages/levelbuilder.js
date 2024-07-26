/**
 * @file Main entry point for scripts used on all level editing pages.
 */
import codemirror from 'codemirror';
import $ from 'jquery';
import _ from 'lodash';

import {
  getProjectXml,
  removeIdsFromBlocks,
} from '@cdo/apps/blockly/addons/cdoXml';
import {convertXmlToBlockly} from '@cdo/apps/templates/instructions/utils';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

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
  const workspaceXml = getProjectXml(Blockly.mainBlockSpace);
  removeIdsFromBlocks(workspaceXml);

  const str = Blockly.Xml.domToPrettyText(workspaceXml);
  copyToClipboard(str);
  localStorage.setItem('blockXml', str);
};

window.levelbuilder.copySelectedBlockToClipboard = function () {
  if (Blockly.selected) {
    const xmlContainer = document.createElementNS('', 'xml');
    const blockElement = Blockly.Xml.blockToDom(Blockly.selected);
    xmlContainer.appendChild(blockElement);
    removeIdsFromBlocks(xmlContainer);

    const str = Blockly.Xml.domToPrettyText(xmlContainer);
    copyToClipboard(str);
    localStorage.setItem('blockXml', str);
  }
};

window.levelbuilder.pasteBlocksToWorkspace = function () {
  let str = localStorage.getItem('blockXml');

  if (!(str.startsWith('<xml') && str.endsWith('</xml>'))) {
    // str is not valid block xml.
    return;
  }

  Blockly.cdoUtils.loadBlocksToWorkspace(Blockly.mainBlockSpace, str);
};

// TODO: Remove when global `CodeMirror` is no longer required.
window.CodeMirror = codemirror;

// TODO: Extract .js from _authored_hints.haml and _instructions.haml, then remove this
window.convertXmlToBlockly = convertXmlToBlockly;
