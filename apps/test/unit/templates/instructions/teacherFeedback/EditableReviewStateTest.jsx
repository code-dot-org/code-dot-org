import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import {ReviewStates} from '@cdo/apps/templates/types';
import i18n from '@cdo/locale';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  latestReviewState: null,
  isAwaitingTeacherReview: false,
  setReviewState: () => {},
  setReviewStateChanged: () => {}
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  // using mount instead of shallow so that refs are set
  return mount(<EditableReviewState {...props} />);
};

describe('EditableReviewState', () => {
  it('displays keep working text', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.keepWorking())).to.be.true;
  });

  it('displays tooltip', () => {
    const wrapper = setUp();
    const tooltip = wrapper.find('ReactTooltip');
    expect(tooltip).to.have.length(1);
    expect(tooltip.contains(i18n.teacherFeedbackKeepWorkingTooltip())).to.be
      .true;
  });

  it('displays a checked checkbox if reviewState is keepWorking and student is not awaiting review', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: false
    });
    expect(wrapper.instance().checkbox.checked).to.be.true;
  });

  it('displays a indeterminate checkbox if reviewState is keepWorking and student is awaiting reivew', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: true
    });
    expect(wrapper.instance().checkbox.indeterminate).to.be.true;
  });

  it('displays an unchecked checkbox if no latestFeedback', () => {
    const wrapper = setUp({latestReviewState: null});
    expect(wrapper.instance().checkbox.checked).to.be.false;
  });

  it('displays an unchecked checkbox if reviewState is completed', () => {
    const wrapper = setUp({latestReviewState: ReviewStates.completed});
    expect(wrapper.instance().checkbox.checked).to.be.false;
  });

  describe('starting with an unchecked box', () => {
    it('when checkbox is clicked, it calls setReviewState with value keepWorking and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestReviewState: null
      });

      wrapper.instance().checkbox.checked = true;
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('keepWorking');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });

    it('when checkbox is clicked twice, it calls setReviewState with value null and setReviewStateChanged false', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestReviewState: null
      });

      wrapper.find('input').simulate('change');
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith(null);
      expect(setReviewStateChangedStub).to.have.been.calledWith(false);
    });
  });

  describe('starting with a checked box', () => {
    it('when checkbox is clicked, it calls setReviewState with value completed and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestReviewState: ReviewStates.keepWorking
      });

      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('completed');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });
  });

  describe('starting with an indeterminate box', () => {
    it('displays waiting for teacher review text', () => {
      const wrapper = setUp({
        latestReviewState: ReviewStates.keepWorking,
        isAwaitingTeacherReview: true
      });
      expect(wrapper.contains(i18n.waitingForTeacherReviewLabel())).to.be.true;
    });

    it('displays tooltip with awaiting review content', () => {
      const wrapper = setUp({
        latestReviewState: ReviewStates.keepWorking,
        isAwaitingTeacherReview: true
      });

      const tooltip = wrapper.find('ReactTooltip');
      expect(tooltip).to.have.length(1);
      expect(tooltip.contains(i18n.teacherFeedbackAwaitingReviewTooltip())).to
        .be.true;
    });

    it('when checkbox is click, it calls setReviewState with value completed and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        latestReviewState: ReviewStates.keepWorking,
        isAwaitingTeacherReview: true,
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub
      });

      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('completed');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });

    it('when checkbox is clicked twice, it calls setReviewState with value keepWorking and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        latestReviewState: ReviewStates.keepWorking,
        isAwaitingTeacherReview: true,
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub
      });

      wrapper.find('input').simulate('change');
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('keepWorking');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });
  });
});
