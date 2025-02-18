import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import LessonStatusDialog from './LessonStatusDialog';
import sectionStandardsProgress from './sectionStandardsProgressRedux';

export default {
  component: LessonStatusDialog,
};

export const Overview = () => {
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
