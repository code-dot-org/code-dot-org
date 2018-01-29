import { UnconnectedFinishDialog as FinishDialog } from './FinishDialog';
import ExampleDialogButton from '../util/ExampleDialogButton';
import React from 'react';

const dialogWrapper = {
  padding: 40,
  width: 375,
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
    message: 'Achievement got',
  },
  {
    isAchieved: false,
    iconUrl: '',
    message: 'Achievement missed',
  },
];

export default storybook =>
  storybook
    .storiesOf('FinishDialog')
    .addStoryTable([
      {
        name: 'Dialog with overlay',
        description: 'Perfectly finished, no share button, thumbnail, etc.',
        story: () => (
          <ExampleDialogButton closeCallbacks={['onContinue', 'onReplay']} >
            <FinishDialog
              isPerfect={true}
              blockLimit={10}
              blocksUsed={10}
              achievements={achievements}
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
              showFunometer
              canShare
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
            />
          </div>
        ),
      },
    ]);
