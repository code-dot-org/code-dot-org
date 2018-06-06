import zip from 'lodash/zip';
import unzip from 'lodash/unzip';
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
  null,
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

const DEFAULT_NAME = 'acting';

const blockXml = `<xml>
  <block type="behavior_definition">
    <title name="NAME">${DEFAULT_NAME}</title>
  </block>
</xml>`;

Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, Blockly.Xml.textToDom(blockXml));
const block = Blockly.mainBlockSpace.getTopBlocks()[0];
const name = getInput('name').value;

if (name) {
  block.setTitleValue(name, 'NAME');
}
const [names, types] = unzip(JSON.parse(getInput('arguments').value || '[]'));
if (names && types) {
  block.updateParamsFromArrays(names, names, types);
}

const childBlock = Blockly.Xml.textToDom('<xml>' + getInput('stack').value + '</xml>').firstChild;
if (childBlock) {
  const stack = Blockly.Xml.domToBlock(Blockly.mainBlockSpace, childBlock);
  block.attachBlockToInputName(stack, 'STACK');
}

Blockly.behaviorEditor.openAndEditFunction(name || DEFAULT_NAME);

document.querySelector('#functionDescriptionText').value = getInput('description').value;

function getInput(name) {
  return document.querySelector(`input[name="shared_blockly_function[${name}]"]`);
}

document.querySelector('#shared_function_submit').addEventListener('click', () => {
  const block = Blockly.modalBlockSpace.getTopBlocks()[0];
  const procInfo = block.getProcedureInfo();
  const stack = block.getInputTargetBlock('STACK');

  getInput('name').value = procInfo.name;
  getInput('arguments').value = JSON.stringify(zip(procInfo.parameterNames, procInfo.parameterTypes));
  getInput('description').value = document.querySelector('#functionDescriptionText').value;
  if (stack) {
    getInput('stack').value = Blockly.Xml.domToText(stack);
  }
});
