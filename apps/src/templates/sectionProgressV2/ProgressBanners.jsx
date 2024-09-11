import PropTypes from 'prop-types';
import React from 'react';

import ProgressFeedbackBanner from './ProgressFeedbackBanner';

export default function ProgressBanners({hasJustSwitchedToV2}) {
  // Only show the feedback banner if we are on the v2 table AND
  // the toggle between v1 and v2 has not been used.
  return (
    <>
      <ProgressFeedbackBanner canShow={!hasJustSwitchedToV2} />
    </>
  );
}

ProgressBanners.propTypes = {
  hasJustSwitchedToV2: PropTypes.bool,
};
