import React from 'react';
import {UnconnectedGameButtons, RunButton, ResetButton} from './GameButtons';

// le sigh... we can't just import the craft stylesheet because
// it changes global elements. So instead we have to import the below
// sass stylesheet which scopes all the craft rules to only work
// inside the specific story cells that need them.
import './GameButtons.story.scss';

export default function (storybook) {
  RunButton.displayName = 'RunButton';
  ResetButton.displayName = 'ResetButton';
  storybook
    .storiesOf('RunButton', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'The way the button is rendered with only default props',
        story: () => <RunButton />,
      },
      {
        name: 'minecraft version',
        description: `
          this shows up if you wrap the button in a ".minecraft" element
          and include the appropriate minecraft stylesheet.
        `,
        storyCellClass: 'GameButtonsStory loadCraftStyleSheet',
        story: () => (
          <div className="minecraft">
            <RunButton />
          </div>
        ),
      },
    ]);

  storybook
    .storiesOf('ResetButton', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'You have to explicitly set display: block to make this show up. It is hidden by default?!',
        story: () => <ResetButton style={{display: 'block'}} />
      },
      {
        name: 'minecraft version',
        description: `
          this shows up if you wrap the button in a ".minecraft" element
          and include the appropriate minecraft stylesheet.
        `,
        storyCellClass: 'GameButtonsStory loadCraftStyleSheet',
        story: () => (
          <div className="minecraft">
            <ResetButton style={{display: 'block'}} />
          </div>
        )
      },
      {
        name: 'text hidden',
        description: 'You can hide the text with the hideText prop',
        story: () => <ResetButton style={{display: 'block'}} hideText />
      },
      {
        name: 'minecraft text hidden',
        description: 'You can hide the text with the hideText prop',
        storyCellClass: 'GameButtonsStory loadCraftStyleSheet',
        story: () => (
          <div className="minecraft">
            <ResetButton style={{display: 'block'}} hideText />
          </div>
        ),
      }
    ]);

  storybook
    .storiesOf('GameButtons', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'The default version with no props',
        story: () => (
          <UnconnectedGameButtons />
        ),
      },
      {
        name: 'playspace phone frame',
        description: 'the playspace phone frame just renders an empty div...',
        story: () => (
          <UnconnectedGameButtons playspacePhoneFrame />
        ),
      },
      {
        name: 'hideRunButton',
        description: 'the run button is hidden when this prop is supplied',
        story: () => (
          <UnconnectedGameButtons hideRunButton />
        ),
      },
      {
        name: 'minecraft version',
        description: `
          this shows up if you wrap the button in a ".minecraft" element
          and include the appropriate minecraft stylesheet.
        `,
        storyCellClass: 'GameButtonsStory loadCraftStyleSheet',
        story: () => (
          <div className="minecraft">
            <UnconnectedGameButtons />
          </div>
        ),
      },
      {
        name: 'with extra content',
        description: 'Additional children can be provided',
        story: () => (
          <UnconnectedGameButtons>
            <button>another button</button>
          </UnconnectedGameButtons>
        ),
      },
    ]);
}
