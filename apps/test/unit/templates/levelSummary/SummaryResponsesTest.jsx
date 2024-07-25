import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import SummaryResponses from '@cdo/apps/templates/levelSummary/SummaryResponses';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const JS_DATA = {
  level: {
    type: 'FreeResponse',
    id: 0,
  },
  responses: [{user_id: 0, text: 'student answer'}],
  reportingData: {
    curriculumUmbrella: 'curriculum',
    unitId: 0,
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

const renderDefault = (state = {}, jsData = {}) => {
  const store = createStore(
    combineReducers({
      isRtl,
      viewAs,
      teacherSections,
      progress,
    }),
    {...INITIAL_STATE, ...state}
  );

  return render(
    <Provider store={store}>
      <SummaryResponses scriptData={{...JS_DATA, ...jsData}} />
    </Provider>
  );
};

describe('SummaryResponses', () => {
  it('renders elements', () => {
    renderDefault();

    // Student responses
    screen.getByText('1/1 students answered');
    screen.getByText('student answer');
    // // Section selector, with one section.
    screen.getByRole('combobox');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('does not render response counter/text if no section selected', () => {
    renderDefault({
      teacherSections: {
        selectedStudents: [{id: 0}],
        selectedSectionId: null,
        sectionIds: [0],
        sections: [{id: 0, name: 'test section'}],
      },
    });

    expect(screen.queryByText('/')).toBeNull();
  });

  it('renders toggle when appropriate', () => {
    renderDefault(
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

    screen.getByText('Show answer');
  });

  it('does not render toggle for Free Response', () => {
    renderDefault(
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

    expect(screen.queryByText('Show answer')).toBeNull();
  });

  it('does not render toggle without policy permission', () => {
    renderDefault(
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

    expect(screen.queryByText('Show answer')).toBeNull();
  });
});
