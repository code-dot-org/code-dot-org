import React from 'react';
import ReCaptchaDialog from './ReCaptchaDialog';

//Using Google's publicly available test key:
//https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
export default storybook => {
  return storybook.storiesOf('Dialogs/ReCaptchaDialog', module).addStoryTable([
    {
      name: 'Dialog open',
      description:
        'Dialog forces user to cancel or complete captcha before submitting',
      story: () => (
        <ReCaptchaDialog
          siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          handleSubmit={() => {}}
          handleCancel={() => {}}
          submitText="Join section"
          isOpen={true}
        />
      )
    }
  ]);
};
