import {Block} from 'blockly/core';

import {AiModelShape, levelAiModelShape} from '../aiModel';

export const PREDICT_MUTATOR = 'spritelab2_predict_mutator';
export const MODEL_NAME_FIELD = 'MODEL_NAME';
const FEATURE_INPUT_PREFIX = 'FEATURE_';

export interface PredictBlock extends Block {
  modelShape?: AiModelShape;
}

export function featureInputName(featureId: string): string {
  return FEATURE_INPUT_PREFIX + featureId;
}

/** One labelled slot per feature; yes/no features take a boolean. */
export function updatePredictShape(block: PredictBlock): void {
  const shape = block.modelShape;
  block.setFieldValue(shape?.name || 'model', MODEL_NAME_FIELD);
  const wanted = new Set(
    (shape?.features || []).map(feature => featureInputName(feature.id))
  );
  block.inputList
    .filter(
      input =>
        input.name.startsWith(FEATURE_INPUT_PREFIX) && !wanted.has(input.name)
    )
    .forEach(input => block.removeInput(input.name));
  (shape?.features || []).forEach(feature => {
    const name = featureInputName(feature.id);
    if (!block.getInput(name)) {
      block
        .appendValueInput(name)
        .setCheck(feature.yesNo ? 'Boolean' : null)
        .appendField(`${feature.id}:`);
    }
  });
}

interface PredictState {
  model?: AiModelShape;
}

// The level's model wins when it has loaded: a block saved against an earlier
// model follows the level, and a block saved without a shape gets one. The
// saved shape covers the time before the model arrives.
export const predictMutator = {
  saveExtraState(this: PredictBlock): PredictState | null {
    return this.modelShape ? {model: this.modelShape} : null;
  },
  loadExtraState(this: PredictBlock, state: PredictState | null): void {
    this.modelShape = levelAiModelShape() || state?.model;
    updatePredictShape(this);
  },
};
