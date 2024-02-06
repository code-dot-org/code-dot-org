import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {act} from 'react-dom/test-utils';
import i18n from '@cdo/locale';
import * as utils from '@cdo/apps/code-studio/utils';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';
import experiments from '@cdo/apps/util/experiments';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

describe('RubricSettings', () => {
  const defaultRubric = {
    learningGoals: [],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
    id: 1,
  };

  it('shows a a button for running analysis if canProvideFeedback is true', () => {
    const wrapper = shallow(
      <RubricSettings
        canProvideFeedback={true}
        teacherHasEnabledAi={true}
        visible
        rubric={defaultRubric}
      />
    );
    expect(wrapper.find('Button')).to.have.lengthOf(2);
  });

  describe('fetch ai status', () => {
    let fetchStub;
    let store;

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

    it('shows status text when student has not attempted level', async () => {
      const returnedJson = {attempted: false};
      const returnedAllJson = {attemptedCount: 0, attemptedUnevaluatedCount: 0};
      fetchStub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
      fetchStub
        .onCall(1)
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedAllJson)))
        );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            visible
            studentUserId={10}
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_not_attempted()
      );
      expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
      expect(wrapper.find('Button').at(1).props().disabled).to.be.true;
    });

    it('shows status text when level has already been evaluated', async () => {
      const returnedJson = {attempted: true, lastAttemptEvaluated: true};
      const returnedAllJson = {attemptedCount: 1, attemptedUnevaluatedCount: 0};
      fetchStub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
      fetchStub
        .onCall(1)
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedAllJson)))
        );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            visible
            studentUserId={10}
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_already_evaluated()
      );
      expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
      expect(wrapper.find('Button').at(1).props().disabled).to.be.true;
    });

    it('allows teacher to run analysis when level has not been evaluated', async () => {
      const returnedJson = {attempted: true, lastAttemptEvaluated: false};
      const returnedAllJson = {attemptedCount: 1, attemptedUnevaluatedCount: 1};
      fetchStub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(returnedJson))));
      fetchStub
        .onCall(1)
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedAllJson)))
        );

      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            visible
            studentUserId={10}
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
      expect(wrapper.find('Button').at(0).props().disabled).to.be.false;
      expect(wrapper.find('Button').at(1).props().disabled).to.be.false;
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
      const readyJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        csrfToken: 'abcdef',
      };
      const readyJsonAll = {
        attemptedCount: 1,
        attemptedUnevaluatedCount: 1,
        csrfToken: 'abcdef',
      };
      fetchStub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(readyJson))));
      fetchStub
        .onCall(1)
        .returns(Promise.resolve(new Response(JSON.stringify(readyJsonAll))));

      //for run ai fetch on click
      fetchStub.onCall(2).returns(Promise.resolve({ok: true}));

      const pendingJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        csrfToken: 'abcdef',
        status: RubricAiEvaluationStatus.QUEUED,
      };
      const pendingJsonAll = {
        attemptedCount: 1,
        attemptedUnevaluatedCount: 0,
        csrfToken: 'abcdef',
      };
      fetchStub
        .onCall(3)
        .returns(Promise.resolve(new Response(JSON.stringify(pendingJson))));
      fetchStub
        .onCall(4)
        .returns(Promise.resolve(new Response(JSON.stringify(pendingJsonAll))));

      const runningJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        csrfToken: 'abcdef',
        status: RubricAiEvaluationStatus.RUNNING,
      };
      const runningJsonAll = {
        attemptedCount: 1,
        attemptedUnevaluatedCount: 0,
        csrfToken: 'abcdef',
      };
      fetchStub
        .onCall(5)
        .returns(Promise.resolve(new Response(JSON.stringify(runningJson))));
      fetchStub
        .onCall(6)
        .returns(Promise.resolve(new Response(JSON.stringify(runningJsonAll))));

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
      fetchStub
        .onCall(7)
        .returns(Promise.resolve(new Response(JSON.stringify(successJson))));
      fetchStub
        .onCall(8)
        .returns(Promise.resolve(new Response(JSON.stringify(successJsonAll))));

      const refreshAiEvaluationsSpy = sinon.spy();
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            studentUserId={10}
            refreshAiEvaluations={refreshAiEvaluationsSpy}
            visible
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );

      await act(async () => {
        await Promise.resolve();
      });
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
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      // 7. Fetch returns a json object with puts AI Status into SUCCESS state
      expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
      expect(wrapper.text()).include(i18n.aiEvaluationStatus_success());
      // 8. Calls refreshAiEvaluations
      expect(refreshAiEvaluationsSpy).to.have.been.calledOnce;
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
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedJsonAll)))
        );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            studentUserId={10}
            visible
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
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
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedJsonAll)))
        );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            studentUserId={10}
            visible
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
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
        .returns(
          Promise.resolve(new Response(JSON.stringify(returnedJsonAll)))
        );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            studentUserId={10}
            visible
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledTwice;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_profanity_error()
      );
      expect(wrapper.find('Button').at(0).props().disabled).to.be.true;
    });

    it('displays new Section selector when ai-rubrics-redesign experiment is enabled', () => {
      experiments.setEnabled('ai-rubrics-redesign', true);
      const returnedJson = {attempted: false};
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <Provider store={store}>
          <RubricSettings
            canProvideFeedback={true}
            teacherHasEnabledAi={true}
            studentUserId={10}
            visible
            rubric={defaultRubric}
            sectionId={2}
          />
        </Provider>
      );
      expect(wrapper.find('SectionSelector').length).to.equal(1);
      experiments.setEnabled('ai-rubrics-redesign', false);
    });
  });
});
