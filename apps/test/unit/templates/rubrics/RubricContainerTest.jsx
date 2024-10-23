// react testing library import
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import teacherPanel, {
  setLevelsWithProgress,
} from '@cdo/apps/code-studio/teacherPanelRedux';
import * as utils from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {STEPS} from '@cdo/apps/templates/rubrics/productTourHelpers';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';
import teacherSections, {
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  RubricAiEvaluationLimits,
  RubricAiEvaluationStatus,
  LevelStatus,
} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({
    json: jest.fn().mockReturnValue({}),
  }),
}));

fetch.mockIf(/\/rubrics\/.*/, JSON.stringify(''));

const studentAlice = {id: 11, name: 'Alice'};
const sectionId = 999;
const levelNotTried = {
  id: '123',
  assessment: null,
  contained: false,
  paired: false,
  partnerNames: null,
  partnerCount: null,
  isConceptLevel: false,
  levelNumber: 4,
  passed: false,
  status: LevelStatus.not_tried,
};
const levelSubmitted = {
  ...levelNotTried,
  status: LevelStatus.submitted,
};

describe('RubricContainer', () => {
  let store;
  let fetchStub;
  let sendEventSpy;
  let students, levelsWithProgress;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  function stubFetch({
    evalStatusForUser = {},
    evalStatusForAll = {},
    aiEvals = [],
    teacherEvals = [],
    tourStatus = {},
    updateTourStatus = {},
  }) {
    fetchStub.mockImplementation(url => {
      // Stubs out getting the AI status for a particular user
      if (/rubrics\/\d+\/ai_evaluation_status_for_user.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(evalStatusForUser)));
      }

      // Stubs out getting the overall AI status, which is part of RubricSettings but
      // useful to track alongside the user status, here
      if (/rubrics\/\d+\/ai_evaluation_status_for_all.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(evalStatusForAll)));
      }

      // This stubs out polling the AI evaluation list which can be provided by 'data'
      if (/rubrics\/\d+\/get_ai_evaluations.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(aiEvals)));
      }

      if (/rubrics\/\d+\/get_teacher_evaluations_for_all.*/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(teacherEvals)));
      }

      if (/rubrics\/\w+\/get_ai_rubrics_tour_seen/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(tourStatus)));
      }

      if (/rubrics\/\w+\/update_ai_rubrics_tour_seen/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify(updateTourStatus)));
      }

      if (/rubrics\/\d+\/run_ai_evaluations_for_user$/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify({})));
      }
    });
  }

  beforeEach(() => {
    jest.spyOn($, 'ajax').mockImplementation(() => {
      const request = {
        getResponseHeader: jest.fn().mockReturnValue('some-crsf-token'),
      };
      return {
        done: cb => cb([], null, request),
      };
    });
    fetchStub = jest
      .spyOn(window, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({}), {status: 200, statusText: 'OK'})
      );

    sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    jest.spyOn(utils, 'queryParams').mockReturnValue('1');
    stubRedux();
    registerReducers({teacherSections, teacherPanel, currentUser});
    store = getStore();

    // set default values to be dispatched via redux
    students = [studentAlice];
    levelsWithProgress = [{...levelNotTried, userId: studentAlice.id}];
  });

  afterEach(() => {
    jest.useRealTimers();
    restoreRedux();
    jest.restoreAllMocks();
  });

  const notAttemptedJson = {
    status: null,
    attempted: false,
    lastAttemptEvaluated: false,
    csrfToken: 'abcdef',
  };

  const notAttemptedJsonAll = {
    attemptedCount: 0,
    attemptedUnevaluatedCount: 1,
    csrfToken: 'abcdef',
    aiEvalStatusMap: {
      11: 'NOT_STARTED',
    },
  };

  const readyJson = {
    status: null,
    attempted: true,
    lastAttemptEvaluated: false,
    csrfToken: 'abcdef',
  };

  const readyJsonAll = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 1,
    csrfToken: 'abcdef',
    aiEvalStatusMap: {
      11: 'IN_PROGRESS',
    },
  };

  const pendingJson = {
    attempted: true,
    lastAttemptEvaluated: false,
    csrfToken: 'abcdef',
    status: RubricAiEvaluationStatus.QUEUED,
  };

  const runningJson = {
    attempted: true,
    lastAttemptEvaluated: false,
    csrfToken: 'abcdef',
    status: RubricAiEvaluationStatus.RUNNING,
  };

  const successJson = {
    attempted: true,
    lastAttemptEvaluated: true,
    csrfToken: 'abcdef',
    status: RubricAiEvaluationStatus.SUCCESS,
  };

  const successJsonAll = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
    aiEvalStatusMap: {
      11: 'READY_TO_REVIEW',
    },
  };

  const defaultRubric = {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [{understanding: 1, id: 1, teacherDescription: 'test'}],
      },
      {
        id: 2,
        key: '2',
        learningGoal: 'goal 2',
        aiEnabled: true,
        evidenceLevels: [{understanding: 1, id: 2, teacherDescription: 'test'}],
      },
    ],
    script: {
      id: 42,
    },
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      id: 107,
      name: 'test_level',
      position: 7,
    },
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

  const oneEval = [
    {
      user_name: studentAlice.name,
      user_id: studentAlice.id,
      eval: [
        {
          feedback: '',
          id: studentAlice.id,
          learning_goal_id: 1587,
          understanding: 0,
        },
      ],
    },
  ];

  const defaultStudentInfo = {user_id: 11, name: 'Alice'};

  const mockAiEvaluations = [
    {id: 2, learning_goal_id: 2, understanding: 0, aiConfidencePassFail: 2},
  ];

  it('switches components when tabs are clicked', async () => {
    stubFetch({
      evalStatusForUser: successJson,
      evalStatusForAll: successJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    const {container} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={{}}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    // Use classnames to find elements and check their visibility even though it
    // is an anti-pattern. Ideally we would find an accessible element in each
    // pane and use toBeVisible() on it to check visibility. However, that
    // approach is difficult because jest-dom can't see the styles in our
    // CSS modules which control element visibility.

    let settings = container.querySelector('.uitest-rubric-settings');
    let content = container.querySelector('#uitest-rubric-content');

    expect(content).toHaveClass('visibleRubricContent');
    expect(settings).toHaveClass('settingsHidden');

    fireEvent.click(screen.getByText(i18n.rubricTabClassManagement()));

    expect(content).toHaveClass('hiddenRubricContent');
    expect(settings).toHaveClass('settingsVisible');

    fireEvent.click(
      screen.getAllByRole('button', {name: i18n.rubricTabStudent()})[0]
    );

    expect(content).toHaveClass('visibleRubricContent');
    expect(settings).toHaveClass('settingsHidden');
  });

  it('shows a a button for running analysis if canProvideFeedback is true', async () => {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: [],
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );
    screen.getByRole('button', {name: i18n.runAiAssessment()});
  });

  it('does not show a button for running analysis if AI is not enabled for level', async () => {
    stubFetch({
      evalStatusForUser: {},
      evalStatusForAll: {},
      aiEvals: {},
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    const {queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={false}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );
    await wait();
    expect(queryByText(i18n.runAiAssessment())).not.toBeInTheDocument();
  });

  it('shows status text when student has not attempted level', async () => {
    stubFetch({
      evalStatusForUser: notAttemptedJson,
      evalStatusForAll: notAttemptedJsonAll,
      aiEvals: [],
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_not_attempted());
    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).toBeDisabled();

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.notStarted());
  });

  it('shows status text when level has already been evaluated', async () => {
    stubFetch({
      evalStatusForUser: successJson,
      evalStatusForAll: successJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_already_evaluated());
    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).toBeDisabled();

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.readyToReview());
  });

  it('allows teacher to run analysis when level has not been evaluated', async () => {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: [],
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).not.toBeDisabled();

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.inProgress());
  });

  it('handles running ai assessment', async () => {
    /* This is a fairly complex test that has multiple steps
      1. Initial fetch returns a json object that puts AI Status into READY state
      2. User clicks button to run analysis
      3. Fetch returns a json object with puts AI Status into EVALUATION_PENDING state
      4. Move clock forward 5 seconds
      5. Fetch returns a json object with puts AI Status into EVALUATION_RUNNING state
      6. Move clock forward 5 seconds
      7. Fetch returns a json object with puts AI Status into SUCCESS state
      8. Calls refreshAiEvaluations
    */
    jest.useFakeTimers();
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: [],
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Wait for fetches
    await wait();

    // 1. Initial fetch returns a json object that puts AI Status into READY state
    let button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).not.toBeDisabled();

    let dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.inProgress());

    // 2. User clicks button to run analysis

    // Stub out running the assessment and have it return pending status when asked next
    stubFetch({evalStatusForUser: pendingJson, tourStatus: {seen: true}});

    fireEvent.click(button);

    //expect amplitude event on click
    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_INDIVIDUAL_AI_EVAL,
      {
        rubricId: defaultRubric.id,
        studentId: defaultStudentInfo.user_id,
      },
      'Both'
    );

    // Wait for fetches and re-render
    jest.advanceTimersByTime(5000);
    await wait();

    // 3. Fetch returns a json object with puts AI Status into EVALUATION_PENDING state
    expect(fetchStub).toHaveBeenCalledWith(
      expect.stringMatching(/rubrics\/\d+\/run_ai_evaluations_for_user.*/),
      expect.objectContaining({
        method: 'POST',
        body: '{"user_id":11}',
      })
    );
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).toBeDisabled();
    screen.getByText(i18n.aiEvaluationStatus_pending());

    stubFetch({evalStatusForUser: runningJson, tourStatus: {seen: true}});

    // 4. Move clock forward 5 seconds and re-render
    jest.advanceTimersByTime(5000);
    await wait();

    // 5. Fetch returns a json object with puts AI Status into EVALUATION_RUNNING state
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).toBeDisabled();
    screen.getByText(i18n.aiEvaluationStatus_in_progress());

    stubFetch({
      evalStatusForUser: successJson,
      aiEvals: mockAiEvaluations,
      tourStatus: {seen: true},
    });

    // 6. Move clock forward 5 seconds and re-render
    jest.advanceTimersByTime(5000);
    await wait();

    // 7. Fetch returns a json object with puts AI Status into SUCCESS state
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    expect(button).toBeDisabled();
    screen.getByText(i18n.aiEvaluationStatus_success());

    dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.readyToReview());
  });

  it('renders submitted status blob for unevaluated submission', async () => {
    const statusAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
      aiEvalStatusMap: {
        [studentAlice.id]: 'IN_PROGRESS',
      },
    };

    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: statusAll,
      aiEvals: [],
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    // the level has been submitted by Alice
    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    levelsWithProgress = [{...levelSubmitted, userId: studentAlice.id}];
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Wait for fetches
    await wait();

    // Verify status bubble for selected student
    let dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.submitted());
  });

  it('renders evaluated status blob when teacher has given feedback', async () => {
    const statusAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
      aiEvalStatusMap: {
        [studentAlice.id]: 'READY_TO_REVIEW',
      },
    };

    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: statusAll,
      aiEvals: [],
      teacherEvals: oneEval,
      tourStatus: {seen: true},
    });

    // the level has been submitted by Alice
    store.dispatch(setStudentsForCurrentSection(sectionId, students));
    store.dispatch(setLevelsWithProgress(levelsWithProgress));

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Wait for fetches
    await wait();

    // Verify status bubble for selected student
    let dropdownOption = screen.getByText(studentAlice.name).closest('div');
    expect(dropdownOption.textContent).toContain(i18n.evaluated());
  });

  it('shows general error message for status 1000', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1000,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_error());
    expect(
      screen.getByRole('button', {
        name: i18n.runAiAssessment(),
      })
    ).not.toBeDisabled();
  });

  it('shows PII error message for status 1001', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1001,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_pii_error());
    expect(
      screen.getByRole('button', {
        name: i18n.runAiAssessment(),
      })
    ).toBeDisabled();
  });

  it('shows profanity error message for status 1002', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1002,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          sectionId={42}
          reportingData={{}}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_profanity_error());
    expect(
      screen.getByRole('button', {name: i18n.runAiAssessment()})
    ).toBeDisabled();
  });

  it('shows request too large error message for status 1003', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1003,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(i18n.aiEvaluationStatus_request_too_large());
    expect(
      screen.getByRole('button', {name: i18n.runAiAssessment()})
    ).toBeDisabled();
  });

  it('shows ready state on initial load for status 1004', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1004,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    expect(screen.queryByTestId('info-alert')).not.toBeInTheDocument();
    const button = screen.getByRole('button', {
      name: 'Run AI Assessment for Project',
    });
    expect(button).not.toBeDisabled();
  });

  it('shows error on initial load for status 1005', async () => {
    const returnedJson = {
      attempted: true,
      lastAttemptEvaluated: false,
      status: 1005,
    };
    const returnedJsonAll = {
      attemptedCount: 1,
      attemptedUnevaluatedCount: 0,
      csrfToken: 'abcdef',
    };

    stubFetch({
      evalStatusForUser: returnedJson,
      evalStatusForAll: returnedJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          sectionId={42}
          open
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    screen.getByText(
      i18n.aiEvaluationStatus_teacher_limit_exceeded({
        limit: RubricAiEvaluationLimits.TEACHER_LIMIT,
      })
    );
    const button = screen.getByRole('button', {
      name: 'Run AI Assessment for Project',
    });
    expect(button).toBeDisabled();
  });

  // react testing library
  it('moves rubric container when user clicks and drags component', async () => {
    stubFetch({
      evalStatusForUser: successJson,
      evalStatusForAll: successJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
    });

    const {getByTestId} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await wait();

    const handle_element = getByTestId('ai-rubric-handle-test-id');
    const element = getByTestId('draggable-test-id');

    const initialPosition = element.style.transform;

    // simulate dragging
    fireEvent.mouseDown(handle_element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(handle_element, {clientX: 100, clientY: 100});
    fireEvent.mouseUp(handle_element);

    const newPosition = element.style.transform;

    expect(newPosition).not.toEqual(initialPosition);
  });

  it('sends event when window is dragged', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    const {getByTestId} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await wait();

    const element = getByTestId('ai-rubric-handle-test-id');

    // simulate dragging
    fireEvent.mouseDown(element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(element, {clientX: 100, clientY: 100});

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_WINDOW_MOVE_START,
      {window_x_start: 0, window_y_start: 0}
    );

    fireEvent.mouseUp(element);

    expect(sendEventSpy).toHaveBeenCalledWith(
      EVENTS.TA_RUBRIC_WINDOW_MOVE_END,
      {window_x_end: 0, window_y_end: 0}
    );
  });

  it('renders a "Submit to student" button if student data for an evaluation level', () => {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={{name: 'Grace Hopper'}}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    expect(screen.getByText(i18n.submitToStudent())).toBeInTheDocument();
  });

  it('does not render a "Submit to student" button if no student data', () => {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          canProvideFeedback
          open
        />
      </Provider>
    );
    expect(screen.queryByText(i18n.submitToStudent())).not.toBeInTheDocument();
  });

  it('does not render a "Submit to student" button if not on an evaluated level even if student data exists', () => {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={{name: 'Grace Hopper'}}
          teacherHasEnabledAi={true}
          currentLevelName={'different_level'}
          reportingData={{}}
          canProvideFeedback
          open
        />
      </Provider>
    );
    expect(screen.queryByText(i18n.submitToStudent())).not.toBeInTheDocument();
  });

  it('displays product tour when getTourStatus is false', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await waitFor(() =>
      expect(
        queryByText('Getting Started with Your AI Teaching Assistant')
      ).toBeInTheDocument()
    );
  });

  it('does not display product tour when getTourStatus returns true', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: true},
    });

    const {queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await wait();
    expect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).not.toBeInTheDocument();
  });

  it('does not display product tour when on non-assessment level', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'non-assessment-level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await wait();
    expect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).not.toBeInTheDocument();
  });

  it('does not display product tour when on non-AI level', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={false}
          currentLevelName={'test-level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await wait();
    expect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).not.toBeInTheDocument();
  });

  it('sends event when tour is started for the first time', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_TOUR_STARTED,
        {}
      )
    );
  });

  it('sends event when user clicks next and back buttons', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {findByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    const tourFabBg = document.getElementById('tour-fab-bg');
    tourFabBg.scrollBy = jest.fn();

    const nextButton = await findByText('Next Tip');

    fireEvent.click(nextButton);

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_TOUR_NEXT, {
        step: 0,
        nextStep: 1,
      })
    );

    const backButton = await findByText('Back');

    fireEvent.click(backButton);

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_TOUR_BACK, {
        step: 1,
        nextStep: 0,
      })
    );
  });

  it('sends event when user exits the tour', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {findByRole} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    const skipButton = await findByRole(
      'button',
      {name: '×'},
      {timeout: 10_000} // wait for introjs to load
    );

    fireEvent.click(skipButton);

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_TOUR_CLOSED, {
        step: 0,
      })
    );
  });

  it('sends event when user completes the tour', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: null},
    });

    const {findByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );
    const tourFabBg = document.getElementById('tour-fab-bg');
    tourFabBg.scrollBy = jest.fn();
    const nextButton = await findByText('Next Tip');

    fireEvent.click(nextButton);
    await findByText('Class Data');
    fireEvent.click(nextButton);
    await findByText('Understanding the AI Assessment');
    fireEvent.click(nextButton);
    await findByText('Using Evidence');
    fireEvent.click(nextButton);
    await findByText('Understanding AI Confidence');
    fireEvent.click(nextButton);
    await findByText('Assigning a Rubric Score');
    fireEvent.click(nextButton);
    const doneButton = await findByText('Done');
    fireEvent.click(doneButton);

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_TOUR_COMPLETE,
        {}
      )
    );
  });

  it('sends event when tour is restarted from ? button', async function () {
    stubFetch({
      evalStatusForUser: readyJson,
      evalStatusForAll: readyJsonAll,
      aiEvals: mockAiEvaluations,
      teacherEvals: noEvals,
      tourStatus: {seen: true},
      updateTourStatus: {seen: false},
    });

    const {findByRole, queryByText} = render(
      <Provider store={store}>
        <RubricContainer
          rubric={defaultRubric}
          studentLevelInfo={defaultStudentInfo}
          teacherHasEnabledAi={true}
          currentLevelName={'test_level'}
          reportingData={{}}
          open
        />
      </Provider>
    );

    const tourFabBg = document.getElementById('tour-fab-bg');
    tourFabBg.scrollBy = jest.fn();
    await wait();

    expect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).not.toBeInTheDocument();

    const element = await findByRole('button', {name: 'restart product tour'});
    fireEvent.click(element);

    await waitFor(() =>
      expect(sendEventSpy).toHaveBeenCalledWith(
        EVENTS.TA_RUBRIC_TOUR_RESTARTED,
        {}
      )
    );
  });

  it('sanitizes all intro text rendered by introjs', () => {
    STEPS.forEach((step, index) => {
      expect(typeof step.intro).toEqual(
        'object',
        `STEP[${index}].intro should be wrapped in a react component or a call to sanitize(): ${step.intro}`
      );
    });
  });
});
