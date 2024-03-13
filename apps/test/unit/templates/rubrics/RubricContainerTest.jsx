import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import teacherPanel from '@cdo/apps/code-studio/teacherPanelRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {Provider} from 'react-redux';
import * as utils from '@cdo/apps/code-studio/utils';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import $ from 'jquery';

// react testing library import
import {render, fireEvent, act} from '@testing-library/react';

describe('RubricContainer', () => {
  let store;
  let fetchStub;
  let ajaxStub;

  async function wait() {
    for (let _ = 0; _ < 10; _++) {
      await act(async () => {
        await Promise.resolve();
      });
    }
  }

  function stubFetchEvalStatusForUser(data) {
    fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/ai_evaluation_status_for_user.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  function stubFetchEvalStatusForAll(data) {
    fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/ai_evaluation_status_for_all.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  function stubFetchAiEvaluations(data) {
    fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/get_ai_evaluations.*/))
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
    fetchStub.returns(Promise.resolve(new Response('')));
    sinon.stub(utils, 'queryParams').withArgs('section_id').returns('1');
    stubRedux();
    registerReducers({teacherSections, teacherPanel, currentUser});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    utils.queryParams.restore();
    fetchStub.restore();
    ajaxStub.restore();
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
    status: RubricAiEvaluationStatus.SUCCESS,
  };

  const successJsonAll = {
    attemptedCount: 1,
    attemptedUnevaluatedCount: 0,
    csrfToken: 'abcdef',
  };

  const defaultRubric = {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'goal 1',
        aiEnabled: false,
        evidenceLevels: [],
      },
      {
        id: 2,
        key: '2',
        learningGoal: 'goal 2',
        aiEnabled: true,
        evidenceLevels: [],
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

  const defaultStudentInfo = {user_id: 1, name: 'Jane Doe'};

  const mockAiEvaluations = [
    {id: 2, learning_goal_id: 2, understanding: 2, ai_confidence: 2},
  ];

  it('renders a RubricContent component when the rubric tab is selected', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    expect(wrapper.find('RubricContent')).to.have.lengthOf(1);
  });

  it('fetches AI evaluations and passes them to children', async () => {
    stubFetchEvalStatusForUser(successJson);
    stubFetchEvalStatusForAll(successJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);

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
    // Push the `fetch`s through
    await wait();

    // Let the component re-render with the set state
    wrapper.update();
    expect(fetchStub).to.have.been.calledThrice;
    expect(wrapper.find('RubricContent').props().aiEvaluations).to.eql(
      mockAiEvaluations
    );
  });

  it('displays RubricTabButtons prop', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        teacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
        open
      />
    );
    expect(wrapper.find('RubricTabButtons').length).to.equal(1);
  });

  it('switches components when tabs are clicked', async () => {
    stubFetchEvalStatusForUser(successJson);
    stubFetchEvalStatusForAll(successJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);

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
    expect(wrapper.find('RubricContent').props().visible).to.be.true;
    expect(wrapper.find('RubricSettings').props().visible).to.be.false;
    wrapper.find('SegmentedButton').at(1).simulate('click');
    expect(wrapper.find('RubricContent').props().visible).to.be.false;
    expect(wrapper.find('RubricSettings').props().visible).to.be.true;
    wrapper.find('SegmentedButton').at(0).simulate('click');
    expect(wrapper.find('RubricContent').props().visible).to.be.true;
    expect(wrapper.find('RubricSettings').props().visible).to.be.false;
  });

  it('shows a a button for running analysis if canProvideFeedback is true', async () => {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);

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
    expect(wrapper.find('Button')).to.have.lengthOf(3);
    expect(wrapper.find('Button').first().props().text).to.equal(
      i18n.runAiAssessment()
    );
  });

  it('shows status text when student has not attempted level', async () => {
    stubFetchEvalStatusForUser(notAttemptedJson);
    stubFetchEvalStatusForAll(notAttemptedJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);

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
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_not_attempted());
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });

  it('shows status text when level has already been evaluated', async () => {
    stubFetchEvalStatusForUser(successJson);
    stubFetchEvalStatusForAll(successJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);

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

    // Perform fetches
    await wait();

    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_already_evaluated()
    );
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });

  it('allows teacher to run analysis when level has not been evaluated', async () => {
    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);

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

    // Perform fetches
    await wait();

    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.find('Button').at(0).props().disabled).to.be.false;
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
    const clock = sinon.useFakeTimers();

    stubFetchEvalStatusForUser(readyJson);
    stubFetchEvalStatusForAll(readyJsonAll);
    stubFetchAiEvaluations(mockAiEvaluations);

    /*
    fetchStub
      .onCall(6)
      .returns(Promise.resolve(new Response(JSON.stringify(runningJson))));

    fetchStub
      .onCall(7)
      .returns(Promise.resolve(new Response(JSON.stringify(successJson))));

    fetchStub
      .onCall(8)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );
    fetchStub
      .onCall(16)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );*/

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

    // Wait for fetches
    await wait();

    // 1. Initial fetch returns a json object that puts AI Status into READY state
    wrapper.update();
    expect(wrapper.find('Button').at(0).props().disabled).to.be.false;

    // 2. User clicks button to run analysis
    stubFetchEvalStatusForUser(pendingJson);

    wrapper.find('Button').at(0).simulate('click');

    // Wait for fetches and re-render
    clock.tick(5000);
    await wait();
    wrapper.update();

    // 3. Fetch returns a json object with puts AI Status into EVALUATION_PENDING state
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    expect(wrapper.text()).include(i18n.aiEvaluationStatus_pending());

    stubFetchEvalStatusForUser(runningJson);

    // 4. Move clock forward 5 seconds and re-render
    clock.tick(5000);
    await wait();
    wrapper.update();

    // 5. Fetch returns a json object with puts AI Status into EVALUATION_RUNNING state
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    expect(wrapper.text()).include(i18n.aiEvaluationStatus_in_progress());

    stubFetchEvalStatusForUser(successJson);

    // 6. Move clock forward 5 seconds and re-render
    clock.tick(5000);
    await wait();
    wrapper.update();

    // 7. Fetch returns a json object with puts AI Status into SUCCESS state
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    expect(wrapper.text()).include(i18n.aiEvaluationStatus_success());
    expect(wrapper.find('RubricContent').props().aiEvaluations).to.eql(
      mockAiEvaluations
    );
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

    stubFetchEvalStatusForUser(returnedJson);
    stubFetchEvalStatusForAll(returnedJsonAll);

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

    // Perform fetches
    await wait();

    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_error());
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
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

    stubFetchEvalStatusForUser(returnedJson);
    stubFetchEvalStatusForAll(returnedJsonAll);

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

    // Perform fetches
    await wait();

    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_pii_error());
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
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

    stubFetchEvalStatusForUser(returnedJson);
    stubFetchEvalStatusForAll(returnedJsonAll);

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

    // Perform fetches
    await wait();

    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_profanity_error()
    );
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });

  // react testing library
  it('moves rubric container when user clicks and drags component', async () => {
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

    await act(async () => {
      await Promise.resolve();
    });

    const element = getByTestId('draggable-test-id');

    const initialPosition = element.style.transform;

    // simulate dragging
    fireEvent.mouseDown(element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(element, {clientX: 100, clientY: 100});
    fireEvent.mouseUp(element);

    const newPosition = element.style.transform;

    expect(newPosition).to.not.equal(initialPosition);
  });
});
