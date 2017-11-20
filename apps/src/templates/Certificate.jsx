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
  container: {
    marginBottom: 50,
    float: 'left'
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5,
  },
  desktopHalf: {
    width: '50%',
    float: 'left',
  },
  mobileFull: {
    width: '100%',
    float: 'left',
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
  mc: require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
  minecraft: require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
  hero: require('@cdo/static/MC_Hour_Of_Code_Certificate_Hero.png'),
};

export default class Certificate extends Component {
  constructor() {
    super();
    this.state = {
      personalized: false,
    };
  }

  static propTypes = {
    tutorial: PropTypes.string,
    certificateId: PropTypes.string,
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
    const {responsive, isRtl, tutorial, certificateId} = this.props;
    const certificate = certificateId || 'blank';
    const personalizedCertificate = `${dashboard.CODE_ORG_URL}/api/hour/certificate/${certificate}.jpg`;
    const blankCertificate = blankCertificates[tutorial] || blankCertificates.hourOfCode;
    const imgSrc = this.state.personalized ? personalizedCertificate : blankCertificate;
    const certificateLink = `https:${dashboard.CODE_ORG_URL}/certificates/${certificate}`;
    const desktop = (responsive.isResponsiveCategoryActive('lg') || responsive.isResponsiveCategoryActive('md'));
    const headingStyle = desktop ? styles.heading : styles.mobileHeading;
    const certificateStyle = desktop ? styles.desktopHalf : styles.mobileFull;

    const facebook = queryString.stringify({
      u: certificateLink,
    });

    const twitter = queryString.stringify({
      url: certificateLink,
      related: 'codeorg',
      text: i18n.justDidHourOfCode(),
    });

    const isMinecraft = /mc|minecraft|hero/.test(tutorial);

    let print = `${dashboard.CODE_ORG_URL}/printcertificate/${certificate}`;
    if (isMinecraft && !this.state.personalized) {
      // Correct the minecraft print url for non-personalized certificates.
      print = `${dashboard.CODE_ORG_URL}/printcertificate?s=${tutorial}`;
    }

    return (
      <div style={styles.container}>
        <h1 style={headingStyle}>
          {i18n.congratsCertificateHeading()}
        </h1>
        {tutorial && (
          <LargeChevronLink
            link={`/s/${tutorial}`}
            linkText={i18n.backToActivity()}
            isRtl={isRtl}
          />
        )}
        <div style={certificateStyle}>
          <a href={certificateLink}>
            <img src={imgSrc} />
          </a>
        </div>
        <div style={certificateStyle}>
          {tutorial && !this.state.personalized && (
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
          )}
          {tutorial && this.state.personalized && (
            <div>
              <h2>{i18n.congratsCertificateThanks()}</h2>
              <p>{i18n.congratsCertificateContinue()}</p>
            </div>
          )}
          <h2>{i18n.congratsCertificateShare()}</h2>
          <SocialShare
            facebook={facebook}
            twitter={twitter}
            print={print}
          />
        </div>
      </div>
    );
  }
}
