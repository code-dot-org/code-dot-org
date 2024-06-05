import {action} from '@storybook/addon-actions';
import React from 'react';

import {UnconnectedStandardsIntroDialog as StandardsIntroDialog} from './StandardsIntroDialog';

export default {
  component: StandardsIntroDialog,
};

export const Default = () => (
  <StandardsIntroDialog
    isOpen
    setCurrentUserHasSeenStandardsReportInfo={action('Has Seen True')}
  />
);
