import React from 'react';
import {UnconnectedCreateStandardsReportDialog as CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {action} from '@storybook/addon-actions';

export default storybook => {
  return storybook
    .storiesOf('Standards/CreateStandardsReportDialog', module)
    .add('overview', () => {
      return (
        <CreateStandardsReportDialog
          isOpen
          handleConfirm={action('Confirm')}
          handleBack={action('Back')}
        />
      );
    });
};
