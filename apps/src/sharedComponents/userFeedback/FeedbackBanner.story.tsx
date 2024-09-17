import {StoryFn} from '@storybook/react';
import React from 'react';

import FeedbackBanner from './FeedbackBanner';

export default {
  component: FeedbackBanner,
  argTypes: {
    answerStatus: {
      options: ['', 'unavailable', 'unanswered', 'answered', 'closed'],
      control: {type: 'select'},
    },
  },
};

const Template: StoryFn<typeof FeedbackBanner> = args => (
  <FeedbackBanner
    {...args}
    alertKey="test-feedback-banner"
    answer={() => {}}
    close={() => {}}
  />
);

export const Default = Template.bind({});
Default.args = {
  answerStatus: 'unanswered',
  isLoading: false,
  closeLabel: 'Close',
  question: 'What did you think of this new feature?',
  positiveAnswer: 'I liked it',
  negativeAnswer: 'I did not like it',
  shareMore: 'Would you like to share more?',
  shareMoreLink: 'https://example.com',
  shareMoreLinkText: 'Share more',
};
