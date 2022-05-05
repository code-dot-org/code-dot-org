import React from 'react';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';

export default storybook => {
  return storybook
    .storiesOf('Congrats/GraduateToNextLevel', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Course 2',
        story: () => (
          <GraduateToNextLevel
            scriptName="course2"
            courseTitle="Course 2"
            courseDesc="For students with basic reading skills, this course builds on Course 1. Students will create programs to solve problems and develop interactive games or stories they can share. Recommended for grades 2-5."
          />
        )
      }
    ]);
};
