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

  // Only show if DCDO flag is set to true
  // Otherwise return null
  if (!!DCDO.get('csa-skinny-banner', false)) {
    return (
      <a
        href={pegasus('/educate/csa')}
        title="Learn more about Code.org's AP® CSA curriculum"
        style={styles.a}
      >
        <aside style={styles.wrapper}>
          <div style={styles.textWrapper}>
            <h1 style={styles.h1}>{header_text}</h1>
            <p style={styles.p}>{text}</p>
          </div>
          <img
            style={styles.img}
            src={IMAGE_BASE_URL + 'csa-skinny-banner-image.png'}
            alt="Two screenshots of the CSA curriculum w/ the College Board AP® CSA Endorsed badge"
          />
          <span style={styles.span}>Learn more</span>
        </aside>
      </a>
    );
  }

  return null;
}

// Styles
const styles = {
  a: {
    textDecoration: 'none'
  },
  wrapper: {
    boxSizing: 'border-box',
    width: '100%',
    height: 120,
    margin: '3em auto 5em',
    padding: '0 2.5em',
    background:
      'url("/blockly/media/csa-skinny-banner-bg.svg") center no-repeat',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
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
  img: {
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
