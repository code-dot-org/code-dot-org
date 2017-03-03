import React from 'react';
import ProgressButton from './ProgressButton';

export default storybook => {

  storybook
    .storiesOf('ProgressButton', module)
    .addStoryTable([
      {
        name:'ProgressButton with href',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            text="Batman & Robin"
          />
        )
      },
      {
        name:'ProgressButton with onClick',
        story: () => (
          <ProgressButton
            onClick={() => console.log('click')}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'gray button',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            color={ProgressButton.ButtonColor.gray}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'blue button',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            color={ProgressButton.ButtonColor.blue}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'white button',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            color={ProgressButton.ButtonColor.white}
            text="Batman & Robin"
          />
        )
      },

      {
        name: 'large button',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            size={ProgressButton.ButtonSize.large}
            text="Continue"
          />
        )
      },

      {
        name:'white button with icon',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            color={ProgressButton.ButtonColor.white}
            icon="lock"
            text="Assessment Settings"
          />
        )
      },

      {
        name:'blue button with icon',
        story: () => (
          <ProgressButton
            href="/foo/bar"
            color={ProgressButton.ButtonColor.blue}
            icon="file-text"
            text="Assessment Settings"
          />
        )
      },
    ]);
};
