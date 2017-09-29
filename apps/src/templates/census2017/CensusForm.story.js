import React from 'react';
import {UnconnectedCensusForm as CensusForm} from './CensusForm';

export default storybook => {

  storybook
    .storiesOf('CensusForm', module)
    .addStoryTable([
      {
        name:'CensusForm',
        story: () => (
          <CensusForm/>
        )
      },
    ]);
};
