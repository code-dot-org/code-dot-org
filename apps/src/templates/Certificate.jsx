/* global dashboard */

import React, { PropTypes, Component } from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import queryString from 'query-string';

const styles = {
  heading: {
    color: color.teal,
    width: '100%',
  },
  image: {
    width: '50%',
  },
};

export default class Certificate extends Component {
  static propTypes = {
  };

  render() {
    const certificate = queryString.parse(window.location.search)['i'].replace(/[^a-z0-9_]/, '');
    const imgSrc = `${dashboard.CODE_ORG_URL}/api/hour/certificate/${certificate}.jpg`;

    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsCertificateHeading()}
        </h1>
        <div style={styles.image}>
          <img src={imgSrc}/>
        </div>
      </div>
    );
  }
}
