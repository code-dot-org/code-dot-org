import React from 'react';

import GridEditor from './GridEditor';

export default {
  component: GridEditor,
};

const starWarsGrid = [
  [16908288, 16908288, 0, 0, 0, 0, 0, 0],
  [16908288, 16908288, 0, 65536, 131072, 1048576, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 16, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1048576, 65536, 1179648, 0, 0],
  [0, 17956864, 17956864, 0, 0, 0, 0, 1048576],
  [0, 17956864, 17956864, 0, 0, 0, 0, 0],
];

const serializedMaze = starWarsGrid.map(function (row) {
  return row.map(function (cell) {
    return {tileType: cell};
  });
});

const Template = args => (
  <div id="grid">
    <GridEditor onUpdate={() => {}} {...args} />
  </div>
);

export const KarelFarmerBeeCollectorEditor = Template.bind({});
KarelFarmerBeeCollectorEditor.args = {
  skin: 'bee',
  maze: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  initialDirt: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
};

export const StarWarsBB8Editor = Template.bind({});
StarWarsBB8Editor.args = {
  skin: 'starwarsgrid',
  serializedMaze: serializedMaze,
};
