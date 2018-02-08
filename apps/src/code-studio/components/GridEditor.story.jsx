import React from 'react';
import GridEditor from './GridEditor';
import { withInfo } from '@storybook/addon-info';

export default storybook => {
  const starWarsGrid = [[16908288,16908288,0,0,0,0,0,0],[16908288,16908288,0,65536,131072,1048576,0,0],[0,0,0,0,0,0,0,0],[0,0,0,16,0,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1048576,65536,1179648,0,0],[0,17956864,17956864,0,0,0,0,1048576],[0,17956864,17956864,0,0,0,0,0]];
  const serializedMaze = starWarsGrid.map(function (row) {
    return row.map(function (cell) {
      return { tileType: cell };
    });
  });

  storybook
    .storiesOf('GridEditor', module)
    .add(
      'karel',
      withInfo('This is the farmer / bee / collector editor.')(() =>
        <div id="grid">
          <GridEditor
            skin="bee"
            maze={[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,2,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]}
            initialDirt={[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]}
            onUpdate={() => {}}
          />
        </div>
      )
    )
    .add(
      'star wars grid',
      withInfo('This is the Star Wars BB-8 editor.')(() =>
        <div id="grid">
          <GridEditor
            skin="starwarsgrid"
            serializedMaze={serializedMaze}
            onUpdate={() => {}}
          />
        </div>
      )
    );
};
