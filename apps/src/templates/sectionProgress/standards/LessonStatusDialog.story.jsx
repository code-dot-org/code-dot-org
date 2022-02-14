import React from 'react';
import LessonStatusDialog from './LessonStatusDialog';
import {action} from '@storybook/addon-actions';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export default storybook => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionProgress,
      unitSelection,
      sectionData,
      teacherSections
    }),
    {
      teacherSections: {
        selectedSectionId: 1
      }
    }
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
