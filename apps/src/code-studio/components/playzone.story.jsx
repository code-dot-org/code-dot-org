import React from 'react';
import PlayZone from './playzone';
import CreateSomething from './lessonExtras/CreateSomething';
import {withInfo} from '@storybook/addon-info';

export default storybook => {
  storybook
    .storiesOf('PlayZone', module)
    .add(
      'default',
      withInfo('This is the PlayZone component.')(() => (
        <PlayZone stageName="Test Stage" onContinue={() => {}} />
      ))
    )
    .add(
      'create something',
      withInfo('This is the CreateSomething component.')(() => (
        <CreateSomething />
      ))
    );
};
