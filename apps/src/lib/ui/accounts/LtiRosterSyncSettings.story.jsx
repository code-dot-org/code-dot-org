import React from 'react';

import LtiRosterSyncSettings from './LtiRosterSyncSettings';

export default {
  component: LtiRosterSyncSettings,
};

//
// TEMPLATE
//

const Template = args => <LtiRosterSyncSettings {...args} />;

//
// STORIES
//

export const Default = Template.bind({});
Default.args = {
  ltiRosterSyncEnabled: true,
  formId: '',
};
