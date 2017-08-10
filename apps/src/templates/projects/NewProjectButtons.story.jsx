import React from 'react';
import NewProjectButtons from './NewProjectButtons';

export default storybook => {
  storybook
    .storiesOf('NewProjectButtons', module)
    .addStoryTable([
      {
        name: 'Default project buttons',
        description: 'Buttons to make a new App Lab, Game Lab, Play Lab and Artist project',
        story: () => (
          <NewProjectButtons/>
        )
      },
      {
        name: 'Modified project buttons',
        description: 'Buttons to make a new Web Lab, App Lab, Calc and Eval project',
        story: () => (
          <NewProjectButtons projectTypes={['weblab', 'applab', 'calc', 'eval']}/>
        )
      },
      {
        name: 'Brand project buttons',
        description: 'Buttons to make a new Frozen, Starwars, and both Minecraft projects',
        story: () => (
          <NewProjectButtons projectTypes={['frozen', 'starwars', 'mc', 'minecraft']}/>
        )
      },
      {
        name: 'More options',
        description: 'Buttons for Starwars Blocks, Flappy, Sports, Basketball',
        story: () => (
          <NewProjectButtons projectTypes={['starwarsblocks', 'flappy', 'sports', 'basketball']}/>
        )
      },
      {
        name: 'More options',
        description: 'Buttons for Bounce, Infinity, Ice Age, Gumball',
        story: () => (
          <NewProjectButtons projectTypes={['bounce', 'infinity', 'iceage', 'gumball']}/>
        )
      }
    ]);
};
