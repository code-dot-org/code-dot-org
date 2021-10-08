import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {SpecialAnnouncementActionBlock} from './TwoColumnActionBlock';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import Button from '@cdo/apps/templates/Button';
import color from '../../util/color';
import shapes from './shapes';

// MarketingAnnouncementBanner is a wrapper around SpecialAnnouncementActionBlock which adds
// a button to dismiss the banner. It also listens for modifications to the banner through
// optimizely and checks if the new version of the banner has been dismissed.
const MarketingAnnouncementBanner = ({announcement, marginBottom}) => {
  const id = 'special-annoucement-action-block';
  const [displayBanner, setDisplayBanner] = useState(true);

  useEffect(() => {
    if (window['optimizely']) {
      const optimizelyUtils = window['optimizely'].get('utils');
      // When modifications are made to the banner through optimizely, check whether
      // this version of the banner has been dismissed by the teacher
      optimizelyUtils.observeSelector(`#${id}`, checkShouldDisplayBanner);
    }
    checkShouldDisplayBanner();
  }, []);

  const checkShouldDisplayBanner = () => {
    const bannerKey = getLocalStorageBannerKey();
    const displayBanner = tryGetLocalStorage(bannerKey, true);
    if (displayBanner === 'false') {
      setDisplayBanner(false);
    }
  };

  const getLocalStorageBannerKey = () => {
    // The banner ID will be modified by marketing when they create a variation of the banner
    // in optimizely, so we query it from the DOM instead of storing it in the component
    const bannerId = document.getElementById(id).dataset.bannerId;
    return `display-announcement-${bannerId}`;
  };

  const onDismiss = () => {
    const bannerKey = getLocalStorageBannerKey();
    trySetLocalStorage(bannerKey, false);
    setDisplayBanner(false);
  };

  // This banner is hidden through css because it still needs to be accessible
  // in the DOM so that it can be manipulated by Optimizely by marketing.
  // Once it has been modified through optimizely, checkShouldDisplayBanner is called
  // and the value of displayBanner may change.
  const bannerDisplayStyle = displayBanner ? 'block' : 'none';

  return (
    <div
      id={id}
      // When marketing makes a variation of the banner they will
      // update the data-banner-id, we will track variations of the banner
      // through this data attribute
      data-banner-id={announcement.id}
      style={{
        ...styles.container,
        display: bannerDisplayStyle
      }}
    >
      <SpecialAnnouncementActionBlock
        announcement={announcement}
        marginBottom={marginBottom}
      />
      <Button
        text="×"
        onClick={onDismiss}
        style={styles.dismissButtonStyle}
        styleAsText={true}
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'relative'
  },
  dismissButtonStyle: {
    position: 'absolute',
    top: '6px',
    right: '10px',
    color: color.charcoal,
    fontSize: '22px'
  }
};

MarketingAnnouncementBanner.propTypes = {
  announcement: shapes.specialAnnouncement,
  marginBottom: PropTypes.string
};

export default MarketingAnnouncementBanner;
