import PropTypes from 'prop-types';
import React from 'react';

import {BANNER_STATUS} from '@cdo/apps/lib/ui/feedback/FeedbackBanner';

import ComingSoonBanner from './ComingSoonBanner';
import ProgressFeedbackBanner from './ProgressFeedbackBanner';

export default function ProgressBanners({hasJustSwitchedToV2}) {
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  const bannerStatusCallback = bannerStatus => {
    // Show the coming soon banner if the feedback banner was already completed or the toggle was used.
    setShowComingSoon(
      bannerStatus === BANNER_STATUS.PREVIOUSLY_ANSWERED || hasJustSwitchedToV2
    );
  };

  // Only show the feedback banner if we are on the v2 table AND
  // the toggle between v1 and v2 has not been used.
  return (
    <>
      <ProgressFeedbackBanner
        canShow={!hasJustSwitchedToV2}
        bannerStatusCallback={bannerStatusCallback}
      />
      <ComingSoonBanner canShow={showComingSoon} />
    </>
  );
}

ProgressBanners.propTypes = {
  hasJustSwitchedToV2: PropTypes.bool,
};
