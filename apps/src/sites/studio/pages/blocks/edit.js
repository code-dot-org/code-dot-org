import * as codegen from '@cdo/apps/lib/tools/jsinterpreter/codegen';
import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror, {
  initializeCodeMirrorForJson,
} from '@cdo/apps/code-studio/initializeCodeMirror';
import jsonic from 'jsonic';
import { parseElement } from '@cdo/apps/xml';
import { installCustomBlocks } from '@cdo/apps/gamelab/blocks';
import { valueTypeTabShapeMap } from '@cdo/apps/gamelab/GameLab';
import animationListModule, {
  setInitialAnimationList
} from '@cdo/apps/gamelab/animationListModule';
import defaultSprites from '@cdo/apps/gamelab/defaultSprites.json';
import { getStore, registerReducers } from '@cdo/apps/redux';

let nameField;

$(document).ready(() => {
  registerReducers({animationList: animationListModule});
  getStore().dispatch(setInitialAnimationList(defaultSprites));

  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    assetUrl,
    valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
    typeHints: true,
  });

  let submitButton = document.querySelector('#block_submit');
  initializeCodeMirrorForJson('block_config', { onChange });
  initializeCodeMirror('block_helper_code', 'javascript', null, null, (_, errors) => {
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

  const blocksInstalled = installCustomBlocks(
    Blockly,
    {},
    [{
      name: nameField.value,
      category: 'Custom',
      config: parsedConfig,
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
