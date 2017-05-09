import React from 'react';
import Resources from './Resources';

export default storybook => {
  return storybook
    .storiesOf('Resources', module)
    .addStoryTable([
      {
        name: 'Resources for teachers',
        description: `This is the Resources section that will be used on the teacher homepage.`,
        story: () => (
          <Resources type="teacher"/>
        )
      },
      {
        name: 'Resources for students',
        description: `This is the Resources section that will be used on the student homepage.`,
        story: () => (
          <Resources type="student"/>
        )
      },
    ]);
};
