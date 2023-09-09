import React from 'react';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';
import {BubbleSize} from '@cdo/apps/templates/progress/BubbleFactory';

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

const defaultExport = {
  name: 'ProgressTableLevelBubble',
  component: ProgressTableLevelBubble,
};

const SingleTemplate = args => (
  <div style={wrapperStyle}>
    <ProgressTableLevelBubble {...args} />
  </div>
);

const stories = {};

const LockedBubble = SingleTemplate.bind({});
LockedBubble.args = {
  levelStatus: LevelStatus.not_tried,
  levelKind: LevelKind.level,
  isLocked: true,
  title: '3',
  url: '/foo/bar',
};
stories['LockedBubble'] = LockedBubble;

statuses.map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.level,
    title: '3',
    url: '/foo/bar',
  };
  stories[`BubbleStatus-${status}`] = story;
});

statuses.map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.level,
    title: '3',
    url: '/foo/bar',
    isConcept: true,
  };
  stories[`ConceptBubbleStatus-${status}`] = story;
});

assessmentStatuses.map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.assessment,
    title: '3',
    url: '/foo/bar',
  };
  stories[`AssessmentBubbleStatus-${status}`] = story;
});

statuses.map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.level,
    title: '3',
    url: '/foo/bar',
    isBonus: true,
  };
  stories[`BonusBubbleStatus-${status}`] = story;
});

statuses.slice(1).map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.level,
    title: '3',
    url: '/foo/bar',
    isPaired: true,
  };
  stories[`PairedBubbleStatus-${status}`] = story;
});

statuses.map(status => {
  const story = SingleTemplate.bind({});
  story.args = {
    levelStatus: status,
    levelKind: LevelKind.level,
    title: '3',
    url: '/foo/bar',
    isUnplugged: true,
  };
  stories[`UnpluggedBubbleStatus-${status}`] = story;
});

const LetterBubbles = () => (
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
stories['LetterBubbles'] = LetterBubbles;

const DotBubbles = () => (
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
stories['DotBubbles'] = DotBubbles;

export default {
  ...stories,
  default: defaultExport,
};
