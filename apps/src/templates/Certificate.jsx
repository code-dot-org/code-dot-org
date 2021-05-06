/* global dashboard */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import BackToFrontConfetti from './BackToFrontConfetti';
import i18n from '@cdo/locale';
import color from '../util/color';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import SocialShare from './SocialShare';
import LargeChevronLink from './LargeChevronLink';
import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';

const blankCertificates = {
  hourOfCode: require('@cdo/static/hour_of_code_certificate.jpg'),
  oceans: require('@cdo/static/oceans_hoc_certificate.png'),
  mc: require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
  minecraft: require('@cdo/static/MC_Hour_Of_Code_Certificate.png'),
  hero: require('@cdo/static/MC_Hour_Of_Code_Certificate_Hero.png'),
  aquatic: require('@cdo/static/MC_Hour_Of_Code_Certificate_Aquatic.png'),
  mee: require('@cdo/static/MC_Hour_Of_Code_Certificate_mee.png'),
  mee_empathy: require('@cdo/static/MC_Hour_Of_Code_Certificate_mee_empathy.png')
};

class Certificate extends Component {
  constructor() {
    super();
    this.state = {
      personalized: false
    };
  }

  static propTypes = {
    tutorial: PropTypes.string,
    certificateId: PropTypes.string,
    randomDonorTwitter: PropTypes.string,
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    under13: PropTypes.bool,
    children: PropTypes.node
  };

  isMinecraft = () =>
    /mc|minecraft|hero|aquatic|mee|mee_empathy/.test(this.props.tutorial);
  isAIOceans = () => /oceans/.test(this.props.tutorial);

  personalizeCertificate(session) {
    $.ajax({
      url: '/v2/certificate',
      type: 'post',
      dataType: 'json',
      data: {
        session_s: session,
        name_s: this.nameInput.value
      }
    }).done(response => {
      if (response.certificate_sent) {
        this.setState({personalized: true});
      }
    });
  }

  render() {
    const {
      responsiveSize,
      tutorial,
      certificateId,
      randomDonorTwitter,
      under13,
      children
    } = this.props;
    const certificate = certificateId || 'blank';
    const personalizedCertificate = `${
      dashboard.CODE_ORG_URL
    }/api/hour/certificate/${certificate}.jpg`;
    const blankCertificate =
      blankCertificates[tutorial] || blankCertificates.hourOfCode;
    const imgSrc = this.state.personalized
      ? personalizedCertificate
      : blankCertificate;
    const certificateLink = `https:${
      dashboard.CODE_ORG_URL
    }/certificates/${certificate}`;
    const desktop =
      responsiveSize === ResponsiveSize.lg ||
      responsiveSize === ResponsiveSize.md;
    const headingStyle = desktop ? styles.heading : styles.mobileHeading;
    const certificateStyle = desktop ? styles.desktopHalf : styles.mobileFull;

    const facebook = queryString.stringify({
      u: certificateLink
    });

    const twitter = queryString.stringify({
      url: certificateLink,
      related: 'codeorg',
      text: randomDonorTwitter
        ? i18n.justDidHourOfCodeDonor({donor_twitter: randomDonorTwitter})
        : i18n.justDidHourOfCode()
    });

    let print = `${dashboard.CODE_ORG_URL}/printcertificate/${certificate}`;
    if (this.isMinecraft() && !this.state.personalized) {
      // Correct the minecraft print url for non-personalized certificates.
      print = `${dashboard.CODE_ORG_URL}/printcertificate?s=${tutorial}`;
    }
    if (this.isAIOceans() && !this.state.personalized) {
      // Correct the minecraft print url for non-personalized certificates.
      print = `${dashboard.CODE_ORG_URL}/printcertificate?s=${tutorial}`;
    }

    return (
      <div style={styles.container}>
        <h1 style={headingStyle}>{i18n.congratsCertificateHeading()}</h1>
        {tutorial && (
          <LargeChevronLink
            link={`/s/${tutorial}`}
            linkText={i18n.backToActivity()}
          />
        )}
        <div id="uitest-certificate" style={certificateStyle}>
          <BackToFrontConfetti
            active={this.state.personalized}
            style={styles.confetti}
          />
          <a href={certificateLink}>
            <img src={imgSrc} />
          </a>
        </div>
        <div style={certificateStyle}>
          {tutorial && !this.state.personalized && (
            <div>
              <h2>{i18n.congratsCertificatePersonalize()}</h2>
              <input
                id="name"
                type="text"
                style={styles.nameInput}
                placeholder={i18n.yourName()}
                ref={input => (this.nameInput = input)}
              />
              <button
                type="button"
                style={styles.submit}
                onClick={this.personalizeCertificate.bind(this, certificate)}
              >
                {i18n.submit()}
              </button>
            </div>
          )}
          {tutorial && this.state.personalized && (
            <div>
              <h2 id="uitest-thanks">{i18n.congratsCertificateThanks()}</h2>
              <p>{i18n.congratsCertificateContinue()}</p>
            </div>
          )}
          <h2>{i18n.congratsCertificateShare()}</h2>
          <SocialShare
            facebook={facebook}
            twitter={twitter}
            print={print}
            under13={under13}
          />
        </div>
        {children}
      </div>
    );
  }
}

const styles = {
  heading: {
    width: '100%'
  },
  container: {
    marginBottom: 50,
    float: 'left'
  },
  mobileHeading: {
    fontSize: 24,
    lineHeight: 1.5
  },
  desktopHalf: {
    width: '50%',
    float: 'left'
  },
  mobileFull: {
    width: '100%',
    float: 'left'
  },
  nameInput: {
    height: 32,
    margin: 0
  },
  submit: {
    background: color.orange,
    color: color.white
  },
  confetti: {
    top: 100
  }
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize
}))(Certificate);
