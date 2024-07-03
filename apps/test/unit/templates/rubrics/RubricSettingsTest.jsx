import {screen} from '@testing-library/dom';
import {render, fireEvent, act} from '@testing-library/react';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import * as utils from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setAiRubricsDisabled,
} from '@cdo/apps/templates/currentUserRedux';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';



describe('RubricSettings', () => {
  let fetchStub;
  let store;
  let refreshAiEvaluationsSpy;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  function stubFetchEvalStatusForAll(data) {
    fetchStub.mockImplementation((...args) => {
      if (args[0] === expect.objectContaining(/rubrics\/\d+\/ai_evaluation_status_for_all.*/)) {
        return Promise.resolve(new Response(JSON.stringify(data)));
      }
    });
  }

  function stubFetchTeacherEvaluations(data) {
    return fetchStub.mockImplementation((...args) => {
      if (args[0] === expect.objectContaining(/rubrics\/\d+\/get_teacher_evaluations_for_all.*/)) {
        return Promise.resolve(new Response(JSON.stringify(data)));
      }
    });
  }

  beforeEach(() => {
    fetchStub = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
    fetchStub.mockReturnValue(Promise.resolve(new Response(JSON.stringify(''))));
    refreshAiEvaluationsSpy = jest.fn();
    jest.spyOn(utils, 'queryParams').mockClear().mockImplementation((...args) => {
      if (args[0] === 'section_id') {
        return '1';
      }
    });
    stubRedux();
    registerReducers({teacherSections, currentUser});
    store = getStore();
  });

  afterEach(() => {
    if (clock) {
      jest.useRealTimers();
    }
    restoreRedux();
    utils.queryParams.mockRestore();
    fetchStub.mockRestore();
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
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    expect(wrapper.find('SectionSelector').length).toBe(1);
  });

  it('allows teacher to run AI assessment for all students when AI status is ready', async () => {
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Perform fetches
    await wait();

    wrapper.update();
    expect(wrapper.find('Button').first().props().disabled).toBe(false);
  });

  it('disables run AI assessment for all button when no students have attempted', async () => {
    stubFetchEvalStatusForAll(noAttempts);
    stubFetchTeacherEvaluations(evals);

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Perform fetches and re-render
    await wait();
    wrapper.update();

    expect(wrapper.find('Button').first().props().disabled).toBe(true);
  });

  it('disables run AI assessment for all button when all student work has been evaluated', async () => {
    stubFetchEvalStatusForAll(noUnevaluated);
    stubFetchTeacherEvaluations(evals);

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Perform fetches and re-render
    await wait();
    wrapper.update();

    expect(wrapper.find('Button').first().props().disabled).toBe(true);
  });

  it('shows pending status when eval is pending', async () => {
    // show ready state on initial load

    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Perform fetches and re-render
    await wait();
    wrapper.update();

    let status = wrapper.find('BodyTwoText.uitest-eval-status-all-text');
    expect(status.text()).toContain(i18n.aiEvaluationStatusAll_ready({unevaluatedCount: 1}));
    expect(wrapper.find('Button').first().props().disabled).toBe(false);

    // show pending state after clicking run

    stubFetchEvalStatusForAll(onePending);

    wrapper.find('button.uitest-run-ai-assessment-all').simulate('click');

    status = wrapper.find('BodyTwoText.uitest-eval-status-all-text');
    expect(status.text()).toContain(i18n.aiEvaluationStatus_pending());

    expect(wrapper.find('Button').first().props().disabled).toBe(true);
  });

  it('runs AI assessment for all unevaluated projects when requested by teacher', async () => {
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    jest.useFakeTimers();

    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Perform fetches and re-renders
    await wait();
    wrapper.update();

    // Next time it asks, we have no unevaluated as a status
    stubFetchEvalStatusForAll(noUnevaluated);

    wrapper.find('Button').first().simulate('click');

    //sends event on click
    expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_SECTION_AI_EVAL, {
      rubricId: defaultRubric.id,
      sectionId: 1,
    });

    // Perform fetches and re-renders
    await wait();
    wrapper.update();

    expect(wrapper.find('Button').first().props().disabled).toBe(true);
    expect(wrapper.text()).toContain(i18n.aiEvaluationStatus_pending());

    // Advance clock 5 seconds
    jest.advanceTimersByTime(5000);

    // Perform fetches and re-renders
    await wait();
    wrapper.update();
    expect(fetchStub).toHaveBeenCalledTimes(4);
    expect(wrapper.find('Button').first().props().disabled).toBe(true);
    expect(wrapper.text()).toContain(i18n.aiEvaluationStatus_success());
    sendEventSpy.mockRestore();
  });

  it('displays switch tab text and button when there are no evaluations', async () => {
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 0) {
        return Promise.resolve(new Response(JSON.stringify(noEvals)));
      }
    });
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 1) {
        return Promise.resolve(new Response(JSON.stringify(noEvals)));
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );
    await wait();
    wrapper.update();
    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain(i18n.rubricNoStudentEvals());
    expect(wrapper.find('Button').at(1).text()).toContain(i18n.rubricTabStudent());
  });

  it('displays generate CSV button when there are evaluations to export', async () => {
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 0) {
        return Promise.resolve(new Response(JSON.stringify(evals)));
      }
    });
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 1) {
        return Promise.resolve(new Response(JSON.stringify(evals)));
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );
    await wait();
    wrapper.update();
    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain(i18n.rubricNumberStudentEvals({
      teacherEvalCount: 2,
    }));
    expect(wrapper.find('Button').at(1).text()).toContain(i18n.downloadCSV());
  });

  it('sends event when download CSV is clicked', async () => {
    const sendEventSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 0) {
        return Promise.resolve(new Response(JSON.stringify(evals)));
      }
    });
    fetchStub.mockImplementation(() => {
      if (fetchStub.mock.calls.length === 1) {
        return Promise.resolve(new Response(JSON.stringify(evals)));
      }
    });
    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          reportingData={reportingData}
          sectionId={1}
        />
      </Provider>
    );
    await wait();
    wrapper.update();
    //fetch for get_teacher_evaluations_all is the 2nd fetch
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain(i18n.rubricNumberStudentEvals({
      teacherEvalCount: 2,
    }));
    expect(wrapper.find('Button').at(1).text()).toContain(i18n.downloadCSV());
    wrapper.find('Button').at(1).simulate('click');
    expect(sendEventSpy).toHaveBeenCalledWith(EVENTS.TA_RUBRIC_CSV_DOWNLOADED, {
      unitName: 'test-2023',
      courseName: 'course-2023',
      levelName: 'Test Blah Blah Blah',
      sectionId: 1,
    });
    sendEventSpy.mockRestore();
  });

  it('displays the AI enable toggle', () => {
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    expect(input.checked).toBe(true);
  });

  it('ensures the AI enable toggle represents the current value of the AI disabled user setting', () => {
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    // Set the user's opt-out setting to true (our setting will now be false)
    store.dispatch(setAiRubricsDisabled(true));

    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    expect(input.checked).toBe(false);
  });

  it('updates the AI disabled user setting when the toggle is used', async () => {
    stubFetchEvalStatusForAll(ready);
    stubFetchTeacherEvaluations(evals);

    render(
      <Provider store={store}>
        <RubricSettings
          visible
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          rubric={defaultRubric}
          sectionId={1}
        />
      </Provider>
    );

    // Let's stub out setting the field via UserPreferences
    const setStub = jest.spyOn(UserPreferences.prototype, 'setAiRubricsDisabled').mockClear().mockImplementation();

    const input = screen.getByRole('checkbox', {name: i18n.useAiFeatures()});
    fireEvent.click(input);
    fireEvent.change(input);

    expect(input.checked).toBe(false);
    expect(setStub).toHaveBeenCalledWith(true);
    setStub.mockRestore();
  });
});
