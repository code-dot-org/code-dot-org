import React from 'react';
import {StandardsIntroDialog} from './StandardsIntroDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('Standards/StandardsIntroDialog', module)
    .add('overview', () => {
      return <StandardsIntroDialog isOpen handleConfirm={action('Confirm')} />;
    });
};
