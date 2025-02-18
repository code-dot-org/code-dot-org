import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import {register} from 'swiper/element/bundle';

import {ResponsiveSize} from '@cdo/apps/code-studio/responsiveRedux';
import {
  BodyTwoText,
  BodyThreeText,
  Heading1,
  Heading2,
  Heading3,
} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import BackToFrontConfetti from '../BackToFrontConfetti';

import LargeChevronLink from './LargeChevronLink';
import SocialShare from './SocialShare';

import style from './congrats.module.scss';

register();

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

  const getEncodedParams = courseName => {
    const donor = studentName ? props.randomDonorName : null;
    const data = {
      name: studentName,
      course: courseName,
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

  const getCertificateImagePath = courseName => {
    const filename = getEncodedParams(courseName);
    return `/certificate_images/${filename}.jpg`;
  };

  const getPrintPath = courseName => {
    const encoded = getEncodedParams(courseName);
    return `/print_certificates/${encoded}`;
  };

  const getCertificateSharePath = courseName => {
    const encoded = getEncodedParams(courseName);
    return `/certificates/${encoded}`;
  };

  const getExternalCertificateSharePath = courseName => {
    return `${window.location.origin}${getCertificateSharePath(courseName)}`;
  };

  const {
    responsiveSize,
    certificateId,
    randomDonorTwitter,
    under13,
    children,
    certificateData,
    isHocTutorial,
    isPlCourse,
    userType,
  } = props;

  const swiperRef = useRef(null);

  const [currentCertificateIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    if (swiperRef.current) {
      const swiperParams = {
        autoHeight: true,
        pagination: {
          clickable: true,
        },
        spaceBetween: 24,
        slidesPerView: 1,
        slidesPerGroup: 1,
        breakpoints: {
          640: {
            autoHeight: false,
          },
        },
        injectStyles: [
          `
            :host .swiper-pagination {
              position: relative;
              margin-top: -1rem;
              .swiper-pagination-bullet {
                margin-block: 0.5rem;
              }
            }
            `,
        ],
      };
      Object.assign(swiperRef.current, swiperParams);
      swiperRef.current.initialize();

      swiperRef.current.addEventListener('swiperslidechange', e => {
        const [swiper] = e.detail;
        setCurrentImageIndex(swiper.activeIndex);
      });
    }
  }, []);

  const courseName = certificateData[currentCertificateIndex]?.courseName;
  const coursePath =
    certificateData[currentCertificateIndex]?.coursePath || `s/${courseName}`;

  const externalCertificateShareLink =
    getExternalCertificateSharePath(courseName);
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

  const linkedin = queryString.stringify({
    url: externalCertificateShareLink,
  });

  const print = getPrintPath(courseName);

  const renderCertificateImage = certificateObj => {
    return (
      <>
        <a href={getCertificateSharePath(certificateObj.courseName)}>
          <img
            src={getCertificateImagePath(certificateObj.courseName)}
            alt={
              studentName
                ? i18n.certificateAltTextWithName({
                    studentName,
                    courseTitle: certificateObj.courseTitle,
                  })
                : i18n.certificateAltTextNoName({
                    courseTitle: certificateObj.courseTitle,
                  })
            }
            className={style.certificateImage}
          />
        </a>
      </>
    );
  };

  return (
    <div className={style.container}>
      <div className={style.headerContainer}>
        <Heading1 className={`${headingStyle} ${style.header}`}>
          {i18n.congratsCertificateHeading()}
        </Heading1>
      </div>
      {courseName && (
        <LargeChevronLink link={coursePath} linkText={i18n.backToActivity()} />
      )}
      <div className={style.certificateContainer}>
        <div
          id="uitest-certificate"
          className={style.certificateImageContainer}
        >
          {
            <BackToFrontConfetti
              active={personalized}
              className={style.confetti}
            />
          }
          {certificateData.length > 1 && (
            <>
              <swiper-container
                init="false"
                ref={swiperRef}
                class={style.swiperContainer}
                navigation-next-el="#certificate-swiper-next-el"
                navigation-prev-el="#certificate-swiper-prev-el"
              >
                {certificateData.map(image => (
                  <swiper-slide key={image.courseName}>
                    {renderCertificateImage(image)}
                  </swiper-slide>
                ))}
              </swiper-container>
              <button
                id="certificate-swiper-prev-el"
                className={classNames(style.navButton, style.prevElNav)}
                type="button"
              />
              <button
                id="certificate-swiper-next-el"
                className={classNames(style.navButton, style.nextElNav)}
                type="button"
              />
            </>
          )}
          {certificateData.length === 1 &&
            renderCertificateImage(certificateData[0])}
        </div>
        <div className={`${certificateStyle} ${style.inputContainer}`}>
          {courseName && !personalized && (
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
          {courseName && personalized && (
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
            linkedin={linkedin}
            print={print}
            under13={under13}
            isPlCourse={isPlCourse}
            userType={userType}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

Certificate.propTypes = {
  certificateId: PropTypes.string,
  randomDonorTwitter: PropTypes.string,
  randomDonorName: PropTypes.string,
  responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
  under13: PropTypes.bool,
  children: PropTypes.node,
  certificateData: PropTypes.arrayOf(PropTypes.object).isRequired,
  isHocTutorial: PropTypes.bool,
  isPlCourse: PropTypes.bool,
  userType: PropTypes.string,
};

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(Certificate);
