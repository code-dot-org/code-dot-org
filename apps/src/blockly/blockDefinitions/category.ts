import {BLOCK_TYPES, BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: BLOCK_TYPES.category,
  message0: 'Category %1',
  args0: [
    {
      type: 'field_input',
      name: 'CATEGORY',
    },
  ],
  inputsInline: true,
  style: BlockStyles.LOOP,
  tooltip:
    'Indicates the start of a new category. All blocks below this point will be contained in this category.',
};

const generator: GeneratorFunction = () => '\n';

export default {definition, generator};
