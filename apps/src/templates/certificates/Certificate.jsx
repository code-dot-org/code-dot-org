/* global dashboard */
import React, {useRef, useState} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import BackToFrontConfetti from '../BackToFrontConfetti';
import i18n from '@cdo/locale';
import color from '../../util/color';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import SocialShare from './SocialShare';
import LargeChevronLink from './LargeChevronLink';
import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';

function Certificate(props) {
  const [personalized, setPersonalized] = useState(false);
  const [studentName, setStudentName] = useState();
  const nameInputRef = useRef(null);

  const isMinecraft = () =>
    /mc|minecraft|hero|aquatic|mee|mee_empathy|mee_timecraft/.test(
      props.tutorial
    );
  const isAIOceans = () => /oceans/.test(props.tutorial);

  const personalizeCertificate = session => {
    if (isHocTutorial) {
      personalizeHocCertificate(session);
    } else {
      setStudentName(nameInputRef.current.value);
      setPersonalized(true);
    }
  };

  const personalizeHocCertificate = session => {
    $.ajax({
      url: '/v2/certificate',
      type: 'post',
      dataType: 'json',
      data: {
        session_s: session,
        name_s: nameInputRef.current.value
      }
    }).done(response => {
      if (response.certificate_sent) {
        setStudentName(response['name']);
        setPersonalized(true);
      }
    });
  };

  const getEncodedParams = () => {
    const donor = studentName ? props.randomDonorName : null;
    const data = {
      name: studentName,
      course: props.tutorial,
      donor
    };
    return btoa(JSON.stringify(data));
  };

  const getCertificateImagePath = certificate => {
    if (!props.showStudioCertificate) {
      return `${
        dashboard.CODE_ORG_URL
      }/api/hour/certificate/${certificate}.jpg`;
    }

    const filename = getEncodedParams();
    return `/certificate_images/${filename}.jpg`;
  };

  const getPrintPath = certificate => {
    if (!props.showStudioCertificate) {
      let print = `${dashboard.CODE_ORG_URL}/printcertificate/${certificate}`;
      if (isMinecraft() && !personalized) {
        // Correct the minecraft print url for non-personalized certificates.
        print = `${dashboard.CODE_ORG_URL}/printcertificate?s=${
          props.tutorial
        }`;
      }
      if (isAIOceans() && !personalized) {
        // Correct the minecraft print url for non-personalized certificates.
        print = `${dashboard.CODE_ORG_URL}/printcertificate?s=${
          props.tutorial
        }`;
      }
      return print;
    }

    const encoded = getEncodedParams();
    return `/print_certificates/${encoded}`;
  };

  const getCertificateSharePath = certificate => {
    if (!props.showStudioCertificate) {
      return `https:${dashboard.CODE_ORG_URL}/certificates/${certificate}`;
    }

    const encoded = getEncodedParams();
    return `/certificates/${encoded}`;
  };

  const {
    responsiveSize,
    tutorial,
    certificateId,
    randomDonorTwitter,
    under13,
    children,
    initialCertificateImageUrl,
    isHocTutorial
  } = props;

  const certificate = certificateId || 'blank';
  const personalizedCertificate = getCertificateImagePath(certificate);
  const imgSrc = personalized
    ? personalizedCertificate
    : initialCertificateImageUrl;
  const certificateShareLink = getCertificateSharePath(certificate);
  const desktop =
    responsiveSize === ResponsiveSize.lg ||
    responsiveSize === ResponsiveSize.md;
  const headingStyle = desktop ? styles.heading : styles.mobileHeading;
  const certificateStyle = desktop ? styles.desktopHalf : styles.mobileFull;

  const facebook = queryString.stringify({
    u: certificateShareLink
  });

  const twitter = queryString.stringify({
    url: certificateShareLink,
    related: 'codeorg',
    text: randomDonorTwitter
      ? i18n.justDidHourOfCodeDonor({donor_twitter: randomDonorTwitter})
      : i18n.justDidHourOfCode()
  });

  const print = getPrintPath(certificate);

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
        <BackToFrontConfetti active={personalized} style={styles.confetti} />
        <a href={certificateShareLink}>
          <img src={imgSrc} />
        </a>
      </div>
      <div style={certificateStyle}>
        {tutorial && !personalized && (
          <div>
            <h2>{i18n.congratsCertificatePersonalize()}</h2>
            <input
              id="name"
              type="text"
              style={styles.nameInput}
              placeholder={i18n.yourName()}
              ref={nameInputRef}
            />
            <button
              type="button"
              style={styles.submit}
              onClick={personalizeCertificate.bind(this, certificate)}
            >
              {i18n.submit()}
            </button>
          </div>
        )}
        {tutorial && personalized && (
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

Certificate.propTypes = {
  tutorial: PropTypes.string,
  certificateId: PropTypes.string,
  randomDonorTwitter: PropTypes.string,
  randomDonorName: PropTypes.string,
  responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
  under13: PropTypes.bool,
  children: PropTypes.node,
  showStudioCertificate: PropTypes.bool,
  initialCertificateImageUrl: PropTypes.string.isRequired,
  isHocTutorial: PropTypes.bool
};

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
