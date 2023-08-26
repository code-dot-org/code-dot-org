import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import styles from '@cdo/apps/templates/levelSummary/summary.module.scss';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import progress from '@cdo/apps/code-studio/progressRedux';

const JS_DATA = {
  level: {
    type: 'FreeResponse',
    id: 0,
  },
  responses: [{user_id: 0, text: 'student answer'}],
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
      <SummaryResponses scriptData={{...JS_DATA, ...jsData}} />
    </Provider>
  );

  return wrapper;
};

describe('SummaryResponses', () => {
  it('renders elements', () => {
    const wrapper = setUpWrapper();

    // Student responses.
    expect(wrapper.find(`.${styles.studentsSubmittedRight}`).text()).to.eq(
      '1/1 students answered'
    );
    expect(wrapper.find(`div.${styles.studentAnswer}`).length).to.eq(1);
    // Section selector, with one section.
    expect(wrapper.find('SectionSelector').length).to.eq(1);
    expect(wrapper.find('SectionSelector option').length).to.eq(2);
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

    expect(wrapper.find(`.${styles.studentsSubmittedRight}`).length).to.eq(0);
    expect(wrapper.find(`.${styles.studentsSubmittedLeft}`).length).to.eq(1);
  });

  it('does not render response counter/text if no section selected', () => {
    const wrapper = setUpWrapper({
      teacherSections: {
        selectedStudents: [{id: 0}],
        selectedSectionId: null,
        sectionIds: [0],
        sections: [{id: 0, name: 'test section'}],
      },
    });

    expect(wrapper.find(`.${styles.studentsSubmittedRight}`).length).to.eq(0);
    expect(wrapper.find(`.${styles.studentsSubmittedLeft}`).length).to.eq(0);
  });

  it('renders toggle when appropriate', () => {
    const wrapper = setUpWrapper(
      {},
      {
        level: {
          type: 'Multi',
          id: 0,
          properties: {
            answers: [],
          },
        },
        answer_is_visible: true,
      }
    );

    expect(wrapper.find('ToggleSwitch').length).to.eq(1);
  });

  it('does not render toggle for Free Response', () => {
    const wrapper = setUpWrapper(
      {},
      {
        level: {
          type: 'FreeResponse',
          id: 0,
          properties: {
            answers: [],
          },
        },
        answer_is_visible: true,
      }
    );

    expect(wrapper.find('ToggleSwitch').length).to.eq(0);
  });

  it('does not render toggle without policy permission', () => {
    const wrapper = setUpWrapper(
      {},
      {
        level: {
          type: 'Multi',
          id: 0,
          properties: {
            answers: [],
          },
        },
      }
    );

    expect(wrapper.find('ToggleSwitch').length).to.eq(0);
  });
});
