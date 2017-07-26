import React from 'react';
import StageExtras from './StageExtras';
import {generateFakePersonalProjects} from '@cdo/apps/templates/projects/generateFakePersonalProjects';

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
          projectList={generateFakePersonalProjects(5)}
          projectTypes={['artist', 'playlab']}
        />
      )
    );
};
