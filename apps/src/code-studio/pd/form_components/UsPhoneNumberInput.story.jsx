import React from 'react';
import UsPhoneNumberInput from './UsPhoneNumberInput';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
  .storiesOf('UsPhoneNumberInput', module)
  .addDecorator(reactBootstrapStoryDecorator)
  .add('Default', () => (
    <UsPhoneNumberInput
      name="Storybook"
      label="Enter a phone number"
    />
  ));
};
