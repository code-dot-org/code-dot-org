/* global dashboard */

import React, { PropTypes, Component } from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '../util/color';
import queryString from 'query-string';
import SocialShare from './SocialShare';
import Responsive from '../responsive';
import LargeChevronLink from './LargeChevronLink';

const styles = {
  heading: {
    width: '100%',
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5,
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

const blankCertificates = {
  hourOfCode: require('@cdo/static/hour_of_code_certificate.jpg'),
  minecraft: require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
};

export default class Certificate extends Component {
  constructor() {
    super();
    this.state = {
      personalized: false,
    };
  }

  static propTypes = {
    type: PropTypes.oneOf(['hourOfCode', 'minecraft']).isRequired,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
  };

  personalizeCertificate(session) {
    $.ajax({
      url: '/v2/certificate',
      type: "post",
      dataType: "json",
      data: {
        session_s: session,
        name_s: this.nameInput.value,
      }
    }).done(response => {
      if (response.certificate_sent) {
        this.setState({personalized: true});
      }
    });
  }

  render() {
    const {responsive} = this.props;

    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));

    const headingStyle = desktop ? styles.heading : styles.mobileHeading;
    const blankCertificate = blankCertificates[this.props.type];
    let certificate;
    try {
      certificate = queryString.parse(window.location.search)['i'].replace(/[^a-z0-9_]/, '');
    } catch (e) {
      certificate = '';
    }
    const imgSrc = this.state.personalized ? `${dashboard.CODE_ORG_URL}/api/hour/certificate/${certificate}.jpg` : blankCertificate;

    const facebook = queryString.stringify({
      u: `https:${dashboard.CODE_ORG_URL}/certificates/${certificate}`,
    });

    const twitter = queryString.stringify({
      url: `https:${dashboard.CODE_ORG_URL}/certificates/${certificate}`,
      related: 'codeorg',
      text: i18n.justDidHourOfCode(),
    });

    const print = `${dashboard.CODE_ORG_URL}/printcertificate/${certificate}`;

    return (
      <div>
        <h1 style={headingStyle}>
          {i18n.congratsCertificateHeading()}
        </h1>
        <LargeChevronLink
          link={document.referrer}
          linkText={i18n.backToActivity()}
          isRtl={this.props.isRtl}
        />
        <div style={styles.personalize}>
          {this.state.personalized ?
            <div>
              <h2>{i18n.congratsCertificateThanks()}</h2>
              <p>{i18n.congratsCertificateContinue()}</p>
            </div> :
            <div>
              <h2>{i18n.congratsCertificatePersonalize()}</h2>
              <input
                type="text"
                style={styles.nameInput}
                placeholder={i18n.yourName()}
                ref={input => this.nameInput = input}
              />
              <button
                style={styles.submit}
                onClick={this.personalizeCertificate.bind(this, certificate)}
              >
                {i18n.submit()}
              </button>
            </div>
          }
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
