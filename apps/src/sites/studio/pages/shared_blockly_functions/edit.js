import assetUrl from '@cdo/apps/code-studio/assetUrl';

import { install } from '@cdo/apps/gamelab/blocks';
import { valueTypeTabShapeMap } from '@cdo/apps/gamelab/GameLab';

Blockly.inject(document.getElementById('blockly-container'), {
  valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
});

install(Blockly, { assetUrl });

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
