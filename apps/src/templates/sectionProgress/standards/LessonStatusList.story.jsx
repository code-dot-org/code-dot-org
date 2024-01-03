import React from 'react';
import {UnconnectedLessonStatusList as LessonStatusList} from './LessonStatusList';
import {unpluggedLessonList} from './standardsTestHelpers';
import {action} from '@storybook/addon-actions';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {reduxStore} from '@cdo/storybook/decorators';
import {Provider} from 'react-redux';

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
  title: 'LessonStatusList',
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
