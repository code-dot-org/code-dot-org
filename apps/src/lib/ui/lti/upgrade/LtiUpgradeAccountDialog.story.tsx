import React from 'react';
import {StoryFn} from '@storybook/react';
import LtiUpgradeAccountDialog from '@cdo/apps/lib/ui/lti/upgrade/LtiUpgradeAccountDialog';

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
