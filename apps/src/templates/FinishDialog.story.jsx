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
        description: 'Perfectly finished, no share button, thumbnail, achievements, etc.',
        story: () => (
          <ExampleDialogButton>
            <FinishDialog
              isPerfect={true}
              blockLimit={98}
              blocksUsed={98}
              achievements={[]}
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
              //showFunometer
              canShare
            />
          </div>
        ),
      },
    ]);
