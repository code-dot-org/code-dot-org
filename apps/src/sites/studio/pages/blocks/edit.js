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

  initializeCodeMirrorForJson('block_config', { onChange });
  const helperCodeEditor = initializeCodeMirror('block_helper_code', 'javascript');

  document.querySelector('#block_submit').addEventListener('click', event => {
    try {
      const code = helperCodeEditor.getValue();
      eval(`(function () { ${code} })`); // eslint-disable-line no-eval
    } catch (error) {
      alert(`Error in helper code:\n\n${error}`);
      event.preventDefault();
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
