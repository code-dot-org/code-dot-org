import React from 'react';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '@cdo/apps/util/color';
import DCDO from '@cdo/apps/dcdo';

const IMAGE_BASE_URL = '/blockly/media/';

// Skinny banner component
// Current: CSA Launch May 2022
export default function MarketingSkinnyBanner() {
  const header_text = 'A new approach to AP® CSA!';
  const text =
    'Creative projects and real world connections in our equity-driven curriculum';

  // Only show if DCDO flag is set to true.
  // Otherwise return null.
  if (!!DCDO.get('csa-skinny-banner', false)) {
    return (
      <a
        href={pegasus('/educate/csa')}
        title="Learn more about Code.org's AP® CSA curriculum"
      >
        <aside style={styles.csaSkinnyBanner}>
          <div style={styles.wrapper}>
            <div style={styles.textWrapper}>
              <h1 style={styles.h1}>{header_text}</h1>
              <p style={styles.p}>{text}</p>
            </div>
            <div style={styles.imgWrapper}>
              <img
                src={IMAGE_BASE_URL + 'csa-skinny-banner-image.png'}
                alt="Two screenshots of the CSA curriculum w/ the College Board AP® CSA Endorsed badge"
              />
            </div>
            <span style={styles.span}>Learn more</span>
          </div>
        </aside>
      </a>
    );
  }

  return null;
}

// Styles
const styles = {
  csaSkinnyBanner: {
    width: '100%',
    display: 'inline-block',
    boxSizing: 'border-box',
    height: 120,
    marginBottom: '2em',
    padding: '0 2.5em',
    backgroundColor: color.purple,
    background:
      'url("/blockly/media/csa-skinny-banner-bg.svg") center center no-repeat',
    overflow: 'hidden'
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    height: '100%'
  },
  textWrapper: {
    color: color.white,
    width: 370
  },
  h1: {
    color: color.white,
    fontFamily: '"Gotham 7r", sans-serif',
    fontSize: 23,
    margin: 0
  },
  p: {
    color: color.white,
    fontSize: 16,
    lineHeight: '1.4'
  },
  imgWrapper: {
    width: 315,
    marginBottom: -8
  },
  span: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    background: color.orange,
    margin: 0,
    padding: '0.65em 2em',
    borderRadius: 4,
    textDecoration: 'none'
  }
};
