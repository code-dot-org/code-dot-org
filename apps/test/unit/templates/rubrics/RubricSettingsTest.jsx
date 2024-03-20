import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {act} from 'react-dom/test-utils';
import * as utils from '@cdo/apps/code-studio/utils';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';
import i18n from '@cdo/locale';

describe('RubricSettings', () => {
  let clock;
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
    fetchStub
      .withArgs(sinon.match(/rubrics\/\d+\/ai_evaluation_status_for_all.*/))
      .returns(Promise.resolve(new Response(JSON.stringify(data))));
  }

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.returns(Promise.resolve(new Response('')));
    refreshAiEvaluationsSpy = sinon.spy();
    sinon.stub(utils, 'queryParams').withArgs('section_id').returns('1');
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
    restoreRedux();
    utils.queryParams.restore();
    fetchStub.restore();
  });

  const defaultRubric = {
    id: 1,
    learningGoals: [],
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

  it('displays Section selector', () => {
    stubFetchEvalStatusForAll(ready);

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
    expect(wrapper.find('SectionSelector').length).to.equal(1);
  });

  it('allows teacher to run AI assessment for all students when AI status is ready', async () => {
    stubFetchEvalStatusForAll(ready);

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
    expect(wrapper.find('Button').first().props().disabled).to.be.false;
  });

  it('disables run AI assessment for all button when no students have attempted', async () => {
    stubFetchEvalStatusForAll(noAttempts);

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

    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('disables run AI assessment for all button when all student work has been evaluated', async () => {
    stubFetchEvalStatusForAll(noUnevaluated);

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

    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('runs AI assessment for all unevaluated projects when requested by teacher', async () => {
    stubFetchEvalStatusForAll(ready);

    clock = sinon.useFakeTimers();

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

    // Perform fetches and re-renders
    await wait();
    wrapper.update();

    expect(wrapper.find('Button').first().props().disabled).to.be.true;
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_pending());

    // Advance clock 5 seconds
    clock.tick(5000);

    // Perform fetches and re-renders
    await wait();
    wrapper.update();

    expect(fetchStub).to.have.callCount(3);
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_success());
  });
});
