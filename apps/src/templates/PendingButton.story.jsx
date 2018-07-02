import React from 'react';
import PendingButton from './PendingButton';
import * as dataStyles from '../storage/dataBrowser/dataStyles';

export default storybook => {

  storybook
    .storiesOf('Buttons/PendingButton', module)
    .addStoryTable([
      {
        name:'PendingButton - not pending',
        story: () => (
          <PendingButton
            isPending={false}
            onClick={() => console.log('click')}
            pendingText="Adding"
            style={dataStyles.blueButton}
            text="Add pair"
          />
        )
      },
      {
        name:'PendingButton - pending',
        story: () => (
          <PendingButton
            isPending={true}
            onClick={() => console.log('click')}
            pendingText="Adding"
            style={dataStyles.blueButton}
            text="Add pair"
          />
        )
      },
    ]);
};
