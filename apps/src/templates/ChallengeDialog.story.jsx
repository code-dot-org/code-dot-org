import ChallengeDialog from './ChallengeDialog';
import CodeWritten from './feedback/CodeWritten';
import GeneratedCode from './feedback/GeneratedCode';
import React from 'react';

export default {
  title: 'ChallengeDialog',
  component: ChallengeDialog
};

const wrapperStyle = {
  marginTop: 100
};

// TEMPLATE

const Template = args => (
  <div style={wrapperStyle}>
    <ChallengeDialog hideBackdrop={true} {...args} />
  </div>
);

// STORIES

export const StartingDialog = Template.bind({});
StartingDialog.args = {
  avatar: '/blockly/media/skins/harvester/static_avatar.png',
  cancelButtonLabel: 'Skip for now',
  primaryButtonLabel: "I'm Ready!",
  text:
    'Challenge Puzzles are lessons designed to push your skills to a new level.',
  title: 'Challenge Puzzle!',
  isIntro: true
};

export const StartingDialogWithLargeAvatar = Template.bind({});
StartingDialogWithLargeAvatar.args = {
  avatar: '/blockly/media/spritelab/avatar.png',
  cancelButtonLabel: 'Skip for now',
  primaryButtonLabel: "I'm Ready!",
  text:
    'Challenge Puzzles are lessons designed to stretch your brain! Just do the best that you can!',
  title: 'Challenge Puzzle!',
  isIntro: true
};

export const StartingDialogIfPreviouslyCompleted = Template.bind({});
StartingDialogIfPreviouslyCompleted.args = {
  avatar: '/blockly/media/skins/harvester/static_avatar.png',
  cancelButtonLabel: 'Skip for now',
  complete: true,
  primaryButtonLabel: "I'm Ready!",
  text:
    'Challenge Puzzles are lessons designed to push your skills to a new level.',
  title: 'Challenge Puzzle!',
  isIntro: true
};

export const PassedDialog = Template.bind({});
PassedDialog.args = {
  avatar: '/blockly/media/skins/harvester/win_avatar.png',
  title: 'You did it!',
  primaryButtonLabel: 'Continue',
  cancelButtonLabel: 'Try again',
  showPuzzleRatingButtons: true,
  text:
    "However, you could've done it with only N blocks. Can you make your program even better?",
  children: [
    <CodeWritten numLinesWritten={9} useChallengeStyles key={0}>
      <GeneratedCode
        message="Here's your code:"
        code="console.log('F is friends who do stuff together!');"
      />
    </CodeWritten>
  ]
};

export const PassedDialogWithABird = Template.bind({});
PassedDialogWithABird.args = {
  avatar: '/blockly/media/skins/birds/win_avatar.png',
  title: 'You did it!',
  primaryButtonLabel: 'Continue',
  cancelButtonLabel: 'Try again',
  showPuzzleRatingButtons: true,
  text:
    "However, you could've done it with only N blocks. Can you make your program even better?",
  children: [
    <CodeWritten numLinesWritten={9} useChallengeStyles key={0}>
      <GeneratedCode
        message="Here's your code:"
        code="console.log('U is for you and me!');"
      />
    </CodeWritten>
  ]
};

export const PerfectCompletion = Template.bind({});
PerfectCompletion.args = {
  avatar: '/blockly/media/skins/harvester/win_avatar.png',
  complete: true,
  title: 'Challenge Complete!',
  primaryButtonLabel: 'Continue',
  cancelButtonLabel: 'Replay',
  showPuzzleRatingButtons: true,
  children: [
    <CodeWritten numLinesWritten={9} useChallengeStyles key={0}>
      <GeneratedCode
        message="Here's your code:"
        code="console.log('N is for anywhere and anytime at all');"
      />
    </CodeWritten>
  ]
};

export const PerfectCompletionWithoutPuzzleRatings = Template.bind({});
PerfectCompletionWithoutPuzzleRatings.args = {
  avatar: '/blockly/media/skins/studio/win_avatar.png',
  complete: true,
  title: 'Challenge Complete!',
  primaryButtonLabel: 'Continue',
  cancelButtonLabel: 'Replay',
  children: [
    <CodeWritten numLinesWritten={9} useChallengeStyles key={0}>
      <GeneratedCode
        message="Here's your code:"
        code="console.log('N is for anywhere and anytime at all');"
      />
    </CodeWritten>
  ]
};
