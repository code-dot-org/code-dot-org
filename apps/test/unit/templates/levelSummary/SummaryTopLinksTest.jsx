import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import SummaryTopLinks from '@cdo/apps/templates/levelSummary/SummaryTopLinks';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import styles from '@cdo/apps/templates/levelSummary/summary.module.scss';

const JS_DATA = {
  level: {
    id: 0,
  },
};

const INITIAL_STATE = {
  isRtl: false,
  viewAs: 'Instructor',
  teacherSections: {
    selectedStudents: [{id: 0}],
    selectedSectionId: 0,
    sectionIds: [0],
    sections: [{id: 0, name: 'test section'}],
  },
  progress: {
    currentLessonId: 0,
    currentLevelId: '0',
    lessons: [
      {
        id: 0,
        levels: [{activeId: '0', position: 1}],
      },
    ],
  },
};

const setUpWrapper = (state = {}, jsData = {}) => {
  const store = createStore(
    combineReducers({
      isRtl,
      viewAs,
      teacherSections,
      progress,
    }),
    {...INITIAL_STATE, ...state}
  );

  const wrapper = mount(
    <Provider store={store}>
      <SummaryTopLinks scriptData={{...JS_DATA, ...jsData}} />
    </Provider>
  );

  return wrapper;
};

describe('SummaryTopLinks', () => {
  it('renders elements', () => {
    const wrapper = setUpWrapper();

    // Back link, but no next link.
    expect(wrapper.find(`.${styles.navLinks} a`).length).toBe(1);
  });

  it('applies correct classes when rtl', () => {
    const wrapper = setUpWrapper({
      isRtl: true,
      progress: {
        currentLessonId: 0,
        currentLevelId: '0',
        lessons: [
          {
            id: 0,
            levels: [
              {activeId: '0', position: 1},
              {activeId: '1', position: 2},
            ],
          },
        ],
      },
    });

    expect(wrapper.find(`.${styles.navLinkRight}`).length).toBe(0);
    expect(wrapper.find(`.${styles.navLinkLeft}`).length).toBe(1);
  });
});
