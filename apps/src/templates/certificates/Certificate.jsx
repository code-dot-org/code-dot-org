import React, {useRef, useState} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import BackToFrontConfetti from '../BackToFrontConfetti';
import i18n from '@cdo/locale';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import SocialShare from './SocialShare';
import LargeChevronLink from './LargeChevronLink';
import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';
import style from './congrats.module.scss';
import {
  BodyTwoText,
  BodyThreeText,
  Heading1,
  Heading2,
  Heading3,
} from '@cdo/apps/componentLibrary/typography';

/**
 * Without this, we get an error on the server "invalid byte sequence in UTF-8".
 *
 * Workaround via
 * https://github.com/exupero/saveSvgAsPng/commit/fd9453f576d202dd36e08105cd18d5aed9174d22
 *
 * @param {string} data
 * @returns {string}
 */
function reEncodeNonLatin1(data) {
  var encodedData = encodeURIComponent(data);
  encodedData = encodedData.replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  });
  return decodeURIComponent(encodedData);
}

function Certificate(props) {
  const [personalized, setPersonalized] = useState(false);
  const [studentName, setStudentName] = useState();
  const nameInputRef = useRef(null);

  const personalizeCertificate = session => {
    if (isHocTutorial && session) {
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
        name_s: nameInputRef.current.value,
      },
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
      donor,
    };
    const asciiData = btoa(reEncodeNonLatin1(JSON.stringify(data)));
    const urlSafeData = asciiData
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    // This method complies with “Base 64 Encoding with URL and Filename
    // Safe Alphabet” in RFC 4648. The alphabet uses ‘-’ instead of ‘+’ and
    // ‘_’ instead of ‘/’.
    // NOTE: using replaceAll has causes issues in the test machine due to the
    // version of the google-chrome-stable package installed. replace method has
    // better support.
    return urlSafeData;
  };

  const getCertificateImagePath = () => {
    const filename = getEncodedParams();
    return `/certificate_images/${filename}.jpg`;
  };

  const getPrintPath = () => {
    const encoded = getEncodedParams();
    return `/print_certificates/${encoded}`;
  };

  const getCertificateSharePath = () => {
    const encoded = getEncodedParams();
    return `/certificates/${encoded}`;
  };

  const getExternalCertificateSharePath = () => {
    return `${window.location.origin}${getCertificateSharePath()}`;
  };

  const {
    responsiveSize,
    tutorial,
    certificateId,
    randomDonorTwitter,
    under13,
    children,
    initialCertificateImageUrl,
    isHocTutorial,
  } = props;

  const personalizedCertificate = getCertificateImagePath();
  const imgSrc = personalized
    ? personalizedCertificate
    : initialCertificateImageUrl;
  const certificateShareLink = getCertificateSharePath();
  const externalCertificateShareLink = getExternalCertificateSharePath();
  const desktop =
    responsiveSize === ResponsiveSize.lg ||
    responsiveSize === ResponsiveSize.md;
  const headingStyle = desktop ? style.heading : style.mobileHeading;
  const certificateStyle = desktop ? style.desktopHalf : style.mobileFull;

  const facebook = queryString.stringify({
    u: externalCertificateShareLink,
  });

  const twitter = queryString.stringify({
    url: externalCertificateShareLink,
    related: 'codeorg',
    text: randomDonorTwitter
      ? i18n.justDidHourOfCodeDonor({donor_twitter: randomDonorTwitter})
      : i18n.justDidHourOfCode(),
  });

  const print = getPrintPath();

  return (
    <div className={style.container}>
      <div className={style.headerContainer}>
        <Heading1 className={`${headingStyle} ${style.header}`}>
          {i18n.congratsCertificateHeading()}
        </Heading1>
      </div>
      {tutorial && (
        <LargeChevronLink
          link={`/s/${tutorial}`}
          linkText={i18n.backToActivity()}
        />
      )}
      <div className={style.certificateContainer}>
        <div id="uitest-certificate" className={certificateStyle}>
          <BackToFrontConfetti
            active={personalized}
            className={style.confetti}
          />
          <a href={certificateShareLink}>
            <img src={imgSrc} alt="" />
          </a>
        </div>
        <div className={`${certificateStyle} ${style.inputContainer}`}>
          {tutorial && !personalized && (
            <div>
              <Heading3>{i18n.congratsCertificatePersonalize()}</Heading3>
              <BodyThreeText className={style.enterName}>
                {i18n.enterYourName()}
              </BodyThreeText>
              <div className={style.inputButtonContainer}>
                <input
                  id="name"
                  type="text"
                  className={style.nameInput}
                  placeholder={i18n.yourName()}
                  ref={nameInputRef}
                />
                <button
                  type="button"
                  className={style.submit}
                  onClick={personalizeCertificate.bind(this, certificateId)}
                >
                  {i18n.submit()}
                </button>
              </div>
            </div>
          )}
          {tutorial && personalized && (
            <div>
              <Heading2>
                <div id="uitest-thanks">{i18n.congratsCertificateThanks()}</div>
              </Heading2>
              <BodyTwoText>{i18n.congratsCertificateContinue()}</BodyTwoText>
            </div>
          )}
          <hr />
          <Heading3>{i18n.congratsCertificateShare()}</Heading3>
          <BodyThreeText>
            {i18n.congratsCertificateShareMessage()}
          </BodyThreeText>
          <SocialShare
            facebook={facebook}
            twitter={twitter}
            print={print}
            under13={under13}
          />
        </div>
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
  initialCertificateImageUrl: PropTypes.string.isRequired,
  isHocTutorial: PropTypes.bool,
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(Certificate);
