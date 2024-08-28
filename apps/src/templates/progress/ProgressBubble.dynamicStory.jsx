import {LevelKind, LevelStatus} from '@cdo/generated-scripts/sharedConstants';

const statuses = Object.values(LevelStatus);

const stories = {};
statuses.map(status => {
  stories[`BubbleStatus_${status}`] = {
    args: {
      level: {
        id: '1',
        levelNumber: 3,
        bubbleText: '3',
        kind: [
          LevelStatus.completed_assessment,
          LevelStatus.submitted,
        ].includes(status)
          ? LevelKind.assessment
          : LevelKind.puzzle,
        status: status,
        isLocked: false,
        url: '/foo/bar',
        icon: 'fa-document',
      },
      disabled: false,
    },
  };
});

// And the other stories that need representing outside of status variety
stories[`ConceptAssessmentNotTried`] = {
  args: {
    level: {
      id: '0',
      levelNumber: 2,
      bubbleText: '0',
      status: LevelStatus.not_tried,
      kind: LevelKind.assessment,
      isConceptLevel: true,
      isLocked: false,
      url: '/foo/bar',
      icon: 'fa-document',
    },
    disabled: false,
  },
};

stories[`ConceptAssessmentSubmitted`] = {
  args: {
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
  },
};

stories[`BubbleNoUrl`] = {
  args: {
    level: {
      id: '1',
      levelNumber: 1,
      bubbleText: '1',
      status: LevelStatus.perfect,
      isLocked: false,
      icon: 'fa-document',
    },
    disabled: false,
  },
};

stories[`DisabledBubble`] = {
  args: {
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
  },
};

stories[`HiddenTooltipsBubble`] = {
  args: {
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
  },
};

export default {
  baseCsf: `
    import ProgressBubble from "./ProgressBubble";
    
    export default { component: ProgressBubble };
  `,
  stories: () => stories,
};
