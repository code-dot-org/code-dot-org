import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedProgressFeedbackBanner} from '@cdo/apps/templates/sectionProgressV2/ProgressFeedbackBanner';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ProgressFeedbackBanner', () => {
  const fakeFetch = sinon.spy();
  const fakeCreate = sinon.spy();
  const defaultProps = {
    currentUser: {isAdmin: false},
    canShow: true,
    isLoading: false,
    progressV2Feedback: {empty: true},
    fetchProgressV2Feedback: () => {},
    createProgressV2Feedback: () => {},
    errorWhenCreatingOrLoading: null,
  };

  afterEach(() => {
    fakeCreate.resetHistory();
    fakeFetch.resetHistory();
  });

  it('renders empty if it can not show', () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        canShow={false}
        fetchProgressV2Feedback={fakeFetch}
      />
    );
    expect(fakeFetch).to.have.been.calledOnce;
    const questionText = screen.queryByText(
      i18n.progressV2_feedback_question()
    );
    const shareMoreText = screen.queryByText(
      i18n.progressV2_feedback_shareMore()
    );
    expect(questionText).to.not.exist;
    expect(shareMoreText).to.not.exist;
  });

  it('renders empty if user already answered the feedback question', () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        progressV2Feedback={{empty: false}}
        fetchProgressV2Feedback={fakeFetch}
      />
    );
    expect(fakeFetch).to.have.been.calledOnce;
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
    render(<UnconnectedProgressFeedbackBanner {...defaultProps} />);
    expect(screen.getByText(i18n.progressV2_feedback_question())).to.be.visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsUp())).to.be
      .visible;
    expect(screen.getByTitle(i18n.progressV2_feedback_thumbsDown())).to.be
      .visible;
  });

  it('renders correctly when the data is loading', () => {
    render(
      <UnconnectedProgressFeedbackBanner {...defaultProps} isLoading={true} />
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

  it('clicking thumbs up attempts to send feedback and asks for more detailed feedback', async () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        createProgressV2Feedback={fakeCreate}
      />
    );
    const thumbsUpButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsUp()
    );
    expect(thumbsUpButton).to.be.visible;
    fireEvent.click(thumbsUpButton);

    await waitFor(() => {
      expect(fakeCreate).to.have.been.calledOnce;
    });
    const shareMoreText = screen.getByText(
      i18n.progressV2_feedback_shareMore()
    );
    const shareMoreLink = screen.getByRole('link', {
      name: i18n.progressV2_feedback_shareMoreLinkText(),
    });
    expect(shareMoreLink).to.be.visible;
    expect(shareMoreText).to.be.visible;
  });

  it('clicking thumbs down attempts to send feedback and asks for more detailed feedback', async () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        createProgressV2Feedback={fakeCreate}
      />
    );
    const thumbsDownButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsDown()
    );
    expect(thumbsDownButton).to.be.visible;
    fireEvent.click(thumbsDownButton);
    await waitFor(() => {
      expect(fakeCreate).to.have.been.calledOnce;
    });

    const shareMoreText = screen.getByText(
      i18n.progressV2_feedback_shareMore()
    );
    const shareMoreLink = screen.getByRole('link', {
      name: i18n.progressV2_feedback_shareMoreLinkText(),
    });
    expect(shareMoreLink).to.be.visible;
    expect(shareMoreText).to.be.visible;
  });

  it('user is able to close the banner', async () => {
    render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        createProgressV2Feedback={fakeCreate}
      />
    );

    // Give feedback
    const thumbsUpButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsUp()
    );
    expect(thumbsUpButton).to.be.visible;
    fireEvent.click(thumbsUpButton);
    expect(fakeCreate).to.have.been.calledOnce;

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

  it('attempts reset and reload if error from createFeedback', async () => {
    const {rerender} = render(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        errorWhenCreatingOrLoading={null}
        fetchProgressV2Feedback={fakeFetch}
      />
    );

    // Give feedback
    const thumbsUpButton = screen.getByTitle(
      i18n.progressV2_feedback_thumbsUp()
    );
    expect(thumbsUpButton).to.be.visible;
    fireEvent.click(thumbsUpButton);

    rerender(
      <UnconnectedProgressFeedbackBanner
        {...defaultProps}
        errorWhenCreatingOrLoading={'This produced an error.'}
        fetchProgressV2Feedback={fakeFetch}
      />
    );

    await waitFor(() => {
      expect(fakeFetch).to.have.been.calledTwice;
    });
    expect(screen.getByText(i18n.progressV2_feedback_question())).to.be.visible;
  });
});
