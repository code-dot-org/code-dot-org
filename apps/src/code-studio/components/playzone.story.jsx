import React from 'react';
import PlayZone from './playzone';
import CreateSomething from './lessonExtras/CreateSomething';

export default storybook => {
  storybook.storiesOf('PlayZone', module).addStoryTable([
    {
      name: 'Default',
      story: () => <PlayZone lessonName="Test Lesson" onContinue={() => {}} />
    },
    {
      name: 'Create something',
      story: () => <CreateSomething />
    }
  ]);
};
