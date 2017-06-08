import React from 'react';
import StageExtras from './StageExtras';

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
            {name: 'Sample Bonus Level'},
            {name: 'Another Bonus Level'},
          ]}
        />
      )
    );
};
