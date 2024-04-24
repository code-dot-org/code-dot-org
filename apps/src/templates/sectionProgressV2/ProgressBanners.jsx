import PropTypes from 'prop-types';
import React from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import {BANNER_STATUS} from '@cdo/apps/lib/ui/feedback/FeedbackBanner';

import ProgressFeedbackBanner from './ProgressFeedbackBanner';

export default function ProgressBanners({toggleUsed, showV2Table}) {
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  const bannerStatusCallback = bannerStatus => {
    // Show the coming soon banner if the feedback banner was already completed or the toggle was used.
    setShowComingSoon(
      bannerStatus === BANNER_STATUS.PREVIOUSLY_ANSWERED || toggleUsed
    );
  };

  // Only show the feedback banner if we are on the v2 table AND
  // the toggle between v1 and v2 has not been used.
  return (
    <>
      <ProgressFeedbackBanner
        canShow={!toggleUsed && showV2Table}
        bannerStatusCallback={bannerStatusCallback}
      />
      <Fade in={showComingSoon} unmountOnExit={true}>
        <div>Coming soon</div>
      </Fade>
    </>
  );
}

ProgressBanners.propTypes = {
  toggleUsed: PropTypes.bool,
  showV2Table: PropTypes.bool,
};
