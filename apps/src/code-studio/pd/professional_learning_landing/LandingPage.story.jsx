import React from 'react';
import LandingPage from './LandingPage';


export default storybook => {
  return storybook
    .storiesOf('PLC/LandingPage', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Landing Page',
        description: `This is an example landing page if the teacher is enrolled in a workshop`,
        story: () => (
          <LandingPage
            lastWorkshopSurveyUrl={""}
            lastWorkshopSurveyCourse={""}
            professionalLearningCourseData={[]}
          />
        )
      }
    ]);
};
