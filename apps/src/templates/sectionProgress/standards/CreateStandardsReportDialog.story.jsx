import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';

import {UnconnectedCreateStandardsReportDialog as CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import sectionStandardsProgress from './sectionStandardsProgressRedux';

export default {
  component: CreateStandardsReportDialog,
};

export const Overview = () => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionProgress,
      unitSelection,
    })
  );

  return (
    <Provider store={store}>
      <CreateStandardsReportDialog
        isOpen
        handleConfirm={action('Confirm')}
        handleClose={action('Close')}
        handleNext={action('Next')}
        onCommentChange={action('Comment')}
      />
    </Provider>
  );
};
