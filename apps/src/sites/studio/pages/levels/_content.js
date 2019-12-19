import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import React from 'react';
import ReactDom from 'react-dom';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {convertXmlToBlockly} from '@cdo/apps/templates/instructions/utils';
import commonBlocks from '@cdo/apps/blocksCommon';

$(document).ready(() => {
  // Content levels don't have a particular 'app' associated with them so make
  // available all the different app specific Blockly blocks as they are needed
  // by level creators. This will enable them to write Blockly XML and render
  // the blocks directly in the level text.
  Blockly.assetUrl = assetUrl;
  Blockly.Css.inject(document);
  // Install the common Blockly blocks
  commonBlocks.install(window.Blockly, {});
  // Install the custom CDO blocks for the following level/app types.
  var options = [{skin: {id: 'birds'}, app: 'maze'}, {skin: {}, app: 'turtle'}];
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    try {
      const appBlocks = require('@cdo/apps/' + option.app + '/blocks');
      appBlocks.install(window.Blockly, option);
    } catch (error) {
      console.warn(`Unable to load blockly blocks for ${option.app}: ${error}`);
    }
  }

  // Render Markdown
  $('.content-level > .markdown-container').each(function() {
    if (!this.dataset.markdown) {
      return;
    }

    var container = this;
    ReactDom.render(
      React.createElement(SafeMarkdown, this.dataset, null),
      this,
      function() {
        // After the Markdown is rendered, render any Blockly blocks defined in
        // <xml> blocks.
        convertXmlToBlockly(container);
      }
    );
  });
});
