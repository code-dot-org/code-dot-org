import React from 'react';
import LessonStatusList from './LessonStatusList';
import {unpluggedLessonList} from './standardsTestHelpers';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';

export default storybook => {
  const store = createStore(
    combineReducers({
      sectionProgress,
      sectionStandardsProgress,
      unitSelection,
      sectionData,
      currentUser
    })
  );

  return storybook
    .storiesOf('Standards/LessonStatusList', module)
    .add('overview', () => {
      return (
        <Provider store={store}>
          <LessonStatusList
            unpluggedLessonList={unpluggedLessonList}
            selectedLessons={[]}
            setSelectedLessons={action('set selected lessons')}
          />
        </Provider>
      );
    });
};
