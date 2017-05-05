import React from 'react';
import PlayZone from './playzone';

export default storybook => {
  storybook
    .storiesOf('PlayZone', module)
    .addWithInfo(
      'default',
      'This is the PlayZone component.',
      () => (
        <PlayZone
          stageName="Test Stage"
          onContinue={() => {}}
        />
      )
    );
};
