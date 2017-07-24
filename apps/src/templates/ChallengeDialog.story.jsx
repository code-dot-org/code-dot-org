import ChallengeDialog from './ChallengeDialog';
import React from 'react';

export default storybook => {
  return storybook
    .storiesOf('ChallengeDialog', module)
    .addStoryTable([
      {
        name: 'Starting Dialog',
        description: 'Shows up as soon as you load the puzzle.',
        story: () => (
          <ChallengeDialog
            hideBackdrop
            assetUrl={url => '/blockly/' + url}
            avatar="/blockly/media/skins/harvester/static_avatar.png"
            title="Challenge Puzzle!"
            primaryButtonLabel="I'm Ready!"
            cancelButtonLabel="Skip for now"
          >
            Challenge Puzzles are lessons designed to push your skills to a new level.
          </ChallengeDialog>
        )
      },
      {
        name: 'Passed Dialog',
        description: 'Too many blocks',
        story: () => (
          <ChallengeDialog
            hideBackdrop
            assetUrl={url => '/blockly/' + url}
            avatar="/blockly/media/skins/harvester/win_avatar.png"
            title="You did it!"
            primaryButtonLabel="Continue"
            cancelButtonLabel="Try again"
          >
            However, you could've done it with only N blocks. Can you make your program even better?
          </ChallengeDialog>
        )
      },
      {
        name: 'Perfect Dialog',
        description: 'Perfect completion',
        story: () => (
          <ChallengeDialog
            hideBackdrop
            assetUrl={url => '/blockly/' + url}
            avatar="/blockly/media/skins/harvester/win_avatar.png"
            title="Challenge Complete!"
            primaryButtonLabel="Continue"
            cancelButtonLabel="Replay"
          >
            <div>You just wrote 9 lines of code!</div>
            <div>All-time total: 30 lines of code.</div>
          </ChallengeDialog>
        )
      },
    ]);
};
