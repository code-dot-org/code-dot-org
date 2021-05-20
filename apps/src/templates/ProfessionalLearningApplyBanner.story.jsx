import React from 'react';
import ProfessionalLearningApplyBanner from './ProfessionalLearningApplyBanner';

export default storybook => {
  storybook
    .storiesOf('Banners/ProfessionalLearningApplyBanner', module)
    .addStoryTable([
      {
        name: 'Professional Learning Apply Banner - use sign up text',
        story: () => <ProfessionalLearningApplyBanner useSignUpText={true} />
      },
      {
        name: 'Professional Learning Apply Banner - nominated',
        story: () => <ProfessionalLearningApplyBanner nominated={true} />
      },
      {
        name: 'Professional Learning Apply Banner - seats open',
        story: () => <ProfessionalLearningApplyBanner />
      }
    ]);
};
