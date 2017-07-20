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
        description: 'Buttons to make a new Web Lab, Game Lab, Play Lab and Artist project',
        story: () => (
          <NewProjectButtons projectTypes={['weblab', 'gamelab', 'playlab', 'artist']}/>
        )
      }
    ]);
};
