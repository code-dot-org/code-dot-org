import {render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {UnconnectedProgressFeedbackBanner} from '@cdo/apps/templates/sectionProgressV2/ProgressFeedbackBanner';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('UnconnectedProgressFeedbackBanner', () => {
  it('renders correctly when user has not answered survey question', () => {
    const fakeFetch = sinon.spy();
    const fakeCreate = sinon.spy();
    const props = {
      currentUser: {isAdmin: false},
      canShow: true,
      isLoading: false,
      progressV2Feedback: {empty: true},
      fetchProgressV2Feedback: fakeFetch,
      createProgressV2Feedback: fakeCreate,
      errorWhenCreatingOrLoading: null,
    };

    render(<UnconnectedProgressFeedbackBanner {...props} />);
    expect(screen.getByText(i18n.progressV2_feedback_question())).to.be.visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsUp())).to.be
      .visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsDown())).to.be
      .visible;
  });

  //   it('renders correctly with initial state', () => {
  //     const fakeFetch = sinon.spy();
  //     const fakeCreate = sinon.spy();
  //     const props = {
  //       currentUser: {isAdmin: false},
  //       bannerStatus: 'unanswered',
  //       canShow: true,
  //       isLoading: false,
  //       progressV2Feedback: {empty: true},
  //       fetchProgressV2Feedback: fakeFetch,
  //       createProgressV2Feedback: fakeCreate,
  //       errorWhenCreatingOrLoading: null,
  //     };

  //     render(<UnconnectedProgressFeedbackBanner {...props} />);
  //     screen.debug();
  //     expect(screen.getByText(i18n.progressV2_feedback_question())).to.be.visible;
  //   });
});
