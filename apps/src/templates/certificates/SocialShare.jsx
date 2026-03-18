import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import testImageAccess from '@cdo/apps/code-studio/url_test';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import moduleStyles from './social_share.module.scss';

export default function SocialShare({
  facebook,
  twitter,
  linkedin,
  print,
  under13,
  isPlCourse,
  userType,
}) {
  const [isTwitterAvailable, setIsTwitterAvailable] = useState(false);
  const [isFacebookAvailable, setIsFacebookAvailable] = useState(false);
  const [isLinkedinAvailable, setIsLinkedinAvailable] = useState(false);

  useEffect(() => {
    testImageAccess(
      'https://facebook.com/favicon.ico' + '?' + Math.random(),
      () => setIsFacebookAvailable(true)
    );
  }, []);
  useEffect(() => {
    testImageAccess('https://x.com/favicon.ico' + '?' + Math.random(), () =>
      setIsTwitterAvailable(true)
    );
  }, []);
  useEffect(() => {
    testImageAccess(
      'https://www.linkedin.com/favicon.ico' + '?' + Math.random(),
      () => setIsLinkedinAvailable(true)
    );
  }, []);

  const onShare = (e, platform) => {
    if (userType === 'teacher') {
      analyticsReporter.sendEvent(EVENTS.CERTIFICATE_SHARED, {platform});
    }
    window.dashboard?.popupWindow(e);
  };

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?${facebook}`;
  const twitterShareUrl = `https://twitter.com/share?${twitter}`;
  const linkedShareUrl = `https://www.linkedin.com/sharing/share-offsite/?${linkedin}`;

  return (
    <div className={moduleStyles.social_share_container}>
      {/* note that linkedin share doesn't work with localhost urls */}
      {!under13 && isPlCourse && isLinkedinAvailable && (
        <MuiIconButton
          variant="contained"
          color="primary"
          size="small"
          onClick={e => onShare(e, 'linkedin')}
          style={{backgroundColor: color.linkedin_blue}}
          href={linkedShareUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeV6Icon
            iconName="linkedin"
            iconFamily="brands"
            title={i18n.shareToLinkedIn()}
          />
        </MuiIconButton>
      )}

      {!under13 && isFacebookAvailable && (
        <MuiIconButton
          variant="contained"
          color="primary"
          size="small"
          onClick={e => onShare(e, 'facebook')}
          style={{backgroundColor: color.facebook_blue}}
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeV6Icon
            iconName="facebook"
            iconFamily="brands"
            title={i18n.shareToFacebook()}
          />
        </MuiIconButton>
      )}
      {!under13 && isTwitterAvailable && (
        <MuiIconButton
          variant="contained"
          color="primary"
          size="small"
          onClick={e => onShare(e, 'twitter')}
          style={{backgroundColor: color.x_black}}
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeV6Icon
            iconName="x-twitter"
            iconFamily="brands"
            title={i18n.shareToTwitter()}
          />
        </MuiIconButton>
      )}
      <MuiButton
        variant="outlined"
        color="tertiary"
        size="small"
        loadingPosition="start"
        className="social-print-link"
        href={print}
        startIcon={<FontAwesomeV6Icon iconName="print" />}
      >
        {i18n.print()}
      </MuiButton>
    </div>
  );
}

SocialShare.propTypes = {
  facebook: PropTypes.string.isRequired,
  twitter: PropTypes.string.isRequired,
  linkedin: PropTypes.string,
  print: PropTypes.string.isRequired,
  under13: PropTypes.bool,
  isPlCourse: PropTypes.bool,
  userType: PropTypes.string,
};
