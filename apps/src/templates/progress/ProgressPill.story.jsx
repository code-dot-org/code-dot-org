import React from 'react';
import {UnconnectedProgressPill as ProgressPill} from './ProgressPill';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

export default {
  title: 'ProgressPill',
  component: ProgressPill,
};

const perfectLevel = {
  id: '1',
  url: '/level1',
  status: LevelStatus.perfect,
  isLocked: false,
};

const Template = args => <ProgressPill {...args} />;

export const SingleLevelPill = Template.bind({});
SingleLevelPill.args = {
  levels: [perfectLevel],
  icon: 'desktop',
  text: '1',
};

export const MultiLevelPill = Template.bind({});
const notTriedLevel = {
  id: '2',
  url: '/level2',
  status: LevelStatus.not_tried,
  isLocked: false,
};
MultiLevelPill.args = {
  levels: [perfectLevel, notTriedLevel],
  icon: 'desktop',
  text: '1-4',
};

export const UnpluggedPill = Template.bind({});
UnpluggedPill.args = {
  levels: [perfectLevel],
  text: 'Unplugged Activity',
};
