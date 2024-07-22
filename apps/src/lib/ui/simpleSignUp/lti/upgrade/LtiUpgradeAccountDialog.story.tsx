import {StoryFn} from '@storybook/react';
import React from 'react';

import LtiUpgradeAccountDialog from '@cdo/apps/lib/ui/simpleSignUp/lti/upgrade/LtiUpgradeAccountDialog';

export default {
  component: LtiUpgradeAccountDialog,
};

//
// TEMPLATE
//

const Template: StoryFn<typeof LtiUpgradeAccountDialog> = args => (
  <LtiUpgradeAccountDialog {...args} />
);

//
// STORIES
//

export const EmailForm = Template.bind({});
EmailForm.args = {
  formData: {
    destination_url: 'https://code.org',
    email: 'test@code.org',
  },
};
