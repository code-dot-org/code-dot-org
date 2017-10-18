import React from 'react';
import StageAchievementDialog from './StageAchievementDialog';
import ExampleDialogButton from '../util/ExampleDialogButton';

export default storybook => {
  return storybook
    .storiesOf('StageAchievementDialog', module)
    .addStoryTable([
      {
        name: '1 star',
        description: 'Finished stage with 1 star',
        story: () => (
          <ExampleDialogButton>
            <StageAchievementDialog
              stageName={'Naming Things'}
              assetUrl={url => '/blockly/' + url}
              onContinue={storybook.action('continue')}
              showStageProgress={true}
              newStageProgress={0.2}
              numStars={1}
            />
          </ExampleDialogButton>
        )
      }, {
        name: '2 stars',
        description: 'Finished stage with 2 stars',
        story: () => (
          <ExampleDialogButton>
            <StageAchievementDialog
              stageName={'Cache Invalidation'}
              assetUrl={url => '/blockly/' + url}
              onContinue={storybook.action('continue')}
              showStageProgress={true}
              newStageProgress={0.5}
              numStars={2}
            />
          </ExampleDialogButton>
        )
      }, {
        name: '3 stars',
        description: 'Finished stage with 3 stars',
        story: () => (
          <ExampleDialogButton>
            <StageAchievementDialog
              stageName={'Off-by-one Errors'}
              assetUrl={url => '/blockly/' + url}
              onContinue={storybook.action('continue')}
              showStageProgress={true}
              newStageProgress={0.8}
              numStars={3}
            />
          </ExampleDialogButton>
        )
      }
    ]);
};
