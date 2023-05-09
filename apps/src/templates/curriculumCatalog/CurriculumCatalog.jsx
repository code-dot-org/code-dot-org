import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogBannerBackground from '../../../static/curriculum_catalog/course-catalog-banner-illustration-01.png';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import CheckboxDropdown from '../CheckboxDropdown';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  translatedCourseOfferingCsTopics,
  translatedInterdisciplinary,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDurations,
  translatedGradeLevels,
} from '../teacherDashboard/CourseOfferingHelpers';

const filterTypes = {
  grade: {
    name: 'grade',
    label: i18n.grade(),
    options: translatedGradeLevels,
  },
  duration: {
    name: 'duration',
    label: i18n.duration(),
    options: translatedCourseOfferingDurations,
  },
  name: {
    name: 'topic',
    label: i18n.topic(),
    options: {
      ...translatedInterdisciplinary,
      ...translatedCourseOfferingCsTopics,
    },
  },
  device: {
    name: 'device',
    label: i18n.device(),
    options: translatedCourseOfferingDeviceTypes,
  },
};

const getEmptyFilters = () => {
  let filters = {};
  Object.keys(filterTypes).forEach(filterKey => {
    filters[filterKey] = [];
  });
  return filters;
};

const CurriculumCatalog = ({curriculaData, isEnglish}) => {
  const [appliedFilters, setAppliedFilters] = useState(getEmptyFilters());

  // Selects the given value in the given filter.
  const handleSelect = (event, filterKey) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    let newFilters = {...appliedFilters};
    if (isChecked) {
      //Add checked item into applied filters
      newFilters[filterKey] = [...appliedFilters[filterKey], value];
      setAppliedFilters(newFilters);
    } else {
      //Remove unchecked item from applied filters
      newFilters[filterKey] = appliedFilters[filterKey].filter(
        item => item !== value
      );
      setAppliedFilters(newFilters);
    }
  };

  // Selects all options within the given filter.
  const handleSelectAllOfFilter = filterKey => {
    let newFilters = {...appliedFilters};
    newFilters[filterKey] = Object.keys(filterTypes[filterKey].options);
    setAppliedFilters(newFilters);
  };

  // Clears all filter selections.
  const handleClear = () => {
    setAppliedFilters(getEmptyFilters());
  };

  // Clears selections within the given filter.
  const handleClearAllOfFilter = filterKey => {
    let newFilters = {...appliedFilters};
    newFilters[filterKey] = [];
    setAppliedFilters(newFilters);
  };

  return (
    <>
      <HeaderBanner
        headingText={i18n.curriculumCatalogHeaderTitle()}
        subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
        short={false}
        backgroundUrl={CourseCatalogBannerBackground}
        imageUrl={CourseCatalogIllustration01}
      />
      <div className={style.catalogFiltersContainer}>
        <Heading6 className={style.catalogFiltersRowLabel}>
          {i18n.filterBy()}
        </Heading6>
        {Object.keys(filterTypes).map(filterKey => (
          <CheckboxDropdown
            key={filterKey}
            name={filterKey}
            label={filterTypes[filterKey].label}
            allOptions={filterTypes[filterKey].options}
            checkedOptions={appliedFilters[filterKey]}
            onChange={e => handleSelect(e, filterKey)}
            handleSelectAll={() => handleSelectAllOfFilter(filterKey)}
            handleClearAll={() => handleClearAllOfFilter(filterKey)}
          />
        ))}
        <button
          id="clear-filters"
          type="button"
          className={style.catalogClearFiltersButton}
          onClick={handleClear}
        >
          {i18n.clearFilters()}
        </button>
      </div>
      <div className={style.catalogContentContainer}>
        <div className={style.catalogContent}>
          {/*TODO [MEG]: calculate and pass in duration and translated from backend */}
          {curriculaData
            .filter(
              curriculum =>
                !!curriculum.grade_levels && !!curriculum.course_version_path
            )
            .map(
              ({
                key,
                image,
                display_name,
                grade_levels,
                school_subject,
                cs_topic,
                course_version_path,
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
                  pathToCourse={course_version_path}
                />
              )
            )}
          }
        </div>
      </div>
    </>
  );
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape),
  isEnglish: PropTypes.bool.isRequired,
};

export default CurriculumCatalog;
