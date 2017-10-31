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
        name: 'Congrats - pre-2017 Minecraft',
        description: `Congrats component if either pre-2017 Minecraft tutorial completed`,
        story: () => (
          <Congrats
            completedTutorialType="oldMinecraft"
          />
        )
      },
      {
        name: 'Congrats - 2017 Minecraft',
        description: `Congrats component if 2017 Minecraft tutorial completed`,
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
