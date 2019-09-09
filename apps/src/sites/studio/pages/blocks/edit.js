import * as codegen from '@cdo/apps/lib/tools/jsinterpreter/codegen';
import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror, {
  initializeCodeMirrorForJson
} from '@cdo/apps/code-studio/initializeCodeMirror';
import jsonic from 'jsonic';
import {parseElement} from '@cdo/apps/xml';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {valueTypeTabShapeMap} from '@cdo/apps/p5lab/P5Lab';
import animationListModule, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/animationListModule';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import {getStore, registerReducers} from '@cdo/apps/redux';

let poolField, nameField, helperEditor;

$(document).ready(() => {
  registerReducers({animationList: animationListModule});
  getStore().dispatch(setInitialAnimationList(defaultSprites));

  poolField = document.getElementById('block_pool');
  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    assetUrl,
    valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
    typeHints: true
  });

  let submitButton = document.querySelector('#block_submit');
  const fixupJson = initializeCodeMirrorForJson('block_config', {onChange});
  helperEditor = initializeCodeMirror('block_helper_code', 'javascript', {
    callback: fixupJson,
    onUpdateLinting: (_, errors) => {
      if (errors.length) {
        submitButton.setAttribute('disabled', 'disabled');
      } else {
        submitButton.removeAttribute('disabled');
      }
    }
  });
  poolField.addEventListener('change', fixupJson);

  $('.alert.alert-success')
    .delay(5000)
    .fadeOut(1000);
});

let config;
function onChange(editor) {
  config = editor.getValue();

  const parsedConfig = jsonic(config);

  const blocksInstalled = installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: [
      {
        name: nameField.value,
        pool: poolField.value,
        category: 'Custom',
        config: parsedConfig,
        helperCode: helperEditor && helperEditor.getValue()
      }
    ],
    customInputTypes // TODO: generalize for other app types.
  });
  const blockName = Object.values(blocksInstalled)[0][0];
  nameField.value = blockName;
  const blocksDom = parseElement(`<block type="${blockName}" />`);
  Blockly.mainBlockSpace.clear();
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, blocksDom);
  Blockly.mainBlockSpace
    .getCanvas()
    .addEventListener('blocklyBlockSpaceChange', onBlockSpaceChange);
}

function onBlockSpaceChange() {
  document.getElementById('code-preview').innerText = codegen.workspaceCode(
    Blockly
  );
}
