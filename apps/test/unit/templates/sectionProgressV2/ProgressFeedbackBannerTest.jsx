import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import {UnconnectedProgressFeedbackBanner} from '@cdo/apps/templates/sectionProgressV2/ProgressFeedbackBanner';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

describe('UnconnectedProgressFeedbackBanner', () => {
  const fakeFetch = sinon.spy();
  const fakeCreate = sinon.spy();
  const defaultProps = {
    currentUser: {isAdmin: false},
    canShow: false,
    isLoading: false,
    progressV2Feedback: {empty: true},
    fetchProgressV2Feedback: fakeFetch,
    createProgressV2Feedback: fakeCreate,
    errorWhenCreatingOrLoading: null,
  };

  it('renders correctly with initial state', () => {
    render(<UnconnectedProgressFeedbackBanner {...defaultProps} />);
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
    render(
      <UnconnectedProgressFeedbackBanner {...defaultProps} canShow={true} />
    );
    expect(screen.getByText(i18n.progressV2_feedback_question())).to.be.visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsUp())).to.be
      .visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsDown())).to.be
      .visible;
  });

  it('renders correctly when the data is loading', () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        canShow={true}
        isLoading={true}
      />
    );
    const questionText = screen.queryByText(
      i18n.progressV2_feedback_question()
    );
    const shareMoreText = screen.queryByText(
      i18n.progressV2_feedback_shareMore()
    );
    expect(questionText).to.not.exist;
    expect(shareMoreText).to.not.exist;
  });

  //   it('clicking thumbs up attempts to send feedback and asks for more detailed feedback', () => {
  //     render(
  //       <UnconnectedProgressFeedbackBanner {...defaultProps} canShow={true} />
  //     );
  //     const thumbsUpButton = screen.getByTitle(
  //       i18n.progressV2_feedback_thumbsUp()
  //     );
  //     expect(thumbsUpButton).to.be.visible;
  //     fireEvent.click(thumbsUpButton);
  //     expect(fakeCreate).to.have.been.calledOnce;
  //     const shareMoreText = screen.getByText(
  //       i18n.progressV2_feedback_shareMore()
  //     );
  //     const shareMoreLink = screen.getByRole('link', {
  //       name: i18n.progressV2_feedback_shareMoreLinkText(),
  //     });
  //     expect(shareMoreLink).to.be.visible;
  //     expect(shareMoreText).to.be.visible;
  //   });

  //   it('clicking thumbs down attempts to send feedback and asks for more detailed feedback', () => {
  //     render(
  //       <UnconnectedProgressFeedbackBanner {...defaultProps} canShow={true} />
  //     );
  //     const thumbsDownButton = screen.getByTitle(
  //       i18n.progressV2_feedback_thumbsDown()
  //     );
  //     expect(thumbsDownButton).to.be.visible;
  //     fireEvent.click(thumbsDownButton);
  //     expect(fakeCreate).to.have.been.calledOnce;
  //   });

  it('user is able to close the banner', async () => {
    render(
      <UnconnectedProgressFeedbackBanner {...defaultProps} canShow={true} />
    );

    // Give feedback
    const thumbsUpButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsUp()
    );
    expect(thumbsUpButton).to.be.visible;
    fireEvent.click(thumbsUpButton);
    await waitFor(() => {
      expect(fakeCreate).to.have.been.calledOnce;
    });
    screen.debug();

    // Close the banner
    const closeButton = screen.getByText('×');
    expect(closeButton).to.be.visible;
    fireEvent.click(closeButton);
    await waitFor(() => {
      const questionText = screen.queryByText(
        i18n.progressV2_feedback_question()
      );
      const shareMoreText = screen.queryByText(
        i18n.progressV2_feedback_shareMore()
      );
      expect(questionText).to.not.exist;
      expect(shareMoreText).to.not.exist;
    });
  });
});
