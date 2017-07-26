import React from 'react';
import StageExtras from './StageExtras';
import _ from 'lodash';

function generateFakePersonalProjects() {
  const date = new Date();
  return _.range(5).map(i => (
    {
      name: "Personal " + i,
      updatedAt: new Date(date.getTime() - i * 60 * 1000).toISOString(),
      projectType: 'gamelab',
      id: 'abcd'
    }
  ));
}

export default storybook => {
  storybook
    .storiesOf('StageExtras', module)
    .addWithInfo(
      'default',
      'This is the StageExtras component.',
      () => (
        <StageExtras
          stageNumber={1}
          nextLevelPath="#"
          bonusLevels={[
            {id: 0, type: 'Blockly', name: 'Sample Bonus Level'},
            {id: 1, type: 'Blockly', name: 'Another Bonus Level'},
          ]}
          showProjectWidget={true}
          projectList={generateFakePersonalProjects()}
          projectTypes={['artist', 'playlab']}
        />
      )
    );
};
