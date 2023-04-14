import React from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {translatedCourseOfferingDurations} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';

const CurriculumCatalog = ({curriculaData}) => (
  <>
    <div className={style.catalogHeader}>
      <div className={style.catalogHeaderContent}>
        <div className={style.headerTextWrapper}>
          <h1 className={style.headerText}>
            {i18n.curriculumCatalogHeaderTitle()}
          </h1>
          <p className={style.headerText}>
            {i18n.curriculumCatalogHeaderSubtitle()}
          </p>
        </div>
        <div className={style.headerImageContainer}>
          <img
            className={style.headerImage}
            src={CourseCatalogIllustration01}
          />
        </div>
      </div>
    </div>
    <div className={style.catalogContentContainer}>
      <div className={style.catalogContent}>
        {/*TODO [MEG]: calculate and pass in duration and translated from backend */}
        {curriculaData
          .filter(curriculum => !!curriculum.grade_levels)
          .map(
            ({
              key,
              image,
              display_name,
              grade_levels,
              school_subject,
              cs_topic
            }) => {
              // TODO [MEG]: We are currently assuming if there are grade levels, there are at least two
              // grades and the list is in ascending order.
              const gradeLevelArray = grade_levels.split(',');
              const durationPossibilities = Object.keys(
                translatedCourseOfferingDurations
              );

              return (
                <CurriculumCatalogCard
                  key={key}
                  imageSrc={image}
                  courseDisplayName={display_name}
                  duration={
                    durationPossibilities[
                      Math.floor(Math.random() * durationPossibilities.length)
                    ]
                  } // TODO [MEG] actually pass in this data
                  youngestGrade={gradeLevelArray[0]}
                  oldestGrade={gradeLevelArray[gradeLevelArray.length - 1]}
                  subjects={school_subject?.split(',')}
                  topics={cs_topic?.split(',')}
                  isTranslated={!!Math.round(Math.random())} // TODO [MEG]: actually pass in this data
                  isEnglish={true} // TODO [MEG]: use locale
                />
              );
            }
          )}
      </div>
    </div>
  </>
);

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape)
};

export default CurriculumCatalog;
