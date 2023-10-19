import React, {useState} from 'react';
import PropTypes from 'prop-types';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';
import style from './certificate_batch.module.scss';
import {Heading3} from '@cdo/apps/componentLibrary/typography';

const curriculaData = [
  {
    grade: i18n.gradeRange({
      numGrades: ['3', '8'].length,
      youngestGrade: '3',
      oldestGrade: '8',
    }),
    title: i18n.marketingInitiativeCSC(),
    image:
      'https://images.code.org/06319e2e67e4cb08b20ae238dfe47ee3-20hour.png',
    description:
      'Make connections between computer science (CS) and other subjects like math, language arts, science, and social studies.',
    link: 'https://studio.code.org/s/coursea-2023?viewAs=Instructor',
  },
  {
    grade: i18n.gradeRange({
      numGrades: ['K', '5'].length,
      youngestGrade: 'K',
      oldestGrade: '5',
    }),
    title: i18n.marketingInitiativeCSF(),
    image:
      'https://images.code.org/06319e2e67e4cb08b20ae238dfe47ee3-20hour.png',
    description:
      'Free set of elementary curricula that introduces students to the foundational concepts of computer science and challenges them to explore how computing and technology can impact the world.',
    link: 'https://studio.code.org/s/coursea-2023?viewAs=Instructor',
  },
  {
    grade: i18n.gradeRange({
      numGrades: ['6', '12'].length,
      youngestGrade: '6',
      oldestGrade: '12',
    }),
    title: i18n.marketingInitiativeCSC(),
    image:
      'https://images.code.org/06319e2e67e4cb08b20ae238dfe47ee3-20hour.png',
    description:
      'These lessons supplement the video series. Each lesson is paired with a single video from the series, diving-deeper into the concepts introduced in the videos.',
    link: 'https://studio.code.org/s/coursea-2023?viewAs=Instructor',
  },
];

const curriculumCatalogImages = [
  'https://images.code.org/354488da87cbb925dcf2a2a40c29b598-AIML.png',
  'https://images.code.org/11d83ab1d397cafda327782812e8988c-Book%20Covers.png',
  'https://images.code.org/4d8ce599ad686237c78ef95f573f0685-Course%20D.png',
  'https://images.code.org/b99996c584ab797bb9508a2c9987ea70-Microbit.png',
  'https://images.code.org/8e4cdad41052c2cc5e7b11d6d79aa9aa-Intro%20to%20App%20Lab.png',
];

const professionalLearning = [
  {
    title: 'Teach with Code.org',
    description: 'Description',
    buttonText: 'Teach with Code.org',
    image:
      'https://images.code.org/8e4cdad41052c2cc5e7b11d6d79aa9aa-Intro%20to%20App%20Lab.png',
    link: '/professional-learning',
  },
  {
    title: 'Professional Learning',
    description: 'Description',
    buttonText: 'Explore professional learning',
    image:
      'https://images.code.org/8e4cdad41052c2cc5e7b11d6d79aa9aa-Intro%20to%20App%20Lab.png',
    link: '/professional-learning',
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
        <h1 className={style.header}>{i18n.printBatchCertificates()}</h1>
      </div>
      <div className={style.certificateContainer}>
        <div className={style.imageWrapper}>
          <img src={imageUrl} width={'100%'} />
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
        <h3 style={{textAlign: 'center'}}>{i18n.continueBeyondHourOfCode()}</h3>
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
                <h3>{item.title}</h3>
                <img src={item.image} alt="" />
                <p>{item.description}</p>
              </div>
              <div className={style.contentFooter}>
                <a className={style.linkButton} href={item.link} aria-label="">
                  Explore {item.title}
                </a>
              </div>
            </div>
          ))}
        </div>
        <hr />

        <div style={{textAlign: 'center'}}>
          <h4>{i18n.discoverMore()}</h4>
          <p>{i18n.discoverMoreCatalogText()}</p>
          <div className={style.imageContainer}>
            {curriculumCatalogImages.map((item, index) => (
              <img key={index} src={item} alt={`Image ${index}`} />
            ))}
          </div>
          <a
            style={{marginTop: '20px', marginBottom: '40px'}}
            className={style.linkButton}
            href={'/catalog'}
            aria-label=""
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
                <img src={item.image} alt="" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className={style.contentFooter}>
                <a className={style.linkButton} href={item.link} aria-label="">
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
