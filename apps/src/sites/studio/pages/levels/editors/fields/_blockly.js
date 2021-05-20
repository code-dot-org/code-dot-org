import getScriptData from '@cdo/apps/util/getScriptData';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import initializeBlockPreview from '@cdo/apps/code-studio/initializeBlockPreview';
import commonBlocks from '@cdo/apps/blocksCommon';
import {installCustomBlocks} from '@cdo/apps/block_utils';

const data = getScriptData('pageOptions');
// TODO: stop pulling Blockly off of the window object.
if (window.Blockly && !data.uses_droplet) {
  window.Blockly.assetUrl = path => `/assets/${path}`;
  Blockly.Css.inject(document);
  let blocksLocation = data.app;
  if (data.app === 'spritelab') {
    blocksLocation = 'p5lab/spritelab';
  }
  const appBlocks = require('@cdo/apps/' + blocksLocation + '/blocks');
  let skinsLocation = '';
  const customSkins = [
    'applab',
    'bounce',
    'flappy',
    'jigsaw',
    'maze',
    'netsim',
    'studio',
    'turtle'
  ];
  if (customSkins.includes(data.app)) {
    skinsLocation = data.app + '/';
  }
  const skinsModule = require('@cdo/apps/' + skinsLocation + 'skins');
  const options = {
    skin: skinsModule.load(function() {}, data.skin_id),
    isK1: data.isK1
  };
  commonBlocks.install(window.Blockly, options);
  appBlocks.install(window.Blockly, options);
  // TODO: eventually want to stop supporting per-level custom blocks.
  if (data.shared_blocks.length) {
    installCustomBlocks({
      blockly: window.Blockly,
      blockDefinitions: data.shared_blocks,
      customInputTypes: appBlocks.customInputTypes
    });
  }
}

const fieldConfig = {
  startEditor: {
    codemirror: 'level_start_blocks',
    blockPreview: 'start-preview'
  },
  requiredEditor: {
    codemirror: 'level_required_blocks',
    blockPreview: 'required-preview'
  },
  recommendedEditor: {
    codemirror: 'level_recommended_blocks',
    blockPreview: 'recommended-preview'
  },
  toolboxEditor: {
    codemirror: 'level_toolbox_blocks',
    blockPreview: 'toolbox-preview'
  },
  initializationEditor: {
    codemirror: 'level_initialization_blocks',
    blockPreview: 'initialization-preview'
  },
  solutionEditor: {
    hideWhen: !data.solution_blocks,
    codemirror: 'level_solution_blocks',
    blockPreview: 'solution-preview'
  },
  inputOutputTable: {
    hideWhen: !data.input_output_table,
    codemirror: 'level_input_output_table',
    codemirrorMode: 'javascript'
  }
};

Object.keys(fieldConfig).forEach(key => {
  const config = fieldConfig[key];
  if (config.hideWhen) {
    return;
  }
  const mode =
    config.codemirrorMode || (data.uses_droplet ? 'javascript' : 'xml');
  const element = document.getElementById(config.codemirror);
  if (!element) {
    return;
  }
  config.editor = initializeCodeMirror(config.codemirror, mode);
  if (config.blockPreview && !data.uses_droplet) {
    initializeBlockPreview(
      config.editor,
      document.getElementById(config.blockPreview)
    );
  }
});
