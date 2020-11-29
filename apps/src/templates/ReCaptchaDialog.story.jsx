import React from 'react';
import ReCaptchaDialog from './ReCaptchaDialog';

export default storybook => {
  return storybook.storiesOf('Dialogs/ReCaptchaDialog', module).addStoryTable([
    {
      name: 'Dialog open ',
      description:
        'Dialog forces user to cancel or complete captcha before submitting',
      story: () => (
        <ReCaptchaDialog
          handleSubmit={() => {}}
          handleCancel={() => {}}
          isOpen={true}
        />
      )
    }
  ]);
};
