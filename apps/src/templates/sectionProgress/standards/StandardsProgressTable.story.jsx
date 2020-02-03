import React from 'react';
import StandardsProgressTable from './StandardsProgressTable';
import {fakeStandards, lessonCompletedByStandard} from './standardsTestHelpers';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';

export default storybook => {
  const store = createStore(combineReducers({sectionStandardsProgress}));

  return storybook
    .storiesOf('Standards/StandardsProgressTable', module)
    .addStoryTable([
      {
        name: 'Standards For Class',
        description: 'See standards completed by one class',
        story: () => (
          <Provider store={store}>
            <StandardsProgressTable
              standards={fakeStandards}
              lessonsCompletedByStandard={lessonCompletedByStandard}
            />
          </Provider>
        )
      }
    ]);
};
