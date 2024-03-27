import React from 'react';
import {StoryFn} from '@storybook/react';
import LtiFeedbackBanner from './LtiFeedbackBanner';

export default {
  component: LtiFeedbackBanner,
};

const Template: StoryFn<typeof LtiFeedbackBanner> = () => <LtiFeedbackBanner />;

export const Default = Template.bind({});
Default.args = {};
