import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import testImageAccess from '@cdo/apps/code-studio/url_test';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    testImageAccess(
      'https://twitter.com/favicon.ico' + '?' + Math.random(),
      () => setIsTwitterAvailable(true)
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
    <div>
      {/* note that linkedin share doesn't work with localhost urls */}
      {!under13 && isPlCourse && isLinkedinAvailable && (
        <a
          href={linkedShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => onShare(e, 'linkedin')}
        >
          <button
            type="button"
            style={{background: color.linkedin_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-linkedin" title={i18n.shareToLinkedIn()} />
          </button>
        </a>
      )}

      {!under13 && isFacebookAvailable && (
        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => onShare(e, 'facebook')}
        >
          <button
            type="button"
            style={{background: color.facebook_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-facebook" title={i18n.shareToFacebook()} />
          </button>
        </a>
      )}
      {!under13 && isTwitterAvailable && (
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => onShare(e, 'twitter')}
        >
          <button
            type="button"
            style={{background: color.twitter_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-twitter" title={i18n.shareToTwitter()} />
          </button>
        </a>
      )}
      <a href={print} className="social-print-link">
        <button type="button" style={styles.printButton}>
          <i className="fa fa-print" />
          {' ' + i18n.print()}
        </button>
      </a>
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

const styles = {
  shareButton: {
    color: color.white,
    minWidth: 40,
  },
  printButton: {
    backgroundColor: 'transparent',
    borderColor: color.black,
    borderWidth: '1px',
    padding: '10px 20px',
  },
};
