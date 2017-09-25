import React from 'react';
import Lightbulb from './Lightbulb';

export default storybook => {
  return storybook
    .storiesOf('Lightbulb', module)
    .addStoryTable([
      {
        name: 'With default props',
        story: () => <Lightbulb />,
      }, {
        name: 'Unlit',
        story: () => <Lightbulb lit={false}/>,
      }, {
        name: 'With a count',
        story: () => <Lightbulb count={10}/>,
      }, {
        name: 'Minecraft-style',
        story: () => <Lightbulb isMinecraft={true}/>,
      }
    ]);
};
