import React from 'react';
import PendingButton from './PendingButton';
import dataStyles from '../storage/dataBrowser/data-styles.module.scss';
import classNames from 'classnames';

export default storybook => {
  storybook.storiesOf('Buttons/PendingButton', module).addStoryTable([
    {
      name: 'PendingButton - not pending',
      story: () => (
        <PendingButton
          isPending={false}
          onClick={() => console.log('click')}
          pendingText="Adding"
          className={classNames(dataStyles.button, dataStyles.buttonBlue)}
          text="Add pair"
        />
      )
    },
    {
      name: 'PendingButton - pending',
      story: () => (
        <PendingButton
          isPending={true}
          onClick={() => console.log('click')}
          pendingText="Adding"
          className={classNames(dataStyles.button, dataStyles.buttonBlue)}
          text="Add pair"
        />
      )
    }
  ]);
};
