import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import TeacherFeedbackKeepWorking from '@cdo/apps/templates/instructions/TeacherFeedbackKeepWorking';
import i18n from '@cdo/locale';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  latestFeedback: {
    review_state: null,
    created_at: new Date(),
    student_last_updated: null
  },
  reviewState: null,
  setReviewState: () => {},
  setReviewStateChanged: () => {}
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  // using mount instead of shallow so that refs are set
  return mount(<TeacherFeedbackKeepWorking {...props} />);
};

const feedbackForIndeterminateState = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // awaiting review because the student has updated since the feedback was left
  return {
    review_state: 'keepWorking',
    created_at: yesterday,
    student_last_updated: new Date() // today
  };
};

describe('TeacherFeedbackKeepWorking', () => {
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
    const wrapper = setUp({reviewState: 'keepWorking'});
    expect(wrapper.find('input').props().checked).to.be.true;
  });

  it('displays a indeterminate checkbox if reviewState is keepWorking and student is awaiting reivew', () => {
    const latestFeedback = feedbackForIndeterminateState();
    const wrapper = setUp({latestFeedback});
    expect(wrapper.instance().checkbox.indeterminate).to.be.true;
  });

  it('displays an unchecked checkbox if reviewState is null', () => {
    const wrapper = setUp({reviewState: null});
    expect(wrapper.find('input').props().checked).to.be.false;
  });

  it('displays an unchecked checkbox if reviewState is completed', () => {
    const wrapper = setUp({reviewState: 'completed'});
    expect(wrapper.find('input').props().checked).to.be.false;
  });

  describe('starting with an unchecked box', () => {
    it('when checkbox is clicked, it calls setReviewState with value keepWorking and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        reviewState: null,
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestFeedback: {
          review_state: null
        }
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
        reviewState: null,
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestFeedback: {
          review_state: null
        }
      });

      wrapper.instance().checkbox.checked = false; // two clicks puts at unchecked state
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith(null);
      expect(setReviewStateChangedStub).to.have.been.calledWith(false);
    });
  });

  describe('starting with a checked box', () => {
    it('when checkbox is clicked, it calls setReviewState with value null and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        reviewState: 'keepWorking',
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub,
        latestFeedback: {
          review_state: 'keepWorking'
        }
      });

      wrapper.instance().checkbox.checked = false;
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith(null);
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });
  });

  describe('starting with an indeterminate box', () => {
    it('displays waiting for teacher review text', () => {
      const latestFeedback = feedbackForIndeterminateState();
      const wrapper = setUp({latestFeedback});
      expect(wrapper.contains(i18n.awaitingTeacherReview())).to.be.true;
    });

    it('displays tooltip with awaiting review content', () => {
      const latestFeedback = feedbackForIndeterminateState();
      const wrapper = setUp({latestFeedback});

      const tooltip = wrapper.find('ReactTooltip');
      expect(tooltip).to.have.length(1);
      expect(tooltip.contains(i18n.teacherFeedbackAwaitingReviewTooltip())).to
        .be.true;
    });

    it('when checkbox is click, it calls setReviewState with value completed and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        latestFeedback: feedbackForIndeterminateState(),
        reviewState: 'keepWorking',
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub
      });

      wrapper.instance().checkbox.checked = false;
      wrapper.instance().checkbox.indeterminate = false;
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('completed');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });

    it('when checkbox is clicked twice, it calls setReviewState with value keepWorking and setReviewStateChanged true', () => {
      const setReviewStateStub = sinon.stub();
      const setReviewStateChangedStub = sinon.stub();

      const wrapper = setUp({
        latestFeedback: feedbackForIndeterminateState(),
        reviewState: 'keepWorking',
        setReviewState: setReviewStateStub,
        setReviewStateChanged: setReviewStateChangedStub
      });

      wrapper.instance().checkbox.checked = true; // two clicks puts at checked state with indeterminate = false
      wrapper.instance().checkbox.indeterminate = false;
      wrapper.find('input').simulate('change');

      expect(setReviewStateStub).to.have.been.calledWith('keepWorking');
      expect(setReviewStateChangedStub).to.have.been.calledWith(true);
    });
  });
});
