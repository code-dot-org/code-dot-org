import {BLOCK_TYPES, BlockStyles, DYNAMIC_CATEGORY_OPTIONS} from '../constants';
import {type BlockJson, type GeneratorFunction} from '../types';

const definition: BlockJson = {
  type: BLOCK_TYPES.categoryDynamic,
  message0: 'Auto-populated Category %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'CUSTOM',
      options: Object.keys(DYNAMIC_CATEGORY_OPTIONS).map(key => [key, key]),
    },
  ],
  inputsInline: true,
  style: BlockStyles.LOOP,
  tooltip:
    'Indicates an auto-populated (dynamic) category. Cannot include other static blocks.',
};

const generator: GeneratorFunction = () => '\n';

export default {definition, generator};
