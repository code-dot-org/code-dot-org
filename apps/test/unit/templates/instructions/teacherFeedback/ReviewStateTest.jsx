import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReviewState';
import {ReviewStates} from '@cdo/apps/templates/instructions/teacherFeedback/types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

const DEFAULT_PROPS = {
  latestReviewState: null,
  isAwaitingTeacherReview: false
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ReviewState {...props} />);
};

describe('ReviewState', () => {
  it('renders completed text if review state is completed', () => {
    const wrapper = setUp({latestReviewState: ReviewStates.completed});
    expect(wrapper.contains(i18n.reviewedComplete())).to.be.true;
  });

  it('renders awaiting review text if student is awaiting review', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: true
    });

    expect(wrapper.contains(i18n.waitingForTeacherReview())).to.be.true;
  });

  it('renders keep working badge if student is awaiting review', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: true
    });

    expect(wrapper.find('KeepWorkingBadge')).to.have.length(1);
  });

  it('renders keep working text if review state is keep working (and not awaiting review)', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: false
    });

    expect(wrapper.contains(i18n.keepWorking())).to.be.true;
  });

  it('renders keep working text in red if review state is keep working (and not awaiting review)', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: false
    });

    expect(wrapper.find('span').props().style.color).to.equal(color.red);
  });

  it('renders keep working badge if review state is keep working (and not awaiting review)', () => {
    const wrapper = setUp({
      latestReviewState: ReviewStates.keepWorking,
      isAwaitingTeacherReview: false
    });

    expect(wrapper.find('KeepWorkingBadge')).to.have.length(1);
  });

  it('renders null if there is no review state', () => {
    const wrapper = setUp({
      latestReviewState: null
    });

    expect(wrapper.isEmptyRender()).to.be.true;
  });
});
