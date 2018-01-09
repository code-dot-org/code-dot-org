import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import initializeBlockPreview from '@cdo/apps/code-studio/initializeBlockPreview';
import commonBlocks from '@cdo/apps/blocksCommon';
import DropletPaletteSelector from '@cdo/apps/lib/levelbuilder/DropletPaletteSelector';

const data = getScriptData('pageOptions');
// TODO: stop pulling Blockly off of the window object.
if (window.Blockly && !data.uses_droplet) {
  window.Blockly.Css.styleSheet_ = window.goog.cssom.addCssText(Blockly.Css.CONTENT.join("\n")).sheet;
  window.Blockly.assetUrl = path => `/assets/${path}`;
  const appBlocks = require('@cdo/apps/' + data.app + '/blocks');
  const skinsModule = require('@cdo/apps/' + data.app + '/skins');
  const options = {
    skin: skinsModule.load(function (){}, data.skin_id),
    isK1: data.isK1,
  };
  commonBlocks.install(window.Blockly, options);
  appBlocks.install(window.Blockly, options);
}

const fieldConfig = {
  startEditor: {
    codemirror: 'level_start_blocks',
    blockPreview: 'start-preview',
  },
  requiredEditor: {
    codemirror: 'level_required_blocks',
    blockPreview: 'required-preview',
  },
  recommendedEditor: {
    codemirror: 'level_recommended_blocks',
    blockPreview: 'recommended-preview',
  },
  toolboxEditor: {
    hideWhen: data.uses_droplet,
    codemirror: 'level_toolbox_blocks',
    blockPreview: 'toolbox-preview',
  },
  initializationEditor: {
    hideWhen: data.uses_droplet,
    codemirror: 'level_initialization_blocks',
    blockPreview: 'initialization-preview',
  },
  solutionEditor: {
    hideWhen: !data.solution_blocks,
    codemirror: 'level_solution_blocks',
    blockPreview: 'solution-preview',
  },
  codeFunctions: {
    hideWhen: !data.uses_droplet,
    codemirror: 'level_code_functions',
    codemirrorMode: 'javascript',
  },
  inputOutputTable: {
    hideWhen: !data.input_output_table,
    codemirror: 'level_input_output_table',
    codemirrorMode: 'javascript',
  },
};

Object.keys(fieldConfig).forEach(key => {
  const config = fieldConfig[key];
  if (config.hideWhen) {
    return;
  }
  const mode = config.codemirrorMode || (data.uses_droplet ? 'javascript' : 'xml');
  config.editor = initializeCodeMirror(config.codemirror, mode);
  if (config.blockPreview && !data.uses_droplet) {
    initializeBlockPreview(config.editor, document.getElementById(config.blockPreview));
  }
});

$("#plusAnswerContainedLevel").on("click", () => {
  $("#plusAnswerContainedLevel").prev().clone().insertBefore("#plusAnswerContainedLevel");
});

if (data.original_palette && !fieldConfig.codeFunctions.hideWhen) {
  ReactDOM.render(
    <DropletPaletteSelector
      palette={data.original_palette}
      editor={fieldConfig.codeFunctions.editor}
    />,
    $('<div></div>')
      .insertAfter(`label[for="${fieldConfig.codeFunctions.codemirror}"]`)
      .get(0)
  );
}
