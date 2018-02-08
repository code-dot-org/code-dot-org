import React from 'react';
import Button from './Button';

export default storybook => {

  storybook
    .storiesOf('Button', module)
    .addStoryTable([
      {
        name:'Button with href',
        story: () => (
          <Button
            href="/foo/bar"
            text="Batman & Robin"
          />
        )
      },
      {
        name:'Button with onClick',
        story: () => (
          <Button
            onClick={() => console.log('click')}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'gray button',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.gray}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'blue button',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.blue}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'white button',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.white}
            text="Batman & Robin"
          />
        )
      },

      {
        name:'red button',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.red}
            text="Batman & Robin"
          />
        )
      },

      {
        name: 'large button',
        story: () => (
          <Button
            href="/foo/bar"
            size={Button.ButtonSize.large}
            text="Continue"
          />
        )
      },

      {
        name:'white button with icon',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.white}
            icon="lock"
            text="Assessment Settings"
          />
        )
      },

      {
        name:'blue button with icon',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.blue}
            icon="file-text"
            text="Assessment Settings"
          />
        )
      },

      {
        name:'orange button with styled icon',
        story: () => (
          <Button
            href="/foo/bar"
            color={Button.ButtonColor.orange}
            icon="caret-down"
            iconStyle={{fontSize: 24, position: 'relative', top: 3}}
            text="Assign Course"
          />
        )
      },
    ]);
};
