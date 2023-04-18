import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

const CurriculumCatalog = ({curriculaData, isEnglish}) => {
  // Move to separate component? (CheckboxDropdown)
  // Add test file for separate component
  // Connect to real information
  // Start styling

  const filterTypes = [
    {name: 'course', label: 'Course', options: ['CSA', 'CSD', 'CSP', 'CSF']},
    {name: 'color', label: 'Color', options: ['Red', 'Blue', 'Green']}
  ];

  const getClearedFilters = () => {
    let filters = {};
    filterTypes.forEach(filter => {
      filters[filter.name] = [];
    });
    return filters;
  };

  const [appliedFilters, setAppliedFilters] = useState(getClearedFilters());

  const handleSelect = (event, filterName) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    let newFilters = appliedFilters;
    if (isChecked) {
      //Add checked item into applied filters
      newFilters[filterName] = [...appliedFilters[filterName], value];
      setAppliedFilters(newFilters);
    } else {
      //Remove unchecked item from applied filters
      newFilters[filterName] = appliedFilters[filterName].filter(
        item => item !== value
      );
      setAppliedFilters(newFilters);
    }
  };

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
      <div className={style.catalogFiltersContainer}>
        {filterTypes.map(filterType => {
          return (
            <div
              id={`${filterType.name}-dropdown`}
              key={`${filterType.name}-dropdown`}
              className="dropdown"
            >
              <button
                id={`${filterType.name}-dropdown-button`}
                type="button"
                className="selectbox"
                data-toggle="dropdown"
              >
                {filterType.label}
              </button>
              <ul className="dropdown-menu">
                <form>
                  {filterType.options.map(option => {
                    return (
                      <li
                        key={`${filterType.name}-${option}`}
                        className="checkbox form-group"
                      >
                        <input
                          type="checkbox"
                          id={`${filterType.name}-${option}-check`}
                          name={option}
                          value={option}
                          onChange={e => handleSelect(e, filterType.name)}
                        />
                        <label htmlFor={`${filterType.name}-${option}-check`}>
                          {option}
                        </label>
                      </li>
                    );
                  })}
                </form>
              </ul>
            </div>
          );
        })}
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
        </div>
      </div>
    </>
  );
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape),
  isEnglish: PropTypes.bool.isRequired
};

export default CurriculumCatalog;
