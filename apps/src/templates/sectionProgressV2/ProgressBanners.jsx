import PropTypes from 'prop-types';
import React from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import ProgressFeedbackBanner from './ProgressFeedbackBanner';

export default function ProgressBanners({canShow}) {
  const [showComingSoon, setShowComingSoon] = React.useState(false);

  const feedbackBannerVisibilityCallback = isVisible => {
    setShowComingSoon(isVisible);
  };

  return (
    <>
      <ProgressFeedbackBanner
        canShow={canShow}
        visibilityCallback={feedbackBannerVisibilityCallback}
      />
      <Fade in={showComingSoon} unmountOnExit={true}>
        <div>Coming soon</div>
      </Fade>
    </>
  );
}

ProgressBanners.propTypes = {
  canShow: PropTypes.bool.isRequired,
};
