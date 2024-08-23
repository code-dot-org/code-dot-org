import PropTypes from 'prop-types';
import React from 'react';

import {hasQueryParam, queryParams} from '@cdo/apps/code-studio/utils';
import {
  BodyTwoText,
  Heading3,
  Heading4,
} from '@cdo/apps/componentLibrary/typography';
import {marketing} from '@cdo/apps/lib/util/urlHelpers';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import i18n from '@cdo/locale';
import facilitatorLedPlBanner from '@cdo/static/facilitatorLedPlBanner.png';
import selfPacedPlBanner from '@cdo/static/selfPacedPlBanner.png';

import Certificate from './Certificate';

import style from './certificate_batch.module.scss';

export default function Congrats(props) {
  /**
   * @param tutorial The specific tutorial the student completed i.e. 'dance', 'dance-2019', etc
   * @returns {string} The category type the specific tutorial belongs to i.e. 'dance', 'applab', etc
   */

  /**
   * Renders links to certificate alternatives when there is a special event going on.
   * @param {string} language The language code related to the special event i.e. 'en', 'es', 'ko', etc
   * @param {string} tutorial The type of tutorial the student finished i.e. 'dance', 'oceans', etc
   * @param {Date} currentDate The Date to use when rendering the links.
   * @returns {HTMLElement} HTML for rendering the extra certificate links.
   */
  const renderExtraCertificateLinks = (language, tutorial, currentDate) => {
    const {extraLinkUrl, extraLinkText} = getExtraLinkData(
      language,
      tutorial,
      currentDate
    );
    if (!extraLinkUrl || !extraLinkText) {
      // There are no extra links to render.
      return;
    }
    return (
      <div className={style.extraLinkContainer}>
        <a
          href={extraLinkUrl}
          target={'_blank'}
          className={style.extraLink}
          rel="noreferrer"
        >
          {extraLinkText}
        </a>
      </div>
    );
  };

  /**
   * Uses the given parameters to select the extra link campaign to display
   * to the user.
   * @param {string} language The language code related to the special event i.e. 'en', 'es', 'ko', etc
   * @param {string} tutorial The type of tutorial the student finished i.e. 'dance', 'oceans', etc
   * @param {Date} currentDate The Date to use when rending the links. You can
   * use the queryString param currentDate= to manually test these campaigns.
   * @returns {Object} extraLinkUrl, extraLinkText
   */
  const getExtraLinkData = (language, tutorial, currentDate) => {
    // https://codedotorg.atlassian.net/browse/P20-948
    const codingPartyStart = new Date('2024-06-17T00:00:00+09:00');
    const codingPartyEnd = new Date('2024-07-28T00:00:00+09:00');
    const codingPartyActive =
      codingPartyStart <= currentDate && currentDate < codingPartyEnd;
    if (language === 'ko' && codingPartyActive) {
      const extraLinkText =
        '온라인 코딩 파티 인증서 받으러 가기! (과학기술정보통신부 인증)';
      if (/oceans/.test(tutorial)) {
        return {
          extraLinkUrl: marketing('/files/online-coding-party-2024-1-oceans.png'),
          extraLinkText: extraLinkText,
        };
      } else if (/hero/.test(tutorial)) {
        return {
          extraLinkUrl: marketing('/files/online-coding-party-2024-1-hero.png'),
          extraLinkText: extraLinkText,
        };
      }
    }
    // Mock extra link campaign used for testing
    const demoStart = new Date('2000-01-01T00:00:00+00:00');
    const demoEnd = new Date('2000-02-01T00:00:00+00:00');
    const demoActive = demoStart <= currentDate && currentDate < demoEnd;
    if (demoActive) {
      return {
        extraLinkUrl: marketing('/files/extra-link-demo.png'),
        extraLinkText: `This is the Demo extra link for ${tutorial}`,
      };
    }
    return {};
  };

  const {
    tutorial,
    certificateId,
    userType,
    under13,
    language,
    randomDonorTwitter,
    randomDonorName,
    certificateData,
    isHocTutorial,
    isPlCourse,
    isK5PlCourse,
    nextCourseScriptName,
    nextCourseTitle,
    nextCourseDesc,
    curriculumUrl,
  } = props;

  // Determine what time we should consider the current time to be when
  // rendering the page. This is useful for testing UI changes which happen
  // at particular times of the year.
  // the currentDate can be overridden using the query string param 'currentDate'
  const currentDateOverride =
    hasQueryParam('currentDate') && new Date(queryParams('currentDate'));
  // default to the real current time.
  const currentDate = currentDateOverride || props['currentDate'] || new Date();

  const teacherCourses = [
    {
      grade: i18n.gradeRange({
        numGrades: 6,
        youngestGrade: '3',
        oldestGrade: '8',
      }),
      title: i18n.marketingInitiativeCSC(),
      image: '/../../../../shared/images/courses/logo_connections.jpg',
      buttonText: i18n.exploreCsConnections(),
      description: i18n.cscDescription(),
      link: 'http://code.org/csc',
    },

    {
      grade: i18n.gradeRange({
        numGrades: 6,
        youngestGrade: 'K',
        oldestGrade: '5',
      }),
      title: i18n.marketingInitiativeCSF(),
      image: '/../../../../shared/images/courses/logo_csf.jpg',
      buttonText: i18n.exploreCsFundamentals(),
      description: i18n.csfDescriptionTeacher(),
      link: 'http://code.org/csf',
    },
    {
      grade: i18n.gradeRange({
        numGrades: 7,
        youngestGrade: '6',
        oldestGrade: '12',
      }),
      title: i18n.howAiWorks(),
      image: 'https://code.org/images/ai/ai-curriculum-how-ai-works.png',
      buttonText: i18n.exploreLessons(),
      description: i18n.howAiWorksDescription(),
      link: 'http://code.org/ai/how-ai-works',
    },
  ];

  const studentCourses = [
    {
      grade: i18n.gradeRange({
        numGrades: 3,
        youngestGrade: '3',
        oldestGrade: '5',
      }),
      title: i18n.expressCourse(),
      image:
        'https://images.code.org/aaee14231592a91f7ca063867bc7454c-ExpressCourse.png',
      buttonText: i18n.startCourse(),
      description: i18n.expressCourseDescription(),
      link: '/s/express',
    },

    {
      grade: i18n.gradeRange({
        numGrades: 7,
        youngestGrade: '6',
        oldestGrade: '12',
      }),
      title: i18n.introductionToGameLab(),
      image: '/../../../../shared/images/courses/logo_intro_to_game_lab.jpg',
      buttonText: i18n.startCourse(),
      description: i18n.introductionToGameLabDescription(),
      link: '/s/csd3-virtual',
    },
    {
      grade: i18n.gradeRange({
        numGrades: 7,
        youngestGrade: '6',
        oldestGrade: '12',
      }),
      title: i18n.turtleProgrammingInAppLab(),
      image:
        'https://images.code.org/0773c123ffe9bda234589984c4eb3634-Turtle%20Programming.png',
      buttonText: i18n.startCourse(),
      description: i18n.turtleProgrammingInAppLabDescription(),
      link: '/s/csp3-virtual',
    },
  ];

  const curriculaData =
    userType === 'student' ? studentCourses : teacherCourses;

  const curriculumCatalogImages = [
    'https://code.org/images/ai/ai-curriclum-machine-learning.png',
    'https://images.code.org/11d83ab1d397cafda327782812e8988c-Book%20Covers.png',
    '/../../../../shared/images/courses/logo_csa.jpg',
    '/../../../../shared/images/courses/logo_mobile.jpg',
    '/../../../../shared/images/courses/logo_hardware.jpg',
  ];

  const professionalLearning = [
    {
      title: i18n.teachWithCodeOrg(),
      description: i18n.teachWithCodeOrgDescription(),
      buttonText: i18n.teachWithCodeOrg(),
      image: 'https://code.org/images/teach-page-top.png',
      link: 'https://code.org/teach',
    },
    {
      title: i18n.courseOfferingSelfPacedPl(),
      description: i18n.selfPacedPlDescription(),
      buttonText: i18n.exploreProfessionalLearning(),
      image: 'https://code.org/shared/images/banners/self-paced-pl-hero.png',
      link: 'https://code.org/educate/professional-development-online',
    },
  ];

  const selfPacedPlLink = {
    title: i18n.congratsSelfPacedPlTitle(),
    description: i18n.congratsSelfPacedPlDescription(),
    buttonText: i18n.exploreSelfPacedLearning(),
    image: selfPacedPlBanner,
    link: 'https://code.org/educate/professional-development-online',
  };

  const professionalLearningNextOptionsK5 = [
    {
      title: i18n.learnAboutFacilitatorLeadProfessionalWorkshops(),
      description:
        i18n.learnAboutFacilitatorLeadProfessionalWorkshopsDescription(),
      buttonText: i18n.discoverFacilitatorLedWorkshops(),
      image: facilitatorLedPlBanner,
      link: 'https://code.org/professional-development-workshops',
    },
    selfPacedPlLink,
  ];

  const professionalLearningNextOptions612 = [
    {
      title: i18n.learnAboutFacilitatorLeadProfessionalWorkshops(),
      description:
        i18n.learnAboutFacilitatorLeadProfessionalWorkshopsDescription(),
      buttonText: i18n.discoverFacilitatorLedWorkshops(),
      image: facilitatorLedPlBanner,
      link: 'https://code.org/apply',
    },
    selfPacedPlLink,
  ];

  const professionalLearningNextOptions = isK5PlCourse
    ? professionalLearningNextOptionsK5
    : professionalLearningNextOptions612;

  const renderRecommendedOptions = () => {
    if (isHocTutorial) {
      return (
        <div>
          <div className={style.continueBeyond}>
            <Heading3 className={style.textCenter}>
              {i18n.continueBeyondHourOfCode()}
            </Heading3>
            <div
              className={`${style.actionBlockWrapper} ${style.actionBlockWrapperThreeCol} ${style.courseContainer}`}
            >
              {curriculaData.map((item, index) => (
                <div
                  className={`${style.actionBlock} ${style.actionBlockOneCol} ${style.flexSpaceBetween}`}
                  key={index}
                >
                  <div className={style.contentWrapper}>
                    <BodyTwoText className={style.overline}>
                      {item.grade}
                    </BodyTwoText>
                    <Heading3>{item.title}</Heading3>
                    <img src={item.image} alt="" />
                    <BodyTwoText>{item.description}</BodyTwoText>
                  </div>
                  <div className={style.contentFooter}>
                    <a className={style.linkButton} href={item.link}>
                      {item.buttonText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <hr />

            <div className={style.textCenter}>
              <Heading4>{i18n.discoverMore()}</Heading4>
              <BodyTwoText>{i18n.discoverMoreCatalogText()}</BodyTwoText>
              <div className={style.imageContainer}>
                {curriculumCatalogImages.map((item, index) => (
                  <img key={index} src={item} alt="" />
                ))}
              </div>
              {userType === 'student' ? (
                <div className={style.studentButtonsContainer}>
                  <a
                    className={`${style.linkButton} ${style.catalogButton}`}
                    href={'https://code.org/student/elementary'}
                  >
                    {i18n.learningForAgesRange({
                      youngestAge: '5',
                      oldestAge: '11',
                    })}
                  </a>
                  <a
                    className={`${style.linkButton} ${style.catalogButton}`}
                    href={'https://code.org/student/middle-high'}
                  >
                    {i18n.learningForAgesPlus({age: '11'})}
                  </a>
                </div>
              ) : (
                <a
                  className={`${style.linkButton} ${style.catalogButton}`}
                  href={'/catalog'}
                >
                  {i18n.viewCurriculumCatalog()}
                </a>
              )}
            </div>
          </div>

          {userType !== 'student' && (
            <div className={style.professionalLearning}>
              <div
                className={`${style.actionBlockWrapper} ${style.actionBlockTwoCol}`}
              >
                {professionalLearning.map((item, index) => (
                  <div
                    className={`${style.actionBlock} ${style.actionBlockOneCol} ${style.flexSpaceBetween}`}
                    key={index}
                  >
                    <div className={style.contentWrapper}>
                      <img
                        src={item.image}
                        alt=""
                        className={style.professionalLearningImage}
                      />
                      <Heading3>{item.title}</Heading3>
                      <BodyTwoText>{item.description}</BodyTwoText>
                    </div>
                    <div className={style.contentFooter}>
                      <a className={style.linkButton} href={item.link}>
                        {item.buttonText}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } else if (isPlCourse) {
      return (
        <div className={style.professionalLearning}>
          <div
            className={`${style.actionBlockWrapper} ${style.actionBlockTwoCol}`}
          >
            {professionalLearningNextOptions.map((item, index) => (
              <div
                className={`${style.actionBlock} ${style.actionBlockOneCol} ${style.flexSpaceBetween}`}
                key={index}
              >
                <div className={style.contentWrapper}>
                  <img
                    src={item.image}
                    alt=""
                    className={style.professionalLearningNextStepsImage}
                  />
                  <Heading3>{item.title}</Heading3>
                  <BodyTwoText>{item.description}</BodyTwoText>
                </div>
                <div className={style.contentFooter}>
                  <a className={style.linkButton} href={item.link}>
                    {item.buttonText}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <GraduateToNextLevel
            scriptName={nextCourseScriptName}
            courseTitle={nextCourseTitle}
            courseDesc={nextCourseDesc}
          />
        </div>
      );
    }
  };

  return (
    <div className={style.wrapper}>
      {certificateData.length > 0 && (
        <>
          <div className={style.certificateContainer}>
            <Certificate
              tutorial={tutorial}
              certificateId={certificateId}
              randomDonorTwitter={randomDonorTwitter}
              randomDonorName={randomDonorName}
              under13={under13}
              certificateData={certificateData}
              isHocTutorial={isHocTutorial}
              isPlCourse={isPlCourse}
              userType={userType}
            >
              {renderExtraCertificateLinks(language, tutorial, currentDate)}
            </Certificate>
          </div>
          {renderRecommendedOptions()}
        </>
      )}
      {certificateData.length === 0 && (
        <div>
          <Heading3>
            <InlineMarkdown
              markdown={i18n.noCertificateReturnToCourse({curriculumUrl})}
            />
          </Heading3>
        </div>
      )}
    </div>
  );
}

Congrats.propTypes = {
  certificateId: PropTypes.string,
  tutorial: PropTypes.string,
  userType: PropTypes.oneOf(['signedOut', 'teacher', 'student']).isRequired,
  under13: PropTypes.bool,
  language: PropTypes.string.isRequired,
  randomDonorTwitter: PropTypes.string,
  randomDonorName: PropTypes.string,
  certificateData: PropTypes.arrayOf(PropTypes.object).isRequired,
  curriculumUrl: PropTypes.string,
  isHocTutorial: PropTypes.bool,
  isPlCourse: PropTypes.bool,
  isK5PlCourse: PropTypes.bool,
  nextCourseScriptName: PropTypes.string,
  nextCourseTitle: PropTypes.string,
  nextCourseDesc: PropTypes.string,
  currentDate: PropTypes.object,
};
