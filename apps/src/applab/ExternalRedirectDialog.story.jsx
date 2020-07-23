import React from 'react';
import {UnconnectedExternalRedirectDialog as ExternalRedirectDialog} from '@cdo/apps/applab/ExternalRedirectDialog';
import {REDIRECT_RESPONSE} from './redux/applab';

export default storybook => {
  storybook.storiesOf('ExternalRedirectDialog', module).addStoryTable([
    {
      name: 'Approved Site',
      story: () => (
        <ExternalRedirectDialog
          handleClose={() => {}}
          redirects={[
            {
              url:
                'www.google.com/super_duper/long_url/should_be_wrapped/to-the-next-line.html',
              approved: REDIRECT_RESPONSE.APPROVED
            }
          ]}
        />
      )
    },
    {
      name: 'Rejected Site',
      story: () => (
        <ExternalRedirectDialog
          handleClose={() => {}}
          redirects={[
            {
              url: 'www.google.com',
              approved: REDIRECT_RESPONSE.REJECTED
            }
          ]}
        />
      )
    },
    {
      name: 'Unsupported Site',
      story: () => (
        <ExternalRedirectDialog
          handleClose={() => {}}
          redirects={[
            {
              url: 'www.google.com',
              approved: REDIRECT_RESPONSE.UNSUPPORTED
            }
          ]}
        />
      )
    }
  ]);
};
