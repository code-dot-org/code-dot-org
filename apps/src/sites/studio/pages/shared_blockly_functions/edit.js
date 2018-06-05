import zip from 'lodash/zip';
import assetUrl from '@cdo/apps/code-studio/assetUrl';

import { install } from '@cdo/apps/gamelab/blocks';
import { valueTypeTabShapeMap } from '@cdo/apps/gamelab/GameLab';

Blockly.inject(document.getElementById('blockly-container'), {
  assetUrl,
  valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
  hasVerticalScrollbars: true,
  typeHints: true,
});

install(Blockly);

Blockly.behaviorEditor = new Blockly.FunctionEditor(
  {
    FUNCTION_HEADER: 'Behavior',
    FUNCTION_NAME_LABEL: 'Name your behavior:',
    FUNCTION_DESCRIPTION_LABEL: 'What is your behavior supposed to do?',
  },
  'behavior_definition',
  {
    [Blockly.BlockValueType.SPRITE]: 'sprite_variables_get',
    [Blockly.BlockValueType.LOCATION]: 'location_variables_get'
  },
  false /* disableParamEditing */,
  [
    Blockly.BlockValueType.NUMBER,
    Blockly.BlockValueType.STRING,
    Blockly.BlockValueType.COLOUR,
    Blockly.BlockValueType.BOOLEAN,
    Blockly.BlockValueType.SPRITE,
    Blockly.BlockValueType.LOCATION,
  ]
);

const blockXml = `<xml>
  <block type="behavior_definition">
    <title name="NAME">acting</title>
  </block>
</xml>`;

Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXml));
Blockly.behaviorEditor.openAndEditFunction('acting');

function getInput(name) {
  return document.querySelector(`input[name="shared_blockly_function[${name}]"]`);
}

document.querySelector('#shared_function_submit').addEventListener('click', () => {
  const block = Blockly.mainBlockSpace.getTopBlocks()[0];
  const procInfo = block.getProcedureInfo();

  getInput('name').value = procInfo.name;
  getInput('arguments').value = JSON.stringify(zip(procInfo.parameterNames, procInfo.parameterTypes));
  getInput('description').value = document.querySelector('#functionDescriptionText').value;
  getInput('stack').value = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block.getInputTargetBlock('STACK')));
});
