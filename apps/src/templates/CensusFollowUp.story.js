import React from 'react';
import {UnconnectedCensusFollowUp as CensusFollowUp} from './CensusFollowUp';

export default storybook => {

  storybook
    .storiesOf('CensusFollowUp', module)
    .addStoryTable([
      {
        name:'CensusFollowUp - questions about courses where 20+ hours of programming is taught',
        story: () => (
          <CensusFollowUp/>
        )
      },
    ]);
};
