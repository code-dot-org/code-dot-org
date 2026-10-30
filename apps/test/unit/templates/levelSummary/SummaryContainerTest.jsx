import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progress from '@cdo/apps/code-studio/progressRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import SummaryContainer from '@cdo/apps/templates/levelSummary/SummaryContainer';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

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
  currentUser: {
    userRoleInCourse: 'Instructor',
  },
};

const JS_DATA_MULTI_LEVEL = {
  levels: [
    {
      properties: {
        questions: [{text: 'What is 2 + 2?'}],
        answers: [{text: 'A. 3'}, {text: 'B. 4'}, {text: 'C. 5'}],
      },
      height: 100,
      type: 'Multi',
      id: 1,
      name: 'Multiple Choice Question',
    },
    {
      properties: {
        questions: [{text: 'What is 3 + 2?'}],
        answers: [{text: 'A. 3'}, {text: 'B. 4'}, {text: 'C. 5'}],
      },
      height: 100,
      type: 'Multi',
      id: 2,
      name: 'Multiple Choice Question',
    },
  ],
  level_id: 1,
  in_level_group: false,
  last_attempt: 'B. 4',
  left_align: false,
  responses: [
    [
      {
        user_id: 1,
        text: 'B. 4',
        student_display_name: 'Student Name',
        student_family_name: 'Name',
      },
    ],
  ],
  answer_is_visible: true,
  teacher_markdown: 'The correct answer is B.',
  reportingData: {
    lessonName: 'Math Lesson',
    lessonId: 1,
    unitName: 'Math Unit',
    unitId: 1,
    curriculumUmbrella: 'Mathematics',
  },
};

const JS_DATA_FREE_RESPONSE = {
  levels: [
    {
      properties: {
        long_instructions: 'Please explain the process of photosynthesis.',
      },
      height: 80,
      type: 'FreeResponse',
      id: 2,
      name: 'Photosynthesis Explanation',
    },
  ],
  level_id: 2,
  in_level_group: false,
  last_attempt: 'Photosynthesis is the process by which green plants...',
  left_align: false,
  responses: [
    [
      {
        user_id: 2,
        text: 'Photosynthesis is the process by which green plants...',
        student_display_name: 'John Doe',
        student_family_name: 'Doe',
      },
    ],
  ],
  answer_is_visible: false,
  teacher_markdown: 'Example: Plants use sunlight to make food...',
  reportingData: {
    lessonName: 'Biology Lesson',
    lessonId: 2,
    unitName: 'Biology Unit',
    unitId: 2,
    curriculumUmbrella: 'Science',
  },
};

const renderDefault = (state = {}, jsData = {}, isLevelGroup = false) => {
  const store = createStore(
    combineReducers({
      isRtl,
      viewAs,
      teacherSections,
      progress,
      currentUser,
    }),
    {...INITIAL_STATE, ...state}
  );

  return render(
    <Provider store={store}>
      <SummaryContainer
        store={store}
        scriptData={{...jsData}}
        isLevelGroup={isLevelGroup}
      />
    </Provider>
  );
};

describe('SummaryContainer', () => {
  it('renders child components without crashing', () => {
    renderDefault({}, JS_DATA_MULTI_LEVEL, true);

    // Check that the SubLevelDropdown is displayed
    screen.getByText(i18n.question() + ': 1');

    // Check that the QuestionRenderer is displayed
    screen.getByText('What is 2 + 2?');

    // Check that the SummaryResponses is displayed
    screen.getByText(i18n.studentResponses());

    // Check that the SummaryTeacherInstructions is displayed
    screen.getByText(i18n.forTeachersOnly());
  });

  it('renders a Multi Level question with answers', () => {
    renderDefault({}, JS_DATA_MULTI_LEVEL);

    // Check that the question is displayed
    screen.getByText('What is 2 + 2?');

    // Check that each answer is displayed
    screen.getByText('A. 3');
    screen.getByText('B. 4');
    screen.getByText('C. 5');
  });

  it('renders a Free Response question with long instructions', () => {
    renderDefault({}, JS_DATA_FREE_RESPONSE);

    // Check that the long instructions are displayed
    screen.getByText('Please explain the process of photosynthesis.');
  });

  it('updates subLevelNum when changing the option on the dropdown', () => {
    renderDefault({}, JS_DATA_MULTI_LEVEL, true);

    // Check initial subLevelNum
    expect(screen.getByText(i18n.question() + ': 1')).toBeInTheDocument();

    // Simulate changing the dropdown option
    fireEvent.change(screen.getByText(i18n.question() + ': 1'), {
      target: {value: '1'},
    });

    // Check updated subLevelNum
    expect(screen.getByText(i18n.question() + ': 2')).toBeInTheDocument();
  });
});
