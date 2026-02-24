import {LinkButton} from '@code-dot-org/component-library/button';
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
        <LinkButton
          useAsLink
          size="s"
          href={linkedShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          analyticsCallback={e => onShare(e, 'linkedin')}
          isIconOnly
          icon={{
            iconName: 'linkedin',
            iconFamily: 'brands',
            title: i18n.shareToLinkedIn(),
          }}
          style={{backgroundColor: color.linkedin_blue}}
        />
      )}

      {!under13 && isFacebookAvailable && (
        <LinkButton
          useAsLink
          size="s"
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          analyticsCallback={e => onShare(e, 'facebook')}
          isIconOnly
          icon={{
            iconName: 'facebook',
            iconFamily: 'brands',
            title: i18n.shareToFacebook(),
          }}
          style={{backgroundColor: color.facebook_blue}}
        />
      )}
      {!under13 && isTwitterAvailable && (
        <LinkButton
          useAsLink
          size="s"
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          analyticsCallback={e => onShare(e, 'twitter')}
          isIconOnly
          icon={{
            iconName: 'x-twitter',
            iconFamily: 'brands',
            title: i18n.shareToTwitter(),
          }}
          style={{backgroundColor: color.x_black}}
        />
      )}
      <LinkButton
        useAsLink
        href={print}
        type="secondary"
        size="s"
        color="gray"
        className="social-print-link"
        iconLeft={{iconName: 'print'}}
        text={i18n.print()}
      />
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
