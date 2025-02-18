import React from 'react';

import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {UnconnectedProgressBubbleSet as ProgressBubbleSet} from './ProgressBubbleSet';
import {fakeLevels, fakeLevel} from './progressTestHelpers';

const statusForLevel = [
  LevelStatus.perfect,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.submitted,
];

const levels = fakeLevels(5).map((level, index) => ({
  ...level,
  status: statusForLevel[index],
}));
levels[0].isConceptLevel = true;

export default {
  component: ProgressBubbleSet,
};

const Template = args => <ProgressBubbleSet {...args} />;

export const StartingAtThree = Template.bind({});
StartingAtThree.args = {
  levels: levels,
  disabled: false,
};

export const MultipleLines = Template.bind({});
const multLevels = fakeLevels(20);
multLevels[2].icon = 'fa-video-camera';
multLevels[12].icon = 'fa-video-camera';
MultipleLines.args = {
  levels: multLevels,
  disabled: false,
};

export const DisabledSet = Template.bind({});
DisabledSet.args = {
  levels: levels,
  disabled: true,
};

export const DiamondSet = Template.bind({});
const diamondLevels = fakeLevels(2).map((level, index) => ({
  ...level,
  status: statusForLevel[index],
}));
diamondLevels[0].isConceptLevel = true;
diamondLevels[1].isConceptLevel = true;
DiamondSet.args = {
  levels: diamondLevels,
  disabled: false,
};

export const Unplugged = Template.bind({});
Unplugged.args = {
  levels: [fakeLevel({isUnplugged: true}), ...fakeLevels(5)],
  disabled: false,
};

export const SingleUnplugged = Template.bind({});
SingleUnplugged.args = {
  levels: [fakeLevel({isUnplugged: true})],
  disabled: false,
};
