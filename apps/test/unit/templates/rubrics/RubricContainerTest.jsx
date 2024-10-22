// react testing library import
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

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

import {expect as deprecatedExpect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
  let clock;
  let store;
  let fetchStub;
  let ajaxStub;
  let sendEventSpy;
  let students, levelsWithProgress;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  // Stubs out getting the AI status for a particular user
  function stubFetchEvalStatusForUser(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/ai_evaluation_status_for_user.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  // Stubs out getting the overall AI status, which is part of RubricSettings but
  // useful to track alongside the user status, here
  function stubFetchEvalStatusForAll(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/ai_evaluation_status_for_all.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  // This stubs out polling the AI evaluation list which can be provided by 'data'
  function stubFetchAiEvaluations(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/get_ai_evaluations.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  function stubFetchTeacherEvaluations(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/get_teacher_evaluations_for_all.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  function stubFetchTourStatus(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\w+\/get_ai_rubrics_tour_seen/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  function stubUpdateTourStatus(data) {
    return fetchStub
      .withArgs(sinon.match(/rubrics\/\w+\/update_ai_rubrics_tour_seen/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  beforeEach(() => {
    ajaxStub = sinon.stub($, 'ajax');
    const request = sinon.stub();
    request.getResponseHeader = sinon.stub().returns('some-crsf-token');
    ajaxStub.returns({
      done: cb => {
        cb([], null, request);
      },
    });
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.returns(
      Promise.resolve(
        new Response(JSON.stringify({}), {status: 200, statusText: 'OK'})
      )
    );
    sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');
    sinon.stub(utils, 'queryParams').withArgs('section_id').returns('1');
    stubRedux();
    registerReducers({teacherSections, teacherPanel, currentUser});
    store = getStore();

    // set default values to be dispatched via redux
    students = [studentAlice];
    levelsWithProgress = [{...levelNotTried, userId: studentAlice.id}];
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
    restoreRedux();
    utils.queryParams.restore();
    fetchStub.restore();
    ajaxStub.restore();
    sendEventSpy.restore();
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
    stubFetchEvalStatusForUser(successJson);
    stubFetchEvalStatusForAll(successJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);

    const wrapper = mount(
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
    await wait();
    wrapper.update();
    deprecatedExpect(wrapper.find('RubricContent').props().visible).to.be.true;
    deprecatedExpect(wrapper.find('RubricSettings').props().visible).to.be
      .false;
    wrapper.find('SegmentedButton').at(1).simulate('click');
    deprecatedExpect(wrapper.find('RubricContent').props().visible).to.be.false;
    deprecatedExpect(wrapper.find('RubricSettings').props().visible).to.be.true;
    wrapper.find('SegmentedButton').at(0).simulate('click');
    deprecatedExpect(wrapper.find('RubricContent').props().visible).to.be.true;
    deprecatedExpect(wrapper.find('RubricSettings').props().visible).to.be
      .false;
  });

  it('shows a a button for running analysis if canProvideFeedback is true', async () => {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations([]);

    const wrapper = mount(
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
    wrapper.update();
    deprecatedExpect(wrapper.find('Button')).to.have.lengthOf(4);
    deprecatedExpect(wrapper.find('Button').first().props().text).to.equal(
      i18n.runAiAssessment()
    );
  });

  it('does not show a button for running analysis if AI is not enabled for level', async () => {
    stubFetchEvalStatusForUser({});
    stubFetchEvalStatusForAll({});
    stubFetchAiEvaluations({});
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: true});

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
    deprecatedExpect(queryByText(i18n.runAiAssessment())).to.not.exist;
  });

  it('shows status text when student has not attempted level', async () => {
    const userFetchStub = stubFetchEvalStatusForUser(notAttemptedJson);
    const allFetchStub = stubFetchEvalStatusForAll(notAttemptedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations([]);
    stubFetchTourStatus({seen: true});

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

    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    screen.getByText(i18n.aiEvaluationStatus_not_attempted());
    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.be.disabled;

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    deprecatedExpect(dropdownOption.textContent).to.contain(i18n.notStarted());
  });

  it('shows status text when level has already been evaluated', async () => {
    const userFetchStub = stubFetchEvalStatusForUser(successJson);
    const allFetchStub = stubFetchEvalStatusForAll(successJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTourStatus({seen: true});

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

    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    screen.getByText(i18n.aiEvaluationStatus_already_evaluated());
    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.be.disabled;

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    deprecatedExpect(dropdownOption.textContent).to.contain(
      i18n.readyToReview()
    );
  });

  it('allows teacher to run analysis when level has not been evaluated', async () => {
    const userFetchStub = stubFetchEvalStatusForUser(readyJson);
    const allFetchStub = stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations([]);
    stubFetchTourStatus({seen: true});

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

    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    const button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.not.be.disabled;

    // Verify status bubble in student selector
    const dropdownOption = screen.getByText(studentAlice.name).closest('div');
    deprecatedExpect(dropdownOption.textContent).to.contain(i18n.inProgress());
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
    clock = sinon.useFakeTimers();
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations([]);
    stubFetchTourStatus({seen: true});

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
    deprecatedExpect(button).to.not.be.disabled;

    let dropdownOption = screen.getByText(studentAlice.name).closest('div');
    deprecatedExpect(dropdownOption.textContent).to.contain(i18n.inProgress());

    // 2. User clicks button to run analysis

    // Stub out running the assessment and have it return pending status when asked next
    const stubRunAiEvaluationsForUser = fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/run_ai_evaluations_for_user$/))
      .returns(Promise.resolve(new Response(JSON.stringify({}))));
    stubFetchEvalStatusForUser(pendingJson);
    fireEvent.click(button);

    //deprecatedExpect amplitude event on click
    deprecatedExpect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_INDIVIDUAL_AI_EVAL,
      {
        rubricId: defaultRubric.id,
        studentId: defaultStudentInfo.user_id,
      }
    );

    // Wait for fetches and re-render
    clock.tick(5000);
    await wait();

    // 3. Fetch returns a json object with puts AI Status into EVALUATION_PENDING state
    deprecatedExpect(stubRunAiEvaluationsForUser).to.have.been.called;
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.be.disabled;
    screen.getByText(i18n.aiEvaluationStatus_pending());

    stubFetchEvalStatusForUser(runningJson);

    // 4. Move clock forward 5 seconds and re-render
    clock.tick(5000);
    await wait();

    // 5. Fetch returns a json object with puts AI Status into EVALUATION_RUNNING state
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.be.disabled;
    screen.getByText(i18n.aiEvaluationStatus_in_progress());

    stubFetchEvalStatusForUser(successJson);
    stubFetchAiEvaluations(mockAiEvaluations);

    // 6. Move clock forward 5 seconds and re-render
    clock.tick(5000);
    await wait();

    // 7. Fetch returns a json object with puts AI Status into SUCCESS state
    button = screen.getByRole('button', {name: i18n.runAiAssessment()});
    deprecatedExpect(button).to.be.disabled;
    screen.getByText(i18n.aiEvaluationStatus_success());

    dropdownOption = screen.getByText(studentAlice.name).closest('div');
    deprecatedExpect(dropdownOption.textContent).to.contain(
      i18n.readyToReview()
    );
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

    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(statusAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations([]);
    stubFetchTourStatus({seen: true});

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
    deprecatedExpect(dropdownOption.textContent).to.contain(i18n.submitted());
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

    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(statusAll);
    stubFetchTeacherEvaluations(oneEval);
    stubFetchAiEvaluations([]);
    stubFetchTourStatus({seen: true});

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
    deprecatedExpect(dropdownOption.textContent).to.contain(i18n.evaluated());
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

    const wrapper = mount(
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

    wrapper.update();
    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    deprecatedExpect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_error()
    );
    deprecatedExpect(wrapper.find('Button').at(0).props().disabled).to.be.false;
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

    const wrapper = mount(
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

    wrapper.update();
    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    deprecatedExpect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_pii_error()
    );
    deprecatedExpect(wrapper.find('Button').at(0).props().disabled).to.be.true;
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

    const wrapper = mount(
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

    wrapper.update();
    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    deprecatedExpect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_profanity_error()
    );
    deprecatedExpect(wrapper.find('Button').at(0).props().disabled).to.be.true;
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

    const wrapper = mount(
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

    wrapper.update();
    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    deprecatedExpect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_request_too_large()
    );
    deprecatedExpect(wrapper.find('Button').at(0).props().disabled).to.be.true;
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

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

    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    deprecatedExpect(screen.queryByTestId('info-alert')).not.to.exist;
    const button = screen.getByRole('button', {
      name: 'Run AI Assessment for Project',
    });
    deprecatedExpect(button).not.to.be.disabled;
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

    const userFetchStub = stubFetchEvalStatusForUser(returnedJson);
    const allFetchStub = stubFetchEvalStatusForAll(returnedJsonAll);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchAiEvaluations(mockAiEvaluations);

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

    deprecatedExpect(userFetchStub).to.have.been.called;
    deprecatedExpect(allFetchStub).to.have.been.called;
    screen.getByText(
      i18n.aiEvaluationStatus_teacher_limit_exceeded({
        limit: RubricAiEvaluationLimits.TEACHER_LIMIT,
      })
    );
    const button = screen.getByRole('button', {
      name: 'Run AI Assessment for Project',
    });
    deprecatedExpect(button).to.be.disabled;
  });

  // react testing library
  it('moves rubric container when user clicks and drags component', async () => {
    stubFetchEvalStatusForUser(successJson);
    stubFetchEvalStatusForAll(successJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);

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

    deprecatedExpect(newPosition).to.not.equal(initialPosition);
  });

  it('sends event when window is dragged', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: true});

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

    deprecatedExpect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_WINDOW_MOVE_START,
      {window_x_start: 0, window_y_start: 0}
    );

    fireEvent.mouseUp(element);

    deprecatedExpect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_WINDOW_MOVE_END,
      {window_x_end: 0, window_y_end: 0}
    );
  });

  it('renders a RubricSubmitFooter if student data for an evaluation level', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{name: 'Grace Hopper'}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    deprecatedExpect(wrapper.find('RubricSubmitFooter')).to.have.lengthOf(0);
  });

  it('does not render a RubricSubmitFooter if no student data', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        canProvideFeedback
        open
      />
    );
    deprecatedExpect(wrapper.find('RubricSubmitFooter')).to.have.lengthOf(0);
  });

  it('does not render a RubricSubmitFooter if not on an evaluated level even if student data exists', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{name: 'Grace Hopper'}}
        teacherHasEnabledAi={true}
        currentLevelName={'different_level'}
        reportingData={{}}
        canProvideFeedback
        open
      />
    );
    deprecatedExpect(wrapper.find('RubricSubmitFooter')).to.have.lengthOf(0);
  });

  it('displays product tour when getTourStatus is false', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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

    await waitFor(
      () =>
        deprecatedExpect(
          queryByText('Getting Started with Your AI Teaching Assistant')
        ).to.exist
    );
  });

  it('does not display product tour when getTourStatus returns true', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: true});

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
    deprecatedExpect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).to.not.exist;
  });

  it('does not display product tour when on non-assessment level', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
    deprecatedExpect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).to.not.exist;
  });

  it('does not display product tour when on non-AI level', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
    deprecatedExpect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).to.not.exist;
  });

  it('sends event when tour is started for the first time', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_STARTED,
        {}
      )
    );
  });

  it('sends event when user clicks next and back buttons', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_NEXT,
        {
          step: 0,
          nextStep: 1,
        }
      )
    );

    const backButton = await findByText('Back');

    fireEvent.click(backButton);

    await waitFor(() =>
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_BACK,
        {
          step: 1,
          nextStep: 0,
        }
      )
    );
  });

  it('sends event when user exits the tour', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_CLOSED,
        {
          step: 0,
        }
      )
    );
  });

  it('sends event when user completes the tour', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: null});

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
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_COMPLETE,
        {}
      )
    );
  });

  it('sends event when tour is restarted from ? button', async function () {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);
    stubFetchTeacherEvaluations(noEvals);
    stubFetchTourStatus({seen: true});
    stubUpdateTourStatus({seen: false});

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

    deprecatedExpect(
      queryByText('Getting Started with Your AI Teaching Assistant')
    ).to.not.exist;

    const element = await findByRole('button', {name: 'restart product tour'});
    fireEvent.click(element);

    await waitFor(() =>
      deprecatedExpect(sendEventSpy).to.have.been.calledWith(
        EVENTS.TA_RUBRIC_TOUR_RESTARTED,
        {}
      )
    );
  });

  it('sanitizes all intro text rendered by introjs', () => {
    STEPS.forEach((step, index) => {
      deprecatedExpect(typeof step.intro).to.equal(
        'object',
        `STEP[${index}].intro should be wrapped in a react component or a call to sanitize(): ${step.intro}`
      );
    });
  });
});
