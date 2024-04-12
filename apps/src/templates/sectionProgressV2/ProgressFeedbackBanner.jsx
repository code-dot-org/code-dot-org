import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FeedbackBanner, {
  BANNER_STATUS,
} from '@cdo/apps/lib/ui/feedback/FeedbackBanner';
import i18n from '@cdo/locale';

const FOORM_LINK = 'https://studio.code.org/form/new_progress_feedback';

const ProgressFeedbackBanner = ({currentUser}) => {
  return (
    <FeedbackBanner
      alertKey="progress-alert"
      answerStatus={BANNER_STATUS.ANSWERED}
      answer={() => {}}
      close={() => {}}
      isLoading={false}
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
};

export default connect(state => ({
  currentUser: state.currentUser,
}))(ProgressFeedbackBanner);
