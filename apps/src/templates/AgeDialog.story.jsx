import React from 'react';
import { UnconnectedAgeDialog as AgeDialog } from './AgeDialog';

export default storybook => {
  return storybook
    .storiesOf('AgeDialog', module)
    .addStoryTable([
      {
        name:'AgeDialog',
        story: () => (
          <AgeDialog
            signedIn={false}
            turnOffFilter={()=>{}}
          />
        )
      }
    ]);
};
