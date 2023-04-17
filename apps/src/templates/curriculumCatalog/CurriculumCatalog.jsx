import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {translatedCourseOfferingDurations} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';

const CurriculumCatalog = ({curriculaData}) => {
  const filterTypes = ['testFilter1', 'testFilter2'];

  // TODO: Make initialState more dynamically defined
  const initialState = {};
  initialState[filterTypes[0]] = [];
  initialState[filterTypes[1]] = [];

  const [appliedFilters, setAppliedFilters] = useState(initialState);
  const listData = [
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
      <div>
        <p>aaaa</p>
        {listData.map((item, index) => {
          return (
            <div key={item.id} className="checkbox-container">
              <input
                type="checkbox"
                name="testFilter1"
                value={item.value}
                onChange={e => handleSelect(e, 'testFilter1')}
              />
              <label>{item.value}</label>
            </div>
          );
        })}
        <div className="list-container">
          <label>You Selected:</label>
          {appliedFilters['testFilter1'].map((item, index) => {
            return (
              <div className="chip">
                <p className="chip-label">{item}</p>
              </div>
            );
          })}
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
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape)
};

export default CurriculumCatalog;
