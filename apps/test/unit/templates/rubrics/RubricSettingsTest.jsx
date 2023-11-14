import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import {act} from 'react-dom/test-utils';
import i18n from '@cdo/locale';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';

describe('RubricSettings', () => {
  it('shows a a button for running analysis if canProvideFeedback is true', () => {
    const wrapper = shallow(
      <RubricSettings
        canProvideFeedback={true}
        teacherHasEnabledAi={true}
        visible
      />
    );
    expect(wrapper.find('Button')).to.have.lengthOf(1);
  });

  describe('fetch ai status', () => {
    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub(window, 'fetch');
    });

    afterEach(() => {
      fetchStub.restore();
    });

    it('shows status text when student has not attempted level', async () => {
      const returnedJson = {attempted: false};
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          visible
          rubricId={1}
          studentUserId={10}
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_not_attempted()
      );
      expect(wrapper.find('Button').props().disabled).to.be.true;
    });

    it('shows status text when level has already been evaluated', async () => {
      const returnedJson = {attempted: true, lastAttemptEvaluated: true};
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_already_evaluated()
      );
      expect(wrapper.find('Button').props().disabled).to.be.true;
    });

    it('allows teacher to run analysis when level has not been evaluated', async () => {
      const returnedJson = {attempted: true, lastAttemptEvaluated: false};
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.find('Button').props().disabled).to.be.false;
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
      fetchStub
        .onCall(0)
        .returns(Promise.resolve(new Response(JSON.stringify(readyJson))));

      const pendingJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        csrfToken: 'abcdef',
        status: RubricAiEvaluationStatus.QUEUED,
      };
      fetchStub
        .onCall(1)
        .returns(Promise.resolve(new Response(JSON.stringify(pendingJson))));

      const runningJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        csrfToken: 'abcdef',
        status: RubricAiEvaluationStatus.RUNNING,
      };
      fetchStub
        .onCall(2)
        .returns(Promise.resolve(new Response(JSON.stringify(runningJson))));

      const successJson = {
        attempted: true,
        lastAttemptEvaluated: true,
        status: RubricAiEvaluationStatus.SUCCESS,
      };
      fetchStub
        .onCall(3)
        .returns(Promise.resolve(new Response(JSON.stringify(successJson))));

      fetchStub.returns(Promise.resolve({ok: false}));

      const refreshAiEvaluationsSpy = sinon.spy();
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          refreshAiEvaluations={refreshAiEvaluationsSpy}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(wrapper.find('Button').props().disabled).to.be.false;
      wrapper.find('Button').simulate('click');
      expect(wrapper.find('Button').props().disabled).to.be.true;
      expect(wrapper.text()).include(i18n.aiEvaluationStatus_pending());

      clock.tick(5000);
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(wrapper.find('Button').props().disabled).to.be.true;
      expect(wrapper.text()).include(i18n.aiEvaluationStatus_in_progress());

      clock.tick(5000);
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(wrapper.find('Button').props().disabled).to.be.true;
      expect(wrapper.text()).include(i18n.aiEvaluationStatus_success());
      expect(refreshAiEvaluationsSpy).to.have.been.calledOnce;
    });

    it('shows general error message for status 1000', async () => {
      const returnedJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        status: 1000,
      };
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_error());
      expect(wrapper.find('Button').props().disabled).to.be.true;
    });

    it('shows PII error message for status 1001', async () => {
      const returnedJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        status: 1001,
      };
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.text()).to.include(i18n.aiEvaluationStatus_pii_error());
      expect(wrapper.find('Button').props().disabled).to.be.true;
    });

    it('shows profanity error message for status 1002', async () => {
      const returnedJson = {
        attempted: true,
        lastAttemptEvaluated: false,
        status: 1002,
      };
      fetchStub.returns(
        Promise.resolve(new Response(JSON.stringify(returnedJson)))
      );
      const wrapper = mount(
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          rubricId={1}
          studentUserId={10}
          visible
        />
      );
      await act(async () => {
        await Promise.resolve();
      });
      wrapper.update();
      expect(fetchStub).to.have.been.calledOnce;
      expect(wrapper.text()).to.include(
        i18n.aiEvaluationStatus_profanity_error()
      );
      expect(wrapper.find('Button').props().disabled).to.be.true;
    });
  });
});
