import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const PREDICT_BLOCK_TYPE = 'spritelab2_predictForSprite';

/**
 * A prediction is a network round trip, so the answer cannot be the block's
 * value. The inner blocks run once it lands, and `prediction of` reads it
 * there.
 */
const definition: BlockJson = {
  type: PREDICT_BLOCK_TYPE,
  message0: 'predict %1 then %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: 'input_statement', name: 'DO'},
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.LAB_BLOCKS,
  tooltip:
    'Asks the imported AI model about this sprite, using the feature ' +
    'values on its costume.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `predictForSprite({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}}, function () {\n${generatorInstance.statementToCode(block, 'DO')}});\n`;

export default {definition, generator};
