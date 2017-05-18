import React from 'react';
import GridEditor from './GridEditor';

export default storybook => {
  storybook
    .storiesOf('GridEditor', module)
    .addWithInfo(
      'karel',
      'This is the farmer / bee / collector editor.',
      () => (
        <div id="grid">
          <GridEditor
            skin="bee"
            maze={[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,2,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]}
            initialDirt={[[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]}
            onUpdate={() => {}}
          />
        </div>
      )
    );
};
