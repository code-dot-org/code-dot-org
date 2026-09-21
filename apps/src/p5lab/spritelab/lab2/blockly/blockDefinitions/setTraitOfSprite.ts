import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';
import {FIELD_TRAIT_NAME_TYPE, FIELD_TRAIT_VALUE_TYPE} from '../traitFields';

export const SET_TRAIT_BLOCK_TYPE = 'spritelab2_setTraitOfSprite';

/**
 * The escape hatch for the Images tab's trait grid. A costume carries the
 * values every sprite wearing it starts with; this overrides one sprite,
 * which is the only way two sprites in the same costume can differ.
 */
const definition: BlockJson = {
  type: SET_TRAIT_BLOCK_TYPE,
  message0: 'set %1 of %2 to %3',
  args0: [
    {type: FIELD_TRAIT_NAME_TYPE, name: 'TRAIT'},
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: FIELD_TRAIT_VALUE_TYPE, name: 'VALUE'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.LAB_BLOCKS,
};

const generator: GeneratorFunction = block =>
  `setTraitOfSprite({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}}, ${JSON.stringify(block.getFieldValue('TRAIT'))}, ${JSON.stringify(
    block.getFieldValue('VALUE')
  )});\n`;

export default {definition, generator};
