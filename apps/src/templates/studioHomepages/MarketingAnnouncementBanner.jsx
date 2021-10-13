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
  const id = 'special-announcement-action-block';
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
    let bannerId = announcement.id;

    const optimizelyId = getOptimizelyModifiedElementId();
    if (optimizelyId) {
      bannerId = optimizelyId;
    }

    return `display-announcement-${bannerId}`;
  };

  const getOptimizelyModifiedElementId = () => {
    const allBannerElements = document.getElementById(id).querySelectorAll('*');

    const getOptlyDataAttrKey = element => {
      return Object.keys(element.dataset).find(key => key.includes('optly'));
    };

    // Finds an element that was modified by optimizely if one exists
    const optlyModifiedElement = [...allBannerElements].find(el =>
      getOptlyDataAttrKey(el)
    );

    if (optlyModifiedElement) {
      // Returns the optimizely data attribute key for the changed element
      // will be something like optly-0ef57bf5F12b-4290A4dbA1de95a9b5cd
      return getOptlyDataAttrKey(optlyModifiedElement);
    }
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
      id="homepage-banner"
      style={{
        ...styles.container,
        display: bannerDisplayStyle
      }}
    >
      <div id={id}>
        <SpecialAnnouncementActionBlock
          announcement={announcement}
          marginBottom={marginBottom}
        />
      </div>
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
