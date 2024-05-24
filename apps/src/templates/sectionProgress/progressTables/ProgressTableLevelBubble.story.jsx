import React from 'react';

import {BubbleSize} from '@cdo/apps/templates/progress/BubbleFactory';
import color from '@cdo/apps/util/color';
import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import ProgressTableLevelBubble from './ProgressTableLevelBubble';

const statuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.perfect,
];
const assessmentStatuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.submitted,
  LevelStatus.completed_assessment,
  LevelStatus.perfect,
];

const wrapperStyle = {
  width: 200,
  height: 50,
  backgroundColor: color.background_gray,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const SingleTemplate = args => (
  <div style={wrapperStyle}>
    <ProgressTableLevelBubble {...args} />
  </div>
);

export const LockedBubble = SingleTemplate.bind({});
LockedBubble.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  isLocked: true,
  title: '3',
  url: '/foo/bar',
};

LockedBubble.argTypes = {
  levelStatus: {control: 'select', options: statuses},
};

export const BubbleStatus = SingleTemplate.bind({});
BubbleStatus.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  title: '3',
  url: '/foo/bar',
};

export const ConceptBubbleStatus = SingleTemplate.bind({});
ConceptBubbleStatus.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  title: '3',
  url: '/foo/bar',
  isConcept: true,
};

export const AssessmentBubbleStatus = SingleTemplate.bind({});
AssessmentBubbleStatus.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.assessment,
  title: '3',
  url: '/foo/bar',
};

AssessmentBubbleStatus.argTypes = {
  levelStatus: {control: 'select', options: assessmentStatuses},
};

export const BonusBubbleStatus = SingleTemplate.bind({});
BonusBubbleStatus.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  title: '3',
  url: '/foo/bar',
  isBonus: true,
};

const pairedBubbleStatuses = [...statuses].slice(1);

export const PairedBubbleStatus = SingleTemplate.bind({});
PairedBubbleStatus.args = {
  levelStatus: pairedBubbleStatuses[0],
  levelKind: LevelKind.level,
  title: '3',
  url: '/foo/bar',
  isPaired: true,
};

PairedBubbleStatus.argTypes = {
  levelStatus: {control: 'select', options: pairedBubbleStatuses},
};

export const UnpluggedBubbleStatus = SingleTemplate.bind({});
UnpluggedBubbleStatus.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  title: '3',
  url: '/foo/bar',
  isUnplugged: true,
};

export const LetterBubbles = () => (
  <div style={{...wrapperStyle, width: null, height: null}}>
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.perfect}
      bubbleSize={BubbleSize.letter}
      title={'a'}
      url={'/foo/bar'}
      key={1}
    />
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.attempted}
      bubbleSize={BubbleSize.letter}
      title={'b'}
      url={'/foo/bar'}
      key={2}
    />
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.not_tried}
      bubbleSize={BubbleSize.letter}
      title={'c'}
      url={'/foo/bar'}
      key={3}
    />
  </div>
);

LetterBubbles.argTypes = {};

export const DotBubbles = () => (
  <div style={{...wrapperStyle, width: null, height: null}}>
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.perfect}
      isConcept={true}
      bubbleSize={BubbleSize.dot}
      title={'a'}
      url={'/foo/bar'}
      key={1}
    />
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.attempted}
      bubbleSize={BubbleSize.dot}
      title={'b'}
      url={'/foo/bar'}
      key={2}
    />
    <ProgressTableLevelBubble
      levelStatus={LevelStatus.not_tried}
      bubbleSize={BubbleSize.dot}
      title={'c'}
      url={'/foo/bar'}
      key={3}
    />
  </div>
);

DotBubbles.argTypes = {};

export default {
  component: ProgressTableLevelBubble,
  argTypes: {
    levelStatus: {control: 'select', options: statuses},
  },
};
