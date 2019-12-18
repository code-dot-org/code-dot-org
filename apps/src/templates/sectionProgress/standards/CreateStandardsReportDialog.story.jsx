import React from 'react';
import {UnconnectedCreateStandardsReportDialog as CreateStandardsReportDialog} from './CreateStandardsReportDialog';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';

export default storybook => {
  const store = createStore(combineReducers({sectionStandardsProgress}));

  return storybook
    .storiesOf('Standards/CreateStandardsReportDialog', module)
    .add('overview', () => {
      return (
        <Provider store={store}>
          <CreateStandardsReportDialog
            isOpen
            handleConfirm={action('Confirm')}
          />
        </Provider>
      );
    });
};
