import React from 'react';
import LessonStatusDialog from './LessonStatusDialog';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';

export default storybook => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionProgress,
      scriptSelection,
      sectionData
    })
  );

  return storybook
    .storiesOf('Standards/LessonStatusDialog', module)
    .add('overview', () => {
      return (
        <Provider store={store}>
          <LessonStatusDialog isOpen handleConfirm={action('Confirm')} />
        </Provider>
      );
    });
};
