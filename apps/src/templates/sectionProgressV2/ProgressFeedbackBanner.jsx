import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FeedbackBanner, {
  BANNER_STATUS,
} from '@cdo/apps/lib/ui/feedback/FeedbackBanner';
import i18n from '@cdo/locale';

import {
  createProgressV2Feedback,
  fetchProgressV2Feedback,
} from './progressV2FeedbackRedux';

const FOORM_LINK = 'https://studio.code.org/form/new_progress_feedback';

const ProgressFeedbackBanner = ({
  canShow,
  isLoading,
  progressV2Feedback,
  fetchProgressV2Feedback,
  createProgressV2Feedback,
  errorWhenCreatingOrLoading,
}) => {
  const [bannerStatus, setBannerStatus] = React.useState(BANNER_STATUS.UNSET);
  const [answered, setAnswered] = React.useState(false);

  // Load feedback on mount
  React.useEffect(() => {
    fetchProgressV2Feedback();
  }, [fetchProgressV2Feedback]);

  React.useEffect(() => {
    // If we can't show the banner, it is unavailable
    if (!canShow) {
      setBannerStatus(BANNER_STATUS.UNAVAILABLE);
      return;
    }

    // If we are loading or already closed, we shouldn't change states
    if (isLoading || bannerStatus === BANNER_STATUS.CLOSED) {
      return;
    }

    // If we just answered the banner, set it to answered
    if (answered && bannerStatus === BANNER_STATUS.UNANSWERED) {
      setBannerStatus(BANNER_STATUS.ANSWERED);
      return;
    }

    console.log(progressV2Feedback);
    console.log(answered);
    console.log(bannerStatus);

    // If feedback has been loaded and empty and the user hasn't answered, it is unanswered.
    // If we have feedback and the user did not just submit feedback, close the banner.
    if (progressV2Feedback && !answered) {
      if (progressV2Feedback.empty) {
        setBannerStatus(BANNER_STATUS.UNANSWERED);
      } else {
        setBannerStatus(BANNER_STATUS.CLOSED);
      }
    }
  }, [
    progressV2Feedback,
    bannerStatus,
    canShow,
    isLoading,
    answered,
    fetchProgressV2Feedback,
  ]);

  /**
   * Effect for handling errors.
   */
  React.useEffect(() => {
    errorWhenCreatingOrLoading && setBannerStatus(BANNER_STATUS.UNSET);
  }, [errorWhenCreatingOrLoading]);

  const answer = satisfied => {
    if (bannerStatus === BANNER_STATUS.UNANSWERED) {
      setAnswered(true);
      createProgressV2Feedback(satisfied);
    }
  };

  const close = () => {
    setBannerStatus(BANNER_STATUS.CLOSED);
  };

  return (
    <FeedbackBanner
      alertKey="progress-alert"
      answerStatus={bannerStatus}
      answer={answer}
      close={close}
      isLoading={isLoading}
      closeLabel={i18n.closeDialog()}
      question={i18n.progressV2_feedback_question()}
      positiveAnswer={i18n.progressV2_feedback_thumbsUp()}
      negativeAnswer={i18n.progressV2_feedback_thumbsDown()}
      shareMore={i18n.progressV2_feedback_shareMore()}
      shareMoreLink={FOORM_LINK}
      shareMoreLinkText={i18n.progressV2_feedback_shareMoreLinkText()}
    />
  );
};

ProgressFeedbackBanner.propTypes = {
  currentUser: PropTypes.object.isRequired,
  canShow: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  progressV2Feedback: PropTypes.object,
  fetchProgressV2Feedback: PropTypes.func.isRequired,
  createProgressV2Feedback: PropTypes.func.isRequired,
  errorWhenCreatingOrLoading: PropTypes.string,
};

export const UnconnectedProgressFeedbackBanner = ProgressFeedbackBanner;

export default connect(
  state => ({
    currentUser: state.currentUser,
    isLoading: state.progressV2Feedback.isLoading,
    progressV2Feedback: state.progressV2Feedback.progressV2Feedback,
    errorWhenCreatingOrLoading: state.progressV2Feedback.error,
  }),
  {
    fetchProgressV2Feedback,
    createProgressV2Feedback,
  }
)(ProgressFeedbackBanner);
