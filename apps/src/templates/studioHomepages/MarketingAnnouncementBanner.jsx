import PropTypes from 'prop-types';
import React, {useState, useEffect, useRef, useCallback} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import firehoseClient from '@cdo/apps/metrics/firehose';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import color from '../../util/color';

import shapes from './shapes';
import TwoColumnActionBlock from './TwoColumnActionBlock';

// MarketingAnnouncementBanner is a wrapper around TwoColumnActionBlock
// which adds a button to dismiss the banner.
const MarketingAnnouncementBanner = ({announcement, marginBottom}) => {
  const [displayBanner, setDisplayBanner] = useState(true);
  const bannerRef = useRef(null);

  // The banner may be changed via Google Optimize. In order to correctly
  // record which banner was dismissed, we use the Google Optimize API to
  // determine if a Personalization experiment is active. If so,
  // activeExperiementId will be set to the id of the active experiment.
  // (https://support.google.com/optimize/answer/9059383)
  //
  // Note that Optimize supports multiple experiments on the same page, but
  // there is no supported way to determine which elements on the page were
  // modified by which experiments. We assume that there will be at most one
  // Personalization experiment on a given page and that that experiment updates
  // this banner.
  const [activeExperimentId, setActiveExperimentId] = useState(null);
  useEffect(() => {
    // Sites that use Google Analytics typically have a gtag() function which
    // is used to push data to Google Ad Platform's data layer. Our site does not
    // currently globally define this function so we define a private copy here.
    function _gtag() {
      if (window.dataLayer) {
        window.dataLayer.push(arguments);
      }
    }

    _gtag('event', 'optimize.callback', {
      callback: (variant, experimentId) => {
        // Personalization experiments have variant equal to ''.
        if (variant === '') {
          setActiveExperimentId(experimentId);
        }
      },
    });
  }, []);

  const getLocalStorageBannerKey = useCallback(() => {
    let bannerId = announcement.id;
    if (activeExperimentId) {
      bannerId = activeExperimentId;
    }
    return `display-announcement-${bannerId}`;
  }, [activeExperimentId, announcement.id]);

  const onDismiss = () => {
    const bannerKey = getLocalStorageBannerKey();
    trySetLocalStorage(bannerKey, false);
    setDisplayBanner(false);
    logEvent('close_button_clicked');
  };

  const logEvent = eventLabel => {
    firehoseClient.putRecord(
      {
        study: 'teacher_signedin_homepage',
        study_group: 'homepage_banner',
        event: eventLabel,
        data_json: JSON.stringify({
          banner_title: bannerRef.current.querySelector(
            '.two-column-action-block--sub-heading'
          ).innerText,
        }),
      },
      {includeUserId: true}
    );
  };

  // Set displayBanner value if the function to get the storage banner key
  // has changed.
  useEffect(() => {
    const bannerKey = getLocalStorageBannerKey();
    const displayBannerValue = tryGetLocalStorage(bannerKey, true);
    setDisplayBanner(displayBannerValue !== 'false');
  }, [getLocalStorageBannerKey]);

  // This banner is hidden through css because it still needs to be accessible
  // in the DOM so that it can be manipulated by Google Optimize.
  const bannerDisplayStyle = displayBanner ? 'block' : 'none';

  const button = {
    id: announcement.buttonId
      ? announcement.buttonId
      : 'marketing-announcement-banner-btn',
    url: announcement.buttonUrl,
    text: announcement.buttonText,
    onClick: () => logEvent('cta_button_clicked'),
  };

  return (
    <div
      id="marketing-announcement-banner"
      style={{
        ...styles.container,
        display: bannerDisplayStyle,
      }}
    >
      {/* ID is used for easier targeting in Google Optimize */}
      <div id="special-announcement-action-block" ref={bannerRef}>
        <TwoColumnActionBlock
          imageUrl={pegasus(announcement.image)}
          subHeading={announcement.title}
          description={announcement.body}
          buttons={[button]}
          marginBottom={marginBottom}
        />
      </div>
      <Button
        id="marketing-announcement-banner--dismiss"
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
    position: 'relative',
    marginTop: '16px',
  },
  dismissButtonStyle: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    color: color.neutral_dark40,
    fontSize: '24px',
    fontWeight: '300',
  },
};

MarketingAnnouncementBanner.propTypes = {
  announcement: shapes.specialAnnouncement,
  marginBottom: PropTypes.string,
};

export default MarketingAnnouncementBanner;
