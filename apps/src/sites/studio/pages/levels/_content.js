import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import React from 'react';
import ReactDom from 'react-dom';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {convertXmlToBlockly} from '@cdo/apps/templates/instructions/utils';
import commonBlocks from '@cdo/apps/blocksCommon';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';
import logToCloud from '@cdo/apps/logToCloud';

$(document).ready(() => {
  // Load app specific Blockly blocks. This will enable level creators to write
  // Blockly XML and render the blocks directly in the level text.
  Blockly.assetUrl = assetUrl;
  Blockly.Css.inject(document);
  // Install the common Blockly blocks
  commonBlocks.install(window.Blockly, {});
  if (hasScriptData('script[data-associatedBlocks]')) {
    const associatedBlocks = getScriptData('associatedblocks');
    try {
      // Install the custom CDO blocks for the associated level type.
      const appBlocks = require(`@cdo/apps/${associatedBlocks}/blocks`);
      let skin = {};
      // Some apps require an app skin to be defined. Currently all of these
      // can use a skin that has the same name as the app itself. In the future,
      // we might need to allow specifying which skin to use or define a default.
      if (['bounce', 'flappy', 'jigsaw', 'studio'].includes(associatedBlocks)) {
        const appSkins = require(`@cdo/apps/${associatedBlocks}/skins`);
        skin = appSkins.load(assetUrl, associatedBlocks);
      }
      appBlocks.install(window.Blockly, {
        skin,
        app: associatedBlocks
      });
    } catch (error) {
      console.error(
        `Unable to load blockly blocks for ${associatedBlocks}: ${error}`
      );
      logToCloud.addPageAction(logToCloud.PageAction.BlockLoadFailed, {
        associatedBlocks
      });
    }
  }

  // Render Markdown
  $('.content-level > .markdown-container').each(function() {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    ReactDom.render(
      React.createElement(SafeMarkdown, container.dataset, null),
      container,
      function() {
        // After the Markdown is rendered, render any Blockly blocks defined in
        // <xml> blocks.
        convertXmlToBlockly(container);
      }
    );
  });
});
