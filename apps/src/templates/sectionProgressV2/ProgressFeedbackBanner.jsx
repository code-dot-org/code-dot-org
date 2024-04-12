import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FeedbackBanner, {
  BANNER_STATUS,
} from '@cdo/apps/lib/ui/feedback/FeedbackBanner';

const ProgressFeedbackBanner = () => {
  return (
    <FeedbackBanner
      alertKey="progress-alert"
      answerStatus={BANNER_STATUS.UNANSWERED}
      answer={() => {}}
      close={() => {}}
      isLoading={false}
      closeLabel={'test'}
      question={'test?'}
      positiveAnswer={'yes'}
      negativeAnswer={'no'}
      shareMore={'more please'}
      shareMoreLink={'https://www.example.com'}
      shareMoreLinkText={'linky'}
    />
  );
};

ProgressFeedbackBanner.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export default connect(state => ({
  currentUser: state.currentUser,
}))(ProgressFeedbackBanner);
