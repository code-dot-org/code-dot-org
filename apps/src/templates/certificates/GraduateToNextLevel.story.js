import React from 'react';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';

export default storybook => {
  return storybook
    .storiesOf('Congrats/GraduateToNextLevel', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Course 2',
        story: () => <GraduateToNextLevel nextCourse="course2" />
      }
    ]);
};
