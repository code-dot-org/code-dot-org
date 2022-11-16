import React from 'react';
import UsPhoneNumberInput from './UsPhoneNumberInput';

export default {
  title: 'UsPhoneNumberInput',
  component: UsPhoneNumberInput
};

//
// TEMPLATE
//

const Template = args => <UsPhoneNumberInput {...args} />;

//
// STORIES
//

export const DefaultPhoneInput = Template.bind({});
DefaultPhoneInput.args = {
  label: 'Enter a phone number'
};
