import React from 'react';
import ProgressBox from './ProgressBox';

export default {
  title: 'ProgressBox',
  component: ProgressBox,
};

const Template = args => <ProgressBox {...args} />;

export const NotStarted = Template.bind({});
NotStarted.args = {
  started: false,
  incomplete: 20,
  imperfect: 0,
  perfect: 0,
};

export const Incomplete = Template.bind({});
Incomplete.args = {
  started: true,
  incomplete: 20,
  imperfect: 0,
  perfect: 0,
};

export const ImperfectIncomplete = Template.bind({});
ImperfectIncomplete.args = {
  started: true,
  incomplete: 5,
  imperfect: 15,
  perfect: 0,
};

export const MixedProgress = Template.bind({});
MixedProgress.args = {
  started: true,
  incomplete: 5,
  imperfect: 5,
  perfect: 10,
};

export const PerfectOrIncomplete = Template.bind({});
PerfectOrIncomplete.args = {
  started: true,
  incomplete: 7,
  imperfect: 0,
  perfect: 13,
};

export const Perfect = Template.bind({});
Perfect.args = {
  started: true,
  incomplete: 0,
  imperfect: 0,
  perfect: 20,
};

export const LessonNumberComplete = Template.bind({});
LessonNumberComplete.args = {
  started: true,
  incomplete: 0,
  imperfect: 0,
  perfect: 20,
  lessonNumber: 88,
};

export const LessonNumberIncomplete = Template.bind({});
LessonNumberIncomplete.args = {
  started: false,
  incomplete: 0,
  imperfect: 0,
  perfect: 0,
  lessonNumber: 1,
};
