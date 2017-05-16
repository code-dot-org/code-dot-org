import React from 'react';
import PlayZone from './playzone';
import CreateSomething from './stageExtras/CreateSomething';

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
    )
    .addWithInfo(
      'create something',
      'This is the CreateSomething component.',
      () => (
        <CreateSomething />
      )
    );
};
