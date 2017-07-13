import React from 'react';
import LoginTypeParagraph from './LoginTypeParagraph';

export default storybook => storybook
  .storiesOf('LoginTypeParagraph', module)
  .addStoryTable([
    {
      name: 'picture',
      description: '',
      story: () => (
        <LoginTypeParagraph
          loginType="picture"
        />
      )
    },
    {
      name: 'word',
      description: '',
      story: () => (
        <LoginTypeParagraph
          loginType="word"
        />
      )
    },
    {
      name: 'email',
      description: '',
      story: () => (
        <LoginTypeParagraph
          loginType="email"
        />
      )
    },
  ]);
