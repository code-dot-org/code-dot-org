import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {
  Heading1,
  Heading3,
  Heading4,
} from '@cdo/apps/componentLibrary/typography';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import RailsAuthenticityToken from '@cdo/apps/util/RailsAuthenticityToken';
import i18n from '@cdo/locale';

import style from './certificate_batch.module.scss';

const curriculaData = [
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

export default function CertificateBatch({
  courseName,
  courseTitle,
  initialStudentNames,
  imageUrl,
}) {
  const [studentNames, setStudentNames] = useState(
    initialStudentNames?.join('\n') || ''
  );

  const onChange = e => {
    setStudentNames(e.target.value);
  };

  return (
    <div className={style.wrapper}>
      <div className={style.headerContainer}>
        <Heading1 className={style.header}>
          {i18n.printBatchCertificates()}
        </Heading1>
      </div>
      <div className={style.certificateContainer}>
        <div className={style.imageWrapper}>
          <img src={imageUrl} width={'100%'} alt="" />
          <SafeMarkdown markdown={i18n.landscapeRecommendedCertificates()} />
        </div>
        <div className={style.entryContainer}>
          <span className={style.instructions}>
            <Heading3>{i18n.createYourCertificate()}</Heading3>
            <SafeMarkdown
              markdown={i18n.enterCertificateNames({courseTitle})}
            />
          </span>

          <br />
          <form
            action="/print_certificates/batch"
            method="post"
            className={'batch-certificate-form'}
          >
            <RailsAuthenticityToken />
            <input name="courseName" value={courseName} type="hidden" />
            <textarea
              cols="40"
              name="studentNames"
              rows="8"
              placeholder="John Smith"
              className={style.textarea}
              value={studentNames}
              onChange={onChange}
              aria-label={i18n.studentNames()}
            />
            <br />
            <button type="submit" className={style.submit} id="submit-button">
              {i18n.generateCertificates()}
            </button>
            <br />
            <hr />
            {i18n.wantBlankCertificateTemplate()}{' '}
            <a href={imageUrl}>{i18n.printOneCertificateHere()}</a>
          </form>
        </div>
      </div>

      <div className={style.continueBeyond}>
        <Heading3 className={style.textCenter}>
          {i18n.continueBeyondHourOfCode()}
        </Heading3>
        <div
          className={`${style.actionBlockWrapper} ${style.actionBlockWrapperThreeCol}`}
        >
          {curriculaData.map((item, index) => (
            <div
              className={`${style.actionBlock} ${style.actionBlockOneCol} ${style.flexSpaceBetween}`}
              key={index}
            >
              <div className={style.contentWrapper}>
                <p className={style.overline}>{item.grade}</p>
                <Heading3>{item.title}</Heading3>
                <img src={item.image} alt="" />
                <p>{item.description}</p>
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
          <p>{i18n.discoverMoreCatalogText()}</p>
          <div className={style.imageContainer}>
            {curriculumCatalogImages.map((item, index) => (
              <img key={index} src={item} alt="" />
            ))}
          </div>
          <a
            className={`${style.linkButton} ${style.catalogButton}`}
            href={'/catalog'}
          >
            {i18n.viewCurriculumCatalog()}
          </a>
        </div>
      </div>

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
                <p>{item.description}</p>
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
    </div>
  );
}

CertificateBatch.propTypes = {
  courseName: PropTypes.string,
  courseTitle: PropTypes.string,
  initialStudentNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  imageUrl: PropTypes.string.isRequired,
};
