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
  let fetchStub;
  let store;
  let refreshAiEvaluationsSpy;
  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    refreshAiEvaluationsSpy = sinon.spy();
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
    fetchStub.returns(Promise.resolve(new Response(JSON.stringify(ready))));
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
    fetchStub.returns(Promise.resolve(new Response(JSON.stringify(ready))));
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('Button').first().props().disabled).to.be.false;
  });

  it('disables run AI assessment for all button when no students have attempted', async () => {
    fetchStub.returns(
      Promise.resolve(new Response(JSON.stringify(noAttempts)))
    );
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('disables run AI assessment for all button when all student work has been evaluated', async () => {
    fetchStub.returns(
      Promise.resolve(new Response(JSON.stringify(noUnevaluated)))
    );
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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
  });

  it('runs AI assessment for all unevaluated projects when requested by teacher', async () => {
    fetchStub
      .onCall(0)
      .returns(Promise.resolve(new Response(JSON.stringify(ready))));
    fetchStub.onCall(1).returns(Promise.resolve({ok: true}));
    fetchStub
      .onCall(2)
      .returns(Promise.resolve(new Response(JSON.stringify(noUnevaluated))));

    const clock = sinon.useFakeTimers();

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
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    wrapper.find('Button').first().simulate('click');
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_pending());
    clock.tick(5000);
    await act(async () => {
      await Promise.resolve();
    });
    wrapper.update();
    expect(fetchStub).to.have.callCount(3);
    expect(wrapper.find('Button').first().props().disabled).to.be.true;
    expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_success());
  });
});
