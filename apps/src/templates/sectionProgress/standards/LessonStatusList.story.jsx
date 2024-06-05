import {action} from '@storybook/addon-actions';
import React from 'react';
import {Provider} from 'react-redux';

import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {reduxStore} from '@cdo/storybook/decorators';

import {UnconnectedLessonStatusList as LessonStatusList} from './LessonStatusList';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import {unpluggedLessonList} from './standardsTestHelpers';

const initialState = {
  teacherSections: {
    selectedSectionId: 11,
  },
  unitSelection: {
    scriptId: 1,
  },
};

const store = reduxStore(
  {
    sectionProgress,
    sectionStandardsProgress,
    unitSelection,
    teacherSections,
    currentUser,
  },
  initialState
);

export default {
  component: LessonStatusList,
};

export const Template = () => (
  <Provider store={store}>
    <LessonStatusList
      unpluggedLessonList={unpluggedLessonList}
      selectedLessons={[]}
      setSelectedLessons={action('set selected lessons')}
    />
  </Provider>
);
