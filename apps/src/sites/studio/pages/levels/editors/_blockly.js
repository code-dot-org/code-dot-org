import $ from 'jquery';
import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import initializeBlockPreview from '@cdo/apps/code-studio/initializeBlockPreview';
import commonBlocks from '@cdo/apps/blocksCommon';

const data = getScriptData('pageOptions');
// TODO: stop pulling Blockly off of the window object.
if (window.Blockly && !data.uses_droplet) {
  window.Blockly.Css.styleSheet_ = window.goog.cssom.addCssText(Blockly.Css.CONTENT.join("\n")).sheet;
  window.Blockly.assetUrl = path => `/assets/${path}`;
  const appBlocks = require('@cdo/apps/' + data.app + '/blocks');
  const options = {
    skin: {id: data.skin_id},
    isK1: data.isK1,
  };
  commonBlocks.install(window.Blockly, options);
  appBlocks.install(window.Blockly, options);
}

const fieldConfig = {
  startEditor: {
    codemirrorEl: 'level_start_blocks',
    blockPreviewEl: 'start-preview',
  },
  requiredEditor: {
    codemirrorEl: 'level_required_blocks',
    blockPreviewEl: 'required-preview',
  },
  recommendedEditor: {
    codemirrorEl: 'level_recommended_blocks',
    blockPreviewEl: 'recommended-preview',
  },
  toolboxEditor: {
    hideWhen: data.uses_droplet,
    codemirrorEl: 'level_toolbox_blocks',
    blockPreviewEl: 'toolbox-preview',
  },
  initializationEditor: {
    hideWhen: data.uses_droplet,
    codemirrorEl: 'level_initialization_blocks',
    blockPreviewEl: 'initialization-preview',
  },
  solutionEditor: {
    hideWhen: !data.solution_blocks,
    codemirrorEl: 'level_solution_blocks',
    blockPreviewEl: 'solution-preview',
  },
  codeFunctions: {
    hideWhen: !data.uses_droplet,
    codemirrorEl: 'level_code_functions',
    codemirrorMode: 'javascript',
  },
  inputOutputTable: {
    hideWhen: !data.input_output_table,
    codemirrorEl: 'level_input_output_table',
    codemirrorMode: 'javascript',
  },
};

Object.keys(fieldConfig).forEach(key => {
  const config = fieldConfig[key];
  if (config.hideWhen) {
    return;
  }
  const mode = config.codemirrorMode || (data.uses_droplet ? 'javascript' : 'xml');
  const editor = initializeCodeMirror(config.codemirrorEl, mode);
  if (config.blockPreviewEl && !data.uses_droplet) {
    initializeBlockPreview(editor, document.getElementById(config.blockPreviewEl));
  }
});

$("#plusanswer").on("click", () => {
  $("#plusanswer").prev().clone().insertBefore("#plusanswer");
});
