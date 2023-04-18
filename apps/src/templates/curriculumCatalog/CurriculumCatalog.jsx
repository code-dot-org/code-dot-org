import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';

const CurriculumCatalog = ({curriculaData, isEnglish}) => {
  const filterTypes = ['testFilter1'];

  // TODO: Make initialState more dynamically defined
  const initialState = {};
  initialState[filterTypes[0]] = [];
  initialState[filterTypes[1]] = [];

  const [appliedFilters, setAppliedFilters] = useState(initialState);
  const filter1Data = [
    {id: '1', value: 'Javascript'},
    {id: '2', value: 'Python'},
    {id: '3', value: 'Java'},
    {id: '4', value: 'Kotlin'},
    {id: '5', value: 'Dart'},
    {id: '6', value: 'C#'}
  ];

  const handleSelect = (event, dropdown) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    let newFilters = appliedFilters;
    if (isChecked) {
      //Add checked item into applied filters
      newFilters[dropdown] = [...appliedFilters[dropdown], value];
      setAppliedFilters(newFilters);
    } else {
      //Remove unchecked item from applied filters
      newFilters[dropdown] = appliedFilters[dropdown].filter(
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
      <div className="dropdown" id="filter1dropdown">
        <button
          id="filter1DropdownButton"
          type="button"
          className="selectbox"
          data-toggle="dropdown"
        >
          FILTER 1
        </button>
        <ul className="dropdown-menu" aria-labelledby="dLabel">
          <form>
            {filter1Data.map(item => {
              return (
                <li
                  key={`filter1-${item.value}-item`}
                  className="checkbox form-group"
                >
                  <input
                    type="checkbox"
                    id={`filter1-${item.value}`}
                    name={item.value}
                    value={item.value}
                    onChange={e => handleSelect(e, 'testFilter1')}
                  />
                  <label htmlFor={`filter1-${item.value}`}>{item.value}</label>
                </li>
              );
            })}
          </form>
        </ul>
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
