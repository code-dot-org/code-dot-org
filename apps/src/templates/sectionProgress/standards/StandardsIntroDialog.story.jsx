import React from 'react';
import {UnconnectedStandardsIntroDialog as StandardsIntroDialog} from './StandardsIntroDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('Standards/StandardsIntroDialog', module)
    .add('overview', () => {
      return <StandardsIntroDialog isOpen handleConfirm={action('Confirm')} />;
    });
};
