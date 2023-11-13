import React from 'react';
import {UnconnectedStandardsIntroDialog as StandardsIntroDialog} from './StandardsIntroDialog';
import {action} from '@storybook/addon-actions';

export default {
  title: 'StandardsIntroDialog',
  component: StandardsIntroDialog,
};

export const Default = () => (
  <StandardsIntroDialog
    isOpen
    setCurrentUserHasSeenStandardsReportInfo={action('Has Seen True')}
  />
);
