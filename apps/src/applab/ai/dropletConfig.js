import * as api from '@cdo/apps/applab/api';

export let aiConfig = {
  blocks: [...aiBlocks]
};

const aiBlocks = [
  {
    func: 'getPrediction',
    parent: api,
    category: 'Data',
    paletteParams: ['model_name', 'model_id', 'testValues', 'callback'],
    params: ['"myModel"', '"modelId"', 'testValues', 'function (value) {\n \n}']
  }
];
