import React from 'react';

import ReCaptchaDialog from './ReCaptchaDialog';

export default {
  component: ReCaptchaDialog,
};

//Using Google's publicly available test key:
//https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
const DEFAULT_PROPS = {
  handleSubmit: () => {},
  handleCancel: () => {},
  isOpen: true,
  submitText: 'Join section',
  siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
};
const Template = args => <ReCaptchaDialog {...DEFAULT_PROPS} {...args} />;

export const DialogOpen = Template.bind({});
DialogOpen.args = {};
