import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {
  featureInputName,
  MODEL_NAME_FIELD,
  PREDICT_BLOCK_TYPE,
  PREDICT_MUTATOR,
  PredictBlock,
} from '../predictMutator';

/** Ask an AI Lab model for its label; the mutator adds one input per feature. */
const definition: BlockJson = {
  type: PREDICT_BLOCK_TYPE,
  message0: 'predict with %1',
  args0: [{type: 'field_label', name: MODEL_NAME_FIELD, text: 'model'}],
  output: 'String',
  style: BlockStyles.LOGIC,
  mutator: PREDICT_MUTATOR,
  tooltip: 'Asks the model what it thinks, given what you tell it here.',
};

const generator: GeneratorFunction = (block, generator) => {
  const shape = (block as PredictBlock).modelShape;
  if (!shape) {
    return ['""', Order.ATOMIC];
  }
  const inputs = shape.features.map(feature => {
    const value =
      generator.valueToCode(block, featureInputName(feature.id), Order.NONE) ||
      'null';
    return `${JSON.stringify(feature.id)}: ${value}`;
  });
  return [
    `predictWith(${JSON.stringify(shape.id)}, {${inputs.join(', ')}})`,
    Order.FUNCTION_CALL,
  ];
};

export default {definition, generator};
