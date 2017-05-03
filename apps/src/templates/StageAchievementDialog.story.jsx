import React from 'react';
import StageAchievementDialog from './StageAchievementDialog';

const ExampleDialogButton = React.createClass({
  render() {
    return (
      <div>
        <StageAchievementDialog
          isOpen={!!this.state && this.state.open}
          handleClose={() => this.setState({open: false})}
          {...this.props}
        />
        <button onClick={() => this.setState({open: true})}>
          Open the example dialog
        </button>
      </div>
    );
  }
});

export default storybook => {
  return storybook
    .storiesOf('StageAchievementDialog', module)
    .addStoryTable([
      {
        name: '1 star',
        description: 'Finished stage with 1 star',
        story: () => (
          <ExampleDialogButton
            stageName={'Naming Things'}
            assetUrl={url => '/blockly/' + url}
            onContinue={storybook.action('continue')}
            showStageProgress={true}
            newStageProgress={0.2}
            numStars={1}
          />
        )
      }, {
        name: '2 stars',
        description: 'Finished stage with 2 stars',
        story: () => (
          <ExampleDialogButton
            stageName={'Cache Invalidation'}
            assetUrl={url => '/blockly/' + url}
            onContinue={storybook.action('continue')}
            showStageProgress={true}
            newStageProgress={0.5}
            numStars={2}
          />
        )
      }, {
        name: '3 stars',
        description: 'Finished stage with 3 stars',
        story: () => (
          <ExampleDialogButton
            stageName={'Off-by-one Errors'}
            assetUrl={url => '/blockly/' + url}
            onContinue={storybook.action('continue')}
            showStageProgress={true}
            newStageProgress={0.8}
            numStars={3}
          />
        )
      }
    ]);
};
