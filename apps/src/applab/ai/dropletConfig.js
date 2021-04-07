import * as api from '@cdo/apps/applab/api';

export let aiConfig = {
  blocks: [...aiBlocks]
};

const aiBlocks = [
  {
    func: 'getPrediction',
    parent: api,
    category: 'Data',
    paletteParams: ['name', 'id', 'data', 'callback'],
    params: ['"name"', '"id"', 'data', 'function (value) {\n \n}']
  }
];
