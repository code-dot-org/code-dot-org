import {render, screen, fireEvent, act} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import * as utils from '@cdo/apps/code-studio/utils';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setAiRubricsDisabled,
} from '@cdo/apps/templates/currentUserRedux';
import {RowType} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

const fakeStudent = {
  id: 1,
  name: 'Clark Kent',
  username: 'clark_kent',
  sectionId: 101,
  hasEverSignedIn: true,
  dependsOnThisSectionForLogin: true,
  loginType: 'picture',
  rowType: RowType.STUDENT,
};
const fakeStudents = {
  [fakeStudent.id]: fakeStudent,
};
const fakeSection = {
  id: 101,
  location: '/v2/sections/101',
  name: 'My Section',
  login_type: 'picture',
  participant_type: 'student',
  grade: '2',
  code: 'PMTKVH',
  lesson_extras: false,
  pairing_allowed: true,
  sharing_disabled: false,
  script: null,
  course_id: 29,
  studentCount: 10,
  students: Object.values(fakeStudents),
  hidden: false,
};

describe('RubricSettings', () => {
  let fetchStub;
  let store;
  let refreshAiEvaluationsSpy;
  let sendEventSpy;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  function stubFetch(evalStatus = {}) {
    fetchStub = jest.spyOn(window, 'fetch').mockImplementation(url => {
      if (/rubrics\/\d+\/ai_evaluation_status_for_all.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(evalStatus)));
      }
      return Promise.resolve(new Response(JSON.stringify({})));
    });
  }

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch');
    stubFetch();
    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    refreshAiEvaluationsSpy = jest.fn();
    jest.spyOn(utils, 'queryParams').mockImplementation(arg => {
      if (arg === 'section_id') {
        return '1';
      }
    });
    stubRedux();
    registerReducers({teacherSections, currentUser});
    store = getStore();
    store.dispatch(setSections([fakeSection]));
    store.dispatch(selectSection(fakeSection.id));
  });

  afterEach(() => {
    jest.useRealTimers();
    restoreRedux();
    jest.restoreAllMocks();
  });

  const defaultRubric = {
    id: 1,
    learningGoals: [{id: 1, learningGoal: 'Key Concept'}],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  const ready = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 1,
    csrfToken: 'abcdef',
  };

  const noAttempts = {
    attemptedCount: 0,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
  };

  const noUnevaluated = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
  };

  const onePending = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 1,
    pendingCount: 1,
    csrfToken: 'abcdef',
  };

  const noEvals = [
    {
      user_name: 'Stilgar',
      user_id: 1,
      eval: [],
    },
    {
      user_name: 'Chani',
      user_id: 1,
      eval: [],
    },
  ];

  const evals = [
    {
      user_name: 'Stilgar',
      user_id: 1,
      eval: [
        {id: 1, learning_goal_id: 1, understanding: 1, feedback: 'feedback1'},
      ],
    },
    {
      user_name: 'Chani',
      user_id: 2,
      eval: [
        {id: 1, learning_goal_id: 1, understanding: 2, feedback: 'feedback1'},
      ],
    },
  ];

  const reportingData = {
    unitName: 'test-2023',
    courseName: 'course-2023',
    levelName: 'Test Blah Blah Blah',
  };

  it('displays Section selector', () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    // section selector is visible
    screen.getByText(fakeSection.name);
  });

  it('allows teacher to run AI assessment for all students when AI status is ready', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    await wait();

    const button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    expect(button).not.toBeDisabled();
  });

  it('disables run AI assessment for all button when no students have attempted', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={noAttempts}
        />
      </Provider>
    );
    const button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    expect(button).toBeDisabled();
  });

  it('disables run AI assessment for all button when all student work has been evaluated', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={noUnevaluated}
        />
      </Provider>
    );

    // Perform fetches and re-render
    await wait();

    const button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    expect(button).toBeDisabled();
  });

  it('shows pending status when eval is pending', async () => {
    // show ready state on initial load
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    // Perform fetches and re-render
    await wait();

    screen.getByText(i18n.aiEvaluationStatusAll_ready({unevaluatedCount: 1}));
    let button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    expect(button).not.toBeDisabled();

    // show pending state after clicking run

    stubFetch(onePending);

    fireEvent.click(button);

    screen.getByText(i18n.aiEvaluationStatus_pending());

    button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    expect(button).toBeDisabled();
  });

  it('runs AI assessment for all unevaluated projects when requested by teacher', async () => {
    jest.useFakeTimers();

    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
          setAiEvalStatusMap={jest.fn()}
        />
      </Provider>
    );

    // Perform fetches and re-renders
    await wait();

    // Next time it asks, we have no unevaluated as a status
    stubFetch(noUnevaluated);

    const button = screen.getByRole('button', {
      name: i18n.runAiAssessmentClass(),
    });
    fireEvent.click(button);

    //sends event on click
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_SECTION_AI_EVAL,
      {
        rubricId: defaultRubric.id,
        sectionId: 1,
      },
      'Both'
    );

    // Perform fetches and re-renders
    await wait();

    expect(
      screen.getByRole('button', {name: i18n.runAiAssessmentClass()})
    ).toBeDisabled();
    screen.getByText(i18n.aiEvaluationStatus_pending());

    // Advance clock 5 seconds
    jest.advanceTimersByTime(5000);

    // Perform fetches and re-renders
    await wait();

    expect(fetchStub).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('button', {name: i18n.runAiAssessmentClass()})
    ).toBeDisabled();
    screen.getByText(i18n.aiEvaluationStatus_success());
  });

  it('displays switch tab text and button when there are no evaluations', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={noEvals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );
    await wait();

    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();

    screen.getByText(i18n.rubricNoStudentEvals());
    screen.getByRole('button', {name: i18n.rubricTabStudent()});
  });

  it('displays generate CSV button when there are evaluations to export', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );
    await wait();

    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();

    screen.getByText(i18n.rubricNumberStudentEvals({teacherEvalCount: 2}));
    screen.getByRole('button', {name: i18n.downloadCSV()});
  });

  it('sends event when download CSV is clicked', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          reportingData={reportingData}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );
    await wait();

    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();

    screen.getByText(i18n.rubricNumberStudentEvals({teacherEvalCount: 2}));
    const button = screen.getByRole('button', {name: i18n.downloadCSV()});
    fireEvent.click(button);
    expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_CSV_DOWNLOADED, {
      unitName: 'test-2023',
      courseName: 'course-2023',
      levelName: 'Test Blah Blah Blah',
      sectionId: 1,
    });
  });

  it('displays the AI enable toggle', () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    expect(input.checked).toBe(true);
  });

  it('ensures the AI enable toggle represents the current value of the AI disabled user setting', () => {
    // Set the user's opt-out setting to true (our setting will now be false)
    store.dispatch(setAiRubricsDisabled(true));

    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    expect(input.checked).toBe(false);
  });

  it('updates the AI disabled user setting when the toggle is used', async () => {
    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
          allTeacherEvaluationData={evals}
          aiEvalStatusCounters={ready}
        />
      </Provider>
    );

    // Let's stub out setting the field via UserPreferences
    const setStub = jest.spyOn(
      UserPreferences.prototype,
      'setAiRubricsDisabled'
    );

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    fireEvent.click(input);
    fireEvent.change(input);

    expect(input.checked).toBe(false);
    expect(setStub).toHaveBeenCalledWith(true);
  });
});
