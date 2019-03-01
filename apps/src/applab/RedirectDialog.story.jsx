import React from 'react';
import RedirectDialog from './RedirectDialog';

export default storybook => {
  storybook.storiesOf('RedirectDialog', module).addStoryTable([
    {
      name: 'Approved Site',
      story: () => <RedirectDialog url={'https://code.org/'} approved isOpen />
    },
    {
      name: 'Rejected Site',
      story: () => <RedirectDialog url={'https://code.org/'} isOpen />
    }
  ]);
};
