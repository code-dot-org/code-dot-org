import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import ProgressFeedbackBanner from './ProgressFeedbackBanner';

function ProgressBanners({hasJustSwitchedToV2, userCreatedAt}) {
  // Only show the feedback banner if we are on the v2 table AND
  // the toggle between v1 and v2 has not been used AND the user
  // was created before the automatic enrollment started for new users

  const userAutomaticallyEnrolledInV2 =
    new Date(userCreatedAt) > new Date('2024-08-02');

  return (
    <>
      <ProgressFeedbackBanner
        canShow={!hasJustSwitchedToV2 && !userAutomaticallyEnrolledInV2}
      />
    </>
  );
}

ProgressBanners.propTypes = {
  hasJustSwitchedToV2: PropTypes.bool,
  userCreatedAt: PropTypes.string,
};

export const UnconnectedProgressBanners = ProgressBanners;

export default connect(state => ({
  userCreatedAt: state.currentUser.userCreatedAt,
}))(ProgressBanners);
