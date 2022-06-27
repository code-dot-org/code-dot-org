import PropTypes from 'prop-types';
import React from 'react';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import PetitionCallToAction from '@cdo/apps/templates/certificates/petition/PetitionCallToAction';
import styleConstants from '../../styleConstants';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '../../util/color';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';

export default function Congrats(props) {
  /**
   * @param tutorial The specific tutorial the student completed i.e. 'dance', 'dance-2019', etc
   * @returns {string} The category type the specific tutorial belongs to i.e. 'dance', 'applab', etc
   */
  const getTutorialType = tutorial =>
    ({
      dance: 'dance',
      'dance-2019': 'dance',
      'applab-intro': 'applab',
      aquatic: '2018Minecraft',
      hero: '2017Minecraft',
      minecraft: 'pre2017Minecraft',
      mc: 'pre2017Minecraft',
      oceans: 'oceans'
    }[tutorial] || 'other');
  /**
   * Renders links to certificate alternatives when there is a special event going on.
   * @param {string} language The language code related to the special event i.e. 'en', 'es', 'ko', etc
   * @param {string} tutorial The type of tutorial the student finished i.e. 'dance', 'oceans', etc
   * @returns {HTMLElement} HTML for rendering the extra certificate links.
   */
  const renderExtraCertificateLinks = (language, tutorial) => {
    let extraLinkUrl, extraLinkText;
    // https://codedotorg.atlassian.net/browse/FND-2048
    // In order to remove the certificate links remove or comment the following section -------------------------------
    if (language === 'ko') {
      if (/oceans/.test(tutorial)) {
        extraLinkUrl = pegasus('/files/online-coding-party-2021-oceans.pdf');
        extraLinkText =
          '온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)';
      } else if (/dance/.test(tutorial)) {
        extraLinkUrl = pegasus('/files/online-coding-party-2021-dance.pdf');
        extraLinkText =
          '온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)';
      }
    }
    // End of section to be removed or commented ----------------------------------------------------------------------
    if (!extraLinkUrl || !extraLinkText) {
      // There are no extra links to render.
      return;
    }
    return (
      <div style={styles.extraLinkContainer}>
        <a href={extraLinkUrl} target={'_blank'} style={styles.extraLink}>
          {extraLinkText}
        </a>
      </div>
    );
  };

  const {
    tutorial,
    certificateId,
    MCShareLink,
    userType,
    under13,
    language,
    randomDonorTwitter,
    randomDonorName,
    hideDancePartyFollowUp,
    showStudioCertificate,
    initialCertificateImageUrl,
    isHocTutorial,
    nextCourseScriptName,
    nextCourseTitle,
    nextCourseDesc
  } = props;

  const isEnglish = language === 'en';
  const tutorialType = getTutorialType(tutorial);

  return (
    <div style={styles.container}>
      <Certificate
        tutorial={tutorial}
        certificateId={certificateId}
        randomDonorTwitter={randomDonorTwitter}
        randomDonorName={randomDonorName}
        under13={under13}
        showStudioCertificate={showStudioCertificate}
        initialCertificateImageUrl={initialCertificateImageUrl}
        isHocTutorial={isHocTutorial}
      >
        {renderExtraCertificateLinks(language, tutorial)}
      </Certificate>
      {userType === 'teacher' && isEnglish && <TeachersBeyondHoc />}
      {isHocTutorial && (
        <StudentsBeyondHoc
          completedTutorialType={tutorialType}
          MCShareLink={MCShareLink}
          userType={userType}
          under13={under13}
          isEnglish={isEnglish}
          hideDancePartyFollowUp={hideDancePartyFollowUp}
        />
      )}
      {!isHocTutorial && (
        <GraduateToNextLevel
          scriptName={nextCourseScriptName}
          courseTitle={nextCourseTitle}
          courseDesc={nextCourseDesc}
        />
      )}
      {userType === 'signedOut' && isEnglish && <TeachersBeyondHoc />}
      <hr style={styles.divider} />
      <PetitionCallToAction tutorial={tutorial} />
    </div>
  );
}

Congrats.propTypes = {
  certificateId: PropTypes.string,
  tutorial: PropTypes.string,
  MCShareLink: PropTypes.string,
  userType: PropTypes.oneOf(['signedOut', 'teacher', 'student']).isRequired,
  under13: PropTypes.bool,
  language: PropTypes.string.isRequired,
  randomDonorTwitter: PropTypes.string,
  randomDonorName: PropTypes.string,
  hideDancePartyFollowUp: PropTypes.bool,
  showStudioCertificate: PropTypes.bool,
  initialCertificateImageUrl: PropTypes.string.isRequired,
  isHocTutorial: PropTypes.bool,
  nextCourseScriptName: PropTypes.string,
  nextCourseTitle: PropTypes.string,
  nextCourseDesc: PropTypes.string
};

const styles = {
  container: {
    width: '100%',
    maxWidth: styleConstants['content-width'],
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  divider: {
    borderColor: color.lightest_gray,
    borderWidth: '1px 0 0 0',
    borderStyle: 'solid',
    margin: '20px 0px 20px 0px'
  },
  extraLinkContainer: {
    clear: 'both',
    paddingTop: 20
  },
  extraLink: {
    color: color.teal,
    fontSize: 14
  }
};
