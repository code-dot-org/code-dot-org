import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {UnconnectedProgressFeedbackBanner} from '@cdo/apps/templates/sectionProgressV2/ProgressFeedbackBanner';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('UnconnectedProgressFeedbackBanner', () => {
  it('renders correctly with initial state', () => {
    const fakeFetch = sinon.spy();
    const fakeCreate = sinon.spy();
    const props = {
      currentUser: {isAdmin: false},
      canShow: false,
      isLoading: false,
      progressV2Feedback: {empty: true},
      fetchProgressV2Feedback: fakeFetch,
      createProgressV2Feedback: fakeCreate,
      errorWhenCreatingOrLoading: null,
    };

    render(<UnconnectedProgressFeedbackBanner {...props} />);
    const questionText = screen.queryByText(
      i18n.progressV2_feedback_question()
    );
    const shareMoreText = screen.queryByText(
      i18n.progressV2_feedback_shareMore()
    );
    expect(questionText).to.not.exist;
    expect(shareMoreText).to.not.exist;
  });

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

  it('renders correctly when the data is loading', () => {
    const fakeFetch = sinon.spy();
    const fakeCreate = sinon.spy();
    const props = {
      currentUser: {isAdmin: false},
      canShow: true,
      isLoading: true,
      progressV2Feedback: {empty: true},
      fetchProgressV2Feedback: fakeFetch,
      createProgressV2Feedback: fakeCreate,
      errorWhenCreatingOrLoading: null,
    };

    render(<UnconnectedProgressFeedbackBanner {...props} />);
    const questionText = screen.queryByText(
      i18n.progressV2_feedback_question()
    );
    const shareMoreText = screen.queryByText(
      i18n.progressV2_feedback_shareMore()
    );
    expect(questionText).to.not.exist;
    expect(shareMoreText).to.not.exist;
  });

  it('clicking thumbs up attempts to send feedback', () => {
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
    const thumbsUpButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsUp()
    );
    expect(thumbsUpButton).to.be.visible;
    fireEvent.click(thumbsUpButton);
    expect(fakeCreate).to.have.been.calledOnce;
    const shareMoreText = screen.getByText(
      i18n.progressV2_feedback_shareMore()
    );
    const shareMoreLink = screen.getByRole('link', {
      name: i18n.progressV2_feedback_shareMoreLinkText(),
    });
    expect(shareMoreLink).to.be.visible;
    expect(shareMoreText).to.be.visible;
  });

  //   it('clicking thumbs down attempts to send feedback', () => {
  //     const fakeFetch = sinon.spy();
  //     const fakeCreate = sinon.spy();
  //     const props = {
  //       currentUser: {isAdmin: false},
  //       canShow: true,
  //       isLoading: false,
  //       progressV2Feedback: {empty: true},
  //       fetchProgressV2Feedback: fakeFetch,
  //       createProgressV2Feedback: fakeCreate,
  //       errorWhenCreatingOrLoading: null,
  //     };

  //     render(<UnconnectedProgressFeedbackBanner {...props} />);
  //     const thumbsDownButton = screen.getByTitle(
  //       i18n.progressV2_feedback_thumbsDown()
  //     );
  //     expect(thumbsDownButton).to.be.visible;
  //     fireEvent.click(thumbsDownButton);
  //     expect(fakeCreate).to.have.been.calledOnce;
  //   });

  //   it('user is able to close the banner', () => {
  //     const fakeFetch = sinon.spy();
  //     const fakeCreate = sinon.spy();
  //     const props = {
  //       currentUser: {isAdmin: false},
  //       canShow: true,
  //       isLoading: false,
  //       progressV2Feedback: {empty: true},
  //       fetchProgressV2Feedback: fakeFetch,
  //       createProgressV2Feedback: fakeCreate,
  //       errorWhenCreatingOrLoading: null,
  //     };

  //     render(<UnconnectedProgressFeedbackBanner {...props} />);
  //     const thumbsUpButton = screen.getByTitle(
  //       i18n.progressV2_feedback_thumbsUp()
  //     );
  //     expect(thumbsUpButton).to.be.visible;
  //     fireEvent.click(thumbsUpButton);
  //     expect(fakeCreate).to.have.been.calledOnce;
  //     const closeButton = screen.getByText('HEHEHEHE');
  //     expect(closeButton).to.be.visible;
  //     fireEvent.click(closeButton);
  // expect close function to be called
  //   });
});
