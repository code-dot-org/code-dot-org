import * as codegen from '@cdo/apps/lib/tools/jsinterpreter/codegen';
import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror, {
  initializeCodeMirrorForJson,
} from '@cdo/apps/code-studio/initializeCodeMirror';
import jsonic from 'jsonic';
import { parseElement } from '@cdo/apps/xml';
import { installCustomBlocks as gamelabInstallCustomBlocks } from '@cdo/apps/gamelab/blocks';
import { installCustomBlocks as mazeInstallCustomBlocks } from '@cdo/apps/maze/blocks';
import { valueTypeTabShapeMap } from '@cdo/apps/gamelab/GameLab';
import animationListModule, {
  setInitialAnimationList
} from '@cdo/apps/gamelab/animationListModule';
import defaultSprites from '@cdo/apps/gamelab/defaultSprites.json';
import { getStore, registerReducers } from '@cdo/apps/redux';

const installers = {
  GameLabJr: gamelabInstallCustomBlocks,
  Maze: mazeInstallCustomBlocks,
};

let typeField, nameField, helperEditor;

$(document).ready(() => {
  registerReducers({animationList: animationListModule});
  getStore().dispatch(setInitialAnimationList(defaultSprites));

  typeField = document.getElementById('block_level_type');
  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    assetUrl,
    valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
    typeHints: true,
  });

  let submitButton = document.querySelector('#block_submit');
  const fixupJson = initializeCodeMirrorForJson('block_config', { onChange });
  helperEditor = initializeCodeMirror('block_helper_code', 'javascript', fixupJson, null, (_, errors) => {
    if (errors.length) {
      submitButton.setAttribute('disabled', 'disabled');
    } else {
      submitButton.removeAttribute('disabled');
    }
  });
});

let config;
function onChange(editor) {
  config = editor.getValue();

  const parsedConfig = jsonic(config);

  const blocksInstalled = installers[typeField.value](
    Blockly,
    {},
    [{
      name: nameField.value,
      category: 'Custom',
      config: parsedConfig,
      helperCode: helperEditor && helperEditor.getValue(),
    }],
    {},
    true,
  );
  const blockName = Object.values(blocksInstalled)[0][0];
  nameField.value = blockName;
  const blocksDom = parseElement(`<block type="${blockName}" />`);
  Blockly.mainBlockSpace.clear();
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, blocksDom);
  Blockly.mainBlockSpace.getCanvas().addEventListener('blocklyBlockSpaceChange',
    onBlockSpaceChange);
}

function onBlockSpaceChange() {
  document.getElementById('code-preview').innerText =
    codegen.workspaceCode(Blockly);
}
