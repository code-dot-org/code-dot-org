import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {act} from 'react-dom/test-utils';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';
import * as utils from '@cdo/apps/code-studio/utils';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';

describe('RubricContainer', () => {
  let store;
  let fetchStub;
  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    sinon.stub(utils, 'queryParams').withArgs('section_id').returns('1');
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    fetchStub.restore();
    utils.queryParams.restore();
    restoreRedux();
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
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(successJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(successJsonAll))));
    fetchStub
      .onCall(2)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );
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
    await act(async () => {
      await Promise.resolve();
    });
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(successJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(successJsonAll))));
    fetchStub
      .onCall(2)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );
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
    await act(async () => {
      await Promise.resolve();
    });
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));

    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('Button')).to.have.lengthOf(3);
    expect(wrapper.find('Button').first().props().text).to.equal(
      i18n.runAiAssessment({studentName: defaultStudentInfo.name})
    );
  });

  it('shows status text when student has not attempted level', async () => {
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(notAttemptedJson))));
    fetchStub
      .onCall(1)
      .returns(
        Promise.resolve(new Response(JSON.stringify(notAttemptedJsonAll)))
      );
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_not_attempted());
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });

  it('shows status text when level has already been evaluated', async () => {
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(successJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(successJsonAll))));
    fetchStub
      .onCall(2)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );
    fetchStub
      .onCall(3)
      .returns(
        Promise.resolve(new Response(JSON.stringify(mockAiEvaluations)))
      );
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_already_evaluated()
    );
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });

  it('allows teacher to run analysis when level has not been evaluated', async () => {
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));

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
    await act(async () => {
      await Promise.resolve();
    });

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

    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(readyJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));

    //for run ai fetch on click
    fetchStub.onCall(4).returns(Promise.resolve({ok: true}));

    fetchStub
      .onCall(5)
      .returns(Promise.resolve(new Response(JSON.stringify(pendingJson))));

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
      );

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

    await act(async () => {
      await Promise.resolve();
    });
    // 1. Initial fetch returns a json object that puts AI Status into READY state
    wrapper.update();
    expect(wrapper.find('Button').at(0).props().disabled).to.be.false;
    // 2. User clicks button to run analysis
    wrapper.find('Button').at(0).simulate('click');

    clock.tick(5000);
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    // 3. Fetch returns a json object with puts AI Status into EVALUATION_PENDING state
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    expect(wrapper.text()).include(i18n.aiEvaluationStatus_pending());

    // 4. Move clock forward 5 seconds
    clock.tick(5000);
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    // 5. Fetch returns a json object with puts AI Status into EVALUATION_RUNNING state
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    expect(wrapper.text()).include(i18n.aiEvaluationStatus_in_progress());

    // 6. Move clock forward 5 seconds
    clock.tick(5000);
    await act(async () => {
      await Promise.resolve();
    });
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));
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
    await act(async () => {
      await Promise.resolve();
    });
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));
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
    await act(async () => {
      await Promise.resolve();
    });
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
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
    fetchStub
      .onCall(1)
      .returns(Promise.resolve(new Response(JSON.stringify(returnedJsonAll))));
    fetchStub.onCall(2).returns(Promise.resolve(new Response('')));
    fetchStub.onCall(3).returns(Promise.resolve(new Response('')));
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(fetchStub).to.have.callCount(4);
    expect(wrapper.text()).to.include(
      i18n.aiEvaluationStatus_profanity_error()
    );
    expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
  });
});
