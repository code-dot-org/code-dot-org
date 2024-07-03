import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  latestReviewState: null,
  onReviewStateChange: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  // using mount instead of shallow so that refs are set
  return mount(<EditableReviewState {...props} />);
};

describe('EditableReviewState', () => {
  it('displays keep working text', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.keepWorking())).toBe(true);
  });

  it('displays tooltip', () => {
    const wrapper = setUp();
    const tooltip = wrapper.find('ReactTooltip');
    expect(tooltip).toHaveLength(1);
    expect(tooltip.contains(i18n.teacherFeedbackKeepWorkingTooltip())).toBe(
      true
    );
  });

  it('displays a checked checkbox if reviewState is keepWorking and student is not awaiting review', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
    });
    expect(wrapper.instance().checkbox.checked).toBe(true);
  });

  it('displays a indeterminate checkbox if reviewState is keepWorking and student is awaiting reivew', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.awaitingReview,
    });
    expect(wrapper.instance().checkbox.indeterminate).toBe(true);
  });

  it('displays an unchecked checkbox if no latestFeedback', () => {
    const wrapper = setUp({latestReviewState: null});
    expect(wrapper.instance().checkbox.checked).toBe(false);
  });

  it('displays an unchecked checkbox if reviewState is completed', () => {
    const wrapper = setUp({latestReviewState: ReviewStates.completed});
    expect(wrapper.instance().checkbox.checked).toBe(false);
  });

  describe('starting with an unchecked box', () => {
    it('when checkbox is clicked, it calls onReviewStateChange with value keepWorking', () => {
      const onReviewStateChangeStub = jest.fn();

      const wrapper = setUp({
        onReviewStateChange: onReviewStateChangeStub,
        latestReviewState: null,
      });

      wrapper.instance().checkbox.checked = true;
      wrapper.find('input').simulate('change');

      expect(onReviewStateChangeStub).toHaveBeenCalledWith('keepWorking');
    });

    it('when checkbox is clicked twice, it calls onReviewStateChange with value null', () => {
      const onReviewStateChangeStub = jest.fn();

      const wrapper = setUp({
        onReviewStateChange: onReviewStateChangeStub,
        latestReviewState: null,
      });

      wrapper.find('input').simulate('change');
      wrapper.find('input').simulate('change');

      expect(onReviewStateChangeStub).toHaveBeenCalledWith(null);
    });
  });

  describe('starting with a checked box', () => {
    it('when checkbox is clicked, it calls onReviewStateChange with value completed', () => {
      const onReviewStateChangeStub = jest.fn();

      const wrapper = setUp({
        onReviewStateChange: onReviewStateChangeStub,
        latestReviewState: ReviewStates.keepWorking,
      });

      wrapper.find('input').simulate('change');

      expect(onReviewStateChangeStub).toHaveBeenCalledWith('completed');
    });
  });

  describe('starting with an indeterminate box', () => {
    it('displays waiting for teacher review text', () => {
      const wrapper = setUp({
        latestReviewState: ReviewStates.awaitingReview,
      });
      expect(wrapper.contains(i18n.waitingForTeacherReviewLabel())).toBe(true);
    });

    it('displays tooltip with awaiting review content', () => {
      const wrapper = setUp({
        latestReviewState: ReviewStates.awaitingReview,
      });

      const tooltip = wrapper.find('ReactTooltip');
      expect(tooltip).toHaveLength(1);
      expect(
        tooltip.contains(i18n.teacherFeedbackAwaitingReviewTooltip())
      ).toBe(true);
    });

    it('when checkbox is click, it calls onReviewStateChange with value completed', () => {
      const onReviewStateChangeStub = jest.fn();

      const wrapper = setUp({
        latestReviewState: ReviewStates.awaitingReview,
        onReviewStateChange: onReviewStateChangeStub,
      });

      wrapper.find('input').simulate('change');

      expect(onReviewStateChangeStub).toHaveBeenCalledWith('completed');
    });

    it('when checkbox is clicked twice, it calls onReviewStateChange with value keepWorking', () => {
      const onReviewStateChangeStub = jest.fn();

      const wrapper = setUp({
        latestReviewState: ReviewStates.awaitingReview,
        onReviewStateChange: onReviewStateChangeStub,
      });

      wrapper.find('input').simulate('change');
      wrapper.find('input').simulate('change');

      expect(onReviewStateChangeStub).toHaveBeenCalledWith('keepWorking');
    });
  });
});
