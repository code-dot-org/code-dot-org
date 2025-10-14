import React from 'react';

import TwoColumnActionBlock from './TwoColumnActionBlock';

export default {
  component: TwoColumnActionBlock,
};

export const Basic = () => (
  <TwoColumnActionBlock
    id={'id'}
    heading={'Heading goes here'}
    subHeading={'Subheading goes here'}
    description={'Description goes here'}
    imageUrl={
      'https://code.org/images/dance-hoc/dance-party-activity-ai-edition.png'
    }
    buttons={[
      {
        id: 'your_school_professional_learning',
        url: 'https://code.org/professional-learning',
        text: 'Learn more',
      },
      {
        id: 'your_school_administrators',
        url: 'https://code.org/administrators',
        text: 'Try this',
      },
    ]}
    marginBottom={'64px'}
  />
);

export const ExtraButtonText = () => (
  <TwoColumnActionBlock
    id={'id'}
    heading={'Heading goes here'}
    subHeading={'Subheading goes here'}
    description={'Description goes here'}
    imageUrl={
      'https://code.org/images/dance-hoc/dance-party-activity-ai-edition.png'
    }
    buttons={[
      {
        id: 'your_school_professional_learning',
        url: 'https://code.org/professional-learning',
        text: 'Learn more',
        extraText:
          'Click here to learn more about professional learning options.',
      },
      {
        id: 'your_school_administrators',
        url: 'https://code.org/administrators',
        text: 'Try this',
        extraText:
          'School administrators can learn more about our curriculum options.',
      },
    ]}
    marginBottom={'64px'}
  />
);
