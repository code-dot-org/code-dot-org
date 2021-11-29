import React from 'react';
import {UnconnectedCreateStandardsReportDialog as CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';

export default storybook => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionProgress,
      unitSelection
    })
  );

  return storybook
    .storiesOf('Standards/CreateStandardsReportDialog', module)
    .add('overview', () => {
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
    });
};
