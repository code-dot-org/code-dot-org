import React from 'react';
import {UnconnectedExternalRedirectDialog as ExternalRedirectDialog} from '@cdo/apps/applab/ExternalRedirectDialog';

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
              approved: true
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
          redirects={[{url: 'www.google.com', approved: false}]}
        />
      )
    }
  ]);
};
