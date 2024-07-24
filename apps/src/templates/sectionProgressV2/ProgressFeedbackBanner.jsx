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

  // Load feedback on mount
  React.useEffect(() => {
    fetchProgressV2Feedback();
  }, [fetchProgressV2Feedback]);

  React.useEffect(() => {
    // If we can't show the banner, it is unavailable
    if (!canShow) {
      setBannerStatus(BANNER_STATUS.UNAVAILABLE);
      return;
    } else if (bannerStatus === BANNER_STATUS.UNAVAILABLE) {
      setBannerStatus(BANNER_STATUS.UNSET);
      return;
    }

    // If feedback has been loaded and empty and the user hasn't answered, it is unanswered.
    // If we have feedback and the user did not just submit feedback, set to previously-answered.
    if (
      !isLoading &&
      bannerStatus === BANNER_STATUS.UNSET &&
      progressV2Feedback
    ) {
      if (progressV2Feedback.empty) {
        setBannerStatus(BANNER_STATUS.UNANSWERED);
      } else {
        setBannerStatus(BANNER_STATUS.PREVIOUSLY_ANSWERED);
      }
    }
  }, [
    progressV2Feedback,
    bannerStatus,
    canShow,
    isLoading,
    fetchProgressV2Feedback,
  ]);

  /**
   * Effect for handling errors.
   */
  React.useEffect(() => {
    if (errorWhenCreatingOrLoading) {
      setBannerStatus(BANNER_STATUS.UNSET);
      fetchProgressV2Feedback();
    }
  }, [errorWhenCreatingOrLoading, fetchProgressV2Feedback]);

  const answer = satisfied => {
    if (bannerStatus === BANNER_STATUS.UNANSWERED) {
      createProgressV2Feedback(satisfied);
      setBannerStatus(BANNER_STATUS.ANSWERED);
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
      isLoading={isLoading || bannerStatus === BANNER_STATUS.UNSET}
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
  canShow: PropTypes.bool,
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
