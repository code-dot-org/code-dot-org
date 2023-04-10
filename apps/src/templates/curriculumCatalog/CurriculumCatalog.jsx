import React from 'react';
import PropTypes from 'prop-types';
import {curriculaDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

const CurriculumCatalog = ({curriculaData}) => {
  return (
    <>
      <div className={style.catalogHeader}>
        <HeaderBanner
          headingText={i18n.curriculumCatalogHeaderTitle()}
          subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
          short={false}
          imageUrl={CourseCatalogIllustration01}
        />
      </div>
      <div className={style.catalogContentContainer}>
        <div className={style.catalogContent}>
          {/*TODO [MEG]: calculate and pass in duration from backend, use image in imageSrc, add validations on backend for presence of grades, subjects, topics */}
          {curriculaData.map(
            ({key, display_name, grade_levels, school_subject, cs_topic}) => {
              const grade_level_array = grade_levels?.split(',');

              return (
                <CurriculumCatalogCard
                  key={key}
                  courseDisplayName={display_name}
                  duration={'quarter'}
                  youngestGrade={
                    grade_level_array ? grade_level_array[0] : 'none'
                  }
                  oldestGrade={
                    grade_level_array
                      ? grade_level_array[grade_level_array.length - 1]
                      : 'none'
                  }
                  subjects={school_subject?.split(',')}
                  topics={cs_topic?.split(',')}
                />
              );
            }
          )}
        </div>
      </div>
    </>
  );
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculaDataShape)
};

export default CurriculumCatalog;
