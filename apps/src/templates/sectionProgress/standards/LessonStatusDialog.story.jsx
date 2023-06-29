import React from 'react';
import LessonStatusDialog from './LessonStatusDialog';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';

export default {
  title: 'LessonStatusDialog',
  component: LessonStatusDialog,
};

export const overview = () => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionProgress,
      unitSelection,
      teacherSections,
    }),
    {
      teacherSections: {
        selectedSectionId: 1,
      },
    }
  );

  return (
    <Provider store={store}>
      <LessonStatusDialog isOpen handleConfirm={action('Confirm')} />
    </Provider>
  );
};
