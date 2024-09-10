import React from 'react';

import {UnconnectedExternalRedirectDialog as ExternalRedirectDialog} from '@cdo/apps/applab/ExternalRedirectDialog';

import {REDIRECT_RESPONSE} from './redux/applab';

export default {
  component: ExternalRedirectDialog,
};

const Template = args => (
  <ExternalRedirectDialog {...args} handleClose={() => {}} />
);

export const ApprovedSite = Template.bind({});
ApprovedSite.args = {
  redirects: [
    {
      url: 'www.google.com/super_duper/long_url/should_be_wrapped/to-the-next-line.html',
      response: REDIRECT_RESPONSE.APPROVED,
    },
  ],
};

export const RejectedSite = Template.bind({});
RejectedSite.args = {
  redirects: [
    {
      url: 'www.google.com',
      response: REDIRECT_RESPONSE.REJECTED,
    },
  ],
};

export const UnsupportedSite = Template.bind({});
UnsupportedSite.args = {
  redirects: [
    {
      url: 'www.google.com',
      response: REDIRECT_RESPONSE.UNSUPPORTED,
    },
  ],
};
