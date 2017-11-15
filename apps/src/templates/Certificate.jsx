/* global dashboard */

import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import queryString from 'query-string';
import SocialShare from './SocialShare';

const styles = {
  heading: {
    color: color.teal,
    width: '100%',
  },
  image: {
    width: '50%',
  },
  personalize: {
    width: '50%',
    float: 'right',
  },
  nameInput: {
    height: 32,
    margin: 0,
  },
  submit: {
    background: color.orange,
    color: color.white,
  },
};

export default class Certificate extends Component {
  static propTypes = {
  };

  render() {
    const certificate = queryString.parse(window.location.search)['i'].replace(/[^a-z0-9_]/, '');
    const imgSrc = `${dashboard.CODE_ORG_URL}/api/hour/certificate/${certificate}.jpg`;

    const facebook = queryString.stringify({
      u: `${dashboard.CODE_ORG_URL}/certificates/${certificate}`,
    });

    const twitter = queryString.stringify({
      url: `${dashboard.CODE_ORG_URL}/certificates/${certificate}`,
      related: 'codeorg',
      text: i18n.justDidHourOfCode(),
    });

    const print = `${dashboard.CODE_ORG_URL}/printcertificate/${certificate}`;

    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsCertificateHeading()}
        </h1>
        <div style={styles.personalize}>
          <h2>{i18n.congratsCertificatePersonalize()}</h2>
          <input
            type="text"
            style={styles.nameInput}
            placeholder={i18n.yourName()}
          />
          <button style={styles.submit}>
            {i18n.submit()}
          </button>
          <h2>{i18n.congratsCertificateShare()}</h2>
          <SocialShare
            facebook={facebook}
            twitter={twitter}
            print={print}
          />
        </div>
        <div style={styles.image}>
          <img src={imgSrc}/>
        </div>
      </div>
    );
  }
}
