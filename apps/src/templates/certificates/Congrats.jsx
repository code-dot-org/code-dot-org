import PropTypes from 'prop-types';
import React from 'react';
import Certificate from './Certificate';
import style from './certificate_batch.module.scss';
import i18n from '@cdo/locale';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';
import {
  BodyTwoText,
  Heading3,
  Heading4,
} from '@cdo/apps/componentLibrary/typography';

export default function Congrats(props) {
  /**
   * @param tutorial The specific tutorial the student completed i.e. 'dance', 'dance-2019', etc
   * @returns {string} The category type the specific tutorial belongs to i.e. 'dance', 'applab', etc
   */

  /**
   * Renders links to certificate alternatives when there is a special event going on.
   * @param {string} language The language code related to the special event i.e. 'en', 'es', 'ko', etc
   * @param {string} tutorial The type of tutorial the student finished i.e. 'dance', 'oceans', etc
   * @returns {HTMLElement} HTML for rendering the extra certificate links.
   */
  const renderExtraCertificateLinks = (language, tutorial) => {
    let extraLinkUrl, extraLinkText;
    // If Adding extra links see this PR: https://github.com/code-dot-org/code-dot-org/pull/48515
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

  const {
    tutorial,
    certificateId,
    userType,
    under13,
    language,
    randomDonorTwitter,
    randomDonorName,
    initialCertificateImageUrl,
    isHocTutorial,
    nextCourseScriptName,
    nextCourseTitle,
    nextCourseDesc,
  } = props;

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

  return (
    <div className={style.wrapper}>
      <div className={style.certificateContainer}>
        <Certificate
          tutorial={tutorial}
          certificateId={certificateId}
          randomDonorTwitter={randomDonorTwitter}
          randomDonorName={randomDonorName}
          under13={under13}
          initialCertificateImageUrl={initialCertificateImageUrl}
          isHocTutorial={isHocTutorial}
        >
          {renderExtraCertificateLinks(language, tutorial)}
        </Certificate>
      </div>

      {isHocTutorial ? (
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
      ) : (
        <div>
          <GraduateToNextLevel
            scriptName={nextCourseScriptName}
            courseTitle={nextCourseTitle}
            courseDesc={nextCourseDesc}
          />
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
  initialCertificateImageUrl: PropTypes.string.isRequired,
  isHocTutorial: PropTypes.bool,
  nextCourseScriptName: PropTypes.string,
  nextCourseTitle: PropTypes.string,
  nextCourseDesc: PropTypes.string,
};
