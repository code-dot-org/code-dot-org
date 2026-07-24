import * as api from '@cdo/apps/applab/api';

const aiBlocks = [
  {
    func: 'getPrediction',
    parent: api,
    category: 'Data',
    paletteParams: ['name', 'id', 'data', 'callback'],
    params: ['"name"', '"id"', 'data', 'function (value) {\n \n}'],
  },
];

export let aiConfig = {
  blocks: [...aiBlocks],
};
