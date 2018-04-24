import { UnconnectedFinishDialog as FinishDialog } from './FinishDialog';
import ExampleDialogButton from '../util/ExampleDialogButton';
import React from 'react';
import progress from '@cdo/apps/code-studio/progressRedux';

const dialogWrapper = {
  padding: 40,
  width: 450,
  backgroundColor: 'gray',
};

const achievements = [
  {
    isAchieved: true,
    iconUrl: '',
    message: 'No hints used!',
  },
  {
    isAchieved: true,
    iconUrl: '',
    message: 'First attempt!',
  },
  {
    isAchieved: true,
    iconUrl: '',
    message: 'Effecient!',
  },
];

const code = `// Generated code
function isPrime(x) {
  for(let f = x - 1; f > 1; f--) {
    if (x % f === 0) {
      return false;
    }
  }
  return true;
}
`;
const message = `Even top universities teach block-based coding (e.g., <a href='#'>Berkeley</a>, <a href='#'>Harvard</a>). The blocks you use can also be shown in JavaScript, the most widely used coding language:`;
const studentCode = {
  code,
  message,
};

const levels = [];
for (let i = 0; i < 20; i++) {
  levels.push({
    activeId: 1818 + i,
    freePlay: false,
    icon: null,
    ids: [1818 + i],
    is_concept_level: false,
    kind: 'puzzle',
    position: i + 1,
    title: i + 1,
    url: '#',
  });
}

const mockProgress = {
  currentLevelId: '123',
  professionalLearningCourse: false,
  saveAnswersBeforeNavigation: false,
  stages: [{
    id: 40,
    levels,
  }],
  peerReviewStage: false,
  scriptId: 1,
  scriptName: 'test',
  scriptTitle: 'Test Script',
  courseId: null,
  currentStageId: 40,
  hasFullProgress: false,
  levelProgress: {
    1815: 17,
    1818: 100,
    1819: 30,
    1820: 100,
    1824: 17,
    1826: 17,
    1829: 17,
    1830: 100,
    1831: 100,
  },
};

export default storybook =>
  storybook
    .storiesOf('Dialogs/FinishDialog', module)
    .withReduxStore({progress}, {progress: mockProgress})
    .addStoryTable([
      {
        name: 'Dialog with overlay',
        description: 'Perfectly finished, no share button, thumbnail, etc.',
        story: () => (
          <ExampleDialogButton closeCallbacks={['onContinue', 'onReplay']} >
            <FinishDialog
              isPerfect={true}
              blockLimit={98}
              blocksUsed={98}
              achievements={achievements}
              studentCode={studentCode}
            />
          </ExampleDialogButton>
        ),
      },
      {
        name: 'Perfect Finish',
        description: 'Perfectly finished, no share button, thumbnail, etc.',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isPerfect
              blockLimit={98}
              blocksUsed={98}
              achievements={achievements}
              studentCode={studentCode}
            />
          </div>
        ),
      },
      {
        name: 'Pass Finish',
        description: 'Finished, but not optimally.',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              blockLimit={98}
              blocksUsed={99}
              achievements={achievements}
              studentCode={studentCode}
            />
          </div>
        ),
      },
      {
        name: 'Perfect Finish with funometer and share',
        description: 'Perfectly finished with all the fixins',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isPerfect
              blockLimit={98}
              blocksUsed={98}
              achievements={achievements}
              studentCode={studentCode}
              showFunometer
              feedbackImage="base64..image"
            />
          </div>
        ),
      },
      {
        name: 'Perfect Finish without achievements',
        description: 'Perfectly finished without achievements or funometer',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isPerfect
              blockLimit={98}
              blocksUsed={98}
              achievements={[]}
              studentCode={studentCode}
            />
          </div>
        ),
      },
      {
        name: 'Perfect Finish without block count',
        description: 'Perfectly finished with achievements but no block count',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isPerfect
              blocksUsed={98}
              achievements={achievements}
              studentCode={studentCode}
            />
          </div>
        ),
      },
      {
        name: 'Perfect Finish without block count or achievements',
        description: 'Perfectly finished with achievements but no block count',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isPerfect
              blocksUsed={98}
              achievements={[]}
              studentCode={studentCode}
            />
          </div>
        ),
      },
      {
        name: 'Perfect Finish of challenge level',
        description: 'Perfectly finished a challenge level',
        story: () => (
          <div style={dialogWrapper}>
            <FinishDialog
              hideBackdrop

              isChallenge
              isPerfect
              blockLimit={98}
              blocksUsed={98}
              achievements={achievements}
              studentCode={studentCode}
              showFunometer
            />
          </div>
        ),
      },
    ]);
