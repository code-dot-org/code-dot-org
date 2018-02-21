import ChallengeDialog from './ChallengeDialog';
import CodeWritten from './feedback/CodeWritten';
import GeneratedCode from './feedback/GeneratedCode';
import React from 'react';

const wrapperStyle = {
  marginTop: 200,
};

export default storybook => {
  return storybook
    .storiesOf('Dialogs/ChallengeDialog', module)
    .addStoryTable([
      {
        name: 'Starting Dialog',
        description: 'Shows up as soon as you load the puzzle.',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/harvester/static_avatar.png"
              cancelButtonLabel="Skip for now"
              primaryButtonLabel="I'm Ready!"
              text="Challenge Puzzles are lessons designed to push your skills to a new level."
              title="Challenge Puzzle!"
              isIntro
            />
          </div>
        )
      },
      {
        name: 'Starting Dialog if previously completed',
        description: 'Shows up as soon as you load the puzzle.',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/harvester/static_avatar.png"
              cancelButtonLabel="Skip for now"
              complete={true}
              primaryButtonLabel="I'm Ready!"
              text="Challenge Puzzles are lessons designed to push your skills to a new level."
              title="Challenge Puzzle!"
              isIntro
            />
          </div>
        )
      },
      {
        name: 'Passed Dialog',
        description: 'Too many blocks',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/harvester/win_avatar.png"
              title="You did it!"
              primaryButtonLabel="Continue"
              cancelButtonLabel="Try again"
              showPuzzleRatingButtons
              text="However, you could've done it with only N blocks. Can you make your program even better?"
            >
              <CodeWritten
                numLinesWritten={9}
                totalNumLinesWritten={30}
                useChallengeStyles
              >
                <GeneratedCode
                  message="Here's your code:"
                  code="console.log('F is friends who do stuff together!');"
                />
              </CodeWritten>
            </ChallengeDialog>
          </div>
        )
      },
      {
        name: 'Passed Dialog with a bird',
        description: 'Too many blocks',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/birds/win_avatar.png"
              title="You did it!"
              primaryButtonLabel="Continue"
              cancelButtonLabel="Try again"
              showPuzzleRatingButtons
              text="However, you could've done it with only N blocks. Can you make your program even better?"
            >
              <CodeWritten
                numLinesWritten={9}
                totalNumLinesWritten={30}
                useChallengeStyles
              >
                <GeneratedCode
                  message="Here's your code:"
                  code="console.log('U is for you and me!');"
                />
              </CodeWritten>
            </ChallengeDialog>
          </div>
        )
      },
      {
        name: 'Perfect Dialog',
        description: 'Perfect completion',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/harvester/win_avatar.png"
              complete
              title="Challenge Complete!"
              primaryButtonLabel="Continue"
              cancelButtonLabel="Replay"
              showPuzzleRatingButtons
            >
              <CodeWritten
                numLinesWritten={9}
                totalNumLinesWritten={30}
                useChallengeStyles
              >
                <GeneratedCode
                  message="Here's your code:"
                  code="console.log('N is for anywhere and anytime at all');"
                />
              </CodeWritten>
            </ChallengeDialog>
          </div>
        )
      },
      {
        name: 'Perfect Dialog without puzzle ratings',
        description: 'Perfect completion',
        story: () => (
          <div style={wrapperStyle}>
            <ChallengeDialog
              hideBackdrop
              avatar="/blockly/media/skins/studio/win_avatar.png"
              complete
              title="Challenge Complete!"
              primaryButtonLabel="Continue"
              cancelButtonLabel="Replay"
            >
              <CodeWritten
                numLinesWritten={9}
                totalNumLinesWritten={30}
                useChallengeStyles
              >
                <GeneratedCode
                  message="Here's your code:"
                  code="console.log('N is for anywhere and anytime at all');"
                />
              </CodeWritten>
            </ChallengeDialog>
          </div>
        )
      },
    ]);
};
