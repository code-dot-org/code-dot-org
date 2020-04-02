import React from 'react';
import ParentLetter from './ParentLetter';

export default storybook =>
  storybook
    .storiesOf('ParentLetter', module)
    .add('overview', () => <ParentLetter />);
