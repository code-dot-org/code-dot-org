import React from 'react';
import ProgressBubble from './ProgressBubble';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';

const statuses = Object.values(LevelStatus);

const defaultExport = {
  title: 'ProgressBubble',
  component: ProgressBubble,
};

const Template = args => <ProgressBubble {...args} />;

const stories = {};
statuses.map(status => {
  const story = Template.bind({});
  story.args = {
    level: {
      id: '1',
      levelNumber: 3,
      bubbleText: '3',
      kind: [LevelStatus.completed_assessment, LevelStatus.submitted].includes(
        status
      )
        ? LevelKind.assessment
        : LevelKind.puzzle,
      status: status,
      isLocked: false,
      url: '/foo/bar',
      icon: 'fa-document',
    },
    disabled: false,
  };
  stories[`BubbleStatus-${status}`] = story;
});

// And the other stories that need representing outside of status variety
const ConceptAssessmentNotTried = Template.bind({});
ConceptAssessmentNotTried.args = {
  level: {
    id: '1',
    levelNumber: 3,
    bubbleText: '1',
    status: LevelStatus.not_tried,
    kind: LevelKind.assessment,
    isConceptLevel: true,
    isLocked: false,
    url: '/foo/bar',
    icon: 'fa-document',
  },
  disabled: false,
};
stories[`ConceptAssessmentNotTried`] = ConceptAssessmentNotTried;

const ConceptAssessmentSubmitted = Template.bind({});
ConceptAssessmentSubmitted.args = {
  level: {
    id: '1',
    levelNumber: 3,
    bubbleText: '1',
    status: LevelStatus.submitted,
    kind: LevelKind.assessment,
    isConceptLevel: true,
    isLocked: false,
    url: '/foo/bar',
    icon: 'fa-document',
  },
  disabled: false,
};
stories[`ConceptAssessmentSubmitted`] = ConceptAssessmentSubmitted;

const BubbleNoUrl = Template.bind({});
BubbleNoUrl.args = {
  level: {
    id: '1',
    levelNumber: 1,
    bubbleText: '1',
    status: LevelStatus.perfect,
    isLocked: false,
    icon: 'fa-document',
  },
  disabled: false,
};
stories[`BubbleNoUrl`] = BubbleNoUrl;

const DisabledBubble = Template.bind({});
DisabledBubble.args = {
  level: {
    id: '1',
    levelNumber: 3,
    bubbleText: '1',
    status: LevelStatus.perfect,
    isLocked: false,
    url: '/foo/bar',
    icon: 'fa-document',
  },
  disabled: true,
};
stories[`DisabledBubble`] = DisabledBubble;

const HiddenTooltipsBubble = Template.bind({});
HiddenTooltipsBubble.args = {
  level: {
    id: '1',
    levelNumber: 3,
    bubbleText: '3',
    status: LevelStatus.perfect,
    isLocked: false,
    url: '/foo/bar',
    icon: 'fa-document',
  },
  hideToolTips: true,
  disabled: false,
};
stories[`HiddenTooltipsBubble`] = HiddenTooltipsBubble;

export default {
  ...stories,
  default: defaultExport,
};
