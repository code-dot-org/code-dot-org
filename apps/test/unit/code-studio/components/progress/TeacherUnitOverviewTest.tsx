import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import '@testing-library/jest-dom/extend-expect';

import announcements from '@cdo/apps/code-studio/announcementsRedux';
import TeacherUnitOverview from '@cdo/apps/code-studio/components/progress/TeacherUnitOverview';
import progress from '@cdo/apps/code-studio/progress';
import {getStore, registerReducers} from '@cdo/apps/redux';
import localesRedux from '@cdo/apps/redux/localesRedux';
import teacherSectionsRedux from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

describe('TeacherUnitOverview Component', () => {
  let store;

  beforeEach(() => {
    store = getStore();

    registerReducers({
      localesRedux,
      announcements,
      teacherSectionsRedux,
      progress,
    });
  });

  function renderDefault() {
    return render(
      <Provider store={store}>
        <TeacherUnitOverview />
      </Provider>
    );
  }

  it('test 1', () => {
    renderDefault();
  });
});
