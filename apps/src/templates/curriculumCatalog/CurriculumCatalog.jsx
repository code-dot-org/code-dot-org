import React from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

const CurriculumCatalog = ({curriculaData, isEnglish}) => (
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
            }) => (
              <CurriculumCatalogCard
                key={key}
                courseDisplayName={display_name}
                imageSrc={image || undefined}
                duration={'school_year'} // TODO [MEG] actually pass in this data
                gradesArray={grade_levels.split(',')}
                subjects={school_subject?.split(',')}
                topics={cs_topic?.split(',')}
                isTranslated={false} // TODO [MEG]: actually pass in this data
                isEnglish={isEnglish}
              />
            )
          )}
        ;
      </div>
    </div>
  </>
);

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape),
  isEnglish: PropTypes.bool.isRequired
};

export default CurriculumCatalog;
