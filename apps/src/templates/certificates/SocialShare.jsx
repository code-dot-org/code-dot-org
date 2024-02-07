import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import testImageAccess from '@cdo/apps/code-studio/url_test';

export default function SocialShare({
  facebook,
  twitter,
  linkedin,
  print,
  under13,
  isPlCourse,
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
          onClick={dashboard?.popupWindow}
        >
          <button
            type="button"
            style={{background: color.linkedin_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-linkedin" />
          </button>
        </a>
      )}

      {!under13 && isFacebookAvailable && (
        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dashboard?.popupWindow}
        >
          <button
            type="button"
            style={{background: color.facebook_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-facebook" />
          </button>
        </a>
      )}
      {!under13 && isTwitterAvailable && (
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dashboard?.popupWindow}
        >
          <button
            type="button"
            style={{background: color.twitter_blue, ...styles.shareButton}}
            onClick={e => e.preventDefault()}
          >
            <i className="fa fa-twitter" />
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
