import * as codegen from '@cdo/apps/lib/tools/jsinterpreter/codegen';
import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror, {
  initializeCodeMirrorForJson,
} from '@cdo/apps/code-studio/initializeCodeMirror';
import jsonic from 'jsonic';
import { parseElement } from '@cdo/apps/xml';
import { installCustomBlocks } from '@cdo/apps/gamelab/blocks';

let nameField;
$(document).ready(() => {
  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    valueTypeTabShapeMap: {
      Sprite: 'angle',
      Behavior: 'rounded',
      Location: 'square',
    }
  });

  initializeCodeMirrorForJson('block_config', { onChange });
  initializeCodeMirror('block_helper_code', 'javascript');
});

let config;
function onChange(editor) {
  if (editor.getValue() === config) {
    return;
  }
  config = editor.getValue();

  let parsedConfig;
  try {
    parsedConfig = jsonic(config);
  } catch (e) {
    return;
  }

  const blocksInstalled = installCustomBlocks(
    Blockly,
    { assetUrl },
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
