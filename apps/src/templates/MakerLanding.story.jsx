import React from 'react';
import MakerLanding from './MakerLanding';

const topCourse = {
  assignableName: 'CSD Unit 6 - Physical Computing',
  lessonName: 'Lesson 1: Computing innovations',
  linkToOverview: 'http://localhost-studio.code.org:3000/s/csd6',
  linkToLesson:
    'http://localhost-studio.code.org:3000/s/csd6/lessons/1/levels/1'
};

export default storybook => {
  return storybook
    .storiesOf('MakerToolkit/MakerLanding', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'MakerLanding',
        description: 'Landing page for Maker Toolkit',
        story: () => <MakerLanding topCourse={topCourse} />
      }
    ]);
};
