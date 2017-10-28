import React from 'react';
import Congrats from './Congrats';

export default storybook => {
  return storybook
    .storiesOf('Congrats', module)
    .addStoryTable([
      {
        name: 'Congrats - Applab',
        description: `Congrats component if Applab tutorial completed`,
        story: () => (
          <Congrats
            completedTutorialType="applab"
          />
        )
      },
      {
        name: 'Congrats - old Minecraft',
        description: `Congrats component if old Minecraft tutorial completed`,
        story: () => (
          <Congrats
            completedTutorialType="oldMinecraft"
          />
        )
      },
      {
        name: 'Congrats - new Minecraft',
        description: `Congrats component if new Minecraft tutorial completed`,
        story: () => (
          <Congrats
            completedTutorialType="newMinecraft"
          />
        )
      },
      {
        name: 'Congrats - other',
        description: `Congrats component if any other Code.org tutorial completed`,
        story: () => (
          <Congrats
            completedTutorialType="other"
          />
        )
      }
    ]);
};
