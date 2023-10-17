import React from 'react';
import PercentAnsweredCell from './PercentAnsweredCell';

export default {
  title: 'PercentAnsweredCell',
  component: PercentAnsweredCell,
};

const Template = args => <PercentAnsweredCell {...args} />;

export const CorrectAnswer = Template.bind({});
CorrectAnswer.args = {
  percentValue: 40,
  isCorrectAnswer: true,
};

export const HideCheckMark = Template.bind({});
HideCheckMark.args = {
  percentValue: 60,
};
